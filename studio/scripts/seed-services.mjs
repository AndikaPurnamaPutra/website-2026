// One-time import of the current Services content into Sanity
// (docs/implementation/41-cms-migration.md, stage 3, step 3): the five
// services from src/data/services.js with their pictures, videos and
// posters (the sources in src/assets/images/services/), and the section's
// texts. Safe to run again: documents have fixed ids (createOrReplace) and
// Sanity keeps one copy of an identical file.
//
// Needs a token with write access, kept out of git and out of chat, in a
// .env file at the repo root:  SANITY_WRITE_TOKEN=sk...
// Run from the repo root:  node --env-file=.env studio/scripts/seed-services.mjs
import { readFile } from "node:fs/promises";
import { LexoRank } from "lexorank";
import { services } from "../../src/data/services.js";

const PROJECT = "ao8vrenr";
const DATASET = "production";
const API = `https://${PROJECT}.api.sanity.io/v2025-02-19`;
const TOKEN = process.env.SANITY_WRITE_TOKEN;
if (!TOKEN) {
  console.error("SANITY_WRITE_TOKEN is missing (put it in .env at the repo root).");
  process.exit(1);
}
const SOURCES = new URL("../../src/assets/images/services/", import.meta.url);
const NOTE =
  "Visual trends evolve, but solid systems don’t age. We build clean digital products designed to scale with your business for years, not just seasons.";

const upload = async (kind, file, type) => {
  const body = await readFile(new URL(file, SOURCES));
  const response = await fetch(`${API}/assets/${kind}/${DATASET}?filename=${encodeURIComponent(file)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": type },
    body,
  });
  if (!response.ok) throw new Error(`${file}: ${response.status} ${await response.text()}`);
  const { document } = await response.json();
  console.log(`uploaded ${file} → ${document._id}`);
  return { _type: kind === "images" ? "image" : "file", asset: { _type: "reference", _ref: document._id } };
};

const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const mutations = [];
let rank = LexoRank.min(); // the drag order in the Studio (orderRank)
for (const service of services) {
  const id = `service-${slug(service.title)}`;
  const doc = {
    _id: id,
    _type: "service",
    orderRank: (rank = rank.genNext().genNext()).toString(),
    show: true,
    title: service.title,
    text: service.text,
    tags: service.tags,
    alt: service.alt,
    href: service.href === "#" ? undefined : service.href,
  };
  if (service.video) {
    doc.mediaType = "video";
    doc.video = await upload("files", `${service.video}.mp4`, "video/mp4");
    doc.poster = await upload("images", `${service.video}-poster.jpg`, "image/jpeg");
  } else {
    doc.mediaType = "image";
    doc.image = await upload("images", `${service.image}.jpg`, "image/jpeg");
  }
  mutations.push({ createOrReplace: doc });
}
mutations.push({
  createOrReplace: { _id: "servicesSection", _type: "servicesSection", eyebrow: "(What we do)", note: NOTE },
});

const response = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!response.ok) throw new Error(`mutate: ${response.status} ${await response.text()}`);
console.log(`saved ${mutations.length} documents`);
