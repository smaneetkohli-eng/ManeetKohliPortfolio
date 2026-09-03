# CLAUDE.md — Portfolio Website
*Maneet Kohli's personal portfolio site. Pure HTML/CSS/JS. No framework, no build tool.*
*Last updated: September 2026*

---

## What This Is

A dark-themed cinematic portfolio site built from scratch. Vanilla HTML, CSS, and JavaScript only. No React, no Vue, no bundler, no npm. Single stylesheet, single JS file. Git initialized on `main` branch.

Live at: `maneetkohli.com`
Working directory: `/Users/maneetkohli/Desktop/ALG/PROFESSIONAL-HUB/PORTFOLIO/`

---

## Tech Stack

| Layer | Detail |
|---|---|
| Markup | Vanilla HTML5 (`.html` files per page) |
| Styles | Single file: `css/styles.css` (~3,900 lines) |
| Scripts | Single file: `js/main.js` (~420 lines) |
| Fonts | Bebas Neue (display/hero text) + Inter 400/500/600 (body) via Google Fonts |
| Version control | Git, `main` branch |
| Hosting | Implied static hosting (maneetkohli.com) |

No transpilation, no PostCSS, no Sass. What you write is what ships.

---

## File Map

### Root pages (served from `/`)
| File | Status | Notes |
|---|---|---|
| `index.html` | ✅ Done | Home — hero, about collage, featured projects, contact |
| `about.html` | 🚧 WIP | Has `page-hero--wip` placeholder — not fully built |
| `branding.html` | 🚧 WIP | Has `page-hero--wip` placeholder |
| `certifications.html` | 🚧 WIP | Placeholder state |
| `contact.html` | ✅ Done | Contact form/info |
| `bio-brainstorm.html` | 📝 Scratch | NOT production — brainstorm file, don't link to it |
| `projects-brainstorm.html` | 📝 Scratch | NOT production — brainstorm file, don't link to it |

### Projects (served from `/projects/`)
| File | Status | Notes |
|---|---|---|
| `projects/apps.html` | ✅ Done | Apps — Bani AI, Tesseract featured |
| `projects/data-viz.html` | 🚧 WIP | Placeholder state |
| `projects/design.html` | 🚧 WIP | Placeholder state |
| `projects/bcom.html` | ✅ Done | BCom projects with real imagery |

### Experience (served from `/experience/`)
| File | Status | Notes |
|---|---|---|
| `experience/businesses.html` | ✅ Done | Sky Automations, Punjabi By Flavor |
| `experience/jobs.html` | ✅ Done | Jobs & Internships |
| `experience/leadership.html` | ✅ Done | Side Hustle Club etc. |

### Assets
```
css/styles.css          — single global stylesheet
js/main.js              — single global script
files/AR.pdf            — resume PDF (not linked from the hero since Sept 2026)
images/
  favicon.svg           — MK monogram favicon (linked from every page)
  mountain-bg.png       — hero background (also used for name fill effect)
  hero.png – hero6.png  — hero figure images (index.html uses hero6.png)
  hero-name-title.png   — (legacy, name now rendered in CSS)
  heroes/               — per-page hero background images (about, apps, businesses, etc.)
  projects/home/        — project card logos (logo-bani-ai.png, etc.)
  about/home/           — home page collage photos
  about/about-main/     — about.html staging photos (raw, page not built yet)
  bcom/                 — BCom page images (data/, email/ subfolders) — lowercase, matches HTML refs
  Video/intro.mp4       — intro modal video (H.264/AAC, remuxed from the old .mov)
```

---

## CSS Architecture

### Variables (`:root` in styles.css)
All layout tokens are CSS custom properties. Key ones:
```css
--split: 70vh / 70svh    /* height of the mountain hero top section (svh declared after vh as the fallback pair) */
--figure-height: 92vh    /* hero figure height (same vh/svh pair) */
--figure-overhang: 30vh  /* how far below the split line the figure hangs (same pair) */
--hero-figure-w          /* figure width — the social rail is positioned off this box */
--hero-name-size         /* clamp-based responsive name font size */
--hero-name-lines        /* 1 desktop, 2 on mobile (first/last stacked) — feeds --name-bottom */
--arc-sag                /* how much higher the glowing arc sits at the viewport edges than at centre */
--social-tile            /* social rail tile size */
--ease-out               /* cubic-bezier(0.22, 1, 0.36, 1) — use for all transitions */
--charcoal: #111         /* primary dark background */
--line-glow              /* white glow box-shadow for the dividing line */
```
**Don't hardcode these values elsewhere — always reference the variable.**

### z-index Map (documented in styles.css, never deviate)
```
page-stage level:
15   .hero-bottom           dark panel — pulled up under the arc by --arc-sag
16   .hero-top              stacking context: mountain + arc paint over the panel's corners
30   .hero-figure           person image — above both sections
32   .social-rail           social tiles — right of the figure, above it
200  .site-header           nav

inside .hero-top (its own stack; the figure is always above all of these):
0    .hero-top__bg-clip     mountain bg — ellipse-clipped so its bottom edge is the U
4    .hero-top::after       figure shadow on mountain
5    .hero-name-layer       name text
6    .name-rule             rule under the tagline
11   .hero-arc              glowing arc (SVG lens along the curve)
36   .hero-subtitle         tagline
```
If you need a new stacked element, pick a z-index that fits this map. Never move existing values.

### Class Naming
BEM-style throughout. Pattern: `.block__element--modifier`
- `.hero-frost-panes__col--left`
- `.project-card--pbf`
- `.skills-marquee__row--l1`

Stick to this pattern for any new classes.

### Scroll Animations
Add `data-reveal` to any section/element you want to fade in on scroll. The JS in `main.js` handles the IntersectionObserver automatically. Nothing else needed.

### Safari Fallbacks
`main.js` adds `.is-safari` to `<html>` on Safari. CSS has `.is-safari .name-display { ... }` fallback for the mountain-texture name fill (which uses SVG filter + background-clip — Safari handles it differently). When adding complex visual effects, add a `.is-safari` fallback if needed.

### WIP Pages
Pages not yet built use this placeholder pattern:
```html
<section class="page-hero page-hero--wip" aria-labelledby="page-hero-title">
  <div class="page-hero__media" aria-hidden="true"></div>
  <div class="page-hero__scrim" aria-hidden="true"></div>
  <div class="page-hero__inner">
    <!-- WIP content -->
  </div>
</section>
```
Replace `page-hero--wip` with the page-specific modifier (e.g., `page-hero--about`) when building the page out.

---

## ⚠️ CSS Cache-Busting — CRITICAL

Every page links the stylesheet with a version query string:
```html
<link rel="stylesheet" href="css/styles.css?v=29" />
```
All pages are synced at `styles.css?v=29` and `main.js?v=19` (September 2026). When you edit `styles.css` or `main.js`, bump the version number on EVERY page that uses it, or the browser will serve stale styles from cache.

**Whenever you touch styles.css or main.js: update ALL version numbers across all HTML files to the next increment.**

To find all version references fast:
```bash
grep -rn 'styles.css?v=' .
grep -rn 'main.js?v=' .
```

---

## JS Architecture (`js/main.js`)

All code is in a single IIFE: `(function() { "use strict"; })();`

Key systems in main.js:
1. **Header scroll** — `.site-header` gets `.is-scrolled` after 48px scroll
2. **Nav dropdowns** — keyboard-accessible, click-outside to close, hamburger for mobile
3. **Scroll reveal** — IntersectionObserver on `[data-reveal]` elements
4. **Intro video modal** — `#intro-video-btn` opens a modal with the intro video. The modal markup and JS are still in place, but the hero no longer has a trigger (removed with the frost cards, Sept 2026). Add any element with `id="intro-video-btn"` to bring it back.
5. **Secret easter egg** — `#secret-collage-trigger` (the Six Flags photo in the home collage) opens a password-protected modal. Password unlocks a private video via Google Drive. Don't remove or alter this trigger.
6. **Year** — `#year` element gets current year injected

The hero itself is pure CSS: no JS drives the arc, the figure, or the social rail.

**No external JS libraries.** Keep it that way unless there's a strong reason — vanilla is fast, dependency-free, and already working.

---

## Nav Pattern

The nav is copy-pasted across all pages. It's identical on every file. When adding a new page to the nav or changing a nav link, **update every single HTML file**. There's no shared include system — it's static HTML.

Nav structure:
```html
<header class="site-header" id="top">
  <a class="logo" href="index.html">Maneet Kohli</a>  <!-- or "../index.html" for subpages -->
  <button class="nav-hamburger" ...>...</button>
  <nav class="site-nav" id="primary-nav" aria-label="Primary">
    <!-- Projects dropdown -->
    <!-- Experience dropdown -->
    <!-- Branding, Certifications, About Me, Contact links -->
  </nav>
</header>
```

For **root-level pages** (index.html, about.html, etc.), hrefs are relative: `projects/apps.html`
For **subpages** (projects/*, experience/*), hrefs are: `../projects/apps.html`, `../index.html`

---

## Footer Pattern

Same deal — copy-pasted across all pages, fully static. The footer has:
- `.site-footer__watermark` — large "Maneet Kohli" background text (decorative)
- `.site-footer__top` — blurb + nav columns (Projects, Experience, Explore)
- `.site-footer__bottom` — copyright + tagline

Footer nav also uses relative paths depending on page depth.

---

## Adding a New Page — Checklist

1. Copy an existing done page (e.g., `experience/businesses.html`) as the starting template
2. Update `<title>` to `[Page Name] — Maneet Kohli`
3. Fix all relative paths in nav and footer hrefs (root vs. subpage depth)
4. Replace the `page-hero--wip` modifier with a new BEM modifier (e.g., `page-hero--design`)
5. Add a corresponding `.page-hero--design` CSS rule in styles.css with the right hero image
6. Bump `?v=N` on the stylesheet link for all modified pages
7. If it's a new nav item, update nav in ALL html files

---

## Image Conventions

- Hero background images: `images/heroes/[pagename].png` — used in `.page-hero__media` via CSS `background-image`
- Home page collage: `images/about/home/*.png`
- Project logos (featured cards): `images/projects/home/logo-[name].png`
- Hero figure: `images/hero6.png` (index.html)
- Resume PDF: `files/AR.pdf` — update this file when a new resume is generated

All images use `loading="lazy"` and `decoding="async"` except the hero figure (above the fold).

---

## Hero Anatomy (September 2026)

Top to bottom, nothing else: name (mountain-texture fill) → tagline → name rule → the figure, leaning on a glowing arc → social rail to the figure's right. The left side is intentionally empty.

- **Arc.** The split line is a wide, shallow U. `.hero-top__bg-clip` is clipped to a giant ellipse (Rx 300vw, Ry 72 × `--arc-sag`) whose bottom passes through the split at centre and sits `--arc-sag` higher at the edges. `.hero-bottom` is pulled up by `--arc-sag` and `.hero-top` is a stacking context above it, so the dark panel's own gradient fills the corners (no colour matching, no seam). `.hero-arc` is an SVG lens (viewBox `0 0 1000 300`, `preserveAspectRatio="none"`) along the same curve: zero width at the edges, widest under the figure, with a horizontal opacity gradient. The box is 3 × sag tall and hangs 1 × sag below the split so the curve lines up with the clip.
- **Social rail.** `<ul class="social-rail">` with four glass tiles (LinkedIn, YouTube, TikTok, Instagram), positioned at `left: 50% + --hero-figure-w × 0.36` just under the arc, with a hairline up to the line. Labels slide out on hover/focus (hidden ≤768px). On mobile it pins to the right edge, clear of the figure's faded arm.
- **Mobile name.** ≤640px the name stacks first/last on two lines (`--hero-name-lines: 2`); `--name-bottom` accounts for the extra line so the tagline and rule stay below it.
- **Load animations.** name → tagline → rule → figure → arc (scaleX from centre) → rail tiles staggered. All in CSS; `prefers-reduced-motion` collapses them.

If you change `--arc-sag`, both the ellipse clip and the SVG box scale with it automatically. If you change the SVG curve control points, the ellipse no longer matches — keep the curve at y=100 (edges) / y=200 (centre).

## Known State (September 2026)

**Done and stable:**
- `index.html` — hero (name, tagline, rule, figure, arc, social rail), about collage, featured projects, contact, footer, secret easter egg. Intro video modal markup/JS retained without a hero trigger.
- Social rail URLs: LinkedIn and Instagram are confirmed. **YouTube (`youtube.com/@maneetkohli07`) and TikTok (`tiktok.com/@maneetkohli07`) are placeholders that need confirming.**
- `projects/apps.html` — Bani AI + Tesseract cards
- `projects/bcom.html` — BCom projects with real imagery
- `experience/` — all three pages done

**In progress / WIP:**
- `about.html` — has placeholder hero, needs full about page build
- `branding.html` — placeholder
- `certifications.html` — placeholder
- `projects/data-viz.html` — placeholder
- `projects/design.html` — placeholder

**Housekeeping (July 2026):**
- `.gitignore` covers `.DS_Store` and `.claude/worktrees/`
- All pages carry favicon, meta description, theme-color; index also has OG tags
- Footer year is injected via `<span id="year">` (main.js)
- Scroll-reveal requires JS to add `reveal-enabled` on `<html>` — content is never hidden without JS

---

## Rules

- No frameworks. No npm. No build tools. Keep it vanilla.
- Never introduce external JS libraries without explicit approval.
- Always bump `?v=N` on ALL pages when touching `styles.css` or `main.js`.
- Preserve the z-index map — never break stacking order without understanding the full chain.
- Never touch the secret easter egg logic unless specifically asked.
- Don't link to `bio-brainstorm.html` or `projects-brainstorm.html` — those are scratch files.
- Before changing the nav structure, update every HTML file.
- Commit after every meaningful change. Commit messages should be specific (see git log for tone).
