(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var yearEl = document.getElementById("year");
  var ua = navigator.userAgent || "";
  var isSafari = /Safari\//.test(ua) && !/Chrome\/|CriOS\/|Edg\/|OPR\//.test(ua);

  if (isSafari) {
    document.documentElement.classList.add("is-safari");
  }

  function onHeaderScroll() {
    if (!header) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", y > 48);
  }

  window.addEventListener("scroll", onHeaderScroll, { passive: true });
  onHeaderScroll();

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // ── Introduction video modal ──────────────────────────────
  var videoOverlay = document.getElementById("intro-video-overlay");
  var videoBtn     = document.getElementById("intro-video-btn");
  var videoClose   = document.getElementById("intro-video-close");
  var videoModal   = document.getElementById("intro-video-modal");
  var videoPlayer  = document.getElementById("intro-video-player");
  var resumeLink   = document.getElementById("resume-link");

  function openVideoModal() {
    if (!videoOverlay) return;
    videoOverlay.style.display = "flex";
    videoOverlay.classList.add("is-open");
    videoOverlay.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    if (videoClose) videoClose.focus();
    if (videoPlayer) {
      videoPlayer.play().catch(function () {});
    }
  }

  function closeVideoModal() {
    if (!videoOverlay) return;
    videoOverlay.classList.remove("is-open");
    videoOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow =
      secretOverlay && secretOverlay.classList.contains("is-open") ? "hidden" : "";
    if (videoPlayer) videoPlayer.pause();
    if (videoBtn) videoBtn.focus();

    function hideOverlayWhenClosed() {
      if (!videoOverlay.classList.contains("is-open")) {
        videoOverlay.style.display = "none";
      }
    }
    videoOverlay.addEventListener(
      "transitionend",
      function (e) {
        if (e.target === videoOverlay && e.propertyName === "opacity") {
          hideOverlayWhenClosed();
        }
      },
      { once: true }
    );
    window.setTimeout(hideOverlayWhenClosed, 450);
  }

  if (videoBtn) {
    videoBtn.addEventListener("click", openVideoModal);
  }

  if (videoClose) {
    videoClose.addEventListener("click", closeVideoModal);
  }

  if (videoOverlay) {
    videoOverlay.addEventListener("click", function (e) {
      if (e.target === videoOverlay) closeVideoModal();
    });
  }

  if (resumeLink) {
    resumeLink.addEventListener("click", function (e) {
      e.preventDefault();
      var pdfUrl = resumeLink.getAttribute("href");
      if (!pdfUrl) return;

      window.open(pdfUrl, "_blank", "noopener,noreferrer");

      var downloadAnchor = document.createElement("a");
      downloadAnchor.href = pdfUrl;
      downloadAnchor.download =
        resumeLink.getAttribute("download") || "Maneet-Kohli-Resume.pdf";
      downloadAnchor.rel = "noopener noreferrer";
      downloadAnchor.style.display = "none";
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    });
  }

  // ── Secret tab (four consecutive taps on Six Flags collage image) ─
  var secretTrigger = document.getElementById("secret-collage-trigger");
  var secretOverlay = document.getElementById("secret-tab-overlay");
  var secretClose = document.getElementById("secret-tab-close");
  var secretCloseDrive = document.getElementById("secret-tab-close-drive");
  var secretForm = document.getElementById("secret-tab-form");
  var secretPassword = document.getElementById("secret-tab-password");
  var secretError = document.getElementById("secret-tab-error");
  var secretAuth = document.getElementById("secret-tab-auth");
  var secretDriveShell = document.getElementById("secret-tab-drive-shell");
  var secretTabModal = document.getElementById("secret-tab-modal");
  var secretTapCount = 0;
  var secretTapWindowMs = 2200;
  var secretLastTapAt = 0;
  var SECRET_PASS = "Manu&Suhe";

  function resetSecretTapState() {
    secretTapCount = 0;
    secretLastTapAt = 0;
  }

  function openSecretTab() {
    if (!secretOverlay) return;
    resetSecretTapState();
    secretOverlay.style.display = "flex";
    secretOverlay.classList.add("is-open");
    secretOverlay.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    if (secretAuth) secretAuth.hidden = false;
    if (secretTabModal) secretTabModal.hidden = false;
    if (secretDriveShell) secretDriveShell.hidden = true;
    if (secretError) secretError.hidden = true;
    if (secretPassword) {
      secretPassword.value = "";
      window.setTimeout(function () {
        secretPassword.focus();
      }, 0);
    }
    if (secretOverlay) secretOverlay.classList.remove("secret-tab-overlay--video");
  }

  function closeSecretTab() {
    if (!secretOverlay) return;
    secretOverlay.classList.remove("is-open");
    secretOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow =
      videoOverlay && videoOverlay.classList.contains("is-open") ? "hidden" : "";
    if (secretOverlay) secretOverlay.classList.remove("secret-tab-overlay--video");
    if (secretAuth) secretAuth.hidden = false;
    if (secretTabModal) secretTabModal.hidden = false;
    if (secretDriveShell) secretDriveShell.hidden = true;
    if (secretPassword) secretPassword.value = "";
    if (secretError) secretError.hidden = true;

    function hideSecretWhenClosed() {
      if (!secretOverlay.classList.contains("is-open")) {
        secretOverlay.style.display = "none";
      }
    }
    secretOverlay.addEventListener(
      "transitionend",
      function (e) {
        if (e.target === secretOverlay && e.propertyName === "opacity") {
          hideSecretWhenClosed();
        }
      },
      { once: true }
    );
    window.setTimeout(hideSecretWhenClosed, 450);
  }

  function onSecretTriggerClick() {
    var now = Date.now();
    if (now - secretLastTapAt > secretTapWindowMs) {
      secretTapCount = 0;
    }
    secretTapCount += 1;
    secretLastTapAt = now;
    if (secretTapCount >= 4) {
      resetSecretTapState();
      openSecretTab();
    }
  }

  if (secretTrigger) {
    secretTrigger.addEventListener("click", onSecretTriggerClick);
  }

  document.addEventListener("click", function (e) {
    if (!secretTrigger || secretTapCount === 0) return;
    if (e.target === secretTrigger) return;
    resetSecretTapState();
  });

  if (secretClose) {
    secretClose.addEventListener("click", closeSecretTab);
  }

  if (secretCloseDrive) {
    secretCloseDrive.addEventListener("click", closeSecretTab);
  }

  if (secretOverlay) {
    secretOverlay.addEventListener("click", function (e) {
      if (e.target === secretOverlay) closeSecretTab();
    });
  }

  if (secretDriveShell) {
    secretDriveShell.addEventListener("click", function (e) {
      if (e.target === secretDriveShell) closeSecretTab();
    });
  }

  if (secretForm) {
    secretForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!secretPassword || !secretError || !secretAuth || !secretDriveShell || !secretTabModal) return;
      var entered = secretPassword.value || "";
      if (entered === SECRET_PASS) {
        secretError.hidden = true;
        secretAuth.hidden = true;
        if (secretOverlay) secretOverlay.classList.add("secret-tab-overlay--video");
        secretTabModal.hidden = true;
        secretDriveShell.hidden = false;
        var secretDl = document.getElementById("secret-tab-drive-link");
        if (secretDl && secretDl.getAttribute("href")) {
          window.open(secretDl.getAttribute("href"), "_blank", "noopener,noreferrer");
        }
      } else {
        secretError.hidden = false;
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (secretOverlay && secretOverlay.classList.contains("is-open")) {
      closeSecretTab();
      return;
    }
    if (videoOverlay && videoOverlay.classList.contains("is-open")) {
      closeVideoModal();
    }
  });

  // ── Active nav link highlighting ─────────────────────────
  (function () {
    var file = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-dropdown__link").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("/").pop();
      if (href && href === file) {
        link.classList.add("is-active");
        var item = link.closest(".nav-item--has-dropdown");
        if (item) {
          var trigger = item.querySelector(".nav-link--trigger");
          if (trigger) trigger.classList.add("is-active");
        }
      }
    });

    document.querySelectorAll(".nav-link:not(.nav-link--trigger)").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("/").pop();
      if (href && href === file) link.classList.add("is-active");
    });
  })();

  // ── Hamburger menu ────────────────────────────────────────
  var hamburger = document.querySelector(".nav-hamburger");
  var primaryNav = document.getElementById("primary-nav");

  if (hamburger && primaryNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", isOpen ? "false" : "true");
      primaryNav.classList.toggle("is-open", !isOpen);
    });

    document.addEventListener("click", function (e) {
      if (
        primaryNav.classList.contains("is-open") &&
        !hamburger.contains(e.target) &&
        !primaryNav.contains(e.target)
      ) {
        hamburger.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("is-open");
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 640) {
        hamburger.setAttribute("aria-expanded", "false");
        primaryNav.classList.remove("is-open");
        document.querySelectorAll(".nav-item--has-dropdown.is-open").forEach(function (item) {
          item.classList.remove("is-open");
          var t = item.querySelector(".nav-link--trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
      }
    }, { passive: true });
  }

  // ── Mobile dropdown toggles ───────────────────────────────
  document.querySelectorAll(".nav-link--trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      if (window.innerWidth > 640) return;
      var item = this.closest(".nav-item--has-dropdown");
      if (!item) return;
      var isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".nav-item--has-dropdown.is-open").forEach(function (el) {
        if (el !== item) {
          el.classList.remove("is-open");
          var t = el.querySelector(".nav-link--trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", !isOpen);
      this.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  // ── Scroll reveal ([data-reveal]) — home below-hero, contact, inner pages ─
  (function () {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }
    /* CSS hides [data-reveal] only under .reveal-enabled, so no-JS /
     * reduced-motion / no-IO paths always show content. */
    document.documentElement.classList.add("reveal-enabled");
    /* threshold 0 = any pixel visible. A single value like 0.06 breaks very tall
     * sections: the visible slice can be <6% of element height while clearly on screen. */
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px 25% 0px", threshold: 0 }
    );
    function revealIfAlreadyOnScreen() {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      els.forEach(function (el) {
        if (el.classList.contains("is-revealed")) return;
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          el.classList.add("is-revealed");
          io.unobserve(el);
        }
      });
    }
    function revealAllRemaining() {
      els.forEach(function (el) {
        if (!el.classList.contains("is-revealed")) {
          el.classList.add("is-revealed");
          io.unobserve(el);
        }
      });
    }
    function observeWithLayout() {
      els.forEach(function (el) {
        if (el.classList.contains("is-revealed")) return;
        var r = el.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) {
          el.classList.add("is-revealed");
          return;
        }
        io.observe(el);
      });
    }

    var revealSyncRaf = 0;
    function syncRevealOnScroll() {
      if (revealSyncRaf) return;
      revealSyncRaf = requestAnimationFrame(function () {
        revealSyncRaf = 0;
        revealIfAlreadyOnScreen();
      });
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        observeWithLayout();
        revealIfAlreadyOnScreen();
      });
    });

    window.addEventListener("scroll", syncRevealOnScroll, { passive: true });
    window.addEventListener("resize", syncRevealOnScroll, { passive: true });

    window.addEventListener(
      "load",
      function () {
        revealIfAlreadyOnScreen();
        window.setTimeout(revealAllRemaining, 2500);
      },
      { once: true }
    );
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) revealIfAlreadyOnScreen();
    });
  })();
})();
