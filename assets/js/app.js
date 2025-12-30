(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches ||
    ("ontouchstart" in window) ||
    (navigator.maxTouchPoints > 0);

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

  // ================================
  // MODERN ENHANCEMENTS
  // ================================

  // ---------- Toast Notifications ----------
  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  document.body.appendChild(toastContainer);

  window.showToast = (message, type = "info", duration = 3000) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === "success" ? "✓" : "ℹ"}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-out");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ---------- Scale Reveal ----------
  const scaleEls = $$(".reveal-scale");
  const scaleObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        scaleObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  scaleEls.forEach((el) => scaleObserver.observe(el));

  // ---------- Parallax Effect (Desktop Only) ----------
  const parallaxBgs = $$(".parallax-bg");

  // Only enable parallax on desktop for better mobile performance
  if (parallaxBgs.length && !prefersReducedMotion && !isMobile) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxBgs.forEach((bg) => {
            const speed = parseFloat(bg.dataset.parallaxSpeed) || 0.3;
            bg.style.transform = `translateY(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---------- Page Transition Overlay ----------
  const overlay = document.createElement("div");
  overlay.className = "page-transition-overlay";
  document.body.appendChild(overlay);

  const loadingBar = document.createElement("div");
  loadingBar.className = "loading-bar";
  document.body.appendChild(loadingBar);

  // Intercept internal link clicks
  $$("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || link.target === "_blank") return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.add("is-active");
      loadingBar.classList.add("is-loading");

      setTimeout(() => {
        window.location.href = href;
      }, 350);
    });
  });

  // Fade in on page load
  window.addEventListener("pageshow", () => {
    overlay.classList.remove("is-active");
    loadingBar.classList.remove("is-loading");
  });

  // ---------- Skeleton Loading Handler ----------
  $$(".skeleton[data-skeleton-for]").forEach((skeleton) => {
    const targetSelector = skeleton.dataset.skeletonFor;
    const target = $(targetSelector);
    if (target && target.complete !== undefined) {
      // For images
      if (target.complete) {
        skeleton.style.display = "none";
      } else {
        target.style.opacity = "0";
        target.addEventListener("load", () => {
          skeleton.style.display = "none";
          target.style.opacity = "1";
          target.style.transition = "opacity 0.3s ease";
        });
      }
    }
  });

  // ---------- Enhanced Audio Toggle with Toast ----------
  if (audioBtn) {
    const originalClickHandler = audioBtn.onclick;
    audioBtn.addEventListener("click", () => {
      setTimeout(() => {
        const isOn = localStorage.getItem("audioOn") === "1";
        showToast(isOn ? "🔊 Audio Aktif" : "🔇 Audio Dimatikan", "info", 2000);
      }, 100);
    });
  }

  // ---------- Magnetic Button Effect ----------
  $$(".magnetic-btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0)";
    });
  });

  // ---------- Glow Pulse on Focus ----------
  $$(".glow-pulse-focus").forEach((el) => {
    el.addEventListener("focus", () => el.classList.add("glow-pulse"));
    el.addEventListener("blur", () => el.classList.remove("glow-pulse"));
  });

  // ================================
  // PREMIUM FEATURES
  // ================================

  // ---------- Custom Cursor (Desktop Only) ----------
  if (!isMobile) {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const cursorDot = document.createElement("div");
    cursorDot.className = "custom-cursor-dot";
    document.body.appendChild(cursorDot);

    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener("mousemove", (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
      dotX += (cursorX - dotX) * 0.2;
      dotY += (cursorY - dotY) * 0.2;

      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";
      cursorDot.style.left = dotX + "px";
      cursorDot.style.top = dotY + "px";

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverTargets = $$("a, button, .card-3d, .card-tilt, .lightbox-trigger, input, textarea, [role='button']");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    // Click effect
    document.addEventListener("mousedown", () => cursor.classList.add("is-clicking"));
    document.addEventListener("mouseup", () => cursor.classList.remove("is-clicking"));
  }

  // ---------- Image Lightbox ----------
  const lightboxOverlay = document.createElement("div");
  lightboxOverlay.className = "lightbox-overlay";
  lightboxOverlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">×</button>
    <img class="lightbox-image" src="" alt="" />
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(lightboxOverlay);

  const lightboxImage = lightboxOverlay.querySelector(".lightbox-image");
  const lightboxCaption = lightboxOverlay.querySelector(".lightbox-caption");
  const lightboxClose = lightboxOverlay.querySelector(".lightbox-close");

  // Add lightbox-trigger class to content images
  $$("article img, .prose-safe img, [data-lightbox] img, img[data-lightbox]").forEach((img) => {
    if (!img.closest("header") && !img.closest("nav") && img.naturalWidth > 200) {
      img.classList.add("lightbox-trigger");
    }
  });

  // Open lightbox
  $$(`.lightbox-trigger`).forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCaption.textContent = img.alt || "";
      lightboxOverlay.classList.add("is-active");
      document.body.style.overflow = "hidden";
    });
  });

  // Close lightbox
  function closeLightbox() {
    lightboxOverlay.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxOverlay.addEventListener("click", (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxOverlay.classList.contains("is-active")) {
      closeLightbox();
    }
  });

  // ---------- 3D Card Tilt Effect ----------
  $$(".card-tilt, .card-3d").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (prefersReducedMotion) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
  });

  // ---------- Modern Tips Section ----------
  // Only initialize tips that are NOT handled by local scripts (check data attribute)
  $$(".tips-modern:not([data-tips-local])").forEach((container) => {
    // Tab Navigation
    container.querySelectorAll(".tips-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.dataset.tab;

        // Update tabs
        container.querySelectorAll(".tips-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");

        // Update content
        container.querySelectorAll(".tips-tab-content").forEach((content) => {
          content.classList.remove("is-active");
        });
        const targetContent = container.querySelector(`[data-content="${targetId}"]`);
        if (targetContent) targetContent.classList.add("is-active");
      });
    });

    // Expandable Items
    container.querySelectorAll(".tips-modern-item").forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("is-expanded");
        updateTipsProgress(container);
      });
    });
  });

  // Progress Tracking
  function updateTipsProgress(container) {
    if (!container) return;
    const items = container.querySelectorAll(".tips-modern-item");
    const expanded = container.querySelectorAll(".tips-modern-item.is-expanded");
    const progressFill = container.querySelector(".tips-progress-fill");
    const progressCount = container.querySelector(".tips-progress-count");

    const total = items.length;
    const current = expanded.length;
    const percent = total > 0 ? (current / total) * 100 : 0;

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressCount) progressCount.textContent = `${current}/${total}`;
  }

  // Initialize progress for all tips containers
  $$(".tips-modern").forEach((container) => updateTipsProgress(container));

  console.log("✨ Premium Features Loaded");
})();
