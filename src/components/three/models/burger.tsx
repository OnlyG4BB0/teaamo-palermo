import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  cachedGeometry,
  clamp01,
  detailNormal,
  displace,
  fbm3,
  flagTexture,
  lathe,
  meltMaterial,
  mulberry32,
  noise3,
  paint,
  pickleTexture,
  smoothProfile,
  smoothstep,
  tomatoTexture,
  warp,
} from '../kit';
import { Layer, useMotion } from '../motion';

export type BurgerVariant = 'giove' | 'plutone' | 'marte' | 'urano';

const CRUMB = new THREE.Color('#F4DAAB');

/* ============================================================================
   BUNS — lathed brioche with egg-wash gradient crust and a toasted crumb face
   ============================================================================ */
const TOP_BUN_PROFILE: [number, number][] = smoothProfile(
  [
    [0.001, 0.0],
    [1.0, 0.0],
    [1.15, 0.04],
    [1.24, 0.17],
    [1.23, 0.36],
    [1.11, 0.58],
    [0.87, 0.78],
    [0.53, 0.92],
    [0.2, 0.975],
    [0.001, 0.985],
  ],
  56
);

const topBunGeometry = () =>
  cachedGeometry('bun-top', () => {
    const geo = lathe(TOP_BUN_PROFILE, 96);
    displace(geo, (p) => (p.y > 0.08 ? noise3(p.x * 2.2, p.y * 2.2, p.z * 2.2) * 0.018 : 0));
    const low = new THREE.Color('#E6A757');
    const mid = new THREE.Color('#C8742A');
    const top = new THREE.Color('#934313');
    return paint(geo, (p, _n, c) => {
      const r = Math.hypot(p.x, p.z);
      if (p.y < 0.03 && r < 1.08) {
        c.copy(CRUMB).offsetHSL(0, 0, noise3(p.x * 6, 0, p.z * 6) * 0.04);
        return;
      }
      const h = smoothstep(0.05, 0.95, p.y);
      c.copy(low).lerp(mid, smoothstep(0, 0.45, h)).lerp(top, smoothstep(0.45, 1, h));
      c.offsetHSL(0, 0, fbm3(p.x * 3, p.y * 3, p.z * 3) * 0.08);
    });
  });

const bottomBunGeometry = () =>
  cachedGeometry('bun-bottom', () => {
    const geo = lathe(
      smoothProfile(
        [
          [0.001, 0],
          [0.95, 0],
          [1.12, 0.05],
          [1.2, 0.16],
          [1.2, 0.28],
          [1.14, 0.37],
          [1.03, 0.415],
          [0.001, 0.42],
        ],
        40
      ),
      96
    );
    const crust = new THREE.Color('#C9782F');
    const side = new THREE.Color('#E5A65D');
    return paint(geo, (p, _n, c) => {
      const r = Math.hypot(p.x, p.z);
      if (p.y > 0.4 && r < 1.05) {
        c.copy(CRUMB).offsetHSL(0, 0, noise3(p.x * 6, 1, p.z * 6) * 0.04);
        return;
      }
      c.copy(crust).lerp(side, smoothstep(0.02, 0.3, p.y));
      c.offsetHSL(0, 0, fbm3(p.x * 3, p.y * 3, p.z * 3) * 0.07);
    });
  });

const useBunMaterial = () =>
  useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.55,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
        sheen: 0.3,
        sheenColor: new THREE.Color('#FFE2B0'),
        normalMap: detailNormal('pores', 9, 3),
        normalScale: new THREE.Vector2(0.32, 0.32),
      }),
    []
  );

const SesameSeeds: React.FC<{ count?: number }> = ({ count = 90 }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => cachedGeometry('seed', () => new THREE.SphereGeometry(1, 10, 8)), []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FBF1D3', roughness: 0.35, clearcoat: 0.6 }),
    []
  );
  const matrices = useMemo(() => {
    const rand = mulberry32(3);
    const out: THREE.Matrix4[] = [];
    const upper = TOP_BUN_PROFILE.map((p, i) => ({ p, i })).filter(({ p }) => p[1] > 0.4 && p[0] > 0.08);
    const q = new THREE.Quaternion();
    const spin = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let k = 0; k < count; k++) {
      const { p, i } = upper[Math.floor(rand() * upper.length)];
      const prev = TOP_BUN_PROFILE[Math.max(0, i - 1)];
      const next = TOP_BUN_PROFILE[Math.min(TOP_BUN_PROFILE.length - 1, i + 1)];
      const dr = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dr, dy) || 1;
      const a = rand() * Math.PI * 2;
      const nr = dy / len;
      const ny = -dr / len;
      const normal = new THREE.Vector3(Math.sin(a) * nr, ny, Math.cos(a) * nr).normalize();
      const pos = new THREE.Vector3(Math.sin(a) * p[0], p[1], Math.cos(a) * p[0]).addScaledVector(normal, 0.008);
      q.setFromUnitVectors(up, normal);
      spin.setFromAxisAngle(normal, rand() * Math.PI);
      q.premultiply(spin);
      out.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(0.03, 0.014, 0.058)));
    }
    return out;
  }, [count]);

  React.useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((mtx, i) => mesh.setMatrixAt(i, mtx));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
};

/* ============================================================================
   INGREDIENTS (each built with its bottom at local y = 0)
   ============================================================================ */
const pattyGeometry = (seed: number) =>
  cachedGeometry(`patty-${seed}`, () => {
    // Lathed so the top face has rings to carry the seared, uneven surface
    const geo = lathe(
      smoothProfile(
        [
          [0.001, 0],
          [1.18, 0],
          [1.28, 0.03],
          [1.31, 0.09],
          [1.28, 0.15],
          [1.18, 0.185],
          [0.95, 0.205],
          [0.5, 0.215],
          [0.001, 0.2],
        ],
        40
      ),
      128
    );
    warp(geo, (p) => {
      const a = Math.atan2(p.z, p.x);
      const r = Math.hypot(p.x, p.z);
      if (r > 0.6) {
        const k =
          1 +
          noise3(Math.cos(a) * 2 + seed, p.y * 4, Math.sin(a) * 2) * 0.045 +
          noise3(Math.cos(a) * 9, p.y * 8, Math.sin(a) * 9 + seed) * 0.018;
        p.x *= k;
        p.z *= k;
      }
    });
    displace(geo, (p) => fbm3(p.x * 6 + seed, p.y * 6, p.z * 6) * 0.024 + noise3(p.x * 18, p.y * 18, p.z * 18 + seed) * 0.008);
    const meat = new THREE.Color('#6E361A');
    const juicy = new THREE.Color('#8C4B27');
    const crust = new THREE.Color('#3C1808');
    const char = new THREE.Color('#1A0903');
    return paint(geo, (p, _n, c) => {
      const crisp = smoothstep(0.3, 0.75, fbm3(p.x * 5 + seed, p.y * 5, p.z * 5) + 0.5);
      c.copy(meat).lerp(juicy, smoothstep(0.5, 0.9, noise3(p.x * 9, p.y * 9, p.z * 9 + seed) + 0.5) * 0.6);
      c.lerp(crust, crisp);
      if (noise3(p.x * 16, p.y * 16, p.z * 16 + seed) > 0.5) c.lerp(char, 0.75);
    });
  });

/** The lacy, crispy skirt that defines a smash burger */
const laceGeometry = (seed: number) =>
  cachedGeometry(`lace-${seed}`, () => {
    const geo = new THREE.RingGeometry(1.0, 1.42, 160, 4);
    geo.rotateX(-Math.PI / 2);
    warp(geo, (p) => {
      const r = Math.hypot(p.x, p.z);
      const a = Math.atan2(p.z, p.x);
      if (r > 1.15) {
        const k = 1 + (noise3(Math.cos(a) * 3, Math.sin(a) * 3, seed) * 0.08 + noise3(Math.cos(a) * 11, Math.sin(a) * 11, seed) * 0.05);
        p.x *= k;
        p.z *= k;
      }
      p.y = 0.015 - Math.max(0, r - 1.25) * 0.12 + noise3(p.x * 6, p.z * 6, seed) * 0.012;
    });
    return paint(geo, (p, _n, c) => {
      c.set('#4A1F0A').lerp(new THREE.Color('#8A4B1E'), smoothstep(0.2, 0.8, noise3(p.x * 9, seed, p.z * 9) + 0.5));
    });
  });

const Patty: React.FC<{ seed: number }> = ({ seed }) => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.62,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        normalMap: detailNormal('rough', 12, 2),
        normalScale: new THREE.Vector2(0.9, 0.9),
      }),
    []
  );
  const laceMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.7,
        clearcoat: 0.25,
        side: THREE.DoubleSide,
        normalMap: detailNormal('rough', 10, 1),
        normalScale: new THREE.Vector2(0.8, 0.8),
      }),
    []
  );
  return (
    <group rotation={[0, seed, 0]}>
      <mesh geometry={pattyGeometry(seed)} material={mat} />
      <mesh geometry={laceGeometry(seed)} material={laceMat} />
    </group>
  );
};

/** A square slice of cheddar that melts over the patty once it lands */
const cheeseGeometry = () =>
  cachedGeometry('cheese', () => {
    const geo = new THREE.PlaneGeometry(1.95, 1.95, 56, 56);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const droop = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.hypot(x, z);
      const over = Math.max(0, d - 0.98);
      droop[i] = Math.pow(over, 1.35) * 1.5 + over * 0.15 + Math.max(0, noise3(x * 2.4, z * 2.4, 3)) * over * 0.55;
      pos.setY(i, 0.012 + noise3(x * 3, z * 3, 1) * 0.006);
    }
    geo.setAttribute('aDroop', new THREE.BufferAttribute(droop, 1));
    geo.computeVertexNormals();
    return geo;
  });

const Cheese: React.FC<{ order: number; rotation: number }> = ({ order, rotation }) => {
  const m = useMotion();
  const melt = useMemo(
    () =>
      meltMaterial({
        color: '#FFB21F',
        roughness: 0.26,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 0.5,
        sheenColor: new THREE.Color('#FFE38A'),
        side: THREE.DoubleSide,
      }),
    []
  );
  useFrame(() => {
    melt.uniforms.uTime.value = m.time;
    // Starts flat and slumps over the edges after it lands
    const landed = m.reduced ? 1 : clamp01((m.intro - 0.18 - order * 0.11 - 0.55) / 1.4);
    melt.uniforms.uMelt.value = smoothstep(0, 1, landed) * (1 + m.kick * 0.25);
  });
  return <mesh geometry={cheeseGeometry()} material={melt.material} rotation={[0, rotation, 0]} />;
};

const baconGeometry = (seed: number) =>
  cachedGeometry(`bacon-${seed}`, () => {
    const geo = new THREE.PlaneGeometry(2.0, 0.34, 72, 8);
    geo.rotateX(-Math.PI / 2);
    warp(geo, (p) => {
      p.y =
        0.035 +
        Math.sin(p.x * 4.4 + seed) * 0.04 +
        Math.sin(p.x * 10 + seed * 2) * 0.012 -
        Math.pow(Math.max(0, Math.abs(p.x) - 0.95), 2) * 1.6;
      p.z += Math.sin(p.x * 6 + seed) * 0.025;
    });
    const meat = new THREE.Color('#8C2A18');
    const fat = new THREE.Color('#F2BFA4');
    const crisp = new THREE.Color('#4F160A');
    return paint(geo, (p, _n, c, i) => {
      const uv = (geo.attributes.uv as THREE.BufferAttribute).getY(i);
      const band = Math.sin(uv * Math.PI * 3.2 + noise3(p.x * 2, seed, 0) * 1.5);
      c.copy(meat).lerp(fat, smoothstep(0.55, 0.85, band));
      c.lerp(crisp, smoothstep(0.2, 0.8, noise3(p.x * 6, seed, p.z * 6)) * 0.6);
    });
  });

const Bacon: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.45,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        side: THREE.DoubleSide,
      }),
    []
  );
  return (
    <group>
      <mesh geometry={baconGeometry(1)} material={mat} rotation={[0, 0.5, 0]} position={[0, 0, 0.12]} />
      <mesh geometry={baconGeometry(2)} material={mat} rotation={[0, -0.9, 0]} position={[0, 0.03, -0.1]} />
    </group>
  );
};

const lettuceGeometry = () =>
  cachedGeometry('lettuce', () => {
    const geo = new THREE.RingGeometry(0.02, 1.48, 200, 12);
    geo.rotateX(-Math.PI / 2);
    warp(geo, (p) => {
      const r = Math.hypot(p.x, p.z);
      const a = Math.atan2(p.z, p.x);
      const ruffle = Math.pow(r / 1.48, 2) * (0.075 * Math.sin(a * 13 + r * 5) + 0.03 * Math.sin(a * 29 + 1));
      const k = 1 + noise3(Math.cos(a) * 3, Math.sin(a) * 3, 5) * 0.06;
      p.x *= k;
      p.z *= k;
      p.y = 0.045 + ruffle - Math.pow(Math.max(0, r - 1.18), 2) * 1.4;
    });
    const inner = new THREE.Color('#D9F99D');
    const outer = new THREE.Color('#3BB54A');
    return paint(geo, (p, _n, c) => {
      const r = Math.hypot(p.x, p.z);
      c.copy(inner).lerp(outer, smoothstep(0.2, 1.3, r));
      const vein = Math.abs(Math.sin(Math.atan2(p.z, p.x) * 9));
      c.lerp(inner, (1 - smoothstep(0, 0.12, vein)) * 0.35);
    });
  });

const Lettuce: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.42,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        side: THREE.DoubleSide,
        sheen: 0.3,
      }),
    []
  );
  return <mesh geometry={lettuceGeometry()} material={mat} />;
};

const Slices: React.FC<{
  texture: THREE.Texture;
  side: string;
  radius: number;
  thick: number;
  spots: [number, number, number][];
}> = ({ texture, side, radius, thick, spots }) => {
  const mats = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.3, clearcoat: 0.9 });
    return [new THREE.MeshPhysicalMaterial({ color: side, roughness: 0.35, clearcoat: 0.6 }), face, face];
  }, [texture, side]);
  return (
    <group>
      {spots.map(([x, z, tilt], i) => (
        <mesh key={i} material={mats} position={[x, thick / 2 + i * 0.008, z]} rotation={[tilt, i, tilt * 0.5]}>
          <cylinderGeometry args={[radius, radius, thick, 40]} />
        </mesh>
      ))}
    </group>
  );
};

const onionRingGeometry = (seed: number) =>
  cachedGeometry(`onion-ring-${seed}`, () => {
    const geo = new THREE.TorusGeometry(0.5, 0.12, 24, 72);
    const amount = new Float32Array((geo.attributes.position as THREE.BufferAttribute).count);
    displace(geo, (p, _n, i) => {
      const d = fbm3(p.x * 7 + seed, p.y * 7, p.z * 7) * 0.05 + noise3(p.x * 18, p.y * 18, p.z * 18 + seed) * 0.015;
      amount[i] = d;
      return d;
    });
    const gold = new THREE.Color('#E0A246');
    const dark = new THREE.Color('#A05A1A');
    return paint(geo, (_p, _n, c, i) => {
      c.copy(dark).lerp(gold, smoothstep(-0.03, 0.03, amount[i]));
    });
  });

const OnionRings: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.7,
        clearcoat: 0.25,
        normalMap: detailNormal('pores', 6, 2),
        normalScale: new THREE.Vector2(0.7, 0.7),
      }),
    []
  );
  return (
    <group position={[0, 0.12, 0]}>
      <mesh geometry={onionRingGeometry(1)} material={mat} position={[-0.3, 0, 0.18]} rotation={[Math.PI / 2 + 0.08, 0, 0.1]} />
      <mesh geometry={onionRingGeometry(2)} material={mat} position={[0.32, 0.07, -0.16]} rotation={[Math.PI / 2 - 0.12, 0, -0.1]} />
    </group>
  );
};

const bbqOnionGeometry = () =>
  cachedGeometry('bbq-onion', () => {
    const rand = mulberry32(31);
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const a0 = rand() * Math.PI * 2;
      const r0 = 0.15 + rand() * 0.8;
      const pts = Array.from({ length: 5 }, (_, k) => {
        const a = a0 + k * (0.35 + rand() * 0.3);
        const r = Math.min(1.05, r0 + (rand() - 0.5) * 0.35);
        return new THREE.Vector3(Math.cos(a) * r, 0.03 + rand() * 0.06, Math.sin(a) * r);
      });
      parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 8, false));
    }
    return mergeGeometries(parts)!;
  });

const BBQOnion: React.FC = () => (
  <mesh geometry={bbqOnionGeometry()}>
    <meshPhysicalMaterial color="#7A3410" roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
  </mesh>
);

const chickenGeometry = () =>
  cachedGeometry('chicken', () => {
    const geo = new THREE.SphereGeometry(1, 96, 48);
    geo.scale(1.32, 0.17, 1.16);
    geo.translate(0, 0.17, 0);
    const amount = new Float32Array((geo.attributes.position as THREE.BufferAttribute).count);
    displace(geo, (p, _n, i) => {
      const d = fbm3(p.x * 5, p.y * 5, p.z * 5) * 0.06 + noise3(p.x * 16, p.y * 16, p.z * 16) * 0.018;
      amount[i] = d;
      return d;
    });
    const gold = new THREE.Color('#E39A3B');
    const deep = new THREE.Color('#9B5016');
    const flake = new THREE.Color('#F6C77A');
    return paint(geo, (_p, _n, c, i) => {
      c.copy(deep).lerp(gold, smoothstep(-0.04, 0.02, amount[i])).lerp(flake, smoothstep(0.035, 0.06, amount[i]));
    });
  });

const Chicken: React.FC = () => (
  <mesh geometry={chickenGeometry()}>
    <meshPhysicalMaterial vertexColors roughness={0.72} clearcoat={0.2} normalMap={detailNormal('pores', 8, 4)} normalScale={[0.75, 0.75]} />
  </mesh>
);

const sauceGeometry = (seed: number) =>
  cachedGeometry(`sauce-${seed}`, () => {
    const pts = Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      const r = 0.7 + Math.sin(i * 1.7 + seed) * 0.32;
      return new THREE.Vector3(Math.cos(a) * r, 0.02, Math.sin(a) * r);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.045, 8, true);
  });

/** Glossy sauce zig-zag plus drips that slowly run over the edge */
const Sauce: React.FC<{ color: string; seed: number }> = ({ color, seed }) => {
  const m = useMotion();
  const dripRefs = useRef<(THREE.Group | null)[]>([]);
  const ribbon = sauceGeometry(seed);
  const drips = useMemo(() => {
    const rand = mulberry32(seed + 50);
    return Array.from({ length: 5 }, () => ({ a: rand() * Math.PI * 2, len: 0.14 + rand() * 0.18, phase: rand() * 6 }));
  }, [seed]);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03, sheen: 0.4 }),
    [color]
  );
  useFrame(() => {
    dripRefs.current.forEach((g, i) => {
      if (!g) return;
      const d = drips[i];
      const grow = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(m.time * 0.6 + d.phase)) + m.kick * 0.4;
      g.scale.set(1, grow, 1);
    });
  });
  return (
    <group>
      <mesh geometry={ribbon} material={mat} />
      {drips.map((d, i) => (
        <group key={i} ref={(el) => (dripRefs.current[i] = el)} position={[Math.cos(d.a) * 1.2, 0.02, Math.sin(d.a) * 1.2]}>
          <mesh material={mat} position={[0, -d.len / 2, 0]}>
            <capsuleGeometry args={[0.045, d.len, 6, 12]} />
          </mesh>
          <mesh material={mat} position={[0, -d.len - 0.03, 0]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.06, 16, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ============================================================================
   DECOR — planetary rings with orbiting moons and the SpacePolly flag pick
   ============================================================================ */
const OrbitRings: React.FC<{ accent: string }> = ({ accent }) => {
  const m = useMotion();
  const moonA = useRef<THREE.Group>(null);
  const moonB = useRef<THREE.Group>(null);
  useFrame(() => {
    if (moonA.current) moonA.current.rotation.z = m.time * 0.7;
    if (moonB.current) moonB.current.rotation.z = -m.time * 0.5;
  });
  return (
    <group position={[0, -0.25, 0]}>
      <group rotation={[Math.PI / 2.25, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[1.78, 0.012, 12, 160]} />
          <meshPhysicalMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.2} metalness={0.5} />
        </mesh>
        <group ref={moonA}>
          <mesh position={[1.78, 0, 0]}>
            <sphereGeometry args={[0.08, 24, 16]} />
            <meshPhysicalMaterial color="#FFF1E6" roughness={0.4} clearcoat={0.6} />
          </mesh>
        </group>
      </group>
      <group rotation={[Math.PI / 1.8, -0.3, 0]}>
        <mesh>
          <torusGeometry args={[1.95, 0.008, 12, 160]} />
          <meshPhysicalMaterial color="#F2A65A" emissive="#F2A65A" emissiveIntensity={0.3} transparent opacity={0.75} />
        </mesh>
        <group ref={moonB}>
          <mesh position={[0, 1.95, 0]}>
            <sphereGeometry args={[0.055, 20, 14]} />
            <meshPhysicalMaterial color={accent} roughness={0.3} clearcoat={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const FlagPick: React.FC<{ label: string; accent: string }> = ({ label, accent }) => {
  const m = useMotion();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.66, 0.33, 24, 6);
    g.translate(0.33, 0, 0);
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from((geo.attributes.position as THREE.BufferAttribute).array), [geo]);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: flagTexture(label, accent), side: THREE.DoubleSide, roughness: 0.6, sheen: 0.4 }),
    [label, accent]
  );
  React.useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const wave = Math.sin(x * 9 - m.time * 5.5) * 0.045 * (x / 0.66) * (1 + m.kick * 2);
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.25, 12]} />
        <meshPhysicalMaterial color="#D9A86C" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshPhysicalMaterial color={accent} roughness={0.2} clearcoat={1} />
      </mesh>
      <mesh geometry={geo} material={mat} position={[0.02, 0.52, 0]} />
    </group>
  );
};

/* ============================================================================
   ASSEMBLY
   ============================================================================ */
type Ingredient = { key: string; h: number; node: (order: number) => React.ReactNode };

const RECIPES: Record<BurgerVariant, { label: string; ingredients: Ingredient[] }> = {
  giove: {
    label: 'Giove',
    ingredients: [
      { key: 'patty-a', h: 0.19, node: () => <Patty seed={1} /> },
      { key: 'cheese-a', h: 0.02, node: (o) => <Cheese order={o} rotation={0.4} /> },
      { key: 'bacon', h: 0.07, node: () => <Bacon /> },
      { key: 'patty-b', h: 0.19, node: () => <Patty seed={2} /> },
      { key: 'cheese-b', h: 0.02, node: (o) => <Cheese order={o} rotation={1.2} /> },
      { key: 'rings', h: 0.24, node: () => <OnionRings /> },
      { key: 'sauce', h: 0.03, node: () => <Sauce color="#E8762B" seed={1} /> },
    ],
  },
  plutone: {
    label: 'Plutone',
    ingredients: [
      { key: 'patty-a', h: 0.19, node: () => <Patty seed={3} /> },
      { key: 'cheese-a', h: 0.02, node: (o) => <Cheese order={o} rotation={0.2} /> },
      {
        key: 'pickles',
        h: 0.05,
        node: () => (
          <Slices
            texture={pickleTexture()}
            side="#3F6212"
            radius={0.27}
            thick={0.04}
            spots={[[0.5, 0.2, 0.05], [-0.45, 0.35, -0.05], [0.05, -0.55, 0.08], [-0.2, -0.05, 0.02]]}
          />
        ),
      },
      { key: 'patty-b', h: 0.19, node: () => <Patty seed={4} /> },
      { key: 'cheese-b', h: 0.02, node: (o) => <Cheese order={o} rotation={1.0} /> },
      { key: 'lettuce', h: 0.08, node: () => <Lettuce /> },
      { key: 'sauce', h: 0.03, node: () => <Sauce color="#F4A28C" seed={2} /> },
    ],
  },
  marte: {
    label: 'Marte',
    ingredients: [
      { key: 'lettuce', h: 0.08, node: () => <Lettuce /> },
      { key: 'patty-a', h: 0.19, node: () => <Patty seed={5} /> },
      { key: 'cheese-a', h: 0.02, node: (o) => <Cheese order={o} rotation={0.7} /> },
      { key: 'bbq', h: 0.1, node: () => <BBQOnion /> },
      { key: 'sauce', h: 0.03, node: () => <Sauce color="#5A1E0B" seed={3} /> },
    ],
  },
  urano: {
    label: 'Urano',
    ingredients: [
      { key: 'lettuce', h: 0.08, node: () => <Lettuce /> },
      { key: 'chicken', h: 0.3, node: () => <Chicken /> },
      { key: 'cheese-a', h: 0.02, node: (o) => <Cheese order={o} rotation={0.3} /> },
      {
        key: 'tomato',
        h: 0.07,
        node: () => (
          <Slices
            texture={tomatoTexture()}
            side="#B91C1C"
            radius={0.48}
            thick={0.06}
            spots={[[0.42, 0.25, 0.04], [-0.4, 0.3, -0.04], [0.02, -0.5, 0.05]]}
          />
        ),
      },
      { key: 'sauce', h: 0.03, node: () => <Sauce color="#FFF1D2" seed={4} /> },
    ],
  },
};

export const SpacePollyBurgerMesh: React.FC<{ variant?: BurgerVariant; accentColor?: string }> = ({
  variant = 'giove',
  accentColor = '#DE3163',
}) => {
  const bunMat = useBunMaterial();
  const recipe = RECIPES[variant] ?? RECIPES.giove;

  let y = -0.78;
  const stack = recipe.ingredients.map((ing, i) => {
    const node = (
      <Layer key={ing.key} order={i + 1} position={[0, y, 0]} explode={(i + 1) * 0.2} drop={2.2}>
        {ing.node(i + 1)}
      </Layer>
    );
    y += ing.h;
    return node;
  });
  const n = recipe.ingredients.length;

  return (
    <group position={[0, -0.05, 0]}>
      <Layer order={0} position={[0, -1.2, 0]} explode={-0.3} drop={1.4}>
        <mesh geometry={bottomBunGeometry()} material={bunMat} />
      </Layer>

      {stack}

      <Layer order={n + 1} position={[0, y, 0]} explode={(n + 1) * 0.2 + 0.2} drop={2.4} hoverPeek={0.22}>
        <mesh geometry={topBunGeometry()} material={bunMat} />
        <SesameSeeds />
      </Layer>

      <Layer order={n + 2} position={[0.12, y + 0.62, 0.06]} rotation={[0.05, 0.4, -0.06]} explode={(n + 1) * 0.2 + 0.55} drop={1.8}>
        <FlagPick label={recipe.label} accent={accentColor} />
      </Layer>

      <Layer order={n + 3} grow>
        <OrbitRings accent={accentColor} />
      </Layer>
    </group>
  );
};


/** Builders warmed up in idle time so switching burgers never stalls */
export const PREWARM_BURGERS: (() => unknown)[] = [
  topBunGeometry,
  bottomBunGeometry,
  ...[1, 2, 3, 4, 5].flatMap((seed) => [() => pattyGeometry(seed), () => laceGeometry(seed)]),
  cheeseGeometry,
  () => baconGeometry(1),
  () => baconGeometry(2),
  lettuceGeometry,
  () => onionRingGeometry(1),
  () => onionRingGeometry(2),
  bbqOnionGeometry,
  chickenGeometry,
  ...[1, 2, 3, 4].map((seed) => () => sauceGeometry(seed)),
  pickleTexture,
  tomatoTexture,
];
