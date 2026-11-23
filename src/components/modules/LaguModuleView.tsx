import React, { useEffect, useMemo, useState } from 'react';
import { Music, Pause, Play, Sparkles } from 'lucide-react';
import { KIDS_SONGS } from '../../data/gameData';
import { KidsSong } from '../../types';
import { audioEngine, randomEncourage, randomPraise } from '../../utils/audioEngine';
import { ModuleIllustration } from '../ModuleIcons';
import { StageHeader } from './StageHeader';

interface LaguModuleViewProps {
  onCorrectAnswer: (feedbackText: string) => void;
  onGentleWrong: (feedbackText: string) => void;
  onRoundComplete: () => void;
  onPromptChange: (audioText: string, bubbleText: string) => void;
}

export const LaguModuleView: React.FC<LaguModuleViewProps> = ({
  onCorrectAnswer,
  onGentleWrong,
  onRoundComplete,
  onPromptChange,
}) => {
  const [tab, setTab] = useState<'player' | 'quiz'>('player');
  const [selectedSong, setSelectedSong] = useState<KidsSong>(KIDS_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  // Quiz state: 7 stages matching the 7 classic songs with gradual difficulty
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSolved, setQuizSolved] = useState(false);
  const [triedWrong, setTriedWrong] = useState<string[]>([]);
  const targetSong = KIDS_SONGS[quizIndex];

  // Gradual difficulty: Mudah (2 choices, 6.5s), Sedang (3 choices, 5.5s), Tantangan (4 choices, 4.5s)
  const quizChoices = useMemo(() => {
    const choiceCount =
      targetSong.difficulty === 'Mudah' ? 2 : targetSong.difficulty === 'Sedang' ? 3 : 4;
    const others = KIDS_SONGS.filter((s) => s.id !== targetSong.id);
    // Deterministic slice rotated by quizIndex for consistent variety
    const pickedOthers: KidsSong[] = [];
    for (let i = 0; i < choiceCount - 1; i++) {
      pickedOthers.push(others[(quizIndex + i) % others.length]);
    }
    const combined = [targetSong, ...pickedOthers];
    // Deterministic shuffle based on quizIndex
    return combined.sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + quizIndex * 7) % 19;
      const hb = (b.id.charCodeAt(0) + quizIndex * 7) % 19;
      return ha - hb;
    });
  }, [quizIndex, targetSong]);

  const snippetDuration =
    targetSong.difficulty === 'Mudah' ? 6.5 : targetSong.difficulty === 'Sedang' ? 5.5 : 4.5;

  useEffect(() => {
    if (tab === 'player') {
      const msg = `Ayo dengarkan dan nyanyikan lagu ${selectedSong.title}!`;
      onPromptChange(msg, msg);
      audioEngine.speak(msg, { tone: 'cheerful' });
    } else {
      const msg = targetSong.quizPrompt;
      onPromptChange(msg, 'Dengarkan melodinya, lalu tebak judul lagunya!');
      audioEngine.speak(msg, { tone: 'cheerful' });
    }
    return () => {
      audioEngine.stopSong();
      setIsPlaying(false);
    };
  }, [tab, selectedSong.id, quizIndex, onPromptChange, selectedSong.title, targetSong.quizPrompt]);

  const togglePlaySong = (song: KidsSong, snippetOnly = false) => {
    audioEngine.unlock();
    audioEngine.stopSpeech();
    if (isPlaying) {
      audioEngine.stopSong();
      setIsPlaying(false);
      return;
    }

    const wasMuted = audioEngine.isMuted();
    if (!wasMuted) audioEngine.setMuted(true);

    setIsPlaying(true);
    setElapsedSec(0);
    audioEngine.playSongNotes(
      song.notes,
      (sec) => setElapsedSec(sec),
      () => {
        setIsPlaying(false);
        setElapsedSec(0);
        if (!wasMuted) audioEngine.setMuted(false);
      },
      snippetOnly ? snippetDuration : undefined
    );
  };

  const handleSelectSong = (song: KidsSong) => {
    audioEngine.stopSong();
    setIsPlaying(false);
    setElapsedSec(0);
    setSelectedSong(song);
    audioEngine.playTap();
  };

  const handleGuessSong = (guess: KidsSong) => {
    if (quizSolved) return;
    if (guess.id === targetSong.id) {
      audioEngine.stopSong();
      setIsPlaying(false);
      setQuizSolved(true);
      audioEngine.playSuccess();
      const praise = `${randomPraise()} Benar sekali, itu lagu ${targetSong.title}!`;
      audioEngine.speak(praise, { tone: 'excited' });
      onCorrectAnswer(`Hebat! Itu lagu ${targetSong.title}!`);

      window.setTimeout(() => {
        setQuizSolved(false);
        setTriedWrong([]);
        if (quizIndex + 1 < KIDS_SONGS.length) {
          setQuizIndex((p) => p + 1);
        } else {
          onRoundComplete();
        }
      }, 2100);
    } else {
      audioEngine.playEncourage();
      if (!triedWrong.includes(guess.id)) {
        setTriedWrong((p) => [...p, guess.id]);
      }
      const msg = randomEncourage();
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
    }
  };

  const quizGridClass =
    quizChoices.length === 2
      ? 'grid-cols-2'
      : quizChoices.length === 3
      ? 'grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="flex min-h-full w-full flex-col gap-2.5 sm:gap-3 min-h-0">
      {/* Mode Switcher */}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            audioEngine.stopSong();
            setIsPlaying(false);
            setTab('player');
          }}
          className={`flex min-h-[44px] items-center gap-2 rounded-2xl border-2 px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-base font-extrabold transition-transform active:scale-95 ${
            tab === 'player'
              ? 'border-violet-500 bg-violet-600 text-white shadow-md'
              : 'border-violet-200 bg-white text-violet-800 hover:bg-violet-50'
          }`}
        >
          <Music className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Putar & Nyanyi (7 Lagu)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audioEngine.stopSong();
            setIsPlaying(false);
            setQuizIndex(0);
            setQuizSolved(false);
            setTriedWrong([]);
            setTab('quiz');
          }}
          className={`flex min-h-[44px] items-center gap-2 rounded-2xl border-2 px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-base font-extrabold transition-transform active:scale-95 ${
            tab === 'quiz'
              ? 'border-amber-500 bg-amber-500 text-white shadow-md'
              : 'border-amber-200 bg-white text-amber-800 hover:bg-amber-50'
          }`}
        >
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Kuis Tebak Lagu (7 Tahap)</span>
        </button>
      </div>

      {tab === 'player' ? (
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 min-h-0">
          {/* 7-Song Selector List */}
          <div className="md:col-span-4 flex flex-col gap-1.5 sm:gap-2 rounded-3xl border-4 border-violet-200 bg-[#FFFDF7] p-2.5 sm:p-3 shadow-md min-h-0 max-h-[150px] md:max-h-none">
            <p className="px-2 text-xs sm:text-sm font-extrabold text-violet-800 shrink-0">
              Pilih Lagu Favoritmu (1–7):
            </p>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 sm:gap-2 scroll-touch pr-1 custom-scroll">
              {KIDS_SONGS.map((song, idx) => {
                const active = song.id === selectedSong.id;
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => handleSelectSong(song)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-2xl border-2 p-1.5 sm:p-2 text-left transition-transform active:scale-95 ${
                      active
                        ? 'border-violet-500 bg-violet-100 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <ModuleIllustration name={song.illustration} className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-display text-xs sm:text-base font-bold text-slate-800 leading-tight truncate">
                        {idx + 1}. {song.title}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-violet-600">
                        {song.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Karaoke Lyrics Stage */}
          <div className="md:col-span-8 flex flex-col justify-between rounded-3xl border-4 border-violet-200 bg-[#FFFDF7] p-3 sm:p-5 shadow-md min-h-0">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <ModuleIllustration name={selectedSong.illustration} className="h-10 w-10 sm:h-14 sm:w-14 shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-3xl font-bold text-slate-800 truncate">
                    {selectedSong.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-violet-700 truncate">
                    Ikuti lirik yang menyala sesuai nada!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => togglePlaySong(selectedSong, false)}
                className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-2xl border-b-4 px-4 py-2 sm:px-6 sm:py-3 font-display text-sm sm:text-lg font-bold text-white shadow-md transition-transform active:translate-y-0.5 ${
                  isPlaying
                    ? 'border-rose-700 bg-rose-500 hover:bg-rose-600'
                    : 'border-emerald-700 bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
                <span>{isPlaying ? 'Berhenti' : 'Mainkan Lagu'}</span>
              </button>
            </div>

            <div className="my-2 sm:my-3 flex flex-1 min-h-0 flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-violet-50/70 p-3 sm:p-4 border-2 border-violet-100 scroll-touch">
              {selectedSong.lyrics.map((line, i) => {
                const isActive =
                  isPlaying && elapsedSec >= line.startSec && elapsedSec < line.endSec;
                const isPast = isPlaying && elapsedSec >= line.endSec;
                return (
                  <p
                    key={i}
                    className={`font-display text-center transition-transform duration-200 ${
                      isActive
                        ? 'scale-105 sm:scale-110 text-lg sm:text-3xl font-bold text-violet-700 bg-amber-200/80 px-3 py-0.5 sm:px-4 sm:py-1 rounded-xl shadow-sm'
                        : isPast
                        ? 'text-sm sm:text-xl font-semibold text-violet-400'
                        : 'text-sm sm:text-xl font-bold text-slate-700'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Kuis Tebak Judul Lagu - 7 Tahap Bertingkat */
        <div className="flex flex-1 flex-col justify-between gap-2.5 sm:gap-4">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:gap-3 rounded-3xl border-4 border-amber-200 bg-[#FFFDF7] p-3 sm:p-5 shadow-md">
            <StageHeader
              currentStep={quizIndex}
              totalSteps={KIDS_SONGS.length}
              difficulty={targetSong.difficulty}
            />
            <h2 className="font-display text-[clamp(1.1rem,2.6vw,1.875rem)] font-bold text-slate-800 text-center leading-snug">
              Tebak Judul Lagu Apa Ini?
            </h2>

            <button
              type="button"
              onClick={() => togglePlaySong(targetSong, true)}
              className="flex min-h-[48px] items-center gap-2.5 sm:gap-3 rounded-3xl border-4 border-b-8 border-violet-600 bg-violet-500 px-5 py-2.5 sm:px-8 sm:py-4 font-display text-base sm:text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:translate-y-0.5"
            >
              {isPlaying ? <Pause className="h-6 w-6 sm:h-7 sm:w-7" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7" />}
              <span>{isPlaying ? 'Sedang Memutar Nada...' : 'Dengarkan Melodi Lagu'}</span>
            </button>
          </div>

          <div className={`grid shrink-0 ${quizGridClass} gap-2 sm:gap-3`}>
            {quizChoices.map((song) => {
              const isSolvedHere = quizSolved && song.id === targetSong.id;
              const isWrong = triedWrong.includes(song.id);
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => handleGuessSong(song)}
                  disabled={quizSolved}
                  className={`flex min-h-[76px] sm:min-h-[104px] flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl border-4 border-b-8 p-2 sm:p-3 transition-transform active:translate-y-0.5 ${
                    isSolvedHere
                      ? 'scale-105 border-emerald-500 bg-emerald-50 shadow-lg'
                      : isWrong
                      ? 'border-amber-200 bg-amber-50/60 opacity-60'
                      : 'border-sky-300 bg-white hover:-translate-y-1 shadow-md'
                  }`}
                >
                  <ModuleIllustration name={song.illustration} className="h-10 w-10 sm:h-16 sm:w-16" />
                  <span className="font-display text-xs sm:text-lg font-bold text-slate-800 text-center leading-tight">
                    {song.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
