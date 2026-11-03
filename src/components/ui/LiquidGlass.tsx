import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

/* ============================================================================
   LIQUID GLASS
   Apple-style glass for the control layer (nav, tab bar, switchers, sheets).

   Every browser gets the CSS glass in index.css (.lg): frosted + saturated
   backdrop, specular rim, inner glow and a highlight that follows the pointer.
   Chromium additionally gets real, live refraction at the rim: an SVG
   feDisplacementMap used as a backdrop-filter, driven by a displacement map
   generated for the element's exact size and corner radius. Unlike a page
   snapshot, it refracts whatever is behind right now (3D canvases included).
   ============================================================================ */

let refractionSupport: boolean | null = null;

const canRefract = () => {
  if (refractionSupport !== null) return refractionSupport;
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isAppleWebKit = /iPhone|iPad|iPod/.test(ua) || (/Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua));
  const isFirefox = /Firefox\//.test(ua);
  const reduced =
    window.matchMedia('(prefers-reduced-transparency: reduce)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  refractionSupport =
    !isAppleWebKit && !isFirefox && !reduced && typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'url(#lg)');
  return refractionSupport;
};

const mapCache = new Map<string, string>();

/**
 * Displacement map for a rounded rectangle. Red/green encode an inward pull that
 * rises smoothly towards the rim, so the backdrop bends like a thick glass lens
 * at the edges while the centre stays clear.
 */
export const refractionMap = (w: number, h: number, radius: number, bevel: number) => {
  const key = `${w}x${h}-${radius.toFixed(1)}-${bevel}`;
  const cached = mapCache.get(key);
  if (cached) return cached;

  // Generated at most ~320px on the long side; feImage stretches it smoothly
  const s = Math.min(1, 320 / Math.max(w, h));
  const cw = Math.max(2, Math.round(w * s));
  const ch = Math.max(2, Math.round(h * s));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(cw, ch);
  const data = img.data;
  const r = Math.min(radius, w / 2, h / 2);
  const hw = w / 2;
  const hh = h / 2;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const cx = (x + 0.5) / s - hw;
      const cy = (y + 0.5) / s - hh;
      const qx = Math.abs(cx) - (hw - r);
      const qy = Math.abs(cy) - (hh - r);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const depth = -(outside + Math.min(Math.max(qx, qy), 0) - r);
      let dx = 0;
      let dy = 0;
      if (depth >= 0 && depth < bevel) {
        let nx: number;
        let ny: number;
        if (qx > 0 && qy > 0 && outside > 0) {
          nx = (Math.sign(cx) * qx) / outside;
          ny = (Math.sign(cy) * qy) / outside;
        } else if (qx > qy) {
          nx = Math.sign(cx);
          ny = 0;
        } else {
          nx = 0;
          ny = Math.sign(cy);
        }
        const t = 1 - depth / bevel;
        // Smooth lens shoulder plus a faint inner ripple, like a liquid meniscus
        const mag = t * t * (3 - 2 * t) + 0.08 * Math.sin(t * Math.PI);
        dx = -nx * mag;
        dy = -ny * mag;
      }
      const i = (y * cw + x) * 4;
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  mapCache.set(key, url);
  return url;
};

export interface LiquidGlassOptions {
  /** Real edge refraction (Chromium only, CSS glass elsewhere) */
  refract?: boolean;
  /** Maximum backdrop displacement at the rim, in px */
  strength?: number;
  /** Width of the refracting rim, in px */
  bevel?: number;
  /** Split red/green/blue slightly at the rim (costs three passes) */
  aberration?: boolean;
  /** Frosting applied together with the refraction */
  blur?: number;
}

/** Attach liquid glass behaviour to any element (div, a, button, nav…) */
export const useLiquidGlass = <T extends HTMLElement>({
  refract = false,
  strength = 18,
  bevel = 16,
  aberration = false,
  blur = 4,
}: LiquidGlassOptions = {}) => {
  const ref = useRef<T>(null);
  const rawId = useId();
  const id = `lg-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [size, setSize] = useState<{ w: number; h: number; r: number } | null>(null);

  // Measure (and re-measure on resize) only where refraction can actually render
  useEffect(() => {
    const el = ref.current;
    if (!refract || !el || !canRefract() || typeof ResizeObserver === 'undefined') return;
    let timer = 0;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      setSize((prev) => (prev && prev.w === w && prev.h === h && Math.abs(prev.r - r) < 0.5 ? prev : { w, h, r }));
    };
    // Rebuild the map once a resize/transition settles, not on every intermediate frame
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 140);
    });
    ro.observe(el);
    measure();
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [refract]);

  const mapUrl = useMemo(
    () => (size ? refractionMap(size.w, size.h, size.r, Math.min(bevel, size.h / 2, size.w / 2)) : ''),
    [size, bevel]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !size || !mapUrl) return;
    const value = `url(#${id}) blur(${blur}px) saturate(1.9) brightness(1.06)`;
    el.style.setProperty('backdrop-filter', value);
    el.style.setProperty('-webkit-backdrop-filter', value);
    el.dataset.refract = 'true';
    return () => {
      el.style.removeProperty('backdrop-filter');
      el.style.removeProperty('-webkit-backdrop-filter');
      delete el.dataset.refract;
    };
  }, [id, size, mapUrl, blur]);

  const filter =
    size && mapUrl ? (
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute w-0 h-0 overflow-hidden pointer-events-none">
        <filter id={id} x="0" y="0" width={size.w} height={size.h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={mapUrl} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
          {aberration ? (
            <>
              <feDisplacementMap in="SourceGraphic" in2="map" scale={strength * 2} xChannelSelector="R" yChannelSelector="G" result="dr" />
              <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={strength * 2.12} xChannelSelector="R" yChannelSelector="G" result="dg" />
              <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
              <feDisplacementMap in="SourceGraphic" in2="map" scale={strength * 2.26} xChannelSelector="R" yChannelSelector="G" result="db" />
              <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feBlend in="r" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="b" mode="screen" />
            </>
          ) : (
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength * 2} xChannelSelector="R" yChannelSelector="G" />
          )}
        </filter>
      </svg>
    ) : null;

  // Specular highlight follows the pointer / finger
  const onPointerMove = (e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--lg-x', `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--lg-y', `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  };
  const onPointerLeave = () => {
    ref.current?.style.removeProperty('--lg-x');
    ref.current?.style.removeProperty('--lg-y');
  };

  return { ref, filter, glassHandlers: { onPointerMove, onPointerLeave, onPointerDown: onPointerMove } };
};

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement>, LiquidGlassOptions {
  tone?: 'light' | 'dark';
}

/** Convenience wrapper: a div with liquid glass */
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  tone = 'light',
  refract,
  strength,
  bevel,
  aberration,
  blur,
  className = '',
  children,
  ...rest
}) => {
  const { ref, filter, glassHandlers } = useLiquidGlass<HTMLDivElement>({ refract, strength, bevel, aberration, blur });
  return (
    <div ref={ref} {...glassHandlers} {...rest} className={`lg ${tone === 'dark' ? 'lg-dark' : ''} ${className}`}>
      {filter}
      {children}
    </div>
  );
};
