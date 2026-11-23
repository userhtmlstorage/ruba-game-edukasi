import React from 'react';
import { IllustrationKey } from '../types';

interface ModuleIconProps {
  name: IllustrationKey;
  className?: string;
}

export const ModuleIllustration: React.FC<ModuleIconProps> = ({ name, className = 'w-20 h-20' }) => {
  switch (name) {
    case 'apple':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M50 22 Q54 10 64 10" stroke="#78350F" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="62" cy="18" rx="11" ry="6" fill="#22C55E" transform="rotate(-20 62 18)" />
          <path
            d="M50 28 C34 22 16 34 18 56 C20 76 34 88 46 86 C48 85 52 85 54 86 C66 88 80 76 82 56 C84 34 66 22 50 28 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="3.5"
          />
          <ellipse cx="34" cy="46" rx="5" ry="11" fill="#FCA5A5" opacity="0.6" transform="rotate(15 34 46)" />
        </svg>
      );

    case 'banana':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path
            d="M20 70 Q42 86 74 58 Q88 42 80 18 Q74 14 70 20 Q72 42 54 56 Q36 68 22 62 Q16 64 20 70 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <rect x="74" y="14" width="6" height="8" rx="2" fill="#78350F" transform="rotate(15 77 18)" />
        </svg>
      );

    case 'leaf':
    case 'dry_leaf':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path
            d="M22 78 C20 40 48 16 82 18 C84 52 60 80 22 78 Z"
            fill={name === 'dry_leaf' ? '#D97706' : '#22C55E'}
            stroke={name === 'dry_leaf' ? '#78350F' : '#15803D'}
            strokeWidth="3.5"
          />
          <path
            d="M16 84 L68 32"
            stroke={name === 'dry_leaf' ? '#78350F' : '#14532D'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path d="M40 60 L38 42 M54 46 L52 32 M44 56 L62 54" stroke={name === 'dry_leaf' ? '#78350F' : '#14532D'} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'whale':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M48 26 Q42 12 34 16 M52 26 Q58 12 66 16" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path
            d="M16 58 C16 36 40 30 62 38 C74 42 80 54 84 48 C88 42 94 36 90 48 C86 58 84 62 90 66 C82 70 76 62 72 68 C62 78 24 78 16 58 Z"
            fill="#3B82F6"
            stroke="#1E40AF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M24 64 Q44 74 64 66" fill="#DBEAFE" />
          <circle cx="32" cy="52" r="4" fill="#0F172A" />
          <circle cx="31" cy="51" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'carrot':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M62 24 Q74 8 84 16 M64 26 Q86 18 86 30 M60 22 Q64 8 72 10" stroke="#16A34A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path
            d="M54 24 C66 24 76 34 70 46 L26 84 C20 88 14 82 18 76 L54 24 Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M46 42 L56 48 M36 56 L45 62" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'grape':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M50 14 L50 26" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="60" cy="20" rx="10" ry="5" fill="#22C55E" transform="rotate(-15 60 20)" />
          {[
            [38, 38], [52, 38], [64, 38],
            [32, 52], [46, 52], [60, 52], [70, 52],
            [40, 66], [54, 66], [64, 66],
            [50, 79],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="10.5" fill="#9333EA" stroke="#581C87" strokeWidth="2.5" />
          ))}
        </svg>
      );

    case 'strawberry':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M36 26 L50 14 L64 26 L56 32 L50 24 L44 32 Z" fill="#16A34A" stroke="#14532D" strokeWidth="2.5" />
          <path
            d="M26 36 C26 24 74 24 74 36 C74 58 58 84 50 86 C42 84 26 58 26 36 Z"
            fill="#F43F5E"
            stroke="#9F1239"
            strokeWidth="3.5"
          />
          {[
            [40, 44], [58, 44], [49, 54], [38, 60], [60, 60], [50, 72],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="2.2" fill="#FEF08A" />
          ))}
        </svg>
      );

    case 'sunflower':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="18"
              rx="8"
              ry="16"
              fill="#FACC15"
              stroke="#CA8A04"
              strokeWidth="2"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="21" fill="#78350F" stroke="#451A03" strokeWidth="3" />
          <circle cx="43" cy="46" r="2.5" fill="#FEF08A" />
          <circle cx="57" cy="46" r="2.5" fill="#FEF08A" />
          <path d="M43 56 Q50 62 57 56" stroke="#FEF08A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'butterfly':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <ellipse cx="32" cy="38" rx="20" ry="16" fill="#F472B6" stroke="#9D174D" strokeWidth="3" transform="rotate(-15 32 38)" />
          <ellipse cx="68" cy="38" rx="20" ry="16" fill="#F472B6" stroke="#9D174D" strokeWidth="3" transform="rotate(15 68 38)" />
          <ellipse cx="35" cy="64" rx="15" ry="12" fill="#FBBF24" stroke="#9D174D" strokeWidth="3" transform="rotate(12 35 64)" />
          <ellipse cx="65" cy="64" rx="15" ry="12" fill="#FBBF24" stroke="#9D174D" strokeWidth="3" transform="rotate(-12 65 64)" />
          <rect x="46" y="24" width="8" height="52" rx="4" fill="#334155" />
          <path d="M48 24 Q38 12 32 15 M52 24 Q62 12 68 15" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'star_obj':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <polygon
            points="50,10 61,36 89,38 67,56 74,84 50,69 26,84 33,56 11,38 39,36"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="48" r="3" fill="#78350F" />
          <circle cx="57" cy="48" r="3" fill="#78350F" />
          <path d="M44 57 Q50 62 56 57" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'fish':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <polygon points="70,50 92,30 92,70" fill="#FB923C" stroke="#9A3412" strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="46" cy="50" rx="30" ry="20" fill="#38BDF8" stroke="#0369A1" strokeWidth="3.5" />
          <path d="M44 30 Q52 14 60 32" fill="#FACC15" stroke="#0369A1" strokeWidth="3" />
          <circle cx="30" cy="46" r="4.5" fill="#0F172A" />
          <circle cx="29" cy="45" r="1.5" fill="#FFFFFF" />
          <path d="M22 56 Q28 60 34 55" stroke="#0369A1" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'duck':
    case 'rubber_duck':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <ellipse cx="52" cy="64" rx="28" ry="20" fill="#FACC15" stroke="#CA8A04" strokeWidth="3.5" />
          <circle cx="38" cy="38" r="17" fill="#FACC15" stroke="#CA8A04" strokeWidth="3.5" />
          <path d="M16 40 L26 35 L26 45 Z" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="34" cy="34" r="3.5" fill="#0F172A" />
          <path d="M45 58 Q60 54 66 64 Q56 72 45 64 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
        </svg>
      );

    case 'balloon':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M50 68 Q46 82 54 94" stroke="#64748B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="40" rx="24" ry="28" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
          <polygon points="50,66 44,72 56,72" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
          <ellipse cx="40" cy="28" rx="5" ry="9" fill="#FCA5A5" opacity="0.7" transform="rotate(20 40 28)" />
        </svg>
      );

    case 'rainbow':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M14 70 A36 36 0 0 1 86 70" fill="none" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
          <path d="M22 70 A28 28 0 0 1 78 70" fill="none" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" />
          <path d="M30 70 A20 20 0 0 1 70 70" fill="none" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" />
          <path d="M38 70 A12 12 0 0 1 62 70" fill="none" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
          <circle cx="22" cy="74" r="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="78" cy="74" r="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        </svg>
      );

    case 'lizard':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M28 66 Q14 76 18 86" stroke="#16A34A" strokeWidth="7" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="54" rx="18" ry="22" fill="#4ADE80" stroke="#15803D" strokeWidth="3.5" transform="rotate(25 50 54)" />
          <circle cx="64" cy="34" r="13" fill="#4ADE80" stroke="#15803D" strokeWidth="3.5" />
          <circle cx="68" cy="31" r="3" fill="#0F172A" />
          <path d="M34 44 L22 38 M60 66 L72 74 M36 62 L28 74 M62 46 L76 42" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'banana_peel':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="46" y="16" width="8" height="14" rx="3" fill="#78350F" />
          <path d="M46 28 Q22 44 16 74 Q32 76 44 50" fill="#FACC15" stroke="#B45309" strokeWidth="3.5" />
          <path d="M54 28 Q78 44 84 74 Q68 76 56 50" fill="#FDE047" stroke="#B45309" strokeWidth="3.5" />
          <path d="M50 30 Q44 60 50 82 Q60 66 54 30" fill="#EAB308" stroke="#B45309" strokeWidth="3.5" />
        </svg>
      );

    case 'plastic_bottle':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="42" y="12" width="16" height="10" rx="2" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2.5" />
          <path
            d="M42 22 L32 38 L32 82 C32 86 36 88 40 88 L60 88 C64 88 68 86 68 82 L68 38 L58 22 Z"
            fill="#BAE6FD"
            stroke="#0284C7"
            strokeWidth="3.5"
          />
          <rect x="33" y="48" width="34" height="18" fill="#38BDF8" opacity="0.7" />
        </svg>
      );

    case 'soda_can':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="30" y="20" width="40" height="64" rx="8" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
          <ellipse cx="50" cy="22" rx="18" ry="5" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
          <rect x="32" y="42" width="36" height="18" fill="#FFFFFF" opacity="0.85" />
          <circle cx="50" cy="51" r="6" fill="#FACC15" />
        </svg>
      );

    case 'emotion_happy':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="38" fill="#FDE047" stroke="#CA8A04" strokeWidth="4" />
          <path d="M32 42 Q37 34 42 42" stroke="#451A03" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M58 42 Q63 34 68 42" stroke="#451A03" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="54" r="5" fill="#FB7185" opacity="0.6" />
          <circle cx="72" cy="54" r="5" fill="#FB7185" opacity="0.6" />
          <path d="M34 58 Q50 76 66 58 Z" fill="#FB7185" stroke="#451A03" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      );

    case 'emotion_sad':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="38" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="4" />
          <circle cx="36" cy="43" r="4.5" fill="#1E293B" />
          <circle cx="64" cy="43" r="4.5" fill="#1E293B" />
          <path d="M32 34 L42 38 M68 34 L58 38" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 68 Q50 56 64 68" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M32 52 Q28 60 32 63 Q36 60 32 52 Z" fill="#38BDF8" />
        </svg>
      );

    case 'emotion_angry':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="38" fill="#FCA5A5" stroke="#DC2626" strokeWidth="4" />
          <path d="M29 34 L43 41 M71 34 L57 41" stroke="#450A0A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="37" cy="45" r="4.5" fill="#450A0A" />
          <circle cx="63" cy="45" r="4.5" fill="#450A0A" />
          <path d="M36 67 Q50 58 64 67" stroke="#450A0A" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'emotion_scared':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="38" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="4" />
          <circle cx="36" cy="42" r="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="36" cy="42" r="3" fill="#1E293B" />
          <circle cx="64" cy="42" r="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="64" cy="42" r="3" fill="#1E293B" />
          <ellipse cx="50" cy="65" rx="8" ry="10" fill="#4C1D95" />
        </svg>
      );

    case 'emotion_surprised':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="38" fill="#FDE68A" stroke="#D97706" strokeWidth="4" />
          <circle cx="36" cy="42" r="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="36" cy="42" r="2.5" fill="#1E293B" />
          <circle cx="64" cy="42" r="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="64" cy="42" r="2.5" fill="#1E293B" />
          <circle cx="50" cy="64" r="7" fill="#EF4444" stroke="#78350F" strokeWidth="2.5" />
        </svg>
      );

    case 'hug_friend':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="38" cy="44" r="18" fill="#F97316" stroke="#9A3412" strokeWidth="3" />
          <circle cx="62" cy="44" r="18" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
          <path d="M50 74 C36 64 26 52 34 42 C40 36 48 40 50 46 C52 40 60 36 66 42 C74 52 64 64 50 74 Z" fill="#F43F5E" stroke="#9F1239" strokeWidth="2.5" />
        </svg>
      );

    case 'share_toy':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="20" y="34" width="26" height="32" rx="6" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          <rect x="54" y="34" width="26" height="32" rx="6" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
          <path d="M40 50 H60 M54 44 L60 50 L54 56" stroke="#16A34A" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'laugh_mean':
    case 'ignore_friend':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="34" fill="#E2E8F0" stroke="#64748B" strokeWidth="3.5" />
          <path d="M34 44 H44 M56 44 H66" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <path d="M38 64 H62" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'heavy_rock':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path
            d="M22 68 L18 46 L36 28 L64 26 L82 46 L78 72 L46 76 Z"
            fill="#64748B"
            stroke="#334155"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M36 38 L52 36 L44 50 Z" fill="#94A3B8" />
        </svg>
      );

    case 'beach_ball':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="34" fill="#FFFFFF" stroke="#334155" strokeWidth="3.5" />
          <path d="M50 16 A34 34 0 0 1 84 50 L50 50 Z" fill="#EF4444" />
          <path d="M50 16 A34 34 0 0 0 16 50 L50 50 Z" fill="#3B82F6" />
          <path d="M16 50 A34 34 0 0 0 50 84 L50 50 Z" fill="#FACC15" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        </svg>
      );

    case 'toy_robot':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="50" y1="12" x2="50" y2="24" stroke="#475569" strokeWidth="4" />
          <circle cx="50" cy="12" r="5" fill="#FACC15" />
          <rect x="28" y="24" width="44" height="32" rx="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="3.5" />
          <circle cx="40" cy="38" r="4.5" fill="#0F172A" />
          <circle cx="60" cy="38" r="4.5" fill="#0F172A" />
          <path d="M42 48 H58" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          <rect x="30" y="60" width="40" height="26" rx="6" fill="#60A5FA" stroke="#0369A1" strokeWidth="3.5" />
          <circle cx="50" cy="73" r="6" fill="#4ADE80" />
        </svg>
      );

    case 'drawing_art':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="18" y="18" width="64" height="64" rx="8" fill="#FFFFFF" stroke="#475569" strokeWidth="3.5" />
          <circle cx="36" cy="36" r="8" fill="#FACC15" />
          <path d="M22 72 L42 48 L58 64 L68 54 L78 72 Z" fill="#22C55E" />
        </svg>
      );

    case 'house_address':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <polygon points="50,16 18,46 82,46" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" strokeLinejoin="round" />
          <rect x="24" y="46" width="52" height="36" rx="4" fill="#FEF3C7" stroke="#B45309" strokeWidth="3.5" />
          <rect x="42" y="58" width="16" height="24" fill="#92400E" />
          <circle cx="74" cy="24" r="12" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M74 18 V25 M74 29 V30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'phone_number':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="30" y="14" width="40" height="72" rx="8" fill="#334155" stroke="#0F172A" strokeWidth="3.5" />
          <rect x="35" y="22" width="30" height="52" rx="3" fill="#E2E8F0" />
          <text x="50" y="52" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#DC2626">
            0812..
          </text>
          <circle cx="74" cy="22" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M70 18 L78 26 M78 18 L70 26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'tell_parents':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="38" cy="36" r="14" fill="#FDBA74" stroke="#9A3412" strokeWidth="3" />
          <circle cx="64" cy="44" r="11" fill="#FDBA74" stroke="#9A3412" strokeWidth="3" />
          <path d="M22 80 C22 60 54 60 54 80" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
          <path d="M52 80 C52 64 76 64 76 80" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
        </svg>
      );

    case 'reply_stranger':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="18" y="24" width="64" height="46" rx="10" fill="#E2E8F0" stroke="#64748B" strokeWidth="3.5" />
          <circle cx="38" cy="47" r="4" fill="#64748B" />
          <circle cx="50" cy="47" r="4" fill="#64748B" />
          <circle cx="62" cy="47" r="4" fill="#64748B" />
        </svg>
      );

    case 'strong_password':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M34 46 V32 C34 20 66 20 66 32 V46" fill="none" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
          <rect x="24" y="44" width="52" height="40" rx="10" fill="#FACC15" stroke="#B45309" strokeWidth="3.5" />
          <circle cx="50" cy="60" r="6" fill="#451A03" />
          <rect x="47" y="62" width="6" height="12" rx="2" fill="#451A03" />
        </svg>
      );

    case 'share_password':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="18" y="28" width="64" height="44" rx="6" fill="#FEF2F2" stroke="#DC2626" strokeWidth="3.5" />
          <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#DC2626">
            12345
          </text>
        </svg>
      );

    case 'eco_tree':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="43" y="56" width="14" height="28" rx="3" fill="#92400E" />
          <circle cx="50" cy="36" r="24" fill="#22C55E" stroke="#15803D" strokeWidth="3.5" />
          <circle cx="34" cy="46" r="16" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="66" cy="46" r="16" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
        </svg>
      );

    case 'rocket':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M50 12 C68 28 68 58 60 72 L40 72 C32 58 32 28 50 12 Z" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3.5" />
          <path d="M50 12 C58 20 62 28 62 32 L38 32 C38 28 42 20 50 12 Z" fill="#EF4444" />
          <circle cx="50" cy="48" r="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
          <path d="M36 58 L22 74 L38 72 Z" fill="#EF4444" />
          <path d="M64 58 L78 74 L62 72 Z" fill="#EF4444" />
          <path d="M44 74 L50 90 L56 74 Z" fill="#FACC15" />
        </svg>
      );

    case 'shield':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path
            d="M50 12 L82 24 V48 C82 68 68 82 50 88 C32 82 18 68 18 48 V24 Z"
            fill="#4F46E5"
            stroke="#312E81"
            strokeWidth="3.5"
          />
          <path d="M36 50 L46 60 L66 38" fill="none" stroke="#4ADE80" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'trophy':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M30 22 H70 V42 C70 56 60 64 50 64 C40 64 30 56 30 42 Z" fill="#FACC15" stroke="#B45309" strokeWidth="3.5" />
          <path d="M30 28 H18 C18 44 26 48 30 48" fill="none" stroke="#B45309" strokeWidth="3.5" />
          <path d="M70 28 H82 C82 44 74 48 70 48" fill="none" stroke="#B45309" strokeWidth="3.5" />
          <rect x="45" y="64" width="10" height="14" fill="#CA8A04" />
          <rect x="34" y="78" width="32" height="8" rx="3" fill="#B45309" />
        </svg>
      );

    case 'flamingo':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M52 72 V90 M46 90 H58" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 54 C40 38 66 38 66 56 C66 68 54 74 44 72 C34 70 36 58 40 54 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="3" />
          <path d="M44 48 Q30 30 42 18 Q50 14 52 24" fill="none" stroke="#F472B6" strokeWidth="7" strokeLinecap="round" />
          <circle cx="46" cy="20" r="8" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
          <path d="M52 20 L62 24 L54 27 Z" fill="#334155" />
          <circle cx="45" cy="18" r="2" fill="#0F172A" />
        </svg>
      );

    case 'train':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="18" y="36" width="60" height="34" rx="6" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
          <rect x="50" y="22" width="26" height="22" rx="4" fill="#3B82F6" stroke="#1E40AF" strokeWidth="3" />
          <rect x="24" y="20" width="12" height="16" rx="3" fill="#475569" />
          <circle cx="30" cy="14" r="5" fill="#E2E8F0" />
          <circle cx="38" cy="10" r="4" fill="#E2E8F0" />
          <rect x="55" y="27" width="14" height="10" rx="2" fill="#BAE6FD" />
          <circle cx="32" cy="74" r="9" fill="#334155" stroke="#FACC15" strokeWidth="3" />
          <circle cx="62" cy="74" r="9" fill="#334155" stroke="#FACC15" strokeWidth="3" />
        </svg>
      );

    case 'hat':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <ellipse cx="50" cy="68" rx="38" ry="12" fill="#F59E0B" stroke="#92400E" strokeWidth="3.5" />
          <path d="M26 66 C26 36 74 36 74 66 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="3.5" />
          <path d="M28 58 Q50 64 72 58" stroke="#EF4444" strokeWidth="6" fill="none" />
        </svg>
      );

    case 'cardboard':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="20" y="34" width="60" height="46" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="3.5" />
          <polygon points="20,34 32,20 68,20 80,34" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
          <line x1="50" y1="20" x2="50" y2="34" stroke="#78350F" strokeWidth="3" />
        </svg>
      );

    case 'apple_core':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M50 18 Q54 10 60 10" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M28 24 C36 20 64 20 72 24 C66 34 56 38 56 50 C56 62 66 68 72 76 C64 82 36 82 28 76 C34 68 44 62 44 50 C44 38 34 34 28 24 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="3" />
          <path d="M28 24 C38 20 62 20 72 24 C68 29 32 29 28 24 Z" fill="#EF4444" />
          <path d="M28 76 C38 82 62 82 72 76 C68 71 32 71 28 76 Z" fill="#EF4444" />
          <ellipse cx="47" cy="48" rx="2" ry="3.5" fill="#451A03" />
          <ellipse cx="53" cy="52" rx="2" ry="3.5" fill="#451A03" />
        </svg>
      );

    case 'metal_spoon':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <ellipse cx="32" cy="32" rx="14" ry="19" fill="#CBD5E1" stroke="#475569" strokeWidth="3.5" transform="rotate(-45 32 32)" />
          <path d="M42 42 L80 80" stroke="#94A3B8" strokeWidth="9" strokeLinecap="round" />
          <path d="M42 42 L80 80" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'breathe_calm':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="48" r="32" fill="#BAE6FD" stroke="#0284C7" strokeWidth="3.5" />
          <path d="M34 44 Q39 48 44 44 M56 44 Q61 48 66 44" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M42 60 Q50 65 58 60" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M20 74 Q32 68 42 74 M58 74 Q68 68 80 74" stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'tantrum':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="52" r="32" fill="#FECACA" stroke="#DC2626" strokeWidth="3.5" />
          <path d="M32 38 L44 45 M68 38 L56 45" stroke="#7F1D1D" strokeWidth="4" strokeLinecap="round" />
          <circle cx="38" cy="48" r="3.5" fill="#7F1D1D" />
          <circle cx="62" cy="48" r="3.5" fill="#7F1D1D" />
          <ellipse cx="50" cy="66" rx="10" ry="7" fill="#7F1D1D" />
          <path d="M22 22 L30 30 M78 22 L70 30" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'popup_trap':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <rect x="14" y="22" width="72" height="56" rx="8" fill="#FEF2F2" stroke="#EF4444" strokeWidth="3.5" />
          <rect x="14" y="22" width="72" height="14" rx="4" fill="#EF4444" />
          <circle cx="50" cy="54" r="14" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
          <path d="M50 46 V55 M50 59 V61" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'apologize_kind':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="35" cy="48" r="18" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
          <circle cx="65" cy="48" r="18" fill="#A7F3D0" stroke="#059669" strokeWidth="3" />
          <path d="M29 52 Q35 58 41 52" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M59 52 Q65 58 71 52" stroke="#065F46" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 28 C46 22 38 22 38 28 C38 34 50 40 50 40 C50 40 62 34 62 28 C62 22 54 22 50 28 Z" fill="#F43F5E" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="32" fill="#38BDF8" />
        </svg>
      );
  }
};
