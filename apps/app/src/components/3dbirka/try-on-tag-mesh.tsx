"use client";

import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type * as THREE from "three";
import { ProceduralTagMeshes } from "./tag-three-geometry";
import type { TagProps } from "./try-on-types";

export function TagMesh({
  shape,
  color,
  name,
  itemIndex = 0,
  position,
  rotation,
  animate = false,
}: TagProps & {
  position: [number, number, number];
  rotation?: [number, number, number];
  animate?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame(({ clock }) => {
    if (!group.current || reduced || !animate) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.04;
    group.current.rotation.x = 0.05 + Math.sin(clock.elapsedTime * 0.6) * 0.02;
  });

  return (
    <group ref={group} position={position} rotation={rotation ?? [0, 0, 0]}>
      <ProceduralTagMeshes
        shape={shape}
        color={color}
        name={name}
        itemIndex={itemIndex}
      />
      {shape === "hanging" && (
        <mesh position={[0, 1.1, 0.05]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
          <meshStandardMaterial color="#c8a46e" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}
