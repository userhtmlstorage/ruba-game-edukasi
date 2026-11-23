import React from 'react';
import { AnimatePresence, motion, Variants } from 'motion/react';
import { ModuleMeta, IllustrationKey } from '../types';
import { ModuleIllustration } from './ModuleIcons';

export type NavTransitionMode = 'welcome' | 'enter-module' | 'hop-hub';

export const titleScreenVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    y: -16,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const hubScreenVariants: Variants = {
  initial: (mode: NavTransitionMode) =>
    mode === 'hop-hub'
      ? { opacity: 0, y: 48, scale: 0.93 }
      : { opacity: 0, y: 22, scale: 0.97 },
  animate: (mode: NavTransitionMode) =>
    mode === 'hop-hub'
      ? {
          opacity: 1,
          y: [48, -16, 4, 0],
          scale: [0.93, 1.025, 0.995, 1],
          transition: {
            duration: 0.46,
            times: [0, 0.52, 0.8, 1],
            ease: [0.22, 1, 0.36, 1],
          },
        }
      : {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 320, damping: 24 },
        },
  exit: (mode: NavTransitionMode) =>
    mode === 'enter-module'
      ? {
          opacity: 0,
          scale: 1.08,
          transition: { duration: 0.18, ease: 'easeIn' },
        }
      : {
          opacity: 0,
          scale: 0.96,
          transition: { duration: 0.16, ease: 'easeIn' },
        },
};

export const moduleScreenVariants: Variants = {
  initial: { opacity: 0, scale: 0.86, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 310, damping: 25, delay: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -32,
    scale: 0.92,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

interface DoorTransitionOverlayProps {
  doorKey: number;
  moduleMeta: ModuleMeta | null;
  iconKey: IllustrationKey | null;
  onComplete: () => void;
}

/**
 * Efek visual "pintu terbuka" non-blocking (pointer-events-none) saat memasuki modul belajar.
 */
export const DoorTransitionOverlay: React.FC<DoorTransitionOverlayProps> = ({
  doorKey,
  moduleMeta,
  iconKey,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {doorKey > 0 && moduleMeta && (
        <motion.div
          key={doorKey}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 flex overflow-hidden"
          style={{ perspective: '1200px' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Daun Pintu Kiri */}
          <motion.div
            initial={{ x: '0%', rotateY: 0 }}
            animate={{ x: '-104%', rotateY: -28 }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center' }}
            className={`h-full w-1/2 border-r-4 border-amber-300 ${moduleMeta.cardBg} shadow-2xl flex items-center justify-end pr-3 sm:pr-6`}
          >
            <div className="h-[72%] w-4 sm:w-6 rounded-full bg-amber-300/60" />
          </motion.div>

          {/* Daun Pintu Kanan */}
          <motion.div
            initial={{ x: '0%', rotateY: 0 }}
            animate={{ x: '104%', rotateY: 28 }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={onComplete}
            style={{ transformOrigin: 'right center' }}
            className={`h-full w-1/2 border-l-4 border-amber-300 ${moduleMeta.cardBg} shadow-2xl flex items-center justify-start pl-3 sm:pl-6`}
          >
            <div className="h-[72%] w-4 sm:w-6 rounded-full bg-amber-300/60" />
          </motion.div>

          {/* Lencana Tengah Pintu */}
          <motion.div
            initial={{ opacity: 1, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.25 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-1.5 rounded-3xl border-4 border-amber-300 bg-[#FFFDF7] px-5 py-3 shadow-2xl">
              {iconKey && <ModuleIllustration name={iconKey} className="h-12 w-12 sm:h-16 sm:w-16" />}
              <span className="font-display text-lg sm:text-2xl font-bold text-slate-900">
                {moduleMeta.title}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
