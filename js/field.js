/* Quiet field. No flying tiles. A still wash that only warms under the pointer. */
(() => {
  const canvas = document.getElementById("field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = { w: 0, h: 0, mx: 0.5, my: 0.35, tx: 0.5, ty: 0.35, running: true };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    state.w = innerWidth;
    state.h = innerHeight;
    canvas.width = Math.floor(state.w * dpr);
    canvas.height = Math.floor(state.h * dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }

  function paint() {
    ctx.fillStyle = "#111113";
    ctx.fillRect(0, 0, state.w, state.h);
    const x = state.mx * state.w;
    const y = state.my * state.h;
    const g = ctx.createRadialGradient(x, y, 20, x, y, Math.max(state.w, state.h) * 0.55);
    g.addColorStop(0, "rgba(232, 168, 124, 0.16)");
    g.addColorStop(0.45, "rgba(80, 70, 90, 0.08)");
    g.addColorStop(1, "rgba(17, 17, 19, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.w, state.h);
  }

  function tick() {
    if (!state.running) return;
    state.mx += (state.tx - state.mx) * 0.06;
    state.my += (state.ty - state.my) * 0.06;
    paint();
    if (!reduced) requestAnimationFrame(tick);
  }

  window.addEventListener("pointermove", (e) => {
    state.tx = e.clientX / state.w;
    state.ty = e.clientY / state.h;
  }, { passive: true });

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    state.running = document.visibilityState === "visible";
    if (state.running) requestAnimationFrame(tick);
  });

  window.AetherField = {
    status() { return reduced ? "still" : "live"; },
    intensify() {},
    setChapter() {},
  };

  resize();
  if (!reduced) requestAnimationFrame(tick);
})();
