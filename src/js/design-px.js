// One Figma pixel in CSS px, the same clamp as --px in _tokens.scss:
// 1× at the 1440px design width, scaled with the viewport between 1280px
// (0.889×) and 2560px (1.778×).
export const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 2560) / 1440;

// One Figma pixel for type, the same as --type-px in _tokens.scss (rem-based:
// follows the root font size the visitor set in the browser).
export const typePx = () => {
  const w = window.innerWidth;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
  const value = Math.min(rem + (w - 1440) / 1440, rem + ((w - 1440) * 0.2) / 1120);
  return Math.min(Math.max(value, (rem * 1280) / 1440), 1.2 * rem);
};
