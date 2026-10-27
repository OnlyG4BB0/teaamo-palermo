import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Float,
  RoundedBox,
} from '@react-three/drei';
import * as THREE from 'three';

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
   1. BOBA MILK TEA MESH (CLASSIC MILK TEA & TARO)
   ============================================================================ */
export const BobaCupMesh: React.FC<{
  config: Cup3DConfig;
  autoRotate?: boolean;
  exploded?: boolean;
  impulseTick?: number;
}> = ({
  config,
  autoRotate = true,
  exploded = false,
  impulseTick = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidTopMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const liquidBotMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const liquidTopMeshRef = useRef<THREE.Mesh>(null);
  const liquidBotMeshRef = useRef<THREE.Mesh>(null);
  const sleeveGroupRef = useRef<THREE.Group>(null);
  const pearlsGroupRef = useRef<THREE.Group>(null);
  const bubblesGroupRef = useRef<THREE.Group>(null);
  const iceGroupRef = useRef<THREE.Group>(null);
  const crownGroupRef = useRef<THREE.Group>(null);
  const strawGroupRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);
  const spinBoostRef = useRef(0);
  const scalePulseRef = useRef(1);
  const explodeProgressRef = useRef(0);

  const targetTopColor = useMemo(
    () => new THREE.Color(config.liquidTopColor),
    [config.liquidTopColor]
  );
  const targetBotColor = useMemo(
    () => new THREE.Color(config.liquidBottomColor),
    [config.liquidBottomColor]
  );

  useEffect(() => {
    spinBoostRef.current = 4.2;
    scalePulseRef.current = 1.09;
  }, [
    config.liquidTopColor,
    config.liquidBottomColor,
    config.bobaColor,
    config.bobaSecondaryColor,
    config.hasPinkCream,
    config.showIce,
    impulseTick,
  ]);

  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0;
    const y = 0;
    shape.moveTo(x, y + 0.12);
    shape.bezierCurveTo(x, y + 0.12, x - 0.03, y + 0.25, x - 0.15, y + 0.25);
    shape.bezierCurveTo(x - 0.32, y + 0.25, x - 0.32, y + 0.02, x - 0.32, y + 0.02);
    shape.bezierCurveTo(x - 0.32, y - 0.12, x - 0.18, y - 0.26, x, y - 0.38);
    shape.bezierCurveTo(x + 0.18, y - 0.26, x + 0.32, y - 0.12, x + 0.32, y + 0.02);
    shape.bezierCurveTo(x + 0.32, y + 0.02, x + 0.32, y + 0.25, x + 0.15, y + 0.25);
    shape.bezierCurveTo(x + 0.03, y + 0.25, x, y + 0.12, x, y + 0.12);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    geom.center();
    return geom;
  }, []);

  const pearlsData = useMemo(() => {
    const items: {
      pos: [number, number, number];
      angle: number;
      radius: number;
      scale: number;
      phase: number;
      speed: number;
      isPrimary: boolean;
    }[] = [];

    const layers = [
      { y: -1.16, maxR: 0.56, count: 10 },
      { y: -0.94, maxR: 0.6, count: 10 },
      { y: -0.72, maxR: 0.54, count: 6 },
    ];

    let idx = 0;
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + layer.y * 2.1;
        const radius = (0.3 + ((i * 7) % 10) * 0.068) * layer.maxR;
        items.push({
          pos: [Math.cos(angle) * radius, layer.y, Math.sin(angle) * radius],
          angle,
          radius,
          scale: 0.105 + (idx % 3) * 0.012,
          phase: idx * 0.65,
          speed: 1.5 + (idx % 4) * 0.38,
          isPrimary: idx % 2 === 0,
        });
        idx++;
      }
    });
    return items;
  }, []);

  const microBubblesData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const r = 0.22 + ((i * 5) % 9) * 0.055;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        speed: 0.38 + (i % 5) * 0.12,
        offset: (i / 14) * 2.1,
        scale: 0.028 + (i % 3) * 0.012,
      };
    });
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    spinBoostRef.current = THREE.MathUtils.lerp(spinBoostRef.current, 0, dt * 4.5);
    scalePulseRef.current = THREE.MathUtils.lerp(scalePulseRef.current, 1, dt * 7.5);
    explodeProgressRef.current = THREE.MathUtils.lerp(
      explodeProgressRef.current,
      exploded ? 1 : 0,
      dt * 6
    );
    const exp = explodeProgressRef.current;

    if (groupRef.current) {
      if (autoRotate) {
        groupRef.current.rotation.y +=
          dt * ((hovered ? 0.68 : 0.34) + spinBoostRef.current);
      }
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.12,
        dt * 5
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -state.pointer.x * 0.1,
        dt * 5
      );
      const s = scalePulseRef.current;
      groupRef.current.scale.set(s, 2 - s, s);
    }

    if (liquidTopMatRef.current) {
      liquidTopMatRef.current.color.lerp(targetTopColor, Math.min(1, dt * 7));
    }
    if (liquidBotMatRef.current) {
      liquidBotMatRef.current.color.lerp(targetBotColor, Math.min(1, dt * 7));
    }

    if (liquidTopMeshRef.current) {
      liquidTopMeshRef.current.position.y = 0.32 + exp * 0.16;
    }
    if (liquidBotMeshRef.current) {
      liquidBotMeshRef.current.position.y = -0.82 - exp * 0.18;
    }
    if (sleeveGroupRef.current) {
      const sleeveScale = 1 + exp * 0.08;
      sleeveGroupRef.current.scale.set(sleeveScale, 1, sleeveScale);
    }
    if (crownGroupRef.current) {
      crownGroupRef.current.position.y = 1.32 + exp * 0.52;
    }
    if (strawGroupRef.current) {
      strawGroupRef.current.position.y =
        0.62 + exp * 0.38 + Math.sin(t * 2.1) * 0.025;
      strawGroupRef.current.rotation.z =
        -0.19 + Math.sin(t * 1.8) * 0.025 + spinBoostRef.current * 0.03;
    }

    if (pearlsGroupRef.current) {
      const impulse = spinBoostRef.current;
      const vortexAngle = t * 0.42 + impulse * 0.85;
      pearlsGroupRef.current.children.forEach((child, i) => {
        const d = pearlsData[i];
        if (d) {
          const phase = d.phase || (i * 0.618);
          const swirlSpeed = (i % 2 === 0 ? 1.15 : -0.85);
          const curAngle = d.angle + vortexAngle * swirlSpeed;
          const radialExpand = 1 + exp * 0.22;

          // Micro-physics: fluid sway on X and Z in dense liquid during rotation & impulse
          const fluidSwayX = Math.sin(t * 2.6 + phase) * (0.02 + impulse * 0.05);
          const fluidSwayZ = Math.cos(t * 2.3 + phase) * (0.02 + impulse * 0.05);

          child.position.x = Math.cos(curAngle) * d.radius * radialExpand + fluidSwayX;
          child.position.z = Math.sin(curAngle) * d.radius * radialExpand + fluidSwayZ;

          // Buoyant lift & oscillation in dense honey-tapioca suspension
          const verticalBob = Math.sin(t * (d.speed * 1.5) + phase) * (0.045 + impulse * 0.08);
          child.position.y = d.pos[1] - exp * 0.25 + verticalBob + impulse * 0.035;
        }
      });
    }

    if (bubblesGroupRef.current) {
      bubblesGroupRef.current.children.forEach((child, i) => {
        const b = microBubblesData[i];
        if (b) {
          const cycle = ((t * b.speed + b.offset) % 1.85) - 0.95;
          child.position.y = cycle;
          child.position.x = b.x + Math.sin(t * 2.5 + i) * 0.04;
          child.position.z = b.z + Math.cos(t * 2.2 + i) * 0.04;
        }
      });
    }

    if (iceGroupRef.current) {
      const impulse = spinBoostRef.current;
      iceGroupRef.current.position.y =
        0.92 + exp * 0.32 + Math.sin(t * 2.4) * (0.025 + impulse * 0.06);
      iceGroupRef.current.rotation.y = Math.sin(t * 0.9) * 0.18 + impulse * 0.45;
      iceGroupRef.current.rotation.z = Math.sin(t * 1.7) * (0.025 + impulse * 0.05);
    }

    if (heartRef.current) {
      heartRef.current.rotation.y = t * 1.15;
      heartRef.current.position.y = 0.72 + Math.sin(t * 2.8) * 0.055;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[0, -0.45, 0]}
    >
      <mesh position={[0, 0, 0]} renderOrder={3}>
        <cylinderGeometry args={[1.04, 0.76, 2.75, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.05}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, -1.34, 0]}>
        <cylinderGeometry args={[0.76, 0.73, 0.12, 48]} />
        <meshStandardMaterial
          color="#f3ece4"
          transparent
          opacity={0.75}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      <group ref={sleeveGroupRef} position={[0, -0.05, 0]}>
        <mesh>
          <cylinderGeometry args={[0.935, 0.875, 0.68, 48, 1, true]} />
          <meshStandardMaterial
            color="#FAF7F2"
            roughness={0.35}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.935, 0.015, 16, 48]} />
          <meshStandardMaterial color="#D4365C" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.876, 0.015, 16, 48]} />
          <meshStandardMaterial color="#D4365C" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.91]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.34, 0.34, 0.03]} />
          <meshStandardMaterial color="#D4365C" roughness={0.25} />
        </mesh>
      </group>

      <mesh ref={liquidTopMeshRef} position={[0, 0.32, 0]} renderOrder={1}>
        <cylinderGeometry args={[0.97, 0.85, 1.45, 48]} />
        <meshStandardMaterial
          ref={liquidTopMatRef}
          color={config.liquidTopColor}
          roughness={0.18}
          metalness={0.04}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh ref={liquidBotMeshRef} position={[0, -0.82, 0]} renderOrder={1}>
        <cylinderGeometry args={[0.85, 0.73, 0.92, 48]} />
        <meshStandardMaterial
          ref={liquidBotMatRef}
          color={config.liquidBottomColor}
          roughness={0.2}
          metalness={0.05}
          transparent
          opacity={0.96}
        />
      </mesh>

      <group ref={pearlsGroupRef} renderOrder={2}>
        {pearlsData.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[p.scale, 20, 20]} />
            <meshPhysicalMaterial
              color={p.isPrimary ? config.bobaColor : config.bobaSecondaryColor}
              roughness={0.06}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>
        ))}
      </group>

      <group ref={bubblesGroupRef} renderOrder={2}>
        {microBubblesData.map((b, i) => (
          <mesh key={i} position={[b.x, 0, b.z]}>
            <sphereGeometry args={[b.scale, 12, 12]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.6}
              roughness={0.05}
              clearcoat={1}
            />
          </mesh>
        ))}
      </group>

      {config.showIce !== false && (
        <group ref={iceGroupRef} position={[0, 0.92, 0]} renderOrder={2}>
          <RoundedBox
            args={[0.32, 0.24, 0.32]}
            radius={0.05}
            smoothness={4}
            position={[-0.34, 0.04, 0.22]}
            rotation={[0.25, 0.4, -0.15]}
          >
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </RoundedBox>
          <RoundedBox
            args={[0.29, 0.22, 0.29]}
            radius={0.05}
            smoothness={4}
            position={[0.36, 0.02, -0.18]}
            rotation={[-0.2, 0.6, 0.22]}
          >
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </RoundedBox>
          <RoundedBox
            args={[0.26, 0.2, 0.26]}
            radius={0.04}
            smoothness={4}
            position={[0.05, 0.05, 0.38]}
            rotation={[0.12, -0.3, 0.18]}
          >
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </RoundedBox>
        </group>
      )}

      <mesh position={[0, 1.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.045, 0.048, 20, 48]} />
        <meshStandardMaterial color="#D4365C" roughness={0.22} metalness={0.08} />
      </mesh>

      <group ref={crownGroupRef} position={[0, 1.32, 0]}>
        {config.hasPinkCream !== false ? (
          <>
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.68, 0.24, 20, 40]} />
              <meshStandardMaterial
                color={config.creamColor || '#FFC2D1'}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0.1, 0]}>
              <torusGeometry args={[0.45, 0.2, 20, 40]} />
              <meshStandardMaterial
                color={config.creamColor || '#FFD6E0'}
                roughness={0.32}
              />
            </mesh>
            <mesh position={[0, 0.44, 0]}>
              <coneGeometry args={[0.38, 0.36, 28]} />
              <meshStandardMaterial color="#FFF7F9" roughness={0.3} />
            </mesh>

            <mesh
              ref={heartRef}
              geometry={heartGeometry}
              position={[0, 0.72, 0]}
            >
              <meshPhysicalMaterial
                color="#D4365C"
                roughness={0.15}
                metalness={0.1}
                clearcoat={1}
              />
            </mesh>
          </>
        ) : (
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[1.04, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.32}
              roughness={0.08}
              clearcoat={1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      <group
        ref={strawGroupRef}
        position={[0.34, 0.62, 0.12]}
        rotation={[0.08, 0, -0.19]}
      >
        <mesh>
          <cylinderGeometry args={[0.095, 0.095, 3.35, 24]} />
          <meshPhysicalMaterial
            color="#140E11"
            roughness={0.18}
            clearcoat={0.9}
          />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.098, 0.098, 0.28, 24]} />
          <meshStandardMaterial color="#D4365C" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

/* ============================================================================
   2. CRYSTALLINE FRUIT TEA MESH (BULBASAUR, BLU TROPICAL, RED PASSION)
   Con fette di agrume fluttuanti, perle popping boba fruttate e foglia di menta
   ============================================================================ */
export const FruitTeaMesh: React.FC<{
  config: Cup3DConfig;
  autoRotate?: boolean;
  exploded?: boolean;
}> = ({ config, autoRotate = true, exploded = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const fruitGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.38;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.12,
        delta * 5
      );
    }
    if (fruitGroupRef.current) {
      fruitGroupRef.current.rotation.y = t * 0.2;
      fruitGroupRef.current.position.y =
        0.35 + (exploded ? 0.35 : 0) + Math.sin(t * 1.8) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.45, 0]}>
      {/* Clear Transparent Cup */}
      <mesh renderOrder={3}>
        <cylinderGeometry args={[1.04, 0.76, 2.75, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0.04}
          clearcoat={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crystal Clear Tea Volume */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.96, 0.75, 2.45, 48]} />
        <meshPhysicalMaterial
          color={config.liquidTopColor}
          transparent
          opacity={0.82}
          roughness={0.1}
          transmission={0.4}
        />
      </mesh>

      {/* Floating Citrus Wheels (Lime / Lemon Slice) */}
      <group ref={fruitGroupRef} position={[0, 0.35, 0]}>
        <group position={[-0.25, 0, 0.1]} rotation={[0.4, 0.8, -0.2]}>
          {/* Outer Peel */}
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
            <meshStandardMaterial color="#84CC16" roughness={0.4} />
          </mesh>
          {/* Inner Pulp */}
          <mesh position={[0, 0.026, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.02, 32]} />
            <meshStandardMaterial color="#FACC15" roughness={0.2} transparent opacity={0.85} />
          </mesh>
        </group>

        <group position={[0.28, -0.35, -0.15]} rotation={[-0.3, 0.5, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
            <meshStandardMaterial color="#E11D48" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.026, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.02, 32]} />
            <meshStandardMaterial color="#FDA4AF" roughness={0.2} transparent opacity={0.85} />
          </mesh>
        </group>
      </group>

      {/* Popping Fruit Boba Pearls */}
      <group position={[0, -0.95, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const r = 0.2 + ((i * 3) % 5) * 0.09;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, (i % 3) * 0.18, Math.sin(angle) * r]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshPhysicalMaterial
                color={i % 2 === 0 ? config.bobaColor : config.bobaSecondaryColor}
                transparent
                opacity={0.9}
                clearcoat={1}
                roughness={0.08}
              />
            </mesh>
          );
        })}
      </group>

      {/* Ice Cubes */}
      <RoundedBox args={[0.32, 0.22, 0.32]} radius={0.04} position={[-0.2, 0.85, 0.2]} rotation={[0.2, 0.4, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.22, 0.28]} radius={0.04} position={[0.3, 0.82, -0.2]} rotation={[-0.2, 0.6, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.08} />
      </RoundedBox>

      {/* Slanted Green Straw */}
      <group position={[0.32, 0.65, 0.1]} rotation={[0.08, 0, -0.2]}>
        <mesh>
          <cylinderGeometry args={[0.095, 0.095, 3.35, 24]} />
          <meshPhysicalMaterial color="#065F46" roughness={0.2} clearcoat={0.8} />
        </mesh>
      </group>
    </group>
  );
};

/* ============================================================================
   3. SPACEPOLLY SMASHBURGER MESH (MODULARE PER GIOVE, PLUTONE, MARTE, URANO)
   ============================================================================ */
export type BurgerVariant = 'giove' | 'plutone' | 'marte' | 'urano' | 'luna';

export const SpacePollyBurgerMesh: React.FC<{
  variant?: BurgerVariant;
  accentColor?: string;
  exploded?: boolean;
  impulseTick?: number;
}> = ({
  variant = 'giove',
  accentColor = '#D4365C',
  exploded = false,
  impulseTick = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const bottomBunRef = useRef<THREE.Mesh>(null);
  const topBunGroupRef = useRef<THREE.Group>(null);
  const stackGroupRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const explodeProgressRef = useRef(0);
  const spinBoostRef = useRef(0);

  useEffect(() => {
    spinBoostRef.current = 4.0;
  }, [variant, accentColor, impulseTick]);

  const sesameSeeds = useMemo(() => {
    const seeds: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let i = 0; i < 28; i++) {
      const phi = Math.acos(1 - ((i + 0.5) / 28) * 0.58);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.2;
      seeds.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) - 0.35,
          r * Math.sin(phi) * Math.sin(theta),
        ],
        rot: [phi, theta, 0],
      });
    }
    return seeds;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    spinBoostRef.current = THREE.MathUtils.lerp(spinBoostRef.current, 0, dt * 4.5);
    const wantExplode = exploded || hovered;
    explodeProgressRef.current = THREE.MathUtils.lerp(
      explodeProgressRef.current,
      wantExplode ? 1 : 0,
      dt * 5.5
    );
    const exp = explodeProgressRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y += dt * (0.42 + spinBoostRef.current);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.14,
        dt * 5
      );
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.65;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.48;
    }

    if (bottomBunRef.current) {
      bottomBunRef.current.position.y = -0.72 - exp * 0.38;
    }
    if (stackGroupRef.current) {
      stackGroupRef.current.position.y = exp * 0.1;
    }
    if (topBunGroupRef.current) {
      topBunGroupRef.current.position.y = 0.26 + exp * 0.58;
    }
  });

  const isChicken = variant === 'urano';
  const hasPickles = variant === 'plutone';
  const hasBacon = variant === 'giove' || variant === 'mercurio';
  const hasBBQOnion = variant === 'marte';

  return (
    <group
      ref={groupRef}
      position={[0, -0.285, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Planetary Orbit Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.3, 0.2, 0]}>
        <torusGeometry args={[1.72, 0.016, 16, 80]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 1.85, -0.28, 0]}>
        <torusGeometry args={[1.88, 0.01, 12, 80]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.6} transparent opacity={0.65} />
      </mesh>

      {/* Warm Side Point Lights for "Cheese Melt" and Searing Glisten */}
      <pointLight position={[2.4, 0.5, 2.0]} intensity={2.4} color="#FFD54F" distance={7} decay={2} />
      <pointLight position={[-2.4, -0.2, 1.8]} intensity={1.9} color="#FF8A65" distance={7} decay={2} />

      {/* Bottom Brioche Bun (Artisanal Matte Finish) */}
      <mesh ref={bottomBunRef} position={[0, -0.72, 0]}>
        <cylinderGeometry args={[1.18, 1.05, 0.36, 40]} />
        <meshStandardMaterial color="#C67C2F" roughness={0.78} />
      </mesh>

      {/* Center Stack Ingredients (Differentiated by Variant) */}
      <group ref={stackGroupRef}>
        {/* Patty 1 */}
        {isChicken ? (
          /* Crispy Golden Breaded Chicken Fillet */
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[1.25, 1.22, 0.26, 40]} />
            <meshStandardMaterial color="#B45309" roughness={0.75} />
          </mesh>
        ) : (
          /* Smashed Beef Patty with Sizzling Seared Crust */
          <group position={[0, -0.45, 0]}>
            <mesh>
              <cylinderGeometry args={[1.28, 1.25, 0.2, 40]} />
              <meshStandardMaterial color="#32140A" roughness={0.45} metalness={0.12} />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[1.34, 1.3, 0.06, 24]} />
              <meshStandardMaterial color="#220B04" roughness={0.5} metalness={0.1} />
            </mesh>
          </group>
        )}

        {/* Melted Cheddar - Cheese Melt High-Gloss Effect */}
        <mesh position={[0, -0.3, 0]} rotation={[0, Math.PI / 6, 0]}>
          <boxGeometry args={[1.85, 0.045, 1.85]} />
          <meshPhysicalMaterial
            color="#F59E0B"
            roughness={0.14}
            clearcoat={1.0}
            clearcoatRoughness={0.06}
            metalness={0.05}
          />
        </mesh>

        {/* Pickles for Plutone */}
        {hasPickles && (
          <group position={[0, -0.22, 0]}>
            <mesh position={[-0.35, 0, 0.2]} rotation={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.35, 0.35, 0.04, 20]} />
              <meshStandardMaterial color="#3F6212" roughness={0.3} />
            </mesh>
            <mesh position={[0.32, 0, -0.2]} rotation={[-0.1, 0.4, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.04, 20]} />
              <meshStandardMaterial color="#3F6212" roughness={0.3} />
            </mesh>
          </group>
        )}

        {/* Bacon for Giove / Mercurio */}
        {hasBacon && (
          <group position={[0, -0.22, 0]}>
            <mesh rotation={[0, 0.45, 0.05]}>
              <boxGeometry args={[1.7, 0.04, 0.32]} />
              <meshStandardMaterial color="#6B1D1D" roughness={0.4} />
            </mesh>
            <mesh rotation={[0, -0.85, -0.05]}>
              <boxGeometry args={[1.65, 0.04, 0.3]} />
              <meshStandardMaterial color="#7F1D1D" roughness={0.4} />
            </mesh>
          </group>
        )}

        {/* Second Patty (for Giove and Plutone) */}
        {!isChicken && variant !== 'luna' && variant !== 'marte' && (
          <group position={[0, -0.12, 0]}>
            <mesh>
              <cylinderGeometry args={[1.26, 1.28, 0.2, 40]} />
              <meshStandardMaterial color="#2B1006" roughness={0.45} metalness={0.12} />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[1.82, 0.045, 1.82]} />
              <meshPhysicalMaterial
                color="#FBBF24"
                roughness={0.15}
                clearcoat={1.0}
                clearcoatRoughness={0.06}
                metalness={0.05}
              />
            </mesh>
          </group>
        )}

        {/* Caramelized BBQ Onions for Marte */}
        {hasBBQOnion && (
          <group position={[0, -0.15, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0.3, 0]}>
              <torusGeometry args={[0.55, 0.12, 16, 32]} />
              <meshStandardMaterial color="#451A03" roughness={0.25} />
            </mesh>
            <mesh position={[0.2, 0.04, 0]} rotation={[0.2, -0.4, 0]}>
              <torusGeometry args={[0.45, 0.1, 16, 32]} />
              <meshStandardMaterial color="#78350F" roughness={0.25} />
            </mesh>
          </group>
        )}

        {/* Crispy Onion Rings & Algerian Sauce for Giove */}
        {variant === 'giove' && (
          <group position={[0, 0.12, 0]}>
            <mesh position={[-0.22, 0, 0.15]} rotation={[Math.PI / 2.1, 0.12, 0]}>
              <torusGeometry args={[0.55, 0.11, 16, 40]} />
              <meshStandardMaterial color="#D97706" roughness={0.45} />
            </mesh>
            <mesh position={[0.24, 0.04, -0.14]} rotation={[Math.PI / 1.9, -0.15, 0]}>
              <torusGeometry args={[0.52, 0.1, 16, 40]} />
              <meshStandardMaterial color="#B45309" roughness={0.45} />
            </mesh>
            <mesh position={[0.42, -0.08, 0.42]}>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshPhysicalMaterial
                color="#EA580C"
                roughness={0.12}
                clearcoat={1.0}
                clearcoatRoughness={0.04}
              />
            </mesh>
          </group>
        )}

        {/* Fresh Lettuce & Tomato Slices for Urano / Plutone */}
        {(isChicken || hasPickles || variant === 'luna') && (
          <group position={[0, 0.1, 0]}>
            <mesh rotation={[0, 0.5, 0]}>
              <cylinderGeometry args={[1.22, 1.2, 0.06, 20]} />
              <meshStandardMaterial color="#22C55E" roughness={0.5} />
            </mesh>
            {isChicken && (
              <mesh position={[0.2, 0.06, 0.1]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 0.05, 20]} />
                <meshStandardMaterial color="#EF4444" roughness={0.3} />
              </mesh>
            )}
          </group>
        )}
      </group>

      {/* Artisanal Matte Brioche Crown Bun with Contrast */}
      <group ref={topBunGroupRef} position={[0, 0.26, 0]}>
        <mesh>
          <sphereGeometry args={[1.2, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#D9822B"
            roughness={0.78}
            clearcoat={0.08}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {sesameSeeds.map((s, idx) => (
          <mesh key={idx} position={s.pos} rotation={s.rot}>
            <capsuleGeometry args={[0.024, 0.055, 6, 6]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ============================================================================
   4. BUBBLE WAFFLE GELATO MESH
   ============================================================================ */
export const BubbleWaffleMesh: React.FC<{
  accentColor?: string;
  exploded?: boolean;
  impulseTick?: number;
}> = ({ accentColor = '#D4365C', exploded = false, impulseTick = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coneGroupRef = useRef<THREE.Group>(null);
  const puffsGroupRef = useRef<THREE.Group>(null);
  const toppingsGroupRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const explodeProgressRef = useRef(0);
  const spinBoostRef = useRef(0);

  useEffect(() => {
    spinBoostRef.current = 4.0;
  }, [accentColor, impulseTick]);

  const wafflePuffs = useMemo(() => {
    const puffs: { pos: [number, number, number]; row: number; col: number }[] = [];
    const rows = 5;
    const cols = 7;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const angle = ((c - (cols - 1) / 2) / cols) * Math.PI * 1.45;
        const radius = 0.72 + r * 0.08;
        const y = (r - 2) * 0.34;
        puffs.push({
          pos: [Math.sin(angle) * radius, y, Math.cos(angle) * radius * 0.65],
          row: r,
          col: c,
        });
      }
    }
    return puffs;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    spinBoostRef.current = THREE.MathUtils.lerp(spinBoostRef.current, 0, dt * 4.5);
    const wantExplode = exploded || hovered;
    explodeProgressRef.current = THREE.MathUtils.lerp(
      explodeProgressRef.current,
      wantExplode ? 1 : 0,
      dt * 5.5
    );
    const exp = explodeProgressRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y += dt * (0.38 + spinBoostRef.current);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.12,
        dt * 5
      );
    }

    if (coneGroupRef.current) {
      coneGroupRef.current.position.y = -exp * 0.28;
    }

    if (puffsGroupRef.current) {
      puffsGroupRef.current.children.forEach((child, i) => {
        const p = wafflePuffs[i];
        if (p) {
          const wave = 1 + Math.sin(t * 2.6 + p.row * 0.65 + p.col * 0.4) * 0.06;
          const radial = 1 + exp * 0.16;
          child.position.set(
            p.pos[0] * radial,
            p.pos[1] + exp * 0.08,
            p.pos[2] * radial
          );
          child.scale.setScalar(wave);
        }
      });
    }

    if (toppingsGroupRef.current) {
      toppingsGroupRef.current.position.y =
        0.35 + exp * 0.44 + Math.sin(t * 2.3) * 0.035;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.015, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={coneGroupRef}>
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.78, 0.38, 1.35, 40, 1, true]} />
          <meshStandardMaterial color="#FAF7F2" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.02, 16, 40]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      <group ref={puffsGroupRef} position={[0, 0.15, 0]}>
        {wafflePuffs.map((p, idx) => (
          <mesh key={idx} position={p.pos}>
            <sphereGeometry args={[0.21, 20, 20]} />
            <meshPhysicalMaterial color="#D98A36" roughness={0.35} clearcoat={0.3} />
          </mesh>
        ))}
      </group>

      <group ref={toppingsGroupRef} position={[0, 0.35, 0]}>
        <mesh position={[-0.08, 0, 0.08]}>
          <sphereGeometry args={[0.54, 28, 28]} />
          <meshStandardMaterial color="#FFFDF0" roughness={0.3} />
        </mesh>
        <mesh position={[0.16, 0.42, 0.12]}>
          <sphereGeometry args={[0.45, 28, 28]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} />
        </mesh>
        <mesh position={[0.02, 0.35, 0.38]} rotation={[0.4, 0.2, 0]}>
          <torusGeometry args={[0.34, 0.035, 12, 32]} />
          <meshPhysicalMaterial color="#3B180A" roughness={0.2} clearcoat={0.6} />
        </mesh>

        <RoundedBox
          args={[0.2, 0.95, 0.12]}
          radius={0.03}
          position={[-0.32, 0.65, 0.15]}
          rotation={[0.25, 0.1, 0.4]}
        >
          <meshPhysicalMaterial color="#4A210B" roughness={0.25} clearcoat={0.5} />
        </RoundedBox>
        <RoundedBox
          args={[0.18, 0.88, 0.12]}
          radius={0.03}
          position={[0.38, 0.58, 0.18]}
          rotation={[-0.2, -0.2, -0.35]}
        >
          <meshPhysicalMaterial color="#6B3410" roughness={0.28} clearcoat={0.4} />
        </RoundedBox>
      </group>
    </group>
  );
};

/* ============================================================================
   5. CRÊPES PAN DI STELLE MESH (SU PIATTO IN CERAMICA)
   Crêpe dorata piegata a fazzoletto con Nutella, biscotto Pan di Stelle con stelline
   ============================================================================ */
export const CrepeMesh: React.FC<{
  accentColor?: string;
  autoRotate?: boolean;
}> = ({ autoRotate = true }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Designer Ceramic Plate */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[1.5, 1.38, 0.08, 48]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.48, 0.015, 16, 48]} />
        <meshStandardMaterial color="#D4365C" roughness={0.3} />
      </mesh>

      {/* Folded Golden Crêpe Envelope */}
      <group position={[0, -0.2, 0]} rotation={[-0.1, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[1.65, 0.14, 1.25]} />
          <meshStandardMaterial color="#F3C37D" roughness={0.45} />
        </mesh>
        <mesh position={[0.1, 0.08, 0]}>
          <boxGeometry args={[1.35, 0.12, 1.05]} />
          <meshStandardMaterial color="#E8AF63" roughness={0.45} />
        </mesh>
      </group>

      {/* Rich Chocolate Sauce Dripping */}
      <mesh position={[0, -0.06, 0.1]} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[0.55, 0.04, 12, 32]} />
        <meshPhysicalMaterial color="#3B190B" roughness={0.2} clearcoat={0.8} />
      </mesh>
      <mesh position={[-0.2, -0.08, -0.1]} rotation={[-0.2, 0.5, 0]}>
        <torusGeometry args={[0.48, 0.035, 12, 32]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} clearcoat={0.6} />
      </mesh>

      {/* Pan di Stelle Cookie with Little White Stars */}
      <group position={[0.22, 0.08, 0.18]} rotation={[0.3, 0.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
          <meshStandardMaterial color="#2B150A" roughness={0.6} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.26, 0.045, Math.sin(a) * 0.26]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Whipped Cream Rosette */}
      <mesh position={[-0.45, 0.05, -0.2]}>
        <coneGeometry args={[0.32, 0.38, 24]} />
        <meshStandardMaterial color="#FFF8FA" roughness={0.3} />
      </mesh>
    </group>
  );
};

/* ============================================================================
   6. PANCAKE GELATO STACK MESH
   Torre di 3 soffici pancake americani con colata di sciroppo e pallina di gelato
   ============================================================================ */
export const PancakeStackMesh: React.FC<{
  accentColor?: string;
  autoRotate?: boolean;
}> = ({ accentColor = '#D4365C', autoRotate = true }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Plate */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[1.55, 1.4, 0.08, 48]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.2} />
      </mesh>

      {/* Pancake 1 (Bottom) */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[1.22, 1.2, 0.22, 40]} />
        <meshStandardMaterial color="#D98A36" roughness={0.4} />
      </mesh>

      {/* Pancake 2 (Middle) */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[1.18, 1.16, 0.22, 40]} />
        <meshStandardMaterial color="#E89B48" roughness={0.4} />
      </mesh>

      {/* Pancake 3 (Top) */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.14, 1.12, 0.22, 40]} />
        <meshStandardMaterial color="#EFA858" roughness={0.4} />
      </mesh>

      {/* Syrup Glaze cascading over edges */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.92, 0.96, 0.04, 32]} />
        <meshPhysicalMaterial color="#B45309" roughness={0.15} clearcoat={0.9} transparent opacity={0.88} />
      </mesh>

      {/* Artisanal Gelato Scoop Melting on Top */}
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.48, 28, 28]} />
        <meshStandardMaterial color="#FFFBEB" roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.38, 0.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} />
      </mesh>
    </group>
  );
};

/* ============================================================================
   7. COPPETTA GELATO & YOGURT FRESCO MESH
   Coppetta da asporto brandizzata con doppio vortice mantecato e palettina
   ============================================================================ */
export const GelatoCoppettaMesh: React.FC<{
  accentColor?: string;
  autoRotate?: boolean;
}> = ({ accentColor = '#D4365C', autoRotate = true }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Paper Ice Cream Tub */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[1.05, 0.78, 1.05, 40, 1, true]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.78, 0.76, 0.08, 40]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.4} />
      </mesh>
      {/* Carmine Brand Rim */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.03, 16, 40]} />
        <meshStandardMaterial color="#D4365C" roughness={0.3} />
      </mesh>
      {/* Brand logo diamond badge */}
      <mesh position={[0, -0.35, 0.94]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.32, 0.32, 0.02]} />
        <meshStandardMaterial color="#D4365C" roughness={0.3} />
      </mesh>

      {/* Swirl 1: Fior di Latte / Yogurt Naturale */}
      <mesh position={[-0.22, 0.42, 0]}>
        <sphereGeometry args={[0.55, 28, 28]} />
        <meshStandardMaterial color="#FFFDF5" roughness={0.25} />
      </mesh>
      <mesh position={[-0.22, 0.8, 0]}>
        <coneGeometry args={[0.35, 0.45, 24]} />
        <meshStandardMaterial color="#FFFDF5" roughness={0.25} />
      </mesh>

      {/* Swirl 2: Fragola / Pistacchio / Cioccolato */}
      <mesh position={[0.26, 0.38, 0.1]}>
        <sphereGeometry args={[0.52, 28, 28]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} />
      </mesh>

      {/* Colorful Gelato Paddle Spoon */}
      <group position={[0.42, 0.65, -0.2]} rotation={[0.2, 0.1, -0.3]}>
        <RoundedBox args={[0.14, 0.95, 0.025]} radius={0.01}>
          <meshPhysicalMaterial color="#D4365C" transparent opacity={0.85} roughness={0.1} />
        </RoundedBox>
      </group>

      {/* Wafer Fan Cookie */}
      <mesh position={[-0.45, 0.62, -0.15]} rotation={[-0.2, 0.5, 0.3]}>
        <coneGeometry args={[0.42, 0.04, 3]} />
        <meshStandardMaterial color="#D98A36" roughness={0.5} />
      </mesh>
    </group>
  );
};

/* ============================================================================
   ARCHITECTURAL 3D TURNTABLE RING
   ============================================================================ */
const TurntableRing: React.FC<{
  y: number;
  accentColor: string;
  exploded: boolean;
}> = ({ y, accentColor, exploded }) => {
  const ringGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y -= delta * 0.22;
      const targetScale = exploded ? 1.15 : 1;
      ringGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, 1, targetScale),
        Math.min(1, delta * 5)
      );
    }
  });

  return (
    <group ref={ringGroupRef} position={[0, y + 0.05, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.009, 12, 72]} />
        <meshStandardMaterial
          color={accentColor}
          transparent
          opacity={0.45}
          roughness={0.3}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.48, 0.006, 12, 72]} />
        <meshStandardMaterial
          color="#66585F"
          transparent
          opacity={0.28}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

/* ============================================================================
   REUSABLE R3F CANVAS STUDIO VIEWPORT WITH CAMERA RIG & MULTI-MODEL DISPATCH
   ============================================================================ */
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
  // Compatibilità generica
  | 'burger';

const MODEL_FIT: Record<
  ModelType,
  { w: number; h: number; d: number; shadowY: number }
> = {
  cup: { w: 2.45, h: 4.15, d: 2.25, shadowY: -1.92 },
  fruittea: { w: 2.45, h: 4.15, d: 2.25, shadowY: -1.92 },
  'burger-giove': { w: 3.55, h: 2.75, d: 3.4, shadowY: -1.25 },
  'burger-plutone': { w: 3.55, h: 2.75, d: 3.4, shadowY: -1.25 },
  'burger-marte': { w: 3.55, h: 2.75, d: 3.4, shadowY: -1.25 },
  'burger-urano': { w: 3.55, h: 2.75, d: 3.4, shadowY: -1.25 },
  burger: { w: 3.55, h: 2.75, d: 3.4, shadowY: -1.25 },
  waffle: { w: 2.65, h: 3.25, d: 1.95, shadowY: -1.52 },
  crepe: { w: 3.2, h: 2.3, d: 3.2, shadowY: -1.15 },
  pancake: { w: 2.8, h: 2.6, d: 2.8, shadowY: -1.25 },
  coppetta: { w: 2.5, h: 2.9, d: 2.5, shadowY: -1.35 },
};

const CameraRig: React.FC<{ modelType: ModelType; exploded: boolean }> = ({
  modelType,
  exploded,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const currentDist = useRef<number | null>(null);

  useFrame(() => {
    const fit = MODEL_FIT[modelType] || MODEL_FIT.cup;
    const explodeMultiplier = exploded ? 1.12 : 1.0;
    const aspect = Math.max(0.45, size.width / Math.max(1, size.height));
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const distForHeight = (fit.h * explodeMultiplier * 0.5) / tanHalf;
    const distForWidth = (fit.w * explodeMultiplier * 0.5) / (tanHalf * aspect);
    const targetDist = Math.max(distForHeight, distForWidth) * 1.15 + fit.d * 0.46;

    currentDist.current =
      currentDist.current === null
        ? targetDist
        : THREE.MathUtils.lerp(currentDist.current, targetDist, 0.1);

    if (camera.position.lengthSq() < 0.001) {
      camera.position.set(0, 0.35, currentDist.current);
    } else {
      camera.position.normalize().multiplyScalar(currentDist.current);
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
};

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
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
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-[#66585F]">
          Anteprima 3D non disponibile
        </div>
      );
    }
    return this.props.children;
  }
}

interface StudioViewport3DProps {
  modelType: ModelType;
  cupConfig: Cup3DConfig;
  accentColor?: string;
  interactiveHint?: string;
  className?: string;
}

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

  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches
  );
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Battery saving & WebGL context management on mobile:
  // Render and animate ONLY when this viewport is physically on-screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: '80px', threshold: 0.05 }
    );
    io.observe(el);

    const onVisibilityChange = () => {
      if (document.hidden) {
        setInView(false);
      } else if (el) {
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

  return (
    <div
      ref={wrapRef}
      className={`relative w-full select-none overflow-hidden group/stage ${className}`}
    >
      {/* Top Interactive Controls */}
      <div className="absolute top-3 inset-x-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <button
          type="button"
          onClick={() => setExploded((prev) => !prev)}
          className={`pointer-events-auto px-2.5 py-1 border font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
            exploded
              ? 'bg-[#FD5E86] text-white border-[#FD5E86]'
              : 'bg-white/90 dark:bg-[#0D090B]/90 border-[#FCE4EC] dark:border-[#281E23] hover:border-[#FD5E86] text-[#1C0D12] dark:text-[#F5EFEA] backdrop-blur-xs'
          }`}
        >
          {exploded ? '● Vista Esplosa Attiva' : '○ Esplodi Strati 3D'}
        </button>

        <button
          type="button"
          onClick={() => setImpulseTick((t) => t + 1)}
          className="pointer-events-auto px-2.5 py-1 border border-[#FCE4EC] dark:border-[#281E23] bg-white/90 dark:bg-[#0D090B]/90 hover:border-[#FD5E86] hover:text-[#FD5E86] text-[#1C0D12] dark:text-[#F5EFEA] font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer backdrop-blur-xs"
        >
          ↻ Impulso 360°
        </button>
      </div>

      <div className="absolute inset-0">
        <CanvasErrorBoundary>
          <Canvas
            frameloop={inView ? 'always' : 'never'}
            camera={{ position: [0, 0.35, 5.2], fov: 36 }}
            dpr={isTouch ? 1 : [1, 1.75]}
            gl={{
              antialias: !isTouch,
              alpha: true,
              powerPreference: isTouch ? 'low-power' : 'high-performance',
              preserveDrawingBuffer: false,
            }}
            style={{ touchAction: isTouch ? 'pan-y' : 'none' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={1.1} />
              <hemisphereLight args={['#ffffff', '#f2ece4', 0.85]} />
              <directionalLight position={[5, 8, 5]} intensity={1.8} />
              <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#ffd6e0" />
              <pointLight position={[0, 3, 4]} intensity={1.2} color="#ffffff" />

              <Float
                speed={reducedMotion ? 0 : 1.75}
                rotationIntensity={reducedMotion ? 0 : 0.16}
                floatIntensity={reducedMotion ? 0 : 0.28}
                floatingRange={[-0.05, 0.05]}
              >
                {/* 1. Classic Milk Tea Boba Cup */}
                {modelType === 'cup' && (
                  <BobaCupMesh
                    config={cupConfig}
                    autoRotate={!reducedMotion}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}

                {/* 2. Crystalline Fruit Tea with Slices */}
                {modelType === 'fruittea' && (
                  <FruitTeaMesh
                    config={cupConfig}
                    autoRotate={!reducedMotion}
                    exploded={exploded}
                  />
                )}

                {/* 3. SpacePolly SmashBurger Variants */}
                {(modelType === 'burger-giove' || modelType === 'burger') && (
                  <SpacePollyBurgerMesh
                    variant="giove"
                    accentColor={accentColor}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}
                {modelType === 'burger-plutone' && (
                  <SpacePollyBurgerMesh
                    variant="plutone"
                    accentColor={accentColor}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}
                {modelType === 'burger-marte' && (
                  <SpacePollyBurgerMesh
                    variant="marte"
                    accentColor={accentColor}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}
                {modelType === 'burger-urano' && (
                  <SpacePollyBurgerMesh
                    variant="urano"
                    accentColor={accentColor}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}

                {/* 4. Bubble Waffle Gelato */}
                {modelType === 'waffle' && (
                  <BubbleWaffleMesh
                    accentColor={accentColor}
                    exploded={exploded}
                    impulseTick={impulseTick}
                  />
                )}

                {/* 5. Crêpes Pan di Stelle */}
                {modelType === 'crepe' && (
                  <CrepeMesh
                    accentColor={accentColor}
                    autoRotate={!reducedMotion}
                  />
                )}

                {/* 6. Pancake Stack */}
                {modelType === 'pancake' && (
                  <PancakeStackMesh
                    accentColor={accentColor}
                    autoRotate={!reducedMotion}
                  />
                )}

                {/* 7. Coppetta Gelato / Yogurt */}
                {modelType === 'coppetta' && (
                  <GelatoCoppettaMesh
                    accentColor={accentColor}
                    autoRotate={!reducedMotion}
                  />
                )}
              </Float>

              <TurntableRing
                y={fit.shadowY}
                accentColor={accentColor}
                exploded={exploded}
              />

              <ContactShadows
                position={[0, fit.shadowY, 0]}
                opacity={0.32}
                scale={5.8}
                blur={2.4}
                far={4}
              />

              {!isTouch && (
                <OrbitControls
                  makeDefault
                  enableZoom={false}
                  enablePan={false}
                  enableDamping
                  target={[0, 0, 0]}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI / 1.9}
                />
              )}
              <CameraRig modelType={modelType} exploded={exploded} />
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-[#7A5A66] dark:text-[#A3939B]">
        <span className="truncate">R3F / WEBGL 3D</span>
        <span className="truncate text-right">
          {interactiveHint || (isTouch ? 'Rotazione automatica 360°' : 'Trascina 360° • Hover Parallasse')}
        </span>
      </div>
    </div>
  );
};
