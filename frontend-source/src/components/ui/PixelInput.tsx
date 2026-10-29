import React, { forwardRef } from 'react';

export interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, helperText, startIcon, id, className = '', disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-pixel text-[16px] text-text-muted font-bold block"
          >
            {label}
            {props.required && <span className="text-pixel-red ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`
              w-full font-body text-[16px] text-text-main bg-bg-inset
              border-3 rounded-none py-2 px-3
              shadow-[inset_4px_4px_0_0_rgba(0,0,0,.5),inset_-4px_-4px_0_0_rgba(255,255,255,.08)]
              placeholder:text-text-muted/50
              outline-none
              transition-none
              ${startIcon ? 'pl-10' : ''}
              ${
                error
                  ? 'border-pixel-red focus:border-pixel-red'
                  : 'border-outline focus:border-pixel-yellow'
              }
              ${disabled ? 'opacity-60 cursor-not-allowed bg-bg-panel' : ''}
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="font-body text-[16px] text-pixel-red-light font-medium flex items-center gap-1 mt-0.5">
            <span>▶</span> {error}
          </p>
        )}

        {!error && helperText && (
          <p className="font-body text-[16px] text-text-muted mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

PixelInput.displayName = 'PixelInput';
