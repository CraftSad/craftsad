import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

// Reuse the image renderer shipped with this app's Next.js installation.
const require = createRequire(
  new URL("../apps/app/package.json", import.meta.url),
);
const requireNext = createRequire(require.resolve("next/package.json"));
const sharp = requireNext("sharp");
const publicDir = new URL("../apps/app/public/", import.meta.url);
const source = await readFile(new URL("favicon.svg", publicDir));
const background = "#203e33";

async function render(size, opaque = false) {
  const pipeline = sharp(source, { density: 384 }).resize(size, size);
  if (opaque) pipeline.flatten({ background });
  return pipeline.png().toBuffer();
}

// Uncompressed BGRA frames preserve compatibility with older ICO readers.
async function icoFrame(size) {
  const pixels = await sharp(await render(size))
    .ensureAlpha()
    .raw()
    .toBuffer();
  const maskStride = Math.ceil(size / 32) * 4;
  const bitmap = Buffer.alloc(40 + size * size * 4 + maskStride * size);
  bitmap.writeUInt32LE(40, 0);
  bitmap.writeInt32LE(size, 4);
  bitmap.writeInt32LE(size * 2, 8);
  bitmap.writeUInt16LE(1, 12);
  bitmap.writeUInt16LE(32, 14);
  bitmap.writeUInt32LE(bitmap.length - 40, 20);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const from = ((size - 1 - y) * size + x) * 4;
      const to = 40 + (y * size + x) * 4;
      bitmap[to] = pixels[from + 2];
      bitmap[to + 1] = pixels[from + 1];
      bitmap[to + 2] = pixels[from];
      bitmap[to + 3] = pixels[from + 3];
      if (pixels[from + 3] === 0) {
        bitmap[40 + size * size * 4 + y * maskStride + (x >> 3)] |=
          0x80 >> (x % 8);
      }
    }
  }
  return bitmap;
}

const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(icoFrame));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (const [index, frame] of frames.entries()) {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
}
await writeFile(
  new URL("favicon.ico", publicDir),
  Buffer.concat([directory, ...frames]),
);

for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await writeFile(new URL(name, publicDir), await render(size, true));
}

// Keep the entire marker inside the maskable icon's central 80% safe circle.
const maskable = await sharp({
  create: { width: 512, height: 512, channels: 4, background },
})
  .composite([{ input: await render(384, true), gravity: "centre" }])
  .png()
  .toBuffer();
await writeFile(new URL("icon-maskable-512.png", publicDir), maskable);
console.log(
  "Generated favicon.ico, Apple touch icon, and three manifest icons.",
);
