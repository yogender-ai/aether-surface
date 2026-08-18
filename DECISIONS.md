# Decisions

Track: **Part 2 — premium home page.** I did not do the scraper. One track, gone deep.

## 1. Why this strategy, not the obvious alternative

The obvious homepage is a React/Framer landing with a looping video, three fake logos, and a “Join 12k teams” line. I rejected that on two grounds the brief itself grades: **honesty** and **motion restraint**.

Aether is a living start surface. The page *is* the product. The background is a canvas field computed each frame from time-of-day color, value noise, and the pointer — not a video. Rare events (bloom, filament, hue, pulse) fire on an irregular 0.9–5.1s clock so the eye never learns a loop. The glass stage shows a real clock, a real day ribbon, and a command that only leaves on a real URL.

I also rejected React. I do not know it well enough to defend every line on a follow-up call. This is HTML, CSS, and two small scripts — the stack I already ship with.

## 2. Time-limit trade-off

Shipped a local door (email + passphrase stay in `localStorage`, nothing is posted) instead of real auth. With a week I would add a tiny backend, persist surface prefs, and a second “still” mode that freezes the field into a photograph of the current hour.

I also did not add a light theme. The brief says half-dark is worse than none. This is dark only, on purpose.

## 3. AI use

Grok (this session) drafted structure, the noise field, and first-pass CSS. I then:

- Rewrote all marketing copy to remove any fake metric, logo, or testimonial.
- Checked 390px and 1440px by hand (no horizontal scroll, nav collapse, stacked meters).
- Kept one motion system (the field) plus one micro-interaction (magnetic CTA).
- Added `prefers-reduced-motion` (static field, no magnetic pull).
- Verified the command bar only navigates on a real URL.

If asked about any file, I can walk it line by line.
