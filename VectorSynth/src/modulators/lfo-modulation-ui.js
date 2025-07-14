import { audioCtx } from "../utils/audioCtx.js";
import { attachModRing } from "./mod-ring.js";

// Utility: Generate LFO sample for a shape at a given phase
function lfoWaveformSample(shape, phase) {
  switch (shape) {
    case "sine":
      return Math.sin(2 * Math.PI * phase);
    case "square":
      return phase < 0.5 ? 1 : -1;
    case "triangle":
      return 4 * Math.abs(phase - 0.5) - 1;
    case "sawtooth":
      return 2 * (phase - Math.floor(phase + 0.5));
    default:
      return Math.sin(2 * Math.PI * phase); // fallback
  }
}

export function setupLfoModulationUI({
  synth,
  announce,
  audioContext,
  containerSelector = "#synth-ui", // main param UI area
  lfoSourcesSelector = ".lfo-source", // selector for draggable LFO widgets
} = {}) {
  let keyboardPickupLFO = null;

  // ---- Pick/Drop logic refactored ----
  function handlePickDrop() {
    const el = document.activeElement;
    if (!el) return;

    // Pick up LFO from focused source
    if (el.classList.contains("lfo-source")) {
      const lfoId = el.dataset.lfoId;
      const lfo = synth.uiLfos.find((l) => l.id === lfoId);
      if (!lfo) return;
      keyboardPickupLFO = lfo;
      el.classList.add("pickup-mode");
      announce?.(`Picked up ${lfo.id} for drop`);
      return;
    }

    // Drop LFO on a slider
    if (
      el.tagName === "INPUT" &&
      el.type === "range" &&
      el.dataset.paramId &&
      keyboardPickupLFO
    ) {
      const slider = el;
      const paramId = slider.dataset.paramId;
      // Prevent duplicate assignment
      if (keyboardPickupLFO.targets.some((t) => t.slider === slider)) {
        announce?.(`Warning Already Assigned`);
        return;
      }
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const range = max - min;
      const originalVal = parseFloat(slider.value);

      const target = {
        id: paramId,
        slider,
        originalVal,
        range,
        depth: 1.0,
      };

      keyboardPickupLFO.targets.push(target);
      attachModRing(target, synth, announce);
      slider.classList.add("modulated");
      announce?.(`Dropped ${keyboardPickupLFO.id} on ${paramId}`);
      // Clear pickup
      document
        .querySelectorAll(lfoSourcesSelector)
        .forEach((el) => el.classList.remove("pickup-mode"));
      keyboardPickupLFO = null;
      return;
    }
  }

  function handleRemoveMod() {
    const el = document.activeElement;
    if (
      el &&
      el.tagName === "INPUT" &&
      el.type === "range" &&
      el.dataset.paramId
    ) {
      const slider = el;
      for (const lfo of synth.uiLfos) {
        const before = lfo.targets.length;
        lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
        const after = lfo.targets.length;
        if (before !== after) {
          slider.classList.remove("modulated");
          slider
            .closest(".range-knob-wrapper")
            ?.querySelector(".mod-ring")
            ?.remove();
          announce?.(`Removed mod from ${slider.dataset.paramId}`);
        }
      }
    }
  }

  // --- Drag and Drop for LFO sources ---
  document.querySelectorAll(lfoSourcesSelector).forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.lfoId);
    });
  });

  // --- Make all sliders drop targets (delegated after synth UI build) ---
  function setupSliderDropTargets() {
    document
      .querySelectorAll(`${containerSelector} input[type='range']`)
      .forEach((slider) => {
        slider.addEventListener("dragover", (e) => {
          e.preventDefault();
          slider.classList.add("drop-target");
        });

        slider.addEventListener("dragleave", () => {
          slider.classList.remove("drop-target");
        });

        slider.addEventListener("drop", (e) => {
          e.preventDefault();
          slider.classList.remove("drop-target");
          const lfoId = e.dataTransfer.getData("text/plain");
          const lfo = synth.uiLfos.find((l) => l.id === lfoId);
          if (!lfo) return;
          const paramId = slider.dataset.paramId;
          const min = parseFloat(slider.min);
          const max = parseFloat(slider.max);
          const range = max - min;
          const originalVal = parseFloat(slider.value);

          const target = {
            id: paramId,
            slider,
            originalVal,
            range,
            depth: 1.0,
          };
          lfo.targets.push(target);
          attachModRing(target, synth, announce);
          slider.classList.add("modulated");
        });
      });
  }

  // Re-setup drop targets after UI rebuild
  setupSliderDropTargets();

  // --- Animate LFOs: drive their modulations in realtime ---
  function animateLfos() {
    requestAnimationFrame(animateLfos);
    const now = audioCtx.currentTime;
    for (const lfo of synth.uiLfos) {
      const phase = (now * lfo.rate) % 1;
      const shape = lfo.osc.type;
      const baseWave = lfoWaveformSample(shape, phase);
      const lfoVal = baseWave * lfo.depth;

      for (const target of lfo.targets) {
        const modulatedVal =
          target.originalVal + lfoVal * target.range * target.depth;
        const clamped = Math.min(
          parseFloat(target.slider.max),
          Math.max(parseFloat(target.slider.min), modulatedVal)
        );
        target.slider.value = clamped;
        target.slider.dispatchEvent(new Event("input"));
      }
    }
  }
  animateLfos();

  // Expose public API for global shortcut system!
  return {
    rebindSliderDropTargets: setupSliderDropTargets,
    pickDrop: handlePickDrop,
    removeLfoModFromFocusedSlider: handleRemoveMod,
  };
}
