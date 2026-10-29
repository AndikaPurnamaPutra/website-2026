import gsap from "gsap";

// Gradient highlight wave (reference from the user: manual.studio), used by
// the hero headline accent and the Milestone "$139M+". The text stays in its
// own colour at rest; a wave runs through it letter by letter, each letter
// lighting up in its part of the gradient (one gradient box spans the text)
// and fading back. Per-letter copies are laid over the intact text, so the
// letters keep their kerning. Styles: components/_gradient-wave.scss.
const STAGGER = 0.045; // between letters
const LIGHT = 0.15; // to the gradient
const HOLD = 0.35; // lit
const FADE = 1.2; // back to the text colour

// `element` holds one text node; `gradient` is a CSS gradient for the text.
export function createGradientWave(element, gradient) {
  const node = element.firstChild;
  element.style.setProperty("--wave-color", getComputedStyle(element).color);
  element.style.setProperty("--wave-gradient", gradient);

  const glyphs = [...node.textContent]
    .map((char, index) => ({ char, index }))
    .filter(({ char }) => char.trim())
    .map(({ char, index }) => {
      const glyph = document.createElement("span");
      glyph.className = "gradient-wave__glyph";
      glyph.setAttribute("aria-hidden", "true");
      glyph.innerHTML = `<span class="gradient-wave__text">${char}</span><span class="gradient-wave__gradient">${char}</span>`;
      glyph.dataset.index = index;
      element.append(glyph);
      return glyph;
    });
  element.classList.add("gradient-wave");

  // Letter positions in em, measured over the intact text; again once the web
  // font has loaded (a fallback font would give other positions).
  const measure = () => {
    const range = document.createRange();
    const box = element.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(element).fontSize);
    element.style.setProperty("--pw", `${box.width / em}em`);
    // Vertical offset of the copies: a line height smaller than the font's
    // text box would leave a copy at top 0 higher than the text.
    element.style.setProperty("--y", "0em");
    const textTop = glyphs[0].firstChild.getBoundingClientRect().top;
    element.style.setProperty("--y", `${(box.top - textTop) / em}em`);
    glyphs.forEach((glyph) => {
      const i = Number(glyph.dataset.index);
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      glyph.style.setProperty("--x", `${(range.getBoundingClientRect().left - box.left) / em}em`);
    });
  };
  measure();
  document.fonts?.ready.then(measure);

  // Every play starts a new wave at once and leaves the running ones going,
  // so a wave started while another is under way follows it through the
  // letters (as on manual.studio; user decision). Each letter is taken over
  // by the newest wave when it reaches it, from its current state, so
  // nothing jumps back.
  const waves = new Set();
  const play = () => {
    const wave = gsap.timeline({ onComplete: () => waves.delete(wave) });
    waves.add(wave);
    glyphs.forEach((glyph, i) => {
      const text = glyph.firstChild;
      const lit = glyph.lastChild;
      const at = i * STAGGER;
      wave.add(() => {
        gsap
          .timeline()
          .to(lit, { opacity: 1, duration: LIGHT, ease: "sine.out", overwrite: true }, 0)
          .to(text, { opacity: 0, duration: LIGHT, ease: "sine.out", overwrite: true }, 0)
          .to(lit, { opacity: 0, duration: FADE, ease: "sine.inOut" }, LIGHT + HOLD)
          .to(text, { opacity: 1, duration: FADE, ease: "sine.inOut" }, LIGHT + HOLD);
      }, at);
    });
  };

  // Index of the word (runs of non-space letters) under a pointer x, or -1.
  const wordAt = (clientX) => {
    const box = element.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(element).fontSize);
    const x = (clientX - box.left) / em;
    let word = -1;
    let previous = -2;
    for (const glyph of glyphs) {
      const index = Number(glyph.dataset.index);
      if (index !== previous + 1) word += 1;
      previous = index;
      const left = parseFloat(glyph.style.getPropertyValue("--x"));
      if (x >= left && x <= left + glyph.offsetWidth / em) return word;
    }
    return -1;
  };

  return {
    play,
    wordAt,
    destroy: () => {
      waves.forEach((wave) => wave.kill());
      glyphs.forEach((glyph) => {
        gsap.killTweensOf([glyph.firstChild, glyph.lastChild]);
        glyph.remove();
      });
      element.classList.remove("gradient-wave");
      ["--wave-color", "--wave-gradient", "--pw", "--y"].forEach((name) => element.style.removeProperty(name));
    },
  };
}
