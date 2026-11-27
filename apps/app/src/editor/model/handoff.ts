import type { ShapeId } from "~/components/3dbirka/data";
import { colorPairs } from "~/components/3dbirka/data";
import { handoffNamesSchema, type Project, projectSchema } from "./schema";
import { findTemplate } from "./templates";

/** Session storage key the storefront leaves its setup under. */
const HANDOFF_KEY = "3dbirka-editor-handoff";

export type StorefrontSetup = {
  shape: ShapeId;
  /** Index in the storefront's `colorPairs`. */
  color: number;
  /** One tag per name. */
  names: string[];
};

/**
 * A project that continues the storefront's constructor in the editor. It
 * returns null for input that is not such a setup, e.g. a stale or edited
 * storage entry.
 */
export function handoffProject(input: unknown): Project | null {
  if (typeof input !== "object" || input === null) return null;
  const { shape, color, names } = input as Partial<StorefrontSetup>;
  if (typeof shape !== "string" || typeof color !== "number") return null;
  const template = findTemplate(shape);
  const pair = colorPairs[color];
  if (!template || !pair) return null;
  const parsedNames = handoffNamesSchema.safeParse(names);
  if (!parsedNames.success) return null;
  const project = projectSchema.parse({
    ...template.project,
    colors: { body: pair.base, relief: pair.ink },
    batch: {},
  });
  project.batch.names = parsedNames.data;
  return project;
}

/** Leaves the setup for the editor to pick up on the next page. */
export function saveHandoff(setup: StorefrontSetup) {
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(setup));
  } catch {
    // Without storage the editor opens with its default template.
  }
}

/** The storefront setup once; it is consumed so a reload starts fresh. */
export function takeHandoff(): Project | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (raw === null) return null;
    window.sessionStorage.removeItem(HANDOFF_KEY);
    return handoffProject(JSON.parse(raw));
  } catch {
    return null;
  }
}
