import React from 'react';
import { BobiMood, CostumeId } from '../types';

interface BobiCharacterProps {
  mood?: BobiMood;
  costume?: CostumeId;
  speech?: string;
  size?: 'sm' | 'md' | 'lg';
  jumpTick?: number;
}

export const BobiCharacter: React.FC<BobiCharacterProps> = ({
  mood = 'idle',
  costume = 'default',
  speech,
  size = 'md',
  jumpTick = 0,
}) => {
  const sizeClass =
    size === 'lg'
      ? 'w-40 h-40 sm:w-48 sm:h-48'
      : size === 'sm'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : 'w-32 h-32 sm:w-40 sm:h-40';

  const animClass =
    mood === 'dancing' || mood === 'happy'
      ? 'animate-bobi-dance'
      : mood === 'encouraging'
      ? 'animate-bobi-wobble'
      : 'animate-bobi-idle';

  return (
    <div className="flex flex-col items-center gap-2">
      {speech && (
        <div
          key={speech}
          className="relative max-w-[260px] rounded-2xl border-2 border-sky-300 bg-white px-4 py-2.5 text-center shadow-md transition-transform duration-200"
        >
          <p className="text-sm sm:text-base font-bold leading-snug text-slate-800">
            {speech}
          </p>
          <div className="absolute -bottom-2.5 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-sky-300 bg-white" />
        </div>
      )}

      <div
        key={mood === 'jumping' ? jumpTick : undefined}
        className={`${sizeClass} ${animClass} transition-transform duration-150`}
        style={
          mood === 'jumping' && jumpTick > 0
            ? { transform: 'translateY(-22px) scale(1.06)' }
            : undefined
        }
      >
        <svg viewBox="0 0 200 210" className="w-full h-full drop-shadow-md">
          {/* Superhero Cape behind body */}
          {costume === 'superhero' && (
            <path
              d="M52 128 Q26 172 34 198 L166 198 Q174 172 148 128 Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="4"
            />
          )}

          {/* Bushy Fox Tail */}
          <g>
            <path
              d="M138 158 Q186 146 184 108 Q182 88 162 96 Q148 104 134 140 Z"
              fill="#F97316"
              stroke="#9A3412"
              strokeWidth="4"
            />
            <path
              d="M174 100 Q186 94 184 114 Q174 124 162 115 Z"
              fill="#FFFBEB"
            />
          </g>

          {/* Body / Shirt */}
          <path
            d="M58 136 Q55 186 72 194 L128 194 Q145 186 142 136 Q128 122 100 122 Q72 122 58 136 Z"
            fill={costume === 'astronaut' ? '#E2E8F0' : costume === 'superhero' ? '#2563EB' : '#1D4ED8'}
            stroke="#1E3A8A"
            strokeWidth="4"
          />
          {/* White star on chest */}
          <polygon
            points="100,140 105,152 118,153 108,161 111,174 100,167 89,174 92,161 82,153 95,152"
            fill={costume === 'superhero' ? '#FACC15' : '#FFFFFF'}
          />

          {/* Rainbow Scarf */}
          {costume === 'rainbow_scarf' && (
            <g>
              <path
                d="M64 124 Q100 138 136 124 L132 138 Q100 152 68 138 Z"
                fill="#EC4899"
                stroke="#831843"
                strokeWidth="3"
              />
              <path d="M72 131 Q100 144 128 131" stroke="#FACC15" strokeWidth="4" fill="none" />
              <path d="M75 135 Q100 148 125 135" stroke="#22C55E" strokeWidth="3.5" fill="none" />
              <path d="M114 134 L126 164 L112 168 L104 138 Z" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2.5" />
            </g>
          )}

          {/* Paws */}
          <ellipse cx="62" cy="154" rx="13" ry="11" fill="#F97316" stroke="#9A3412" strokeWidth="3.5" />
          <ellipse cx="138" cy="154" rx="13" ry="11" fill="#F97316" stroke="#9A3412" strokeWidth="3.5" />

          {/* Fox Ears */}
          <path d="M48 74 L40 24 L82 48 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="4" strokeLinejoin="round" />
          <path d="M51 66 L47 34 L73 49 Z" fill="#FED7AA" />
          <path d="M152 74 L160 24 L118 48 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="4" strokeLinejoin="round" />
          <path d="M149 66 L153 34 L127 49 Z" fill="#FED7AA" />

          {/* Fox Head */}
          <ellipse cx="100" cy="86" rx="54" ry="45" fill="#F97316" stroke="#9A3412" strokeWidth="4" />
          {/* Little Head Tuft */}
          <path d="M92 42 Q100 28 108 42 Q114 34 112 46" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />

          {/* Cream Cheeks */}
          <path
            d="M47 92 Q66 84 100 102 Q134 84 153 92 Q146 128 100 131 Q54 128 47 92 Z"
            fill="#FFFBEB"
          />

          {/* Superhero Mask */}
          {costume === 'superhero' && (
            <path
              d="M54 74 Q100 66 146 74 L142 94 Q120 96 100 88 Q80 96 58 94 Z"
              fill="#DC2626"
              stroke="#7F1D1D"
              strokeWidth="3"
            />
          )}

          {/* Eyes */}
          {mood === 'happy' || mood === 'dancing' ? (
            <>
              <path d="M68 82 Q77 72 86 82" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M114 82 Q123 72 132 82" fill="none" stroke="#451A03" strokeWidth="4.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="77" cy="82" r="9.5" fill="#451A03" />
              <circle cx="74" cy="78" r="3.5" fill="#FFFFFF" />
              <circle cx="123" cy="82" r="9.5" fill="#451A03" />
              <circle cx="120" cy="78" r="3.5" fill="#FFFFFF" />
            </>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="62" cy="96" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="138" cy="96" rx="7" ry="4.5" fill="#FB7185" opacity="0.55" />

          {/* Nose & Mouth */}
          <ellipse cx="100" cy="97" rx="6.5" ry="4.5" fill="#451A03" />
          {mood === 'happy' || mood === 'dancing' ? (
            <path
              d="M88 106 Q100 123 112 106 Z"
              fill="#FB7185"
              stroke="#451A03"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : mood === 'thinking' ? (
            <circle cx="103" cy="110" r="4" fill="#451A03" />
          ) : (
            <path
              d="M89 107 Q100 117 111 107"
              fill="none"
              stroke="#451A03"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Signature Round Blue Glasses OR Star Glasses Costume */}
          {costume === 'star_glasses' ? (
            <g>
              <polygon
                points="77,64 82,75 94,76 85,84 87,96 77,90 67,96 69,84 60,76 72,75"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <polygon
                points="123,64 128,75 140,76 131,84 133,96 123,90 113,96 115,84 106,76 118,75"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <line x1="92" y1="80" x2="108" y2="80" stroke="#F59E0B" strokeWidth="4.5" />
            </g>
          ) : (
            <g>
              <circle cx="77" cy="82" r="18" fill="rgba(255,255,255,0.16)" stroke="#1D4ED8" strokeWidth="4.5" />
              <circle cx="123" cy="82" r="18" fill="rgba(255,255,255,0.16)" stroke="#1D4ED8" strokeWidth="4.5" />
              <path d="M95 81 Q100 77 105 81" fill="none" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}

          {/* Cowboy Hat */}
          {costume === 'cowboy' && (
            <g>
              <path d="M40 48 Q100 60 160 48 Q144 36 100 40 Q56 36 40 48 Z" fill="#92400E" stroke="#451A03" strokeWidth="3.5" />
              <path d="M68 42 L76 14 Q100 20 124 14 L132 42 Z" fill="#B45309" stroke="#451A03" strokeWidth="3.5" />
              <rect x="70" y="34" width="60" height="7" fill="#FACC15" />
            </g>
          )}

          {/* Golden Crown */}
          {costume === 'crown' && (
            <g>
              <path
                d="M66 44 L62 16 L84 30 L100 10 L116 30 L138 16 L134 44 Z"
                fill="#FACC15"
                stroke="#B45309"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="30" r="4.5" fill="#EF4444" />
              <circle cx="78" cy="34" r="3.5" fill="#3B82F6" />
              <circle cx="122" cy="34" r="3.5" fill="#10B981" />
            </g>
          )}

          {/* Astronaut Helmet */}
          {costume === 'astronaut' && (
            <g>
              <circle
                cx="100"
                cy="82"
                r="63"
                fill="rgba(186, 230, 253, 0.22)"
                stroke="#0284C7"
                strokeWidth="5"
              />
              <path
                d="M54 50 Q66 34 86 30"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
