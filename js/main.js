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

  // ── Skills marquee: shuffle pills, intro speed, gradual loop slowdown ─
  (function () {
    var marqueeRows = document.querySelectorAll(".skills-marquee__row");
    if (!marqueeRows.length) return;
    var speedMultiplier = 1.35;
    var introDelaySec = 0.25;
    var slowdownRampMs = 1400;
    var slowdownTargetRate = 0.46;
    var slowdownScheduled = false;
    var appliedLoopPlaybackRate = 1;
    var baseMiddleLoopDuration = null;
    var resizeRaf = 0;
    var prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function parseDurationSeconds(value) {
      if (!value) return 0;
      var trimmed = String(value).trim();
      if (!trimmed) return 0;
      if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed) / 1000;
      if (trimmed.endsWith("s")) return Number.parseFloat(trimmed);
      return Number.parseFloat(trimmed);
    }

    function shuffleMarqueePills() {
      document.querySelectorAll(".skills-marquee__strip").forEach(function (strip) {
        var groups = strip.querySelectorAll(".skills-marquee__group");
        if (groups.length < 2) return;

        var first = groups[0];
        var kids = Array.prototype.slice.call(first.children);
        var pairs = [];
        for (var i = 0; i < kids.length; i += 2) {
          if (kids[i] && kids[i + 1]) pairs.push([kids[i], kids[i + 1]]);
        }
        if (!pairs.length) return;

        for (var j = pairs.length - 1; j > 0; j--) {
          var k = Math.floor(Math.random() * (j + 1));
          var tmp = pairs[j];
          pairs[j] = pairs[k];
          pairs[k] = tmp;
        }

        while (first.firstChild) first.removeChild(first.firstChild);
        pairs.forEach(function (pair) {
          first.appendChild(pair[0]);
          first.appendChild(pair[1]);
        });
        groups[1].innerHTML = groups[0].innerHTML;
      });
    }

    function isLoopKeyframeAnimation(anim) {
      var name = anim.animationName || "";
      if (name.indexOf("skills-marqueeL") !== -1 || name.indexOf("skills-marqueeR") !== -1) return true;
      try {
        var eff = anim.effect;
        if (!eff || !eff.getTiming) return false;
        var it = eff.getTiming();
        return it.iterations === Infinity || it.iterations === Number.POSITIVE_INFINITY;
      } catch (e) {
        return false;
      }
    }

    function setLoopPlaybackRates(rate) {
      marqueeRows.forEach(function (row) {
        var strip = row.querySelector(".skills-marquee__strip");
        if (!strip || !strip.getAnimations) return;
        strip.getAnimations().forEach(function (anim) {
          if (isLoopKeyframeAnimation(anim)) anim.playbackRate = rate;
        });
      });
    }

    function scheduleGradualSlowdown(maxIntroSeconds) {
      if (prefersReducedMotion || slowdownScheduled) return;
      slowdownScheduled = true;

      var delayMs = (maxIntroSeconds + introDelaySec) * 1000;
      window.setTimeout(function () {
        var start = performance.now();

        function tick(now) {
          var t = Math.min(1, (now - start) / slowdownRampMs);
          var ease = 1 - Math.pow(1 - t, 3);
          var rate = 1 - (1 - slowdownTargetRate) * ease;
          appliedLoopPlaybackRate = rate;

          setLoopPlaybackRates(rate);

          if (t < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      }, delayMs);
    }

    function updateIntroDurations() {
      var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!viewportWidth) return;

      var middleStrip = document.querySelector(".skills-marquee__row--r .skills-marquee__strip");
      if (!middleStrip) return;

      if (!baseMiddleLoopDuration) {
        var middleStyles = window.getComputedStyle(middleStrip);
        baseMiddleLoopDuration =
          parseDurationSeconds(middleStyles.getPropertyValue("--skills-loop-duration")) || 155;
      }
      var middleLoopDistance = middleStrip.scrollWidth / 2;
      if (!middleLoopDistance) return;

      var targetPixelsPerSecond = (middleLoopDistance / baseMiddleLoopDuration) * speedMultiplier;
      if (!targetPixelsPerSecond) return;

      var maxIntroSeconds = 0;

      marqueeRows.forEach(function (row) {
        var strip = row.querySelector(".skills-marquee__strip");
        if (!strip) return;

        var loopDistance = strip.scrollWidth / 2;
        if (!loopDistance) return;

        var introDistance = row.classList.contains("skills-marquee__row--r")
          ? loopDistance
          : viewportWidth;
        var loopDuration = loopDistance / targetPixelsPerSecond;
        var introDuration = introDistance / targetPixelsPerSecond;
        if (introDuration > maxIntroSeconds) maxIntroSeconds = introDuration;

        strip.style.setProperty("--skills-loop-duration", loopDuration + "s");
        strip.style.setProperty("--skills-intro-duration", introDuration + "s");
      });

      setLoopPlaybackRates(appliedLoopPlaybackRate);
      scheduleGradualSlowdown(maxIntroSeconds);
    }

    shuffleMarqueePills();
    updateIntroDurations();
    window.addEventListener("resize", function () {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = 0;
        updateIntroDurations();
      });
    }, { passive: true });
  })();

  // ── Scroll indicator — hide after user scrolls down ─────────
  var scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    var scrollIndicatorGone = false;
    function hideScrollIndicator() {
      if (scrollIndicatorGone) return;
      var o = window.getComputedStyle(scrollIndicator).opacity;
      scrollIndicator.style.setProperty("--scroll-indicator-fade-from", o);
      scrollIndicator.classList.add("is-hidden");
      scrollIndicatorGone = true;
    }
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 2) hideScrollIndicator();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(
      "wheel",
      function (e) {
        if (e.deltaY > 0) hideScrollIndicator();
      },
      { passive: true }
    );
    onScroll();
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
  }

  function closeVideoModal() {
    if (!videoOverlay) return;
    videoOverlay.classList.remove("is-open");
    videoOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && videoOverlay && videoOverlay.classList.contains("is-open")) {
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
