"use client";

import { Center, Text3D } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Path, Shape } from "three";
import { getTagVisual, type ShapeId } from "./data";
import type { PlantMotif, ResolvedTagVisual } from "./series-motifs";
import { wrapName } from "./tag-config";

export type PrintableShapeLayer = {
  shape: Shape;
  z: number;
  depth: number;
  color: string;
  bevel?: number;
};

function makeClassicHead(shape: ShapeId): Shape {
  const s = new Shape();
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
    const hole = new Path();
    hole.absarc(0, 0.53, 0.07, 0, Math.PI * 2, true);
    s.holes.push(hole);
  }
  return s;
}

function makeStakeShape(xOffset = 0, tall = false): Shape {
  const s = new Shape();
  const bottom = tall ? -2.75 : -2.35;
  const shoulder = bottom + 0.3;
  s.moveTo(xOffset - 0.16, -0.42);
  s.lineTo(xOffset + 0.16, -0.42);
  s.lineTo(xOffset + 0.12, shoulder);
  s.lineTo(xOffset, bottom);
  s.lineTo(xOffset - 0.12, shoulder);
  s.closePath();
  return s;
}

function makeEllipseShape(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotation = 0,
): Shape {
  const s = new Shape();
  s.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, rotation);
  return s;
}

function makeRoundedRectShape(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): Shape {
  const s = new Shape();
  const rr = Math.min(r, w / 2, h / 2);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

function makeHeartShape(cx: number, cy: number, scale: number): Shape {
  const s = new Shape();
  s.moveTo(cx, cy - 0.52 * scale);
  s.bezierCurveTo(
    cx - 0.65 * scale,
    cy - 0.1 * scale,
    cx - 0.72 * scale,
    cy + 0.42 * scale,
    cx - 0.36 * scale,
    cy + 0.56 * scale,
  );
  s.bezierCurveTo(
    cx - 0.14 * scale,
    cy + 0.64 * scale,
    cx - 0.03 * scale,
    cy + 0.48 * scale,
    cx,
    cy + 0.36 * scale,
  );
  s.bezierCurveTo(
    cx + 0.03 * scale,
    cy + 0.48 * scale,
    cx + 0.14 * scale,
    cy + 0.64 * scale,
    cx + 0.36 * scale,
    cy + 0.56 * scale,
  );
  s.bezierCurveTo(
    cx + 0.72 * scale,
    cy + 0.42 * scale,
    cx + 0.65 * scale,
    cy - 0.1 * scale,
    cx,
    cy - 0.52 * scale,
  );
  return s;
}

function makeScallopedCloud(rx: number, ry: number, lobes = 10): Shape {
  const s = new Shape();
  const steps = lobes * 12;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wave = 1 + 0.075 * Math.cos(lobes * t);
    const x = Math.cos(t) * rx * wave;
    const y = 0.14 + Math.sin(t) * ry * wave;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

function makeSlateHead(
  silhouette: ResolvedTagVisual["slateSilhouette"],
  scale = 1,
): Shape {
  if (silhouette === "cloud" || silhouette === "scallop-bell") {
    return makeScallopedCloud(
      1.48 * scale,
      0.86 * scale,
      silhouette === "cloud" ? 10 : 8,
    );
  }
  if (silhouette === "tilted-oval") {
    return makeEllipseShape(0, 0.14, 1.52 * scale, 0.8 * scale, 0.11);
  }
  if (silhouette === "leaf-point") {
    const s = new Shape();
    s.moveTo(-1.55 * scale, 0.18 * scale);
    s.quadraticCurveTo(-0.8 * scale, 0.98 * scale, 0.2 * scale, 0.92 * scale);
    s.quadraticCurveTo(1.52 * scale, 0.84 * scale, 1.48 * scale, 0.08 * scale);
    s.quadraticCurveTo(1.42 * scale, -0.62 * scale, 0, -0.62 * scale);
    s.quadraticCurveTo(
      -1.22 * scale,
      -0.62 * scale,
      -1.55 * scale,
      0.18 * scale,
    );
    return s;
  }
  if (silhouette === "carrot-heart") {
    const s = new Shape();
    s.moveTo(0, -0.78 * scale);
    s.quadraticCurveTo(
      -1.28 * scale,
      -0.25 * scale,
      -1.24 * scale,
      0.42 * scale,
    );
    s.quadraticCurveTo(-1.16 * scale, 0.96 * scale, 0, 0.88 * scale);
    s.quadraticCurveTo(1.16 * scale, 0.96 * scale, 1.24 * scale, 0.42 * scale);
    s.quadraticCurveTo(1.28 * scale, -0.25 * scale, 0, -0.78 * scale);
    return s;
  }
  return makeEllipseShape(0, 0.14, 1.46 * scale, 0.84 * scale, 0);
}

function makeRimFromHead(
  buildHead: (scale: number) => Shape,
  innerScale = 0.91,
): Shape {
  const outer = buildHead(1);
  const inner = buildHead(innerScale);
  const hole = new Path(inner.getPoints(48));
  outer.holes.push(hole);
  return outer;
}

function makeBotanicalReliefShapes(motif: PlantMotif, cy = 0.46): Shape[] {
  if (motif === "tomato") {
    return [
      makeEllipseShape(0, cy - 0.04, 0.34, 0.25),
      makeEllipseShape(-0.14, cy + 0.2, 0.06, 0.14, 0.5),
      makeEllipseShape(0, cy + 0.22, 0.05, 0.15, 0),
      makeEllipseShape(0.14, cy + 0.2, 0.06, 0.14, -0.5),
    ];
  }
  if (motif === "cucumber" || motif === "zucchini" || motif === "eggplant") {
    return [
      makeEllipseShape(-0.04, cy, 0.44, 0.15, 0.22),
      makeEllipseShape(0.38, cy + 0.08, 0.08, 0.08),
    ];
  }
  if (motif === "carrot") {
    const root = new Shape();
    root.moveTo(-0.13, cy + 0.12);
    root.lineTo(0.13, cy + 0.12);
    root.lineTo(0, cy - 0.24);
    root.closePath();
    return [
      root,
      makeEllipseShape(-0.1, cy + 0.24, 0.05, 0.13, 0.4),
      makeEllipseShape(0, cy + 0.26, 0.05, 0.14, 0),
      makeEllipseShape(0.1, cy + 0.24, 0.05, 0.13, -0.4),
    ];
  }
  if (motif === "strawberry") {
    return [
      makeHeartShape(0, cy - 0.02, 0.42),
      makeEllipseShape(-0.12, cy + 0.22, 0.06, 0.12, 0.5),
      makeEllipseShape(0.12, cy + 0.22, 0.06, 0.12, -0.5),
    ];
  }
  if (motif === "oregano") {
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i * Math.PI) / 3;
      return makeEllipseShape(
        Math.cos(a) * 0.15,
        cy + Math.sin(a) * 0.15,
        0.07,
        0.11,
        a + Math.PI / 2,
      );
    });
  }
  return [
    makeEllipseShape(0, cy + 0.11, 0.075, 0.18, 0),
    makeEllipseShape(-0.2, cy + 0.02, 0.07, 0.17, 0.65),
    makeEllipseShape(0.2, cy + 0.02, 0.07, 0.17, -0.65),
    makeEllipseShape(-0.32, cy - 0.09, 0.055, 0.14, 1.05),
    makeEllipseShape(0.32, cy - 0.09, 0.055, 0.14, -1.05),
  ];
}

function makeProvenceHead(
  plaque: ResolvedTagVisual["provencePlaque"],
  scale = 1,
): Shape {
  if (plaque === "oval") {
    return makeEllipseShape(0, 0.14, 1.54 * scale, 0.78 * scale, 0);
  }
  if (plaque === "heart") {
    return makeHeartShape(0, 0.18, 2.05 * scale);
  }
  if (plaque === "arch-crest" || plaque === "dome") {
    const s = new Shape();
    const w = 1.48 * scale;
    const archW = (plaque === "dome" ? 0.98 : 0.86) * scale;
    s.moveTo(-w, -0.56 * scale);
    s.lineTo(w, -0.56 * scale);
    s.lineTo(w, 0.34 * scale);
    s.lineTo(archW, 0.34 * scale);
    s.absarc(0, 0.34 * scale, archW, 0, Math.PI, false);
    s.lineTo(-w, 0.34 * scale);
    s.closePath();
    return s;
  }
  if (plaque === "watering-can") {
    const s = new Shape();
    s.moveTo(-0.82 * scale, -0.58 * scale);
    s.lineTo(0.86 * scale, -0.58 * scale);
    s.lineTo(0.96 * scale, -0.14 * scale);
    s.quadraticCurveTo(1.52 * scale, -0.22 * scale, 1.5 * scale, 0.2 * scale);
    s.quadraticCurveTo(1.48 * scale, 0.58 * scale, 0.92 * scale, 0.48 * scale);
    s.lineTo(0.76 * scale, 0.62 * scale);
    s.lineTo(-0.68 * scale, 0.62 * scale);
    s.lineTo(-0.76 * scale, 0.06 * scale);
    s.lineTo(-1.52 * scale, 0.48 * scale);
    s.lineTo(-1.64 * scale, 0.3 * scale);
    s.lineTo(-0.8 * scale, -0.28 * scale);
    s.closePath();
    if (scale > 0.95) {
      const handleHole = new Path();
      handleHole.absellipse(1.16, 0.16, 0.19, 0.22, 0, Math.PI * 2, true, 0);
      s.holes.push(handleHole);
    }
    return s;
  }
  return makeScallopedCloud(1.5 * scale, 0.82 * scale, 8);
}

export function buildTagLayers(
  shape: ShapeId,
  colorIndex: number,
  name: string,
  itemIndex = 0,
): {
  visual: ResolvedTagVisual;
  layers: PrintableShapeLayer[];
  textY: number;
  textX: number;
  textZ: number;
  maxTextWidth: number;
} {
  const visual = getTagVisual(shape, colorIndex, name, itemIndex);

  if (visual.series === "classic") {
    const layers: PrintableShapeLayer[] = [
      {
        shape: makeClassicHead(shape),
        z: 0,
        depth: 0.1,
        color: visual.base,
        bevel: 0.025,
      },
    ];
    if (shape !== "hanging") {
      layers.push({
        shape: makeStakeShape(shape === "flag" ? -1.2 : 0, shape === "flag"),
        z: 0,
        depth: 0.1,
        color: visual.base,
        bevel: 0.018,
      });
    }
    return {
      visual,
      layers,
      textX: 0,
      textY: 0.02,
      textZ: 0.13,
      maxTextWidth: 2.7,
    };
  }

  if (visual.series === "slate") {
    const layers: PrintableShapeLayer[] = [
      {
        shape: makeSlateHead(visual.slateSilhouette, 1),
        z: 0,
        depth: 0.1,
        color: visual.base,
        bevel: 0.022,
      },
      {
        shape: makeStakeShape(0, visual.tallStake),
        z: 0,
        depth: 0.1,
        color: visual.base,
        bevel: 0.016,
      },
      {
        shape: makeRimFromHead(
          (sc) => makeSlateHead(visual.slateSilhouette, sc),
          0.91,
        ),
        z: 0.095,
        depth: 0.028,
        color: visual.accent,
        bevel: 0.006,
      },
      ...makeBotanicalReliefShapes(visual.motif, 0.45).map((relief) => ({
        shape: relief,
        z: 0.1,
        depth: 0.026,
        color: visual.ink,
        bevel: 0.004,
      })),
    ];
    return {
      visual,
      layers,
      textX: 0,
      textY: -0.17,
      textZ: 0.13,
      maxTextWidth: 2.35,
    };
  }

  if (visual.series === "kids") {
    const char = visual.kidsCharacter;
    const layers: PrintableShapeLayer[] = [
      {
        shape: makeStakeShape(0, visual.tallStake),
        z: 0,
        depth: 0.1,
        color: char === "sunflower" ? visual.accent : visual.base,
        bevel: 0.018,
      },
    ];

    if (char === "carrot") {
      const body = new Shape();
      body.moveTo(0, -0.51);
      body.quadraticCurveTo(-1.18, -0.2, -1.12, 0.44);
      body.quadraticCurveTo(-1.05, 0.82, 0, 0.82);
      body.quadraticCurveTo(1.05, 0.82, 1.12, 0.44);
      body.quadraticCurveTo(1.18, -0.2, 0, -0.51);
      layers.push(
        { shape: body, z: 0, depth: 0.11, color: visual.base, bevel: 0.028 },
        ...([-0.42, -0.14, 0.14, 0.42] as const).map((lx, idx) => ({
          shape: makeEllipseShape(lx, 1.02, 0.18, 0.36, (1.5 - idx) * 0.25),
          z: 0.01,
          depth: 0.09,
          color: visual.accent,
          bevel: 0.02,
        })),
        {
          shape: makeHeartShape(0, -0.44, 0.26),
          z: 0.11,
          depth: 0.03,
          color: visual.secondary,
          bevel: 0.006,
        },
      );
      return {
        visual,
        layers,
        textX: 0,
        textY: 0.16,
        textZ: 0.14,
        maxTextWidth: 1.95,
      };
    }

    if (char === "strawberry") {
      layers.push(
        {
          shape: makeHeartShape(0, 0.12, 2.05),
          z: 0,
          depth: 0.11,
          color: visual.base,
          bevel: 0.028,
        },
        ...([-0.36, 0, 0.36] as const).map((lx, idx) => ({
          shape: makeEllipseShape(lx, 0.92, 0.22, 0.32, (1 - idx) * 0.42),
          z: 0.02,
          depth: 0.095,
          color: visual.accent,
          bevel: 0.018,
        })),
        {
          shape: makeScallopedCloud(0.22, 0.22, 5),
          z: 0.11,
          depth: 0.03,
          color: visual.secondary,
          bevel: 0.006,
        },
      );
      return {
        visual,
        layers,
        textX: 0,
        textY: 0.08,
        textZ: 0.145,
        maxTextWidth: 2.1,
      };
    }

    if (char === "sunflower") {
      layers.push(
        {
          shape: makeScallopedCloud(1.36, 1.18, 12),
          z: 0,
          depth: 0.095,
          color: visual.base,
          bevel: 0.022,
        },
        {
          shape: makeEllipseShape(0, 0.14, 0.82, 0.72),
          z: 0.04,
          depth: 0.07,
          color: visual.detail,
          bevel: 0.015,
        },
        {
          shape: makeRoundedRectShape(-1.32, -0.22, 2.64, 0.72, 0.3),
          z: 0.09,
          depth: 0.045,
          color: visual.secondary,
          bevel: 0.014,
        },
        {
          shape: makeEllipseShape(-0.48, -1.18, 0.36, 0.18, -0.4),
          z: 0,
          depth: 0.09,
          color: visual.accent,
          bevel: 0.015,
        },
        {
          shape: makeEllipseShape(0.48, -1.18, 0.36, 0.18, 0.4),
          z: 0,
          depth: 0.09,
          color: visual.accent,
          bevel: 0.015,
        },
      );
      return {
        visual,
        layers,
        textX: 0,
        textY: 0.13,
        textZ: 0.15,
        maxTextWidth: 2.25,
      };
    }

    if (char === "hedgehog") {
      layers.push(
        {
          shape: makeScallopedCloud(1.52, 0.96, 14),
          z: 0,
          depth: 0.095,
          color: visual.accent,
          bevel: 0.02,
        },
        {
          shape: makeEllipseShape(-0.85, 0.34, 0.62, 0.42, 0.2),
          z: 0.03,
          depth: 0.085,
          color: visual.base,
          bevel: 0.02,
        },
        {
          shape: makeRoundedRectShape(-1.05, -0.5, 2.22, 0.88, 0.38),
          z: 0.04,
          depth: 0.085,
          color: visual.base,
          bevel: 0.02,
        },
        {
          shape: makeEllipseShape(-1.46, 0.38, 0.11, 0.11),
          z: 0.11,
          depth: 0.035,
          color: visual.detail,
          bevel: 0.008,
        },
        {
          shape: makeEllipseShape(-0.92, 0.45, 0.075, 0.075),
          z: 0.11,
          depth: 0.035,
          color: visual.detail,
          bevel: 0.006,
        },
      );
      return {
        visual,
        layers,
        textX: 0.06,
        textY: -0.06,
        textZ: 0.145,
        maxTextWidth: 1.95,
      };
    }

    if (char === "cucumber" || char === "pea") {
      layers.push(
        {
          shape: makeEllipseShape(
            0,
            0.1,
            1.48,
            0.72,
            char === "pea" ? 0.18 : 0,
          ),
          z: 0,
          depth: 0.11,
          color: visual.base,
          bevel: 0.026,
        },
        {
          shape: makeScallopedCloud(0.24, 0.24, 5),
          z: 0.09,
          depth: 0.035,
          color: visual.accent,
          bevel: 0.008,
        },
      );
      return {
        visual,
        layers,
        textX: 0,
        textY: 0.05,
        textZ: 0.145,
        maxTextWidth: 2.25,
      };
    }

    layers.push(
      {
        shape: makeEllipseShape(0, 0.12, 1.38, 0.84),
        z: 0,
        depth: 0.11,
        color: visual.base,
        bevel: 0.028,
      },
      ...([-0.24, 0, 0.24] as const).map((lx, idx) => ({
        shape: makeEllipseShape(lx, 0.92, 0.18, 0.28, (1 - idx) * 0.4),
        z: 0.02,
        depth: 0.09,
        color: visual.accent,
        bevel: 0.016,
      })),
      {
        shape: makeHeartShape(0, -0.38, 0.25),
        z: 0.11,
        depth: 0.03,
        color: visual.secondary,
        bevel: 0.006,
      },
    );
    return {
      visual,
      layers,
      textX: 0,
      textY: 0.08,
      textZ: 0.145,
      maxTextWidth: 2.15,
    };
  }

  // Provence collection
  const plaque = visual.provencePlaque;
  const layers: PrintableShapeLayer[] = [
    {
      shape: makeProvenceHead(plaque, 1),
      z: 0,
      depth: 0.1,
      color: visual.base,
      bevel: 0.024,
    },
    {
      shape: makeStakeShape(0, false),
      z: 0,
      depth: 0.1,
      color: visual.base,
      bevel: 0.018,
    },
  ];
  if (plaque !== "watering-can") {
    layers.push({
      shape: makeRimFromHead((sc) => makeProvenceHead(plaque, sc), 0.91),
      z: 0.095,
      depth: 0.026,
      color: visual.base,
      bevel: 0.008,
    });
  } else {
    layers.push(
      ...([-0.38, -0.14, 0.12, 0.36] as const).map((bx) => ({
        shape: makeEllipseShape(bx, 0.72, 0.2, 0.18),
        z: 0.02,
        depth: 0.09,
        color: visual.secondary,
        bevel: 0.018,
      })),
      {
        shape: makeHeartShape(0, 0.26, 0.28),
        z: 0.1,
        depth: 0.03,
        color: visual.accent,
        bevel: 0.006,
      },
    );
  }
  if (plaque !== "watering-can") {
    layers.push(
      ...makeBotanicalReliefShapes(visual.motif, 0.42).map((relief) => ({
        shape: relief,
        z: 0.1,
        depth: 0.032,
        color: visual.accent,
        bevel: 0.006,
      })),
    );
  }
  return {
    visual,
    layers,
    textX: 0,
    textY: plaque === "watering-can" ? -0.18 : -0.16,
    textZ: 0.135,
    maxTextWidth: plaque === "heart" || plaque === "watering-can" ? 1.85 : 2.35,
  };
}

export function ProceduralTagMeshes({
  shape,
  color,
  name,
  itemIndex = 0,
}: {
  shape: ShapeId;
  color: number;
  name: string;
  itemIndex?: number;
}) {
  const spec = useMemo(
    () => buildTagLayers(shape, color, name, itemIndex),
    [shape, color, name, itemIndex],
  );
  const geometries = useMemo(
    () =>
      spec.layers.map((layer) => ({
        layer,
        geometry: new ExtrudeGeometry(layer.shape, {
          depth: layer.depth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: layer.bevel ?? 0.02,
          bevelThickness: layer.bevel ?? 0.02,
        }),
      })),
    [spec],
  );
  useEffect(
    () => () => {
      for (const entry of geometries) entry.geometry.dispose();
    },
    [geometries],
  );

  const rawLines = wrapName(name || "Ваш сорт");
  const lines = spec.visual.uppercase
    ? rawLines.map((line) => line.toUpperCase())
    : rawLines;
  const roughness = spec.visual.series === "slate" ? 0.92 : 0.74;

  return (
    <>
      {geometries.map(({ layer, geometry }, idx) => (
        <mesh
          key={`${layer.color}-${layer.z}-${idx === 0 ? "base" : idx}`}
          position={[0, 0, layer.z]}
          geometry={geometry}
          castShadow
          receiveShadow={idx === 0}
        >
          <meshStandardMaterial
            color={layer.color}
            roughness={roughness}
            metalness={spec.visual.series === "slate" ? 0.08 : 0.03}
          />
        </mesh>
      ))}
      {lines.map((line, index) => {
        const charCount = Math.max(Array.from(line).length, 1);
        const fontSize = Math.min(
          spec.visual.series === "classic" ? 0.28 : 0.23,
          (spec.maxTextWidth * 1.18) / charCount,
        );
        const lineY =
          lines.length === 1
            ? spec.textY
            : spec.textY + 0.16 - index * (fontSize * 1.32);
        return (
          <Center
            key={index === 0 ? "first-line" : "second-line"}
            cacheKey={`${spec.visual.series}-${line}-${fontSize.toFixed(3)}`}
            position={[spec.textX, lineY, spec.textZ]}
          >
            <Text3D
              font="/fonts/manrope.typeface.json"
              size={fontSize}
              height={0.034}
              bevelEnabled
              bevelSize={0.003}
              bevelThickness={0.003}
              curveSegments={6}
            >
              {line}
              <meshStandardMaterial color={spec.visual.ink} roughness={0.62} />
            </Text3D>
          </Center>
        );
      })}
    </>
  );
}
