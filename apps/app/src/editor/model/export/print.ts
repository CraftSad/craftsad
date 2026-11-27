import { zipSync } from "fflate";
import { type BuiltTag, buildTagAsync } from "../geometry";
import { layoutPlate } from "../plate";
import type { Project } from "../schema";
import { encodeStl } from "./stl";
import { encode3mf, type PrintItem } from "./three-mf";

export type PrintExport = {
  blob: Blob;
  filename: string;
  /** Number of tags on the bed. */
  count: number;
  /** The lettering is a separate part for a second filament. */
  twoColour: boolean;
};

/** A tag name that is safe as a file name on Windows, macOS and Linux. */
export function fileName(name: string, fallback = "birka") {
  return (
    name
      .normalize("NFC")
      .replace(/[^\p{L}\p{N}-]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || fallback
  );
}

/** Every tag of the batch: each non-empty line, repeated `copies` times. */
export function batchNames(project: Project): string[] {
  const names = project.batch.names.filter((name) => name.trim());
  return (names.length ? names : [project.title]).flatMap((name) =>
    Array.from({ length: project.batch.copies }, () => name),
  );
}

/** Body and raised lettering as one solid. */
const oneColour = (tag: BuiltTag) => tag.single ?? tag.body;

/** fflate always returns an ArrayBuffer-backed view; Blob insists on that. */
const blobPart = (data: Uint8Array) => data as Uint8Array<ArrayBuffer>;

/**
 * Builds the whole batch and packs one print file:
 * - `3mf` — a ready plate for QIDI Studio, lettering on its own extruder;
 * - `stl` — single-colour models, zipped when there are several.
 */
export async function exportPrint(
  project: Project,
  format: "3mf" | "stl",
  onProgress?: (done: number, total: number) => void,
): Promise<PrintExport> {
  const names = batchNames(project);
  // Equal names share geometry, so each is built once.
  const builds = new Map<string, BuiltTag>();
  const copies = new Map<string, number>();
  for (const name of names) copies.set(name, (copies.get(name) ?? 0) + 1);
  let done = 0;
  for (const [name, count] of copies) {
    // Yield to the browser between tags so the progress bar can animate.
    await new Promise((resolve) => setTimeout(resolve, 0));
    builds.set(name, await buildTagAsync(project.tag, name, format === "stl"));
    onProgress?.((done += count), names.length);
  }
  const first = builds.values().next().value as BuiltTag | undefined;
  if (!first) throw new Error("В партии нет ни одной бирки");

  const plate = layoutPlate(
    first.size,
    names.length,
    project.batch.gap,
    project.batch.margin,
  );
  if (names.length > plate.capacity)
    throw new Error(
      `На стол помещается ${plate.capacity} шт., а в партии ${names.length}. Уменьшите зазор, количество или печатайте в несколько заходов.`,
    );
  const base = fileName(project.title);
  const count = names.length;

  if (format === "stl") {
    const files: Record<string, Uint8Array> = {};
    names.forEach((name, index) => {
      const tag = builds.get(name);
      if (tag)
        files[`${String(index + 1).padStart(3, "0")}-${fileName(name)}.stl`] =
          new Uint8Array(encodeStl(oneColour(tag), name));
    });
    const only = count === 1 ? Object.values(files)[0] : undefined;
    return {
      blob:
        only === undefined
          ? new Blob([blobPart(zipSync(files, { level: 6 }))], {
              type: "application/zip",
            })
          : new Blob([blobPart(only)], { type: "model/stl" }),
      filename: count === 1 ? `${base}.stl` : `${base}-stl.zip`,
      count,
      twoColour: false,
    };
  }

  const twoColour = [...builds.values()].some((tag) => tag.relief);
  const items: PrintItem[] = names.map((name, index) => {
    const tag = builds.get(name) ?? first;
    const copiesSoFar = names
      .slice(0, index)
      .filter((other) => other === name).length;
    return {
      name: copiesSoFar ? `${name} (${copiesSoFar + 1})` : name,
      x: (plate.placements[index]?.x ?? 0) - tag.center.x,
      y: (plate.placements[index]?.y ?? 0) - tag.center.y,
      parts:
        twoColour && tag.relief
          ? [
              { name: "Корпус", mesh: tag.body, extruder: 1 },
              { name: "Надпись", mesh: tag.relief, extruder: 2 },
            ]
          : [{ name, mesh: oneColour(tag), extruder: 1 }],
    };
  });
  const { body, relief } = project.colors;
  return {
    blob: new Blob(
      [
        blobPart(
          encode3mf(
            items,
            twoColour
              ? [
                  { name: "Корпус", color: body },
                  { name: "Надпись", color: relief },
                ]
              : [{ name: project.title, color: body }],
            project.title,
          ),
        ),
      ],
      { type: "model/3mf" },
    ),
    filename: `${base}.3mf`,
    count,
    twoColour,
  };
}
