import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { cachedGeometry, damp, lathe, mulberry32, smoothProfile } from './kit';
import { MotionRoot, useMotion } from './motion';
import { BobaCupMesh, FruitTeaMesh, type Cup3DConfig } from './models/cups';
import { SpacePollyBurgerMesh } from './models/burger';
import { BubbleWaffleMesh, CrepeMesh, GelatoCoppettaMesh, PancakeStackMesh } from './models/desserts';

export type { Cup3DConfig } from './models/cups';
export type { BurgerVariant } from './models/burger';

export type ModelType =
  | 'cup'
  | 'fruittea'
  | 'burger-giove'
  | 'burger-plutone'
  | 'burger-marte'
  | 'burger-urano'
  | 'waffle'
  | 'crepe'
  | 'pancake'
  | 'coppetta'
  // Generic alias
  | 'burger';

interface ModelFit {
  w: number;
  h: number;
  d: number;
  /** Vertical centre the camera orbits around */
  cy: number;
  /** Floor height (shadow + pedestal) */
  shadowY: number;
  /** Camera elevation in radians — plated desserts read better from above */
  elev: number;
  floaties: FloatieKind;
  /** Plated desserts already sit on a plate, so they skip the turntable */
  pedestal?: boolean;
}

type FloatieKind = 'pearl' | 'seed' | 'sprinkle';

const BURGER_FIT: ModelFit = { w: 3.3, h: 2.7, d: 3.3, cy: 0.0, shadowY: -1.27, elev: 0.2, floaties: 'seed' };

const MODEL_FIT: Record<ModelType, ModelFit> = {
  cup: { w: 2.4, h: 4.05, d: 2.3, cy: 0.25, shadowY: -1.84, elev: 0.14, floaties: 'pearl' },
  fruittea: { w: 2.4, h: 3.7, d: 2.3, cy: 0.06, shadowY: -1.84, elev: 0.14, floaties: 'pearl' },
  'burger-giove': BURGER_FIT,
  'burger-plutone': BURGER_FIT,
  'burger-marte': BURGER_FIT,
  'burger-urano': BURGER_FIT,
  burger: BURGER_FIT,
  waffle: { w: 2.3, h: 3.4, d: 2.2, cy: 0.2, shadowY: -1.46, elev: 0.14, floaties: 'sprinkle' },
  crepe: { w: 3.4, h: 2.7, d: 3.4, cy: -0.5, shadowY: -0.81, elev: 0.5, floaties: 'sprinkle', pedestal: false },
  pancake: { w: 3.4, h: 2.8, d: 3.4, cy: -0.25, shadowY: -0.98, elev: 0.36, floaties: 'sprinkle', pedestal: false },
  coppetta: { w: 2.3, h: 2.6, d: 2.2, cy: 0.05, shadowY: -1.19, elev: 0.24, floaties: 'sprinkle' },
};

/* ============================================================================
   CAMERA — fits each product, dollies in on load, eases to its best angle
   ============================================================================ */
const CameraRig: React.FC<{ fit: ModelFit; exploded: boolean }> = ({ fit, exploded }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3 } | null;
  const dist = useRef<number | null>(null);
  const center = useRef(new THREE.Vector3(0, fit.cy, 0));
  const elevEase = useRef(1.6);
  const lastFit = useRef(fit);
  const tmp = useMemo(() => ({ dir: new THREE.Vector3(), sph: new THREE.Spherical() }), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    if (lastFit.current !== fit) {
      lastFit.current = fit;
      elevEase.current = 1.4;
    }
    const explodeK = exploded ? 1.18 : 1;
    const aspect = Math.max(0.45, size.width / Math.max(1, size.height));
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const forH = (fit.h * explodeK * 0.5) / tanHalf;
    const forW = (fit.w * 0.5) / (tanHalf * aspect);
    const targetDist = Math.max(forH, forW) * 1.12 + fit.d * 0.46;
    // Start further out so the first frame is a gentle dolly-in
    dist.current = dist.current === null ? targetDist * 1.6 : damp(dist.current, targetDist, 2.6, dt);

    tmp.dir.copy(camera.position).sub(center.current);
    if (tmp.dir.lengthSq() < 1e-6) tmp.dir.set(0, 0.2, 1);
    tmp.dir.normalize();
    if (elevEase.current > 0) {
      elevEase.current -= dt;
      tmp.sph.setFromVector3(tmp.dir);
      tmp.sph.phi = damp(tmp.sph.phi, Math.PI / 2 - fit.elev, 3.2, dt);
      tmp.dir.setFromSpherical(tmp.sph);
    }

    center.current.y = damp(center.current.y, fit.cy + (exploded ? 0.25 : 0), 4, dt);
    camera.position.copy(center.current).addScaledVector(tmp.dir, dist.current);
    if (controls) controls.target.copy(center.current);
    camera.lookAt(center.current);
  });

  return null;
};

/* ============================================================================
   STAGE DRESSING — glossy turntable pedestal and themed floating particles
   ============================================================================ */
const pedestalGeometry = () =>
  cachedGeometry('pedestal', () =>
    lathe(
      smoothProfile(
        [
          [0.001, -0.14],
          [0.96, -0.14],
          [1.0, -0.11],
          [1.01, -0.05],
          [0.99, -0.012],
          [0.95, 0],
          [0.001, 0],
        ],
        30
      ),
      128
    )
  );

const Pedestal: React.FC<{ fit: ModelFit; accent: string }> = ({ fit, accent }) => {
  const ref = useRef<THREE.Group>(null);
  const radius = Math.max(fit.w, fit.d) * 0.5 * 1.02;
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.position.y = damp(g.position.y, fit.shadowY - 0.004, 5, delta);
    const s = damp(g.scale.x, radius, 5, delta);
    g.scale.set(s, 1, s);
    g.rotation.y -= delta * 0.15;
  });
  return (
    <group ref={ref} position={[0, fit.shadowY - 0.004, 0]} scale={[radius, 1, radius]}>
      <mesh geometry={pedestalGeometry()}>
        <meshPhysicalMaterial color="#FFF7F3" roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} sheen={0.4} sheenColor="#FFD6E0" />
      </mesh>
      <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.005, 0.006, 8, 160]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
};

const FLOATIE_STYLE: Record<FloatieKind, { colors: string[]; scale: [number, number, number] }> = {
  pearl: { colors: ['#FFD9DE', '#FFFFFF', '#FD5E86', '#F2D9F7'], scale: [0.075, 0.075, 0.075] },
  seed: { colors: ['#FBF1D3', '#F2D9A0'], scale: [0.04, 0.02, 0.07] },
  sprinkle: { colors: ['#DE3163', '#9B7BEA', '#F2A65A', '#7FB77E', '#FFFFFF'], scale: [0.03, 0.08, 0.03] },
};

/** A loose ring of ingredients drifting around the product */
const Floaties: React.FC<{ kind: FloatieKind; fit: ModelFit }> = ({ kind, fit }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 11;
  const geo = useMemo(() => cachedGeometry('floatie', () => new THREE.SphereGeometry(1, 16, 12)), []);
  const capsule = useMemo(() => cachedGeometry('floatie-capsule', () => new THREE.CapsuleGeometry(0.5, 1, 4, 8)), []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.75, sheen: 0.6 }),
    []
  );
  const items = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: count }, (_, i) => ({
      a: (i / count) * Math.PI * 2 + rand() * 0.3,
      r: 0.55 + rand() * 0.3,
      y: rand(),
      speed: (0.08 + rand() * 0.1) * (i % 2 ? 1 : -1),
      bob: rand() * 6,
      spin: rand() * 3,
    }));
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const style = FLOATIE_STYLE[kind];

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    items.forEach((_, i) => mesh.setColorAt(i, c.set(style.colors[i % style.colors.length])));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [items, style]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const span = Math.max(fit.w, fit.d);
    items.forEach((it, i) => {
      const a = it.a + t * it.speed;
      const r = span * it.r;
      dummy.position.set(
        Math.cos(a) * r,
        fit.shadowY + 0.3 + it.y * fit.h * 0.9 + Math.sin(t * 0.9 + it.bob) * 0.12,
        // Kept behind the product so they read as atmosphere, not clutter
        -Math.abs(Math.sin(a)) * r * 0.6 - span * 0.35
      );
      dummy.rotation.set(t * 0.4 + it.spin, t * 0.3 + it.spin, it.spin);
      dummy.scale.set(...style.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh key={kind} ref={ref} args={[kind === 'sprinkle' ? capsule : geo, mat, count]} />;
};

/** Ring flash on the floor every time the product is tapped or impulsed */
const KickRipple: React.FC<{ fit: ModelFit; accent: string }> = ({ fit, accent }) => {
  const m = useMotion();
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (!ref.current || !matRef.current) return;
    const k = 1 - m.kick;
    ref.current.scale.setScalar(0.6 + k * 1.4);
    matRef.current.opacity = m.kick * 0.55;
    ref.current.visible = m.kick > 0.02;
  });
  return (
    <mesh ref={ref} position={[0, fit.shadowY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.95, 1.0, 96]} />
      <meshBasicMaterial ref={matRef} color={accent} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/* ============================================================================
   MODEL DISPATCH
   ============================================================================ */
const renderModel = (type: ModelType, cupConfig: Cup3DConfig, accent: string) => {
  switch (type) {
    case 'cup':
      return <BobaCupMesh config={cupConfig} />;
    case 'fruittea':
      return <FruitTeaMesh config={cupConfig} />;
    case 'burger-plutone':
      return <SpacePollyBurgerMesh variant="plutone" accentColor={accent} />;
    case 'burger-marte':
      return <SpacePollyBurgerMesh variant="marte" accentColor={accent} />;
    case 'burger-urano':
      return <SpacePollyBurgerMesh variant="urano" accentColor={accent} />;
    case 'burger':
    case 'burger-giove':
      return <SpacePollyBurgerMesh variant="giove" accentColor={accent} />;
    case 'waffle':
      return <BubbleWaffleMesh accentColor={accent} />;
    case 'crepe':
      return <CrepeMesh accentColor={accent} />;
    case 'pancake':
      return <PancakeStackMesh accentColor={accent} />;
    case 'coppetta':
      return <GelatoCoppettaMesh accentColor={accent} />;
    default:
      return null;
  }
};

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-[#76525F]">
          Anteprima 3D non disponibile
        </div>
      );
    }
    return this.props.children;
  }
}

export interface StudioViewport3DProps {
  modelType: ModelType;
  cupConfig: Cup3DConfig;
  accentColor?: string;
  interactiveHint?: string;
  className?: string;
}

const hudButton =
  'pointer-events-auto px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer backdrop-blur-sm';
const hudIdle =
  'bg-white/85 dark:bg-[#170A12]/85 border-[#F3DFD8] dark:border-[#3B2231] hover:border-[#DE3163] hover:text-[#DE3163] text-[#2B0F1D] dark:text-[#FCEFF2]';

export const StudioViewport3D: React.FC<StudioViewport3DProps> = ({
  modelType,
  cupConfig,
  accentColor = '#FD5E86',
  interactiveHint,
  className = 'h-[360px] sm:h-[420px] lg:h-[440px]',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [impulseTick, setImpulseTick] = useState(0);
  const [replay, setReplay] = useState(0);
  // The model on stage lags the requested one while the old model animates out
  const [shown, setShown] = useState<ModelType>(modelType);
  const exiting = shown !== modelType;
  const handleExited = useCallback(() => setShown(modelType), [modelType]);

  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
  );
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Render and animate ONLY while the viewport is on screen (battery + GPU)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '80px',
      threshold: 0.05,
    });
    io.observe(el);
    const onVisibilityChange = () => {
      if (document.hidden) setInView(false);
      else {
        const rect = el.getBoundingClientRect();
        setInView(rect.top < window.innerHeight + 80 && rect.bottom > -80);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const fit = MODEL_FIT[modelType] || MODEL_FIT.cup;
  const shownFit = MODEL_FIT[shown] || MODEL_FIT.cup;

  return (
    <div ref={wrapRef} className={`relative w-full select-none overflow-hidden group/stage ${className}`}>
      <div className="absolute top-3 inset-x-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <button
          type="button"
          onClick={() => setExploded((prev) => !prev)}
          aria-pressed={exploded}
          className={`${hudButton} ${exploded ? 'bg-[#DE3163] text-white border-[#DE3163]' : hudIdle}`}
        >
          {exploded ? '● Vista esplosa' : '○ Esplodi strati'}
        </button>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setReplay((r) => r + 1)} className={`${hudButton} ${hudIdle}`} title="Rivedi l'assemblaggio">
            ↺ Ricomponi
          </button>
          <button type="button" onClick={() => setImpulseTick((t) => t + 1)} className={`${hudButton} ${hudIdle}`}>
            ✦ Impulso
          </button>
        </div>
      </div>

      <div className="absolute inset-0">
        <CanvasErrorBoundary>
          <Canvas
            frameloop={inView ? 'always' : 'never'}
            camera={{ position: [0, 0.6, 5.2], fov: 34 }}
            dpr={isTouch ? [1, 1.5] : [1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: isTouch ? 'low-power' : 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.05,
            }}
            style={{ touchAction: isTouch ? 'pan-y' : 'none' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.45} />
              <hemisphereLight args={['#fff6f1', '#f3d6dc', 0.65]} />
              <directionalLight position={[4, 7, 5]} intensity={2.0} color="#fff4ea" />
              <directionalLight position={[-5, 3, -4]} intensity={1.2} color="#ffc4d6" />
              <spotLight position={[0, 6, -4]} angle={0.5} penumbra={1} intensity={18} color="#ffffff" />
              <pointLight position={[0, -1.2, 3.5]} intensity={0.6} color={accentColor} />

              {/* Procedural studio HDRI: soft boxes give glossy surfaces real reflections offline */}
              <Environment resolution={isTouch ? 64 : 128} frames={1}>
                <Lightformer form="rect" intensity={2.4} position={[0, 5, -2]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
                <Lightformer form="rect" intensity={1.7} position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} color="#ffe3ea" />
                <Lightformer form="rect" intensity={1.4} position={[5, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} color="#fff1dc" />
                <Lightformer form="ring" intensity={1.3} position={[0, 1, 6]} scale={3} color={accentColor} />
              </Environment>

              <MotionRoot
                key={`${shown}-${replay}`}
                exploded={exploded}
                impulseTick={impulseTick}
                autoRotate={!reducedMotion}
                exiting={exiting}
                onExited={handleExited}
                reduced={reducedMotion}
              >
                {renderModel(shown, cupConfig, accentColor)}
                <KickRipple fit={shownFit} accent={accentColor} />
              </MotionRoot>

              {!reducedMotion && (
                <>
                  <Sparkles
                    count={isTouch ? 14 : 30}
                    scale={[fit.w * 1.6, fit.h * 1.1, fit.d * 1.4]}
                    position={[0, fit.cy, 0]}
                    size={2.6}
                    speed={0.35}
                    opacity={0.75}
                    color={accentColor}
                  />
                  <Floaties kind={fit.floaties} fit={fit} />
                </>
              )}

              {fit.pedestal !== false && <Pedestal fit={fit} accent={accentColor} />}
              <ContactShadows
                position={[0, fit.shadowY + 0.002, 0]}
                opacity={0.5}
                scale={Math.max(fit.w, fit.d) * 1.9}
                blur={2.6}
                far={4.5}
                resolution={isTouch ? 256 : 512}
                color="#5B1A33"
              />

              {!isTouch && (
                <OrbitControls
                  makeDefault
                  enableZoom={false}
                  enablePan={false}
                  enableDamping
                  dampingFactor={0.08}
                  rotateSpeed={0.7}
                  minPolarAngle={Math.PI / 4.5}
                  maxPolarAngle={Math.PI / 1.95}
                />
              )}
              <CameraRig fit={fit} exploded={exploded} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-[#76525F] dark:text-[#C9AEBB]">
        <span className="truncate">Modello 3D interattivo</span>
        <span className="truncate text-right">
          {interactiveHint || (isTouch ? 'Tocca il prodotto' : 'Trascina 360° • Clicca il prodotto')}
        </span>
      </div>
    </div>
  );
};
