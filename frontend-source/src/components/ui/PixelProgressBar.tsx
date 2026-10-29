import React from 'react';

export interface PixelProgressBarProps {
  current: number;
  total: number;
  label?: string;
  variant?: 'green' | 'yellow' | 'red';
  showPercent?: boolean;
  className?: string;
}

export const PixelProgressBar: React.FC<PixelProgressBarProps> = ({
  current,
  total,
  label,
  variant,
  showPercent = true,
  className = '',
}) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;

  // Auto variant based on remaining if not specified
  const effectiveVariant = variant || (percent >= 80 ? 'red' : percent >= 50 ? 'yellow' : 'green');

  const variantStyles = {
    green: {
      bar: 'bg-pixel-green',
      highlight: 'bg-pixel-green-light',
    },
    yellow: {
      bar: 'bg-pixel-yellow',
      highlight: 'bg-pixel-yellow-light',
    },
    red: {
      bar: 'bg-pixel-red',
      highlight: 'bg-pixel-red-light',
    },
  }[effectiveVariant];

  const totalBlocks = 10;
  const activeBlocks = Math.round((percent / 100) * totalBlocks);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-[16px] font-pixel text-text-muted">
          <span>{label || 'Tiến độ'}</span>
          <span className="text-text-main font-bold">
            {current} / {total} {showPercent && `(${percent}%)`}
          </span>
        </div>
      )}

      {/* Discrete block health/progress bar */}
      <div className="h-6 w-full bg-bg-inset border-3 border-outline p-1 flex items-center gap-1 shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.5)]">
        {Array.from({ length: totalBlocks }).map((_, index) => {
          const isActive = index < activeBlocks;
          return (
            <div
              key={index}
              className={`
                flex-1 h-full transition-none
                ${
                  isActive
                    ? `${variantStyles.bar} border-t-2 ${variantStyles.highlight} border-b border-black/30`
                    : 'bg-bg-panel/40 border-t border-black/20'
                }
              `}
            />
          );
        })}
      </div>
    </div>
  );
};
