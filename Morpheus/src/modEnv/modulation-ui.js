import { getSynthParams } from "../UI/params.js";

// Helper to build a stylable amount slider
function createAmountSlider(id, labelText, initial = 1) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-container";
  wrapper.style.display = "inline-flex";
  wrapper.style.alignItems = "center";
  wrapper.style.marginLeft = "10px";

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;
  label.style.marginRight = "4px";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = id;
  slider.min = 0;
  slider.max = 2;
  slider.step = 0.01;
  slider.value = initial;
  slider.className = "mod-amount-slider slider-hotkeys";
  slider.style.marginRight = "8px";

  const valueSpan = document.createElement("span");
  valueSpan.textContent = initial.toFixed(2);
  valueSpan.className = "lcd-text";

  slider.addEventListener("input", (e) => {
    valueSpan.textContent = parseFloat(e.target.value).toFixed(2);
  });

  const currentDesign = localStorage.getItem("selectedKnobDesign") || "classic";
  $(wrapper).removeClass(
    "classic minimal fancy retro modern twist flat shadow outline simple"
  );
  $(wrapper).addClass(currentDesign);

  wrapper.appendChild(label);
  wrapper.appendChild(slider);
  wrapper.appendChild(valueSpan);
  return { wrapper, slider };
}

// Main exported setup function
export function setupModulationUI({
  synth,
  audioContext,
  isModulatingRef,
  containerId = "mod-ui",
}) {
  let modWheelDestId = null;
  let modWheelAmount = 1.0;
  let aftertouchDestId = null;
  let aftertouchAmount = 1.0;
  let releaseVelDestId = null;
  let releaseVelAmount = 1.0;

  const params = getSynthParams(synth, audioContext);

  // --- Mod Wheel UI ---
  const modWheelContainer = document.createElement("div");
  modWheelContainer.className = "mod-src-block";

  const modDestSelect = document.createElement("select");
  modDestSelect.id = "modwheel-dest-select";
  modDestSelect.className = "lcd-select";
  modDestSelect.innerHTML = `<option value="">Mod Wheel Destination</option>`;
  params
    .filter((p) => ["slider", "range"].includes(p.type))
    .forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.group
        ? `${p.group}: ${p.label || p.id}`
        : p.label || p.id;
      modDestSelect.appendChild(opt);
    });
  modDestSelect.addEventListener("change", (e) => {
    modWheelDestId = e.target.value;
  });
  modWheelContainer.appendChild(modDestSelect);

  const { wrapper: modWheelAmountWrap, slider: modWheelSlider } =
    createAmountSlider("modwheel-amount", "Amount", modWheelAmount);
  modWheelSlider.addEventListener("input", (e) => {
    modWheelAmount = parseFloat(e.target.value);
  });
  modWheelContainer.appendChild(modWheelAmountWrap);

  // --- Aftertouch UI ---
  const aftertouchContainer = document.createElement("div");
  aftertouchContainer.className = "mod-src-block";

  const aftertouchDestSelect = document.createElement("select");
  aftertouchDestSelect.id = "aftertouch-dest-select";
  aftertouchDestSelect.className = "lcd-select";
  aftertouchDestSelect.style.marginLeft = "0";
  aftertouchDestSelect.innerHTML = `<option value="">Aftertouch Destination</option>`;
  params
    .filter((p) => ["slider", "range"].includes(p.type))
    .forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.group
        ? `${p.group}: ${p.label || p.id}`
        : p.label || p.id;
      aftertouchDestSelect.appendChild(opt);
    });
  aftertouchDestSelect.addEventListener("change", (e) => {
    aftertouchDestId = e.target.value;
  });
  aftertouchContainer.appendChild(aftertouchDestSelect);

  const { wrapper: aftertouchAmountWrap, slider: aftertouchSlider } =
    createAmountSlider("aftertouch-amount", "Amount", aftertouchAmount);
  aftertouchSlider.addEventListener("input", (e) => {
    aftertouchAmount = parseFloat(e.target.value);
  });
  aftertouchContainer.appendChild(aftertouchAmountWrap);

  // --- Add to UI ---
  const parent = document.getElementById(containerId);
  parent.appendChild(modWheelContainer);
  parent.appendChild(aftertouchContainer);

  // --- Release Velocity UI ---
  const releaseVelContainer = document.createElement("div");
  releaseVelContainer.className = "mod-src-block";

  const releaseVelDestSelect = document.createElement("select");
  releaseVelDestSelect.id = "releasevel-dest-select";
  releaseVelDestSelect.className = "lcd-select";
  releaseVelDestSelect.innerHTML = `<option value="">Release Velocity Destination</option>`;
  params
    .filter((p) => ["slider", "range"].includes(p.type))
    .forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.group
        ? `${p.group}: ${p.label || p.id}`
        : p.label || p.id;
      releaseVelDestSelect.appendChild(opt);
    });
  releaseVelDestSelect.addEventListener("change", (e) => {
    releaseVelDestId = e.target.value;
  });
  releaseVelContainer.appendChild(releaseVelDestSelect);

  const { wrapper: releaseVelAmountWrap, slider: releaseVelSlider } =
    createAmountSlider("releasevel-amount", "Amount", releaseVelAmount);
  releaseVelSlider.addEventListener("input", (e) => {
    releaseVelAmount = parseFloat(e.target.value);
  });
  releaseVelContainer.appendChild(releaseVelAmountWrap);

  parent.appendChild(releaseVelContainer);

  // --- Handlers for synth ---
  synth.setModWheel = (value) => {
    if (!modWheelDestId) return;
    const params = getSynthParams(synth, audioContext);
    const targetParam = params.find((p) => p.id === modWheelDestId);
    if (!targetParam) return;
    if (targetParam.type === "slider" || targetParam.type === "range") {
      const min = parseFloat(targetParam.min ?? 0);
      const max = parseFloat(targetParam.max ?? 1);
      const modded = min + (max - min) * value * modWheelAmount;
      targetParam.apply(modded);

      const input = document.getElementById(targetParam.id);
      if (input) {
        input.value = modded;
        input.dispatchEvent(new Event("input"));
      }
    }
  };

  const activeModulation = {};

  synth.setAftertouch = (value) => {
    if (!aftertouchDestId) return;
    const params = getSynthParams(synth, audioContext);
    const targetParam = params.find((p) => p.id === aftertouchDestId);
    if (!targetParam) return;
    const input = document.getElementById(targetParam.id);

    // Only store the "pre-mod value" the moment we start modulating
    if (value !== 0 && !activeModulation[targetParam.id]) {
      activeModulation[targetParam.id] = input
        ? parseFloat(input.value)
        : parseFloat(targetParam.value);
    }

    const min = parseFloat(targetParam.min ?? 0);
    const max = parseFloat(targetParam.max ?? 1);
    const range = max - min;
    const base =
      activeModulation[targetParam.id] ??
      (input ? parseFloat(input.value) : parseFloat(targetParam.value));
    const modded = base + value * aftertouchAmount * range * 0.5;

    const clamped = Math.max(min, Math.min(max, modded));
    isModulatingRef.value = true;
    targetParam.apply(clamped);
    if (input) {
      input.value = clamped;
      input.dispatchEvent(new Event("input"));
    }
    isModulatingRef.value = false;

    // On return to zero, restore to *current* slider value (not cached)
    if (value === 0) {
      const restoreValue = input
        ? parseFloat(input.value)
        : parseFloat(targetParam.value);
      targetParam.apply(restoreValue);
      if (input) {
        input.value = restoreValue;
        input.dispatchEvent(new Event("input"));
      }
      delete activeModulation[targetParam.id];
    }
  };

  synth.setReleaseVelocity = (value) => {
    if (!releaseVelDestId) return;
    const params = getSynthParams(synth, audioContext);
    const targetParam = params.find((p) => p.id === releaseVelDestId);
    if (!targetParam) return;
    const input = document.getElementById(targetParam.id);

    const min = parseFloat(targetParam.min ?? 0);
    const max = parseFloat(targetParam.max ?? 1);
    const range = max - min;

    // Always use the *current knob* as base, never a modulated value!
    let base = input ? parseFloat(input.value) : parseFloat(targetParam.value);

    // Calculate modulation amount, but do NOT set it into the UI slider!
    const modded = base + value * releaseVelAmount * range * 0.5;
    const clamped = Math.max(min, Math.min(max, modded));
    isModulatingRef.value = true;
    targetParam.apply(clamped);
    isModulatingRef.value = false;
    if (value === 0 && input) {
      isModulatingRef.value = true;
      targetParam.apply(parseFloat(input.value));
      isModulatingRef.value = false;
    }
  };
}
