import { create } from "zustand";
import type { Issue } from "./model/checks";
import { batchNames } from "./model/export/print";
import type { BuiltTag } from "./model/geometry";
import type { Project } from "./model/schema";
import { defaultTemplate } from "./model/templates";

type EditorTab = "shape" | "text" | "batch";
type EditorView = "model" | "bed";
type EditorDialog = "templates" | "export" | null;

type EditorState = {
  project: Project;
  past: Project[];
  future: Project[];
  view: EditorView;
  tab: EditorTab;
  /** Whether the parameter panel is open (it is hidden on narrow screens). */
  panel: boolean;
  dialog: EditorDialog;
  /** Index of the batch line shown in the viewport. */
  active: number;
  /** Selected text layer, if any. */
  layer: string | null;
  /** The tag being shown, built from `project.tag` and the active line. */
  built: BuiltTag | null;
  building: boolean;
  issues: Issue[];
  /** Built tags of the batch for the bed view, valid only for `plateKey`. */
  plateKey: string;
  plateBuilds: Map<string, BuiltTag>;
  /**
   * Applies an edit to a copy of the project. Consecutive edits of the same
   * `group` (one slider drag) collapse into a single undo step.
   */
  update: (recipe: (draft: Project) => void, group?: string) => void;
  /** Swaps in a whole project and starts a fresh history. */
  replace: (project: Project) => void;
  undo: () => void;
  redo: () => void;
  setView: (view: EditorView) => void;
  setTab: (tab: EditorTab) => void;
  setPanel: (panel: boolean) => void;
  setDialog: (dialog: EditorDialog) => void;
  setActive: (active: number) => void;
  selectLayer: (id: string | null) => void;
  setBuilt: (built: BuiltTag, issues: Issue[]) => void;
  setFailed: (message: string) => void;
  rememberBuild: (key: string, name: string, tag: BuiltTag) => void;
};

const HISTORY = 60;
/** Edits of one group within this window form a single undo step. */
const GROUP_WINDOW = 800;
const PLATE_CACHE = 60;
let lastGroup: string | undefined;
let lastEdit = 0;

const failed = (message: string): Issue[] => [{ level: "error", message }];

const normalizeActive = (active: number, length: number) =>
  length ? ((active % length) + length) % length : 0;

export const useEditor = create<EditorState>()((set, get) => ({
  project: structuredClone(defaultTemplate.project),
  past: [],
  future: [],
  view: "model",
  tab: "shape",
  panel: true,
  dialog: null,
  active: 0,
  layer: null,
  built: null,
  building: false,
  issues: [],
  plateKey: "",
  plateBuilds: new Map(),

  update: (recipe, group) => {
    const state = get();
    const draft = structuredClone(state.project);
    recipe(draft);
    const now = Date.now();
    const joined =
      group !== undefined &&
      group === lastGroup &&
      now - lastEdit < GROUP_WINDOW;
    lastGroup = group;
    lastEdit = now;
    set({
      project: draft,
      active: normalizeActive(state.active, batchNames(draft).length),
      past: joined
        ? state.past
        : [...state.past.slice(1 - HISTORY), state.project],
      future: [],
    });
  },

  replace: (project) => {
    lastGroup = undefined;
    set({
      project,
      past: [],
      future: [],
      active: 0,
      layer: null,
      dialog: null,
      view: "model",
      tab: "shape",
    });
  },

  undo: () => {
    const { active, past, project, future } = get();
    const previous = past.at(-1);
    if (!previous) return;
    lastGroup = undefined;
    set({
      project: previous,
      active: normalizeActive(active, batchNames(previous).length),
      past: past.slice(0, -1),
      future: [project, ...future],
    });
  },

  redo: () => {
    const { active, future, project, past } = get();
    const next = future[0];
    if (!next) return;
    lastGroup = undefined;
    set({
      project: next,
      active: normalizeActive(active, batchNames(next).length),
      future: future.slice(1),
      past: [...past, project],
    });
  },

  setView: (view) => set({ view }),
  setTab: (tab) => set({ tab }),
  setPanel: (panel) => set({ panel }),
  setDialog: (dialog) => set({ dialog }),
  setActive: (active) =>
    set({ active: normalizeActive(active, batchNames(get().project).length) }),
  selectLayer: (layer) => set({ layer }),
  setBuilt: (built, issues) => set({ built, issues, building: false }),
  setFailed: (message) =>
    set({ built: null, issues: failed(message), building: false }),

  rememberBuild: (key, name, tag) => {
    const { plateKey, plateBuilds } = get();
    // Builds of another design say nothing about this one.
    const kept = plateKey === key ? plateBuilds : new Map<string, BuiltTag>();
    const next = new Map(kept);
    next.delete(name);
    next.set(name, tag);
    while (next.size > PLATE_CACHE) {
      const oldest = next.keys().next().value;
      if (oldest === undefined) break;
      next.delete(oldest);
    }
    set({ plateKey: key, plateBuilds: next });
  },
}));

/** The batch line the viewport shows, kept inside the list after edits. */
export function activeName(project: Project, active: number) {
  const names = batchNames(project);
  return names[normalizeActive(active, names.length)] ?? project.title;
}
