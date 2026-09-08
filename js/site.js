/* =====================================================================
   Maneet Kohli — site.js (v2, September 2026)
   Hero wave: Paper Shaders GrainGradient, shape "wave".
   Parameters mirror midu.design's hero background exactly, with the
   palette swapped from red to white.
   ===================================================================== */

import {
  ShaderMount,
  ShaderFitOptions,
  GrainGradientShapes,
  grainGradientFragmentShader,
  getShaderColorFromString,
  getShaderNoiseTexture,
} from "https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.80/+esm";

/* ---- Tunables ------------------------------------------------------ */
// midu: ["#FF4537", "#E41F18", "#FE887B"] (base, deep, highlight).
// Same relative lightness, in white.
const WAVE_COLORS = ["#E4E4E4", "#C2C2C2", "#FFFFFF"];
const WAVE_SPEED = 0.8;

const WAVE = {
  colorBack: "#00000000",
  softness: 1,
  intensity: 0.05,
  noise: 0,
  shape: "wave",
  fit: "contain",
  scale: 1.82,
  rotation: -360,
  offsetX: -0.1,
  offsetY: 0.27,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0,
};

/* ---- Mount ---------------------------------------------------------- */
const host = document.getElementById("hero-wave");

function pixelBudget() {
  // midu's rule: heavy screens get a lower pixel cap.
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  return dpr >= 2 || w * h * dpr * dpr > 4e6 ? 1.6e6 : 2.6e6;
}

async function mountWave() {
  if (!host) return;

  // The library requires the noise texture to be fully decoded before mount.
  const noiseTexture = getShaderNoiseTexture();
  await noiseTexture.decode();

  const uniforms = {
    u_colorBack: getShaderColorFromString(WAVE.colorBack),
    u_colors: WAVE_COLORS.map(getShaderColorFromString),
    u_colorsCount: WAVE_COLORS.length,
    u_softness: WAVE.softness,
    u_intensity: WAVE.intensity,
    u_noise: WAVE.noise,
    u_shape: GrainGradientShapes[WAVE.shape],
    u_noiseTexture: noiseTexture,
    u_fit: ShaderFitOptions[WAVE.fit],
    u_scale: WAVE.scale,
    u_rotation: WAVE.rotation,
    u_offsetX: WAVE.offsetX,
    u_offsetY: WAVE.offsetY,
    u_originX: WAVE.originX,
    u_originY: WAVE.originY,
    u_worldWidth: WAVE.worldWidth,
    u_worldHeight: WAVE.worldHeight,
  };

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const speedFor = () => (reduced?.matches ? 0 : WAVE_SPEED);

  const mount = new ShaderMount(
    host,
    grainGradientFragmentShader,
    uniforms,
    undefined, // WebGL context attributes (library defaults)
    speedFor(), // speed
    0, // starting frame
    1, // minPixelRatio
    pixelBudget()
  );

  reduced?.addEventListener?.("change", () => mount.setSpeed(speedFor()));

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => mount.setMaxPixelCount(pixelBudget()), 150);
    },
    { passive: true }
  );

  // Exposed for live tuning from the console.
  window.__wave = mount;
}

mountWave().catch((err) => {
  console.warn("Hero wave failed to mount, using static fallback.", err);
  host?.classList.add("is-fallback");
});
