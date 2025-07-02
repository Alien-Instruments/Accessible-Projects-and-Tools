import { loadScript } from "./utils/loadScript.js";
import { accentPresets } from "./accentPresets.js";
import { letterToPhonemes } from "./letterToPhonemes.js";
import { setupMIDI, registerMIDIHandler } from "./midi.js";
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
import { connectToFXChain } from "./master-fx.js";
import { audioCtx } from "./audioCtx.js";
await loadScript("src/tuna.js");

let currentPitch = 60;
const activeVoices = new Map();

let selectedAccent = "english-us";
let prevFormants = [0, 0, 0];
let consonantBoost = 2;
let formantMorph = 0;
let robotTalkMode = false;
let lastVowelFreq = null;
let vibratoDepth = 0.02;
let vibratoRate = 6;
let robotSingerMode = false;
let keyboardOctave = 0;
// ---- Main: Speak Word/Phoneme Sequence ----
function speakPhonemes(
  input,
  note = currentPitch,
  velocity = 1,
  accent = selectedAccent
) {
  const voices = [];
  let time = audioCtx.currentTime;
  const preset = accentPresets[accent];

  let stressNext = false;
  // Split input: ARPAbet (space or dash separated), IPA, or raw letters
  const phonemes = parsePhonemeInput(input);

  // Robotic quantized step (eighth or sixteenth note)
  let phonemeStep = robotSingerMode ? 0.18 : 0.32;
  let robotPitch = 48;
  let usePitch = robotTalkMode ? robotPitch : note;

  phonemes.forEach((ph, i) => {
    if (ph === "__PAUSE__") {
      time += 0.2;
      return;
    }
    if (ph === "*" || ph === "ˈ") {
      stressNext = true;
      return;
    }
    let v = velocity;
    if (stressNext) {
      v = Math.min(1, v * 1.5);
      stressNext = false;
    }
    // Consonant
    if (preset.consonants[ph]) {
      const spec = preset.consonants[ph];
      switch (spec.type) {
        case "plosive":
          voices.push(...playPlosive(time, spec, v, usePitch));
          break;
        case "fricative":
          voices.push(...playFricative(time, spec, v));
          break;
        case "nasal":
          voices.push(...playNasal(time, spec, v, usePitch));
          break;
        case "semivowel":
          voices.push(...playSemivowel(time, spec, v, usePitch));
          break;
        case "liquid":
          voices.push(...playLiquid(time, spec, v, usePitch));
          break;
        case "aspirate":
          voices.push(...playFricative(time, spec, v));
          break;
        case "trill":
          voices.push(...playTrill(time, spec, v, usePitch));
          break;
        case "affricate":
          voices.push(...playAffricate(time, spec, v, usePitch));
          break;
        case "tap":
          voices.push(...playTap(time, spec, v, usePitch));
          break;
      }
      time += robotSingerMode ? phonemeStep * 0.7 : 0.06;
    }
    // Vowel
    else if (preset.vowels[ph]) {
      const f = preset.vowels[ph];
      voices.push(...playVowelGlide(f, time, usePitch, v));
      time += phonemeStep;
    }
    // Letter fallback
    else if (letterToPhonemes[ph]) {
      const vowelKey = letterToPhonemes[ph];
      if (preset.vowels[vowelKey]) {
        voices.push(
          ...playVowelGlide(preset.vowels[vowelKey], time, usePitch, v)
        );
        time += phonemeStep;
      }
    }
  });
  activeVoices.set(note, voices);
}

// ---- Phoneme Parsing ----
function parsePhonemeInput(input) {
  input = input.trim();
  // If input has spaces, process each word, insert pause between words
  if (/\s/.test(input)) {
    const words = input.split(/\s+/).filter(Boolean);
    let phonemes = [];
    words.forEach((word, i) => {
      if (i > 0) phonemes.push("__PAUSE__"); // Add pause marker between words
      phonemes.push(...parsePhonemeInput(word));
    });
    return phonemes;
  }
  // ARPAbet/IPA separated by dash
  if (/-/.test(input)) {
    return input
      .split(/-+/)
      .filter(Boolean)
      .map((x) => x.toUpperCase());
  }
  // IPA unicode vowels/consonants (e.g., hɛloʊ)
  if (/[ˈˌɑɛɪʊɔʃʒθðŋ]/i.test(input)) {
    return input.split("");
  }
  // fallback: use letterToPhonemes for English spelling
  return letterToPhonemes(input);
}

// ---- Synthesis Primitives ----
function playPlosive(time, spec, velocity, note) {
  return playNoiseBurst(
    time,
    spec.burst,
    0.02 * velocity * consonantBoost,
    0.08
  );
}
function playFricative(time, spec, velocity) {
  return playNoiseBurst(
    time,
    spec.noise,
    0.01 * velocity * consonantBoost,
    0.13
  );
}
function playNasal(time, spec, velocity, note) {
  return playVowelGlide(
    spec.formants,
    time,
    note,
    velocity * 0.4 * consonantBoost,
    0.2
  );
}
function playLiquid(time, spec, velocity, note) {
  return playVowelGlide(
    spec.formants,
    time,
    note,
    velocity * 0.5 * consonantBoost,
    0.18
  );
}

function playTrill(time, spec, velocity, note) {
  // Trill as 3–4 fast "liquid" pulses, each very short
  const nTaps = 3 + Math.floor(2 * velocity);
  const tapDuration = 0.045;
  const gap = 0.01;
  const voices = [];
  for (let i = 0; i < nTaps; ++i) {
    voices.push(
      ...playVowelGlide(
        spec.formants,
        time + i * (tapDuration + gap),
        note,
        velocity * 0.6,
        tapDuration
      )
    );
  }
  return voices;
}

function playTap(time, spec, velocity, note) {
  return playVowelGlide(spec.formants, time, note, velocity * 0.7, 0.06);
}

function playSemivowel(time, spec, velocity, note) {
  return playVowelGlide(spec.formants, time, note, velocity * 0.6, 0.14);
}

function playAffricate(time, spec, velocity, note) {
  // Plosive burst
  const burst = playNoiseBurst(
    time,
    spec.burst || [2000, 3000], // Frequencies for the "stop"
    0.04 * velocity * consonantBoost, // Louder burst
    0.04 // Short duration for stop
  );
  // Fricative release
  const fricative = playNoiseBurst(
    time + 0.03,
    spec.noise || spec.burst || [2000, 3000], // Default to same freqs if no 'noise'
    0.025 * velocity * consonantBoost, // Softer than burst
    0.09
  );
  return [...burst, ...fricative];
}

function playNoiseBurst(time, freqs, gainLevel, duration) {
  const noise = audioCtx.createBufferSource();
  const buffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * duration,
    audioCtx.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
  noise.buffer = buffer;

  let node = noise;
  freqs.forEach((freq) => {
    const bp = audioCtx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 5;
    node.connect(bp);
    node = bp;
  });

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(gainLevel, time);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  connectToFXChain(gain);
  noise.start(time);
  noise.stop(time + duration);

  return [{ node: noise, gain }];
}

// === Robotized vowel: square/triangle wave, metallic vibrato, precise step timing
function playVowelGlide(
  [f1, f2, f3],
  time,
  midiNote,
  velocity,
  duration = robotSingerMode ? 0.16 : 0.3
) {
  let freq = 440 * Math.pow(2, (midiNote - 69) / 12);

  const osc = audioCtx.createOscillator();
  osc.type = robotSingerMode ? "square" : "sawtooth";
  if (lastVowelFreq && Math.abs(lastVowelFreq - freq) > 0.01) {
    osc.frequency.setValueAtTime(lastVowelFreq, time); // start from previous
    osc.frequency.linearRampToValueAtTime(freq, time + duration * 0.8); // glide
  } else {
    osc.frequency.value = freq;
  }
  lastVowelFreq = freq;

  if (true) {
    addLFO(osc.frequency, {
      type: "sine",
      rate: vibratoRate,
      depth: freq * vibratoDepth,
      time,
      duration,
    });
  }

  let lfo, lfoGain;
  if (robotSingerMode) {
    lfo = audioCtx.createOscillator();
    lfo.type = "triangle";
    lfo.frequency.value = 6.2;
    lfoGain = audioCtx.createGain();
    lfoGain.gain.value = freq * 0.011;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(time);
    lfo.stop(time + duration);
  }

  // Metallic bandpass stack (robotic: higher Q and slightly more formant boost)
  const bandpass = (target, prev) => {
    const f = audioCtx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(prev || target, time);
    f.frequency.linearRampToValueAtTime(target, time + 0.09);
    f.Q.value = robotSingerMode ? 22 : 15;
    return f;
  };

  // Shift all formants by formantMorph semitones
  function shiftFormant(f) {
    return f * Math.pow(2, formantMorph / 12);
  }
  const bp1 = bandpass(
    shiftFormant(f1),
    prevFormants[0] ? shiftFormant(prevFormants[0]) : undefined
  );
  const bp2 = bandpass(
    shiftFormant(f2),
    prevFormants[1] ? shiftFormant(prevFormants[1]) : undefined
  );
  const bp3 = bandpass(
    shiftFormant(f3),
    prevFormants[2] ? shiftFormant(prevFormants[2]) : undefined
  );
  prevFormants = [f1, f2, f3];

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.8 * velocity, time + 0.018);
  gain.gain.linearRampToValueAtTime(0.5 * velocity, time + 0.06);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  osc.connect(bp1);
  osc.connect(bp2);
  osc.connect(bp3);
  bp1.connect(gain);
  bp2.connect(gain);
  bp3.connect(gain);
  connectToFXChain(gain);

  osc.start(time);
  osc.stop(time + duration);

  return [{ node: osc, gain }];
}

function addLFO(
  targetParam,
  { type = "sine", rate = 5, depth = 10, time, duration }
) {
  const lfo = audioCtx.createOscillator();
  lfo.type = type;
  lfo.frequency.value = rate;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain);
  lfoGain.connect(targetParam);
  lfo.start(time);
  lfo.stop(time + duration);
  return lfo;
}

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

    const word = document.getElementById("phonemeInput").value.trim();
    const accent = document.getElementById("accentSelect").value;
    speakPhonemes(word, midiNote, 1.0, accent);
  }
});

window.addEventListener("keyup", (e) => {
  const semitoneOffset = keyToNote[e.key];
  if (semitoneOffset !== undefined) {
    heldKeys.delete(e.key);
    const midiNote = 60 + keyboardOctave * 12 + semitoneOffset;
    stopVoicesForNote(midiNote);
  }
});

// ---- MIDI Integration ----
registerMIDIHandler(function (msg) {
  const [status, note, velocity] = msg.data;
  const command = status & 0xf0;

  if (command === 0x90 && velocity > 0) {
    // NOTE ON
    const word = document.getElementById("phonemeInput").value.trim();
    const accent = document.getElementById("accentSelect").value;
    speakPhonemes(word, note, velocity / 127, accent);
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    // NOTE OFF
    stopVoicesForNote(note);
  }
});

// ---- Voice Cleanup ----
function stopVoicesForNote(note) {
  const voices = activeVoices.get(note);
  if (!voices) return;
  const now = audioCtx.currentTime;
  voices.forEach(({ node, gain }) => {
    try {
      gain?.gain.cancelScheduledValues(now);
      gain?.gain.setValueAtTime(gain.gain.value, now);
      gain?.gain.linearRampToValueAtTime(0, now + 0.05);
      node?.stop(now + 0.05);
    } catch (e) {}
  });
  activeVoices.delete(note);
}

// ---- Accent Selector UI Helper ----
function setAccent(accent) {
  if (accentPresets[accent]) selectedAccent = accent;
}

const accentSelect = document.getElementById("accentSelect");

const accentLabels = {
  "english-us": "English (US)",
  "english-rp": "English (RP)",
  "spanish-es": "Spanish (ES)",
  "french-fr": "French (FR)",
  "german-de": "German (DE)",
  "japanese-ja": "Japanese (JA)",
  "italian-it": "Italian (IT)",
  "hindi-hi": "Hindi (HI)",
  "mandarin-zh": "Mandarin (ZH)",
};

for (const key of Object.keys(accentPresets)) {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = accentLabels[key] || key;
  accentSelect.appendChild(opt);
}
accentSelect.value = selectedAccent;

accentSelect.addEventListener("change", (e) => {
  setAccent(e.target.value);
});

const consonantBoostSlider = document.getElementById("consonantBoost");
const consonantBoostValue = document.getElementById("consonantBoostValue");

consonantBoostSlider.addEventListener("input", function (e) {
  consonantBoost = parseFloat(e.target.value);
  consonantBoostValue.textContent = `${consonantBoost.toFixed(1)}×`;
});

const formantMorphSlider = document.getElementById("formantMorph");
const formantMorphValue = document.getElementById("formantMorphValue");

formantMorphSlider.addEventListener("input", function (e) {
  formantMorph = parseInt(e.target.value, 10) || 0;
  formantMorphValue.textContent = formantMorph;
});

const vibratoDepthValue = document.getElementById("vibratoDepthValue");
document.getElementById("vibratoDepth").addEventListener("input", function (e) {
  vibratoDepth = parseFloat(e.target.value);
  vibratoDepthValue.textContent = vibratoDepth.toFixed(3);
});

document
  .getElementById("robotSingerMode")
  .addEventListener("input", function (e) {
    robotSingerMode = e.target.checked;
  });

const vibratoRateInput = document.getElementById("vibratoRate");
const vibratoRateValue = document.getElementById("vibratoRateValue");

vibratoRateInput.addEventListener("input", function (e) {
  vibratoRate = parseFloat(e.target.value);
  vibratoRateValue.textContent = vibratoRate.toFixed(1);
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

window.addEventListener("DOMContentLoaded", () => {
  const custom = document.getElementById("custom");
  const toggleAccess = document.getElementById("toggleAccess");
  if (custom.disabled) {
    toggleAccess.style.display = "none";
  } else {
    toggleAccess.style.display = "";
  }
});

setupMIDI();
initMIDILearn();
enableMIDILearnMode("synth-ui");
renderAudioPresetList();
