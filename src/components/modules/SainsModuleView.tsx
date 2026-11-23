import React, { useEffect, useState } from 'react';
import { ArrowDown, Waves, Plus, Equal } from 'lucide-react';
import { SAINS_QUESTIONS } from '../../data/gameData';
import { audioEngine, randomEncourage, randomPraise } from '../../utils/audioEngine';
import { ModuleIllustration } from '../ModuleIcons';
import { StageHeader } from './StageHeader';

interface SainsModuleViewProps {
  onCorrectAnswer: (feedbackText: string) => void;
  onGentleWrong: (feedbackText: string) => void;
  onRoundComplete: () => void;
  onPromptChange: (audioText: string, bubbleText: string) => void;
}

export const SainsModuleView: React.FC<SainsModuleViewProps> = ({
  onCorrectAnswer,
  onGentleWrong,
  onRoundComplete,
  onPromptChange,
}) => {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [triedWrong, setTriedWrong] = useState<string[]>([]);

  const current = SAINS_QUESTIONS[index];

  useEffect(() => {
    if (!current) return;
    setSolved(false);
    setTriedWrong([]);
    onPromptChange(current.promptAudio, current.promptText);
    audioEngine.speak(current.promptAudio, { tone: 'cheerful' });
  }, [index, current, onPromptChange]);

  const finishSuccess = (successAudio: string, isSplash: boolean) => {
    setSolved(true);
    if (isSplash) {
      audioEngine.playSplash();
    } else {
      audioEngine.playMagic();
    }
    window.setTimeout(() => audioEngine.playSuccess(), 240);
    const praise = `${randomPraise()} ${successAudio}`;
    audioEngine.speak(praise, { tone: 'excited' });
    onCorrectAnswer(successAudio);

    window.setTimeout(() => {
      if (index + 1 < SAINS_QUESTIONS.length) {
        setIndex((p) => p + 1);
      } else {
        onRoundComplete();
      }
    }, 2400);
  };

  const handleSinkFloatChoice = (choice: 'terapung' | 'tenggelam') => {
    if (solved || current.type !== 'sink_float') return;
    if (choice === current.answer) {
      finishSuccess(current.successAudio, true);
    } else {
      audioEngine.playEncourage();
      if (!triedWrong.includes(choice)) setTriedWrong((p) => [...p, choice]);
      const msg = randomEncourage();
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
    }
  };

  const handleColorMixChoice = (name: string, isCorrect: boolean) => {
    if (solved || current.type !== 'color_mix') return;
    if (isCorrect) {
      finishSuccess(current.successAudio, false);
    } else {
      audioEngine.playEncourage();
      if (!triedWrong.includes(name)) setTriedWrong((p) => [...p, name]);
      const msg = randomEncourage();
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
    }
  };

  if (!current) return null;

  return (
    <div className="flex h-full w-full flex-col justify-between gap-4">
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-4 border-cyan-200 bg-[#FFFDF7] p-5 shadow-md">
        <StageHeader
          currentStep={index}
          totalSteps={SAINS_QUESTIONS.length}
          difficulty={current.difficulty}
        />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 text-center text-balance">
          {current.promptText}
        </h2>

        {current.type === 'sink_float' ? (
          /* Virtual Water Tank */
          <div className="relative mt-4 flex h-44 w-full max-w-lg flex-col items-center justify-end overflow-hidden rounded-3xl border-4 border-cyan-300 bg-sky-50 shadow-inner">
            <div
              className="z-10 transition-transform duration-700 ease-out"
              style={{
                transform: solved
                  ? current.answer === 'terapung'
                    ? 'translateY(-62px)'
                    : 'translateY(14px)'
                  : 'translateY(-110px)',
              }}
            >
              <ModuleIllustration name={current.illustration} className="h-20 w-20" />
            </div>

            <div className="relative h-24 w-full bg-gradient-to-b from-cyan-400/80 to-blue-500/85 border-t-4 border-cyan-200">
              {solved && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-black text-cyan-800 bg-white/90 px-3 py-0.5 rounded-full shadow">
                  {current.answer === 'terapung' ? 'Mengapung di atas air!' : 'Tenggelam ke dasar!'}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Color Mixing Magic Beakers */
          <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl border-4 border-white shadow-md ring-2 ring-slate-300"
                style={{ backgroundColor: current.colorA.hex }}
              />
              <span className="font-display text-lg font-bold text-slate-700">
                {current.colorA.name}
              </span>
            </div>

            <Plus className="h-8 w-8 text-slate-400" strokeWidth={3} />

            <div className="flex flex-col items-center gap-1.5">
              <div
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl border-4 border-white shadow-md ring-2 ring-slate-300"
                style={{ backgroundColor: current.colorB.hex }}
              />
              <span className="font-display text-lg font-bold text-slate-700">
                {current.colorB.name}
              </span>
            </div>

            <Equal className="h-8 w-8 text-slate-400" strokeWidth={3} />

            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-white shadow-lg ring-4 transition-transform duration-300 ${
                  solved ? 'scale-110 ring-emerald-400' : 'ring-cyan-200 bg-slate-100'
                }`}
                style={solved ? { backgroundColor: current.result.hex } : undefined}
              >
                {!solved && (
                  <span className="font-display text-4xl font-bold text-slate-400">?</span>
                )}
              </div>
              <span className="font-display text-lg font-bold text-slate-800">
                {solved ? current.result.name : 'Hasil Campuran'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {current.type === 'sink_float' ? (
        <div className="grid grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => handleSinkFloatChoice('terapung')}
            disabled={solved}
            className={`flex min-h-[112px] items-center justify-center gap-3 rounded-3xl border-4 border-b-8 px-6 py-4 transition-transform active:translate-y-0.5 ${
              solved && current.answer === 'terapung'
                ? 'scale-[1.03] border-emerald-500 bg-emerald-50'
                : triedWrong.includes('terapung')
                ? 'border-amber-200 bg-amber-50 opacity-65'
                : 'border-cyan-400 bg-white hover:-translate-y-1 shadow-md'
            }`}
          >
            <Waves className="h-10 w-10 text-cyan-500" />
            <span className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
              Terapung
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSinkFloatChoice('tenggelam')}
            disabled={solved}
            className={`flex min-h-[112px] items-center justify-center gap-3 rounded-3xl border-4 border-b-8 px-6 py-4 transition-transform active:translate-y-0.5 ${
              solved && current.answer === 'tenggelam'
                ? 'scale-[1.03] border-emerald-500 bg-emerald-50'
                : triedWrong.includes('tenggelam')
                ? 'border-amber-200 bg-amber-50 opacity-65'
                : 'border-blue-400 bg-white hover:-translate-y-1 shadow-md'
            }`}
          >
            <ArrowDown className="h-10 w-10 text-blue-600" />
            <span className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
              Tenggelam
            </span>
          </button>
        </div>
      ) : (
        <div
          className={`grid ${
            current.options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
          } gap-4`}
        >
          {current.options.map((opt) => {
            const isSolvedHere = solved && opt.isCorrect;
            const isWrong = triedWrong.includes(opt.name);
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleColorMixChoice(opt.name, opt.isCorrect)}
                disabled={solved}
                className={`flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 p-3 transition-transform active:translate-y-0.5 ${
                  isSolvedHere
                    ? 'scale-105 border-emerald-500 bg-emerald-50 shadow-lg'
                    : isWrong
                    ? 'border-amber-200 bg-amber-50 opacity-60'
                    : 'border-cyan-300 bg-white hover:-translate-y-1 shadow-md'
                }`}
              >
                <div
                  className="h-12 w-20 rounded-2xl border-4 border-white shadow ring-2 ring-slate-200"
                  style={{ backgroundColor: opt.hex }}
                />
                <span className="font-display text-xl sm:text-2xl font-bold text-slate-800">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
