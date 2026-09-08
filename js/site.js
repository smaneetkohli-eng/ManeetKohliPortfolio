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

/* =====================================================================
   Clock + day/night icon (midu's availability status), Texas time.
   ===================================================================== */
(function clock() {
  const text = document.getElementById("meta-time");
  const icon = document.getElementById("meta-icon");
  if (!text || !icon) return;

  const ZONE = "America/Chicago";
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: ZONE,
  });
  const hourFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: ZONE,
  });

  const SUN = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
      <circle cx="7" cy="7" r="2.6" fill="currentColor" stroke="none"/>
      <path d="M7 .9v1.6M7 11.5v1.6M.9 7h1.6M11.5 7h1.6M2.7 2.7l1.1 1.1M10.2 10.2l1.1 1.1M2.7 11.3l1.1-1.1M10.2 3.8l1.1-1.1"/>
    </svg>`;
  const SLEEP = `<span class="zz">z</span><span class="zz">z</span><span class="zz">z</span>`;

  let mode = "";
  function tick() {
    const now = new Date();
    const hour = parseInt(hourFmt.format(now), 10) % 24;
    const day = hour >= 7 && hour < 22; // sun 7:00 AM – 9:59 PM, sleep otherwise
    const label = `${timeFmt.format(now)} Texas, United States`;
    text.textContent = label;
    text.dataset.text = label;

    const next = day ? "sun" : "sleep";
    if (next !== mode) {
      mode = next;
      icon.className = `hero__meta-icon hero__meta-icon--${mode}`;
      icon.innerHTML = day ? SUN : SLEEP;
    }
  }
  tick();
  setInterval(tick, 15000);
})();

/* =====================================================================
   Cycling line on the torso: Data driven → AI focused → Business minded
   ===================================================================== */
(function cycle() {
  const words = [...document.querySelectorAll("#cycle .cycle__word")];
  if (words.length < 2) return;
  const HOLD = 2600;
  const LEAVE = 800;
  let i = 0;
  setInterval(() => {
    const current = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    next.classList.add("is-active");
    setTimeout(() => current.classList.remove("is-leaving"), LEAVE);
  }, HOLD);
})();

/* =====================================================================
   Cursor: ring that trails the pointer, swells over interactive targets.
   ===================================================================== */
(function cursor() {
  const el = document.getElementById("cursor");
  const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)");
  if (!el || !fine?.matches) return;
  document.documentElement.classList.add("has-cursor");

  const HOVER = "a, button, [role='button'], input, textarea, select, label";
  let tx = -100, ty = -100; // target
  let x = tx, y = ty;       // rendered
  let scale = 1, targetScale = 1;
  let raf = 0;

  function frame() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    scale += (targetScale - scale) * 0.18;
    el.style.setProperty("--cx", `${x}px`);
    el.style.setProperty("--cy", `${y}px`);
    el.style.setProperty("--cs", scale.toFixed(3));
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!el.classList.contains("is-visible")) {
      x = tx; y = ty;
      el.classList.add("is-visible");
    }
    const over = e.target instanceof Element && e.target.closest(HOVER);
    el.classList.toggle("is-hover", !!over);
    targetScale = over ? 1.8 : 1;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });

  window.addEventListener("pointerdown", () => { el.classList.add("is-down"); targetScale *= 0.85; });
  window.addEventListener("pointerup", () => { el.classList.remove("is-down"); targetScale = el.classList.contains("is-hover") ? 1.8 : 1; });
  document.addEventListener("mouseleave", () => el.classList.remove("is-visible"));
  document.addEventListener("mouseenter", () => el.classList.add("is-visible"));
})();
