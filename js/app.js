(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce) document.body.classList.add("hue-live");

  /* Signature: one 480px glow follows the native cursor. Nothing else does. */
  if (fine && !reduce) {
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--x", `${e.clientX}px`);
      root.style.setProperty("--y", `${e.clientY}px`);
    }, { passive: true });
  }

  /* Glow 12% → 4% over the first 60vh. One scrollY read. */
  function fadeGlow() {
    const p = Math.min(1, window.scrollY / (window.innerHeight * 0.6));
    root.style.setProperty("--glow", String(0.12 - p * 0.08));
  }
  fadeGlow();
  window.addEventListener("scroll", fadeGlow, { passive: true });

  /* Easter egg: last 8 keys spell midnight. */
  const buf = [];
  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    buf.push(e.key.toLowerCase());
    if (buf.length > 8) buf.shift();
    if (buf.join("").includes("midnight")) {
      document.body.classList.remove("hue-live");
      root.style.setProperty("--g1", "#3b2d7a");
      root.style.setProperty("--g2", "#2a1848");
      showToast("Midnight.");
      setTimeout(() => {
        root.style.setProperty("--g1", "#6e5bff");
        root.style.setProperty("--g2", "#ff6f91");
        if (!reduce) document.body.classList.add("hue-live");
      }, 3000);
    }
  });

  const hours = $("#hours");
  if (hours) {
    for (let i = 0; i < 24; i++) {
      const el = document.createElement("i");
      el.dataset.h = String(i);
      hours.appendChild(el);
    }
  }

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

  const KEY = "aether.session";
  function session() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  }
  function firstName(email) {
    return ((email || "").split("@")[0] || "there").replace(/[._-]+/g, " ").split(" ")[0];
  }
  function setText(id, v) {
    const el = $(`#${id}`);
    if (el) el.textContent = v;
  }

  function applySession() {
    const s = session();
    const chip = $("#session-chip");
    if (s?.email) {
      if (chip) chip.textContent = firstName(s.email);
      setText("hello", `${greeting(new Date())}, ${firstName(s.email)}`);
    } else if (chip) chip.textContent = "guest";
  }

  function tickClock() {
    const d = new Date();
    const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setText("big-clock", clock);
    setText("stat-clock", clock);
    setText("big-date", d.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    }));
    if (!session()?.email) setText("hello", greeting(d));
    const dayPct = ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400) * 100;
    setText("day-label", `${Math.round(dayPct)}%`);
    setText("hour-label", hourName(d));
    setText("field-label", "live");
    $$("#hours i").forEach((el) => {
      el.classList.toggle("on", Number(el.dataset.h) === d.getHours());
    });
  }

  const door = $("#door");
  const toast = $("#toast");
  function showToast(msg) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, 2400);
  }
  function openDoor() {
    door.hidden = false;
    $("#email")?.focus();
  }
  function closeDoor() {
    door.hidden = true;
    const err = $("#form-error");
    if (err) err.textContent = "";
  }

  $$("[data-open-door]").forEach((el) => el.addEventListener("click", openDoor));
  $$("[data-close-door]").forEach((el) => el.addEventListener("click", closeDoor));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && door && !door.hidden) closeDoor();
  });

  $("#door-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const pass = $("#pass").value;
    const err = $("#form-error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (err) err.textContent = "Use a real-looking email. Nothing is sent.";
      return;
    }
    if (pass.length < 6) {
      if (err) err.textContent = "Six characters is the only rule.";
      return;
    }
    localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }));
    closeDoor();
    applySession();
    showToast(`You're in, ${firstName(email)}. Still on this machine.`);
  });

  $("#command-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = $("#command").value.trim();
    const note = $("#command-note");
    if (!raw) {
      if (note) note.textContent = "Type a URL if you want to leave.";
      return;
    }
    const hasScheme = /^https?:\/\//i.test(raw);
    const looksHost = /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw);
    if (hasScheme || looksHost) {
      window.location.href = hasScheme ? raw : `https://${raw}`;
      return;
    }
    if (note) note.textContent = "This demo only leaves on a real URL.";
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add("in"); });
  }, { threshold: 0.35 });
  $$(".fade").forEach((el) => io.observe(el));

  applySession();
  tickClock();
  setInterval(tickClock, 1000);
  if (location.search.includes("door")) openDoor();
})();
