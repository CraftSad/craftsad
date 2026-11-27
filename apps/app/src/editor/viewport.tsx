"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import {
  Canvas,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  type ComponentRef,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { designKey } from "./lib";
import { batchNames } from "./model/export/print";
import type { BuiltTag, MeshData } from "./model/geometry";
import { platePoints, stakePoints } from "./model/outline";
import { layoutPlate } from "./model/plate";
import { printer } from "./model/printer";
import type { TagDesign } from "./model/schema";
import { useEditor } from "./store";

type At = [number, number, number];
type Colors = { body: string; relief: string };

/** Printed parts lie in XY with thickness along Z; the scene's up is Y. */
const FLAT: At = [-Math.PI / 2, 0, 0];
/** Where the camera looks from: above, in front and a little to the right. */
const DIRECTION = new THREE.Vector3(0.5, 0.85, 1).normalize();
/** Tint of the lettering of the layer being edited. */
const HIGHLIGHT = "#e2793c";

function useSolid(data: MeshData) {
  const geometry = useMemo(() => {
    const solid = new THREE.BufferGeometry();
    solid.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions, 3),
    );
    // Corners are unshared, so normals stay flat and edges read sharp.
    solid.computeVertexNormals();
    return solid;
  }, [data]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function Solid({
  data,
  color,
  position,
  roughness,
}: {
  data: MeshData;
  color: string;
  position: At;
  roughness: number;
}) {
  const geometry = useSolid(data);
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={FLAT}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

/** A built tag with the centre of its bounding box at `at`. */
function TagModel({
  tag,
  colors,
  at,
  highlight,
}: {
  tag: BuiltTag;
  colors: Colors;
  at: At;
  highlight: boolean;
}) {
  // The stake pulls the bounding-box centre away from the plate centre.
  const origin: At = [at[0] - tag.center.x, at[1], at[2] + tag.center.y];
  return (
    <group>
      <Solid
        data={tag.body}
        color={colors.body}
        position={origin}
        roughness={highlight ? 0.4 : 0.62}
      />
      {tag.relief && (
        <Solid
          data={tag.relief}
          color={highlight ? HIGHLIGHT : colors.relief}
          position={origin}
          roughness={highlight ? 0.4 : 0.62}
        />
      )}
    </group>
  );
}

function toShape(points: [number, number][]): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index) shape.lineTo(x, y);
    else shape.moveTo(x, y);
  });
  shape.closePath();
  return shape;
}

/** See-through stand-in for a tag of the batch that is not built yet. */
function Blank({ tag, at }: { tag: TagDesign; at: At }) {
  const shapes = useMemo(() => {
    const plate = platePoints(tag.shape);
    const parts = [toShape(plate)];
    if (tag.mount.type === "stake")
      parts.push(toShape(stakePoints(tag.shape, tag.mount, plate)));
    return parts;
  }, [tag]);
  const bottom = tag.mount.type === "stake" ? -tag.mount.length : 0;
  const origin: At = [0, -bottom / 2, 0];
  return (
    <group position={at} rotation={FLAT}>
      {shapes.map((shape, index) => (
        <mesh key={index} position={origin}>
          <shapeGeometry args={[shape]} />
          <meshBasicMaterial
            color="#7f9a8b"
            transparent
            opacity={index ? 0.3 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The printer's textured PEI sheet with its frame, centred on the origin. */
function Bed() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#2d312f";
    context.fillRect(0, 0, 1024, 1024);
    context.fillStyle = "#3b403d";
    for (let y = 6; y < 1024; y += 12)
      for (let x = 6; x < 1024; x += 12) {
        context.beginPath();
        context.arc(x, y, 2.3, 0, Math.PI * 2);
        context.fill();
      }
    // A faint 50 mm grid helps judge the size of what lies on the sheet.
    context.strokeStyle = "#4d534f";
    context.lineWidth = 2;
    for (let line = 0; line <= 1024; line += 160) {
      context.beginPath();
      context.moveTo(line, 0);
      context.lineTo(line, 1024);
      context.moveTo(0, line);
      context.lineTo(1024, line);
      context.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);
  const { x, y } = printer.bed;
  const bars: [number, number, number, number][] = [
    [0, -y / 2 - 4, x + 16, 8],
    [0, y / 2 + 4, x + 16, 8],
    [-x / 2 - 4, 0, 8, y],
    [x / 2 + 4, 0, 8, y],
  ];
  return (
    <group>
      <mesh rotation={FLAT} receiveShadow>
        <planeGeometry args={[x, y]} />
        <meshStandardMaterial map={texture ?? undefined} roughness={0.95} />
      </mesh>
      {bars.map(([cx, cz, w, d]) => (
        <mesh key={`${cx}:${cz}`} position={[cx, 3, cz]} castShadow>
          <boxGeometry args={[w, 6, d]} />
          <meshStandardMaterial
            color="#9aa19d"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}
      {/* The stock filament cutter blocks this corner of the sheet. */}
      <mesh position={[-x / 2 + 4.5, 0.15, y / 2 - 6.5]} rotation={FLAT}>
        <planeGeometry args={[9, 13]} />
        <meshBasicMaterial color="#c0563c" />
      </mesh>
    </group>
  );
}

/**
 * Glides the camera to frame the tag, or the whole bed, whenever that
 * target changes; it lets go as soon as the user starts orbiting.
 */
function CameraRig({
  controls,
  extent,
  far,
}: {
  controls: RefObject<ComponentRef<typeof OrbitControls> | null>;
  extent: number;
  far: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const goal = useRef(new THREE.Vector3());
  const gliding = useRef(false);
  useEffect(() => {
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const span = far ? extent * 1.55 : extent * 1.35;
    goal.current.copy(DIRECTION).multiplyScalar(span / 2 / Math.tan(fov / 2));
    gliding.current = true;
  }, [camera, extent, far]);
  useFrame((_, delta) => {
    const orbit = controls.current;
    if (gliding.current) {
      camera.position.lerp(goal.current, Math.min(delta * 4, 1));
      if (camera.position.distanceTo(goal.current) < 0.1)
        gliding.current = false;
    }
    orbit?.update();
  });
  return null;
}

/** Every tag of the batch laid out as it will print on the bed. */
function Plate() {
  const project = useEditor((state) => state.project);
  const active = useEditor((state) => state.active);
  const setActive = useEditor((state) => state.setActive);
  const built = useEditor((state) => state.built);
  // Built tags are only valid for the design they were made from.
  const builds = useEditor((state) =>
    state.plateKey === designKey(state.project) ? state.plateBuilds : undefined,
  );
  const names = useMemo(() => batchNames(project), [project]);
  const { gap, margin } = project.batch;
  const size = built?.size ?? { x: 60, y: 30 };
  const plate = useMemo(
    () => layoutPlate(size, names.length, gap, margin),
    [size, names.length, gap, margin],
  );
  const { x: bedX, y: bedY } = printer.bed;
  return (
    <group>
      <Bed />
      {plate.placements.map((at, index) => {
        const name = names[index] ?? project.title;
        const tag = builds?.get(name);
        const centre: At = [at.x - bedX / 2, 0, -(at.y - bedY / 2)];
        return (
          // Clicking a tag on the bed is a shortcut; the pager and the batch
          // chips select tags from the keyboard.
          // biome-ignore lint/a11y/noStaticElementInteractions: a 3D object has no keyboard event model
          <group
            key={index}
            onClick={(event) => {
              event.stopPropagation();
              setActive(index);
            }}
            onPointerOver={(event) => cursor(event, "pointer")}
            onPointerOut={(event) => cursor(event, "")}
          >
            {index === active && (
              <mesh position={[centre[0], 0.12, centre[2]]} rotation={FLAT}>
                <planeGeometry args={[size.x + 6, size.y + 6]} />
                <meshBasicMaterial color="#e9c981" transparent opacity={0.4} />
              </mesh>
            )}
            {tag ? (
              <TagModel
                tag={tag}
                colors={project.colors}
                at={centre}
                highlight={index === active}
              />
            ) : (
              <Blank tag={project.tag} at={centre} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function cursor(event: ThreeEvent<PointerEvent>, value: string) {
  event.stopPropagation();
  if (event.nativeEvent.target instanceof HTMLElement)
    event.nativeEvent.target.style.cursor = value;
}

export function Viewport() {
  const view = useEditor((state) => state.view);
  const project = useEditor((state) => state.project);
  const built = useEditor((state) => state.built);
  const editingLayer = useEditor((state) => state.layer !== null);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const bed = view === "bed";
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 40, near: 0.5, far: 6000, position: [160, 260, 320] }}
    >
      <ambientLight intensity={0.95} />
      <hemisphereLight args={["#ffffff", "#cfc8b8", 0.5]} />
      <directionalLight
        position={[140, 260, 180]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={260}
        shadow-camera-bottom={-260}
        shadow-camera-near={1}
        shadow-camera-far={900}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-180, 120, -140]} intensity={0.8} />
      {bed ? (
        <Plate />
      ) : (
        built && (
          <>
            <TagModel
              tag={built}
              colors={project.colors}
              at={[0, 0, 0]}
              highlight={editingLayer}
            />
            <ContactShadows
              position={[0, -0.05, 0]}
              opacity={0.5}
              scale={Math.max(built.size.x, built.size.y) * 1.6}
              blur={1.4}
              far={40}
            />
          </>
        )
      )}
      <OrbitControls
        ref={controls}
        enableDamping
        minDistance={10}
        maxDistance={bed ? 1600 : 900}
        maxPolarAngle={Math.PI / 2 - 0.03}
      />
      <CameraRig
        controls={controls}
        extent={
          bed
            ? printer.bed.x
            : Math.max(built?.size.x ?? 90, built?.size.y ?? 90)
        }
        far={bed}
      />
    </Canvas>
  );
}
