// ============================================
// Tool icon lookup (Simple Icons via jsDelivr CDN)
// Every <img> has an onerror fallback that just removes
// itself, so a missing slug never shows a broken image.
// ============================================
const ICON_BASE = "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function iconImg(slug, label) {
  if (!slug) return "";
  const img = document.createElement("img");
  img.src = `${ICON_BASE}${slug}.svg`;
  img.alt = "";
  img.loading = "lazy";
  img.setAttribute("aria-hidden", "true");
  img.onerror = () => img.remove();
  return img;
}

// Parses "slug:Label,slug2:Label2,:LabelNoIcon" into chip elements
function renderChips(container) {
  const raw = container.dataset.chips;
  if (!raw) return;
  raw.split(",").forEach((entry, i) => {
    const [slug, label] = entry.split(":");
    const span = document.createElement("span");
    span.style.transitionDelay = `${i * 35}ms`;
    if (slug) span.appendChild(iconImg(slug, label));
    span.appendChild(document.createTextNode(label));
    container.appendChild(span);
  });
}

document.querySelectorAll(".chips[data-chips]").forEach(renderChips);

// ============================================
// Hero tool marquee
// ============================================
const MARQUEE_TOOLS = [
  ["amazonaws", "AWS"],
  ["kubernetes", "Kubernetes"],
  ["docker", "Docker"],
  ["terraform", "Terraform"],
  ["jenkins", "Jenkins"],
  ["githubactions", "GitHub Actions"],
  ["argo", "Argo CD"],
  ["grafana", "Grafana"],
  ["prometheus", "Prometheus"],
  ["ansible", "Ansible"],
  ["microsoftazure", "Azure"],
  ["python", "Python"],
];

const marqueeTrack = document.getElementById("marqueeTrack");
if (marqueeTrack) {
  // duplicate the list so the loop is seamless
  const buildSet = () =>
    MARQUEE_TOOLS.map(([slug, label]) => {
      const badge = document.createElement("div");
      badge.className = "tool-badge";
      badge.appendChild(iconImg(slug, label));
      const span = document.createElement("span");
      span.textContent = label;
      badge.appendChild(span);
      return badge;
    });
  buildSet().forEach((el) => marqueeTrack.appendChild(el));
  buildSet().forEach((el) => marqueeTrack.appendChild(el));
}

// ============================================
// Hero Apple-style scroll parallax
// ============================================
const heroEl = document.getElementById("hero");
const heroWordmarks = document.getElementById("heroWordmarks");
const heroVisual = document.getElementById("heroVisual");

if (heroEl && heroWordmarks && heroVisual && !prefersReducedMotion) {
  let heroRaf = 0;

  const updateHeroParallax = () => {
    heroRaf = 0;
    const rect = heroEl.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
    const yWord = progress * 70;
    const yVisual = progress * -24;
    const scaleWord = 1 + progress * 0.1;
    heroWordmarks.style.transform = `translate3d(0, ${yWord}px, 0) scale(${scaleWord})`;
    heroVisual.style.transform = `translate3d(0, ${yVisual}px, 0)`;
  };

  const onHeroScroll = () => {
    if (heroRaf) return;
    heroRaf = requestAnimationFrame(updateHeroParallax);
  };

  updateHeroParallax();
  window.addEventListener("scroll", onHeroScroll, { passive: true });
  window.addEventListener("resize", onHeroScroll);
}

// ============================================
// Writing series slider (manual scroll only)
// ============================================
const writingViewport = document.getElementById("writingViewport");
const writingPrev = document.getElementById("writingPrev");
const writingNext = document.getElementById("writingNext");

if (writingViewport && writingPrev && writingNext) {
  const getCards = () => Array.from(writingViewport.querySelectorAll(".writing-card"));

  const getActiveIndex = () => {
    const cards = getCards();
    if (!cards.length) return 0;
    const viewRect = writingViewport.getBoundingClientRect();
    const mid = viewRect.left + viewRect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const goToIndex = (index) => {
    const cards = getCards();
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    cards[clamped].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const onNav = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToIndex(getActiveIndex() + dir);
  };

  writingPrev.addEventListener("click", onNav(-1));
  writingNext.addEventListener("click", onNav(1));
}

// ============================================
// Timeline scroll-progress accent line
// ============================================
const timelineEl = document.getElementById("timeline");
if (timelineEl) {
  const updateTimelineProgress = () => {
    const rect = timelineEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const visible = Math.min(Math.max(viewportH * 0.6 - rect.top, 0), total);
    const pct = total > 0 ? (visible / total) * 100 : 0;
    timelineEl.style.setProperty("--tl-progress", `${pct}%`);
  };
  updateTimelineProgress();
  window.addEventListener("scroll", updateTimelineProgress, { passive: true });
  window.addEventListener("resize", updateTimelineProgress);
}

// ============================================
// Nav: blur + border once the page scrolls
// ============================================
const nav = document.getElementById("nav");
const onScrollNav = () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
};
onScrollNav();
window.addEventListener("scroll", onScrollNav, { passive: true });

// ============================================
// Scroll reveals (IntersectionObserver)
// ============================================
const revealEls = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  try {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } catch (err) {
    // if anything about the observer fails, never leave content stuck at opacity 0
    revealEls.forEach((el) => el.classList.add("in"));
  }
}

// ============================================
// Animated stat counters
// ============================================
const counters = document.querySelectorAll(".stat-num");

const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  if (prefersReducedMotion) {
    el.textContent = target;
    return;
  }
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
counters.forEach((el) => counterObserver.observe(el));

// ============================================
// Project architecture diagrams (hover / tap)
// ============================================
const diagramCards = document.querySelectorAll(".project-card.has-diagram");
const touchNoHover = window.matchMedia("(hover: none)").matches;

const setDiagramOpen = (card, open) => {
  card.classList.toggle("is-diagram-open", open);
  card.setAttribute("aria-expanded", open ? "true" : "false");
};

diagramCards.forEach((card) => {
  if (touchNoHover) {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !card.classList.contains("is-diagram-open");
      diagramCards.forEach((other) => setDiagramOpen(other, other === card && willOpen));
    });
  } else {
    card.addEventListener("mouseenter", () => setDiagramOpen(card, true));
    card.addEventListener("mouseleave", () => setDiagramOpen(card, false));
    card.addEventListener("focusin", () => setDiagramOpen(card, true));
    card.addEventListener("focusout", (e) => {
      if (!card.contains(e.relatedTarget)) setDiagramOpen(card, false);
    });
  }
});

if (touchNoHover) {
  document.addEventListener("click", () => {
    diagramCards.forEach((card) => setDiagramOpen(card, false));
  });
}

// ============================================
// Hero background: drifting node graph
// (one deliberate, non-interactive motion moment)
// ============================================
const canvas = document.getElementById("mesh");
const ctx = canvas ? canvas.getContext("2d") : null;
let width, height, nodes;
const NODE_COUNT_BASE = 42;
const LINK_DIST = 150;

function resize() {
  width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  height = canvas.height = canvas.offsetHeight * devicePixelRatio;
}

function initNodes() {
  const area = canvas.offsetWidth * canvas.offsetHeight;
  const count = Math.min(70, Math.max(24, Math.round(area / 18000)));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
    vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
  }));
}

let pointerX = 0.5, pointerY = 0.5;
if (canvas) {
  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) / rect.width;
    pointerY = (e.clientY - rect.top) / rect.height;
  });
}

function step() {
  ctx.clearRect(0, 0, width, height);

  // gentle, bounded parallax offset toward the cursor
  const parallaxX = (pointerX - 0.5) * 24 * devicePixelRatio;
  const parallaxY = (pointerY - 0.5) * 24 * devicePixelRatio;
  ctx.save();
  ctx.translate(parallaxX, parallaxY);

  // update + draw nodes
  nodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;
  });

  // links
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = LINK_DIST * devicePixelRatio;
      if (dist < maxDist) {
        ctx.strokeStyle = `rgba(0, 214, 160, ${(1 - dist / maxDist) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // node dots
  nodes.forEach((n) => {
    ctx.fillStyle = "rgba(0, 214, 160, 0.5)";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
  if (!prefersReducedMotion) requestAnimationFrame(step);
}

if (canvas && ctx) {
  resize();
  initNodes();
  if (!prefersReducedMotion) {
    requestAnimationFrame(step);
  } else {
    step(); // draw a single static frame, no loop
  }
  window.addEventListener("resize", () => {
    resize();
    initNodes();
  });
}
