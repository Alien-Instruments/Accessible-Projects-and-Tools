export function setupModEnvModulationUI({
  synth,
  announce,
  audioContext,
  containerSelector = "#synth-ui",
  modEnvSourcesSelector = ".mod-env-source",
} = {}) {
  let keyboardPickupEnv = null;

  function handlePickDrop() {
    const el = document.activeElement;
    if (!el) return;

    // Pick up env from focused source
    if (el.classList.contains("mod-env-source")) {
      const envId = el.dataset.modEnvId;
      const env = synth.uiModEnvs.find((e) => e.id === envId);
      if (!env) return;
      keyboardPickupEnv = env;
      el.classList.add("pickup-mode");
      announce?.(`Picked up ${env.id} for drop`);
      return;
    }

    // Drop env on a slider
    if (
      el.tagName === "INPUT" &&
      el.type === "range" &&
      el.dataset.paramId &&
      keyboardPickupEnv
    ) {
      const slider = el;
      const paramId = slider.dataset.paramId;
      // Prevent duplicate assignment
      if (keyboardPickupEnv.targets.some((t) => t.slider === slider)) {
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

      keyboardPickupEnv.targets.push(target);
      attachModRing(target, synth, announce);
      slider.classList.add("modulated");
      announce?.(`Dropped ${keyboardPickupEnv.id} on ${paramId}`);
      // Clear pickup
      document
        .querySelectorAll(modEnvSourcesSelector)
        .forEach((el) => el.classList.remove("pickup-mode"));
      keyboardPickupEnv = null;
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
      for (const env of synth.uiModEnvs) {
        const before = env.targets.length;
        env.targets = env.targets.filter((t) => t.slider !== slider);
        const after = env.targets.length;
        if (before !== after) {
          slider.classList.remove("modulated");
          slider
            .closest(".range-knob-wrapper")
            ?.querySelector(".mod-ring")
            ?.remove();
          announce?.(`Removed env mod from ${slider.dataset.paramId}`);
        }
      }
    }
  }

  // Drag support (if you want, but you seem to have this already)
  document.querySelectorAll(modEnvSourcesSelector).forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.modEnvId);
    });
  });

  // Keyboard support for pickup/drop/removal
  document.querySelectorAll(modEnvSourcesSelector).forEach((el) => {
    el.addEventListener("keydown", (e) => {
      // 'P' for pick up / drag start
      if (e.key.toLowerCase() === "p" && !e.shiftKey) {
        e.preventDefault();
        handlePickDrop();
      } else if (e.key.toLowerCase() === "p" && e.shiftKey) {
        // Shift+P to remove
        e.preventDefault();
        handleRemoveMod();
      }
    });
  });

  document
    .querySelectorAll(`${containerSelector} input[type='range']`)
    .forEach((slider) => {
      slider.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p" && keyboardPickupEnv) {
          e.preventDefault();
          handlePickDrop();
        } else if (e.key.toLowerCase() === "p" && e.shiftKey) {
          e.preventDefault();
          handleRemoveMod();
        }
      });
    });

  // Optionally expose
  return {
    pickDrop: handlePickDrop,
    removeEnvModFromFocusedSlider: handleRemoveMod,
  };
}
