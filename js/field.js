/* One motion system: a 3D universe of compositor tiles.
   Not a 2020 gradient blob. Windows recede in perspective, stars sit in
   volume, filaments snap between nodes, events fire off-beat. */
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
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    camZ: 0,
    rush: 0,
    flash: 0,
    hue: 0,
    nextEvent: 0,
    windows: [],
    stars: [],
    links: [],
    meteors: [],
    rings: [],
    running: true,
    speed: 0.55,
    chapter: "fly",
  };

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  function seed() {
    const tiles = [];
    const cols = state.w < 700 ? 5 : 7;
    const rows = state.w < 700 ? 3 : 4;
    const depths = state.w < 700 ? 4 : 6;
    for (let d = 0; d < depths; d++) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({
            x: (c - (cols - 1) / 2) * 168 + rnd(-18, 18),
            y: (r - 1.15) * 108 + d * 16 + rnd(-10, 10),
            z: 220 + d * 230 + rnd(0, 90),
            bw: rnd(118, 168),
            bh: rnd(72, 104),
            pulse: Math.random(),
            kind: Math.random() < 0.18 ? "hot" : "cool",
            lit: Math.random(),
          });
        }
      }
    }
    for (let i = 0; i < 16; i++) {
      tiles.push({
        x: rnd(-720, 720),
        y: rnd(-280, 360),
        z: rnd(260, 1680),
        bw: rnd(90, 150),
        bh: rnd(60, 96),
        pulse: Math.random(),
        kind: Math.random() < 0.4 ? "hot" : "cool",
        lit: Math.random(),
      });
    }
    state.windows = tiles;

    const starN = Math.round(Math.min(900, (state.w * state.h) / 2200));
    state.stars = Array.from({ length: starN }, () => ({
      x: rnd(-1400, 1400),
      y: rnd(-900, 900),
      z: rnd(80, 2000),
      a: rnd(0.25, 1),
      s: rnd(0.6, 2.1),
    }));

    state.links = [];
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const a = tiles[i];
        const b = tiles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = (a.z - b.z) * 0.35;
        const dist = Math.hypot(dx, dy, dz);
        if (dist < 240 && Math.random() < 0.22) {
          state.links.push({ i, j, a: rnd(0.08, 0.22) });
        }
      }
    }
  }

  function project(x, y, z) {
    const zz = z - state.camZ;
    if (zz < 40) return null;
    const f = 720 / zz;
    return {
      x: state.w * 0.5 + (x + state.mx) * f,
      y: state.h * 0.42 + (y + state.my) * f,
      s: f,
      z: zz,
    };
  }

  function recycle(p, far) {
    p.z = state.camZ + far + rnd(0, 80);
  }

  function schedule(now) {
    state.nextEvent = now + 700 + Math.random() * 3400;
  }

  function fireEvent() {
    const kind = ["meteor", "nova", "rush", "wake", "hue"][(Math.random() * 5) | 0];
    if (kind === "meteor") {
      state.meteors.push({
        x: rnd(-800, 800),
        y: rnd(-400, 80),
        z: state.camZ + rnd(400, 900),
        vx: rnd(-14, 14),
        vy: rnd(6, 16),
        vz: rnd(-18, -8),
        life: 1,
      });
    }
    if (kind === "nova") {
      const host = state.windows[(Math.random() * state.windows.length) | 0];
      state.rings.push({ x: host.x, y: host.y, z: host.z, r: 4, life: 1 });
      state.flash = 0.55;
    }
    if (kind === "rush") {
      const host = state.windows[(Math.random() * state.windows.length) | 0];
      host.z = state.camZ + 180;
      host.lit = 1;
      state.rush = 1;
    }
    if (kind === "wake") {
      state.windows.forEach((w) => {
        if (Math.random() < 0.12) w.lit = 1;
      });
    }
    if (kind === "hue") {
      state.hue = 1;
      document.documentElement.style.setProperty(
        "--accent",
        Math.random() > 0.5 ? "#8b7cff" : "#5ce1e6"
      );
    }
  }

  function drawWindow(w, p, t) {
    const scale = state.w < 700 ? 0.2 : 0.3;
    const width = w.bw * p.s * scale;
    const height = w.bh * p.s * scale;
    if (width < 8 || height < 5) return;
    const x = p.x - width / 2;
    const y = p.y - height / 2;
    const depth = Math.max(0, 1 - p.z / 1900);
    const flicker = 0.62 + 0.38 * Math.sin(t * 1.4 + w.pulse * 12);
    const hot = w.kind === "hot";
    const r = hot ? 168 : 80;
    const g = hot ? 120 : 232;
    const b = hot ? 255 : 236;
    const alpha = (0.16 + depth * 0.38 + w.lit * 0.28) * flicker;
    const radius = Math.min(14, width * 0.1);

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
    else ctx.rect(x, y, width, height);
    ctx.fillStyle = `rgba(7, 12, 22, ${0.32 + depth * 0.38})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = Math.max(0.8, 1.8 * depth);
    ctx.stroke();

    if (width > 26) {
      const sheen = ctx.createLinearGradient(x, y, x, y + height);
      sheen.addColorStop(0, `rgba(${r},${g},${b},${0.1 + w.lit * 0.14})`);
      sheen.addColorStop(0.45, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.1 + w.lit * 0.18})`;
      ctx.fillRect(x + 5, y + 5, width - 10, Math.max(4, height * 0.15));
    }
  }

  function frame(now) {
    const t = (now - state.t0) / 1000;
    state.mx += (state.tx - state.mx) * 0.04;
    state.my += (state.ty - state.my) * 0.04;
    state.rush *= 0.94;
    state.flash *= 0.92;
    state.hue *= 0.97;
    state.camZ += state.speed + state.rush * 4;

    if (!reduced && now >= state.nextEvent) {
      fireEvent();
      schedule(now);
    }

    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, state.w, state.h);

    const nebula = ctx.createRadialGradient(
      state.w * (0.5 + state.mx * 0.0004),
      state.h * 0.38,
      40,
      state.w * 0.5,
      state.h * 0.45,
      Math.max(state.w, state.h) * 0.7
    );
    nebula.addColorStop(0, state.hue > 0.3 ? "rgba(90,70,180,0.16)" : "rgba(20,90,130,0.16)");
    nebula.addColorStop(0.45, "rgba(20,40,90,0.08)");
    nebula.addColorStop(1, "rgba(5,7,12,0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, state.w, state.h);

    ctx.globalCompositeOperation = "lighter";
    for (const s of state.stars) {
      if (s.z - state.camZ < 40) recycle(s, 1900);
      const p = project(s.x, s.y, s.z);
      if (!p) continue;
      const tw = 0.55 + 0.45 * Math.sin(t * 3 + s.x);
      ctx.fillStyle = `rgba(220, 235, 255, ${s.a * tw * Math.min(1, p.s)})`;
      ctx.fillRect(p.x, p.y, s.s * p.s * 0.18, s.s * p.s * 0.18);
    }

    ctx.globalCompositeOperation = "source-over";
    for (const link of state.links) {
      const a = state.windows[link.i];
      const b = state.windows[link.j];
      const pa = project(a.x, a.y, a.z);
      const pb = project(b.x, b.y, b.z);
      if (!pa || !pb) continue;
      ctx.strokeStyle = `rgba(120, 200, 230, ${link.a * (0.35 + state.flash)})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    const ordered = state.windows
      .map((w) => {
        if (w.z - state.camZ < 70) recycle(w, 1650);
        w.lit *= 0.97;
        return { w, p: project(w.x, w.y, w.z) };
      })
      .filter((d) => d.p)
      .sort((a, b) => b.p.z - a.p.z);

    for (const d of ordered) drawWindow(d.w, d.p, t);

    ctx.globalCompositeOperation = "lighter";
    for (let i = state.meteors.length - 1; i >= 0; i--) {
      const m = state.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.z += m.vz;
      m.life -= 0.016;
      const p = project(m.x, m.y, m.z);
      const p2 = project(m.x - m.vx * 6, m.y - m.vy * 6, m.z - m.vz * 6);
      if (p && p2) {
        ctx.strokeStyle = `rgba(200, 240, 255, ${0.7 * m.life})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      if (m.life <= 0) state.meteors.splice(i, 1);
    }

    for (let i = state.rings.length - 1; i >= 0; i--) {
      const ring = state.rings[i];
      ring.r += 7;
      ring.life -= 0.02;
      const p = project(ring.x, ring.y, ring.z);
      if (p) {
        ctx.strokeStyle = `rgba(160, 210, 255, ${0.35 * ring.life})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ring.r * p.s * 0.12, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (ring.life <= 0) state.rings.splice(i, 1);
    }

    if (state.flash > 0.02) {
      ctx.fillStyle = `rgba(180, 220, 255, ${state.flash * 0.08})`;
      ctx.fillRect(0, 0, state.w, state.h);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function tick(now) {
    if (!state.running) return;
    frame(now);
    requestAnimationFrame(tick);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.dpr = dpr;
    canvas.width = Math.floor(state.w * dpr);
    canvas.height = Math.floor(state.h * dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    frame(performance.now());
  }

  function onPointer(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    state.tx = (x / state.w - 0.5) * 140;
    state.ty = (y / state.h - 0.4) * 80;
  }

  const chapters = {
    fly: { speed: 0.55, accent: "#5ce1e6" },
    dock: { speed: 0.22, accent: "#7cf0d0" },
    constellation: { speed: 0.9, accent: "#8b7cff" },
    horizon: { speed: 1.35, accent: "#5ce1e6" },
  };

  window.AetherField = {
    setChapter(name) {
      if (state.chapter === name) return;
      state.chapter = name;
      const ch = chapters[name] || chapters.fly;
      state.speed = ch.speed;
      document.documentElement.style.setProperty("--accent", ch.accent);
      state.flash = 0.35;
      state.windows.forEach((w, i) => {
        if (i % 5 === 0) w.lit = 1;
      });
      if (name === "horizon" || name === "constellation") fireEvent();
    },
    intensify() {
      state.rush = 1;
      state.flash = 1;
      state.hue = 1;
      state.windows.forEach((w) => {
        w.lit = 1;
      });
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
  schedule(performance.now() + 400);
  if (reduced) return;
  requestAnimationFrame(tick);
})();
