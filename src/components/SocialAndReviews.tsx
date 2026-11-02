import React from 'react';
import {
  ArrowUpRight,
  MapPin,
  Clock,
  Phone,
  Star,
  ShieldCheck,
  Leaf,
  MilkOff,
  WheatOff,
  NutOff,
} from 'lucide-react';
import {
  GOOGLE_REVIEWS,
  INSTAGRAM_MOMENTS,
  TEAAMO_LINKS,
} from '../data/teaamoData';
import {
  RevealOnScroll,
  MagneticWrap,
  handleSpotlightMove,
} from './ui/AnimatedPrimitives';

interface SocialAndReviewsProps {
  isOpenNow: boolean;
}

export const SocialAndReviews: React.FC<SocialAndReviewsProps> = ({
  isOpenNow,
}) => {
  return (
    <>
      {/* 04 / OFFICIAL DELIVERY CHANNELS & LINKTREE INDEX */}
      <section
        id="delivery"
        className="border-b border-[#F3DFD8] dark:border-[#3B2231] py-14 sm:py-24 bg-white dark:bg-[#170A12]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#F3DFD8] dark:border-[#3B2231] gap-4 sm:gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-2.5">
                04 / CANALI DI DISTRIBUZIONE &amp; LINKTREE UFFICIALE
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#2B0F1D] dark:text-[#FCEFF2]">
                Consegna a Domicilio{' '}
                <span className="italic text-[#DE3163]">Palermo</span>
              </h2>
            </div>
            <MagneticWrap strength={0.18} className="self-start md:self-auto">
              <a
                href={TEAAMO_LINKS.linktree}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-5 py-3.5 border border-[#DE3163] text-[#DE3163] hover:bg-[#DE3163] hover:text-white transition-colors"
              >
                <span>Linktree // @TeaAmoBubbleTeaPA</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </MagneticWrap>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 border-x border-b border-[#F3DFD8] dark:border-[#3B2231] divide-y md:divide-y-0 md:divide-x divide-[#F3DFD8] dark:divide-[#3B2231]">
            {/* Glovo Official Delivery */}
            <RevealOnScroll delayMs={40}>
              <a
                href={TEAAMO_LINKS.glovo}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={handleSpotlightMove}
                className="spotlight-card group p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] bg-white dark:bg-[#1F0E19] hover:bg-[#FFF1EC] dark:hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="relative z-10 flex items-center justify-between font-mono text-xs text-[#76525F] dark:text-[#C9AEBB]">
                  <span>DELIVERY ESCLUSIVO // STORE #296067</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-[#DE3163]" aria-hidden="true" />
                </div>
                <div className="relative z-10 mt-6">
                  <h3 className="text-3xl sm:text-4xl font-serif mb-2 group-hover:text-[#DE3163] transition-colors text-[#2B0F1D] dark:text-white">
                    Glovo Palermo
                  </h3>
                  <p className="text-sm text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                    Consegna rapida a domicilio in tutta Palermo da Viale Strasburgo 378. Menu completo con Bubble Tea sigillati, SpacePolly SmashBurger e Bubble Waffle.
                  </p>
                  <span className="editorial-link inline-block mt-4 font-mono text-xs uppercase tracking-widest text-[#DE3163] pb-0.5 font-semibold">
                    Ordina su Glovo Store →
                  </span>
                </div>
              </a>
            </RevealOnScroll>

            {/* Asporto & Ritiro al Banco */}
            <RevealOnScroll delayMs={100}>
              <a
                href={TEAAMO_LINKS.googleMapsDirect}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={handleSpotlightMove}
                className="spotlight-card group p-6 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] bg-white dark:bg-[#1F0E19] hover:bg-[#FFF1EC] dark:hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="relative z-10 flex items-center justify-between font-mono text-xs text-[#76525F] dark:text-[#C9AEBB]">
                  <span>ASPORTO & BANCO // VIALE STRASBURGO 378</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-[#DE3163]" aria-hidden="true" />
                </div>
                <div className="relative z-10 mt-6">
                  <h3 className="text-3xl sm:text-4xl font-serif mb-2 group-hover:text-[#DE3163] transition-colors text-[#2B0F1D] dark:text-white">
                    Take Away &amp; Notte
                  </h3>
                  <p className="text-sm text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                    Ritiro al locale senza attese o consumazione sul posto. Laboratorio artigianale attivo tutti i giorni dalle 12:30 fino alle 03:30 di notte.
                  </p>
                  <span className="editorial-link inline-block mt-4 font-mono text-xs uppercase tracking-widest text-[#DE3163] pb-0.5 font-semibold">
                    Indicazioni Stradali (Maps) →
                  </span>
                </div>
              </a>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 05 / INSTAGRAM EDITORIAL ARCHIVE (@teaamo_bubbletea) */}
      <section
        id="instagram"
        className="border-b border-[#F3DFD8] dark:border-[#3B2231] py-14 sm:py-24 bg-[#FFF9FB] dark:bg-[#170A12]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#F3DFD8] dark:border-[#3B2231] gap-4 sm:gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-2.5">
                05 / ARCHIVIO VISIVO &amp; SOCIAL
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#2B0F1D] dark:text-[#FCEFF2]">
                Diario Visivo{' '}
                <span className="italic text-[#DE3163]">@teaamo_bubbletea</span>
              </h2>
            </div>
            <MagneticWrap strength={0.18} className="self-start md:self-auto">
              <a
                href={TEAAMO_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-5 py-3.5 border border-[#DE3163] text-[#DE3163] hover:bg-[#DE3163] hover:text-white transition-colors"
              >
                <span>Segui su Instagram</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </MagneticWrap>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 border-x border-b border-[#F3DFD8] dark:border-[#3B2231] divide-y md:divide-y-0 md:divide-x divide-[#F3DFD8] dark:divide-[#3B2231]">
            {INSTAGRAM_MOMENTS.map((post, idx) => (
              <RevealOnScroll key={post.id} delayMs={idx * 70}>
                <a
                  href={TEAAMO_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseMove={handleSpotlightMove}
                  className="spotlight-card group p-5 sm:p-7 flex flex-col justify-between bg-white dark:bg-[#1F0E19] hover:bg-[#FFF1EC] dark:hover:bg-white/[0.03] transition-all duration-300"
                >
                  <div className="relative z-10 space-y-4">
                    {/* Visual Media Preview Container with Hover Reveal */}
                    <div className="w-full h-48 sm:h-56 overflow-hidden bg-black/5 dark:bg-white/5 border border-[#F3DFD8] dark:border-[#3B2231] relative group-hover:border-[#DE3163] transition-colors">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1 border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DE3163]" />
                        <span>{post.tag || '@TEAAMO_BUBBLETEA'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-[#DE3163] tracking-widest uppercase block mb-1.5 font-semibold">
                        DIARIO 0{idx + 1} // {post.tag || 'INSTAGRAM STORY'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif mb-2 group-hover:text-[#DE3163] transition-colors text-[#2B0F1D] dark:text-white leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-[#F3DFD8] dark:border-[#3B2231] flex items-center justify-between font-mono text-xs text-[#76525F] dark:text-[#C9AEBB]">
                    <span className="truncate">{post.subtitle}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#DE3163] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 shrink-0" aria-hidden="true" />
                  </div>
                </a>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 05.5 / GUIDA ALLERGENI & SICUREZZA ALIMENTARE */}
      <section
        id="allergeni"
        className="border-b border-[#F3DFD8] dark:border-[#3B2231] py-14 sm:py-20 bg-white dark:bg-[#170A12]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="pb-8 border-b border-[#F3DFD8] dark:border-[#3B2231] flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-2.5">
                05.5 / INFORMATIVA DIETETICA // ALLERGENI &amp; INTOLLERANZE
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2B0F1D] dark:text-[#FCEFF2]">
                Trasparenza Ingredienti &amp;{' '}
                <span className="italic text-[#DE3163]">Salute</span>
              </h2>
            </div>
            <p className="text-sm text-[#76525F] dark:text-[#C9AEBB] max-w-md leading-relaxed">
              Dalla tapioca calda naturalmente priva di glutine ai tè 100% vegani, ecco come gestiamo ingredienti e contaminazioni nel nostro laboratorio di Viale Strasburgo.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-x border-b border-[#F3DFD8] dark:border-[#3B2231] divide-y md:divide-y-0 md:divide-x divide-[#F3DFD8] dark:divide-[#3B2231]">
            <div className="p-6 sm:p-7 space-y-3 bg-[#FFFDFE] dark:bg-[#1F0E19]">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Leaf className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl text-[#2B0F1D] dark:text-white">100% Vegan Friendly</h3>
              <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                Tutti i tè aromatizzati alla frutta e i PokéTea (Bulbasaur, Blu Tropical, Red Passion) sono a base di infusi naturali e perle agar vegetali, privi di latte o derivati animali.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-3 bg-[#FFFDFE] dark:bg-[#1F0E19]">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <WheatOff className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl text-[#2B0F1D] dark:text-white">Senza Glutine (Tapioca)</h3>
              <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                Le nostre celebri perle di tapioca nere sono ricavate al 100% dalla radice di manioca (cassava), naturalmente gluten-free. Anche le coppette di gelato/yogurt (senza cono) sono senza glutine.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-3 bg-[#FFFDFE] dark:bg-[#1F0E19]">
              <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <MilkOff className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl text-[#2B0F1D] dark:text-white">Opzioni Senza Lattosio</h3>
              <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                Ami il Taro o il Classic Milk Tea ma non tolleri il lattosio? Chiedi la preparazione con latte di cocco o latte vegetale per gustare il tuo boba in totale leggerezza.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-3 bg-[#FFFDFE] dark:bg-[#1F0E19]">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <NutOff className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl text-[#2B0F1D] dark:text-white">Sicurezza Frutta a Guscio</h3>
              <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] leading-relaxed">
                La linea salata SpacePolly e i tè alla frutta non contengono frutta a guscio. Le creme con pistacchio o nocciola sono isolate con dispenser dedicati.
              </p>
            </div>
          </div>

          <div className="p-4 border-x border-b border-[#F3DFD8] dark:border-[#3B2231] bg-[#FFF1EC] dark:bg-[#150D11] flex items-center gap-3 text-xs font-mono text-[#76525F] dark:text-[#C9AEBB]">
            <ShieldCheck className="w-4 h-4 text-[#DE3163] shrink-0" aria-hidden="true" />
            <span>
              <strong>Attenzione per allergie gravi (celiachia o anafilassi):</strong> sebbene adottiamo procedure igieniche rigorose, nel laboratorio vengono manipolati glutine e latte. Segnala sempre eventuali allergie gravi allo staff prima di ordinare.
            </span>
          </div>
        </div>
      </section>

      {/* 06 / VERIFIED GOOGLE REVIEWS & VIALE STRASBURGO 378 DOSSIER */}
      <section
        id="dove-siamo"
        className="py-14 sm:py-24 bg-white dark:bg-[#170A12]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#F3DFD8] dark:border-[#3B2231] gap-4 sm:gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-2.5">
                06 / RECENSIONI VERIFICATE &amp; COORDINATE SEDE
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#2B0F1D] dark:text-[#FCEFF2]">
                Viale Strasburgo, 378 —{' '}
                <span className="italic text-[#DE3163]">Palermo</span>
              </h2>
            </div>
            <MagneticWrap strength={0.18} className="self-start md:self-auto">
              <a
                href={TEAAMO_LINKS.googleShare}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-5 py-3.5 border border-[#DE3163] text-[#DE3163] hover:bg-[#DE3163] hover:text-white transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-current shrink-0 text-[#DE3163]" aria-hidden="true" />
                <span>Rating Google 4.2 / 5.0 • Scheda Ufficiale</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </MagneticWrap>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-[#F3DFD8] dark:border-[#3B2231]">
            {/* Left 6 Cols: Editorial Customer Reviews */}
            <div className="lg:col-span-6 divide-y divide-[#F3DFD8] dark:divide-[#3B2231] lg:border-r border-[#F3DFD8] dark:border-[#3B2231]">
              {GOOGLE_REVIEWS.map((rev, i) => (
                <RevealOnScroll key={rev.id} delayMs={i * 80} direction="left">
                  <blockquote
                    onMouseMove={handleSpotlightMove}
                    className="spotlight-card p-6 sm:p-8 lg:p-10 transition-colors bg-white dark:bg-[#1F0E19]"
                  >
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#76525F] dark:text-[#C9AEBB] mb-4">
                      <span>
                        RECENSIONE 0{i + 1} // {rev.author.toUpperCase()} ({rev.badge})
                      </span>
                      <div className="flex items-center gap-0.5" aria-label="Valutazione 5 su 5 stelle">
                        {[...Array(5)].map((_, sIdx) => (
                          <Star key={sIdx} className="w-3.5 h-3.5 fill-[#DE3163] text-[#DE3163]" aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                    <p className="relative z-10 text-lg sm:text-2xl font-serif leading-snug text-[#2B0F1D] dark:text-[#FCEFF2]">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                    <footer className="relative z-10 mt-4 font-mono text-[11px] uppercase tracking-wider text-[#76525F] dark:text-[#C9AEBB]">
                      ORDINE RILEVATO: {rev.favoriteOrder}
                    </footer>
                  </blockquote>
                </RevealOnScroll>
              ))}
            </div>

            {/* Right 6 Cols: Architectural Location & Map Dossier */}
            <RevealOnScroll
              direction="right"
              delayMs={120}
              className="lg:col-span-6 flex flex-col justify-between bg-[#FFF1EC] dark:bg-[#1F0E19] border-t lg:border-t-0 border-[#F3DFD8] dark:border-[#3B2231]"
            >
              <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs border-b border-[#F3DFD8] dark:border-[#3B2231] pb-4">
                  <span>GPS // 38°09&apos;22.0&quot;N 13°19&apos;40.8&quot;E</span>
                  <span className="inline-flex items-center gap-2 text-[#DE3163] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#DE3163] live-dot" />
                    {isOpenNow ? 'APERTO ORA' : 'ORARIO 12:30 – 03:30'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#DE3163]" aria-hidden="true" />
                      INDIRIZZO FISICO
                    </p>
                    <p className="font-medium text-base mt-1 text-[#2B0F1D] dark:text-[#FCEFF2]">
                      Viale Strasburgo, 378
                      <br />
                      90146 Palermo (PA), Italia
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#DE3163]" aria-hidden="true" />
                      ORARIO CONTINUATO &amp; NOTTURNO
                    </p>
                    <p className="font-medium text-base mt-1 text-[#2B0F1D] dark:text-[#FCEFF2]">
                      Lunedì – Domenica
                      <br />
                      12:30 — 03:30 di notte
                    </p>
                  </div>
                </div>

                {/* Official Native Google Maps Frame */}
                <div className="border border-[#F3DFD8] dark:border-[#3B2231] rounded-sm overflow-hidden h-60 sm:h-72 shadow-xs bg-white">
                  <iframe
                    title="Mappa Ufficiale Google Maps TeaAmo Palermo - Viale Strasburgo 378"
                    src="https://maps.google.com/maps?q=TeaAmo+Bubble+Tea,+Viale+Strasburgo+378,+Palermo&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 border-t border-[#F3DFD8] dark:border-[#3B2231] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-white dark:bg-[#170A12]">
                <a
                  href={TEAAMO_LINKS.googleShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-4 px-5 bg-[#DE3163] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#2B0F1D] transition-all hover:-translate-y-0.5 shadow-xs"
                >
                  <span>Apri su Google Maps</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href={`tel:${TEAAMO_LINKS.phone}`}
                  className="inline-flex items-center justify-center gap-2 py-4 px-5 border border-[#DE3163] text-[#DE3163] font-mono text-xs uppercase tracking-widest hover:bg-[#FFF1EC] transition-all hover:-translate-y-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#DE3163]" aria-hidden="true" />
                  <span>{TEAAMO_LINKS.phoneDisplay}</span>
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </>
  );
};
