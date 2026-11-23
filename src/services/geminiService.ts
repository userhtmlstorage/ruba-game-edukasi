import { GoogleGenAI } from '@google/genai';

export type GeminiSpeechTone = 'cheerful' | 'gentle' | 'excited';

const PLACEHOLDER_KEYS = new Set([
  '',
  'MY_GEMINI_API_KEY',
  'YOUR_GEMINI_API_KEY',
  'YOUR_API_KEY',
]);

const VOICE_NAME = 'Zephyr';
const BASE_VOICE_PERSONA =
  'Same consistent single speaker: a warm, friendly young Indonesian female kindergarten storyteller speaking natural, expressive Bahasa Indonesia to a 4-year-old child, with lifelike human breathing, warm melodic intonation, and zero robotic stiffness.';

const STYLE_BY_TONE: Record<GeminiSpeechTone, string> = {
  cheerful: `${BASE_VOICE_PERSONA} Tone: bright, smiling, and cheerfully inviting.`,
  excited: `${BASE_VOICE_PERSONA} Tone: warmly celebratory and proudly praising, keeping the exact same voice and pitch register.`,
  gentle: `${BASE_VOICE_PERSONA} Tone: softly reassuring, patient, and kind, keeping the exact same voice and pitch register.`,
};

let cachedClient: GoogleGenAI | null = null;
const clientModelCooldownUntil = new Map<string, number>();

function readRawClientEnvKey(): string {
  try {
    const raw = import.meta.env?.VITE_GEMINI_API_KEY;
    return typeof raw === 'string' ? raw.trim() : '';
  } catch {
    return '';
  }
}

/**
 * Mengecek ketersediaan VITE_GEMINI_API_KEY secara aman tanpa pernah mencatat
 * atau mengembalikan isi kunci API ke UI maupun console.
 */
export function hasGeminiClientKey(): boolean {
  const key = readRawClientEnvKey();
  return key.length > 0 && !PLACEHOLDER_KEYS.has(key);
}

/**
 * Mengembalikan status kesiapan Gemini API secara aman (tanpa detail teknis sensitif).
 */
export function getGeminiAvailabilityStatus(): {
  configured: boolean;
  message: string;
} {
  if (hasGeminiClientKey()) {
    return {
      configured: true,
      message: 'Suara pintar siap menemani belajar.',
    };
  }
  return {
    configured: false,
    message: 'Menggunakan mode suara bawaan perangkat yang ramah anak.',
  };
}

/**
 * Menginisialisasi instance GoogleGenAI secara terpusat hanya dari import.meta.env.VITE_GEMINI_API_KEY.
 * Mengembalikan null bila kunci belum diatur.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (!hasGeminiClientKey()) return null;
  if (!cachedClient) {
    const apiKey = readRawClientEnvKey();
    cachedClient = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        apiVersion: 'v1beta',
      },
    });
  }
  return cachedClient;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function isCoolingDown(model: string): boolean {
  const until = clientModelCooldownUntil.get(model);
  return typeof until === 'number' && Date.now() < until;
}

/**
 * Mensintesis suara anak ramah melalui Gemini API menggunakan VITE_GEMINI_API_KEY
 * (digunakan saat berjalan sebagai bundle statis atau fallback bila endpoint server tidak tersedia).
 * Tidak pernah melempar/mencetak API key ke UI atau console.
 */
export async function synthesizeSpeechFromClientEnv(
  rawText: string,
  tone: GeminiSpeechTone = 'cheerful'
): Promise<ArrayBuffer | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const text = rawText.trim();
  if (!text || text.length > 500) return null;

  const models: Array<'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts'> = [
    'gemini-3.8-flash-tts',
    'gemini-3.8-flash-lite-tts',
  ];

  for (const model of models) {
    if (isCoolingDown(model)) continue;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
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
      if (base64Audio) {
        return base64ToArrayBuffer(base64Audio);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
        clientModelCooldownUntil.set(model, Date.now() + 10 * 60 * 1000);
      } else if (/401|403|API_KEY_INVALID|PERMISSION_DENIED/i.test(msg)) {
        // Kunci tidak valid / ditolak: hentikan percobaan klien tanpa mengekspos detail key
        clientModelCooldownUntil.set(model, Date.now() + 60 * 60 * 1000);
      }
    }
  }

  return null;
}
