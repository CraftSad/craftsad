import { type Font, parse } from "opentype.js";

/** The published editor fonts, for tests that run on disk. */
const FONT_DIR = new URL("../../../public/fonts/editor/", import.meta.url);

/** Raw bytes of a published font file. */
export function fontFile(id: string): Promise<ArrayBuffer> {
  return Bun.file(new URL(`${id}.woff`, FONT_DIR)).arrayBuffer();
}

const cache = new Map<string, Promise<Font>>();

/** Parsed font for outline layout. */
export function readFont(id: string): Promise<Font> {
  let font = cache.get(id);
  if (!font) {
    font = fontFile(id).then(parse);
    cache.set(id, font);
    // A failed read must not be remembered.
    font.catch(() => cache.delete(id));
  }
  return font;
}
