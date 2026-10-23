import { rm } from "node:fs/promises";
import gulp from "gulp";
import pug from "gulp-pug";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import browserSync from "browser-sync";
import { build as esbuildBuild } from "esbuild";

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const server = browserSync.create();

const paths = {
  dist: "dist",
  pages: "src/pug/pages/*.pug",
  pug: "src/pug/**/*.pug",
  styles: "src/scss/**/*.scss",
  stylesEntry: "src/scss/main.scss",
  scripts: "src/js/**/*.js",
  scriptsEntry: "src/js/main.js",
  assets: "src/assets/**/*",
};

export const clean = () => rm(paths.dist, { recursive: true, force: true });

export const html = () =>
  src(paths.pages)
    .pipe(pug({ pretty: true }))
    .pipe(dest(paths.dist));

export const styles = () =>
  src(paths.stylesEntry, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(`${paths.dist}/css`, { sourcemaps: "." }))
    .pipe(server.stream());

export const scripts = () =>
  esbuildBuild({
    entryPoints: [paths.scriptsEntry],
    bundle: true,
    outfile: `${paths.dist}/js/main.js`,
    sourcemap: true,
    format: "esm",
  });

// encoding: false keeps binary files (fonts, images) intact in Gulp 5.
export const assets = () =>
  src(paths.assets, { encoding: false }).pipe(dest(`${paths.dist}/assets`));

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
  watch(paths.assets, series(assets, reload));
};

export const build = series(clean, parallel(html, styles, scripts, assets));

export default series(build, serve, watchFiles);
