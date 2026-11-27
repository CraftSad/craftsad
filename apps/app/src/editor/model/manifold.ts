import Module, { type ManifoldToplevel } from "manifold-3d";

export type ManifoldModule = ManifoldToplevel;

let pending: Promise<ManifoldModule> | null = null;

/**
 * The single Manifold WASM instance. It is initialised on first use (~40 ms)
 * and shared by every build and export, in the browser and in tests alike.
 */
export async function loadManifold(): Promise<ManifoldModule> {
  if (!pending) {
    pending = Module()
      .then((module) => {
        module.setup();
        return module;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}
