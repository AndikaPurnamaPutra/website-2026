// Pictures for the site (AGENTS.md §15), run before `astro dev` and
// `astro build`: every file in src/assets/images is written to
// public/assets/images at the same path. JPG/PNG are converted to WebP, at
// most IMAGE_MAX px on their longer side (the largest any picture is shown,
// at 2× on a 1440 screen); the templates use the .webp. The originals are
// copied too (a few PNGs are used as they are: the link preview and touch
// icon, the Good at Numbers mark, two small avatars). Other files (SVG, MP4)
// are copied as they are. A file already up to date is skipped.
import { glob, mkdir, copyFile, stat } from "node:fs/promises";
import { dirname, relative } from "node:path";
import sharp from "sharp";

const SRC = "src/assets/images";
const OUT = "public/assets/images";
const IMAGE_MAX = 2000;
// Smaller copies for srcset (name-<width>.webp), where a large picture is
// shown much smaller on phones (Lighthouse, 12 Nov 2026).
const IMAGE_WIDTHS = {
  "about/team.jpg": [800, 1400],
  // Services pictures: full width on phones and tablets.
  "services/illustration.jpg": [800],
  "services/ui-ux.jpg": [800],
  "services/ai-web.jpg": [800],
};
// Pictures that Figma stretches into a box of another shape (no
// object-fit): written in that shape, so the browser has nothing to stretch
// (the same look). The coin: 1024 × 576 into 448 × 420.
const IMAGE_STRETCH = { "hero/coin.png": [1024, 960] };

const newer = async (from, to) => {
  try {
    return (await stat(from)).mtimeMs > (await stat(to)).mtimeMs;
  } catch {
    return true;
  }
};

let written = 0;
for await (const file of glob(`${SRC}/**/*.*`)) {
  const name = relative(SRC, file);
  const out = `${OUT}/${name}`;
  await mkdir(dirname(out), { recursive: true });
  if (await newer(file, out)) {
    await copyFile(file, out);
    written++;
  }
  if (!/\.(jpe?g|png)$/i.test(name) || name.startsWith("meta/")) continue;
  const webp = out.replace(/\.(jpe?g|png)$/i, ".webp");
  if (!(await newer(file, webp))) continue;
  const stretch = IMAGE_STRETCH[name];
  await sharp(file)
    .resize(
      stretch
        ? { width: stretch[0], height: stretch[1], fit: "fill" }
        : { width: IMAGE_MAX, height: IMAGE_MAX, fit: "inside", withoutEnlargement: true },
    )
    .webp({ quality: 80 })
    .toFile(webp);
  for (const width of IMAGE_WIDTHS[name] ?? []) {
    await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webp.replace(/\.webp$/, `-${width}.webp`));
  }
  written++;
}
console.log(`images: ${written} written`);
