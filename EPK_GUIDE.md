# DJ EPK — Build & Deploy Guide
*Template: DILORENZO · Last updated: 2026-06-19*

This document is a complete reference for building, customizing, and deploying a DJ Electronic Press Kit (EPK) using this template. It is written to be handed to Claude Code with enough context to recreate or adapt the entire project from scratch — including deployment to GitHub and Netlify.

---

## What This Is

A single-page DJ press kit that lives at a URL like `vergecollectiv.com/dilorenzo` or as its own standalone site. It is a pure static site — HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no dependencies to install. This is intentional: static sites load fast on bad internet connections, deploy in seconds, and require no server to maintain.

**Sections (in order):**
Hero → About → Sound → Gallery → Community → Book

---

## Why These Technical Decisions Were Made

Understanding the reasoning prevents you from accidentally breaking things while customizing.

### Why vanilla JS with no framework?
This is a public-facing page that needs to load fast on mobile, potentially on slow connections. React, Vue, etc. add hundreds of KB of JS. This entire site's JS is under 10KB. Every section loads immediately. No hydration, no bundle, no build step to manage.

### Why accordion folders instead of scroll sections?
The EPK needs to work well on mobile where a long scrolling page is frustrating. Accordion sections let the viewer jump directly to what they care about (bio, gallery, booking form) without scrolling past everything else. The folder metaphor also gives it a visual identity — it feels like opening a file, which matches the "press kit" concept.

### Why JS-driven height animation instead of CSS `grid-template-rows: 0fr`?
CSS grid animation for height is not reliably supported across all browsers and older iOS Safari versions. The JS approach (`element.scrollHeight` → `auto`, and `getBoundingClientRect().height` → `0`) works on every device. It also allows `height: auto` after opening, so the section can grow if content changes.

### Why scroll-snap was removed
Scroll-snap (`scroll-snap-type: y proximity`) was initially added for a "magnetic" feel. It was removed because it fights badly with the accordion on mobile: when a card opens and the page height changes dramatically, the snap algorithm recalculates and force-jumps the viewport, which also triggers the IntersectionObserver mid-animation — causing images to visually scatter. The accordion already handles smooth navigation; snap adds no benefit and multiple bugs on mobile.

### Why `mailto:` for the booking form?
This is a static site — there is no server to handle form submissions. Alternatives like Netlify Forms or Formspree require account setup and can add delay. `mailto:` opens the user's email client pre-filled with the form data. It works everywhere, requires no maintenance, and every reply lands directly in the DJ's inbox.

### Why SoundCloud Widget API instead of a custom audio player?
The SoundCloud library is already the authoritative source of the DJ's music. Building a custom player would require hosting audio files (large, expensive) and managing playback state manually. The Widget API lets us skin the controls however we want while SoundCloud handles the CDN, streaming, and track catalog automatically.

### Why is the SoundCloud iframe NOT lazy-loaded?
The Widget API needs to attach to the iframe via `SC.Widget(iframe)`. If the iframe has `loading="lazy"`, its `src` is never fetched until it scrolls into view — but the Widget API is initialized on page load. The two would desync. The iframe must load immediately even though it's below the fold. (Other images use `loading="lazy"` because they don't need JS to talk to them.)

### Why `async` on the SoundCloud API script?
The SC API script (`w.soundcloud.com/player/api.js`) is third-party. Without `async`, it blocks the browser from parsing the rest of the HTML until it downloads. With `async`, the browser continues loading the page while the script downloads in parallel. The widget code in `main.js` handles both cases: if SC loads first, `typeof SC !== 'undefined'` catches it; if SC loads second, a `load` event fallback calls `attachWidget()` once ready.

### Why the SoundCloud widget URL uses `/tracks`?
`soundcloud.com/[username]` loads the full stream including reposts and liked tracks. `soundcloud.com/[username]/tracks` loads only the artist's own uploaded tracks, ordered newest first. This ensures the soundbar always starts on the artist's most recent original track, not a repost of someone else's music.

### Why READY event before other widget event bindings?
The SoundCloud Widget API requires the widget to be fully initialized before you can attach event listeners like PLAY, PAUSE, or PROGRESS. Binding events before READY results in silent failures — the widget loads but nothing works. Wrapping all bindings inside the READY callback guarantees the widget is ready to receive them.

---

## File Structure

```
[djname]-epk/
├── index.html          ← The entire EPK — one file, all sections
├── netlify.toml        ← Security headers for Netlify (do not delete)
├── .gitignore          ← Excludes .DS_Store and system files from git
├── EPK_GUIDE.md        ← This file
└── assets/
    ├── css/
    │   └── style.css   ← All styles — brand tokens, layout, animations
    ├── js/
    │   └── main.js     ← All interactivity — accordion, soundbar, reveals
    ├── fonts/
    │   ├── Inter-VariableFont_opsz,wght.ttf
    │   └── Inter-Italic-VariableFont_opsz,wght.ttf
    └── images/
        ├── hero-bg.jpg         ← Full-bleed hero background (compress at 2200px)
        ├── sound-portrait.jpg  ← Portrait photo for About section (3:4 ratio)
        ├── connect-portrait.jpg ← Portrait photo for Book section (3:4 ratio)
        ├── watch-poster.jpg    ← YouTube video thumbnail / poster
        ├── gallery-1.jpg – gallery-6.jpg ← Event photos for gallery grid
        ├── dj-crowd-01.jpg     ← Community grid photo 1
        ├── verge-highlight-1.jpg ← Community grid photo 2
        ├── verge-highlight-3.jpg ← Community grid photo 3
        ├── biblio-02.jpg       ← Community grid photo 4
        └── verge-logo.png      ← Brand/collective logo for community section
```

---

## Brand Tokens

These CSS variables are declared in `:root` in `style.css`. Change them here and the entire site updates.

```css
:root {
  --ink:     #120E08;   /* near-black — body bg, dark section text */
  --ink-2:   #1C1610;   /* warm dark — subtle variant */
  --ink-3:   #2A2018;   /* medium dark */
  --paper:   #EDE5D4;   /* warm parchment — light section bg */
  --paper-2: #D4C9B4;   /* darker parchment — card fills */
  --green:   #3A7E70;   /* accent — soundbar, links, focus rings. CHANGE PER DJ. */
  --white:   #FAF8F5;   /* off-white — text on dark backgrounds */
  --muted:   rgba(250,248,245,.42);
  --mid:     rgba(250,248,245,.68);

  --pad:  clamp(24px,6vw,80px);  /* horizontal page padding, responsive */
  --mw:   1280px;                /* max content width */
  --r:    6px;                   /* border-radius — brutalist/sharp */
  --r-lg: 10px;                  /* large border-radius */
}
```

**Section background colors (each folder gets a distinct color):**
```css
.about-sec     { background: #EDE5D4; }  /* warm cream */
.the-sound-sec { background: #120E08; }  /* near black */
.gallery-sec   { background: #0D1C19; }  /* dark forest green */
.community-sec { background: #D5CCB8; }  /* medium tan */
.connect-sec   { background: #1E1410; }  /* espresso */
```

**Accent color** (`--green`) is used for:
- Soundbar background
- Nav "Book" button hover
- Gallery ticker label
- Form input focus ring
- SoundCloud widget color (also set in the iframe src: `color=%23[hex without #]`)

When changing the accent, update **both** the CSS variable and the `color=` parameter in the SoundCloud iframe URL.

---

## Customizing for a Different DJ

Work through these in order:

### 1. Identity swap — open `index.html` and replace:

| Find | Replace with |
|---|---|
| `DILORENZO` | DJ name (all caps) |
| `DJ AND EVENT CURATOR` | DJ's title/role |
| `Toronto, ON` | DJ's city |
| `cdilorenzomusic@gmail.com` | DJ's email |
| `instagram.com/cdilorenzomusic` | DJ's Instagram |
| `soundcloud.com/chrisdilorenzo` | DJ's SoundCloud |
| `tiktok.com/@cdilorenzomusic` | DJ's TikTok |
| `youtube.com/@cdilorenzomusic` | DJ's YouTube |
| `© 2026 DILORENZO` | Year + DJ name |

### 2. SoundCloud widget URL — in the `<iframe id="sc-player">` src:
```
soundcloud.com/[USERNAME]/tracks
```
This loads the DJ's own tracks, newest first. Also update `color=%23[hex]` to match your accent color (URL-encoded hex — replace `#` with `%23`).

### 3. YouTube — find and replace both YouTube URLs in the Sound section:
```html
href="https://youtu.be/[VIDEO-ID]"              <!-- poster click -->
href="https://youtube.com/@[CHANNEL-HANDLE]"    <!-- More on YouTube link -->
```

### 4. Accent color — in `style.css`:
```css
--green: #XXXXXX;  /* change to DJ's brand color */
```
And in the SoundCloud iframe src: `color=%23XXXXXX` (no # symbol, use %23).

### 5. About bio — find the three `<p class="sound-body">` paragraphs in `#about` and replace the text.

### 6. Genre tags — update the three `.stag` pills:
```html
<span class="stag">Genre 1</span>
<span class="stag">Genre 2</span>
<span class="stag">BPM Range</span>
```

### 7. Gallery ticker venues — update the `<span>` list inside `.gt-track`. The list must appear **twice** (two copies of the same venues) for the seamless marquee loop. One copy is not enough — the animation would show a gap at the end.

### 8. Community section — if the DJ has no collective/brand, add `display: none` to `#community` in CSS. If they do, update the heading, body text, stats, logo, and community photos.

---

## Image Specs

Compress all photos before adding them. Large images are the single biggest cause of slow page loads on mobile.

**Compression command (Mac Terminal):**
```bash
# Standard photos — 1400px max, quality 82
sips -Z 1400 -s formatOptions 82 INPUT.jpg --out OUTPUT.jpg

# Hero image — larger for sharpness, 2200px max, quality 88
sips -Z 2200 -s formatOptions 88 INPUT.jpg --out OUTPUT.jpg
```

**Target file sizes:**
- Hero: under 600KB
- Gallery photos: under 300KB each
- Portrait photos: under 250KB

**Hero image framing** — controlled by `object-position` in CSS:
```css
.hero-photo img { object-position: center 12%; }
```
- Lower % (toward 0%) = shows more of the top of the image (head/face)
- Higher % (toward 100%) = shows more of the bottom (gear/crowd)
- Adjust until the subject's face and shoulders are clearly visible on desktop

---

## How the Accordion Works

Every section card has this structure:

```html
<section id="about" class="about-sec section-card">
  <button class="acc-tab" aria-expanded="false">
    <span class="acc-title">About</span>
    <span class="acc-plus">+</span>
  </button>
  <div class="acc-body">          ← height: 0 by default (hidden)
    <div class="acc-inner">       ← actual content lives here
      <!-- section content -->
    </div>
  </div>
</section>
```

**To open:** JS sets `acc-body` height to `scrollHeight` (measured content height) → CSS transitions it → `transitionend` sets it to `auto` so it can grow freely.

**To close:** JS pins height to `getBoundingClientRect().height` first (necessary — you can't animate away from `auto`), then double `requestAnimationFrame` to let the browser register the fixed height, then sets it to `0`.

**Exclusive behavior:** Opening any card closes all others. This is intentional — only one section is readable at a time, which prevents the page from becoming a wall of text.

**Why no scroll-snap:** scroll-snap was removed because on mobile it fights the accordion's height animation — when a card opens, snap recalculates and jumps the viewport, which also triggers IntersectionObserver on mid-animation reveals causing images to scatter. See the why section above.

---

## Deploying to GitHub + Netlify

This section explains every step and why each one matters.

### Why GitHub + Netlify instead of just Netlify Drop?

Netlify Drop (drag and drop) works for one-time deploys but means every update requires a manual upload. GitHub + Netlify gives you **continuous deployment**: every time you push a change to GitHub, Netlify automatically rebuilds and re-deploys. This is the professional workflow and takes about 5 extra minutes to set up the first time.

### Step 1: Initialize Git

Git is version control — it tracks every change to your files and lets you push them to GitHub. Open Terminal and run:

```bash
# Navigate to the EPK folder
cd /path/to/your/[djname]-epk

# Initialize git in this folder
git init

# Set the main branch name (GitHub expects "main")
git branch -M main

# Create a .gitignore to exclude Mac system files
echo ".DS_Store" > .gitignore
echo "*.log" >> .gitignore
```

**Why `.gitignore`?** Mac creates hidden `.DS_Store` files in every folder. Without ignoring them, they'd show up in GitHub and create noisy commits every time you view the folder in Finder.

### Step 2: Stage and commit all files

```bash
# Stage everything
git add .

# Create the first commit
git commit -m "Initial commit — [DJ NAME] EPK"
```

**Why commit first?** Git requires at least one commit before you can push to GitHub. Think of a commit as a save point. GitHub only accepts folders that have at least one save point.

### Step 3: Create a GitHub repository

1. Go to [github.com](https://github.com) and log in
2. Click the **+** button → **New repository**
3. Name it `[djname]-epk` (e.g. `dilorenzo-epk`)
4. Set to **Public** (Netlify's free tier requires public repos, or you need a paid Netlify plan for private)
5. **Do NOT** check "Add README", "Add .gitignore", or "Choose a license" — your repo already has these and adding them here would create a conflict
6. Click **Create repository**

GitHub will show a page with commands under **"…or push an existing repository from the command line"**. Use those exact commands (they contain your account/repo name).

### Step 4: Connect your local repo to GitHub

```bash
# Link local repo to GitHub (copy from the GitHub page — the URL will have your username)
git remote add origin https://github.com/YOUR-USERNAME/dilorenzo-epk.git

# Push to GitHub
git push -u origin main
```

**If prompted for a password:** GitHub no longer accepts your account password here. You need a **Personal Access Token**:
- GitHub → Settings (top right, your profile) → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token
- Check the `repo` scope
- Copy the token and paste it as the password when Terminal asks

**Why does this work?** `git remote add origin` tells your local git "the remote home for this code lives at this GitHub URL." `git push` sends all your committed files there. `-u origin main` sets it so future `git push` commands work without arguments.

### Step 5: Deploy via Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **GitHub** and authorize Netlify to access your repos (one-time)
4. Find and select your `[djname]-epk` repo
5. Leave all settings as-is — the `netlify.toml` in the repo handles everything
6. Click **"Deploy site"**

Netlify builds and deploys in ~30 seconds. You'll get a URL like `random-words.netlify.app`.

**To get a cleaner URL:** In Netlify → Site Settings → General → Site details → Change site name → set it to `dilorenzo-epk` → your URL becomes `dilorenzo-epk.netlify.app`.

**To use a custom domain:** Site Settings → Domain management → Add a domain → follow the DNS instructions.

### Step 6: Future updates

Any time you change a file:

```bash
cd /path/to/[djname]-epk
git add .
git commit -m "Brief description of what changed"
git push
```

Netlify detects the push automatically and re-deploys within ~30 seconds. No manual upload needed.

---

## Hosting as a subfolder of an existing site

If the DJ is affiliated with a collective that already has a Netlify site (e.g. `vergecollectiv.com`), the EPK can live at `vergecollectiv.com/dilorenzo` instead of its own URL. This is simpler to set up and removes the need for a separate Netlify site.

**How:** Copy the entire EPK folder (without the `.git` folder inside it) into the collective's repo as a subfolder named `dilorenzo/`. All asset paths in the EPK are relative (e.g. `assets/css/style.css` not `/assets/css/style.css`), so they resolve correctly from the subfolder without any changes.

```bash
# From inside the collective's repo
cp -r /path/to/dilorenzo-epk ./dilorenzo
rm -rf ./dilorenzo/.git        # Remove nested git — only one git repo allowed
rm ./dilorenzo/netlify.toml    # Remove nested Netlify config — only root one applies
git add dilorenzo/
git commit -m "Add DILORENZO EPK at /dilorenzo/"
git push
```

**To remove it later:** `rm -rf dilorenzo/ && git add . && git commit -m "Remove DILORENZO EPK" && git push`. Done — nothing else on the site is affected.

---

## Troubleshooting

**SoundCloud soundbar plays nothing / play button does nothing**
- The `loading="lazy"` attribute must NOT be on the SC iframe. Lazy loading defers the iframe src from loading, which breaks the Widget API.
- The SC API script (`<script async src="...api.js">`) must be `async` not `defer`. `defer` waits until after HTML parsing — by then `main.js` has already run and `typeof SC` is undefined.
- All widget event bindings must be inside the `READY` callback. Binding events before READY results in silent failures.

**SoundCloud on iPhone plays nothing / play button seems to do nothing**
- iOS Safari blocks cross-origin iframe audio control without a direct user tap on the iframe itself. The fix: when the play button is pressed, `widget.play()` is called optimistically. If no PLAY event fires within 800ms, `#sbScFallback` appears — a pill button in the soundbar that opens SoundCloud directly. The soundbar still shows on iOS; it just falls back to a link if the Widget API is blocked. This is correct behavior, not a bug.

**Section does not collapse / accordion stuck open**
- The `transitionend` event on `.acc-body` must fire cleanly. If you add `transition: none` in a media query without the `prefers-reduced-motion` wrapper, the event won't fire and height will stay at the pixel value instead of switching to `auto`.
- Always include: `@media (prefers-reduced-motion: reduce) { .acc-body { transition: none !important; } }`

**Hero image cuts off the subject's head on desktop**
- Lower the `object-position` percentage: `center 12%` shows more of the top of the image. `center 0%` shows the very top. `center 50%` centers the image vertically. Adjust in small increments (4–5% at a time) and check at multiple window sizes.

**Gallery ticker label takes up too much space on mobile**
- The `.ticker-label` is hidden at ≤700px via `display: none`. If it's showing, check that the mobile media query is present in `style.css`.

**Community section looks bad on mobile / verge-col visible on mobile**
- `.verge-col` (the large clickable logo card) is hidden at ≤960px via `display: none`. On tablet, community shows as 2-col (text + photos). On mobile it stacks to 1 col.
- On mobile, the Verge logo is shown via `.verge-mob-link` — a small inline logo + arrow inside `.comm-text`. This appears below the stats block only at ≤960px. It's a separate element from `.verge-col`; both can't be visible at the same time.

**Gallery looks different above vs. below the ticker on mobile**
- Both gallery rows use the same CSS class `.gallery-row`. On mobile (≤700px): `grid-template-columns: 1fr 1fr`, `aspect-ratio: 4/3`, and `.gp-item:last-child { display: none }`. This hides the 3rd photo and shows 2 side-by-side at the same ratio in both rows — identical above and below the ticker. Do not add a breakpoint that overrides this for smaller screens (e.g. a 480px rule showing 3 items) — that breaks the congruence.

**Images not loading after deploy**
- All image paths are case-sensitive on Netlify (Linux server) but not on Mac (case-insensitive). If you name a file `Hero-BG.jpg` and reference it as `hero-bg.jpg` it works on your Mac but 404s on Netlify. Always use lowercase filenames.

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-19 | Initial build — DILORENZO EPK |
| 2026-06-19 | Gallery grid (3×2 + venue ticker), Sound two-column, Community 3-col with verge-col hover invert |
| 2026-06-19 | Accordion system: all sections collapsed by default, JS height animation, exclusive open |
| 2026-06-19 | Removed diagonal clip-path; clean card separations with positive margin gap + border-radius |
| 2026-06-19 | Section colors: cream / black / dark teal / tan / espresso — visually distinct per folder |
| 2026-06-19 | CSS scroll-snap (proximity mode) — subtle magnetic feel on scroll |
| 2026-06-19 | TikTok icon added to nav, hero, and Book section |
| 2026-06-19 | Hero image object-position center 12% — full head visible on desktop |
| 2026-06-19 | SoundCloud: removed loading=lazy from iframe, added READY event, /tracks URL for newest track |
| 2026-06-19 | About bio and Community copy updated to final text |
| 2026-06-19 | Section order: About → Sound → Gallery → Community → Book (on all screen sizes) |
| 2026-06-19 | Git initialized, pushed to VergeCollectiv/dilorenzo-epk, deployed at vergecollectiv.com/dilorenzo |
| 2026-06-19 | SC API script marked async; duplicate CSS hero-content merged; unused .vs-city removed |
| 2026-06-19 | Removed scroll-snap (fought accordion height animation on mobile, causing image scatter) |
| 2026-06-19 | SC section: replaced busy iframe embed with clean .sc-card link; hidden iframe moved off-screen for Widget API |
| 2026-06-19 | iOS SC fallback: #sbScFallback pill appears in soundbar if Widget API play blocked after 800ms |
| 2026-06-19 | Gallery mobile: consistent 2-col 4/3 above+below ticker; removed 480px override that broke congruence |
| 2026-06-19 | Community: .verge-mob-link (inline logo + arrow) added inside comm-text, visible at ≤960px only |
| 2026-06-19 | YouTube cover photo updated to verge-highlight-1.jpg; .watch-more link + CSS removed |
