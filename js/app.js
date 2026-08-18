(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce) document.body.classList.add("hue-live");
  function endBoot() {
    setTimeout(() => document.body.classList.remove("booting"), 420);
  }
  if (reduce || navigator.webdriver) document.body.classList.remove("booting");
  else if (document.readyState === "complete") endBoot();
  else window.addEventListener("load", endBoot);

  /* Signature: 480px glow follows the native cursor. */
  if (fine && !reduce) {
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--x", `${e.clientX}px`);
      root.style.setProperty("--y", `${e.clientY}px`);
    }, { passive: true });
  }

  /* Room starts unlit. Scroll, hold, or pull latches the Afterglow. */
  let lit = reduce || location.search.includes("door");
  let dimmer = null;
  let audio = null;
  let bloomUntil = 0;
  document.body.classList.toggle("unlit", !lit);
  document.body.classList.toggle("lit", lit);

  function unlockAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audio) audio = new AC();
    if (audio.state === "suspended") audio.resume();
  }
  function tone(freq, dur, type, gain, slide) {
    if (!audio || reduce) return;
    const t = audio.currentTime;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.016);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function playStrike() {
    unlockAudio();
    tone(240, 0.52, "sine", 0.05, 96);
    tone(720, 0.07, "triangle", 0.028);
  }
  function playOut() {
    unlockAudio();
    tone(160, 0.26, "sine", 0.028, 68);
  }
  function setLit(on) {
    if (on === lit) return;
    lit = on;
    dimmer = null;
    document.body.classList.toggle("unlit", !on);
    document.body.classList.toggle("lit", on);
    const cord = $("#cord");
    if (cord) cord.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) {
      document.body.classList.add("striking");
      bloomUntil = performance.now() + 520;
      want.glow = 0.2;
      playStrike();
      setTimeout(() => document.body.classList.remove("striking"), 480);
    } else {
      bloomUntil = 0;
      want.glow = 0.028;
      playOut();
    }
  }

  /* Glow 12% → 4% over the first 60vh. Hue cycle speeds a little with scroll. */
  const scenes = $$(".scene");
  const dots = $$(".scenes a");
  const want = { glow: lit ? 0.12 : 0.028, earth: 1, earthY: 0, grain: 0.03, hue: 16 };
  const cur = { ...want };

  function readScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const p = Math.min(1, window.scrollY / (innerHeight * 0.6));
    const all = Math.min(1, window.scrollY / max);
    if (!lit && window.scrollY > 8) setLit(true);
    if (dimmer != null && window.scrollY > 12) dimmer = null;
    if (!lit) want.glow = 0.028;
    else if (performance.now() < bloomUntil) want.glow = 0.2;
    else if (dimmer != null) want.glow = 0.035 + dimmer * 0.145;
    else want.glow = 0.12 - p * 0.08;
    want.hue = 16 - p * 5;
    want.grain = 0.03 + p * 0.015;
    want.earth = 1 + all * 0.1;
    want.earthY = all * 28;
    document.body.classList.toggle("scrolled", window.scrollY > 24);
    let active = 0;
    scenes.forEach((el, i) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.48) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle("on", i === active));
  }

  function easeScroll() {
    cur.glow += (want.glow - cur.glow) * 0.08;
    cur.earth += (want.earth - cur.earth) * 0.07;
    cur.earthY += (want.earthY - cur.earthY) * 0.07;
    cur.grain += (want.grain - cur.grain) * 0.08;
    cur.hue += (want.hue - cur.hue) * 0.06;
    root.style.setProperty("--glow", cur.glow.toFixed(4));
    root.style.setProperty("--earth", cur.earth.toFixed(4));
    root.style.setProperty("--earth-y", `${cur.earthY.toFixed(2)}px`);
    root.style.setProperty("--grain", cur.grain.toFixed(4));
    root.style.setProperty("--hue-ms", `${cur.hue.toFixed(2)}s`);
    if (!reduce) requestAnimationFrame(easeScroll);
  }

  readScroll();
  window.addEventListener("scroll", readScroll, { passive: true });
  if (!reduce) requestAnimationFrame(easeScroll);
  else {
    root.style.setProperty("--glow", String(want.glow));
    root.style.setProperty("--earth", String(want.earth));
  }

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
    let dragging = false;
    function applyDim(e) {
      const b = hours.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width));
      dimmer = t;
      if (lit) want.glow = 0.035 + t * 0.145;
      const cells = $$("#hours i");
      const n = Math.round(t * (cells.length - 1));
      cells.forEach((el, i) => el.classList.toggle("fill", i <= n));
    }
    hours.addEventListener("pointerdown", (e) => {
      dragging = true;
      hours.setPointerCapture(e.pointerId);
      unlockAudio();
      applyDim(e);
    });
    hours.addEventListener("pointermove", (e) => {
      if (dragging) applyDim(e);
    });
    hours.addEventListener("pointerup", () => { dragging = false; });
    hours.addEventListener("pointercancel", () => { dragging = false; });
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
    setText("door-clock", clock);
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
  let step = 1;
  function setStep(n) {
    step = n;
    const passField = $("#pass-field");
    const kicker = $("#door-kicker");
    const title = $("#door-title");
    const lede = $("#door-lede");
    const go = $("#door-go");
    const dots = $$(".steps i");
    if (passField) passField.classList.toggle("hide", n === 1);
    if (kicker) kicker.textContent = n === 1 ? "Local door · 01 / 02" : "Local door · 02 / 02";
    if (title) title.textContent = n === 1 ? "Enter Aether" : "Lock it.";
    if (lede) lede.textContent = n === 1 ? "Kept on this machine. Nothing is sent." : "Six characters. Length only. It never leaves.";
    if (go) go.textContent = n === 1 ? "Continue" : "Open the surface";
    dots.forEach((d, i) => d.classList.toggle("on", i < n));
  }
  function openDoor() {
    door.hidden = false;
    setStep(1);
    $("#email")?.focus();
  }
  function closeDoor() {
    door.hidden = true;
    setStep(1);
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
    const sheet = $(".door-sheet");
    if (step === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (err) err.textContent = "Use a real-looking email. Nothing is sent.";
        sheet?.classList.add("shake");
        setTimeout(() => sheet?.classList.remove("shake"), 360);
        return;
      }
      if (err) err.textContent = "";
      setStep(2);
      $("#pass")?.focus();
      return;
    }
    if (pass.length < 6) {
      if (err) err.textContent = "Six characters is the only rule.";
      sheet?.classList.add("shake");
      setTimeout(() => sheet?.classList.remove("shake"), 360);
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
    entries.forEach((en) => {
      const r = Math.min(1, Math.max(0, en.intersectionRatio / 0.55));
      en.target.style.setProperty("--vis", r.toFixed(3));
      if (en.intersectionRatio > 0.22) en.target.classList.add("in");
    });
  }, { threshold: [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 1] });
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
    let holding = false;
    let holdRaf = 0;
    let holdStart = 0;
    function abortHold() {
      holding = false;
      if (holdRaf) cancelAnimationFrame(holdRaf);
      glass.classList.remove("holding");
      glass.style.setProperty("--hold", "0");
    }
    function holdTick(now) {
      if (!holding) return;
      const p = Math.min(1, (now - holdStart) / 560);
      glass.style.setProperty("--hold", p.toFixed(3));
      if (p >= 1) {
        setLit(true);
        abortHold();
        return;
      }
      holdRaf = requestAnimationFrame(holdTick);
    }
    glass.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      if (e.target.closest("a, button, input, label, .cord, .command, .hours")) return;
      if (lit) return;
      holding = true;
      holdStart = performance.now();
      glass.classList.add("holding");
      unlockAudio();
      holdRaf = requestAnimationFrame(holdTick);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => {
      glass.addEventListener(ev, abortHold);
    });
  }

  const cord = $("#cord");
  if (cord && !reduce) {
    let down = false;
    let startY = 0;
    let pull = 0;
    function setPull(v) {
      pull = v;
      cord.style.setProperty("--cord", `${v}px`);
    }
    cord.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      down = true;
      startY = e.clientY;
      cord.setPointerCapture(e.pointerId);
      unlockAudio();
      e.preventDefault();
    });
    cord.addEventListener("pointermove", (e) => {
      if (!down) return;
      setPull(Math.max(0, Math.min(88, e.clientY - startY)));
    });
    function endPull() {
      if (!down) return;
      down = false;
      if (pull >= 46) setLit(!lit);
      const from = pull;
      const t0 = performance.now();
      (function snap(now) {
        const t = Math.min(1, (now - t0) / 280);
        const ease = 1 - (1 - t) ** 3;
        setPull(from * (1 - ease));
        if (t < 1) requestAnimationFrame(snap);
      })(t0);
    }
    cord.addEventListener("pointerup", endPull);
    cord.addEventListener("pointercancel", endPull);
    cord.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setLit(!lit);
      }
    });
  } else if (cord && reduce) {
    cord.addEventListener("click", () => setLit(!lit));
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

  document.addEventListener("pointerdown", unlockAudio, { once: true });
  applySession();
  tickClock();
  setInterval(tickClock, 1000);
  if (location.search.includes("door")) openDoor();
})();
