import { socialLinks, contactLinks } from "./site-links.js";

// "Career" replaced by "Contact" (user decision).
export const navLinks = [
  ["About", "/about"],
  ["Team", "#"],
  ["Services", "#"],
  ["Contact", "/contact"],
];

// Work mega menu (Figma "Dropdown - Expand" 1596:442; src/js/work-menu.js).
// Its kinds and numbers come from the CMS (src/components/Header.astro).
// Card set 1 uses the Figma pictures, sets 2-4 the Our Work pictures (user
// decision); the cards open the Work page.
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
      ["Works", "/work"],
      ["About", "/about"],
      ["Team", "#"],
      ["Services", "#"],
      ["Contact", "/contact"],
      ["Blog", "#"],
    ],
  },
  { title: "Contact", links: contactLinks },
];

// "Terms & Conditions" renamed and "Legal" removed (user decision).
export const legalLinks = [
  ["Privacy Policy", "/privacy-policy"],
  ["Terms of Service", "/terms-of-service"],
];
