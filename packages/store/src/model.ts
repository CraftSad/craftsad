import { join } from "node:path";
import type { TagCustomization } from "@acme/db";

export function layoutText(value: string, lengthMm: number, heightMm: number) {
  const words = value.trim().split(/\s+/u);
  const maxChars = Math.max(8, Math.floor((lengthMm - 12) / 5.5));
  let lines = [value.trim()];
  if (value.length > maxChars && words.length > 1) {
    let best = 1;
    for (let i = 2; i < words.length; i++)
      if (
        Math.abs(
          words.slice(0, i).join(" ").length - words.slice(i).join(" ").length,
        ) <
        Math.abs(
          words.slice(0, best).join(" ").length -
            words.slice(best).join(" ").length,
        )
      )
        best = i;
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const longest = Math.max(...lines.map((line) => [...line].length));
  const byWidth = (lengthMm - 12) / (longest * 0.62);
  const byHeight = (heightMm - 6) / (lines.length === 2 ? 2.5 : 1.3);
  if (Math.min(byWidth, byHeight) < 3)
    throw new Error(`Название сорта слишком длинное: ${value}`);
  return { lines, fontSize: Math.min(12, byWidth, byHeight) };
}

export async function generateStl(
  customization: TagCustomization,
  variety: string,
  output: string,
  templateName = "tag.scad",
) {
  const { lines, fontSize } = layoutText(
    variety,
    customization.lengthMm,
    customization.heightMm,
  );
  if (!/^[a-z0-9_-]+\.scad$/.test(templateName))
    throw new Error("Неверный шаблон OpenSCAD");
  const template = join(import.meta.dir, "scad", templateName);
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
