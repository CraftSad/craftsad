import { join } from "node:path";
import type { TagCustomization, TagSeries } from "@acme/db";
import { layoutText } from "./layout";

export { layoutText } from "./layout";

const MOTIF_RULES: [RegExp, string][] = [
  [/томат|помидор|черри|бычье/iu, "tomato"],
  [/огур|зозул|герман/iu, "cucumber"],
  [/перец|перц|калифорн/iu, "pepper"],
  [/баклажан/iu, "eggplant"],
  [/кабач|цуккин/iu, "zucchini"],
  [/базилик/iu, "basil"],
  [/укроп/iu, "dill"],
  [/петрушк/iu, "parsley"],
  [/клубник|земляник/iu, "strawberry"],
  [/морков|св[её]кл|редис/iu, "carrot"],
  [/салат|капуст|руккол|шпинат/iu, "lettuce"],
  [/подсолн|цвет/iu, "sunflower"],
  [/горох|фасол/iu, "pea"],
  [/тыкв/iu, "pumpkin"],
  [/розмарин/iu, "rosemary"],
  [/лаванд/iu, "lavender"],
  [/тимьян|чабрец/iu, "thyme"],
  [/мят/iu, "mint"],
  [/душиц/iu, "marjoram"],
  [/орегано/iu, "oregano"],
];

export function detectScadMotif(variety: string): string {
  for (const [pattern, motif] of MOTIF_RULES) {
    if (pattern.test(variety)) return motif;
  }
  return "basil";
}

export function resolveScadTemplate(
  series: TagSeries | undefined,
  explicitTemplate?: string | null,
): string {
  if (explicitTemplate) return explicitTemplate;
  switch (series) {
    case "slate":
      return "tag_slate.scad";
    case "kids":
      return "tag_kids.scad";
    case "provence":
      return "tag_provence.scad";
    default:
      return "tag.scad";
  }
}

export async function generateStl(
  customization: TagCustomization,
  variety: string,
  output: string,
  templateName?: string,
) {
  const resolvedTemplate = resolveScadTemplate(
    customization.series,
    templateName,
  );
  if (!/^[a-z0-9_-]+\.scad$/.test(resolvedTemplate))
    throw new Error("Неверный шаблон OpenSCAD");
  const series = customization.series ?? "classic";
  const formattedVariety =
    series === "kids" || series === "provence"
      ? variety.toUpperCase()
      : variety;
  const { lines, fontSize } = layoutText(
    formattedVariety,
    customization.lengthMm,
    customization.heightMm,
  );
  const motif = detectScadMotif(variety);
  const template = join(import.meta.dir, "scad", resolvedTemplate);
  const args = [
    "-o",
    output,
    "-D",
    `tag_length=${customization.lengthMm}`,
    "-D",
    `tag_height=${customization.heightMm}`,
    "-D",
    `tag_shape=${JSON.stringify(customization.shape)}`,
    "-D",
    `tag_motif=${JSON.stringify(motif)}`,
    "-D",
    `tag_text_1=${JSON.stringify(lines[0])}`,
    "-D",
    `tag_text_2=${JSON.stringify(lines[1] ?? "")}`,
    "-D",
    `font_size=${fontSize.toFixed(2)}`,
    "-D",
    "letter_relief=0.6",
    "-D",
    'font_name="Liberation Sans:style=Bold"',
    template,
  ];
  const child = Bun.spawn([process.env.OPENSCAD_BIN ?? "openscad", ...args], {
    stdout: "ignore",
    stderr: "pipe",
  });
  const timeout = setTimeout(() => child.kill(), 120_000);
  try {
    const [exitCode, stderr] = await Promise.all([
      child.exited,
      new Response(child.stderr).text(),
    ]);
    if (exitCode !== 0)
      throw new Error(
        `OpenSCAD завершился с кодом ${exitCode}: ${stderr.slice(-4000)}`,
      );
  } finally {
    clearTimeout(timeout);
  }
}
