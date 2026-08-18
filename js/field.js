/* One motion system: a living color field. No video. No looped GIF.
   Every frame is time + noise + pointer. Events fire on an irregular clock. */
(() => {
  const canvas = document.getElementById("field");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    t0: performance.now(),
    mx: 0.5,
    my: 0.38,
    tx: 0.5,
    ty: 0.38,
    hueShift: 0,
    bloom: 0,
    pulse: 0,
    nextEvent: 0,
    filament: null,
    particles: [],
    running: true,
  };

  function hash(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function noise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function hourPalette() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h < 6) return { a: [48, 72, 160], b: [120, 80, 210], c: [30, 120, 150] };
    if (h < 10) return { a: [210, 110, 90], b: [80, 170, 210], c: [230, 160, 80] };
    if (h < 17) return { a: [30, 190, 195], b: [110, 120, 240], c: [20, 110, 170] };
    if (h < 20) return { a: [230, 100, 80], b: [140, 80, 210], c: [80, 100, 190] };
    return { a: [40, 210, 215], b: [130, 100, 240], c: [20, 90, 160] };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.dpr = dpr;
    canvas.width = Math.floor(state.w * dpr);
    canvas.height = Math.floor(state.h * dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function seedParticles() {
    const count = reduced ? 0 : Math.round((state.w * state.h) / 14000);
    state.particles = Array.from({ length: Math.max(80, Math.min(count, 220)) }, () => ({
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      s: 0.5 + Math.random() * 1.6,
      a: 0.12 + Math.random() * 0.35,
    }));
  }

  function scheduleEvent(now) {
    state.nextEvent = now + 900 + Math.random() * 4200;
  }

  function fireEvent() {
    const kind = ["bloom", "filament", "hue", "pulse"][(Math.random() * 4) | 0];
    if (kind === "bloom") state.bloom = 1;
    if (kind === "hue") state.hueShift = 1;
    if (kind === "pulse") state.pulse = 1;
    if (kind === "filament") {
      const edge = Math.random();
      const x0 = edge < 0.5 ? (edge < 0.25 ? 0 : state.w) : Math.random() * state.w;
      const y0 = edge >= 0.5 ? (edge < 0.75 ? 0 : state.h) : Math.random() * state.h;
      const x1 = state.w * (0.25 + Math.random() * 0.5);
      const y1 = state.h * (0.2 + Math.random() * 0.45);
      const x2 = Math.random() * state.w;
      const y2 = Math.random() * state.h;
      state.filament = { x0, y0, x1, y1, x2, y2, life: 1 };
    }
    document.documentElement.style.setProperty(
      "--accent",
      state.hueShift > 0.5 ? "#8b7cff" : "#5ce1e6"
    );
  }

  function drawBlob(x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${alpha})`);
    g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function tick(now) {
    if (!state.running) return;
    const t = (now - state.t0) / 1000;
    state.mx += (state.tx - state.mx) * 0.045;
    state.my += (state.ty - state.my) * 0.045;
    state.bloom *= 0.96;
    state.hueShift *= 0.975;
    state.pulse *= 0.94;

    if (!reduced && now >= state.nextEvent) {
      fireEvent();
      scheduleEvent(now);
    }

    const pal = hourPalette();
    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.globalCompositeOperation = "lighter";

    const blobs = [
      { c: pal.a, px: 0.28, py: 0.42, s: 0.13, ph: 0.0 },
      { c: pal.b, px: 0.72, py: 0.26, s: 0.1, ph: 1.7 },
      { c: pal.c, px: 0.58, py: 0.7, s: 0.09, ph: 3.1 },
      { c: pal.a, px: 0.12, py: 0.18, s: 0.07, ph: 4.4 },
    ];

    blobs.forEach((b, i) => {
      const nx = noise(t * b.s + i, 2.2) - 0.5;
      const ny = noise(4.1, t * b.s + i) - 0.5;
      const x = (b.px + Math.sin(t * b.s + b.ph) * 0.1 + nx * 0.14) * state.w;
      const y = (b.py + Math.cos(t * b.s * 0.85 + b.ph) * 0.08 + ny * 0.12) * state.h;
      const r = Math.max(state.w, state.h) * (0.42 + state.bloom * 0.16 + state.pulse * 0.08);
      const alpha = 0.3 + state.bloom * 0.16;
      drawBlob(x, y, r, b.c, alpha);
    });

    const lx = state.mx * state.w;
    const ly = state.my * state.h;
    drawBlob(lx, ly, Math.max(state.w, state.h) * 0.28, [170, 240, 245], 0.14 + state.pulse * 0.1);

    if (state.filament) {
      const f = state.filament;
      ctx.strokeStyle = `rgba(200, 240, 255, ${0.18 * f.life})`;
      ctx.lineWidth = 1.2 + 2 * f.life;
      ctx.shadowColor = "rgba(92, 225, 230, 0.55)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(f.x0, f.y0);
      ctx.quadraticCurveTo(f.x1, f.y1, f.x2, f.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      f.life -= 0.012;
      if (f.life <= 0) state.filament = null;
    }

    ctx.globalCompositeOperation = "source-over";
    for (const p of state.particles) {
      const ang = noise(p.x * 0.0014, p.y * 0.0014 + t * 0.05) * Math.PI * 4;
      p.x += Math.cos(ang) * p.s;
      p.y += Math.sin(ang) * p.s * 0.7;
      if (p.x < 0) p.x = state.w;
      if (p.x > state.w) p.x = 0;
      if (p.y < 0) p.y = state.h;
      if (p.y > state.h) p.y = 0;
      ctx.fillStyle = `rgba(230, 236, 240, ${p.a})`;
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    }

    requestAnimationFrame(tick);
  }

  function onPointer(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    state.tx = x / state.w;
    state.ty = y / state.h;
  }

  window.AetherField = {
    intensify() {
      state.bloom = 1;
      state.pulse = 1;
      state.hueShift = 1;
      fireEvent();
    },
    status() {
      return reduced ? "still" : "live";
    },
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("touchmove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", () => {
    state.running = document.visibilityState === "visible";
    if (state.running) requestAnimationFrame(tick);
  });

  resize();
  scheduleEvent(performance.now() + 700);
  if (reduced) {
    const pal = hourPalette();
    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, state.w, state.h);
    ctx.globalCompositeOperation = "lighter";
    drawBlob(state.w * 0.4, state.h * 0.35, state.w * 0.4, pal.a, 0.22);
    drawBlob(state.w * 0.7, state.h * 0.3, state.w * 0.32, pal.b, 0.16);
    return;
  }
  requestAnimationFrame(tick);
})();
