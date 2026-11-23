import React from 'react';
import { DifficultyLevel } from '../../types';

interface StageHeaderProps {
  currentStep: number; // 0-indexed
  totalSteps: number;
  difficulty: DifficultyLevel;
  accentColor?: string;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  currentStep,
  totalSteps,
  difficulty,
}) => {
  const diffColor =
    difficulty === 'Mudah'
      ? 'text-emerald-700'
      : difficulty === 'Sedang'
      ? 'text-amber-700'
      : 'text-rose-700';

  return (
    <div className="mb-2 flex w-full flex-col items-center gap-1.5">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-600 tabular-nums">
        <span>
          Tahap {currentStep + 1} dari {totalSteps}
        </span>
        <span aria-hidden="true">·</span>
        <span className={diffColor}>Tingkat: {difficulty}</span>
      </div>

      {/* 7-Step Visual Progress Dots */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <span
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                isCurrent
                  ? 'w-8 bg-sky-500 shadow-sm'
                  : isDone
                  ? 'w-4 bg-emerald-400'
                  : 'w-2.5 bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
