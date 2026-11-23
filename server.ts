import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        apiVersion: 'v1beta',
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory + /tmp disk cache for WAV audio buffers (survives restarts & saves API quota)
const TTS_CACHE = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 300;
const DISK_CACHE_DIR = path.join(os.tmpdir(), 'ruba-tts-cache-v3');
try {
  fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
} catch {
  // Ignore if temp dir is read-only
}

function getDiskCachePath(cacheKey: string): string {
  const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  return path.join(DISK_CACHE_DIR, `${hash}.wav`);
}

const VOICE_NAME = 'Zephyr';
const BASE_VOICE_PERSONA =
  'Same consistent single speaker: a warm, friendly young Indonesian female kindergarten storyteller speaking natural, expressive Bahasa Indonesia to a 4-year-old child, with lifelike human breathing, warm melodic intonation, and zero robotic stiffness.';

const STYLE_BY_TONE: Record<string, string> = {
  cheerful: `${BASE_VOICE_PERSONA} Tone: bright, smiling, and cheerfully inviting.`,
  excited: `${BASE_VOICE_PERSONA} Tone: warmly celebratory and proudly praising, keeping the exact same voice and pitch register.`,
  gentle: `${BASE_VOICE_PERSONA} Tone: softly reassuring, patient, and kind, keeping the exact same voice and pitch register.`,
};

// Track per-model 429 cooldowns so we immediately route to a working neural audio model
const modelCooldownUntil = new Map<string, number>();
function isModelCoolingDown(model: string): boolean {
  const until = modelCooldownUntil.get(model);
  return typeof until === 'number' && Date.now() < until;
}
function markModelQuotaCooldown(model: string, ms = 10 * 60 * 1000) {
  modelCooldownUntil.set(model, Date.now() + ms);
}

function pcmToWav(pcm: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20); // AudioFormat = 1 (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function synthesizeWithTtsModel(
  ai: GoogleGenAI,
  model: 'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts',
  rawText: string,
  tone: string
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: rawText,
            speechMetadata: {
              style: STYLE_BY_TONE[tone],
            },
          },
        ],
      },
    ],
    config: {
      seed: 2026,
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE_NAME },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error(`No audio data returned by ${model}`);
  }
  return Buffer.from(base64Audio, 'base64');
}

async function synthesizeWithLiveAudio(
  ai: GoogleGenAI,
  rawText: string,
  tone: string
): Promise<Buffer> {
  const toneCue =
    tone === 'excited'
      ? 'gembira dan penuh pujian hangat'
      : tone === 'gentle'
        ? 'lembut, sabar, dan menyemangati'
        : 'ceria, ramah, dan antusias';

  return new Promise<Buffer>((resolve, reject) => {
    const pcmChunks: Buffer[] = [];
    let settled = false;
    let sessionRef: Awaited<ReturnType<typeof ai.live.connect>> | null = null;

    const cleanup = () => {
      try {
        sessionRef?.close();
      } catch {
        // Ignore close errors
      }
      sessionRef = null;
    };

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      if (pcmChunks.length > 0) {
        resolve(pcmToWav(Buffer.concat(pcmChunks), 24000, 1, 16));
      } else {
        reject(new Error('Live audio TTS timeout'));
      }
    }, 12000);

    ai.live
      .connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: VOICE_NAME },
            },
          },
          systemInstruction:
            `Kamu adalah narator ramah untuk game anak usia 3-6 tahun bernama RuBa (Bobi si Rubah). ` +
            `Tugasmu HANYA membacakan persis teks Bahasa Indonesia yang dikirim pengguna dengan nada ${toneCue}, intonasi alami seperti manusia asli (bukan robot), pelafalan Indonesia yang jelas dan hangat. ` +
            `JANGAN menambah komentar, JANGAN menjawab pertanyaan, dan JANGAN mengucapkan kata di luar teks yang diminta.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (settled) return;
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                pcmChunks.push(Buffer.from(part.inlineData.data, 'base64'));
              }
            }
            if (message.serverContent?.turnComplete) {
              settled = true;
              clearTimeout(timeout);
              cleanup();
              if (pcmChunks.length === 0) {
                reject(new Error('Live audio returned empty PCM'));
              } else {
                resolve(pcmToWav(Buffer.concat(pcmChunks), 24000, 1, 16));
              }
            }
          },
          onerror: (e: unknown) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            cleanup();
            reject(e instanceof Error ? e : new Error('Live audio error'));
          },
          onclose: () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            if (pcmChunks.length > 0) {
              resolve(pcmToWav(Buffer.concat(pcmChunks), 24000, 1, 16));
            } else {
              reject(new Error('Live audio closed before audio output'));
            }
          },
        },
      })
      .then((session) => {
        if (settled) {
          try {
            session.close();
          } catch {
            // Ignore
          }
          return;
        }
        sessionRef = session;
        session.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [
                {
                  text: `Bacakan teks Bahasa Indonesia berikut persis kata demi kata tanpa menambah, menjawab, atau mengubah kata apa pun: "${rawText}"`,
                },
              ],
            },
          ],
          turnComplete: true,
        });
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        cleanup();
        reject(err);
      });
  });
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.use('/api/tts', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.options('/api/tts', (_req, res) => {
    res.sendStatus(204);
  });

  app.post('/api/tts', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const tone =
      req.body?.tone === 'excited' || req.body?.tone === 'gentle'
        ? req.body.tone
        : 'cheerful';

    if (!rawText || rawText.length > 500) {
      res.status(400).json({ error: 'Text must be between 1 and 500 characters.' });
      return;
    }

    const cacheKey = `${VOICE_NAME}:${tone}:${rawText}`;
    const cached = TTS_CACHE.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(cached);
      return;
    }

    const diskPath = getDiskCachePath(cacheKey);
    try {
      if (fs.existsSync(diskPath)) {
        const diskBuf = fs.readFileSync(diskPath);
        if (diskBuf.length > 44) {
          TTS_CACHE.set(cacheKey, diskBuf);
          res.setHeader('Content-Type', 'audio/wav');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.send(diskBuf);
          return;
        }
      }
    } catch {
      // Ignore disk cache read errors
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    let lastError: unknown = null;
    let wavBuffer: Buffer | null = null;

    // 1. Try flagship expressive TTS model first, then lite TTS, then Live native audio
    const unaryModels: Array<'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts'> = [
      'gemini-3.8-flash-tts',
      'gemini-3.8-flash-lite-tts',
    ];

    for (const model of unaryModels) {
      if (isModelCoolingDown(model)) continue;
      try {
        wavBuffer = await synthesizeWithTtsModel(ai, model, rawText, tone);
        break;
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
          markModelQuotaCooldown(model);
        }
      }
    }

    if (!wavBuffer && !isModelCoolingDown('gemini-3.8-live')) {
      try {
        wavBuffer = await synthesizeWithLiveAudio(ai, rawText, tone);
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
          markModelQuotaCooldown('gemini-3.8-live');
        }
      }
    }

    if (!wavBuffer) {
      const message = lastError instanceof Error ? lastError.message : 'TTS generation failed';
      console.error('[RuBa TTS Error]', message);
      const isQuota = /429|RESOURCE_EXHAUSTED|quota/i.test(message);
      res.status(isQuota ? 429 : 500).json({
        error: message,
        quotaExhausted: isQuota,
      });
      return;
    }

    if (TTS_CACHE.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = TTS_CACHE.keys().next().value;
      if (oldestKey) TTS_CACHE.delete(oldestKey);
    }
    TTS_CACHE.set(cacheKey, wavBuffer);
    try {
      fs.writeFileSync(diskPath, wavBuffer);
    } catch {
      // Ignore disk cache write errors
    }

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(wavBuffer);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RuBa server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start RuBa server:', err);
  process.exit(1);
});
