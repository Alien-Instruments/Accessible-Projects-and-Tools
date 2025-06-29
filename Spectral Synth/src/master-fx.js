import { loadScript } from "./utils/loadScript.js";
import { audioCtx } from "./audioCtx.js";
import { activateMIDILearnFor } from "./midi-learn.js";

await loadScript("src/tuna.js");

export const tuna = new Tuna(audioCtx);
export const fxInput = audioCtx.createGain();
let sourceNode = fxInput;
let inputDirectToOutput = true;

// Expose connect function
export function connectToFXChain(audioNode) {
  audioNode.connect(fxInput);
}

const fxBankDiv = document.getElementById("fx-bank");
const fxChainDiv = document.getElementById("fx-chain");
let fxChain = []; // [{name, className, params, node, guiDiv}, ...]
let keyboardPickupFX = null; // idx of picked-up block

const FX_LIST = [
  {
    name: "Chorus",
    className: "Chorus",
    params: {
      rate: 1.5,
      depth: 0.7,
      feedback: 0.5,
      delay: 0.0045,
      wetLevel: 0.5,
      dryLevel: 0.5,
      stereoPhase: 90,
    },
  },
  {
    name: "Phaser",
    className: "Phaser",
    params: {
      rate: 0.1,
      depth: 0.5,
      feedback: 0.7,
      stereoPhase: 40,
      baseModulationFrequency: 700,
    },
  },
  {
    name: "Delay",
    className: "Delay",
    params: { delayTime: 100, feedback: 0.5, cutoff: 20000, wetLevel: 1 },
  },
  {
    name: "Distortion",
    className: "Distortion",
    params: { curveAmount: 400, drive: 1 },
  },
  {
    name: "Mutator",
    className: "MutatorFilter",
    params: {
      bitDepth: 8,
      reduction: 0.25,
      distortionAmount: 20,
      distortionType: "soft",
      filterType: "lowpass",
      cutoff: 400,
      resonance: 1.0,
      envelopeDepth: 2.0,
      lfoRate: 0.5,
      lfoDepth: 0.0,
      attack: 0.1,
      release: 0.2,
    },
  },
  {
    name: "RingMod",
    className: "RingModulator",
    params: { modFrequency: 30, modDepth: 1 },
  },
  {
    name: "Morphing Filter",
    className: "MorphingFilter",
    params: {
      typeA: "lowpass",
      typeB: "highpass",
      freqA: 400,
      freqB: 4000,
      resonanceA: 2.2,
      resonanceB: 1.5,
      outputGain: 0.8,
      morph: 0.35,
      lfoFrequency: 0.2,
      lfoDepth: 0.5,
    },
  },
  {
    name: "EQ3",
    className: "EQ3Band",
    params: {
      lowGain: 0,
      midGain: 0,
      highGain: 0,
      lowFreq: 100,
      midFreq: 1000,
      midRes: 0,
      highFreq: 5000,
    },
  },
  {
    name: "Compressor",
    className: "Compressor",
    params: {
      threshold: -20,
      attack: 1,
      release: 250,
      makeupGain: 1,
      ratio: 4,
      knee: 5,
    },
  },
  {
    name: "DualFilter",
    className: "DualFilter",
    params: {
      typeA: "lowpass",
      freqA: 300,
      qA: 1,
      typeB: "lowpass",
      freqB: 500,
      qB: 1,
      serialRouting: true,
    },
  },
  {
    name: "AutoPanner",
    className: "ModulatedStereoPanner",
    params: {
      pan: 0,
      rate: 2,
      depth: 0,
    },
  },
];

// --- Output ---
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

// For output meter
const analyser = audioCtx.createAnalyser();
masterGain.connect(analyser);

// --- GUI: Bank of FX blocks ---
FX_LIST.forEach((fx) => {
  const fxEl = document.createElement("div");
  fxEl.tabIndex = "0";
  fxEl.className = "fx-block";
  fxEl.textContent = fx.name;
  fxEl.draggable = true;
  fxEl.dataset.fx = fx.className;
  fxBankDiv.appendChild(fxEl);
});

updateAudioRouting();

function preventParentDragOnInput(input) {
  input.addEventListener("mousedown", lockBlockDrag);
  input.addEventListener("mouseup", unlockBlockDrag);
  input.addEventListener("mouseleave", unlockBlockDrag);
  input.addEventListener("touchstart", lockBlockDrag);
  input.addEventListener("touchend", unlockBlockDrag);
  function lockBlockDrag(e) {
    let block = e.target.closest(".fx-block");
    if (block) block.draggable = false;
  }
  function unlockBlockDrag(e) {
    let block = e.target.closest(".fx-block");
    if (block) block.draggable = true;
  }
}

function createFXBlockDiv(fxObj, idx) {
  const fxDiv = document.createElement("div");
  fxDiv.className = "fx-block panel";
  fxDiv.draggable = true;
  const titleDiv = document.createElement("div");
  titleDiv.className = "fx-block-title";
  titleDiv.textContent = fxObj.name;
  fxDiv.appendChild(titleDiv);
  fxDiv.dataset.idx = idx;
  fxDiv.dataset.fx = fxObj.className;
  fxDiv.tabIndex = 0;

  if (fxObj.className === "Phaser") {
    const PHASER_PARAMS = [
      {
        param: "rate",
        label: "Rate",
        min: 0.01,
        max: 8,
        step: 0.01,
        default: 0.1,
      },
      {
        param: "depth",
        label: "Depth",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "feedback",
        label: "Feedback",
        min: 0,
        max: 0.9,
        step: 0.01,
        default: 0.7,
      },
      {
        param: "stereo Phase",
        label: "Stereo Phase",
        min: 0,
        max: 180,
        step: 1,
        default: 40,
      },
      {
        param: "baseModulationFrequency",
        label: "Base Freq",
        min: 20,
        max: 2000,
        step: 1,
        default: 700,
      },
    ];
    PHASER_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });

      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  if (fxObj.className === "Delay") {
    const DELAY_PARAMS = [
      {
        param: "delayTime",
        label: "Delay (ms)",
        min: 1,
        max: 2000,
        step: 1,
        default: 100,
      },
      {
        param: "feedback",
        label: "Feedback",
        min: 0,
        max: 0.9,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "cutoff",
        label: "Cutoff",
        min: 100,
        max: 20000,
        step: 1,
        default: 20000,
      },
      {
        param: "wetLevel",
        label: "Wet Level",
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
      },
    ];
    DELAY_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  if (fxObj.className === "Chorus") {
    const CHORUS_PARAMS = [
      {
        param: "rate",
        label: "Rate (Hz)",
        min: 0.01,
        max: 8,
        step: 0.01,
        default: 1.5,
      },
      {
        param: "depth",
        label: "Depth",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.7,
      },
      {
        param: "feedback",
        label: "Feedback",
        min: 0,
        max: 0.9,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "delay",
        label: "Delay (s)",
        min: 0,
        max: 0.1,
        step: 0.0001,
        default: 0.0045,
      },
      {
        param: "wetLevel",
        label: "Wet Level",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "dryLevel",
        label: "Dry Level",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "stereoPhase",
        label: "Stereo Phase",
        min: 0,
        max: 180,
        step: 1,
        default: 90,
      },
    ];
    CHORUS_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }

  if (fxObj.className === "Distortion") {
    const DIST_PARAMS = [
      {
        param: "drive",
        label: "Drive",
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
      },
      {
        param: "curveAmount",
        label: "Curve",
        min: 0,
        max: 1000,
        step: 1,
        default: 400,
      },
    ];
    DIST_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;
      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }

  if (fxObj.className === "ModulatedStereoPanner") {
    const PANER_PARAMS = [
      {
        param: "pan",
        label: "Direction",
        min: -1,
        max: 1,
        step: 0.01,
        default: 0,
      },
      {
        param: "rate",
        label: "Rate",
        min: 0.1,
        max: 10,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "depth",
        label: "Depth",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0,
      },
    ];
    PANER_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  const mutatorParams = [
    {
      name: "bitDepth",
      label: "Bit Depth",
      min: 1,
      max: 16,
      step: 1,
      type: "slider",
    },
    {
      name: "reduction",
      label: "Reduction",
      min: 0.01,
      max: 1,
      step: 0.01,
      type: "slider",
    },
    {
      name: "distortionAmount",
      label: "Distortion",
      min: 10,
      max: 100,
      step: 1,
      type: "slider",
    },
    {
      name: "distortionType",
      label: "Distortion Type",
      values: ["soft", "clip"],
      type: "select",
    },
    {
      name: "filterType",
      label: "Filter Type",
      values: ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf"],
      type: "select",
    },
    {
      name: "cutoff",
      label: "Cutoff",
      min: 20,
      max: 20000,
      step: 1,
      type: "slider",
    },
    {
      name: "resonance",
      label: "Resonance",
      min: 0.1,
      max: 20,
      step: 0.1,
      type: "slider",
    },
    {
      name: "envDepth",
      label: "Env Depth",
      min: 0,
      max: 20,
      step: 0.01,
      type: "slider",
    },
    {
      name: "lfoRate",
      label: "LFO Rate",
      min: 0.1,
      max: 20,
      step: 0.01,
      type: "slider",
    },
    {
      name: "lfoDepth",
      label: "LFO Depth",
      min: 0,
      max: 1,
      step: 0.01,
      type: "slider",
    },
    {
      name: "attack",
      label: "Attack",
      min: 0.01,
      max: 1.0,
      step: 0.01,
      type: "slider",
    },
    {
      name: "release",
      label: "Release",
      min: 0.01,
      max: 1.0,
      step: 0.01,
      type: "slider",
    },
  ];

  if (fxObj.className === "MutatorFilter") {
    mutatorParams.forEach((param) => {
      if (param.type === "select") {
        const selectDiv = document.createElement("div");
        selectDiv.className = "select-div panel";

        const labelElem = document.createElement("label");
        labelElem.textContent = param.label || param.name;

        const select = document.createElement("select");
        param.values.forEach((val) => {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          select.appendChild(opt);
        });
        select.value = fxObj.params[param.name];
        select.className = "lcd-select";
        select.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        select.onchange = (e) => {
          fxObj.params[param.name] = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = fxObj.params[param.name];
        };

        selectDiv.append(labelElem, select);
        fxDiv.appendChild(selectDiv);
      } else {
        const sliderDiv = document.createElement("div");
        sliderDiv.className = "slider-container panel";

        const labelElem = document.createElement("label");
        labelElem.textContent = param.label || param.name;

        const input = document.createElement("input");
        input.type = "range";
        input.min = param.min;
        input.max = param.max;
        input.step = param.step;
        input.value = fxObj.params[param.name];
        input.title = param.name;
        input.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        preventParentDragOnInput(input);
        input.id = `${fxObj.className}_${param.name
          .replace(/\s+/g, "_")
          .toLowerCase()}`;
        input.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          activateMIDILearnFor(input);
        });
        const span = document.createElement("span");
        span.textContent = input.value;

        input.oninput = (e) => {
          fxObj.params[param.name] = parseFloat(e.target.value);
          span.textContent = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = fxObj.params[param.name];
        };

        sliderDiv.append(labelElem, input, span);
        fxDiv.appendChild(sliderDiv);
      }
    });
  }

  if (fxObj.className === "RingModulator") {
    const RINGMOD_PARAMS = [
      {
        param: "modFrequency",
        label: "Mod Frequency",
        min: 0.1,
        max: 2000,
        step: 0.1,
        default: 30,
      },
      {
        param: "modDepth",
        label: "Depth",
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
      },
    ];
    RINGMOD_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  if (fxObj.className === "MorphingFilter") {
    [
      {
        name: "typeA",
        label: "Type A",
        type: "select",
        values: [
          "lowpass",
          "highpass",
          "bandpass",
          "lowshelf",
          "highshelf",
          "peaking",
          "notch",
          "allpass",
        ],
      },
      {
        name: "freqA",
        label: "Freq A",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      { name: "resonanceA", min: 0.1, max: 20, step: 0.1, type: "slider" },
      {
        name: "typeB",
        label: "Type B",
        type: "select",
        values: [
          "lowpass",
          "highpass",
          "bandpass",
          "lowshelf",
          "highshelf",
          "peaking",
          "notch",
          "allpass",
        ],
      },
      {
        name: "freqB",
        label: "Freq B",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        name: "resonanceB",
        label: "Resonance B",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        name: "outputGain",
        label: "Output Gain",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        name: "morph",
        label: "Morph",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        name: "lfoFrequency",
        label: "LFO Frequency",
        min: 0.01,
        max: 10,
        step: 0.01,
        type: "slider",
      },
      {
        name: "lfoDepth",
        label: "LFO Depth",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
    ].forEach((param) => {
      if (param.type === "select") {
        const selectDiv = document.createElement("div");
        selectDiv.className = "select-div panel";

        const labelElem = document.createElement("label");
        labelElem.textContent = param.label || param.name;

        const select = document.createElement("select");
        param.values.forEach((val) => {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          select.appendChild(opt);
        });
        select.value = fxObj.params[param.name];
        select.className = "lcd-select";
        select.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        select.onchange = (e) => {
          fxObj.params[param.name] = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = e.target.value;
        };

        selectDiv.append(labelElem, select);
        fxDiv.appendChild(selectDiv);
      } else {
        const sliderDiv = document.createElement("div");
        sliderDiv.className = "slider-container panel";
        const labelElem = document.createElement("label");
        labelElem.textContent = param.label || param.name;
        const input = document.createElement("input");
        input.type = "range";
        input.min = param.min;
        input.max = param.max;
        input.step = param.step;
        input.value = fxObj.params[param.name];
        input.title = param.name;
        input.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        preventParentDragOnInput(input);
        input.id = `${fxObj.className}_${param.name
          .replace(/\s+/g, "_")
          .toLowerCase()}`;
        input.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          activateMIDILearnFor(input);
        });
        const span = document.createElement("span");
        span.textContent = input.value;

        input.oninput = (e) => {
          fxObj.params[param.name] = parseFloat(e.target.value);
          span.textContent = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = fxObj.params[param.name];
        };

        sliderDiv.append(labelElem, input, span);
        fxDiv.appendChild(sliderDiv);
      }
    });
  }

  if (fxObj.className === "EQ3Band") {
    const EQ3_PARAMS = [
      {
        param: "lowGain",
        label: "Low Gain (dB)",
        min: -40,
        max: 40,
        step: 0.1,
        default: 0,
      },
      {
        param: "lowFreq",
        label: "Low Freq (Hz)",
        min: 20,
        max: 1000,
        step: 1,
        default: 100,
      },
      {
        param: "midGain",
        label: "Mid Gain (dB)",
        min: -40,
        max: 40,
        step: 0.1,
        default: 0,
      },
      {
        param: "midFreq",
        label: "Mid Freq (Hz)",
        min: 200,
        max: 5000,
        step: 1,
        default: 1000,
      },
      {
        param: "midRes",
        label: "Mid Peak",
        min: 0,
        max: 20,
        step: 0.01,
        default: 0,
      },
      {
        param: "highGain",
        label: "High Gain (dB)",
        min: -40,
        max: 40,
        step: 0.1,
        default: 0,
      },
      {
        param: "highFreq",
        label: "High Freq (Hz)",
        min: 2000,
        max: 18000,
        step: 1,
        default: 5000,
      },
    ];
    EQ3_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  if (fxObj.className === "Compressor") {
    const COMP_PARAMS = [
      {
        param: "threshold",
        label: "Threshold (dB)",
        min: -60,
        max: 0,
        step: 1,
        default: -20,
      },
      {
        param: "attack",
        label: "Attack (ms)",
        min: 1,
        max: 1000,
        step: 1,
        default: 1,
      },
      {
        param: "release",
        label: "Release (ms)",
        min: 10,
        max: 2000,
        step: 1,
        default: 250,
      },
      {
        param: "makeupGain",
        label: "Makeup Gain",
        min: 1,
        max: 10,
        step: 0.1,
        default: 1,
      },
      {
        param: "ratio",
        label: "Ratio",
        min: 1,
        max: 50,
        step: 0.1,
        default: 4,
      },
      {
        param: "knee",
        label: "Knee",
        min: 0,
        max: 40,
        step: 1,
        default: 5,
      },
    ];
    COMP_PARAMS.forEach(({ param, label, min, max, step, default: def }) => {
      let input = document.createElement("input");
      input.type = "range";
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = fxObj.params[param] ?? def;
      input.title = param;
      input.setAttribute("aria-label", `${fxObj.className} ${label}`);
      preventParentDragOnInput(input);
      input.id = `${fxObj.className}_${label
        .replace(/\s+/g, "_")
        .toLowerCase()}`;
      input.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        activateMIDILearnFor(input);
      });
      let span = document.createElement("span");
      span.textContent = input.value;

      input.oninput = (e) => {
        let val =
          param === "stage"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value);
        fxObj.params[param] = val;
        span.textContent = val;
        if (fxObj.node) fxObj.node[param] = val;
      };

      let container = document.createElement("div");
      container.className = "slider-container panel";

      let labelElem = document.createElement("label");
      labelElem.textContent = label;

      container.append(labelElem, input, span);
      fxDiv.appendChild(container);
    });
  }
  if (fxObj.className === "DualFilter") {
    [
      {
        name: "typeA",
        label: "Type A",
        type: "select",
        values: [
          "lowpass",
          "highpass",
          "bandpass",
          "lowshelf",
          "highshelf",
          "peaking",
          "notch",
          "allpass",
        ],
      },
      {
        name: "freqA",
        label: "Freq A (Hz)",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        name: "qA",
        label: "Q A",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        name: "typeB",
        label: "Type B",
        type: "select",
        values: [
          "lowpass",
          "highpass",
          "bandpass",
          "lowshelf",
          "highshelf",
          "peaking",
          "notch",
          "allpass",
        ],
      },
      {
        name: "freqB",
        label: "Freq B (Hz)",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        name: "qB",
        label: "Q B",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        name: "serialRouting",
        label: "Serial Routing",
        type: "toggle",
        trueLabel: "Serial",
        falseLabel: "Parallel",
      },
    ].forEach((param) => {
      if (param.type === "select") {
        const selectDiv = document.createElement("div");
        selectDiv.className = "select-div panel";
        const labelElem = document.createElement("label");
        labelElem.textContent = param.label;

        const select = document.createElement("select");
        select.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        param.values.forEach((val) => {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          select.appendChild(opt);
        });
        select.value = fxObj.params[param.name];
        select.onchange = (e) => {
          fxObj.params[param.name] = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = e.target.value;
        };

        selectDiv.append(labelElem, select);
        fxDiv.appendChild(selectDiv);
      } else if (param.type === "toggle") {
        const toggleDiv = document.createElement("div");
        toggleDiv.className = "toggle-container panel";

        const button = document.createElement("button");

        button.textContent = fxObj.params[param.name]
          ? param.trueLabel || "On"
          : param.falseLabel || "Off";
        button.className = fxObj.params[param.name]
          ? "on lcd-button"
          : "off lcd-button";
        button.onclick = () => {
          fxObj.params[param.name] = !fxObj.params[param.name];
          button.textContent = fxObj.params[param.name]
            ? param.trueLabel || "On"
            : param.falseLabel || "Off";
          button.className = fxObj.params[param.name]
            ? "on lcd-button"
            : "off lcd-button";
          if (fxObj.node) fxObj.node[param.name] = fxObj.params[param.name];
        };

        toggleDiv.append(button);
        fxDiv.appendChild(toggleDiv);
      } else {
        const sliderDiv = document.createElement("div");
        sliderDiv.className = "slider-container panel";

        const labelElem = document.createElement("label");
        labelElem.textContent = param.label;

        const input = document.createElement("input");
        input.type = "range";
        input.min = param.min;
        input.max = param.max;
        input.step = param.step;
        input.value = fxObj.params[param.name];
        input.title = param.name;
        input.setAttribute("aria-label", `${fxObj.className} ${param.label}`);
        preventParentDragOnInput(input);
        input.id = `${fxObj.className}_${param.label
          .replace(/\s+/g, "_")
          .toLowerCase()}`;
        input.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          activateMIDILearnFor(input);
        });
        const span = document.createElement("span");
        span.textContent = input.value;

        input.oninput = (e) => {
          fxObj.params[param.name] = parseFloat(e.target.value);
          span.textContent = e.target.value;
          if (fxObj.node) fxObj.node[param.name] = fxObj.params[param.name];
        };

        sliderDiv.append(labelElem, input, span);
        fxDiv.appendChild(sliderDiv);
      }
    });
  }

  // Add remove btn
  const rmBtn = document.createElement("button");
  rmBtn.textContent = "X";
  rmBtn.className = "remove-button";
  rmBtn.setAttribute("aria-label", `Remove Effect`);
  rmBtn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeFX(idx);
    // Focus next or previous block
    setTimeout(() => {
      let blocks = fxChainDiv.querySelectorAll(".fx-block");
      if (blocks.length > 0) {
        (blocks[idx] || blocks[idx - 1] || blocks[0]).focus();
      } else {
        fxChainDiv.focus();
      }
    }, 10);
  };
  fxDiv.appendChild(rmBtn);

  return fxDiv;
}

// --- Drag/drop for FX bank to chain ---
fxBankDiv.addEventListener("dragstart", (e) => {
  if (!e.target.classList.contains("fx-block")) return;
  e.dataTransfer.setData("text/plain", e.target.dataset.fx);
});

fxChainDiv.addEventListener("dragover", (e) => {
  e.preventDefault();
  fxChainDiv.style.background = "#222a";
});

fxChainDiv.addEventListener("dragleave", (e) => {
  fxChainDiv.style.background = "";
});

fxChainDiv.addEventListener("drop", (e) => {
  e.preventDefault();
  fxChainDiv.style.background = "";
  const fxClass = e.dataTransfer.getData("text/plain");
  const fxMeta = FX_LIST.find((fx) => fx.className === fxClass);
  if (fxMeta) {
    addFX(fxMeta);
  }
});

// --- Drag within chain to reorder ---
let dragIdx = null;
fxChainDiv.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("fx-block")) {
    dragIdx = Number(e.target.dataset.idx);
    e.target.classList.add("dragging");
  }
});

fxChainDiv.addEventListener("dragend", (e) => {
  document
    .querySelectorAll(".dragging")
    .forEach((el) => el.classList.remove("dragging"));
});

fxChainDiv.addEventListener("drop", (e) => {
  e.preventDefault();
  const target = e.target.closest(".fx-block");
  if (!target) return;
  const dropIdx = Number(target.dataset.idx);
  if (dragIdx !== null && dragIdx !== dropIdx) {
    const fx = fxChain.splice(dragIdx, 1)[0];
    fxChain.splice(dropIdx, 0, fx);
    renderFXChain();
    updateAudioRouting();
    dragIdx = null;
  }
});

document.addEventListener("keydown", (e) => {
  // This lets P work from any focused descendant inside .fx-block
  const fxBlock = e.target.closest ? e.target.closest(".fx-block") : null;
  if (
    e.key &&
    typeof e.key === "string" &&
    e.key.toLowerCase() === "p" &&
    fxBlock &&
    fxBlock.parentElement === fxChainDiv
  ) {
    const idx = Number(fxBlock.dataset.idx);

    if (keyboardPickupFX === null) {
      // Pick up
      keyboardPickupFX = idx;
      fxBlock.classList.add("pickup-mode");
      fxBlock.setAttribute("aria-grabbed", "true");
      const fxClass = fxBlock.dataset.fx;
      announce(
        `${fxClass} picked up. Navigate to the new position and press P again to drop.`
      );
      return;
    } else {
      // Drop
      if (keyboardPickupFX !== idx) {
        const fx = fxChain.splice(keyboardPickupFX, 1)[0];
        fxChain.splice(idx, 0, fx);
        const fxClass = fxBlock.dataset.fx;
        announce(`${fxClass} moved to position ${idx + 1}.`);
        renderFXChain();
        updateAudioRouting();
        setTimeout(() => {
          const block = fxChainDiv.querySelector(`[data-idx="${idx}"]`);
          if (block) block.focus();
        }, 0);
      }
      // Clear
      document.querySelectorAll(".pickup-mode").forEach((el) => {
        el.classList.remove("pickup-mode");
        el.setAttribute("aria-grabbed", "false");
      });
      keyboardPickupFX = null;
      return;
    }
  }
});

fxBankDiv.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target.classList.contains("fx-block")
  ) {
    const fxClass = e.target.dataset.fx;
    const fxMeta = FX_LIST.find((fx) => fx.className === fxClass);
    announce(`${fxClass} added to chain`);
    if (fxMeta) {
      addFX(fxMeta); // now auto-focuses last
    }
  }
});

// --- Chain management ---
function addFX(meta, focusIdx = null) {
  const fxObj = {
    name: meta.name,
    className: meta.className,
    params: JSON.parse(JSON.stringify(meta.params)),
    node: null,
    guiDiv: null,
  };
  fxChain.push(fxObj);
  renderFXChain(fxChain.length - 1); // always focus last added
  updateAudioRouting();
}

function removeFX(idx) {
  // 1. Disconnect the FX node if it exists (before splicing from array!)
  const fx = fxChain[idx];
  if (fx && fx.node && fx.node.disconnect) {
    try {
      fx.node.disconnect();
      // Also disconnect all its inputs, in case of Feedback/Delay/Convolver
      if (fx.node.input && fx.node.input.disconnect) {
        fx.node.input.disconnect();
      }
    } catch (e) {}
  }
  // 2. Remove from the chain
  fxChain.splice(idx, 1);
  renderFXChain();
  updateAudioRouting();
}

function applyGradientToggle() {
  const gradientsEnabled = localStorage.getItem("gradientsEnabled") === "true";
  const elements = document.querySelectorAll(".panel, .slider-container");
  elements.forEach((el) => {
    if (gradientsEnabled) {
      el.classList.remove("no-gradient");
    } else {
      el.classList.add("no-gradient");
    }
  });
}

function applyKnobDesign(design) {
  const knobWrappers = document.querySelectorAll(
    ".slider-container, .range-knob-wrapper"
  );
  const allClasses = [
    "classic",
    "minimal",
    "fancy",
    "retro",
    "modern",
    "twist",
    "flat",
    "shadow",
    "outline",
    "simple",
  ];
  knobWrappers.forEach((el) => {
    allClasses.forEach((cls) => el.classList.remove(cls));
    el.classList.add(design);
  });
}

function renderFXChain(focusIdx = null) {
  fxChainDiv.innerHTML = "";
  fxChain.forEach((fx, idx) => {
    const block = createFXBlockDiv(fx, idx);
    fx.guiDiv = block;
    fxChainDiv.appendChild(block);
    // Only focus the specified block
    if (focusIdx !== null && idx === focusIdx) {
      setTimeout(() => block.focus(), 0);
    }
  });
  const savedKnobDesign =
    localStorage.getItem("selectedKnobDesign") || "classic";
  applyKnobDesign(savedKnobDesign);
  applyGradientToggle();
}

function updateAudioRouting() {
  // Disconnect previous direct connection if any
  if (inputDirectToOutput) {
    try {
      fxInput.disconnect(masterGain);
    } catch (e) {}
    inputDirectToOutput = false;
  }
  // Disconnect and clean up all FX nodes
  fxChain.forEach((fx) => {
    if (fx.node && fx.node.disconnect)
      try {
        fx.node.disconnect();
      } catch (e) {}
    fx.node = null;
  });
  // If no FX, reconnect input directly to master output
  if (fxChain.length === 0) {
    fxInput.connect(masterGain);
    inputDirectToOutput = true;
    return;
  }
  // Else: Build chain
  let prevNode = fxInput;
  fxChain.forEach((fx) => {
    try {
      fx.node = new tuna[fx.className](fx.params);
      if (
        fx.className === "MutatorFilter" &&
        typeof fx.node.start === "function"
      ) {
        fx.node.start();
      }
      if (
        fx.className === "ModulatedStereoPanner" &&
        typeof fx.node.start === "function"
      ) {
        fx.node.start();
      }
      if (prevNode) prevNode.connect(fx.node.input || fx.node);
      prevNode = fx.node.output || fx.node;
      // Apply GUI param changes
      Object.keys(fx.params).forEach((param) => {
        if (typeof fx.node[param] !== "undefined")
          fx.node[param] = fx.params[param];
      });
    } catch (err) {
      console.warn("FX create error:", fx.className, err);
    }
  });
  // Connect the output of last FX to master
  if (prevNode) prevNode.connect(masterGain);
}

// --- Output Volume ---
const outputValue = document.getElementById("outputValue");

document.getElementById("outputVol").addEventListener("input", (e) => {
  masterGain.gain.value = parseFloat(e.target.value);
  outputValue.textContent = parseFloat(e.target.value).toFixed(2);
});

// --- Stereo Metering Setup ---
const splitter = audioCtx.createChannelSplitter(2);
// Upmix mono to stereo for accurate metering!
const merger = audioCtx.createChannelMerger(2);
masterGain.connect(merger, 0, 0);
masterGain.connect(merger, 0, 1);
merger.connect(splitter);

// Create 2 analysers, one for each channel
const analyserL = audioCtx.createAnalyser();
const analyserR = audioCtx.createAnalyser();
splitter.connect(analyserL, 0); // left
splitter.connect(analyserR, 1); // right

const canvas = document.getElementById("outputMeterCanvas");
const ctx = canvas.getContext("2d");

let peakL = 0,
  peakR = 0;

function drawStereoMeter() {
  // Get L/R data
  const arrL = new Uint8Array(analyserL.fftSize);
  const arrR = new Uint8Array(analyserR.fftSize);
  analyserL.getByteTimeDomainData(arrL);
  analyserR.getByteTimeDomainData(arrR);
  // RMS for each channel
  let sumL = 0,
    sumR = 0;
  for (let v of arrL) sumL += (v - 128) * (v - 128);
  for (let v of arrR) sumR += (v - 128) * (v - 128);
  let rmsL = Math.sqrt(sumL / arrL.length) / 128;
  let rmsR = Math.sqrt(sumR / arrR.length) / 128;
  // dB scaling
  let dbL = 20 * Math.log10(rmsL || 0.0001);
  let dbR = 20 * Math.log10(rmsR || 0.0001);
  // Map -60dB..0dB to 0..1
  let normL = Math.max(0, (dbL + 60) / 60);
  let normR = Math.max(0, (dbR + 60) / 60);
  // Peak hold
  peakL = Math.max(peakL * 0.96, normL); // smooth fall
  peakR = Math.max(peakR * 0.96, normR);
  // Draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Colors
  let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#0f0");
  grad.addColorStop(0.7, "#ff0");
  grad.addColorStop(1, "#f00");
  // Left bar
  ctx.fillStyle = grad;
  ctx.fillRect(
    8,
    canvas.height - normL * canvas.height,
    12,
    normL * canvas.height
  );
  // Right bar
  ctx.fillStyle = grad;
  ctx.fillRect(
    30,
    canvas.height - normR * canvas.height,
    12,
    normR * canvas.height
  );
  // Peak marks (white lines)
  ctx.fillStyle = "#fff";
  ctx.fillRect(8, canvas.height - peakL * canvas.height - 1, 12, 2);
  ctx.fillRect(30, canvas.height - peakR * canvas.height - 1, 12, 2);
  // Labels (optional)
  ctx.fillStyle = "#aaa";
  ctx.font = "10px sans-serif";
  ctx.fillText("L", 10, canvas.height - 2);
  ctx.fillText("R", 32, canvas.height - 2);
  requestAnimationFrame(drawStereoMeter);
}
drawStereoMeter();

export function getFXChainState() {
  // Return array of {className, params}
  return fxChain.map((fx) => ({
    className: fx.className,
    params: { ...fx.params },
  }));
}

export function setFXChainState(chainArray) {
  // Remove all current FX
  fxChain = [];
  // For each saved FX in order, add it with saved params
  if (Array.isArray(chainArray)) {
    chainArray.forEach((fxData) => {
      // Find the metadata by className, but override params
      const fxMeta = FX_LIST.find(
        (meta) => meta.className === fxData.className
      );
      if (fxMeta) {
        // Use addFX with explicit params override
        const fxObj = {
          name: fxMeta.name,
          className: fxData.className,
          params: { ...fxMeta.params, ...fxData.params }, // Merge default & saved
          node: null,
          guiDiv: null,
        };
        fxChain.push(fxObj);
      }
    });
    renderFXChain();
    updateAudioRouting();
  }
}

function announce(msg) {
  const region = document.getElementById("aria-status");
  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = msg;
    }, 10);
  }
}
