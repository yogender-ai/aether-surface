(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const door = $("#door");
  const doorForm = $("#door-form");
  const formError = $("#form-error");
  const toast = $("#toast");
  const commandForm = $("#command-form");
  const commandInput = $("#command");
  const commandNote = $("#command-note");
  const sessionChip = $("#session-chip");
  const hello = $("#hello");
  const KEY = "aether.session";

  function pad(n) { return String(n).padStart(2, "0"); }

  function greeting(d) {
    const h = d.getHours();
    if (h < 5) return "Still night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Late light";
  }

  function hourName(d) {
    const h = d.getHours();
    if (h < 6) return "Night";
    if (h < 10) return "Dawn";
    if (h < 17) return "Day";
    if (h < 20) return "Dusk";
    return "Night";
  }

  function session() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  }

  function firstName(email) {
    const local = (email || "").split("@")[0] || "there";
    return local.replace(/[._-]+/g, " ").split(" ")[0];
  }

  function setText(id, value) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (el) el.textContent = value;
  }

  function applySession() {
    const s = session();
    if (s?.email) {
      if (sessionChip) sessionChip.textContent = firstName(s.email);
      setText(hello, `${greeting(new Date())}, ${firstName(s.email)}`);
    } else if (sessionChip) {
      sessionChip.textContent = "guest";
    }
  }

  function tickClock() {
    const d = new Date();
    const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const nav = $("#nav-clock");
    if (nav) {
      nav.textContent = clock;
      nav.dateTime = d.toISOString();
    }
    setText("big-clock", clock);
    setText("big-date", d.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    }));
    if (!session()?.email) setText(hello, greeting(d));

    const dayPct = ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400) * 100;
    const hourPct = ((d.getMinutes() * 60 + d.getSeconds()) / 3600) * 100;
    const dayBar = $("#day-bar");
    const hourBar = $("#hour-bar");
    if (dayBar) dayBar.style.width = `${dayPct}%`;
    if (hourBar) hourBar.style.width = `${hourPct}%`;
    setText("day-label", `${Math.round(dayPct)}%`);
    setText("hour-label", hourName(d));
    setText("field-label", window.AetherField?.status() || "live");
  }

  function openDoor() {
    door.hidden = false;
    $("#email").focus();
  }
  function closeDoor() {
    door.hidden = true;
    formError.textContent = "";
  }
  function showToast(msg) {
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2400);
  }

  $$("[data-open-door]").forEach((el) => el.addEventListener("click", openDoor));
  $$("[data-close-door]").forEach((el) => el.addEventListener("click", closeDoor));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !door.hidden) closeDoor();
  });

  doorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const pass = $("#pass").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formError.textContent = "Use a real-looking email. Nothing is sent.";
      return;
    }
    if (pass.length < 6) {
      formError.textContent = "Six characters is the only rule.";
      return;
    }
    localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }));
    closeDoor();
    applySession();
    showToast(`You're in, ${firstName(email)}. Still on this machine.`);
    document.getElementById("board").scrollIntoView({ behavior: "smooth" });
  });

  commandForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = commandInput.value.trim();
    if (!raw) {
      commandNote.textContent = "Type a URL if you want to leave.";
      return;
    }
    const hasScheme = /^https?:\/\//i.test(raw);
    const looksHost = /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw);
    if (hasScheme || looksHost) {
      const url = hasScheme ? raw : `https://${raw}`;
      commandNote.textContent = `Leaving for ${url}`;
      window.location.href = url;
      return;
    }
    commandNote.textContent = "This demo only leaves on a real URL.";
  });

  const stage = $("#stage");
  const flash = $("#flash");
  const ripple = $("#ripple");
  const ripples = [];
  if (stage && flash) {
    const rctx = ripple ? ripple.getContext("2d") : null;
    function sizeRipple() {
      if (!ripple) return;
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      ripple.width = Math.floor(r.width * dpr);
      ripple.height = Math.floor(r.height * dpr);
      if (rctx) rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeRipple();
    window.addEventListener("resize", sizeRipple, { passive: true });

    let lastRipple = 0;
    stage.addEventListener("pointermove", (e) => {
      const box = stage.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      flash.style.setProperty("--x", `${x}px`);
      flash.style.setProperty("--y", `${y}px`);
      setText("field-sub", `${Math.round(x)}, ${Math.round(y)}`);
      const now = performance.now();
      if (now - lastRipple > 70) {
        ripples.push({ x, y, r: 8, life: 1 });
        lastRipple = now;
      }
    });

    function drawRipple() {
      if (!rctx || !ripple) return;
      const box = stage.getBoundingClientRect();
      rctx.clearRect(0, 0, box.width, box.height);
      ripples.forEach((p, i) => {
        p.r += 2.2;
        p.life -= 0.03;
        if (p.life <= 0) {
          ripples.splice(i, 1);
          return;
        }
        rctx.strokeStyle = `rgba(232, 168, 124, ${p.life * 0.45})`;
        rctx.lineWidth = 1.2;
        rctx.beginPath();
        rctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        rctx.stroke();
      });
      requestAnimationFrame(drawRipple);
    }
    requestAnimationFrame(drawRipple);
  }

  const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const buf = [];
  document.addEventListener("keydown", (e) => {
    buf.push(e.key);
    if (buf.length > seq.length) buf.shift();
    if (seq.every((k, i) => buf[i]?.toLowerCase() === k.toLowerCase())) {
      showToast("Cursor unlocked twice. You already have it.");
    }
  });

  applySession();
  tickClock();
  setInterval(tickClock, 1000);
  if (new URLSearchParams(location.search).has("door")) openDoor();
})();
