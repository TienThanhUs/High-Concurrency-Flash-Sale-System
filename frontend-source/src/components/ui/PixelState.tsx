import React from 'react';
import { PixelSpinner } from './PixelSpinner';
import { PixelButton } from './PixelButton';
import { PixelIconAlert } from '../icons/PixelIcon';

export const PixelLoading: React.FC<{ message?: string; className?: string }> = ({
  message = 'Đang tải dữ liệu 8-bit...',
  className = '',
}) => (
  <div className={`p-8 text-center flex flex-col items-center justify-center gap-3 ${className}`}>
    <PixelSpinner size="lg" />
    <p className="font-pixel text-[16px] text-text-muted animate-pulse">{message}</p>
  </div>
);

export const PixelEmpty: React.FC<{
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  title = 'Không có dữ liệu',
  message = 'Hiện chưa có mục nào để hiển thị trong khu vực này.',
  actionText,
  onAction,
  className = '',
}) => (
  <div
    className={`p-8 text-center bg-bg-panel border-4 border-outline shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,.35),inset_4px_4px_0_0_rgba(255,255,255,.18),4px_4px_0_0_var(--outline)] flex flex-col items-center justify-center gap-3 ${className}`}
  >
    <div className="w-12 h-12 bg-bg-inset border-2 border-outline flex items-center justify-center text-pixel-yellow text-[20px] select-none">
      📦
    </div>
    <h3 className="font-pixel text-[24px] text-pixel-yellow font-bold">{title}</h3>
    <p className="font-body text-[16px] text-text-muted max-w-md">{message}</p>
    {actionText && onAction && (
      <PixelButton variant="primary" size="sm" onClick={onAction} className="mt-2">
        {actionText}
      </PixelButton>
    )}
  </div>
);

export const PixelError: React.FC<{
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại!',
  onRetry,
  className = '',
}) => (
  <div
    className={`p-6 text-center bg-bg-panel border-4 border-pixel-red shadow-[4px_4px_0_0_var(--outline)] flex flex-col items-center justify-center gap-3 ${className}`}
  >
    <div className="w-10 h-10 bg-pixel-red text-white flex items-center justify-center border-2 border-outline">
      <PixelIconAlert size={20} />
    </div>
    <h3 className="font-pixel text-[24px] text-pixel-red font-bold">Lỗi kết nối máy chủ</h3>
    <p className="font-body text-[16px] text-text-main max-w-md">{message}</p>
    {onRetry && (
      <PixelButton variant="secondary" size="sm" onClick={onRetry} className="mt-2">
        Thử lại
      </PixelButton>
    )}
  </div>
);
