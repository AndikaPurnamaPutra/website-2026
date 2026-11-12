// Our Work (src/components/home/OurWork.astro). Captions are written exactly
// as in Figma (user decision, 23 Oct 2026). crop: the image box in Figma px,
// centered in the 325x244 frame and shifted by x/y; inner: an extra crop
// inside that box (Figma "fill" offsets).
export const categories = ["Branding", "UI/UX", "Illustration", "2D/3D", "Graphic Design"];

export const recentlyAdded = [
  { title: "HealthTech Website Design — WELLMO", image: "assets/images/work/wellmo.webp", crop: { w: 388, h: 246, x: 0.5, y: 0 } },
  { title: "3D Motion Design - Beyond Boundaries", image: "assets/images/work/beyond-boundaries.webp", crop: { w: 388, h: 246, x: 0.5, y: 0 }, inner: "width: 90.62%; height: 107.19%; left: 4.69%; top: -4.35%;" },
  { title: "UI components for Papersky - SaaS Dashboard", image: "assets/images/work/papersky.webp", crop: { w: 456, h: 342, x: 53.5, y: 0 } },
  { title: "NexaDash Sales Analytics & Revenue", image: "assets/images/work/nexadash.webp", crop: { w: 388, h: 246, x: -12.5, y: 0 } },
  { title: "Chainlytics — Crypto Market Analytics Dashboard", image: "assets/images/work/chainlytics.webp", crop: { w: 340, h: 255, x: 0.5, y: 0.5 } }
];

export const selectedWork = [
  { title: "Train Tricket Illustration", image: "assets/images/services/illustration.webp", crop: { w: 324, h: 302, x: 0.5, y: 0, round: true } },
  { title: "Indonesian Seafood Sambal", image: "assets/images/work/seafood-sambal.webp", crop: { w: 356, h: 267, x: -0.5, y: 0.5 } },
  { title: "Symata - Landing Page Creative Studio", image: "assets/images/work/symata.webp", crop: { w: 324, h: 243, x: 0.5, y: 0.5 } },
  { title: "Kidoo - Character Design", image: "assets/images/work/kidoo.webp", crop: { w: 344, h: 258, x: 0.5, y: -0.25 } },
  { title: "HealthTech Website Design — WELLMO", image: "assets/images/work/wellmo-2.webp", crop: { w: 348, h: 261, x: 0.5, y: 0.5 } }
];
