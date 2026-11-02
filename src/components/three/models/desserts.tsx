import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  HelixCurve,
  cachedGeometry,
  clamp01,
  crepeTexture,
  displace,
  easeOutCubic,
  fbm3,
  lathe,
  leafGeometry,
  lerp,
  mulberry32,
  noise3,
  paint,
  paperCupTexture,
  rollTexture,
  shapedTube,
  smoothProfile,
  smoothstep,
  starGeometry,
  waferTexture,
  warp,
} from '../kit';
import { Layer, useMotion } from '../motion';

const SPRINKLE_COLORS = ['#DE3163', '#FFFFFF', '#F2A65A', '#9B7BEA', '#7FB77E', '#FDE047'];

/* ============================================================================
   SHARED PIECES
   ============================================================================ */
const plateGeometry = () =>
  cachedGeometry('plate', () =>
    lathe(
      smoothProfile(
        [
          [0.001, 0],
          [0.9, 0],
          [1.0, 0.02],
          [1.3, 0.07],
          [1.56, 0.14],
          [1.62, 0.165],
          [1.58, 0.18],
          [1.32, 0.11],
          [1.02, 0.065],
          [0.001, 0.06],
        ],
        60
      ),
      128
    )
  );

const Plate: React.FC = () => (
  <group>
    <mesh geometry={plateGeometry()}>
      <meshPhysicalMaterial color="#FFFDF9" roughness={0.08} clearcoat={1} clearcoatRoughness={0.03} envMapIntensity={1.4} />
    </mesh>
    <mesh position={[0, 0.172, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.59, 0.011, 10, 160]} />
      <meshPhysicalMaterial color="#DE3163" roughness={0.25} clearcoat={1} />
    </mesh>
  </group>
);

/** Gelato scoop: bumpy dome with the ruffled lip a scooper leaves */
const scoopGeometry = (seed: number) =>
  cachedGeometry(`scoop-${seed}`, () => {
    const geo = new THREE.SphereGeometry(0.5, 96, 64);
    warp(geo, (p) => {
      const a = Math.atan2(p.z, p.x);
      if (p.y < -0.12) {
        const k = smoothstep(-0.12, -0.32, p.y);
        const flare = 1 + k * (0.14 + 0.06 * Math.sin(a * 9 + seed));
        p.x *= flare;
        p.z *= flare;
        p.y = Math.max(p.y, -0.3 + Math.sin(a * 7 + seed) * 0.02);
      }
    });
    displace(geo, (p) => fbm3(p.x * 4 + seed, p.y * 4, p.z * 4) * 0.045 + noise3(p.x * 14, p.y * 14, p.z * 14 + seed) * 0.008);
    return geo;
  });

const Scoop: React.FC<{ color: string; seed: number }> = ({ color, seed }) => (
  <mesh geometry={scoopGeometry(seed)}>
    <meshPhysicalMaterial color={color} roughness={0.58} sheen={0.8} sheenColor="#ffffff" sheenRoughness={0.5} clearcoat={0.08} />
  </mesh>
);

/** Instanced sprinkles scattered over spheres (centre, radius) */
const Sprinkles: React.FC<{ spheres: [number, number, number, number][]; count?: number; seed?: number }> = ({
  spheres,
  count = 80,
  seed = 1,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => cachedGeometry('sprinkle', () => new THREE.CapsuleGeometry(0.016, 0.06, 4, 8)), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.3, clearcoat: 1 }), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = mulberry32(seed);
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const [cx, cy, cz, r] = spheres[i % spheres.length];
      const u = rand() * Math.PI * 2;
      const v = Math.acos(lerp(1, 0.1, rand()));
      const n = new THREE.Vector3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
      dummy.position.set(cx, cy, cz).addScaledVector(n, r);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(rand() - 0.5, 0.2, rand() - 0.5).normalize());
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, c.set(SPRINKLE_COLORS[Math.floor(rand() * SPRINKLE_COLORS.length)]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [spheres, count, seed]);
  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
};

/** Wavy chocolate ring drizzled across the top of a sphere */
const Drizzle: React.FC<{ center: [number, number, number]; radius: number; seed: number; color?: string }> = ({
  center,
  radius,
  seed,
  color = '#3B1A0B',
}) => {
  const geo = useMemo(
    () =>
      cachedGeometry(`drizzle-${seed}-${radius}`, () => {
        const pts = Array.from({ length: 48 }, (_, i) => {
          const th = (i / 48) * Math.PI * 2;
          const lat = 0.55 + 0.32 * Math.sin(th * 3 + seed);
          return new THREE.Vector3(Math.cos(th) * Math.cos(lat), Math.sin(lat), Math.sin(th) * Math.cos(lat)).multiplyScalar(radius);
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, 0.028, 10, true);
      }),
    [seed, radius]
  );
  return (
    <mesh geometry={geo} position={center}>
      <meshPhysicalMaterial color={color} roughness={0.12} clearcoat={1} clearcoatRoughness={0.04} />
    </mesh>
  );
};

const Berry: React.FC<{ kind: 'blue' | 'rasp' | 'cherry' }> = ({ kind }) => {
  const rasp = useMemo(() => {
    if (kind !== 'rasp') return [];
    const out: [number, number, number][] = [];
    for (let i = 0; i < 26; i++) {
      const phi = Math.acos(1 - ((i + 0.5) / 26) * 1.6);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      out.push([Math.sin(phi) * Math.cos(th) * 0.1, Math.cos(phi) * 0.12, Math.sin(phi) * Math.sin(th) * 0.1]);
    }
    return out;
  }, [kind]);
  if (kind === 'blue') {
    return (
      <mesh scale={[0.085, 0.075, 0.085]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color="#2E2A6B" roughness={0.45} sheen={1} sheenColor="#8FA4D8" sheenRoughness={0.6} />
      </mesh>
    );
  }
  if (kind === 'cherry') {
    return (
      <group>
        <mesh scale={[0.15, 0.14, 0.15]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshPhysicalMaterial color="#B3122E" roughness={0.08} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.8} />
        </mesh>
        <mesh position={[0.03, 0.22, 0]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.012, 0.016, 0.22, 8]} />
          <meshPhysicalMaterial color="#5B7A2A" roughness={0.5} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      {rasp.map((p, i) => (
        <mesh key={i} position={p} scale={0.045}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshPhysicalMaterial color="#C2185B" roughness={0.25} clearcoat={0.8} sheen={0.5} sheenColor="#FF8FB3" />
        </mesh>
      ))}
    </group>
  );
};

/** Piped soft-serve / cream swirl with an animated draw-on during the intro */
const PipedSwirl: React.FC<{
  curve: THREE.Curve<THREE.Vector3>;
  color: string;
  radius: number;
  order: number;
  flutes?: number;
  roughness?: number;
}> = ({ curve, color, radius, order, flutes = 8, roughness = 0.45 }) => {
  const m = useMotion();
  const geo = useMemo(
    () =>
      shapedTube(curve, {
        tubular: 260,
        radial: 20,
        radius,
        flutes,
        fluteDepth: 0.12,
        taper: (t) => lerp(1, 0.45, t) * (t > 0.9 ? lerp(1, 0.25, (t - 0.9) / 0.1) : 1) * (t < 0.04 ? lerp(0.5, 1, t / 0.04) : 1),
      }),
    [curve, radius, flutes]
  );
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const k = m.reduced ? 1 : clamp01((m.intro - 0.4 - order * 0.11) / 1.2);
    geo.setDrawRange(0, Math.floor((geo.index?.count ?? 0) * easeOutCubic(k)));
    if (ref.current) ref.current.visible = k > 0;
  });
  return (
    <mesh ref={ref} geometry={geo}>
      <meshPhysicalMaterial color={color} roughness={roughness} sheen={1} sheenColor="#ffffff" sheenRoughness={0.45} clearcoat={0.12} />
    </mesh>
  );
};

/* ============================================================================
   4. BUBBLE WAFFLE CONE — eggette bubbles on a rolled cone, gelato, drizzle
   ============================================================================ */
const CONE = { tipY: -1.45, topY: 0.28, rTip: 0.07, rTop: 0.95 };
const coneR = (y: number) => lerp(CONE.rTip, CONE.rTop, (y - CONE.tipY) / (CONE.topY - CONE.tipY));

const coneGeometry = () =>
  cachedGeometry('waffle-cone', () => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const y = lerp(CONE.tipY, CONE.topY, i / 24);
      pts.push([coneR(y), y]);
    }
    const geo = lathe(pts, 96);
    warp(geo, (p) => {
      if (p.y > CONE.topY - 0.3) {
        const a = Math.atan2(p.z, p.x);
        const k = smoothstep(CONE.topY - 0.3, CONE.topY, p.y);
        p.y += Math.sin(a * 5) * 0.09 * k;
        const flare = 1 + k * (0.08 + Math.sin(a * 5) * 0.04);
        p.x *= flare;
        p.z *= flare;
      }
    });
    return paint(geo, (p, _n, c) => {
      c.set('#E2A050').offsetHSL(0, 0, fbm3(p.x * 4, p.y * 4, p.z * 4) * 0.08);
    });
  });

const WaffleBubbles: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => cachedGeometry('waffle-bubble', () => new THREE.SphereGeometry(1, 20, 14)), []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color('#FFE2A8') }),
    []
  );
  const bubbles = useMemo(() => {
    const out: { pos: THREE.Vector3; q: THREE.Quaternion; s: number; color: THREE.Color }[] = [];
    const rand = mulberry32(13);
    const slope = (CONE.rTop - CONE.rTip) / (CONE.topY - CONE.tipY);
    const z = new THREE.Vector3(0, 0, 1);
    let row = 0;
    for (let y = CONE.tipY + 0.22; y < CONE.topY - 0.08; y += 0.165, row++) {
      const r = coneR(y);
      const count = Math.max(4, Math.floor((Math.PI * 2 * r) / 0.19));
      for (let k = 0; k < count; k++) {
        const a = (k / count) * Math.PI * 2 + (row % 2) * (Math.PI / count);
        const n = new THREE.Vector3(Math.cos(a), -slope, Math.sin(a)).normalize();
        const s = 0.085 + rand() * 0.02;
        const pos = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).addScaledVector(n, s * 0.25);
        const color = new THREE.Color('#E6A24F').lerp(new THREE.Color('#B8661F'), rand() * 0.55);
        out.push({ pos, q: new THREE.Quaternion().setFromUnitVectors(z, n), s, color });
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mtx = new THREE.Matrix4();
    bubbles.forEach((b, i) => {
      mtx.compose(b.pos, b.q, new THREE.Vector3(b.s, b.s, b.s * 0.85));
      mesh.setMatrixAt(i, mtx);
      mesh.setColorAt(i, b.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bubbles]);
  return <instancedMesh ref={ref} args={[geo, mat, bubbles.length]} />;
};

const PaperSleeve: React.FC<{ accent: string }> = ({ accent }) => {
  const geo = useMemo(
    () =>
      cachedGeometry('waffle-sleeve', () => {
        const pts: [number, number][] = [];
        for (let i = 0; i <= 10; i++) {
          const y = lerp(CONE.tipY - 0.02, -0.5, i / 10);
          pts.push([coneR(y) + 0.11, y]);
        }
        return lathe(pts, 96);
      }),
    []
  );
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial map={paperCupTexture(accent)} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
};

const WaferRoll: React.FC = () => (
  <mesh>
    <cylinderGeometry args={[0.055, 0.055, 1.05, 24, 1]} />
    <meshPhysicalMaterial map={rollTexture()} roughness={0.5} clearcoat={0.3} />
  </mesh>
);

export const BubbleWaffleMesh: React.FC<{ accentColor?: string }> = ({ accentColor = '#DE3163' }) => {
  const coneMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, clearcoat: 0.2, side: THREE.DoubleSide }),
    []
  );
  const sprinkleSpheres = useMemo<[number, number, number, number][]>(
    () => [
      [-0.12, 0.55, 0.06, 0.48],
      [0.2, 0.95, -0.04, 0.44],
    ],
    []
  );
  return (
    <group position={[0, 0.02, 0]}>
      <Layer order={0} drop={1.2} explode={-0.25}>
        <mesh geometry={coneGeometry()} material={coneMat} />
        <WaffleBubbles />
      </Layer>
      <Layer order={1} explode={-0.55} grow>
        <PaperSleeve accent={accentColor} />
      </Layer>
      <Layer order={2} position={[-0.12, 0.55, 0.06]} explode={0.35} drop={2}>
        <Scoop color="#FFF1D4" seed={1} />
      </Layer>
      <Layer order={3} position={[0.2, 0.95, -0.04]} explode={0.7} drop={2}>
        <group scale={0.9}>
          <Scoop color={accentColor} seed={2} />
        </group>
      </Layer>
      <Layer order={4} explode={0.75} grow>
        <Drizzle center={[-0.12, 0.55, 0.06]} radius={0.5} seed={1} />
        <Drizzle center={[0.2, 0.95, -0.04]} radius={0.46} seed={2} />
      </Layer>
      <Layer order={5} position={[-0.42, 1.12, 0.18]} rotation={[0.25, 0, 0.45]} explode={[-0.3, 0.9, 0]} drop={2}>
        <WaferRoll />
      </Layer>
      <Layer order={5} position={[0.5, 1.2, 0.12]} rotation={[-0.15, 0, -0.38]} explode={[0.3, 0.9, 0]} drop={2}>
        <WaferRoll />
      </Layer>
      <Layer order={6} explode={0.8} grow>
        <Sprinkles spheres={sprinkleSpheres} count={90} seed={4} />
      </Layer>
      <Layer order={7} position={[0.22, 1.47, -0.02]} explode={1.2} drop={2.4}>
        <Berry kind="cherry" />
      </Layer>
    </group>
  );
};

/* ============================================================================
   5. CRÊPE — two folded wedges, Nutella ooze & drizzle, cream rosette, cookies
   ============================================================================ */
const crepeWedgeGeometry = (seed: number) =>
  cachedGeometry(`crepe-wedge-${seed}`, () => {
    // Polar grid (CircleGeometry has no radial rings to bend)
    const radial = 24;
    const seg = 64;
    const verts: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= radial; i++) {
      const r = (i / radial) * 1.25;
      for (let j = 0; j <= seg; j++) {
        const a = (j / seg) * (Math.PI / 2);
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const puff = 0.07 * (1 - Math.pow(r / 1.25, 2)) * Math.sin(Math.min(1, r * 3) * Math.PI * 0.5);
        const ripple = noise3(x * 3 + seed, z * 3, seed) * 0.02;
        const droop = Math.pow(Math.max(0, r - 0.95), 2) * 0.7;
        verts.push(x, puff + ripple - droop, z);
        uvs.push(x / 1.25, z / 1.25);
      }
    }
    for (let i = 0; i < radial; i++) {
      for (let j = 0; j < seg; j++) {
        const a = i * (seg + 1) + j;
        const b = a + seg + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  });

const crepeRimGeometry = (seed: number) =>
  cachedGeometry(`crepe-rim-${seed}`, () => {
    const pts = Array.from({ length: 40 }, (_, j) => {
      const a = (j / 39) * (Math.PI / 2);
      const x = Math.cos(a) * 1.25;
      const z = Math.sin(a) * 1.25;
      return new THREE.Vector3(x, noise3(x * 3 + seed, z * 3, seed) * 0.02 - 0.06, z);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.045, 10, false);
  });

const CrepeWedge: React.FC<{ seed: number }> = ({ seed }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: crepeTexture(),
        roughness: 0.6,
        sheen: 0.15,
        sheenColor: new THREE.Color('#FFE3B0'),
        side: THREE.DoubleSide,
      }),
    []
  );
  const rimMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#E9AE5E', roughness: 0.55 }), []);
  const nutella = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#3B1A0B', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 }),
    []
  );
  const sugar = useMemo(() => {
    const rand = mulberry32(seed + 70);
    return Array.from({ length: 70 }, () => {
      const r = Math.sqrt(rand()) * 1.1;
      const a = rand() * (Math.PI / 2);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = 0.07 * (1 - Math.pow(r / 1.25, 2)) + 0.015;
      return [x, y, z] as [number, number, number];
    });
  }, [seed]);
  return (
    <group>
      {/* Bottom sheet, then the folded top sheet */}
      <mesh geometry={crepeWedgeGeometry(seed + 1)} material={mat} position={[0, -0.07, 0]} />
      <mesh geometry={crepeWedgeGeometry(seed)} material={mat} />
      <mesh geometry={crepeRimGeometry(seed)} material={rimMat} />
      {/* Nutella oozing from both folded edges */}
      <mesh material={nutella} position={[0.62, -0.035, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.04, 1.05, 6, 12]} />
      </mesh>
      <mesh material={nutella} position={[0.02, -0.035, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.04, 1.05, 6, 12]} />
      </mesh>
      {sugar.map((p, i) => (
        <mesh key={i} position={p} scale={0.012}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

const NutellaZigzag: React.FC = () => {
  const geo = useMemo(
    () =>
      cachedGeometry('nutella-zigzag', () => {
        const pts = Array.from({ length: 13 }, (_, i) => {
          const t = i / 12;
          return new THREE.Vector3(lerp(-0.9, 0.9, t), 0.085 + Math.sin(t * Math.PI) * 0.03, (i % 2 === 0 ? -0.55 : 0.55) * (1 - Math.abs(t - 0.5)));
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4), 240, 0.025, 8, false);
      }),
    []
  );
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color="#3B1A0B" roughness={0.1} clearcoat={1} />
    </mesh>
  );
};

const PanDiStelle: React.FC<{ seed: number }> = ({ seed }) => {
  const stars = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
      const r = i === 0 ? 0 : 0.12 + rand() * 0.12;
      return { pos: [Math.cos(a) * r, 0.05, Math.sin(a) * r] as [number, number, number], rot: rand() * Math.PI };
    });
  }, [seed]);
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.32, 0.31, 0.08, 48]} />
        <meshPhysicalMaterial color="#3A2214" roughness={0.75} />
      </mesh>
      {stars.map((s, i) => (
        <mesh key={i} geometry={starGeometry(0.05, 0.022, 0.012)} position={s.pos} rotation={[0, s.rot, 0]}>
          <meshPhysicalMaterial color="#FFFDF7" roughness={0.4} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export const CrepeMesh: React.FC<{ accentColor?: string }> = () => {
  const rosette = useMemo(() => new HelixCurve(2.4, 0.2, 0.02, 0.02, 0.32, 0, (t) => t), []);
  return (
    <group position={[0, -0.55, 0]}>
      <Layer order={0} position={[0, -0.25, 0]} explode={-0.3} drop={1}>
        <Plate />
      </Layer>
      <Layer order={1} position={[-0.62, -0.06, -0.5]} rotation={[0, 0.2, 0]} explode={0.25} drop={1.8}>
        <group scale={1.15}>
          <CrepeWedge seed={1} />
        </group>
      </Layer>
      <Layer order={2} position={[0.5, 0.06, 0.62]} rotation={[0, Math.PI + 0.55, 0]} explode={0.5} drop={1.8}>
        <group scale={1.15}>
          <CrepeWedge seed={5} />
        </group>
      </Layer>
      <Layer order={3} explode={0.75} grow>
        <NutellaZigzag />
      </Layer>
      <Layer order={4} position={[-0.95, -0.12, 0.62]} explode={[-0.3, 0.6, 0]} grow>
        <PipedSwirl curve={rosette} color="#FFF9F4" radius={0.12} order={4} />
      </Layer>
      <Layer order={5} position={[0.85, 0.12, -0.55]} rotation={[0.35, 0.3, 0.25]} explode={[0.3, 0.8, 0]} drop={1.6}>
        <PanDiStelle seed={2} />
      </Layer>
      <Layer order={6} position={[0.15, 0.2, -0.2]} rotation={[-0.3, 0.8, -0.2]} explode={0.95} drop={1.6}>
        <PanDiStelle seed={7} />
      </Layer>
      <Layer order={7} position={[-1.1, -0.1, -0.35]} explode={[-0.3, 0.5, 0]} drop={1.5}>
        <Berry kind="rasp" />
      </Layer>
      <Layer order={7} position={[1.12, -0.12, 0.35]} explode={[0.3, 0.5, 0]} drop={1.5}>
        <Berry kind="blue" />
      </Layer>
    </group>
  );
};

/* ============================================================================
   6. PANCAKE STACK — browned faces, pale crumb edge, amber syrup that runs down
   ============================================================================ */
const pancakeGeometry = (seed: number) =>
  cachedGeometry(`pancake-${seed}`, () => {
    const geo = lathe(
      smoothProfile(
        [
          [0.001, 0],
          [0.95, 0],
          [1.06, 0.02],
          [1.12, 0.08],
          [1.13, 0.13],
          [1.1, 0.19],
          [1.02, 0.215],
          [0.6, 0.232],
          [0.001, 0.24],
        ],
        40
      ),
      96
    );
    warp(geo, (p) => {
      const a = Math.atan2(p.z, p.x);
      const k = 1 + noise3(Math.cos(a) * 2 + seed, Math.sin(a) * 2, seed) * 0.03;
      p.x *= k;
      p.z *= k;
    });
    const brown = new THREE.Color('#9E4E15');
    const golden = new THREE.Color('#C97C2E');
    const crumb = new THREE.Color('#EDC277');
    return paint(geo, (p, n, c) => {
      const side = 1 - smoothstep(0.35, 0.75, Math.abs(n.y));
      const r = Math.hypot(p.x, p.z);
      c.copy(brown).lerp(golden, smoothstep(0.2, 1.05, r) * 0.7 + fbm3(p.x * 4 + seed, 0, p.z * 4) * 0.5);
      c.lerp(crumb, side);
    });
  });

const syrupPoolGeometry = () =>
  cachedGeometry('syrup-pool', () => {
    const geo = new THREE.CircleGeometry(1, 128);
    geo.rotateX(-Math.PI / 2);
    warp(geo, (p) => {
      const a = Math.atan2(p.z, p.x);
      const r = Math.hypot(p.x, p.z);
      const edge = 0.94 + noise3(Math.cos(a) * 2, Math.sin(a) * 2, 4) * 0.1;
      p.x *= edge;
      p.z *= edge;
      p.y = 0.025 * (1 - r * r);
    });
    return geo;
  });

/** Syrup runs over the rim and down the side of the stack, drawn on like a pour */
const syrupDripGeometry = (i: number, len: number) =>
  cachedGeometry(`syrup-drip-${i}-${len.toFixed(2)}`, () => {
    const pts = [
      [0.86, 0.03],
      [1.04, 0.035],
      [1.15, -0.02],
      [1.17, -0.12],
      [1.16, -0.24],
      [1.17, -len],
    ].map(([r, y]) => new THREE.Vector3(r, y, 0));
    return shapedTube(new THREE.CatmullRomCurve3(pts), {
      tubular: 64,
      radial: 12,
      radius: 0.045,
      taper: (t) => lerp(1.25, 0.85, t) + smoothstep(0.86, 1, t) * 0.6,
    });
  });

const SyrupDrips: React.FC<{ order: number }> = ({ order }) => {
  const m = useMotion();
  const drips = useMemo(() => {
    const rand = mulberry32(81);
    return Array.from({ length: 8 }, (_, i) => {
      const len = 0.28 + rand() * 0.42;
      return { a: (i / 8) * Math.PI * 2 + rand() * 0.5, geo: syrupDripGeometry(i, len) };
    });
  }, []);
  // Per-instance clones so each canvas animates its own draw range
  const geos = useMemo(() => drips.map((d) => d.geo.clone()), [drips]);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#A8561A', transparent: true, opacity: 0.92, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.6 }),
    []
  );
  useFrame(() => {
    const k = m.reduced ? 1 : clamp01((m.intro - 0.5 - order * 0.11) / 1.8);
    geos.forEach((g, i) => {
      const flow = easeOutCubic(clamp01(k * 1.4 - i * 0.05));
      g.setDrawRange(0, Math.floor((g.index?.count ?? 0) * flow));
    });
  });
  return (
    <group>
      {drips.map((d, i) => (
        <mesh key={i} geometry={geos[i]} material={mat} rotation={[0, -d.a, 0]} />
      ))}
    </group>
  );
};

export const PancakeStackMesh: React.FC<{ accentColor?: string }> = () => {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color('#FFDCA0') }),
    []
  );
  const stack = [
    { y: -0.86, rot: 0.2, x: 0.02, seed: 1 },
    { y: -0.64, rot: 1.4, x: -0.03, seed: 2 },
    { y: -0.42, rot: 2.6, x: 0.02, seed: 3 },
  ];
  const topY = -0.42 + 0.24;
  return (
    <group position={[0, -0.05, 0]}>
      <Layer order={0} position={[0, -0.92, 0]} explode={-0.3} drop={1}>
        <Plate />
      </Layer>
      {stack.map((p, i) => (
        <Layer key={i} order={i + 1} position={[p.x, p.y, 0]} rotation={[0, p.rot, 0]} explode={(i + 1) * 0.25} drop={2}>
          <mesh geometry={pancakeGeometry(p.seed)} material={mat} />
        </Layer>
      ))}
      <Layer order={4} position={[0, topY, 0]} explode={0.95} grow>
        <mesh geometry={syrupPoolGeometry()}>
          <meshPhysicalMaterial color="#B5651D" transparent opacity={0.88} roughness={0.04} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.8} />
        </mesh>
        <SyrupDrips order={4} />
      </Layer>
      <Layer order={5} position={[0, topY + 0.28, 0]} explode={1.25} drop={2}>
        <group scale={0.72}>
          <Scoop color="#FFF4DC" seed={5} />
        </group>
      </Layer>
      <Layer order={6} position={[0.1, topY + 0.56, 0.06]} explode={1.5} grow>
        <group rotation={[0.3, 0.6, 0]}>
          <mesh geometry={leafGeometry(0.36, 0.17)} rotation={[-0.6, 0, 0.3]}>
            <meshPhysicalMaterial color="#22C55E" roughness={0.35} clearcoat={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={leafGeometry(0.3, 0.15)} rotation={[-0.7, 2.4, -0.2]}>
            <meshPhysicalMaterial color="#16A34A" roughness={0.35} clearcoat={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Layer>
      {[
        [0.55, topY + 0.07, 0.42, 'blue'],
        [-0.5, topY + 0.07, -0.38, 'blue'],
        [0.62, topY + 0.09, -0.3, 'rasp'],
        [-1.25, -0.82, 0.5, 'rasp'],
        [1.28, -0.84, -0.3, 'blue'],
        [1.1, -0.84, 0.62, 'blue'],
      ].map(([x, y, z, kind], i) => (
        <Layer key={i} order={6 + i * 0.3} position={[x as number, y as number, z as number]} explode={0.9} drop={1.6}>
          <Berry kind={kind as 'blue' | 'rasp'} />
        </Layer>
      ))}
    </group>
  );
};

/* ============================================================================
   7. FROZEN YOGURT COPPETTA — branded paper cup with a two-tone soft-serve twist
   ============================================================================ */
const PAPER = { bottomY: -1.3, topY: -0.22, rBottom: 0.72, rTop: 1.0 };
const paperCupGeometry = () =>
  cachedGeometry('paper-cup', () => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const y = lerp(PAPER.bottomY, PAPER.topY, i / 12);
      pts.push([lerp(PAPER.rBottom, PAPER.rTop, i / 12), y]);
    }
    return lathe(pts, 96);
  });

const yogurtMoundGeometry = () =>
  cachedGeometry('yogurt-mound', () =>
    lathe(
      smoothProfile(
        [
          [0.001, PAPER.topY - 0.1],
          [0.96, PAPER.topY - 0.1],
          [0.98, PAPER.topY - 0.02],
          [0.8, PAPER.topY + 0.1],
          [0.4, PAPER.topY + 0.16],
          [0.001, PAPER.topY + 0.17],
        ],
        24
      ),
      64
    )
  );

const waferFanGeometry = () =>
  cachedGeometry('wafer-fan', () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, 0.55, Math.PI * 0.3, Math.PI * 0.7, false);
    s.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, curveSegments: 24 });
    geo.translate(0, -0.25, -0.025);
    return geo;
  });

export const GelatoCoppettaMesh: React.FC<{ accentColor?: string }> = ({ accentColor = '#DE3163' }) => {
  const twistA = useMemo(() => new HelixCurve(2.6, 0.6, 0.04, PAPER.topY + 0.1, 0.95, 0, (t) => Math.pow(t, 0.85)), []);
  const twistB = useMemo(() => new HelixCurve(2.6, 0.6, 0.04, PAPER.topY + 0.1, 0.95, Math.PI, (t) => Math.pow(t, 0.85)), []);
  const sprinkleSpheres = useMemo<[number, number, number, number][]>(() => [[0, 0.15, 0, 0.62]], []);
  const waferTex = waferTexture();
  return (
    <group position={[0, 0.12, 0]}>
      <Layer order={0} drop={1.2} explode={-0.35}>
        <mesh geometry={paperCupGeometry()}>
          <meshPhysicalMaterial map={paperCupTexture(accentColor)} roughness={0.65} clearcoat={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, PAPER.bottomY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[PAPER.rBottom, 48]} />
          <meshPhysicalMaterial color="#FFF8F3" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, PAPER.topY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[PAPER.rTop, 0.03, 12, 96]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      </Layer>
      <Layer order={1} explode={0.15} grow>
        <mesh geometry={yogurtMoundGeometry()}>
          <meshPhysicalMaterial color="#FFF8EE" roughness={0.5} sheen={1} sheenColor="#ffffff" />
        </mesh>
      </Layer>
      <Layer order={2} explode={0.4} grow>
        <PipedSwirl curve={twistA} color="#FFF8EE" radius={0.21} order={2} flutes={6} />
        <PipedSwirl curve={twistB} color={accentColor} radius={0.21} order={2} flutes={6} />
      </Layer>
      <Layer order={4} explode={0.7} grow>
        <Sprinkles spheres={sprinkleSpheres} count={70} seed={8} />
      </Layer>
      <Layer order={5} position={[-0.42, 0.55, -0.12]} rotation={[-0.2, 0.5, 0.35]} explode={[-0.4, 0.9, 0]} drop={2}>
        <mesh geometry={waferFanGeometry()}>
          <meshPhysicalMaterial map={waferTex} roughness={0.6} />
        </mesh>
      </Layer>
      <Layer order={6} position={[0.5, 0.45, 0.1]} rotation={[0.15, 0.3, -0.42]} explode={[0.4, 0.9, 0]} drop={2}>
        <mesh>
          <boxGeometry args={[0.13, 0.9, 0.025]} />
          <meshPhysicalMaterial color={accentColor} transparent opacity={0.82} roughness={0.08} clearcoat={1} />
        </mesh>
      </Layer>
      <Layer order={7} position={[0.18, 1.0, 0.05]} explode={1.1} drop={2.2}>
        <Berry kind="rasp" />
      </Layer>
      <Layer order={7} position={[-0.3, 0.42, 0.5]} explode={0.8} drop={2}>
        <Berry kind="blue" />
      </Layer>
    </group>
  );
};

