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
  if (new URLSearchParams(location.search).has("still")) {
    document.documentElement.classList.add("still");
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

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
    if (h < 6) return "Night field";
    if (h < 10) return "Dawn";
    if (h < 17) return "Day";
    if (h < 20) return "Dusk";
    return "Night field";
  }

  function session() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      return null;
    }
  }

  function firstName(email) {
    const local = (email || "").split("@")[0] || "there";
    return local.replace(/[._-]+/g, " ").split(" ")[0];
  }

  function applySession() {
    const s = session();
    if (s?.email) {
      sessionChip.textContent = firstName(s.email);
      const line = `${greeting(new Date())}, ${firstName(s.email)}`;
      if (hello) hello.textContent = line;
      const heroHello = document.getElementById("hero-hello");
      if (heroHello) heroHello.textContent = line;
    } else if (sessionChip) {
      sessionChip.textContent = "guest";
    }
  }

  function setText(id, value) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (el) el.textContent = value;
  }

  function tickClock() {
    const d = new Date();
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const clock = `${hh}:${mm}`;
    const date = d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const greet = greeting(d);
    const nav = $("#nav-clock");
    if (nav) {
      nav.textContent = clock;
      nav.dateTime = d.toISOString();
    }
    setText("big-clock", clock);
    setText("big-date", date);
    setText("hero-clock", clock);
    setText("hero-date", date);
    if (!session()?.email) {
      setText(hello, greet);
      setText("hero-hello", greet);
    }

    const dayPct = ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400) * 100;
    const hourPct = ((d.getMinutes() * 60 + d.getSeconds()) / 3600) * 100;
    const dayBar = $("#day-bar");
    const hourBar = $("#hour-bar");
    if (dayBar) dayBar.style.width = `${dayPct}%`;
    if (hourBar) hourBar.style.width = `${hourPct}%`;
    setText("day-label", `${Math.round(dayPct)}%`);
    setText("hour-label", hourName(d));
    setText("field-label", window.AetherField?.status() || "live");
    setText("field-sub", `${ss}s · pointer + time`);
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
    showToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
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
    formError.textContent = "";
    closeDoor();
    applySession();
    showToast(`You're in, ${firstName(email)}. Still on this machine.`);
    document.getElementById("surface").scrollIntoView({ behavior: "smooth" });
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
    commandNote.textContent = "This demo only leaves on a real URL. Stay a little.";
  });

  const cta = $$(".cta");
  cta.forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.22;
      btn.style.setProperty("--mx", `${x}px`);
      btn.style.setProperty("--my", `${y}px`);
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--mx", "0px");
      btn.style.setProperty("--my", "0px");
    });
  });

  const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const buf = [];
  document.addEventListener("keydown", (e) => {
    buf.push(e.key);
    if (buf.length > seq.length) buf.shift();
    if (seq.every((k, i) => buf[i]?.toLowerCase() === k.toLowerCase())) {
      window.AetherField?.intensify();
      showToast("Compositor online. You found the rice.");
    }
  });

  applySession();
  tickClock();
  setInterval(tickClock, 1000);

  if (new URLSearchParams(location.search).has("door")) openDoor();
