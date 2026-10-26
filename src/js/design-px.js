// One Figma pixel in CSS px, the same clamp as --px in _tokens.scss:
// 1× at the 1440px design width, scaled with the viewport between 1280px
// (0.889×) and 2560px (1.778×).
export const designPx = () => Math.min(Math.max(window.innerWidth, 1280), 2560) / 1440;
