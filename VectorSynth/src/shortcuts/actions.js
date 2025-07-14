import { triggerMIDILearnForControl } from "../midi/midi-learn.js";

export function createActions({ announceModeRef, recognition, announce }) {
  return {
    mapMidi: function () {
      const el = document.activeElement;
      if (!el || !["INPUT", "SELECT"].includes(el.tagName)) {
        announce("Focus a control first");
        return;
      }
      triggerMIDILearnForControl(el.id);
      announce("MIDI Learn activated for focused control");
    },
    cancelMap: function () {
      if (window.learning && window.currentTarget) {
        window.currentTarget
          .closest(".slider-div")
          ?.classList.remove("learning");
        announce("Cancelled MIDI Learn");
        window.learning = false;
        window.currentTarget = null;
      }
    },
    pickDrop: function () {
      if (window.lfoUI && window.lfoUI.pickDrop) {
        window.lfoUI.pickDrop();
      }
      if (window.envUI && window.envUI.pickDrop) {
        window.envUI.pickDrop();
      }
      if (window.fxUI && window.fxUI.pickDrop) {
        window.fxUI.pickDrop();
      }
    },
    removeMod: function () {
      if (window.lfoUI && window.lfoUI.removeLfoModFromFocusedSlider) {
        window.lfoUI.removeLfoModFromFocusedSlider();
      } else {
        console.warn("lfoUI not ready");
      }
      if (window.envUI && window.envUI.removeEnvModFromFocusedSlider) {
        window.envUI.removeEnvModFromFocusedSlider();
      } else {
        console.warn("envUI not ready");
      }
    },

    toggleAnnounce: function () {
      announceModeRef.value =
        announceModeRef.value === "aria" ? "speech" : "aria";
      announce(
        `Announcement mode: ${
          announceModeRef.value === "aria" ? "screen reader" : "spoken"
        }`
      );
      const toggle = document.getElementById("announce-toggle");
      if (toggle) toggle.checked = announceModeRef.value === "speech";
    },
    startVoice: function () {
      window.voiceAPI && window.voiceAPI.start();
    },
    sliderMin: function () {
      if (lastFocusedRangeInput) {
        lastFocusedRangeInput.value = lastFocusedRangeInput.min;
        lastFocusedRangeInput.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    },
    sliderMax: function () {
      if (lastFocusedRangeInput) {
        lastFocusedRangeInput.value = lastFocusedRangeInput.max;
        lastFocusedRangeInput.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    },
    sliderDefault: function () {
      if (lastFocusedRangeInput) {
        lastFocusedRangeInput.value = lastFocusedRangeInput.defaultValue;
        lastFocusedRangeInput.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    },
    // actions.js
    sliderX10Left: function () {
      moveSlider(-1, 10);
    },
    sliderX10Right: function () {
      moveSlider(1, 10);
    },
    sliderX100Left: function () {
      moveSlider(-1, 100);
    },
    sliderX100Right: function () {
      moveSlider(1, 100);
    },
    goToGlobal: function () {
      focusPanel("category global panel");
    },
    goToOsc: function () {
      focusPanel("category oscillator panel");
    },
    goToFilter: function () {
      focusPanel("category main-filter panel");
    },
    goToModEnv: function () {
      focusPanel("category envelopes panel");
    },
    goToLFO: function () {
      focusPanel("category lfo panel");
    },
    goToAddFx: function () {
      focusPanel("effects");
    },
    goToFxChain: function () {
      focusPanel("effect-chain");
    },
  };
}
function focusPanel(className) {
  const selector = "." + className.trim().split(/\s+/).join(".");
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
    }
    el.focus();
  }
}

function moveSlider(direction, multiplier = 1) {
  const input = window.lastFocusedRangeInput;
  if (!input) return;
  const step = parseFloat(input.step) || 1;
  const current = parseFloat(input.value);
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);

  let newValue = current + step * direction * multiplier;
  newValue = Math.max(min, Math.min(max, newValue));
  input.value = newValue;
  input.dispatchEvent(new Event("input", { bubbles: true }));

  const wrapper = input.closest(".range-knob-wrapper");
  if (wrapper && wrapper.rangeKnobInstance) {
    wrapper.rangeKnobInstance.rotateKnob(newValue);
    wrapper.rangeKnobInstance.updateAriaAttributes();
  }
  console.log({
    current,
    step,
    direction,
    multiplier,
    newValue,
  });
}
