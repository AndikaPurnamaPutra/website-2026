// One-time import of the Work page content from Figma into Sanity
// (docs/implementation/42-work-page.md, step 1): the formats, the projects of
// the Case Study, Live Sites and Design Showcase sections, the kind / format
// of the ten projects already there, and the page's texts and collage. Safe
// to run again (fixed ids, createOrReplace / patch; Sanity keeps one copy of
// an identical file).
//
// The homepage stays as it is: the new projects are dated before the newest
// five (Recently Added), none is switched on for Selected Work, and the drag
// order keeps the Selected Work projects in their order.
// Figma's category words map to the existing categories (UX → UI/UX,
// Graphic → Graphic Design, 3D → 2D/3D). Ealing Project ("Installation" in
// Figma) goes under Graphic Design: one project is too few for a category
// shown on the homepage (user decision).
// Live projects get no address: there is none in Figma (to fill in).
//
// Needs SANITY_WRITE_TOKEN in .env at the repo root and the folder with the
// pictures exported from Figma (file names as below).
// Run from the repo root:
//   node --env-file=.env studio/scripts/seed-work-page.mjs <pictures folder>
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LexoRank } from "lexorank";

const PROJECT = "ao8vrenr";
const DATASET = "production";
const API = `https://${PROJECT}.api.sanity.io/v2025-02-19`;
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const FOLDER = process.argv[2];
if (!TOKEN || !FOLDER) {
  console.error("Needs SANITY_WRITE_TOKEN in .env and the pictures folder as argument.");
  process.exit(1);
}

const slug = (text) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const uploaded = new Map();
const upload = async (file) => {
  if (!uploaded.has(file)) {
    const response = await fetch(`${API}/assets/images/${DATASET}?filename=${encodeURIComponent(file)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/png" },
      body: await readFile(join(FOLDER, file)),
    });
    if (!response.ok) throw new Error(`${file}: ${response.status} ${await response.text()}`);
    const { document } = await response.json();
    console.log(`uploaded ${file} → ${document._id}`);
    uploaded.set(file, document._id);
  }
  return { _type: "image", asset: { _type: "reference", _ref: uploaded.get(file) } };
};

const FORMATS = ["Landing Page", "Mobile App", "Dashboard", "Pitch Deck"];
const ref = (id) => ({ _type: "reference", _ref: id });
const categoryRef = (name) => ({ ...ref(`category-${slug(name)}`), _key: slug(name) });

// [id, title, picture, category, format, year, keywords] in Figma's order.
const CASE_STUDY = [
  ["brex", "BREX Banking Branding", "brex.png", "Branding", null, 2026, ["bank", "fintech", "finance"]],
  ["rex-panels", "REX Panels Branding", "rex-panels.png", "Branding", null, 2026, ["solar", "energy", "catalog"]],
  ["lightfield", "LIGHTFIELD | AI Platform", "lightfield.png", "Branding", null, 2026, ["ai", "saas", "tech"]],
  ["solr", "SOLR Cosmetics Packaging Design", "solr.png", "Branding", null, 2026, ["packaging", "skincare", "beauty"]],
  ["ealing", "Ealing Project", "ealing.png", "Graphic Design", null, 2026, ["exhibition", "art"]],
  ["welback", "Welback Simcard Branding", "welback.png", "Branding", null, 2026, ["telco", "mobile", "simcard"]],
  ["tottenham", "Tottenham Hotspur FC", "tottenham.png", "Branding", null, 2019, ["football", "sport"]],
  ["sourpuff", "Sourpuff - Sourdough Bakery Branding", "sourpuff.png", "Branding", null, 2026, ["bakery", "food", "packaging"]],
];
const LIVE = [
  ["continental", "Continental — Beverage Brand Website", "continental.png", "UI/UX", "Landing Page", 2026, ["drink", "beverage", "website"]],
  ["statement", "Statement. - Bike Community", "statement.png", "UI/UX", "Landing Page", 2026, ["cycling", "community", "sport"]],
  ["goobly", "Goobly - Finance Landing Page", "goobly.png", "UI/UX", "Landing Page", 2026, ["bank", "fintech", "investment"]],
  ["sustain", "Sustain - Telehealth for Personal Wellness", "sustain.png", "UI/UX", "Landing Page", 2026, ["health", "website", "wellness"]],
  ["aethere", "Aethere - Skincare Website", "aethere.png", "UI/UX", "Landing Page", 2026, ["beauty", "skincare"]],
  ["velto", "Velto - B2B Platform Website", "velto.png", "UI/UX", "Landing Page", 2026, ["saas", "sales", "ai"]],
  ["solacecare", "Solacecare - Telehealth Landing Page", "solacecare.png", "Graphic Design", "Pitch Deck", 2025, ["health", "website", "wellness"]],
  ["wellness-ecommerce", "Wellness E-commerce Website Design", "wellness-ecommerce.png", "UI/UX", "Mobile App", 2026, ["health", "shop", "ecommerce"]],
  ["sensia-live", "Sensia - Personal AI Fitness Tracker Mobile App", "sensia-live.png", "UI/UX", "Mobile App", 2026, ["health", "fitness", "ai"]],
];
const SHOWCASE = [
  ["moose", "Moosë - Skincare Landing Page", "moose.png", "UI/UX", "Landing Page", 2026, ["beauty", "skincare"]],
  ["rowfest", "Music Festival Website Design - ROWFEST", "rowfest.png", "UI/UX", "Landing Page", 2026, ["music", "event", "festival"]],
  ["xenora", "HealthTech UI Components - Xenora", "xenora.png", "UI/UX", "Dashboard", 2026, ["health", "hospital", "dashboard"]],
  ["daily-grind", "3D Motion Design - The Daily Grind & Gradient", "daily-grind.png", "2D/3D", null, 2026, ["3d", "motion", "animation"]],
  "wellmo",
  "symata",
  ["vyzn", "VYZN - Fashion Website", "vyzn.png", "UI/UX", "Landing Page", 2026, ["fashion", "website"]],
  ["outcast", "Fashion Jewelry Brand Identity - Outcast", "outcast.png", "UI/UX", "Landing Page", 2026, ["jewelry", "fashion"]],
  ["investor-pitch-deck", "Investor Pitch Deck Design 🚀", "investor-pitch-deck.png", "Graphic Design", "Pitch Deck", 2025, ["investor", "presentation", "startup"]],
  ["korvex", "Korvex.ai - AI Manufacturing Factory Mobile App", "korvex.png", "UI/UX", "Mobile App", 2026, ["ai", "factory", "industry"]],
  ["sensia", "Sensia - Personal AI Fitness Tracker Mobile App", "sensia.png", "UI/UX", "Mobile App", 2026, ["health", "fitness", "ai"]],
  ["c25", "C25 Running Event - Landing Page", "c25.png", "UI/UX", "Landing Page", 2026, ["running", "event", "sport"]],
];
// The ten projects already in Sanity: [id, kind, format, keywords].
const EXISTING = {
  "train-ticket": ["caseStudy", null, ["illustration", "train", "character"]],
  "seafood-sambal": ["caseStudy", null, ["food", "packaging"]],
  wellmo: ["showcase", "Landing Page", ["health", "website", "wellness"]],
  symata: ["showcase", "Landing Page", ["agency", "creative", "studio"]],
  kidoo: ["showcase", null, ["character", "kids", "illustration"]],
  "wellmo-2": ["showcase", "Landing Page", ["health", "website", "wellness"]],
  "beyond-boundaries": ["showcase", null, ["3d", "motion", "animation"]],
  papersky: ["showcase", "Dashboard", ["saas", "dashboard"]],
  nexadash: ["showcase", "Dashboard", ["sales", "analytics", "dashboard"]],
  chainlytics: ["showcase", "Dashboard", ["crypto", "finance", "dashboard"]],
};

// Drag order: each section in Figma's order, the existing extras after
// them. Selected Work (train-ticket, seafood-sambal, symata, kidoo,
// wellmo-2) keeps its order.
const ORDER = [
  ...CASE_STUDY.map(([id]) => id),
  "train-ticket",
  "seafood-sambal",
  ...LIVE.map(([id]) => id),
  ...SHOWCASE.map((item) => (typeof item === "string" ? item : item[0])),
  "kidoo",
  "wellmo-2",
  "beyond-boundaries",
  "papersky",
  "nexadash",
  "chainlytics",
];
let rank = LexoRank.min();
const ranks = Object.fromEntries(ORDER.map((id) => [id, (rank = rank.genNext().genNext()).toString()]));

const mutations = [];
let formatRank = LexoRank.min();
for (const title of FORMATS) {
  formatRank = formatRank.genNext().genNext();
  mutations.push({ createOrReplace: { _id: `format-${slug(title)}`, _type: "format", orderRank: formatRank.toString(), title } });
}
// Dated in the year Figma shows, before the newest five (16–20 Nov 2026).
let dayOfYear = 0;
const add = async ([id, title, picture, category, format, year, keywords], kind) => {
  dayOfYear += 1;
  mutations.push({
    createOrReplace: {
      _id: `project-${id}`,
      _type: "project",
      orderRank: ranks[id],
      title,
      slug: { _type: "slug", current: id },
      kind,
      ...(format && { format: ref(`format-${slug(format)}`) }),
      keywords,
      categories: [categoryRef(category)],
      cover: await upload(picture),
      publishedAt: new Date(Date.UTC(year, 0, 1 + dayOfYear)).toISOString().slice(0, 10),
      selected: false,
    },
  });
};
for (const item of CASE_STUDY) await add(item, "caseStudy");
for (const item of LIVE) await add(item, "live");
for (const item of SHOWCASE) if (typeof item !== "string") await add(item, "showcase");

for (const [id, [kind, format, keywords]] of Object.entries(EXISTING)) {
  mutations.push({
    patch: { id: `project-${id}`, set: { orderRank: ranks[id], kind, keywords, ...(format && { format: ref(`format-${slug(format)}`) }) } },
  });
}

// Top to bottom on the wheel as in Figma: Obsidia in the middle.
const collage = [];
for (const [k, file] of ["collage-obsidia.png", "collage-outcast.png", "collage-common.png"].entries()) {
  collage.push({ ...(await upload(file)), _key: `collage-${k}` });
}
mutations.push({
  createOrReplace: {
    _id: "workPage",
    _type: "workPage",
    headingLine1: "Most of these took a week,",
    headingLine2: "Ask us about the ones that didn’t.",
    intro: "Brands come to us with a someday: a rebrand, a launch,\na product that’s been waiting its turn.",
    collage,
    selectedTitle: "Selected Work",
    selectedText: "The work we’d hang on the wall first.",
    caseStudyTitle: "Case Study",
    liveTitle: "Live Sites",
    showcaseTitle: "Design Showcase",
    searchTitle: "What are you building?",
    searchPlaceholder: "Try “banking app”, “dashboard” or “health website”",
    suggestions: ["Banking", "SaaS Dashboard", "Tech landing page", "2D character illustration"],
    emptyText: "Yours could be the first. Try another word, or tell us about it.",
    emptyButton: "Tell us about it",
    emptyHref: "/contact",
  },
});

const response = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!response.ok) throw new Error(`mutate: ${response.status} ${await response.text()}`);
console.log(`saved ${mutations.length} documents`);
