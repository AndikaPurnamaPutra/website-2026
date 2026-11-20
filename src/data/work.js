// Our Work (src/components/home/OurWork.astro), used when the CMS has no
// content (src/data/cms.js); the CMS import (studio/scripts/seed-work.mjs)
// started from it. Captions are written exactly as in Figma (user decision,
// 23 Oct 2026). image: a path under assets/images/ without extension. Each
// card is one 4:3 frame filled by the picture (plan 41, decision 1; Figma's
// per-card crops removed).
export const ourWork = {
  eyebrow: "( Our Work )",
  heading: ["Thoughtful Design,", "Real Impact"],
  categories: ["Branding", "UI/UX", "Illustration", "2D/3D", "Graphic Design"],
  recentTitle: "Recently Added",
  recent: [
    { title: "HealthTech Website Design — WELLMO", image: "work/wellmo" },
    { title: "3D Motion Design - Beyond Boundaries", image: "work/beyond-boundaries" },
    { title: "UI components for Papersky - SaaS Dashboard", image: "work/papersky" },
    { title: "NexaDash Sales Analytics & Revenue", image: "work/nexadash" },
    { title: "Chainlytics — Crypto Market Analytics Dashboard", image: "work/chainlytics" },
  ],
  selectedTitle: "Selected Work",
  selected: [
    { title: "Train Tricket Illustration", image: "services/illustration" },
    { title: "Indonesian Seafood Sambal", image: "work/seafood-sambal" },
    { title: "Symata - Landing Page Creative Studio", image: "work/symata" },
    { title: "Kidoo - Character Design", image: "work/kidoo" },
    { title: "HealthTech Website Design — WELLMO", image: "work/wellmo-2" },
  ],
  moreWorkHref: "#",
};
