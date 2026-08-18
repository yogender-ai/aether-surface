(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce) document.body.classList.add("hue-live");
  if (reduce) document.body.classList.remove("booting");
  else window.addEventListener("load", () => {
    setTimeout(() => document.body.classList.remove("booting"), 480);
  });

  /* Signature: 480px glow follows the native cursor. */
  if (fine && !reduce) {
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--x", `${e.clientX}px`);
      root.style.setProperty("--y", `${e.clientY}px`);
    }, { passive: true });
  }

  /* Glow 12% → 4% over the first 60vh. Hue cycle speeds a little with scroll. */
  const scenes = $$(".scene");
  const dots = $$(".scenes a");
  function fadeGlow() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, window.scrollY / (innerHeight * 0.6));
    const all = Math.min(1, window.scrollY / max);
    root.style.setProperty("--glow", String(0.12 - p * 0.08));
    root.style.setProperty("--hue-ms", `${Math.max(9, 16 - p * 5)}s`);
    root.style.setProperty("--grain", String(0.03 + p * 0.015));
    root.style.setProperty("--earth", String(1 + all * 0.12));
    root.style.setProperty("--earth-y", `${all * 40}px`);
    document.body.classList.toggle("scrolled", window.scrollY > 24);
    let active = 0;
    scenes.forEach((el, i) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.45) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === active));
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
    hours.addEventListener("pointermove", (e) => {
      const t = e.target.closest("i");
      $$("#hours i").forEach((el) => el.classList.toggle("near", el === t));
    });
    hours.addEventListener("pointerleave", () => {
      $$("#hours i").forEach((el) => el.classList.remove("near"));
    });
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
    const clockEl = $("#big-clock");
    if (clockEl && clockEl.dataset.prev && clockEl.dataset.prev !== clock) {
      clockEl.classList.add("tick");
      setTimeout(() => clockEl.classList.remove("tick"), 280);
    }
    if (clockEl) clockEl.dataset.prev = clock;
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
  }, { threshold: 0.18, rootMargin: "0px 0px -30% 0px" });
  $$(".fade, .glass").forEach((el) => io.observe(el));
  const glass = $("#board");
  if (glass) {
    const r = glass.getBoundingClientRect();
    if (r.top < innerHeight * 0.85) glass.classList.add("in");
    if (fine && !reduce) {
      glass.addEventListener("pointermove", (e) => {
        const b = glass.getBoundingClientRect();
        glass.style.setProperty("--sx", `${e.clientX - b.left}px`);
        glass.style.setProperty("--sy", `${e.clientY - b.top}px`);
      });
    }
  }

  if (fine && !reduce) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const b = el.getBoundingClientRect();
        const x = ((e.clientX - b.left) / b.width - 0.5) * 14;
        const y = ((e.clientY - b.top) / b.height - 0.5) * 12;
        el.style.setProperty("--mx", `${Math.max(-8, Math.min(8, x))}px`);
        el.style.setProperty("--my", `${Math.max(-8, Math.min(8, y))}px`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });

    const mark = $("#cursor-mark");
    const hot = "a, button, .cta, .nav-cta, .glass";
    document.addEventListener("pointerover", (e) => {
      if (mark && e.target.closest(hot)) mark.hidden = false;
    });
    document.addEventListener("pointerout", (e) => {
      if (!mark) return;
      const next = e.relatedTarget;
      if (!next || !next.closest || !next.closest(hot)) mark.hidden = true;
    });
    document.addEventListener("pointermove", (e) => {
      if (!mark || mark.hidden) return;
      mark.style.left = `${e.clientX}px`;
      mark.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  const headline = $(".decode");
  if (headline && !reduce) {
    const lines = ["The surface", "is the product."];
    const glyphs = "ABCDEFGHJKLMNPRSTUVWXYZ";
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      headline.innerHTML = lines.map((line) => {
        const cut = Math.floor((n / 16) * line.length);
        return line.split("").map((ch, i) => {
          if (ch === " " || ch === ".") return ch;
          return i < cut ? ch : glyphs[(Math.random() * glyphs.length) | 0];
        }).join("");
      }).join("<br />");
      if (n >= 16) {
        clearInterval(id);
        headline.innerHTML = "The surface<br />is the product.";
      }
    }, 36);
  }

  applySession();
  tickClock();
  setInterval(tickClock, 1000);
  if (location.search.includes("door")) openDoor();
})();
