import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelModal, PixelButton, ProductImage, PixelSpinner } from '../ui';
import { orderService } from '../../services/api';
import { parseApiError } from '../../utils/errorHandler';
import { useToast } from '../../hooks/useToast';
import { CampaignItem } from '../../types/campaign';
import { Product } from '../../types/product';

export interface HuntSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CampaignItem | null;
  product: Product | null;
  onSuccess?: () => void;
}

export const HuntSaleModal: React.FC<HuntSaleModalProps> = ({
  isOpen,
  onClose,
  item,
  product,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'confirm' | 'polling' | 'result'>('confirm');
  const [pollingStatusText, setPollingStatusText] = useState(
    'Đang gửi yêu cầu vào hàng đợi Kafka...'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setIsSubmitting(false);
      attemptsRef.current = 0;
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const productName = product?.name || 'Sản phẩm Flash Sale';
  const originalPrice = product?.originalPrice || item.flashSalePrice * 1.5;
  const salePrice = item.flashSalePrice;
  const discountPercent = Math.max(
    1,
    Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  );

  const startPollingForConfirmedOrder = (campaignItemId: string) => {
    setStep('polling');
    setPollingStatusText('Đang xác thực tồn kho trên Redis & chốt đơn qua Kafka...');

    pollTimerRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      try {
        const myOrders = await orderService.getMyOrders();
        // Look for the order matching this campaignItemId
        const match = myOrders.find((o) => o.campaignItemId === campaignItemId);

        if (match) {
          if (match.status === 'CONFIRMED') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            showToast(`Săn sale thành công! Đơn hàng #${match.id} đã được xác nhận.`, 'success');
            onSuccess?.();
            onClose();
            navigate('/orders');
            return;
          }

          if (match.status === 'CANCELLED') {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            showToast('Đơn hàng đã bị hủy do hết kho trong tích tắc!', 'error');
            onClose();
            return;
          }
        }

        if (attemptsRef.current >= 15) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          showToast('Đơn hàng đã được ghi nhận. Vui lòng kiểm tra trang Đơn của tôi!', 'info');
          onClose();
          navigate('/orders');
        }
      } catch {
        if (attemptsRef.current >= 15) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          showToast('Hệ thống đang xử lý đơn hàng. Vui lòng kiểm tra lại sau!', 'warning');
          onClose();
        }
      }
    }, 1500);
  };

  const handleConfirmHunt = async () => {
    setIsSubmitting(true);

    try {
      // 1. Save temp info to localStorage so /orders can display product name and price
      localStorage.setItem(
        `flashmart_item_${item.id}`,
        JSON.stringify({
          name: productName,
          price: salePrice,
          originalPrice,
          productId: item.productId,
        })
      );

      // 2. Call POST /api/v1/orders
      await orderService.placeOrder({ campaignItemId: item.id });

      // 3. Start polling for confirmation
      startPollingForConfirmedOrder(item.id);
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'polling' ? 'Đang xử lý đơn hàng...' : 'Xác nhận săn sale'}
      closeOnEsc={step !== 'polling'}
      closeOnBackdrop={step !== 'polling'}
      footer={
        step === 'confirm' ? (
          <>
            <PixelButton variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </PixelButton>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={handleConfirmHunt}
              isLoading={isSubmitting}
            >
              Xác nhận săn ngay
            </PixelButton>
          </>
        ) : null
      }
    >
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-bg-inset border-2 border-outline">
            <ProductImage
              productId={product?.id || item.productId}
              name={productName}
              size={56}
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-pixel text-[16px] text-text-main font-bold truncate">
                {productName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-pixel text-[16px] text-pixel-yellow font-bold">
                  {salePrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-[16px] text-text-muted line-through">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="font-pixel text-[16px] text-pixel-red-light bg-pixel-red/20 px-1 border border-pixel-red">
                  -{discountPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-bg-panel-light border-2 border-outline text-[16px] space-y-1.5">
            <p className="flex justify-between">
              <span className="text-text-muted">Tồn kho Flash Sale:</span>
              <span className="text-pixel-green font-bold">
                {item.availableQuantity} / {item.totalQuantity} sản phẩm
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-text-muted">Quy tắc săn sale:</span>
              <span className="text-pixel-yellow">Mỗi tài khoản chỉ được mua 1 lần</span>
            </p>
          </div>

          <p className="font-body text-[16px] text-text-muted">
            Khi bấm "Xác nhận", hệ thống sẽ trừ kho trực tiếp trên Redis và tạo đơn hàng bất đồng
            bộ.
          </p>
        </div>
      )}

      {step === 'polling' && (
        <div className="p-6 text-center flex flex-col items-center justify-center gap-4">
          <PixelSpinner size="lg" />
          <h4 className="font-pixel text-[16px] text-pixel-yellow font-bold">
            Hệ thống đang xếp hàng xử lý...
          </h4>
          <p className="font-body text-[16px] text-text-muted max-w-sm">{pollingStatusText}</p>
          <div className="w-full bg-bg-inset border-2 border-outline p-2 text-[16px] font-pixel text-text-muted">
            Vui lòng không đóng trình duyệt lúc này.
          </div>
        </div>
      )}
    </PixelModal>
  );
};
