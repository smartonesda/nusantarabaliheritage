(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Reveal ----------
  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---------- Audio ----------
  const audio = $("#bgAudio");
  const audioBtn = $("#audioBtn");
  const audioLabel = $("#audioLabel");

  let audioOn = (localStorage.getItem("audioOn") === "1");

  async function fadeAudio(toOn) {
    if (!audio) return;
    const targetVol = toOn ? 0.22 : 0.0;
    const step = 0.02;
    const interval = 80;

    if (toOn) {
      audio.volume = 0.0;
      try { await audio.play(); } catch (_) { }
    }

    const timer = setInterval(() => {
      if (toOn) {
        audio.volume = Math.min(targetVol, audio.volume + step);
        if (audio.volume >= targetVol - 0.001) clearInterval(timer);
      } else {
        audio.volume = Math.max(0.0, audio.volume - step);
        if (audio.volume <= 0.001) {
          clearInterval(timer);
          audio.pause();
        }
      }
    }, interval);
  }

  function renderAudioLabel() {
    if (!audioLabel) return;
    audioLabel.textContent = audioOn ? "Audio On" : "Audio Off";
  }

  if (audioBtn) {
    audioBtn.addEventListener("click", async () => {
      audioOn = !audioOn;
      localStorage.setItem("audioOn", audioOn ? "1" : "0");
      renderAudioLabel();
      await fadeAudio(audioOn);
    });
  }
  renderAudioLabel();
  if (audioOn) fadeAudio(true);

  // ---------- Progress dots (optional) ----------
  const dots = $$(".progress-dot");
  if (dots.length) {
    const sections = $$("section[id]");
    const dotObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        dots.forEach(d => d.classList.toggle("is-active", d.getAttribute("data-dot") === id));
        localStorage.setItem("lastSection", "#" + id);
      });
    }, { threshold: 0.35 });
    sections.forEach(s => dotObserver.observe(s));
  }

  // ---------- Return to last section (optional) ----------
  const returnBtn = $("#returnToLast");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      const last = localStorage.getItem("lastSection") || "#overview";
      const el = $(last);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else location.href = "index.html" + last;
    });
  }

  // ---------- Year ----------
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Scroll Progress Bar ----------
  const scrollProgress = $("#scrollProgress");
  if (scrollProgress) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = scrollPercent + "%";
    }, { passive: true });
  }

  // ---------- Stagger Reveal Animation ----------
  const staggerEls = $$(".reveal-stagger");
  if (staggerEls.length) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          staggerObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    staggerEls.forEach((el) => staggerObserver.observe(el));
  }

  // ---------- Hide Scroll Indicator on Scroll ----------
  const scrollIndicator = $(".scroll-indicator");
  if (scrollIndicator) {
    let hidden = false;
    window.addEventListener("scroll", () => {
      if (!hidden && window.scrollY > 100) {
        scrollIndicator.style.opacity = "0";
        scrollIndicator.style.pointerEvents = "none";
        hidden = true;
      } else if (hidden && window.scrollY <= 100) {
        scrollIndicator.style.opacity = "1";
        scrollIndicator.style.pointerEvents = "auto";
        hidden = false;
      }
    }, { passive: true });
  }

  // ---------- Back to Top Button ----------
  const backToTop = $(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTop.classList.add("is-visible");
      } else {
        backToTop.classList.remove("is-visible");
      }
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Parallax Effect ----------
  const parallaxBg = $(".parallax-bg");
  if (parallaxBg && !prefersReducedMotion) {
    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY;
      parallaxBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }, { passive: true });
  }

  // ---------- Keyboard Navigation ----------
  let usingKeyboard = false;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      document.body.classList.add("keyboard-nav");
      usingKeyboard = true;
    }
  });

  document.addEventListener("mousedown", () => {
    document.body.classList.remove("keyboard-nav");
    usingKeyboard = false;
  });

  // Arrow key navigation for cards
  const cards = $$("[class*='card-3d'], [class*='hover-glow']");
  let currentCardIndex = 0;

  document.addEventListener("keydown", (e) => {
    if (!usingKeyboard || !cards.length) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      cards[currentCardIndex].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
      cards[currentCardIndex].focus();
    }
  });

  // ---------- Social Share ----------
  $$(".share-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);

      if (btn.classList.contains("whatsapp")) {
        window.open(`https://wa.me/?text=${title}%20${url}`, "_blank");
      } else if (btn.classList.contains("twitter")) {
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, "_blank");
      } else if (btn.classList.contains("facebook")) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
      } else if (btn.classList.contains("copy")) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          btn.classList.add("copied");
          btn.textContent = "✓";
          setTimeout(() => {
            btn.classList.remove("copied");
            btn.textContent = "🔗";
          }, 2000);
        });
      }
    });
  });

  // ---------- Tips Toggle (Collapsible) ----------
  $$(".tips-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("is-open");
      const content = toggle.nextElementSibling;
      if (content && content.classList.contains("tips-collapsible")) {
        content.classList.toggle("is-open");
      }
    });
  });

  // ---------- Lazy Load Images ----------
  const lazyImages = $$("img[data-src]");
  if (lazyImages.length && "IntersectionObserver" in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: "50px" });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  // ---------- Reading Time Estimate ----------
  const articleContent = $(".prose-safe");
  const readingTimeEl = $(".reading-time");
  if (articleContent && readingTimeEl) {
    const text = articleContent.textContent || "";
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    readingTimeEl.innerHTML = `📖 ${readingTime} menit baca`;
  }
})();
