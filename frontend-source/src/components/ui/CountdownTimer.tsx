import React, { useEffect, useState, useRef } from 'react';
import { PixelIconClock } from '../icons/PixelIcon';

export interface CountdownTimerProps {
  endTime: string; // ISO string without timezone or with timezone
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  onExpire,
  className = '',
  showIcon = true,
  label = 'KẾT THÚC SAU',
}) => {
  // Parse endTime as Vietnam Time (UTC+7) if timezone is absent
  const parseTargetTime = (timeStr: string): number => {
    if (!timeStr) return Date.now();
    let iso = timeStr.trim();
    if (!iso.endsWith('Z') && !iso.includes('+') && !/-\d\d:\d\d$/.test(iso)) {
      iso = `${iso}+07:00`;
    }
    const parsed = new Date(iso).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  };

  const targetTime = parseTargetTime(endTime);
  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, targetTime - Date.now()));
  const expiredCalledRef = useRef(false);

  useEffect(() => {
    expiredCalledRef.current = false;

    const timer = setInterval(() => {
      const remaining = Math.max(0, targetTime - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (!expiredCalledRef.current) {
          expiredCalledRef.current = true;
          onExpire?.();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  const isExpired = timeLeft <= 0;

  return (
    <div
      className={`inline-flex items-center gap-2 p-2 bg-bg-inset border-2 border-outline shadow-pixel-sm ${className}`}
      role="timer"
      aria-live="polite"
    >
      {showIcon && (
        <span className="text-pixel-yellow animate-pixel-blink">
          <PixelIconClock size={16} />
        </span>
      )}

      {label && (
        <span className="font-pixel text-[16px] text-text-muted select-none">{label}:</span>
      )}

      {isExpired ? (
        <span className="font-pixel text-[16px] text-pixel-red font-bold">Đã kết thúc</span>
      ) : (
        <div className="flex items-center gap-1 font-logo text-[16px] text-pixel-yellow font-bold">
          <span className="bg-bg-panel px-1.5 py-0.5 border border-outline">{pad(hours)}</span>
          <span>:</span>
          <span className="bg-bg-panel px-1.5 py-0.5 border border-outline">{pad(minutes)}</span>
          <span>:</span>
          <span className="bg-bg-panel px-1.5 py-0.5 border border-outline">{pad(seconds)}</span>
        </div>
      )}
    </div>
  );
};
