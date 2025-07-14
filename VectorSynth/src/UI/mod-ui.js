import { getShortcut } from "../shortcuts/shortcutManager.js";
import { getNormalizedCombo } from "./shortcuts-ui.js";
import { announce } from "../announcement/announce.js";
function handleModSourceKey(e) {
  // Always get the current shortcut mapping:
  const modPickUp = getShortcut("modPickUp") || "KeyP";
  const comboStr = getNormalizedCombo(e);

  if (comboStr === modPickUp) {
    e.preventDefault();
    this.classList.add("dragging-by-keyboard");
    window.keyboardDragSource = this;
    announce(
      `${this.textContent.trim()} picked up. Tab to a knob and press again to drop.`
    );
  } else if (comboStr === "Shift+" + "KeyP") {
    e.preventDefault();
    const slider = document.activeElement
      .closest(".range-knob-wrapper")
      ?.querySelector("input[type=range]");
    if (slider) {
      const paramId = slider.dataset.paramId;
      if (this.classList.contains("lfo-source")) {
        const lfoId = this.dataset.lfoId;
        const lfo = synth.uiLfos.find((l) => l.id === lfoId);
        if (lfo) {
          lfo.targets = lfo.targets.filter((t) => t.id !== paramId);
          slider.classList.remove("modulated");
          slider
            .closest(".range-knob-wrapper")
            ?.querySelector(".mod-ring")
            ?.remove();
          announce(`LFO removed from ${paramId}`);
        }
      } else if (this.classList.contains("mod-env-source")) {
        const envId = this.dataset.modEnvId;
        const env = synth.uiModEnvs.find((e) => e.id === envId);
        if (env) {
          env.targets = env.targets.filter((t) => t.id !== paramId);
          slider.classList.remove("modulated");
          slider
            .closest(".range-knob-wrapper")
            ?.querySelector(".mod-ring")
            ?.remove();
          announce(`Envelope removed from ${paramId}`);
        }
      }
    }
  }
}

// Handler for drop target (range slider)
function handleSliderKey(e) {
  // Always get the current shortcut mapping:
  const modPickUp = (getShortcut("modPickUp") || "KeyP").toLowerCase();

  if (e.key.toLowerCase() === modPickUp && window.keyboardDragSource) {
    e.preventDefault();
    const source = window.keyboardDragSource;
    const paramId = this.dataset.paramId;
    const min = parseFloat(this.min);
    const max = parseFloat(this.max);
    const range = max - min;
    const originalVal = parseFloat(this.value);
    const target = {
      id: paramId,
      slider: this,
      originalVal,
      range,
      depth: 1.0,
    };

    if (source.classList.contains("lfo-source")) {
      const lfoId = source.dataset.lfoId;
      const lfo = synth.uiLfos.find((l) => l.id === lfoId);
      if (lfo && !lfo.targets.some((t) => t.slider === this)) {
        lfo.targets.push(target);
        attachModRing(target, synth, announce);
        this.classList.add("modulated");
        announce(`LFO assigned to ${paramId}`);
      }
    } else if (source.classList.contains("mod-env-source")) {
      const envId = source.dataset.modEnvId;
      const env = synth.uiModEnvs.find((e) => e.id === envId);
      if (env && !env.targets.some((t) => t.slider === this)) {
        env.targets.push(target);
        attachModRing(target, synth, announce);
        this.classList.add("modulated");
        announce(`Envelope assigned to ${paramId}`);
      }
    }
    source.classList.remove("dragging-by-keyboard");
    window.keyboardDragSource = null;
  }
}

export function removeKeyboardModSourceHandlers(
  containerSelector = "#synth-ui"
) {
  document
    .querySelectorAll(
      `${containerSelector} .lfo-source, ${containerSelector} .mod-env-source`
    )
    .forEach((el) => el.removeEventListener("keydown", handleModSourceKey));
  document
    .querySelectorAll(`${containerSelector} input[type=range]`)
    .forEach((slider) =>
      slider.removeEventListener("keydown", handleSliderKey)
    );
}

export function setupKeyboardModSourceDrag(containerSelector = "#synth-ui") {
  // Always remove before adding!
  removeKeyboardModSourceHandlers(containerSelector);

  // Add new handlers for mod sources
  document
    .querySelectorAll(
      `${containerSelector} .lfo-source, ${containerSelector} .mod-env-source`
    )
    .forEach((el) => el.addEventListener("keydown", handleModSourceKey));

  // Add new handlers for all sliders
  document
    .querySelectorAll(`${containerSelector} input[type=range]`)
    .forEach((slider) => slider.addEventListener("keydown", handleSliderKey));
}

export function attachSynthSliderDragListeners() {
  document
    .querySelectorAll("#synth-ui input[type='range']")
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
        const modType = e.dataTransfer.getData("modType");
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

        const synth = window.synth;
        if (!synth) return;

        if (modType === "lfo") {
          const lfoId = e.dataTransfer.getData("text/plain");
          const lfo = synth.uiLfos?.find((l) => l.id === lfoId);
          if (!lfo) return;
          if (lfo.targets.some((t) => t.slider === slider)) return; // no dupes
          lfo.targets.push(target);
          window.attachModRing?.(target, synth, window.announce);
          slider.classList.add("modulated");
          window.announce?.(`LFO assigned to ${paramId}`);
        } else if (modType === "modEnv") {
          const modEnvId = e.dataTransfer.getData("text/plain");
          const env = synth.uiModEnvs?.find((e) => e.id === modEnvId);
          if (!env) return;
          if (env.targets.some((t) => t.slider === slider)) return;
          env.targets.push(target);
          window.attachModRing?.(target, synth, window.announce);
          slider.classList.add("modulated");
          window.announce?.(`Envelope assigned to ${paramId}`);
        }
      });
    });
}

export function setupModSourceDragListeners() {
  document.querySelectorAll(".lfo-source").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.lfoId);
      e.dataTransfer.setData("modType", "lfo");
    });
  });

  document.querySelectorAll(".mod-env-source").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.modEnvId);
      e.dataTransfer.setData("modType", "modEnv");
    });
  });
}
