import React, { useState } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  BOBA_BASES,
  BOBA_FLAVORS,
  BOBA_TOPPINGS,
  BobaIngredient,
  TEAAMO_LINKS,
} from '../data/teaamoData';
import { StudioViewport3D } from './three/LazyStudioViewport3D';
import {
  RevealOnScroll,
  AnimatedPrice,
  MagneticWrap,
  handleSpotlightMove,
} from './ui/AnimatedPrimitives';

interface BobaLabBuilderProps {
  className?: string;
}

const SWEETNESS_LEVELS = ['50% Brut', '75% Bilanciato', '100% Standard', '120% Intenso'];
const ICE_LEVELS = ['No Ice', 'Less Ice', 'Regular Ice', 'Full Ice'];

export const BobaLabBuilder: React.FC<BobaLabBuilderProps> = () => {
  const [selectedBase, setSelectedBase] = useState<BobaIngredient>(BOBA_BASES[0]);
  const [selectedFlavor, setSelectedFlavor] = useState<BobaIngredient>(BOBA_FLAVORS[0]);
  const [selectedToppings, setSelectedToppings] = useState<BobaIngredient[]>([
    BOBA_TOPPINGS[0],
    BOBA_TOPPINGS[5],
  ]);
  const [sweetness, setSweetness] = useState<string>(SWEETNESS_LEVELS[2]);
  const [ice, setIce] = useState<string>(ICE_LEVELS[2]);
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  const toggleTopping = (topping: BobaIngredient) => {
    const exists = selectedToppings.some((t) => t.id === topping.id);
    if (exists) {
      if (selectedToppings.length > 1) {
        setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
      }
    } else {
      if (selectedToppings.length < 3) {
        setSelectedToppings([...selectedToppings, topping]);
      } else {
        setSelectedToppings([...selectedToppings.slice(1), topping]);
      }
    }
  };

  const basePrice = 4.8;
  const totalPrice =
    basePrice +
    selectedBase.priceDelta +
    selectedFlavor.priceDelta +
    selectedToppings.reduce((acc, t) => acc + t.priceDelta, 0);

  const hasPinkCream = selectedToppings.some((t) => t.id === 'pink-cream');
  const primaryBoba = selectedToppings[0]?.color || '#2D1206';
  const secondaryBoba = selectedToppings[1]?.color || selectedToppings[0]?.color || '#FDE4EA';

  const handleCopyRecipe = () => {
    const text = `TEAAMO LAB SPEC: Base ${selectedBase.name} + Infusione ${selectedFlavor.name} + Perle (${selectedToppings
      .map((t) => t.name)
      .join(', ')}) [${sweetness}, ${ice}] — Viale Strasburgo 378 Palermo`;
    navigator.clipboard.writeText(text);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2500);
  };

  const handleReset = () => {
    setSelectedBase(BOBA_BASES[0]);
    setSelectedFlavor(BOBA_FLAVORS[0]);
    setSelectedToppings([BOBA_TOPPINGS[0], BOBA_TOPPINGS[5]]);
    setSweetness(SWEETNESS_LEVELS[2]);
    setIce(ICE_LEVELS[2]);
  };

  return (
    <section
      id="boba-lab"
      className="border-b border-[#F3DFD8] dark:border-[#3B2231] py-14 sm:py-24 bg-white dark:bg-[#170A12]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between pb-8 sm:pb-10 border-b border-[#F3DFD8] dark:border-[#3B2231] gap-4 sm:gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#DE3163] mb-2.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>02 / SIMULATORE 3D INTERATTIVO</span>
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-none text-[#2B0F1D] dark:text-white">
              TeaAmo Formulation{' '}
              <span className="italic text-[#DE3163]">Studio</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#76525F] dark:text-[#C9AEBB] max-w-md leading-relaxed">
            Esplora e sperimenta virtualmente la tua formula: scegli base di tè, profilo aromatico, perle di tapioca e grado di ghiaccio per vederli animati in tempo reale nel modello 3D WebGL con vista esplosa.
          </p>
        </RevealOnScroll>

        {/* Architectural 12-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-x border-b border-[#F3DFD8] dark:border-[#3B2231] items-start">
          {/* Left 5 Cols: Sticky 3D WebGL Viewport & Technical Ticket */}
          <div className="lg:col-span-5 lg:border-r border-b lg:border-b-0 border-[#F3DFD8] dark:border-[#3B2231] bg-[#FFF1EC] dark:bg-[#1F0E19] flex flex-col justify-between lg:sticky lg:top-20">
            {/* Top Bar of 3D Stage */}
            <div className="p-4 sm:p-5 border-b border-[#F3DFD8] dark:border-[#3B2231] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#DE3163] live-dot shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-[#2B0F1D] dark:text-white truncate">
                  SPECIMEN // 500ML SEALED CUP
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#76525F] dark:text-[#C9AEBB] hover:text-[#DE3163] transition-colors cursor-pointer shrink-0 group"
              >
                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" aria-hidden="true" />
                Reset
              </button>
            </div>

            {/* Live R3F 3D Canvas */}
            <StudioViewport3D
              modelType="cup"
              cupConfig={{
                liquidTopColor: selectedFlavor.color,
                liquidBottomColor: selectedFlavor.secondaryColor || selectedFlavor.color,
                bobaColor: primaryBoba,
                bobaSecondaryColor: secondaryBoba,
                creamColor: hasPinkCream ? '#FFD9DE' : '#FFF8FA',
                hasPinkCream,
                showIce: ice !== 'No Ice',
              }}
              interactiveHint="LIVE 3D SHADER • TRASCINA O ESPLODI"
              className="h-[320px] sm:h-[380px] lg:h-[340px] xl:h-[390px]"
            />

            {/* Bottom Specification Readout */}
            <div className="p-5 sm:p-6 border-t border-[#F3DFD8] dark:border-[#3B2231] bg-white dark:bg-[#170A12] space-y-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] block">
                    FORMULA SELEZIONATA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif italic truncate text-[#2B0F1D] dark:text-white">
                    {selectedFlavor.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] block">
                    PREZZO VETRINA
                  </span>
                  <AnimatedPrice
                    value={totalPrice}
                    className="font-mono text-xl sm:text-2xl font-semibold text-[#DE3163]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#F3DFD8] dark:border-[#3B2231] font-mono text-[11px] text-[#76525F] dark:text-[#C9AEBB]">
                <div className="truncate">BASE: {selectedBase.name}</div>
                <div className="truncate">BRIX: {sweetness}</div>
                <div className="sm:col-span-2 truncate">
                  PEARLS: {selectedToppings.map((t) => t.name).join(' + ')}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyRecipe}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#DE3163] hover:bg-[#2B0F1D] text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer shadow-xs"
                >
                  {copiedRecipe ? (
                    <>
                      <Check className="w-4 h-4 text-white" aria-hidden="true" />
                      Ricetta Copiata negli Appunti!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      Copia Ricetta Personalizzata
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: 4-Stage Architectural Controls */}
          <div className="lg:col-span-7 divide-y divide-[#F3DFD8] dark:divide-[#3B2231] bg-white dark:bg-[#170A12]">
            {/* STEP 01: BASE */}
            <RevealOnScroll className="p-5 sm:p-8 lg:p-10" delayMs={60}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#DE3163] font-semibold">
                    STEP 01
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#2B0F1D] dark:text-white">Base di Infusione</h3>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB]">
                  1 SELEZIONE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOBA_BASES.map((base) => {
                  const active = selectedBase.id === base.id;
                  return (
                    <button
                      key={base.id}
                      type="button"
                      onMouseMove={handleSpotlightMove}
                      onClick={() => setSelectedBase(base)}
                      className={`spotlight-card p-4 text-left border transition-all duration-300 cursor-pointer flex items-start justify-between gap-3 hover:-translate-y-0.5 ${
                        active
                          ? 'border-[#DE3163] bg-[#FFF1EC] dark:bg-[#1D1519] shadow-xs'
                          : 'border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163]/60 bg-white dark:bg-[#1F0E19]'
                      }`}
                    >
                      <div className="relative z-10">
                        <p className="font-medium text-sm text-[#2B0F1D] dark:text-white">{base.name}</p>
                        <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] mt-1">
                          {base.subtitle}
                        </p>
                      </div>
                      <span
                        className={`relative z-10 w-4 h-4 rounded-full shrink-0 border border-black/20 mt-0.5 transition-transform duration-300 ${
                          active ? 'scale-125 ring-2 ring-[#DE3163]/40' : ''
                        }`}
                        style={{ backgroundColor: base.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </RevealOnScroll>

            {/* STEP 02: INFUSION / SYRUP */}
            <RevealOnScroll className="p-5 sm:p-8 lg:p-10" delayMs={120}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#DE3163] font-semibold">
                    STEP 02
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#2B0F1D] dark:text-white">Profilo Aromatico &amp; Sciroppo</h3>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB]">
                  CROMIA DINAMICA 3D
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOBA_FLAVORS.map((flavor) => {
                  const active = selectedFlavor.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onMouseMove={handleSpotlightMove}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`spotlight-card p-4 text-left border transition-all duration-300 cursor-pointer flex items-start justify-between gap-3 hover:-translate-y-0.5 ${
                        active
                          ? 'border-[#DE3163] bg-[#FFF1EC] dark:bg-[#1D1519] shadow-xs'
                          : 'border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163]/60 bg-white dark:bg-[#1F0E19]'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-sm text-[#2B0F1D] dark:text-white">{flavor.name}</p>
                          {flavor.tag && (
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-[#DE3163]/15 text-[#DE3163] font-semibold">
                              {flavor.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] mt-1">
                          {flavor.subtitle}
                        </p>
                      </div>
                      <span
                        className={`relative z-10 w-5 h-5 rounded-full shrink-0 border border-black/15 mt-0.5 transition-transform duration-300 ${
                          active ? 'scale-125 ring-2 ring-[#DE3163]/40' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${flavor.color}, ${
                            flavor.secondaryColor || flavor.color
                          })`,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </RevealOnScroll>

            {/* STEP 03: PEARLS & TOPPINGS */}
            <RevealOnScroll className="p-5 sm:p-8 lg:p-10" delayMs={160}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#DE3163] font-semibold">
                    STEP 03
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#2B0F1D] dark:text-white">Perle di Tapioca, Popping Boba &amp; Panna</h3>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-[#DE3163] font-semibold">
                  {selectedToppings.length} / 3 ATTIVI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOBA_TOPPINGS.map((topping) => {
                  const active = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onMouseMove={handleSpotlightMove}
                      onClick={() => toggleTopping(topping)}
                      className={`spotlight-card p-4 text-left border transition-all duration-300 cursor-pointer flex items-start justify-between gap-3 hover:-translate-y-0.5 ${
                        active
                          ? 'border-[#DE3163] bg-[#DE3163]/10 shadow-xs'
                          : 'border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163]/60 bg-white dark:bg-[#1F0E19]'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-sm text-[#2B0F1D] dark:text-white">{topping.name}</p>
                          <span className="font-mono text-[11px] text-[#76525F] dark:text-[#C9AEBB]">
                            {topping.priceDelta === 0
                              ? 'INCL.'
                              : `+€${topping.priceDelta.toFixed(2)}`}
                          </span>
                        </div>
                        <p className="text-xs text-[#76525F] dark:text-[#C9AEBB] mt-1">
                          {topping.subtitle}
                        </p>
                      </div>
                      <span
                        className={`relative z-10 w-5 h-5 rounded-full shrink-0 border border-black/20 flex items-center justify-center mt-0.5 transition-transform duration-300 ${
                          active ? 'scale-115 ring-2 ring-[#DE3163]/40' : ''
                        }`}
                        style={{ backgroundColor: topping.color }}
                      >
                        {active && (
                          <Check className="w-3 h-3 text-white mix-blend-difference" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </RevealOnScroll>

            {/* STEP 04: CALIBRATION & DELIVERY */}
            <RevealOnScroll className="p-5 sm:p-8 lg:p-10 space-y-6" delayMs={200}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-[#DE3163] font-semibold">
                  STEP 04
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-[#2B0F1D] dark:text-white">Calibrazione Dolcezza &amp; Ghiaccio</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] mb-2.5">
                    GRADO ZUCCHERINO (BRIX)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SWEETNESS_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSweetness(lvl)}
                        className={`py-2.5 px-3 font-mono text-xs border text-left transition-all duration-200 cursor-pointer ${
                          sweetness === lvl
                            ? 'border-[#DE3163] bg-[#DE3163] text-white shadow-xs font-semibold'
                            : 'border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163]/50 bg-white dark:bg-[#1F0E19] text-[#2B0F1D] dark:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB] mb-2.5">
                    TEMPERATURA &amp; GHIACCIO 3D
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {ICE_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIce(lvl)}
                        className={`py-2.5 px-3 font-mono text-xs border text-left transition-all duration-200 cursor-pointer ${
                          ice === lvl
                            ? 'border-[#DE3163] bg-[#DE3163] text-white shadow-xs font-semibold'
                            : 'border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163]/50 bg-white dark:bg-[#1F0E19] text-[#2B0F1D] dark:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F3DFD8] dark:border-[#3B2231] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-wider text-[#76525F] dark:text-[#C9AEBB]">
                  CONSEGNA A DOMICILIO A PALERMO DISPONIBILE SU:
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={TEAAMO_LINKS.glovo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider px-4 py-2 border border-[#DE3163] text-[#DE3163] hover:bg-[#DE3163] hover:text-white transition-all hover:-translate-y-0.5"
                  >
                    <span>Glovo Store Ufficiale</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};
