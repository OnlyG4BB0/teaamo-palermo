import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ============================================================================
   MATH & MOTION
   ============================================================================ */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeOutBack = (x: number, s = 1.70158) => {
  const t = clamp01(x) - 1;
  return 1 + (s + 1) * t * t * t + s * t * t;
};
/** Frame-rate independent exponential approach */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Semi-implicit damped spring: gives the bouncy, physical feel lerps can't */
export class Spring {
  value: number;
  target: number;
  velocity = 0;
  constructor(value: number, public stiffness = 170, public damping = 18) {
    this.value = value;
    this.target = value;
  }
  step(dt: number) {
    // Two substeps keep stiff springs stable on slow frames
    const h = Math.min(dt, 1 / 30) / 2;
    for (let i = 0; i < 2; i++) {
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  kick(impulse: number) {
    this.velocity += impulse;
  }
}

/** Deterministic PRNG so procedural geometry is identical across renders */
export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

let simplex: SimplexNoise | null = null;
export const noise3 = (x: number, y: number, z: number) => {
  if (!simplex) {
    const rand = mulberry32(1337);
    simplex = new SimplexNoise({ random: rand });
  }
  return simplex.noise3d(x, y, z);
};
export const fbm3 = (x: number, y: number, z: number, octaves = 3) => {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += noise3(x * freq, y * freq, z * freq) * amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return sum;
};

/* ============================================================================
   CACHES — geometries/textures are deterministic, so every canvas shares them
   ============================================================================ */
const geometryCache = new Map<string, THREE.BufferGeometry>();
export const cachedGeometry = <T extends THREE.BufferGeometry>(key: string, build: () => T): T => {
  let geo = geometryCache.get(key);
  if (!geo) {
    geo = build();
    geometryCache.set(key, geo);
  }
  return geo as T;
};

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Canvas-drawn texture. When fonts are given, it redraws once they have loaded so
 * labels use the brand typefaces instead of the fallback.
 */
export const canvasTexture = (
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  opts: { fonts?: string[]; repeat?: [number, number]; wrap?: boolean } = {}
): THREE.CanvasTexture => {
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, width, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (opts.wrap) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  textureCache.set(key, tex);

  if (opts.fonts?.length && typeof document !== 'undefined' && document.fonts) {
    Promise.all(opts.fonts.map((f) => document.fonts.load(f)))
      .then(() => {
        ctx.clearRect(0, 0, width, height);
        draw(ctx, width, height);
        tex.needsUpdate = true;
      })
      .catch(() => undefined);
  }
  return tex;
};

/* ============================================================================
   GEOMETRY HELPERS
   ============================================================================ */
export const lathe = (profile: [number, number][], segments = 64) => {
  const geo = new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)),
    segments
  );
  geo.computeVertexNormals();
  return geo;
};

/** Smooth a coarse profile with a Catmull-Rom pass so lathes read as organic */
export const smoothProfile = (profile: [number, number][], samples = 48): [number, number][] => {
  const curve = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y)));
  return curve.getSpacedPoints(samples).map((p) => [p.x, p.y]);
};

/** Push every vertex along its normal by fn(position, normal) */
export const displace = (
  geo: THREE.BufferGeometry,
  fn: (p: THREE.Vector3, n: THREE.Vector3, i: number) => number
) => {
  geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    const d = fn(p, n, i);
    pos.setXYZ(i, p.x + n.x * d, p.y + n.y * d, p.z + n.z * d);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
};

/** Arbitrary per-vertex transform (draping, bending, waving) */
export const warp = (geo: THREE.BufferGeometry, fn: (p: THREE.Vector3, i: number) => void) => {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    fn(p, i);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
};

/** Bake per-vertex colours (used for crusts, char marks, gradients) */
export const paint = (
  geo: THREE.BufferGeometry,
  fn: (p: THREE.Vector3, n: THREE.Vector3, out: THREE.Color, i: number) => void
) => {
  if (!geo.attributes.normal) geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    c.setRGB(1, 1, 1);
    fn(p, n, c, i);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
};

/**
 * Tube whose cross-section can taper and flute along the path — piped cream,
 * soft-serve twists and chocolate drizzles all come from this.
 */
export const shapedTube = (
  curve: THREE.Curve<THREE.Vector3>,
  opts: {
    tubular?: number;
    radial?: number;
    radius?: number;
    taper?: (t: number) => number;
    flutes?: number;
    fluteDepth?: number;
  } = {}
) => {
  const { tubular = 160, radial = 24, radius = 0.1, taper = () => 1, flutes = 0, fluteDepth = 0.18 } = opts;
  const geo = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const center = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, center);
    const k = taper(t);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(center);
      const flute = flutes ? 1 + fluteDepth * Math.cos((j / radial) * Math.PI * 2 * flutes) : 1;
      v.multiplyScalar(k * flute).add(center);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
};

/** Conical helix, the backbone of every swirl in the scene */
export class HelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    public turns: number,
    public r0: number,
    public r1: number,
    public y0: number,
    public y1: number,
    public phase = 0,
    public rEase: (t: number) => number = (t) => t
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = this.phase + t * this.turns * Math.PI * 2;
    const r = lerp(this.r0, this.r1, this.rEase(t));
    return target.set(Math.cos(a) * r, lerp(this.y0, this.y1, t), Math.sin(a) * r);
  }
}

export const roundedBox = (w: number, h: number, d: number, r: number, seg = 4) =>
  new RoundedBoxGeometry(w, h, d, seg, r);

/** Extruded heart used as the TeaAmo topper */
export const heartGeometry = () =>
  cachedGeometry('heart', () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.12);
    s.bezierCurveTo(0, 0.12, -0.03, 0.25, -0.15, 0.25);
    s.bezierCurveTo(-0.32, 0.25, -0.32, 0.02, -0.32, 0.02);
    s.bezierCurveTo(-0.32, -0.12, -0.18, -0.26, 0, -0.38);
    s.bezierCurveTo(0.18, -0.26, 0.32, -0.12, 0.32, 0.02);
    s.bezierCurveTo(0.32, 0.02, 0.32, 0.25, 0.15, 0.25);
    s.bezierCurveTo(0.03, 0.25, 0, 0.12, 0, 0.12);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.06,
      curveSegments: 32,
    });
    geo.center();
    geo.computeVertexNormals();
    return geo;
  });

/** Five-point star outline, extruded for Pan di Stelle sugar stars */
export const starGeometry = (outer = 0.06, inner = 0.026, depth = 0.015) =>
  cachedGeometry(`star-${outer}-${inner}-${depth}`, () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
    });
    geo.center();
    geo.rotateX(-Math.PI / 2);
    return geo;
  });

/** Organic leaf (mint / basil) bent along its midrib */
export const leafGeometry = (len = 0.42, width = 0.2) =>
  cachedGeometry(`leaf-${len}-${width}`, () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(width, len * 0.2, width * 0.9, len * 0.75, 0, len);
    s.bezierCurveTo(-width * 0.9, len * 0.75, -width, len * 0.2, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 24);
    // Fold along the midrib and curl the tip for a natural silhouette
    warp(geo, (p) => {
      p.z = Math.abs(p.x) * 0.55 - Math.pow(p.y / len, 2) * 0.12 + Math.sin(p.y * 22) * 0.006;
    });
    return geo;
  });

/* ============================================================================
   MATERIAL HELPERS
   ============================================================================ */

/** Clear plastic with a fresnel edge, so cups read as glass instead of a ghost */
export const glassMaterial = (opts: THREE.MeshPhysicalMaterialParameters & { edge?: number } = {}) => {
  const { edge = 0.55, ...params } = opts;
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.16,
    roughness: 0.03,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    ior: 1.5,
    specularIntensity: 1,
    envMapIntensity: 1.8,
    side: THREE.DoubleSide,
    depthWrite: false,
    ...params,
  });
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `float teaFres = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.6);
       diffuseColor.a = clamp(diffuseColor.a + teaFres * ${edge.toFixed(2)}, 0.0, 1.0);
       #include <opaque_fragment>`
    );
  };
  mat.customProgramCacheKey = () => `tea-glass-${edge}`;
  return mat;
};

const GLSL_NOISE = /* glsl */ `
  float teaHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float teaNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(teaHash(i + vec3(0,0,0)), teaHash(i + vec3(1,0,0)), f.x),
                   mix(teaHash(i + vec3(0,1,0)), teaHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(teaHash(i + vec3(0,0,1)), teaHash(i + vec3(1,0,1)), f.x),
                   mix(teaHash(i + vec3(0,1,1)), teaHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float teaFbm(vec3 p) {
    float s = 0.0; float a = 0.5;
    for (int i = 0; i < 3; i++) { s += teaNoise(p) * a; p *= 2.03; a *= 0.5; }
    return s;
  }
`;

export interface LiquidUniforms {
  uTop: { value: THREE.Color };
  uBottom: { value: THREE.Color };
  uSwirl: { value: THREE.Color };
  uTime: { value: number };
  uStir: { value: number };
  uMinY: { value: number };
  uMaxY: { value: number };
  uStreaks: { value: number };
  uAlphaLow: { value: number };
  uAlphaHigh: { value: number };
}

/**
 * Milk-tea liquid: vertical flavour gradient, marbled milk clouds that drift and
 * "tiger" brown-sugar streaks down the wall. Stirring twists the marbling.
 */
export const liquidMaterial = (opts: {
  top: string;
  bottom: string;
  swirl?: string;
  minY: number;
  maxY: number;
  streaks?: number;
  alphaLow?: number;
  alphaHigh?: number;
  clear?: boolean;
}) => {
  const uniforms: LiquidUniforms = {
    uTop: { value: new THREE.Color(opts.top) },
    uBottom: { value: new THREE.Color(opts.bottom) },
    uSwirl: { value: new THREE.Color(opts.swirl ?? '#FFF6EC') },
    uTime: { value: 0 },
    uStir: { value: 0 },
    uMinY: { value: opts.minY },
    uMaxY: { value: opts.maxY },
    uStreaks: { value: opts.streaks ?? 1 },
    uAlphaLow: { value: opts.alphaLow ?? 0.96 },
    uAlphaHigh: { value: opts.alphaHigh ?? 0.96 },
  };
  const mat = new THREE.MeshPhysicalMaterial({
    roughness: opts.clear ? 0.05 : 0.22,
    clearcoat: opts.clear ? 1 : 0.5,
    clearcoatRoughness: 0.15,
    sheen: opts.clear ? 0 : 0.4,
    sheenColor: new THREE.Color('#ffffff'),
    transparent: true,
    depthWrite: !opts.clear,
    envMapIntensity: 1.1,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTeaLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTeaLocal = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vTeaLocal;
         uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSwirl;
         uniform float uTime; uniform float uStir; uniform float uMinY; uniform float uMaxY;
         uniform float uStreaks; uniform float uAlphaLow; uniform float uAlphaHigh;
         ${GLSL_NOISE}`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `float h = clamp((vTeaLocal.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);
         float ang = atan(vTeaLocal.z, vTeaLocal.x);
         float twist = ang + h * (1.2 + uStir * 6.0) + uTime * (0.08 + uStir * 1.6);
         vec3 q = vec3(cos(twist) * 1.6, h * 3.2 - uTime * 0.05, sin(twist) * 1.6);
         float marble = teaFbm(q * 1.4);
         float grad = smoothstep(0.05, 0.85, h + (marble - 0.5) * 0.55);
         vec3 col = mix(uBottom, uTop, grad);
         float clouds = smoothstep(0.58, 0.82, teaFbm(q * 2.3 + 4.0)) * smoothstep(0.15, 0.9, h);
         col = mix(col, uSwirl, clouds * 0.35);
         float streak = 0.0;
         if (uStreaks > 0.0 && h < 0.85) {
           streak = smoothstep(0.55, 0.85, teaFbm(vec3(ang * 2.4, h * 1.1 - uTime * 0.03, 1.7)))
             * (1.0 - smoothstep(0.25, 0.85, h)) * uStreaks;
         }
         col = mix(col, uBottom * 0.55, streak * 0.75);
         vec4 diffuseColor = vec4(col, mix(uAlphaLow, uAlphaHigh, h) * opacity);`
      );
  };
  mat.customProgramCacheKey = () => `tea-liquid-${opts.clear ? 'clear' : 'milk'}`;
  return { material: mat, uniforms };
};

/** Gently animated melt: vertices with an aDroop weight sag and sway (cheese, syrup) */
export const meltMaterial = (params: THREE.MeshPhysicalMaterialParameters) => {
  const uniforms = { uMelt: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.MeshPhysicalMaterial(params);
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float aDroop;\nuniform float uMelt;\nuniform float uTime;'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float sway = 0.88 + 0.12 * sin(uTime * 0.9 + position.x * 2.3 + position.z * 1.7);
         transformed.y -= aDroop * uMelt * sway;`
      );
  };
  mat.customProgramCacheKey = () => 'tea-melt';
  return { material: mat, uniforms };
};

/* ============================================================================
   BRAND TEXTURES
   ============================================================================ */
const BRAND_FONTS = ['800 120px "Bricolage Grotesque"', '700 40px "Figtree"'];

const drawDiamondLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = fill;
  ctx.fillRect(-s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.save();
  ctx.translate(x, y + s * 0.02);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  const h = s * 0.28;
  ctx.moveTo(0, h * 0.35);
  ctx.bezierCurveTo(-h, -h * 0.4, -h * 0.35, -h * 1.05, 0, -h * 0.45);
  ctx.bezierCurveTo(h * 0.35, -h * 1.05, h, -h * 0.4, 0, h * 0.35);
  ctx.fill();
  ctx.restore();
};

/** Wrap-around cup sleeve: logo + wordmark, printed twice around the cup */
export const cupLabelTexture = (accent = '#DE3163') =>
  canvasTexture(
    `cup-label-${accent}`,
    2048,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#FFF6F0';
      ctx.fillRect(0, 0, w, h);
      // fine pink pinstripes top & bottom
      ctx.fillStyle = accent;
      ctx.fillRect(0, 24, w, 10);
      ctx.fillRect(0, h - 34, w, 10);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, 48, w, 3);
      ctx.fillRect(0, h - 51, w, 3);
      ctx.globalAlpha = 1;
      for (let k = 0; k < 2; k++) {
        const cx = w * (0.25 + k * 0.5);
        drawDiamondLogo(ctx, cx - 300, h / 2, 150, accent);
        ctx.fillStyle = '#1D0B33';
        ctx.font = '800 150px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('TeaAmo', cx - 190, h / 2 - 22);
        ctx.fillStyle = accent;
        ctx.font = '700 40px "Figtree", system-ui, sans-serif';
        ctx.fillText('BUBBLE TEA · PALERMO', cx - 182, h / 2 + 92);
        // scattered pearls motif
        ctx.fillStyle = '#1D0B33';
        for (let i = 0; i < 6; i++) {
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.arc(cx + 300 + (i % 3) * 46, h / 2 - 60 + Math.floor(i / 3) * 70, 18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    { fonts: BRAND_FONTS }
  );

/** Candy-striped straw */
export const strawTexture = (base: string, stripe: string) =>
  canvasTexture(
    `straw-${base}-${stripe}`,
    256,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = stripe;
      for (let i = -4; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 64);
        ctx.lineTo(w, i * 64 + 120);
        ctx.lineTo(w, i * 64 + 150);
        ctx.lineTo(0, i * 64 + 30);
        ctx.fill();
      }
    },
    { wrap: true, repeat: [1, 5] }
  );

/** Citrus wheel face (segments, pith, pulp sacs) */
export const citrusTexture = (rind: string, pulp: string) =>
  canvasTexture(`citrus-${rind}-${pulp}`, 512, 512, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = rind;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFBEA';
    ctx.beginPath();
    ctx.arc(c, c, c * 0.88, 0, Math.PI * 2);
    ctx.fill();
    const segs = 9;
    const rand = mulberry32(7);
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2 + 0.05;
      const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.05;
      const grad = ctx.createRadialGradient(c, c, c * 0.1, c, c, c * 0.82);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.25, pulp);
      grad.addColorStop(1, pulp);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos((a0 + a1) / 2) * c * 0.1, c + Math.sin((a0 + a1) / 2) * c * 0.1);
      ctx.arc(c, c, c * 0.82, a0, a1);
      ctx.closePath();
      ctx.fill();
      // juice sacs
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      for (let k = 0; k < 10; k++) {
        const a = lerp(a0, a1, rand());
        const r = c * (0.25 + rand() * 0.5);
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
        ctx.lineTo(c + Math.cos(a) * (r + 30), c + Math.sin(a) * (r + 30));
        ctx.stroke();
      }
    }
  });

/** Tomato slice (chambers with seeds) */
export const tomatoTexture = () =>
  canvasTexture('tomato', 512, 512, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = '#C81E1E';
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E8423A';
    ctx.beginPath();
    ctx.arc(c, c, c * 0.9, 0, Math.PI * 2);
    ctx.fill();
    const rand = mulberry32(11);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const x = c + Math.cos(a) * c * 0.5;
      const y = c + Math.sin(a) * c * 0.5;
      ctx.fillStyle = '#F87171';
      ctx.beginPath();
      ctx.ellipse(x, y, c * 0.24, c * 0.17, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDE68A';
      for (let s = 0; s < 6; s++) {
        ctx.beginPath();
        ctx.ellipse(x + (rand() - 0.5) * 50, y + (rand() - 0.5) * 34, 7, 4, rand() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#EF5350';
    ctx.beginPath();
    ctx.arc(c, c, c * 0.16, 0, Math.PI * 2);
    ctx.fill();
  });

/** Pickle slice (ridged rim, seed ring) */
export const pickleTexture = () =>
  canvasTexture('pickle', 256, 256, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(c, c, 4, c, c, c * 0.86);
    g.addColorStop(0, '#D9F99D');
    g.addColorStop(1, '#84A33A');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, c * 0.86, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,230,0.85)';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(c + Math.cos(a) * c * 0.42, c + Math.sin(a) * c * 0.42, 9, 5, a, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Golden crêpe with lacy browned spots */
export const crepeTexture = () =>
  canvasTexture(
    'crepe',
    1024,
    1024,
    (ctx, w, h) => {
      ctx.fillStyle = '#DB9D4B';
      ctx.fillRect(0, 0, w, h);
      const rand = mulberry32(21);
      for (let i = 0; i < 1400; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = 4 + rand() * 26;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const dark = rand() > 0.55;
        g.addColorStop(0, dark ? 'rgba(130,62,18,0.7)' : 'rgba(196,112,38,0.5)');
        g.addColorStop(1, 'rgba(200,120,45,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { wrap: true }
  );

/** Grid of a fan wafer */
export const waferTexture = () =>
  canvasTexture(
    'wafer',
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#E3A75A';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#B9752F';
      ctx.lineWidth = 6;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 8, 0);
        ctx.lineTo((i * w) / 8, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (i * h) / 8);
        ctx.lineTo(w, (i * h) / 8);
        ctx.stroke();
      }
    },
    { wrap: true, repeat: [3, 3] }
  );

/** Spiral pirouline wafer roll */
export const rollTexture = () =>
  canvasTexture(
    'wafer-roll',
    128,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#EDB86B';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#5A2A0E';
      for (let i = -2; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 64);
        ctx.lineTo(w, i * 64 + 48);
        ctx.lineTo(w, i * 64 + 66);
        ctx.lineTo(0, i * 64 + 18);
        ctx.fill();
      }
    },
    { wrap: true, repeat: [1, 3] }
  );

/** Paper cup print for the gelato coppetta and waffle sleeve */
export const paperCupTexture = (accent = '#DE3163') =>
  canvasTexture(
    `paper-cup-${accent}`,
    2048,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#FFF6F0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = accent;
      for (let i = 0; i < 64; i++) {
        if (i % 2 === 0) ctx.fillRect((i * w) / 64, 0, w / 64, h * 0.16);
      }
      ctx.fillRect(0, h * 0.16, w, 8);
      for (let k = 0; k < 3; k++) {
        const cx = w * (k / 3 + 1 / 6);
        drawDiamondLogo(ctx, cx, h * 0.52, 120, accent);
        ctx.fillStyle = '#1D0B33';
        ctx.font = '800 88px "Bricolage Grotesque", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TeaAmo', cx, h * 0.82);
      }
    },
    { fonts: BRAND_FONTS }
  );

/** Little SpacePolly flag on the burger pick */
export const flagTexture = (label: string, accent: string) =>
  canvasTexture(
    `flag-${label}-${accent}`,
    512,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i = 0; i < 26; i++) {
        ctx.beginPath();
        ctx.arc((i * 97) % w, (i * 57) % h, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 34px "Figtree", system-ui, sans-serif';
      ctx.fillText('SPACEPOLLY', w / 2, h * 0.3);
      ctx.font = '800 96px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(label, w / 2, h * 0.64);
    },
    { fonts: BRAND_FONTS }
  );

/** Soft baked floor shadow — replaces per-frame contact-shadow renders */
export const softShadowTexture = () =>
  canvasTexture('soft-shadow', 256, 256, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(70, 18, 60, 0.55)');
    g.addColorStop(0.35, 'rgba(70, 18, 60, 0.32)');
    g.addColorStop(0.7, 'rgba(70, 18, 60, 0.08)');
    g.addColorStop(1, 'rgba(70, 18, 60, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });

/**
 * Runs cache warm-up tasks (geometry + texture builders) one per idle slot, so
 * switching products later never pays for procedural generation on the spot.
 */
let prewarmStarted = false;
export const prewarmInIdle = (tasks: (() => unknown)[]) => {
  if (prewarmStarted || typeof window === 'undefined') return;
  prewarmStarted = true;
  const queue = [...tasks];
  const idle: (cb: (d: { timeRemaining: () => number }) => void) => void =
    'requestIdleCallback' in window
      ? (cb) => (window as unknown as { requestIdleCallback: (c: typeof cb, o: { timeout: number }) => void }).requestIdleCallback(cb, { timeout: 2000 })
      : (cb) => window.setTimeout(() => cb({ timeRemaining: () => 8 }), 120);
  const run = (deadline: { timeRemaining: () => number }) => {
    while (queue.length && deadline.timeRemaining() > 4) {
      try {
        queue.shift()!();
      } catch {
        // A failed warm-up just means that piece is built on demand later
      }
    }
    if (queue.length) idle(run);
  };
  idle(run);
};
