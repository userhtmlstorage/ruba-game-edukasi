import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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

// In-memory LRU-like cache for WAV audio buffers (eliminates repeat latency)
const TTS_CACHE = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 160;

const STYLE_BY_TONE: Record<string, string> = {
  cheerful:
    'Warm, natural, expressive Indonesian kindergarten storyteller speaking enthusiastically and clearly to a 4-year-old child, with lively human rising-and-falling intonation and friendly warmth.',
  excited:
    'Joyful, bright, celebratory Indonesian teacher cheering warmly for a young child with natural human excitement, upbeat smiling tone, and expressive phrasing.',
  gentle:
    'Soft, warm, reassuring Indonesian storyteller gently encouraging a young child with a kind smile, calm supportive human intonation, and zero harshness.',
};

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

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

    const cacheKey = `${tone}:${rawText}`;
    const cached = TTS_CACHE.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(cached);
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
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
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              // Zephyr offers a bright, warm, expressive human voice ideal for kids storytelling
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({ error: 'No audio data returned by TTS model.' });
        return;
      }

      const wavBuffer = Buffer.from(base64Audio, 'base64');

      if (TTS_CACHE.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = TTS_CACHE.keys().next().value;
        if (oldestKey) TTS_CACHE.delete(oldestKey);
      }
      TTS_CACHE.set(cacheKey, wavBuffer);

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(wavBuffer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'TTS generation failed';
      console.error('[RuBa TTS Error]', message);
      res.status(500).json({ error: message });
    }
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
