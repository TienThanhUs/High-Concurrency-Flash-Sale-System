import React from 'react';

export type BadgeVariant = 'green' | 'yellow' | 'blue' | 'red' | 'gray';

export interface PixelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  variant = 'yellow',
  children,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    green: 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)]',
    yellow: 'bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)]',
    blue: 'bg-pixel-blue text-[#ffffff] [text-shadow:2px_2px_0_#182e4a]',
    red: 'bg-pixel-red text-[#ffffff] [text-shadow:2px_2px_0_#3f1a1a]',
    gray: 'bg-pixel-gray text-[#e0e0e0] [text-shadow:2px_2px_0_#3f3f3f]',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-pixel text-[16px] font-bold
        px-2.5 py-0.5
        border-2 border-outline
        shadow-[2px_2px_0_0_var(--outline)]
        select-none leading-normal
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
