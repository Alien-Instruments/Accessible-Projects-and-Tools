import { loadScript } from "./utils/loadScript.js";
import { setupMIDI } from "./midi.js";
import { triggerMIDILearnForControl } from "./midi-learn.js";
import {
  initMIDILearn,
  enableMIDILearnMode,
  exportMappings,
  importMappings,
  savePreset,
  clearAllMappings,
  cancelMIDILearn,
} from "./midi-learn.js";
import { buildSynthUI } from "./ui.js";
import { getSynthParams } from "./params.js";
import {
  saveAudioPreset,
  renderAudioPresetList,
  exportAudioPreset,
  importAudioPreset,
} from "./preset-manager.js";

const audioContext = new AudioContext();
await audioContext.audioWorklet.addModule("src/wavetable-processor.js");
const node = new AudioWorkletNode(audioContext, "wavetable-processor");
await loadScript("src/tuna.js");
const tuna = new Tuna(audioContext);
let keyboardPickupLFO = null;
let voicePickupLFO = null;
let modWheelDestId = null;
let modWheelAmount = 1.0;
let announceMode = "aria";
export let isModulating = false;
export const baseParamValues = {};

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
if (window.SpeechRecognition) {
  recognition = new window.SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("🎤 Transcript:", transcript);
    handleVoiceCommand(transcript);
  };
} else {
  console.warn("Speech Recognition not supported in this browser.");
}

document.getElementById("announce-toggle")?.addEventListener("change", (e) => {
  announceMode = e.target.checked ? "speech" : "aria";
});

document.addEventListener("keydown", (e) => {
  if (e.shiftKey && e.key.toLowerCase() === "a") {
    announceMode = announceMode === "aria" ? "speech" : "aria";
    announce(
      `Announcement mode: ${
        announceMode === "aria" ? "screen reader" : "spoken"
      }`
    );
    // If you want the UI toggle to reflect this change:
    const toggle = document.getElementById("announce-toggle");
    if (toggle) toggle.checked = announceMode === "speech";
  }
});

document.getElementById("voice-btn").addEventListener("click", () => {
  if (recognition) recognition.start();
});

function normalizeTranscript(str) {
  // Lowercase and normalize key mishearings BEFORE stripping whitespace!
  let normalized = str
    .toLowerCase()
    .replace(/\bd[\s-]?tune\b/g, "detune")
    .replace(/\bdee[\s-]?tune\b/g, "detune")
    .replace(/\bdq[\s-]?tune\b/g, "detune")
    .replace(/\bcereal\b/g, "serial")
    .replace(/\bseriel\b/g, "serial")
    .replace(/\bserie\b/g, "serial")
    .replace(/\bparalell\b/g, "parallel")
    .replace(/\bparrallel\b/g, "parallel")
    .replace(/\bparellel\b/g, "parallel")
    .replace(/\bresidence\b/g, "resonance")
    .replace(/\btriangle\b/g, "triangle")
    .replace(/\bsign\b/g, "sine")
    .replace(/\bscience\b/g, "sine")
    .replace(/\bshine\b/g, "sine")
    .replace(/\bsine wave\b/g, "sine")
    .replace(/\bsaw tooth\b/g, "sawtooth")
    .replace(/\bsore tooth\b/g, "sawtooth")
    .replace(/\btri angle\b/g, "triangle")
    .replace(/\bsquare\b/g, "square")
    .replace(/\boscillator\b/g, "oscillator")
    .replace(/\bone\b/g, "1")
    .replace(/\btwo\b/g, "2")
    .replace(/\bthree\b/g, "3")
    .replace(/\bfor\b/g, "4") // Sometimes "four" is misheard as "for"
    .replace(/\s+/g, " ")
    .trim();

  // Normalize all whitespace to single spaces (already done above)
  return normalized;
}

function wordsToNumber(str) {
  // Basic mapping
  const words = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000,
    million: 1000000,
  };

  str = str.replace(/-/g, " "); // handle "twenty-one"
  let tokens = str.toLowerCase().split(/\s+/);
  let total = 0,
    current = 0;

  for (let t of tokens) {
    if (words.hasOwnProperty(t)) {
      let val = words[t];
      if (val === 100 || val === 1000 || val === 1000000) {
        if (current === 0) current = 1;
        current *= val;
      } else {
        current += val;
      }
    } else if (t === "and") {
      continue; // skip "and"
    } else if (!isNaN(parseFloat(t))) {
      current += parseFloat(t);
    } else {
      if (current > 0) {
        total += current;
        current = 0;
      }
    }
  }
  total += current;
  return total > 0 ? total : null;
}

function handleVoiceCommand(transcript) {
  console.log("Transcript:", transcript);

  const lower = transcript.toLowerCase();
  const normTranscript = normalizeTranscript(lower);

  // --- LFO number words for matching ---
  const lfoWordNumbers = { one: 1, two: 2, three: 3 };

  // ----------- LFO PICKUP ----------
  // Match: "pick up lfo 1", "grab lfo two", "lfo 3 pick up".
  const lfoPickupPattern =
    /\b(?:pick up|grab)\b.*?\blfo\s*(\d|one|two|three)\b|\blfo\s*(\d|one|two|three)\b.*?\b(pick up|grab)\b/;
  const pickupMatch = normTranscript.match(lfoPickupPattern);
  let lfoNum = null;
  if (pickupMatch) {
    lfoNum = pickupMatch[1] || pickupMatch[2];
    if (lfoNum) {
      if (isNaN(lfoNum)) lfoNum = lfoWordNumbers[lfoNum];
      if (lfoNum && [1, 2, 3].includes(Number(lfoNum))) {
        const lfoId = "lfo" + lfoNum;
        const lfo = synth.uiLfos.find((l) => l.id.toLowerCase() === lfoId);
        if (lfo) {
          window.voicePickupLFO = lfo;
          announce(`Picked up ${lfoId.toUpperCase()}`);
        } else {
          announce(`Couldn't find ${lfoId.toUpperCase()}`);
        }
        return;
      }
    }
    announce(`Didn't recognize LFO number in "${transcript}"`);
    return;
  }

  // ----------- MIDI LEARN -----------
  const midiLearnMatch =
    normTranscript.match(/\bmidi ?learn (.+)/) ||
    normTranscript.match(/\blearn midi (.+)/) ||
    normTranscript.match(/\blearn (.+)/);
  if (midiLearnMatch) {
    const destText = midiLearnMatch[1].trim();
    const destNorm = normalizeTranscript(destText);
    const params = getSynthParams(synth, audioContext);
    const candidates = params
      .map((p) => {
        let score = 0;
        const labelNorm = normalizeTranscript(p.label || "");
        const idNorm = normalizeTranscript(p.id || "");
        const groupNorm = normalizeTranscript(p.group || "");
        if (labelNorm.includes(destNorm)) score += 3;
        if (idNorm.includes(destNorm)) score += 2;
        if (groupNorm.includes(destNorm)) score += 1;
        if (destNorm.includes(labelNorm) && labelNorm.length > 0) score += 2;
        if (destNorm.includes(idNorm) && idNorm.length > 0) score += 1;
        if (destNorm.includes(groupNorm) && groupNorm.length > 0) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates.find((c) => c.score > 0);
    if (!best) {
      announce(`Couldn't find parameter "${destText}" for MIDI learn`);
      return;
    }
    const paramId = best.p.id;
    triggerMIDILearnForControl(paramId);
    announce(`MIDI learn enabled for ${best.p.label}`);
    return;
  }

  // ----------- CANCEL MIDI LEARN -----------
  if (normTranscript.match(/\b(cancel|exit|stop) midi ?learn\b/)) {
    cancelMIDILearn();
    announce("MIDI learn cancelled");
    return;
  }

  // ----------- RANGE/OPTIONS QUERY -----------
  // e.g. "oscillator one detune range", "filter type options"
  const queryMatch = normTranscript.match(
    /^(.+?) (range|options|choices|values)$/
  );
  if (queryMatch) {
    const paramText = queryMatch[1].trim(); // e.g. "oscillator one detune"
    const mode = queryMatch[2]; // "range" or "options" etc.

    const params = getSynthParams(synth, audioContext);
    // Scoring logic
    const candidates = params
      .map((p) => {
        let score = 0;
        const labelNorm = normalizeTranscript(p.label || "");
        const idNorm = normalizeTranscript(p.id || "");
        const groupNorm = normalizeTranscript(p.group || "");
        if (labelNorm.includes(paramText)) score += 3;
        if (idNorm.includes(paramText)) score += 2;
        if (groupNorm.includes(paramText)) score += 1;
        if (paramText.includes(labelNorm) && labelNorm.length > 0) score += 2;
        if (paramText.includes(idNorm) && idNorm.length > 0) score += 1;
        if (paramText.includes(groupNorm) && groupNorm.length > 0) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = candidates.find((c) => c.score > 0);
    if (!best) {
      announce(`Couldn't find parameter "${paramText}"`);
      return;
    }
    const p = best.p;

    // Sliders/ranges
    if (
      (mode === "range" || mode === "values") &&
      (p.type === "slider" || p.type === "range")
    ) {
      announce(`${p.label}: min ${p.min}, max ${p.max}`);
      return;
    }
    // Dropdown/options
    if (
      (mode === "options" || mode === "choices" || mode === "values") &&
      p.options
    ) {
      announce(
        `${p.label} options: ` +
          p.options.map((o) => o.label || o.value).join(", ")
      );
      return;
    }
    announce(`No range or options for ${p.label}`);
    return;
  }

  // ----------- SELECT OPTION SETTING (voice) -----------
  const selectMatch = normTranscript.match(
    /^(?:set )?(.+?) (?:to |)([a-z0-9 \-]+)$/ // param then option
  );

  if (selectMatch) {
    const paramText = selectMatch[1].trim(); // "filter a type a"
    const optionText = selectMatch[2].trim();
    const params = getSynthParams(synth, audioContext);

    const paramWords = paramText.split(/\s+/);
    const optionNorm = normalizeTranscript(optionText);

    // Combine label/group/id, normalize once
    function allWordsPresentInParam(p) {
      const combined = (
        (p.group || "") +
        " " +
        (p.label || "") +
        " " +
        (p.id || "")
      ).toLowerCase();
      return paramWords.every((w) => combined.includes(w));
    }

    // Only allow params with options and all words present in label+group+id
    const candidates = params
      .filter((p) => p.options && allWordsPresentInParam(p))
      .map((p) => {
        let score = 0;
        // Score for strict matches
        const combined = (
          (p.group || "") +
          " " +
          (p.label || "") +
          " " +
          (p.id || "")
        ).toLowerCase();
        if (combined.trim() === paramText) score += 10;
        if (p.label && paramText === p.label.toLowerCase()) score += 2;
        if (p.group && paramText === p.group.toLowerCase()) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    // For debugging: see which params were considered
    console.table(
      candidates.map((c) => ({
        id: c.p.id,
        label: c.p.label,
        group: c.p.group,
        score: c.score,
      }))
    );

    const best = candidates.length > 0 ? candidates[0] : null;
    if (!best) {
      announce(`Couldn't find parameter for "${paramText}"`);
      return;
    }

    // Now match option by label/value
    const options = best.p.options;
    const foundOpt = options.find(
      (opt) =>
        normalizeTranscript(String(opt.label || "")) === optionNorm ||
        normalizeTranscript(String(opt.value)) === optionNorm
    );
    const looseOpt =
      foundOpt ||
      options.find(
        (opt) =>
          normalizeTranscript(String(opt.label || "")).includes(optionNorm) ||
          normalizeTranscript(String(opt.value)).includes(optionNorm)
      );

    if (looseOpt) {
      best.p.apply(looseOpt.value);
      announce(`Set ${best.p.label} to ${looseOpt.label || looseOpt.value}`);
      // Update UI as needed:
      const selectEl = document.getElementById(best.p.id);
      if (selectEl && selectEl.tagName === "SELECT") {
        selectEl.value = looseOpt.value;
        selectEl.dispatchEvent(new Event("input"));
      }
    } else {
      const opts = options.map((o) => `"${o.label}" [${o.value}]`).join(", ");
      announce(
        `No option "${optionText}" for ${best.p.label}. Available: ${opts}`
      );
    }
    return;
  }

  // ----------- LFO DROP -----------
  const dropMatch = normTranscript.match(/\bdrop on (.+)/);
  if (dropMatch && window.voicePickupLFO) {
    const destText = dropMatch[1].trim();
    const destNorm = normalizeTranscript(destText);
    const params = getSynthParams(synth, audioContext);

    console.log("DROP requested on:", destText, "->", destNorm);

    const candidates = params
      .map((p) => {
        let score = 0;
        const labelNorm = normalizeTranscript(p.label || "");
        const idNorm = normalizeTranscript(p.id || "");
        const groupNorm = normalizeTranscript(p.group || "");
        if (labelNorm.includes(destNorm)) score += 3;
        if (idNorm.includes(destNorm)) score += 2;
        if (groupNorm.includes(destNorm)) score += 1;
        // Reverse, in case user said "detune oscillator one"
        if (destNorm.includes(labelNorm) && labelNorm.length > 0) score += 2;
        if (destNorm.includes(idNorm) && idNorm.length > 0) score += 1;
        if (destNorm.includes(groupNorm) && groupNorm.length > 0) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    console.log(
      "DROP candidates:",
      candidates.map((c) => ({
        id: c.p.id,
        label: c.p.label,
        group: c.p.group,
        score: c.score,
      }))
    );

    const best = candidates.find((c) => c.score > 0);
    if (!best) {
      announce(`Couldn't find destination "${destText}"`);
      return;
    }
    const targetParam = best.p;
    const slider = document.getElementById(targetParam.id);
    if (!slider || slider.type !== "range") {
      announce(`Destination ${targetParam.label} is not a mod target`);
      return;
    }
    // Attach modulation
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const range = max - min;
    const originalVal = parseFloat(slider.value);
    const target = {
      id: targetParam.id,
      slider,
      originalVal,
      range,
      depth: 1.0,
    };
    window.voicePickupLFO.targets.push(target);
    attachModRing(target);
    slider.classList.add("modulated");
    announce(
      `Dropped ${window.voicePickupLFO.id.toUpperCase()} on ${
        targetParam.label
      }`
    );
    window.voicePickupLFO = null;
    return;
  }

  // ----------- PARAMETER MATCHING -----------
  const params = getSynthParams(synth, audioContext);
  const candidates = params.map((p) => {
    let score = 0;
    if (p.label && normTranscript.includes(normalizeTranscript(p.label)))
      score += 3;
    if (p.id && normTranscript.includes(normalizeTranscript(p.id))) score += 2;
    if (p.group && normTranscript.includes(normalizeTranscript(p.group)))
      score += 1;
    if (
      p.label &&
      p.group &&
      normTranscript.includes(normalizeTranscript(p.label)) &&
      normTranscript.includes(normalizeTranscript(p.group))
    )
      score += 2;
    return { p, score };
  });

  candidates.sort((a, b) => b.score - a.score);

  console.table(
    candidates.map((c) => ({
      id: c.p.id,
      label: c.p.label,
      group: c.p.group,
      score: c.score,
    }))
  );

  const best = candidates.find((c) => c.score > 0);
  if (!best) {
    announce(`Sorry, didn't understand "${transcript}"`);
    return;
  }

  const p = best.p;
  let value = null;

  // --- Extract last number in the phrase, not the first ---
  const numMatches = lower.match(/([+-]?[0-9]+(\.[0-9]+)?)/g);
  const lastNum = numMatches ? numMatches[numMatches.length - 1] : null;

  // Custom logic for checkboxes, especially dualFilter-routing
  if (p.type === "checkbox") {
    if (p.id === "dualFilter-routing") {
      if (normTranscript.includes("serial")) {
        value = true;
      } else if (normTranscript.includes("parallel")) {
        value = false;
      } else {
        value =
          normTranscript.includes("on") ||
          normTranscript.includes("enable") ||
          normTranscript.includes("yes");
        if (
          normTranscript.includes("off") ||
          normTranscript.includes("disable") ||
          normTranscript.includes("no")
        )
          value = false;
      }
    } else {
      value =
        normTranscript.includes("on") ||
        normTranscript.includes("enable") ||
        normTranscript.includes("yes");
      if (
        normTranscript.includes("off") ||
        normTranscript.includes("disable") ||
        normTranscript.includes("no")
      )
        value = false;
    }
  } else if (p.options) {
    const opt = p.options.find(
      (o) =>
        lower.includes(o.label.toLowerCase()) ||
        lower.includes(String(o.value).toLowerCase())
    );
    if (opt) value = opt.value;
    else if (lastNum) value = lastNum;
    else {
      const wordNum = wordsToNumber(lower);
      if (wordNum !== null) value = wordNum;
    }
  } else if (lastNum) {
    value = lastNum;
  } else {
    const wordNum = wordsToNumber(lower);
    if (wordNum !== null) value = wordNum;
  }

  if (value !== null) {
    p.apply(value);

    // ------ Custom announcement label logic ------
    let announceValue = value;
    if (p.id === "dualFilter-routing") {
      announceValue = value ? "Serial" : "Parallel";
    } else if (p.type === "checkbox" && Array.isArray(p.toggleLabels)) {
      announceValue = value ? p.toggleLabels[1] : p.toggleLabels[0];
    }

    announce(`Set ${p.label} to ${announceValue}`);

    // ------ Update UI ------
    const input = document.getElementById(p.id);

    if (p.type === "checkbox" && input && input.tagName === "BUTTON") {
      input.setAttribute("aria-pressed", value);
      const [offLabel = "OFF", onLabel = "ON"] = p.toggleLabels || [];
      input.textContent =
        p.id === "dualFilter-routing"
          ? value
            ? "Serial"
            : "Parallel"
          : value
          ? onLabel
          : offLabel;
      input.setAttribute(
        "aria-label",
        `${p.label} ${
          p.id === "dualFilter-routing"
            ? value
              ? "Serial"
              : "Parallel"
            : value
            ? onLabel
            : offLabel
        }`
      );
    }

    if (input && input.tagName !== "BUTTON") {
      input.value = value;
      input.dispatchEvent(new Event("input"));
    }
  } else {
    announce(`Heard "${transcript}", but didn't get a value for ${p.label}`);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "v" && !e.repeat && recognition) {
    recognition.start();
  }
});

function announce(msg) {
  if (announceMode === "aria") {
    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = msg;
      }, 10);
    }
  } else if (announceMode === "speech") {
    if ("speechSynthesis" in window) {
      // Cancel any current speech
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(msg);
      utter.rate = 1.1;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    }

    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = msg;
    }
  }
}

const dualFilter = new tuna.DualFilter({
  typeA: "lowpass",
  freqA: 800,
  qA: 4,
  typeB: "lowpass",
  freqB: 1200,
  qB: 3,
});

const morphingFilter = new tuna.MorphingFilter({
  typeA: "lowpass",
  typeB: "highpass",
  freqA: 300,
  freqB: 6000,
  resonanceA: 5,
  resonanceB: 3,
  lfoFrequency: 0.4,
  lfoDepth: 0.35,
  morph: 0.5,
  outputGain: 0.8,
});

const delay = new tuna.Delay({
  bypass: true,
  delayTime: 200,
  feedback: 0.4,
  cutoff: 20000,
  wetLevel: 0.0,
  dryLevel: 1.0,
});

const distortion = new tuna.Distortion({
  curveAmount: 500,
  drive: 5,
  oversample: "2x",
  bypass: true,
});

const ringMod = new tuna.RingModulator({
  modFrequency: 50,
  modDepth: 1,
  bypass: true,
});

const verb = new tuna.Convolver({
  bypass: true,
  highCut: 20,
  lowCut: 22050,
  dryLevel: 1,
  wetLevel: 1,
  level: 1,
  impulseDuration: 1,
  impulseDecay: 1,
});

const gainFilter = audioContext.createGain();
const gainFeedback = audioContext.createGain();
const merger = audioContext.createGain();

node.connect(dualFilter.input);
node.connect(morphingFilter.input);

dualFilter.connect(gainFilter);
morphingFilter.connect(gainFeedback);

gainFilter.connect(merger);
gainFeedback.connect(merger);

merger.connect(delay.input);
delay.connect(distortion.input);
distortion.connect(ringMod.input);
ringMod.connect(verb.input);
verb.connect(audioContext.destination);

const waveTableMap = {};
const waveFiles = [];
let keyboardOctave = 0;

// Define folders and their specific patterns
const waveSources = [
  { folder: "Distorted", prefix: "Distorted", count: 20 },
  { folder: "Bass", prefix: "Bass", count: 20 },
  { folder: "Granular", prefix: "Granular", count: 20 },
  { folder: "Fm", prefix: "Fm", count: 20 },
  { folder: "OscChip", prefix: "OscChip", count: 20 },
];

// Generate full file paths
for (const source of waveSources) {
  const { folder, prefix, count } = source;
  for (let i = 1; i <= count; i++) {
    const filename = `${prefix}${i}.wav`;
    const filePath = `${folder}/${filename}`;
    waveFiles.push(filePath);
  }
}

// Load and store wave data
for (const filePath of waveFiles) {
  const data = await loadWave(filePath);
  waveTableMap[filePath] = data; // Use filePath as the key
}

const envelopeState = {
  attackTime: 0.01,
  decayTime: 0.2,
  sustainLevel: 0.7,
  releaseTime: 0.5,
};

let currentWaveA1 = "Bass/Bass3.wav";
let currentWaveB1 = "Bass/Bass4.wav";
let currentWaveA2 = "Granular/Granular2.wav";
let currentWaveB2 = "Fm/Fm5.wav";

node.port.postMessage({
  type: "lfo",
  data: { rate: 5.0, depth: 0.3 },
});

node.port.postMessage({
  type: "lfoTarget",
  data: "both",
});

const synth = {
  node,
  currentModAmount: 0,
  volume1: 1.0,
  volume2: 1.0,
  waveFiles,
  dualFilter,
  morphingFilter,
  gainFilter,
  gainFeedback,
  effectMerger: merger,
  currentModAmount: 0,
  currentLfoRate: 0.0,
  currentLfoDepth: 0.0,
  currentLfoShape: "sine",
  delay,
  distortion,
  ringMod,
  verb,

  updateWave(osc, filename) {
    if (osc === "osc1A") currentWaveA1 = filename;
    if (osc === "osc1B") currentWaveB1 = filename;
    if (osc === "osc2A") currentWaveA2 = filename;
    if (osc === "osc2B") currentWaveB2 = filename;
    const waveA1 = waveTableMap[currentWaveA1];
    const waveB1 = waveTableMap[currentWaveB1];
    const waveA2 = waveTableMap[currentWaveA2];
    const waveB2 = waveTableMap[currentWaveB2];
    if (waveA1 && waveB1) {
      node.port.postMessage({
        type: "wavePair",
        data: { target: "osc1", waveA: waveA1, waveB: waveB1 },
      });
    }
    if (waveA2 && waveB2) {
      node.port.postMessage({
        type: "wavePair",
        data: { target: "osc2", waveA: waveA2, waveB: waveB2 },
      });
    }
  },
  setDetune(detune1, detune2) {
    node.port.postMessage({ type: "detune", data: { detune1, detune2 } });
  },
  setMorph(value) {
    node.port.postMessage({ type: "morph", data: value });
  },
  setModAmount(value) {
    this.currentModAmount = value; // optional for UI state
    node.port.postMessage({ type: "modAmount", data: value });
  },
  setEnvelope(update) {
    Object.assign(envelopeState, update);
    node.port.postMessage({ type: "envelope", data: envelopeState });
  },
  triggerAttack(noteName, _time, velocity = 1.0) {
    const midi = Tone.Frequency(noteName).toMidi();
    node.port.postMessage({
      type: "noteOn",
      data: { note: midi, velocity: velocity * 127 },
    });
  },
  triggerRelease(noteName) {
    const midi = Tone.Frequency(noteName).toMidi();
    node.port.postMessage({ type: "noteOff", data: { note: midi } });
  },
  noteOn(note, velocity) {
    node.port.postMessage({
      type: "noteOn",
      data: { note, velocity: velocity * 127 },
    });
  },
  noteOff(note) {
    node.port.postMessage({ type: "noteOff", data: { note } });
  },
  setEffectMix(value) {
    this.gainFilter.gain.value = 1 - value;
    this.gainFeedback.gain.value = value;
  },
  setPitchBend(bend) {
    node.port.postMessage({ type: "pitchBend", data: bend });
  },
};

synth.currentLfoRate = 0.01;
synth.currentLfoDepth = 0.0;
synth.node.port.postMessage({ type: "lfo", data: { rate: 0.01, depth: 0.0 } });

const params = getSynthParams(synth, audioContext);

const modWheelContainer = document.createElement("div");
modWheelContainer.className = "mod-src-block";

// Mod wheel dest select
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

// Mod wheel amount slider
function createAmountSlider(id, labelText, initial = 1) {
  const wrapper = document.createElement("div");
  wrapper.className = `slider-container`;
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
  slider.className = "mod-amount-slider";
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

const { wrapper: modWheelAmountWrap, slider: modWheelSlider } =
  createAmountSlider("modwheel-amount", "Amount", modWheelAmount);

modWheelSlider.addEventListener("input", (e) => {
  modWheelAmount = parseFloat(e.target.value);
});
modWheelContainer.appendChild(modWheelAmountWrap);

// Add to UI
document.getElementById("mod-ui").appendChild(modWheelContainer);

// === Aftertouch Controls ===
let aftertouchDestId = null;
let aftertouchAmount = 1.0;

const aftertouchContainer = document.createElement("div");
aftertouchContainer.className = "mod-src-block";
aftertouchContainer.style.marginTop = "10px";

// Aftertouch dest select
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

// Aftertouch amount slider
const { wrapper: aftertouchAmountWrap, slider: aftertouchSlider } =
  createAmountSlider("aftertouch-amount", "Amount", aftertouchAmount);

aftertouchSlider.addEventListener("input", (e) => {
  aftertouchAmount = parseFloat(e.target.value);
});
aftertouchContainer.appendChild(aftertouchAmountWrap);

// Add to UI
document.getElementById("mod-ui").appendChild(aftertouchContainer);

// === HANDLERS (use modWheelAmount & aftertouchAmount) ===

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

synth.setAftertouch = (value) => {
  if (!aftertouchDestId) return;
  const params = getSynthParams(synth, audioContext);
  const targetParam = params.find((p) => p.id === aftertouchDestId);
  if (!targetParam) return;

  const input = document.getElementById(targetParam.id);

  // Always use the last known base value
  let base = baseParamValues[targetParam.id];
  if (base === undefined && input) {
    base = parseFloat(input.value);
    baseParamValues[targetParam.id] = base;
  }
  if (base === undefined) {
    base = parseFloat(targetParam.value); // fallback to param default
    baseParamValues[targetParam.id] = base;
  }

  const min = parseFloat(targetParam.min ?? 0);
  const max = parseFloat(targetParam.max ?? 1);
  const range = max - min;
  const modded = base + value * aftertouchAmount * range * 0.5;

  // Clamp
  const clamped = Math.max(min, Math.min(max, modded));
  isModulating = true;
  targetParam.apply(clamped);

  if (input) {
    input.value = clamped;
    input.dispatchEvent(new Event("input"));
  }
  isModulating = false;

  // When aftertouch returns to 0, restore the *base* value
  if (value === 0) {
    isModulating = true;
    targetParam.apply(base);
    if (input) {
      input.value = base;
      input.dispatchEvent(new Event("input"));
    }
    isModulating = false;
  }
};

synth.uiLfos = [createUiLfo("lfo1"), createUiLfo("lfo2"), createUiLfo("lfo3")];

function createUiLfo(id) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const out = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.value = 1;
  gain.gain.value = 0.5;
  out.gain.value = 1;

  osc.connect(gain).connect(out);
  osc.start();

  return {
    id,
    osc,
    gain,
    out,
    rate: 1,
    depth: 0.5,
    targets: [],
  };
}

synth.fxLfo = {
  osc: audioContext.createOscillator(),
  gain: audioContext.createGain(),
  offset: audioContext.createConstantSource(),
  invertGain: audioContext.createGain(),
  rate: 0.2,
  depth: 0.5,
  bypass: true,
};

synth.fxLfo.osc.type = "sine";
synth.fxLfo.osc.frequency.value = synth.fxLfo.rate;
synth.fxLfo.gain.gain.value = synth.fxLfo.depth;
synth.fxLfo.offset.offset.value = 1;
synth.fxLfo.invertGain.gain.value = -1;

synth.fxLfo.osc.connect(synth.fxLfo.gain);
synth.fxLfo.gain.connect(synth.gainFeedback.gain);

synth.fxLfo.offset.connect(synth.fxLfo.invertGain);
synth.fxLfo.gain.connect(synth.fxLfo.invertGain);
synth.fxLfo.invertGain.connect(synth.gainFilter.gain);

synth.fxLfo.osc.start();
synth.fxLfo.offset.start();

// Control methods
synth.setFxLfoRate = (val) => {
  synth.fxLfo.rate = val;
  synth.fxLfo.osc.frequency.setValueAtTime(val, audioContext.currentTime);
};
synth.setFxLfoDepth = (val) => {
  synth.fxLfo.depth = val;
  synth.fxLfo.gain.gain.setValueAtTime(val, audioContext.currentTime);
};

synth.setFxLfoBypass = (bypass) => {
  synth.fxLfo.bypass = bypass;
  if (!bypass) {
    synth.fxLfo.osc.connect(synth.fxLfo.gain);
    synth.fxLfo.offset.connect(synth.fxLfo.invertGain);
    synth.fxLfo.gain.connect(synth.gainFeedback.gain);
    synth.fxLfo.gain.connect(synth.fxLfo.invertGain);
    synth.fxLfo.invertGain.connect(synth.gainFilter.gain);
  } else {
    try {
      synth.fxLfo.osc.disconnect();
    } catch (e) {}
    try {
      synth.fxLfo.gain.disconnect();
    } catch (e) {}
    try {
      synth.fxLfo.offset.disconnect();
    } catch (e) {}
    try {
      synth.fxLfo.invertGain.disconnect();
    } catch (e) {}
  }
};

synth.setFxLfoBypass(synth.fxLfo.bypass);

const keyToNote = {
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
};

const heldKeys = new Set();

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "z") {
    keyboardOctave = Math.max(-2, keyboardOctave - 1);
    console.log("Octave down:", keyboardOctave);
    return;
  } else if (e.key === "x") {
    keyboardOctave = Math.min(5, keyboardOctave + 1);
    console.log("Octave up:", keyboardOctave);
    return;
  }

  const semitoneOffset = keyToNote[e.key];
  if (semitoneOffset !== undefined && !heldKeys.has(e.key)) {
    heldKeys.add(e.key);
    const midiNote = 60 + keyboardOctave * 12 + semitoneOffset;
    synth.noteOn(midiNote, 1.0);
  }
});

window.addEventListener("keyup", (e) => {
  const semitoneOffset = keyToNote[e.key];
  if (semitoneOffset !== undefined) {
    heldKeys.delete(e.key);
    const midiNote = 60 + keyboardOctave * 12 + semitoneOffset;
    synth.noteOff(midiNote);
  }
});

async function loadWave(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const buffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  return audioBuffer.getChannelData(0).slice();
}

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() !== "p") return;
  const el = document.activeElement;
  // Pick up LFO (from focused lfo-source)
  if (el.classList.contains("lfo-source")) {
    const lfoId = el.dataset.lfoId;
    const lfo = synth.uiLfos.find((l) => l.id === lfoId);
    if (!lfo) return;
    keyboardPickupLFO = lfo;
    el.classList.add("pickup-mode");
    console.log(`🎯 Picked up ${lfo.id} for drop`);
    announce(`Picked up ${lfo.id} for drop`);
    return;
  }
  // Drop onto a slider
  if (
    el.tagName === "INPUT" &&
    el.type === "range" &&
    el.dataset.paramId &&
    keyboardPickupLFO
  ) {
    const slider = el;
    const paramId = slider.dataset.paramId;
    // Prevent duplicate
    if (keyboardPickupLFO.targets.some((t) => t.slider === slider)) {
      announce(`Warning Already Assigned`);
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

    keyboardPickupLFO.targets.push(target);
    attachModRing(target);
    slider.classList.add("modulated");
    announce(`Dropped ${keyboardPickupLFO.id} on ${paramId}`);
    // Clear pickup
    document
      .querySelectorAll(".lfo-source")
      .forEach((el) => el.classList.remove("pickup-mode"));
    keyboardPickupLFO = null;
    return;
  }
  if (
    e.shiftKey &&
    el.tagName === "INPUT" &&
    el.type === "range" &&
    el.dataset.paramId
  ) {
    const slider = el;
    for (const lfo of synth.uiLfos) {
      const before = lfo.targets.length;
      lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
      const after = lfo.targets.length;
      if (before !== after) {
        slider.classList.remove("modulated");
        slider
          .closest(".range-knob-wrapper")
          ?.querySelector(".mod-ring")
          ?.remove();
        announce(`Removed mod from ${slider.dataset.paramId}`);
      }
    }
  }
});

function getModColor(depth) {
  const stops = [
    [0.0, [255, 0, 0]], // Red
    [0.25, [255, 255, 0]], // Yellow
    [0.5, [0, 255, 0]], // Green
    [0.75, [0, 255, 255]], // Cyan
    [1.0, [0, 128, 255]], // Blue
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [p1, c1] = stops[i];
    const [p2, c2] = stops[i + 1];

    if (depth >= p1 && depth <= p2) {
      const t = (depth - p1) / (p2 - p1);
      const lerp = (a, b, t) => a + (b - a) * t;
      const r = Math.round(lerp(c1[0], c2[0], t));
      const g = Math.round(lerp(c1[1], c2[1], t));
      const b = Math.round(lerp(c1[2], c2[2], t));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return `rgb(255, 0, 255)`; // Magenta for error
}

export function attachModRing(target) {
  const wrapper = target.slider.closest(".range-knob-wrapper");
  if (!wrapper) return;

  const existing = wrapper.querySelector(".mod-ring");
  if (existing) existing.remove();
  function updateModRingVisuals(modRing, depth) {
    const angle = depth * 270;
    modRing.style.transform = `rotate(${angle - 135}deg)`;
    // Color based on depth
    const color = getModColor(depth);
    modRing.style.outlineColor = color;
    modRing.style.boxShadow = `0 0 6px ${color}`;
  }
  const modRing = document.createElement("div");
  modRing.className = "mod-ring";
  modRing.dataset.depth = target.depth.toFixed(2);
  modRing.setAttribute("tabindex", "0");
  modRing.setAttribute("role", "slider");
  modRing.setAttribute("aria-valuemin", "0");
  modRing.setAttribute("aria-valuemax", "1");
  modRing.setAttribute("aria-valuenow", target.depth.toFixed(2));
  modRing.setAttribute("aria-label", `Mod depth for ${target.id}`);
  updateModRingVisuals(modRing, target.depth);
  wrapper.appendChild(modRing);

  let isAdjusting = false;
  let startY = 0;
  let startDepth = 0;

  modRing.addEventListener("mousedown", (e) => {
    if (e.shiftKey) {
      // Shift + click removes modulation
      e.preventDefault();
      const slider = target.slider;
      for (const lfo of synth.uiLfos) {
        const before = lfo.targets.length;
        lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
        const after = lfo.targets.length;
        if (before !== after) {
          slider.classList.remove("modulated");
          modRing.remove();
          announce(`Removed mod from ${slider.dataset.paramId}`);
        }
      }
      return;
    }
    // Normal drag to adjust depth
    e.preventDefault();
    isAdjusting = true;
    startY = e.clientY;
    startDepth = target.depth;
    document.body.classList.add("mod-dragging");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isAdjusting) return;
    const delta = startY - e.clientY;
    let newDepth = startDepth + delta * 0.005;
    newDepth = Math.max(0, Math.min(1, newDepth));
    target.depth = newDepth;
    modRing.dataset.depth = newDepth.toFixed(2);
    modRing.setAttribute("aria-valuenow", newDepth.toFixed(2));
    updateModRingVisuals(modRing, newDepth);
  });

  document.addEventListener("mouseup", () => {
    if (isAdjusting) {
      isAdjusting = false;
      document.body.classList.remove("mod-dragging");
    }
  });

  modRing.addEventListener("keydown", (e) => {
    let step = 0.05;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      target.depth = Math.min(1, target.depth + step);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      target.depth = Math.max(0, target.depth - step);
    } else {
      return;
    }
    // Update visuals + ARIA
    modRing.dataset.depth = target.depth.toFixed(2);
    modRing.setAttribute("aria-valuenow", target.depth.toFixed(2));
    updateModRingVisuals(modRing, target.depth);

    e.preventDefault(); // prevent page scroll etc
  });
}

document.getElementById("start").addEventListener("click", function () {
  this.classList.add("hidden");
});

const startButton = document.getElementById("start");
startButton.addEventListener("click", async () => {
  await audioContext.resume();
  synth.updateWave("osc1A", currentWaveA1);
  synth.updateWave("osc1B", currentWaveB1);
  synth.updateWave("osc2A", currentWaveA2);
  synth.updateWave("osc2B", currentWaveB2);

  console.log("Osc1A:", currentWaveA1);
  console.log("Osc1B:", currentWaveB1);
  console.log("Osc2A:", currentWaveA2);
  console.log("Osc2B:", currentWaveB2);

  const params = getSynthParams(synth, audioContext);

  function applyGradientSettingToNewElements() {
    const gradientsEnabled =
      localStorage.getItem("gradientsEnabled") === "true";
    $(".panel, .slider-container").each(function () {
      $(this).toggleClass("no-gradient", !gradientsEnabled);
    });
  }

  buildSynthUI(params, "synth-ui");
  applyGradientSettingToNewElements();

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

      slider.addEventListener("mousedown", (e) => {
        if (e.shiftKey) {
          e.preventDefault(); // avoid interfering with dragging/focus
          for (const lfo of synth.uiLfos) {
            const before = lfo.targets.length;
            lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
            const after = lfo.targets.length;

            if (before !== after) {
              console.log(
                `🗑️ Removed ${before - after} LFO mod(s) from ${
                  slider.dataset.paramId
                }`
              );
              slider.classList.remove("modulated");
              slider
                .closest(".range-knob-wrapper")
                ?.querySelector(".mod-ring")
                ?.remove();
            }
          }
        }
      });

      slider.addEventListener("drop", (e) => {
        e.preventDefault();
        slider.classList.remove("drop-target");

        const lfoId = e.dataTransfer.getData("text/plain");
        const lfo = synth.uiLfos.find((l) => l.id === lfoId);
        if (!lfo) return;

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
        lfo.targets.push(target);
        attachModRing(target);

        slider.classList.add("modulated");
        console.log(`✅ ${lfoId} assigned to ${paramId}`);
      });
    });

  await setupMIDI(synth);
  await initMIDILearn();
  enableMIDILearnMode("synth-ui");
  renderAudioPresetList("audio-preset-list", synth);
});

document.querySelectorAll(".lfo-source").forEach((el) => {
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", el.dataset.lfoId);
  });
});

function lfoWaveformSample(shape, phase) {
  switch (shape) {
    case "sine":
      return Math.sin(2 * Math.PI * phase);
    case "square":
      return phase < 0.5 ? 1 : -1;
    case "triangle":
      return 4 * Math.abs(phase - 0.5) - 1;
    case "sawtooth":
      return 2 * (phase - Math.floor(phase + 0.5));
    default:
      return Math.sin(2 * Math.PI * phase); // fallback
  }
}

function animateLfos() {
  requestAnimationFrame(animateLfos);
  const now = audioContext.currentTime;

  for (const lfo of synth.uiLfos) {
    const phase = (now * lfo.rate) % 1;
    const shape = lfo.osc.type;
    const baseWave = lfoWaveformSample(shape, phase);
    const lfoVal = baseWave * lfo.depth;

    for (const target of lfo.targets) {
      const modulatedVal =
        target.originalVal + lfoVal * target.range * target.depth;

      const clamped = Math.min(
        parseFloat(target.slider.max),
        Math.max(parseFloat(target.slider.min), modulatedVal)
      );

      target.slider.value = clamped;
      target.slider.dispatchEvent(new Event("input"));
    }
  }
}

animateLfos();

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
    e.preventDefault(); // prevent accidental form submission
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
      saveAudioPreset(name, "synth-ui", synth);
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
    exportAudioPreset(filename);
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
      importAudioPreset(file, name, synth);
    }
  });
