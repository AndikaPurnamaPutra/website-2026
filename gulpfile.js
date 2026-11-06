import { rm, mkdir, glob } from "node:fs/promises";
import { dirname, relative } from "node:path";
import sharp from "sharp";
import gulp from "gulp";
import pug from "gulp-pug";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import browserSync from "browser-sync";
import { build as esbuildBuild } from "esbuild";

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const server = browserSync.create();
// `gulp build` (npm run build, Vercel) makes the production site: compressed
// CSS and no source maps (AGENTS.md §15). `gulp` (development) keeps them.
const production = process.argv.includes("build");

const paths = {
  dist: "dist",
  pages: "src/pug/pages/*.pug",
  pug: "src/pug/**/*.pug",
  styles: "src/scss/**/*.scss",
  stylesEntry: "src/scss/main.scss",
  scripts: "src/js/**/*.js",
  scriptsEntry: "src/js/main.js",
  assets: "src/assets/**/*",
  // Files served from the site's root (favicon, robots.txt).
  static: "src/static/**/*",
};

export const clean = () => rm(paths.dist, { recursive: true, force: true });

export const html = () =>
  src(paths.pages)
    .pipe(pug({ pretty: true }))
    .pipe(dest(paths.dist));

export const styles = () =>
  src(paths.stylesEntry, { sourcemaps: !production })
    .pipe(sass({ style: production ? "compressed" : "expanded" }).on("error", sass.logError))
    .pipe(dest(`${paths.dist}/css`, { sourcemaps: production ? false : "." }))
    .pipe(server.stream());

export const scripts = () =>
  esbuildBuild({
    entryPoints: [paths.scriptsEntry],
    bundle: true,
    // Split so code loaded with import() (the 3D hero coin and three.js)
    // becomes its own file instead of growing main.js.
    outdir: `${paths.dist}/js`,
    splitting: true,
    minify: true,
    sourcemap: !production,
    format: "esm",
  });

// encoding: false keeps binary files (fonts, images) intact in Gulp 5.
export const assets = () =>
  src(paths.assets, { encoding: false }).pipe(dest(`${paths.dist}/assets`));

// Pictures served as WebP (AGENTS.md §15): each JPG/PNG in src/assets/images
// is written next to its copy in dist as .webp, at most 2000px on its longer
// side (the largest any picture is shown, at 2× on a 1440 screen), so the
// templates use .webp while the sources stay as delivered. PNGs that must
// stay PNG (the link preview and touch icon in images/meta) are left as they
// are.
const IMAGE_MAX = 2000;
export const images = async () => {
  for await (const file of glob("src/assets/images/**/*.{jpg,jpeg,png}")) {
    if (file.includes("/meta/")) continue;
    const out = `${paths.dist}/assets/images/${relative("src/assets/images", file).replace(/\.(jpe?g|png)$/i, ".webp")}`;
    await mkdir(dirname(out), { recursive: true });
    await sharp(file)
      .resize({ width: IMAGE_MAX, height: IMAGE_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
  }
};

export const statics = () => src(paths.static, { encoding: false }).pipe(dest(paths.dist));

const reload = (done) => {
  server.reload();
  done();
};

const serve = (done) => {
  server.init({ server: paths.dist, notify: false, open: false });
  done();
};

const watchFiles = () => {
  watch(paths.pug, series(html, reload));
  watch(paths.styles, styles);
  watch(paths.scripts, series(scripts, reload));
  watch(paths.assets, series(assets, images, reload));
  watch(paths.static, series(statics, reload));
};

export const build = series(clean, parallel(html, styles, scripts, assets, statics), images);

export default series(build, serve, watchFiles);
