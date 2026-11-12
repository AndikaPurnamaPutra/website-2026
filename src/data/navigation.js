import { socialLinks, contactLinks } from "./site-links.js";

// "Career" replaced by "Contact" (user decision).
export const navLinks = [
  ["About", "about.html"],
  ["Team", "#"],
  ["Services", "#"],
  ["Contact", "contact.html"],
];

// Work mega menu (Figma "Dropdown - Expand" 1596:442; src/js/work-menu.js).
// Links are placeholders until the work pages exist. Card set 1 uses the
// Figma pictures, sets 2-4 the Our Work pictures (user decision).
export const workCategories = [
  ["Case Study", 28],
  ["Live Development", 20],
  ["Design Showcase", 28],
];

export const workSets = [
  ["menu/project-1.webp", "menu/project-2.webp", "menu/project-3.webp"],
  ["work/wellmo.webp", "work/papersky.webp", "work/chainlytics.webp"],
  ["work/nexadash.webp", "work/symata.webp", "work/kidoo.webp"],
  ["work/seafood-sambal.webp", "work/beyond-boundaries.webp", "work/wellmo-2.webp"],
];

// Footer columns. "Career" replaced by "Contact" (user decision).
export const footerColumns = [
  { title: "Social media", links: socialLinks },
  {
    title: "Navigation",
    links: [
      ["Works", "#"],
      ["About", "about.html"],
      ["Team", "#"],
      ["Services", "#"],
      ["Contact", "contact.html"],
      ["Blog", "#"],
    ],
  },
  { title: "Contact", links: contactLinks },
];

// "Terms & Conditions" renamed and "Legal" removed (user decision).
export const legalLinks = [
  ["Privacy Policy", "privacy-policy.html"],
  ["Terms of Service", "terms-of-service.html"],
];
