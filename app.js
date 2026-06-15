/* ============================================================
   VAASANA — app.js
   ============================================================ */

/* ------------------------------------------------------------
   IMAGE CONFIG  ← EDIT HERE
   ------------------------------------------------------------
   Every image on the page is driven by this one object.

   To tweak an image, change its `keywords` (and optionally w/h/alt).
   To hand-pick a specific Unsplash photo instead of a keyword search,
   set `src` to a direct URL, e.g.:
       src: "https://images.unsplash.com/photo-1xxxxxxxx?auto=format&fit=crop&w=1600&q=80"
   When `src` is set it wins; otherwise we build a source.unsplash.com URL
   from { w, h, keywords }.

   In markup, attach an image with:  <figure data-img="baarish"></figure>

   NOTE ON THE `src` URLS BELOW:
   These are hand-picked images.unsplash.com photo IDs (the non-deprecated,
   reliable Unsplash pattern — source.unsplash.com is deprecated). They were
   selected to match each section; if any one doesn't fit your taste, grab a
   different photo from unsplash.com, copy its photo-XXXX id, and pass it to
   u("photo-XXXX", w, h). To fall back to a live keyword search instead, set
   that entry's `src: null` and the `keywords` above will be used.
   ------------------------------------------------------------ */

/* Build a sized, cropped images.unsplash.com URL from a photo id. */
function u(id, w, h) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

const IMAGES = {
  /* The hero is now a full-bleed SVG background (see .hero in styles.css),
     so it no longer needs an entry here. */

  /* Collection bottles — local brand SVGs in /public (1600x1100 scenes). */
  baarish: {
    w: 1600, h: 1100,
    keywords: "perfume,bottle,dark",
    alt: "Baarish — perfume bottle in a first-rain scene",
    src: "public/VAASANA-Baarish.svg",
  },
  riwaayat: {
    w: 1600, h: 1100,
    keywords: "amber,perfume,bottle",
    alt: "Riwaayat — perfume bottle in a warm, inherited glow",
    src: "public/VAASANA-Riwaayat.svg",
  },
  noon: {
    w: 1600, h: 1100,
    keywords: "perfume,minimal,clear",
    alt: "Noon — perfume bottle in clean daylight",
    src: "public/VAASANA-Noon.svg",
  },
  craftStill: {
    w: 1200, h: 800,
    keywords: "copper,still,distillation",
    alt: "A copper still used in traditional deg-bhapka distillation",
    src: u("photo-1510626176961-4b57d4fbad03", 1200, 800),
  },
  craftRain: {
    w: 1200, h: 800,
    keywords: "monsoon,rain,earth",
    alt: "Monsoon rain falling on dry earth",
    src: u("photo-1428592953211-077101b2021b", 1200, 800),
  },
  petals: {
    w: 1200, h: 800,
    keywords: "rose,petals,marigold",
    alt: "Rose petals and marigold flowers scattered",
    src: u("photo-1597848212624-a19eb35e2651", 1600, 900),
  },
  sustainability: {
    w: 1200, h: 800,
    keywords: "nature,leaves,green",
    alt: "Fresh green leaves in soft natural light",
    src: u("photo-1466692476868-aef1dfb1e735", 1200, 800),
  },
};

/* Build the resolved URL for an image config entry. */
function imgUrl(cfg) {
  if (cfg.src) return cfg.src;
  return `https://source.unsplash.com/${cfg.w}x${cfg.h}/?${encodeURIComponent(cfg.keywords).replace(/%2C/g, ",")}`;
}

/* ------------------------------------------------------------
   IMAGE INJECTION + GRACEFUL FALLBACK
   Any element with [data-img="key"] gets an <img> built from IMAGES[key].
   On error, we mark the frame .is-failed so the CSS-drawn bottle shows.
   ------------------------------------------------------------ */
function mountImages() {
  document.querySelectorAll("[data-img]").forEach((frame) => {
    const key = frame.getAttribute("data-img");
    const cfg = IMAGES[key];
    if (!cfg) {
      console.warn(`[vaasana] no image config for "${key}"`);
      frame.classList.add("is-failed");
      return;
    }

    const img = new Image();
    img.loading = "lazy";
    img.decoding = "async";
    img.width = cfg.w;
    img.height = cfg.h;
    img.alt = cfg.alt;
    img.src = imgUrl(cfg);

    img.addEventListener("load", () => frame.classList.add("is-loaded"));
    img.addEventListener("error", () => {
      frame.classList.add("is-failed");
      img.remove();
    });

    frame.appendChild(img);
  });
}

/* ------------------------------------------------------------
   NAV — frosted-state on scroll
   ------------------------------------------------------------ */
function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ------------------------------------------------------------
   SCROLL REVEAL — slow elegant fade-in
   ------------------------------------------------------------ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------
   EMAIL CAPTURE
   Local state + console.log only. No backend, no localStorage.
   ------------------------------------------------------------ */
const waitlist = []; // in-memory only for this session

function initCaptureForms() {
  document.querySelectorAll("[data-capture]").forEach((form) => {
    const msg = form.querySelector("[data-capture-msg]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = (input?.value || "").trim();

      if (!email || !input.checkValidity()) {
        if (msg) msg.textContent = "please enter a valid email.";
        input?.focus();
        return;
      }

      waitlist.push({ email, at: new Date().toISOString() });
      console.log("[vaasana] waitlist signup:", email, waitlist);

      form.classList.add("is-success");
      if (msg) msg.textContent = "you're on the list — we'll be in touch.";
    });
  });
}

/* ------------------------------------------------------------
   BOOT
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  mountImages();
  initNav();
  initReveal();
  initCaptureForms();
});
