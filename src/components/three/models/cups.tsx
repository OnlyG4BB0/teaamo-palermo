import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  HelixCurve,
  cachedGeometry,
  citrusTexture,
  clamp01,
  cupLabelTexture,
  damp,
  easeOutCubic,
  glassMaterial,
  heartGeometry,
  lathe,
  leafGeometry,
  lerp,
  liquidMaterial,
  mulberry32,
  roundedBox,
  shapedTube,
  smoothProfile,
  smoothstep,
  strawTexture,
} from '../kit';
import { Layer, introProgress, useMotion } from '../motion';

export interface Cup3DConfig {
  liquidTopColor: string;
  liquidBottomColor: string;
  bobaColor: string;
  bobaSecondaryColor: string;
  creamColor?: string;
  hasPinkCream?: boolean;
  showIce?: boolean;
}

/* ============================================================================
   CUP DIMENSIONS (local space, the cup group sits at y = -0.45)
   ============================================================================ */
const CUP = { bottomY: -1.375, topY: 1.33, rBottom: 0.745, rTop: 1.035, fillY: 0.95 };
const cupR = (y: number) =>
  lerp(CUP.rBottom, CUP.rTop, (y - CUP.bottomY) / (CUP.topY - CUP.bottomY));

const cupWallGeometry = () =>
  cachedGeometry('cup-wall', () => {
    const pts: [number, number][] = [
      [0, -1.3],
      [0.5, -1.31],
      [0.64, -1.345],
      [0.7, -1.375],
      [0.745, -1.36],
    ];
    for (let i = 1; i <= 24; i++) {
      const y = lerp(-1.36, 1.31, i / 24);
      pts.push([cupR(y), y]);
    }
    return lathe(pts, 96);
  });

/** Liquid volume; `inset` pulls it away from the wall at the bottom so pearls press against the glass */
const liquidGeometry = (inset: number) =>
  cachedGeometry(`cup-liquid-${inset}`, () => {
    const pts: [number, number][] = [[0, -1.29]];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const y = lerp(-1.29, CUP.fillY, i / n);
      const pull = inset * (1 - smoothstep(-0.85, -0.45, y));
      pts.push([cupR(y) - 0.032 - pull, y]);
    }
    pts.push([cupR(CUP.fillY) - 0.06, CUP.fillY + 0.012]);
    pts.push([0, CUP.fillY + 0.02]);
    return lathe(pts, 72);
  });

const labelBandGeometry = () =>
  cachedGeometry('cup-label', () => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const y = lerp(-0.46, 0.32, i / 8);
      pts.push([cupR(y) + 0.007, y]);
    }
    return lathe(pts, 96);
  });

const domeLidGeometry = () =>
  cachedGeometry('cup-dome', () =>
    lathe(
      smoothProfile(
        [
          [1.07, 1.31],
          [1.075, 1.37],
          [1.0, 1.52],
          [0.82, 1.67],
          [0.52, 1.77],
          [0.22, 1.8],
          [0.001, 1.805],
        ],
        40
      ),
      96
    )
  );

const foamGeometry = () =>
  cachedGeometry('cup-foam', () =>
    lathe(
      smoothProfile(
        [
          [0.001, CUP.fillY],
          [cupR(CUP.fillY) - 0.035, CUP.fillY],
          [cupR(1.25) - 0.03, 1.25],
          [cupR(1.33) - 0.06, 1.37],
          [0.7, 1.42],
          [0.3, 1.45],
          [0.001, 1.46],
        ],
        36
      ),
      72
    )
  );

const sphereGeometry = () => cachedGeometry('unit-sphere', () => new THREE.SphereGeometry(1, 28, 20));

/* ============================================================================
   PEARL PHYSICS — gravity, drag, wall/floor constraints, pearl-pearl collisions
   and a vortex that lifts and swirls the pearls when the drink is stirred.
   ============================================================================ */
class PearlSim {
  pos: Float32Array;
  vel: Float32Array;
  size: Float32Array;
  stir = 0;

  constructor(
    public count: number,
    public radius: number,
    seed: number,
    public floorY: number,
    public ceilY: number,
    public rAt: (y: number) => number,
    public gravity: number,
    settled: boolean
  ) {
    const rand = mulberry32(seed);
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const y = lerp(floorY + 0.4, ceilY, rand());
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * this.rAt(y) * 0.9;
      this.pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
      this.size[i] = radius * (0.9 + rand() * 0.2);
    }
    if (settled) for (let k = 0; k < 260; k++) this.step(1 / 60, k / 60);
  }

  step(rawDt: number, time: number) {
    const dt = Math.min(rawDt, 1 / 30);
    const { pos, vel, count } = this;
    const stir = this.stir;
    this.stir *= Math.exp(-0.9 * dt);
    const drag = Math.exp(-2.4 * dt);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = pos[ix];
      const z = pos[ix + 2];
      const r = Math.hypot(x, z) + 1e-4;
      // Vortex: tangential swirl + an up-draft that is strongest in the centre
      const swirl = stir * 7.5;
      vel[ix] += (-z / r) * swirl * dt + Math.sin(time * 0.7 + i) * 0.04 * dt;
      vel[ix + 2] += (x / r) * swirl * dt + Math.cos(time * 0.6 + i * 1.3) * 0.04 * dt;
      vel[ix + 1] += (this.gravity + stir * (6 + 9 * (1 - Math.min(1, r / 0.55)))) * dt;
      vel[ix] *= drag;
      vel[ix + 1] *= drag;
      vel[ix + 2] *= drag;
      pos[ix] += vel[ix] * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
      pos[ix + 2] += vel[ix + 2] * dt;
    }

    // Pair collisions (n² is fine for ~60 pearls)
    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        for (let j = i + 1; j < count; j++) {
          const jx = j * 3;
          const dx = pos[jx] - pos[ix];
          const dy = pos[jx + 1] - pos[ix + 1];
          const dz = pos[jx + 2] - pos[ix + 2];
          const minD = this.size[i] + this.size[j];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < minD * minD && d2 > 1e-8) {
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const nz = dz / d;
            const push = (minD - d) * 0.5;
            pos[ix] -= nx * push;
            pos[ix + 1] -= ny * push;
            pos[ix + 2] -= nz * push;
            pos[jx] += nx * push;
            pos[jx + 1] += ny * push;
            pos[jx + 2] += nz * push;
            const rv = (vel[jx] - vel[ix]) * nx + (vel[jx + 1] - vel[ix + 1]) * ny + (vel[jx + 2] - vel[ix + 2]) * nz;
            if (rv < 0) {
              const imp = -rv * 0.6;
              vel[ix] -= nx * imp;
              vel[ix + 1] -= ny * imp;
              vel[ix + 2] -= nz * imp;
              vel[jx] += nx * imp;
              vel[jx + 1] += ny * imp;
              vel[jx + 2] += nz * imp;
            }
          }
        }
      }
      // Container: floor, liquid surface, tapered wall
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const s = this.size[i];
        if (pos[ix + 1] < this.floorY + s - this.radius) {
          pos[ix + 1] = this.floorY + s - this.radius;
          if (vel[ix + 1] < 0) vel[ix + 1] *= -0.25;
        }
        if (pos[ix + 1] > this.ceilY) {
          pos[ix + 1] = this.ceilY;
          if (vel[ix + 1] > 0) vel[ix + 1] *= -0.3;
        }
        const maxR = this.rAt(pos[ix + 1]) - (s - this.radius);
        const r = Math.hypot(pos[ix], pos[ix + 2]);
        if (r > maxR) {
          const nx = pos[ix] / r;
          const nz = pos[ix + 2] / r;
          pos[ix] = nx * maxR;
          pos[ix + 2] = nz * maxR;
          const vr = vel[ix] * nx + vel[ix + 2] * nz;
          if (vr > 0) {
            vel[ix] -= nx * vr * 1.3;
            vel[ix + 2] -= nz * vr * 1.3;
          }
        }
      }
    }
  }
}

const PearlBed: React.FC<{
  count: number;
  radius: number;
  primary: string;
  secondary: string;
  seed: number;
  ceilY: number;
  gravity: number;
  stirKey: string;
  popping?: boolean;
}> = ({ count, radius, primary, secondary, seed, ceilY, gravity, stirKey, popping = false }) => {
  const m = useMotion();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lastKick = useRef(0);
  const firstKey = useRef(stirKey);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const sim = useMemo(
    () =>
      new PearlSim(
        count,
        radius,
        seed,
        CUP.bottomY + 0.075 + radius,
        ceilY,
        (y) => cupR(y) - 0.036 - radius,
        gravity,
        m.reduced
      ),
    // One simulation per mounted cup
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        roughness: popping ? 0.04 : 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        sheen: popping ? 0.2 : 0.6,
        sheenColor: new THREE.Color('#ffffff'),
        sheenRoughness: 0.35,
        envMapIntensity: popping ? 2 : 1.4,
        iridescence: popping ? 0.35 : 0,
      }),
    [popping]
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const a = new THREE.Color(primary);
    const b = new THREE.Color(secondary);
    const c = new THREE.Color();
    const rand = mulberry32(seed + 3);
    for (let i = 0; i < count; i++) {
      c.copy(i % 3 === 2 ? b : a).offsetHSL(0, (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.06);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (stirKey !== firstKey.current) sim.stir = Math.max(sim.stir, 0.85);
  }, [primary, secondary, count, seed, sim, stirKey]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (m.kickCount !== lastKick.current) {
      lastKick.current = m.kickCount;
      sim.stir = Math.max(sim.stir, 1);
    }
    sim.step(delta, m.time);
    for (let i = 0; i < count; i++) {
      dummy.position.set(sim.pos[i * 3], sim.pos[i * 3 + 1], sim.pos[i * 3 + 2]);
      // Pearls stretch slightly along their velocity — reads as soft, chewy tapioca
      const speed = Math.hypot(sim.vel[i * 3], sim.vel[i * 3 + 1], sim.vel[i * 3 + 2]);
      const stretch = 1 + Math.min(0.18, speed * 0.05);
      dummy.scale.set(sim.size[i] / Math.sqrt(stretch), sim.size[i] * stretch, sim.size[i] / Math.sqrt(stretch));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[sphereGeometry(), material, count]} renderOrder={2} />;
};

/* ============================================================================
   CUP PARTS
   ============================================================================ */

/** Condensation beads on the outside of the glass; a few slide down and respawn */
const Condensation: React.FC<{ count?: number }> = ({ count = 70 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: count }, (_, i) => ({
      a: rand() * Math.PI * 2,
      y: lerp(-1.2, 0.95, rand()),
      s: 0.018 + rand() * 0.03,
      speed: i % 6 === 0 ? 0.05 + rand() * 0.12 : 0,
    }));
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.55,
        roughness: 0,
        clearcoat: 1,
        ior: 1.33,
        envMapIntensity: 2.6,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    drops.forEach((d, i) => {
      if (d.speed) {
        d.y -= d.speed * Math.min(delta, 0.05) * (1 + d.s * 20);
        if (d.y < -1.25) d.y = 0.95;
      }
      const r = cupR(d.y) + 0.012;
      dummy.position.set(Math.sin(d.a) * r, d.y, Math.cos(d.a) * r);
      dummy.rotation.set(0, d.a, 0);
      const elong = d.speed ? 1.5 : 1;
      dummy.scale.set(d.s, d.s * elong, d.s * 0.45);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[sphereGeometry(), material, count]} renderOrder={6} />;
};

const GlassCup: React.FC<{ label?: boolean; accent?: string }> = ({ label = true, accent = '#DE3163' }) => {
  const glass = useMemo(() => glassMaterial({ opacity: 0.14, edge: 0.5 }), []);
  const rim = useMemo(() => glassMaterial({ opacity: 0.45, edge: 0.4 }), []);
  const labelMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: cupLabelTexture(accent),
        roughness: 0.5,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
      }),
    [accent]
  );
  return (
    <>
      <mesh geometry={cupWallGeometry()} material={glass} renderOrder={5} />
      <mesh position={[0, 1.335, 0]} rotation={[Math.PI / 2, 0, 0]} material={rim} renderOrder={5}>
        <torusGeometry args={[1.045, 0.034, 16, 96]} />
      </mesh>
      {label && <mesh geometry={labelBandGeometry()} material={labelMat} />}
      <Condensation />
    </>
  );
};

const Straw: React.FC<{ base: string; stripe: string }> = ({ base, stripe }) => {
  const geo = useMemo(
    () =>
      cachedGeometry('straw', () => {
        const g = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 32, 16, true);
        // Diagonal cut at the top, like a real boba straw
        const pos = g.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          if (y > 1.7) pos.setY(i, y + pos.getX(i) * 0.9);
        }
        g.computeVertexNormals();
        return g;
      }),
    []
  );
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: strawTexture(base, stripe),
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        side: THREE.DoubleSide,
      }),
    [base, stripe]
  );
  return <mesh geometry={geo} material={mat} />;
};

const IceCubes: React.FC<{ spots: [number, number, number, number][] }> = ({ spots }) => {
  const m = useMotion();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geo = useMemo(() => cachedGeometry('ice', () => roundedBox(0.34, 0.3, 0.34, 0.06)), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#EAF7FF',
        transparent: true,
        opacity: 0.42,
        roughness: 0.06,
        clearcoat: 1,
        ior: 1.31,
        envMapIntensity: 2.2,
        depthWrite: false,
      }),
    []
  );
  useFrame(() => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const [x, y, z, rot] = spots[i];
      const t = m.time;
      mesh.position.set(
        x + Math.sin(t * 0.8 + i) * 0.03,
        y + Math.sin(t * 1.6 + i * 2) * (0.025 + m.kick * 0.12),
        z + Math.cos(t * 0.7 + i) * 0.03
      );
      mesh.rotation.set(0.3 + Math.sin(t + i) * 0.1, rot + t * 0.15 + m.kick * 2, -0.2 + Math.cos(t * 1.2 + i) * 0.08);
    });
  });
  return (
    <>
      {spots.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} geometry={geo} material={mat} renderOrder={3} />
      ))}
    </>
  );
};

/** Piped cream swirl: a fluted, tapering tube on a conical helix, "piped" in during the intro */
const CreamSwirl: React.FC<{ color: string; order: number }> = ({ color, order }) => {
  const m = useMotion();
  const meshRef = useRef<THREE.Mesh>(null);
  const tipRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () => new HelixCurve(3.15, 0.68, 0.04, 1.38, 2.1, 0.4, (t) => Math.pow(t, 0.8)),
    []
  );
  // Cloned per cup: the draw range animates per instance
  const geo = useMemo(
    () =>
      shapedTube(curve, {
        tubular: 260,
        radial: 22,
        radius: 0.2,
        flutes: 8,
        fluteDepth: 0.13,
        taper: (t) =>
          lerp(1, 0.48, t) * (t > 0.88 ? lerp(1, 0.3, (t - 0.88) / 0.12) : 1) * (t < 0.04 ? lerp(0.5, 1, t / 0.04) : 1),
      }),
    [curve]
  );
  useEffect(() => () => geo.dispose(), [geo]);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.42,
        sheen: 1,
        sheenColor: new THREE.Color('#ffffff'),
        sheenRoughness: 0.45,
        clearcoat: 0.15,
      }),
    // colour is lerped in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const target = useMemo(() => new THREE.Color(color), [color]);
  const tipPos = useMemo(() => curve.getPointAt(1), [curve]);
  const sprinkles = useMemo(() => {
    const rand = mulberry32(9);
    return Array.from({ length: 22 }, () => {
      const t = 0.1 + rand() * 0.8;
      const p = curve.getPointAt(t);
      const dir = new THREE.Vector3(p.x, 0, p.z).normalize();
      return {
        pos: p.clone().addScaledVector(dir, 0.16 * lerp(1, 0.5, t)).add(new THREE.Vector3(0, 0.08, 0)),
        color: ['#DE3163', '#FFFFFF', '#F2A65A', '#9B7BEA'][Math.floor(rand() * 4)],
        s: 0.024 + rand() * 0.014,
      };
    });
  }, [curve]);

  useFrame((_, delta) => {
    mat.color.lerp(target, 1 - Math.exp(-6 * delta));
    const k = m.reduced ? 1 : clamp01((m.intro - 0.55 - order * 0.11) / 1.1);
    const total = geo.index ? geo.index.count : 0;
    geo.setDrawRange(0, Math.floor(total * easeOutCubic(k)));
    if (tipRef.current) tipRef.current.visible = k > 0.98;
    if (meshRef.current) meshRef.current.visible = k > 0;
  });

  return (
    <group>
      <mesh geometry={foamGeometry()}>
        <meshPhysicalMaterial color="#FFF7F0" roughness={0.55} sheen={1} sheenColor="#ffffff" />
      </mesh>
      <mesh ref={meshRef} geometry={geo} material={mat} />
      <mesh ref={tipRef} position={tipPos} material={mat} scale={0.075}>
        <sphereGeometry args={[1, 20, 16]} />
      </mesh>
      {sprinkles.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.s} geometry={sphereGeometry()}>
          <meshPhysicalMaterial color={s.color} roughness={0.2} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
};

const DomeLid: React.FC = () => {
  const mat = useMemo(() => glassMaterial({ opacity: 0.17, edge: 0.6 }), []);
  return <mesh geometry={domeLidGeometry()} material={mat} renderOrder={6} />;
};

const HeartTopper: React.FC = () => {
  const m = useMotion();
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = m.time * 1.2 + m.kick * 6;
    ref.current.position.y = Math.sin(m.time * 2.6) * 0.05 + m.kick * 0.25;
  });
  return (
    <mesh ref={ref} geometry={heartGeometry()} scale={0.95}>
      <meshPhysicalMaterial
        color="#DE3163"
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.04}
        sheen={0.6}
        sheenColor="#FFB3C7"
        envMapIntensity={1.6}
      />
    </mesh>
  );
};

/** Liquid that "pours in": grows upwards from the cup floor during the intro */
const PouredLiquid: React.FC<{ material: THREE.Material; inset: number; order: number }> = ({
  material,
  inset,
  order,
}) => {
  const m = useMotion();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const k = introProgress(m, order, 1.0);
    ref.current.scale.y = Math.max(0.0001, easeOutCubic(k));
    ref.current.visible = k > 0;
  });
  return (
    <group ref={ref} position={[0, CUP.bottomY, 0]}>
      <mesh
        position={[0, -CUP.bottomY, 0]}
        geometry={liquidGeometry(inset)}
        material={material}
        renderOrder={1}
      />
    </group>
  );
};

const useLiquid = (config: Cup3DConfig, clear: boolean) => {
  const m = useMotion();
  const liquid = useMemo(
    () =>
      liquidMaterial({
        top: config.liquidTopColor,
        bottom: config.liquidBottomColor,
        minY: CUP.bottomY,
        maxY: CUP.fillY,
        streaks: clear ? 0 : 1,
        alphaLow: clear ? 0.5 : 0.97,
        alphaHigh: clear ? 0.6 : 0.97,
        swirl: clear ? '#FFFFFF' : '#FFF4E6',
        clear,
      }),
    // Colours are animated through uniforms
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clear]
  );
  const top = useMemo(() => new THREE.Color(config.liquidTopColor), [config.liquidTopColor]);
  const bottom = useMemo(() => new THREE.Color(config.liquidBottomColor), [config.liquidBottomColor]);
  const stirRef = useRef(0);
  const firstRef = useRef(`${config.liquidTopColor}${config.liquidBottomColor}`);

  useEffect(() => {
    if (`${config.liquidTopColor}${config.liquidBottomColor}` !== firstRef.current) stirRef.current = 1;
  }, [config.liquidTopColor, config.liquidBottomColor]);

  useFrame((_, delta) => {
    const u = liquid.uniforms;
    u.uTime.value += delta;
    const k = 1 - Math.exp(-4 * delta);
    u.uTop.value.lerp(top, k);
    u.uBottom.value.lerp(bottom, k);
    stirRef.current = damp(stirRef.current, 0, 1.2, delta);
    u.uStir.value = Math.max(stirRef.current, m.kick);
  });
  return liquid.material;
};

/* ============================================================================
   1. CLASSIC MILK TEA BOBA
   ============================================================================ */
export const BobaCupMesh: React.FC<{ config: Cup3DConfig }> = ({ config }) => {
  const liquid = useLiquid(config, false);
  const cream = config.hasPinkCream !== false;
  const stirKey = `${config.liquidTopColor}${config.bobaColor}${config.bobaSecondaryColor}`;

  return (
    <group position={[0, -0.45, 0]}>
      <Layer order={0} drop={0.8} hoverPeek={0}>
        <GlassCup />
      </Layer>

      <Layer order={1} drop={0} hoverPeek={0}>
        <PouredLiquid material={liquid} inset={0.13} order={1} />
        <PearlBed
          count={58}
          radius={0.105}
          primary={config.bobaColor}
          secondary={config.bobaSecondaryColor}
          seed={5}
          ceilY={CUP.fillY - 0.12}
          gravity={-4.2}
          stirKey={stirKey}
        />
        {config.showIce !== false && !cream && (
          <IceCubes
            spots={[
              [-0.36, 0.88, 0.22, 0.4],
              [0.34, 0.86, -0.2, 1.2],
              [0.02, 0.9, 0.42, 2.2],
            ]}
          />
        )}
      </Layer>

      <Layer order={4} explode={0.8} drop={1.4}>
        {cream ? (
          <CreamSwirl color={config.creamColor || '#FFD9DE'} order={4} />
        ) : (
<DomeLid />
        )}
      </Layer>

      {cream && (
        <Layer order={7} position={[0, 2.42, 0]} explode={1.2} grow>
          <HeartTopper />
        </Layer>
      )}

      <Layer order={6} position={[0.34, 0.55, 0.12]} rotation={[0.08, 0, -0.2]} explode={[0.2, 1, 0]} drop={3}>
        <Straw base="#F7D1DB" stripe="#DE3163" />
      </Layer>
    </group>
  );
};

/* ============================================================================
   2. CRYSTAL FRUIT TEA — citrus wheels pressed on the glass, popping boba, mint
   ============================================================================ */
const CitrusWheel: React.FC<{ rind: string; pulp: string; radius?: number }> = ({
  rind,
  pulp,
  radius = 0.36,
}) => {
  const mats = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      map: citrusTexture(rind, pulp),
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const side = new THREE.MeshPhysicalMaterial({ color: rind, roughness: 0.4, clearcoat: 0.6 });
    return [side, face, face];
  }, [rind, pulp]);
  return (
    <mesh material={mats}>
      <cylinderGeometry args={[radius, radius, 0.06, 48]} />
    </mesh>
  );
};

const FRUIT_SPOTS: { a: number; y: number; tilt: number; rind: string; pulp: string }[] = [
  { a: 0.3, y: -0.35, tilt: 0.2, rind: '#4D7C0F', pulp: '#A3E635' },
  { a: 1.9, y: 0.25, tilt: -0.3, rind: '#CA8A04', pulp: '#FDE047' },
  { a: 3.4, y: -0.55, tilt: 0.4, rind: '#C2410C', pulp: '#FB923C' },
  { a: 4.8, y: 0.45, tilt: -0.1, rind: '#4D7C0F', pulp: '#A3E635' },
];

const FloatingFruit: React.FC = () => {
  const m = useMotion();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = m.time * 0.18 + m.kick * 3;
    ref.current.position.y = Math.sin(m.time * 1.4) * 0.03;
  });
  return (
    <group ref={ref}>
      {FRUIT_SPOTS.map((f, i) => {
        const r = cupR(f.y) - 0.07;
        return (
          <group key={i} rotation={[0, f.a, 0]}>
            <group position={[0, f.y, r]} rotation={[Math.PI / 2, 0, f.tilt]}>
              <CitrusWheel rind={f.rind} pulp={f.pulp} />
            </group>
          </group>
        );
      })}
      <group position={[-0.15, 0.82, 0.05]} rotation={[0.25, 0.6, -0.15]}>
        <CitrusWheel rind="#4D7C0F" pulp="#A3E635" radius={0.4} />
      </group>
    </group>
  );
};

const MintSprig: React.FC = () => {
  const m = useMotion();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.z = Math.sin(m.time * 1.8) * 0.08 + m.kick * 0.4;
  });
  return (
    <group ref={ref}>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} geometry={leafGeometry(0.46, 0.22)} rotation={[-0.9, a, 0.2]} position={[0, 0.02 * i, 0]}>
          <meshPhysicalMaterial
            color={i === 1 ? '#16A34A' : '#22C55E'}
            roughness={0.35}
            clearcoat={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export const FruitTeaMesh: React.FC<{ config: Cup3DConfig }> = ({ config }) => {
  const liquid = useLiquid(config, true);
  const stirKey = `${config.liquidTopColor}${config.bobaColor}`;
  return (
    <group position={[0, -0.45, 0]}>
      <Layer order={0} drop={0.8} hoverPeek={0}>
        <GlassCup label={false} />
      </Layer>

      <Layer order={1} drop={0} hoverPeek={0}>
        <PearlBed
          count={36}
          radius={0.1}
          primary={config.bobaColor}
          secondary={config.bobaSecondaryColor}
          seed={17}
          ceilY={CUP.fillY - 0.1}
          gravity={-2.6}
          stirKey={stirKey}
          popping
        />
      </Layer>

      <Layer order={2} drop={1.2} hoverPeek={0.1} explode={[0, 0.2, 0]}>
        <FloatingFruit />
      </Layer>

      <Layer order={1} drop={0} hoverPeek={0}>
        <PouredLiquid material={liquid} inset={0.02} order={1} />
      </Layer>

      {config.showIce !== false && (
        <Layer order={3} drop={1.5} explode={0.45}>
          <IceCubes
            spots={[
              [-0.38, 0.8, 0.2, 0.4],
              [0.36, 0.84, -0.22, 1.2],
              [0.06, 0.78, -0.45, 2.2],
              [0.2, 0.62, 0.38, 3.1],
            ]}
          />
        </Layer>
      )}

      <Layer order={4} explode={0.8} drop={1.4}>
<DomeLid />
      </Layer>

      <Layer order={5} position={[-0.32, 1.86, 0.1]} explode={1.1} grow>
        <MintSprig />
      </Layer>

      <Layer order={6} position={[0.34, 0.55, 0.12]} rotation={[0.08, 0, -0.2]} explode={[0.2, 1, 0]} drop={3}>
        <Straw base="#E8F9EE" stripe="#16A34A" />
      </Layer>
    </group>
  );
};

/** Exposed for the stage's floating ambient particles */
export const unitSphere = sphereGeometry;
