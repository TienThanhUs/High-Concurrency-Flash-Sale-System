import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PixelButton,
  PixelCard,
  PixelBadge,
  PixelModal,
  ProductImage,
  PixelLoading,
  PixelEmpty,
  PixelError,
} from '../components/ui';
import { PixelIconClock } from '../components/icons/PixelIcon';
import { orderService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandler';
import { Order, OrderStatus } from '../types/order';

interface CachedProductInfo {
  name: string;
  price: number;
  originalPrice?: number;
}

export const OrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel order modal
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCachedProductInfo = (campaignItemId: string): CachedProductInfo => {
    try {
      const stored = localStorage.getItem(`flashmart_item_${campaignItemId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore JSON parse errors
    }
    return { name: 'Sản phẩm Flash Sale', price: 0 };
  };

  const fetchOrders = useCallback(async (isPollingCall = false) => {
    if (!isPollingCall) setLoading(true);
    setError(null);

    try {
      const list = await orderService.getMyOrders();
      // Sort newest first
      list.sort((a, b) => b.id - a.id);
      setOrders(list);
    } catch (err) {
      if (!isPollingCall) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      }
    } finally {
      if (!isPollingCall) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-poll if there are PENDING orders
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === 'PENDING');

    if (hasPending) {
      pollIntervalRef.current = setInterval(() => {
        fetchOrders(true);
      }, 2000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orders, fetchOrders]);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);

    try {
      const updated = await orderService.cancelOrder(cancellingOrder.id);
      showToast(`Đã hủy đơn hàng #${updated.id} thành công!`, 'info');
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: 'CANCELLED' } : o))
      );
      setCancellingOrder(null);
    } catch (err) {
      const parsed = parseApiError(err);
      showToast(parsed.message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <PixelBadge variant="green">Đã xác nhận</PixelBadge>;
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 font-pixel text-[16px] bg-pixel-yellow text-[#261a00] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)] px-2 py-0.5 border-2 border-outline font-bold animate-pulse">
            <PixelIconClock size={14} /> Đang xử lý...
          </span>
        );
      case 'CANCELLED':
        return <PixelBadge variant="red">Đã hủy</PixelBadge>;
      default:
        return <PixelBadge variant="gray">{status}</PixelBadge>;
    }
  };

  const formatVietnamTime = (dateStr: string) => {
    try {
      // Backend without timezone treated as Vietnam time
      const iso = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : `${dateStr}+07:00`;
      const date = new Date(iso);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <PixelLoading message="Đang tải lịch sử đơn hàng của bạn..." className="py-20" />;
  }

  if (error) {
    return (
      <div className="py-12">
        <PixelError message={error} onRetry={() => fetchOrders()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-3 border-outline">
        <div>
          <h1 className="font-pixel text-[24px] md:text-[32px] text-text-main font-bold">
            Đơn hàng của tôi ({orders.length})
          </h1>
          <p className="font-body text-[16px] text-text-muted mt-0.5">
            Quản lý các đơn hàng đã đặt trong các chiến dịch Flash Sale
          </p>
        </div>
        <PixelBadge variant="blue">Lịch sử giao dịch</PixelBadge>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <PixelEmpty
          title="Bạn chưa có đơn hàng nào"
          message="Hãy tham gia săn sale tại trang chủ để nhận các ưu đãi cực sốc!"
          actionText="Đến trang Flash Sale ngay"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cached = getCachedProductInfo(order.campaignItemId);
            const canCancel = order.status !== 'CANCELLED';

            return (
              <PixelCard key={order.id} className="bg-bg-panel/90 border-3 border-outline">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <ProductImage
                      productId={order.campaignItemId}
                      name={cached.name}
                      size={52}
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[16px] text-pixel-yellow font-bold">
                          Đơn hàng #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>

                      <h3 className="font-pixel text-[16px] md:text-[24px] text-text-main font-bold truncate">
                        {cached.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[16px] text-text-muted">
                        {cached.price > 0 && (
                          <span>
                            Giá săn sale:{' '}
                            <strong className="text-pixel-green font-pixel text-[16px]">
                              {cached.price.toLocaleString('vi-VN')} đ
                            </strong>
                          </span>
                        )}
                        <span>
                          Thời gian: <strong>{formatVietnamTime(order.createdAt)}</strong>
                        </span>
                        <span className="text-[16px] text-text-muted/60">
                          Mã chiến dịch: {order.campaignItemId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                    {canCancel && (
                      <PixelButton
                        variant="danger"
                        size="sm"
                        onClick={() => setCancellingOrder(order)}
                      >
                        Hủy đơn
                      </PixelButton>
                    )}
                    {order.status === 'CANCELLED' && (
                      <span className="font-pixel text-[16px] text-pixel-red-light">
                        Đã hủy thành công
                      </span>
                    )}
                  </div>
                </div>
              </PixelCard>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <PixelModal
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        title="Xác nhận hủy đơn hàng"
        footer={
          <>
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={() => setCancellingOrder(null)}
              disabled={isCancelling}
            >
              Giữ lại đơn
            </PixelButton>
            <PixelButton
              variant="danger"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={isCancelling}
            >
              Xác nhận hủy
            </PixelButton>
          </>
        }
      >
        <div className="space-y-3">
          <p>Bạn có chắc chắn muốn hủy đơn hàng #{cancellingOrder?.id} không?</p>
          <p className="font-body text-[16px] text-pixel-yellow bg-bg-inset p-2.5 border-2 border-outline">
            Lưu ý: Sau khi hủy, lượt mua flash sale trong chiến dịch này sẽ không được hoàn lại tự
            động.
          </p>
        </div>
      </PixelModal>
    </div>
  );
};
