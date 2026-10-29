import React, { useEffect, useRef } from 'react';
import { PixelIconClose } from '../icons/PixelIcon';
import { PixelButton } from './PixelButton';

export interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
}

export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnEsc = true,
  closeOnBackdrop = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save element that had focus before opening modal
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

      // Focus first focusable element inside modal or the modal container itself
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 30);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      // Return focus when modal closes
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-bg-panel border-4 border-outline shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,.35),inset_4px_4px_0_0_rgba(255,255,255,.18),6px_6px_0_0_var(--outline)] outline-none"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-panel-light border-b-4 border-outline">
          <h2 className="font-pixel text-[24px] text-text-main tracking-normal truncate">
            {title}
          </h2>
          <PixelButton
            variant="danger"
            size="sm"
            isIcon
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="w-8 h-8 min-h-[32px] border-[3px]"
          >
            <PixelIconClose size={14} />
          </PixelButton>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 text-text-main font-body text-[16px] leading-relaxed max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 py-3 bg-bg-inset border-t-4 border-outline">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
