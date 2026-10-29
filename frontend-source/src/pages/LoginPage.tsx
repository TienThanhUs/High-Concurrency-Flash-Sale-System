import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PixelButton, PixelInput, PixelCard, PixelBadge } from '../components/ui';
import { PixelIconUser, PixelIconZap } from '../components/icons/PixelIcon';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';

export const LoginPage: React.FC = () => {
  const { loginWithToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Client validation
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email không được để trống';
    if (!password) errors.password = 'Mật khẩu không được để trống';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email: email.trim(), password });
      loginWithToken(res.jwt);
      showToast('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors(parsed.fieldErrors);
      }
      setGeneralError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PixelCard title="Đăng nhập FlashMart" headerIcon={<PixelIconUser size={16} />}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center pb-2 border-b-2 border-outline">
              <span className="font-logo text-[16px] text-pixel-yellow flex items-center justify-center gap-1.5">
                <PixelIconZap size={18} /> FLASHMART
              </span>
              <p className="font-body text-[16px] text-text-muted mt-1">
                Đăng nhập tài khoản để tham gia săn sale 8-bit
              </p>
            </div>

            {generalError && (
              <div
                role="alert"
                className="p-3 bg-pixel-red/20 border-2 border-pixel-red text-pixel-red-light font-body text-[16px]"
              >
                <span>▶ </span>
                {generalError}
              </div>
            )}

            <PixelInput
              label="Email"
              type="email"
              placeholder="nhap-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              required
              autoComplete="email"
            />

            <PixelInput
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
            />

            <PixelButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-2"
            >
              Đăng nhập ngay
            </PixelButton>

            <div className="pt-3 border-t-2 border-outline text-center space-y-2">
              <p className="font-body text-[16px] text-text-muted">
                Chưa có tài khoản săn sale?{' '}
                <Link
                  to="/register"
                  className="font-pixel text-[16px] text-pixel-yellow hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
              <div className="inline-block">
                <PixelBadge variant="gray">Bảo mật JWT 8-bit</PixelBadge>
              </div>
            </div>
          </form>
        </PixelCard>
      </div>
    </div>
  );
};
