# Aether

A living start surface. Built as **Part 2** of the Acdyon Technologies frontend challenge.

Live: https://aether-surface.vercel.app

Repo: https://github.com/yogender-ai/aether-surface

## What it is

Most new-tab pages are dead wallpaper. Aether is a field that is new every frame — color from the real hour, drift from noise, light from the pointer — and one command to leave.

There are no fabricated testimonials, user counts, or logos. If it is not running on the page, it is not claimed.

## Stack

Vanilla HTML, CSS, and JavaScript. No framework. Chosen so every line can be explained.

```
index.html      structure
css/main.css    type, space, glass, 390 / 1440
js/field.js     the living background (one motion system)
js/app.js       clock, door, command, Konami egg
DECISIONS.md    the one-page writeup the brief asked for
```

## Run locally

```bash
cd aether-surface
python3 -m http.server 4173
```

Open http://localhost:4173

## What to look at

- Hero: value prop + one CTA in the first screen
- `#surface`: live product, not a screenshot
- Magnetic pull on the cream button
- Enter: local door, nothing is sent
- `↑ ↑ ↓ ↓ ← → ← → B A` for the easter egg
- Dark only. Reduced-motion respected.

## Brief map

| Ask | Where |
| --- | --- |
| Wow in 3 seconds | Hero + live field |
| Show the product | `#surface` |
| Motion that earns keep | `js/field.js` |
| 390 and 1440 | `css/main.css` media queries |
| Honesty | copy + real clock / day ribbon |
| DECISIONS.md | this repo |
