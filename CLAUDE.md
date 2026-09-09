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
| Fonts | Archivo 900 (wdth 100–125, display) + Inter 300/400/500 (body; 300 is the Resume Agent card wordmark) + Instrument Serif italic (bio accent) via Google Fonts |
| Hosting | Static (maneetkohli.com) |
| Preview | `.claude/launch.json` → "Portfolio Static Server" (python3 http.server, port 8080) |

No transpilation, no PostCSS, no Sass, no npm. What you write is what ships.

---

## Page Map

Pages are `<section class="page">` inside `<main class="pages" id="pages">`, in this order. A page can declare `data-steps="N"` to hold several states; gestures step through them before moving to the next page.

| # | id | Steps (hash ids) | Controller in site.js | What it is |
|---|---|---|---|---|
| 0 | `#hero` | — | `makeHero` | Wave shader, split name MANEET / KOHLI, figure, torso cycle + scroll prompt |
| 1 | `#bio` | — | `makeEdgeWaves` | Maneet's statement, five thin paragraphs between two white edge waves |
| 2 | `#projects` | `#youtube` `#bani-ai` `#regal` `#resume-agent` | `makeProjects` | One flipping glass slab; each step is a page turn (slab flips, background wipes after it) |
| 3 | `#about` | `#vision` `#me` `#people` | `makeAbout` | Photo helix left, copy right; each step scrolls the helix and swaps the copy |

Landing rules: arriving from above lands on step 0, arriving from below lands on the last step. Deep links work for both page ids and step ids. The hash is kept in sync with `history.replaceState`.

Fixed chrome outside the track: `.dock` (top nav), `.dots` (step dots, shown only on pages with steps), `.edge-blur` (bottom progressive blur), `.hero-status` (cycling line + scroll prompt, z 56 so it sits above the blur; leaves via `html[data-page]`), `.projects-status` (the same "Scroll to cycle" prompt as a `[data-next]` button, z 56, shown via `html[data-page="projects"]:not(.is-last-step)`; the pager toggles `html.is-last-step`), `.cursor` (inverting dot).

---

## How the Pager Works (`js/site.js`)

- State is `(index, step)`. `next()` / `prev()` step inside the page first, then change page.
- Pages are stacked (`position: absolute; inset: 0`, z-index by document order, later pages on top). The track never moves; each page transitions its own `transform` (1.1s, `--page-ease` = `cubic-bezier(0.45, 0, 0.2, 1)`, a quick ramp so motion shows within ~150ms). Steps take 1.0s. Three kinds of move, one per boundary, all in the "Page moves" block of `site.css`:
  - **hero → bio, slide**: the default. `.is-above` is `translateY(-100%)`, `.is-below` is `translateY(100%)`, so both pages travel one viewport like a track.
  - **bio → projects, iris**: `.page--bio.is-above` holds at `transform: none`; `.page--projects` wears a radial `mask-image` (solid to `calc(100% - var(--iris-feather))`, feather 140px) whose `mask-size` transitions 0 → 220vmax, so projects is revealed through a soft-edged circle growing from the centre. `.is-below` closes it again.
  - **projects → about, cover**: `.page--projects.is-above` holds at `transform: none`, its slab and title stay put, and a `::after` overlay dims it to 0.6; `.page--about` rises from `translateY(100%)` with a shadow along its top. Reversed on the way back.
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

- `.bio__statement`: five `.bio__line` paragraphs (Maneet's statement), one size, Inter 300 at `clamp(17px, 1.65vw, 27px)`, a 58ch column centred under the dock. Each paragraph is its own shimmer via `background-clip: text` on the `<p>` (not the `data-text` copy, so the `.bio__accent` serif italics wrap with the rest), delays staggered 0.35s per paragraph so the sweep flows down the page. No kicker any more.
- Odd lines enter from the left, even from the right, staggered 60ms. Kicker "Hello, I'm Maneet" fades up.
- Edge waves: the hero shader (`EDGE_WAVE` params: scale 1.55, offsetY 0.58) mounted in two `.bio__wave-host` boxes sized 100vh × 100vw and rotated ±90° so the wave band lands on the left / right screen edge, then masked to fade toward the centre. Mounted lazily on first visit, paused when off page.

## About (page 3)

- **Helix**: 24 `.helix__photo` figures in `[data-helix]`, 8 per step in order vision → what I do → my people. Photos live in `images/about/helix/{v,d,p}1-8.jpg` (480×600 portrait or 600×480 landscape crops; add `helix__photo--land` for landscape). Two strands (odd/even index), one `.helix__rung` per pair, real 3D via `perspective` on `.helix`. Idle spin 0.11 rad/s; each step tweens the visible band up one group with an extra 0.9 rad twist. Depth shading via `--shade` on the figure's `::after`.
- **Copy**: three `.about__block` articles stacked in one grid cell; `.is-current / .is-prev / .is-next` move them ±9vh with blur. Text is Maneet's v1 "Who I Am" copy, rewritten without em dashes. It speaks as him; read `ALG/voice-principles.md` before editing it.
- To add a photo group: 8 more images, 8 more figures, bump `data-steps`, `data-step-ids`, `data-step-labels`, and add a block.

## Projects (page 2)

Four projects in step order: Authentic Intelligence (YouTube), Bani AI, Regal Internship, Resume Agent.

- **Slab**: `.flip > .flip__inner` rotates about X by `--flip-angle` in 180° increments (accumulates, never resets). `.flip__face--a` is in flow and sets the height; `.flip__face--b` is pre-rotated 180° behind it; two `.flip__edge` hairlines give it 14px of thickness. Before each flip the hidden face is filled from `<template data-card="N">`. Card content lives in those templates in `index.html`. **The card palette is the same dark glass on every project**; no per-project card colours. There is no ↗ link button on the card; the link affordance is the cursor (below).
- **Card links**: the faces are `<a>` elements. A template's `data-href` makes the face a real link (`target=_blank`, set in `fill()`); without it the face has no `href`. Only Resume Agent links today (`https://github.com/smaneetkohli-eng/resume-agent`). A template's `data-cursor="…"` makes the hover cursor show that text instead of the arrow (Bani AI: "Releasing soon").
- **Card cursor** (utomic.framer.website pattern): hovering a `.card` adds `.is-card` to `#cursor`, which grows the dot to 112px (`--cur`), turns off `mix-blend-mode`, frosts it (`backdrop-filter`), fades in `.cursor__ring` (SVG circle, dashed stroke, spinning 9s) and `.cursor__arrow` (↗), or `.cursor__label` when the card carries `data-cursor` (`.is-label`). The `cursor()` IIFE reads the state in `apply(target)` on `pointermove`, and again on the pager's `pager:move` event (at 0 / 550 / 1200ms, via `elementFromPoint`) so a still pointer picks up the new face after a flip.
- **Title**: `.projects__title` ("Projects and Experiences") in the bio kicker's voice but bigger and bolder (Inter 600, `clamp(14px, 1.15vw, 18px)`, 0.26em tracking, uppercase, shimmer), inside a frosted pill styled like the dock so it reads on every background. The page is a three-row grid (`minmax(0,1fr) auto minmax(0,1fr)`) with `padding-top` equal to the dock's bottom edge: row 1 centres the title between dock and slab, row 2 is `.flip`, row 3 balances below. Backgrounds are absolute and out of the grid.
- **Tags are descriptions, not specs**: a few plain words on what the project is (e.g. "Tailored Resumes", "Your Own AI Agent", "For Students"). Never tech stacks. **Title Case**: capitalise every word except short connecting words (for, in, of, and, the…), first word always capitalised. Four per card, always one row: `.card__tags` sets `font-size: clamp(9px, 0.72vw, 12px)` and the tags' padding, gap and radius are in em, so the whole row scales with the card. At the narrowest card (440px) the four Bani AI tags use ~98% of the row; anything longer needs a shorter word, not a smaller font.
- **Mark previews** (`.card__preview--resume`, `.card__preview--regal`): a composed still at rest, one motion on hover, reversed on leave. SVG viewBox 220×100. Rest and hover transforms live in CSS (SVG user units), not the `transform` attribute, so both states ride one transition on `--ease-out`.
  - Resume Agent, "the editorial mark": white sheet, "RESUME AGENT" set thin (`.card__word`, Inter 300, uppercase, 0.4em tracking, black) and always legible. Behind it an 8×5 grid of `.card__cell` spans (`.card__grid`, absolute) breathes on hover: each cell fades to a faint grey (`#d8d8d8` at 0.3 opacity peak) and back, `ease-in-out`, durations 3.8–7.5s and delays up to 2.9s spread by `nth-child(5n+…)` / `nth-child(7n+…)` so nothing repeats visibly; a faint hairline grid fades in with it. The middle row (cells 17–24) is excluded from the animation entirely so the word never changes. Not a mark-and-motion preview like Regal; the motion is ambient.
  - Regal, "dispatch map", inverted: deep maroon paper (`#431118` + the page's noise, screened), cream ink (`#efe5cf`), dashed inner border. Three pins (`.card__pin`, dot + ring) at (38,66), (112,34), (186,58), two faint dotted routes between them (`.card__route--faint`, the top route pin to pin to pin and a lower arc), and the paper plane (`.card__plane`) parked beside the left pin. On hover the plane flies the top route via CSS `offset-path` (`offset-distance` 0 → 100%, 1.4s; `offset-rotate: auto 53deg` because the plane geometry's nose sits at about -53°; a `translateY(-7px) scale(0.36)` transform lifts it just above the line) while the solid route (`.card__route--live`) draws in behind it through a `pathLength="1"` dashoffset mask (`.card__route-mask`, id `rg-route`). The route path string appears three times (mask, faint, live) in `index.html` and once in `offset-path` in `site.css`; keep them identical.
- **Page turn**: the slab starts flipping at 0. The incoming `.project__bg` gets `.is-on` (z 2) and wipes over the outgoing `.is-off` (z 1, unmasked) with a soft-edged mask: a gradient three viewports tall whose `mask-position` slides one viewport, 0.85s on `--page-ease` after a 0.3s delay, so the slab is visibly turning before the background moves. `page.dataset.dir` (`forward`: bottom to top, `back`: top to bottom) picks the mask direction; `paintScene` sets it with `.is-instant` on and flushes before swapping classes, otherwise the hidden layer starts a transition towards the closed state and the swap retargets from the wrong value. Layers that are neither on nor off are `visibility: hidden`. Landing on the page uses `.is-instant` (no wipe).
- **No ribbons.** The drifting serif name carousels were removed (Sept 9, 2026); the page is background + slab only.
- **Backgrounds**: four `.project__bg` layers. Engines: `makeSky`, `makeGalaxy`, `makePlanes`, `makeResume`. Only the current one runs; the previous stops 1.4s after the step.
- **Sky** (Authentic Intelligence): gradient, cloud canvas, then `.sky__hills`, an inline SVG (viewBox 1440×420, `preserveAspectRatio="none"`, 36vh tall, min 220px) pinned to the bottom over the clouds: three rolling hill paths lit from the top right (yellow-green `#d9dc4c` ridges down to olive `#43602e` shadow, `userSpaceOnUse` gradients), a radial sun patch on the far ridge, and an `feTurbulence` grain rect multiplied over the hills for grass. Edit the paths and stops in `index.html`.
- **Resume Agent** (`makeResume`): white sheet (`#f7f7f7`), three grey columns typing themselves in word-sized chunks (the resume, the agent's trace in monospace behind the slab, the cover letter), each holding, fading and restarting on a stagger. Content is the `RESUME_DOC` / `TRACE_DOC` / `LETTER_DOC` arrays of `[kind, text]`; kinds map to `.resume__line--{kind}`. The text is decoration only: `.resume` is blurred 3.2px and the name / heading / role lines carry extra blur so nothing is legible, just the shape of a document being written. `.resume__glow` whitens the area behind the slab. Reduced motion paints everything at once.
- **Theme**: the dots are white on every project except Resume Agent, whose `mono` theme turns them near-black (white would vanish on the sheet). The faces still get `data-project="N"` from `fill()` but nothing styles on it now.
- **Clouds**: pre-rendered sprites. Puffs sit under a dome envelope, base is flattened with a `destination-out` gradient, underside shaded with `source-atop`, then one blur pass. The sprite canvas is sized from the puffs plus padding so nothing clips. If clouds look wrong, fix `sprite()` in `makeSky`, not the draw loop.
- Placeholders: Authentic Intelligence has no link and an empty tinted preview; Regal has no link. Contact in the dock goes nowhere yet.

---

## CSS Conventions

- **Tokens** live in `:root` blocks next to the section that uses them (`--edge`, `--figure-h`, `--name-size`, `--page-ease`, `--page-ms`, `--card-w`, `--helix-photo-h`, `--slab-depth`, …). Reference the variable; never hardcode a duplicate.
- **BEM**: `.block__element--modifier`. State classes are `is-*`.
- **z-maps** are documented in comments above each section (hero, page level, projects). Read them before adding a stacked element; never move existing values.
- **Motion**: transitions use `var(--page-ease)` and `var(--page-ms)` so everything rides the same curve as the track. `prefers-reduced-motion` collapses all of it; keep that block current when adding transitions.

---

## ⚠️ Cache-Busting — CRITICAL

`index.html` links `css/site.css?v=30` and `js/site.js?v=12`. **Whenever you touch either file, bump its number in `index.html`** or the browser serves stale code. (The legacy `styles.css?v=` / `main.js?v=` numbers on the archived subpages no longer matter.)

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
