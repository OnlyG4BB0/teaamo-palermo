import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  CakeSlice,
  Citrus,
  Clock,
  Croissant,
  CupSoda,
  IceCreamCone,
  MapPin,
  Moon,
  Phone,
  Plus,
  Sandwich,
  Sparkles,
  Star,
  Sun,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  HERO_FLAVORS,
  HeroPresetFlavor,
  TEAAMO_LINKS,
  GLOVO_STORE_SECTIONS,
  FAQ_ITEMS,
} from './data/teaamoData';
import { StudioViewport3D } from './components/three/LazyStudioViewport3D';
import { BobaLabBuilder } from './components/BobaLabBuilder';
import { MenuShowcase } from './components/MenuShowcase';
import { TikTokFeedBoard } from './components/TikTokFeedBoard';
import { SocialAndReviews } from './components/SocialAndReviews';
import { RevealOnScroll, MagneticWrap } from './components/ui/AnimatedPrimitives';

type HeroModelCategory = 'cup' | 'fruittea' | 'burger-giove' | 'waffle' | 'crepe' | 'pancake';

interface HeroModelTab {
  id: HeroModelCategory;
  label: string;
  icon: LucideIcon;
  badge: string;
  title: string;
  price: string;
  description: string;
  glovoUrl?: string;
}

const HERO_MODELS_LIST: HeroModelTab[] = [
  {
    id: 'cup',
    label: 'Boba',
    icon: CupSoda,
    badge: 'Signature boba',
    title: 'Taro Dream Milk Tea',
    price: '7,00 €',
    description: 'Tè al latte con perle di tapioca cotte al miele e crema vellutata.',
    glovoUrl: GLOVO_STORE_SECTIONS.bubbleTea,
  },
  {
    id: 'fruittea',
    label: 'Fruit tea',
    icon: Citrus,
    badge: 'Fresco & frutta',
    title: 'Bulbasaur Fruit Tea',
    price: '7,00 €',
    description: 'Infusione fredda con fette di lime e popping boba alla frutta.',
    glovoUrl: GLOVO_STORE_SECTIONS.pokemon,
  },
  {
    id: 'burger-giove',
    label: 'Burger',
    icon: Sandwich,
    badge: 'SpacePolly · notte',
    title: 'Giove Double Smash',
    price: '11,90 €',
    description: 'Doppio smash, cheddar fuso, bacon croccante, anelli di cipolla e salsa algerina.',
    glovoUrl: GLOVO_STORE_SECTIONS.spacepolly,
  },
  {
    id: 'waffle',
    label: 'Waffle',
    icon: IceCreamCone,
    badge: 'Bubble waffle',
    title: 'Bubble Waffle & Gelato',
    price: '10,90 €',
    description: 'Cialda a bolle calda arrotolata a cono con gelato artigianale e cioccolato.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
  {
    id: 'crepe',
    label: 'Crêpes',
    icon: Croissant,
    badge: 'Dolci al piatto',
    title: 'Crêpe Nutella & Pan di Stelle',
    price: '8,50 €',
    description: 'Crêpe dorata con Nutella calda, panna e biscotti Pan di Stelle.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetSpecial,
  },
  {
    id: 'pancake',
    label: 'Pancake',
    icon: CakeSlice,
    badge: 'American bakery',
    title: 'Triple Stack Pancakes',
    price: '7,90 €',
    description: 'Tre pancake soffici con sciroppo ambrato, gelato e frutti di bosco.',
    glovoUrl: GLOVO_STORE_SECTIONS.sweetGelato,
  },
];

const NAV_LINKS = [
  { href: '#menu', label: 'Menu', desc: 'Bubble tea, burger & dolci' },
  { href: '#boba-lab', label: 'Boba Lab', desc: 'Crea il tuo bubble tea in 3D' },
  { href: '#tiktok', label: 'TikTok', desc: 'I nostri video' },
  { href: '#delivery', label: 'Delivery', desc: 'Glovo & ritiro al locale' },
  { href: '#allergeni', label: 'Allergeni', desc: 'Vegan, senza glutine & lattosio' },
  { href: '#dove-siamo', label: 'Dove siamo', desc: 'Viale Strasburgo 378' },
  { href: '#faq', label: 'FAQ', desc: 'Domande frequenti' },
];

const MARQUEE_WORDS = ['Bubble tea', 'Smash burger', 'Bubble waffle', 'Crêpes', 'Pancake', 'Gelato', 'Frozen yogurt'];
const PEARL_COLORS = ['#FF2E7E', '#A98BFF', '#FFC94A', '#9AD96B', '#7CCBFF'];

/** Opening hours 12:30 – 03:30, evaluated in Palermo's time zone */
const computeIsOpenNow = (): boolean => {
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
const useIsOpenNow = () => {
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setIsOpenNow(computeIsOpenNow());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return isOpenNow;
};

/** Splits a phrase into masked words that rise in sequence */
const RisingWords: React.FC<{ text: string; startMs: number; className?: string }> = ({
  text,
  startMs,
  className = '',
}) => (
  <>
    {text.split(' ').map((word, i, all) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className="word-rise">
          <span className={className} style={{ '--d': `${startMs + i * 80}ms` } as React.CSSProperties}>
            {word}
          </span>
        </span>
        {i < all.length - 1 ? ' ' : null}
      </React.Fragment>
    ))}
  </>
);

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/* Header state (scroll, active section, mobile menu) lives here so it never re-renders the page */
function SiteHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const isOpenNow = useIsOpenNow();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const progressRef = useRef<SVGCircleElement>(null);

  // Compact header + reading-progress ring around the logo
  useEffect(() => {
    let raf = 0;
    const circumference = 2 * Math.PI * 22;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        if (progressRef.current) {
          progressRef.current.style.strokeDashoffset = String(circumference * (1 - progress));
        }
        setIsScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Highlight the nav link of the section in view
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Full-screen mobile menu: lock page scroll, close on Escape / desktop resize
  useEffect(() => {
    document.documentElement.style.overflow = isMobileNavOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileNavOpen(false);
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => mq.matches && setIsMobileNavOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [isMobileNavOpen]);

  return (
    <>
      {/* ================= FLOATING PILL HEADER ================= */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
        <nav
          aria-label="Navigazione principale"
          className={`pointer-events-auto mx-auto max-w-6xl flex items-center justify-between gap-2 rounded-full p-1.5 sm:p-2 transition-all duration-500 ${
            isScrolled || isMobileNavOpen
              ? 'bg-white/85 backdrop-blur-xl border border-white shadow-[0_16px_44px_-18px_rgba(29,11,51,0.35)]'
              : 'bg-white/55 backdrop-blur-md border border-white/70'
          }`}
        >
          <a href="#top" className="group flex items-center gap-2.5 pl-1 pr-2 min-w-0" aria-label="TeaAmo Palermo, torna all'inizio">
            <span className="relative w-11 h-11 shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="22" fill="none" stroke="#FFE3EC" strokeWidth="3" />
                <circle
                  ref={progressRef}
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22}
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
            <span className="font-display font-extrabold text-xl tracking-tight text-ink">TeaAmo</span>
          </a>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'location' : undefined}
                  className={`px-3.5 py-2 rounded-full text-[15px] font-semibold transition-colors duration-300 ${
                    isActive ? 'bg-ink text-white' : 'text-ink hover:bg-blush'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isOpenNow !== null && (
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-sm font-semibold text-ink">
                <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 live-dot' : 'bg-ink/30'}`} />
                {isOpenNow ? 'Aperto ora' : 'Apre alle 12:30'}
              </span>
            )}
            <a
              href={TEAAMO_LINKS.glovo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-squish inline-flex items-center gap-1.5 rounded-full bg-pop-deep text-white px-4 sm:px-5 py-2.5 sm:py-3 font-display font-bold text-sm sm:text-[15px] shadow-pop"
            >
              Ordina
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((v) => !v)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isMobileNavOpen ? 'Chiudi menu' : 'Apri menu'}
              className="lg:hidden w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center btn-squish"
            >
              {isMobileNavOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <span className="flex flex-col gap-1.5" aria-hidden="true">
                  <span className="block w-5 h-0.5 rounded-full bg-white" />
                  <span className="block w-3.5 h-0.5 rounded-full bg-white ml-auto" />
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione"
        className={`lg:hidden fixed inset-0 z-40 bg-night-sky transition-all duration-500 ${
          isMobileNavOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <span className="blob w-80 h-80 -right-20 top-20 bg-pop/40" aria-hidden="true" />
        <span className="blob w-72 h-72 -left-24 bottom-10 bg-taro/30" aria-hidden="true" />
        <div className="relative h-full flex flex-col justify-between px-6 pt-28 pb-10 overflow-y-auto">
          <nav aria-label="Sezioni" className="space-y-1">
            {NAV_LINKS.map((link, idx) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileNavOpen(false)}
                style={{ transitionDelay: isMobileNavOpen ? `${idx * 50 + 80}ms` : '0ms' }}
                className={`group flex items-baseline gap-4 py-2 transition-all duration-500 ${
                  isMobileNavOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <span className="font-display text-sm font-bold text-pop">0{idx + 1}</span>
                <span>
                  <span className="block font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-white group-hover:text-pop transition-colors">
                    {link.label}
                  </span>
                  <span className="block text-sm text-haze">{link.desc}</span>
                </span>
              </a>
            ))}
          </nav>
          <div
            style={{ transitionDelay: isMobileNavOpen ? '480ms' : '0ms' }}
            className={`mt-10 flex flex-wrap gap-2 transition-all duration-500 ${isMobileNavOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            {[
              { href: TEAAMO_LINKS.instagram, label: 'Instagram' },
              { href: TEAAMO_LINKS.tiktok, label: 'TikTok' },
              { href: `tel:${TEAAMO_LINKS.phone}`, label: TEAAMO_LINKS.phoneDisplay },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('tel') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="glass-night rounded-full px-4 py-2.5 text-sm font-semibold text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </>
  );
}

/* Hero state (flavour auto-cycle, product switcher) is local: cycling never re-renders the rest of the page */
function Hero() {
  const [selectedHeroFlavor, setSelectedHeroFlavor] = useState<HeroPresetFlavor>(HERO_FLAVORS[0]);
  const [heroModelType, setHeroModelType] = useState<HeroModelCategory>('cup');
  const [autoCycleHero, setAutoCycleHero] = useState<boolean>(true);

  const activeHeroModel = HERO_MODELS_LIST.find((m) => m.id === heroModelType) || HERO_MODELS_LIST[0];
  const isDrink = heroModelType === 'cup' || heroModelType === 'fruittea';
  const stageAccent = isDrink ? selectedHeroFlavor.accentHex : '#FF2E7E';

  // Auto-cycle hero flavours every 4.5s until the visitor picks one
  useEffect(() => {
    if (!autoCycleHero || heroModelType !== 'cup') return;
    const id = window.setInterval(() => {
      setSelectedHeroFlavor((prev) => {
        const curIdx = HERO_FLAVORS.findIndex((f) => f.id === prev.id);
        return HERO_FLAVORS[(curIdx + 1) % HERO_FLAVORS.length];
      });
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoCycleHero, heroModelType]);

  const heroTitle = heroModelType === 'cup' ? selectedHeroFlavor.name : activeHeroModel.title;
  const heroPrice = heroModelType === 'cup' ? selectedHeroFlavor.price : activeHeroModel.price;
  const heroBadge = heroModelType === 'cup' ? selectedHeroFlavor.badge : activeHeroModel.badge;
  const heroOrderUrl =
    (heroModelType === 'cup' ? selectedHeroFlavor.glovoUrl : undefined) || activeHeroModel.glovoUrl || TEAAMO_LINKS.glovo;
  const cupConfig = useMemo(
    () => ({
      liquidTopColor: selectedHeroFlavor.liquidTopColor,
      liquidBottomColor: selectedHeroFlavor.liquidBottomColor,
      bobaColor: selectedHeroFlavor.bobaColor,
      bobaSecondaryColor: selectedHeroFlavor.bobaSecondaryColor,
      creamColor: selectedHeroFlavor.creamColor,
      hasPinkCream: true,
      showIce: true,
    }),
    [selectedHeroFlavor]
  );

  return (
        <section className="relative bg-day pt-28 sm:pt-36 pb-16 sm:pb-20 overflow-hidden" aria-labelledby="hero-title">
          <span className="blob w-[520px] h-[520px] -left-48 -top-40 bg-pop/25" aria-hidden="true" />
          <span className="blob w-[480px] h-[480px] -right-40 top-24 bg-mango/30" style={{ animationDelay: '-5s' }} aria-hidden="true" />
          <span className="blob w-[520px] h-[520px] left-1/3 -bottom-64 bg-taro/30" style={{ animationDelay: '-9s' }} aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hero-enter flex flex-wrap justify-center gap-2" style={delay(0)}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow-soft">
                <Sun className="w-4 h-4 text-mango" aria-hidden="true" />
                12:30
                <span className="w-6 h-px bg-ink/30" aria-hidden="true" />
                <Moon className="w-4 h-4 text-taro" aria-hidden="true" />
                03:30
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow-soft">
                <MapPin className="w-4 h-4 text-pop-ink" aria-hidden="true" />
                Viale Strasburgo 378 · Palermo
              </span>
            </div>

            <h1
              id="hero-title"
              className="mt-6 sm:mt-8 text-center font-display font-extrabold text-ink tracking-[-0.055em] leading-[0.86] text-[clamp(3.1rem,10.5vw,9.75rem)]"
            >
              <span className="block">
                <RisingWords text="Bubble tea" startMs={80} />
              </span>{' '}
              <span className="block">
                <RisingWords text="&" startMs={240} />{' '}
                <RisingWords text="smash burger" startMs={300} className="text-candy" />
              </span>{' '}
              <span className="block">
                <RisingWords text="a" startMs={480} />{' '}
                <span className="relative inline-block">
                  <RisingWords text="Palermo." startMs={540} />
                  <svg
                    className="scribble absolute left-0 -bottom-[0.08em] w-full h-[0.22em] overflow-visible"
                    viewBox="0 0 300 30"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    style={delay(1000)}
                  >
                    <path d="M4 20 C 60 4, 120 30, 180 14 S 270 6, 296 18" fill="none" stroke="#FF2E7E" strokeWidth="7" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                <span
                  className="pop-in sticker inline-block align-middle ml-[0.18em] -translate-y-[0.35em] rounded-full bg-mango px-[0.6em] py-[0.25em] text-[max(0.16em,0.8rem)] leading-none tracking-normal font-bold text-ink rotate-[8deg]"
                  style={{ ...delay(1200), '--r': '-20deg', '--r-end': '8deg' } as React.CSSProperties}
                >
                  fino alle 3:30
                </span>
              </span>
            </h1>

            <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)_minmax(0,290px)] items-center gap-6 lg:gap-4">
              {/* Product on stage */}
              <aside className="order-2 lg:order-1 hero-enter" style={delay(700)} aria-live="polite">
                <div className="glass rounded-4xl p-6 shadow-soft">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-xs font-bold uppercase tracking-wide text-pop-ink">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    {heroBadge}
                  </span>
                  <p key={heroTitle} style={delay(0)} className="hero-enter mt-3 font-display font-extrabold text-2xl sm:text-[1.7rem] leading-tight tracking-tight text-ink">
                    {heroTitle}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{activeHeroModel.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-display font-extrabold text-3xl text-ink">{heroPrice}</span>
                    <a
                      href={heroOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ordina ${heroTitle} su Glovo`}
                      className="btn-squish inline-flex items-center gap-1.5 rounded-full bg-pop-deep text-white px-4 py-2.5 font-display font-bold shadow-pop"
                    >
                      Ordina
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                  {isDrink && (
                    <div className="mt-5 pt-5 border-t border-ink/10">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                        Scegli il gusto {autoCycleHero && heroModelType === 'cup' ? '· in rotazione' : ''}
                      </p>
                      <div className="mt-3 flex items-center gap-2.5">
                        {HERO_FLAVORS.map((flav) => {
                          const active = selectedHeroFlavor.id === flav.id;
                          return (
                            <button
                              key={flav.id}
                              type="button"
                              onClick={() => {
                                setAutoCycleHero(false);
                                setSelectedHeroFlavor(flav);
                              }}
                              aria-label={`Gusto ${flav.name}`}
                              aria-pressed={active}
                              className={`w-9 h-9 rounded-full border-[3px] border-white shadow-soft transition-transform duration-300 ${
                                active ? 'scale-110 ring-2 ring-ink' : 'hover:scale-110'
                              }`}
                              style={{ background: `linear-gradient(160deg, ${flav.liquidTopColor}, ${flav.liquidBottomColor})` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* 3D stage */}
              <div className="order-1 lg:order-2 relative hero-enter" style={delay(350)}>
                <div
                  className="absolute inset-x-[4%] top-[6%] bottom-[16%] rounded-full transition-[background] duration-1000"
                  style={{
                    background: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${stageAccent}26 55%, ${stageAccent}00 72%)`,
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-[10%] top-[10%] bottom-[20%] rounded-full border-2 border-dashed border-white/80 animate-spin-slow" aria-hidden="true" />
                <p
                  className="hidden lg:flex absolute -left-6 top-[34%] z-10 items-start gap-1 font-hand text-2xl text-ink -rotate-6 pointer-events-none"
                  aria-hidden="true"
                >
                  toccami!
                  <svg width="46" height="38" viewBox="0 0 46 38" className="mt-3" fill="none">
                    <path d="M2 4 C 20 2, 34 10, 40 30" stroke="#1D0B33" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M33 26 L 40 31 L 43 22" stroke="#1D0B33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </p>
                <StudioViewport3D
                  modelType={heroModelType}
                  cupConfig={cupConfig}
                  accentColor={stageAccent}
                  className="h-[380px] sm:h-[460px] lg:h-[520px]"
                />
                <div className="relative mt-2 flex justify-center">
                  <div role="tablist" aria-label="Scegli il prodotto 3D" className="glass rounded-full p-1.5 flex gap-0.5 overflow-x-auto no-scrollbar max-w-full shadow-soft">
                    {HERO_MODELS_LIST.map((m) => {
                      const Icon = m.icon;
                      const isSelected = heroModelType === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="tab"
                          aria-selected={isSelected}
                          onClick={() => {
                            setHeroModelType(m.id);
                            if (m.id !== 'cup') setAutoCycleHero(false);
                          }}
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-2.5 text-[13px] xl:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                            isSelected ? 'bg-ink text-white shadow-soft' : 'text-ink hover:bg-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 hidden sm:block" aria-hidden="true" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick facts */}
              <aside className="order-3 grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4 hero-enter" style={delay(850)}>
                <div className="glass rounded-4xl p-4 lg:p-6 shadow-soft card-lift">
                  <div className="flex items-center gap-0.5 text-mango" aria-label="Valutazione 4,2 su 5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${i < 4 ? 'fill-current' : 'fill-current opacity-40'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <p className="mt-2 font-display font-extrabold text-2xl lg:text-4xl text-ink">4.2</p>
                  <p className="text-xs lg:text-sm text-ink-soft font-medium">540+ recensioni Google</p>
                </div>
                <div className="rounded-4xl p-4 lg:p-6 bg-ink text-white shadow-soft card-lift">
                  <Clock className="w-5 h-5 text-mango" aria-hidden="true" />
                  <p className="mt-2 font-display font-extrabold text-lg lg:text-3xl leading-tight">12:30–03:30</p>
                  <p className="text-xs lg:text-sm text-haze font-medium">tutti i giorni</p>
                </div>
                <a
                  href={TEAAMO_LINKS.glovo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-4xl p-4 lg:p-6 bg-mango text-ink shadow-soft card-lift block"
                >
                  <Bike className="w-5 h-5" aria-hidden="true" />
                  <p className="mt-2 font-display font-extrabold text-lg lg:text-3xl leading-tight">Delivery</p>
                  <p className="text-xs lg:text-sm font-semibold">a casa con Glovo →</p>
                </a>
              </aside>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 hero-enter" style={delay(1000)}>
              <MagneticWrap strength={0.15}>
                <a href="#menu" className="btn-squish inline-flex items-center gap-2 rounded-full bg-ink text-white px-8 py-4 font-display font-bold text-lg shadow-soft">
                  Scopri il menu
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </a>
              </MagneticWrap>
              <MagneticWrap strength={0.15}>
                <a href="#boba-lab" className="btn-squish inline-flex items-center gap-2 rounded-full bg-white text-ink px-8 py-4 font-display font-bold text-lg shadow-soft">
                  <Sparkles className="w-5 h-5 text-pop-ink" aria-hidden="true" />
                  Crea il tuo boba
                </a>
              </MagneticWrap>
            </div>
            <p className="mt-6 text-center max-w-2xl mx-auto text-ink-soft text-base sm:text-lg leading-relaxed hero-enter" style={delay(1100)}>
              Tè taiwanese con perle di tapioca calde preparate ogni giorno, Bubble Waffle con gelato artigianale, crêpes e gli smash burger SpacePolly. In Viale Strasburgo 378, aperti tutti i giorni dalle 12:30 alle 03:30.
            </p>
          </div>
        </section>

  );
}

export function App() {
  const isOpenNow = useIsOpenNow();

  return (
    <div className="min-h-screen">
      <div className="film-grain" aria-hidden="true" />
      <SiteHeader />

      <main id="top">
        <Hero />

        {/* ================= GIANT TICKER ================= */}
        <section className="relative py-10 sm:py-14 overflow-hidden bg-milk" aria-hidden="true">
          <div className="flex w-max animate-marquee marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
              <span key={`a-${i}`} className="inline-flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8">
                <span className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-[-0.04em] text-ink whitespace-nowrap">
                  {word}
                </span>
                <span
                  className="w-8 h-8 sm:w-12 sm:h-12 rounded-full shrink-0 shadow-soft"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, #ffffff 0 10%, ${PEARL_COLORS[i % PEARL_COLORS.length]} 30%)`,
                  }}
                />
              </span>
            ))}
          </div>
          <div className="mt-2 sm:mt-4 flex w-max animate-marquee-reverse marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].reverse().map((word, i) => (
              <span key={`b-${i}`} className="inline-flex items-center gap-6 sm:gap-8 pr-6 sm:pr-8">
                <span className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-[-0.04em] text-outline whitespace-nowrap">
                  {word}
                </span>
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-pop shrink-0" />
              </span>
            ))}
          </div>
        </section>

        <MenuShowcase />

        <BobaLabBuilder />

        {/* ================= SUNSET: DAY BECOMES NIGHT ================= */}
        <section
          className="relative overflow-hidden py-28 sm:py-40 text-center"
          style={{
            background:
              'linear-gradient(180deg, #EEE7FF 0%, #FFD6E4 18%, #FF9DBE 36%, #E25C9E 52%, #7A2E8C 68%, #2B1A4D 84%, #0E0620 100%)',
          }}
          aria-labelledby="sunset-title"
        >
          <span
            className="sunset-sun absolute left-1/2 top-[64%] w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(circle at 50% 40%, #FFE49A 0%, #FFB347 45%, #FF2E7E 100%)', filter: 'blur(1px)', boxShadow: '0 0 120px 40px rgba(255,140,90,0.45)' }}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent via-[#1A0B33]/85 to-[#0E0620]" aria-hidden="true" />
          <div className="sunset-stars absolute inset-0 stars-only [mask-image:linear-gradient(to_bottom,transparent_45%,black_85%)]" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto px-4">
            <RevealOnScroll>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 text-sm font-bold text-white">
                <Moon className="w-4 h-4" aria-hidden="true" />
                Dopo il tramonto
              </span>
              <h2 id="sunset-title" className="mt-6 font-display font-extrabold text-white tracking-[-0.045em] leading-[0.9] text-[clamp(2.6rem,7vw,6rem)] drop-shadow-[0_6px_30px_rgba(14,6,32,0.35)]">
                Quando il sole scende,
                <br />
                si accende SpacePolly.
              </h2>
              <p className="mt-6 text-lg text-white/90 max-w-xl mx-auto">
                Da pranzo a notte fonda: bubble tea per il pomeriggio, waffle per la merenda e smash burger fino alle 03:30.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={120} className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                ['12:30', 'Bubble tea a pranzo'],
                ['17:00', 'Merenda waffle'],
                ['21:00', 'Smash burger'],
                ['02:00', 'Crêpes di mezzanotte'],
              ].map(([time, label]) => (
                <span key={time} className="glass-night rounded-full pl-2 pr-4 py-2 inline-flex items-center gap-2.5 text-white text-sm font-semibold">
                  <span className="rounded-full bg-white text-ink px-2.5 py-1 font-display font-extrabold text-xs">{time}</span>
                  {label}
                </span>
              ))}
            </RevealOnScroll>
          </div>
        </section>

        {/* ================= NIGHT ZONE ================= */}
        <div className="bg-night-sky text-white">
          <TikTokFeedBoard />

          <SocialAndReviews isOpenNow={isOpenNow === true} />

          {/* FAQ — mirrored in the FAQPage JSON-LD injected at prerender time */}
          <section id="faq" className="cv-auto relative py-20 sm:py-28" aria-labelledby="faq-title">
            <span className="blob w-[420px] h-[420px] -right-40 top-10 bg-taro/20" aria-hidden="true" />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
              <RevealOnScroll className="text-center">
                <span className="glass-night inline-flex rounded-full px-4 py-2 text-sm font-bold text-haze">Domande frequenti</span>
                <h2 id="faq-title" className="mt-5 font-display font-extrabold tracking-[-0.045em] leading-[0.92] text-[clamp(2.4rem,6vw,4.75rem)]">
                  Domande? <span className="text-neon">Risposte.</span>
                </h2>
              </RevealOnScroll>
              <div className="mt-12 space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <RevealOnScroll key={item.question} delayMs={i * 50}>
                    <details className="faq-item group glass-night rounded-3xl px-5 sm:px-7 open:bg-white/10 transition-colors" open={i === 0}>
                      <summary className="flex items-center justify-between gap-6 py-5 sm:py-6 cursor-pointer list-none">
                        <h3 className="font-display font-bold text-lg sm:text-xl leading-snug text-white">{item.question}</h3>
                        <span className="faq-icon w-10 h-10 shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center transition-all duration-500">
                          <Plus className="w-5 h-5" aria-hidden="true" />
                        </span>
                      </summary>
                      <p className="pb-6 pr-6 sm:pr-14 text-[15px] sm:text-base leading-relaxed text-haze">{item.answer}</p>
                    </details>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <div className="bg-night-sky text-white">
          <footer className="cv-auto relative overflow-hidden pt-8 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RevealOnScroll>
                <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-pop-deep via-[#B23AB8] to-[#5B3BD9] p-8 sm:p-14 shadow-neon">
                  <span className="blob w-80 h-80 -right-16 -top-24 bg-mango/40" aria-hidden="true" />
                  <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-end gap-8">
                    <div>
                      <p className="font-hand text-3xl text-mango -rotate-2">sono le 2 di notte?</p>
                      <h2 className="mt-2 font-display font-extrabold tracking-[-0.045em] leading-[0.9] text-[clamp(2.4rem,6vw,5rem)]">
                        Noi siamo
                        <br />
                        ancora aperti.
                      </h2>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                      <a
                        href={TEAAMO_LINKS.glovo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-squish inline-flex items-center justify-center gap-2 rounded-full bg-white text-ink px-7 py-4 font-display font-bold text-lg"
                      >
                        Ordina su Glovo
                        <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                      </a>
                      <a
                        href={TEAAMO_LINKS.googleMapsDirect}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-squish inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 text-white px-7 py-4 font-display font-bold text-lg"
                      >
                        <MapPin className="w-5 h-5" aria-hidden="true" />
                        Come arrivare
                      </a>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              <div className="mt-16 grid grid-cols-2 md:grid-cols-12 gap-10">
                <div className="col-span-2 md:col-span-4">
                  <div className="flex items-center gap-3">
                    <img src={`${import.meta.env.BASE_URL}teaamo-logo.png`} alt="" width={48} height={48} className="w-12 h-12 rounded-full" />
                    <span className="font-display font-extrabold text-2xl">TeaAmo</span>
                  </div>
                  <p className="mt-4 text-sm text-haze max-w-xs leading-relaxed">
                    Bubble Tea, dolci e SpacePolly SmashBurger a Palermo. Sweet &amp; Coffee dalle 12:30 alle 03:30.
                  </p>
                </div>
                <address className="col-span-2 md:col-span-3 not-italic space-y-3 text-sm">
                  <p className="font-display font-bold text-white">Vieni a trovarci</p>
                  <p className="flex gap-2.5 text-haze">
                    <MapPin className="w-4 h-4 mt-0.5 text-pop shrink-0" aria-hidden="true" />
                    <span>Viale Strasburgo, 378<br />90146 Palermo (PA)</span>
                  </p>
                  <p className="flex gap-2.5 text-haze">
                    <Clock className="w-4 h-4 mt-0.5 text-pop shrink-0" aria-hidden="true" />
                    <span>Lun – Dom · 12:30 – 03:30</span>
                  </p>
                  <a href={`tel:${TEAAMO_LINKS.phone}`} className="flex gap-2.5 text-haze hover:text-white transition-colors">
                    <Phone className="w-4 h-4 mt-0.5 text-pop shrink-0" aria-hidden="true" />
                    <span>{TEAAMO_LINKS.phoneDisplay}</span>
                  </a>
                </address>
                <nav className="md:col-span-3 space-y-2.5 text-sm" aria-label="Sezioni del sito">
                  <p className="font-display font-bold text-white">Esplora</p>
                  {NAV_LINKS.map((link) => (
                    <a key={link.href} href={link.href} className="block text-haze hover:text-white transition-colors">
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="md:col-span-2 space-y-2.5 text-sm">
                  <p className="font-display font-bold text-white">Social</p>
                  {[
                    { href: TEAAMO_LINKS.instagram, label: 'Instagram' },
                    { href: TEAAMO_LINKS.tiktok, label: 'TikTok' },
                    { href: TEAAMO_LINKS.googleShare, label: 'Google Maps' },
                    { href: TEAAMO_LINKS.linktree, label: 'Linktree' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1 text-haze hover:text-white transition-colors"
                    >
                      {s.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              <p className="mt-16 font-display font-extrabold leading-[0.8] tracking-[-0.06em] text-center text-[24vw] lg:text-[17rem] text-neon select-none" aria-hidden="true">
                TeaAmo
              </p>

              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-haze">
                <span>© {new Date().getFullYear()} TeaAmo Bubble Tea — Sweet &amp; Coffee · Palermo</span>
                <a href="#top" className="font-semibold hover:text-white transition-colors">Torna su ↑</a>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}

export default App;
