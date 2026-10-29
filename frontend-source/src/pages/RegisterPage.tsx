import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PixelButton, PixelInput, PixelCard, PixelBadge } from '../components/ui';
import { PixelIconZap } from '../components/icons/PixelIcon';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';

export const RegisterPage: React.FC = () => {
  const { loginWithToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Client-side validations matching backend constraints
    const errors: Record<string, string> = {};
    if (!username.trim()) {
      errors.username = 'Tên người dùng không được để trống';
    } else if (username.trim().length < 8 || username.trim().length > 50) {
      errors.username = 'Tên người dùng phải từ 8 đến 50 ký tự';
    }

    if (!email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Định dạng email không hợp lệ';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      // User instruction: "Đăng ký xong dùng luôn JWT trả về để đăng nhập"
      loginWithToken(res.jwt);
      showToast('Đăng ký tài khoản thành công! Tự động đăng nhập.', 'success');
      navigate('/', { replace: true });
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
        <PixelCard title="Tạo tài khoản mới" headerIcon={<PixelIconZap size={16} />}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-outline">
              <span className="font-logo text-[16px] text-pixel-yellow flex items-center justify-center gap-1.5">
                <PixelIconZap size={18} /> GIA NHẬP FLASHMART
              </span>
              <p className="font-body text-[16px] text-text-muted mt-1">
                Tạo tài khoản nhanh để sẵn sàng săn các đợt flash sale
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
              label="Tên người dùng (Username)"
              placeholder="nhap-username-tu-8-ky-tu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={fieldErrors.username}
              helperText="Yêu cầu từ 8 đến 50 ký tự"
              required
              autoComplete="username"
            />

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
              autoComplete="new-password"
            />

            <PixelButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-2"
            >
              Đăng ký và săn sale ngay
            </PixelButton>

            <div className="pt-3 border-t-2 border-outline text-center space-y-2">
              <p className="font-body text-[16px] text-text-muted">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-pixel text-[16px] text-pixel-yellow hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
              <div className="inline-block">
                <PixelBadge variant="green">Tự động kích hoạt</PixelBadge>
              </div>
            </div>
          </form>
        </PixelCard>
      </div>
    </div>
  );
};
