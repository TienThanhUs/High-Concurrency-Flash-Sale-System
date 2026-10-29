import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton, PixelCard } from '../components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <PixelCard title="404 // Game Over">
          <div className="space-y-4 py-4">
            <div className="text-[48px] select-none">👾</div>
            <h1 className="font-pixel text-[24px] text-pixel-red font-bold">
              404 // Không tìm thấy trang
            </h1>
            <p className="font-body text-[16px] text-text-muted">
              Đường dẫn bạn yêu cầu không tồn tại hoặc bạn đã đi lạc vào ngục tối khác.
            </p>
            <div className="pt-2">
              <Link to="/">
                <PixelButton variant="primary" size="md">
                  Về trang chủ Flash Sale
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  );
};
