import type { Font, Glyph, KerningTables, PathCommand } from "opentype.js";

export type Vec2 = [number, number];
/** Closed polygon in plate coordinates (millimetres, y up). */
type Contour = Vec2[];

export type TextStyle = {
  /** Millimetres; 0 fits the text into its zone. */
  size: number;
  lineHeight: number;
  /** Extra space between letters, in em. */
  tracking: number;
  align: "left" | "center" | "right";
};

/** Rectangle the text must stay inside: centre and size in millimetres. */
export type Zone = { x: number; y: number; width: number; height: number };

export type TextLayout = {
  fontSize: number;
  lines: number;
  /** Ink extents of the laid-out block, millimetres. */
  width: number;
  height: number;
  /** Characters the font cannot draw; they print as .notdef boxes. */
  missing: string[];
  /** The text does not fit: it is shrunk to the minimum size or cut off. */
  overflow: boolean;
  contours: Contour[];
};

/** Below this size a 0.4 mm nozzle cannot resolve letterforms. */
export const MIN_FONT_SIZE = 1.5;
const MAX_FONT_SIZE = 80;
const MAX_LINES = 3;
const CYRILLIC = /[\u0400-\u04ff]/u;

type Placed = { glyph: Glyph; cyrillic: boolean };
type Word = { glyphs: Placed[]; units: number };
/** Widths stay in font units until the size is chosen. */
type Prepared = { paragraphs: Word[][]; tracking: number; gap: number };

const tableCache = new WeakMap<Font, Map<string, KerningTables | undefined>>();
const pairCache = new WeakMap<Font, Map<string, number>>();
const outlineCache = new WeakMap<Font, Map<number, Contour[]>>();

/** Pair kerning in font units, from the GPOS tables of the pair's script. */
function kerning(font: Font, left: Placed, right: Placed): number {
  const script = left.cyrillic && right.cyrillic ? "cyrl" : "latn";
  const key = `${left.glyph.index},${right.glyph.index},${script}`;
  let pairs = pairCache.get(font);
  if (!pairs) pairCache.set(font, (pairs = new Map()));
  let value = pairs.get(key);
  if (value === undefined) {
    let tables = tableCache.get(font);
    if (!tables) tableCache.set(font, (tables = new Map()));
    if (!tables.has(script))
      tables.set(script, font.position.getKerningTables(script));
    const gpos = tables.get(script);
    value = gpos
      ? font.position.getKerningValue(gpos, left.glyph.index, right.glyph.index)
      : font.getKerningValue(left.glyph, right.glyph);
    pairs.set(key, value);
  }
  return value;
}

function prepare(font: Font, text: string, trackingEm: number): Prepared {
  // Control characters have no glyph; line breaks are handled separately.
  const clean = text
    .replace(/\r\n?/g, "\n")
    .replace(/\p{C}/gu, (char) => (char === "\n" ? char : ""))
    .replace(/\t/g, " ");
  const paragraphs: Word[][] = [];
  for (const line of clean.split("\n")) {
    const words: Word[] = [];
    for (const token of line.split(" ").filter(Boolean)) {
      const glyphs = Array.from(token, (char) => ({
        glyph: font.charToGlyph(char),
        cyrillic: CYRILLIC.test(char),
      }));
      let units = 0;
      glyphs.forEach((placed, index) => {
        const previous = glyphs[index - 1];
        if (previous) units += kerning(font, previous, placed);
        units += placed.glyph.advanceWidth;
      });
      words.push({ glyphs, units });
    }
    if (words.length) paragraphs.push(words);
  }
  return {
    paragraphs,
    tracking: trackingEm * font.unitsPerEm,
    gap: font.charToGlyph(" ").advanceWidth,
  };
}

/**
 * The single width formula, in font units: word advances and kerning, a
 * space between words, and tracking between every two neighbouring glyphs.
 * Line breaking, balancing and drawing all read it.
 */
function lineUnits(words: Word[], text: Prepared): number {
  const glyphs = words.reduce((sum, word) => sum + word.glyphs.length, 0);
  return (
    words.reduce((sum, word) => sum + word.units, 0) +
    text.gap * (words.length - 1) +
    text.tracking * (glyphs + words.length - 2)
  );
}

/** Greedy line breaking of every paragraph. */
function wrap(text: Prepared, scale: number, maxWidth: number) {
  const width = (words: Word[]) => lineUnits(words, text) * scale;
  const limit = maxWidth + 1e-6;
  const runs: { paragraph: number; words: Word[] }[] = [];
  let overflow = false;
  text.paragraphs.forEach((words, paragraph) => {
    let line: Word[] = [];
    for (const word of words) {
      if (width([word]) > limit) overflow = true;
      if (line.length && width([...line, word]) > limit) {
        runs.push({ paragraph, words: line });
        line = [];
      }
      line.push(word);
    }
    if (line.length) runs.push({ paragraph, words: line });
  });
  return { runs, overflow };
}

/**
 * Re-splits words into the given number of lines so that the widest line is
 * as narrow as possible: no line ends in a lone short word.
 */
function balance(words: Word[], lines: number, text: Prepared): Word[][] {
  const count = words.length;
  const rows = Math.min(lines, count);
  if (rows < 2) return [words];
  if (count <= rows)
    return Array.from({ length: rows }, (_, index) =>
      words.slice(
        Math.floor((index * count) / rows),
        Math.floor(((index + 1) * count) / rows),
      ),
    );
  // best[k][j]: minimax width of a k-line split of the first j words.
  const best: number[][] = [[0]];
  const from: number[][] = [];
  for (let k = 1; k <= rows; k++) {
    const row = new Array<number>(count + 1).fill(Infinity);
    const start = new Array<number>(count + 1).fill(-1);
    best[k] = row;
    from[k] = start;
    const above = best[k - 1] ?? [];
    for (let j = k; j <= count; j++)
      for (let i = k - 1; i < j; i++) {
        const widest = Math.max(
          above[i] ?? Infinity,
          lineUnits(words.slice(i, j), text),
        );
        if (widest < (row[j] ?? Infinity)) {
          row[j] = widest;
          start[j] = i;
        }
      }
  }
  const result: Word[][] = [];
  let end = count;
  for (let k = rows; k > 0; k--) {
    const begin = from[k]?.[end] ?? k - 1;
    result.unshift(words.slice(begin, end));
    end = begin;
  }
  return result;
}

const midpoint = (a: Vec2, b: Vec2): Vec2 => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
];

/** Distance from a point to the line through a and b. */
function distanceToLine(point: Vec2, a: Vec2, b: Vec2): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return (
    Math.abs(dy * (point[0] - a[0]) - dx * (point[1] - a[1])) /
    Math.max(Math.hypot(dx, dy), 1e-9)
  );
}

type Push = (point: Vec2) => void;

function flattenQuadratic(
  from: Vec2,
  control: Vec2,
  to: Vec2,
  tolerance: number,
  push: Push,
) {
  if (distanceToLine(control, from, to) <= tolerance) return push(to);
  const left = midpoint(from, control);
  const right = midpoint(control, to);
  const middle = midpoint(left, right);
  flattenQuadratic(from, left, middle, tolerance, push);
  flattenQuadratic(middle, right, to, tolerance, push);
}

function flattenCubic(
  from: Vec2,
  controlA: Vec2,
  controlB: Vec2,
  to: Vec2,
  tolerance: number,
  push: Push,
) {
  const flatness = Math.max(
    distanceToLine(controlA, from, to),
    distanceToLine(controlB, from, to),
  );
  if (flatness <= tolerance) return push(to);
  const ab = midpoint(from, controlA);
  const bc = midpoint(controlA, controlB);
  const cd = midpoint(controlB, to);
  const abc = midpoint(ab, bc);
  const bcd = midpoint(bc, cd);
  const middle = midpoint(abc, bcd);
  flattenCubic(from, ab, abc, middle, tolerance, push);
  flattenCubic(middle, bcd, cd, to, tolerance, push);
}

/** Turns opentype's path (y down, contours closed implicitly) into polygons. */
function flattenPath(commands: PathCommand[], tolerance: number): Contour[] {
  const contours: Contour[] = [];
  let current: Contour = [];
  let point: Vec2 = [0, 0];
  const push: Push = (next) => {
    const flipped: Vec2 = [next[0], -next[1]];
    const last = current.at(-1);
    if (!last || Math.hypot(last[0] - flipped[0], last[1] - flipped[1]) > 1e-7)
      current.push(flipped);
    point = next;
  };
  const close = () => {
    if (current.length >= 3) contours.push(current);
    current = [];
  };
  for (const command of commands) {
    if (command.type === "M") {
      close();
      push([command.x, command.y]);
    } else if (command.type === "L") push([command.x, command.y]);
    else if (command.type === "Z") close();
    else if (command.type === "Q")
      flattenQuadratic(
        point,
        [command.x1, command.y1],
        [command.x, command.y],
        tolerance,
        push,
      );
    else
      flattenCubic(
        point,
        [command.x1, command.y1],
        [command.x2, command.y2],
        [command.x, command.y],
        tolerance,
        push,
      );
  }
  close();
  return contours;
}

/** Glyph outlines in font units with y up, cached per font. */
function glyphContours(font: Font, glyph: Glyph): Contour[] {
  let byGlyph = outlineCache.get(font);
  if (!byGlyph) outlineCache.set(font, (byGlyph = new Map()));
  let contours = byGlyph.get(glyph.index);
  if (!contours) {
    contours = flattenPath(
      glyph.getPath(0, 0, font.unitsPerEm).commands,
      font.unitsPerEm / 600,
    );
    byGlyph.set(glyph.index, contours);
  }
  return contours;
}

/** Cap height in font units, used to centre lines optically. */
function capHeight(font: Font): number {
  const top = font
    .charToGlyph("H")
    .getPath(0, 0, font.unitsPerEm)
    .getBoundingBox().y1;
  return top < 0 ? -top : font.unitsPerEm * 0.7;
}

function missingChars(font: Font, text: string): string[] {
  const missing = new Set<string>();
  for (const char of new Set(text))
    if (char.trim() && font.charToGlyphIndex(char) === 0) missing.add(char);
  return [...missing];
}

/** A layout with nothing to print, for layers that could not be set. */
export function emptyText(): TextLayout {
  return {
    fontSize: 0,
    lines: 0,
    width: 0,
    height: 0,
    missing: [],
    overflow: false,
    contours: [],
  };
}

/**
 * Turns text into printable contours inside a zone. An automatic size (0) is
 * the largest one that fits, so a long name wraps into two bigger lines rather
 * than shrinking onto one; the lines are then balanced.
 */
export function layoutText(
  font: Font,
  text: string,
  zone: Zone,
  style: TextStyle,
): TextLayout {
  const layout = emptyText();
  layout.missing = missingChars(font, text);
  const prepared = prepare(font, text, style.tracking);
  if (
    !prepared.paragraphs.length ||
    zone.width <= 0 ||
    zone.height <= 0 ||
    style.lineHeight <= 0
  )
    return layout;

  const wrapAt = (size: number) =>
    wrap(prepared, size / font.unitsPerEm, zone.width);
  const fits = (size: number, lineLimit = MAX_LINES) => {
    const laid = wrapAt(size);
    return (
      !laid.overflow &&
      laid.runs.length <= lineLimit &&
      laid.runs.length * style.lineHeight * size <= zone.height
    );
  };
  // The largest size that fits in at most `lineLimit` lines. Line count only
  // grows with the size, so the limit can be bisected.
  const largestFit = (lineLimit: number) => {
    let low = MIN_FONT_SIZE;
    let high = Math.min(MAX_FONT_SIZE, Math.max(zone.width, zone.height));
    if (fits(high, lineLimit)) return high;
    while (high - low > 0.005) {
      const mid = (low + high) / 2;
      if (fits(mid, lineLimit)) low = mid;
      else high = mid;
    }
    return low;
  };

  let size = style.size;
  if (size <= 0) {
    const widest = largestFit(MAX_LINES);
    size = widest;
    // Fewer lines look tidier on a tag, unless the letters lose much size.
    for (let lines = 1; lines < MAX_LINES; lines++) {
      const fewer = largestFit(lines);
      if (fewer >= widest * 0.8) {
        size = fewer;
        break;
      }
    }
  }
  layout.overflow = !fits(size);
  // Text that cannot fit even at the minimum size stays visible in preview.
  if (layout.overflow && style.size <= 0) size = MIN_FONT_SIZE;

  const laid = wrapAt(size);
  // Each paragraph keeps its line count but shares its words out evenly.
  const counts = new Map<number, number>();
  for (const run of laid.runs)
    counts.set(run.paragraph, (counts.get(run.paragraph) ?? 0) + 1);
  const lines: Word[][] = [];
  prepared.paragraphs.forEach((words, paragraph) => {
    const count = counts.get(paragraph) ?? 0;
    if (!count) return;
    if (layout.overflow)
      lines.push(
        ...laid.runs
          .filter((run) => run.paragraph === paragraph)
          .map((run) => run.words),
      );
    else lines.push(...balance(words, count, prepared));
  });
  const shown = lines.slice(0, MAX_LINES);

  const scale = size / font.unitsPerEm;
  const widths = shown.map((words) => lineUnits(words, prepared) * scale);
  const cap = capHeight(font) * scale;
  const advance = style.lineHeight * size;
  const extra = prepared.tracking * scale;
  shown.forEach((words, index) => {
    const width = widths[index] ?? 0;
    const left =
      style.align === "left"
        ? zone.x - zone.width / 2
        : style.align === "right"
          ? zone.x + zone.width / 2 - width
          : zone.x - width / 2;
    // Lines are spaced on their cap height, which centres them optically.
    const baseline =
      zone.y + ((shown.length - 1) / 2 - index) * advance - cap / 2;
    let pen = left;
    words.forEach((word, wordIndex) => {
      // A space glyph sits between words, with tracking around it.
      if (wordIndex) pen += prepared.gap * scale + 2 * extra;
      word.glyphs.forEach((placed, glyphIndex) => {
        const previous = word.glyphs[glyphIndex - 1];
        if (wordIndex || glyphIndex)
          pen +=
            (glyphIndex && previous ? kerning(font, previous, placed) : 0) *
              scale +
            extra;
        for (const contour of glyphContours(font, placed.glyph))
          layout.contours.push(
            contour.map(([x, y]) => [pen + x * scale, baseline + y * scale]),
          );
        pen += placed.glyph.advanceWidth * scale;
      });
    });
  });
  layout.fontSize = size;
  layout.lines = shown.length;
  layout.width = Math.max(0, ...widths);
  layout.height = shown.length ? (shown.length - 1) * advance + cap : 0;
  return layout;
}
