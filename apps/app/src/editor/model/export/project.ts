import { fontDef } from "../fonts";
import { type Project, projectSchema } from "../schema";

/** Marks the file and lets future versions recognise older ones. */
const PROJECT_FORMAT = "3dbirka-editor";

export function serializeProject(project: Project): string {
  return JSON.stringify(
    { format: PROJECT_FORMAT, version: 1, project },
    null,
    2,
  );
}

/**
 * Reads a project file. It is untrusted input: unknown fields are dropped,
 * out-of-range numbers clamped and unknown fonts replaced, so a hand-edited
 * or older file opens instead of failing.
 */
export function parseProject(text: string): Project {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Файл не является проектом 3D-редактора");
  }
  const parsed = projectSchema.safeParse(
    json && typeof json === "object" && "project" in json ? json.project : json,
  );
  if (!parsed.success)
    throw new Error("Файл не является проектом 3D-редактора");
  const project = parsed.data;
  const seen = new Set<string>();
  project.tag.layers.forEach((layer) => {
    layer.font = fontDef(layer.font).id;
    // Layer keys must stay unique for React and for the text zones.
    if (seen.has(layer.id)) layer.id = crypto.randomUUID();
    seen.add(layer.id);
  });
  return project;
}
