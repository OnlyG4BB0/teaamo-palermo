import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CircleHelp,
  Clapperboard,
  Clock,
  FlaskConical,
  House,
  Instagram,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TEAAMO_LINKS } from '../data/teaamoData';
import { useActiveSection, useIsOpenNow, useOverDark } from '../hooks/useSiteState';
import { useLiquidGlass } from './ui/LiquidGlass';
import { BottomSheet } from './ui/BottomSheet';

export const NAV_LINKS = [
  { href: '#menu', label: 'Menu', desc: 'Bubble tea, burger & dolci' },
  { href: '#boba-lab', label: 'Boba Lab', desc: 'Crea il tuo bubble tea in 3D' },
  { href: '#tiktok', label: 'TikTok', desc: 'I nostri video' },
  { href: '#delivery', label: 'Delivery', desc: 'Glovo & ritiro al locale' },
  { href: '#allergeni', label: 'Allergeni', desc: 'Vegan, senza glutine & lattosio' },
  { href: '#dove-siamo', label: 'Dove siamo', desc: 'Viale Strasburgo 378' },
  { href: '#faq', label: 'FAQ', desc: 'Domande frequenti' },
];

const SECTION_IDS = ['home', 'menu', 'boba-lab', 'tiktok', 'delivery', 'instagram', 'allergeni', 'dove-siamo', 'faq'];

/** Smooth-scroll to an in-page anchor after an overlay has released the scroll lock */
const scrollToHash = (hash: string) => {
  window.setTimeout(() => {
    const target = hash === '#top' ? document.body : document.querySelector(hash);
    if (hash === '#top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
};

/* ----------------------------------------------------------------------------
   Logo with a reading-progress ring
   ---------------------------------------------------------------------------- */
const ProgressLogo: React.FC = () => {
  const ringRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 22;
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        if (ringRef.current) ringRef.current.style.strokeDashoffset = String(circumference * (1 - progress));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [circumference]);
  return (
    <span className="relative w-11 h-11 shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF2E7E" />
            <stop offset="100%" stopColor="#A98BFF" />
          </linearGradient>
        </defs>
      </svg>
      <img
        src={`${import.meta.env.BASE_URL}teaamo-logo.png`}
        alt=""
        width={36}
        height={36}
        className="absolute inset-[4px] w-9 h-9 rounded-full object-cover group-hover:rotate-[-12deg] transition-transform duration-500"
      />
    </span>
  );
};

const OpenChip: React.FC<{ isOpenNow: boolean | null; dark?: boolean; className?: string }> = ({
  isOpenNow,
  dark = false,
  className = '',
}) =>
  isOpenNow === null ? null : (
    <span
      className={`lg inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-bold transition-colors duration-500 ${
        dark ? 'lg-dark text-white' : 'text-ink'
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 live-dot' : dark ? 'bg-white/40' : 'bg-ink/30'}`} />
      {isOpenNow ? 'Aperto ora' : 'Apre alle 12:30'}
    </span>
  );

/* ----------------------------------------------------------------------------
   Header: liquid glass pill on desktop, minimal glass bar on phones
   ---------------------------------------------------------------------------- */
export const SiteHeader: React.FC = () => {
  const isOpenNow = useIsOpenNow();
  const active = useActiveSection(SECTION_IDS);
  const onDark = useOverDark('top');
  const desktop = useLiquidGlass<HTMLElement>({ refract: true, strength: 14, bevel: 20, aberration: true, blur: 3 });
  const mobile = useLiquidGlass<HTMLDivElement>({ refract: true, strength: 12, bevel: 16, blur: 3 });
  const tone = onDark ? 'lg-dark text-white' : 'text-ink';

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
      {/* Desktop */}
      <nav
        ref={desktop.ref}
        {...desktop.glassHandlers}
        aria-label="Navigazione principale"
        className={`lg hidden lg:flex pointer-events-auto mx-auto max-w-6xl items-center justify-between gap-2 rounded-full p-2 transition-colors duration-500 ${tone}`}
      >
        {desktop.filter}
        <a href="#top" className="group flex items-center gap-2.5 pl-1 pr-2 min-w-0" aria-label="TeaAmo Palermo, torna all'inizio">
          <ProgressLogo />
          <span className="font-display font-extrabold text-xl tracking-tight">TeaAmo</span>
        </a>
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = `#${active}` === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'location' : undefined}
                className={`px-3.5 py-2 rounded-full text-[15px] font-semibold transition-all duration-300 ${
                  isActive
                    ? onDark
                      ? 'bg-white text-ink shadow-soft'
                      : 'bg-ink text-white shadow-soft'
                    : onDark
                      ? 'hover:bg-white/15'
                      : 'hover:bg-white/60'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <OpenChip isOpenNow={isOpenNow} dark={onDark} />
          <a
            href={TEAAMO_LINKS.glovo}
            target="_blank"
            rel="noopener noreferrer"
            className="lg lg-tint lg-press inline-flex items-center gap-1.5 rounded-full text-white px-5 py-3 font-display font-bold text-[15px]"
            style={{ '--lg-color': '#E0156A' } as React.CSSProperties}
          >
            Ordina
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </nav>

      {/* Phones & tablets */}
      <div
        ref={mobile.ref}
        {...mobile.glassHandlers}
        className={`lg lg:hidden pointer-events-auto mx-auto max-w-md flex items-center justify-between gap-2 rounded-full p-1.5 pr-2 transition-colors duration-500 ${tone}`}
      >
        {mobile.filter}
        <a href="#top" className="group flex items-center gap-2 min-w-0" aria-label="TeaAmo Palermo, torna all'inizio">
          <ProgressLogo />
          <span className="font-display font-extrabold text-lg tracking-tight">TeaAmo</span>
        </a>
        <div className="flex items-center gap-1.5">
          <OpenChip isOpenNow={isOpenNow} dark={onDark} className="!py-1.5" />
          <a
            href={`tel:${TEAAMO_LINKS.phone}`}
            aria-label={`Chiama ${TEAAMO_LINKS.phoneDisplay}`}
            className={`lg lg-press w-11 h-11 rounded-full flex items-center justify-center ${onDark ? 'lg-dark text-white' : 'text-ink'}`}
          >
            <Phone className="w-[18px] h-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
};

/* ----------------------------------------------------------------------------
   iOS-style tab bar (phones & tablets)
   ---------------------------------------------------------------------------- */
interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  sections: string[];
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: House, href: '#top', sections: ['home'] },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, href: '#menu', sections: ['menu'] },
  { id: 'lab', label: 'Boba Lab', icon: FlaskConical, href: '#boba-lab', sections: ['boba-lab'] },
  { id: 'video', label: 'Video', icon: Clapperboard, href: '#tiktok', sections: ['tiktok'] },
  { id: 'more', label: 'Altro', icon: LayoutGrid, sections: ['delivery', 'instagram', 'allergeni', 'dove-siamo', 'faq'] },
];

const MORE_LINKS: { label: string; desc: string; icon: LucideIcon; href: string; color: string; external?: boolean }[] = [
  { label: 'Delivery', desc: 'Glovo & ritiro', icon: Truck, href: '#delivery', color: '#FFC94A' },
  { label: 'Allergeni', desc: 'Vegan, gluten free', icon: ShieldCheck, href: '#allergeni', color: '#9AD96B' },
  { label: 'Dove siamo', desc: 'Mappa & recensioni', icon: MapPin, href: '#dove-siamo', color: '#FF2E7E' },
  { label: 'FAQ', desc: 'Domande frequenti', icon: CircleHelp, href: '#faq', color: '#A98BFF' },
  { label: 'Instagram', desc: '@teaamo_bubbletea', icon: Instagram, href: TEAAMO_LINKS.instagram, color: '#FF6BA8', external: true },
  { label: 'Google Maps', desc: 'Indicazioni', icon: MapIcon, href: TEAAMO_LINKS.googleMapsDirect, color: '#7CCBFF', external: true },
];

export const MobileTabBar: React.FC = () => {
  const active = useActiveSection(SECTION_IDS);
  const isOpenNow = useIsOpenNow();
  const onDark = useOverDark('bottom');
  const [compact, setCompact] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const glass = useLiquidGlass<HTMLElement>({ refract: true, strength: 16, bevel: 18, aberration: true, blur: 3 });

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.sections.includes(active))
  );

  // Shrinks while scrolling down, comes back on scroll up — like iOS 26
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < 240) setCompact(false);
        else if (dy > 8) setCompact(true);
        else if (dy < -8) setCompact(false);
        lastY = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-3 pointer-events-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
      >
        <div className="tabbar group mx-auto max-w-md flex items-center gap-2 pointer-events-auto" data-compact={compact}>
          <nav
            ref={glass.ref}
            {...glass.glassHandlers}
            aria-label="Navigazione rapida"
            className={`lg flex-1 rounded-full p-1.5 transition-[padding,color] duration-500 ${onDark ? 'lg-dark' : ''}`}
          >
            {glass.filter}
            <span
              className={`absolute top-1.5 bottom-1.5 left-1.5 rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                onDark
                  ? 'bg-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]'
                  : 'bg-white/75 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_6px_16px_-8px_rgba(29,11,51,0.45)]'
              }`}
              style={{ width: `calc((100% - 0.75rem) / ${TABS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
              aria-hidden="true"
            />
            <div className="relative grid grid-cols-5">
              {TABS.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = i === activeIndex;
                const cls = `flex flex-col items-center justify-center rounded-full py-2 group-data-[compact=true]:py-1.5 min-h-[44px] transition-colors duration-300 ${
                  isActive ? (onDark ? 'text-pop' : 'text-pop-ink') : onDark ? 'text-white' : 'text-ink'
                }`;
                const inner = (
                  <>
                    <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                    <span className="tabbar-label mt-0.5 text-[10.5px] font-bold leading-none overflow-hidden">{tab.label}</span>
                  </>
                );
                return tab.href ? (
                  <a key={tab.id} href={tab.href} className={cls} aria-current={isActive ? 'location' : undefined}>
                    {inner}
                  </a>
                ) : (
                  <button key={tab.id} type="button" onClick={() => setMoreOpen(true)} className={cls} aria-haspopup="dialog">
                    {inner}
                  </button>
                );
              })}
            </div>
          </nav>
          <a
            href={TEAAMO_LINKS.glovo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ordina su Glovo"
            className="lg lg-tint lg-press shrink-0 w-[62px] h-[62px] group-data-[compact=true]:w-[52px] group-data-[compact=true]:h-[52px] rounded-full flex flex-col items-center justify-center text-white transition-[width,height] duration-500"
            style={{ '--lg-color': '#E0156A' } as React.CSSProperties}
          >
            <ShoppingBag className="w-[22px] h-[22px]" aria-hidden="true" />
            <span className="tabbar-label mt-0.5 text-[10px] font-extrabold leading-none overflow-hidden">Ordina</span>
          </a>
        </div>
      </div>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Esplora TeaAmo">
        <div className="grid grid-cols-2 gap-2.5">
          {MORE_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (link.external) return;
                  e.preventDefault();
                  setMoreOpen(false);
                  scrollToHash(link.href);
                }}
                className="lg lg-press rounded-3xl p-4 flex flex-col gap-3 min-h-[112px]"
              >
                <span
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${link.color}33`, color: link.color === '#FFC94A' ? '#7A5200' : link.color }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-display font-bold text-[15px] text-ink">
                    {link.label}
                    {link.external && <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />}
                  </span>
                  <span className="block text-xs text-ink-soft">{link.desc}</span>
                </span>
              </a>
            );
          })}
        </div>
        <div className="mt-3 lg rounded-3xl p-4 flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-ink text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-bold text-ink">12:30 – 03:30 · tutti i giorni</span>
            <span className="block text-xs text-ink-soft truncate">Viale Strasburgo 378, Palermo</span>
          </span>
          {isOpenNow !== null && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${isOpenNow ? 'bg-emerald-100 text-emerald-700' : 'bg-ink/10 text-ink'}`}>
              {isOpenNow ? 'Aperto' : 'Chiuso'}
            </span>
          )}
        </div>
        <a
          href={`tel:${TEAAMO_LINKS.phone}`}
          className="lg lg-tint lg-press mt-3 flex items-center justify-center gap-2 rounded-full py-4 font-display font-bold text-white"
          style={{ '--lg-color': '#1D0B33' } as React.CSSProperties}
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          Chiama {TEAAMO_LINKS.phoneDisplay}
        </a>
      </BottomSheet>
    </>
  );
};
