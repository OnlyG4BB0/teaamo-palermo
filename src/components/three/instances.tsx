import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface InstanceItem {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

/**
 * Static instanced batch: many small identical parts (sugar, sprinkles, drupelets,
 * sugar stars) drawn in a single draw call instead of one mesh + material each.
 */
export const Instances: React.FC<{
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  items: InstanceItem[];
}> = ({ geometry, material, items }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const hasColors = useMemo(() => items.some((it) => it.color), [items]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    items.forEach((it, i) => {
      dummy.position.set(...it.position);
      dummy.rotation.set(...(it.rotation ?? [0, 0, 0]));
      if (Array.isArray(it.scale)) dummy.scale.set(...it.scale);
      else dummy.scale.setScalar(it.scale ?? 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (hasColors) mesh.setColorAt(i, color.set(it.color ?? '#ffffff'));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, hasColors]);

  return <instancedMesh ref={ref} args={[geometry, material, items.length]} />;
};
