import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const PixelIconZap: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M9 1h4v4h-2v2h3v2h-2v2h-2v2H8v2H6v-6h2V7H5V5h2V3h2V1z" />
  </svg>
);

export const PixelIconClock: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M4 1h8v1h2v2h1v8h-1v2h-2v1H4v-1H2v-2H1V4h1V2h2V1zm0 2H3v2H2v6h1v2h1v1h8v-1h1v-2h1V5h-1V3h-1V2H4v1zm3 2h2v4h3v2H7V5z" />
  </svg>
);

export const PixelIconCheck: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M14 3h2v3h-2v2h-2v2h-2v2H8v2H6v-2H4v-2H2V8h2v2h2v2h2v-2h2V8h2V6h2V3z" />
  </svg>
);

export const PixelIconClose: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M2 2h3v3H2V2zm9 0h3v3h-3V2zm-3 5h2v2H8V7zM5 5h3v2H5V5zm6 0h-3v2h3V5zm0 4h-3v2h3V9zM5 9h3v2H5V9zm-3 2h3v3H2v-3zm9 0h3v3h-3v-3z" />
  </svg>
);

export const PixelIconAlert: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M7 1h2v3H7V1zm-2 3h2v2H5V4zm-2 2h2v2H3V6zm-2 2h2v5H1V8zm2 5h10v2H3v-2zm10-5h2v5h-2V8zm-2-2h2v2h-2V6zm-2-2h2v2h-2V4zM7 6h2v4H7V6zm0 5h2v2H7v-2z" />
  </svg>
);

export const PixelIconFlame: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M7 1h2v3H7V1zm3 3h2v3h-2V4zM5 4h2v3H5V4zM3 7h2v5H3V7zm8 0h2v5h-2V7zm-2 5h2v2H9v-2zm-4 0h2v2H5v-2zm2 2h2v1H7v-1zm0-6h2v4H7V8z" />
  </svg>
);

export const PixelIconUser: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M6 1h4v1h1v4h-1v1H6V6H5V2h1V1zm-3 8h10v2h2v4H1v-4h2V9zm2 2v3h6v-3H5z" />
  </svg>
);

export const PixelIconShoppingBag: React.FC<IconProps> = ({
  size = 16,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M5 2h6v2h2v10H3V4h2V2zm2 2h2V3H7v1zm-2 2H4v7h8V6h-1v2H9V6H7v2H5V6z" />
  </svg>
);

export const PixelIconPlus: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M7 2h2v5h5v2H9v5H7V9H2V7h5V2z" />
  </svg>
);

export const PixelIconTrash: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M5 2h6v1h3v2h-1v9H3V5H2V3h3V2zm0 4h2v6H5V6zm4 0h2v6H9V6z" />
  </svg>
);

export const PixelIconShield: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M2 1h12v3h-1v5h-1v2h-2v2H8v2H7v-2H5v-2H3V9H2V4H1V1h1zm2 3v5h2v2h2v2h1v-2h2V9h2V4H4z" />
  </svg>
);

export const PixelIconArrowRight: React.FC<IconProps> = ({
  size = 16,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={`inline-block pixelated ${className}`}
    {...props}
  >
    <path d="M8 2h2v2h2v2h2v2h-2v2h-2v2H8v-2H6v-2h6V7H6V5h2V2z" />
  </svg>
);

export const PixelSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = '',
}) => (
  <div
    style={{ width: size, height: size }}
    className={`inline-block border-2 border-outline border-t-pixel-yellow animate-spin ${className}`}
  />
);
