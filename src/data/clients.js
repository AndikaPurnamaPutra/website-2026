// Trusted Clients (Figma Testimonials 1574:973, hover 1574:2077;
// src/components/home/TrustedClients.astro), used when the CMS has no content
// (src/data/cms.js); the CMS import (studio/scripts/seed-trusted.mjs) started
// from it. Logo sizes are Figma px (scaled via --w/--h); BenQ, PayMongo and
// LABEL use the 34px height from the hover frame (user decision, 26 Oct
// 2026). paymongo, LABEL and demostack are raster in Figma; replace them with
// designer SVGs when available. Good at Numbers and Kaam Care are one SVG each
// (plan 41, decision 4: made from how the site drew them, a masked raster mark
// + text and a flipped SVG). logo / avatar: paths under assets/images/
// without extension. quote: HTML (a link in one of them).
const link = (href, text) => `<a class="testimonial-card__link" href="${href}" target="_blank" rel="noopener">${text}</a>`;

export const trusted = {
  eyebrow: "( Trusted Clients )",
  heading: "Helping startups and enterprises build scalable, future-ready digital products.",
  more: "and hundred more...",
  clients: [
    { name: "BenQ", logo: "clients/benq", w: 113.574, h: 34 },
    { name: "YesWeHack", logo: "clients/yeswehack", w: 157.717, h: 34 },
    { name: "genasys", logo: "clients/genasys", w: 162, h: 32 },
    { name: "bunny.net", logo: "clients/bunny", w: 134.734, h: 40 },
    { name: "sprinter health", logo: "clients/sprinter", w: 137.903, h: 34 },
    { name: "Gcore", logo: "clients/gcore", w: 136.16, h: 34 },
    { name: "Kolleno", logo: "clients/kolleno", w: 135.429, h: 24 },
    { name: "medatus", logo: "clients/medatus", w: 141.667, h: 34 },
    { name: "PayMongo", logo: "clients/paymongo", w: 196.154, h: 34 },
    { name: "Renee", logo: "clients/renee", w: 130, h: 32 },
    { name: "LABEL", logo: "clients/label", w: 178.5, h: 34 },
    { name: "demostack", logo: "clients/demostack", w: 173.632, h: 26 },
  ].map((client) => ({ ...client, href: "#" })),
  testimonials: [
    { company: "Good at Numbers", logo: "testimonials/good-at-numbers", w: 142.958, h: 24, quote: "“It’s insane work!”", name: "Jesuwin Prince", role: "Co-founder", avatar: "testimonials/avatar-1" },
    { company: "Riseloop", logo: "testimonials/riseloop", w: 95.616, h: 20, quote: `“Nearly three years working with One Week Wonders on ${link("https://medicalnode.ai", "medicalnode.ai")} and Riseloop has been an excellent experience. Thanks to Izet and the team, every project was a success.”`, name: "Maker Athian", role: "Founder", avatar: "testimonials/avatar-2" },
    { company: "BOWT", noise: true, logo: "testimonials/bowt", w: 77.365, h: 18, quote: "“Great project management from Izet and a dedicated team that delivered a really good result—I’ll definitely choose OWW again.”", name: "Jelmer Stelpstra", role: "Owner", avatar: "testimonials/avatar-3" },
    { company: "bunny.net", logo: "testimonials/bunny-light", w: 80.841, h: 24, quote: "“It’s been a pleasure working with such a talented team over the years—thank you for turning every crazy idea into amazing graphics!”", name: "Jure Anzelj", role: "Head of Marketing", avatar: "testimonials/avatar-4" },
    { company: "Kaam Care", logo: "testimonials/kaam-care", w: 53.615, h: 24, quote: "“Highly recommend working with them. They have a great communication skills and complete projects fast with excellent results.”", name: "Assad Qureshi", role: "Founder", avatar: "testimonials/avatar-5" },
  ],
};
