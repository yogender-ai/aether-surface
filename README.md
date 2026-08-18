# Aether

Afterglow homepage for the Acdyon frontend challenge, Part 2.

Live: https://aether-surface.vercel.app

Repo: https://github.com/yogender-ai/aether-surface

## What it is

A start surface. The glass card is the product: live clock, real day used, one URL field. No invented metrics.

## Stack

Vanilla HTML, CSS, one script.

```
index.html
css/main.css      Afterglow tokens, halo, glass
js/app.js         clock, door, --x/--y glow, scroll fade, midnight
assets/horizon.jpg
DECISIONS.md
```

## Run

```bash
cd /data/yash/Projects/aether-surface
python3 -m http.server 4173
```

Home is a symlink: `~/aether-surface` → this folder.

## Spec map

| Ask | Where |
| --- | --- |
| Void + indigo/rose | CSS variables `--void --g1 --g2` |
| Product is the hero | `.glass` in the lower two-thirds |
| One pointer effect | `--x --y` radial 480px / 60px blur / 12% |
| Scroll fade | `--glow` 0.12 → 0.04 over 60vh |
| Easter egg | type `midnight` |
| 390 / 1440 | media queries; no tracking glow on coarse pointers |
