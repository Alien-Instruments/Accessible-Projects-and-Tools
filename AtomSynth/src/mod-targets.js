export const modTargets = [
  {
    category: "Oscillators",
    label: "Detune 1",
    key: "osc1.detune",
    defaultValue: 0,
    range: [-1200, 1200],
  },
  {
    category: "Oscillators",
    label: "Detune 2",
    key: "osc2.detune",
    defaultValue: 0,
    range: [-1200, 1200],
  },
  {
    category: "Filter",
    label: "Frequency",
    key: "filter.frequency",
    defaultValue: 1000,
    range: [20, 20000], // base value slider
  },
  {
    category: "Filter",
    label: "Resonance",
    key: "filter.Q",
    defaultValue: 1,
    range: [0.1, 20],
  },
  {
    category: "Filter Envelope",
    label: "Env Depth",
    key: "filterEnv.depth",
    defaultValue: 1.0,
    range: [0, 10],
  },
  {
    category: "Filter Envelope",
    label: "Attack",
    key: "filterEnv.attack",
    defaultValue: 0.1,
    range: [0, 4],
  },
  {
    category: "Filter Envelope",
    label: "Decay",
    key: "filterEnv.decay",
    defaultValue: 0.3,
    range: [0, 4],
  },
  {
    category: "Filter Envelope",
    label: "Sustain",
    key: "filterEnv.sustain",
    defaultValue: 0.4,
    range: [0, 1],
  },
  {
    category: "Filter Envelope",
    label: "Release",
    key: "filterEnv.release",
    defaultValue: 1.0,
    range: [0, 4],
  },
  {
    category: "Amp Envelope",
    label: "Attack",
    key: "synth.envelope.attack",
    defaultValue: 0.3,
    range: [0, 4],
  },
  {
    category: "Amp Envelope",
    label: "Decay",
    key: "synth.envelope.decay",
    defaultValue: 0.3,
    range: [0, 4],
  },
  {
    category: "Amp Envelope",
    label: "Sustain",
    key: "synth.envelope.sustain",
    defaultValue: 0.5,
    range: [0, 1],
  },
  {
    category: "Amp Envelope",
    label: "Release",
    key: "synth.envelope.release",
    defaultValue: 0.3,
    range: [0, 4],
  },
  {
    category: "Phaser",
    label: "Base Freq",
    key: "phaser.base",
    defaultValue: 200,
    range: [0.1, 2000],
  },
  {
    category: "Phaser",
    label: "Resonance",
    key: "phaser.q",
    defaultValue: 2,
    range: [0.1, 20],
  },
  {
    category: "Phaser",
    label: "Stages",
    key: "phaser.stage",
    defaultValue: 2,
    range: [2, 6],
  },
  {
    category: "Phaser",
    label: "Octaves",
    key: "phaser.oct",
    defaultValue: 2,
    range: [0, 6],
  },
  {
    category: "Phaser",
    label: "Rate",
    key: "phaser.rate",
    defaultValue: 0.5,
    range: [0.1, 40],
  },
  {
    category: "Phaser",
    label: "Wet",
    key: "phaser.wet",
    defaultValue: 0,
    range: [0, 1],
  },
  {
    category: "Pitch Shift",
    label: "Pitch",
    key: "pitchShift.shift",
    defaultValue: 0,
    range: [-12, 12],
  },
  {
    category: "Pitch Shift",
    label: "Window",
    key: "pitchShift.window",
    defaultValue: 0.1,
    range: [0.1, 0.5],
  },
  {
    category: "Pitch Shift",
    label: "Time",
    key: "pitchShift.time",
    defaultValue: 0.1,
    range: [0.1, 1.0],
  },
  {
    category: "Pitch Shift",
    label: "Feedback",
    key: "pitchShift.feedback",
    defaultValue: 0.1,
    range: [0.0, 0.9],
  },
  {
    category: "Pitch Shift",
    label: "Wet",
    key: "pitchShift.wet",
    defaultValue: 0,
    range: [0.0, 1.0],
  },
  {
    category: "Delay",
    label: "Time",
    key: "delay.time",
    defaultValue: 0.25,
    range: [0.05, 1.0],
  },
  {
    category: "Delay",
    label: "Feedback",
    key: "delay.feedback",
    defaultValue: 0.25,
    range: [0, 1],
  },
  {
    category: "Delay",
    label: "Wet",
    key: "delay.wet",
    defaultValue: 0,
    range: [0, 1],
  },
  {
    category: "Tremolo",
    label: "Depth",
    key: "trem.depth",
    defaultValue: 0,
    range: [0, 1],
  },
  {
    category: "Tremolo",
    label: "Rate",
    key: "trem.frequency",
    defaultValue: "0.5",
    range: [0.1, 20],
  },
  {
    category: "Tremolo",
    label: "Wet",
    key: "trem.wet",
    defaultValue: "0",
    range: [0, 1],
  },
  {
    category: "Auto Filter",
    label: "Base Freq",
    key: "auto.base",
    defaultValue: "500",
    range: [20, 2000],
  },
  {
    category: "Auto Filter",
    label: "Resonance",
    key: "auto.q",
    defaultValue: 0.5,
    range: [0.1, 20],
  },
  {
    category: "Auto Filter",
    label: "Octaves",
    key: "auto.oct",
    defaultValue: 2,
    range: [0, 6],
  },
  {
    category: "Auto Filter",
    label: "Depth",
    key: "auto.depth",
    defaultValue: 0,
    range: [0, 1],
  },
  {
    category: "Auto Filter",
    label: "Rate",
    key: "auto.rate",
    defaultValue: 0.5,
    range: [0.1, 40],
  },
  {
    category: "Auto Filter",
    label: "Wet",
    key: "auto.wet",
    defaultValue: 0.5,
    range: [0, 1],
  },
  {
    category: "Main",
    label: "Volume",
    key: "synth.volume",
    defaultValue: 0.5,
    range: [0, 1],
  },
];

export function getOrCreateCategory(container, categoryName) {
  let cat = container.querySelector(`[data-category="${categoryName}"]`);
  if (!cat) {
    // Create wrapper
    cat = document.createElement("div");
    cat.className = "mod-category";
    cat.dataset.category = categoryName;

    // Create heading
    const heading = document.createElement("h3");
    heading.className = "mod-category-heading";
    heading.setAttribute("tabindex", "0");
    heading.setAttribute("role", "button");
    heading.setAttribute("aria-expanded", "false");
    heading.innerText = `▶ ${categoryName}`;

    heading.style.cursor = "pointer";

    // Content container
    const content = document.createElement("div");
    content.className = "mod-category-content";
    content.style.display = "none";

    // --- Define toggleCategory BEFORE using it ---
    function toggleCategory() {
      const isVisible = content.style.display === "block";
      content.style.display = isVisible ? "none" : "block";
      heading.innerText = `${isVisible ? "▶" : "▼"} ${categoryName}`;
      heading.setAttribute("aria-expanded", String(!isVisible));
    }

    heading.addEventListener("click", toggleCategory);
    heading.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCategory();
      }
    });

    // Build DOM
    cat.appendChild(heading);
    cat.appendChild(content);
    container.appendChild(cat);
  }

  return cat.querySelector(".mod-category-content");
}

export function renderModTargets(container, targets) {
  targets.forEach(({ category, label, key, defaultValue, range }) => {
    const catContainer = getOrCreateCategory(container, category);
    createModUI(catContainer, label, key, defaultValue, range);
  });
}

export function createModUI(
  container,
  paramLabel,
  paramKey,
  defaultValue,
  range
) {
  // --- Wrapper for each parameter group ---
  const group = document.createElement("div");
  group.className = "mod-group";
  container.appendChild(group);

  // --- Base Value Row (label + slider + value) ---
  const baseRow = document.createElement("div");
  baseRow.className = "mod-row slider-container panel";
  // Label
  const baseLabel = document.createElement("label");
  baseLabel.innerText = paramLabel;
  baseLabel.setAttribute("for", `${paramKey}-base`);
  baseRow.appendChild(baseLabel);
  // Slider
  const baseInput = document.createElement("input");
  baseInput.type = "range";
  baseInput.id = `${paramKey}-base`;
  baseInput.min = range[0];
  baseInput.max = range[1];
  baseInput.step = (range[1] - range[0]) / 200;
  baseInput.value = defaultValue;
  baseRow.appendChild(baseInput);
  // Value span
  const baseValueSpan = document.createElement("span");
  baseValueSpan.id = `${paramKey}-base-value`;
  baseValueSpan.innerText = Number(defaultValue).toFixed(2);
  baseRow.appendChild(baseValueSpan);

  group.appendChild(baseRow);

  // --- Mod Depth Row (label + slider + value) ---
  const depthRow = document.createElement("div");
  depthRow.className = "mod-depth-slider-row slider-container panel";
  // Label
  const depthLabel = document.createElement("label");
  depthLabel.innerText = "Mod Depth";
  depthLabel.setAttribute("for", `${paramKey}-depth`);
  depthRow.appendChild(depthLabel);
  // Slider
  const depthInput = document.createElement("input");
  depthInput.type = "range";
  depthInput.id = `${paramKey}-depth`;
  depthInput.min = -1;
  depthInput.max = 1;
  depthInput.step = 0.01;
  depthInput.value = 1;
  depthRow.appendChild(depthInput);
  // Value span
  const depthValueSpan = document.createElement("span");
  depthValueSpan.id = `${paramKey}-depth-value`;
  depthValueSpan.innerText = "1.00";
  depthRow.appendChild(depthValueSpan);

  group.appendChild(depthRow);

  // --- Source Select Row (source dropdown and axis dropdown) ---
  const sourceRow = document.createElement("div");
  sourceRow.className = "mod-source-row";
  const sourceSelect = document.createElement("select");
  sourceSelect.id = `${paramKey}-source`;
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.text = "None";
  sourceSelect.appendChild(noneOption);
  sourceRow.appendChild(sourceSelect);

  // Axis select
  const axisSelect = document.createElement("select");
  axisSelect.id = `${paramKey}-axis`;
  ["x", "y", "z"].forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.text = a.toUpperCase();
    axisSelect.appendChild(opt);
  });
  sourceRow.appendChild(axisSelect);

  group.appendChild(sourceRow);

  // --- Current Value Row (label + value) ---
  const currentRow = document.createElement("div");
  currentRow.className = "mod-current-row";
  const modValueLabel = document.createElement("label");
  modValueLabel.innerText = "Current:";
  modValueLabel.setAttribute("for", `${paramKey}-base`);
  currentRow.appendChild(modValueLabel);
  const modValueSpan = document.createElement("span");
  modValueSpan.id = `${paramKey}-current`;
  modValueSpan.innerText = Number(defaultValue).toFixed(2);
  currentRow.appendChild(modValueSpan);
  group.appendChild(currentRow);

  // --- Listeners to update displayed values ---
  baseInput.addEventListener("input", () => {
    baseValueSpan.innerText = Number(baseInput.value).toFixed(2);
  });
  depthInput.addEventListener("input", () => {
    depthValueSpan.innerText = Number(depthInput.value).toFixed(2);
  });
}
