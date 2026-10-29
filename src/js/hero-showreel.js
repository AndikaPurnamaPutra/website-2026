import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designPx } from "./design-px.js";
import { startSmoothScroll, stopSmoothScroll } from "./smooth-scroll.js";

// Hero showreel (reference from the user: manual.studio; approved proposal,
// not in Figma). On pointer devices the "Play Showreel" button follows the
// cursor over the video, which hides the system cursor, and glides back to
// the centre when the cursor leaves. A click anywhere on the showreel opens a
// pop-up: the video grows from the showreel to the centre of the screen over a
// dark backdrop and plays with sound; ×, a click on the backdrop or Esc close
// it, and it shrinks back to the showreel. While the page scrolls, the video
// grows from the first scroll until it fills the screen with the showreel
// centred, then scrolls on: no hold, no automatic steps (user decisions).
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

    // Grows to fill the screen as the page scrolls, with no hold and no
    // automatic steps: the scroll stays free and seamless (user decision,
    // reference format.obys.agency). From the very first scroll the video
    // reaches out from the showreel to the screen edges (the whole window
    // including a classic scrollbar, and 1px extra on every side so no seam
    // is left) by the time the showreel is centred on screen, then simply
    // scrolls on at that size.
    // Only transform and clip-path change (handled by the graphics card):
    // growing the video's width and height redrew the whole video every frame
    // and looked jerky on large screens (user report). The video scales
    // evenly until it covers the screen, and the clip trims the sides that
    // reach past it; the clip's corners go from 4px to square.
    let fit;
    const measure = () => {
      const box = showreel.getBoundingClientRect();
      const width = window.innerWidth + 2;
      const height = window.innerHeight + 2;
      const scale = Math.max(width / box.width, height / box.height);
      fit = {
        scale,
        shiftX: window.innerWidth / 2 - (box.left + box.width / 2),
        clipX: (box.width - width / scale) / 2,
        clipY: (box.height - height / scale) / 2,
        radius: 4 * designPx(), // --radius-sm
      };
    };
    let grown = 0;
    const grow = (progress) => {
      grown = progress;
      const scale = 1 + (fit.scale - 1) * progress;
      preview.style.transform = `translate3d(${fit.shiftX * progress}px, 0, 0) scale(${scale})`;
      preview.style.clipPath = `inset(${fit.clipY * progress}px ${fit.clipX * progress}px round ${(fit.radius * (1 - progress)) / scale}px)`;
    };
    // Measured before the trigger exists: created with the page already
    // scrolled (a reload further down), it updates at once, before its first
    // refresh, and an unmeasured fit stopped every animation after this one.
    measure();
    // Tied directly to the (already smooth) Lenis scroll, with no extra
    // delay: a delay made the video lag behind the moving showreel.
    ScrollTrigger.create({
      trigger: showreel,
      start: 0,
      end: "center center",
      onRefresh: (self) => {
        measure();
        grow(self.progress);
      },
      onUpdate: (self) => grow(self.progress),
    });
    preview.style.borderRadius = "0";
    listeners.push(() => {
      preview.style.transform = "";
      preview.style.clipPath = "";
      preview.style.borderRadius = "";
    });

    if (!finePointer) return;
    gsap.set(button, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    const toX = gsap.quickTo(button, "x", { duration: FOLLOW, ease: "power3.out" });
    const toY = gsap.quickTo(button, "y", { duration: FOLLOW, ease: "power3.out" });

    // The part of the video that shows: its box once scaled, less the sides
    // the clip trims off.
    const visible = () => {
      const box = preview.getBoundingClientRect();
      const scale = 1 + (fit.scale - 1) * grown;
      const trimX = fit.clipX * grown * scale;
      const trimY = fit.clipY * grown * scale;
      return { left: box.left + trimX, right: box.right - trimX, top: box.top + trimY, bottom: box.bottom - trimY };
    };

    // The button follows the cursor and stays inside the visible video. It
    // is also placed again while the page scrolls under a still cursor (it
    // stayed behind before and overlapped other things), and goes back to
    // the centre once the cursor is no longer over the video.
    const cursor = { x: -1, y: -1 };
    let following = false;
    const place = () => {
      const area = visible();
      const over = cursor.x >= area.left && cursor.x <= area.right && cursor.y >= area.top && cursor.y <= area.bottom;
      if (over !== following) {
        following = over;
        showreel.classList.toggle("is-following", over);
      }
      // Offsets from the showreel's centre, where the button sits at rest.
      const box = showreel.getBoundingClientRect();
      const centreX = box.left + box.width / 2;
      const centreY = box.top + box.height / 2;
      if (!over) {
        toX(0);
        toY(0);
        return;
      }
      const halfW = button.offsetWidth / 2;
      const halfH = button.offsetHeight / 2;
      toX(gsap.utils.clamp(area.left + halfW, area.right - halfW, cursor.x) - centreX);
      toY(gsap.utils.clamp(area.top + halfH, area.bottom - halfH, cursor.y) - centreY);
    };
    on(window, "pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      place();
    }, { passive: true });
    on(window, "scroll", place, { passive: true });
    on(document, "pointerout", (event) => {
      if (event.relatedTarget) return;
      cursor.x = -1;
      cursor.y = -1;
      place();
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
    stopSmoothScroll();
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
    startSmoothScroll();
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
