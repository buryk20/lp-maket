let pageId = document.body.dataset.page || "";
const headerNode = document.querySelector("[data-header]");
const navNode = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const socialLinks = [
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/logicpower_official",
    icon:
      '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9A4.5 4.5 0 0 1 16.5 21h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.45 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z"/></svg>',
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/logicpower.official",
    icon:
      '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.35 21v-7.8h2.64l.4-3.03h-3.04V8.24c0-.88.25-1.48 1.52-1.48H16.5V4.05c-.29-.04-1.28-.11-2.43-.11-2.4 0-4.05 1.47-4.05 4.16v2.07H7.3v3.03h2.72V21h3.33Z"/></svg>',
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://ua.linkedin.com/company/logicpower",
    icon:
      '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.44 8.2a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44ZM4.96 9.68h2.96V19H4.96V9.68Zm4.82 0h2.84v1.27h.04c.4-.75 1.36-1.54 2.8-1.54 3 0 3.56 1.98 3.56 4.55V19h-2.96v-4.48c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.16-1.73 2.37V19H9.78V9.68Z"/></svg>',
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/c/LogicfoxLogicpower",
    icon:
      '<svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.66 4.6 12 4.6 12 4.6s-5.66 0-7.5.49a2.96 2.96 0 0 0-2.08 2.1C1.93 9.05 1.93 12 1.93 12s0 2.95.49 4.81a2.96 2.96 0 0 0 2.08 2.1c1.84.49 7.5.49 7.5.49s5.66 0 7.5-.49a2.96 2.96 0 0 0 2.08-2.1c.49-1.86.49-4.81.49-4.81s0-2.95-.49-4.81ZM9.97 15.06V8.94L15.2 12l-5.23 3.06Z"/></svg>',
  },
];

function buildSocialMarkup(className = "header-socials") {
  const links = socialLinks
    .map(
      (item) => `
        <a class="social-link social-link--${item.key}" href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
          ${item.icon}
        </a>
      `
    )
    .join("");

  return `<div class="${className}" aria-label="Соцмережі LogicPower">${links}</div>`;
}

function injectSocialControls() {
  if (headerNode && !headerNode.querySelector(".header-utilities")) {
    const utilities = document.createElement("div");
    utilities.className = "header-utilities";
    utilities.innerHTML = buildSocialMarkup();

    const ctaNode = headerNode.querySelector(".header-cta");
    if (ctaNode) {
      utilities.appendChild(ctaNode);
    }

    headerNode.appendChild(utilities);
  }

  const contactSlot = document.querySelector("[data-contact-socials]");
  if (contactSlot && !contactSlot.hasChildNodes()) {
    contactSlot.innerHTML = `
      <div class="contact-social-panel reveal">
        <span class="badge">Соцмережі</span>
        <h3>Офіційні канали LogicPower для новин, кейсів і прямого контакту.</h3>
        <p>Instagram, Facebook, LinkedIn та YouTube підтримують бренд, продуктові анонси, відеоконтент і швидкий перехід до діалогу з командою LogicPower.</p>
        ${buildSocialMarkup("contact-socials")}
      </div>
    `;
  }
}

function setActiveNavLink() {
  const currentPageId = window.__lpCurrentPage || document.body.dataset.page || pageId || "";
  document.querySelectorAll("[data-link]").forEach((link) => {
    const isActive = link.dataset.link === currentPageId;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setCurrentPageId(nextPageId) {
  pageId = nextPageId || pageId;
  if (nextPageId) {
    window.__lpCurrentPage = nextPageId;
    document.body.dataset.page = nextPageId;
  }
  setActiveNavLink();
}

function setupMenuToggle() {
  if (!menuToggle || !navNode) return;
  const mobileMenuQuery = window.matchMedia("(max-width: 820px)");
  const navGroups = [...navNode.querySelectorAll(".nav-group")];

  const setGroupOpen = (group, isOpen) => {
    group.classList.toggle("is-open", isOpen);
    const toggle = group.querySelector(".nav-subtoggle");
    if (toggle) {
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
  };

  const closeGroups = () => {
    navGroups.forEach((group) => setGroupOpen(group, false));
  };

  const closeMenu = () => {
    navNode.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    closeGroups();
  };

  navGroups.forEach((group) => {
    const triggerLink = group.querySelector("a");
    const dropdown = group.querySelector(".nav-dropdown");
    if (!triggerLink || !dropdown || group.querySelector(".nav-subtoggle")) return;
    let closeTimer = null;

    const cancelClose = () => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const scheduleClose = () => {
      cancelClose();
      closeTimer = window.setTimeout(() => {
        setGroupOpen(group, false);
      }, 180);
    };

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-subtoggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `Відкрити підменю ${triggerLink.textContent.trim()}`);
    toggle.innerHTML = '<span class="sr-only">Розгорнути підменю</span>';

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!mobileMenuQuery.matches) return;

      const shouldOpen = !group.classList.contains("is-open");
      closeGroups();
      setGroupOpen(group, shouldOpen);
    });

    // Mobile UX: first tap on the parent opens submenu instead of closing burger menu.
    triggerLink.addEventListener("click", (event) => {
      if (!mobileMenuQuery.matches) return;

      if (!group.classList.contains("is-open")) {
        event.preventDefault();
        closeGroups();
        setGroupOpen(group, true);
      }
    });

    group.insertBefore(toggle, dropdown);

    group.addEventListener("mouseenter", () => {
      if (mobileMenuQuery.matches || navNode.classList.contains("is-open")) return;
      cancelClose();
      setGroupOpen(group, true);
    });

    group.addEventListener("mouseleave", () => {
      if (mobileMenuQuery.matches || navNode.classList.contains("is-open")) return;
      scheduleClose();
    });

    dropdown.addEventListener("mouseenter", () => {
      cancelClose();
      if (!mobileMenuQuery.matches && !navNode.classList.contains("is-open")) {
        setGroupOpen(group, true);
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (mobileMenuQuery.matches || navNode.classList.contains("is-open")) return;
      scheduleClose();
    });
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = navNode.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) closeGroups();
  });

  navNode.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !navNode.contains(link) || event.defaultPrevented) return;

    const group = link.closest(".nav-group");
    if (mobileMenuQuery.matches && group && link === group.querySelector(":scope > a")) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-header]")) {
      closeGroups();
      if (mobileMenuQuery.matches) closeMenu();
    }
  });

  if (typeof mobileMenuQuery.addEventListener === "function") {
    mobileMenuQuery.addEventListener("change", (event) => {
      if (!event.matches) closeGroups();
    });
  }
}

function setupHeaderState() {
  if (!headerNode) return;

  const updateHeader = () => {
    headerNode.classList.toggle("is-scrolled", window.scrollY > 64);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupAnchorNavigation() {
  let highlightTimer = null;

  const highlightTarget = (target) => {
    target.classList.remove("anchor-target-active");
    void target.offsetWidth;
    target.classList.add("anchor-target-active");

    window.clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(() => {
      target.classList.remove("anchor-target-active");
    }, 1800);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    if (href.includes("/")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (history.pushState) {
      history.pushState(null, "", href);
    } else {
      window.location.hash = href;
    }

    highlightTarget(target);
  });
}

function setupRevealAnimations() {
  const revealNodes = document.querySelectorAll(".reveal");
  if (!revealNodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function setupCounters() {
  const counterNodes = document.querySelectorAll("[data-counter]");
  if (!counterNodes.length) return;

  counterNodes.forEach((node) => {
    const suffix = node.dataset.suffix || "";
    node.textContent = `0${suffix}`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const trigger = entry.target;
        const element = trigger.__counterNode || trigger;
        if (element.dataset.counterAnimated === "true") return;

        const target = Number(element.dataset.counter);
        const suffix = element.dataset.suffix || "";
        const duration = 1800;
        const startedAt = performance.now();

        element.dataset.counterAnimated = "true";

        function step(now) {
          const progress = Math.min((now - startedAt) / duration, 1);
          const current = Math.floor(target * progress);
          element.textContent = `${current.toLocaleString("uk-UA")}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            element.textContent = `${target.toLocaleString("uk-UA")}${suffix}`;
          }
        }

        requestAnimationFrame(step);
        observer.unobserve(trigger);
      });
    },
    { threshold: 0.7, rootMargin: "0px 0px -12% 0px" }
  );

  counterNodes.forEach((node) => {
    const trigger = node.closest(".data-card") || node;
    trigger.__counterNode = node;
    observer.observe(trigger);
  });
}

const ambientLibrary = {
  hero: [
    { key: "light-sweep", type: "css", effect: "light-sweep", min: 1800, max: 3200, opacity: [0.11, 0.17] },
    { key: "lens-flare", type: "css", effect: "lens-flare", min: 1600, max: 2600, opacity: [0.08, 0.13] },
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.05, 0.09] },
    { key: "panel-reflection", type: "css", effect: "panel-reflection", min: 2200, max: 3400, opacity: [0.08, 0.12] },
    { key: "solar-glint-video", type: "video", src: "./assets/solar-glint.mp4", anchor: "ambient-anchor-tr", min: 3200, max: 5200, opacity: [0.12, 0.21] },
  ],
  about: [
    { key: "water-ripple", type: "css", effect: "water-ripple", min: 2200, max: 3600, opacity: [0.08, 0.14] },
    { key: "cloud-shadow", type: "css", effect: "cloud-shadow", min: 3200, max: 5000, opacity: [0.06, 0.1] },
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.04, 0.07] },
    { key: "field-motion-video", type: "video", src: "./assets/field-ambient.mp4", anchor: "ambient-anchor-bl", min: 3400, max: 5600, opacity: [0.08, 0.16] },
  ],
  solar: [
    { key: "panel-reflection", type: "css", effect: "panel-reflection", min: 2000, max: 3200, opacity: [0.09, 0.14] },
    { key: "golden-field", type: "css", effect: "golden-field", min: 3200, max: 5200, opacity: [0.09, 0.14] },
    { key: "cloud-shadow", type: "css", effect: "cloud-shadow", min: 3200, max: 5200, opacity: [0.07, 0.11] },
    { key: "lens-flare", type: "css", effect: "lens-flare", min: 1600, max: 2400, opacity: [0.06, 0.1] },
    { key: "solar-glint-video", type: "video", src: "./assets/solar-glint.mp4", anchor: "ambient-anchor-center", min: 3200, max: 5200, opacity: [0.1, 0.18] },
  ],
  industrial: [
    { key: "industrial-glow", type: "css", effect: "industrial-glow", min: 2400, max: 3600, opacity: [0.11, 0.17] },
    { key: "quality-glow", type: "video", src: "./assets/quality-ambient.mp4", anchor: "ambient-anchor-center", min: 3200, max: 5200, opacity: [0.1, 0.17] },
    { key: "lens-flare", type: "css", effect: "lens-flare", min: 1600, max: 2400, opacity: [0.06, 0.1] },
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.05, 0.09] },
  ],
  media: [
    { key: "light-sweep", type: "css", effect: "light-sweep", min: 1800, max: 3200, opacity: [0.07, 0.12] },
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.05, 0.08] },
    { key: "cloud-shadow", type: "css", effect: "cloud-shadow", min: 3200, max: 5000, opacity: [0.06, 0.1] },
    { key: "panel-reflection", type: "css", effect: "panel-reflection", min: 2000, max: 3200, opacity: [0.05, 0.09] },
  ],
  career: [
    { key: "light-sweep", type: "css", effect: "light-sweep", min: 1800, max: 3000, opacity: [0.06, 0.1] },
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.04, 0.08] },
    { key: "cloud-shadow", type: "css", effect: "cloud-shadow", min: 3200, max: 5000, opacity: [0.05, 0.09] },
  ],
  default: [
    { key: "particles", type: "css", effect: "particles", min: 2600, max: 4200, opacity: [0.04, 0.08] },
    { key: "lens-flare", type: "css", effect: "lens-flare", min: 1600, max: 2400, opacity: [0.04, 0.08] },
  ],
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function resolveAmbientEffects(profile) {
  const tokens = (profile || "default").split(/\s+/).filter(Boolean);
  const effects = [];
  const seen = new Set();

  tokens.forEach((token) => {
    (ambientLibrary[token] || []).forEach((effect) => {
      if (seen.has(effect.key)) return;
      effects.push(effect);
      seen.add(effect.key);
    });
  });

  if (!effects.length) {
    return ambientLibrary.default;
  }

  return effects;
}

function createAmbientEffect(effect) {
  if (effect.type === "video") {
    const node = document.createElement("video");
    node.className = `ambient-effect ${effect.anchor || ""}`.trim();
    node.muted = true;
    node.loop = true;
    node.playsInline = true;
    node.preload = "metadata";

    const source = document.createElement("source");
    source.src = effect.src;
    source.type = "video/mp4";
    node.appendChild(source);
    return node;
  }

  const node = document.createElement("div");
  node.className = `ambient-effect ambient-effect--${effect.effect}`.trim();
  return node;
}

function setupAmbientFx() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layers = document.querySelectorAll("[data-ghost-host]");
  if (!layers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const state = entry.target.__ambientState;
        if (!state) return;

        state.visible = entry.isIntersecting;

        if (entry.isIntersecting) {
          state.scheduleNext();
          return;
        }

        window.clearTimeout(state.timerId);
        state.timerId = null;
        state.active = false;
        state.effects.forEach((effect) => {
          effect.node.classList.remove("is-active");
          if (effect.type === "video" && typeof effect.node.pause === "function") {
            effect.node.pause();
          }
        });
      });
    },
    { threshold: 0.18, rootMargin: "120px 0px 120px 0px" }
  );

  layers.forEach((layer) => {
    const profile = layer.dataset.ambientProfile || "default";
    const effects = resolveAmbientEffects(profile).map((effect) => {
      const node = createAmbientEffect(effect);
      layer.appendChild(node);
      return { ...effect, node };
    });

    const state = {
      effects,
      timerId: null,
      active: false,
      visible: false,
      scheduleNext: null,
    };

    const scheduleNext = () => {
      if (!state.visible) return;

      window.clearTimeout(state.timerId);
      state.timerId = window.setTimeout(runEffect, randomBetween(8000, 20000));
    };

    const runEffect = () => {
      if (!state.visible || state.active || document.hidden) {
        scheduleNext();
        return;
      }

      const effect = effects[Math.floor(Math.random() * effects.length)];
      const duration = randomBetween(effect.min, effect.max);
      const opacity = Math.min(0.3, randomBetween(effect.opacity[0], effect.opacity[1])).toFixed(2);
      const fadeIn = Math.max(650, duration * 0.24);
      const fadeOut = Math.max(800, duration * 0.28);
      const hold = Math.max(0, duration - fadeIn - fadeOut);

      state.active = true;
      effect.node.style.setProperty("--ambient-opacity", opacity);
      effect.node.style.setProperty("--ambient-duration", `${Math.round(duration)}ms`);
      effect.node.style.setProperty("--ambient-fade-in", `${Math.round(fadeIn)}ms`);
      effect.node.style.setProperty("--ambient-fade-out", `${Math.round(fadeOut)}ms`);
      effect.node.style.setProperty("--ambient-hold", `${Math.round(hold)}ms`);
      effect.node.classList.add("is-active");

      if (effect.type === "video") {
        effect.node.currentTime = 0;
        const playPromise = effect.node.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      }

      window.setTimeout(() => {
        effect.node.classList.remove("is-active");
        state.active = false;
        if (effect.type === "video" && typeof effect.node.pause === "function") {
          effect.node.pause();
        }
        scheduleNext();
      }, duration);
    };

    state.scheduleNext = scheduleNext;
    layer.__ambientState = state;
    observer.observe(layer);
  });
}

function setupDemoForms() {
  document.querySelectorAll(".js-demo-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.alert("Дякуємо. Ваш запит прийнято. Команда LogicPower зв'яжеться з вами найближчим часом.");
    });
  });
}

function setupCaseFilters() {
  const buttons = [...document.querySelectorAll("[data-filter-button]")];
  const targets = [...document.querySelectorAll("[data-case-sector]")];
  if (!buttons.length || !targets.length) return;

  const applyFilter = (filter) => {
    buttons.forEach((item) => item.classList.toggle("is-active", item.dataset.filterButton === filter));

    targets.forEach((target) => {
      const show = filter === "all" || target.dataset.caseSector === filter;
      target.classList.toggle("is-filter-hidden", !show);
      target.toggleAttribute("hidden", !show);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.filterButton);
    });
  });

  applyFilter(buttons.find((button) => button.classList.contains("is-active"))?.dataset.filterButton || "all");
}

function setupScrollProgress() {
  let progressNode = document.querySelector(".page-progress");
  if (!progressNode) {
    progressNode = document.createElement("div");
    progressNode.className = "page-progress";
    progressNode.setAttribute("aria-hidden", "true");
    document.body.appendChild(progressNode);
  }

  const updateProgress = () => {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const progress = scrollable ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progressNode.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
}

function setupMagneticUi() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const nodes = document.querySelectorAll(".button, .header-cta, .chip");
  if (!nodes.length) return;

  const resetNode = (node) => {
    node.style.setProperty("--magnetic-x", "0px");
    node.style.setProperty("--magnetic-y", "0px");
  };

  nodes.forEach((node) => {
    const strength = node.classList.contains("chip") ? 8 : 12;

    node.addEventListener("mousemove", (event) => {
      const bounds = node.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left - bounds.width / 2;
      const offsetY = event.clientY - bounds.top - bounds.height / 2;
      const moveX = (offsetX / bounds.width) * strength;
      const moveY = (offsetY / bounds.height) * strength;

      node.style.setProperty("--magnetic-x", `${moveX.toFixed(2)}px`);
      node.style.setProperty("--magnetic-y", `${moveY.toFixed(2)}px`);
    });

    node.addEventListener("mouseleave", () => resetNode(node));
    node.addEventListener("blur", () => resetNode(node));
  });
}

function setupEnergyFlowSection() {
  const sections = [...document.querySelectorAll("[data-energy-flow]")];
  if (!sections.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const easeInOutCubic = (value) => (value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2);

  const roundedRect = (ctx, x, y, width, height, radius) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  };

  const cubicPoint = (path, time) => {
    const omt = 1 - time;
    return {
      x:
        omt * omt * omt * path.start.x +
        3 * omt * omt * time * path.cp1.x +
        3 * omt * time * time * path.cp2.x +
        time * time * time * path.end.x,
      y:
        omt * omt * omt * path.start.y +
        3 * omt * omt * time * path.cp1.y +
        3 * omt * time * time * path.cp2.y +
        time * time * time * path.end.y,
    };
  };

  sections.forEach((section) => {
    const canvas = section.querySelector("[data-energy-flow-canvas]");
    const labels = [...section.querySelectorAll("[data-energy-flow-label]")];
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let deviceScale = 1;
    let paths = [];
    let frameId = 0;
    let timerId = 0;
    let inViewport = false;
    let initialized = false;
    let cycleStart = 0;
    let cycleActive = false;
    let labelState = false;

    const setLabelsVisible = (isVisible) => {
      if (labelState === isVisible) return;
      labelState = isVisible;
      labels.forEach((label) => label.classList.toggle("is-visible", isVisible));
    };

    const getGeometry = () => {
      const compact = window.innerWidth <= 820;
      const centerX = width * 0.5;
      const centerY = height * 0.54;
      const shellWidth = width * (compact ? 0.22 : 0.24);
      const shellHeight = height * (compact ? 0.34 : 0.42);
      const shellX = centerX - shellWidth / 2;
      const shellY = centerY - shellHeight / 2;

      return {
        compact,
        centerX,
        centerY,
        shellX,
        shellY,
        shellWidth,
        shellHeight,
      };
    };

    const buildPaths = () => {
      const { compact, centerX, centerY, shellX, shellY, shellWidth, shellHeight } = getGeometry();
      const anchors = [
        [0.06, 0.18],
        [0.08, 0.42],
        [0.08, 0.74],
        [0.16, 0.88],
        [0.26, 0.08],
        [0.74, 0.08],
        [0.92, 0.2],
        [0.94, 0.46],
        [0.92, 0.72],
        [0.86, 0.88],
        [0.28, 0.92],
        [0.72, 0.92],
      ];

      const targets = [
        [shellX + shellWidth * 0.22, shellY + shellHeight * 0.18],
        [shellX + shellWidth * 0.78, shellY + shellHeight * 0.18],
        [shellX + shellWidth * 0.24, shellY + shellHeight * 0.42],
        [shellX + shellWidth * 0.76, shellY + shellHeight * 0.42],
        [shellX + shellWidth * 0.28, shellY + shellHeight * 0.68],
        [shellX + shellWidth * 0.72, shellY + shellHeight * 0.68],
        [shellX + shellWidth * 0.5, shellY + shellHeight * 0.12],
        [shellX + shellWidth * 0.5, shellY + shellHeight * 0.88],
      ];

      const count = compact ? 8 : 12;
      paths = Array.from({ length: count }, (_, index) => {
        const anchor = anchors[index % anchors.length];
        const target = targets[index % targets.length];
        const start = { x: anchor[0] * width, y: anchor[1] * height };
        const end = { x: target[0], y: target[1] };
        const directionX = start.x < centerX ? 1 : -1;
        const directionY = start.y < centerY ? 1 : -1;
        const pathColor = index % 2 === 0 ? "61, 200, 255" : "122, 220, 183";

        return {
          rgb: pathColor,
          delay: index * 0.034,
          length: compact ? 0.16 : 0.18,
          start,
          end,
          cp1: {
            x: lerp(start.x, centerX, 0.36) + width * 0.05 * directionX,
            y: lerp(start.y, centerY, 0.18) + height * 0.04 * directionY,
          },
          cp2: {
            x: lerp(end.x, centerX, 0.52) - width * 0.04 * directionX,
            y: lerp(end.y, centerY, 0.24) - height * 0.05 * directionY,
          },
        };
      });
    };

    const resizeCanvas = () => {
      const bounds = section.getBoundingClientRect();
      width = Math.max(Math.round(bounds.width), 1);
      height = Math.max(Math.round(bounds.height), 1);
      deviceScale = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 820 ? 1.4 : 1.8);
      canvas.width = Math.round(width * deviceScale);
      canvas.height = Math.round(height * deviceScale);
      ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
      buildPaths();
      drawScene(performance.now());
    };

    const drawBackground = () => {
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.54, 0, width * 0.5, height * 0.54, width * 0.32);
      glow.addColorStop(0, "rgba(61, 200, 255, 0.14)");
      glow.addColorStop(0.42, "rgba(61, 200, 255, 0.06)");
      glow.addColorStop(1, "rgba(61, 200, 255, 0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    };

    const drawPathTrack = (path, alpha) => {
      ctx.save();
      ctx.beginPath();
      for (let step = 0; step <= 30; step += 1) {
        const point = cubicPoint(path, step / 30);
        if (step === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.strokeStyle = `rgba(${path.rgb}, ${alpha})`;
      ctx.lineWidth = 1.05;
      ctx.stroke();
      ctx.restore();
    };

    const drawPulse = (path, cycleProgress, fade) => {
      const head = clampValue((cycleProgress - path.delay) / 0.38, 0, 1);
      if (head <= 0) return;

      const tail = Math.max(0, head - path.length);

      ctx.save();
      ctx.beginPath();
      for (let step = 0; step <= 22; step += 1) {
        const time = lerp(tail, head, step / 22);
        const point = cubicPoint(path, time);
        if (step === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.strokeStyle = `rgba(${path.rgb}, ${0.76 * fade})`;
      ctx.lineWidth = 2.3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 22;
      ctx.shadowColor = `rgba(${path.rgb}, ${0.45 * fade})`;
      ctx.stroke();
      ctx.restore();
    };

    const drawProduct = (intensity) => {
      const { shellX, shellY, shellWidth, shellHeight } = getGeometry();

      ctx.save();
      roundedRect(ctx, shellX, shellY, shellWidth, shellHeight, 18);
      ctx.fillStyle = `rgba(10, 18, 33, ${0.5 + intensity * 0.12})`;
      ctx.strokeStyle = `rgba(147, 198, 255, ${0.16 + intensity * 0.66})`;
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 24 * intensity;
      ctx.shadowColor = `rgba(61, 200, 255, ${0.28 + intensity * 0.18})`;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const displayWidth = shellWidth * 0.24;
      const displayHeight = shellHeight * 0.12;
      const displayX = shellX + shellWidth * 0.38;
      const displayY = shellY + shellHeight * 0.12;

      ctx.save();
      roundedRect(ctx, displayX, displayY, displayWidth, displayHeight, 7);
      ctx.fillStyle = `rgba(20, 36, 60, ${0.9})`;
      ctx.strokeStyle = `rgba(122, 220, 183, ${0.16 + intensity * 0.48})`;
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const rackWidth = shellWidth * 0.2;
      const rackHeight = shellHeight * 0.18;
      const rackY = shellY + shellHeight * 0.34;

      [0.18, 0.4, 0.62].forEach((offset) => {
        const rackX = shellX + shellWidth * offset;
        ctx.save();
        roundedRect(ctx, rackX, rackY, rackWidth, rackHeight, 8);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + intensity * 0.05})`;
        ctx.strokeStyle = `rgba(122, 220, 183, ${0.12 + intensity * 0.42})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      ctx.save();
      ctx.strokeStyle = `rgba(243, 108, 33, ${0.08 + intensity * 0.26})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(shellX + shellWidth * 0.18, shellY + shellHeight * 0.62);
      ctx.lineTo(shellX + shellWidth * 0.82, shellY + shellHeight * 0.62);
      ctx.stroke();
      ctx.restore();
    };

    const drawScene = (time) => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();

      let cycleProgress = 0;
      let fade = 0;
      let showLabels = false;

      if (cycleActive) {
        const elapsed = time - cycleStart;
        const totalDuration = 4200;
        const normalized = clampValue(elapsed / totalDuration, 0, 1);

        if (normalized >= 1) {
          cycleActive = false;
          section.classList.remove("is-active");
          setLabelsVisible(false);
          scheduleNext(false);
        } else {
          cycleProgress = normalized;
          fade = normalized > 0.78 ? 1 - (normalized - 0.78) / 0.22 : 1;
          showLabels = normalized > 0.56 && normalized < 0.9;
        }
      }

      paths.forEach((path) => drawPathTrack(path, cycleActive ? 0.12 * fade + 0.06 : 0.06));

      if (cycleActive) {
        const easedProgress = easeInOutCubic(cycleProgress);
        paths.forEach((path) => drawPulse(path, easedProgress, fade));
      }

      const productIntensity = cycleActive ? 0.22 + easeOutCubic(clampValue((cycleProgress - 0.18) / 0.44, 0, 1)) * fade : 0.1;
      drawProduct(productIntensity);
      setLabelsVisible(showLabels);
    };

    const renderFrame = (time) => {
      drawScene(time);
      if (inViewport || cycleActive) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const startLoop = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const stopLoop = () => {
      if (!frameId) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const startCycle = () => {
      if (!inViewport || prefersReducedMotion.matches) return;
      cycleActive = true;
      cycleStart = performance.now();
      section.classList.add("is-active");
      startLoop();
    };

    const scheduleNext = (immediate) => {
      window.clearTimeout(timerId);
      if (!inViewport || prefersReducedMotion.matches) return;
      const delay = immediate ? 360 : randomBetween(8000, 20000);
      timerId = window.setTimeout(startCycle, delay);
    };

    const initialize = () => {
      if (initialized) return;
      initialized = true;
      resizeCanvas();
      section.classList.remove("is-loading");

      if (prefersReducedMotion.matches) {
        setLabelsVisible(true);
      }
    };

    const handleViewport = (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== section) return;
        inViewport = entry.isIntersecting;

        if (inViewport) {
          initialize();
          if (prefersReducedMotion.matches) {
            stopLoop();
            drawScene(performance.now());
            setLabelsVisible(true);
            return;
          }
          startLoop();
          if (!cycleActive) {
            scheduleNext(true);
          }
        } else {
          window.clearTimeout(timerId);
          cycleActive = false;
          setLabelsVisible(false);
          section.classList.remove("is-active");
          stopLoop();
        }
      });
    };

    const observer = new IntersectionObserver(handleViewport, {
      threshold: 0.24,
      rootMargin: "0px 0px -10% 0px",
    });

    observer.observe(section);

    window.addEventListener("resize", () => {
      if (!initialized) return;
      resizeCanvas();
      startLoop();
    }, { passive: true });
  });
}

setActiveNavLink();
injectSocialControls();
setupMenuToggle();
setupHeaderState();
setupAnchorNavigation();
setupRevealAnimations();
setupCounters();
setupAmbientFx();
setupDemoForms();
setupCaseFilters();
setupScrollProgress();
setupMagneticUi();

window.logicPowerSetPage = setCurrentPageId;
