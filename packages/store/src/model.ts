import { join } from "node:path";
import type { TagCustomization } from "@acme/db";
import { layoutText } from "./layout";
export { layoutText } from "./layout";

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
