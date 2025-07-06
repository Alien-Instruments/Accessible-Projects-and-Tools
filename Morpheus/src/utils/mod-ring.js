function getModColor(depth) {
  const stops = [
    [0.0, [255, 0, 0]], // Red
    [0.25, [255, 255, 0]], // Yellow
    [0.5, [0, 255, 0]], // Green
    [0.75, [0, 255, 255]], // Cyan
    [1.0, [0, 128, 255]], // Blue
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [p1, c1] = stops[i];
    const [p2, c2] = stops[i + 1];

    if (depth >= p1 && depth <= p2) {
      const t = (depth - p1) / (p2 - p1);
      const lerp = (a, b, t) => a + (b - a) * t;
      const r = Math.round(lerp(c1[0], c2[0], t));
      const g = Math.round(lerp(c1[1], c2[1], t));
      const b = Math.round(lerp(c1[2], c2[2], t));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return `rgb(255, 0, 255)`; // Magenta for error
}

export function attachModRing(target, synth, announce) {
  const wrapper = target.slider.closest(".range-knob-wrapper");
  if (!wrapper) return;

  const existing = wrapper.querySelector(".mod-ring");
  if (existing) existing.remove();
  function updateModRingVisuals(modRing, depth) {
    const angle = depth * 270;
    modRing.style.transform = `rotate(${angle - 135}deg)`;
    // Color based on depth
    const color = getModColor(depth);
    modRing.style.outlineColor = color;
    modRing.style.boxShadow = `0 0 6px ${color}`;
  }
  const modRing = document.createElement("div");
  modRing.className = "mod-ring";
  modRing.dataset.depth = target.depth.toFixed(2);
  modRing.setAttribute("tabindex", "0");
  modRing.setAttribute("role", "slider");
  modRing.setAttribute("aria-valuemin", "0");
  modRing.setAttribute("aria-valuemax", "1");
  modRing.setAttribute("aria-valuenow", target.depth.toFixed(2));
  modRing.setAttribute("aria-label", `Mod depth for ${target.id}`);
  updateModRingVisuals(modRing, target.depth);
  wrapper.appendChild(modRing);

  let isAdjusting = false;
  let startY = 0;
  let startDepth = 0;

  modRing.addEventListener("mousedown", (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      const slider = target.slider;
      // 👇 PATCH: Defensive
      for (const lfo of synth?.uiLfos || []) {
        const before = lfo.targets.length;
        lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
        const after = lfo.targets.length;
        if (before !== after) {
          slider.classList.remove("modulated");
          modRing.remove();
          announce?.(`Removed mod from ${slider.dataset.paramId}`);
        }
      }
      return;
    }
    // Normal drag to adjust depth
    e.preventDefault();
    isAdjusting = true;
    startY = e.clientY;
    startDepth = target.depth;
    document.body.classList.add("mod-dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isAdjusting) return;
    const delta = startY - e.clientY;
    let newDepth = startDepth + delta * 0.005;
    newDepth = Math.max(0, Math.min(1, newDepth));
    target.depth = newDepth;
    modRing.dataset.depth = newDepth.toFixed(2);
    modRing.setAttribute("aria-valuenow", newDepth.toFixed(2));
    updateModRingVisuals(modRing, newDepth);
  });

  document.addEventListener("mouseup", () => {
    if (isAdjusting) {
      isAdjusting = false;
      document.body.classList.remove("mod-dragging");
    }
  });

  modRing.addEventListener("keydown", (e) => {
    let step = 0.05;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      target.depth = Math.min(1, target.depth + step);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      target.depth = Math.max(0, target.depth - step);
    } else {
      return;
    }
    // Update visuals + ARIA
    modRing.dataset.depth = target.depth.toFixed(2);
    modRing.setAttribute("aria-valuenow", target.depth.toFixed(2));
    updateModRingVisuals(modRing, target.depth);

    e.preventDefault(); // prevent page scroll etc
  });
}
