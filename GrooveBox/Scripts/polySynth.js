let polyTotalSteps = 64;
let polyStepsPerPage = 16;
let polyPage = 0;
let polyInterval = null;
let polyActiveSteps = 16;

const polySequencer = document.getElementById("polySequencer");
const noteOptionsPoly = [];
const noteNames = [
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
];

for (let midi = 12; midi <= 108; midi++) {
  const name = noteNames[midi % 12] + Math.floor(midi / 12 - 1);
  noteOptionsPoly.push({ name, value: midi });
}

const chordTypes = {
  None: [],
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  Dim: [0, 3, 6],
  Aug: [0, 4, 8],
  Major7: [0, 4, 7, 11],
  Minor7: [0, 3, 7, 10],
  Dom7: [0, 4, 7, 10],
  Sus2: [0, 2, 7],
  Sus4: [0, 5, 7],
};

const stepsPoly = [];
let currentStepPoly = 0;

const MAX_POLY_VOICES = 16;
const polyVoices = [];

function getPolySynthParams() {
  return {
    osc1Waveform: document.getElementById("osc1-waveform").value,
    osc2Waveform: document.getElementById("osc2-waveform").value,
    detune: parseFloat(document.getElementById("osc2-detune").value),
    osc1Gain: parseFloat(document.getElementById("osc1-gain").value),
    osc2Gain: parseFloat(document.getElementById("osc2-gain").value),
    filterType: document.getElementById("poly-filter-type").value,
    cutoff: parseFloat(document.getElementById("poly-filter-cutoff").value),
    resonance: parseFloat(document.getElementById("poly-filter-q").value),
    ampAttack: parseFloat(document.getElementById("amp-attack").value),
    ampDecay: parseFloat(document.getElementById("amp-decay").value),
    filterAttack: parseFloat(document.getElementById("filter-attack").value),
    filterDecay: parseFloat(document.getElementById("filter-decay").value),
    filterEnvDepth: parseFloat(document.getElementById("filter-depth").value),
  };
}

function setupSliderWithOutput(
  sliderId,
  outputId,
  unit = "",
  formatter = (v) => v
) {
  const slider = document.getElementById(sliderId);
  const output = document.getElementById(outputId);

  if (slider && output) {
    const update = () => {
      output.textContent = formatter(parseFloat(slider.value)) + unit;
    };
    slider.addEventListener("input", update);
    update();
  }
}

setupSliderWithOutput("osc1-gain", "osc-1-gainValue");
setupSliderWithOutput("osc2-gain", "osc-2-gainValue");
setupSliderWithOutput("osc2-detune", "osc-2-detuneValue");
setupSliderWithOutput(
  "poly-filter-cutoff",
  "filter-cutoff-value",
  "Hz",
  Math.round
);
setupSliderWithOutput("poly-filter-q", "filter-q-value", "", (v) =>
  v.toFixed(2)
);
setupSliderWithOutput("amp-attack", "amp-attack-value", "s", (v) =>
  v.toFixed(2)
);
setupSliderWithOutput("amp-decay", "amp-decay-value", "s", (v) => v.toFixed(2));
setupSliderWithOutput("filter-attack", "filter-attack-value", "s", (v) =>
  v.toFixed(2)
);
setupSliderWithOutput("filter-decay", "filter-decay-value", "s", (v) =>
  v.toFixed(2)
);
setupSliderWithOutput("filter-depth", "filter-depth-value", "", Math.round);

function createVoice() {
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  const gain2 = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const ampGain = audioCtx.createGain();

  osc1.connect(gain1).connect(filter);
  osc2.connect(gain2).connect(filter);
  filter.connect(ampGain).connect(audioCtx.destination);

  return { osc1, osc2, gain1, gain2, filter, ampGain, busy: false };
}

for (let i = 0; i < MAX_POLY_VOICES; i++) {
  polyVoices.push(createVoice());
}

function createPolySequencer(stepsCount = 64) {
  polySequencer.innerHTML = "";
  stepsPoly.length = 0;

  for (let i = 0; i < stepsCount; i++) {
    const col = document.createElement("div");
    col.classList.add("sequence-step", "panel");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";

    const chordSelect = document.createElement("select");
    chordSelect.classList.add("lcd-select");
    chordSelect.setAttribute("aria-label", `Chord select ${i + 1}`);
    const chordId = `chordPoly-${i + 1}`;
    chordSelect.id = chordId;
    for (const name in chordTypes) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      chordSelect.appendChild(option);
    }

    const select = document.createElement("select");
    select.classList.add("lcd-select");
    select.setAttribute("aria-label", `Root Note Select ${i + 1}`);
    const notePolyId = `rootNotePoly-${i + 1}`;
    select.id = notePolyId;
    noteOptionsPoly.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.name;
      select.appendChild(option);
    });

    select.value = "48";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("step");
    checkbox.setAttribute("aria-label", `Poly Step ${i + 1}`);
    const polyCheckId = `stepPoly-${i + 1}`;
    checkbox.id = polyCheckId;

    const label = document.createElement("label");
    label.htmlFor = "sequence-step";
    label.textContent = i + 1;
    label.style.textAlign = "center";

    col.appendChild(chordSelect);
    col.appendChild(select);
    col.appendChild(checkbox);
    col.appendChild(label);
    polySequencer.appendChild(col);

    stepsPoly.push({ select, checkbox, chordSelect, element: col });
  }

  updatePolyStepVisibility();
}

function updatePolyStepVisibility() {
  const start = polyPage * polyStepsPerPage;
  const end = start + polyStepsPerPage;
  stepsPoly.forEach((step, index) => {
    step.element.style.display =
      index >= start && index < end ? "flex" : "none";
  });
}

function highlightPolyStep(index) {
  stepsPoly.forEach((step) => step.checkbox.classList.remove("playing"));
  const step = stepsPoly[index];
  step.checkbox.classList.add("playing");
}

function playPolyNote(midi, duration = 0.3) {
  const voice = polyVoices.find((v) => !v.busy);
  if (!voice) return;

  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const params = getPolySynthParams();
  const now = audioCtx.currentTime;

  voice.busy = true;

  voice.osc1 = audioCtx.createOscillator();
  voice.osc2 = audioCtx.createOscillator();
  voice.osc1.type = params.osc1Waveform;
  voice.osc2.type = params.osc2Waveform;
  voice.osc1.frequency.setValueAtTime(freq, now);
  voice.osc2.frequency.setValueAtTime(freq, now);
  voice.osc2.detune.setValueAtTime(params.detune, now);

  voice.gain1.gain.setValueAtTime(params.osc1Gain, now);
  voice.gain2.gain.setValueAtTime(params.osc2Gain, now);

  voice.filter.type = params.filterType;
  voice.filter.frequency.setValueAtTime(params.cutoff, now);
  voice.filter.Q.setValueAtTime(params.resonance, now);

  voice.ampGain.gain.cancelScheduledValues(now);
  voice.ampGain.gain.setValueAtTime(0.0001, now);
  const masterGain = 0.2; // or whatever feels right
  voice.ampGain.gain.linearRampToValueAtTime(
    masterGain,
    now + params.ampAttack
  );

  voice.ampGain.gain.linearRampToValueAtTime(
    0.0001,
    now + params.ampAttack + params.ampDecay
  );

  const peakFreq = params.cutoff + params.filterEnvDepth;
  voice.filter.frequency.linearRampToValueAtTime(
    peakFreq,
    now + params.filterAttack
  );
  voice.filter.frequency.linearRampToValueAtTime(
    params.cutoff,
    now + params.filterAttack + params.filterDecay
  );

  voice.osc1.connect(voice.gain1).connect(voice.filter);
  voice.osc2.connect(voice.gain2).connect(voice.filter);
  voice.filter.connect(voice.ampGain).connect(audioCtx.destination);

  voice.osc1.start(now);
  voice.osc2.start(now);
  voice.osc1.stop(now + duration);
  voice.osc2.stop(now + duration);

  voice.osc1.onended = () => {
    voice.osc1.disconnect();
    voice.osc2.disconnect();
    voice.gain1.disconnect();
    voice.gain2.disconnect();
    voice.filter.disconnect();
    voice.ampGain.disconnect();
    Object.assign(voice, createVoice());
  };
}

function stepPolySequencer() {
  const nextStepTime = audioCtx.currentTime + 0.05;

  const globalIndex = currentStepPoly;
  const step = stepsPoly[globalIndex];

  highlightPolyStep(globalIndex);

  if (step.checkbox.checked) {
    const baseNote = parseInt(step.select.value, 10);
    const chord = chordTypes[step.chordSelect.value] || [];
    chord.forEach((interval) => {
      playPolyNote(baseNote + interval, 0.4);
    });
  }

  const currentPolyPage = Math.floor(currentStepPoly / 16);
  if (currentPolyPage !== polyPage) {
    polyPage = currentPolyPage;
    document.getElementById("polyPageSelect").value = polyPage;
    updatePolyStepVisibility();
  }

  currentStepPoly = (currentStepPoly + 1) % polyActiveSteps;
}

document.getElementById("start").onclick = () => audioCtx.resume();
document.getElementById("stop").onclick = () => stopPolySequencer();

function stopPolySequencer() {
  if (polyInterval) {
    clearInterval(polyInterval);
    polyInterval = null;
  }

  // Reset step index and page
  currentStepPoly = 0;
  polyPage = 0;
  document.getElementById("polyPageSelect").value = 0;

  // Update UI to reflect reset
  updatePolyStepVisibility();
  highlightPolyStep(0);
}

document.getElementById("polyStepCount").addEventListener("change", (e) => {
  polyActiveSteps = parseInt(e.target.value, 10);
  if (currentStepPoly >= polyActiveSteps) currentStepPoly = 0;
});

document.getElementById("polyPageSelect").addEventListener("change", (e) => {
  polyPage = parseInt(e.target.value, 10);
  updatePolyStepVisibility();
});

createPolySequencer();
