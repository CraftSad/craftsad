"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  useClayTexture,
  useLeafTexture,
  useSoilTexture,
} from "./try-on-textures";

function Leaf({
  position,
  rotation,
  scale,
  hue = 115,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  hue?: number;
}) {
  const tex = useLeafTexture(hue);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.3, 0.6, 0.65, 0.95, 0, 1.4);
    s.bezierCurveTo(-0.65, 0.95, -0.3, 0.6, 0, 0);
    return s;
  }, []);
  const geo = useMemo(() => new THREE.ShapeGeometry(shape, 12), [shape]);
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale ?? 1}
      castShadow
      geometry={geo}
    >
      <meshStandardMaterial
        map={tex}
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0}
      />
    </mesh>
  );
}

function Stem({
  height,
  position,
}: {
  height: number;
  position: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.04, 0.055, height, 8]} />
      <meshStandardMaterial color="#4a7c3f" roughness={0.8} />
    </mesh>
  );
}

/** Горшок из обожжённой глины */
function Pot({ position }: { position: [number, number, number] }) {
  const soilTex = useSoilTexture();
  const clayTex = useClayTexture("#b5603a");
  return (
    <group position={position}>
      {/* body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.5, 1.1, 24, 1, true]} />
        <meshStandardMaterial map={clayTex} roughness={0.9} metalness={0} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <torusGeometry args={[0.73, 0.075, 10, 32]} />
        <meshStandardMaterial color="#c47045" roughness={0.85} />
      </mesh>
      {/* soil top */}
      <mesh position={[0, 0.56, 0]} receiveShadow>
        <circleGeometry args={[0.68, 32]} />
        <meshStandardMaterial map={soilTex} roughness={1} />
      </mesh>
      {/* bottom */}
      <mesh position={[0, -0.55, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshStandardMaterial color="#a0502a" roughness={1} />
      </mesh>
    </group>
  );
}

/** Рассада в горшке */
export function SeedlingPlant({
  position,
}: {
  position: [number, number, number];
}) {
  const hue = 112 + Math.round((position[0] * 17) % 15);
  const h = 1.4 + (Math.abs(position[0]) % 0.4);
  return (
    <group position={position}>
      <Pot position={[0, 0, 0]} />
      <Stem height={h} position={[0, 0.56 + h / 2, 0]} />
      {/* leaves */}
      <Leaf
        position={[0.12, 0.56 + h * 0.55, 0]}
        rotation={[0.3, 0, -0.6]}
        scale={0.6}
        hue={hue}
      />
      <Leaf
        position={[-0.12, 0.56 + h * 0.72, 0]}
        rotation={[0.3, 0.4, 0.5]}
        scale={0.55}
        hue={hue + 5}
      />
      <Leaf
        position={[0.08, 0.56 + h * 0.88, 0.1]}
        rotation={[-0.2, 0.2, -0.3]}
        scale={0.5}
        hue={hue - 5}
      />
      {/* top bud */}
      <mesh position={[0, 0.56 + h + 0.12, 0]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color={`hsl(${hue + 20},55%,38%)`}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

/** Растение в грядке */
export function GardenPlant({
  position,
  variant = 0,
}: {
  position: [number, number, number];
  variant?: number;
}) {
  const hue = 108 + ((variant * 7) % 20);
  const h = 1.5 + ((variant * 0.3) % 0.8);
  const stemPos: [number, number, number] = [
    position[0],
    position[1] + h / 2,
    position[2],
  ];
  return (
    <group>
      <Stem height={h} position={stemPos} />
      {/* side leaves */}
      {[0, 1, 2].map((i) => (
        <Leaf
          key={i}
          position={[
            position[0] + (i % 2 === 0 ? 0.18 : -0.18),
            position[1] + h * (0.35 + i * 0.22),
            position[2] + (i % 3 === 0 ? 0.05 : -0.05),
          ]}
          rotation={[-0.1 + i * 0.08, i * 0.4, i % 2 === 0 ? -0.7 : 0.7]}
          scale={0.55 + (i % 3) * 0.08}
          hue={hue + i * 3}
        />
      ))}
      {/* crown */}
      <Leaf
        position={[position[0], position[1] + h + 0.3, position[2]]}
        rotation={[-0.2, 0, 0]}
        scale={0.5}
        hue={hue + 10}
      />
    </group>
  );
}
