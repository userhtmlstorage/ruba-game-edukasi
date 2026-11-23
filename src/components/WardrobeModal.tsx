import React from 'react';
import { X, Lock, Check, Star } from 'lucide-react';
import { COSTUMES } from '../data/gameData';
import { CostumeId } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { BobiCharacter } from './BobiCharacter';

interface WardrobeModalProps {
  totalStars: number;
  selectedCostume: CostumeId;
  onSelectCostume: (id: CostumeId) => void;
  onClose: () => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  totalStars,
  selectedCostume,
  onSelectCostume,
  onClose,
}) => {
  const currentCostume = COSTUMES.find((c) => c.id === selectedCostume) || COSTUMES[0];

  const handlePick = (id: CostumeId, unlocked: boolean, name: string, needed: number) => {
    if (unlocked) {
      audioEngine.playMagic();
      audioEngine.speak(`Wah keren! Bobi memakai ${name}!`, { tone: 'excited' });
      onSelectCostume(id);
    } else {
      audioEngine.playEncourage();
      audioEngine.speak(
        `Ayo kumpulkan ${needed} bintang dulu untuk membuka ${name}!`,
        { tone: 'gentle' }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] max-h-[640px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-amber-300 bg-[#FFFDF7] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 bg-amber-100/80 px-6 py-3.5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
              Lemari Kostum Bobi
            </h2>
            <p className="text-sm font-bold text-amber-800">
              Kumpulkan bintang belajar untuk membuka semua kostum seru!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Lemari Kostum"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-amber-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {/* Split Content */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 gap-4 p-5 min-h-0">
          {/* Left: Live Bobi Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-100 to-emerald-100 p-4">
            <BobiCharacter
              mood="happy"
              costume={selectedCostume}
              size="lg"
              speech={`Aku memakai ${currentCostume.name}!`}
            />
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm border border-amber-200">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              <span className="font-display text-lg font-bold text-slate-800 tabular-nums">
                Bintangmu: {totalStars}
              </span>
            </div>
          </div>

          {/* Right: Costume Cards */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scroll">
            {COSTUMES.map((item) => {
              const unlocked = totalStars >= item.starsRequired;
              const isEquipped = selectedCostume === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePick(item.id, unlocked, item.name, item.starsRequired)}
                  className={`flex flex-col justify-between gap-2 rounded-2xl border-4 p-3.5 text-left transition-transform active:scale-95 ${
                    isEquipped
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : unlocked
                      ? 'border-sky-200 bg-white hover:border-sky-400 shadow-sm'
                      : 'border-slate-200 bg-slate-100/80 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-lg font-bold text-slate-800 leading-tight">
                      {item.name}
                    </span>
                    {isEquipped ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    ) : unlocked ? (
                      <span className="text-xs font-extrabold text-sky-700">Siap Pakai</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-amber-700 tabular-nums">
                        <Lock className="h-3.5 w-3.5" />
                        {item.starsRequired} ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 leading-snug">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
