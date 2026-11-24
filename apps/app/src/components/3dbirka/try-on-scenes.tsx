"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { GardenPlant, SeedlingPlant } from "./try-on-plants";
import { TagMesh } from "./try-on-tag-mesh";
import { useSoilTexture } from "./try-on-textures";
import type { TagProps, TryOnMode } from "./try-on-types";

/** Грядка с деревянными бортами */
function GardenBed() {
  const soilTex = useSoilTexture();
  return (
    <group>
      {/* raised bed box */}
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.5, 4]} />
        <meshStandardMaterial color="#6b3a1f" roughness={0.95} />
      </mesh>
      {/* soil surface */}
      <mesh
        position={[0, 0.01, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[8.6, 3.6, 12, 12]} />
        <meshStandardMaterial map={soilTex} roughness={1} />
      </mesh>
      {/* wood planks sides */}
      {([-4.52, 4.52] as const).map((x) => (
        <mesh key={x} position={[x, -0.08, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 4]} />
          <meshStandardMaterial color="#7a4420" roughness={0.9} />
        </mesh>
      ))}
      {([-2.02, 2.02] as const).map((z) => (
        <mesh key={z} position={[0, -0.08, z]} castShadow>
          <boxGeometry args={[9.1, 0.6, 0.12]} />
          <meshStandardMaterial color="#7a4420" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Рассада на полке, бирка-колышек рядом с первым горшком */
function SeedlingScene({ shape, color, name }: TagProps) {
  const potPositions: [number, number, number][] = [
    [-2.4, 0, 0.3],
    [0, 0, 0],
    [2.4, 0, 0.3],
    [-1.2, 0, -1.0],
    [1.2, 0, -1.0],
  ];
  const tagPos: [number, number, number] = [-2.4 + 0.85, 0.56 + 0.3, 0.3];
  const tagRot: [number, number, number] = [0, 0.3, 0];

  return (
    <group>
      {/* wooden shelf / table surface */}
      <mesh position={[0, -0.62, 0]} receiveShadow castShadow>
        <boxGeometry args={[7.5, 0.18, 3.5]} />
        <meshStandardMaterial color="#c8a46e" roughness={0.85} />
      </mesh>
      {/* wood grain stripes */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, -0.535, 0]}>
          <boxGeometry args={[0.04, 0.001, 3.5]} />
          <meshStandardMaterial color="#a07838" roughness={1} />
        </mesh>
      ))}
      {/* plants */}
      {potPositions.map((pos) => (
        <SeedlingPlant key={pos.join(",")} position={pos} />
      ))}
      {/* the tag */}
      <Suspense fallback={null}>
        <TagMesh
          shape={shape}
          color={color}
          name={name}
          position={tagPos}
          rotation={tagRot}
          animate
        />
      </Suspense>
    </group>
  );
}

/** Грядка, бирка-флажок у переднего края */
function GardenScene({ shape, color, name }: TagProps) {
  const plantPositions: Array<[number, number, number]> = [
    [-3.2, 0.01, -0.6],
    [-1.6, 0.01, -0.5],
    [0, 0.01, -0.7],
    [1.6, 0.01, -0.5],
    [3.2, 0.01, -0.6],
    [-2.4, 0.01, 0.6],
    [-0.8, 0.01, 0.5],
    [0.8, 0.01, 0.6],
    [2.4, 0.01, 0.5],
  ];

  const tagPos: [number, number, number] = [-3.8, 0.01, 1.3];
  const tagRot: [number, number, number] = [0, 0.25, 0];

  return (
    <group>
      <GardenBed />
      {plantPositions.map((pos, i) => (
        <GardenPlant key={pos.join(",")} position={pos} variant={i} />
      ))}
      <Suspense fallback={null}>
        <TagMesh
          shape={shape}
          color={color}
          name={name}
          position={tagPos}
          rotation={tagRot}
          animate
        />
      </Suspense>
    </group>
  );
}

/** Теплица, подвесная бирка на верёвочке */
function GreenhouseScene({ shape, color, name }: TagProps) {
  const potPositions: [number, number, number][] = [
    [-2.0, 0, 0],
    [0, 0, 0],
    [2.0, 0, 0],
  ];

  // rope from ceiling bar
  const tagPos: [number, number, number] = [-2.0, 2.4, 0.2];
  const tagRot: [number, number, number] = [0, 0.2, 0];

  return (
    <group>
      {/* tray / shelf */}
      <mesh position={[0, -0.62, 0]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.14, 2.5]} />
        <meshStandardMaterial color="#8aab6a" roughness={0.9} />
      </mesh>
      {/* overhead bar (steel pipe) — rotated at mesh level, not geometry */}
      <mesh position={[0, 3.4, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 7, 10]} />
        <meshStandardMaterial color="#8899aa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* plants */}
      {potPositions.map((pos) => (
        <SeedlingPlant key={pos.join(",")} position={pos} />
      ))}
      {/* the hanging tag */}
      <Suspense fallback={null}>
        <TagMesh
          shape={shape}
          color={color}
          name={name}
          position={tagPos}
          rotation={tagRot}
          animate
        />
      </Suspense>
    </group>
  );
}

/** Внутренняя сцена, рендерится внутри Canvas */
export function InnerScene({
  mode,
  shape,
  color,
  name,
}: TagProps & { mode: TryOnMode }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 8, 6]} intensity={2.2} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.6} />
      <Suspense fallback={null}>
        <Environment preset="park" />
      </Suspense>

      <Suspense fallback={null}>
        {mode === "seedling" && (
          <SeedlingScene shape={shape} color={color} name={name} />
        )}
        {mode === "garden" && (
          <GardenScene shape={shape} color={color} name={name} />
        )}
        {mode === "greenhouse" && (
          <GreenhouseScene shape={shape} color={color} name={name} />
        )}
      </Suspense>

      {/* grass / ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.72, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#5a8a44" roughness={1} />
      </mesh>

      <ContactShadows
        position={[0, -0.71, 0]}
        opacity={0.45}
        scale={16}
        blur={2.8}
        far={5}
      />
    </>
  );
}
