import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Live signup counter ---------- */
async function refreshCount() {
  const el = document.getElementById("signup-count");
  if (!el) return;
  try {
    const { data, error } = await supabase.rpc("lumendeck_waitlist_count");
    if (error) throw error;
    el.textContent = Number(data).toLocaleString();
  } catch (err) {
    console.warn("count unavailable", err);
    el.textContent = "0";
  }
}

/* ---------- Waitlist submission ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wireForm(formId, inputId, msgId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const input = document.getElementById(inputId);
  const msg = document.getElementById(msgId);
  const btn = form.querySelector("button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim().toLowerCase();

    msg.className = "waitlist-msg";
    if (!EMAIL_RE.test(email)) {
      msg.textContent = "Please enter a valid email address.";
      msg.classList.add("err");
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Joining…";

    const { error } = await supabase
      .from("lumendeck_waitlist")
      .insert({ email, source: formId });

    if (error) {
      // 23505 = unique_violation → already on the list
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        msg.textContent = "You're already on the list — see you soon. ✦";
        msg.classList.add("ok");
        input.value = "";
      } else {
        console.error(error);
        msg.textContent = "Something went wrong. Please try again.";
        msg.classList.add("err");
      }
    } else {
      msg.textContent = "You're on the list! We'll be in touch. ✦";
      msg.classList.add("ok");
      input.value = "";
      refreshCount();
    }

    btn.disabled = false;
    btn.textContent = original;
  });
}

wireForm("waitlist-form", "email", "waitlist-msg");
wireForm("waitlist-form-2", "email-2", "waitlist-msg-2");
refreshCount();

/* ---------- Scroll reveal (fail-safe: content is never left hidden) ---------- */
(function scrollReveal() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  // Opt in to the hidden-until-revealed state only now that JS is running.
  // If this script never loads, `.reveal-on` is absent and everything stays visible.
  document.documentElement.classList.add("reveal-on");
  if (!els.length) return;

  const revealAll = () => els.forEach((el) => el.classList.add("in"));

  // Reveal anything already on screen immediately (no wait for the observer).
  const revealInView = () => {
    const h = window.innerHeight || 800;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.95 && r.bottom > 0) el.classList.add("in");
    });
  };
  revealInView();

  if (!("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => { if (!el.classList.contains("in")) io.observe(el); });

  // Reveal on scroll as a belt-and-suspenders backup to the observer.
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { revealInView(); ticking = false; });
  }, { passive: true });

  // Last-resort safety net: if nothing else fired, show everything.
  setTimeout(revealAll, 2500);
})();

/* ---------- Hero parallax (pointer) ---------- */
(function heroParallax() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = document.querySelector(".hero-visual .orbit-scene");
  if (!scene || reduce) return;
  window.addEventListener("pointermove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    scene.style.transform = `translate3d(${dx * 14}px, ${dy * 14}px, 0)`;
  });
})();

/* ---------- Constellation background ---------- */
(function constellation() {
  const canvas = document.getElementById("constellation");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let w, h, stars, raf;
  const COLORS = ["#7c5cff", "#00e0c6", "#ff6ec7", "#ffffff"];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((w * h) / 16000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.6 + 0.4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0 || s.x > w) s.vx *= -1;
      if (s.y < 0 || s.y > h) s.vy *= -1;

      // links
      for (let j = i + 1; j < stars.length; j++) {
        const o = stars[j];
        const dx = s.x - o.x, dy = s.y - o.y;
        const dist = dx * dx + dy * dy;
        if (dist < 15000) {
          ctx.globalAlpha = (1 - dist / 15000) * 0.22;
          ctx.strokeStyle = "#7c5cff";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
    }
    for (const s of stars) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = s.c;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    if (!reduce) draw();
    else drawStatic();
  });

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.fillStyle = s.c;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reduce) drawStatic();
  else draw();
})();
