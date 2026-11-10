// The preloader's fade on the 3D coin in the hero (src/js/preloader.js →
// src/js/coin-scene.js, shared between the two): 0–1, and 1 without the
// preloader. The same fade after a page transition (src/js/coin-scene.js).
export const coinMotion = { fade: 1 };
export const COIN_IN = 1.4; // s
export const COIN_EASE = "sine.inOut";

// Below the laptop layout (phones and tablets) there is no coin at all, neither
// the 3D one nor its picture (user, 10 Nov 2026): src/scss/components/
// _coin-stage.scss hides it, and the 3D scene is not loaded there.
export const NO_COIN = "(max-width: 1023.98px)";
