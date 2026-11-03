import { useEffect, useState } from 'react';

/** Opening hours 12:30 – 03:30, evaluated in Palermo's time zone */
export const computeIsOpenNow = (): boolean => {
  const parts = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const totalMinutes = hour * 60 + minute;
  return totalMinutes >= 750 || totalMinutes < 210;
};

/** Live open/closed status (null until mounted, so prerendered HTML never disagrees) */
export const useIsOpenNow = () => {
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setIsOpenNow(computeIsOpenNow());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return isOpenNow;
};

/** Id of the section currently crossing the middle of the viewport */
export const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState('');
  const key = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
};

/**
 * True while a [data-surface="dark"] block sits under the top (or bottom) edge of
 * the viewport — lets floating glass switch to its dark tint, like iOS does.
 */
export const useOverDark = (edge: 'top' | 'bottom') => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = Array.from(document.querySelectorAll('[data-surface="dark"]'));
    if (!els.length) return;
    const hits = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? hits.add(e.target) : hits.delete(e.target)));
        setDark(hits.size > 0);
      },
      { rootMargin: edge === 'top' ? '0px 0px -93% 0px' : '-93% 0px 0px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [edge]);
  return dark;
};

/** prefers-reduced-motion, kept live via the matchMedia change event */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};
