// Content from the CMS (Sanity; docs/implementation/41-cms-migration.md,
// stage 3), run before scripts/images.mjs and `astro dev` / `astro build`.
// Reads the published content over HTTP (the dataset is public: no token, no
// Sanity package in the website), writes it to src/data/cms/*.json and
// downloads its pictures (as PNG, see download) and videos to src/assets/images/cms/,
// where scripts/images.mjs turns them into WebP like every other picture. The
// site serves them itself: nothing is loaded from Sanity by visitors.
//
// Never fails the build: when Sanity cannot be reached, the last content
// written stays; with none, src/data/cms.js falls back to src/data/*.js.
import { mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";

const PROJECT = "ao8vrenr";
const DATASET = "production";
// The live API, not the CDN (apicdn): the CDN can serve content from before
// the last Publish for a while, and a build right after Publish must see it.
const API = `https://${PROJECT}.api.sanity.io/v2025-02-19/data/query/${DATASET}`;
const DATA = "src/data/cms";
const MEDIA = "src/assets/images/cms";

// Services: every published one not hidden ("Tampilkan di homepage" off),
// in the order dragged in the Studio (orderRank), at most 7 (the section's
// layout is checked up to 7, plan 41). Our Work: the first 6 categories
// (drag order; more do not fit beside the heading); Recently Added the
// newest projects by date (the section says how many, 5–8); Selected Work
// the projects switched on, in drag order, at most 10. Drafts are not
// published content, so the public API never returns them.
const PROJECT_FIELDS = `title, "slug": slug.current, "cover": cover{ hotspot, "url": asset->url, "id": asset->_id }`;
// Trusted: logos (first 20) and testimonials (first 8), each published and
// not switched off, in drag order.
const QUERY = `{
  "services": *[_id == "servicesSection"][0]{
    eyebrow, note,
    "services": *[_type == "service" && show != false] | order(orderRank) [0...7] {
      title, text, tags, alt, href, mediaType,
      "image": image{ hotspot, "url": asset->url, "id": asset->_id },
      "video": video{ "url": asset->url, "id": asset->_id },
      "poster": poster{ "url": asset->url, "id": asset->_id }
    }
  },
  "work": *[_id == "ourWorkSection"][0]{
    eyebrow, headingLine1, headingLine2, recentTitle, recentCount, selectedTitle, moreWorkHref,
    "categories": *[_type == "category"] | order(orderRank) [0...6].title,
    "recent": *[_type == "project" && defined(cover.asset)] | order(publishedAt desc, _createdAt desc) [0...8] { ${PROJECT_FIELDS} },
    "selected": *[_type == "project" && selected == true && defined(cover.asset)] | order(orderRank) [0...10] { ${PROJECT_FIELDS} }
  },
  "workPage": *[_id == "workPage"][0]{
    headingLine1, headingLine2, intro, searchTitle, searchPlaceholder, suggestions,
    selectedTitle, selectedText, caseStudyTitle, liveTitle, showcaseTitle, emptyText, emptyButton, emptyHref,
    "collage": collage[defined(asset)]{ hotspot, "url": asset->url, "id": asset->_id },
    "projects": *[_type == "project" && defined(kind) && defined(cover.asset)] | order(orderRank) {
      ${PROJECT_FIELDS}, kind, liveUrl, keywords, selected, publishedAt,
      "categories": categories[]->title, "format": format->title
    }
  },
  "trusted": *[_id == "trustedSection"][0]{
    eyebrow, heading, more,
    "clients": *[_type == "client" && show != false && defined(logo.asset)] | order(orderRank) [0...20] {
      name, logoHeight, href, "logo": logo{ "url": asset->url, "id": asset->_id }
    },
    "testimonials": *[_type == "testimonial" && show != false && defined(logo.asset) && defined(avatar.asset)] | order(orderRank) [0...8] {
      company, logoHeight, quote, name, role, noise,
      "logo": logo{ "url": asset->url, "id": asset->_id },
      "avatar": avatar{ hotspot, "url": asset->url, "id": asset->_id }
    }
  }
}`;

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

// Which asset each downloaded file holds, so an unchanged one is not fetched
// again (and keeps its date, so images.mjs skips it too).
const MANIFEST = `${DATA}/media.json`;
const manifest = JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));

// Pictures are fetched as PNG: Sanity's CDN keeps the original but serves a
// JPG re-saved at lower quality and without its colour profile; PNG gives
// back exactly the original's pixels (checked: same WebP as before the CMS).
const used = new Set();
const download = async (asset, file) => {
  used.add(file);
  const path = `${MEDIA}/${file}`;
  if (manifest[file] === asset.id && (await exists(path))) return;
  const url = file.endsWith(".png") ? `${asset.url}?fm=png` : asset.url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  manifest[file] = asset.id;
  console.log(`cms: downloaded ${file}`);
};

// A picture's focus point (Studio hotspot) as object-position; none when it
// is the middle (the default), so an untouched picture renders as before.
const focus = (hotspot) => {
  if (!hotspot) return undefined;
  const x = Math.round(hotspot.x * 100);
  const y = Math.round(hotspot.y * 100);
  return x === 50 && y === 50 ? undefined : `${x}% ${y}%`;
};

const services = async (section) => {
  const items = [];
  for (const service of section.services ?? []) {
    if (!service) continue; // a reference to a deleted service
    const name = `services/${slugify(service.title)}`;
    const item = {
      title: service.title,
      href: service.href || "#",
      alt: service.alt,
      tags: service.tags ?? [],
      text: service.text,
    };
    if (service.mediaType === "video" && service.video?.url && service.poster?.url) {
      await download(service.video, `${name}.mp4`);
      await download(service.poster, `${name}-poster.png`);
      item.video = `cms/${name}`;
    } else if (service.image?.url) {
      await download(service.image, `${name}.png`);
      item.image = `cms/${name}`;
      item.focus = focus(service.image.hotspot);
    } else {
      continue; // no media yet: left out rather than shown broken
    }
    items.push(item);
  }
  return { eyebrow: section.eyebrow, note: section.note, services: items };
};

const projects = async (items) => {
  const cards = [];
  for (const project of items ?? []) {
    const name = `work/${project.slug || slugify(project.title)}`;
    await download(project.cover, `${name}.png`);
    cards.push({ title: project.title, image: `cms/${name}`, focus: focus(project.cover.hotspot) });
  }
  return cards;
};

const work = async (section) => ({
  eyebrow: section.eyebrow,
  heading: [section.headingLine1, section.headingLine2],
  categories: section.categories ?? [],
  recentTitle: section.recentTitle,
  recent: await projects((section.recent ?? []).slice(0, Math.min(8, Math.max(5, section.recentCount ?? 5)))),
  selectedTitle: section.selectedTitle,
  selected: await projects(section.selected),
  moreWorkHref: section.moreWorkHref || "#",
});

// A logo's width at the height set in the Studio, from the SVG's own
// proportions (viewBox, else width/height).
const logoWidth = async (file, height) => {
  const svg = await readFile(`${MEDIA}/${file}`, "utf8");
  const tag = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const box = tag.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  const [w, h] = box ? [box[1], box[2]] : [tag.match(/width="([\d.]+)/)?.[1], tag.match(/height="([\d.]+)/)?.[1]];
  return w && h ? Math.round((height * w * 1000) / h) / 1000 : height;
};

// A quote's portable text as HTML: one paragraph, links only.
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const quoteHtml = (blocks) =>
  (blocks ?? [])
    .map((block) =>
      (block.children ?? [])
        .map((span) => {
          const link = (block.markDefs ?? []).find((def) => def._type === "link" && span.marks?.includes(def._key));
          const text = escape(span.text ?? "");
          return link?.href ? `<a class="testimonial-card__link" href="${escape(link.href)}" target="_blank" rel="noopener">${text}</a>` : text;
        })
        .join(""),
    )
    .join(" ");

const trusted = async (section) => {
  const clients = [];
  for (const client of section.clients ?? []) {
    const name = `clients/${slugify(client.name)}`;
    await download(client.logo, `${name}.svg`);
    clients.push({ name: client.name, logo: `cms/${name}`, w: await logoWidth(`${name}.svg`, client.logoHeight), h: client.logoHeight, href: client.href || "#" });
  }
  const testimonials = [];
  for (const item of section.testimonials ?? []) {
    const name = `testimonials/${slugify(item.company)}`;
    await download(item.logo, `${name}.svg`);
    await download(item.avatar, `${name}-avatar.png`);
    testimonials.push({
      company: item.company,
      logo: `cms/${name}`,
      w: await logoWidth(`${name}.svg`, item.logoHeight),
      h: item.logoHeight,
      quote: quoteHtml(item.quote),
      name: item.name,
      role: item.role,
      avatar: `cms/${name}-avatar`,
      avatarFocus: focus(item.avatar.hotspot),
      noise: Boolean(item.noise),
    });
  }
  return { eyebrow: section.eyebrow, heading: section.heading, more: section.more, clients, testimonials };
};

// Work page (/work, docs/implementation/42-work-page.md): its texts, the
// hero's collage pictures and every project with a kind, in drag order (the
// sections and the search take theirs from it). A card's line: first
// category · format · year. Covers share the homepage's files (work/<slug>).
const workProject = async (project) => {
  const name = `work/${project.slug || slugify(project.title)}`;
  await download(project.cover, `${name}.png`);
  return {
    title: project.title,
    slug: project.slug,
    kind: project.kind,
    href: project.kind === "live" && project.liveUrl ? project.liveUrl : null,
    meta: [project.categories?.[0], project.format, project.publishedAt?.slice(0, 4)].filter(Boolean),
    categories: project.categories ?? [],
    format: project.format ?? null,
    keywords: project.keywords ?? [],
    selected: Boolean(project.selected),
    image: `cms/${name}`,
    focus: focus(project.cover.hotspot),
  };
};

const workPage = async (page) => {
  const collage = [];
  for (const [k, picture] of (page.collage ?? []).entries()) {
    const name = `work-page/collage-${k + 1}`;
    await download(picture, `${name}.png`);
    collage.push({ image: `cms/${name}`, focus: focus(picture.hotspot) });
  }
  return {
    heading: [page.headingLine1, page.headingLine2],
    intro: page.intro,
    searchTitle: page.searchTitle,
    searchPlaceholder: page.searchPlaceholder,
    suggestions: page.suggestions ?? [],
    collage,
    selectedTitle: page.selectedTitle,
    selectedText: page.selectedText,
    // Section titles by kind (also the tabs' and the list's words).
    kinds: { caseStudy: page.caseStudyTitle, live: page.liveTitle, showcase: page.showcaseTitle },
    // Search with no result.
    empty: { text: page.emptyText, button: page.emptyButton, href: page.emptyHref || "/contact" },
    projects: await Promise.all((page.projects ?? []).map(workProject)),
  };
};

// Each section's file, or none (src/data/cms.js then uses src/data/*.js).
const write = async (name, section, build) => {
  if (section) {
    await writeFile(`${DATA}/${name}.json`, `${JSON.stringify(await build(section), null, 2)}\n`);
    console.log(`cms: ${name} written`);
  } else {
    await rm(`${DATA}/${name}.json`, { force: true });
    console.log(`cms: no ${name} section in Sanity, using the content in src/data/`);
  }
};

// Files of services or projects removed (or changed to another media type)
// in the Studio: deleted here and their copies made by scripts/images.mjs in
// public/, so they are not deployed.
const prune = async () => {
  for (const file of Object.keys(manifest)) {
    if (used.has(file)) continue;
    const base = file.replace(/\.[^.]+$/, "");
    const copies = [file, `${base}.webp`, `${base}-800.webp`];
    await Promise.all([rm(`${MEDIA}/${file}`, { force: true }), ...copies.map((copy) => rm(`public/assets/images/cms/${copy}`, { force: true }))]);
    delete manifest[file];
    console.log(`cms: removed ${file}`);
  }
};

try {
  const response = await fetch(`${API}?query=${encodeURIComponent(QUERY)}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const { result } = await response.json();
  await mkdir(DATA, { recursive: true });
  await write("services", result.services, services);
  await write("work", result.work, work);
  await write("trusted", result.trusted, trusted);
  await write("work-page", result.workPage, workPage);
  await prune();
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
} catch (error) {
  console.warn(`cms: Sanity not reached (${error.message}); keeping the last content`);
}
