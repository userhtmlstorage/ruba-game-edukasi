import React, { useEffect, useState } from 'react';
import { QuizOption, QuizQuestion } from '../../types';
import { audioEngine, randomEncourage, randomPraise } from '../../utils/audioEngine';
import { ModuleIllustration } from '../ModuleIcons';
import { StageHeader } from './StageHeader';

interface QuizModuleViewProps {
  questions: QuizQuestion[];
  onCorrectAnswer: (feedbackText: string) => void;
  onGentleWrong: (feedbackText: string) => void;
  onRoundComplete: () => void;
  onPromptChange: (audioText: string, bubbleText: string) => void;
  enableTapToCount?: boolean;
}

export const QuizModuleView: React.FC<QuizModuleViewProps> = ({
  questions,
  onCorrectAnswer,
  onGentleWrong,
  onRoundComplete,
  onPromptChange,
  enableTapToCount = false,
}) => {
  const [index, setIndex] = useState(0);
  const [triedWrongIds, setTriedWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [tappedCounts, setTappedCounts] = useState<number[]>([]);

  const current = questions[index];

  useEffect(() => {
    if (!current) return;
    setTriedWrongIds([]);
    setSolved(false);
    setTappedCounts([]);
    onPromptChange(current.promptAudio, current.promptText);
    audioEngine.speak(current.promptAudio, { tone: 'cheerful' });
  }, [index, current, questions, onPromptChange]);

  const handleSelect = (opt: QuizOption) => {
    if (solved) return;
    audioEngine.unlock();
    audioEngine.playPop();

    if (opt.isCorrect) {
      setSolved(true);
      audioEngine.playSuccess();
      const praise = `${randomPraise()} ${current.successAudio}`;
      audioEngine.speak(praise, { tone: 'excited' });
      onCorrectAnswer(current.successAudio);

      window.setTimeout(() => {
        if (index + 1 < questions.length) {
          setIndex((prev) => prev + 1);
        } else {
          onRoundComplete();
        }
      }, 2100);
    } else {
      audioEngine.playEncourage();
      setWobbleId(opt.id);
      if (!triedWrongIds.includes(opt.id)) {
        setTriedWrongIds((prev) => [...prev, opt.id]);
      }
      const msg = randomEncourage();
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
      window.setTimeout(() => setWobbleId(null), 400);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        const opt = current?.options[Number(e.key) - 1];
        if (opt) handleSelect(opt);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleTapCountItem = (idx: number) => {
    if (!enableTapToCount) return;
    audioEngine.unlock();
    setTappedCounts((prev) => {
      if (prev.includes(idx)) {
        audioEngine.playPop(prev.length * 35);
        return prev;
      }
      const next = [...prev, idx];
      audioEngine.playPop(next.length * 45);
      const indoNumbers = [
        '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
        'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh',
      ];
      const word = indoNumbers[next.length] || String(next.length);
      audioEngine.speak(word, { tone: 'cheerful', rate: 1.02 });
      return next;
    });
  };

  if (!current) return null;

  const gridColsClass =
    current.options.length === 2
      ? 'grid-cols-2'
      : current.options.length === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-3';

  return (
    <div className="flex min-h-full w-full flex-col justify-between gap-2 sm:gap-4">
      {/* Progress & Question Stage */}
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl md:rounded-3xl border-2 md:border-4 border-amber-200 bg-[#FFFDF7] px-3 py-2 sm:px-6 sm:py-4 shadow-md">
        <StageHeader
          currentStep={index}
          totalSteps={questions.length}
          difficulty={current.difficulty}
        />

        <h2 className="font-display text-center text-[clamp(1.1rem,2.6vw,1.875rem)] font-bold text-slate-800 text-balance leading-snug">
          {current.promptText}
        </h2>

        {/* Visual Showcase */}
        <div className="mt-2 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {current.visualCount && current.visualIllustration ? (
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 rounded-2xl bg-sky-50 px-3 py-2 sm:px-5 sm:py-3 border-2 border-sky-200">
                {Array.from({ length: current.visualCount }).map((_, i) => {
                  const isCounted = tappedCounts.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleTapCountItem(i)}
                      className={`relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl transition-transform duration-150 focus-visible:outline-4 focus-visible:outline-sky-500 ${
                        isCounted
                          ? 'scale-105 bg-amber-100 ring-4 ring-amber-400'
                          : 'bg-white hover:scale-105 active:scale-95 shadow-sm'
                      }`}
                      aria-label={`Hitung benda ke-${i + 1}`}
                    >
                      <ModuleIllustration
                        name={current.visualIllustration!}
                        className="h-8 w-8 sm:h-11 sm:w-11"
                      />
                      {isCounted && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] sm:text-xs font-black text-white shadow">
                          {tappedCounts.indexOf(i) + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {enableTapToCount && (
                <span className="text-[11px] sm:text-sm font-bold text-sky-700 text-center">
                  Ketuk gambar satu per satu untuk menghitung bersama!
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {current.visualSymbol && (
                <div className="flex h-[clamp(4.25rem,17dvh,7rem)] w-[clamp(4.25rem,17dvh,7rem)] items-center justify-center rounded-3xl border-4 border-amber-300 bg-amber-100 font-display text-[clamp(2.25rem,8dvh,3.75rem)] font-bold text-amber-900 shadow-sm">
                  {current.visualSymbol}
                </div>
              )}
              {current.visualIllustration && (
                <div className="flex flex-col items-center gap-1 rounded-3xl border-2 border-sky-100 bg-sky-50/70 px-4 py-2 sm:px-6 sm:py-3">
                  <ModuleIllustration
                    name={current.visualIllustration}
                    className="h-[clamp(3.75rem,17dvh,7rem)] w-[clamp(3.75rem,17dvh,7rem)]"
                  />
                  {current.visualLabel && (
                    <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                      {current.visualLabel}
                    </span>
                  )}
                </div>
              )}
              {current.visualColorHex && !current.visualIllustration && (
                <div className="flex items-center gap-3 sm:gap-4 rounded-3xl border-2 border-slate-200 bg-white px-4 py-2 sm:px-6 sm:py-3 shadow-sm">
                  <div
                    className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl border-4 border-white shadow-md ring-2 ring-slate-300"
                    style={{ backgroundColor: current.visualColorHex }}
                  />
                  {current.visualLabel && (
                    <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                      {current.visualLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Large Child-Friendly Answer Cards */}
      <div className={`grid shrink-0 ${gridColsClass} gap-2 sm:gap-3.5`}>
        {current.options.map((opt, idx) => {
          const isTriedWrong = triedWrongIds.includes(opt.id);
          const isSolvedCorrect = solved && opt.isCorrect;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={solved}
              className={`group relative flex min-h-[clamp(3.6rem,17dvh,7.75rem)] flex-col items-center justify-center gap-1 sm:gap-2 rounded-2xl md:rounded-3xl border-2 md:border-4 border-b-4 md:border-b-8 px-2 py-2 sm:px-3 sm:py-3 transition-transform duration-150 focus-visible:outline-4 focus-visible:outline-sky-500 ${
                wobbleId === opt.id ? 'animate-bobi-wobble' : ''
              } ${
                isSolvedCorrect
                  ? 'scale-[1.03] border-emerald-500 bg-emerald-50 shadow-lg'
                  : isTriedWrong
                  ? 'border-amber-200 bg-amber-50/60 opacity-65'
                  : 'border-sky-300 bg-white hover:-translate-y-1 hover:border-sky-400 active:translate-y-0.5 shadow-md'
              }`}
            >
              <span className="absolute left-2.5 top-1.5 sm:left-3 sm:top-2.5 text-[11px] sm:text-xs font-extrabold text-slate-400 tabular-nums">
                {idx + 1}
              </span>

              {opt.colorHex && (
                <div
                  className="h-10 w-16 sm:h-14 sm:w-24 rounded-xl sm:rounded-2xl border-4 border-white shadow ring-2 ring-slate-200"
                  style={{ backgroundColor: opt.colorHex }}
                />
              )}

              {opt.illustration && (
                <ModuleIllustration
                  name={opt.illustration}
                  className="h-10 w-10 sm:h-16 sm:w-16 transition-transform group-hover:scale-105"
                />
              )}

              {opt.bigSymbol && (
                <span className="font-display text-[clamp(2rem,8dvh,3.75rem)] font-bold text-slate-800 leading-none">
                  {opt.bigSymbol}
                </span>
              )}

              {!opt.bigSymbol && (
                <span className="font-display text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-slate-800 leading-tight text-center">
                  {opt.label}
                </span>
              )}

              {isSolvedCorrect && (
                <span className="text-[11px] sm:text-sm font-black text-emerald-700">
                  Benar! +1 Bintang
                </span>
              )}
              {isTriedWrong && !solved && (
                <span className="text-[11px] sm:text-xs font-bold text-amber-700">
                  Yuk pilih yang lain!
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
