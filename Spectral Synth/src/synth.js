import { audioCtx } from "./audioCtx.js";
import { connectToFXChain } from "./master-fx.js";
import { morph2D } from "./morph.js";
import { getEnvelope, getModEnvelope } from "./envelope.js";
import { renderHarmonicsTable } from "./harmonics-table.js";
import { drawSpectrum } from "./spectrum-plot.js";
import { initXYPad } from "./xy-pad.js";
import { setupMIDI } from "./midi.js";
import {
  sawCoeffs,
  squareCoeffs,
  triangleCoeffs,
  userCoeffs,
} from "./harmonics.js";
import {
  initMIDILearn,
  enableMIDILearnMode,
  exportMappings,
  importMappings,
  savePreset,
  clearAllMappings,
} from "./midi-learn.js";
import {
  saveAudioPreset,
  renderAudioPresetList,
  exportAudioPreset,
  importAudioPreset,
} from "./preset-manager.js";

let activeNotes = {}; // key: MIDI note, value: {osc,gain}
let currentOctave = 4;
let currentFilterType = "lowpass";
let currentCutoff = 20000;
let currentResonance = 0.5;
let pitchBend = 0;
let pitchBendRange = 2;
let lfo = null;
let lfoGain = null;
let lfoShape = "sine";
let lfoRate = 2;
let lfoDepth = 0;
let lfoTarget = "filter";

let lfo2 = null;
let lfo2Gain = null;
let lfo2Shape = "sine";
let lfo2Rate = 2;
let lfo2Depth = 0;
let lfo2Target = "pitch";

const FILTER_ENV_SCALE = 3000;

const saw = sawCoeffs();
const square = squareCoeffs();
const triangle = triangleCoeffs();

function getCurrentCoeffs() {
  return morph2D(saw, square, triangle, userCoeffs(), ...getXY());
}

function setPitchBend(bend) {
  pitchBend = bend; // save the current bend value
  // Update frequencies of all active notes:
  for (let midi in activeNotes) {
    updateNotePitch(midi);
  }
}
function updateNotePitch(midi) {
  const note = activeNotes[midi];
  if (!note) return;
  // Calculate frequency with pitch bend applied:
  const midiNum = parseInt(midi);
  const bendSemitones = pitchBend * pitchBendRange;
  const baseFreq = 440 * Math.pow(2, (midiNum - 69) / 12);
  const freqWithBend = baseFreq * Math.pow(2, bendSemitones / 12);
  // Reapply (and optionally reschedule, if using envelopes):
  note.osc.frequency.setValueAtTime(freqWithBend, audioCtx.currentTime);
}

// -- Waveform update for all notes
function updateWaveform() {
  const coeffs = getCurrentCoeffs();
  for (let midi in activeNotes) {
    if (activeNotes[midi].osc) {
      const wave = audioCtx.createPeriodicWave(coeffs.real, coeffs.imag, {
        disableNormalization: false,
      });
      activeNotes[midi].osc.setPeriodicWave(wave);
    }
  }
  drawSpectrum(coeffs.imag);
}

function getXY() {
  return [
    parseFloat(document.getElementById("xMorph").value),
    parseFloat(document.getElementById("yMorph").value),
  ];
}

const xyPad = document.getElementById("xyPad");
const xyDot = document.getElementById("xyDot");
const xSlider = document.getElementById("xMorph");
const ySlider = document.getElementById("yMorph");
const xOutput = document.getElementById("xMorphValue");
const yOutput = document.getElementById("yMorphValue");
const lfoBtn = document.getElementById("lfoToggle");

function updateXYOutputs() {
  xOutput.textContent = xSlider.value;
  yOutput.textContent = ySlider.value;
}

xSlider.addEventListener("input", updateXYOutputs);
ySlider.addEventListener("input", updateXYOutputs);
updateXYOutputs();

const {} = initXYPad({
  padElem: xyPad,
  dotElem: xyDot,
  xSliderElem: xSlider,
  ySliderElem: ySlider,
  lfoButtonElem: lfoBtn,
  onChange: (x, y) => {
    updateWaveform();
  },
});

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

const LFO_SCALES = {
  filter: 500,
  pitch: 50,
  xMorph: 0.3,
  yMorph: 0.3,
  lfo1Rate: 5,
  lfo1Depth: 1,
};

function restartLFO() {
  if (lfo) {
    try {
      lfo.stop();
    } catch {}
    lfo.disconnect();
    lfo = null;
  }
  if (lfoGain) {
    lfoGain.disconnect();
    lfoGain = null;
  }
  // Create new LFO and gain
  lfo = audioCtx.createOscillator();
  lfo.type = lfoShape;
  lfo.frequency.value = lfoRate;
  lfoGain = audioCtx.createGain();
  lfoGain.gain.value = lfoDepth;
  lfo.connect(lfoGain);
  // Connect LFO to destination for all active notes
  Object.values(activeNotes).forEach((note) => {
    connectLFOToTarget(note);
  });

  lfo.start();
}

function restartLFO2() {
  if (lfo2) {
    try {
      lfo2.stop();
    } catch {}
    lfo2.disconnect();
    lfo2 = null;
  }
  if (lfo2Gain) {
    lfo2Gain.disconnect();
    lfo2Gain = null;
  }
  if (lfo2Target === "xMorph" || lfo2Target === "yMorph") return;
  lfo2 = audioCtx.createOscillator();
  lfo2.type = lfo2Shape;
  lfo2.frequency.value = lfo2Rate;
  lfo2Gain = audioCtx.createGain();
  lfo2Gain.gain.value = lfo2Depth * (LFO_SCALES[lfo2Target] || 1);
  lfo2.connect(lfo2Gain);
  Object.values(activeNotes).forEach((note) => {
    connectLFO2ToTarget(note);
  });

  lfo2.start();
}

function stopMorphLFO2() {
  if (lfo2AnimId) {
    cancelAnimationFrame(lfo2AnimId);
    lfo2AnimId = null;
  }
}

function connectLFOToTarget(note) {
  // Disconnect first to avoid stacking connections
  if (note.lfoConnection) {
    try {
      note.lfoConnection.disconnect();
    } catch {}
    note.lfoConnection = null;
  }
  if (!lfoGain) return;

  let depth = lfoDepth * (LFO_SCALES[lfoTarget] || 1);

  switch (lfoTarget) {
    case "filter":
      if (note.filter) {
        lfoGain.gain.value = depth;
        lfoGain.connect(note.filter.frequency);
        note.lfoConnection = lfoGain;
      }
      break;
    case "pitch":
      lfoGain.gain.value = depth;
      lfoGain.connect(note.osc.frequency);
      note.lfoConnection = lfoGain;
      break;
  }
}

function connectLFO2ToTarget(note) {
  // Disconnect first
  if (note.lfo2Connection) {
    try {
      note.lfo2Connection.disconnect();
    } catch {}
    note.lfo2Connection = null;
  }
  if (!lfo2Gain) return;
  let depth = lfo2Depth * (LFO_SCALES[lfo2Target] || 1);
  switch (lfo2Target) {
    case "filter":
      if (note.filter) {
        lfo2Gain.gain.value = depth;
        lfo2Gain.connect(note.filter.frequency);
        note.lfo2Connection = lfo2Gain;
      }
      break;
    case "pitch":
      lfo2Gain.gain.value = depth;
      lfo2Gain.connect(note.osc.frequency);
      note.lfo2Connection = lfo2Gain;
      break;
  }
}

let lfo2AnimId = null;
function startMorphLFO2() {
  if (lfo2AnimId) cancelAnimationFrame(lfo2AnimId);

  function step() {
    if (lfo2Target !== "xMorph" && lfo2Target !== "yMorph") return;
    const t = audioCtx.currentTime;
    let value = lfoShapeAtTime(lfo2Shape, lfo2Rate, t);
    value *= lfo2Depth * (LFO_SCALES[lfo2Target] || 1);

    if (lfo2Target === "xMorph") {
      xSlider.value = clamp(0.5 + value, 0, 1);
      xSlider.dispatchEvent(new Event("input"));
    } else if (lfo2Target === "yMorph") {
      ySlider.value = clamp(0.5 + value, 0, 1);
      ySlider.dispatchEvent(new Event("input"));
    }
    lfo2AnimId = requestAnimationFrame(step);
  }
  step();
}

function lfoShapeAtTime(shape, freq, t) {
  const phase = (t * freq) % 1;
  switch (shape) {
    case "triangle":
      return 4 * Math.abs(phase - 0.5) - 1;
    case "square":
      return phase < 0.5 ? 1 : -1;
    case "sawtooth":
      return 2 * (phase - 0.5);
    case "sine":
    default:
      return Math.sin(2 * Math.PI * freq * t);
  }
}

let lfoAnimId = null;
function startMorphLFO() {
  if (lfoAnimId) cancelAnimationFrame(lfoAnimId);

  function step() {
    if (lfoTarget !== "xMorph" && lfoTarget !== "yMorph") return;
    const t = audioCtx.currentTime;
    let value = lfoShapeAtTime(lfoShape, lfoRate, t);
    value *= lfoDepth * (LFO_SCALES[lfoTarget] || 1);

    if (lfoTarget === "xMorph") {
      xSlider.value = clamp(0.5 + value, 0, 1);
      xSlider.dispatchEvent(new Event("input"));
    } else if (lfoTarget === "yMorph") {
      ySlider.value = clamp(0.5 + value, 0, 1);
      ySlider.dispatchEvent(new Event("input"));
    }
    lfoAnimId = requestAnimationFrame(step);
  }
  step();
}

function handleLFOChange() {
  // If morph, use morph LFO, else normal audio connections
  if (lfoTarget === "xMorph" || lfoTarget === "yMorph") {
    stopMorphLFO();
    startMorphLFO();
    // Don't run restartLFO() here
  } else {
    stopMorphLFO();
    restartLFO();
  }
}
function stopMorphLFO() {
  if (lfoAnimId) {
    cancelAnimationFrame(lfoAnimId);
    lfoAnimId = null;
  }
}

function updateAllNoteFilters() {
  for (let midi in activeNotes) {
    const note = activeNotes[midi];
    if (note && note.filter) {
      note.filter.frequency.cancelScheduledValues(audioCtx.currentTime);
      note.filter.frequency.setValueAtTime(currentCutoff, audioCtx.currentTime);
    }
  }
}

function noteOn(midi, velocity = 1) {
  if (activeNotes[midi]) return;
  // Get base values
  let [x, y] = getXY();
  const modEnv = getModEnvelope();
  const modDest = document.getElementById("modEnvDest")?.value || "x";
  // Set up oscillator and waveform
  const osc = audioCtx.createOscillator();
  const coeffs = morph2D(saw, square, triangle, userCoeffs(), x, y);
  const wave = audioCtx.createPeriodicWave(coeffs.real, coeffs.imag, {
    disableNormalization: false,
  });
  osc.setPeriodicWave(wave);

  // Calculate base pitch (in Hz)
  const baseFreq = 440 * Math.pow(2, (midi - 69) / 12);
  const bendSemitones = pitchBend * pitchBendRange;
  const freqWithBend = baseFreq * Math.pow(2, bendSemitones / 12);
  osc.frequency.value = freqWithBend;

  // --- MOD ENV TARGETS ---
  const now = audioCtx.currentTime;
  // ---- 1. PITCH ENVELOPE ----
  if (modDest === "pitch") {
    const semitones = modEnv.depth * 12; // or use a dedicated range control
    osc.frequency.cancelScheduledValues(now);
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(
      baseFreq * Math.pow(2, semitones / 12),
      now + modEnv.attack
    );
    osc.frequency.linearRampToValueAtTime(
      baseFreq * Math.pow(2, (semitones * modEnv.sustain) / 12),
      now + modEnv.attack + modEnv.decay
    );
  } else {
    osc.frequency.value = baseFreq;
  }
  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  const filter = audioCtx.createBiquadFilter();
  filter.type = currentFilterType;
  filter.Q.value = currentResonance;

  const baseCutoff = currentCutoff;

  if (modDest === "filter") {
    // Scale the modEnv.depth for a musically useful cutoff sweep
    const envDepth = modEnv.depth * FILTER_ENV_SCALE;
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(baseCutoff, now);
    const minFreq = 20;
    const maxFreq = audioCtx.sampleRate / 2;
    filter.frequency.linearRampToValueAtTime(
      clamp(baseCutoff + envDepth, minFreq, maxFreq),
      now + modEnv.attack
    );
    filter.frequency.linearRampToValueAtTime(
      clamp(baseCutoff + envDepth * modEnv.sustain, minFreq, maxFreq),
      now + modEnv.attack + modEnv.decay
    );
  } else {
    filter.frequency.value = baseCutoff;
  }

  osc.connect(filter);
  filter.connect(gain);

  connectToFXChain(gain);
  osc.start();

  const env = getEnvelope();
  const maxLevel = velocity * 0.1;
  const sustainLevel = env.sustain * maxLevel;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(maxLevel, now + env.attack);
  gain.gain.linearRampToValueAtTime(sustainLevel, now + env.attack + env.decay);

  activeNotes[midi] = {
    osc,
    gain,
    env,
    t0: now,
    modEnv,
    modTargets: { x, y },
    filter,
  };
  if (lfoGain) {
    connectLFOToTarget(activeNotes[midi]);
  }
  if (lfo2Gain) connectLFO2ToTarget(activeNotes[midi]);
}

function noteOff(midi) {
  const n = activeNotes[midi];
  if (!n) return;
  const env = n.env || getEnvelope();
  const now = audioCtx.currentTime;
  n.gain.gain.cancelScheduledValues(now);
  n.gain.gain.setValueAtTime(n.gain.gain.value, now);
  n.gain.gain.linearRampToValueAtTime(0, now + env.release);
  n.osc.stop(now + env.release + 0.02);
  if (n.filter) {
    const now = audioCtx.currentTime;
    n.filter.frequency.cancelScheduledValues(now);
    n.filter.frequency.setValueAtTime(n.filter.frequency.value, now);
    n.filter.frequency.linearRampToValueAtTime(
      currentCutoff,
      now + env.release
    );
  }

  setTimeout(() => {
    n.osc.disconnect();
    n.gain.disconnect();
  }, (env.release + 0.03) * 1000);
  delete activeNotes[midi];
}

// -- Musical Typing (QWERTY keys)
const keyMap = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
  o: 13,
  l: 14,
};

let downKeys = {};
function isTypingInInput(e) {
  const el = e.target;
  return (
    (el.tagName === "INPUT" && el.type !== "range") ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
}

document.addEventListener("keydown", (e) => {
  if (isTypingInInput(e)) return; // Ignore if typing in input

  if (e.repeat) return;
  if (e.key === "z") {
    currentOctave = Math.max(1, currentOctave - 1);
    return;
  }
  if (e.key === "x") {
    currentOctave = Math.min(8, currentOctave + 1);
    return;
  }
  const idx = keyMap[e.key];
  if (idx !== undefined) {
    const midi = 12 * currentOctave + idx;
    if (!downKeys[e.key]) {
      noteOn(midi);
      downKeys[e.key] = midi;
    }
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  if (isTypingInInput(e)) return; // Ignore if typing in input

  const idx = keyMap[e.key];
  if (idx !== undefined && downKeys[e.key]) {
    noteOff(downKeys[e.key]);
    delete downKeys[e.key];
    e.preventDefault();
  }
});

// -- Envelope live update
["envA", "envD", "envS", "envR"].forEach((id) => {
  const input = document.getElementById(id);
  const output = document.getElementById(id + "-value");
  // Set initial value (optional: to match input value)
  output.textContent = Number(input.value).toFixed(2);
  input.addEventListener("input", function () {
    output.textContent = Number(this.value).toFixed(2);
    updateWaveform();
  });
});

["modEnvA", "modEnvD", "modEnvS", "modEnvR", "modEnvDepth"].forEach((id) => {
  const input = document.getElementById(id);
  const output = document.getElementById(id + "-value");
  output.textContent = Number(input.value).toFixed(2);
  input.addEventListener("input", function () {
    output.textContent = Number(this.value).toFixed(2);
  });
});

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  // Find the first focusable element and focus it
  const focusable = modal.querySelector(
    'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) {
    setTimeout(() => focusable.focus(), 10); // Delay to ensure visibility
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    const openModal = document.querySelector(".modal:not(.hidden)");
    if (!openModal) return;
    const focusableElements = openModal.querySelectorAll(
      'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal")
      .forEach((modal) => modal.classList.add("hidden"));
  }
});

document.getElementById("clear-mappings-btn")?.addEventListener("click", () => {
  openModal("clear-modal");
});

document.getElementById("clear-confirm-btn").addEventListener("click", () => {
  clearAllMappings();
  document.getElementById("clear-modal").classList.add("hidden");
});

document.querySelectorAll(".close-modal").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.closest(".modal").classList.add("hidden");
  });
});

document.getElementById("save-preset")?.addEventListener("click", () => {
  openModal("save-modal");
});

document.getElementById("save-confirm-btn").addEventListener("click", () => {
  const name = document.getElementById("save-preset-name").value.trim();
  if (name) {
    savePreset(name);
    document.getElementById("save-modal").classList.add("hidden");
  }
});

document.getElementById("export-cc-btn")?.addEventListener("click", () => {
  openModal("export-modal");
});

document.getElementById("export-confirm-btn").addEventListener("click", () => {
  const filename =
    document.getElementById("export-filename").value.trim() ||
    "midi-cc-mappings.json";
  exportMappings(filename);
  document.getElementById("export-modal").classList.add("hidden");
});

document.querySelectorAll(".close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").classList.add("hidden");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal")
      .forEach((modal) => modal.classList.add("hidden"));
  }
});

document.getElementById("import-cc-file")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const name = file.name.replace(/\.json$/i, "");
    importMappings(file, name);
  }
});

const importLabel = document.getElementById("import-label");
const fileInput = document.getElementById("import-cc-file");

importLabel.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

document
  .getElementById("open-audio-save-modal")
  ?.addEventListener("click", () => openModal("audio-save-modal"));

document
  .getElementById("audio-save-confirm-btn")
  ?.addEventListener("click", () => {
    const name = document.getElementById("audio-save-preset-name").value.trim();
    if (name) {
      saveAudioPreset(name);
      document.getElementById("audio-save-modal").classList.add("hidden");
    }
  });

document
  .getElementById("open-audio-export-modal")
  ?.addEventListener("click", () => openModal("audio-export-modal"));

document
  .getElementById("audio-export-confirm-btn")
  ?.addEventListener("click", () => {
    const filename =
      document.getElementById("audio-export-filename").value.trim() ||
      "audio-presets.json";
    exportAudioPreset("presets.json");

    document.getElementById("audio-export-modal").classList.add("hidden");
  });

document
  .getElementById("import-audio-label")
  ?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("import-audio-file").click();
    }
  });

document
  .getElementById("import-audio-file")
  ?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const name = file.name.replace(/\\.json$/i, "");
      importAudioPreset(fileInput.files[0]);
    }
  });

const filterTypeSelect = document.getElementById("filterType");
const filterCutoffSlider = document.getElementById("filterCutoff");
const filterResonanceSlider = document.getElementById("filterResonance");

const filterCutoffValue = document.getElementById("filterCutoff-value");
const filterResonanceValue = document.getElementById("filterResonance-value");

filterTypeSelect.addEventListener("change", (e) => {
  currentFilterType = e.target.value;
});
filterCutoffSlider.addEventListener("input", (e) => {
  currentCutoff = parseFloat(e.target.value);
  filterCutoffValue.textContent = e.target.value;
  updateAllNoteFilters(); // <-- update filters in real-time
});

filterResonanceSlider.addEventListener("input", (e) => {
  currentResonance = parseFloat(e.target.value);
  filterResonanceValue.textContent = e.target.value;
});

const lfoShapeSelect = document.getElementById("lfoShape");
const lfoRateSlider = document.getElementById("lfoRate");
const lfoDepthSlider = document.getElementById("lfoDepth");
const lfoTargetSelect = document.getElementById("lfoTarget");

const lfoRateValue = document.getElementById("lfoRate-value");
const lfoDepthValue = document.getElementById("lfoDepth-value");

lfoShapeSelect.addEventListener("change", (e) => {
  lfoShape = e.target.value;
  handleLFOChange();
});

lfoRateSlider.addEventListener("input", (e) => {
  lfoRate = parseFloat(e.target.value);
  lfoRateValue.textContent = lfoRate;
  handleLFOChange();
});
lfoDepthSlider.addEventListener("input", (e) => {
  lfoDepth = parseFloat(e.target.value);
  lfoDepthValue.textContent = lfoDepth.toFixed(2);
  handleLFOChange();
});
lfoTargetSelect.addEventListener("change", (e) => {
  lfoTarget = e.target.value;
  handleLFOChange();
});

const lfo2ShapeSelect = document.getElementById("lfo2Shape");
const lfo2RateSlider = document.getElementById("lfo2Rate");
const lfo2DepthSlider = document.getElementById("lfo2Depth");
const lfo2TargetSelect = document.getElementById("lfo2Target");
const lfo2RateValue = document.getElementById("lfo2Rate-value");
const lfo2DepthValue = document.getElementById("lfo2Depth-value");

lfo2ShapeSelect.addEventListener("change", (e) => {
  lfo2Shape = e.target.value;
  handleLFO2Change();
});
lfo2RateSlider.addEventListener("input", (e) => {
  lfo2Rate = parseFloat(e.target.value);
  lfo2RateValue.textContent = lfo2Rate;
  handleLFO2Change();
});
lfo2DepthSlider.addEventListener("input", (e) => {
  lfo2Depth = parseFloat(e.target.value);
  lfo2DepthValue.textContent = lfo2Depth.toFixed(2);
  handleLFO2Change();
});
lfo2TargetSelect.addEventListener("change", (e) => {
  lfo2Target = e.target.value;
  handleLFO2Change();
});

function handleLFO2Change() {
  if (lfo2Target === "xMorph" || lfo2Target === "yMorph") {
    stopMorphLFO2();
    startMorphLFO2();
  } else {
    stopMorphLFO2();
    restartLFO2();
  }
}

renderHarmonicsTable();
updateWaveform();
initMIDILearn();
enableMIDILearnMode("synth-ui");
renderAudioPresetList();
setupMIDI({
  noteOn,
  noteOff,
  setPitchBend,
});
