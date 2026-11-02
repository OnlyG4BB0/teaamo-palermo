import React from 'react';
import {
  ArrowUpRight,
  Bike,
  Clock,
  Instagram,
  Leaf,
  MapPin,
  MilkOff,
  NutOff,
  Phone,
  Quote,
  ShieldCheck,
  Star,
  Store,
  WheatOff,
} from 'lucide-react';
import { GOOGLE_REVIEWS, INSTAGRAM_MOMENTS, TEAAMO_LINKS } from '../data/teaamoData';
import { RevealOnScroll, MagneticWrap, handleSpotlightMove } from './ui/AnimatedPrimitives';

interface SocialAndReviewsProps {
  isOpenNow: boolean;
}

const SectionTitle: React.FC<{ eyebrow: string; id: string; children: React.ReactNode; aside?: React.ReactNode }> = ({
  eyebrow,
  id,
  children,
  aside,
}) => (
  <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
      <span className="glass-night inline-flex rounded-full px-4 py-2 text-sm font-bold text-haze">{eyebrow}</span>
      <h2 id={id} className="mt-5 font-display font-extrabold tracking-[-0.05em] leading-[0.9] text-[clamp(2.4rem,6vw,5rem)]">
        {children}
      </h2>
    </div>
    {aside}
  </RevealOnScroll>
);

const ALLERGEN_CARDS = [
  {
    icon: Leaf,
    title: '100% vegan friendly',
    text: 'I tè alla frutta e i PokéTea (Bulbasaur, Blu Tropical, Red Passion) sono fatti con infusi naturali e perle agar vegetali, senza latte né derivati animali.',
    color: '#9AD96B',
  },
  {
    icon: WheatOff,
    title: 'Senza glutine',
    text: 'Le perle di tapioca nascono dalla radice di manioca e sono naturalmente senza glutine. Anche le coppette di gelato e yogurt (senza cono) lo sono.',
    color: '#FFC94A',
  },
  {
    icon: MilkOff,
    title: 'Senza lattosio',
    text: 'Ami il Taro o il Classic Milk Tea ma non tolleri il lattosio? Chiedi la versione con latte di cocco o vegetale.',
    color: '#7CCBFF',
  },
  {
    icon: NutOff,
    title: 'Frutta a guscio sotto controllo',
    text: 'La linea SpacePolly e i tè alla frutta non contengono frutta a guscio. Le creme a pistacchio o nocciola hanno dispenser dedicati.',
    color: '#FF2E7E',
  },
];

export const SocialAndReviews: React.FC<SocialAndReviewsProps> = ({ isOpenNow }) => {
  return (
    <>
      {/* ================= DELIVERY ================= */}
      <section id="delivery" className="relative py-20 sm:py-28" aria-labelledby="delivery-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Delivery & take away"
            id="delivery-title"
            aside={
              <MagneticWrap strength={0.15} className="self-start md:self-auto">
                <a
                  href={TEAAMO_LINKS.linktree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-squish glass-night inline-flex items-center gap-2 rounded-full px-5 py-3 font-display font-bold text-white"
                >
                  Tutti i nostri link
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </MagneticWrap>
            }
          >
            Fame? <span className="text-neon">Arriviamo noi.</span>
          </SectionTitle>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            <RevealOnScroll delayMs={40} className="md:col-span-7">
              <a
                href={TEAAMO_LINKS.glovo}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full overflow-hidden rounded-5xl bg-mango text-ink p-8 sm:p-10 min-h-[300px] card-lift"
              >
                <span className="blob w-72 h-72 -right-16 -bottom-24 bg-white/50" aria-hidden="true" />
                <Bike className="absolute right-8 top-8 w-20 h-20 sm:w-28 sm:h-28 text-ink/15 group-hover:translate-x-3 transition-transform duration-700" aria-hidden="true" />
                <div className="relative flex h-full flex-col justify-between gap-10">
                  <span className="inline-flex self-start rounded-full bg-ink text-white px-4 py-2 text-sm font-bold">Consegna a domicilio</span>
                  <div>
                    <h3 className="font-display font-extrabold text-4xl sm:text-6xl tracking-[-0.045em] leading-[0.9]">Ordina su Glovo</h3>
                    <p className="mt-4 text-base sm:text-lg font-medium max-w-md">
                      Tutto il menu a casa tua in tutta Palermo: bubble tea sigillati, SpacePolly SmashBurger, waffle e gelato.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-white px-6 py-3.5 font-display font-bold group-hover:gap-3 transition-all">
                      Apri lo store
                      <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </a>
            </RevealOnScroll>

            <div className="md:col-span-5 grid grid-cols-1 gap-4 sm:gap-5">
              <RevealOnScroll delayMs={100}>
                <a
                  href={TEAAMO_LINKS.googleMapsDirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseMove={handleSpotlightMove}
                  className="spotlight group block h-full rounded-5xl glass-night p-7 sm:p-8 card-lift"
                >
                  <Store className="w-8 h-8 text-pop" aria-hidden="true" />
                  <h3 className="mt-5 font-display font-extrabold text-3xl tracking-tight">Passa a prenderlo</h3>
                  <p className="mt-2 text-haze">Ritiro al banco senza attese o consumazione sul posto, in Viale Strasburgo 378.</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-display font-bold text-white group-hover:gap-2.5 transition-all">
                    Indicazioni stradali <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </a>
              </RevealOnScroll>
              <RevealOnScroll delayMs={160}>
                <div className="rounded-5xl bg-gradient-to-br from-pop-deep to-[#7B3FD0] p-7 sm:p-8 shadow-neon">
                  <Clock className="w-8 h-8 text-white" aria-hidden="true" />
                  <p className="mt-5 font-display font-extrabold text-4xl tracking-tight">12:30 – 03:30</p>
                  <p className="mt-1 text-white/85 font-medium">Tutti i giorni, festivi compresi.</p>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INSTAGRAM ================= */}
      <section id="instagram" className="cv-auto relative py-16 sm:py-24" aria-labelledby="instagram-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="@teaamo_bubbletea"
            id="instagram-title"
            aside={
              <MagneticWrap strength={0.15} className="self-start md:self-auto">
                <a
                  href={TEAAMO_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-squish inline-flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 font-display font-bold"
                >
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                  Seguici su Instagram
                </a>
              </MagneticWrap>
            }
          >
            Il nostro <span className="text-neon">diario</span>
          </SectionTitle>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {INSTAGRAM_MOMENTS.map((post, idx) => (
              <RevealOnScroll key={post.id} delayMs={idx * 80} direction="scale">
                <a
                  href={TEAAMO_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative block overflow-hidden rounded-5xl bg-night-2 card-lift ${idx === 1 ? 'md:mt-10' : ''}`}
                >
                  <div className="aspect-[4/5]">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 text-ink px-3 py-1.5 text-xs font-bold">{post.tag}</span>
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <h3 className="font-display font-extrabold text-2xl leading-tight tracking-tight">{post.title}</h3>
                    <p className="mt-2 text-sm text-haze line-clamp-2">{post.description}</p>
                  </div>
                </a>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ALLERGENS ================= */}
      <section id="allergeni" className="cv-auto relative py-16 sm:py-24" aria-labelledby="allergeni-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Allergeni & intolleranze" id="allergeni-title">
            Buono <span className="text-neon">per tutti.</span>
          </SectionTitle>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {ALLERGEN_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <RevealOnScroll key={card.title} delayMs={i * 70}>
                  <div
                    onMouseMove={handleSpotlightMove}
                    className="spotlight h-full rounded-5xl glass-night p-7 card-lift"
                  >
                    <span
                      className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-[-6deg]"
                      style={{ backgroundColor: `${card.color}26`, color: card.color }}
                    >
                      <Icon className="w-7 h-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 font-display font-extrabold text-xl tracking-tight">{card.title}</h3>
                    <p className="mt-2 text-sm text-haze leading-relaxed">{card.text}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

          <RevealOnScroll delayMs={120}>
            <p className="mt-5 flex items-start gap-3 rounded-3xl border border-mango/40 bg-mango/10 p-5 text-sm text-white/90">
              <ShieldCheck className="w-5 h-5 text-mango shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-white">Allergie gravi (celiachia o anafilassi)?</strong> Nel laboratorio si lavorano anche glutine e latte: segnala sempre la tua allergia allo staff prima di ordinare.
              </span>
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================= REVIEWS & LOCATION ================= */}
      <section id="dove-siamo" className="cv-auto relative py-16 sm:py-24" aria-labelledby="dove-title">
        <span className="blob w-[520px] h-[520px] -left-60 top-40 bg-pop/20" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Recensioni & sede"
            id="dove-title"
            aside={
              <a
                href={TEAAMO_LINKS.googleShare}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start md:self-auto glass-night rounded-4xl px-6 py-4 flex items-center gap-4 card-lift"
              >
                <span className="font-display font-extrabold text-5xl">4.2</span>
                <span>
                  <span className="flex gap-0.5 text-mango" aria-label="4,2 stelle su 5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={`w-4 h-4 fill-current ${i === 4 ? 'opacity-40' : ''}`} aria-hidden="true" />
                    ))}
                  </span>
                  <span className="block mt-1 text-sm text-haze">540+ recensioni su Google</span>
                </span>
              </a>
            }
          >
            Viale Strasburgo 378,
            <br />
            <span className="text-neon">Palermo.</span>
          </SectionTitle>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            <div className="lg:col-span-5 grid grid-cols-1 gap-4 sm:gap-5">
              {GOOGLE_REVIEWS.map((rev, i) => (
                <RevealOnScroll key={rev.id} delayMs={i * 80} direction="left">
                  <blockquote className={`relative rounded-5xl p-7 ${i === 1 ? 'bg-white text-ink' : 'glass-night'}`}>
                    <Quote className={`w-8 h-8 ${i === 1 ? 'text-pop' : 'text-pop/80'}`} aria-hidden="true" />
                    <p className="mt-3 font-display font-semibold text-lg sm:text-xl leading-snug tracking-tight">{rev.text}</p>
                    <footer className={`mt-5 flex items-center justify-between gap-3 text-sm ${i === 1 ? 'text-ink-soft' : 'text-haze'}`}>
                      <span>
                        <strong className={i === 1 ? 'text-ink' : 'text-white'}>{rev.author}</strong> · {rev.badge}
                      </span>
                      <span className="flex gap-0.5 text-mango" aria-label="5 stelle su 5">
                        {[0, 1, 2, 3, 4].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        ))}
                      </span>
                    </footer>
                  </blockquote>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll direction="right" delayMs={120} className="lg:col-span-7">
              <div className="h-full rounded-5xl glass-night p-3 flex flex-col">
                <div className="relative flex-1 min-h-[320px] rounded-[2rem] overflow-hidden">
                  <iframe
                    title="Mappa di TeaAmo Palermo in Viale Strasburgo 378"
                    src="https://maps.google.com/maps?q=TeaAmo+Bubble+Tea,+Viale+Strasburgo+378,+Palermo&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="absolute inset-0 w-full h-full border-0 [filter:saturate(1.1)_contrast(1.05)]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white text-ink px-4 py-2 text-sm font-bold shadow-soft">
                    <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 live-dot' : 'bg-ink/30'}`} />
                    {isOpenNow ? 'Aperto ora' : 'Aperti 12:30 – 03:30'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
                  <p className="flex gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-pop shrink-0" aria-hidden="true" />
                    <span>
                      <strong className="block font-display">Indirizzo</strong>
                      <span className="text-haze">Viale Strasburgo, 378 · 90146 Palermo</span>
                    </span>
                  </p>
                  <p className="flex gap-3 text-sm">
                    <Clock className="w-5 h-5 text-pop shrink-0" aria-hidden="true" />
                    <span>
                      <strong className="block font-display">Orari</strong>
                      <span className="text-haze">Lun – Dom · 12:30 – 03:30</span>
                    </span>
                  </p>
                  <a href={`tel:${TEAAMO_LINKS.phone}`} className="flex gap-3 text-sm group">
                    <Phone className="w-5 h-5 text-pop shrink-0" aria-hidden="true" />
                    <span>
                      <strong className="block font-display">Telefono</strong>
                      <span className="text-haze group-hover:text-white transition-colors">{TEAAMO_LINKS.phoneDisplay}</span>
                    </span>
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2 pb-2">
                  <a
                    href={TEAAMO_LINKS.googleShare}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-squish inline-flex items-center justify-center gap-2 rounded-full bg-white text-ink px-6 py-4 font-display font-bold"
                  >
                    Apri su Google Maps
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href={`tel:${TEAAMO_LINKS.phone}`}
                    className="btn-squish inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 text-white px-6 py-4 font-display font-bold hover:border-white/60"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Chiamaci
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </>
  );
};
