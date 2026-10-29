import React, { useState } from 'react';
import {
  PixelButton,
  PixelInput,
  PixelCard,
  PixelBadge,
  PixelProgressBar,
  PixelModal,
  CountdownTimer,
  PixelSpinner,
} from '../components/ui';
import {
  PixelIconZap,
  PixelIconShoppingBag,
  PixelIconTrash,
  PixelIconPlus,
  PixelIconShield,
  PixelIconCheck,
} from '../components/icons/PixelIcon';
import { useToast } from '../hooks/useToast';

type DemoTab = 'buttons' | 'inputs' | 'cards' | 'progress' | 'modals' | 'typography';

export const DemoPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DemoTab>('buttons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(60);
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const testString =
    'Săn ngay ưu đãi hôm nay, đơn hàng đã được xác nhận. Ắ Ằ Ẳ Ẵ Ặ Ế Ề Ể Ễ Ệ Ố Ồ Ổ Ỗ Ộ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự';

  const handleSimulateLoading = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      showToast('Đã hoàn tất thao tác mô phỏng!', 'success');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 0 && val.length < 5) {
      setInputError('Độ dài tối thiểu phải từ 5 ký tự');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-main p-4 md:p-8">
      {/* Header Banner */}
      <header className="max-w-4xl mx-auto mb-6">
        <div className="pixel-box p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-pixel-yellow text-text-on-accent border-2 border-outline shadow-[2px_2px_0_0_var(--outline)]">
              <PixelIconZap size={20} />
            </span>
            <div>
              <h1 className="font-logo text-[16px] text-pixel-yellow tracking-wider">
                FLASHMART // DEMO
              </h1>
              <p className="font-body text-[16px] text-text-muted mt-0.5">
                Thư viện thành phần pixel 8-bit theo phong cách Minecraft & Codédex
              </p>
            </div>
          </div>
          <PixelBadge variant="green">Hệ thống giao diện Pixel</PixelBadge>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-2" aria-label="Demo Tabs">
        {(
          [
            { id: 'buttons', label: 'Nút bấm' },
            { id: 'inputs', label: 'Ô nhập' },
            { id: 'cards', label: 'Thẻ & Huy hiệu' },
            { id: 'progress', label: 'Tiến độ & Đếm ngược' },
            { id: 'modals', label: 'Hộp thoại & Toast' },
            { id: 'typography', label: 'Kiểm tra Tiếng Việt' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-2 font-pixel text-[16px] font-bold border-3 border-outline transition-transform
                ${
                  isActive
                    ? 'bg-pixel-green text-[#10240d] [text-shadow:1px_1px_0_rgba(255,255,255,0.4)] translate-x-0.5 translate-y-0.5 shadow-none'
                    : 'bg-bg-panel text-text-muted hover:text-text-main shadow-[2px_2px_0_0_var(--outline)]'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Contents */}
      <main className="max-w-4xl mx-auto">
        {/* TAB 1: BUTTONS */}
        {activeTab === 'buttons' && (
          <PixelCard title="Bộ nút bấm (PixelButton) - Đủ 4 trạng thái & 5 biến thể">
            <div className="space-y-6">
              <div>
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  1. Các biến thể màu sắc (Một màu nhấn chính cho màn hình: Xanh lá)
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <PixelButton
                    variant="primary"
                    onClick={() => showToast('Nút Primary (Hành động chính)', 'success')}
                  >
                    Primary (Xanh lá)
                  </PixelButton>
                  <PixelButton
                    variant="secondary"
                    onClick={() => showToast('Nút Secondary', 'info')}
                  >
                    Secondary (Xám)
                  </PixelButton>
                  <PixelButton variant="accent" onClick={() => showToast('Nút Accent', 'warning')}>
                    Accent (Vàng)
                  </PixelButton>
                  <PixelButton variant="info" onClick={() => showToast('Nút Info', 'info')}>
                    Info (Xanh dương)
                  </PixelButton>
                  <PixelButton variant="danger" onClick={() => showToast('Nút Danger', 'error')}>
                    Danger (Đỏ)
                  </PixelButton>
                </div>
              </div>

              <div>
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  2. Trạng thái hoạt động (Normal, Hover, Active lún xuống, Disabled, Loading)
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <PixelButton variant="primary">Bình thường (Thử hover & click)</PixelButton>
                  <PixelButton variant="primary" disabled>
                    Bị vô hiệu (Disabled)
                  </PixelButton>
                  <PixelButton
                    variant="accent"
                    isLoading={btnLoading}
                    onClick={handleSimulateLoading}
                  >
                    Bấm thử Loading
                  </PixelButton>
                </div>
              </div>

              <div>
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  3. Kích cỡ (sm, md, lg) & Nút Icon vuông
                </h4>
                <div className="flex flex-wrap gap-3 items-center">
                  <PixelButton variant="info" size="sm">
                    Cỡ nhỏ (sm)
                  </PixelButton>
                  <PixelButton variant="info" size="md">
                    Cỡ vừa (md)
                  </PixelButton>
                  <PixelButton variant="info" size="lg">
                    Cỡ lớn (lg)
                  </PixelButton>
                  <PixelButton variant="danger" size="md" isIcon aria-label="Xóa">
                    <PixelIconTrash size={16} />
                  </PixelButton>
                  <PixelButton variant="primary" size="md" isIcon aria-label="Thêm">
                    <PixelIconPlus size={16} />
                  </PixelButton>
                  <PixelButton variant="accent" size="md" isIcon aria-label="Admin">
                    <PixelIconShield size={16} />
                  </PixelButton>
                </div>
              </div>
            </div>
          </PixelCard>
        )}

        {/* TAB 2: INPUTS */}
        {activeTab === 'inputs' && (
          <PixelCard title="Ô nhập liệu (PixelInput) - Ô trũng, viền dày, báo lỗi sắc nét">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PixelInput
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập của bạn..."
                helperText="Yêu cầu từ 8 đến 50 ký tự"
              />

              <PixelInput
                label="Kiểm tra validation lỗi"
                placeholder="Gõ dưới 5 ký tự để thấy lỗi..."
                value={inputValue}
                onChange={handleInputChange}
                error={inputError}
                required
              />

              <PixelInput
                label="Giá bán sản phẩm (kèm Icon)"
                type="number"
                placeholder="0"
                startIcon={<PixelIconShoppingBag size={18} />}
                helperText="Đơn vị: VNĐ"
              />

              <PixelInput
                label="Mã tài khoản (Trạng thái khóa)"
                value="FLASHMART-USER-2026"
                disabled
                helperText="Trường thông tin cố định"
              />
            </div>
          </PixelCard>
        )}

        {/* TAB 3: CARDS & BADGES */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <PixelCard title="Thẻ nội dung & Huy hiệu trạng thái">
              <div className="space-y-6">
                <div>
                  <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                    Huy hiệu (PixelBadge)
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    <PixelBadge variant="green">ĐANG DIỄN RA</PixelBadge>
                    <PixelBadge variant="yellow">GIẢM 50%</PixelBadge>
                    <PixelBadge variant="blue">ĐÃ XÁC NHẬN</PixelBadge>
                    <PixelBadge variant="red">HẾT HÀNG</PixelBadge>
                    <PixelBadge variant="gray">ĐÃ KẾT THÚC</PixelBadge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PixelCard title="Thẻ thường" className="bg-bg-panel">
                    <p className="font-body text-[15px] text-text-muted">
                      Khung nổi 3D pixel, viền đen đặc, hiển thị thông tin rõ ràng.
                    </p>
                  </PixelCard>

                  <PixelCard
                    title="Thẻ có thể bấm"
                    interactive
                    onClick={() => showToast('Bạn đã bấm vào thẻ tương tác!', 'info')}
                  >
                    <p className="font-body text-[15px] text-pixel-yellow">
                      Hover nhấc lên, click lún xuống. Thử rê chuột vào đây!
                    </p>
                  </PixelCard>

                  <PixelCard variant="inset">
                    <span className="font-pixel text-[11px] text-pixel-blue block mb-1">
                      Ô trũng Inset
                    </span>
                    <p className="font-body text-[15px] text-text-muted">
                      Dùng làm nền cho bảng tóm tắt đơn hoặc ô voucher.
                    </p>
                  </PixelCard>
                </div>
              </div>
            </PixelCard>
          </div>
        )}

        {/* TAB 4: PROGRESS & TIMER */}
        {activeTab === 'progress' && (
          <PixelCard title="Thanh tiến độ kho (Progress Bar) & Đồng hồ đếm ngược (CountdownTimer)">
            <div className="space-y-8">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-pixel text-[12px] text-text-muted">
                    Thanh tiến độ chia khối rời kiểu game (Health / Stock Bar)
                  </h4>
                  <div className="flex gap-2">
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setProgressVal((p) => Math.max(0, p - 10))}
                    >
                      -10%
                    </PixelButton>
                    <PixelButton
                      variant="primary"
                      size="sm"
                      onClick={() => setProgressVal((p) => Math.min(100, p + 10))}
                    >
                      +10%
                    </PixelButton>
                  </div>
                </div>

                <PixelProgressBar
                  current={progressVal}
                  total={100}
                  label="Tồn kho chiến dịch Flash Sale"
                />
              </div>

              {/* Countdown Timer */}
              <div className="pt-6 border-t-3 border-outline">
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  Đồng hồ đếm ngược Flash Sale (Coi chuỗi không timezone là giờ Việt Nam UTC+7)
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Countdown to 2 hours from now */}
                  <CountdownTimer
                    endTime={new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 19)}
                    label="KẾT THÚC SAU"
                  />
                  <CountdownTimer
                    endTime={new Date(Date.now() - 1000).toISOString().slice(0, 19)}
                    label="CHIẾN DỊCH CŨ"
                  />
                </div>
              </div>

              {/* Spinner */}
              <div className="pt-6 border-t-3 border-outline">
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  PixelSpinner độc lập (3 kích cỡ)
                </h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <PixelSpinner size="sm" />
                    <span className="font-body text-[14px]">Cỡ nhỏ (sm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PixelSpinner size="md" />
                    <span className="font-body text-[14px]">Cỡ vừa (md)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PixelSpinner size="lg" />
                    <span className="font-body text-[14px]">Cỡ lớn (lg)</span>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        )}

        {/* TAB 5: MODAL & TOAST */}
        {activeTab === 'modals' && (
          <PixelCard title="Hộp thoại Modal (Focus Trap) & Hệ thống Toast Thông báo">
            <div className="space-y-6">
              <div>
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  Hộp thoại Modal (Bẫy focus, đóng bằng phím ESC, trả focus về nút mở)
                </h4>
                <PixelButton variant="primary" onClick={() => setIsModalOpen(true)}>
                  Mở hộp thoại xác nhận
                </PixelButton>
              </div>

              <div className="pt-6 border-t-3 border-outline">
                <h4 className="font-pixel text-[12px] text-text-muted mb-3">
                  Bắn thông báo Toast (Tự ẩn sau 4 giây)
                </h4>
                <div className="flex flex-wrap gap-3">
                  <PixelButton
                    variant="primary"
                    onClick={() => showToast('Đặt đơn hàng thành công!', 'success')}
                  >
                    Toast Thành công
                  </PixelButton>
                  <PixelButton
                    variant="danger"
                    onClick={() => showToast('Sản phẩm đã hết hàng trong kho!', 'error')}
                  >
                    Toast Lỗi
                  </PixelButton>
                  <PixelButton
                    variant="accent"
                    onClick={() =>
                      showToast('Cảnh báo: Chỉ còn 1 lượt mua cho tài khoản này!', 'warning')
                    }
                  >
                    Toast Cảnh báo
                  </PixelButton>
                  <PixelButton
                    variant="info"
                    onClick={() => showToast('Hệ thống đang đồng bộ kho Kafka...', 'info')}
                  >
                    Toast Thông tin
                  </PixelButton>
                </div>
              </div>
            </div>
          </PixelCard>
        )}

        {/* TAB 6: TYPOGRAPHY TEST */}
        {activeTab === 'typography' && (
          <PixelCard title="Kiểm tra hiển thị chữ Tiếng Việt Minecraft (Monocraft + Pixelify Sans)">
            <div className="space-y-4">
              <p className="font-body text-[16px] text-text-muted">
                Kiểm tra chuỗi chuẩn: <strong className="text-pixel-yellow">"{testString}"</strong>{' '}
                ở các cỡ chữ bội số của 8px (16px, 24px, 32px).
              </p>

              <div className="p-4 bg-bg-inset border-3 border-outline space-y-4">
                <div>
                  <span className="font-pixel text-[16px] text-text-muted block mb-1">
                    16px (Thân bài tối thiểu, nhãn, nút bấm):
                  </span>
                  <p className="font-pixel text-[16px] text-text-main leading-relaxed">
                    {testString}
                  </p>
                </div>

                <div>
                  <span className="font-pixel text-[16px] text-text-muted block mb-1">
                    24px (Tiêu đề card, tiêu đề mục):
                  </span>
                  <p className="font-pixel text-[24px] text-pixel-green font-bold leading-snug">
                    {testString}
                  </p>
                </div>

                <div>
                  <span className="font-pixel text-[16px] text-text-muted block mb-1">
                    32px (Tiêu đề trang lớn):
                  </span>
                  <p className="font-pixel text-[32px] text-pixel-yellow font-bold leading-tight">
                    {testString}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-bg-panel-light border-2 border-outline space-y-2 text-[16px]">
                <div className="flex items-center gap-2 text-pixel-green font-pixel">
                  <PixelIconCheck size={16} />
                  <span>
                    Font stack: 'Monocraft', 'Pixelify Sans', monospace. Các chữ thiếu dấu trong
                    Monocraft rơi liền mạch sang Pixelify Sans.
                  </span>
                </div>
              </div>
            </div>
          </PixelCard>
        )}
      </main>

      {/* Modal Dialog */}
      <PixelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Xác nhận đơn hàng"
        footer={
          <>
            <PixelButton variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                showToast('Đã xác nhận săn sale thành công!', 'success');
              }}
            >
              Xác nhận
            </PixelButton>
          </>
        }
      >
        <div className="space-y-3">
          <p>Bạn có chắc chắn muốn đặt mua sản phẩm flash sale với ưu đãi đặc biệt này không?</p>
          <div className="p-3 bg-bg-inset border-2 border-outline flex items-center justify-between">
            <span className="font-bold text-pixel-yellow">Bàn phím cơ retro pixel</span>
            <span className="font-pixel text-pixel-green text-[16px]">199.000 đ</span>
          </div>
          <p className="text-[16px] text-text-muted">
            Mỗi tài khoản chỉ được mua 1 lượt mỗi chiến dịch. Hệ thống sẽ xử lý qua Redis và Kafka.
          </p>
        </div>
      </PixelModal>
    </div>
  );
};
