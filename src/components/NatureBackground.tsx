import React from 'react';

export const NatureBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50"
    >
      {/* Smiling Rotating Sun */}
      <div className="pointer-events-none absolute -top-6 right-8 sm:right-14 w-24 h-24 sm:w-36 sm:h-36">
        <svg viewBox="0 0 140 140" className="pointer-events-none w-full h-full drop-shadow-md">
          <g className="animate-sun-spin" style={{ transformOrigin: '70px 70px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="65"
                y="4"
                width="10"
                height="20"
                rx="5"
                fill="#FBBF24"
                transform={`rotate(${i * 30} 70 70)`}
              />
            ))}
          </g>
          <circle cx="70" cy="70" r="40" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
          {/* Sun smiling face */}
          <circle cx="57" cy="65" r="4" fill="#78350F" />
          <circle cx="83" cy="65" r="4" fill="#78350F" />
          <circle cx="50" cy="73" r="4.5" fill="#FB923C" opacity="0.55" />
          <circle cx="90" cy="73" r="4.5" fill="#FB923C" opacity="0.55" />
          <path
            d="M 56 76 Q 70 88 84 76"
            fill="none"
            stroke="#78350F"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Drifting Clouds */}
      <div
        className="pointer-events-none absolute top-8 left-0 w-36 sm:w-56 opacity-90 animate-cloud-slow"
        style={{ animationDelay: '-12s' }}
      >
        <svg viewBox="0 0 200 90" className="pointer-events-none w-full h-auto">
          <path
            d="M35 72 H165 C180 72 190 60 188 47 C186 35 174 28 162 30 C156 14 138 6 121 12 C110 3 92 4 82 15 C66 10 47 20 44 37 C28 38 18 49 21 61 C23 68 29 72 35 72 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div
        className="pointer-events-none absolute top-24 left-0 w-32 sm:w-44 opacity-80 animate-cloud-med"
        style={{ animationDelay: '-26s' }}
      >
        <svg viewBox="0 0 200 90" className="pointer-events-none w-full h-auto">
          <path
            d="M35 72 H165 C180 72 190 60 188 47 C186 35 174 28 162 30 C156 14 138 6 121 12 C110 3 92 4 82 15 C66 10 47 20 44 37 C28 38 18 49 21 61 C23 68 29 72 35 72 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Flying Butterflies */}
      <div className="pointer-events-none absolute top-28 left-[14%] w-9 h-9 sm:w-10 sm:h-10 animate-butterfly-1 opacity-85">
        <svg viewBox="0 0 64 64" className="pointer-events-none w-full h-full">
          <g className="animate-wing-flap">
            <ellipse cx="20" cy="24" rx="14" ry="11" fill="#F472B6" transform="rotate(-18 20 24)" />
            <ellipse cx="44" cy="24" rx="14" ry="11" fill="#F472B6" transform="rotate(18 44 24)" />
            <ellipse cx="22" cy="40" rx="10" ry="8" fill="#FBBF24" transform="rotate(12 22 40)" />
            <ellipse cx="42" cy="40" rx="10" ry="8" fill="#FBBF24" transform="rotate(-12 42 40)" />
          </g>
          <rect x="30" y="18" width="4" height="28" rx="2" fill="#475569" />
          <path d="M31 18 Q25 10 21 12" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M33 18 Q39 10 43 12" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="pointer-events-none absolute top-40 right-[18%] w-8 h-8 sm:w-9 sm:h-9 animate-butterfly-2 opacity-80">
        <svg viewBox="0 0 64 64" className="pointer-events-none w-full h-full">
          <g className="animate-wing-flap">
            <ellipse cx="20" cy="24" rx="14" ry="11" fill="#38BDF8" transform="rotate(-18 20 24)" />
            <ellipse cx="44" cy="24" rx="14" ry="11" fill="#38BDF8" transform="rotate(18 44 24)" />
            <ellipse cx="22" cy="40" rx="10" ry="8" fill="#A78BFA" transform="rotate(12 22 40)" />
            <ellipse cx="42" cy="40" rx="10" ry="8" fill="#A78BFA" transform="rotate(-12 42 40)" />
          </g>
          <rect x="30" y="18" width="4" height="28" rx="2" fill="#475569" />
        </svg>
      </div>

      {/* Rolling Green Hills */}
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 w-full h-28 sm:h-48"
      >
        <path
          d="M0,120 Q360,30 760,115 T1440,90 L1440,280 L0,280 Z"
          fill="#86EFAC"
        />
        <path
          d="M0,165 Q420,90 880,155 T1440,145 L1440,280 L0,280 Z"
          fill="#4ADE80"
        />
        <path
          d="M0,210 Q320,175 720,205 T1440,195 L1440,280 L0,280 Z"
          fill="#22C55E"
        />
      </svg>

      {/* Swaying Meadow Flowers */}
      {[
        { left: '4%', bottom: '8px', color: '#F43F5E', delay: '0s', scale: 1 },
        { left: '12%', bottom: '18px', color: '#FACC15', delay: '-1.5s', scale: 0.85 },
        { left: '84%', bottom: '14px', color: '#EC4899', delay: '-0.8s', scale: 0.95 },
        { left: '93%', bottom: '6px', color: '#FB923C', delay: '-2.2s', scale: 1.05 },
      ].map((fl, idx) => (
        <div
          key={idx}
          className="pointer-events-none absolute w-8 h-12 sm:w-10 sm:h-14 animate-flower-sway"
          style={{
            left: fl.left,
            bottom: fl.bottom,
            animationDelay: fl.delay,
            transform: `scale(${fl.scale})`,
          }}
        >
          <svg viewBox="0 0 48 64" className="w-full h-full">
            <path d="M24 62 Q22 44 24 24" stroke="#15803D" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="16" cy="45" rx="7" ry="4" fill="#16A34A" transform="rotate(-25 16 45)" />
            <ellipse cx="32" cy="42" rx="7" ry="4" fill="#16A34A" transform="rotate(25 32 42)" />
            <circle cx="24" cy="14" r="6" fill={fl.color} />
            <circle cx="15" cy="21" r="6" fill={fl.color} />
            <circle cx="33" cy="21" r="6" fill={fl.color} />
            <circle cx="18" cy="29" r="6" fill={fl.color} />
            <circle cx="30" cy="29" r="6" fill={fl.color} />
            <circle cx="24" cy="22" r="5.5" fill="#FEF08A" />
          </svg>
        </div>
      ))}
    </div>
  );
};
