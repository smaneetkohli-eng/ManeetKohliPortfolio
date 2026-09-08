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

/* Bio page: the same wave, thinner and pushed to the host's bottom edge,
   which the CSS rotation turns into the left / right screen edge. */
const EDGE_WAVE = {
  ...WAVE,
  scale: 1.55,
  offsetX: 0,
  offsetY: 0.58,
};
const EDGE_WAVE_SPEED = 0.55;

/* ---- Mount ---------------------------------------------------------- */
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
const html = document.documentElement;

function pixelBudget() {
  // midu's rule: heavy screens get a lower pixel cap.
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  return dpr >= 2 || w * h * dpr * dpr > 4e6 ? 1.6e6 : 2.6e6;
}

/* One GrainGradient mount. Used by the hero wave, the bio edge waves and
   the Bani AI nebula. */
async function mountGrain(host, params, colors, speed) {
  if (!host) return null;

  // The library requires the noise texture to be fully decoded before mount.
  const noiseTexture = getShaderNoiseTexture();
  await noiseTexture.decode();

  const uniforms = {
    u_colorBack: getShaderColorFromString(params.colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_softness: params.softness,
    u_intensity: params.intensity,
    u_noise: params.noise,
    u_shape: GrainGradientShapes[params.shape],
    u_noiseTexture: noiseTexture,
    u_fit: ShaderFitOptions[params.fit],
    u_scale: params.scale,
    u_rotation: params.rotation,
    u_offsetX: params.offsetX,
    u_offsetY: params.offsetY,
    u_originX: params.originX,
    u_originY: params.originY,
    u_worldWidth: params.worldWidth,
    u_worldHeight: params.worldHeight,
  };

  const speedFor = () => (reducedMotion?.matches ? 0 : speed);

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

  reducedMotion?.addEventListener?.("change", () => mount.setSpeed(speedFor()));

  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => mount.setMaxPixelCount(pixelBudget()), 150);
    },
    { passive: true }
  );

  mount.__speed = speed;
  return mount;
}

/* Hero wave: mounts immediately; the pager pauses it when the hero is off
   screen and resumes it on the way back. */
let heroMount = null;
let heroLive = true;
const heroHost = document.getElementById("hero-wave");
mountGrain(heroHost, WAVE, WAVE_COLORS, WAVE_SPEED)
  .then((mount) => {
    heroMount = mount;
    mount.setSpeed(heroLive && !reducedMotion?.matches ? WAVE_SPEED : 0);
    // Exposed for live tuning from the console.
    window.__wave = mount;
  })
  .catch((err) => {
    console.warn("Hero wave failed to mount, using static fallback.", err);
    heroHost?.classList.add("is-fallback");
  });

function makeHero() {
  return {
    start() {
      heroLive = true;
      heroMount?.setSpeed(reducedMotion?.matches ? 0 : WAVE_SPEED);
    },
    stop() {
      heroLive = false;
      heroMount?.setSpeed(0);
    },
  };
}

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
    const label = `${timeFmt.format(now)} Texas, United States`;
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
  html.classList.add("has-cursor");

  const HOVER = "a, button, [role='button'], input, textarea, select, label";
  const label = el.querySelector(".cursor__label");
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

  /* Read the cursor's state off whatever element it is over. */
  function apply(target) {
    const card = target instanceof Element && target.closest(".card");
    const over = !card && target instanceof Element && target.closest(HOVER);
    el.classList.toggle("is-card", !!card);
    const text = (card && card.dataset.cursor) || "";
    if (label && text && label.textContent !== text) label.textContent = text;
    el.classList.toggle("is-label", !!text);
    el.classList.toggle("is-hover", !!over);
    targetScale = over ? 1.8 : 1;   // the card state sizes itself in CSS
  }

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!el.classList.contains("is-visible")) {
      x = tx; y = ty;
      el.classList.add("is-visible");
    }
    apply(e.target);
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });

  /* The pager announces every move. What sits under a still pointer can
     change (a card flips to one with a link, or to "Releasing soon"), so
     re-read it as the move starts, at the flip's midpoint and once it has
     settled, without waiting for the pointer to move. */
  document.addEventListener("pager:move", () => {
    if (!el.classList.contains("is-visible")) return;
    [0, 550, 1200].forEach((ms) => setTimeout(() => apply(document.elementFromPoint(tx, ty)), ms));
  });

  window.addEventListener("pointerdown", () => { el.classList.add("is-down"); targetScale *= 0.85; });
  window.addEventListener("pointerup", () => { el.classList.remove("is-down"); targetScale = el.classList.contains("is-hover") ? 1.8 : 1; });
  document.addEventListener("mouseleave", () => el.classList.remove("is-card"));
  document.addEventListener("mouseleave", () => el.classList.remove("is-visible"));
  document.addEventListener("mouseenter", () => el.classList.add("is-visible"));
})();

/* =====================================================================
   Shared helpers
   ===================================================================== */
const rand = (a, b) => a + Math.random() * (b - a);

/* The track's curve (--page-ease in site.css), for JS tweens. */
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const s = slopeX(t);
      if (Math.abs(dx) < 1e-5 || s === 0) break;
      t -= dx / s;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}
const PAGE_EASE = cubicBezier(0.45, 0, 0.2, 1);
const PAGE_MS = 1100;

/* =====================================================================
   BACKGROUND ENGINES — one per project. Each returns { start, stop }.
   Only the visible one runs; the projects controller drives them.
   ===================================================================== */

/* ---- Sky: layered cumulus drifting across a gradient ------------------
   Each cloud is pre-rendered once: a row of overlapping soft puffs under
   a dome envelope (fluffy top, flatter base), shaded underneath, softened
   with a blur pass. The sprite canvas is sized from the puffs, so nothing
   is ever clipped at the edges. */
function makeSky(canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, clouds = [], raf = 0, last = 0;

  function sprite(r) {
    const puffs = [];
    const width = r * rand(2.2, 3.2);
    const n = 16 + Math.floor(Math.random() * 10);
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * 2 - 1;                 // -1 .. 1 across
      const env = Math.sqrt(Math.max(0, 1 - u * u));   // dome
      const pr = r * (0.36 + 0.5 * env) * rand(0.78, 1.12);
      const px = u * width * 0.5 + rand(-0.12, 0.12) * r;
      const py = -env * r * rand(0.15, 0.7) - pr * 0.25; // baseline is 0
      puffs.push({ px, py, pr });
    }
    // a few small bumps riding on top for texture
    for (let i = 0; i < 5; i++) {
      const base = puffs[Math.floor(rand(n * 0.2, n * 0.8))];
      const pr = base.pr * rand(0.4, 0.6);
      puffs.push({ px: base.px + rand(-0.6, 0.6) * base.pr, py: base.py - base.pr * rand(0.45, 0.75), pr });
    }

    const pad = r * 0.7;
    const minX = Math.min(...puffs.map((p) => p.px - p.pr)) - pad;
    const maxX = Math.max(...puffs.map((p) => p.px + p.pr)) + pad;
    const minY = Math.min(...puffs.map((p) => p.py - p.pr)) - pad;
    const maxY = Math.max(...puffs.map((p) => p.py + p.pr)) + pad;
    const cw = Math.ceil(maxX - minX);
    const ch = Math.ceil(maxY - minY);

    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const g = c.getContext("2d");
    g.translate(-minX, -minY);

    // body: soft white puffs
    for (const p of puffs) {
      const grad = g.createRadialGradient(p.px, p.py, p.pr * 0.15, p.px, p.py, p.pr);
      grad.addColorStop(0, "rgba(255,255,255,0.98)");
      grad.addColorStop(0.62, "rgba(255,255,255,0.86)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(p.px, p.py, p.pr, 0, Math.PI * 2);
      g.fill();
    }
    // flatten the base: fade everything below the baseline
    g.globalCompositeOperation = "destination-out";
    const cut = g.createLinearGradient(0, 0, 0, r * 0.9);
    cut.addColorStop(0, "rgba(0,0,0,0)");
    cut.addColorStop(0.45, "rgba(0,0,0,0.55)");
    cut.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = cut;
    g.fillRect(minX, 0, cw, r);
    // shade the underside so the cloud has volume
    g.globalCompositeOperation = "source-atop";
    const shade = g.createLinearGradient(0, -r * 1.1, 0, r * 0.5);
    shade.addColorStop(0, "rgba(255,255,255,0)");
    shade.addColorStop(0.55, "rgba(190,208,232,0.18)");
    shade.addColorStop(1, "rgba(140,168,205,0.55)");
    g.fillStyle = shade;
    g.fillRect(minX, minY, cw, ch);
    g.globalCompositeOperation = "source-over";

    // soften the whole thing once
    if ("filter" in g) {
      const soft = document.createElement("canvas");
      soft.width = cw;
      soft.height = ch;
      const sg = soft.getContext("2d");
      sg.filter = `blur(${Math.max(1, r * 0.018).toFixed(1)}px)`;
      sg.drawImage(c, 0, 0);
      return soft;
    }
    return c;
  }

  function build() {
    clouds = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const depth = Math.pow(Math.random(), 1.35);        // more small, far clouds
      const r = 34 + depth * 120;
      const img = sprite(r);
      clouds.push({
        depth,
        img,
        w: img.width,
        h: img.height,
        x: rand(-img.width, w),
        y: rand(-0.02 * h, 0.62 * h) - img.height * 0.5,
        speed: 4 + depth * 18,
        alpha: 0.42 + depth * 0.55,
      });
    }
    clouds.sort((a, b) => a.depth - b.depth);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function paint() {
    ctx.clearRect(0, 0, w, h);
    for (const c of clouds) {
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(c.img, c.x, c.y);
    }
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    for (const c of clouds) {
      c.x += c.speed * dt;
      if (c.x > w + 20) c.x = -c.w - 20;
    }
    paint();
    raf = requestAnimationFrame(frame);
  }

  let built = false;
  return {
    start() {
      if (!built || w !== canvas.clientWidth || h !== canvas.clientHeight) {
        resize();
        built = true;
      }
      if (reducedMotion?.matches) {
        paint();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

/* ---- Galaxy: nebula shader + drifting, twinkling stars --------------- */
const NEBULA_COLORS = ["#08153a", "#a24a1c", "#123078", "#0d2260", "#d0783a"];
const NEBULA = {
  colorBack: "#03050d",
  softness: 1,
  intensity: 0.28,
  noise: 0.35,
  shape: "blob",
  fit: "cover",
  scale: 1.6,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  originX: 0.5,
  originY: 0.5,
  worldWidth: 0,
  worldHeight: 0,
};
const NEBULA_SPEED = 0.32;

function makeGalaxy(nebulaHost, starsCanvas) {
  const ctx = starsCanvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, stars = [], raf = 0, last = 0, built = false;
  let mount = null, mounting = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = starsCanvas.clientWidth;
    h = starsCanvas.clientHeight;
    starsCanvas.width = Math.round(w * dpr);
    starsCanvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / 6500);
    stars = [];
    for (let i = 0; i < n; i++) {
      const warm = Math.random() < 0.35;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + Math.pow(Math.random(), 2.2) * 1.4,
        phase: Math.random() * Math.PI * 2,
        rate: 0.4 + Math.random() * 1.4,
        tint: warm ? "255,214,170" : "190,214,255",
        vx: 1.6 + Math.random() * 1.8,
        vy: -(0.3 + Math.random() * 0.6),
      });
    }
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, w, h);
    const time = t / 1000;
    for (const s of stars) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.x > w + 4) s.x = -4;
      if (s.y < -4) s.y = h + 4;
      const tw = 0.55 + 0.45 * Math.sin(time * s.rate + s.phase);
      ctx.fillStyle = `rgba(${s.tint},${(0.35 + 0.65 * tw).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.8 + 0.4 * tw), 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (!built || w !== starsCanvas.clientWidth || h !== starsCanvas.clientHeight) {
        resize();
        built = true;
      }
      if (!mount && !mounting) {
        mounting = mountGrain(nebulaHost, NEBULA, NEBULA_COLORS, NEBULA_SPEED)
          .then((m) => {
            mount = m;
            window.__nebula = m;
          })
          .catch((err) => console.warn("Nebula failed to mount.", err));
      } else if (mount) {
        mount.setSpeed(reducedMotion?.matches ? 0 : NEBULA_SPEED);
      }
      if (reducedMotion?.matches) {
        frame(performance.now());
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      mount?.setSpeed(0);
    },
  };
}

/* ---- Paper: maroon paper planes on dotted flight paths --------------- */
const SVG_NS = "http://www.w3.org/2000/svg";
// Material "send" glyph, re-centred on its own middle so it sits on the path.
const PLANE_D = "M-10 9l21-9-21-9v7l15 2-15 2z";

function makePlanes(svg) {
  let w = 0, h = 0, raf = 0, last = 0, timer = 0, built = false;
  const flights = [];
  let uid = 0;

  const el = (name, attrs = {}) => {
    const n = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  function randomRoute() {
    // Left-to-right or right-to-left, gently curved, staying inside the sheet.
    const ltr = Math.random() < 0.5;
    const x0 = ltr ? -60 : w + 60;
    const x1 = ltr ? w + 60 : -60;
    const y0 = rand(0.12 * h, 0.88 * h);
    const y1 = rand(0.12 * h, 0.88 * h);
    const c1x = x0 + (x1 - x0) * rand(0.2, 0.4);
    const c2x = x0 + (x1 - x0) * rand(0.6, 0.8);
    const c1y = y0 + rand(-0.35, 0.35) * h;
    const c2y = y1 + rand(-0.35, 0.35) * h;
    return `M ${x0} ${y0} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x1} ${y1}`;
  }

  function seedStatic() {
    for (let i = 0; i < 3; i++) {
      svg.appendChild(el("path", { class: "flight flight--static", d: randomRoute() }));
    }
  }

  function launch() {
    if (flights.length >= 4) return;
    const id = `fm${++uid}`;
    const d = randomRoute();
    const g = el("g");
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: -200, y: -200, width: w + 400, height: h + 400 });
    const maskPath = el("path", { class: "flight-mask__path", d, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 });
    mask.appendChild(maskPath);
    const trail = el("path", { class: "flight", d, mask: `url(#${id})` });
    const plane = el("path", { class: "plane", d: PLANE_D });
    g.append(mask, trail, plane);
    svg.appendChild(g);
    const measure = el("path", { d });
    const length = measure.getTotalLength();
    flights.push({
      g, maskPath, plane, measure, length,
      t: 0,
      duration: rand(9, 15),
      fade: 0,
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      launch();
      schedule();
    }, rand(1400, 3600));
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i];
      if (f.t < 1) {
        f.t = Math.min(1, f.t + dt / f.duration);
        // ease-in-out so the plane leaves and arrives gently
        const e = f.t < 0.5 ? 2 * f.t * f.t : 1 - Math.pow(-2 * f.t + 2, 2) / 2;
        const len = e * f.length;
        const p = f.measure.getPointAtLength(len);
        const q = f.measure.getPointAtLength(Math.min(f.length, len + 2));
        const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        // subtle bob so it reads as paper, not a dot on rails
        const bob = Math.sin(t / 380 + f.length) * 2.5;
        f.plane.setAttribute("transform", `translate(${p.x} ${p.y + bob}) rotate(${angle}) scale(1.05)`);
        f.maskPath.setAttribute("stroke-dashoffset", (1 - e).toFixed(4));
      } else {
        f.fade += dt / 1.6;
        f.g.style.opacity = String(Math.max(0, 1 - f.fade));
        if (f.fade >= 1) {
          f.g.remove();
          flights.splice(i, 1);
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function resize() {
    w = svg.clientWidth;
    h = svg.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    for (const f of flights) f.g.remove();
    flights.length = 0;
    svg.querySelectorAll(".flight--static").forEach((n) => n.remove());
    seedStatic();
  }

  return {
    start() {
      if (!built || w !== svg.clientWidth || h !== svg.clientHeight) {
        resize();
        built = true;
      }
      if (reducedMotion?.matches) return; // static paths only
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
        launch();
        schedule();
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(timer);
    },
  };
}

/* ---- Resume: three columns of grey text typing themselves ------------
   Left: the resume. Middle (mostly behind the slab): the agent's trace.
   Right: the cover letter. Each column streams its lines in word-sized
   chunks, holds, fades, and starts over, staggered so something is always
   being written. */
const RESUME_DOC = [
  ["name", "Maneet Kohli"],
  ["meta", "Dallas, TX  ·  maneetkohli.com  ·  linkedin.com/in/maneet-kohli"],
  ["h", "Education"],
  ["role", "The University of Texas at Dallas  ·  B.S. Business Analytics and Artificial Intelligence"],
  ["li", "–  Naveen Jindal School of Management  ·  Expected May 2027  ·  GPA 3.87"],
  ["h", "Experience"],
  ["role", "Sky Automations  ·  Co-founder"],
  ["li", "–  Marketing automation for home service contractors with no online presence"],
  ["li", "–  Built the GoHighLevel snapshot: pipelines, follow-up flows, onboarding and reporting"],
  ["li", "–  Own positioning, outreach and the client-facing site"],
  ["role", "Punjabi By Flavor  ·  2023 – 2026"],
  ["li", "–  Content, marketing and day-to-day operations"],
  ["h", "Projects"],
  ["role", "Bani AI  ·  Real-time Gurbani companion"],
  ["li", "–  Speech-to-text matching pipeline that identifies the live shabad and displays it for Gurdwara screens"],
  ["li", "–  FastAPI backend, React + TypeScript frontend, self-hosted BaniDB"],
  ["role", "Meridian  ·  Educational roadmap app"],
  ["li", "–  Direction, not content: Next.js and Supabase"],
  ["h", "Skills"],
  ["p", "Python  ·  SQL  ·  Power BI  ·  Azure  ·  FastAPI  ·  React  ·  TypeScript  ·  Prompt engineering"],
];
const TRACE_DOC = [
  ["cmd", "$ resume-agent build --role \"Data Analyst Intern\""],
  ["p", "› reading the job description"],
  ["p", "› reading databank: projects/, skills.md, rules/"],
  ["p", "› gaps: none blocking · framing: analytics first"],
  ["p", "› matching skills → SQL, Python, Power BI, Azure"],
  ["p", "› selecting: Sky Automations, Bani AI, Meridian"],
  ["p", "› rewriting every bullet for this posting"],
  ["p", "› building from Resume Template.docx"],
  ["p", "› one page: ok"],
  ["p", "› converting → PDF"],
  ["p", "› drafting the cover letter"],
  ["p", "› scoring: quality · fit · match"],
  ["ok", "✓ Company_MK_Resume.pdf"],
  ["ok", "✓ Company_MK_CoverLetter.pdf"],
  ["gap", ""],
  ["cmd", "$ resume-agent build --role \"Business Analyst Intern\""],
  ["p", "› reading the job description"],
  ["p", "› matching skills → SQL, Excel, stakeholder work"],
  ["p", "› selecting: Sky Automations, Meridian, ALIAS"],
  ["p", "› rewriting every bullet for this posting"],
  ["p", "› one page: ok"],
  ["ok", "✓ Company_MK_Resume.pdf"],
];
const LETTER_DOC = [
  ["role", "Dear Hiring Team,"],
  ["gap", ""],
  ["p", "I build things with data and I ship them. At Sky Automations I turned a marketing problem for small contractors into a working product. With Bani AI I built a real-time pipeline that listens, matches and displays, and it runs in front of real people every week."],
  ["p", "What I want from this role is the same thing I want from every project: a hard problem, real users, and a team that cares about the details."],
  ["p", "I study Business Analytics and AI at UT Dallas. I am comfortable in SQL and Python, I like a clean dashboard, and I do not need to be told twice."],
  ["p", "I would love to talk."],
  ["gap", ""],
  ["role", "Maneet Kohli"],
];

function makeResume(host) {
  const specs = [
    { cls: "resume__page--resume", lines: RESUME_DOC, tick: 0.05, delay: 0 },
    { cls: "resume__page--trace", lines: TRACE_DOC, tick: 0.07, delay: 3.5 },
    { cls: "resume__page--letter", lines: LETTER_DOC, tick: 0.045, delay: 7 },
  ];
  const cols = specs.map((sp) => {
    const el = document.createElement("div");
    el.className = `resume__page ${sp.cls}`;
    host.appendChild(el);
    const caret = document.createElement("span");
    caret.className = "resume__caret";
    return { ...sp, el, caret, li: 0, ci: 0, cur: null, wait: sp.delay, phase: "type", acc: 0 };
  });
  let raf = 0, last = 0;

  function lineEl(col, kind) {
    const div = document.createElement("div");
    div.className = `resume__line resume__line--${kind}`;
    const txt = document.createElement("span");
    div.appendChild(txt);
    div.appendChild(col.caret);
    col.el.appendChild(div);
    return { div, txt };
  }

  function advance(col, dt) {
    if (col.wait > 0) { col.wait -= dt; return; }
    if (col.phase === "hold") { col.phase = "clear"; col.wait = 3.2; return; }
    if (col.phase === "clear") { col.el.classList.add("is-clearing"); col.phase = "reset"; col.wait = 0.7; return; }
    if (col.phase === "reset") {
      col.el.replaceChildren();
      col.el.classList.remove("is-clearing");
      col.li = 0; col.ci = 0; col.cur = null; col.acc = 0;
      col.phase = "type"; col.wait = 0.5;
      return;
    }
    col.acc += dt;
    while (col.acc >= col.tick) {
      col.acc -= col.tick;
      if (col.li >= col.lines.length) { col.caret.remove(); col.phase = "hold"; col.wait = 0; return; }
      const [kind, text] = col.lines[col.li];
      if (!col.cur) col.cur = lineEl(col, kind);
      if (kind === "gap" || !text) { col.li++; col.cur = null; continue; }
      col.ci = Math.min(text.length, col.ci + 2 + Math.floor(Math.random() * 5));
      col.cur.txt.textContent = text.slice(0, col.ci);
      if (col.ci >= text.length) {
        col.li++; col.ci = 0; col.cur = null;
        col.acc -= col.tick * rand(1, 5);   // breathe between lines
      }
    }
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    for (const c of cols) advance(c, dt);
    raf = requestAnimationFrame(frame);
  }

  function paintAll() {
    for (const col of cols) {
      col.el.replaceChildren();
      for (const [kind, text] of col.lines) {
        const div = document.createElement("div");
        div.className = `resume__line resume__line--${kind}`;
        div.textContent = text;
        col.el.appendChild(div);
      }
      // leave the column finished, so a restart holds and retypes cleanly
      col.li = col.lines.length; col.ci = 0; col.cur = null; col.acc = 0;
      col.phase = "hold"; col.wait = 3;
    }
  }

  const api = {
    start() {
      if (reducedMotion?.matches) { paintAll(); return; }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    paint: paintAll,   // console: __resume.paint() shows every column finished
  };
  window.__resume = api;
  return api;
}

/* =====================================================================
   PAGE CONTROLLERS — one per page that needs JS. Shape:
   { start(), stop(), setStep?(step, dir, animate), theme?(step) }
   ===================================================================== */

/* ---- Bio: two edge waves (hero shader, rotated by CSS) --------------- */
function makeEdgeWaves(page) {
  const hosts = [...page.querySelectorAll("[data-edge-wave]")];
  let mounts = [];
  let mounting = null;
  return {
    start() {
      if (!mounting) {
        mounting = Promise.all(hosts.map((h) => mountGrain(h, EDGE_WAVE, WAVE_COLORS, EDGE_WAVE_SPEED)))
          .then((ms) => {
            mounts = ms.filter(Boolean);
            window.__edges = mounts;
          })
          .catch((err) => console.warn("Edge waves failed to mount.", err));
      } else {
        mounts.forEach((m) => m.setSpeed(reducedMotion?.matches ? 0 : EDGE_WAVE_SPEED));
      }
    },
    stop() {
      mounts.forEach((m) => m.setSpeed(0));
    },
  };
}

/* ---- About: photo helix + three copy blocks -------------------------- */
function makeAbout(page) {
  const helix = page.querySelector("[data-helix]");
  const photos = [...helix.querySelectorAll(".helix__photo")];
  const blocks = [...page.querySelectorAll(".about__block")];
  const PER_GROUP = 8;                 // photos per step (4 pairs)
  const PAIRS_PER_GROUP = PER_GROUP / 2;
  const TURN = (Math.PI * 2) / 5.2;    // angle between rungs
  const SPIN = 0.11;                   // rad/s idle rotation

  // one rung per pair
  const rungs = [];
  for (let i = 0; i < photos.length / 2; i++) {
    const r = document.createElement("div");
    r.className = "helix__rung";
    helix.appendChild(r);
    rungs.push(r);
  }

  let W = 0, H = 0, R = 0, spacing = 0;
  let base = 0.4;              // idle rotation angle
  let center = 1.5;            // which pair index sits at the vertical middle
  let raf = 0, last = 0;
  let tween = null;            // { from, to, spin, t0, ms }
  let step = 0;

  function layout() {
    W = helix.clientWidth;
    H = helix.clientHeight;
    R = Math.min(W * 0.27, 250);
    spacing = H / 4.3;
  }

  function place(now) {
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / tween.ms);
      const e = PAGE_EASE(k);
      center = tween.from + (tween.to - tween.from) * e;
      base = tween.baseFrom + tween.spin * e;
      if (k >= 1) tween = null;
    }
    const cy = 0; // transforms are relative to the helix centre
    for (let i = 0; i < photos.length; i++) {
      const pair = i >> 1;
      const side = i & 1;
      const a = base + pair * TURN + side * Math.PI;
      const y = cy + (pair - center) * spacing;
      const el = photos[i];
      if (Math.abs(y) > H * 0.72) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        continue;
      }
      if (el.style.visibility) el.style.visibility = "";
      const x = Math.sin(a) * R;
      const z = Math.cos(a) * R;
      const shade = (1 - z / R) / 2;
      el.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) ` +
        `rotateY(${(Math.sin(a) * 24).toFixed(2)}deg)`;
      el.style.zIndex = String(Math.round(z + R));
      el.style.setProperty("--shade", shade.toFixed(3));
    }
    for (let p = 0; p < rungs.length; p++) {
      const a = base + p * TURN;
      const y = cy + (p - center) * spacing;
      const el = rungs[p];
      if (Math.abs(y) > H * 0.72) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        continue;
      }
      if (el.style.visibility) el.style.visibility = "";
      el.style.width = `${R * 2}px`;
      el.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(1)}px, 0) rotateY(${((a * 180) / Math.PI).toFixed(2)}deg)`;
    }
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    if (!tween && !reducedMotion?.matches) base += SPIN * dt;
    place(t);
    raf = requestAnimationFrame(frame);
  }

  function paintBlocks() {
    blocks.forEach((b, i) => {
      b.classList.toggle("is-current", i === step);
      b.classList.toggle("is-prev", i < step);
      b.classList.toggle("is-next", i > step);
    });
  }

  let built = false;
  return {
    start() {
      if (!built || W !== helix.clientWidth || H !== helix.clientHeight) {
        layout();
        built = true;
      }
      paintBlocks();
      if (reducedMotion?.matches) {
        tween = null;
        center = step * PAIRS_PER_GROUP + 1.5;
        place(performance.now());
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    setStep(s, dir, animate) {
      step = s;
      paintBlocks();
      const to = s * PAIRS_PER_GROUP + 1.5;
      if (!animate || reducedMotion?.matches) {
        tween = null;
        center = to;
        if (!raf) place(performance.now());
        return;
      }
      tween = { from: center, to, baseFrom: base, spin: dir * 0.9, t0: performance.now(), ms: 1000 };
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
  };
}

/* ---- Projects: flipping slab + page-turn backgrounds ----------------- */
function makeProjects(page) {
  const THEMES = ["dark", "dark", "dark", "mono"];   // mono: dark dots on the white sheet
  const bgs = [...page.querySelectorAll(".project__bg")];
  const templates = [...page.querySelectorAll("template[data-card]")];
  const inner = page.querySelector(".flip__inner");
  const faces = [page.querySelector(".flip__face--a"), page.querySelector(".flip__face--b")];

  const engines = bgs.map((bg) => {
    if (bg.querySelector("[data-sky]")) return makeSky(bg.querySelector("[data-sky]"));
    if (bg.querySelector("[data-nebula]")) return makeGalaxy(bg.querySelector("[data-nebula]"), bg.querySelector("[data-stars]"));
    if (bg.querySelector("[data-planes]")) return makePlanes(bg.querySelector("[data-planes]"));
    if (bg.querySelector("[data-resume]")) return makeResume(bg.querySelector("[data-resume]"));
    return null;
  });

  let step = 0;
  let angle = 0;         // accumulated rotateX, multiples of 180
  let live = false;
  let stopTimer = 0;

  const frontIndex = () => (Math.round(angle / 180) % 2 === 0 ? 0 : 1);

  /* Clone the template onto a face. The template's data-href makes the
     face a real link; data-cursor swaps the cursor's arrow for a label. */
  function fill(face, s) {
    const tpl = templates.find((t) => Number(t.dataset.card) === s);
    face.replaceChildren(tpl ? tpl.content.cloneNode(true) : "");
    face.dataset.project = String(s);
    const href = tpl?.dataset.href;
    if (href) {
      face.href = href;
      face.target = "_blank";
      face.rel = "noopener";
    } else {
      face.removeAttribute("href");
      face.removeAttribute("target");
      face.removeAttribute("rel");
    }
    if (tpl?.dataset.cursor) face.dataset.cursor = tpl.dataset.cursor;
    else delete face.dataset.cursor;
  }

  /* The slab is already turning when this runs. Set the direction first
     and flush, so the incoming background starts closed on the correct
     edge, then swap the classes: incoming .is-on wipes in over the
     outgoing .is-off (see the Backgrounds block in site.css). */
  function paintScene(prev, dir, animate) {
    page.dataset.project = String(step);
    // Apply the direction with transitions off and flush, so the hidden
    // layers snap to that direction's closed state instead of starting
    // a transition towards it (which the class swap below would retarget).
    page.classList.add("is-instant");
    page.dataset.dir = dir < 0 ? "back" : "forward";
    void page.offsetHeight;
    if (animate) page.classList.remove("is-instant");
    bgs.forEach((b) => {
      const n = Number(b.dataset.project);
      b.classList.toggle("is-on", n === step);
      b.classList.toggle("is-off", animate && n === prev && prev !== step);
    });
    if (!animate) {
      void page.offsetHeight;
      page.classList.remove("is-instant");
    }
    if (live) {
      engines[step]?.start();
      clearTimeout(stopTimer);
      if (prev !== step) {
        stopTimer = setTimeout(() => {
          if (prev !== step) engines[prev]?.stop();
        }, PAGE_MS + 300);
      }
    }
  }

  // initial face
  fill(faces[0], 0);
  fill(faces[1], 1);

  return {
    theme: (s) => THEMES[s] || "dark",
    start() {
      live = true;
      paintScene(step, 1, false);
    },
    stop() {
      live = false;
      clearTimeout(stopTimer);
      engines.forEach((e) => e?.stop());
    },
    setStep(s, dir, animate) {
      const prev = step;
      step = s;
      const moving = animate && !reducedMotion?.matches && prev !== s;
      if (!moving) {
        fill(faces[frontIndex()], s);
      } else {
        fill(faces[1 - frontIndex()], s);
        angle += (dir >= 0 ? 1 : -1) * 180;
        inner.style.setProperty("--flip-angle", `${angle}deg`);
      }
      paintScene(prev, dir, moving);
    },
  };
}

/* =====================================================================
   PAGER — one gesture, one move. A move is either the next step inside
   the current page (About, Projects) or the next page. Moves .pages by
   whole viewports, marks pages .is-active / .is-above / .is-below for the
   CSS choreography, and drives dots, hash, theme and the controllers.
   ===================================================================== */
(function pager() {
  const track = document.getElementById("pages");
  const pages = track ? [...track.querySelectorAll(".page")] : [];
  if (!track || pages.length < 2) return;

  const dots = document.getElementById("dots");
  const dotEls = dots ? [...dots.querySelectorAll(".dots__dot")] : [];
  const STEP_MS = 1000;
  const COOLDOWN = 900;  // after a move: ignore the momentum tail this long
  const THRESHOLD = 10;  // wheel delta needed to trigger a move (one or two events)

  const ctrl = pages.map((page) => {
    switch (page.dataset.bg) {
      case "hero": return makeHero();
      case "edges": return makeEdgeWaves(page);
      case "about": return makeAbout(page);
      case "projects": return makeProjects(page);
      default: return null;
    }
  });
  const stepsOf = (i) => Math.max(1, Number(pages[i].dataset.steps) || 1);
  const stepIds = (i) => (pages[i].dataset.stepIds || "").split(",").map((s) => s.trim()).filter(Boolean);
  const stepLabels = (i) => (pages[i].dataset.stepLabels || "").split("|").map((s) => s.trim()).filter(Boolean);

  let index = 0;
  let step = 0;
  let locked = false;
  let quietUntil = 0;
  let acc = 0;
  let accTimer = 0;
  let lastWheelAt = 0;
  let lastWheelMag = 0;

  function paintTrack(instant) {
    track.classList.toggle("is-instant", !!instant);
    track.style.transform = `translate3d(0, ${-index * 100}%, 0)`;
    pages.forEach((p, i) => {
      p.classList.toggle("is-active", i === index);
      p.classList.toggle("is-above", i < index);
      p.classList.toggle("is-below", i > index);
    });
    if (instant) {
      void track.offsetHeight; // flush so the next transform animates again
      track.classList.remove("is-instant");
    }
  }

  function paintChrome() {
    const page = pages[index];
    html.dataset.theme = ctrl[index]?.theme?.(step) || page.dataset.theme || "dark";
    html.dataset.page = page.id;
    const n = stepsOf(index);
    const labels = stepLabels(index);
    dots?.classList.toggle("is-visible", n > 1);
    dotEls.forEach((d, k) => {
      d.hidden = k >= n;
      const active = k === step;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-current", active ? "true" : "false");
      if (labels[k]) d.setAttribute("aria-label", labels[k]);
    });
    const id = stepIds(index)[step] || page.id;
    if (id) history.replaceState(null, "", `#${id}`);
  }

  function lock(ms) {
    locked = true;
    quietUntil = performance.now() + ms + COOLDOWN;
    setTimeout(() => { locked = false; }, ms);
  }

  /* Move to page n, landing on `landStep` (0 from above, last from below). */
  function goPage(n, landStep, opts = {}) {
    n = Math.max(0, Math.min(pages.length - 1, n));
    if (n === index && !opts.force) return false;
    if (locked && !opts.instant) return false;
    const prev = index;
    index = n;
    step = Math.max(0, Math.min(stepsOf(n) - 1, landStep ?? 0));
    ctrl[index]?.setStep?.(step, 0, false);
    ctrl[index]?.start();
    paintTrack(opts.instant);
    paintChrome();
    document.dispatchEvent(new CustomEvent("pager:move"));
    window.scrollTo(0, 0);
    if (opts.instant) {
      if (prev !== index) ctrl[prev]?.stop();
      return true;
    }
    lock(PAGE_MS);
    setTimeout(() => { if (prev !== index) ctrl[prev]?.stop(); }, PAGE_MS);
    return true;
  }

  function goStep(s) {
    s = Math.max(0, Math.min(stepsOf(index) - 1, s));
    if (s === step || locked) return false;
    const dir = s > step ? 1 : -1;
    step = s;
    ctrl[index]?.setStep?.(step, dir, true);
    paintChrome();
    document.dispatchEvent(new CustomEvent("pager:move"));
    lock(STEP_MS);
    return true;
  }

  function next() {
    if (step < stepsOf(index) - 1) goStep(step + 1);
    else goPage(index + 1, 0);
  }
  function prev() {
    if (step > 0) goStep(step - 1);
    else goPage(index - 1, stepsOf(Math.max(0, index - 1)) - 1);
  }

  /* Resolve "#id" to a page and step: page ids first, then step ids. */
  function locate(id) {
    const p = pages.findIndex((pg) => pg.id === id);
    if (p >= 0) return { page: p, step: 0 };
    for (let i = 0; i < pages.length; i++) {
      const s = stepIds(i).indexOf(id);
      if (s >= 0) return { page: i, step: s };
    }
    return null;
  }
  function goTo(id, opts) {
    const at = locate(id);
    if (!at) return false;
    if (at.page === index) return goStep(at.step);
    return goPage(at.page, at.step, opts);
  }

  /* wheel. A move fires on the first event or two of a gesture. After a
     move, the trackpad keeps sending a decaying momentum tail; those are
     ignored during the cooldown, but a fresh gesture (a pause since the
     last event, or a delta that jumps well above the tail) cuts the
     cooldown short so the site never feels like it is ignoring you. */
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = performance.now();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      const mag = Math.abs(dy);
      const fresh = now - lastWheelAt > 140 || mag > lastWheelMag * 1.8 + 4;
      lastWheelAt = now;
      lastWheelMag = mag;
      if (locked) {
        acc = 0;
        return;
      }
      if (now < quietUntil) {
        if (!fresh) {
          acc = 0;
          return;
        }
        quietUntil = 0;
      }
      acc += dy;
      clearTimeout(accTimer);
      accTimer = setTimeout(() => (acc = 0), 150);
      if (Math.abs(acc) >= THRESHOLD) {
        const dir = acc > 0 ? 1 : -1;
        acc = 0;
        dir > 0 ? next() : prev();
      }
    },
    { passive: false }
  );

  /* keys */
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        next();
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goPage(0, 0);
        break;
      case "End":
        e.preventDefault();
        goPage(pages.length - 1, stepsOf(pages.length - 1) - 1);
        break;
    }
  });

  /* touch */
  let touchY = null;
  window.addEventListener("touchstart", (e) => { touchY = e.touches[0]?.clientY ?? null; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (touchY == null) return;
    const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
    touchY = null;
    if (Math.abs(dy) > 50) dy > 0 ? next() : prev();
  }, { passive: true });
  window.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

  /* dots */
  dotEls.forEach((d) => d.addEventListener("click", () => goStep(Number(d.dataset.step))));

  /* in-page links: anything pointing at a page id or a step id */
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id || !locate(id)) return;
    e.preventDefault();
    goTo(id);
  });

  /* keep engines honest on resize */
  window.addEventListener("resize", () => {
    ctrl[index]?.stop();
    ctrl[index]?.start();
  }, { passive: true });

  /* initial page from the hash */
  const at = locate(location.hash.slice(1));
  goPage(at?.page ?? 0, at?.step ?? 0, { instant: true, force: true });

  /* Dock: "About me" and "Projects" swap the link row for their own
     options in place. The row cell animates to the live panel's width.
     Picking an option navigates (the in-page link handler above) and the
     row returns to the main set a beat later. Escape or a click outside
     the bar also return it. */
  (function dock() {
    const nav = document.querySelector("[data-dock-nav]");
    if (!nav) return;
    const panels = [...nav.querySelectorAll(".dock__panel")];
    let current = "main";
    const fit = () => {
      const p = panels.find((x) => x.dataset.panel === current);
      if (p) nav.style.setProperty("--nav-w", `${Math.ceil(p.getBoundingClientRect().width)}px`);
    };
    const show = (name) => {
      current = name;
      panels.forEach((p) => p.classList.toggle("is-on", p.dataset.panel === name));
      fit();
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit, { passive: true });
    nav.addEventListener("click", (e) => {
      const t = e.target instanceof Element ? e.target : null;
      const open = t?.closest("[data-open]");
      if (open) { show(open.dataset.open); return; }
      if (t?.closest("[data-close]")) { show("main"); return; }
      const link = t?.closest("a.dock__link");
      if (link && link.closest(".dock__panel")?.dataset.panel !== "main") setTimeout(() => show("main"), 450);
    });
    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Element && e.target.closest(".dock"))) show("main");
    });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") show("main"); });
  })();

  // Exposed for tuning from the console.
  window.__pager = {
    go: (n, s = 0) => goPage(n, s),
    goTo,
    next,
    prev,
    get index() { return index; },
    get step() { return step; },
  };
})();
