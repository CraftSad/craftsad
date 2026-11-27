"use client";

/**
 * TryOnScene — реалистичная 3D-сцена примерки бирки.
 * Режимы:
 *   "seedling"   — рассада в горшке, бирка-колышек воткнута в землю
 *   "garden"     — грядка с растениями, бирка-флажок стоит у первого ряда
 *   "greenhouse" — подвесная бирка на верёвочке у тепличного растения
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, type ReactNode, useEffect, useState } from "react";
import { InnerScene } from "./try-on-scenes";
import type { TagProps, TryOnMode } from "./try-on-types";

type SceneProps = TagProps & {
  mode: TryOnMode;
};

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const CAMERA: Record<
  TryOnMode,
  { position: [number, number, number]; fov: number }
> = {
  seedling: { position: [0, 2.8, 7.5], fov: 42 },
  garden: { position: [0, 4.5, 10], fov: 46 },
  greenhouse: { position: [0, 2.5, 8], fov: 44 },
};

export default function TryOnScene({
  mode,
  shape,
  color,
  name,
  itemIndex = 0,
  fallback,
}: SceneProps & { fallback: ReactNode }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      setSupported(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setSupported(false);
    }
  }, []);
  if (!supported) return <>{fallback}</>;

  const cam = CAMERA[mode];
  return (
    <SceneBoundary fallback={fallback}>
      <div
        className="h-[360px] w-full relative touch-pan-y max-[570px]:h-[270px] max-[800px]:h-[310px] [&_canvas]:[outline:none]"
        role="img"
        aria-label={`Примерка бирки "${name}" на ${
          mode === "seedling"
            ? "рассаду"
            : mode === "garden"
              ? "грядку"
              : "теплицу"
        }`}
      >
        <Canvas shadows dpr={[1, 1.5]} camera={cam} fallback={fallback}>
          <InnerScene
            mode={mode}
            shape={shape}
            color={color}
            name={name}
            itemIndex={itemIndex}
          />
          <OrbitControls
            enableDamping
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.3}
            maxPolarAngle={1.9}
          />
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
