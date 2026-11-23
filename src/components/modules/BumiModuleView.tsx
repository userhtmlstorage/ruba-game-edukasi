import React, { useEffect, useState } from 'react';
import { Lightbulb, Droplets, Leaf, Recycle, Tv } from 'lucide-react';
import { BUMI_QUESTIONS } from '../../data/gameData';
import { audioEngine, randomEncourage, randomPraise } from '../../utils/audioEngine';
import { ModuleIllustration } from '../ModuleIcons';
import { StageHeader } from './StageHeader';

interface BumiModuleViewProps {
  onCorrectAnswer: (feedbackText: string) => void;
  onGentleWrong: (feedbackText: string) => void;
  onRoundComplete: () => void;
  onPromptChange: (audioText: string, bubbleText: string) => void;
}

export const BumiModuleView: React.FC<BumiModuleViewProps> = ({
  onCorrectAnswer,
  onGentleWrong,
  onRoundComplete,
  onPromptChange,
}) => {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [triedBin, setTriedBin] = useState<string | null>(null);

  const current = BUMI_QUESTIONS[index];

  useEffect(() => {
    if (!current) return;
    setSolved(false);
    setTriedBin(null);
    const bubble =
      current.type === 'trash'
        ? `Masukkan ${current.itemName} ke tempat sampah yang tepat!`
        : current.promptText;
    onPromptChange(current.promptAudio, bubble);
    audioEngine.speak(current.promptAudio, { tone: 'cheerful' });
  }, [index, current, onPromptChange]);

  const advance = (successText: string) => {
    setSolved(true);
    audioEngine.playSuccess();
    const praise = `${randomPraise()} ${successText}`;
    audioEngine.speak(praise, { tone: 'excited' });
    onCorrectAnswer(successText);

    window.setTimeout(() => {
      if (index + 1 < BUMI_QUESTIONS.length) {
        setIndex((p) => p + 1);
      } else {
        onRoundComplete();
      }
    }, 2200);
  };

  const handleChooseBin = (bin: 'organik' | 'non_organik') => {
    if (solved || current.type !== 'trash') return;
    if (bin === current.correctBin) {
      advance(current.successAudio);
    } else {
      audioEngine.playEncourage();
      setTriedBin(bin);
      const msg = randomEncourage();
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
    }
  };

  const handleEcoAction = (isCorrectTarget: boolean) => {
    if (solved || current.type !== 'action') return;
    if (isCorrectTarget) {
      advance(current.successAudio);
    } else {
      audioEngine.playEncourage();
      const msg = 'Benda itu sudah bagus! Ayo cari yang perlu dimatikan!';
      audioEngine.speak(msg, { tone: 'gentle' });
      onGentleWrong(msg);
    }
  };

  if (!current) return null;

  return (
    <div className="flex h-full w-full flex-col justify-between gap-4">
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-4 border-emerald-200 bg-[#FFFDF7] p-5 shadow-md">
        <StageHeader
          currentStep={index}
          totalSteps={BUMI_QUESTIONS.length}
          difficulty={current.difficulty}
        />

        {current.type === 'trash' ? (
          <>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 text-center">
              Ayo Pilah Sampah: {current.itemName}
            </h2>
            <div
              className={`mt-4 flex flex-col items-center gap-2 rounded-3xl border-2 border-emerald-100 bg-emerald-50/70 px-8 py-4 transition-transform duration-300 ${
                solved ? 'scale-90 opacity-40' : 'animate-gentle-float'
              }`}
            >
              <ModuleIllustration name={current.illustration} className="h-28 w-28" />
              <span className="font-display text-xl font-bold text-slate-800">
                {current.itemName}
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-800 text-center max-w-xl text-balance">
              {current.promptText}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-6 w-full max-w-xl">
              {current.scene === 'faucet' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleEcoAction(true)}
                    disabled={solved}
                    className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 p-5 transition-transform active:translate-y-0.5 ${
                      solved
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-sky-400 bg-sky-50 hover:scale-105'
                    }`}
                  >
                    <Droplets className={`h-16 w-16 ${solved ? 'text-emerald-600' : 'text-sky-500 animate-bounce'}`} />
                    <span className="font-display text-xl font-bold text-slate-800">
                      {solved ? 'Kran Sudah Ditutup!' : 'Tutup Kran Air'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEcoAction(false)}
                    disabled={solved}
                    className="flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 border-emerald-200 bg-white p-5 hover:bg-emerald-50/50 active:translate-y-0.5"
                  >
                    <ModuleIllustration name="eco_tree" className="h-16 w-16" />
                    <span className="font-display text-xl font-bold text-slate-700">
                      Pohon Segar
                    </span>
                  </button>
                </>
              ) : current.scene === 'lamp' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleEcoAction(false)}
                    disabled={solved}
                    className="flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 border-amber-200 bg-white p-5 hover:bg-amber-50/50 active:translate-y-0.5"
                  >
                    <ModuleIllustration name="sunflower" className="h-16 w-16" />
                    <span className="font-display text-xl font-bold text-slate-700">
                      Bunga Matahari
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEcoAction(true)}
                    disabled={solved}
                    className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 p-5 transition-transform active:translate-y-0.5 ${
                      solved
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-amber-400 bg-amber-100 hover:scale-105'
                    }`}
                  >
                    <Lightbulb
                      className={`h-16 w-16 ${
                        solved ? 'text-slate-400' : 'text-amber-500 fill-amber-300'
                      }`}
                    />
                    <span className="font-display text-xl font-bold text-slate-800">
                      {solved ? 'Lampu Sudah Mati!' : 'Matikan Lampu Siang'}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleEcoAction(true)}
                    disabled={solved}
                    className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 p-5 transition-transform active:translate-y-0.5 ${
                      solved
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-indigo-400 bg-indigo-50 hover:scale-105'
                    }`}
                  >
                    <Tv
                      className={`h-16 w-16 ${
                        solved ? 'text-slate-400' : 'text-indigo-600'
                      }`}
                    />
                    <span className="font-display text-xl font-bold text-slate-800">
                      {solved ? 'Televisi Sudah Mati!' : 'Matikan Televisi'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEcoAction(false)}
                    disabled={solved}
                    className="flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-b-8 border-emerald-200 bg-white p-5 hover:bg-emerald-50/50 active:translate-y-0.5"
                  >
                    <ModuleIllustration name="drawing_art" className="h-16 w-16" />
                    <span className="font-display text-xl font-bold text-slate-700">
                      Buku Gambar
                    </span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Trash Bins when type === 'trash' */}
      {current.type === 'trash' && (
        <div className="grid grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => handleChooseBin('organik')}
            disabled={solved}
            className={`flex min-h-[120px] items-center justify-center gap-4 rounded-3xl border-4 border-b-8 px-6 py-4 transition-transform active:translate-y-0.5 ${
              solved && current.correctBin === 'organik'
                ? 'scale-[1.03] border-emerald-600 bg-emerald-100'
                : triedBin === 'organik'
                ? 'border-amber-200 bg-amber-50 opacity-65'
                : 'border-emerald-500 bg-emerald-500 text-white hover:-translate-y-1 shadow-md'
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 text-emerald-600">
              <Leaf className="h-10 w-10" />
            </div>
            <div className="text-left">
              <p
                className={`font-display text-2xl sm:text-3xl font-bold ${
                  solved && current.correctBin === 'organik'
                    ? 'text-emerald-900'
                    : triedBin === 'organik'
                    ? 'text-slate-700'
                    : 'text-white'
                }`}
              >
                ORGANIK
              </p>
              <p
                className={`text-sm font-bold ${
                  solved && current.correctBin === 'organik'
                    ? 'text-emerald-800'
                    : triedBin === 'organik'
                    ? 'text-slate-500'
                    : 'text-emerald-50'
                }`}
              >
                Sisa buah & daun alami
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChooseBin('non_organik')}
            disabled={solved}
            className={`flex min-h-[120px] items-center justify-center gap-4 rounded-3xl border-4 border-b-8 px-6 py-4 transition-transform active:translate-y-0.5 ${
              solved && current.correctBin === 'non_organik'
                ? 'scale-[1.03] border-emerald-600 bg-sky-100'
                : triedBin === 'non_organik'
                ? 'border-amber-200 bg-amber-50 opacity-65'
                : 'border-sky-600 bg-sky-500 text-white hover:-translate-y-1 shadow-md'
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 text-sky-600">
              <Recycle className="h-10 w-10" />
            </div>
            <div className="text-left">
              <p
                className={`font-display text-2xl sm:text-3xl font-bold ${
                  solved && current.correctBin === 'non_organik'
                    ? 'text-sky-900'
                    : triedBin === 'non_organik'
                    ? 'text-slate-700'
                    : 'text-white'
                }`}
              >
                NON-ORGANIK
              </p>
              <p
                className={`text-sm font-bold ${
                  solved && current.correctBin === 'non_organik'
                    ? 'text-sky-800'
                    : triedBin === 'non_organik'
                    ? 'text-slate-500'
                    : 'text-sky-50'
                }`}
              >
                Plastik, kaleng & kertas
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
