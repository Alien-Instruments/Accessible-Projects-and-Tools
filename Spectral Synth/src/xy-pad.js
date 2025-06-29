export function initXYPad({
  padElem,
  dotElem,
  xSliderElem,
  ySliderElem,
  onChange,
  step = 0.01,
  largeStep = 0.1,
}) {
  let dragging = false;
  // State: keep x/y as the pad's current values
  let x = 0.5,
    y = 0.5;

  function setXY(newX, newY, updateSliders = true, updateARIA = true) {
    // Clamp values to [0, 1]
    x = Math.max(0, Math.min(1, newX));
    y = Math.max(0, Math.min(1, newY));
    // Move dot
    if (dotElem) {
      dotElem.style.left = x * padElem.clientWidth + "px";
      dotElem.style.top = y * padElem.clientHeight + "px";
    }
    // Sync sliders
    if (updateSliders) {
      if (xSliderElem) xSliderElem.value = x;
      if (ySliderElem) ySliderElem.value = y;
    }
    // Update ARIA attributes for screen readers
    if (updateARIA && padElem) {
      padElem.setAttribute("aria-valuenow", x.toFixed(2)); // For 2D, just show X, but we clarify in valuetext
      padElem.setAttribute(
        "aria-valuetext",
        `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`
      );
    }
    // Callback to update synth
    if (onChange) onChange(x, y);
  }

  function getXYFromEvent(e) {
    const rect = padElem.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    let relX = (clientX - rect.left) / rect.width;
    let relY = (clientY - rect.top) / rect.height;
    return [Math.max(0, Math.min(1, relX)), Math.max(0, Math.min(1, relY))];
  }

  function pointerDown(e) {
    dragging = true;
    document.body.style.userSelect = "none";
    pointerMove(e);
  }
  function pointerMove(e) {
    if (!dragging) return;
    const [newX, newY] = getXYFromEvent(e);
    setXY(newX, newY);
  }
  function pointerUp() {
    dragging = false;
    document.body.style.userSelect = "";
  }

  // Mouse and touch event listeners
  padElem.addEventListener("mousedown", pointerDown);
  document.addEventListener("mousemove", pointerMove);
  document.addEventListener("mouseup", pointerUp);
  padElem.addEventListener("mouseleave", pointerUp);
  padElem.addEventListener("touchstart", pointerDown, { passive: false });
  document.addEventListener("touchmove", pointerMove, { passive: false });
  document.addEventListener("touchend", pointerUp);

  // Sync from sliders
  if (xSliderElem) {
    xSliderElem.addEventListener("input", () =>
      setXY(parseFloat(xSliderElem.value), y, false)
    );
  }
  if (ySliderElem) {
    ySliderElem.addEventListener("input", () =>
      setXY(x, parseFloat(ySliderElem.value), false)
    );
  }

  // --- Accessibility: Keyboard navigation (Arrow keys) ---
  padElem.addEventListener("keydown", (e) => {
    let handled = false;
    let s = e.shiftKey ? largeStep : step;
    if (e.key === "ArrowLeft") {
      setXY(x - s, y);
      handled = true;
    }
    if (e.key === "ArrowRight") {
      setXY(x + s, y);
      handled = true;
    }
    if (e.key === "ArrowUp") {
      setXY(x, y - s);
      handled = true;
    }
    if (e.key === "ArrowDown") {
      setXY(x, y + s);
      handled = true;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // --- Initialize ARIA attributes and starting value ---
  padElem.setAttribute("role", "slider");
  padElem.setAttribute("tabindex", "0");
  padElem.setAttribute("aria-label", "XY Pad: adjust X and Y parameters");
  padElem.setAttribute("aria-valuemin", "0");
  padElem.setAttribute("aria-valuemax", "1");

  // Center the dot by default
  setXY(0.5, 0.5);

  // --- Return API for manual control ---
  return { setXY };
}
