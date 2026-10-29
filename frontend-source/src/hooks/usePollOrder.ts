import { useEffect, useState, useRef, useCallback } from 'react';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types/order';

export interface UsePollOrderOptions {
  onConfirmed?: (order: Order) => void;
  onCancelled?: (order: Order) => void;
  onTimeout?: () => void;
  intervalMs?: number;
  maxAttempts?: number;
}

export function usePollOrder(orderId: number | null, options: UsePollOrderOptions = {}) {
  const { onConfirmed, onCancelled, onTimeout, intervalMs = 1500, maxAttempts = 20 } = options;

  const [order, setOrder] = useState<Order | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [status, setStatus] = useState<OrderStatus | 'IDLE' | 'TIMEOUT'>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!orderId) {
      stopPolling();
      setStatus('IDLE');
      return;
    }

    isCancelledRef.current = false;
    attemptsRef.current = 0;
    setIsPolling(true);
    setStatus('PENDING');
    setError(null);

    const poll = async () => {
      if (isCancelledRef.current) return;

      attemptsRef.current += 1;

      try {
        const currentOrder = await orderService.getOrderById(orderId);
        setOrder(currentOrder);

        if (currentOrder.status === 'CONFIRMED') {
          setStatus('CONFIRMED');
          stopPolling();
          onConfirmed?.(currentOrder);
          return;
        }

        if (currentOrder.status === 'CANCELLED') {
          setStatus('CANCELLED');
          stopPolling();
          onCancelled?.(currentOrder);
          return;
        }

        if (attemptsRef.current >= maxAttempts) {
          setStatus('TIMEOUT');
          stopPolling();
          onTimeout?.();
          return;
        }
      } catch {
        // Continue polling unless max attempts reached
        if (attemptsRef.current >= maxAttempts) {
          setError('Không thể lấy thông tin trạng thái đơn hàng.');
          setStatus('TIMEOUT');
          stopPolling();
          onTimeout?.();
        }
      }
    };

    // Immediate first check
    poll();

    // Setup interval polling
    timerRef.current = setInterval(poll, intervalMs);

    return () => {
      isCancelledRef.current = true;
      stopPolling();
    };
  }, [orderId, intervalMs, maxAttempts, onConfirmed, onCancelled, onTimeout, stopPolling]);

  return {
    order,
    isPolling,
    status,
    error,
    cancelPolling: stopPolling,
  };
}
