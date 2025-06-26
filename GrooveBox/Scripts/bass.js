let tb303Step = 0;
let tb303Scheduler;
let previousFreq = null;
let tb303ActiveSteps = 16;
let tb303Page = 0;
const tb303StepElements = [];

const tb303Distortion = audioCtx.createWaveShaper();
tb303Distortion.curve = makeDistortionCurve(0);
tb303Distortion.oversample = "4x";

function makeDistortionCurve(amount = 1) {
  const k = typeof amount === "number" ? amount : 1;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }

  return curve;
}

// TB-303 audio chain
const tb303Filter = audioCtx.createBiquadFilter();
tb303Filter.type = "lowpass";
tb303Filter.frequency.value = 1000;
tb303Filter.Q.value = 12;

const tb303Amp = audioCtx.createGain();
const tb303Volume = audioCtx.createGain();
tb303Amp.connect(tb303Volume).connect(audioCtx.destination);
tb303Amp.gain.value = 1.0;
tb303Volume.gain.value = 1.0;

tb303Filter.disconnect();
tb303Filter.connect(tb303Distortion).connect(tb303Amp);

const sequence = new Array(64).fill(0).map(() => ({
  note: 48,
  accent: false,
  slide: false,
  tie: false,
  play: false,
}));

let tb303Osc = null;
let masterClockCounter = 0;

document.getElementById("tb303-division").addEventListener("change", (e) => {
  tb303Division = parseInt(e.target.value, 10);

  // Reset counters to start from beginning
  currentStep = 0;
  tb303Step = 0;
  tb303PulseCounter = 0;

  // Restart the sequencer loop to apply the change immediately
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = setInterval(schedule, stepDuration * 1000);
  }
});

function playTB303Step(time, stepIndex) {
  const step = sequence[stepIndex];
  const { note, accent, slide, tie, play } = step;

  if (!play) {
    highlightTB303Step(stepIndex);
    if (tb303Osc) {
      tb303Osc.stop(time);
      tb303Osc.disconnect();
      tb303Osc = null;
    }
    previousFreq = null;
    return;
  }

  if (tie) {
    highlightTB303Step(stepIndex);
    return;
  }

  const freq = 440 * Math.pow(2, (note - 69) / 12);
  const userVolume = parseFloat(volumeSlider.value);
  const gain = (accent ? 0.6 : 0.3) * userVolume;

  const baseCutoff = parseFloat(cutoffSlider3.value);
  const envAmount = accent ? envModAmount : envModAmount / 2;
  const targetCutoff = baseCutoff + envAmount;

  const shouldStartNewOsc = !tb303Osc || !slide;

  if (shouldStartNewOsc) {
    if (tb303Osc) {
      tb303Osc.stop(time);
      tb303Osc.disconnect();
    }

    tb303Osc = audioCtx.createOscillator();
    tb303Osc.type = tb303Waveform;
    tb303Osc.connect(tb303Filter);
    tb303Osc.start(time);
    tb303Osc.frequency.setValueAtTime(freq, time);

    // Envelope (only on new note or no slide)
    tb303Amp.gain.cancelScheduledValues(time);
    tb303Amp.gain.setValueAtTime(0.0001, time);
    tb303Amp.gain.linearRampToValueAtTime(gain, time + 0.01);
    tb303Amp.gain.exponentialRampToValueAtTime(0.001, time + ampDecay);

    tb303Filter.frequency.cancelScheduledValues(time);
    tb303Filter.frequency.setValueAtTime(targetCutoff, time);
    tb303Filter.frequency.linearRampToValueAtTime(baseCutoff, time + ampDecay);
  } else {
    // Slide only: glide frequency but no envelope retrigger
    tb303Osc.frequency.cancelScheduledValues(time);
    tb303Osc.frequency.setValueAtTime(previousFreq ?? freq, time);
    tb303Osc.frequency.linearRampToValueAtTime(freq, time + stepDuration * 0.9);
  }

  previousFreq = freq;
  highlightTB303Step(stepIndex);
}

//LFO mod
const lfo = audioCtx.createOscillator();
const lfoGain = audioCtx.createGain();

lfo.type = "sine";
lfo.frequency.value = 5;
lfoGain.gain.value = 100;

lfo.connect(lfoGain).connect(tb303Filter.frequency);
lfo.start();

function stopTB303() {
  if (tb303Osc) tb303Osc.stop();
  tb303Osc = null;
  previousFreq = null;
}

// Hook into existing start/stop buttons
document.getElementById("start").addEventListener("click", () => {
  audioCtx.resume();
});

document.getElementById("stop").addEventListener("click", () => {
  stopTB303();
  tb303Step = 0;
  highlightTB303Step(0);
});

// UI: create 303 step editor
const tb303Container = document.getElementById("tb303-sequencer");
const tb303StepCells = []; // for highlighting

const noteOptions = [
  { name: "C1", value: 24 },
  { name: "C#1", value: 25 },
  { name: "D1", value: 26 },
  { name: "D#1", value: 27 },
  { name: "E1", value: 28 },
  { name: "F1", value: 29 },
  { name: "F#1", value: 30 },
  { name: "G1", value: 31 },
  { name: "G#1", value: 32 },
  { name: "A1", value: 33 },
  { name: "A#1", value: 34 },
  { name: "B1", value: 35 },
  { name: "C2", value: 36 },
  { name: "C#2", value: 37 },
  { name: "D2", value: 38 },
  { name: "D#2", value: 39 },
  { name: "E2", value: 40 },
  { name: "F2", value: 41 },
  { name: "F#2", value: 42 },
  { name: "G2", value: 43 },
  { name: "G#2", value: 44 },
  { name: "A2", value: 45 },
  { name: "A#2", value: 46 },
  { name: "B2", value: 47 },
  { name: "C3", value: 48 },
  { name: "C#3", value: 49 },
  { name: "D3", value: 50 },
  { name: "D#3", value: 51 },
  { name: "E3", value: 52 },
  { name: "F3", value: 53 },
  { name: "F#3", value: 54 },
  { name: "G3", value: 55 },
  { name: "G#3", value: 56 },
  { name: "A3", value: 57 },
  { name: "A#3", value: 58 },
  { name: "B3", value: 59 },
  { name: "C4", value: 60 },
];

function createTB303Editor(sequence) {
  tb303Container.innerHTML = "";
  tb303StepCells.length = 0;
  tb303StepElements.length = 0;

  function applyStateClass(el, className, isEnabled) {
    el.classList.add("step");
    el.classList.add(className); // always add class (like "tie")
    el.classList.toggle("active", isEnabled); // optional
  }

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];

    const col = document.createElement("div");
    col.classList.add("tb303-step");
    col.classList.add("panel");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.gap = "4px";

    const label = document.createElement("label");
    label.htmlFor = "tb303-step";
    label.textContent = i + 1;

    const select = document.createElement("select");
    select.classList.add("lcd-select");
    const selectId = `note-select-${i + 1}`;
    select.id = selectId;
    select.setAttribute("aria-label", `Note select ${i + 1}`);
    for (let opt of noteOptions) {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.name;
      if (step.note === opt.value) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener("change", () => {
      sequence[i].note = parseInt(select.value, 10);
    });

    const accentBox = document.createElement("input");
    accentBox.type = "checkbox";
    accentBox.classList.add("step", "accent-checkbox"); // ✅ THIS LINE
    const accentId = `accent-${i + 1}`;
    accentBox.id = accentId;
    accentBox.setAttribute("aria-label", `Accent ${i + 1}`);
    accentBox.addEventListener("change", () => {
      sequence[i].accent = accentBox.checked;
      applyStateClass(accentBox, "accent", accentBox.checked);
    });
    applyStateClass(accentBox, "accent", step.accent);

    accentBox.checked = step.accent;
    accentBox.title = "Accent";
    accentBox.style.display = "inline-block";
    accentBox.addEventListener("change", () => {
      sequence[i].accent = accentBox.checked;
    });

    const slideBox = document.createElement("input");
    slideBox.type = "checkbox";
    slideBox.classList.add("step", "slide-checkbox");
    const slideId = `slide-${i + 1}`;
    slideBox.id = slideId;
    slideBox.setAttribute("aria-label", `Slide ${i + 1}`);
    slideBox.addEventListener("change", () => {
      sequence[i].slide = slideBox.checked;
      applyStateClass(slideBox, "slide", slideBox.checked);
    });
    applyStateClass(slideBox, "slide", step.slide);

    slideBox.checked = step.slide;
    slideBox.title = "Slide";
    slideBox.style.display = "none";
    slideBox.addEventListener("change", () => {
      sequence[i].slide = slideBox.checked;
    });

    const playBox = document.createElement("input");
    playBox.type = "checkbox";
    playBox.classList.add("step", "play-checkbox"); // renamed
    const playId = `play-${i + 1}`;
    playBox.id = playId;
    playBox.setAttribute("aria-label", `Play ${i + 1}`);

    playBox.checked = step.play;

    playBox.addEventListener("change", () => {
      sequence[i].play = playBox.checked;
      applyStateClass(playBox, "play", playBox.checked);
    });

    // Tie checkbox
    const tieBox = document.createElement("input");
    tieBox.type = "checkbox";
    tieBox.classList.add("step", "tie-checkbox");
    const tieId = `tie-${i + 1}`;
    tieBox.id = tieId;
    tieBox.setAttribute("aria-label", `Tie ${i + 1}`);
    tieBox.checked = step.tie;
    tieBox.title = "Tie";
    tieBox.style.display = "none";

    tieBox.addEventListener("change", () => {
      sequence[i].tie = tieBox.checked;
      applyStateClass(tieBox, "tie", tieBox.checked);
    });

    playBox.title = "Play";
    playBox.style.display = "inline-block";
    col.appendChild(playBox);
    col.appendChild(select);
    col.appendChild(accentBox);
    col.appendChild(slideBox);
    col.appendChild(playBox);
    col.appendChild(tieBox);
    col.appendChild(label);

    tb303Container.appendChild(col);
    tb303StepElements.push(col);

    tb303StepCells.push({
      accentBox,
      slideBox,
      playBox,
      tieBox,
    });
  }
}

function updateTB303StepVisibility() {
  const start = tb303Page * 16;
  const end = start + 16;

  for (let i = 0; i < tb303StepElements.length; i++) {
    tb303StepElements[i].style.display =
      i >= start && i < end ? "inline-block" : "none";
  }
}

function highlightTB303Step(index) {
  tb303StepCells.forEach(({ accentBox, slideBox, playBox, tieBox }, i) => {
    [accentBox, slideBox, playBox, tieBox].forEach((el) => {
      if (el) el.classList.remove("playing");
    });

    if (i === index) {
      if (accentBox.style.display !== "none")
        accentBox.classList.add("playing");
      if (slideBox.style.display !== "none") slideBox.classList.add("playing");
      if (playBox.style.display !== "none") playBox.classList.add("playing");
      if (tieBox && tieBox.style.display !== "none")
        tieBox.classList.add("playing");
    }
  });
}

// Call once to build editor
createTB303Editor(sequence);
updateTB303StepVisibility();

const waveformSelect = document.getElementById("tb303-waveform");
const cutoffSlider3 = document.getElementById("tb303-cutoff");
const cutoffValue2 = document.getElementById("tb303-cutoff-value");
const resonanceSlider = document.getElementById("tb303-resonance");
const resonanceValue2 = document.getElementById("tb303-resonance-value");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue2 = document.getElementById("tb303-volume-value");

volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  tb303Volume.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01);
  volumeValue2.textContent = volume.toFixed(2);
});

// Update filter cutoff
cutoffSlider3.addEventListener("input", () => {
  const freq = parseFloat(cutoffSlider3.value);
  tb303Filter.frequency.value = freq;
  cutoffValue2.textContent = `${freq} HZ`;
});

// Update filter Q (resonance)
resonanceSlider.addEventListener("input", () => {
  const q = parseFloat(resonanceSlider.value);
  tb303Filter.Q.value = q;
  resonanceValue2.textContent = q.toFixed(1);
});

waveformSelect.addEventListener("change", () => {
  tb303Waveform = waveformSelect.value;
});

// Default waveform
let tb303Waveform = waveformSelect.value;

const envAmountSlider = document.getElementById("tb303-env-amount");
const envAmountValue = document.getElementById("tb303-env-amount-value");

let envModAmount = parseFloat(envAmountSlider.value);

envAmountSlider.addEventListener("input", () => {
  envModAmount = parseFloat(envAmountSlider.value);
  envAmountValue.textContent = `${envModAmount.toFixed(0)} Hz`;
});

const decaySlider = document.getElementById("tb303-decay");
const decayValue = document.getElementById("tb303-decay-value");

let ampDecay = parseFloat(decaySlider.value);

decaySlider.addEventListener("input", () => {
  ampDecay = parseFloat(decaySlider.value);
  decayValue.textContent = `${ampDecay.toFixed(2)}s`;
});

const lfoRateSlider = document.getElementById("lfo-rate");
const lfoDepthSlider = document.getElementById("lfo-depth");
const lfoRateValue = document.getElementById("lfo-rate-value");
const lfoDepthValue = document.getElementById("lfo-depth-value");
const lfoWaveformSelect = document.getElementById("lfo-waveform");

lfoWaveformSelect.addEventListener("change", () => {
  lfo.type = lfoWaveformSelect.value;
});

lfoRateSlider.addEventListener("input", () => {
  const rate = parseFloat(lfoRateSlider.value);
  lfo.frequency.value = rate;
  lfoRateValue.textContent = rate.toFixed(1);
});

lfoDepthSlider.addEventListener("input", () => {
  const depth = parseFloat(lfoDepthSlider.value);
  lfoGain.gain.value = depth;
  lfoDepthValue.textContent = depth.toFixed(0);
});

const viewSelect = document.getElementById("tb303-view-select");

viewSelect.addEventListener("change", () => {
  const view = viewSelect.value;

  // First hide all
  document
    .querySelectorAll(".accent-checkbox")
    .forEach((cb) => (cb.style.display = "none"));
  document
    .querySelectorAll(".slide-checkbox")
    .forEach((cb) => (cb.style.display = "none"));
  document
    .querySelectorAll(".play-checkbox")
    .forEach((cb) => (cb.style.display = "none"));

  document
    .querySelectorAll(".tie-checkbox")
    .forEach((cb) => (cb.style.display = "none"));

  // Then show only the selected group
  document.querySelectorAll(`.${view}-checkbox`).forEach((cb) => {
    cb.style.display = "inline-block";
  });
});

const stepCountSelect2 = document.getElementById("tb303-step-count");
const pageSelect2 = document.getElementById("tb303-page-select");

stepCountSelect2.addEventListener("change", () => {
  tb303ActiveSteps = parseInt(stepCountSelect2.value, 10);
  if (tb303Step >= tb303ActiveSteps) tb303Step = 0;
});

pageSelect2.addEventListener("change", () => {
  tb303Page = parseInt(pageSelect2.value, 10);
  updateTB303StepVisibility();
});

// Optionally call once at load to set default
viewSelect.dispatchEvent(new Event("change"));

const distortionSlider = document.getElementById("tb303-distortion");
const distortionValue = document.getElementById("tb303-distortion-value");

distortionSlider.addEventListener("input", () => {
  const amount = parseInt(distortionSlider.value, 10);
  tb303Distortion.curve = makeDistortionCurve(amount);
  distortionValue.textContent = amount;
});
