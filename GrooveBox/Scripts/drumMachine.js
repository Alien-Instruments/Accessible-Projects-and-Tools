let drumActiveSteps = 16;
let drumPage = 0;
let drumStep = 0;

function playKick(time, accented = false) {
  const pitch = parseFloat(document.getElementById("kickPitch").value);
  const decay = parseFloat(document.getElementById("kickDecay").value);
  const level = parseFloat(document.getElementById("kickLevel").value);
  const finalLevel = accented ? level * 2.0 : level;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(100, time + decay);
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay);
}

function playSnare(time, accented = false) {
  const pitch = parseFloat(document.getElementById("snarePitch").value);
  const decay = parseFloat(document.getElementById("snareDecay").value);
  const level = parseFloat(document.getElementById("snareLevel").value);
  const finalLevel = accented ? level * 2.0 : level;
  if (finalLevel <= 0) return;

  const noiseBuffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * decay,
    audioCtx.sampleRate
  );
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1000;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(finalLevel, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + decay);
  noise.connect(noiseFilter).connect(noiseGain).connect(audioCtx.destination);
  noise.start(time);
  noise.stop(time + decay);

  const osc = audioCtx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(pitch, time);
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(finalLevel, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + decay * 0.5);
  osc.connect(oscGain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay);
}

function playLowTom(time, pitchId, decayId, levelId, accented = false) {
  const pitch = parseFloat(document.getElementById(pitchId).value);
  const decay = parseFloat(document.getElementById(decayId).value);
  const level = parseFloat(document.getElementById(levelId).value);
  const finalLevel = accented ? level * 2.0 : level;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(pitch / 2, time + decay);
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay);
}

function playMidTom(time, pitchId, decayId, levelId, accented = false) {
  const pitch = parseFloat(document.getElementById(pitchId).value);
  const decay = parseFloat(document.getElementById(decayId).value);
  const level = parseFloat(document.getElementById(levelId).value);
  const finalLevel = accented ? level * 2.0 : level;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(pitch / 2, time + decay);
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay);
}

function playHighTom(time, pitchId, decayId, levelId, accented = false) {
  const pitch = parseFloat(document.getElementById(pitchId).value);
  const decay = parseFloat(document.getElementById(decayId).value);
  const level = parseFloat(document.getElementById(levelId).value);
  const finalLevel = accented ? level * 2.0 : level;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(pitch / 2, time + decay);
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay);
}

function playClap(time, accented = false) {
  const delay = parseFloat(document.getElementById("clapDelay").value);
  const level = parseFloat(document.getElementById("clapLevel").value);
  const tone = parseFloat(document.getElementById("clapTone").value);
  const finalLevel = accented ? level * 2.0 : level;

  for (let i = 0; i < 3; i++) {
    const noiseBuffer = audioCtx.createBuffer(
      1,
      audioCtx.sampleRate * 0.1,
      audioCtx.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let j = 0; j < output.length; j++) output[j] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(tone, time);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(finalLevel, time + i * delay);
    gain.gain.exponentialRampToValueAtTime(0.01, time + i * delay + 0.1);

    noise.connect(bandpass).connect(gain).connect(audioCtx.destination);
    noise.start(time + i * delay);
    noise.stop(time + i * delay + 0.1);
  }
}

function playHiHat(time, accented = false) {
  const decay = parseFloat(document.getElementById("hatDecay").value);
  const level = parseFloat(document.getElementById("hatLevel").value);
  const tone = parseFloat(document.getElementById("hiHatTone").value);
  const finalLevel = accented ? level * 2.0 : level;

  const noiseBuffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * decay,
    audioCtx.sampleRate
  );
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = tone;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + decay);
  noise.connect(bandpass).connect(gain).connect(audioCtx.destination);
  noise.start(time);
  noise.stop(time + decay);
}

function playCymbal(time, accented = false) {
  const decay = parseFloat(document.getElementById("cymbalDecay").value);
  const level = parseFloat(document.getElementById("cymbalLevel").value);
  const tone = parseFloat(document.getElementById("crashTone").value);
  const finalLevel = accented ? level * 2.0 : level;

  const noiseBuffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * 0.4,
    audioCtx.sampleRate
  );
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const hp = audioCtx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = tone;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(finalLevel, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  noise.connect(hp).connect(gain).connect(audioCtx.destination);
  noise.start(time);
  noise.stop(time + 0.4);
}

const tempoSlider = document.getElementById("tempoSlider");
const tempoValue = document.getElementById("tempoValue");

tempoSlider.addEventListener("input", () => {
  tempo = parseInt(tempoSlider.value, 10);
  tempoValue.textContent = `${tempo} Bpm`;
  stepDuration = 60 / tempo / 4;

  if (intervalID) {
    clearInterval(intervalID);
    intervalID = setInterval(schedule, stepDuration * 1000 * 4);
  }
});

let tempo = parseInt(tempoSlider.value, 10);
let stepDuration = 60 / tempo / 4;

let currentStep = 0;
let intervalID;

let activeDrum = null;
let showingAccent = false;

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

startBtn.classList.add("control-button");
stopBtn.classList.add("control-button");

tempoSlider.addEventListener("input", () => {
  tempo = parseInt(tempoSlider.value, 10);
  tempoValue.textContent = `${tempo} Bpm`;
  stepDuration = 60 / tempo / 4;

  // Restart sequencer loop with new stepDuration
  if (intervalID) {
    clearInterval(intervalID);
    intervalID = setInterval(schedule, stepDuration * 1000);
  }

  updatePulseRate();
});

startBtn.addEventListener("click", () => {
  startBtn.classList.add("active", "pulsing");
  stopBtn.classList.remove("active", "pulsing");
  intervalID = setInterval(schedule, stepDuration * 1000);

  updatePulseRate();
});

stopBtn.addEventListener("click", () => {
  startBtn.classList.remove("active", "pulsing");
  stopBtn.classList.add("active");
  clearInterval(intervalID);
  intervalID = null;
  currentStep = 0;
  highlightStep(0);
});

function updatePulseRate() {
  const bpmDuration = 60 / tempo;
  const ms = bpmDuration * 1000;
  startBtn.style.animationDuration = `${ms}ms`;
}

const kickSteps = [],
  snareSteps = [],
  hihatSteps = [],
  cymbalSteps = [],
  lowTomSteps = [],
  midTomSteps = [],
  highTomSteps = [],
  clapSteps = [];

const createRow = (id, array, isAccent = false) => {
  const container = document.getElementById(id);
  container.innerHTML = "";
  container.style.gap = "5px";

  for (let i = 0; i < 64; i++) {
    const wrap = document.createElement("div");
    wrap.classList.add("panel", "drum-step");
    if (isAccent) wrap.classList.add("accent-step");

    wrap.dataset.index = i;
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "4px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.title = isAccent ? "Accent" : "Step";

    // Add class names
    checkbox.classList.add("step");
    if (isAccent) {
      checkbox.classList.add("accent");
    }

    // Assign unique ID and ARIA label
    checkbox.id = `${id}-step-${i + 1}-${isAccent ? "accent" : "drum"}`;
    checkbox.setAttribute(
      "aria-label",
      `${isAccent ? "Accent step" : "Drum step"} ${i + 1}`
    );

    array.push(checkbox);

    const label = document.createElement("label");
    label.htmlFor = "drum-step";
    label.textContent = i + 1;

    wrap.appendChild(checkbox);
    wrap.appendChild(label);
    container.appendChild(wrap);
  }
};

function updateDrumStepVisibility() {
  const start = drumPage * 16;
  const end = start + 16;

  // Only update steps in the currently visible row
  const visibleContainer = document.querySelector(".tabContent[style*='flex']");
  if (!visibleContainer) return;

  const steps = visibleContainer.querySelectorAll(".drum-step");
  steps.forEach((el, index) => {
    el.style.display = index >= start && index < end ? "inline-block" : "none";
  });
}

const kickAccents = [],
  snareAccents = [],
  hihatAccents = [],
  cymbalAccents = [],
  lowTomAccents = [],
  midTomAccents = [],
  highTomAccents = [],
  clapAccents = [];

function toggleLED(button) {
  const led = button.querySelector(".led");
  led.classList.toggle("on");
}

createRow("kick-row", kickSteps);
createRow("kick-accent-row", kickAccents, true);

createRow("snare-row", snareSteps);
createRow("snare-accent-row", snareAccents, true);

createRow("hihat-row", hihatSteps);
createRow("hihat-accent-row", hihatAccents, true);

createRow("cymbal-row", cymbalSteps);
createRow("cymbal-accent-row", cymbalAccents, true);

createRow("lowtom-row", lowTomSteps);
createRow("lowtom-accent-row", lowTomAccents, true);

createRow("midtom-row", midTomSteps);
createRow("midtom-accent-row", midTomAccents, true);

createRow("hightom-row", highTomSteps);
createRow("hightom-accent-row", highTomAccents, true);

createRow("clap-row", clapSteps);
createRow("clap-accent-row", clapAccents, true);

let tb303Division = 1;
let tb303PulseCounter = 0;

function schedule() {
  const time = audioCtx.currentTime;

  const step = currentStep % drumActiveSteps;

  if (kickSteps[step].checked) playKick(time, kickAccents[step].checked);
  if (snareSteps[step].checked) playSnare(time, snareAccents[step].checked);
  if (hihatSteps[step].checked) playHiHat(time, hihatAccents[step].checked);
  if (cymbalSteps[step].checked) playCymbal(time, cymbalAccents[step].checked);
  if (lowTomSteps[step].checked)
    playLowTom(
      time,
      "lowTomPitch",
      "lowTomDecay",
      "lowTomLevel",
      lowTomAccents[step].checked
    );
  if (midTomSteps[step].checked)
    playMidTom(
      time,
      "midTomPitch",
      "midTomDecay",
      "midTomLevel",
      midTomAccents[step].checked
    );
  if (highTomSteps[step].checked)
    playHighTom(
      time,
      "highTomPitch",
      "highTomDecay",
      "highTomLevel",
      highTomAccents[step].checked
    );
  if (clapSteps[step].checked) playClap(time, clapAccents[step].checked);

  stepPolySequencer();

  tb303PulseCounter++;
  if (tb303PulseCounter % tb303Division === 0) {
    playTB303Step(time, tb303Step);
    tb303Step = (tb303Step + 1) % tb303ActiveSteps;
  }
  // Auto page switch for drum sequencer
  const currentDrumPage = Math.floor(step / 16);
  if (currentDrumPage !== drumPage) {
    drumPage = currentDrumPage;
    document.getElementById("drumPageSelect").value = drumPage;
    updateDrumStepVisibility();
  }
  const currentTB303Page = Math.floor(tb303Step / 16);
  if (currentTB303Page !== tb303Page) {
    tb303Page = currentTB303Page;
    document.getElementById("tb303-page-select").value = tb303Page;
    updateTB303StepVisibility();
  }

  highlightStep(step);
  currentStep = (currentStep + 1) % drumActiveSteps;
}

function highlightStep(step) {
  const allRows = [
    kickSteps,
    snareSteps,
    hihatSteps,
    cymbalSteps,
    lowTomSteps,
    midTomSteps,
    highTomSteps,
    clapSteps,
    kickAccents,
    snareAccents,
    hihatAccents,
    cymbalAccents,
    lowTomAccents,
    midTomAccents,
    highTomAccents,
    clapAccents,
  ];

  allRows.forEach((row) => {
    row.forEach((cell, index) => {
      cell.classList.toggle("playing", index === step);
    });
  });
}

document.getElementById("start").onclick = () => {
  audioCtx.resume();
  if (!intervalID) intervalID = setInterval(schedule, stepDuration * 1000 * 4);
};

let activeRow = null;

function showTab(tabId, button = null) {
  document.querySelectorAll(".tabContent").forEach((tab) => {
    tab.style.display = "none";
  });

  document.getElementById(tabId).style.display = "flex";

  activeDrum = tabId.replace("-row", "").replace("-accent", "");
  showingAccent = tabId.includes("accent");

  document.querySelectorAll(".select-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  }
  updateDrumStepVisibility();
}

const accentToggleBtn = document.getElementById("accentToggle");

function toggleAccent() {
  if (!activeDrum) return;

  const mainRowId = `${activeDrum}-row`;
  const accentRowId = `${activeDrum}-accent-row`;

  const mainRow = document.getElementById(mainRowId);
  const accentRow = document.getElementById(accentRowId);

  if (showingAccent) {
    accentRow.style.display = "none";
    mainRow.style.display = "flex";
    accentToggleBtn.textContent = "Steps";
  } else {
    mainRow.style.display = "none";
    accentRow.style.display = "flex";
    accentToggleBtn.textContent = "Accent";
  }

  // Update visibility based on current drumPage
  updateDrumStepVisibility();

  showingAccent = !showingAccent;
}

const button = document.getElementById("accentToggle");
let isOrange = false;

button.addEventListener("click", () => {
  isOrange = !isOrange;
  button.classList.toggle("orange", isOrange);
  button.classList.toggle("red", !isOrange);
});

document.addEventListener("DOMContentLoaded", function () {
  const kickBtn = document.querySelector('button[onclick*="kick-row"]');
  showTab("kick-row", kickBtn);
});

document.getElementById("drumStepCount").addEventListener("change", (e) => {
  drumActiveSteps = parseInt(e.target.value, 10);
  if (currentStep >= drumActiveSteps) currentStep = 0;
});

document.getElementById("drumPageSelect").addEventListener("change", (e) => {
  drumPage = parseInt(e.target.value, 10);
  updateDrumStepVisibility();
});
