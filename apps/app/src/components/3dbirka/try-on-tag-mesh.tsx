"use client";

import { Center, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { colorPairs } from "./data";
import { wrapName } from "./tag-config";
import type { TagProps } from "./try-on-types";

export function TagMesh({
  shape,
  color,
  name,
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
  const pair = colorPairs[color] ?? colorPairs[0];

  // gentle sway
  useFrame(({ clock }) => {
    if (!group.current || reduced || !animate) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.04;
    group.current.rotation.x = 0.05 + Math.sin(clock.elapsedTime * 0.6) * 0.02;
  });

  const outline = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.4, -0.57);
    s.lineTo(1.4, -0.57);
    s.quadraticCurveTo(1.55, -0.57, 1.55, -0.42);
    s.lineTo(1.55, 0.57);
    s.quadraticCurveTo(1.55, 0.72, 1.4, 0.72);
    s.lineTo(-1.4, 0.72);
    s.quadraticCurveTo(-1.55, 0.72, -1.55, 0.57);
    s.lineTo(-1.55, -0.42);
    s.quadraticCurveTo(-1.55, -0.57, -1.4, -0.57);
    if (shape === "hanging") {
      const hole = new THREE.Path();
      hole.absarc(0, 0.53, 0.07, 0, Math.PI * 2, true);
      s.holes.push(hole);
    }
    return s;
  }, [shape]);

  const stemShape = useMemo(() => {
    if (shape === "hanging") return null;
    const s = new THREE.Shape();
    const x = shape === "flag" ? -1.2 : 0;
    s.moveTo(x - 0.16, -0.45);
    s.lineTo(x + 0.16, -0.45);
    s.lineTo(x + 0.12, -2.05);
    s.lineTo(x, -2.35);
    s.lineTo(x - 0.12, -2.05);
    s.closePath();
    return s;
  }, [shape]);

  const lines = wrapName(name);

  const extrude = {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  };

  return (
    <group ref={group} position={position} rotation={rotation ?? [0, 0, 0]}>
      {/* label body */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[outline, extrude]} />
        <meshStandardMaterial
          color={pair.base}
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
      {/* stem / stake */}
      {stemShape && (
        <mesh castShadow>
          <extrudeGeometry
            args={[
              stemShape,
              {
                depth: 0.1,
                bevelEnabled: true,
                bevelSize: 0.018,
                bevelThickness: 0.018,
                bevelSegments: 2,
              },
            ]}
          />
          <meshStandardMaterial color={pair.base} roughness={0.8} />
        </mesh>
      )}
      {/* text */}
      {lines.map((line, idx) => (
        <Center
          key={idx === 0 ? "l0" : "l1"}
          cacheKey={line}
          position={[0, lines.length === 1 ? 0.02 : 0.21 - idx * 0.36, 0.13]}
        >
          <Text3D
            font="/fonts/manrope.typeface.json"
            size={Math.min(0.28, 3.3 / Math.max(line.length, 1))}
            height={0.035}
            bevelEnabled
            bevelSize={0.003}
            bevelThickness={0.003}
            curveSegments={6}
          >
            {line}
            <meshStandardMaterial color={pair.ink} roughness={0.65} />
          </Text3D>
        </Center>
      ))}
      {/* hanging string */}
      {shape === "hanging" && (
        <mesh position={[0, 1.1, 0.05]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 6]} />
          <meshStandardMaterial color="#c8a46e" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}
