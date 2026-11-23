import { SongNote } from '../types';
import {
  hasGeminiClientKey,
  synthesizeSpeechFromClientEnv,
} from '../services/geminiService';

type SpeechListener = (speaking: boolean, text: string) => void;
type SpeechTone = 'cheerful' | 'gentle' | 'excited';

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

interface NativeTtsBridge {
  Capacitor?: {
    Plugins?: {
      TextToSpeech?: {
        speak?: (opts: { text: string; lang?: string; rate?: number; pitch?: number }) => Promise<void>;
        stop?: () => Promise<void>;
      };
    };
  };
  TTS?: {
    speak?: (
      opts: { text: string; locale?: string; rate?: number },
      onSuccess?: () => void,
      onError?: (err: unknown) => void
    ) => void;
    stop?: () => void;
  };
}

class RuBaAudioEngine {
  private ctx: AudioContext | null = null;
  private bgmMuted: boolean = false;
  private isSpeakingVoice: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private songTimers: number[] = [];
  private songRaf: number | null = null;
  private speechListeners: Set<SpeechListener> = new Set();
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;

  // Natural Neural TTS playback & caching state
  private audioBufferCache: Map<string, ArrayBuffer> = new Map();
  private audioDataUriCache: Map<string, string> = new Map();
  private pendingFetches: Map<string, Promise<ArrayBuffer | null>> = new Map();
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private sharedAudioEl: HTMLAudioElement | null = null;
  private audioElUnlocked: boolean = false;
  private webAudioUnlocked: boolean = false;
  private activeAbortController: AbortController | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private fallbackDelayTimer: number | null = null;
  private speakSeqId: number = 0;
  private neuralTtsAvailable: boolean = true;
  private neuralCooldownUntil: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }

      // Automatically unlock mobile WebView / iOS PWA audio on the user's very first interaction anywhere
      const autoUnlock = () => {
        this.unlock();
      };
      window.addEventListener('touchstart', autoUnlock, { capture: true, passive: true });
      window.addEventListener('pointerdown', autoUnlock, { capture: true, passive: true });
      window.addEventListener('mousedown', autoUnlock, { capture: true, passive: true });
      window.addEventListener('keydown', autoUnlock, { capture: true, passive: true });
    }
  }

  private resolveTtsEndpoint(): string | null {
    const envUrl =
      typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: { VITE_TTS_API_URL?: string } }).env?.VITE_TTS_API_URL?.trim()
        : undefined;
    if (envUrl) return envUrl;

    if (typeof window === 'undefined') return '/api/tts';
    const proto = window.location?.protocol || '';
    if (proto === 'file:' || proto === 'capacitor:' || proto === 'ionic:' || proto === 'app:') {
      // Packaged local bundle without VITE_TTS_API_URL configured
      return null;
    }
    return '/api/tts';
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    this.voicesLoaded = true;

    // Keep voice selection locked once resolved so fallback never flips speakers mid-session
    if (this.preferredVoice && voices.some((v) => v.voiceURI === this.preferredVoice?.voiceURI)) {
      return;
    }

    const idVoices = voices
      .filter((v) => v.lang.toLowerCase().startsWith('id'))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (idVoices.length > 0) {
      // Prefer local/offline-safe Indonesian voices first on installed mobile apps, then quality names
      this.preferredVoice =
        idVoices.find(
          (v) => v.localService && /gadis|damayanti|google.*indonesia|natural/i.test(v.name)
        ) ||
        idVoices.find((v) => v.localService) ||
        idVoices.find((v) => /gadis|damayanti|google.*indonesia|natural|online/i.test(v.name)) ||
        idVoices[0];
    } else {
      const msVoices = voices
        .filter((v) => v.lang.toLowerCase().startsWith('ms'))
        .sort((a, b) => a.name.localeCompare(b.name));
      this.preferredVoice = msVoices.find((v) => v.localService) || msVoices[0] || null;
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public unlock() {
    try {
      const ctx = this.ensureContext();
      if (ctx && !this.webAudioUnlocked) {
        // Play synchronous 1-sample silent buffer inside user gesture to unlock Android WebView / iOS hardware
        try {
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
          this.webAudioUnlocked = true;
        } catch {
          // Ignore silent unlock errors
        }
      }

      if (typeof window !== 'undefined' && typeof Audio !== 'undefined' && !this.audioElUnlocked) {
        try {
          if (!this.sharedAudioEl) {
            this.sharedAudioEl = new Audio();
            this.sharedAudioEl.preload = 'auto';
          }
          // Unlock persistent HTMLAudioElement synchronously within gesture
          if (!this.sharedAudioEl.src) {
            this.sharedAudioEl.src = SILENT_WAV_DATA_URI;
            this.sharedAudioEl.volume = 0.01;
            const p = this.sharedAudioEl.play();
            if (p && typeof p.then === 'function') {
              p.then(() => {
                if (this.sharedAudioEl && this.sharedAudioEl.src === SILENT_WAV_DATA_URI) {
                  this.sharedAudioEl.pause();
                }
                this.audioElUnlocked = true;
              }).catch(() => {});
            } else {
              this.audioElUnlocked = true;
            }
          }
        } catch {
          // Ignore HTMLAudioElement unlock error
        }
      }

      if (!this.voicesLoaded) {
        this.loadVoices();
      }
    } catch {
      // Never block UI interaction if mobile WebView audio is restricted
    }
  }

  public subscribeSpeech(listener: SpeechListener): () => void {
    this.speechListeners.add(listener);
    return () => {
      this.speechListeners.delete(listener);
    };
  }

  private notifySpeech(speaking: boolean, text: string) {
    this.isSpeakingVoice = speaking;
    this.speechListeners.forEach((fn) => fn(speaking, text));
  }

  private async fetchNeuralWavBuffer(
    text: string,
    tone: SpeechTone,
    signal?: AbortSignal
  ): Promise<ArrayBuffer | null> {
    const cacheKey = `${tone}:${text}`;
    const existingBuffer = this.audioBufferCache.get(cacheKey);
    if (existingBuffer) return existingBuffer;

    const inFlight = this.pendingFetches.get(cacheKey);
    if (inFlight && !signal) return inFlight;

    const endpoint = this.resolveTtsEndpoint();

    const fetchPromise = (async () => {
      try {
        if (endpoint) {
          for (let attempt = 0; attempt < 2; attempt++) {
            if (signal?.aborted) return null;

            const timeoutCtrl = new AbortController();
            const timeoutId = setTimeout(() => timeoutCtrl.abort(), 8500);
            const onCallerAbort = () => timeoutCtrl.abort();
            signal?.addEventListener('abort', onCallerAbort, { once: true });

            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, tone }),
                signal: timeoutCtrl.signal,
              });

              if (res.ok) {
                const buffer = await res.arrayBuffer();
                if (!buffer.byteLength) return null;
                this.audioBufferCache.set(cacheKey, buffer);
                return buffer;
              }

              if (res.status === 503 || res.status === 404) {
                break;
              }

              if (res.status === 429) {
                this.neuralCooldownUntil = Date.now() + 15000;
                break;
              }

              if (attempt === 0 && res.status >= 500) {
                await new Promise((r) => setTimeout(r, 250));
                continue;
              }

              break;
            } finally {
              clearTimeout(timeoutId);
              signal?.removeEventListener('abort', onCallerAbort);
            }
          }
        }

        // Centralized client-env Gemini helper (import.meta.env.VITE_GEMINI_API_KEY) for static APK / client builds
        if (!signal?.aborted && hasGeminiClientKey()) {
          const clientBuffer = await synthesizeSpeechFromClientEnv(text, tone);
          if (clientBuffer && clientBuffer.byteLength > 0) {
            this.audioBufferCache.set(cacheKey, clientBuffer);
            return clientBuffer;
          }
        }

        if (!endpoint && !hasGeminiClientKey()) {
          this.neuralTtsAvailable = false;
        }
        return null;
      } catch {
        if (!signal?.aborted && hasGeminiClientKey()) {
          const clientBuffer = await synthesizeSpeechFromClientEnv(text, tone);
          if (clientBuffer && clientBuffer.byteLength > 0) {
            this.audioBufferCache.set(cacheKey, clientBuffer);
            return clientBuffer;
          }
        }
        return null;
      } finally {
        this.pendingFetches.delete(cacheKey);
      }
    })();

    if (!signal) {
      this.pendingFetches.set(cacheKey, fetchPromise);
    }
    return fetchPromise;
  }

  public prefetch(text: string, tone: SpeechTone = 'cheerful') {
    const clean = text.trim();
    if (!this.neuralTtsAvailable || !clean) return;
    const cacheKey = `${tone}:${clean}`;
    if (this.audioBufferCache.has(cacheKey) || this.pendingFetches.has(cacheKey)) return;
    void this.fetchNeuralWavBuffer(clean, tone);
  }

  private async playWithAudioContext(
    wavBuffer: ArrayBuffer,
    cleanText: string,
    seqId: number
  ): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Clone buffer because decodeAudioData detaches the passed ArrayBuffer
      const decoded = await ctx.decodeAudioData(wavBuffer.slice(0));
      if (seqId !== this.speakSeqId) return true;

      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      this.activeSourceNode = source;

      source.onended = () => {
        if (this.activeSourceNode === source) {
          this.activeSourceNode = null;
        }
        if (this.speakSeqId === seqId) {
          this.notifySpeech(false, cleanText);
        }
      };

      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  private async playWithSharedAudioEl(
    wavBuffer: ArrayBuffer,
    cacheKey: string,
    cleanText: string,
    seqId: number
  ): Promise<boolean> {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return false;

    let dataUri = this.audioDataUriCache.get(cacheKey);
    if (!dataUri) {
      dataUri = `data:audio/wav;base64,${arrayBufferToBase64(wavBuffer)}`;
      this.audioDataUriCache.set(cacheKey, dataUri);
    }

    const audio = this.sharedAudioEl || new Audio();
    this.sharedAudioEl = audio;
    audio.volume = 1.0;

    return new Promise<boolean>((resolve) => {
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      audio.onended = () => {
        if (this.speakSeqId === seqId) this.notifySpeech(false, cleanText);
      };
      audio.onerror = () => {
        done(false);
      };

      try {
        audio.pause();
        audio.src = dataUri;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => done(true))
            .catch(() => done(false));
        } else {
          done(true);
        }
      } catch {
        done(false);
      }
    });
  }

  private trySpeakNativePlugin(text: string, seqId: number): boolean {
    if (typeof window === 'undefined') return false;
    const bridge = window as unknown as NativeTtsBridge;
    const capTts = bridge.Capacitor?.Plugins?.TextToSpeech;
    if (capTts?.speak) {
      try {
        void capTts
          .speak({ text, lang: 'id-ID', rate: 0.96, pitch: 1.06 })
          .then(() => {
            if (this.speakSeqId === seqId) this.notifySpeech(false, text);
          })
          .catch(() => {
            if (this.speakSeqId === seqId) this.notifySpeech(false, text);
          });
        return true;
      } catch {
        // Fall through
      }
    }

    const cordovaTts = bridge.TTS;
    if (cordovaTts?.speak) {
      try {
        cordovaTts.speak(
          { text, locale: 'id-ID', rate: 0.96 },
          () => {
            if (this.speakSeqId === seqId) this.notifySpeech(false, text);
          },
          () => {
            if (this.speakSeqId === seqId) this.notifySpeech(false, text);
          }
        );
        return true;
      } catch {
        // Fall through
      }
    }
    return false;
  }

  private speakFallbackBrowser(
    text: string,
    seqId: number,
    _opts?: { tone?: SpeechTone; rate?: number; pitch?: number }
  ) {
    if (this.trySpeakNativePlugin(text, seqId)) {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => {
        if (this.speakSeqId === seqId) this.notifySpeech(false, text);
      }, Math.min(3500, text.length * 65));
      return;
    }

    try {
      const synth = window.speechSynthesis;
      const needsCancelDelay = synth.speaking || synth.pending;
      if (needsCancelDelay) {
        synth.cancel();
      }
      if (synth.paused) {
        synth.resume();
      }
      if (!this.voicesLoaded) this.loadVoices();

      const startUtterance = (allowPreferredVoice: boolean) => {
        if (this.speakSeqId !== seqId) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'id-ID';
        if (allowPreferredVoice && this.preferredVoice) {
          utter.voice = this.preferredVoice;
        }

        // Always keep pitch & rate identical across calls so voice never sounds inconsistent
        utter.pitch = 1.06;
        utter.rate = 0.96;
        utter.volume = 1.0;

        this.activeUtterance = utter;

        utter.onend = () => {
          if (this.activeUtterance === utter) this.activeUtterance = null;
          if (this.speakSeqId === seqId) this.notifySpeech(false, text);
        };
        utter.onerror = () => {
          if (this.activeUtterance === utter) this.activeUtterance = null;
          // If selected cloud/voice failed on Android WebView, retry once with bare id-ID system default
          if (allowPreferredVoice && this.preferredVoice && this.speakSeqId === seqId) {
            startUtterance(false);
            return;
          }
          if (this.speakSeqId === seqId) this.notifySpeech(false, text);
        };

        synth.speak(utter);
      };

      // Android Chrome/WebView silently drops speak() if called on the exact same tick as cancel()
      if (needsCancelDelay) {
        this.fallbackDelayTimer = window.setTimeout(() => {
          this.fallbackDelayTimer = null;
          startUtterance(true);
        }, 45);
      } else {
        startUtterance(true);
      }

      // Safety timeout in case Android WebView speechSynthesis never fires onend
      setTimeout(() => {
        if (this.speakSeqId === seqId) this.notifySpeech(false, text);
      }, Math.min(6000, Math.max(2000, text.length * 85)));
    } catch {
      setTimeout(() => {
        if (this.speakSeqId === seqId) this.notifySpeech(false, text);
      }, 2000);
    }
  }

  public speak(
    text: string,
    opts?: { tone?: SpeechTone; rate?: number; pitch?: number }
  ) {
    const cleanText = text.trim();
    if (!cleanText) return;

    this.unlock();
    this.stopSpeech();
    const seqId = ++this.speakSeqId;
    const tone: SpeechTone = opts?.tone ?? 'cheerful';
    this.notifySpeech(true, cleanText);

    if (!this.neuralTtsAvailable || Date.now() < this.neuralCooldownUntil) {
      this.speakFallbackBrowser(cleanText, seqId, opts);
      return;
    }

    const controller = new AbortController();
    this.activeAbortController = controller;

    void (async () => {
      const wavBuffer = await this.fetchNeuralWavBuffer(cleanText, tone, controller.signal);
      if (seqId !== this.speakSeqId || controller.signal.aborted) {
        return;
      }

      if (!wavBuffer) {
        this.speakFallbackBrowser(cleanText, seqId, opts);
        return;
      }

      // Primary path: play decoded audio via unlocked Web Audio API (reliable across async fetches)
      const playedViaWebAudio = await this.playWithAudioContext(wavBuffer, cleanText, seqId);
      if (playedViaWebAudio || seqId !== this.speakSeqId) {
        return;
      }

      // Secondary neural path: persistent unlocked HTMLAudioElement with data:audio/wav URI (WebView-safe)
      const cacheKey = `${tone}:${cleanText}`;
      const playedViaEl = await this.playWithSharedAudioEl(wavBuffer, cacheKey, cleanText, seqId);
      if (!playedViaEl && seqId === this.speakSeqId) {
        this.speakFallbackBrowser(cleanText, seqId, opts);
      }
    })();
  }

  public stopSpeech() {
    this.speakSeqId++;
    if (this.fallbackDelayTimer !== null) {
      clearTimeout(this.fallbackDelayTimer);
      this.fallbackDelayTimer = null;
    }
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.onended = null;
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Ignore already-stopped AudioBufferSourceNode
      }
      this.activeSourceNode = null;
    }
    if (this.sharedAudioEl) {
      try {
        this.sharedAudioEl.onended = null;
        this.sharedAudioEl.onerror = null;
        this.sharedAudioEl.pause();
      } catch {
        // Ignore pause error
      }
    }
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      const bridge = window as unknown as NativeTtsBridge;
      try {
        void bridge.Capacitor?.Plugins?.TextToSpeech?.stop?.();
        bridge.TTS?.stop?.();
      } catch {
        // Ignore native stop error
      }
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis?.cancel?.();
        } catch {
          // Ignore WebView speechSynthesis cancel error
        }
      }
    }
    this.notifySpeech(false, '');
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.14,
    delay: number = 0
  ) {
    try {
      const ctx = this.ensureContext();
      if (!ctx || freq <= 0) return;

      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.03);
    } catch {
      // Never throw on restricted WebView audio playback
    }
  }

  public playTap() {
    this.playTone(587.33, 0.09, 'triangle', 0.1);
  }

  public playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.playTone(f, 0.24, 'triangle', 0.14, idx * 0.075);
      this.playTone(f * 2, 0.16, 'sine', 0.04, idx * 0.075 + 0.02);
    });
  }

  public playEncourage() {
    this.playTone(392.0, 0.14, 'sine', 0.1);
    this.playTone(440.0, 0.18, 'sine', 0.09, 0.11);
  }

  public playJump() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playSplash() {
    this.playTone(349.23, 0.12, 'sine', 0.12, 0);
    this.playTone(523.25, 0.15, 'sine', 0.1, 0.06);
    this.playTone(698.46, 0.2, 'triangle', 0.08, 0.12);
  }

  public playMagic() {
    const shimmer = [523.25, 659.25, 783.99, 987.77, 1318.51];
    shimmer.forEach((f, i) => this.playTone(f, 0.22, 'sine', 0.09, i * 0.055));
  }

  public playCelebration() {
    const fanfare = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 659.25, d: 0.15, t: 0.12 },
      { f: 783.99, d: 0.15, t: 0.24 },
      { f: 1046.5, d: 0.35, t: 0.36 },
      { f: 783.99, d: 0.15, t: 0.56 },
      { f: 1046.5, d: 0.5, t: 0.7 },
    ];
    fanfare.forEach((n) => {
      this.playTone(n.f, n.d, 'triangle', 0.16, n.t);
      this.playTone(n.f / 2, n.d, 'sine', 0.08, n.t);
    });
  }

  public startBgm() {
    if (this.bgmTimer !== null) return;
    this.ensureContext();
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99,
      659.25, 587.33, 523.25, 0,
    ];
    const bass = [
      261.63, 0, 196.0, 0,
      220.0, 0, 196.0, 0,
      174.61, 0, 196.0, 0,
      261.63, 0, 196.0, 0,
    ];

    this.bgmTimer = window.setInterval(() => {
      if (this.bgmMuted) return;
      const idx = this.bgmStep % melody.length;
      const mFreq = melody[idx];
      const bFreq = bass[idx];
      // Duck BGM gently when Bobi is speaking so human voice is crystal clear
      const duckFactor = this.isSpeakingVoice ? 0.35 : 1.0;
      if (mFreq > 0) {
        this.playTone(mFreq, 0.32, 'sine', 0.03 * duckFactor, 0);
      }
      if (bFreq > 0) {
        this.playTone(bFreq, 0.45, 'triangle', 0.022 * duckFactor, 0);
      }
      this.bgmStep++;
    }, 420);
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public setMuted(muted: boolean) {
    this.bgmMuted = muted;
  }

  public isMuted(): boolean {
    return this.bgmMuted;
  }

  public stopSong() {
    this.songTimers.forEach((id) => clearTimeout(id));
    this.songTimers = [];
    if (this.songRaf !== null) {
      cancelAnimationFrame(this.songRaf);
      this.songRaf = null;
    }
  }

  public playSongNotes(
    notes: SongNote[],
    onProgress: (elapsedSec: number) => void,
    onComplete: () => void,
    maxSeconds?: number
  ) {
    this.stopSong();
    this.ensureContext();

    let offset = 0;
    for (const note of notes) {
      if (maxSeconds !== undefined && offset >= maxSeconds) break;
      const playAtMs = offset * 1000;
      const timerId = window.setTimeout(() => {
        if (note.freq > 0) {
          this.playTone(note.freq, Math.max(0.14, note.dur * 0.92), 'triangle', 0.16, 0);
          this.playTone(note.freq * 2, Math.max(0.1, note.dur * 0.5), 'sine', 0.04, 0.01);
        }
      }, playAtMs);
      this.songTimers.push(timerId);
      offset += note.dur;
    }

    const totalDur = maxSeconds !== undefined ? Math.min(offset, maxSeconds) : offset;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      onProgress(elapsed);
      if (elapsed < totalDur) {
        this.songRaf = requestAnimationFrame(tick);
      } else {
        this.songRaf = null;
        onComplete();
      }
    };
    this.songRaf = requestAnimationFrame(tick);
  }
}

export const audioEngine = new RuBaAudioEngine();

export const POSITIVE_PRAISES = [
  'Hebat sekali! Kamu pintar!',
  'Pintar sekali! Jawabanmu benar!',
  'Luar biasa! Bobi bangga padamu!',
  'Wah, keren sekali! Tepat sekali!',
  'Hore! Kamu berhasil menjawab dengan tepat!',
];

export const ENCOURAGE_PROMPTS = [
  'Hampir tepat, yuk coba lagi!',
  'Coba pilih yang lain, ya! Kamu pasti bisa!',
  'Tidak apa-apa, ayo kita coba sekali lagi!',
  'Wah, hampir! Yuk cari jawaban yang paling pas!',
];

export function randomPraise(): string {
  return POSITIVE_PRAISES[Math.floor(Math.random() * POSITIVE_PRAISES.length)];
}

export function randomEncourage(): string {
  return ENCOURAGE_PROMPTS[Math.floor(Math.random() * ENCOURAGE_PROMPTS.length)];
}
