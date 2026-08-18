<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:0A0A0B,40:6E5BFF,75:FF6F91,100:0A0A0B&text=AETHER&fontColor=EDEDEA&fontAlignY=38&fontSize=54&fontAlign=50&desc=the%20surface%20is%20the%20product&descAlignY=62&descSize=16&animation=twinkling&section=header" alt="Aether waving banner" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Bricolage+Grotesque&weight=600&size=28&duration=2600&pause=900&color=EDEDEA&center=true&vCenter=true&width=780&lines=The+surface+is+the+product.;Live+clock.+Real+day+bar.+One+URL.;Void+%2B+indigo+%E2%86%94+rose.+Native+cursor.;Type+midnight." alt="Aether typing line" />
</p>

<p align="center">
  <a href="https://aether-surface.vercel.app">
    <img src="https://img.shields.io/badge/Live-aether--surface.vercel.app-6E5BFF?style=for-the-badge&labelColor=0A0A0B" alt="Live site" />
  </a>
  <img src="https://img.shields.io/badge/Track-Part%202%20Homepage-FF6F91?style=for-the-badge&labelColor=0A0A0B" alt="Part 2" />
  <img src="https://img.shields.io/badge/Stack-HTML%20%2B%20CSS%20%2B%20JS-EDEDEA?style=for-the-badge&labelColor=0A0A0B" alt="Vanilla stack" />
  <img src="https://img.shields.io/badge/Theme-Dark%20only-111111?style=for-the-badge&labelColor=0A0A0B" alt="Dark only" />
</p>

<p align="center">
  <b>Aether</b> is a start surface for the Acdyon frontend challenge.<br/>
  Afterglow: near-black, one live glass card, a slow indigo → rose halo.<br/>
  No invented users. No borrowed logos. If it is not running on the page, it is not claimed.
</p>

<p align="center">
  <a href="https://aether-surface.vercel.app"><strong>Open the live surface →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/yogender-ai/aether-surface/blob/main/DECISIONS.md"><strong>Read DECISIONS.md</strong></a>
</p>

---

## What it does

The first screen *is* the product.

| On the glass | Honest? |
| --- | --- |
| Clock | This machine, this minute |
| Day used | Percent of today that has actually passed |
| Hour cells | Current hour lit. Nothing invented |
| URL field | Leaves only on a real URL |
| Door | Email then passphrase. Stays in `localStorage`. Nothing is posted |

---

## Afterglow language

```text
Void        #0A0A0B
Text        #EDEDEA
Indigo  →   #6E5BFF
Rose    →   #FF6F91
Glass       rgba(255,255,255,0.04)
```

Display: **Bricolage Grotesque 600**  
Body: **Inter**  
Kickers: **JetBrains Mono**, 12px, 0.08em, uppercase  

One pointer move: a 480px / 60px-blur / 12% glow on `--x` / `--y`.  
Native arrow. The room starts unlit. Scroll, hold the glass, or pull the cord to strike.  
Hour-strip drag is the dimmer. Scroll then eases that glow 12% → 4% over the first 60vh.

---

## Repo map

```text
index.html      three scenes + live glass + two-step door
css/main.css    Afterglow tokens, halo, grain, snap
js/app.js       clock, strike, dimmer, glow, midnight, door
DECISIONS.md    the one-page writeup the brief asked for
```

---

## Run locally

```bash
cd /data/yash/Projects/aether-surface
python3 -m http.server 4173
```

Then open http://localhost:4173

`~/aether-surface` is a symlink to this folder.

---

## Brief map

| They asked | Where it lives |
| --- | --- |
| One track | Part 2 only |
| Hero + one CTA | Overview → Enter Aether |
| Show the product | Live glass card |
| Motion that earns keep | Cursor glow + eased scroll |
| 390 / 1440 | Media queries. No tracking glow on coarse pointers |
| Dark all-or-nothing | Dark only |
| Honesty | No fake counts, logos, or quotes |
| Written page | `DECISIONS.md` |
| Easter egg | type **midnight** |

---

## How to look at it

1. Open the [live site](https://aether-surface.vercel.app)
2. Move the mouse — the halo follows
3. Scroll Overview → Decisions → Door
4. Click **Enter** (email, then passphrase)
5. Type **midnight**

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=130&section=footer&color=0:0A0A0B,40:6E5BFF,80:FF6F91,100:0A0A0B&animation=twinkling" alt="Aether footer wave" />
</p>
