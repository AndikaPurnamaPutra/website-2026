import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Hero coin in 3D (trial, from the user's standalone scene in web-coin/main.js:
// same camera, lights, HDRI, model and motion). Adapted to the page: it draws
// into a stage twice the hero__coin box instead of the whole screen; scroll =
// how far the hero has been scrolled (not wheel ticks anywhere); rendering
// pauses while the hero is off screen. Loaded on its own by hero-coin-3d.js
// (three.js stays out of the main bundle). coin.png is hidden from the first
// paint (_hero.scss) so the two coins never show together; it comes back if
// the 3D coin cannot load.
const COIN_ZOOM = 1.14; // 401 / 351px at 1440, from screenshots

export function mountHeroCoin(image, hero) {
  const holder = document.createElement("div");
  holder.className = "hero__coin hero__coin--3d";
  holder.setAttribute("aria-hidden", "true");
  image.after(holder);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    // No WebGL: the picture comes back.
    holder.remove();
    image.classList.add("is-fallback");
    return () => {};
  }
  const size = () => ({ width: holder.clientWidth, height: holder.clientHeight });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size().width, size().height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.35;
  holder.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, size().width / size().height, 0.1, 100);
  const baseCameraPos = new THREE.Vector3(0, 0, 3.15);
  camera.position.copy(baseCameraPos);
  camera.lookAt(0, 0, 0);
  camera.setFocalLength(120);
  // The stage is twice the picture box: zoom so the coin is as tall as in the
  // picture (396 of its 420px), measured at the start pose.
  camera.zoom = COIN_ZOOM;
  camera.updateProjectionMatrix();

  // Click and hold to turn it; it eases back when released.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0, 0, 0);
  let isDragging = false;
  let isResetting = false;
  controls.addEventListener("start", () => {
    isDragging = true;
    isResetting = false;
  });
  controls.addEventListener("end", () => {
    isDragging = false;
    isResetting = true;
  });

  new RGBELoader().load("assets/models/white-studio-1k.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.environmentIntensity = 0.5;
    scene.environmentRotation.y = THREE.MathUtils.degToRad(200);
  });

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
  let coinRot2 = null;
  const initialQuat1 = new THREE.Quaternion();
  const initialPos2 = new THREE.Vector3();
  // Compressed with gltf-transform (meshopt geometry, WebP textures at 1024).
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    "assets/models/oww-pin.glb",
    (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.traverse((child) => {
        if (child.name.includes("Rot_1")) coinRot1 = child;
        if (child.name.includes("Rot_2")) coinRot2 = child;
      });
      if (coinRot1) initialQuat1.copy(coinRot1.quaternion);
      if (coinRot2) {
        coinRot2.rotation.set(THREE.MathUtils.degToRad(75), THREE.MathUtils.degToRad(45), 0, "YXZ");
        initialPos2.copy(coinRot2.position);
      }
      holder.classList.add("is-ready");
    },
    undefined,
    (error) => {
      console.error("Hero coin: the GLB could not be loaded", error);
      image.classList.add("is-fallback");
    },
  );

  // Scroll: 0 at the top of the page, 1 once the hero has scrolled away.
  let targetScroll = 0;
  let currentScroll = 0;
  const scrollTrigger = ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "bottom top",
    onUpdate: (self) => {
      targetScroll = self.progress;
    },
    onToggle: (self) => (self.isActive || self.progress === 0 ? start() : stop()),
  });

  const onResize = () => {
    const { width, height } = size();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", onResize);

  let idleSpinAngle = THREE.MathUtils.degToRad(-45);
  let frame = null;
  const animate = () => {
    frame = requestAnimationFrame(animate);
    currentScroll += (targetScroll - currentScroll) * 0.06;

    if (isResetting && !isDragging) {
      camera.position.lerp(baseCameraPos, 0.05);
      if (camera.position.distanceTo(baseCameraPos) < 0.001) {
        camera.position.copy(baseCameraPos);
        isResetting = false;
      }
    }

    if (coinRot1 && coinRot2) {
      coinRot1.quaternion.copy(initialQuat1);
      coinRot1.rotateX(THREE.MathUtils.degToRad(-72) * currentScroll);
      idleSpinAngle += 0.005;
      coinRot1.rotateY(idleSpinAngle);
      coinRot2.position.y = initialPos2.y + 0.5 * currentScroll;
    }

    controls.update();
    renderer.render(scene, camera);
  };
  // Render only while the hero is on screen.
  function start() {
    if (frame === null) animate();
  }
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }
  start();

  return () => {
    stop();
    scrollTrigger.kill();
    window.removeEventListener("resize", onResize);
    controls.dispose();
    renderer.dispose();
    holder.remove();
  };
}
