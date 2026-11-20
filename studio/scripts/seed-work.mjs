// One-time import of the current Our Work content into Sanity
// (docs/implementation/41-cms-migration.md, stage 3, step 6): the five
// categories, the ten projects of the two carousels with their pictures, and
// the section's texts. Safe to run again (fixed ids, createOrReplace; Sanity
// keeps one copy of an identical file).
//
// Recently Added becomes automatic (the newest by date), so the five
// projects shown there get the newest dates, in today's order; the Selected
// Work ones get older dates, are switched on and come first in the drag
// order, in today's order. Their categories are a first guess from the titles
// (the site had none per project): to be checked in the Studio.
//
// Needs SANITY_WRITE_TOKEN in .env at the repo root.
// Run from the repo root:  node --env-file=.env studio/scripts/seed-work.mjs
import { readFile } from "node:fs/promises";
import { LexoRank } from "lexorank";

const PROJECT = "ao8vrenr";
const DATASET = "production";
const API = `https://${PROJECT}.api.sanity.io/v2025-02-19`;
const TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!TOKEN) {
  console.error("SANITY_WRITE_TOKEN is missing (put it in .env at the repo root).");
  process.exit(1);
}
const IMAGES = new URL("../../src/assets/images/", import.meta.url);

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const upload = async (file) => {
  const body = await readFile(new URL(file, IMAGES));
  const response = await fetch(`${API}/assets/images/${DATASET}?filename=${encodeURIComponent(file.split("/").pop())}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/jpeg" },
    body,
  });
  if (!response.ok) throw new Error(`${file}: ${response.status} ${await response.text()}`);
  const { document } = await response.json();
  console.log(`uploaded ${file} → ${document._id}`);
  return { _type: "image", asset: { _type: "reference", _ref: document._id } };
};

const CATEGORIES = ["Branding", "UI/UX", "Illustration", "2D/3D", "Graphic Design"];

// [id, title, picture, categories]
const RECENT = [
  ["wellmo", "HealthTech Website Design — WELLMO", "work/wellmo.jpg", ["UI/UX"]],
  ["beyond-boundaries", "3D Motion Design - Beyond Boundaries", "work/beyond-boundaries.jpg", ["2D/3D"]],
  ["papersky", "UI components for Papersky - SaaS Dashboard", "work/papersky.jpg", ["UI/UX"]],
  ["nexadash", "NexaDash Sales Analytics & Revenue", "work/nexadash.jpg", ["UI/UX"]],
  ["chainlytics", "Chainlytics — Crypto Market Analytics Dashboard", "work/chainlytics.jpg", ["UI/UX"]],
];
const SELECTED = [
  ["train-ticket", "Train Tricket Illustration", "services/illustration.jpg", ["Illustration"]],
  ["seafood-sambal", "Indonesian Seafood Sambal", "work/seafood-sambal.jpg", ["Branding", "Graphic Design"]],
  ["symata", "Symata - Landing Page Creative Studio", "work/symata.jpg", ["UI/UX"]],
  ["kidoo", "Kidoo - Character Design", "work/kidoo.jpg", ["Illustration"]],
  ["wellmo-2", "HealthTech Website Design — WELLMO", "work/wellmo-2.jpg", ["UI/UX"]],
];

const day = (offset) => new Date(Date.UTC(2026, 10, 20 - offset)).toISOString().slice(0, 10);
const mutations = [];

let categoryRank = LexoRank.min();
for (const title of CATEGORIES) {
  categoryRank = categoryRank.genNext().genNext();
  mutations.push({ createOrReplace: { _id: `category-${slug(title)}`, _type: "category", orderRank: categoryRank.toString(), title, slug: { _type: "slug", current: slug(title) } } });
}

let projectRank = LexoRank.min();
const project = async ([id, title, picture, categories], { date, selected }) => {
  projectRank = projectRank.genNext().genNext();
  mutations.push({
    createOrReplace: {
      _id: `project-${id}`,
      _type: "project",
      orderRank: projectRank.toString(),
      title,
      slug: { _type: "slug", current: id },
      categories: categories.map((name) => ({ _type: "reference", _ref: `category-${slug(name)}`, _key: slug(name) })),
      cover: await upload(picture),
      publishedAt: date,
      selected,
    },
  });
};
// Selected first, so the drag order starts with Selected Work's order.
for (const [k, item] of SELECTED.entries()) await project(item, { date: day(30 + k), selected: true });
for (const [k, item] of RECENT.entries()) await project(item, { date: day(k), selected: false });

mutations.push({
  createOrReplace: {
    _id: "ourWorkSection",
    _type: "ourWorkSection",
    eyebrow: "( Our Work )",
    headingLine1: "Thoughtful Design,",
    headingLine2: "Real Impact",
    recentTitle: "Recently Added",
    recentCount: 5,
    selectedTitle: "Selected Work",
  },
});

const response = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!response.ok) throw new Error(`mutate: ${response.status} ${await response.text()}`);
console.log(`saved ${mutations.length} documents`);
