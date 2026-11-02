import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { BOBA_BASES, BOBA_FLAVORS, BOBA_TOPPINGS, BobaIngredient, TEAAMO_LINKS } from '../data/teaamoData';
import { StudioViewport3D } from './three/LazyStudioViewport3D';
import { RevealOnScroll, AnimatedPrice, handleSpotlightMove } from './ui/AnimatedPrimitives';

const SWEETNESS_LEVELS = ['50%', '75%', '100%', '120%'];
const SWEETNESS_LABELS: Record<string, string> = { '50%': 'Poco', '75%': 'Giusto', '100%': 'Classico', '120%': 'Extra' };
const ICE_LEVELS = ['No Ice', 'Less Ice', 'Regular Ice', 'Full Ice'];
const ICE_LABELS: Record<string, string> = { 'No Ice': 'Niente', 'Less Ice': 'Poco', 'Regular Ice': 'Normale', 'Full Ice': 'Tanto' };

const STEP_COLORS = ['#FF2E7E', '#A98BFF', '#FFC94A', '#9AD96B'];

const StepCard: React.FC<{ step: number; title: string; hint: string; children: React.ReactNode; delayMs?: number }> = ({
  step,
  title,
  hint,
  children,
  delayMs = 0,
}) => (
  <RevealOnScroll delayMs={delayMs}>
    <div className="rounded-5xl bg-white/80 backdrop-blur-sm p-5 sm:p-7 shadow-soft">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-lg text-ink shrink-0"
            style={{ backgroundColor: STEP_COLORS[step - 1] }}
          >
            {step}
          </span>
          <h3 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-ink">{title}</h3>
        </div>
        <span className="hidden sm:inline text-sm font-semibold text-ink-soft">{hint}</span>
      </div>
      {children}
    </div>
  </RevealOnScroll>
);

const OptionTile: React.FC<{
  active: boolean;
  onClick: () => void;
  name: string;
  subtitle: string;
  swatch: string;
  extra?: React.ReactNode;
}> = ({ active, onClick, name, subtitle, swatch, extra }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseMove={handleSpotlightMove}
    aria-pressed={active}
    className={`spotlight group relative w-full text-left rounded-3xl p-3.5 flex items-center gap-3.5 transition-all duration-300 ${
      active ? 'bg-ink text-white shadow-soft' : 'bg-milk hover:bg-white hover:shadow-soft text-ink'
    }`}
  >
    <span
      className={`relative w-12 h-12 rounded-full shrink-0 border-[3px] transition-transform duration-500 group-hover:rotate-12 ${
        active ? 'border-white/80 scale-105' : 'border-white'
      }`}
      style={{ background: swatch, boxShadow: 'inset -4px -6px 10px rgba(0,0,0,0.15), 0 6px 14px -8px rgba(29,11,51,0.5)' }}
    >
      {active && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pop text-white flex items-center justify-center">
          <Check className="w-3 h-3" aria-hidden="true" />
        </span>
      )}
    </span>
    <span className="min-w-0">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="font-display font-bold text-[15px] leading-tight">{name}</span>
        {extra}
      </span>
      <span className={`block text-xs mt-0.5 leading-snug ${active ? 'text-white/75' : 'text-ink-soft'}`}>{subtitle}</span>
    </span>
  </button>
);

const Segmented: React.FC<{ options: string[]; labels: Record<string, string>; value: string; onChange: (v: string) => void; label: string }> = ({
  options,
  labels,
  value,
  onChange,
  label,
}) => {
  const idx = options.indexOf(value);
  return (
    <div>
      <p className="text-sm font-bold text-ink mb-2.5">{label}</p>
      <div role="radiogroup" aria-label={label} className="relative grid grid-cols-4 rounded-full bg-milk p-1">
        <span
          className="absolute top-1 bottom-1 rounded-full bg-ink shadow-soft transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ width: `calc((100% - 0.5rem) / ${options.length})`, left: '0.25rem', transform: `translateX(${idx * 100}%)` }}
          aria-hidden="true"
        />
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(opt)}
            className={`relative z-10 rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ${value === opt ? 'text-white' : 'text-ink'}`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
};

export const BobaLabBuilder: React.FC = () => {
  const [selectedBase, setSelectedBase] = useState<BobaIngredient>(BOBA_BASES[0]);
  const [selectedFlavor, setSelectedFlavor] = useState<BobaIngredient>(BOBA_FLAVORS[0]);
  const [selectedToppings, setSelectedToppings] = useState<BobaIngredient[]>([BOBA_TOPPINGS[0], BOBA_TOPPINGS[5]]);
  const [sweetness, setSweetness] = useState<string>(SWEETNESS_LEVELS[2]);
  const [ice, setIce] = useState<string>(ICE_LEVELS[2]);
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  const toggleTopping = (topping: BobaIngredient) => {
    const exists = selectedToppings.some((t) => t.id === topping.id);
    if (exists) {
      if (selectedToppings.length > 1) setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else if (selectedToppings.length < 3) {
      setSelectedToppings([...selectedToppings, topping]);
    } else {
      setSelectedToppings([...selectedToppings.slice(1), topping]);
    }
  };

  const basePrice = 4.8;
  const totalPrice =
    basePrice + selectedBase.priceDelta + selectedFlavor.priceDelta + selectedToppings.reduce((acc, t) => acc + t.priceDelta, 0);

  const hasPinkCream = selectedToppings.some((t) => t.id === 'pink-cream');
  const primaryBoba = selectedToppings[0]?.color || '#2D1206';
  const secondaryBoba = selectedToppings[1]?.color || selectedToppings[0]?.color || '#FDE4EA';

  const handleCopyRecipe = () => {
    const text = `Il mio TeaAmo: ${selectedBase.name} + ${selectedFlavor.name} + ${selectedToppings
      .map((t) => t.name)
      .join(', ')} (zucchero ${sweetness}, ghiaccio ${ICE_LABELS[ice].toLowerCase()}) — Viale Strasburgo 378, Palermo`;
    navigator.clipboard?.writeText(text).catch(() => undefined);
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

  const flavorSwatch = `linear-gradient(160deg, ${selectedFlavor.color}, ${selectedFlavor.secondaryColor || selectedFlavor.color})`;

  return (
    <section id="boba-lab" className="relative py-20 sm:py-28 bg-taro-soft overflow-hidden" aria-labelledby="lab-title">
      <span className="blob w-[560px] h-[560px] -right-56 -top-40 bg-white/70" aria-hidden="true" />
      <span className="blob w-[460px] h-[460px] -left-48 bottom-0 bg-pop/15" style={{ animationDelay: '-6s' }} aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft">
            <Sparkles className="w-4 h-4 text-taro" aria-hidden="true" />
            Boba Lab
          </span>
          <h2 id="lab-title" className="mt-5 font-display font-extrabold tracking-[-0.05em] leading-[0.9] text-ink text-[clamp(2.6rem,6.5vw,5.5rem)]">
            Crea il tuo <span className="text-candy">bubble tea</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-ink-soft leading-relaxed">
            Scegli base, gusto, perle e dolcezza: il bicchiere 3D si riempie in tempo reale. Poi copia la ricetta e ordinala al bancone.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Live cup + receipt */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="relative rounded-5xl overflow-hidden bg-white shadow-soft">
              <div
                className="absolute inset-0 transition-[background] duration-700"
                style={{ background: `radial-gradient(circle at 50% 45%, #ffffff 0%, ${selectedFlavor.color}33 60%, ${selectedFlavor.color}12 100%)` }}
                aria-hidden="true"
              />
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
                accentColor={selectedFlavor.color}
                interactiveHint="Tocca il bicchiere per mescolare"
                className="h-[340px] sm:h-[400px] lg:h-[380px] xl:h-[420px]"
              />
            </div>

            {/* Perforated receipt */}
            <div className="ticket-edge rounded-b-4xl bg-white px-6 sm:px-7 pt-7 pb-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-hand text-2xl text-pop-ink leading-none">la tua ricetta</p>
                  <p className="mt-1 font-display font-extrabold text-2xl leading-tight text-ink truncate">{selectedFlavor.name}</p>
                </div>
                <span className="w-12 h-12 rounded-full border-[3px] border-white shadow-soft shrink-0" style={{ background: flavorSwatch }} aria-hidden="true" />
              </div>
              <dl className="mt-5 space-y-2 text-sm border-y-2 border-dashed border-ink/15 py-4">
                {[
                  ['Base', selectedBase.name],
                  ['Perle', selectedToppings.map((t) => t.name).join(', ')],
                  ['Zucchero', `${sweetness} · ${SWEETNESS_LABELS[sweetness]}`],
                  ['Ghiaccio', ICE_LABELS[ice]],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-ink-soft font-medium">{k}</dt>
                    <dd className="text-ink font-semibold text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display font-bold text-ink">Totale</span>
                <AnimatedPrice value={totalPrice} className="font-display font-extrabold text-3xl text-ink" />
              </div>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={handleCopyRecipe}
                  className="btn-squish inline-flex items-center justify-center gap-2 rounded-full bg-ink text-white px-5 py-3.5 font-display font-bold"
                >
                  {copiedRecipe ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  {copiedRecipe ? 'Copiata!' : 'Copia ricetta'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Ricomincia da capo"
                  className="btn-squish w-12 h-12 rounded-full bg-milk text-ink flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <a
                href={TEAAMO_LINKS.glovo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-squish mt-2 flex items-center justify-center gap-2 rounded-full bg-pop-deep text-white px-5 py-3.5 font-display font-bold shadow-pop"
              >
                Ordina su Glovo
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Steps */}
          <div className="lg:col-span-7 space-y-5">
            <StepCard step={1} title="La base" hint="1 scelta" delayMs={40}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BOBA_BASES.map((base) => (
                  <OptionTile
                    key={base.id}
                    active={selectedBase.id === base.id}
                    onClick={() => setSelectedBase(base)}
                    name={base.name}
                    subtitle={base.subtitle}
                    swatch={base.color}
                  />
                ))}
              </div>
            </StepCard>

            <StepCard step={2} title="Il gusto" hint="colora il bicchiere" delayMs={80}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BOBA_FLAVORS.map((flavor) => (
                  <OptionTile
                    key={flavor.id}
                    active={selectedFlavor.id === flavor.id}
                    onClick={() => setSelectedFlavor(flavor)}
                    name={flavor.name}
                    subtitle={flavor.subtitle}
                    swatch={`linear-gradient(160deg, ${flavor.color}, ${flavor.secondaryColor || flavor.color})`}
                    extra={
                      flavor.tag ? (
                        <span className="rounded-full bg-pop text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">{flavor.tag}</span>
                      ) : null
                    }
                  />
                ))}
              </div>
            </StepCard>

            <StepCard step={3} title="Perle & topping" hint={`${selectedToppings.length} di 3`} delayMs={120}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BOBA_TOPPINGS.map((topping) => {
                  const active = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <OptionTile
                      key={topping.id}
                      active={active}
                      onClick={() => toggleTopping(topping)}
                      name={topping.name}
                      subtitle={topping.subtitle}
                      swatch={`radial-gradient(circle at 32% 28%, #ffffff 0 10%, ${topping.color} 34%)`}
                      extra={
                        <span className={`text-xs font-bold ${active ? 'text-mango' : 'text-pop-ink'}`}>
                          {topping.priceDelta === 0 ? 'incluso' : `+€${topping.priceDelta.toFixed(2)}`}
                        </span>
                      }
                    />
                  );
                })}
              </div>
            </StepCard>

            <StepCard step={4} title="Dolcezza & ghiaccio" hint="come piace a te" delayMs={160}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Segmented options={SWEETNESS_LEVELS} labels={SWEETNESS_LABELS} value={sweetness} onChange={setSweetness} label="Zucchero" />
                <Segmented options={ICE_LEVELS} labels={ICE_LABELS} value={ice} onChange={setIce} label="Ghiaccio" />
              </div>
            </StepCard>
          </div>
        </div>
      </div>
    </section>
  );
};
