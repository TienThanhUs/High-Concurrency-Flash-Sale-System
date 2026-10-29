import React from 'react';
import { PixelSpinner } from './PixelSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'info' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isIcon?: boolean;
  children?: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isIcon = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Minecraft button styles:
  // Outer black border 3-4px, flat background, inner highlight (top/left) and shadow (bottom/right)
  const variantStyles: Record<ButtonVariant, string> = {
    // Primary: Desaturated Minecraft Green with dark text and light shadow
    primary: isSm
      ? 'bg-pixel-green text-[#0b1a09] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] shadow-[inset_3px_3px_0_0_var(--green-light),inset_-3px_-3px_0_0_var(--green-dark)] hover:bg-[#58b54e] hover:shadow-[inset_3px_3px_0_0_#86d87a,inset_-3px_-3px_0_0_#2e7226] hover:text-[#000000] hover:[text-shadow:1px_1px_0_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_0_0_var(--green-dark),inset_-3px_-3px_0_0_var(--green-light)]'
      : isLg
        ? 'bg-pixel-green text-[#0b1a09] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] shadow-[inset_4px_4px_0_0_var(--green-light),inset_-4px_-4px_0_0_var(--green-dark)] hover:bg-[#58b54e] hover:shadow-[inset_4px_4px_0_0_#86d87a,inset_-4px_-4px_0_0_#2e7226] hover:text-[#000000] hover:[text-shadow:1px_1px_0_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_0_0_var(--green-dark),inset_-4px_-4px_0_0_var(--green-light)]'
        : 'bg-pixel-green text-[#0b1a09] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] shadow-[inset_3px_3px_0_0_var(--green-light),inset_-3px_-3px_0_0_var(--green-dark)] hover:bg-[#58b54e] hover:shadow-[inset_3px_3px_0_0_#86d87a,inset_-3px_-3px_0_0_#2e7226] hover:text-[#000000] hover:[text-shadow:1px_1px_0_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_0_0_var(--green-dark),inset_-3px_-3px_0_0_var(--green-light)]',

    // Secondary: Classic Minecraft Gray Button with light text and hover yellow glow
    secondary: isSm
      ? 'bg-[#737373] text-[#e0e0e0] [text-shadow:2px_2px_0_#3f3f3f] shadow-[inset_3px_3px_0_0_#8e8e8e,inset_-3px_-3px_0_0_#3c3c3c] hover:bg-[#8b8b8b] hover:shadow-[inset_3px_3px_0_0_#a8a8a8,inset_-3px_-3px_0_0_#4d4d4d] hover:text-[#ffffa0] hover:[text-shadow:2px_2px_0_#3f3f28] active:shadow-[inset_3px_3px_0_0_#3c3c3c,inset_-3px_-3px_0_0_#8e8e8e]'
      : isLg
        ? 'bg-[#737373] text-[#e0e0e0] [text-shadow:2px_2px_0_#3f3f3f] shadow-[inset_4px_4px_0_0_#8e8e8e,inset_-4px_-4px_0_0_#3c3c3c] hover:bg-[#8b8b8b] hover:shadow-[inset_4px_4px_0_0_#a8a8a8,inset_-4px_-4px_0_0_#4d4d4d] hover:text-[#ffffa0] hover:[text-shadow:2px_2px_0_#3f3f28] active:shadow-[inset_4px_4px_0_0_#3c3c3c,inset_-4px_-4px_0_0_#8e8e8e]'
        : 'bg-[#737373] text-[#e0e0e0] [text-shadow:2px_2px_0_#3f3f3f] shadow-[inset_3px_3px_0_0_#8e8e8e,inset_-3px_-3px_0_0_#3c3c3c] hover:bg-[#8b8b8b] hover:shadow-[inset_3px_3px_0_0_#a8a8a8,inset_-3px_-3px_0_0_#4d4d4d] hover:text-[#ffffa0] hover:[text-shadow:2px_2px_0_#3f3f28] active:shadow-[inset_3px_3px_0_0_#3c3c3c,inset_-3px_-3px_0_0_#8e8e8e]',

    // Accent: Minecraft Gold / Yellow with dark text and light shadow
    accent: isSm
      ? 'bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)] shadow-[inset_3px_3px_0_0_var(--yellow-light),inset_-3px_-3px_0_0_var(--yellow-dark)] hover:bg-[#deb033] hover:shadow-[inset_3px_3px_0_0_#f5e07a,inset_-3px_-3px_0_0_#967112] hover:text-[#1a1000] active:shadow-[inset_3px_3px_0_0_var(--yellow-dark),inset_-3px_-3px_0_0_var(--yellow-light)]'
      : isLg
        ? 'bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)] shadow-[inset_4px_4px_0_0_var(--yellow-light),inset_-4px_-4px_0_0_var(--yellow-dark)] hover:bg-[#deb033] hover:shadow-[inset_4px_4px_0_0_#f5e07a,inset_-4px_-4px_0_0_#967112] hover:text-[#1a1000] active:shadow-[inset_4px_4px_0_0_var(--yellow-dark),inset_-4px_-4px_0_0_var(--yellow-light)]'
        : 'bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)] shadow-[inset_3px_3px_0_0_var(--yellow-light),inset_-3px_-3px_0_0_var(--yellow-dark)] hover:bg-[#deb033] hover:shadow-[inset_3px_3px_0_0_#f5e07a,inset_-3px_-3px_0_0_#967112] hover:text-[#1a1000] active:shadow-[inset_3px_3px_0_0_var(--yellow-dark),inset_-3px_-3px_0_0_var(--yellow-light)]',

    // Info: Minecraft Blue
    info: isSm
      ? 'bg-pixel-blue text-[#ffffff] [text-shadow:2px_2px_0_#182e4a] shadow-[inset_3px_3px_0_0_var(--blue-light),inset_-3px_-3px_0_0_var(--blue-dark)] hover:bg-[#498bc9] hover:shadow-[inset_3px_3px_0_0_#7bb2e6,inset_-3px_-3px_0_0_#25598d] active:shadow-[inset_3px_3px_0_0_var(--blue-dark),inset_-3px_-3px_0_0_var(--blue-light)]'
      : isLg
        ? 'bg-pixel-blue text-[#ffffff] [text-shadow:2px_2px_0_#182e4a] shadow-[inset_4px_4px_0_0_var(--blue-light),inset_-4px_-4px_0_0_var(--blue-dark)] hover:bg-[#498bc9] hover:shadow-[inset_4px_4px_0_0_#7bb2e6,inset_-4px_-4px_0_0_#25598d] active:shadow-[inset_4px_4px_0_0_var(--blue-dark),inset_-4px_-4px_0_0_var(--blue-light)]'
        : 'bg-pixel-blue text-[#ffffff] [text-shadow:2px_2px_0_#182e4a] shadow-[inset_3px_3px_0_0_var(--blue-light),inset_-3px_-3px_0_0_var(--blue-dark)] hover:bg-[#498bc9] hover:shadow-[inset_3px_3px_0_0_#7bb2e6,inset_-3px_-3px_0_0_#25598d] active:shadow-[inset_3px_3px_0_0_var(--blue-dark),inset_-3px_-3px_0_0_var(--blue-light)]',

    // Danger: Minecraft Redstone Red
    danger: isSm
      ? 'bg-pixel-red text-[#ffffff] [text-shadow:2px_2px_0_#3f1a1a] shadow-[inset_3px_3px_0_0_var(--red-light),inset_-3px_-3px_0_0_var(--red-dark)] hover:bg-[#c74747] hover:shadow-[inset_3px_3px_0_0_#eb7f7f,inset_-3px_-3px_0_0_#7d2222] active:shadow-[inset_3px_3px_0_0_var(--red-dark),inset_-3px_-3px_0_0_var(--red-light)]'
      : isLg
        ? 'bg-pixel-red text-[#ffffff] [text-shadow:2px_2px_0_#3f1a1a] shadow-[inset_4px_4px_0_0_var(--red-light),inset_-4px_-4px_0_0_var(--red-dark)] hover:bg-[#c74747] hover:shadow-[inset_4px_4px_0_0_#eb7f7f,inset_-4px_-4px_0_0_#7d2222] active:shadow-[inset_4px_4px_0_0_var(--red-dark),inset_-4px_-4px_0_0_var(--red-light)]'
        : 'bg-pixel-red text-[#ffffff] [text-shadow:2px_2px_0_#3f1a1a] shadow-[inset_3px_3px_0_0_var(--red-light),inset_-3px_-3px_0_0_var(--red-dark)] hover:bg-[#c74747] hover:shadow-[inset_3px_3px_0_0_#eb7f7f,inset_-3px_-3px_0_0_#7d2222] active:shadow-[inset_3px_3px_0_0_var(--red-dark),inset_-3px_-3px_0_0_var(--red-light)]',
  };

  // Font sizes: multiples of 8px (16, 24, 32), with body text >= 16px
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-[16px] min-h-[40px] px-4 py-1 border-[3px]',
    md: 'text-[16px] min-h-[48px] px-6 py-2 border-4',
    lg: 'text-[24px] min-h-[56px] px-8 py-2.5 border-4',
  };

  const iconSizeStyles: Record<ButtonSize, string> = {
    sm: 'w-[40px] h-[40px] min-h-[40px] p-0 flex items-center justify-center border-[3px]',
    md: 'w-[48px] h-[48px] min-h-[48px] p-0 flex items-center justify-center border-4',
    lg: 'w-[56px] h-[56px] min-h-[56px] p-0 flex items-center justify-center border-4',
  };

  const isDisabled = disabled || isLoading;

  const disabledStyles = isSm
    ? 'bg-[#555555] text-[#888888] [text-shadow:2px_2px_0_#282828] shadow-[inset_3px_3px_0_0_#686868,inset_-3px_-3px_0_0_#383838] cursor-not-allowed hover:filter-none active:translate-x-0 active:translate-y-0'
    : 'bg-[#555555] text-[#888888] [text-shadow:2px_2px_0_#282828] shadow-[inset_4px_4px_0_0_#686868,inset_-4px_-4px_0_0_#383838] cursor-not-allowed hover:filter-none active:translate-x-0 active:translate-y-0';

  return (
    <button
      type={props.type || 'button'}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-pixel font-normal select-none text-center
        border-[#000000] rounded-none
        transition-none
        focus-visible:outline-4 focus-visible:outline-dashed focus-visible:outline-pixel-yellow focus-visible:outline-offset-2
        ${isIcon ? iconSizeStyles[size] : sizeStyles[size]}
        ${
          isDisabled
            ? disabledStyles
            : `${variantStyles[variant]} active:translate-x-[1px] active:translate-y-[1px]`
        }
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <PixelSpinner size={isSm ? 'sm' : 'md'} />
          {!isIcon && <span>Đang xử lý...</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};
