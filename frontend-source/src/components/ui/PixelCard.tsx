import React from 'react';

export interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerAction?: React.ReactNode;
  headerIcon?: React.ReactNode;
  interactive?: boolean;
  variant?: 'default' | 'inset';
  children: React.ReactNode;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  title,
  headerAction,
  headerIcon,
  interactive = false,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const isDefault = variant === 'default';

  return (
    <div
      className={`
        border-4 border-outline rounded-none
        ${
          isDefault
            ? 'bg-bg-panel shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,.35),inset_4px_4px_0_0_rgba(255,255,255,.18),4px_4px_0_0_var(--outline)]'
            : 'bg-bg-inset shadow-[inset_4px_4px_0_0_rgba(0,0,0,.5),inset_-4px_-4px_0_0_rgba(255,255,255,.08)]'
        }
        ${
          interactive
            ? 'cursor-pointer transition-transform duration-75 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,.35),inset_4px_4px_0_0_rgba(255,255,255,.18),6px_6px_0_0_var(--outline)] active:translate-x-1 active:translate-y-1 active:shadow-[inset_4px_4px_0_0_rgba(0,0,0,.35),inset_-4px_-4px_0_0_rgba(255,255,255,.18),2px_2px_0_0_var(--outline)]'
            : ''
        }
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-panel-light border-b-4 border-outline">
          <div className="flex items-center gap-2">
            {headerIcon && <span className="text-pixel-yellow">{headerIcon}</span>}
            <h3 className="font-pixel text-[16px] md:text-[24px] font-bold text-text-main">
              {title}
            </h3>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};
