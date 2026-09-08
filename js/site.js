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
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

function pixelBudget() {
  // midu's rule: heavy screens get a lower pixel cap.
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth || 0;
  const h = window.innerHeight || 0;
  return dpr >= 2 || w * h * dpr * dpr > 4e6 ? 1.6e6 : 2.6e6;
}

/* One GrainGradient mount. Used by the hero wave and the Bani AI nebula. */
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

const host = document.getElementById("hero-wave");
mountGrain(host, WAVE, WAVE_COLORS, WAVE_SPEED)
  .then((mount) => {
    // Exposed for live tuning from the console.
    window.__wave = mount;
  })
  .catch((err) => {
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

/* =====================================================================
   BACKGROUND ENGINES — one per project page. Each returns
   { start, stop }. Only the active page runs; the pager below drives it.
   ===================================================================== */
const rand = (a, b) => a + Math.random() * (b - a);

/* ---- Sky: layered clouds drifting across a gradient ------------------ */
function makeSky(canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, clouds = [], raf = 0, last = 0;

  // Each cloud is a cluster of soft radial puffs, pre-rendered once.
  function sprite(r) {
    const size = Math.ceil(r * 3);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const puffs = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < puffs; i++) {
      const px = size / 2 + (Math.random() - 0.5) * r * 1.7;
      const py = size / 2 + (Math.random() - 0.5) * r * 0.6 + r * 0.12;
      const pr = r * (0.42 + Math.random() * 0.5);
      const grad = g.createRadialGradient(px, py, 0, px, py, pr);
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.55, "rgba(255,255,255,0.5)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(px, py, pr, 0, Math.PI * 2);
      g.fill();
    }
    return c;
  }

  function build() {
    clouds = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const depth = Math.pow(Math.random(), 1.4); // more small, far clouds
      const r = 50 + depth * 150;
      const img = sprite(r);
      clouds.push({
        depth,
        img,
        size: img.width,
        x: rand(-img.width, w),
        y: rand(-0.05 * h, 0.72 * h),
        speed: 5 + depth * 20,
        alpha: 0.3 + depth * 0.6,
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

  function frame(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (const c of clouds) {
      c.x += c.speed * dt;
      if (c.x > w + 20) c.x = -c.size;
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(c.img, c.x, c.y);
    }
    ctx.globalAlpha = 1;
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
        // one still frame
        ctx.clearRect(0, 0, w, h);
        for (const c of clouds) {
          ctx.globalAlpha = c.alpha;
          ctx.drawImage(c.img, c.x, c.y);
        }
        ctx.globalAlpha = 1;
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

/* =====================================================================
   PAGER — one gesture, one page. Moves .pages by whole viewports and
   locks during the transition so trackpad momentum can't skip ahead.
   Drives the dots, the hash, the html theme, and the background engines.
   ===================================================================== */
(function pager() {
  const track = document.getElementById("pages");
  const pages = track ? [...track.querySelectorAll(".page")] : [];
  if (!track || pages.length < 2) return;

  const dots = document.getElementById("dots");
  const dotEls = dots ? [...dots.querySelectorAll(".dots__dot")] : [];
  const DURATION = 950;
  const COOLDOWN = 1250; // absorbs momentum after a page change
  const THRESHOLD = 40;  // wheel delta needed to trigger a page

  // Background engines, keyed by page index.
  const engines = pages.map((page) => {
    switch (page.dataset.bg) {
      case "sky": return makeSky(page.querySelector("[data-sky]"));
      case "galaxy": return makeGalaxy(page.querySelector("[data-nebula]"), page.querySelector("[data-stars]"));
      case "paper": return makePlanes(page.querySelector("[data-planes]"));
      default: return null;
    }
  });

  let index = 0;
  let locked = false;
  let quietUntil = 0;
  let acc = 0;
  let accTimer = 0;

  function paint(instant) {
    track.classList.toggle("is-instant", !!instant);
    track.style.transform = `translate3d(0, ${-index * 100}%, 0)`;
    if (instant) {
      // flush so the next transform animates again
      void track.offsetHeight;
      track.classList.remove("is-instant");
    }
    const page = pages[index];
    document.documentElement.dataset.theme = page.dataset.theme || "dark";
    document.documentElement.dataset.page = page.id;
    dots?.classList.toggle("is-visible", page.classList.contains("page--project"));
    dotEls.forEach((d) => {
      const active = Number(d.dataset.page) === index;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-current", active ? "true" : "false");
    });
    if (page.id) history.replaceState(null, "", `#${page.id}`);
  }

  function go(n, opts = {}) {
    n = Math.max(0, Math.min(pages.length - 1, n));
    if (n === index && !opts.force) return;
    if (locked && !opts.instant) return;
    const prev = index;
    index = n;
    engines[index]?.start();
    paint(opts.instant);
    window.scrollTo(0, 0);
    if (opts.instant) {
      if (prev !== index) engines[prev]?.stop();
      return;
    }
    locked = true;
    quietUntil = performance.now() + DURATION + COOLDOWN;
    setTimeout(() => {
      locked = false;
      if (prev !== index) engines[prev]?.stop();
    }, DURATION);
  }

  /* wheel */
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = performance.now();
      if (locked || now < quietUntil) {
        acc = 0;
        return;
      }
      acc += e.deltaY;
      clearTimeout(accTimer);
      accTimer = setTimeout(() => (acc = 0), 200);
      if (Math.abs(acc) >= THRESHOLD) {
        const dir = acc > 0 ? 1 : -1;
        acc = 0;
        go(index + dir);
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
        go(index + 1);
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        go(index - 1);
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(pages.length - 1);
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
    if (Math.abs(dy) > 50) go(index + (dy > 0 ? 1 : -1));
  }, { passive: true });
  window.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

  /* dots */
  dotEls.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.page))));

  /* in-page links: anything pointing at a page id */
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const n = pages.findIndex((p) => p.id === id);
    if (n < 0) return;
    e.preventDefault();
    go(n);
  });

  /* keep the track honest on resize (percent transform already scales) */
  window.addEventListener("resize", () => {
    engines[index]?.stop();
    engines[index]?.start();
  }, { passive: true });

  /* initial page from the hash */
  const start = pages.findIndex((p) => p.id && `#${p.id}` === location.hash);
  go(start > 0 ? start : 0, { instant: true, force: true });

  // Exposed for tuning from the console.
  window.__pager = { go, get index() { return index; } };
})();
