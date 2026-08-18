# Decisions

Track: **Part 2 — premium home page.** One track.

## 1. Why this strategy

I shipped **Afterglow**: near-black, one live product card in a slow indigo/rose halo. The interface is the hero. Atmosphere is the frame.

Rejected: flying-tile parallax (steals attention), custom cursors (the spec wants a native arrow), fake Test Command numbers (the brief grades honesty hardest). The glass card is the real Aether surface: this machine's clock, this hour, this day bar, a URL field.

Stack is vanilla HTML/CSS/JS so I can walk every line.

## 2. Time-limit trade-off

Local door only (`localStorage`). With a week: real auth and a saved board layout.

Dark only. The brief says half-dark is worse than none.

Signature motion is one glow: `--x/--y` from `pointermove`, opacity 12% to 4% over the first 60vh. Nothing else follows the pointer.

## 3. AI use

Grok implemented Afterglow from a written spec. I then:

- Kept every number on the card real (no invented test counts).
- Locked the glow to 480px / 60px blur / 12% opacity.
- Disabled the tracking glow on coarse pointers.
- Froze hue rotation under `prefers-reduced-motion`.
- Added the `midnight` key buffer as the easter egg.
