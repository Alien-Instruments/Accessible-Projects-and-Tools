/**
 * Inject UI into a container element
 * @param {HTMLElement} container
 * @param {Object} callbacks - functions for handling UI changes
 */

import { baseParamValues, isModulating } from "./main.js";

export function buildSynthUI(bindings, containerId = "synth") {
  const container = document.getElementById(containerId);
  if (!container) return;
  // Group parameters by category → group
  const categorized = {};
  bindings.forEach((b) => {
    const cat = b.category || "Uncategorized";
    const grp = b.group || "General";
    if (!categorized[cat]) categorized[cat] = {};
    if (!categorized[cat][grp]) categorized[cat][grp] = [];
    categorized[cat][grp].push(b);
  });

  Object.entries(categorized).forEach(([categoryName, groups]) => {
    const categorySection = document.createElement("div");
    categorySection.className = `category ${categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")} panel`;

    Object.entries(groups).forEach(([groupName, params]) => {
      const groupWrapper = document.createElement("div");
      const classSafeGroup = groupName.toLowerCase().replace(/\s+/g, "-");
      groupWrapper.className = `group ${classSafeGroup}`;
      groupWrapper.className = `panel`;
      groupWrapper.style.padding = "10px";
      const title = document.createElement("div");
      title.className = "fx-title lcd-green";
      title.textContent = groupName;
      groupWrapper.appendChild(title);

      const knobRow = document.createElement("div");
      knobRow.className = "knob-row";

      params.forEach((binding) => {
        let control;
        switch (binding.type) {
          case "select":
            control = buildSelect(binding);
            break;
          case "checkbox":
            control = buildToggleButton(binding);
            break;
          case "lfo-source":
            control = buildLfoSource(binding);
            break;
          default:
            control = buildSlider(binding);
        }
        knobRow.appendChild(control);
      });

      groupWrapper.appendChild(knobRow);
      categorySection.appendChild(groupWrapper);
    });

    container.appendChild(categorySection);
  });

  if (typeof $ !== "undefined" && $.fn.rangeKnob) {
    $("input[type='range']").each(function () {
      $(this).closest(".range-knob-wrapper").rangeKnob();
    });
  }
}

function buildLfoSource(binding) {
  const el = document.createElement("div");
  el.className = "lfo-source";
  el.setAttribute("tabindex", "0");
  el.setAttribute("draggable", "true");
  el.setAttribute("role", "region");
  el.setAttribute(
    "aria-label",
    `LFO source: ${binding.label}. Press P to select for drag and drop.`
  );
  el.dataset.lfoId = binding.id;
  el.innerHTML = `
  <strong aria-hidden="true">${binding.label}</strong>
  <div class="lfo-hint" aria-hidden="true">Drag</div>
`;

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", el.dataset.lfoId);
  });
  return el;
}

function buildSlider(binding) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-div";

  const label = document.createElement("label");
  label.setAttribute("for", binding.id);
  label.textContent = binding.label;
  wrapper.appendChild(label);

  const rangeWrapper = document.createElement("div");
  rangeWrapper.className = "range-knob-wrapper";

  const input = document.createElement("input");
  input.type = "range";
  input.id = binding.id;
  input.min = binding.min;
  input.max = binding.max;
  input.step = binding.step;
  input.value = binding.value;
  input.dataset.paramId = binding.id;

  input.setAttribute("aria-label", `${binding.group} ${binding.label}`);

  const knob = document.createElement("div");
  knob.className = "range-knob";

  rangeWrapper.appendChild(input);
  rangeWrapper.appendChild(knob);
  wrapper.appendChild(rangeWrapper);

  const valueDisplay = document.createElement("span");
  valueDisplay.className = "lcd-text";
  valueDisplay.id = `${binding.id}-value`;
  valueDisplay.textContent = parseFloat(binding.value).toFixed(2);

  wrapper.appendChild(valueDisplay);

  // Store initial value
  baseParamValues[binding.id] = parseFloat(binding.value);

  input.addEventListener("input", () => {
    const val = parseFloat(input.value);
    valueDisplay.textContent = val.toFixed(2);
    binding.apply?.(val);

    // Only update base if not modulating (i.e., if user moved the slider)
    if (!isModulating) {
      baseParamValues[binding.id] = val;
    }
  });

  return wrapper;
}

function buildSelect(binding) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-div";

  const label = document.createElement("label");
  label.setAttribute("for", binding.id);
  label.textContent = binding.label;
  wrapper.appendChild(label);

  const selectWrapper = document.createElement("div");
  selectWrapper.className = "select-wrapper";

  const select = document.createElement("select");
  select.id = binding.id;
  select.className = "lcd-select";
  select.setAttribute("aria-label", `${binding.group} ${binding.label}`);
  binding.options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });

  select.value = String(binding.value); // ensure matching by string
  select.addEventListener("input", () => {
    binding.apply?.(select.value);
  });

  selectWrapper.appendChild(select);
  wrapper.appendChild(selectWrapper);

  return wrapper;
}

function buildToggleButton(binding) {
  const wrapper = document.createElement("div");
  wrapper.className = "slider-div";

  const label = document.createElement("label");
  label.setAttribute("for", binding.id);
  label.textContent = binding.label;
  wrapper.appendChild(label);

  const [offLabel = "OFF", onLabel = "ON"] = binding.toggleLabels || [];

  const button = document.createElement("button");
  button.id = binding.id;
  const isOn = Boolean(binding.value);
  button.setAttribute("aria-pressed", isOn);
  button.className = "lcd-button";
  button.textContent = isOn ? onLabel : offLabel;

  // Initial ARIA label includes the current state
  const updateAriaLabel = (state) => {
    button.setAttribute(
      "aria-label",
      `${binding.label} ${state ? onLabel : offLabel}`
    );
  };
  updateAriaLabel(isOn);

  button.addEventListener("click", () => {
    const newValue = !JSON.parse(button.getAttribute("aria-pressed"));
    button.setAttribute("aria-pressed", newValue);
    button.textContent = newValue ? onLabel : offLabel;
    updateAriaLabel(newValue);
    binding.apply?.(newValue);
  });

  wrapper.appendChild(button);
  return wrapper;
}
