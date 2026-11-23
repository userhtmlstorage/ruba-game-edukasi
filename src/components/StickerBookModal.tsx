import React from 'react';
import { X, Lock } from 'lucide-react';
import { STICKERS } from '../data/gameData';
import { IllustrationKey } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { ModuleIllustration } from './ModuleIcons';

interface StickerBookModalProps {
  unlockedStickerIds: string[];
  totalStars: number;
  onClose: () => void;
}

export const StickerBookModal: React.FC<StickerBookModalProps> = ({
  unlockedStickerIds,
  totalStars,
  onClose,
}) => {
  const unlockedCount = STICKERS.filter(
    (s) =>
      unlockedStickerIds.includes(s.id) ||
      (s.starsRequired !== undefined && totalStars >= s.starsRequired)
  ).length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="relative flex h-[min(92dvh,640px)] max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-pink-300 bg-[#FFFDF7] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b-2 border-pink-200 bg-pink-100/80 px-4 py-2.5 sm:px-6 sm:py-3.5">
          <div className="min-w-0 pr-2">
            <h2 className="font-display text-xl sm:text-3xl font-bold text-pink-950 truncate">
              Buku Stiker RuBa ({unlockedCount}/{STICKERS.length})
            </h2>
            <p className="text-xs sm:text-sm font-bold text-pink-800 truncate">
              Selesaikan modul belajar dan kumpulkan bintang untuk melengkapi semua stiker!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Buku Stiker"
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-pink-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>

        <div className="grid flex-1 min-h-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5 p-3 sm:p-5 scroll-touch custom-scroll">
          {STICKERS.map((sticker) => {
            const isUnlocked =
              unlockedStickerIds.includes(sticker.id) ||
              (sticker.starsRequired !== undefined && totalStars >= sticker.starsRequired);

            return (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    audioEngine.playMagic();
                    audioEngine.speak(`${sticker.name}! ${sticker.description}`, {
                      tone: 'excited',
                    });
                  } else {
                    audioEngine.playEncourage();
                    audioEngine.speak(
                      sticker.starsRequired
                        ? `Kumpulkan ${sticker.starsRequired} bintang untuk membuka stiker ${sticker.name}!`
                        : `Ayo selesaikan modul belajar untuk membuka stiker ${sticker.name}!`,
                      { tone: 'gentle' }
                    );
                  }
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-4 p-3 text-center transition-transform active:scale-95 ${
                  isUnlocked
                    ? `${sticker.bgColor} border-amber-300 shadow-sm hover:-translate-y-1`
                    : 'border-dashed border-slate-300 bg-slate-100 opacity-75'
                }`}
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  {isUnlocked ? (
                    <ModuleIllustration
                      name={sticker.iconKey as IllustrationKey}
                      className="h-16 w-16"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                      <Lock className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <span className="font-display text-base font-bold text-slate-800 leading-tight">
                  {sticker.name}
                </span>
                <span className="text-[11px] font-bold text-slate-600 leading-snug">
                  {isUnlocked
                    ? sticker.description
                    : sticker.starsRequired
                    ? `Butuh ${sticker.starsRequired} Bintang`
                    : 'Selesaikan Modul'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
