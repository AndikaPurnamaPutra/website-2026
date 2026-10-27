import gsap from "gsap";

// Hero showreel (reference from the user: manual.studio; approved proposal,
// not in Figma). On pointer devices the "Play Showreel" button follows the
// cursor over the video, which hides the system cursor, and glides back to
// the centre when the cursor leaves. A click anywhere on the showreel opens a
// pop-up: the video grows from the showreel to the centre of the screen over a
// dark backdrop and plays with sound; ×, a click on the backdrop or Esc close
// it, and it shrinks back to the showreel. When the showreel reaches the
// middle of the screen it holds while the video grows to fill the screen over
// one screen of scrolling, holds full for half a screen, then the page
// moves on (user decision).
const FOLLOW = 0.6; // also the glide back to the centre
const OPEN = 0.5;
const CLOSE = 0.4;
const SCREEN = 0.9; // share of the screen the video may take
const SCROLL_KEYS = [" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];

export function initHeroShowreel() {
  const showreel = document.querySelector(".hero__showreel");
  const button = showreel?.querySelector(".hero__showreel-button");
  const preview = showreel?.querySelector(".hero__showreel-image");
  const lightbox = document.querySelector("[data-showreel-lightbox]");
  if (!showreel || !button || !lightbox) return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const backdrop = lightbox.querySelector(".showreel-lightbox__backdrop");
  const stage = lightbox.querySelector(".showreel-lightbox__stage");
  const video = lightbox.querySelector(".showreel-lightbox__video");
  const close = lightbox.querySelector(".showreel-lightbox__close");
  const home = lightbox.parentElement;
  const listeners = [];
  const on = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };

  // Above everything else, outside the hero's stacking.
  document.body.append(lightbox);
  showreel.classList.add("is-interactive");

  // Button follows the cursor (offset from its centred Figma position).
  const ctx = gsap.context(() => {
    if (reduceMotion) return;

    // Grows to fill the screen while held in the middle of it: the video
    // reaches out from the showreel to the screen edges (measured from the
    // showreel's own position, the whole window including a classic
    // scrollbar, and 1px extra on every side so no seam is left).
    const edge = () => {
      const box = showreel.getBoundingClientRect();
      const y = (window.innerHeight - box.height) / 2; // centred during the hold
      return { left: -box.left - 1, top: -y - 1, width: window.innerWidth + 2, height: window.innerHeight + 2 };
    };
    // One screen of scrolling to grow, then half a screen held full (user
    // decision) before the page moves on.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: showreel,
          start: "center center",
          end: "+=150%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
      .to(preview, {
        left: () => edge().left,
        top: () => edge().top,
        width: () => edge().width,
        height: () => edge().height,
        borderRadius: 0,
        duration: 1,
        ease: "power1.inOut",
      })
      .to({}, { duration: 0.5 });

    if (!finePointer) return;
    gsap.set(button, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    const toX = gsap.quickTo(button, "x", { duration: FOLLOW, ease: "power3.out" });
    const toY = gsap.quickTo(button, "y", { duration: FOLLOW, ease: "power3.out" });
    // Kept inside the video, which may have grown past the showreel box; both
    // share the same centre.
    const follow = (event) => {
      const box = preview.getBoundingClientRect();
      const halfW = button.offsetWidth / 2;
      const halfH = button.offsetHeight / 2;
      const x = gsap.utils.clamp(box.left + halfW, box.right - halfW, event.clientX);
      const y = gsap.utils.clamp(box.top + halfH, box.bottom - halfH, event.clientY);
      toX(x - (box.left + box.width / 2));
      toY(y - (box.top + box.height / 2));
    };
    on(showreel, "mouseenter", (event) => {
      showreel.classList.add("is-following");
      follow(event);
    });
    on(showreel, "mousemove", follow);
    on(showreel, "mouseleave", () => {
      showreel.classList.remove("is-following");
      toX(0);
      toY(0);
    });
  });

  // Centred box at the video's aspect ratio (3:2 for now).
  const target = () => {
    const ratio = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 3 / 2;
    const width = Math.min(window.innerWidth * SCREEN, window.innerHeight * SCREEN * ratio);
    const height = width / ratio;
    return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height };
  };
  const source = () => {
    const box = preview.getBoundingClientRect();
    return { left: box.left, top: box.top, width: box.width, height: box.height };
  };

  let open = false;
  let previewWasPlaying = false;
  let animation;

  const lockScroll = (event) => {
    if (event.type === "keydown") {
      if (event.key === "Escape") hide();
      if (event.key === "Tab") trapFocus(event);
      if (!SCROLL_KEYS.includes(event.key) || event.target === video) return;
    }
    event.preventDefault();
  };
  const trapFocus = (event) => {
    const items = [video, close];
    const index = items.indexOf(document.activeElement);
    event.preventDefault();
    items[(index + (event.shiftKey ? items.length - 1 : 1)) % items.length].focus();
  };

  const show = () => {
    if (open) return;
    open = true;
    previewWasPlaying = !preview.paused;
    preview.pause();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    window.addEventListener("wheel", lockScroll, { passive: false });
    window.addEventListener("touchmove", lockScroll, { passive: false });
    window.addEventListener("keydown", lockScroll);

    // With sound; if the browser refuses that, muted (the controls can unmute).
    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
    close.focus({ preventScroll: true });

    animation?.kill();
    gsap.set(stage, source());
    animation = gsap
      .timeline()
      .to(stage, { ...target(), duration: reduceMotion ? 0 : OPEN, ease: "power3.out" }, 0)
      .to(backdrop, { opacity: 1, duration: reduceMotion ? 0 : OPEN * 0.8, ease: "power1.out" }, 0)
      .to(close, { opacity: 1, duration: reduceMotion ? 0 : 0.3, ease: "power1.out" });
  };

  const hide = () => {
    if (!open) return;
    open = false;
    video.pause();
    window.removeEventListener("wheel", lockScroll);
    window.removeEventListener("touchmove", lockScroll);
    window.removeEventListener("keydown", lockScroll);

    animation?.kill();
    animation = gsap
      .timeline({
        onComplete: () => {
          lightbox.classList.remove("is-open");
          lightbox.setAttribute("aria-hidden", "true");
          if (previewWasPlaying) preview.play().catch(() => {});
        },
      })
      .to(close, { opacity: 0, duration: reduceMotion ? 0 : 0.15 }, 0)
      .to(stage, { ...source(), duration: reduceMotion ? 0 : CLOSE, ease: "power3.inOut" }, 0)
      .to(backdrop, { opacity: 0, duration: reduceMotion ? 0 : CLOSE, ease: "power1.inOut" }, 0);
    button.focus({ preventScroll: true });
  };

  on(showreel, "click", show);
  on(close, "click", hide);
  on(backdrop, "click", hide);
  // A resize while open keeps the video centred.
  on(window, "resize", () => {
    if (open) gsap.set(stage, target());
  });

  return () => {
    hide();
    animation?.kill();
    ctx.revert();
    listeners.forEach((remove) => remove());
    showreel.classList.remove("is-interactive", "is-following");
    gsap.set([stage, backdrop, close], { clearProps: "all" });
    home.append(lightbox);
  };
}
