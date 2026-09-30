import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

export const OrderfixLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showTagline = false
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector SVG mirroring the brand mark */}
      <svg
        className={`${iconDimensions[size]} shrink-0 transition-transform hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Orderfix Logo"
      >
        {/* Upper Navy Loop & Right Arrow */}
        <path
          d="M 24 50 L 24 34 C 24 23 33 14 44 14 L 66 14"
          stroke="#0B2545"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <polygon
          points="62,4 82,14 62,24"
          fill="#0B2545"
        />

        {/* Lower Teal Loop & Left Arrow */}
        <path
          d="M 76 50 L 76 66 C 76 77 67 86 56 86 L 34 86"
          stroke="#00B686"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <polygon
          points="38,96 18,86 38,76"
          fill="#00B686"
        />

        {/* Center Teal Checkmark */}
        <path
          d="M 39 49 L 48 58 L 65 37"
          stroke="#00B686"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-extrabold tracking-tight ${textSizes[size]}`}>
            <span className="text-[#0B2545]">ORDER</span>
            <span className="text-[#00B686]">FIX</span>
          </div>
          {showTagline && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
              Online & Offline Sync
            </span>
          )}
        </div>
      )}
    </div>
  );
};
