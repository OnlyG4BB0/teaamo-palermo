import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  threshold?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0,
  durationMs = 700,
  direction = 'up',
  threshold = 0.12,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const hiddenTransform =
    direction === 'up'
      ? 'translate-y-7'
      : direction === 'left'
      ? '-translate-x-7'
      : direction === 'right'
      ? 'translate-x-7'
      : 'scale-[0.96] translate-y-4';

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
      }}
      className={`reveal-spring ${
        visible
          ? 'opacity-100 translate-x-0 translate-y-0 scale-100 blur-0'
          : `opacity-0 ${hiddenTransform} blur-[2px]`
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedPrice: React.FC<AnimatedPriceProps> = ({
  value,
  prefix = '€ ',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [pulsing, setPulsing] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    if (Math.abs(startVal - endVal) < 0.001) return;

    setPulsing(true);
    const startTime = performance.now();
    const duration = 360;
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startVal + (endVal - startVal) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = endVal;
        setPulsing(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <span
      className={`inline-block transition-transform duration-300 ${
        pulsing ? 'scale-110 text-[#D4365C]' : 'scale-100'
      } ${className}`}
    >
      {prefix}
      {displayValue.toFixed(2)}
      {suffix}
    </span>
  );
};

interface MagneticWrapProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticWrap: React.FC<MagneticWrapProps> = ({
  children,
  className = '',
  strength = 0.22,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0)`,
        transition:
          offset.x === 0 && offset.y === 0
            ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.08s linear',
      }}
      className={className}
    >
      {children}
    </div>
  );
};

export const handleSpotlightMove = (e: React.MouseEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
};

export const triggerEditorialConfetti = (originEvent?: React.MouseEvent) => {
  try {
    let x = 0.5;
    let y = 0.6;
    if (originEvent && typeof window !== 'undefined') {
      x = originEvent.clientX / window.innerWidth;
      y = originEvent.clientY / window.innerHeight;
    }
    confetti({
      particleCount: 28,
      spread: 58,
      startVelocity: 26,
      gravity: 0.95,
      scalar: 0.85,
      origin: { x, y },
      colors: ['#D4365C', '#140E11', '#F59E0B', '#FFC2D1', '#FAF7F2'],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore confetti errors in headless environments
  }
};
