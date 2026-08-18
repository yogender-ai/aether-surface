# Decisions

Track: **Part 2 — the premium home page.** Not both. Not the scraper.

## 1. Why this strategy over the obvious alternative

The obvious homepage is a React/Framer landing with a looping video, fake logos, and “Join 12k teams.” I rejected that because the brief grades **honesty** and **motion restraint**.

I shipped **Afterglow**: void `#0A0A0B`, one live product card in an indigo `#6E5BFF` / rose `#FF6F91` halo. The glass card *is* the product — this machine’s clock, this hour, this day used, one URL field. No invented test counts.

The one pointer move is a 480px / 60px-blur / 12% glow on `--x` / `--y`. Native arrow. No custom cursor, no flying tiles. Vanilla HTML/CSS/JS so I can walk every line on the call.

## 2. One trade-off under the time limit

Local door only (`localStorage`, two steps, nothing posted). With a real week I would add a tiny backend and persist board prefs.

Dark only. The brief says half-dark is worse than none.

## 3. Where I used AI, and what I verified

Grok built Afterglow from a written spec. I then:

- Removed every fake metric, logo, and testimonial.
- Checked 390px and 1440px: no horizontal scroll, glow off on coarse pointers.
- Locked glow numbers (480 / 60 / 12→4).
- Froze hue rotation and boot under `prefers-reduced-motion`.
- Added the `midnight` key buffer as the optional easter egg.

If asked about any file, I can defend it without “the AI suggested it.”
