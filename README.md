# clankerabuse.github.io

Personal portfolio for Kayne — ten projects across desktop, web, mobile, browser and
machine learning. Static HTML, CSS and a little vanilla JavaScript; no build step, no
framework, no third-party requests at runtime.

Live at **https://clankerabuse.github.io/**

## Layout

```
index.html          the whole page
style.css           design tokens, layout, and the per-project CSS mocks
script.js           theme switch, category filter, scroll reveal
404.html            not-found page (GitHub Pages picks it up automatically)
assets/             self-hosted fonts, favicon, speechskin screenshot, og.png
tools/og-card.html  source for the 1200x630 social preview image
```

## Editing

Project entries are plain markup: each card is an `<article class="card" data-cat="…">`
inside `#grid`. `data-cat` accepts `desktop`, `web`, `mobile`, `browser`, `ai` and drives
the filter buttons. A private repository gets `<span class="chip chip-private">Private</span>`
and no repository link.

Design tokens (colour, type, radii) live at the top of `style.css`; dark is the default,
light follows `prefers-color-scheme` unless a visitor has chosen a theme.

## Regenerating the social card

```bash
chromium --headless=new --hide-scrollbars --window-size=1200,630 \
  --screenshot=assets/og.png http://127.0.0.1:8765/tools/og-card.html
```

## Deploying

GitHub Pages serves the repository root of `main`. Push and it is live:

```bash
git add -A && git commit -m "…" && git push
```
