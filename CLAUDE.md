# CLAUDE.md — Portfolio Website
*Maneet Kohli's personal portfolio site. Pure HTML/CSS/JS. No framework, no build tool.*
*Last updated: September 8, 2026*

---

## What This Is

A dark, cinematic, single-page portfolio built as a stack of full-viewport **pages** moved by a JS pager: one wheel gesture, swipe, arrow key, or dot click equals one move. Vanilla HTML, CSS, and JavaScript. One stylesheet, one script, one external library (Paper Shaders, loaded from jsDelivr as an ES module). Git on `main`.

Live at: `maneetkohli.com`
Working directory: `/Users/maneetkohli/Desktop/ALG/PROFESSIONAL-HUB/PORTFOLIO/`

**v1 is archived.** The old multi-page site (arc hero, nav dropdowns, `about.html`, `projects/*`, `experience/*`) lives on git branch `archive/v1`. Its files (`css/styles.css`, `js/main.js`, the subpage HTML) are still in the tree only so old links resolve. Do not build on them. Everything below describes v2.

Desktop first. Mobile is deliberately out of scope until asked.

---

## Tech Stack

| Layer | Detail |
|---|---|
| Markup | `index.html` (the whole site) |
| Styles | `css/site.css` (~1,500 lines) |
| Script | `js/site.js` (~1,150 lines, ES module) |
| Shader | `@paper-design/shaders@0.0.80` GrainGradient via `https://cdn.jsdelivr.net/npm/...+esm`. The only approved external lib. |
| Fonts | Archivo 900 (wdth 100–125, display) + Inter 400/500 (body) + Instrument Serif italic (accents, ribbon) via Google Fonts |
| Hosting | Static (maneetkohli.com) |
| Preview | `.claude/launch.json` → "Portfolio Static Server" (python3 http.server, port 8080) |

No transpilation, no PostCSS, no Sass, no npm. What you write is what ships.

---

## Page Map

Pages are `<section class="page">` inside `<main class="pages" id="pages">`, in this order. A page can declare `data-steps="N"` to hold several states; gestures step through them before moving to the next page.

| # | id | Steps (hash ids) | Controller in site.js | What it is |
|---|---|---|---|---|
| 0 | `#hero` | — | `makeHero` | Wave shader, split name MANEET / KOHLI, figure, torso cycle + scroll prompt |
| 1 | `#bio` | — | `makeEdgeWaves` | One bold six-line statement between two white edge waves |
| 2 | `#about` | `#vision` `#me` `#people` | `makeAbout` | Photo helix left, copy right; each step scrolls the helix and swaps the copy |
| 3 | `#projects` | `#youtube` `#bani-ai` `#regal` | `makeProjects` | One flipping glass slab; backgrounds and ribbon crossfade per step |

Landing rules: arriving from above lands on step 0, arriving from below lands on the last step. Deep links work for both page ids and step ids. The hash is kept in sync with `history.replaceState`.

Fixed chrome outside the track: `.dock` (top nav), `.dots` (step dots, shown only on pages with steps), `.edge-blur` (bottom progressive blur), `.cursor` (inverting dot).

---

## How the Pager Works (`js/site.js`)

- State is `(index, step)`. `next()` / `prev()` step inside the page first, then change page.
- Page moves translate `.pages` by whole viewports (`transform`, 1.1s, `cubic-bezier(0.76, 0, 0.24, 1)`). Steps take 1.0s. A 1.2s cooldown absorbs trackpad momentum.
- Every page gets one of three classes: `.is-active`, `.is-above` (already passed), `.is-below` (still to come). **All enter/leave choreography is CSS transitions keyed off those classes.** Look in `site.css` from the "PAGE STATES" banner onward.
- Controllers expose `{ start, stop, setStep(step, dir, animate), theme(step) }`. Only the active page's engine runs. `theme` sets `html[data-theme]` (Regal is `light`).
- Console handles: `window.__pager.go(page, step)`, `.goTo('hash-id')`, `.next()`, `.prev()`, `.index`, `.step`. Shader mounts: `__wave` (hero), `__edges` (bio, array of two), `__nebula` (Bani AI). Tune with `mount.setUniforms({ u_scale, u_offsetY, ... })`.

---

## Hero (page 0)

- **Wave**: GrainGradient `shape: "wave"`, params copied from midu.design, white palette. Static CSS fallback if WebGL fails (`.is-fallback`).
- **Name**: Archivo 900 / 125 wdth, `mix-blend-mode: difference`, one word in each gutter beside the turban. Size is computed in `:root` from the figure width; do not hardcode.
- **Figure**: `images/hero-figure.png`, real alpha, bottom-anchored, masked so the head is solid and the torso lets the wave ghost through. Wrapped in `.hero__figure-wrap` so the exit transform never fights the load animation.
- **Exit** (page `.is-above`), copied from tanweer.framer.ai: `.hero__name` translates up ~58vh and blurs out (about 1.5× page speed), `.hero__figure-wrap` lags 26vh and dissolves (about 0.75×), the wave canvas dims, `.hero-status__inner` leaves first. Reversed on return.
- Load animations (`name-in`, `figure-in`, `wave-in`, `dock-in`) use `animation-fill-mode: forwards`. **Never put an exit transform on an element that owns a load animation**; put it on a wrapper.

## Bio (page 1)

- `.bio__statement`: six `.bio__line` spans with hand-placed breaks and `white-space: nowrap`. Keep each line under ~28 characters or it overflows at 4.7vw. `.bio__accent` is Instrument Serif italic.
- Odd lines enter from the left, even from the right, staggered 60ms. Kicker "Hello, I'm Maneet" fades up.
- Edge waves: the hero shader (`EDGE_WAVE` params: scale 1.55, offsetY 0.58) mounted in two `.bio__wave-host` boxes sized 100vh × 100vw and rotated ±90° so the wave band lands on the left / right screen edge, then masked to fade toward the centre. Mounted lazily on first visit, paused when off page.

## About (page 2)

- **Helix**: 24 `.helix__photo` figures in `[data-helix]`, 8 per step in order vision → what I do → my people. Photos live in `images/about/helix/{v,d,p}1-8.jpg` (480×600 portrait or 600×480 landscape crops; add `helix__photo--land` for landscape). Two strands (odd/even index), one `.helix__rung` per pair, real 3D via `perspective` on `.helix`. Idle spin 0.11 rad/s; each step tweens the visible band up one group with an extra 0.9 rad twist. Depth shading via `--shade` on the figure's `::after`.
- **Copy**: three `.about__block` articles stacked in one grid cell; `.is-current / .is-prev / .is-next` move them ±9vh with blur. Text is Maneet's v1 "Who I Am" copy, rewritten without em dashes. It speaks as him; read `ALG/voice-principles.md` before editing it.
- To add a photo group: 8 more images, 8 more figures, bump `data-steps`, `data-step-ids`, `data-step-labels`, and add a block.

## Projects (page 3)

- **Slab**: `.flip > .flip__inner` rotates about X by `--flip-angle` in 180° increments (accumulates, never resets). `.flip__face--a` is in flow and sets the height; `.flip__face--b` is pre-rotated 180° behind it; two `.flip__edge` hairlines give it 14px of thickness. Before each flip the hidden face is filled from `<template data-card="N">`, so the card content for each project lives in those templates in `index.html`.
- **Backgrounds**: three `.project__bg` layers (sky canvas, nebula shader + star canvas, paper grain + SVG planes) crossfade with `.is-on`. Engines: `makeSky`, `makeGalaxy`, `makePlanes`. Only the current one runs; the previous stops after the 1.1s crossfade.
- **Ribbons**: three `.ribbon` layers, `.is-on` fades and lifts the active one.
- **Theme**: `page.dataset.project` drives the light palette for Regal via `.page--projects[data-project="2"]`; `html[data-theme]` recolours the dots.
- **Clouds**: pre-rendered sprites. Puffs sit under a dome envelope, base is flattened with a `destination-out` gradient, underside shaded with `source-atop`, then one blur pass. The sprite canvas is sized from the puffs plus padding so nothing clips. If clouds look wrong, fix `sprite()` in `makeSky`, not the draw loop.
- Placeholders: card tags say `Demo`, ↗ links point at `#`, previews are empty tinted panels. Journal and Contact in the dock go nowhere yet.

---

## CSS Conventions

- **Tokens** live in `:root` blocks next to the section that uses them (`--edge`, `--figure-h`, `--name-size`, `--page-ease`, `--page-ms`, `--card-w`, `--helix-photo-h`, `--slab-depth`, …). Reference the variable; never hardcode a duplicate.
- **BEM**: `.block__element--modifier`. State classes are `is-*`.
- **z-maps** are documented in comments above each section (hero, page level, projects). Read them before adding a stacked element; never move existing values.
- **Motion**: transitions use `var(--page-ease)` and `var(--page-ms)` so everything rides the same curve as the track. `prefers-reduced-motion` collapses all of it; keep that block current when adding transitions.

---

## ⚠️ Cache-Busting — CRITICAL

`index.html` links `css/site.css?v=12` and `js/site.js?v=4`. **Whenever you touch either file, bump its number in `index.html`** or the browser serves stale code. (The legacy `styles.css?v=` / `main.js?v=` numbers on the archived subpages no longer matter.)

```bash
grep -n 'site.css?v=\|site.js?v=' index.html
```

---

## Images

```
images/hero-figure.png        hero photo, real alpha
images/signature.png          dock signature (white ink)
images/favicon.svg            MK monogram
images/about/helix/           24 helix crops (v1-8, d1-8, p1-8)
images/about/home/            source photos (v1 collage), keep
images/about/about-main/      raw staging photos, huge originals, keep out of the page
images/heroes/, projects/, bcom/, hero*.png, mountain-bg.png, Video/   v1 assets, unused by v2
```

Make new helix crops with PIL: `ImageOps.exif_transpose`, then `ImageOps.fit` to 480×600 (portrait) or 600×480 (landscape), JPEG quality 84.

---

## Verifying Motion

The Claude desktop Browser pane usually runs hidden and **freezes CSS animation clocks and requestAnimationFrame while hidden**. Screenshots then show only settled states, never mid-transition frames, and pager locks (setTimeout) release late. To check choreography: call `window.__pager.goTo(id)` in one `javascript_tool` call, immediately `pause()` the resulting `CSSTransition`s from `document.getAnimations()`, set `currentTime` to sample points, and read `getComputedStyle`. Leave about 3s between pager calls. For real feel, open the site in a visible browser.

---

## Rules

- No frameworks. No npm. No build tools. Keep it vanilla. Paper Shaders is the one approved external library; adding another needs explicit approval.
- Always bump `?v=N` in `index.html` when touching `site.css` or `site.js`.
- Preserve the z-maps and the `.is-active / .is-above / .is-below` convention. New page choreography goes in CSS off those classes, not in JS.
- New pages: add a `<section class="page" id="…" data-bg="…">`, a controller case in the pager's `switch`, and enter/leave rules in CSS. Steps need `data-steps`, `data-step-ids`, `data-step-labels`.
- Do not edit the archived v1 files or link to `bio-brainstorm.html` / `projects-brainstorm.html`.
- Copy on the site speaks as Maneet. Read `ALG/voice-principles.md` first. No em dashes.
- Commit after every meaningful change with a specific message (see `git log` for tone). No AI attribution anywhere.
