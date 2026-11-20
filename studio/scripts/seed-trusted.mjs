// One-time import of the current Trusted content into Sanity
// (docs/implementation/41-cms-migration.md, stage 3, step 7): the twelve
// client logos, the five testimonials (logos, avatars, quotes) and the
// section's texts, in today's order. Safe to run again (fixed ids,
// createOrReplace; Sanity keeps one copy of an identical file).
//
// Good at Numbers and Kaam Care become one SVG each (plan 41, decision 4):
// src/assets/images/testimonials/good-at-numbers.svg and kaam-care.svg,
// made from how the site drew them (a raster mark masked over #111 + vector
// text; a flipped SVG), until the designer supplies official files.
//
// Needs SANITY_WRITE_TOKEN in .env at the repo root.
// Run from the repo root:  node --env-file=.env studio/scripts/seed-trusted.mjs
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
const ROOT = new URL("../../", import.meta.url);

const upload = async (kind, path, type) => {
  const body = await readFile(new URL(path, ROOT));
  const response = await fetch(`${API}/assets/${kind}/${DATASET}?filename=${encodeURIComponent(path.split("/").pop())}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": type },
    body,
  });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`);
  const { document } = await response.json();
  console.log(`uploaded ${path} → ${document._id}`);
  return { _type: kind === "images" ? "image" : "file", asset: { _type: "reference", _ref: document._id } };
};
const svg = (path) => upload("files", path, "image/svg+xml");

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const key = (() => {
  let n = 0;
  return () => `k${(n++).toString(36)}`;
})();

// Portable text for a quote: one paragraph, links as [text](url).
const quote = (text) => {
  const children = [];
  const markDefs = [];
  let rest = text;
  for (let match; (match = rest.match(/\[([^\]]+)\]\(([^)]+)\)/)); ) {
    if (match.index) children.push({ _type: "span", _key: key(), text: rest.slice(0, match.index), marks: [] });
    const link = key();
    markDefs.push({ _type: "link", _key: link, href: match[2] });
    children.push({ _type: "span", _key: key(), text: match[1], marks: [link] });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) children.push({ _type: "span", _key: key(), text: rest, marks: [] });
  return [{ _type: "block", _key: key(), style: "normal", markDefs, children }];
};

// [name, file, height] — today's order (src/data/clients.js).
const CLIENTS = [
  ["BenQ", "benq", 34],
  ["YesWeHack", "yeswehack", 34],
  ["genasys", "genasys", 32],
  ["bunny.net", "bunny", 40],
  ["sprinter health", "sprinter", 34],
  ["Gcore", "gcore", 34],
  ["Kolleno", "kolleno", 24],
  ["medatus", "medatus", 34],
  ["PayMongo", "paymongo", 34],
  ["Renee", "renee", 32],
  ["LABEL", "label", 34],
  ["demostack", "demostack", 26],
];

const TESTIMONIALS = [
  { company: "Good at Numbers", logo: "src/assets/images/testimonials/good-at-numbers.svg", height: 24, quote: "“It’s insane work!”", name: "Jesuwin Prince", role: "Co-founder" },
  {
    company: "Riseloop",
    logo: "src/assets/images/testimonials/riseloop.svg",
    height: 20,
    quote: "“Nearly three years working with One Week Wonders on [medicalnode.ai](https://medicalnode.ai) and Riseloop has been an excellent experience. Thanks to Izet and the team, every project was a success.”",
    name: "Maker Athian",
    role: "Founder",
  },
  { company: "BOWT", logo: "src/assets/images/testimonials/bowt.svg", height: 18, noise: true, quote: "“Great project management from Izet and a dedicated team that delivered a really good result—I’ll definitely choose OWW again.”", name: "Jelmer Stelpstra", role: "Owner" },
  { company: "bunny.net", logo: "src/assets/images/testimonials/bunny-light.svg", height: 24, quote: "“It’s been a pleasure working with such a talented team over the years—thank you for turning every crazy idea into amazing graphics!”", name: "Jure Anzelj", role: "Head of Marketing" },
  { company: "Kaam Care", logo: "src/assets/images/testimonials/kaam-care.svg", height: 24, quote: "“Highly recommend working with them. They have a great communication skills and complete projects fast with excellent results.”", name: "Assad Qureshi", role: "Founder" },
];

const mutations = [];

let rank = LexoRank.min();
for (const [name, file, height] of CLIENTS) {
  rank = rank.genNext().genNext();
  mutations.push({
    createOrReplace: {
      _id: `client-${slug(name)}`,
      _type: "client",
      orderRank: rank.toString(),
      show: true,
      name,
      logo: await svg(`src/assets/images/clients/${file}.svg`),
      logoHeight: height,
    },
  });
}

rank = LexoRank.min();
for (const [i, item] of TESTIMONIALS.entries()) {
  rank = rank.genNext().genNext();
  mutations.push({
    createOrReplace: {
      _id: `testimonial-${slug(item.company)}`,
      _type: "testimonial",
      orderRank: rank.toString(),
      show: true,
      company: item.company,
      logo: await svg(item.logo),
      logoHeight: item.height,
      quote: quote(item.quote),
      name: item.name,
      role: item.role,
      avatar: await upload("images", `src/assets/images/testimonials/avatar-${i + 1}.png`, "image/png"),
      noise: Boolean(item.noise),
    },
  });
}

mutations.push({
  createOrReplace: {
    _id: "trustedSection",
    _type: "trustedSection",
    eyebrow: "( Trusted Clients )",
    heading: "Helping startups and enterprises build scalable, future-ready digital products.",
    more: "and hundred more...",
  },
});

const response = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!response.ok) throw new Error(`mutate: ${response.status} ${await response.text()}`);
console.log(`saved ${mutations.length} documents`);
