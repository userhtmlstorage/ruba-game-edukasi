import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Hand, ArrowUpCircle } from 'lucide-react';
import { GERAK_CHALLENGES } from '../../data/gameData';
import { audioEngine, randomPraise } from '../../utils/audioEngine';
import { StageHeader } from './StageHeader';

interface GerakModuleViewProps {
  onCorrectAnswer: (feedbackText: string) => void;
  onRoundComplete: () => void;
  onPromptChange: (audioText: string, bubbleText: string) => void;
  onBobiJump: (tick: number) => void;
}

const INDO_COUNT = [
  '',
  'Satu!',
  'Dua!',
  'Tiga!',
  'Empat!',
  'Lima!',
  'Enam!',
  'Tujuh!',
  'Delapan!',
  'Sembilan!',
  'Sepuluh!',
];

export const GerakModuleView: React.FC<GerakModuleViewProps> = ({
  onCorrectAnswer,
  onRoundComplete,
  onPromptChange,
  onBobiJump,
}) => {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [solved, setSolved] = useState(false);

  const current = GERAK_CHALLENGES[index];

  useEffect(() => {
    if (!current) return;
    setCount(0);
    setSolved(false);
    onPromptChange(current.promptAudio, current.promptText);
    audioEngine.speak(current.promptAudio, { tone: 'cheerful' });
  }, [index, current, onPromptChange]);

  const triggerMove = useCallback(() => {
    if (!current || solved) return;

    const nextCount = count + 1;
    setCount(nextCount);
    onBobiJump(nextCount);
    audioEngine.playJump();

    const word = INDO_COUNT[nextCount] || String(nextCount);
    if (nextCount < current.targetCount) {
      audioEngine.speak(word, { tone: 'excited', rate: 1.05 });
    } else {
      setSolved(true);
      window.setTimeout(() => {
        audioEngine.playSuccess();
        const praise = `${randomPraise()} ${current.successAudio}`;
        audioEngine.speak(praise, { tone: 'excited' });
        onCorrectAnswer(current.successAudio);
      }, 220);

      window.setTimeout(() => {
        if (index + 1 < GERAK_CHALLENGES.length) {
          setIndex((p) => p + 1);
        } else {
          onRoundComplete();
        }
      }, 2400);
    }
  }, [count, current, index, onBobiJump, onCorrectAnswer, onRoundComplete, solved]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        triggerMove();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerMove]);

  if (!current) return null;

  return (
    <div className="flex h-full w-full flex-col justify-between gap-4">
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-4 border-lime-300 bg-[#FFFDF7] p-5 shadow-md">
        <StageHeader
          currentStep={index}
          totalSteps={GERAK_CHALLENGES.length}
          difficulty={current.difficulty}
        />

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 text-center text-balance">
          {current.promptText}
        </h2>

        {/* Big Visual Target Counter */}
        <div className="mt-5 flex items-center gap-6">
          <div className="flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-3xl border-4 border-amber-300 bg-amber-100 shadow-inner">
            <span className="text-xs font-extrabold text-amber-800">TARGET</span>
            <span className="font-display text-6xl font-bold text-amber-900 tabular-nums">
              {current.targetCount}
            </span>
          </div>

          {/* Progress Dots */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
            {Array.from({ length: current.targetCount }).map((_, i) => {
              const done = i < count;
              return (
                <div
                  key={i}
                  className={`flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border-4 font-display text-2xl font-bold transition-transform duration-150 ${
                    done
                      ? 'scale-110 border-emerald-500 bg-emerald-400 text-white shadow-md'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Giant Bouncy Action Pad */}
      <button
        type="button"
        onClick={triggerMove}
        disabled={solved}
        className={`flex min-h-[124px] w-full items-center justify-center gap-4 rounded-3xl border-4 border-b-8 px-8 py-5 font-display text-3xl sm:text-4xl font-bold text-white shadow-lg transition-transform active:translate-y-1 ${
          solved
            ? 'border-emerald-600 bg-emerald-500'
            : 'border-lime-700 bg-lime-500 hover:bg-lime-600'
        }`}
      >
        {current.actionType === 'tepuk' ? (
          <Hand className="h-11 w-11" />
        ) : current.actionType === 'lompat' ? (
          <ArrowUpCircle className="h-11 w-11" />
        ) : (
          <Sparkles className="h-11 w-11" />
        )}
        <span>
          {solved
            ? 'Selesai! Hebat Sekali!'
            : `KETUK UNTUK ${current.actionLabel}! (${count}/${current.targetCount})`}
        </span>
      </button>
    </div>
  );
};
