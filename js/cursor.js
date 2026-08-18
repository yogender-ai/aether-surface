/* One cursor language on fine pointers only.
   Dot + following ring + magnetic pull + particle trail + click swirl.
   Flashlight lives on the board (app.js), not here. */
(() => {
  const root = document.getElementById("cursor");
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!root || !fine || reduce) return;

  const dot = root.querySelector(".cursor-dot");
  const ring = root.querySelector(".cursor-ring");
  root.hidden = false;
  document.body.classList.add("has-cursor");

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const follow = { x: pos.x, y: pos.y };
  const particles = [];
  let lastEmit = 0;
  let lastX = pos.x;
  let lastY = pos.y;

  function emit(x, y, swirl) {
    const n = swirl ? 10 : 1;
    for (let i = 0; i < n; i++) {
      const a = swirl ? (Math.PI * 2 * i) / n : Math.random() * Math.PI * 2;
      particles.push({
        x, y,
        vx: Math.cos(a) * (swirl ? 2.4 : 0.4),
        vy: Math.sin(a) * (swirl ? 2.4 : 0.4),
        life: 1,
        swirl,
      });
    }
  }

  function nearestMagnet(x, y) {
    let best = null;
    let bestD = 90;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bestD) {
        bestD = d;
        best = { el, cx, cy, r };
      }
    });
    return best;
  }

  window.addEventListener("pointermove", (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    const tag = (e.target && e.target.tagName) || "";
    root.hidden = tag === "INPUT" || tag === "TEXTAREA";
    const now = performance.now();
    if (now - lastEmit > 28 && Math.hypot(pos.x - lastX, pos.y - lastY) > 6) {
      emit(pos.x, pos.y, false);
      lastEmit = now;
      lastX = pos.x;
      lastY = pos.y;
    }
  }, { passive: true });

  window.addEventListener("pointerdown", () => {
    document.body.classList.add("is-click");
    emit(pos.x, pos.y, true);
  });
  window.addEventListener("pointerup", () => document.body.classList.remove("is-click"));

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:49";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", size, { passive: true });
  size();

  function tick() {
    const magnet = nearestMagnet(pos.x, pos.y);
    document.body.classList.toggle("is-hot", Boolean(magnet));

    let tx = pos.x;
    let ty = pos.y;
    if (magnet) {
      tx += (magnet.cx - pos.x) * 0.18;
      ty += (magnet.cy - pos.y) * 0.18;
      const pullX = (pos.x - magnet.cx) * 0.12;
      const pullY = (pos.y - magnet.cy) * 0.12;
      magnet.el.style.transform = `translate(${pullX}px, ${pullY}px)`;
    }
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      if (!magnet || el !== magnet.el) el.style.transform = "";
    });

    follow.x += (tx - follow.x) * 0.18;
    follow.y += (ty - follow.y) * 0.18;
    dot.style.left = pos.x + "px";
    dot.style.top = pos.y + "px";
    ring.style.left = follow.x + "px";
    ring.style.top = follow.y + "px";

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.swirl) {
        const ang = 0.12;
        const nx = p.vx * Math.cos(ang) - p.vy * Math.sin(ang);
        const ny = p.vx * Math.sin(ang) + p.vy * Math.cos(ang);
        p.vx = nx;
        p.vy = ny;
      }
      p.life -= p.swirl ? 0.02 : 0.045;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(232, 168, 124, ${p.life * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.swirl ? 2.2 : 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
