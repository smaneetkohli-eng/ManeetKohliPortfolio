# CLAUDE.md — Portfolio Website
*Maneet Kohli's personal portfolio site. Pure HTML/CSS/JS. No framework, no build tool.*
*Last updated: May 2026*

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
| Styles | Single file: `css/styles.css` (~4,200 lines) |
| Scripts | Single file: `js/main.js` (~600 lines) |
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
files/AR.pdf            — resume PDF (linked from hero frost pane)
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
--split: 70vh            /* height of the mountain hero top section */
--figure-height: 92vh    /* hero figure height */
--figure-overhang: 30vh  /* how far below the split line the figure hangs */
--hero-figure-w          /* figure width — used to size side frost panels */
--hero-name-size         /* clamp-based responsive name font size */
--ease-out               /* cubic-bezier(0.22, 1, 0.36, 1) — use for all transitions */
--charcoal: #111         /* primary dark background */
--line-glow              /* white glow box-shadow for the dividing line */
```
**Don't hardcode these values elsewhere — always reference the variable.**

### z-index Map (documented in styles.css, never deviate)
```
0    .hero-top__bg-clip     mountain bg (clipped)
4    .hero-top::after       figure shadow on mountain
5    .hero-name-layer       name text — behind the figure
11   .dividing-line         glowing horizontal line at hero split
15   .hero-bottom           dark panel background
25   .skills-marquee        frosted skill pill rows — behind figure
26   .hero-subtitle         tagline — above marquee
28   .hero-frost-panes      frosted callout boxes flanking figure
30   .hero-figure           person image — above everything in hero
200  .site-header           nav
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
<link rel="stylesheet" href="css/styles.css?v=28" />
```
All pages are synced at `styles.css?v=28` and `main.js?v=18` (normalized July 2026). When you edit `styles.css` or `main.js`, bump the version number on EVERY page that uses it, or the browser will serve stale styles from cache.

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
2. **Skills marquee** — shuffles pill order on load, handles CSS animation playback rate (intro speed → gradual slowdown)
3. **Nav dropdowns** — keyboard-accessible, click-outside to close, hamburger for mobile
4. **Scroll reveal** — IntersectionObserver on `[data-reveal]` elements
5. **Intro video modal** — `#intro-video-btn` triggers a modal with an intro video
6. **Secret easter egg** — `#secret-collage-trigger` (the Six Flags photo in the home collage) opens a password-protected modal. Password unlocks a private video via Google Drive. Don't remove or alter this trigger.
7. **Year** — `#year` element gets current year injected

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

## Known State (May 2026)

**Done and stable:**
- `index.html` — full hero with figure, skills marquee, frost panes, about collage, featured projects, contact, footer, secret easter egg, intro video modal
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
