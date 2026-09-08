# CLAUDE.md — Portfolio Website
*Maneet Kohli's personal portfolio site. Pure HTML/CSS/JS. No framework, no build tool.*
*Last updated: September 9, 2026*

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
| Fonts | Archivo 900 (wdth 100–125, display) + Inter 400/500 (body) + Instrument Serif italic (bio accent) via Google Fonts |
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
| 2 | `#projects` | `#youtube` `#bani-ai` `#regal` `#resume-agent` | `makeProjects` | One flipping glass slab; each step is a page turn (slab flips, background wipes after it) |
| 3 | `#about` | `#vision` `#me` `#people` | `makeAbout` | Photo helix left, copy right; each step scrolls the helix and swaps the copy |

Landing rules: arriving from above lands on step 0, arriving from below lands on the last step. Deep links work for both page ids and step ids. The hash is kept in sync with `history.replaceState`.

Fixed chrome outside the track: `.dock` (top nav), `.dots` (step dots, shown only on pages with steps), `.edge-blur` (bottom progressive blur), `.hero-status` (cycling line + scroll prompt, z 56 so it sits above the blur; leaves via `html[data-page]`), `.cursor` (inverting dot).

---

## How the Pager Works (`js/site.js`)

- State is `(index, step)`. `next()` / `prev()` step inside the page first, then change page.
- Page moves translate `.pages` by whole viewports (`transform`, 1.1s, `--page-ease` = `cubic-bezier(0.45, 0, 0.2, 1)`, a quick ramp so motion shows within ~150ms). Steps take 1.0s.
- Wheel: a move fires at 10 units of `deltaY` (one or two trackpad events). After a move a 0.9s cooldown ignores the decaying momentum tail, but a fresh gesture (140ms pause, or a delta jumping well above the tail) cuts the cooldown short. `PAGE_EASE` in JS must match `--page-ease`.
- Every page gets one of three classes: `.is-active`, `.is-above` (already passed), `.is-below` (still to come). **All enter/leave choreography is CSS transitions keyed off those classes.** Look in `site.css` from the "PAGE STATES" banner onward.
- Controllers expose `{ start, stop, setStep(step, dir, animate), theme(step) }`. Only the active page's engine runs. `theme` sets `html[data-theme]` (currently always `dark`; the hook is there for a future light page).
- Console handles: `window.__pager.go(page, step)`, `.goTo('hash-id')`, `.next()`, `.prev()`, `.index`, `.step`. Shader mounts: `__wave` (hero), `__edges` (bio, array of two), `__nebula` (Bani AI). Tune with `mount.setUniforms({ u_scale, u_offsetY, ... })`. `__resume.paint()` renders the Resume Agent columns finished.

## Dock

- Links: Home (`#hero`), About me, Projects. Contact is still a placeholder. No Journal.
- `.dock__nav` stacks three `.dock__panel` rows in one grid cell (`grid-template-columns: minmax(0, 1fr)` so a wider hidden row never stretches the track). Clicking **About me** or **Projects** swaps the row in place (no dropdown): a dim crumb with the clicked label (click to go back), then the destinations. About me → **Hello there** (`#bio`), **About me** (`#vision`, always the first About step). Projects → **Authentic Intelligence** (`#youtube`), **Bani AI**, **Regal Internship**, **Resume Agent**. The `dock()` IIFE inside the pager measures the live panel and animates `--nav-w` so the bar grows and shrinks to fit (re-measured on fonts ready and resize). Picking an option navigates and the row returns to the main set ~0.45s later; Escape or a click outside also returns it.

---

## Hero (page 0)

- **Wave**: GrainGradient `shape: "wave"`, params copied from midu.design, white palette. Static CSS fallback if WebGL fails (`.is-fallback`).
- **Name**: Archivo 900 / 125 wdth, `mix-blend-mode: difference`, one word in each gutter beside the turban. Size is computed in `:root` from the figure width; do not hardcode.
- **Figure**: `images/hero-figure.png`, real alpha, bottom-anchored, masked so the head is solid and the torso lets the wave ghost through. Wrapped in `.hero__figure-wrap` so the exit transform never fights the load animation.
- **Exit** (page `.is-above`), copied from tanweer.framer.ai: `.hero__name` translates up ~58vh and blurs out (about 1.5× page speed), `.hero__figure-wrap` lags 26vh and dissolves (about 0.75×), the wave canvas dims. `.hero-status__inner` (fixed chrome, not in the track) leaves first via `html[data-page]:not([data-page="hero"])`. Reversed on return.
- Load animations (`name-in`, `figure-in`, `wave-in`, `dock-in`) use `animation-fill-mode: forwards`. **Never put an exit transform on an element that owns a load animation**; put it on a wrapper.

## Bio (page 1)

- `.bio__statement`: six `.bio__line` spans with hand-placed breaks and `white-space: nowrap`. Keep each line under ~28 characters or it overflows at 4.7vw. `.bio__accent` is Instrument Serif italic.
- Odd lines enter from the left, even from the right, staggered 60ms. Kicker "Hello, I'm Maneet" fades up.
- Edge waves: the hero shader (`EDGE_WAVE` params: scale 1.55, offsetY 0.58) mounted in two `.bio__wave-host` boxes sized 100vh × 100vw and rotated ±90° so the wave band lands on the left / right screen edge, then masked to fade toward the centre. Mounted lazily on first visit, paused when off page.

## About (page 3)

- **Helix**: 24 `.helix__photo` figures in `[data-helix]`, 8 per step in order vision → what I do → my people. Photos live in `images/about/helix/{v,d,p}1-8.jpg` (480×600 portrait or 600×480 landscape crops; add `helix__photo--land` for landscape). Two strands (odd/even index), one `.helix__rung` per pair, real 3D via `perspective` on `.helix`. Idle spin 0.11 rad/s; each step tweens the visible band up one group with an extra 0.9 rad twist. Depth shading via `--shade` on the figure's `::after`.
- **Copy**: three `.about__block` articles stacked in one grid cell; `.is-current / .is-prev / .is-next` move them ±9vh with blur. Text is Maneet's v1 "Who I Am" copy, rewritten without em dashes. It speaks as him; read `ALG/voice-principles.md` before editing it.
- To add a photo group: 8 more images, 8 more figures, bump `data-steps`, `data-step-ids`, `data-step-labels`, and add a block.

## Projects (page 2)

Four projects in step order: Authentic Intelligence (YouTube), Bani AI, Regal Internship, Resume Agent.

- **Slab**: `.flip > .flip__inner` rotates about X by `--flip-angle` in 180° increments (accumulates, never resets). `.flip__face--a` is in flow and sets the height; `.flip__face--b` is pre-rotated 180° behind it; two `.flip__edge` hairlines give it 14px of thickness. Before each flip the hidden face is filled from `<template data-card="N">`. Card content lives in those templates in `index.html`. **The card palette is the same dark glass on every project**; no per-project card colours. There is no ↗ link button on the card; the link affordance is the cursor (below).
- **Card cursor** (utomic.framer.website pattern): hovering a `.card` adds `.is-card` to `#cursor`, which grows the dot to 112px (`--cur`), turns off `mix-blend-mode`, frosts it (`backdrop-filter`), fades in `.cursor__ring` (SVG circle, dashed stroke, spinning 9s) and `.cursor__arrow` (↗). Toggled in the `cursor()` IIFE from `pointermove`.
- **Page turn**: the slab starts flipping at 0. The incoming `.project__bg` gets `.is-on` (z 2) and wipes over the outgoing `.is-off` (z 1, unmasked) with a soft-edged mask: a gradient three viewports tall whose `mask-position` slides one viewport, 0.85s on `--page-ease` after a 0.3s delay, so the slab is visibly turning before the background moves. `page.dataset.dir` (`forward`: bottom to top, `back`: top to bottom) picks the mask direction; `paintScene` sets it with `.is-instant` on and flushes before swapping classes, otherwise the hidden layer starts a transition towards the closed state and the swap retargets from the wrong value. Layers that are neither on nor off are `visibility: hidden`. Landing on the page uses `.is-instant` (no wipe).
- **No ribbons.** The drifting serif name carousels were removed (Sept 9, 2026); the page is background + slab only.
- **Backgrounds**: four `.project__bg` layers. Engines: `makeSky`, `makeGalaxy`, `makePlanes`, `makeResume`. Only the current one runs; the previous stops 1.4s after the step.
- **Sky** (Authentic Intelligence): gradient, cloud canvas, then `.sky__hills`, an inline SVG (viewBox 1440×420, `preserveAspectRatio="none"`, 36vh tall, min 220px) pinned to the bottom over the clouds: three rolling hill paths lit from the top right (yellow-green `#d9dc4c` ridges down to olive `#43602e` shadow, `userSpaceOnUse` gradients), a radial sun patch on the far ridge, and an `feTurbulence` grain rect multiplied over the hills for grass. Edit the paths and stops in `index.html`.
- **Resume Agent** (`makeResume`): white sheet (`#f7f7f7`), three grey columns typing themselves in word-sized chunks (the resume, the agent's trace in monospace behind the slab, the cover letter), each holding, fading and restarting on a stagger. Content is the `RESUME_DOC` / `TRACE_DOC` / `LETTER_DOC` arrays of `[kind, text]`; kinds map to `.resume__line--{kind}`. The text is decoration only: `.resume` is blurred 3.2px and the name / heading / role lines carry extra blur so nothing is legible, just the shape of a document being written. `.resume__glow` whitens the area behind the slab. Reduced motion paints everything at once.
- **Theme**: every project reports `dark`; the dots stay white on all four. The faces still get `data-project="N"` from `fill()` but nothing styles on it now.
- **Clouds**: pre-rendered sprites. Puffs sit under a dome envelope, base is flattened with a `destination-out` gradient, underside shaded with `source-atop`, then one blur pass. The sprite canvas is sized from the puffs plus padding so nothing clips. If clouds look wrong, fix `sprite()` in `makeSky`, not the draw loop.
- Placeholders: card tags say `Demo`, ↗ links point at `#`, previews are empty tinted panels. Contact in the dock goes nowhere yet.

---

## CSS Conventions

- **Tokens** live in `:root` blocks next to the section that uses them (`--edge`, `--figure-h`, `--name-size`, `--page-ease`, `--page-ms`, `--card-w`, `--helix-photo-h`, `--slab-depth`, …). Reference the variable; never hardcode a duplicate.
- **BEM**: `.block__element--modifier`. State classes are `is-*`.
- **z-maps** are documented in comments above each section (hero, page level, projects). Read them before adding a stacked element; never move existing values.
- **Motion**: transitions use `var(--page-ease)` and `var(--page-ms)` so everything rides the same curve as the track. `prefers-reduced-motion` collapses all of it; keep that block current when adding transitions.

---

## ⚠️ Cache-Busting — CRITICAL

`index.html` links `css/site.css?v=20` and `js/site.js?v=10`. **Whenever you touch either file, bump its number in `index.html`** or the browser serves stale code. (The legacy `styles.css?v=` / `main.js?v=` numbers on the archived subpages no longer matter.)

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

The Claude desktop Browser pane usually runs hidden and **freezes CSS animation clocks and requestAnimationFrame while hidden**. Screenshots then show only settled states, never mid-transition frames, and pager locks (setTimeout) release late. To check choreography: call `window.__pager.goTo(id)` in one `javascript_tool` call, immediately `pause()` the resulting `CSSTransition`s from `document.getAnimations()`, set `currentTime` to sample points, and read `getComputedStyle`. Leave about 3s between pager calls. Caveat: a transition started earlier and frozen at its start value is what the next transition on that property retargets *from*, so a sampled value can read as the stale one (e.g. a `transform` reading identity when CSS says 5vh). Reload between choreography checks, and for real feel open the site in a visible browser.

---

## Rules

- No frameworks. No npm. No build tools. Keep it vanilla. Paper Shaders is the one approved external library; adding another needs explicit approval.
- Always bump `?v=N` in `index.html` when touching `site.css` or `site.js`.
- Preserve the z-maps and the `.is-active / .is-above / .is-below` convention. New page choreography goes in CSS off those classes, not in JS.
- New pages: add a `<section class="page" id="…" data-bg="…">`, a controller case in the pager's `switch`, and enter/leave rules in CSS. Steps need `data-steps`, `data-step-ids`, `data-step-labels`.
- Do not edit the archived v1 files or link to `bio-brainstorm.html` / `projects-brainstorm.html`.
- Copy on the site speaks as Maneet. Read `ALG/voice-principles.md` first. No em dashes.
- Commit after every meaningful change with a specific message (see `git log` for tone). No AI attribution anywhere.
