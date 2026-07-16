# Spring-Green — SEO & LLMO/GEO Checklist

Status of search-engine and AI-agent visibility work for the Spring-Green homepage.
Live preview: https://main--spring-green--oharris69.aem.page/

---

## ✅ Done in code (committed & pushed to main)

| Item | Where | Commit |
|------|-------|--------|
| LocalBusiness JSON-LD (`HomeAndConstructionBusiness`) | `scripts/scripts.js` | 902a907 |
| `<html lang>` from metadata, `en` fallback | `scripts/scripts.js` | 902a907 |
| `llms.txt` agent brief at `/llms.txt` | `llms.txt` | f925170 |
| WebSite + SearchAction JSON-LD | `scripts/scripts.js` | d14f2ac |
| BreadcrumbList JSON-LD (auto from URL path; self-suppresses on homepage) | `scripts/scripts.js` | d14f2ac |
| FAQPage JSON-LD (auto-builds from an accordion block when present) | `scripts/scripts.js` | d14f2ac |

All auto-generate — no per-page hardcoding. Verified rendering on preview.

---

## 📋 To do in the Universal Editor (content)

### Image alt text
Select each image component and set its Alt Text:

| Block / location | Image | Alt text |
|---|---|---|
| Hero banner | homepage-banner-1440x730.webp | `SpringGreen lawn care professional kneeling on a healthy green lawn in front of a home` |
| Service card — Lawn Care | homepage-sec1img1.webp | `Lush green lawn maintained by SpringGreen lawn care services` |
| Service card — Pest Control | homepage-sec1img2.webp | `SpringGreen pest control protecting a home from mosquitoes, grubs and ants` |
| Service card — Tree Care | homepage-sec1img3.webp | `Healthy trees and shrubs cared for by SpringGreen tree care specialists` |
| About — "The Green In SpringGreen" | homepage-established.webp | `SpringGreen — established 1977 badge` |
| Satisfaction guarantee | homepage-satisfaction.webp | `SpringGreen 100% satisfaction guarantee` |
| Yardology carousel article | detect-leak-sprinkler-system-mail-line-600x600.webp | `Close-up of a sprinkler system main line leak being inspected` |
| Trust logo | homepage-arborday.webp | `Arbor Day Foundation` |
| Trust logo | homepage-projectevergreen.webp | `Project EverGreen` |
| Trust logo | homepage-nalp.webp | `National Association of Landscape Professionals` |
| Nav logo (header) | nav-logo.webp | `Spring Green — lawn, pest & tree care logo` |

### Heading hierarchy (hero)
Swap levels so the keyword-rich line is the H1:
- H1 → `Your Neighborhood Lawn Care, Pest Control And Tree Care Experts Since 1977`
- H2 → `Tailored Services From Your Local Professional`

### Link text
Replace any anchor whose visible text is a raw image URL with descriptive text
(e.g. the trust-logo links → org names, or just linked logo images with alt text).

### Page metadata (Page Properties / Metadata section)

| Key | Value |
|---|---|
| Title | `Local Lawn Care Services & Weed Control \| SpringGreen` |
| Description | `SpringGreen tailors lawn care, pest control and tree care services to fit your needs. Family-owned neighborhood experts since 1977.` |
| Keywords | `lawn care, weed control, pest control, tree care, lawn fertilization, mosquito control, local lawn service` |
| OG Title | `Local Lawn Care Services & Weed Control \| SpringGreen` |
| OG Description | `Neighborhood lawn care, pest control and tree care experts since 1977. Tailored services from your local professional.` |
| OG Image | `https://images.spring-green.com/media/homepage/homepage-banner-1440x730.webp` (hero) |
| Twitter Card | `summary_large_image` |
| Canonical | `https://www.spring-green.com/` (set at go-live) |

### FAQ (activates FAQPage schema)
Author an FAQ using an **accordion block**. Each row: summary = question, body = answer.
The FAQPage JSON-LD builds automatically — strong GEO win (AI assistants can quote answers).
Source FAQs from the original site's FAQ page.

---

## 📋 To do in config (aem.live tools — needs admin access)

| Item | Where | Notes |
|---|---|---|
| Production robots.txt allowing AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) | tools.aem.live/tools/robots-edit | Live host currently serves default "block all" because it's on .aem.live |
| Production host / CDN setup (x-forwarded-host) | tools.aem.live/tools/cdn-setup | Until wired, crawlers see noindex preview robots |
| Canonical → production domain | site config | So agents attribute content to spring-green.com |

---

## Future enhancements (optional, code)

- Per-location `Service` / `LocalBusiness` schema (needs location data) — boosts local AI/search visibility via `areaServed`.
- `Organization` schema in footer once footer content is authored.

---

## Notes
- Code fixes deploy automatically via the CDN to preview/live.
- Content and config items require the AEM authoring connection (technical account /
  config-admin) to be completed — see `ADMIN-fix-source-auth-401.md`.
