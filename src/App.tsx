import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Play,
  RotateCcw,
  Shirt,
  Star,
  Volume2,
  VolumeX,
  Sticker,
} from 'lucide-react';
import {
  ANGKA_QUESTIONS,
  COSTUMES,
  DIGITAL_QUESTIONS,
  EMOSI_QUESTIONS,
  HURUF_QUESTIONS,
  MODULES,
  STICKERS,
  WARNA_QUESTIONS,
} from './data/gameData';
import { BobiMood, CostumeId, GameScreen, IllustrationKey, ModuleId } from './types';
import { audioEngine } from './utils/audioEngine';
import { BobiCharacter } from './components/BobiCharacter';
import { ConfettiBurst } from './components/ConfettiBurst';
import { ModuleIllustration } from './components/ModuleIcons';
import { NatureBackground } from './components/NatureBackground';
import { StickerBookModal } from './components/StickerBookModal';
import { WardrobeModal } from './components/WardrobeModal';
import { BumiModuleView } from './components/modules/BumiModuleView';
import { GerakModuleView } from './components/modules/GerakModuleView';
import { LaguModuleView } from './components/modules/LaguModuleView';
import { QuizModuleView } from './components/modules/QuizModuleView';
import { SainsModuleView } from './components/modules/SainsModuleView';
import { ChildSafeAdBannerSlot, TestInterstitialModal } from './components/AdMobComponents';
import { useViewportSize } from './hooks/useViewportSize';
import { AdPlacementContext, admobService } from './services/admobService';

const STORAGE_KEY = 'ruba_progress_v1';

interface SavedProgress {
  stars: number;
  selectedCostume: CostumeId;
  unlockedStickers: string[];
  completedModules: ModuleId[];
}

const DEFAULT_PROGRESS: SavedProgress = {
  stars: 0,
  selectedCostume: 'default',
  unlockedStickers: [],
  completedModules: [],
};

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
      selectedCostume: parsed.selectedCostume || 'default',
      unlockedStickers: Array.isArray(parsed.unlockedStickers) ? parsed.unlockedStickers : [],
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

const MODULE_PREVIEW_ICON: Record<ModuleId, IllustrationKey> = {
  warna: 'rainbow',
  huruf: 'apple',
  angka: 'star_obj',
  lagu: 'balloon',
  bumi: 'eco_tree',
  emosi: 'emotion_happy',
  sains: 'rocket',
  gerak: 'duck',
  digital: 'shield',
};

export default function App() {
  const viewport = useViewportSize();
  const useLandscapeSplit = viewport.orientation === 'landscape' && viewport.width >= 480;
  const isPhone = viewport.isPhone;

  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [progress, setProgress] = useState<SavedProgress>(loadProgress);
  const [bgmMuted, setBgmMuted] = useState<boolean>(false);

  const [bobiMood, setBobiMood] = useState<BobiMood>('idle');
  const [bobiSpeech, setBobiSpeech] = useState<string>('Halo! Aku Bobi. Ayo kita bermain sambil belajar!');
  const [currentAudioPrompt, setCurrentAudioPrompt] = useState<string>(
    'Halo! Selamat datang di RuBa, Ruang Belajar bersama Bobi!'
  );
  const [confettiKey, setConfettiKey] = useState<number>(0);
  const [jumpTick, setJumpTick] = useState<number>(0);
  const [moduleSessionKey, setModuleSessionKey] = useState<number>(1);

  const [showWardrobe, setShowWardrobe] = useState<boolean>(false);
  const [showStickers, setShowStickers] = useState<boolean>(false);
  const [roundSummaryModule, setRoundSummaryModule] = useState<ModuleId | null>(null);
  const [newlyUnlockedCostumeName, setNewlyUnlockedCostumeName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [showTestInterstitial, setShowTestInterstitial] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  useEffect(() => {
    void admobService.initialize();
    const unsubscribe = admobService.subscribeTestInterstitial(setShowTestInterstitial);
    return () => {
      unsubscribe();
      audioEngine.stopBgm();
      audioEngine.stopSong();
      audioEngine.stopSpeech();
    };
  }, []);

  useEffect(() => {
    const context: AdPlacementContext =
      showWardrobe || showStickers || roundSummaryModule || showTestInterstitial
        ? 'MODAL'
        : screen;
    void admobService.syncBannerForContext(context);
  }, [screen, showWardrobe, showStickers, roundSummaryModule, showTestInterstitial]);

  const toggleBgm = () => {
    audioEngine.unlock();
    const next = !bgmMuted;
    setBgmMuted(next);
    audioEngine.setMuted(next);
    if (!next) {
      audioEngine.startBgm();
    }
  };

  const handleStartFromTitle = useCallback(() => {
    setScreen('HUB');
    setBobiMood('happy');
    const welcome = 'Selamat datang di Pintu Masuk RuBa! Pilih modul belajar mana yang kamu suka?';
    setBobiSpeech('Pilih pintu belajar yang kamu suka!');
    setCurrentAudioPrompt(welcome);
    window.setTimeout(() => setBobiMood('idle'), 2000);

    try {
      audioEngine.unlock();
      audioEngine.playSuccess();
      if (!bgmMuted) {
        audioEngine.startBgm();
      }
      audioEngine.speak(welcome, { tone: 'cheerful' });
    } catch {
      // Transisi menu utama tidak boleh terhambat jika audio diblokir browser mobile
    }
  }, [bgmMuted]);

  const handleOpenModule = (modId: ModuleId) => {
    audioEngine.unlock();
    audioEngine.playTap();
    setActiveModule(modId);
    setModuleSessionKey((k) => k + 1);
    setRoundSummaryModule(null);
    setNewlyUnlockedCostumeName(null);
    setBobiMood('idle');
    setScreen('MODULE');
  };

  const handleBackToHub = useCallback(() => {
    audioEngine.stopSong();
    audioEngine.stopSpeech();
    audioEngine.playTap();
    setActiveModule(null);
    setRoundSummaryModule(null);
    setScreen('HUB');
    setBobiMood('idle');
    setBobiSpeech('Ayo pilih modul seru lainnya!');
    setCurrentAudioPrompt('Pilih modul belajar lain yang ingin kamu mainkan!');
  }, []);

  const handleFinishAndExitModule = useCallback(() => {
    handleBackToHub();
    void admobService.tryShowInterstitialAfterModule();
  }, [handleBackToHub]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (screen === 'TITLE' && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleStartFromTitle();
      } else if (screen === 'MODULE' && e.key === 'Escape') {
        handleBackToHub();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, handleStartFromTitle, handleBackToHub]);

  const handlePromptChange = useCallback((audioText: string, bubbleText: string) => {
    setCurrentAudioPrompt(audioText);
    setBobiSpeech(bubbleText);
    setBobiMood('idle');
  }, []);

  const handleCorrectAnswer = useCallback((feedbackText: string) => {
    setConfettiKey((k) => k + 1);
    setBobiMood('dancing');
    setBobiSpeech(feedbackText);

    setProgress((prev) => {
      const nextStars = prev.stars + 1;
      const newlyUnlocked = COSTUMES.find(
        (c) => c.starsRequired > prev.stars && c.starsRequired <= nextStars
      );
      if (newlyUnlocked) {
        setNewlyUnlockedCostumeName(newlyUnlocked.name);
      }
      return {
        ...prev,
        stars: nextStars,
      };
    });

    window.setTimeout(() => {
      setBobiMood('idle');
    }, 1900);
  }, []);

  const handleGentleWrong = useCallback((feedbackText: string) => {
    setBobiMood('encouraging');
    setBobiSpeech(feedbackText);
    window.setTimeout(() => {
      setBobiMood('idle');
    }, 1200);
  }, []);

  const handleRoundComplete = useCallback(() => {
    if (!activeModule) return;
    const modMeta = MODULES.find((m) => m.id === activeModule);
    audioEngine.playCelebration();
    setConfettiKey((k) => k + 1);
    setBobiMood('dancing');

    if (modMeta) {
      setProgress((prev) => ({
        ...prev,
        unlockedStickers: prev.unlockedStickers.includes(modMeta.stickerId)
          ? prev.unlockedStickers
          : [...prev.unlockedStickers, modMeta.stickerId],
        completedModules: prev.completedModules.includes(activeModule)
          ? prev.completedModules
          : [...prev.completedModules, activeModule],
      }));
      audioEngine.speak(
        `Hore! Kamu berhasil menyelesaikan modul ${modMeta.title} dan mendapatkan stiker baru!`,
        { tone: 'excited' }
      );
    }

    setRoundSummaryModule(activeModule);
  }, [activeModule]);

  const handleRepeatAudio = () => {
    audioEngine.unlock();
    audioEngine.playTap();
    audioEngine.speak(currentAudioPrompt, { tone: 'cheerful' });
  };

  const activeModuleMeta = activeModule
    ? MODULES.find((m) => m.id === activeModule) || null
    : null;

  const unlockedCostumeCount = COSTUMES.filter((c) => progress.stars >= c.starsRequired).length;
  const unlockedStickerCount = STICKERS.filter(
    (s) =>
      progress.unlockedStickers.includes(s.id) ||
      (s.starsRequired !== undefined && progress.stars >= s.starsRequired)
  ).length;

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden">
      {/* Living Nature Backdrop */}
      <NatureBackground />

      {/* 60fps Confetti Canvas */}
      <ConfettiBurst triggerKey={confettiKey} />

      {/* TITLE SCREEN */}
      {screen === 'TITLE' && (
        <main
          onClick={handleStartFromTitle}
          className="relative z-20 flex min-h-[100dvh] w-full flex-col items-center justify-center px-3 py-3 sm:px-6 sm:py-5 overflow-y-auto scroll-touch cursor-pointer"
        >
          <div
            className={`grid w-full ${
              useLandscapeSplit ? 'grid-cols-12' : 'grid-cols-1 sm:grid-cols-12'
            } items-center bg-[#FFFDF7]/95 shadow-2xl ${
              isPhone
                ? 'max-w-[min(94vw,44rem)] gap-3 rounded-3xl border-2 border-amber-300 p-3.5'
                : 'max-w-[min(94vw,64rem)] gap-6 rounded-[2.5rem] border-4 border-amber-300 p-6 lg:p-10'
            }`}
          >
            {/* Left: Official RuBa Logo & Animated Bobi */}
            <div
              className={`${
                useLandscapeSplit ? 'col-span-5' : 'sm:col-span-5'
              } flex flex-col items-center justify-center gap-2`}
            >
              {!logoError ? (
                <img
                  src="/assets/aistudio/ruba-logo-transparent_0d8cca91.png"
                  alt="Logo RuBa — Ruang Belajar Bobi si Rubah"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className={`pointer-events-none object-contain drop-shadow-lg animate-gentle-float ${
                    isPhone
                      ? 'h-[clamp(5.25rem,28dvh,8.5rem)] w-[clamp(5.25rem,28dvh,8.5rem)]'
                      : 'h-[clamp(8rem,34dvh,15rem)] w-[clamp(8rem,34dvh,15rem)]'
                  }`}
                />
              ) : (
                <BobiCharacter mood="happy" costume={progress.selectedCostume} size="lg" />
              )}
            </div>

            {/* Right: Title Lockup & Start CTA */}
            <div
              className={`${
                useLandscapeSplit
                  ? 'col-span-7 items-start text-left'
                  : 'sm:col-span-7 items-center sm:items-start text-center sm:text-left'
              } flex flex-col ${isPhone ? 'gap-2' : 'gap-4'}`}
            >
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-extrabold text-sky-700">
                <span>Ruang Belajar Anak 3–6 Tahun</span>
                <span aria-hidden="true">·</span>
                <span>9 Modul · 7 Tahap</span>
              </div>

              <h1
                className={`font-display font-bold tracking-tight text-slate-900 text-balance leading-tight ${
                  isPhone
                    ? 'text-[clamp(1.35rem,3.6vw,2rem)]'
                    : 'text-[clamp(1.75rem,4vw,3.5rem)]'
                }`}
              >
                Belajar Ceria Bersama <span className="text-orange-500">Bobi</span> di{' '}
                <span className="text-sky-600">RuBa</span>!
              </h1>

              <p
                className={`max-w-xl font-bold text-slate-600 leading-snug sm:leading-relaxed ${
                  isPhone ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
                }`}
              >
                Ayo mengenal warna, huruf, angka, lagu anak Indonesia, menjaga bumi, sains ajaib,
                emosi, gerak aktif, dan aman berinternet!
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartFromTitle();
                  }}
                  className={`relative z-30 flex items-center gap-2.5 rounded-2xl sm:rounded-3xl border-emerald-700 bg-emerald-500 font-display font-bold text-white shadow-lg transition-transform hover:scale-105 active:translate-y-0.5 focus-visible:outline-4 focus-visible:outline-sky-500 ${
                    isPhone
                      ? 'min-h-[44px] border-2 border-b-4 px-5 py-2 text-lg'
                      : 'min-h-[60px] border-4 border-b-8 px-8 py-4 text-2xl sm:text-3xl'
                  }`}
                >
                  <Play className={`${isPhone ? 'h-5 w-5' : 'h-8 w-8'} fill-white shrink-0`} />
                  <span>Mulai Belajar</span>
                </button>
              </div>

              <p className="text-[11px] sm:text-sm font-bold text-slate-500">
                Ketuk tombol atau layar ini untuk masuk · Musik & suara ramah anak
              </p>
            </div>
          </div>
        </main>
      )}

      {/* HUB SCREEN (PINTU MASUK) */}
      {screen === 'HUB' && (
        <div
          className={`relative z-20 flex w-full flex-col ${
            useLandscapeSplit
              ? 'h-[100dvh] overflow-hidden'
              : 'min-h-[100dvh] overflow-y-auto scroll-touch'
          } ${isPhone ? 'px-2 py-1.5 gap-1.5' : 'px-4 sm:px-6 py-3 gap-3'}`}
        >
          {/* Compact Top HUD */}
          <header
            className={`flex shrink-0 items-center justify-between gap-2 rounded-2xl sm:rounded-3xl border-2 border-sky-200 bg-[#FFFDF7]/95 shadow-sm ${
              isPhone ? 'px-2.5 py-1' : 'px-4 py-2'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {!logoError ? (
                <img
                  src="/assets/aistudio/ruba-logo-transparent_0d8cca91.png"
                  alt="RuBa"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className={`${isPhone ? 'h-8 w-8' : 'h-11 w-11'} shrink-0 object-contain`}
                />
              ) : (
                <BookOpen className={`${isPhone ? 'h-6 w-6' : 'h-8 w-8'} shrink-0 text-sky-600`} />
              )}
              <div className="min-w-0">
                <h1
                  className={`font-display font-bold text-slate-900 leading-none truncate ${
                    isPhone ? 'text-base' : 'text-xl lg:text-2xl'
                  }`}
                >
                  Pintu Masuk RuBa
                </h1>
                {!isPhone && (
                  <p className="hidden md:block text-xs font-bold text-slate-500 mt-0.5">
                    Pilih modul belajar favoritmu
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Total Stars */}
              <div
                className={`flex items-center gap-1 rounded-xl sm:rounded-2xl border-2 border-amber-300 bg-amber-50 ${
                  isPhone ? 'min-h-[36px] px-2 py-0.5' : 'min-h-[44px] px-3.5 py-1'
                }`}
              >
                <Star className={`${isPhone ? 'h-4 w-4' : 'h-5 w-5'} fill-amber-400 text-amber-500`} />
                <span className="font-display text-sm sm:text-lg font-bold text-amber-900 tabular-nums">
                  {progress.stars}
                </span>
              </div>

              {/* Lemari Kostum Button */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.unlock();
                  audioEngine.playTap();
                  setShowWardrobe(true);
                }}
                className={`flex items-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-b-4 border-sky-500 bg-sky-500 font-display font-bold text-white transition-transform hover:bg-sky-600 active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                  isPhone ? 'min-h-[36px] px-2.5 py-0.5 text-xs' : 'min-h-[44px] px-3.5 py-1 text-sm sm:text-base'
                }`}
              >
                <Shirt className={isPhone ? 'h-4 w-4' : 'h-5 w-5'} />
                <span className="hidden md:inline">Lemari Kostum</span>
                <span className="text-[11px] sm:text-xs opacity-90 tabular-nums">
                  ({unlockedCostumeCount}/{COSTUMES.length})
                </span>
              </button>

              {/* Buku Stiker Button */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.unlock();
                  audioEngine.playTap();
                  setShowStickers(true);
                }}
                className={`flex items-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-b-4 border-pink-500 bg-pink-500 font-display font-bold text-white transition-transform hover:bg-pink-600 active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                  isPhone ? 'min-h-[36px] px-2.5 py-0.5 text-xs' : 'min-h-[44px] px-3.5 py-1 text-sm sm:text-base'
                }`}
              >
                <Sticker className={isPhone ? 'h-4 w-4' : 'h-5 w-5'} />
                <span className="hidden md:inline">Buku Stiker</span>
                <span className="text-[11px] sm:text-xs opacity-90 tabular-nums">
                  ({unlockedStickerCount}/{STICKERS.length})
                </span>
              </button>

              {/* BGM Toggle */}
              <button
                type="button"
                onClick={toggleBgm}
                aria-label={bgmMuted ? 'Nyalakan Musik Latar' : 'Matikan Musik Latar'}
                className={`flex items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-colors shrink-0 ${
                  isPhone ? 'h-9 w-9' : 'h-11 w-11'
                } ${
                  bgmMuted
                    ? 'border-slate-300 bg-slate-100 text-slate-500'
                    : 'border-emerald-400 bg-emerald-100 text-emerald-700'
                }`}
              >
                {bgmMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
          </header>

          {/* Landscape Main Hub Grid */}
          <div
            className={`grid flex-1 ${
              useLandscapeSplit ? 'grid-cols-12' : 'grid-cols-1'
            } ${isPhone ? 'gap-2' : 'gap-4'} min-h-0`}
          >
            {/* Left Bottom Bobi Companion Card (Proportional in dedicated column) */}
            {useLandscapeSplit && (
              <aside
                className={`col-span-3 flex flex-col items-center justify-between border-sky-200 bg-[#FFFDF7]/90 shadow-md min-h-0 overflow-y-auto scroll-touch ${
                  isPhone ? 'rounded-2xl border-2 p-2' : 'rounded-3xl border-4 p-4'
                }`}
              >
                <div className="text-center">
                  <p className="font-display text-sm lg:text-xl font-bold text-slate-800 leading-tight">
                    Halo, Sahabat RuBa!
                  </p>
                  <p className="text-[11px] lg:text-xs font-bold text-slate-500 mt-0.5 tabular-nums">
                    {progress.completedModules.length}/{MODULES.length} modul selesai
                  </p>
                </div>

                <div className="my-auto flex items-end justify-center py-1">
                  <BobiCharacter
                    mood={bobiMood}
                    costume={progress.selectedCostume}
                    speech={bobiSpeech}
                    size={isPhone ? 'sm' : 'md'}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRepeatAudio}
                  className={`flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-b-4 border-amber-400 bg-amber-100 font-display font-bold text-amber-900 hover:bg-amber-200 active:translate-y-0.5 ${
                    isPhone ? 'min-h-[38px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 py-2 text-sm lg:text-base'
                  }`}
                >
                  <Volume2 className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                  <span>Dengar Bobi</span>
                </button>
              </aside>
            )}

            {/* Right: 9 Learning Doors (Scrollable Grid) */}
            <section
              className={`${
                useLandscapeSplit ? 'col-span-9 grid-cols-3 overflow-y-auto scroll-touch' : 'grid-cols-2'
              } grid ${isPhone ? 'gap-2' : 'gap-3'} min-h-0 pr-1 pb-1 custom-scroll`}
            >
              {MODULES.map((mod) => {
                const isDone = progress.completedModules.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleOpenModule(mod.id)}
                    className={`group relative flex flex-col items-center justify-center ${mod.cardBg} ${mod.cardBorder} text-center shadow-md transition-transform duration-150 hover:-translate-y-1 active:translate-y-0.5 focus-visible:outline-4 focus-visible:outline-sky-500 ${
                      isPhone
                        ? 'min-h-[clamp(5.25rem,22dvh,7.25rem)] gap-1 rounded-2xl border-2 border-b-4 p-2'
                        : 'min-h-[clamp(7rem,23dvh,9rem)] gap-1.5 rounded-3xl border-4 border-b-8 p-3.5'
                    }`}
                  >
                    {/* Module Letter Code & Completed Mark */}
                    <div className="flex w-full items-center justify-between px-0.5">
                      <span
                        className={`flex ${
                          isPhone ? 'h-5 w-5 text-[11px] rounded-lg' : 'h-7 w-7 text-sm rounded-xl'
                        } shrink-0 items-center justify-center ${mod.badgeColor} font-display font-bold text-white shadow-sm`}
                      >
                        {mod.code}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 truncate px-1">
                        {mod.category} · 7 Tahap
                      </span>
                      {isDone ? (
                        <CheckCircle2 className={`${isPhone ? 'h-4 w-4' : 'h-6 w-6'} shrink-0 text-emerald-600 fill-emerald-100`} />
                      ) : (
                        <span className={`${isPhone ? 'h-4 w-4' : 'h-6 w-6'} shrink-0`} />
                      )}
                    </div>

                    <ModuleIllustration
                      name={MODULE_PREVIEW_ICON[mod.id]}
                      className={`${
                        isPhone ? 'h-9 w-9 sm:h-11 sm:w-11' : 'h-14 w-14 lg:h-16 lg:w-16'
                      } transition-transform duration-150 group-hover:scale-110`}
                    />

                    <h2
                      className={`font-display font-bold text-slate-900 leading-tight ${
                        isPhone ? 'text-sm' : 'text-lg lg:text-xl'
                      }`}
                    >
                      {mod.title}
                    </h2>
                    <p
                      className={`font-bold text-slate-600 line-clamp-2 leading-snug ${
                        isPhone ? 'text-[10px]' : 'text-xs'
                      }`}
                    >
                      {mod.shortDesc}
                    </p>
                  </button>
                );
              })}
            </section>
          </div>

          {/* Dedicated bottom safe area for HUB-only child-safe banner */}
          <ChildSafeAdBannerSlot />
        </div>
      )}

      {/* ACTIVE MODULE GAMEPLAY SHELL */}
      {screen === 'MODULE' && activeModuleMeta && (
        <div
          className={`relative z-20 flex w-full flex-col ${
            useLandscapeSplit
              ? 'h-[100dvh] overflow-hidden'
              : 'min-h-[100dvh] overflow-y-auto scroll-touch'
          } ${isPhone ? 'px-2 py-1.5 gap-1.5' : 'px-4 sm:px-6 py-3 gap-3'}`}
        >
          {/* Compact Game HUD */}
          <header
            className={`flex shrink-0 items-center justify-between gap-2 rounded-2xl sm:rounded-3xl border-2 border-sky-200 bg-[#FFFDF7]/95 shadow-sm ${
              isPhone ? 'px-2.5 py-1' : 'px-4 py-2'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBackToHub}
                className={`flex items-center gap-1 rounded-xl sm:rounded-2xl border-2 border-b-4 border-slate-300 bg-white font-display font-bold text-slate-800 hover:bg-slate-50 active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                  isPhone ? 'min-h-[36px] px-2.5 py-0.5 text-xs' : 'min-h-[44px] px-3.5 py-1 text-sm sm:text-base'
                }`}
              >
                <ArrowLeft className={isPhone ? 'h-4 w-4' : 'h-5 w-5'} />
                <span>Pintu Masuk</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span
                  className={`flex ${
                    isPhone ? 'h-6 w-6 text-xs rounded-lg' : 'h-8 w-8 text-base rounded-xl'
                  } shrink-0 items-center justify-center ${activeModuleMeta.badgeColor} font-display font-bold text-white`}
                >
                  {activeModuleMeta.code}
                </span>
                <h1
                  className={`font-display font-bold text-slate-900 truncate ${
                    isPhone ? 'text-sm' : 'text-lg lg:text-2xl'
                  }`}
                >
                  {activeModuleMeta.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Repeat Audio Button */}
              <button
                type="button"
                onClick={handleRepeatAudio}
                className={`flex items-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-b-4 border-amber-500 bg-amber-400 font-display font-bold text-amber-950 hover:bg-amber-300 active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                  isPhone ? 'min-h-[36px] px-2.5 py-0.5 text-xs' : 'min-h-[44px] px-3.5 py-1 text-sm sm:text-base'
                }`}
              >
                <Volume2 className={isPhone ? 'h-4 w-4' : 'h-5 w-5'} />
                <span className="hidden md:inline">Ulangi Suara</span>
              </button>

              {/* BGM Mute/Unmute */}
              <button
                type="button"
                onClick={toggleBgm}
                aria-label={bgmMuted ? 'Nyalakan Musik Latar' : 'Matikan Musik Latar'}
                className={`flex items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-colors shrink-0 ${
                  isPhone ? 'h-9 w-9' : 'h-11 w-11'
                } ${
                  bgmMuted
                    ? 'border-slate-300 bg-slate-100 text-slate-500'
                    : 'border-emerald-400 bg-emerald-100 text-emerald-700'
                }`}
              >
                {bgmMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>

              {/* Star Counter */}
              <div
                className={`flex items-center gap-1 rounded-xl sm:rounded-2xl border-2 border-amber-300 bg-amber-50 ${
                  isPhone ? 'min-h-[36px] px-2 py-0.5' : 'min-h-[44px] px-3.5 py-1'
                }`}
              >
                <Star className={`${isPhone ? 'h-4 w-4' : 'h-5 w-5'} fill-amber-400 text-amber-500`} />
                <span className="font-display text-sm sm:text-lg font-bold text-amber-900 tabular-nums">
                  {progress.stars}
                </span>
              </div>
            </div>
          </header>

          {/* Main Landscape Playfield */}
          <div
            className={`grid flex-1 ${
              useLandscapeSplit ? 'grid-cols-12' : 'grid-cols-1'
            } ${isPhone ? 'gap-2' : 'gap-4'} min-h-0`}
          >
            {/* Side Bottom-Left Bobi Companion (Proportional, never overlaps controls) */}
            {useLandscapeSplit && (
              <aside
                className={`col-span-3 flex flex-col items-center justify-end lg:justify-center gap-2 border-sky-200 bg-[#FFFDF7]/90 shadow-md min-h-0 overflow-y-auto scroll-touch ${
                  isPhone ? 'rounded-2xl border-2 p-2' : 'rounded-3xl border-4 p-4'
                }`}
              >
                <div className="my-auto flex items-end justify-center">
                  <BobiCharacter
                    mood={bobiMood}
                    costume={progress.selectedCostume}
                    speech={bobiSpeech}
                    size={isPhone ? 'sm' : 'md'}
                    jumpTick={jumpTick}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRepeatAudio}
                  className={`flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-sky-300 bg-sky-50 font-extrabold text-sky-800 hover:bg-sky-100 ${
                    isPhone ? 'min-h-[38px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 py-2 text-xs lg:text-sm'
                  }`}
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>Ulangi Soal</span>
                </button>
              </aside>
            )}

            {/* Module Interactive Stage */}
            <main
              className={`${
                useLandscapeSplit ? 'col-span-9 overflow-y-auto scroll-touch' : ''
              } flex flex-col min-h-0 pr-0.5 custom-scroll`}
            >
              {activeModule === 'warna' && (
                <QuizModuleView
                  key={`warna-${moduleSessionKey}`}
                  questions={WARNA_QUESTIONS}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'huruf' && (
                <QuizModuleView
                  key={`huruf-${moduleSessionKey}`}
                  questions={HURUF_QUESTIONS}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'angka' && (
                <QuizModuleView
                  key={`angka-${moduleSessionKey}`}
                  questions={ANGKA_QUESTIONS}
                  enableTapToCount
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'lagu' && (
                <LaguModuleView
                  key={`lagu-${moduleSessionKey}`}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'bumi' && (
                <BumiModuleView
                  key={`bumi-${moduleSessionKey}`}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'emosi' && (
                <QuizModuleView
                  key={`emosi-${moduleSessionKey}`}
                  questions={EMOSI_QUESTIONS}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'sains' && (
                <SainsModuleView
                  key={`sains-${moduleSessionKey}`}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}

              {activeModule === 'gerak' && (
                <GerakModuleView
                  key={`gerak-${moduleSessionKey}`}
                  onCorrectAnswer={handleCorrectAnswer}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                  onBobiJump={(tick) => {
                    setBobiMood('jumping');
                    setJumpTick(tick);
                    window.setTimeout(() => setBobiMood('idle'), 280);
                  }}
                />
              )}

              {activeModule === 'digital' && (
                <QuizModuleView
                  key={`digital-${moduleSessionKey}`}
                  questions={DIGITAL_QUESTIONS}
                  onCorrectAnswer={handleCorrectAnswer}
                  onGentleWrong={handleGentleWrong}
                  onRoundComplete={handleRoundComplete}
                  onPromptChange={handlePromptChange}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* ROUND SUMMARY / VICTORY MODAL */}
      {roundSummaryModule && activeModuleMeta && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-2 sm:p-4 backdrop-blur-sm">
          <div className="flex max-h-[92dvh] w-full max-w-lg flex-col items-center gap-3 sm:gap-4 rounded-[2rem] border-4 border-amber-300 bg-[#FFFDF7] p-4 sm:p-6 text-center shadow-2xl scroll-touch">
            <BobiCharacter
              mood="dancing"
              costume={progress.selectedCostume}
              size="sm"
              speech="Hore! Kamu hebat sekali hari ini!"
            />

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Modul {activeModuleMeta.title} Selesai!
            </h2>

            <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-5 sm:py-3">
              <ModuleIllustration
                name={MODULE_PREVIEW_ICON[roundSummaryModule]}
                className="h-11 w-11 sm:h-14 sm:w-14 shrink-0"
              />
              <div className="text-left">
                <p className="text-[11px] sm:text-xs font-extrabold text-amber-700">HADIAH STIKER BARU</p>
                <p className="font-display text-lg sm:text-xl font-bold text-slate-800">
                  {STICKERS.find((s) => s.id === activeModuleMeta.stickerId)?.name}
                </p>
              </div>
            </div>

            {newlyUnlockedCostumeName && (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-2 text-xs sm:text-sm font-extrabold text-emerald-800">
                Kostum Baru Terbuka di Lemari: {newlyUnlockedCostumeName}!
              </div>
            )}

            <div className="mt-1 sm:mt-2 flex w-full shrink-0 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRoundSummaryModule(null);
                  setNewlyUnlockedCostumeName(null);
                  setModuleSessionKey((k) => k + 1);
                }}
                className="min-h-[48px] flex-1 rounded-2xl border-2 border-b-4 border-sky-600 bg-sky-500 px-4 py-2.5 sm:py-3 font-display text-base sm:text-lg font-bold text-white hover:bg-sky-600 active:translate-y-0.5"
              >
                Main Lagi
              </button>
              <button
                type="button"
                onClick={handleFinishAndExitModule}
                className="min-h-[48px] flex-1 rounded-2xl border-2 border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2.5 sm:py-3 font-display text-base sm:text-lg font-bold text-white hover:bg-emerald-600 active:translate-y-0.5"
              >
                Pilih Modul Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEMARI KOSTUM MODAL */}
      {showWardrobe && (
        <WardrobeModal
          totalStars={progress.stars}
          selectedCostume={progress.selectedCostume}
          onSelectCostume={(id) =>
            setProgress((prev) => ({ ...prev, selectedCostume: id }))
          }
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {/* BUKU STIKER MODAL */}
      {showStickers && (
        <StickerBookModal
          unlockedStickerIds={progress.unlockedStickers}
          totalStars={progress.stars}
          onClose={() => setShowStickers(false)}
        />
      )}

      {/* WEB TEST_MODE INTERSTITIAL PREVIEW */}
      <TestInterstitialModal
        visible={showTestInterstitial}
        onClose={() => setShowTestInterstitial(false)}
      />
    </div>
  );
}
