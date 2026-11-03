import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Extra classes for the scrollable body */
  bodyClassName?: string;
}

/**
 * iOS-style liquid glass sheet: slides up from the bottom, dims the page,
 * closes on backdrop tap, Escape or by dragging the grabber down.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, title, children, bodyClassName = '' }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const onTouchStart = (e: React.TouchEvent) => {
    drag.current = { startY: e.touches[0].clientY, dy: 0 };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const el = panelRef.current;
    if (!drag.current || !el) return;
    const dy = Math.max(0, e.touches[0].clientY - drag.current.startY);
    drag.current.dy = dy;
    el.style.transition = 'none';
    el.style.transform = `translate3d(0, ${dy}px, 0)`;
  };
  const onTouchEnd = () => {
    const el = panelRef.current;
    const dy = drag.current?.dy ?? 0;
    drag.current = null;
    if (!el) return;
    el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    if (dy > 110) {
      el.style.transform = 'translate3d(0, 100%, 0)';
      window.setTimeout(onClose, 220);
    } else {
      el.style.transform = '';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet-backdrop absolute inset-0 bg-night/45" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="sheet-enter lg absolute inset-x-2 bottom-2 sm:inset-x-0 sm:mx-auto sm:w-[min(560px,calc(100%-2rem))] rounded-[2rem] max-h-[88dvh] flex flex-col outline-none text-ink [--lg-bg:rgba(255,255,255,0.82)] [--lg-bg-2:rgba(255,248,244,0.72)] [--lg-blur:26px]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="shrink-0 pt-2.5 touch-none cursor-grab" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <span className="block mx-auto w-10 h-1.5 rounded-full bg-ink/20" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-3">
            <h2 className="font-display font-extrabold text-xl tracking-tight">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="lg lg-press w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={`overflow-y-auto overscroll-contain px-5 pb-5 ${bodyClassName}`}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
