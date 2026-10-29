import React, { useState } from 'react';

export interface ProductImageProps {
  productId?: string;
  name?: string;
  size?: number;
  scale?: 1 | 2 | 3 | 4 | 5 | 8 | 10;
  className?: string;
}

// Helper to remove Vietnamese tones and accents for keyword matching
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

// Detect category keyword to map to /products/<type>.png
function detectProductType(name?: string): string | null {
  if (!name) return null;
  const clean = removeVietnameseTones(name);

  if (clean.includes('ban phim') || clean.includes('keyboard') || clean.includes('phim co')) {
    return 'ban-phim';
  }
  if (clean.includes('chuot') || clean.includes('mouse')) {
    return 'chuot';
  }
  if (clean.includes('tai nghe') || clean.includes('headphone') || clean.includes('earphone')) {
    return 'tai-nghe';
  }
  if (
    clean.includes('tay cam') ||
    clean.includes('gamepad') ||
    clean.includes('controller') ||
    clean.includes('joystick')
  ) {
    return 'tay-cam';
  }
  if (clean.includes('the nho') || clean.includes('sd card') || clean.includes('microsd')) {
    return 'the-nho';
  }
  if (
    clean.includes('de sac') ||
    clean.includes('cu sac') ||
    clean.includes('sac nhanh') ||
    clean.includes('charger') ||
    clean.includes('cap sac') ||
    clean.includes('sac')
  ) {
    return 'sac';
  }
  if (clean.includes('dong ho') || clean.includes('watch')) {
    return 'dong-ho';
  }
  if (clean.includes('loa') || clean.includes('speaker')) {
    return 'loa';
  }
  if (clean.includes('man hinh') || clean.includes('monitor') || clean.includes('screen')) {
    return 'man-hinh';
  }

  return null;
}

// Deterministic 8-bit Sprite generator from productId hash
function renderFallbackSprite(productId: string) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash << 5) - hash + productId.charCodeAt(i);
    hash |= 0;
  }

  const palettes = [
    { bg: '#2b7a2b', main: '#4cb944', light: '#8be36a', dark: '#1e541e' }, // Forest Green
    { bg: '#1f548f', main: '#3a8fe0', light: '#7ec8ff', dark: '#143861' }, // Mana Blue
    { bg: '#b8860b', main: '#ffc72c', light: '#ffe580', dark: '#805d05' }, // Gold Yellow
    { bg: '#8f2020', main: '#e04646', light: '#ff8a80', dark: '#5e1515' }, // Fire Red
    { bg: '#602b7a', main: '#a044b9', light: '#d36ae3', dark: '#3f1a52' }, // Magic Purple
    { bg: '#3a3a5c', main: '#8e8ea5', light: '#c9c9d6', dark: '#121222' }, // Iron Gray
  ];

  const p = palettes[Math.abs(hash) % palettes.length];
  const pattern = Math.abs(hash >> 3) % 5;

  switch (pattern) {
    case 0: // 8-bit Sword
      return (
        <>
          <rect x="7" y="1" width="2" height="6" fill={p.light} />
          <rect x="7" y="7" width="2" height="4" fill={p.main} />
          <rect x="5" y="10" width="6" height="2" fill={p.dark} />
          <rect x="7" y="12" width="2" height="3" fill="#8e8ea5" />
        </>
      );
    case 1: // 8-bit Potion
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
    case 2: // 8-bit Shield
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
    case 3: // 8-bit Chest
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
    case 4: // 8-bit Chip / Cartridge
    default:
      return (
        <>
          <rect x="3" y="2" width="10" height="11" fill={p.dark} />
          <rect x="5" y="4" width="6" height="5" fill={p.main} />
          <rect x="6" y="5" width="4" height="3" fill={p.light} />
          <rect x="4" y="13" width="2" height="2" fill="#ffc72c" />
          <rect x="7" y="13" width="2" height="2" fill="#ffc72c" />
          <rect x="10" y="13" width="2" height="2" fill="#ffc72c" />
        </>
      );
  }
}

export const ProductImage: React.FC<ProductImageProps> = ({
  productId = 'flashmart-product',
  name = '',
  size,
  scale,
  className = '',
}) => {
  // Integer scaling: scale 2 = 32px, scale 3 = 48px, scale 4 = 64px, etc.
  const finalSize = size || (scale ? scale * 16 : 48);

  const detectedType = detectProductType(name);
  const [imgError, setImgError] = useState(false);

  const shouldTryFile = detectedType && !imgError;
  const imageSrc = shouldTryFile ? `/products/${detectedType}.png` : null;

  return (
    <div
      style={{ width: finalSize, height: finalSize }}
      className={`inline-flex items-center justify-center shrink-0 bg-bg-inset border-2 border-outline p-1 shadow-[2px_2px_0_0_var(--outline)] select-none overflow-hidden ${className}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name || 'Sản phẩm'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ imageRendering: 'pixelated' }}
          className="w-full h-full object-contain pixelated"
        />
      ) : (
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full pixelated"
          style={{ imageRendering: 'pixelated' }}
          aria-hidden="true"
        >
          <rect width="16" height="16" fill="#121222" />
          {renderFallbackSprite(productId)}
        </svg>
      )}
    </div>
  );
};
