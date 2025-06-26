const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let selectedTrack = 0;
let sampleBuffer = null;
const steps = 64;
let currentStep_ = 0;
let intervalId = null;
let activeSteps = 16;
let samplerPage = 0;

const stepCheckboxes = [];
const pitchSelectors = [];
const env = {
  attack: 0.8,
  decay: 0.3,
  maxGain: 1.0,
  minGain: 0.0,
  filterAmount: 300,
  startOffset: 0.0,
  endOffset: 1.0,
  baseCutoff: 500,
};

const sequencer = document.getElementById("sequencer");
const stepCountSelect = document.getElementById("stepCountSelect");
const viewPageSelect = document.getElementById("viewPageSelect");
const tempoSlider2 = document.getElementById("tempoSlider");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

tempoSlider2.addEventListener("input", () => {
  clearInterval(intervalId);
  intervalId = null;
});

startButton.addEventListener("click", () => {
  if (intervalId === null) startSequencer();
});

stopButton.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  currentStep_ = 0;
  highlightSamplerStep(0);
});

function startSequencer() {
  clearInterval(intervalId);
  const bpm = getTempo();
  const interval = (60 / bpm / 4) * 1000; // 16th notes
  intervalId = setInterval(advanceStep, interval);
}

// Create note options: MIDI note names from C3 to C5
const noteOptions2 = [];
for (let i = 48; i <= 72; i++) {
  const name = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ][i % 12];
  noteOptions2.push({ name: name + Math.floor(i / 12 - 1), value: i });
}

for (let i = 0; i < steps; i++) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("sequence-step");
  sequencer.style.display = "flex";
  sequencer.style.flexDirection = "row";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "4px";

  // LCD-style pitch selector
  const select = document.createElement("select");
  select.classList.add("lcd-select");
  select.setAttribute("aria-label", `Sample Note select ${i + 1}`);
  const selectId = `noteSamp-select-${i + 1}`;
  select.id = selectId;
  for (const note of noteOptions2) {
    const opt = document.createElement("option");
    opt.value = note.value;
    opt.textContent = note.name;
    select.appendChild(opt);
  }
  select.value = "60"; // Default to C4
  pitchSelectors.push(select);

  // Main step checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("step");
  const checkSampId = `checkStepSamp-${i + 1}`;
  checkbox.id = checkSampId;
  checkbox.setAttribute("aria-label", `Sample Step ${i + 1}`);
  stepCheckboxes.push(checkbox);

  // Step number label
  const label = document.createElement("label");
  label.textContent = `${i + 1}`;
  label.htmlFor = "sequence-step";
  label.style.textAlign = "center";
  //label.style.width = "100%";

  wrapper.appendChild(select);
  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);
  sequencer.appendChild(wrapper);
}

function updateVisibleSteps() {
  const page = parseInt(viewPageSelect.value);
  const start = page * 16;
  const end = start + 16;

  for (let i = 0; i < steps; i++) {
    const el = stepCheckboxes[i].parentElement;
    el.style.display = i >= start && i < end ? "inline-block" : "none";
  }
}

function highlightSamplerStep(index) {
  stepCheckboxes.forEach((checkbox, i) => {
    checkbox.classList.remove("playing");
  });

  if (stepCheckboxes[index]) {
    stepCheckboxes[index].classList.add("playing");
  }
}

viewPageSelect.addEventListener("change", updateVisibleSteps);

stepCountSelect.addEventListener("change", () => {
  activeSteps = parseInt(stepCountSelect.value);
  if (currentStep_ >= activeSteps) currentStep_ = 0;
});
updateVisibleSteps();

const Filter = audioCtx.createBiquadFilter();
Filter.type = "lowpass";
Filter.frequency.value = 500;
Filter.Q.value = 12;

const samplerVolume = audioCtx.createGain();
samplerVolume.gain.value = 1.0; // Initial master volume

function playSample(pitchMidi) {
  if (!sampleBuffer) return;

  const now = audioCtx.currentTime;

  // Create nodes
  const source = audioCtx.createBufferSource();
  let bufferToUse = sampleBuffer;
  if (document.getElementById("reverseToggle").checked) {
    bufferToUse = audioCtx.createBuffer(
      sampleBuffer.numberOfChannels,
      sampleBuffer.length,
      sampleBuffer.sampleRate
    );

    for (let i = 0; i < sampleBuffer.numberOfChannels; i++) {
      const src = sampleBuffer.getChannelData(i);
      const dst = bufferToUse.getChannelData(i);
      for (let j = 0; j < src.length; j++) {
        dst[j] = src[src.length - j - 1];
      }
    }
  }

  source.buffer = bufferToUse;

  const gainNode = audioCtx.createGain();
  const filter = Filter;
  filter.type = "lowpass";

  // Set pitch
  const semitoneOffset = pitchMidi - 60;
  const playbackRate = Math.pow(2, semitoneOffset / 12);
  source.playbackRate.value = playbackRate;

  // Connect graph: source → filter → gain → master volume → output
  source.connect(Filter);
  Filter.connect(gainNode);
  gainNode.connect(samplerVolume);

  // Volume envelope
  gainNode.gain.setValueAtTime(env.minGain, now);
  gainNode.gain.linearRampToValueAtTime(env.maxGain, now + env.attack);
  gainNode.gain.linearRampToValueAtTime(
    env.minGain,
    now + env.attack + env.decay
  );

  const baseFreq = env.baseCutoff;
  const peakFreq = baseFreq + env.filterAmount;

  Filter.frequency.setValueAtTime(baseFreq, now);
  Filter.frequency.linearRampToValueAtTime(peakFreq, now + env.attack);
  Filter.frequency.linearRampToValueAtTime(
    baseFreq,
    now + env.attack + env.decay
  );

  const duration = sampleBuffer.duration;
  const offset = env.startOffset * duration;
  const end = env.endOffset * duration;

  const safeDuration = Math.max(end - offset, 0.01); // prevent 0 or negative

  source.start(now, offset, safeDuration);
}

samplerVolume.connect(audioCtx.destination);

function advanceStep() {
  highlightSamplerStep(currentStep_);

  if (currentStep_ < activeSteps && stepCheckboxes[currentStep_].checked) {
    const pitch = parseInt(pitchSelectors[currentStep_].value);
    playSample(pitch);
  }
  const currentSamplerPage = Math.floor(currentStep_ / 16);
  if (currentSamplerPage !== samplerPage) {
    samplerPage = currentSamplerPage;
    document.getElementById("viewPageSelect").value = samplerPage;
    updateVisibleSteps();
  }

  currentStep_ = (currentStep_ + 1) % activeSteps;
}

function startSequencer() {
  clearInterval(intervalId);
  const bpm = getTempo();
  const interval = (60 / bpm / 4) * 1000; // 16th notes
  intervalId = setInterval(advanceStep, interval);
}

function getTempo() {
  return parseInt(tempoSlider2.value);
}

async function loadSample(file) {
  const arrayBuffer = await file.arrayBuffer();
  audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
    sampleBuffer = buffer;
    console.log("Sample loaded", buffer);
  });
}

// File input
document.getElementById("fileInput").addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    loadSample(e.target.files[0]);
  }
});

// Drag & drop
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("audio/")) {
    loadSample(file);

    // Update the visible file name label
    document.getElementById("fileName").textContent = file.name;
  }
});

// Resume audio context on user gesture
document.body.addEventListener("click", () => {
  if (audioCtx.state !== "running") {
    audioCtx.resume();
  }
});

const cutoffSlider2 = document.getElementById("sampler-cutoff");
const cutoffValue = document.getElementById("sampler-cutoff-value");
const resonanceSlider2 = document.getElementById("sampler-resonance");
const resonanceValue = document.getElementById("sampler-resonance-value");
const volumeSlider2 = document.getElementById("samplerVolumeSlider");
const volumeValue = document.getElementById("sampler-volume-value");
// Update filter cutoff
cutoffSlider2.addEventListener("input", () => {
  const freq = parseFloat(cutoffSlider2.value);
  env.baseCutoff = freq;
  Filter.frequency.value = freq;
  cutoffValue.textContent = `${freq}Hz`;
});

// Update filter Q (resonance)
resonanceSlider2.addEventListener("input", () => {
  const q = parseFloat(resonanceSlider2.value);
  Filter.Q.value = q;
  resonanceValue.textContent = q.toFixed(1);
});

volumeSlider2.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider2.value);
  samplerVolume.gain.value = volume;
  volumeValue.textContent = `${volume}`;
});

const attackSlider = document.getElementById("attackSlider");
const attackValue = document.getElementById("attackValue");
attackSlider.addEventListener("input", () => {
  env.attack = parseFloat(attackSlider.value);
  attackValue.textContent = `${env.attack.toFixed(2)}s`;
});

const decaySlider2 = document.getElementById("decaySlider");
const decayValue2 = document.getElementById("decayValue");
decaySlider2.addEventListener("input", () => {
  env.decay = parseFloat(decaySlider2.value);
  decayValue2.textContent = `${env.decay.toFixed(2)}s`;
});

const filterAmountSlider = document.getElementById("filterAmountSlider");
const filterAmountValue = document.getElementById("filterAmountValue");
filterAmountSlider.addEventListener("input", () => {
  env.filterAmount = parseFloat(filterAmountSlider.value);
  filterAmountValue.textContent = `${env.filterAmount.toFixed(0)}`;
});

function updateFileName(input) {
  const fileName =
    input.files.length > 0 ? input.files[0].name : "No file chosen";
  document.getElementById("fileName").textContent = fileName;
}

const fileNameDisplay = document.getElementById("fileName");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    fileNameDisplay.textContent = file.name;
  }
});

function updateFileName(input) {
  const fileName =
    input.files.length > 0 ? input.files[0].name : "No file chosen";
  fileNameDisplay.textContent = fileName;
}

const startDisplay = document.getElementById("startDisplay");
const endDisplay = document.getElementById("endDisplay");

document.getElementById("sampleStart").addEventListener("input", (e) => {
  env.startOffset = parseFloat(e.target.value) / 100;
  startDisplay.textContent = `${e.target.value}%`;
});

document.getElementById("sampleEnd").addEventListener("input", (e) => {
  env.endOffset = parseFloat(e.target.value) / 100;
  endDisplay.textContent = `${e.target.value}%`;
});

const factorySamples = {
  VOX: "audio/vox.wav",
  YI: "audio/yi.wav",
  Glitch: "audio/glitch.wav",
  Hit: "audio/hit.wav",
  Smash: "audio/smash.wav",
  Stab: "audio/stab.wav",
  Scratch: "audio/scratch.wav",
  Sting: "audio/sting.wav",
  Robot: "audio/robot.wav",
  Roar: "audio/roar.mp3",
};

const factorySampleSelect = document.getElementById("factorySampleSelect");

for (const [name, path] of Object.entries(factorySamples)) {
  const opt = document.createElement("option");
  opt.value = path;
  opt.textContent = name;
  factorySampleSelect.appendChild(opt);
}

factorySampleSelect.addEventListener("change", async (e) => {
  const url = e.target.value;
  if (!url) return;

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
    sampleBuffer = buffer;
    document.getElementById("fileName").textContent =
      e.target.selectedOptions[0].textContent;
  });
});
