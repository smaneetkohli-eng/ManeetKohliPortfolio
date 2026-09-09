# MEMORY.md — Portfolio Website
*Project state for v2. How the site is built lives in `CLAUDE.md`; this file holds what changes.*
*Last updated: September 9, 2026*

---

## Current State

- **Version:** v2, the paged cinematic site. Shipped September 9, 2026. v1 is gone from `main` and lives only on branch `archive/v1`.
- **Stack:** Vanilla HTML/CSS/JS, one stylesheet, one script, Paper Shaders from jsDelivr. No build.
- **Deploy:** Vercel auto-deploys `main` of `github.com/smaneetkohli-eng/ManeetKohliPortfolio` to maneetkohli.com. `vercel.json` redirects every v1 URL to the matching v2 hash.
- **Cache-bust versions:** `site.css?v=44`, `site.js?v=20`. Bump in `index.html` on every touch.
- **Pages:** hero → bio → projects (Authentic Intelligence, Bani AI, Regal Internship, Resume Agent) → about (vision, me, people) → contact.
- **Responsive:** holds at every size (portrait, narrow, phone, landscape phone). Breakpoint table in `CLAUDE.md` → Responsive.
- **Raw photo sources:** `ALG/PROFESSIONAL-HUB/MEDIA/PORTFOLIO-SOURCE/` (hero cut-out, helix originals, v1 collage). Not in the repo.

---

## Open Items

- [ ] **No Open Graph image.** `index.html` has og:title / og:description / canonical but no `og:image`, so link previews show text only. Needs a 1200×630 still (a hero frame would do) at `images/og.jpg`.
- [ ] **Bani AI card is unlinked** by design ("Releasing soon" cursor). Add `data-href` on its template when VX-2 has a public URL.
- [ ] **Public resume link.** v1 served `files/AR.pdf`; v2 has no resume on the site. `/files/*` now redirects to `#contact`. Decide whether a resume PDF returns (and which one) before sharing the URL anywhere.
- [ ] Bio section of `CLAUDE.md` still mentions a "Hello, I'm Maneet" kicker in one line and "no kicker" in another; the page has no kicker. Tidy when next in there.

---

## Design Decisions

- **Vanilla, no framework, no build.** Decided for v1, kept for v2. One CSS file, one JS module.
- **Paper Shaders is the one external library.** Anything else needs explicit approval.
- **v1 archived, not deleted.** Branch `archive/v1` keeps the multi-page site and its assets; `main` carries only what v2 loads. Old links are redirected, not served.
- **Raw sources stay out of git.** The repo was 160 MB of images with 3 MB in use. Originals moved to `MEDIA/PORTFOLIO-SOURCE/` on Sept 9, 2026; commit crops only.
- **Card tags are descriptions, never specs.** Title Case, four per card, one row.
- **Card palette is the same dark glass on every project.** The link affordance is the cursor, not a button.
- **Phone number stays off the public page.** Email (click to copy), LinkedIn, GitHub, Instagram, and the Authentic Intelligence tiles are the only contact surfaces.
- **Tagline locked:** "AI-focused. Data-driven. Business-minded." (meta description and OG description).

---

## History

- **Sept 9, 2026 (ship):** v1 files removed from `main`, `vercel.json` redirects added, OG meta added, raw sources moved to `MEDIA/PORTFOLIO-SOURCE/`, stale `claude/*` branches and worktrees deleted, `archive/v1` pushed to origin.
- **Sept 9, 2026:** responsive pass (portrait hero, narrow dock list, phone and landscape layouts, scroll-aware touch pager); About copy rewritten in Maneet's words; Contact page; card previews recut; Projects title pill; ribbons removed.
- **Sept 8, 2026:** paged site (pager, bio, about helix, projects slab).
- **Sept 7, 2026:** v2 hero (wave shader, split name, figure). `main` restarted; v1 archived.
- **Sept 2, 2026:** git history rewritten to strip AI co-author trailers; v1 hero stripped down (last v1 change).
- **May 2026:** v1 built (multi-page, hero6.png, mountain background, secret collage modal).

---

## Key Files

| What | Path |
|---|---|
| Page | `index.html` |
| Stylesheet | `css/site.css` |
| Script | `js/site.js` |
| Redirects | `vercel.json` |
| Preview server | `.claude/launch.json` → "Portfolio Static Server" (port 8080) |
| Hero figure | `images/hero-figure.png` |
| Helix crops | `images/about/helix/{v,d,p}1-10.jpg` |
| Card art | `images/cards/authentic-intelligence.jpg` |
