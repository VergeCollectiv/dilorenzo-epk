# DJ EPK — Build Guide
*Last updated: 2026-06-19 · Based on DILORENZO build*

This guide is the single reference for adapting this EPK template to a new DJ. Work through each section top to bottom. Every field that needs changing is marked `← CHANGE`.

---

## Quick Start

1. Duplicate this entire folder and rename it `[djname]-epk/`
2. Follow the sections below in order
3. Compress all photos before adding them (see Image Rules)
4. Open `index.html` in a browser and verify every section

---

## 1. Identity

Open `index.html` and find/replace:

| Find | Replace with |
|---|---|
| `DILORENZO` | DJ name (uppercase) |
| `DJ AND EVENT CURATOR` | DJ's subtitle / role |
| `Toronto, ON` | DJ's city |
| `cdilorenzomusic@gmail.com` | DJ's email |
| `instagram.com/cdilorenzomusic` | DJ's Instagram |
| `soundcloud.com/chrisdilorenzo` | DJ's SoundCloud |
| `youtube.com/@cdilorenzomusic` | DJ's YouTube |
| `© 2026 DILORENZO` | Year + DJ name |

In `style.css`, update `--green` to the DJ's accent colour:
```css
--green: #3A7E70;   /* ← CHANGE to DJ's accent hex */
```

---

## 2. Photos

### Required photos (replace files in `assets/images/`)

| File | Section | Notes |
|---|---|---|
| `hero-bg.jpg` | Hero | Full-bleed background. Compress at **2200px** for sharpness. Portrait or landscape. |
| `sound-portrait.jpg` | About | Portrait of DJ (3:4 ratio). Studio or editorial shot. |
| `connect-portrait.jpg` | Book | Second portrait, different from above. |
| `watch-poster.jpg` | The Sound | Background image behind the YouTube play button. Event or atmosphere shot. |
| `gallery-1.jpg` – `gallery-6.jpg` | Gallery | 6 event photos. Mix of DJ booth, crowd, and atmosphere. |
| `gallery-[7+].jpg` | Gallery | Optional extras — update HTML and grid accordingly. |

### Community section photos (4 photos in a 2×2 grid)

Replace in `index.html` inside `#community .comm-photos`:
```html
<div class="cp-item"><img src="assets/images/[photo-1].jpg" ...></div>
<!-- 4 total -->
```

### Compress command (Mac)
```bash
sips -Z 1400 -s formatOptions 82 INPUT.jpg --out OUTPUT.jpg
# For hero use -Z 2200 -s formatOptions 88
```

---

## 3. Hero object-position

Control which part of the hero photo is visible on landscape screens:

In `style.css`:
```css
.hero-photo img { object-position: center 28%; }
```

- `center top` — shows the very top (heads/faces)
- `center 25%` — good for head + torso shots
- `center 42%` — centres vertically
- `center 65%` — shows lower body / gear

Test in browser and adjust until framing looks right.

---

## 4. About section (bio)

In `index.html`, section `#about`:

- Replace the three `<p class="sound-body">` paragraphs with the DJ's biography
- Update the `.stag` pills (genre tags + BPM range):
```html
<span class="stag">← Genre</span>
<span class="stag">← Genre</span>
<span class="stag">← BPM Range</span>
```

---

## 5. Gallery section

**Photos** — replace `gallery-1.jpg` through `gallery-6.jpg` (see section 2).

**Venue ticker** — update the venue list in `#gallery .gt-track`. The list must be duplicated (two copies) for the seamless marquee loop:
```html
<span>Venue Name</span><span class="vs-dot">·</span><span class="vs-city">City, Province</span><span class="vs-dot">·</span>
<!-- ... repeat for all venues, then copy the whole list again -->
```

---

## 6. The Sound section (video + audio)

**YouTube link** — find and replace the two YouTube URLs:
```html
href="https://youtu.be/[VIDEO-ID]"          <!-- poster link -->
href="https://youtube.com/@[CHANNEL-HANDLE]" <!-- "More on YouTube" link -->
```

Note: YouTube embedding is often disabled by artists. This section uses a poster image + external link instead of an iframe, which always works.

**SoundCloud** — update the `src` URL in the `<iframe id="sc-player">`:
```
https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/[USERNAME]&...
```

The soundbar at the bottom auto-connects to this iframe via the SoundCloud Widget API.

---

## 7. Community section

This section is for a collective / brand the DJ is part of. If the DJ has no brand affiliation, hide this section by adding `display:none` to `#community` in the CSS, or delete the HTML block.

**To customize:**
- Update the `<h2>Community</h2>` text to the brand name or section concept
- Update `comm-body` paragraph with the brand description
- Update stats (`.vstat-n` and `.vstat-l`):
```html
<span class="vstat-n" data-target="15" data-suffix="+">15+</span>
<span class="vstat-l">Events produced</span>
```
Remove `data-target` / `data-suffix` if no count-up animation is needed.
- Update the Verge logo: replace `assets/images/verge-logo.png` with the brand's dark logo
- Update the Verge link: `href="https://vergecollectiv.com"`
- Replace the 4 community photos (see section 2)

---

## 8. Book section

**Form action** — the form opens the system mail client:
```html
<form action="mailto:[EMAIL]" ...>
```
This is the most reliable approach for a static site. For a real form backend, swap this for a Netlify form or Formspree endpoint.

**Portrait** — `connect-portrait.jpg` (see section 2).

---

## 9. Accent colour system

The accent colour (`--green`) is used for:
- Nav "Book" button hover
- Soundbar background
- Scroll indicator line
- City names in venue ticker
- Verge logo hover arrow
- Form input focus ring
- Carousel dot active state (if carousel is used)
- SoundCloud embed colour parameter in the iframe URL

When changing the accent colour, update **both**:
1. `--green` in `style.css`
2. The `color=` parameter in the SoundCloud iframe `src` URL (hex, URL-encoded: `%23` instead of `#`)

---

## 10. Deployment (Netlify)

1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `[djname]-epk/` folder onto the page
3. Netlify gives you a URL immediately (e.g. `random-name.netlify.app`)
4. Optionally add a custom domain in Netlify settings

To update: drag the folder again or push to a connected GitHub repo.

---

## Section map

| Section ID | Class | Background | Title colour |
|---|---|---|---|
| `#hero` | `.hero` | Dark (ink) image | White |
| `#about` | `.about-sec` | Light (paper) | Ink/black |
| `#gallery` | `.gallery-sec` | Dark (ink) | White |
| `#the-sound` | `.the-sound-sec` | Dark (ink-2) | White |
| `#community` | `.community-sec` | Light (paper) | Ink/black |
| `#book` | `.connect-sec` | Dark (ink) | White |

---

## Brand tokens (current: DILORENZO)

```css
--ink:   #120E08   /* near-black */
--paper: #EDE5D4   /* warm parchment */
--green: #3A7E70   /* accent — CHANGE PER DJ */
--white: #FAF8F5   /* off-white text */
```

---

## Change log

| Date | Change |
|---|---|
| 2026-06-19 | Initial build — DILORENZO EPK |
| 2026-06-19 | Gallery grid (3×2 + venue ticker), The Sound two-column, Community redesign |
| 2026-06-19 | Soundbar green, card stacking animation, hero re-compressed at 2200px |
| 2026-06-19 | Accordion system: all sections collapsed by default, click to open (exclusive). JS height animation. |
| 2026-06-19 | Removed diagonal clip-path; replaced with clean `border-radius: 16px 16px 0 0` + positive margin gap |
| 2026-06-19 | Removed desktop Rolodex auto-open (IntersectionObserver). Click-only on both desktop + mobile. |
| 2026-06-19 | Added CSS scroll-snap (`scroll-snap-type: y proximity` on html, `scroll-snap-align: start` per section) |
| 2026-06-19 | Verge logo centered in community column (justify-content + align-items: center; arrow positioned absolute) |
| 2026-06-19 | TikTok icon added to nav, hero, and Book section socials |
| 2026-06-19 | Hero image object-position pushed down to `center 45%` (was 28%) |
| 2026-06-19 | SoundCloud mobile fix: play button opens SC directly on iOS (Widget API blocked by Safari) |
| 2026-06-19 | Section order changed: Hero → About → Sound → Gallery → Community → Book |
| 2026-06-19 | Gallery ticker label hidden on mobile — venues get full width |
| 2026-06-19 | Gallery mobile: 2-column square grid at ≤700px, full-width 4:3 at ≤480px |
| 2026-06-19 | Community mobile: verge-col hidden ≤960px; text + photos 2-col at tablet, stacked at mobile |
| 2026-06-19 | Hero image `object-position: center 12%` — ensures head is fully visible on desktop |
| 2026-06-19 | CSS cleanup: merged duplicate `.hero-content`, removed unused `.vs-city` + `.gallery-header` |
| 2026-06-19 | SC API script marked `async`; SC iframe gets `loading="lazy"` — no render blocking on slow connections |
