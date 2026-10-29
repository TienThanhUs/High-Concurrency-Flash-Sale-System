import React from 'react';

export interface PixelSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const PixelSpinner: React.FC<PixelSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'border-t-pixel-yellow',
}) => {
  const sizeMap = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Đang tải..."
      className={`inline-block ${sizeMap[size]} border-outline ${color} animate-spin rounded-none ${className}`}
    />
  );
};
