"use client";

import {
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  Text3D,
} from "@react-three/drei";
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
import { type Group, Path, Shape } from "three";
import { colorPairs, type ShapeId } from "./data";

type Props = {
  shape: ShapeId;
  color: number;
  name: string;
  view: "front" | "side" | "rotate";
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

function Tag({ shape, color, name, view }: Props) {
  const group = useRef<Group>(null);
  const reduced = useReducedMotion();
  const pair = colorPairs[color] ?? colorPairs[0];
  const outline = new Shape();
  outline.moveTo(-1.4, -0.57);
  outline.lineTo(1.4, -0.57);
  outline.quadraticCurveTo(1.55, -0.57, 1.55, -0.42);
  outline.lineTo(1.55, 0.57);
  outline.quadraticCurveTo(1.55, 0.72, 1.4, 0.72);
  outline.lineTo(-1.4, 0.72);
  outline.quadraticCurveTo(-1.55, 0.72, -1.55, 0.57);
  outline.lineTo(-1.55, -0.42);
  outline.quadraticCurveTo(-1.55, -0.57, -1.4, -0.57);
  if (shape === "hanging") {
    const hole = new Path();
    hole.absarc(0, 0.53, 0.07, 0, Math.PI * 2, true);
    outline.holes.push(hole);
  }
  const stem = new Shape();
  const x = shape === "flag" ? -1.2 : 0;
  stem.moveTo(x - 0.16, -0.45);
  stem.lineTo(x + 0.16, -0.45);
  stem.lineTo(x + 0.12, -2.05);
  stem.lineTo(x, -2.35);
  stem.lineTo(x - 0.12, -2.05);
  stem.closePath();
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = view === "side" ? 1.18 : -0.12;
    if (view === "rotate" && !reduced) group.current.rotation.y += delta * 0.4;
    else
      group.current.rotation.y +=
        (target - group.current.rotation.y) * Math.min(delta * 6, 1);
  });
  const words = name.split(/\s+/);
  const lines =
    words.length > 1 ? [words[0] ?? "", words.slice(1).join(" ")] : [name];
  return (
    <group
      ref={group}
      position={[0, shape === "hanging" ? 0 : 0.65, 0]}
      rotation={[0.05, -0.12, -0.12]}
    >
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[
            outline,
            {
              depth: 0.1,
              bevelEnabled: true,
              bevelSegments: 3,
              steps: 1,
              bevelSize: 0.025,
              bevelThickness: 0.025,
            },
          ]}
        />
        <meshStandardMaterial color={pair.base} roughness={0.8} />
      </mesh>
      {shape !== "hanging" && (
        <mesh castShadow>
          <extrudeGeometry
            args={[
              stem,
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
      {lines.map((line, index) => (
        <Center
          key={index === 0 ? "first-line" : "second-line"}
          cacheKey={line}
          position={[0, lines.length === 1 ? 0.02 : 0.21 - index * 0.36, 0.13]}
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
        className="cs-three"
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
