// Types for the library imports of the 3D editor. opentype.js ships without
// declarations, so only the API the editor relies on is described.
declare module "opentype.js" {
  export type PathCommand =
    | { type: "M"; x: number; y: number }
    | { type: "L"; x: number; y: number }
    | { type: "Z"; x: number; y: number }
    | {
        type: "Q";
        x: number;
        y: number;
        x1: number;
        y1: number;
      }
    | {
        type: "C";
        x: number;
        y: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };

  export class Path {
    commands: PathCommand[];
    getBoundingBox(): BoundingBox;
  }

  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export class Glyph {
    readonly index: number;
    readonly advanceWidth: number;
    getPath(
      x?: number,
      y?: number,
      fontSize?: number,
      options?: LayoutOptions,
      font?: Font,
    ): Path;
  }

  export interface LayoutOptions {
    kerning?: boolean;
    script?: string;
    language?: string;
    letterSpacing?: number;
    tracking?: number;
    features?: Record<string, boolean>;
  }

  /** Kerning lookups of one script, as returned by `position.getKerningTables`. */
  export type KerningTables = unknown[];

  export class Font {
    readonly unitsPerEm: number;
    readonly ascender: number;
    readonly descender: number;
    readonly numGlyphs: number;
    readonly glyphs: { get(index: number): Glyph | undefined };
    readonly position: {
      getKerningTables(
        script: string,
        language?: string,
      ): KerningTables | undefined;
      getKerningValue(
        tables: KerningTables,
        leftIndex: number,
        rightIndex: number,
      ): number;
    };
    charToGlyphIndex(character: string): number;
    charToGlyph(character: string): Glyph;
    /** Pair kerning from the legacy `kern` table, in font units. */
    getKerningValue(left: Glyph | number, right: Glyph | number): number;
    getEnglishName(name: string): string | undefined;
    getPath(
      text: string,
      x?: number,
      y?: number,
      fontSize?: number,
      options?: LayoutOptions,
    ): Path;
  }

  /** Parses a TTF, OTF or WOFF buffer. WOFF2 is not supported. */
  export function parse(buffer: ArrayBuffer): Font;
}
