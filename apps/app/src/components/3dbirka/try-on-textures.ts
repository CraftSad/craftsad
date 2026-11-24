import { useMemo } from "react";
import * as THREE from "three";

/** Процедурная текстура почвы (canvas, без сетевых запросов) */
export function useSoilTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available");
    // base soil colour
    ctx.fillStyle = "#3d2008";
    ctx.fillRect(0, 0, size, size);
    // noise clumps
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 4;
      const lum = Math.floor(20 + Math.random() * 40);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${lum + 30},${lum},${lum - 10})`;
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);
}

/** Текстура обожжённой глины */
export function useClayTexture(hex: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available");
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.07})`;
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, [hex]);
}

/** Текстура листа с прожилками */
export function useLeafTexture(hue: number) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available");
    // gradient leaf
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      4,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, `hsl(${hue},55%,40%)`);
    g.addColorStop(1, `hsl(${hue + 10},65%,28%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // veins
    ctx.strokeStyle = `hsla(${hue},40%,55%,0.5)`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      const angle = (i / 6) * Math.PI * 2;
      ctx.lineTo(
        size / 2 + Math.cos(angle) * size * 0.42,
        size / 2 + Math.sin(angle) * size * 0.42,
      );
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, [hue]);
}
