# Decisions

Track: **Part 2 — premium home page.** I did not do the scraper. One track, gone deep.

## 1. Why this strategy, not the obvious alternative

The obvious homepage is a React/Framer landing with a looping video, three fake logos, and a “Join 12k teams” line. I rejected that on two grounds the brief itself grades: **honesty** and **motion restraint**.

Aether is a living start surface. The page *is* the product. The first screen is a 3D compositor universe — receding glass tiles, a star volume, and a cosmic web — not a 2020 gradient blob. The camera flies forward; meteors, novas, and tile-rushes fire off-beat. A live portal (real clock) sits in the hero so the product is visible in the first three seconds. The glass stage below still holds the command that only leaves on a real URL.

I also rejected React. I do not know it well enough to defend every line on a follow-up call. This is HTML, CSS, and two small scripts — the stack I already ship with.

## Rebuild note

Killed the flying-tile parallax and the left orb cards. New theme: zinc + copper + Syne. Cursor is now the motion language (dot, follow, magnetic, trail, board flashlight, click swirl). Native cursor on touch and reduced motion.

## Combo I shipped

Researched 20 live sites and 30 starred repos, then rejected 4 combos:

1. Linear + Lenis only - company-safe, looks like every 2024 SaaS clone.
2. **Hyprland scroll-story + live 3D tiles + pointer tilt (shipped).** Fits Acdyon taste grade and your "every scroll is a scene" ask.
3. GSAP pin + Three.js - 110k stars, cannot defend line-by-line in the call.
4. gethomepage / Dashy startpage widgets - wrong product.
5. particles.js 2020 soup - the thing we just killed.

Dials from taste-skill: variance 8, motion 8, density 3. Dark only. Vanilla so I can walk it.

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
