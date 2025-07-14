import { loadScript } from "../utils/loadScript.js";
import { audioCtx } from "../utils/audioCtx.js";
import { activateMIDILearnFor } from "../midi/midi-learn.js";
import { announce } from "../announcement/announce.js";

export function getFXParams() {
  return fxChain.flatMap((fx, idx) => {
    return Object.entries(fx.params).map(([param, value]) => {
      return {
        id: `fx-${fx.className}-${idx}-${param}`,
        label: `${fx.name} ${param}`,
        group: fx.name,
        category: "FX",
        value,
        // generic apply for most numeric/text params
        apply: (val) => {
          fx.params[param] = typeof value === "number" ? parseFloat(val) : val;
          if (fx.node && fx.node[param] !== undefined)
            fx.node[param] = fx.params[param];
        },
      };
    });
  });
}

await loadScript("src/tuna.js");

export const tuna = new Tuna(audioCtx);
export const fxInput = audioCtx.createGain();
let sourceNode = fxInput;
let inputDirectToOutput = true;

// Expose connect function
export function connectToFXChain(audioNode) {
  //console.log("Connecting", audioNode, "to fxInput");
  audioNode.connect(fxInput);
}

const fxBankDiv = document.getElementById("fx-bank");
const fxChainDiv = document.getElementById("fx-chain");
let fxChain = []; // [{name, className, params, node, guiDiv}, ...]
export { fxChain };
window.fxChain = fxChain;
let keyboardPickupFX = null; // idx of picked-up block

export const FX_LIST = [
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
    params: { curveAmount: 400, drive: 0.2 },
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
    name: "Morph",
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
    name: "Equaliser",
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
    name: "Duotone",
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
  {
    name: "Reverb",
    className: "Convolver",
    params: {
      highCut: 20,
      lowCut: 20250,
      dryLevel: 1,
      wetLevel: 1,
      impulseDuration: 1,
      impulseDecay: 1,
    },
  },
];

export const dcBlocker = audioCtx.createBiquadFilter();
dcBlocker.type = "highpass";
dcBlocker.frequency.value = 20;
// --- Output ---
export const masterGain = audioCtx.createGain();
masterGain.connect(dcBlocker);
dcBlocker.connect(audioCtx.destination);

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

export function createFXBlockDiv(fxObj, idx) {
  fxObj._inputs = fxObj._inputs || {}; // Store all slider refs here

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

  function makeKnobSlider({ param, label, min, max, step, value }) {
    let input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    input.title = param;
    input.setAttribute("aria-label", `${fxObj.className} ${label}`);
    input.id = `fx-${fxObj.className}-${idx}-${param}`;

    preventParentDragOnInput(input);
    input.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      activateMIDILearnFor(input);
    });

    // --- DRAG/DROP HANDLERS FOR MODULATION ---
    input.addEventListener("dragover", (e) => {
      e.preventDefault();
      input.classList.add("drop-target");
    });
    input.addEventListener("dragleave", () => {
      input.classList.remove("drop-target");
    });
    input.addEventListener("drop", (e) => {
      e.preventDefault();
      input.classList.remove("drop-target");

      const modType = e.dataTransfer.getData("modType");
      const paramId = input.id;
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const range = max - min;
      const originalVal = parseFloat(input.value);

      const target = {
        id: paramId,
        slider: input,
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
        if (lfo.targets.some((t) => t.slider === input)) return;
        lfo.targets.push(target);
        window.attachModRing?.(target, synth, window.announce);
        input.classList.add("modulated");
        window.announce?.(`LFO assigned to ${paramId}`);
      } else if (modType === "modEnv") {
        const modEnvId = e.dataTransfer.getData("text/plain");
        const env = synth.uiModEnvs?.find((e) => e.id === modEnvId);
        if (!env) return;
        if (env.targets.some((t) => t.slider === input)) return;
        env.targets.push(target);
        window.attachModRing?.(target, synth, window.announce);
        input.classList.add("modulated");
        window.announce?.(`Envelope assigned to ${paramId}`);
      }
    });

    input.dataset.paramId = input.id;

    let knobWrapper = document.createElement("div");
    knobWrapper.className = "range-knob-wrapper classic";
    knobWrapper.appendChild(input);

    let knobIndicator = document.createElement("div");
    knobIndicator.className = "range-knob";
    knobWrapper.appendChild(knobIndicator);

    let span = document.createElement("span");
    span.textContent = input.value;
    span.className = "lcd-text";

    function updateKnob() {
      const v = parseFloat(input.value);
      const vMin = parseFloat(input.min);
      const vMax = parseFloat(input.max);
      const norm = vMax > vMin ? (v - vMin) / (vMax - vMin) : 0.5;
      const deg = -135 + norm * 270;
      knobIndicator.style.transform = `rotate(${deg}deg)`;
    }
    updateKnob();

    input.oninput = (e) => {
      let val = parseFloat(e.target.value);
      fxObj.params[param] = val;
      span.textContent = val;
      if (fxObj.node) fxObj.node[param] = val;
      updateKnob();
    };

    fxObj._inputs[param] = { input, span, knobIndicator, updateKnob };

    let container = document.createElement("div");
    container.className = "slider-div";
    let labelElem = document.createElement("label");
    labelElem.textContent = label;
    labelElem.setAttribute("for", input.id);

    container.append(labelElem, knobWrapper, span);
    return container;
  }

  // --- Helper for select/enum type controls ---
  function makeSelect({ param, label, options, values, value }) {
    const selectDiv = document.createElement("div");
    selectDiv.className = "select-div panel";

    const labelElem = document.createElement("label");
    labelElem.textContent = label;

    const select = document.createElement("select");

    // ✅ Assign ID
    const id = `fx-${fxObj.className}-${idx}-${param}`;
    select.id = id;
    select.dataset.paramId = id;
    labelElem.htmlFor = id;
    // ✅ Fallback if options not provided
    if (!options && values) {
      options = values.map((val) => ({
        label: String(val).charAt(0).toUpperCase() + String(val).slice(1),
        value: val,
      }));
    }

    if (!Array.isArray(options)) options = [];

    options.forEach(({ label, value }) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    });

    select.value = value;
    select.className = "lcd-select";
    select.setAttribute("aria-label", `${fxObj.className} ${label}`);
    select.onchange = (e) => {
      fxObj.params[param] = e.target.value;
      if (fxObj.node) fxObj.node[param] = e.target.value;
    };

    fxObj._inputs[param] = { select };

    selectDiv.append(labelElem, select);
    return selectDiv;
  }

  // --- Helper for toggle/on-off controls ---
  function makeToggle({ param, label, trueLabel, falseLabel, value }) {
    const toggleDiv = document.createElement("div");
    toggleDiv.className = "toggle-container panel";
    const button = document.createElement("button");
    button.textContent = value ? trueLabel || "On" : falseLabel || "Off";
    button.className = value ? "on lcd-button" : "off lcd-button";
    button.onclick = () => {
      fxObj.params[param] = !fxObj.params[param];
      button.textContent = fxObj.params[param]
        ? trueLabel || "On"
        : falseLabel || "Off";
      button.className = fxObj.params[param]
        ? "on lcd-button"
        : "off lcd-button";
      if (fxObj.node) fxObj.node[param] = fxObj.params[param];
    };
    fxObj._inputs[param] = { button };
    toggleDiv.append(button);
    return toggleDiv;
  }

  // --- All parameter definitions for all FX ---
  const PARAMS = {
    Phaser: [
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
        param: "stereoPhase",
        label: "Phase",
        min: 0,
        max: 180,
        step: 1,
        default: 40,
      },
      {
        param: "baseModulationFrequency",
        label: "Base Frequency",
        min: 20,
        max: 2000,
        step: 1,
        default: 700,
      },
    ],
    Delay: [
      {
        param: "delayTime",
        label: "Time",
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
        label: "Cut Off",
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
    ],
    Chorus: [
      {
        param: "rate",
        label: "Rate",
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
        label: "Delay",
        min: 0,
        max: 0.1,
        step: 0.0001,
        default: 0.0045,
      },
      {
        param: "wetLevel",
        label: "Wet",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "dryLevel",
        label: "Dry",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.5,
      },
      {
        param: "stereoPhase",
        label: "Stereo",
        min: 0,
        max: 180,
        step: 1,
        default: 90,
      },
    ],
    Distortion: [
      {
        param: "drive",
        label: "Drive",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.2,
      },
      {
        param: "curveAmount",
        label: "Curve",
        min: 100,
        max: 1000,
        step: 1,
        default: 400,
      },
    ],
    MutatorFilter: [
      {
        param: "bitDepth",
        label: "Bit Depth",
        min: 1,
        max: 16,
        step: 1,
        type: "slider",
      },
      {
        param: "reduction",
        label: "Reduction",
        min: 0.01,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        param: "distortionAmount",
        label: "Distortion",
        min: 10,
        max: 100,
        step: 1,
        type: "slider",
      },
      {
        param: "distortionType",
        label: "Type",
        type: "select",
        options: [
          { label: "Soft", value: "soft" },
          { label: "Clip", value: "clip" },
        ],
      },
      {
        param: "filterType",
        label: "Filter",
        type: "select",
        options: [
          { label: "Lowpass", value: "lowpass" },
          { label: "Highpass", value: "highpass" },
          { label: "Bandpass", value: "bandpass" },
          { label: "Lowshelf", value: "lowshelf" },
          { label: "Highshelf", value: "highshelf" },
        ],
      },
      {
        param: "cutoff",
        label: "Cutoff",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        param: "resonance",
        label: "Resonance",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        param: "envelopeDepth",
        label: "Env Depth",
        min: 0,
        max: 20,
        step: 0.01,
        type: "slider",
      },
      {
        param: "lfoRate",
        label: "LFO Rate",
        min: 0.1,
        max: 20,
        step: 0.01,
        type: "slider",
      },
      {
        param: "lfoDepth",
        label: "LFO Depth",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        param: "attack",
        label: "Attack",
        min: 0.01,
        max: 1.0,
        step: 0.01,
        type: "slider",
      },
      {
        param: "release",
        label: "Release",
        min: 0.01,
        max: 1.0,
        step: 0.01,
        type: "slider",
      },
    ],
    RingModulator: [
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
    ],
    MorphingFilter: [
      {
        param: "typeA",
        label: "Type A",
        type: "select",
        options: [
          { label: "Lowpass", value: "lowpass" },
          { label: "Highpass", value: "highpass" },
          { label: "Bandpass", value: "bandpass" },
          { label: "Lowshelf", value: "lowshelf" },
          { label: "Highshelf", value: "highshelf" },
          { label: "Peaking", value: "peaking" },
          { label: "Notch", value: "notch" },
          { label: "Allpass", value: "allpass" },
        ],
      },
      {
        param: "freqA",
        label: "Freq A",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        param: "resonanceA",
        label: "Resonance A",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        param: "typeB",
        label: "Type B",
        type: "select",
        options: [
          { label: "Lowpass", value: "lowpass" },
          { label: "Highpass", value: "highpass" },
          { label: "Bandpass", value: "bandpass" },
          { label: "Lowshelf", value: "lowshelf" },
          { label: "Highshelf", value: "highshelf" },
          { label: "Peaking", value: "peaking" },
          { label: "Notch", value: "notch" },
          { label: "Allpass", value: "allpass" },
        ],
      },
      {
        param: "freqB",
        label: "Freq B",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        param: "resonanceB",
        label: "Resonance B",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        param: "outputGain",
        label: "Output Gain",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        param: "morph",
        label: "Morph",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
      {
        param: "lfoFrequency",
        label: "LFO Frequency",
        min: 0.01,
        max: 10,
        step: 0.01,
        type: "slider",
      },
      {
        param: "lfoDepth",
        label: "LFO Depth",
        min: 0,
        max: 1,
        step: 0.01,
        type: "slider",
      },
    ],
    EQ3Band: [
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
    ],
    Compressor: [
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
      { param: "knee", label: "Knee", min: 0, max: 40, step: 1, default: 5 },
    ],
    DualFilter: [
      {
        param: "typeA",
        label: "Type A",
        type: "select",
        options: [
          { label: "Lowpass", value: "lowpass" },
          { label: "Highpass", value: "highpass" },
          { label: "Bandpass", value: "bandpass" },
          { label: "Lowshelf", value: "lowshelf" },
          { label: "Highshelf", value: "highshelf" },
          { label: "Peaking", value: "peaking" },
          { label: "Notch", value: "notch" },
          { label: "Allpass", value: "allpass" },
        ],
      },
      {
        param: "freqA",
        label: "Frequency A",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        param: "qA",
        label: "Resonance A",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        param: "typeB",
        label: "Type B",
        type: "select",
        options: [
          { label: "Lowpass", value: "lowpass" },
          { label: "Highpass", value: "highpass" },
          { label: "Bandpass", value: "bandpass" },
          { label: "Lowshelf", value: "lowshelf" },
          { label: "Highshelf", value: "highshelf" },
          { label: "Peaking", value: "peaking" },
          { label: "Notch", value: "notch" },
          { label: "Allpass", value: "allpass" },
        ],
      },
      {
        param: "freqB",
        label: "Frequency B",
        min: 20,
        max: 20000,
        step: 1,
        type: "slider",
      },
      {
        param: "qB",
        label: "Resonace B",
        min: 0.1,
        max: 20,
        step: 0.1,
        type: "slider",
      },
      {
        param: "serialRouting",
        label: "Routing",
        type: "toggle",
        trueLabel: "Serial",
        falseLabel: "Parallel",
      },
    ],
    ModulatedStereoPanner: [
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
    ],
    Convolver: [
      {
        param: "highCut",
        label: "High Cut",
        min: 20,
        max: 22050,
        step: 1,
        default: 22050,
      },
      {
        param: "lowCut",
        label: "Low Cut",
        min: 20,
        max: 22050,
        step: 1,
        default: 20,
      },
      {
        param: "dryLevel",
        label: "Dry",
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
      },
      {
        param: "wetLevel",
        label: "Wet",
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
      },
    ],
  };
  // --- Render the controls for the block ---
  if (PARAMS[fxObj.className]) {
    PARAMS[fxObj.className].forEach((def) => {
      // Support both default (for input.value) and type (for select/toggle)
      let value = fxObj.params[def.param];
      if (def.type === "select") {
        fxDiv.appendChild(
          makeSelect({
            param: def.param,
            label: def.label,
            options: def.options,
            values: def.values,
            value,
          })
        );
      } else if (def.type === "toggle") {
        fxDiv.appendChild(
          makeToggle({
            param: def.param,
            label: def.label,
            trueLabel: def.trueLabel,
            falseLabel: def.falseLabel,
            value,
          })
        );
      } else {
        if (typeof value === "undefined" && typeof def.default !== "undefined")
          value = def.default;
        fxDiv.appendChild(
          makeKnobSlider({
            param: def.param,
            label: def.label,
            min: def.min,
            max: def.max,
            step: def.step,
            value,
          })
        );
      }
    });
  }

  // --- Remove FX block button ---
  const rmBtn = document.createElement("button");
  rmBtn.textContent = "X";
  rmBtn.className = "remove-button";
  rmBtn.setAttribute("aria-label", `Remove Effect`);
  rmBtn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    removeFX(idx);
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

export function setupFXChainKeyboardUI() {
  let pickupIdx = null;

  function pickDrop() {
    const fxChainDiv = document.getElementById("fx-chain");
    const fxBlock = document.activeElement?.closest?.(".fx-block");
    if (!fxBlock || fxBlock.parentElement !== fxChainDiv) return;

    const idx = Number(fxBlock.dataset.idx);

    if (pickupIdx === null) {
      pickupIdx = idx;
      fxBlock.classList.add("pickup-mode");
      fxBlock.setAttribute("aria-grabbed", "true");
      announce(
        `FX block picked up. Tab to new position and press again to drop.`
      );
    } else {
      if (pickupIdx !== idx) {
        const fx = fxChain.splice(pickupIdx, 1)[0];
        fxChain.splice(idx, 0, fx);
        renderFXChain();
        updateAudioRouting();
        setTimeout(() => {
          const block = fxChainDiv.querySelector(`[data-idx="${idx}"]`);
          if (block) block.focus();
        }, 0);
      }
      // Clean up
      fxChainDiv.querySelectorAll(".pickup-mode").forEach((el) => {
        el.classList.remove("pickup-mode");
        el.setAttribute("aria-grabbed", "false");
      });
      pickupIdx = null;
    }
  }

  // Attach as a property for global access
  return { pickDrop };
}

document.addEventListener("keydown", (e) => {
  const fxBlock = e.target.closest ? e.target.closest(".fx-block") : null;
  if (
    e.key &&
    typeof e.key === "string" &&
    e.key.toLowerCase() === "KeyP" &&
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
      addFX(fxMeta);
    }
  }
});

// --- Chain management ---
export function addFX(meta, insertIdx = null, paramOverride = null) {
  const fxObj = {
    name: meta.name,
    className: meta.className,
    params: paramOverride
      ? { ...meta.params, ...paramOverride }
      : JSON.parse(JSON.stringify(meta.params)),
    node: null,
    guiDiv: null,
  };
  if (insertIdx == null || insertIdx >= fxChain.length) {
    fxChain.push(fxObj);
    renderFXChain(fxChain.length - 1);
  } else {
    fxChain.splice(insertIdx, 0, fxObj);
    renderFXChain(insertIdx);
  }
  updateAudioRouting();

  console.log(
    "FX Chain is now:",
    fxChain.map((fx) => fx.name)
  );
}

function removeFX(idx) {
  const fx = fxChain[idx];
  if (fx && fx.node && fx.node.disconnect) {
    try {
      fx.node.disconnect();

      if (fx.node.input && fx.node.input.disconnect) {
        fx.node.input.disconnect();
      }
    } catch (e) {}
  }

  fxChain.splice(idx, 1);
  renderFXChain();
  updateAudioRouting();
  console.log(
    "FX Chain is now:",
    fxChain.map((fx) => fx.name)
  );
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

export function renderFXChain(focusIdx = null) {
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
  if (window.setupKeyboardModSourceDrag) {
    window.setupKeyboardModSourceDrag("#fx-chain");
  }
}

export function updateAudioRouting() {
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

// --- Stereo Metering Setup ---
const splitter = audioCtx.createChannelSplitter(2);
// Upmix mono to stereo for accurate metering
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
