import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

// The 3D coin, choreographed with the scroll (approved concept, references:
// thewatch.60fps.fr, drone.riotters.com, sstr.tech): one coin on a fixed
// layer behind the page content, shown in the hero and the footer only. It
// only ever travels down; only the scroll turns it, slowly (user decision):
// - Hero: on load it comes down from above, growing from small to its size
//   with half a flip slowing to a stop, and rests in its Figma place and size
//   (the hero coin picture: its lower part behind the showreel; user
//   decision). Scrolling, the scroll turns it over (half a flip) as it goes
//   down behind the showreel and fades out.
// - Footer: as the footer is uncovered (src/js/footer-reveal.js), the coin
//   comes down from above, from behind Motto, and rests in its design place;
//   the scroll carries on the hero's flip unseen, and once it shows below
//   Motto's edge it turns to face us on its own clock: one flip from hero to
//   footer.
// Scrolling up plays it all backwards. The page scroll is smoothed for the
// whole site (src/js/smooth-scroll.js); the coin is drawn in the same frame.
// The resting places are the hero and footer coin pictures (hidden, still
// laid out), measured every frame.
//
// The coin stays at the 3D origin (same lights and HDRI as the user's scene);
// camera.setViewOffset puts it at a point of the screen and camera.zoom sets
// its size. Turning it changes how the lights sweep over the metal.

// Coin in the picture box (448 × 420 in the hero): center at 220, 208, and
// the zoom that gave the picture's coin size on a stage 2 × the box (measured,
// see docs/implementation/15-hero-coin-3d.md). three.js derives the field of
// view of a focal length from the aspect ratio (film height = gauge / aspect
// when wider than tall), so the size scales with the stage's larger side:
// zoom = ZOOM_PER_BOX × box width / max(screen width, height).
const CENTER_X = 220 / 448;
const CENTER_Y = 208 / 420;
const COIN_BOTTOM = 0.47; // coin's lower edge below its center, × picture box height
const ZOOM_PER_BOX = 1.14 * 2;
const FLIP = -Math.PI; // half a flip as it leaves the hero, over its horizontal axis
// The footer carries on the hero's flip: the coin left the hero half turned
// over (FLIP) and, in the footer, completes the turn the same way and at the
// same rate (another half, FLIP → 2 × FLIP) to face us again: one flip that
// starts in the hero and ends in the footer (user decision).
const HERO_DOWN = 0.4; // px the coin moves down per px of scroll, leaving the hero
const DROP = 0.6; // screens the coin travels down while it arrives in the footer
const INTRO = 2.4; // s: the entrance on load
const INTRO_DROP = 0.35; // screens it comes down from, above its place
const INTRO_SCALE = 0.35; // size it starts from, growing to its own

const clamp = (t) => Math.min(1, Math.max(0, t));
const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const out = (t) => 1 - (1 - t) ** 3;
const span = (t, from, to) => clamp((t - from) / (to - from));

export function mountCoin(anchors, fallback) {
  const stage = document.createElement("div");
  stage.className = "coin-stage";
  stage.setAttribute("aria-hidden", "true");
  document.body.prepend(stage);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    stage.remove();
    fallback();
    return () => {};
  }
  // The canvas covers the whole screen and is drawn every frame while the
  // coin shows: 1.5× (not 2×) keeps Retina screens at a steady frame rate,
  // with no visible loss on the soft metal.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.35;
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 3.15);
  camera.lookAt(0, 0, 0);
  camera.setFocalLength(120);

  // The entrance starts only once the studio light (HDRI) and the model are
  // both in and the shaders are compiled (with a first, hidden frame): else
  // the first frames take long and the entrance is half over when the coin
  // first shows, and a late HDRI recompiles in the middle of it.
  let hdriIn = false;
  let modelIn = false;
  const whenBothIn = () => {
    if (!hdriIn || !modelIn) return;
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    // The clock starts on the next frame, after this heavy one.
    requestAnimationFrame(() => {
      readyAt = performance.now();
    });
  };
  new RGBELoader().load(
    "assets/models/white-studio-1k.hdr",
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0.5;
      scene.environmentRotation.y = THREE.MathUtils.degToRad(200);
      hdriIn = true;
      whenBothIn();
    },
    undefined,
    () => {
      // Without the studio light the coin still shows (lights only).
      hdriIn = true;
      whenBothIn();
    },
  );

  RectAreaLightUniformsLib.init();
  [
    [10, 1, [0.3, 0.4, -0.3]], // front right
    [0.2, 1, [-0.8, 0.22, 0.27]], // front left
    [1, 5, [1.6, 0, 0]], // main right
    [5, 1, [0, 1, -0.22]], // top
    [1.7, 1, [-0.6, -1, 0]], // back left
  ].forEach(([intensity, extent, position]) => {
    const light = new THREE.RectAreaLight(0xffffff, intensity, extent, extent);
    light.position.set(...position);
    light.lookAt(0, 0, 0);
    scene.add(light);
  });

  let coinRot1 = null;
  let model = null;
  const initialQuat1 = new THREE.Quaternion();
  let readyAt = null;
  // Compressed with gltf-transform (meshopt geometry, WebP textures at 1024).
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    "assets/models/oww-pin.glb",
    (gltf) => {
      scene.add(gltf.scene);
      model = gltf.scene;
      gltf.scene.traverse((child) => {
        if (child.name.includes("Rot_1")) coinRot1 = child;
        // Leans back 55° (the user's script had 45°) so the coin shows the
        // narrow, tilted look of the Figma picture.
        if (child.name.includes("Rot_2")) child.rotation.set(THREE.MathUtils.degToRad(75), THREE.MathUtils.degToRad(55), 0, "YXZ");
      });
      if (coinRot1) initialQuat1.copy(coinRot1.quaternion);
      modelIn = true;
      whenBothIn();
    },
    undefined,
    (error) => {
      console.error("Coin: the GLB could not be loaded", error);
      stage.remove();
      fallback();
    },
  );

  // Where a picture's coin sits on screen, and the zoom for its size.
  const rest = (picture) => {
    const box = picture.getBoundingClientRect();
    return {
      x: box.left + box.width * CENTER_X,
      y: box.top + box.height * CENTER_Y,
      zoom: (ZOOM_PER_BOX * box.width) / Math.max(window.innerWidth, window.innerHeight),
      box,
    };
  };

  // The pose for the scroll position (in screens of scrolling). It follows
  // the scroll exactly (user decision): the coin moves with the page, so it
  // never drifts against the content around it.
  // Poses are worked out on the screen, from the smooth scroll position
  // (Lenis, with fractions of a pixel), so the coin only ever moves down and
  // keeps gliding to the end of a scroll: anchoring it to the page (which
  // moves up) while it moved down made it reverse, and the browser's
  // whole-pixel scroll made it step.
  const pose = (scroll, intro) => {
    const screen = window.innerHeight;
    if (anchors.hero) {
      const s = scroll / screen;
      // The coin layer is behind the page, so past the showreel it would show
      // through the sections below (user report). It goes once the showreel's
      // video fills the screen (showreel centred, src/js/hero-showreel.js),
      // where that cannot be seen, and comes back there on the way up.
      const box = showreel?.getBoundingClientRect();
      const covered = box ? box.top + box.height / 2 - screen / 2 + window.scrollY : Infinity;
      if (s < 1.2 && scroll < covered) {
        // Its Figma place with the page at the top (document place - scroll 0).
        const at = rest(anchors.hero);
        const top = at.y + window.scrollY;
        // On load: comes down from above, growing from small to its size
        // while half a flip slows to a stop (user decision), then rests in
        // its Figma place and size.
        const enter = out(intro);
        // Scrolling: it moves down, slower than the showreel rises over it,
        // while the scroll slowly turns it over (half a flip); fades out
        // behind the showreel.
        const turn = sine(span(s, 0, 1.1));
        return {
          x: at.x,
          y: top - screen * INTRO_DROP * (1 - enter) + scroll * HERO_DOWN,
          zoom: at.zoom * (INTRO_SCALE + (1 - INTRO_SCALE) * enter),
          tilt: FLIP * turn + FLIP * (1 - enter),
          opacity: span(intro, 0, 0.25) * (1 - span(s, 0.95, 1.2)),
        };
      }
    }
    if (anchors.footer) {
      const max = document.documentElement.scrollHeight - screen;
      const left = (max - scroll) / screen;
      const arrive = 1 - clamp(left);
      if (arrive > 0) {
        // Its design place at the end of the page (document place - the
        // footer's current reveal shift - the last scroll position).
        const at = rest(anchors.footer);
        const shift = footer ? gsap.getProperty(footer, "y") : 0;
        const end = at.y + window.scrollY - shift - max;
        // Comes down from above (from behind Motto) and rests there. The
        // flip carries on the hero's turn, but only once the coin shows
        // below the edge of the section above (user decision, option A):
        // over the last stretch of scroll, once that edge has passed the
        // coin's bottom.
        // Shown stretch: from when the cover's edge passes the coin's bottom
        // to the end of the page (px of scroll). The descent ends (still
        // hidden) as that stretch starts; the flip then takes all of it.
        const coverEnd = cover ? cover.getBoundingClientRect().bottom + window.scrollY - max : end;
        const shownStretch = Math.max(end + at.box.height * COIN_BOTTOM - coverEnd, 1);
        const remaining = max - scroll;
        const descent = 1 - clamp((remaining - shownStretch) / Math.max(screen - shownStretch, 1));
        const settle = sine(descent);
        // The second half of the flip is split: its first quarter (upside
        // down to edge-on) with the scroll while the coin comes down unseen;
        // its last quarter (edge-on to facing us) on its own clock once the
        // coin shows below the cover's edge (1.6s, slowing to a stop), back
        // when scrolled above it. Tied to the scroll, that stretch was crossed
        // in a fraction of a second on the way down (measured: 22 frames).
        faceUs(remaining < shownStretch * 0.85);
        const turn = 0.5 * sine(descent) + 0.5 * facing.value;
        return {
          x: at.x,
          y: end - screen * DROP * (1 - settle),
          zoom: at.zoom,
          tilt: FLIP * (1 + turn),
          opacity: span(arrive, 0, 0.35),
        };
      }
    }
    return null;
  };

  const showreel = anchors.hero?.closest(".hero")?.querySelector(".hero__showreel");
  const footer = anchors.footer?.closest(".site-footer");
  // Footer: the last quarter of the flip, played on its own clock.
  const facing = { value: 0, on: false };
  const faceUs = (on) => {
    if (on === facing.on) return;
    facing.on = on;
    gsap.to(facing, on ? { value: 1, duration: 1.6, ease: "power2.out", overwrite: true } : { value: 0, duration: 0.8, ease: "power2.inOut", overwrite: true });
  };
  // The section above the footer covers the coin there (main's lower edge).
  const cover = document.querySelector("main");

  // The coin turns to face the cursor (user decision, reference
  // thewatch.60fps.fr): it stays in place and only its facing follows, up to
  // LOOK at the screen's edges, catching up softly; back to straight when
  // the cursor leaves the window. Mouse and trackpad only.
  const LOOK = THREE.MathUtils.degToRad(18);
  const look = { x: 0, y: 0 }; // where the cursor is, -1..1 from the centre
  const facingCursor = { x: 0, y: 0 }; // the coin's eased facing
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onPointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    look.x = (event.clientX / window.innerWidth) * 2 - 1;
    look.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onPointerOut = (event) => {
    if (event.relatedTarget) return;
    look.x = 0;
    look.y = 0;
  };
  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut);
  }
  let idle = THREE.MathUtils.degToRad(-45);
  let last = performance.now();

  // Drawn on GSAP's ticker, after the smooth scroll (Lenis) has moved the page
  // and ScrollTrigger has updated (they run earlier on the same ticker), so
  // the coin always matches this frame's scroll: no one-frame lag, no stutter.
  const tick = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    if (readyAt === null || !coinRot1) return;
    const intro = clamp((now - readyAt) / 1000 / INTRO);
    const p = pose(window.lenis ? window.lenis.animatedScroll : window.scrollY, intro);
    const shown = p && p.opacity > 0.001 && p.y > -window.innerHeight * 0.4 && p.y < window.innerHeight * 1.4;
    stage.style.opacity = shown ? p.opacity : 0;
    if (!shown) return;

    idle += 0.15 * dt; // very slow turn on its own face
    coinRot1.quaternion.copy(initialQuat1);
    coinRot1.rotateX(p.tilt);
    coinRot1.rotateY(idle);

    // Facing the cursor: the whole model turns round the screen's axes
    // (right → turns right, up → looks up), eased over about 0.6s.
    const ease = 1 - Math.exp(-dt * 6);
    facingCursor.x += (look.x - facingCursor.x) * ease;
    facingCursor.y += (look.y - facingCursor.y) * ease;
    model.rotation.set(facingCursor.y * LOOK, facingCursor.x * LOOK, 0);

    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.setViewOffset(width, height, width / 2 - p.x, height / 2 - p.y, width, height);
    camera.zoom = p.zoom;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerout", onPointerOut);
    renderer.dispose();
    stage.remove();
  };
}
