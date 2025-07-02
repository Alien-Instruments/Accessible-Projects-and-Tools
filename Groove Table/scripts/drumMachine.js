const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

if (navigator.requestMIDIAccess) {
  navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDI;
      }
    })
    .catch((err) => {
      console.warn("MIDI access error:", err);
    });
} else {
  console.warn("Web MIDI is not supported in this browser.");
}

function handleMIDI(message) {
  const [status, note, velocity] = message.data;

  console.log(`MIDI: status=${status}, note=${note}, velocity=${velocity}`);

  if (status === 144 && velocity > 0) {
    const time = audioCtx.currentTime;
    triggerDrum(note, time, velocity);
  }
}

function triggerDrum(note, time, velocity) {
  const accented = velocity > 100;

  switch (note) {
    case 36: // C1
      playKick(time, accented);
      break;
    case 37: // C#1
      playSnare(time, accented);
      break;
    case 38: // D1
      playLowTom(time, "lowTomPitch", "lowTomDecay", "lowTomLevel", accented);
      break;
    case 39: // D#1
      playMidTom(time, "midTomPitch", "midTomDecay", "midTomLevel", accented);
      break;
    case 40: // E1
      playHighTom(
        time,
        "highTomPitch",
        "highTomDecay",
        "highTomLevel",
        accented
      );
      break;
    case 41: // F1
      playClap(time, accented);
      break;
    case 42: // F#1
      playHiHat(time, accented);
      break;
    case 43: // G1
      playCymbal(time, accented);
      break;
    default:
      console.log("Unmapped MIDI note:", note);
  }
}

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

// Initial styling
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

  for (let i = 0; i < 16; i++) {
    const wrap = document.createElement("div");
    wrap.classList.add("panel");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "center";
    wrap.style.gap = "4px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.title = isAccent ? "Accent" : "Step";

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

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = i + 1;

    wrap.appendChild(checkbox);
    wrap.appendChild(label);
    container.appendChild(wrap);
  }
};

const kickAccents = [],
  snareAccents = [],
  hihatAccents = [],
  cymbalAccents = [],
  lowTomAccents = [],
  midTomAccents = [],
  highTomAccents = [],
  clapAccents = [];

function toggleAccent(mainId, accentId) {
  const mainRow = document.getElementById(mainId);
  const accentRow = document.getElementById(accentId);

  const showingAccent = accentRow.style.display === "flex";

  document.querySelectorAll(".tabContent").forEach((tab) => {
    tab.style.display = "none";
  });

  if (showingAccent) {
    mainRow.style.display = "flex";
    activeRow = mainId;
  } else {
    accentRow.style.display = "flex";
    activeRow = accentId;
  }
}

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

  const step = currentStep % 16;

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

  tb303PulseCounter++;
  if (tb303PulseCounter % tb303Division === 0) {
    playTB303Step(time, tb303Step);
    tb303Step = (tb303Step + 1) % 16;
  }

  highlightStep(step);
  currentStep = (currentStep + 1) % 16;
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

document.getElementById("stop").onclick = () => {
  clearInterval(intervalID);
  intervalID = null;
  currentStep = 0;
  tb303Step = 0;
  tb303PulseCounter = 0;
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
