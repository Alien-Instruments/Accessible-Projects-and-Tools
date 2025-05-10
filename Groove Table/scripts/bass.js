// TB-303 state
let tb303Step = 0;
let tb303Scheduler;
let previousFreq = null;

// TB-303 audio chain
const tb303Filter = audioCtx.createBiquadFilter();
tb303Filter.type = "lowpass";
tb303Filter.frequency.value = 1000;
tb303Filter.Q.value = 12;

const tb303Amp = audioCtx.createGain(); // Envelope controlled
const tb303Volume = audioCtx.createGain(); // User volume slider
tb303Amp.connect(tb303Volume).connect(audioCtx.destination);
tb303Amp.gain.value = 1.0; // Let envelope do its job
tb303Volume.gain.value = 1.0; // Initial master volume

tb303Filter.connect(tb303Amp).connect(audioCtx.destination);

// 16-step TB-303 sequence
const sequence = new Array(16).fill(0).map(() => ({
  note: 48,
  accent: false,
  slide: false,
  tie: false,
  mute: false,
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
  const { note, accent, slide, mute } = step;

  if (mute) {
    highlightTB303Step(stepIndex);
    return;
  }

  const freq = 440 * Math.pow(2, (note - 69) / 12);
  const userVolume = parseFloat(volumeSlider.value);
  const gain = (accent ? 0.6 : 0.3) * userVolume;

  const baseCutoff = parseFloat(cutoffSlider.value);
  const envAmount = accent ? envModAmount : envModAmount / 2;
  const targetCutoff = baseCutoff + envAmount;

  const shouldStartNewOsc = !tb303Osc || !slide;

  if (shouldStartNewOsc) {
    if (tb303Osc) tb303Osc.stop();
    tb303Osc = audioCtx.createOscillator();
    tb303Osc.type = tb303Waveform;
    tb303Osc.connect(tb303Filter);
    tb303Osc.start(time);
    tb303Osc.frequency.setValueAtTime(freq, time);
  } else {
    tb303Osc.frequency.cancelScheduledValues(time);
    tb303Osc.frequency.setValueAtTime(previousFreq ?? freq, time);
    tb303Osc.frequency.linearRampToValueAtTime(freq, time + stepDuration * 0.9);
  }

  previousFreq = freq;

  // Amplitude envelope
  tb303Amp.gain.cancelScheduledValues(time);
  tb303Amp.gain.setValueAtTime(0.0001, time);
  tb303Amp.gain.linearRampToValueAtTime(gain, time + 0.01);
  tb303Amp.gain.exponentialRampToValueAtTime(0.001, time + ampDecay);

  // Filter envelope
  tb303Filter.frequency.cancelScheduledValues(time);
  tb303Filter.frequency.setValueAtTime(targetCutoff, time);
  tb303Filter.frequency.linearRampToValueAtTime(baseCutoff, time + ampDecay);

  highlightTB303Step(stepIndex);
}
//LFO mod
const lfo = audioCtx.createOscillator();
const lfoGain = audioCtx.createGain();

lfo.type = "sine"; // or triangle/square/sawtooth
lfo.frequency.value = 5; // default rate in Hz
lfoGain.gain.value = 100; // default depth in Hz

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
});

// UI: create 303 step editor
const tb303Container = document.getElementById("tb303-sequencer");
const tb303StepCells = []; // for highlighting

const noteOptions = [
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

  function applyStateClass(el, className, isEnabled) {
    el.classList.add("step"); // ensure "step" is always present
    el.classList.add(className); // Always keep class
    el.classList.toggle("active", isEnabled); // Add 'active' state if needed
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
    label.textContent = i + 1;

    const select = document.createElement("select");
    select.classList.add("lcd-select"); // ✅ Apply the style here

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
    slideBox.classList.add("step", "slide-checkbox"); // ✅ THIS LINE

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

    const muteBox = document.createElement("input");
    muteBox.type = "checkbox";
    muteBox.classList.add("step", "mute-checkbox"); // ✅ THIS LINE

    muteBox.addEventListener("change", () => {
      sequence[i].mute = muteBox.checked;
      applyStateClass(muteBox, "mute", muteBox.checked);
    });
    applyStateClass(muteBox, "mute", step.mute);

    muteBox.checked = step.mute;
    muteBox.title = "Mute";
    muteBox.style.display = "inline-block";
    muteBox.addEventListener("change", () => {
      sequence[i].mute = muteBox.checked;
    });

    col.appendChild(select);
    col.appendChild(accentBox);
    col.appendChild(slideBox);
    col.appendChild(muteBox);
    col.appendChild(label);

    tb303Container.appendChild(col);
    tb303StepCells.push({
      accentBox,
      slideBox,
      muteBox,
    });
  }
}

function highlightTB303Step(index) {
  tb303StepCells.forEach(({ accentBox, slideBox, muteBox }, i) => {
    [accentBox, slideBox, muteBox].forEach((el) => {
      el.classList.remove("playing");
    });

    if (i === index) {
      if (accentBox.style.display !== "none")
        accentBox.classList.add("playing");
      if (slideBox.style.display !== "none") slideBox.classList.add("playing");
      if (muteBox.style.display !== "none") muteBox.classList.add("playing");
    }
  });
}

// Call once to build editor
createTB303Editor(sequence);

const waveformSelect = document.getElementById("tb303-waveform");
const cutoffSlider = document.getElementById("tb303-cutoff");
const cutoffValue = document.getElementById("tb303-cutoff-value");
const resonanceSlider = document.getElementById("tb303-resonance");
const resonanceValue = document.getElementById("tb303-resonance-value");
const volumeSlider = document.getElementById("volumeSlider");

volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  tb303Volume.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.01);
});

// Update filter cutoff
cutoffSlider.addEventListener("input", () => {
  const freq = parseFloat(cutoffSlider.value);
  tb303Filter.frequency.value = freq;
  cutoffValue.textContent = `${freq} Hz`;
});

// Update filter Q (resonance)
resonanceSlider.addEventListener("input", () => {
  const q = parseFloat(resonanceSlider.value);
  tb303Filter.Q.value = q;
  resonanceValue.textContent = q.toFixed(1);
});

// Update waveform type on next oscillator start
waveformSelect.addEventListener("change", () => {
  // This just updates a setting, used when creating a new osc
  tb303Waveform = waveformSelect.value;
});

// Default waveform
let tb303Waveform = waveformSelect.value;

const envAmountSlider = document.getElementById("tb303-env-amount");
const envAmountValue = document.getElementById("tb303-env-amount-value");

let envModAmount = parseFloat(envAmountSlider.value);

envAmountSlider.addEventListener("input", () => {
  envModAmount = parseFloat(envAmountSlider.value);
  envAmountValue.textContent = envModAmount;
});

const decaySlider = document.getElementById("tb303-decay");

let ampDecay = parseFloat(decaySlider.value);

decaySlider.addEventListener("input", () => {
  ampDecay = parseFloat(decaySlider.value);
});

const lfoRateSlider = document.getElementById("lfo-rate");
const lfoDepthSlider = document.getElementById("lfo-depth");

lfoRateSlider.addEventListener("input", () => {
  lfo.frequency.value = parseFloat(lfoRateSlider.value);
});

lfoDepthSlider.addEventListener("input", () => {
  lfoGain.gain.value = parseFloat(lfoDepthSlider.value);
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
    .querySelectorAll(".mute-checkbox")
    .forEach((cb) => (cb.style.display = "none"));

  // Then show only the selected group
  document.querySelectorAll(`.${view}-checkbox`).forEach((cb) => {
    cb.style.display = "inline-block";
  });
});

// Optionally call once at load to set default
viewSelect.dispatchEvent(new Event("change"));
