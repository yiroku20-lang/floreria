import React, { useId } from 'react';

interface RosanferLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
  light?: boolean;
}

export const RosanferLogo: React.FC<RosanferLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  light = false,
}) => {
  const uniqueId = useId();
  const safeId = uniqueId.replace(/:/g, '_');
  const roseGoldId = `roseGold-${safeId}`;
  const sageLeafId = `sageLeaf-${safeId}`;
  const glowId = `glow-${safeId}`;

  const sizeMap = {
    sm: { icon: 32, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
    lg: { icon: 72, text: 'text-4xl', sub: 'text-sm' },
    xl: { icon: 100, text: 'text-5xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  // SVG Rose Emblem matching the user's provided logo
  const Emblem = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        {/* Rose Gold Metallic Gradient */}
        <linearGradient id={roseGoldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2B4A8" />
          <stop offset="35%" stopColor="#D49A89" />
          <stop offset="70%" stopColor="#B87C6B" />
          <stop offset="100%" stopColor="#965D4F" />
        </linearGradient>

        {/* Sage Green Leaf Gradient */}
        <linearGradient id={sageLeafId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7E9680" />
          <stop offset="100%" stopColor="#5C715E" />
        </linearGradient>

        {/* Subtle shadow filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#965D4F" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Sage Green Leaf on left side */}
      <path
        d="M 32 40 C 22 40 18 48 24 58 C 30 52 35 48 37 42 C 35 40 33 40 32 40 Z"
        fill={`url(#${sageLeafId})`}
        opacity="0.92"
      />

      {/* Rose Head Outer Petals & R-stem */}
      {/* Outer Rose Silhouette */}
      <path
        d="M 36 28 C 36 18 48 14 55 14 C 64 14 74 20 74 30 C 74 40 65 44 58 44 C 54 44 48 43 43 40"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {/* Rose Spiral Center */}
      <path
        d="M 54 22 C 58 20 62 23 60 27 C 58 30 53 30 51 27 C 49 24 52 21 56 21"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 44 26 C 45 32 50 35 56 35 C 61 35 65 31 66 27"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Left Petal Flare */}
      <path
        d="M 36 28 C 31 32 32 42 39 46 C 44 48 51 46 54 44"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Petal Swell & Stylized R Loop */}
      <path
        d="M 64 26 C 73 28 80 34 80 43 C 80 52 70 57 60 55 C 55 54 52 50 51 45"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      {/* Stem of the R flowing downwards with dynamic flourish */}
      <path
        d="M 50 45 L 48 65 C 48 66 48 68 49 70"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 55 53 C 58 60 62 70 72 73 C 76 74 81 72 82 67 C 78 69 72 67 67 61 C 63 56 60 52 58 48"
        stroke={`url(#${roseGoldId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{Emblem}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 cursor-pointer group ${className}`}>
        {Emblem}
        <div className="flex flex-col">
          <span
            className={`font-serif-boutique font-semibold tracking-wide leading-none ${currentSize.text} ${
              light ? 'text-[#FBF9F6]' : 'text-[#2C362D]'
            }`}
            style={{
              background: light ? 'none' : 'linear-gradient(135deg, #7C4B3F 0%, #B87C6B 50%, #D49A89 100%)',
              WebkitBackgroundClip: light ? 'none' : 'text',
              WebkitTextFillColor: light ? 'currentColor' : 'transparent',
            }}
          >
            Rosanfer
          </span>
          <span
            className={`font-serif-boutique tracking-[0.2em] font-medium ${currentSize.sub} ${
              light ? 'text-[#FBF9F6]/90' : 'text-[#7C4B3F]'
            }`}
            style={{
              background: light ? 'none' : 'linear-gradient(135deg, #7C4B3F 0%, #A26858 50%, #B87C6B 100%)',
              WebkitBackgroundClip: light ? 'none' : 'text',
              WebkitTextFillColor: light ? 'currentColor' : 'transparent',
            }}
          >
            Florería
          </span>
        </div>
      </div>
    );
  }

  // Full stacked variant (ideal for boutique branding, headers, and footer)
  return (
    <div className={`flex flex-col items-center text-center cursor-pointer group ${className}`}>
      {Emblem}
      <div className="mt-1 flex flex-col items-center">
        <span
          className={`font-serif-boutique font-bold tracking-wide leading-none ${currentSize.text} ${
            light ? 'text-[#FBF9F6]' : 'text-[#2C362D]'
          }`}
          style={{
            background: light ? 'none' : 'linear-gradient(135deg, #6C3F35 0%, #B87C6B 60%, #D49A89 100%)',
            WebkitBackgroundClip: light ? 'none' : 'text',
            WebkitTextFillColor: light ? 'currentColor' : 'transparent',
          }}
        >
          Rosanfer
        </span>
        <span
          className={`font-serif-boutique tracking-[0.25em] font-medium ${currentSize.sub} ${
            light ? 'text-[#FBF9F6]/90' : 'text-[#7C4B3F]'
          }`}
          style={{
            background: light ? 'none' : 'linear-gradient(135deg, #7C4B3F 0%, #A26858 50%, #B87C6B 100%)',
            WebkitBackgroundClip: light ? 'none' : 'text',
            WebkitTextFillColor: light ? 'currentColor' : 'transparent',
          }}
        >
          Florería
        </span>
      </div>
    </div>
  );
};
