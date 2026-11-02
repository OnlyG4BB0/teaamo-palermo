import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Spring, clamp01, damp, easeOutBack, easeOutCubic, lerp } from './kit';

/**
 * Shared motion state for one model. The root advances it every frame and the
 * parts read it, so a whole product animates as one choreographed object.
 */
export interface MotionState {
  /** Seconds since the model mounted (drives the assembly intro) */
  intro: number;
  time: number;
  /** 0 → 1 exploded view */
  explode: Spring;
  /** 1 at rest; volume-preserving squash & stretch */
  squash: Spring;
  hover: Spring;
  /** Extra spin velocity added by impulses, decays over time */
  spin: number;
  /** 1 right after an impulse/tap, decays to 0 — parts use it to stir, jiggle, bounce */
  kick: number;
  /** Increments on every impulse so parts can react once */
  kickCount: number;
  reduced: boolean;
}

const MotionContext = createContext<MotionState | null>(null);

export const useMotion = () => {
  const m = useContext(MotionContext);
  if (!m) throw new Error('useMotion must be used inside <MotionRoot>');
  return m;
};

/** Assembly progress (0 → 1) for a part that enters in position `order` */
export const introProgress = (m: MotionState, order: number, duration = 0.62, start = 0.18) =>
  m.reduced ? 1 : clamp01((m.intro - start - order * 0.11) / duration);

interface MotionRootProps {
  children: React.ReactNode;
  exploded: boolean;
  impulseTick: number;
  autoRotate: boolean;
  exiting: boolean;
  onExited: () => void;
  reduced: boolean;
}

export const MotionRoot: React.FC<MotionRootProps> = ({
  children,
  exploded,
  impulseTick,
  autoRotate,
  exiting,
  onExited,
  reduced,
}) => {
  const outerRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);
  const rotRef = useRef(0);
  const exitedRef = useRef(false);
  const firstTickRef = useRef(impulseTick);

  const m = useMemo<MotionState>(
    () => ({
      intro: reduced ? 10 : 0,
      time: 0,
      explode: new Spring(0, 120, 13),
      squash: new Spring(1, 300, 11),
      hover: new Spring(0, 140, 18),
      spin: 0,
      kick: 0,
      kickCount: 0,
      reduced,
    }),
    // Motion state lives for the lifetime of this model instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const scale = useMemo(() => new Spring(1, 220, 22), []);

  const triggerKick = (strength: number) => {
    if (reduced) return;
    m.squash.kick(-4.2 * strength);
    m.spin += 7 * strength;
    m.kick = 1;
    m.kickCount += 1;
  };

  useEffect(() => {
    if (impulseTick !== firstTickRef.current) triggerKick(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impulseTick]);

  useEffect(() => {
    if (exiting && reduced && !exitedRef.current) {
      exitedRef.current = true;
      onExited();
    }
  }, [exiting, reduced, onExited]);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    m.time += dt;
    m.intro += dt;

    m.explode.target = exploded ? 1 : 0;
    m.explode.step(dt);
    m.squash.step(dt);
    m.hover.target = hoveredRef.current ? 1 : 0;
    m.hover.step(dt);
    m.spin = damp(m.spin, 0, 2.4, dt);
    m.kick = damp(m.kick, 0, 1.4, dt);

    scale.target = exiting ? 0 : 1;
    scale.step(dt);

    const outer = outerRef.current;
    const tilt = tiltRef.current;
    if (!outer || !tilt) return;

    // Pop in with overshoot, spinning into place
    const introE = reduced ? 1 : easeOutBack(m.intro / 0.75, 1.6);
    const s = Math.max(0.0001, scale.value * introE);
    const sq = m.squash.value;
    outer.scale.set(s / Math.sqrt(sq), s * sq, s / Math.sqrt(sq));

    const idleSpeed = autoRotate && !reduced ? 0.3 + m.hover.value * 0.35 : 0;
    rotRef.current += dt * (idleSpeed + m.spin + (exiting ? 9 : 0));
    const introSpin = reduced ? 0 : (1 - easeOutCubic(m.intro / 1.3)) * Math.PI * 1.25;
    outer.rotation.y = rotRef.current - introSpin;

    // Idle float + hover lift
    outer.position.y = reduced ? 0 : Math.sin(m.time * 1.25) * 0.035 + m.hover.value * 0.07;

    // Pointer parallax tilt on its own group so it never fights the spin
    tilt.rotation.x = damp(tilt.rotation.x, reduced ? 0 : state.pointer.y * 0.14, 4, dt);
    tilt.rotation.z = damp(tilt.rotation.z, reduced ? 0 : -state.pointer.x * 0.09, 4, dt);

    if (exiting && !exitedRef.current && scale.value < 0.05) {
      exitedRef.current = true;
      onExited();
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredRef.current = true;
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    hoveredRef.current = false;
    document.body.style.cursor = '';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    triggerKick(0.8);
  };

  return (
    <group ref={tiltRef}>
      <group ref={outerRef} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <MotionContext.Provider value={m}>{children}</MotionContext.Provider>
      </group>
    </group>
  );
};

type Vec3 = [number, number, number];

interface LayerProps {
  children: React.ReactNode;
  /** Entry order in the assembly sequence */
  order?: number;
  position?: Vec3;
  rotation?: Vec3;
  /** Offset applied at full exploded view (a number means straight up) */
  explode?: Vec3 | number;
  /** How far above its resting place the part falls from */
  drop?: number;
  /** Extra separation while hovered, as a fraction of `explode` */
  hoverPeek?: number;
  /** Grow from zero instead of dropping in */
  grow?: boolean;
}

/** A part of a model: drops in during the intro and slides apart in exploded view */
export const Layer: React.FC<LayerProps> = ({
  children,
  order = 0,
  position = [0, 0, 0],
  rotation,
  explode = 0,
  drop = 1.6,
  hoverPeek = 0.16,
  grow = false,
}) => {
  const ref = useRef<THREE.Group>(null);
  const m = useMotion();
  const [ox, oy, oz] = typeof explode === 'number' ? [0, explode, 0] : explode;

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const k = introProgress(m, order);
    const ex = m.explode.value + m.hover.value * hoverPeek;
    if (grow) {
      const s = Math.max(0.0001, easeOutBack(k, 2.2));
      g.scale.setScalar(s);
      g.position.set(position[0] + ex * ox, position[1] + ex * oy, position[2] + ex * oz);
    } else {
      // easeOutBack dips below the target and returns — reads as a landing bounce
      const e = easeOutBack(k, 1.9);
      g.position.set(
        position[0] + ex * ox,
        position[1] + ex * oy + (1 - e) * drop,
        position[2] + ex * oz
      );
      g.scale.setScalar(k <= 0 ? 0.0001 : lerp(0.55, 1, easeOutCubic(k * 1.5)));
    }
    g.visible = k > 0;
  });

  return (
    <group ref={ref} rotation={rotation}>
      {children}
    </group>
  );
};
