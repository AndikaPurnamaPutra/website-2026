import gsap from "gsap";

// Hero headline accent "Elite digital" (reference from the user: the
// highlight on manual.studio). At rest it is black like the rest of the
// headline; a wave runs through it letter by letter, each letter lighting up
// in its part of the brand gradient and fading back to black. It plays once
// shortly after load and again whenever the pointer enters the headline (if
// the previous wave has finished). Timing: slower and softer than the
// reference (user decision).
// Per-letter copies are laid over the intact text (as in the Motto section),
// so the letters keep their kerning.
const STAGGER = 0.045; // between letters
const LIGHT = 0.15; // to the gradient
const HOLD = 0.35; // lit
const FADE = 1.2; // back to black
const LOAD_DELAY = 0.8;

export function initHeroHighlight() {
  const title = document.querySelector(".hero__title");
  const accent = title?.querySelector(".hero__title-accent");
  if (!accent || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const node = accent.firstChild;
  const glyphs = [...node.textContent]
    .map((char, index) => ({ char, index }))
    .filter(({ char }) => char.trim())
    .map(({ char, index }) => {
      const glyph = document.createElement("span");
      glyph.className = "hero__glyph";
      glyph.setAttribute("aria-hidden", "true");
      glyph.innerHTML = `<span class="hero__glyph-text">${char}</span><span class="hero__glyph-gradient">${char}</span>`;
      glyph.dataset.index = index;
      accent.append(glyph);
      return glyph;
    });
  accent.classList.add("is-enhanced");

  // Letter positions in em, measured over the intact text; again once the web
  // font has loaded (a fallback font would give other positions).
  const measure = () => {
    const range = document.createRange();
    const box = accent.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(accent).fontSize);
    accent.style.setProperty("--pw", `${box.width / em}em`);
    // Vertical offset of the copies: the headline's line height is smaller
    // than the font's text box, so a copy at top 0 sits higher than the text.
    accent.style.setProperty("--y", "0em");
    const textTop = glyphs[0].firstChild.getBoundingClientRect().top;
    accent.style.setProperty("--y", `${(box.top - textTop) / em}em`);
    glyphs.forEach((glyph) => {
      const i = Number(glyph.dataset.index);
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      glyph.style.setProperty("--x", `${(range.getBoundingClientRect().left - box.left) / em}em`);
    });
  };
  measure();
  document.fonts?.ready.then(measure);

  const wave = gsap.timeline({ paused: true });
  glyphs.forEach((glyph, i) => {
    const text = glyph.firstChild;
    const gradient = glyph.lastChild;
    const at = i * STAGGER;
    wave
      .to(gradient, { opacity: 1, duration: LIGHT, ease: "sine.out" }, at)
      .to(text, { opacity: 0, duration: LIGHT, ease: "sine.out" }, at)
      .to(gradient, { opacity: 0, duration: FADE, ease: "sine.inOut" }, at + LIGHT + HOLD)
      .to(text, { opacity: 1, duration: FADE, ease: "sine.inOut" }, at + LIGHT + HOLD);
  });

  const play = () => {
    if (!wave.isActive()) wave.restart();
  };
  const onLoad = gsap.delayedCall(LOAD_DELAY, play);
  title.addEventListener("mouseenter", play);

  return () => {
    onLoad.kill();
    wave.kill();
    title.removeEventListener("mouseenter", play);
    glyphs.forEach((glyph) => glyph.remove());
    accent.classList.remove("is-enhanced");
    accent.style.removeProperty("--pw");
    accent.style.removeProperty("--y");
  };
}
