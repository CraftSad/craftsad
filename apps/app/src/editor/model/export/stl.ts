import type { MeshData } from "../geometry";

/**
 * Binary STL: one triangle soup in millimetres, with no colours. Importers
 * place each STL as its own object.
 */
export function encodeStl(mesh: MeshData, name: string): ArrayBuffer {
  const buffer = new ArrayBuffer(84 + mesh.triangles * 50);
  const view = new DataView(buffer);
  // The header must not start with "solid", or readers parse it as ASCII.
  const header = `3dbirka ${name}`.replace(/[^\x20-\x7e]/g, "_").slice(0, 79);
  for (let i = 0; i < header.length; i++)
    view.setUint8(i, header.charCodeAt(i));
  view.setUint32(80, mesh.triangles, true);
  const p = mesh.positions;
  for (let t = 0; t < mesh.triangles; t++) {
    const offset = 84 + t * 50;
    const i = t * 9;
    const ax = p[i] ?? 0;
    const ay = p[i + 1] ?? 0;
    const az = p[i + 2] ?? 0;
    const ux = (p[i + 3] ?? 0) - ax;
    const uy = (p[i + 4] ?? 0) - ay;
    const uz = (p[i + 5] ?? 0) - az;
    const vx = (p[i + 6] ?? 0) - ax;
    const vy = (p[i + 7] ?? 0) - ay;
    const vz = (p[i + 8] ?? 0) - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz) || 1;
    const values = [
      nx / length,
      ny / length,
      nz / length,
      ax,
      ay,
      az,
      ax + ux,
      ay + uy,
      az + uz,
      ax + vx,
      ay + vy,
      az + vz,
    ];
    values.forEach((value, k) => {
      view.setFloat32(offset + k * 4, value, true);
    });
  }
  return buffer;
}
