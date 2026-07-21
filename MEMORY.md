# MEMORY.md — Portfolio Website
*Last updated: May 2026*

---

## Current State

- **Stack:** Vanilla HTML/CSS/JS — no framework, no build tool
- **Branch:** `main`
- **CSS version:** v=28 on ALL pages (synced July 2026) — bump every page when styles.css changes
- **JS version:** v=18 on ALL pages — bump every page when main.js changes
- **Live at:** maneetkohli.com

---

## Page Status

| Page | Status | Last Worked On |
|---|---|---|
| `index.html` | ✅ Done | May 2026 |
| `projects/apps.html` | ✅ Done | May 2026 |
| `projects/bcom.html` | ✅ Done | May 2026 |
| `experience/businesses.html` | ✅ Done | May 2026 |
| `experience/jobs.html` | ✅ Done | May 2026 |
| `experience/leadership.html` | ✅ Done | May 2026 |
| `contact.html` | ✅ Done | May 2026 |
| `about.html` | 🚧 WIP | — |
| `branding.html` | 🚧 WIP | — |
| `certifications.html` | 🚧 WIP | — |
| `projects/data-viz.html` | 🚧 WIP | — |
| `projects/design.html` | 🚧 WIP | — |

---

## Active Work

*What's currently in progress. Update as sessions happen.*

- New BCom images staged but uncommitted (`images/Bcom/data/` and `images/Bcom/email/`)
- `about.html` — next major page to build out

---

## Design Decisions

*Reasoning behind past choices. Populate as decisions are made.*

- **No framework** — site is static, vanilla is fast and dependency-free. Decided early, stay the course.
- **Single CSS file** — all styles in `css/styles.css`. Avoids import chains and keeps context in one place for AI-assisted editing.
- **hero6.png** — current hero figure used on index.html. Previous versions (hero through hero5) kept for reference but not active.
- **Secret easter egg** — password-protected modal triggered by the Six Flags collage photo (`#secret-collage-trigger`). Video hosted on Google Drive. Do not remove or alter trigger.
- **Intro video modal** — triggered by `#intro-video-btn` in the hero frost pane (right side).
- **Tagline locked** — "AI-focused. Data-driven. Business-minded." Used in hero subtitle and footer. Do not change without approval.

---

## Known Issues / To-Do

*Track bugs, rough edges, and future work here.*

- [x] CSS versions normalized — all pages at v=28 / v=18 (July 2026)
- [x] Bcom images committed; folder is lowercase `images/bcom/` on disk and in git
- [x] Intro video remuxed to `images/Video/intro.mp4` (the old .mov used `video/quicktime`, which Chromium refuses to play)
- [x] Scroll-reveal fixed (JS now adds `reveal-enabled`; CSS specificity corrected)
- [ ] `about.html` needs full build (has WIP placeholder) — staging photos in `images/about/about-main/`
- [ ] `branding.html`, `certifications.html`, `projects/data-viz.html`, `projects/design.html` all need content
- [ ] Three unused `Screenshot 2026-04-22 ...` files tracked in `images/projects/home/` — likely raw material for side-hustle images; confirm and delete

---

## Key Files Quick Reference

| What | Path |
|---|---|
| Stylesheet | `css/styles.css` |
| JS | `js/main.js` |
| Resume PDF | `files/AR.pdf` |
| Hero figure | `images/hero6.png` |
| Hero background | `images/mountain-bg.png` |
| Home collage photos | `images/about/home/` |
| Sub-page hero images | `images/heroes/` |
| Project logos (home cards) | `images/projects/home/` |
