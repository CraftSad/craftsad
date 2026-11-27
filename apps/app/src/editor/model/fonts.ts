import { type Font, parse } from "opentype.js";
import { DEFAULT_FONT } from "./schema";

export type FontGroup = "sans" | "display" | "serif" | "hand" | "mono";

export type FontDef = {
  id: string;
  /** Shown in the font picker, next to the weight. */
  family: string;
  weight: number;
  weightLabel: string;
  group: FontGroup;
};

/** Static OFL builds from scripts/build-editor-fonts.py, in public/fonts/editor. */
export const fonts: FontDef[] = [
  {
    id: "manrope-500",
    family: "Manrope",
    weight: 500,
    weightLabel: "Средний",
    group: "sans",
  },
  {
    id: "manrope-700",
    family: "Manrope",
    weight: 700,
    weightLabel: "Жирный",
    group: "sans",
  },
  {
    id: "manrope-800",
    family: "Manrope",
    weight: 800,
    weightLabel: "Очень жирный",
    group: "sans",
  },
  {
    id: "rubik-500",
    family: "Rubik",
    weight: 500,
    weightLabel: "Средний",
    group: "sans",
  },
  {
    id: "rubik-700",
    family: "Rubik",
    weight: 700,
    weightLabel: "Жирный",
    group: "sans",
  },
  {
    id: "rubik-900",
    family: "Rubik",
    weight: 900,
    weightLabel: "Чёрный",
    group: "display",
  },
  {
    id: "montserrat-600",
    family: "Montserrat",
    weight: 600,
    weightLabel: "Полужирный",
    group: "sans",
  },
  {
    id: "montserrat-800",
    family: "Montserrat",
    weight: 800,
    weightLabel: "Очень жирный",
    group: "display",
  },
  {
    id: "montserrat-900",
    family: "Montserrat",
    weight: 900,
    weightLabel: "Чёрный",
    group: "display",
  },
  {
    id: "unbounded-400",
    family: "Unbounded",
    weight: 400,
    weightLabel: "Обычный",
    group: "display",
  },
  {
    id: "unbounded-700",
    family: "Unbounded",
    weight: 700,
    weightLabel: "Жирный",
    group: "display",
  },
  {
    id: "unbounded-900",
    family: "Unbounded",
    weight: 900,
    weightLabel: "Чёрный",
    group: "display",
  },
  {
    id: "comfortaa-400",
    family: "Comfortaa",
    weight: 400,
    weightLabel: "Обычный",
    group: "display",
  },
  {
    id: "comfortaa-700",
    family: "Comfortaa",
    weight: 700,
    weightLabel: "Жирный",
    group: "display",
  },
  {
    id: "lora-500",
    family: "Lora",
    weight: 500,
    weightLabel: "Средний",
    group: "serif",
  },
  {
    id: "lora-700",
    family: "Lora",
    weight: 700,
    weightLabel: "Жирный",
    group: "serif",
  },
  {
    id: "caveat-400",
    family: "Caveat",
    weight: 400,
    weightLabel: "Обычный",
    group: "hand",
  },
  {
    id: "caveat-700",
    family: "Caveat",
    weight: 700,
    weightLabel: "Жирный",
    group: "hand",
  },
  {
    id: "jetbrains-mono-500",
    family: "JetBrains Mono",
    weight: 500,
    weightLabel: "Средний",
    group: "mono",
  },
  {
    id: "jetbrains-mono-700",
    family: "JetBrains Mono",
    weight: 700,
    weightLabel: "Жирный",
    group: "mono",
  },
  {
    id: "pt-sans-narrow-700",
    family: "PT Sans Narrow",
    weight: 700,
    weightLabel: "Жирный",
    group: "sans",
  },
  {
    id: "russo-one-400",
    family: "Russo One",
    weight: 400,
    weightLabel: "Обычный",
    group: "display",
  },
  {
    id: "marck-script-400",
    family: "Marck Script",
    weight: 400,
    weightLabel: "Обычный",
    group: "hand",
  },
];

export const fontGroups: { id: FontGroup; label: string }[] = [
  { id: "sans", label: "Гротеск" },
  { id: "display", label: "Акцентный" },
  { id: "serif", label: "Антиква" },
  { id: "mono", label: "Моноширинный" },
  { id: "hand", label: "Рукописный" },
];

const FONT_DIR = "/fonts/editor";
/** CSS family of a font id; each file is registered once as its own family. */
export const fontFamily = (id: string) => `brk-${id}`;

export function fontDef(id: string): FontDef {
  const font =
    fonts.find((entry) => entry.id === id) ??
    fonts.find((entry) => entry.id === DEFAULT_FONT);
  if (!font) throw new Error(`Шрифт ${id} не найден`);
  return font;
}

/**
 * @font-face rules for the picker previews. The outlines come from the same
 * files through opentype.js, so the preview matches the printed letterforms.
 */
export function fontFaceCss(): string {
  return fonts
    .map(
      (font) =>
        `@font-face{font-family:${fontFamily(font.id)};font-weight:${font.weight};font-display:swap;src:url(${FONT_DIR}/${font.id}.woff) format("woff")}`,
    )
    .join("\n");
}

const loaded = new Map<string, Promise<Font>>();

export type FontReader = (id: string) => Promise<ArrayBuffer>;

let reader: FontReader = fetchFont;

/** Replaces where font files come from; tests read them from disk. */
export function setFontReader(read: FontReader) {
  loaded.clear();
  reader = read;
}

/**
 * Parses a font file for outline layout. Files are read once and shared; a
 * failed load is retried on the next call. Unknown ids fall back to the
 * default font.
 */
export function loadFont(id: string, read: FontReader = reader): Promise<Font> {
  const key = fontDef(id).id;
  let font = loaded.get(key);
  if (!font) {
    font = read(key).then(parse);
    loaded.set(key, font);
    font.catch(() => loaded.delete(key));
  }
  return font;
}

async function fetchFont(id: string): Promise<ArrayBuffer> {
  const response = await fetch(`${FONT_DIR}/${id}.woff`);
  if (!response.ok) throw new Error(`Не удалось загрузить шрифт ${id}`);
  return response.arrayBuffer();
}
