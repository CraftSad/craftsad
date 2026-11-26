"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import {
  Component,
  type ComponentRef,
  type ReactNode,
  type Ref,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Group } from "three";
import type { ShapeId } from "./data";
import { ProceduralTagMeshes } from "./tag-three-geometry";

type Props = {
  shape: ShapeId;
  color: number;
  name: string;
  view: "front" | "side" | "rotate";
  itemIndex?: number;
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

function Tag({ shape, color, name, view, itemIndex = 0 }: Props) {
  const group = useRef<Group>(null);
  const reduced = useReducedMotion();
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = view === "side" ? 1.18 : -0.12;
    if (view === "rotate" && !reduced) group.current.rotation.y += delta * 0.4;
    else
      group.current.rotation.y +=
        (target - group.current.rotation.y) * Math.min(delta * 6, 1);
  });
  return (
    <group
      ref={group}
      position={[0, shape === "hanging" ? 0 : 0.65, 0]}
      rotation={[0.05, -0.12, -0.12]}
    >
      <ProceduralTagMeshes
        shape={shape}
        color={color}
        name={name}
        itemIndex={itemIndex}
      />
    </group>
  );
}

export default function LabelScene({
  fallback,
  resetViewRef,
  ...tagProps
}: Props & { fallback: ReactNode; resetViewRef: Ref<() => void> }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useImperativeHandle(
    resetViewRef,
    () => () => {
      const orbit = controls.current;
      if (!orbit) return;
      // Clear any remaining drag momentum before restoring the saved camera.
      const damping = orbit.enableDamping;
      orbit.enableDamping = false;
      orbit.update();
      orbit.reset();
      orbit.enableDamping = damping;
    },
    [],
  );
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
  if (!supported) return fallback;
  return (
    <SceneBoundary fallback={fallback}>
      <div
        className="birka-three"
        role="img"
        aria-label={`Объёмная бирка: ${tagProps.name}. Вращайте мышью или пальцем.`}
      >
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.3, 6.5], fov: 40 }}
          fallback={fallback}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 5]} intensity={2.5} castShadow />
          <Suspense fallback={null}>
            <Tag {...tagProps} />
          </Suspense>
          <Suspense fallback={null}>
            <Environment preset="studio" />
          </Suspense>
          <ContactShadows
            position={[0, -1.9, 0]}
            opacity={0.5}
            scale={9}
            blur={2.6}
            far={4}
          />
          <OrbitControls
            ref={controls}
            enableDamping
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.5}
            maxPolarAngle={2.4}
          />
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
