import { SCALES, OCTAVES } from "./utils.js";

export const particlePanelConfig = [
  {
    type: "label",
    label: "Particle & Forces",
    className: "panel-title",
  },
  {
    type: "button-row",
    buttons: [
      { id: "add-particle-electron", text: "Add Electron" },
      { id: "add-particle-proton", text: "Add Proton" },
      { id: "add-particle-neutron", text: "Add Neutron" },
    ],
  },
  {
    category: "Colours",
    type: "color",
    label: "Proton Color",
    id: "proton-color-picker",
    value: "#ff0000",
  },
  {
    category: "Colours",
    type: "color",
    label: "Neutron Color",
    id: "neutron-color-picker",
    value: "#0000ff",
  },
  {
    category: "Colours",
    type: "color",
    label: "Electron Color",
    id: "electron-color-picker",
    value: "#00ffff",
  },
  {
    category: "Forces",
    type: "select",
    label: "Force Type",
    id: "particle-movement-type",
    options: [
      { value: "random", text: "Random" },
      { value: "pulsate", text: "Pulsate" },
      { value: "continuous", text: "Continuous" },
      { value: "oscillate", text: "Oscillate" },
      { value: "spiral", text: "Spiral" },
      { value: "burst", text: "Burst" },
      { value: "vortex", text: "Vortex" },
      { value: "orbit", text: "Orbit" },
      { value: "gravity-plane", text: "Gravity Plane" },
      { value: "drift", text: "Drift" },
      { value: "spring", text: "Spring" },
      { value: "wave", text: "Wave" },
      { value: "updraft", text: "Updraft" },
      { value: "wind", text: "Wind" },
      { value: "black-hole", text: "Black Hole" },
      { value: "centrifuge", text: "Centrifuge" },
      { value: "sinkhole", text: "Sinkhole" },
      { value: "zigzag", text: "Zigzag" },
      { value: "polarize", text: "Polarize" },
      { value: "swirl-noise", text: "Swirl Noise" },
      { value: "jitter", text: "Jitter" },
      { value: "tornado", text: "Tornado" },
    ],
  },
  {
    category: "Forces",
    type: "slider",
    label: "Movement Speed",
    id: "particle-movement-speed",
    min: 0,
    max: 10,
    value: 0.5,
    step: 0.01,
  },
  {
    category: "Forces",
    type: "slider",
    label: "Force Amount",
    id: "particle-force-slider",
    min: 1,
    max: 40,
    value: 15,
    step: 1,
  },
  {
    category: "Influences",
    type: "select",
    label: "Force Influence",
    id: "force-influence-select",
    options: [
      { value: "electrostatic", text: "Electrostatic" },
      { value: "magnetic", text: "Magnetic Field" },
      { value: "electric", text: "Electric Field" },
      { value: "brownian", text: "Brownian Motion" },
      { value: "attractor", text: "Attractor" },
      { value: "lfo", text: "LFO Modulation" },
      { value: "orbital", text: "Orbital Torque" },
    ],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Magnetic Field Strength",
    id: "magnetic-field-slider",
    min: 0,
    max: 10,
    value: 2.5,
    step: 0.1,
    forceTypes: ["magnetic"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Thermal Energy",
    id: "thermal-energy-slider",
    min: 0,
    max: 10,
    value: 1,
    step: 0.1,
    forceTypes: ["brownian"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Repulsion Force",
    id: "particle-repelling-slider",
    min: 0,
    max: 60,
    value: 15,
    step: 1,
    forceTypes: ["electrostatic"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Repulsion Time (ms)",
    id: "particle-repulsion-time",
    min: 100,
    max: 5000,
    value: 1000,
    step: 50,
    forceTypes: ["electrostatic"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Attraction Force",
    id: "particle-attraction-force",
    min: 1,
    max: 60,
    value: 15,
    step: 1,
    forceTypes: ["electrostatic"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Attraction Time (ms)",
    id: "particle-attraction-time",
    min: 100,
    max: 5000,
    value: 1000,
    step: 50,
    forceTypes: ["electrostatic"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Electric Field Strength",
    id: "electric-field-strength-slider",
    min: 0,
    max: 10,
    value: 1,
    step: 0.1,
    forceTypes: ["electric"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Electric Field X",
    id: "electric-field-x-slider",
    min: -1,
    max: 1,
    value: 1,
    step: 0.01,
    forceTypes: ["electric"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Electric Field Y",
    id: "electric-field-y-slider",
    min: -1,
    max: 1,
    value: 0,
    step: 0.01,
    forceTypes: ["electric"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Electric Field Z",
    id: "electric-field-z-slider",
    min: -1,
    max: 1,
    value: 0,
    step: 0.01,
    forceTypes: ["electric"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Attractor Force",
    id: "attractor-force-slider",
    min: 0,
    max: 50,
    value: 10,
    step: 0.1,
    forceTypes: ["attractor"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "LFO Frequency",
    id: "lfo-frequency-slider",
    min: 0.01,
    max: 10,
    value: 0.2,
    step: 0.01,
    forceTypes: ["lfo"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "LFO Amplitude",
    id: "lfo-amplitude-slider",
    min: 0,
    max: 50,
    value: 10,
    step: 0.1,
    forceTypes: ["lfo"],
  },
  {
    category: "Influences",
    type: "slider",
    label: "Orbital Torque",
    id: "orbital-torque-slider",
    min: 0,
    max: 20,
    value: 1,
    step: 0.1,
    forceTypes: ["orbital"],
  },

  {
    category: "Distance",
    type: "button-row",
    buttons: [{ id: "apply-particle-impulse", text: "Apply Impulse" }],
  },
  {
    category: "Distance",
    type: "slider",
    label: "Distance Constraint",
    id: "particle-distance-constraint",
    min: 0.5,
    max: 5,
    value: 2.5,
    step: 0.1,
  },
  {
    category: "Notes",
    type: "select",
    label: "Key",
    id: "note-key-select",
    options: [
      { value: "C", text: "C" },
      { value: "C#", text: "C#" },
      { value: "D", text: "D" },
      { value: "D#", text: "D#" },
      { value: "E", text: "E" },
      { value: "F", text: "F" },
      { value: "F#", text: "F#" },
      { value: "G", text: "G" },
      { value: "G#", text: "G#" },
      { value: "A", text: "A" },
      { value: "A#", text: "A#" },
      { value: "B", text: "B" },
    ],
  },
  {
    category: "Notes",
    type: "select",
    label: "Scale",
    id: "note-scale-select",
    options: Object.keys(SCALES).map((name) => ({ value: name, text: name })),
  },
  {
    category: "Notes",
    type: "select",
    label: "Base Octave",
    id: "note-base-octave-select",
    options: OCTAVES.map((oct) => ({ value: oct, text: `Octave ${oct}` })),
  },
  {
    category: "Notes",
    type: "slider",
    label: "Octave Range",
    id: "note-octave-range-slider",
    min: 1,
    max: 5,
    value: 2,
    step: 1,
  },
  {
    category: "Notes",
    type: "select",
    label: "Chord Mode",
    id: "chord-mode-select",
    options: [
      { value: "off", text: "Single Note" },
      { value: "major", text: "Major Triad" },
      { value: "minor", text: "Minor Triad" },
      { value: "sus2", text: "Sus2" },
      { value: "sus4", text: "Sus4" },
      { value: "maj7", text: "Maj7" },
      { value: "min7", text: "Min7" },
    ],
  },
  {
    category: "Notes",
    type: "select",
    label: "Legato Mode",
    id: "legato-mode-select",
    options: [
      { value: "off", text: "Off (Poly)" },
      { value: "on", text: "On (Mono/Legato)" },
    ],
  },
  {
    category: "Notes",
    type: "slider",
    label: "Note Length (ms)",
    id: "note-length-slider",
    min: 50,
    max: 2000,
    value: 400,
    step: 10,
  },
  {
    category: "Notes",
    type: "slider",
    label: "Note Interval (ms)",
    id: "note-interval-slider",
    min: 100,
    max: 2000,
    value: 1000,
    step: 10,
  },
  {
    category: "Notes",
    type: "slider",
    label: "Glide (ms)",
    id: "note-glide-slider",
    min: 0,
    max: 1000,
    value: 0,
    step: 10,
  },
  {
    category: "Notes",
    type: "checkbox",
    label: "Randomise Note Length",
    id: "randomize-note-length",
    value: false,
  },
  {
    category: "Notes",
    type: "checkbox",
    label: "Randomise Note Interval",
    id: "randomize-note-interval",
    value: false,
  },
];

function getOrCreateCategory(container, categoryName) {
  let wrapper = container.querySelector(`[data-category="${categoryName}"]`);
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "panel-category";
    wrapper.dataset.category = categoryName;

    const heading = document.createElement("h3");
    heading.className = "panel-category-heading";
    heading.innerText = `▶ ${categoryName}`;
    heading.setAttribute("tabindex", "0");
    heading.setAttribute("role", "button");
    heading.setAttribute("aria-expanded", "false");
    heading.style.cursor = "pointer";
    const content = document.createElement("div");
    content.className = "panel-category-content";
    content.style.display = "none";

    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    function toggle() {
      const visible = content.style.display === "block";
      content.style.display = visible ? "none" : "block";
      heading.innerText = `${visible ? "▶" : "▼"} ${categoryName}`;
      heading.setAttribute("aria-expanded", String(!visible));
    }

    wrapper.appendChild(heading);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
  }
  return wrapper.querySelector(".panel-category-content");
}

export function createParticleControlPanel(container, config) {
  config.forEach((ctrl) => {
    const parent =
      ctrl.category != null
        ? getOrCreateCategory(container, ctrl.category)
        : container;
    if (ctrl.type === "label") {
      const label = document.createElement("div");
      label.innerText = ctrl.label;
      label.setAttribute("for", ctrl.id);
      label.className = ctrl.className || "";
      container.appendChild(label);
    }
    if (ctrl.type === "select") {
      const wrapper = document.createElement("div");
      wrapper.className = "mod-group";
      const label = document.createElement("label");
      label.innerText = ctrl.label;
      label.setAttribute("for", ctrl.id);
      wrapper.appendChild(label);
      const select = document.createElement("select");
      select.id = ctrl.id;
      ctrl.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.text = opt.text;
        select.appendChild(option);
      });
      wrapper.appendChild(select);
      parent.appendChild(wrapper);
    }
    if (ctrl.type === "slider") {
      const wrapper = document.createElement("div");
      wrapper.className = "mod-row slider-container panel";
      const label = document.createElement("label");
      label.innerText = ctrl.label;
      label.setAttribute("for", ctrl.id);
      wrapper.appendChild(label);
      const input = document.createElement("input");
      if (ctrl.forceTypes) {
        input.classList.add("force-slider");
        ctrl.forceTypes.forEach((type) =>
          input.classList.add(`force-type-${type}`)
        );
      }
      input.type = "range";
      input.id = ctrl.id;
      input.min = ctrl.min;
      input.max = ctrl.max;
      input.value = ctrl.value;
      input.step = ctrl.step || 1;
      wrapper.appendChild(input);
      const valueSpan = document.createElement("span");
      valueSpan.id = ctrl.id + "-value";
      valueSpan.innerText = ctrl.value;
      input.addEventListener("input", () => {
        valueSpan.innerText = input.value;
      });
      wrapper.appendChild(valueSpan);
      parent.appendChild(wrapper);
    }
    if (ctrl.type === "button-row") {
      const row = document.createElement("div");
      row.style.margin = "12px 0";
      ctrl.buttons.forEach((btnDef) => {
        const btn = document.createElement("button");
        btn.id = btnDef.id;
        btn.innerText = btnDef.text;
        btn.style.marginRight = "5px";
        row.appendChild(btn);
      });
      parent.appendChild(row);
    }
    if (ctrl.type === "color") {
      const wrapper = document.createElement("div");
      wrapper.className = ctrl.className || "colour-div";
      const label = document.createElement("label");
      label.innerText = ctrl.label;
      label.setAttribute("for", ctrl.id);
      wrapper.appendChild(label);

      const input = document.createElement("input");
      input.type = "color";
      input.id = ctrl.id;
      input.value = ctrl.value;
      input.style.marginLeft = "8px";
      wrapper.appendChild(input);

      parent.appendChild(wrapper);
    }
    if (ctrl.type === "checkbox") {
      const wrapper = document.createElement("div");

      const label = document.createElement("label");
      label.className = "checkbox-container"; // Apply the container class

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = ctrl.id;
      input.className = "checkbox-input"; // Apply input class
      input.checked = ctrl.value || false;

      const span = document.createElement("span");
      span.className = "checkbox-button"; // Style span
      span.textContent = ctrl.label; // Add label text

      label.appendChild(input);
      label.appendChild(span);
      wrapper.appendChild(label);

      parent.appendChild(wrapper);
    }
  });
}
