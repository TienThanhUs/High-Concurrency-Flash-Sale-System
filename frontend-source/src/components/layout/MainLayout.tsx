import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { PixelBadge, PixelButton } from '../ui';
import { PixelIconZap, PixelIconUser, PixelIconShield } from '../icons/PixelIcon';

export const MainLayout: React.FC = () => {
  const { session, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Đã đăng xuất tài khoản.', 'info');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 font-pixel text-[16px] font-bold border-2 border-outline transition-transform ${
      isActive
        ? 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] translate-x-0.5 translate-y-0.5 shadow-none'
        : 'bg-bg-panel text-text-muted hover:text-text-main hover:bg-bg-panel-light shadow-[2px_2px_0_0_var(--outline)]'
    }`;

  return (
    <div className="min-h-screen bg-bg-page text-text-main flex flex-col font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-page border-b-4 border-outline shadow-[0_4px_0_0_var(--outline)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-pixel-yellow"
          >
            <span className="p-1.5 bg-pixel-yellow text-text-on-accent border-2 border-outline shadow-[2px_2px_0_0_var(--outline)] group-hover:scale-105 transition-transform">
              <PixelIconZap size={18} />
            </span>
            <span className="font-logo text-[16px] md:text-[24px] text-pixel-yellow tracking-wider">
              FLASHMART
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-2 overflow-x-auto py-1" aria-label="Menu chính">
            <NavLink to="/" end className={navLinkClass}>
              Flash Sale
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Sản phẩm
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                Đơn của tôi
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <span className="flex items-center gap-1">
                  <PixelIconShield size={12} /> Quản trị
                </span>
              </NavLink>
            )}
            <NavLink to="/demo" className={navLinkClass}>
              Demo UI
            </NavLink>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && session ? (
              <div className="flex items-center gap-2.5 bg-bg-panel px-3 py-1.5 border-2 border-outline shadow-[2px_2px_0_0_var(--outline)]">
                <span className="text-pixel-yellow">
                  <PixelIconUser size={14} />
                </span>
                <span className="font-pixel text-[16px] text-text-main max-w-[140px] md:max-w-[200px] truncate">
                  {session.email}
                </span>
                <PixelBadge variant={isAdmin ? 'yellow' : 'green'}>{session.role}</PixelBadge>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-pixel text-[16px] text-pixel-red-light hover:text-pixel-red underline ml-1 cursor-pointer"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <PixelButton variant="secondary" size="sm">
                    Đăng nhập
                  </PixelButton>
                </Link>
                <Link to="/register">
                  <PixelButton variant="primary" size="sm">
                    Đăng ký
                  </PixelButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bg-panel border-t-4 border-outline mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="font-logo text-[16px] text-pixel-yellow">FLASHMART</span>
              <span className="text-text-muted text-[16px]">• Bán hàng Flash Sale 8-bit</span>
            </div>
            <p className="font-body text-[16px] text-text-muted">
              Kiến trúc phân tán Micro-service: Spring Boot + Redis Lua Script + Kafka + React
              Tailwind
            </p>
          </div>
          <div className="font-pixel text-[16px] text-text-muted">
            Giao diện phong cách Minecraft // 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
