import React from 'react';

export interface PixelProductAvatarProps {
  id?: string;
  size?: number;
  className?: string;
}

// Generate deterministic 8-bit pixel art sprite based on product id hash
export const PixelProductAvatar: React.FC<PixelProductAvatarProps> = ({
  id = 'flashmart-item',
  size = 48,
  className = '',
}) => {
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }

  // Predefined pixel palettes (retro RPG styles)
  const palettes = [
    { bg: '#2b7a2b', main: '#4cb944', light: '#8be36a', dark: '#1e541e' }, // Potion / Herb
    { bg: '#1f548f', main: '#3a8fe0', light: '#7ec8ff', dark: '#143861' }, // Mana / Crystal
    { bg: '#b8860b', main: '#ffc72c', light: '#ffe580', dark: '#805d05' }, // Gold / Treasure
    { bg: '#8f2020', main: '#e04646', light: '#ff8a80', dark: '#5e1515' }, // Ruby / Fire
    { bg: '#602b7a', main: '#a044b9', light: '#d36ae3', dark: '#3f1a52' }, // Magic / Relic
  ];

  const paletteIndex = Math.abs(hash) % palettes.length;
  const p = palettes[paletteIndex];

  // Pattern type (0: Sword, 1: Potion, 2: Shield, 3: Chest)
  const patternType = Math.abs(hash >> 3) % 4;

  const renderPattern = () => {
    switch (patternType) {
      case 0: // Pixel Sword
        return (
          <>
            <rect x="7" y="1" width="2" height="6" fill={p.light} />
            <rect x="7" y="7" width="2" height="4" fill={p.main} />
            <rect x="5" y="10" width="6" height="2" fill={p.dark} />
            <rect x="7" y="12" width="2" height="3" fill="#8e8ea5" />
          </>
        );
      case 1: // Pixel Potion
        return (
          <>
            <rect x="6" y="2" width="4" height="2" fill="#c9c9d6" />
            <rect x="7" y="4" width="2" height="2" fill="#55556b" />
            <rect x="5" y="6" width="6" height="2" fill={p.dark} />
            <rect x="4" y="8" width="8" height="5" fill={p.main} />
            <rect x="5" y="9" width="3" height="3" fill={p.light} />
            <rect x="5" y="13" width="6" height="1" fill={p.dark} />
          </>
        );
      case 2: // Pixel Shield
        return (
          <>
            <rect x="3" y="2" width="10" height="2" fill={p.dark} />
            <rect x="3" y="4" width="10" height="6" fill={p.main} />
            <rect x="6" y="4" width="4" height="6" fill={p.light} />
            <rect x="4" y="10" width="8" height="2" fill={p.main} />
            <rect x="5" y="12" width="6" height="2" fill={p.dark} />
            <rect x="7" y="14" width="2" height="1" fill={p.dark} />
          </>
        );
      case 3: // Pixel Treasure Chest
      default:
        return (
          <>
            <rect x="3" y="3" width="10" height="4" fill={p.dark} />
            <rect x="4" y="4" width="8" height="2" fill={p.main} />
            <rect x="2" y="7" width="12" height="2" fill="#0b0b14" />
            <rect x="7" y="6" width="2" height="3" fill="#ffe580" />
            <rect x="3" y="9" width="10" height="4" fill={p.dark} />
            <rect x="4" y="10" width="8" height="2" fill={p.light} />
          </>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-block shrink-0 bg-bg-inset border-2 border-outline p-1 shadow-[2px_2px_0_0_var(--outline)] select-none ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="w-full h-full pixelated"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect width="16" height="16" fill="#121222" />
        {renderPattern()}
      </svg>
    </div>
  );
};
