import { setupMIDI } from "./midi.js";
import { noteOn, noteOff, MasterBus, FMVoice } from "./synth.js";
import { drawAlgorithm } from "./visualizer.js";
import { keyboardMap, ALGORITHMS } from "./constants.js";
import {
  getOperatorParams,
  createOperatorControls,
  applyPreset,
  PRESETS,
  getLocalPresets,
  collectCurrentPreset,
  savePresetToLocal,
  deleteLocalPreset,
  exportLocalPresets,
} from "./gui.js";

import {
  setGlobalPitchEnvParam,
  setGlobalPitchEnvDepth,
  getGlobalPitchEnvParams,
} from "./synth.js";

import { saveCCMappings, loadCCMappings, clearCCMappings } from "./storage.js";
import { Arpeggiator } from "./arpeggiator.js";

const LOCAL_MIDI_MAP_KEY = "BXmidiCCMappings";

export let learningParamId = null;
let useUserTheme = false;
export function setLearningParamId(id) {
  learningParamId = id;
  document
    .querySelectorAll(".learn-button")
    .forEach((btn) => btn.classList.remove("flicker"));
  console.log(`🎛️ Ready to map MIDI CC to: ${id}`);
}
window.setLearningParamId = setLearningParamId;

window.addEventListener("DOMContentLoaded", () => {
  // Core state
  const context = new AudioContext();
  const masterBus = new MasterBus(context);
  const heldNotes = new Set();
  let voiceMode = "mono"; // default
  let selectedMIDIChannel = "all";
  let fmVoice = null;
  let tremoloRate = 5;
  let tremoloDepth = 0;
  let tremoloDelay = 0;
  let pitchLFORate = 0;
  let pitchLFODepth = 0;
  let pitchLFOType = "sine";
  let glideTime = 0.0;
  let lastFreq = 440;
  const midiCCMappings = loadCCMappings();
  let pitchBendRange = 2;
  let currentPitchBend = 0;
  let currentModWheel = 0;

  let globalPitchEnvParams = {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.5,
    loop: false,
  };
  let globalPitchEnvDepth = 0;

  const arp = new Arpeggiator({
    context,
    noteOn,
    noteOff,
    getCurrentAlgoId: () => parseInt(algoSelect.value),
    getOperatorParams,
    masterBus,
    rate: 0.25,
    pattern: "up",
    octaveRange: 6,
    getPitchBend: () => currentPitchBend,
    getModWheel: () => currentModWheel,
  });

  if (arp.enabled && arp.heldNotes.size > 0) {
    arp.stop();
    arp.start();
  }

  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const timeData = new Uint8Array(bufferLength);
  const freqData = new Uint8Array(bufferLength);

  masterBus.masterFilter.connect(analyser);
  const oscCanvas = document.getElementById("oscilloscope");
  const oscCtx = oscCanvas.getContext("2d");

  const specCanvas = document.getElementById("spectrum");
  const specCtx = specCanvas.getContext("2d");

  function drawAnalyzers() {
    requestAnimationFrame(drawAnalyzers);

    // Grab the color pickers, fallback to defaults
    const bgPicker = document.getElementById("color-picker-2");
    const linePicker = document.getElementById("color-picker");
    const bgColor = bgPicker?.value || "#18100d";
    const lineColor = linePicker?.value || "#ff7700";

    // Oscilloscope
    analyser.getByteTimeDomainData(timeData);
    oscCtx.fillStyle = bgColor;
    oscCtx.fillRect(0, 0, oscCanvas.width, oscCanvas.height);
    oscCtx.lineWidth = 4;
    oscCtx.strokeStyle = lineColor;
    oscCtx.beginPath();
    const sliceWidth = oscCanvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * oscCanvas.height) / 2;
      i === 0 ? oscCtx.moveTo(x, y) : oscCtx.lineTo(x, y);
      x += sliceWidth;
    }
    oscCtx.lineTo(oscCanvas.width, oscCanvas.height / 2);
    oscCtx.stroke();

    // Spectrum
    analyser.getByteFrequencyData(freqData);
    specCtx.fillStyle = bgColor;
    specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);
    const barWidth = (specCanvas.width / bufferLength) * 4.5;
    let bx = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = freqData[i] * 0.5;
      // All bars use the line color for a consistent theme:
      specCtx.fillStyle = lineColor;
      specCtx.fillRect(bx, specCanvas.height - barHeight, barWidth, barHeight);
      bx += barWidth + 1;
    }
  }

  drawAnalyzers();

  const algoSelect = document.getElementById("algorithm-select");
  const operatorContainer = document.getElementById("operator-controls");
  const algoSVG = document.getElementById("algorithm-visual");
  const presetSelect = document.getElementById("preset-select");

  document
    .getElementById("save-audio-preset-btn")
    .addEventListener("click", () => {
      const name = document.getElementById("preset-name-input").value.trim();

      if (!name) {
        announce("Please enter a preset name first.");
        return;
      }

      openModal({
        title: "Save Preset",
        description: `Are you sure you want to save "${name}"? This will overwrite any existing preset with the same name.`,
        confirmLabel: "Save Preset",
        showInput: false,
        onConfirm: () => {
          const preset = collectCurrentPreset();
          savePresetToLocal(name, preset);
          populatePresetSelect();
          // 👇 Set the select to the new preset
          const presetSelect = document.getElementById("preset-select");
          presetSelect.value = `user::${name}`;
          // 👇 Optional: dispatch 'change' to apply
          presetSelect.dispatchEvent(new Event("change", { bubbles: true }));
          announce(`Preset "${name}" saved.`);
        },
      });
    });

  document
    .getElementById("export-presets-btn")
    .addEventListener("click", () => {
      openModal({
        title: "Export Presets",
        description: "Enter a filename for the exported JSON:",
        confirmLabel: "Export",
        defaultValue: "my-presets",
        onConfirm: (filename) => {
          if (!filename.trim()) {
            announce("Filename cannot be empty.");
            return;
          }
          exportLocalPresets(`${filename.trim()}.json`);
          announce(`Presets exported as ${filename.trim()}.json`);
        },
      });
    });

  // Populate algorithm dropdown
  Object.keys(ALGORITHMS).forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `Algorithm ${id}`;
    algoSelect.appendChild(option);
  });

  // Populate presets
  function populatePresetSelect() {
    const presetSelect = document.getElementById("preset-select");
    presetSelect.innerHTML = `
      <option value="">-- Choose a Preset --</option>
      <option disabled>—— Factory Presets ——</option>
    `;

    // Add factory presets
    Object.entries(PRESETS).forEach(([category, presets]) => {
      Object.keys(presets).forEach((name) => {
        const opt = document.createElement("option");
        opt.value = `factory::${category}::${name}`;
        opt.textContent = `${category} - ${name}`;
        presetSelect.appendChild(opt);
      });
    });

    // Add user presets
    const userPresets = getLocalPresets();
    if (Object.keys(userPresets).length > 0) {
      const divider = document.createElement("option");
      divider.disabled = true;
      divider.textContent = "—— User Presets ——";
      presetSelect.appendChild(divider);

      Object.keys(userPresets).forEach((name) => {
        const opt = document.createElement("option");
        opt.value = `user::${name}`;
        opt.textContent = name;
        presetSelect.appendChild(opt);
      });
    }
  }

  // Load selected preset
  presetSelect.addEventListener("change", () => {
    const selected = presetSelect.value;

    if (selected.startsWith("factory::")) {
      const [, category, name] = selected.split("::");
      if (PRESETS[category] && PRESETS[category][name]) {
        applyPreset(PRESETS[category][name]);
      }
    }

    if (selected.startsWith("user::")) {
      const name = selected.split("::")[1];
      const userPresets = getLocalPresets();
      if (userPresets[name]) {
        applyPreset(userPresets[name]);
      }
    }
  });

  const deletePresetBtn = document.getElementById("delete-user-preset");

  presetSelect.addEventListener("change", () => {
    const selected = presetSelect.value;

    if (selected.startsWith("factory::")) {
      const [, category, name] = selected.split("::");
      if (PRESETS[category] && PRESETS[category][name]) {
        applyPreset(PRESETS[category][name]);
      }
      deletePresetBtn.disabled = true; // can't delete factory presets
    }

    if (selected.startsWith("user::")) {
      const name = selected.split("::")[1];
      const userPresets = getLocalPresets();
      if (userPresets[name]) {
        applyPreset(userPresets[name]);
      }
      deletePresetBtn.disabled = false;
    }
  });

  populatePresetSelect();

  requestAnimationFrame(() => {
    const firstOption = Array.from(presetSelect.options).find(
      (opt) => opt.value && !opt.disabled && opt.value.startsWith("factory::")
    );
    if (firstOption) {
      presetSelect.value = firstOption.value;
      const event = new Event("change", { bubbles: true });
      presetSelect.dispatchEvent(event);
    } else {
      console.warn("No valid factory presets found");
    }
  });

  deletePresetBtn.addEventListener("click", () => {
    const selected = presetSelect.value;
    if (!selected.startsWith("user::")) return;

    const name = selected.split("::")[1];
    openModal({
      title: `Delete "${name}"?`,
      description: `This action cannot be undone.`,
      showInput: false,
      onConfirm: () => {
        deleteLocalPreset(name);
        populatePresetSelect();
        presetSelect.value = "";
        deletePresetBtn.disabled = true;
      },
    });

    deleteLocalPreset(name);
    populatePresetSelect();
    presetSelect.value = "";
    deletePresetBtn.disabled = true;
  });

  populatePresetSelect();

  // Init operator sliders
  createOperatorControls(operatorContainer);

  drawAlgorithm(parseInt(algoSelect.value), algoSVG);

  algoSelect.addEventListener("change", () => {
    const algoId = parseInt(algoSelect.value);
    drawAlgorithm(algoId, algoSVG);
    updateVisibleFeedbackSliders(ALGORITHMS[algoId]);
  });

  updateVisibleFeedbackSliders(ALGORITHMS[parseInt(algoSelect.value)]);

  document.getElementById("master-volume").addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value);
    masterBus.setMasterVolume(volume);
    document.getElementById("master-vol-value").textContent = volume.toFixed(2);
  });

  const midiChannelSelect = document.getElementById("midiChannelSelect");
  for (let i = 1; i <= 16; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    midiChannelSelect.appendChild(option);
  }

  const voiceModeSelect = document.getElementById("voice-mode-select");
  voiceModeSelect.addEventListener("change", (e) => {
    voiceMode = e.target.value;
  });

  const glideSlider = document.getElementById("glide-time");
  const glideValue = document.getElementById("glide-time-value");

  if (glideSlider && glideValue) {
    glideSlider.addEventListener("input", (e) => {
      glideTime = parseFloat(e.target.value);
      glideValue.textContent = glideTime.toFixed(2);
    });
  }

  const bendRangeSelect = document.getElementById("pitch-bend-range");
  if (bendRangeSelect) {
    bendRangeSelect.addEventListener("change", (e) => {
      pitchBendRange = parseInt(e.target.value);
      announce(`Pitch Bend Range set to ±${pitchBendRange} semitones`);
    });
  }

  const learnToggleBtn = document.getElementById("toggle-midi-learn");

  let learnButtonsVisible = false;

  learnToggleBtn.addEventListener("click", () => {
    learnButtonsVisible = !learnButtonsVisible;
    document.querySelectorAll(".learn-button").forEach((btn) => {
      btn.style.display = learnButtonsVisible ? "inline-block" : "none";
    });
    learnToggleBtn.classList.toggle("learn-active", learnButtonsVisible);
  });

  document.getElementById("clear-midi-map").addEventListener("click", () => {
    openModal({
      title: "Clear MIDI Map",
      description: "Are you sure you want to clear all MIDI mappings?",
      confirmLabel: "Clear Map",
      showInput: false,
      onConfirm: () => {
        midiCCMappings.clear();
        clearCCMappings();
        updateMappingTable();
        announce("All MIDI mappings cleared.");
      },
    });
  });

  document.getElementById("export-midi-map").addEventListener("click", () => {
    openModal({
      title: "Export MIDI Map",
      description: "Enter a filename for the MIDI mapping JSON file:",
      confirmLabel: "Export",
      defaultValue: "midi-map",
      onConfirm: (filename) => {
        const sanitized = filename.replace(/\.json$/i, "").trim();
        if (!sanitized) {
          announce("Filename cannot be empty.");
          return;
        }

        const obj = {};
        for (const [cc, paramId] of midiCCMappings.entries()) {
          obj[cc] = paramId;
        }

        const blob = new Blob([JSON.stringify(obj, null, 2)], {
          type: "application/json",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${sanitized}.json`;
        link.click();

        announce(`MIDI map exported as ${sanitized}.json`);
      },
    });
  });

  document.getElementById("import-midi-map").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const obj = JSON.parse(e.target.result);
          midiCCMappings.clear();
          for (const cc in obj) {
            midiCCMappings.set(parseInt(cc), obj[cc]);
          }
          saveCCMappings(midiCCMappings);
          announce("MIDI map imported.");
          updateMappingTable();
        } catch (err) {
          console.error("Invalid MIDI map file:", err);
          alert("Failed to import MIDI map.");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  const tableBody = document.getElementById("midi-mapping-table-body");

  function updateMappingTable() {
    tableBody.innerHTML = "";

    for (const [cc, paramId] of midiCCMappings.entries()) {
      const row = document.createElement("tr");

      const ccCell = document.createElement("td");
      ccCell.textContent = cc;
      row.appendChild(ccCell);

      const paramCell = document.createElement("td");
      paramCell.textContent = paramId;
      row.appendChild(paramCell);

      const removeCell = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "DELETE";
      removeBtn.className = "lcd-button";
      removeBtn.title = "Remove mapping";
      removeBtn.className = "remove-mapping-btn";
      removeBtn.setAttribute("aria-label", `Remove mapping for ${paramId}`);
      removeBtn.addEventListener("click", () => {
        midiCCMappings.delete(cc);

        // 🧠 Update localStorage
        const current = JSON.parse(
          localStorage.getItem(LOCAL_MIDI_MAP_KEY) || "{}"
        );
        delete current[cc];
        localStorage.setItem(LOCAL_MIDI_MAP_KEY, JSON.stringify(current));

        updateMappingTable();
      });

      removeCell.appendChild(removeBtn);
      row.appendChild(removeCell);

      tableBody.appendChild(row);
    }

    if (midiCCMappings.size === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.textContent = "No mappings assigned.";
      cell.colSpan = 3;
      cell.tabIndex = 0;
      row.appendChild(cell);
      tableBody.appendChild(row);
    }
  }
  document.querySelectorAll(".remove-mapping-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const cc = parseInt(e.target.dataset.cc);
      midiCCMappings.delete(cc);
      updateMappingTable();
    });
  });

  function updateVisibleFeedbackSliders(algo) {
    // Hide all feedback sliders while preserving layout
    document.querySelectorAll(".feedback-slider").forEach((slider) => {
      const div = slider.closest(".slider-div");
      if (div) {
        div.style.visibility = "hidden";
        slider.disabled = true;
      }
    });

    // Show only relevant ones
    if (Array.isArray(algo.feedback)) {
      algo.feedback.forEach(({ from }) => {
        const slider = document.getElementById(`feedback-${from}`);
        if (slider) {
          const div = slider.closest(".slider-div");
          if (div) {
            div.style.visibility = "visible";
            slider.disabled = false;
          }
        }
      });
    } else if (typeof algo.feedback === "number") {
      const slider = document.getElementById(`feedback-${algo.feedback}`);
      if (slider) {
        const div = slider.closest(".slider-div");
        if (div) {
          div.style.visibility = "visible";
          slider.disabled = false;
        }
      }
    }
  }

  document.getElementById("arp-toggle").addEventListener("change", (e) => {
    arp.toggle(e.target.checked);
  });

  document.getElementById("arp-rate").addEventListener("input", (e) => {
    const rate = parseFloat(e.target.value);
    arp.setRate(rate);
    document.getElementById("arp-rate-val").textContent = `${rate.toFixed(2)}s`;
  });

  const patternSelect = document.getElementById("arp-mode");

  patternSelect.addEventListener("change", (e) => {
    arp.setPattern(e.target.value);
  });

  arp.setPattern(patternSelect.value);

  document.getElementById("arp-octaves").addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    document.getElementById("arp-octaves-value").textContent = val;
    arp.setOctaveRange(val);
  });

  const pianoRoll = document.getElementById("piano-roll");
  const applyButton = document.getElementById("apply-pattern");

  const steps = 16;
  const notes = 6;

  // Build grid
  for (let y = notes - 1; y >= 0; y--) {
    for (let x = 0; x < steps; x++) {
      const cell = document.createElement("div");
      cell.classList.add("piano-roll-cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute("role", "button");
      cell.setAttribute("aria-label", `Step ${x + 1}, Note ${y + 1}`);
      cell.setAttribute("aria-pressed", "false");

      cell.tabIndex = 0; // <-- Make cell focusable
      pianoRoll.appendChild(cell);
    }
  }
  pianoRoll.addEventListener("click", (e) => {
    if (e.target.classList.contains("piano-roll-cell")) {
      const x = parseInt(e.target.dataset.x);
      // Deselect all other cells in this column
      document
        .querySelectorAll(`.piano-roll-cell[data-x='${x}']`)
        .forEach((cell) => {
          cell.classList.remove("active");
          cell.setAttribute("aria-pressed", "false");
        });

      // Toggle clicked cell
      e.target.classList.add("active");
      e.target.setAttribute("aria-pressed", "true");
    }
  });

  // Double-click to remove note
  pianoRoll.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("piano-roll-cell")) {
      e.target.classList.remove("active");
      e.target.setAttribute("aria-pressed", "false");
    }
  });

  // Toggle cell active state with keyboard
  pianoRoll.addEventListener("keydown", (e) => {
    const cell = e.target;
    if (!cell.classList.contains("piano-roll-cell")) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        // Enter always sets the cell active (like now)
        document
          .querySelectorAll(`.piano-roll-cell[data-x='${x}']`)
          .forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-pressed", "false");
          });
        cell.classList.add("active");
        cell.setAttribute("aria-pressed", "true");
        break;

      case " ":
        e.preventDefault();
        const isActive = cell.classList.contains("active");
        // Toggle state
        document
          .querySelectorAll(`.piano-roll-cell[data-x='${x}']`)
          .forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-pressed", "false");
          });
        if (!isActive) {
          cell.classList.add("active");
          cell.setAttribute("aria-pressed", "true");
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        focusCell(x + 1, y);
        break;

      case "ArrowLeft":
        e.preventDefault();
        focusCell(x - 1, y);
        break;

      case "ArrowUp":
        e.preventDefault();
        focusCell(x, y + 1);
        break;

      case "ArrowDown":
        e.preventDefault();
        focusCell(x, y - 1);
        break;
    }
  });

  function focusCell(x, y) {
    const cell = document.querySelector(
      `.piano-roll-cell[data-x='${x}'][data-y='${y}']`
    );
    if (cell) cell.focus();
  }

  // Apply to arpeggiator
  applyButton.addEventListener("click", () => {
    const pattern = [];
    console.log("Final Pattern:", pattern);
    for (let x = 0; x < steps; x++) {
      const activeCell = document.querySelector(
        `.piano-roll-cell.active[data-x='${x}']`
      );
      if (activeCell) {
        pattern.push(parseInt(activeCell.dataset.y));
      } else {
        pattern.push(null); // rest
      }
    }

    console.log("Custom Pattern:", pattern);
    arp.setCustomPattern(pattern);
  });

  updateMappingTable();

  const swingSlider = document.getElementById("arp-swing");
  const swingVal = document.getElementById("arp-swing-val");

  swingSlider.addEventListener("input", () => {
    const value = parseFloat(swingSlider.value);
    swingVal.textContent = value.toFixed(2);
    arp.setSwing(value);
  });

  document.getElementById("arp-latch").addEventListener("change", (e) => {
    arp.setLatched(e.target.checked);
  });

  document.querySelector("#gateTimeSlider").addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    arp.setGateTime(value);
  });
  const slider = document.getElementById("gateTimeSlider");
  const display = document.getElementById("gateTimeValue");

  slider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    arp.setGateTime(val);
    display.textContent = val.toFixed(2);
  });

  const ratchetSelect = document.getElementById("ratchet-count");
  const randomCheckbox = document.getElementById("random-ratchet");

  ratchetSelect.addEventListener("change", (e) => {
    const count = parseInt(e.target.value, 10);
    arp.setRatchetCount(count);
  });

  randomCheckbox.addEventListener("change", (e) => {
    arp.enableRandomRatchet(e.target.checked);
  });

  function handleModWheel(value) {
    const normalized = value / 127;

    const destination = document.getElementById("mod-destination").value;
    const depthSlider = document.getElementById("tremolo-depth");
    const depthDisplay = document.getElementById("tremolo-depth-value");
    const rateSlider = document.getElementById("tremolo-rate");
    const rateDisplay = document.getElementById("tremolo-rate-value");

    switch (destination) {
      case "tremoloDepth":
        tremoloDepth = normalized;
        if (fmVoice) {
          fmVoice.setTremolo(tremoloRate, tremoloDepth);
        }
        if (depthSlider && depthDisplay) {
          depthSlider.value = tremoloDepth.toFixed(2);
          depthSlider.dispatchEvent(new Event("input"));
          depthDisplay.textContent = tremoloDepth.toFixed(2);
        }
        break;

      case "tremoloRate":
        tremoloRate = normalized * 20;
        if (fmVoice) {
          fmVoice.setTremolo(tremoloRate, tremoloDepth);
        }
        if (rateSlider && rateDisplay) {
          rateSlider.value = tremoloRate.toFixed(2);
          rateSlider.dispatchEvent(new Event("input"));
          rateDisplay.textContent = tremoloRate.toFixed(2);
        }
        break;

      case "pitchLFODepth":
        pitchLFODepth = normalized * 2;
        if (fmVoice) {
          fmVoice.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
        }
        const depthElem = document.getElementById("pitch-lfo-depth");
        const depthValElem = document.getElementById("pitch-lfo-depth-value");
        if (depthElem && depthValElem) {
          depthElem.value = pitchLFODepth.toFixed(2);
          depthElem.dispatchEvent(new Event("input"));
          depthValElem.textContent = pitchLFODepth.toFixed(2);
        }
        break;

      case "pitchLFORate":
        pitchLFORate = normalized * 20;
        if (fmVoice) {
          fmVoice.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
        }
        const rateElem = document.getElementById("pitch-lfo-rate");
        const rateValElem = document.getElementById("pitch-lfo-rate-value");
        if (rateElem && rateValElem) {
          rateElem.value = pitchLFORate.toFixed(2);
          rateElem.dispatchEvent(new Event("input"));
          rateValElem.textContent = pitchLFORate.toFixed(2);
        }
        break;
    }
  }

  const paramBindings = [
    {
      id: "delay-gain",
      label: "Gain",
      group: "Delay",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.3,
      target: () => masterBus.delayGain.gain,
      display: true,
    },
    {
      id: "delay-feedback",
      label: "Feedback",
      group: "Delay",
      min: 0,
      max: 0.95,
      step: 0.01,
      value: 0.3,
      target: () => masterBus.delayFeedback.gain,
      display: true,
    },
    {
      id: "delay-time",
      label: "Time",
      group: "Delay",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.25,
      target: () => masterBus.delay.delayTime,
      display: true,
    },
    {
      id: "panner-rate",
      label: "Rate (Hz)",
      group: "Auto Panner",
      min: 0.01,
      max: 5,
      step: 0.01,
      value: 0.25,
      target: () => masterBus.lfo.frequency,
      display: true,
    },
    {
      id: "panner-depth",
      label: "Depth",
      group: "Auto Panner",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
      target: () => masterBus.lfoGain.gain,
      display: true,
    },
    {
      id: "panner-modulation",
      label: "Direction",
      group: "Auto Panner",
      min: -1,
      max: 1,
      step: 0.01,
      value: 1.0,
      target: () => masterBus.panNode.pan,
      display: true,
    },
    {
      id: "distortion-amount",
      label: "Drive",
      group: "Distortion",
      min: 0,
      max: 1000,
      step: 1,
      value: 400,
      apply: (value) => {
        masterBus.distortion.curve = masterBus.makeDistortionCurve(
          parseFloat(value)
        );
      },
      display: true,
    },
    {
      id: "distortion-pregain",
      label: "Pre",
      group: "Distortion",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
      target: () => masterBus.distortionPreGain.gain,
      display: true,
    },
    {
      id: "distortion-mix",
      label: "Mix",
      group: "Distortion",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
      target: () => masterBus.distortionGain.gain,
      display: true,
    },
    {
      id: "pitch-lfo-type",
      label: "Wave",
      group: "Pitch LFO",
      type: "select",
      value: "sine",
      options: [
        { label: "Sin", value: "sine" },
        { label: "Tri", value: "triangle" },
        { label: "Saw", value: "sawtooth" },
        { label: "Sqr", value: "square" },
      ],
      apply: (val) => {
        pitchLFOType = val;
        if (fmVoice) {
          fmVoice.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
        }
      },
      display: true,
    },
    {
      id: "pitch-lfo-rate",
      label: "Rate",
      group: "Pitch LFO",
      min: 0.1,
      max: 20,
      step: 0.1,
      value: 0.1,
      apply: (val) => {
        pitchLFORate = parseFloat(val);
        if (fmVoice) fmVoice.setPitchLFO(pitchLFORate, pitchLFODepth);
      },
      display: true,
    },
    {
      id: "pitch-lfo-depth",
      label: "Depth",
      group: "Pitch LFO",
      min: 0,
      max: 2,
      step: 0.01,
      value: 0,
      apply: (val) => {
        pitchLFODepth = parseFloat(val);
        if (fmVoice) fmVoice.setPitchLFO(pitchLFORate, pitchLFODepth);
      },
      display: true,
    },
    {
      id: "filter-type",
      label: "Type",
      group: "Filter",
      type: "select",
      value: "lowpass",
      options: [
        { label: "Low", value: "lowpass" },
        { label: "High", value: "highpass" },
        { label: "Band", value: "bandpass" },
      ],
      target: () => masterBus.masterFilter.type,
      apply: (val) => {
        masterBus.masterFilter.type = val;
      },
      display: true,
    },
    {
      id: "filter-frequency",
      label: "Cutoff",
      group: "Filter",
      min: 100,
      max: 20000,
      step: 10,
      value: 18000,
      target: () => masterBus.masterFilter.frequency,
      display: true,
    },
    {
      id: "filter-q",
      label: "Res",
      group: "Filter",
      min: 0.0,
      max: 20,
      step: 0.01,
      value: 0.0,
      target: () => masterBus.masterFilter.Q,
      display: true,
    },
    {
      id: "tremolo-delay",
      label: "Delay",
      group: "Tremolo",
      min: 0,
      max: 5,
      step: 0.01,
      value: 0,
      apply: (val) => {
        tremoloDelay = parseFloat(val);
      },
      display: true,
    },
    {
      id: "tremolo-rate",
      label: "Rate",
      group: "Tremolo",
      min: 0.1,
      max: 20,
      step: 0.1,
      value: tremoloRate,
      apply: (val) => {
        tremoloRate = parseFloat(val);
        if (fmVoice)
          fmVoice.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
      },
      display: true,
    },
    {
      id: "tremolo-depth",
      label: "Depth",
      group: "Tremolo",
      min: 0,
      max: 1,
      step: 0.01,
      value: tremoloDepth,
      apply: (val) => {
        tremoloDepth = parseFloat(val);
        if (fmVoice)
          fmVoice.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
      },
      display: true,
    },
    {
      id: "reverb-gain",
      label: "Gain",
      group: "Reverb",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.3,
      target: () => masterBus.reverbGain.gain,
      display: true,
    },
    {
      id: "pitch-env-delay",
      label: "Delay",
      group: "Pitch Env",
      min: 0,
      max: 2,
      step: 0.01,
      value: 0,
      apply: (val) => {
        setGlobalPitchEnvParam("delay", parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },

    {
      id: "pitch-env-attack",
      label: "Attack",
      group: "Pitch Env",
      min: 0,
      max: 2,
      step: 0.01,
      value: 0.1,
      apply: (val) => {
        setGlobalPitchEnvParam("attack", parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },
    {
      id: "pitch-env-decay",
      label: "Decay",
      group: "Pitch Env",
      min: 0,
      max: 2,
      step: 0.01,
      value: 0.2,
      apply: (val) => {
        setGlobalPitchEnvParam("decay", parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },
    {
      id: "pitch-env-sustain",
      label: "Sustain",
      group: "Pitch Env",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      apply: (val) => {
        setGlobalPitchEnvParam("sustain", parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },
    {
      id: "pitch-env-release",
      label: "Release",
      group: "Pitch Env",
      min: 0,
      max: 3,
      step: 0.01,
      value: 0.5,
      apply: (val) => {
        setGlobalPitchEnvParam("release", parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },
    {
      id: "pitch-env-depth",
      label: "Depth",
      group: "Pitch Env",
      min: -24,
      max: 24,
      step: 0.1,
      value: 0,
      apply: (val) => {
        setGlobalPitchEnvDepth(parseFloat(val));
        if (fmVoice) {
          fmVoice.setPitchEnvelope(getGlobalPitchEnvParams());
        }
      },
      display: true,
    },
    {
      id: "stereo-width",
      label: "Width",
      group: "Stereo",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.4,
      target: () => masterBus.stereoWidthGain.gain,
      display: true,
    },
  ];

  function setupSliders(containerId = "fx-controls") {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Group parameters by effect section
    const grouped = {};
    paramBindings.forEach((binding) => {
      if (!grouped[binding.group]) grouped[binding.group] = [];
      grouped[binding.group].push(binding);
    });

    // Create each group block
    Object.entries(grouped).forEach(([groupName, params]) => {
      const groupWrapper = document.createElement("div");
      groupWrapper.className = "fx-group panel";

      // Section title
      const sectionLabel = document.createElement("div");
      sectionLabel.className = "fx-title lcd-green";
      sectionLabel.textContent = groupName.toUpperCase();
      groupWrapper.appendChild(sectionLabel);

      // Row of knobs/selects and value displays
      const knobRow = document.createElement("div");
      knobRow.className = "fx-knob-row panel";
      params.forEach((binding) => {
        const controlWrapper = document.createElement("div");
        controlWrapper.className = "slider-div panel"; // shared for layout
        const paramLabel = document.createElement("label");
        paramLabel.className = "fx-label lcd-text";
        paramLabel.setAttribute("for", binding.id);
        paramLabel.textContent = binding.label.toUpperCase();
        controlWrapper.appendChild(paramLabel);
        const rangeWrapper = document.createElement("div");
        rangeWrapper.className =
          binding.type === "select" ? "select-wrapper" : "range-knob-wrapper";
        rangeWrapper.style.border = "none";

        let input;
        if (binding.type === "select") {
          input = document.createElement("select");
          input.id = binding.id;
          input.setAttribute("aria-label", `${binding.group} ${binding.label}`);
          input.className = "lcd-select";

          binding.options.forEach((opt) => {
            const option = document.createElement("option");
            if (typeof opt === "string") {
              // fallback for old format
              option.value = opt;
              option.textContent = opt.toUpperCase();
            } else {
              // new format with label and value
              option.value = opt.value;
              option.textContent = opt.label;
            }
            input.appendChild(option);
          });

          input.value = binding.value;
        } else {
          input = document.createElement("input");
          input.type = "range";
          input.id = binding.id;
          input.min = binding.min;
          input.max = binding.max;
          input.step = binding.step;
          input.value = binding.value;
          input.setAttribute("aria-label", `${binding.group} ${binding.label}`);
        }

        rangeWrapper.appendChild(input);

        if (binding.type === "select") {
          rangeWrapper.classList.add("select-wrapper");
        } else {
          const knob = document.createElement("div");
          knob.className = "range-knob";
          rangeWrapper.appendChild(knob);
        }

        // Value display
        let valueDisplay = null;
        if (binding.type !== "select") {
          valueDisplay = document.createElement("span");
          valueDisplay.id = `${binding.id}-value`;
          valueDisplay.className = "lcd-text";
          valueDisplay.textContent = parseFloat(binding.value).toFixed(2);
        }
        const learnButton = document.createElement("button");
        learnButton.className = "learn-button lcd-button";
        learnButton.textContent = "Learn";
        learnButton.title = "Click to assign a MIDI CC to this parameter";
        learnButton.style.marginTop = "4px";
        learnButton.style.fontSize = "0.75em";
        learnButton.setAttribute(
          "aria-label",
          `${binding.label} Learn CC Button`
        );
        learnButton.addEventListener("click", () => {
          document
            .querySelectorAll(".learn-button")
            .forEach((btn) => btn.classList.remove("flicker"));
          learningParamId = binding.id;
          console.log(`🎛️ Ready to map MIDI CC to "${binding.label}"`);
          announce(`Ready To Map "${binding.label}" Send A MIDI CC`);

          learnButton.classList.add("flicker");
        });

        // Event handler
        input.addEventListener("input", () => {
          const rawVal = input.value;
          const val =
            binding.type === "select" ? rawVal : parseFloat(rawVal).toFixed(2);

          if (valueDisplay) {
            valueDisplay.textContent =
              binding.type === "select" ? val.toUpperCase() : val;
          }

          if (binding.apply) {
            binding.apply(rawVal);
          } else if (
            binding.method &&
            typeof masterBus[binding.method] === "function"
          ) {
            masterBus[binding.method](parseFloat(val));
          } else if (binding.target) {
            binding.target().value =
              binding.type === "select" ? rawVal : parseFloat(val);
          }
        });

        controlWrapper.appendChild(rangeWrapper);
        if (valueDisplay) {
          controlWrapper.appendChild(valueDisplay);
          controlWrapper.appendChild(learnButton);
        }
        knobRow.appendChild(controlWrapper);
      });

      groupWrapper.appendChild(knobRow);
      container.appendChild(groupWrapper);
    });

    $("input[type='range']").each(function () {
      $(this).closest(".range-knob-wrapper").rangeKnob();
    });
  }

  setupSliders();

  function announce(msg) {
    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = ""; // clear to ensure repeat announcements fire
      setTimeout(() => {
        region.textContent = msg;
      }, 10);
    }
  }

  function handleMIDIMessage(msg) {
    const [status, data1, data2] = msg.data;
    const command = status & 0xf0;
    const channel = status & 0x0f;
    const note = data1;
    const velocity = data2;
    const algoId = parseInt(algoSelect.value);

    if (selectedMIDIChannel !== "all" && channel !== selectedMIDIChannel - 1) {
      return;
    }

    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const glide = lastFreq ? glideTime : 0;
    lastFreq = freq;

    // NOTE ON
    if (command === 0x90 && velocity > 0) {
      if (arp.enabled) {
        arp.addNote(note);
      }

      fmVoice = noteOn(
        context,
        note,
        velocity,
        getOperatorParams,
        algoId,
        masterBus,
        tremoloDelay,
        tremoloRate,
        tremoloDepth,
        pitchLFORate,
        pitchLFODepth,
        pitchLFOType,
        voiceMode,
        glide,
        masterBus
      );

      fmVoice.setPitchEnvelope({
        ...globalPitchEnvParams,
        depth: globalPitchEnvDepth,
      });

      fmVoice.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
    }

    // NOTE OFF
    else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      if (arp.enabled) {
        arp.removeNote(note);
      } else {
        noteOff(note, masterBus); // handle regular voice off
      }
    }

    // CONTROL CHANGE (CC)
    else if (command === 0xb0) {
      const ccNum = data1;
      const ccValNorm = data2 / 127;

      // Mod Wheel special case
      if (ccNum === 1) {
        handleModWheel(data2);
        return;
      }

      // Learn Mode Active
      if (learningParamId) {
        midiCCMappings.set(ccNum, learningParamId);
        saveCCMappings(midiCCMappings); // ✅ persist mapping

        console.log(`✅ Mapped MIDI CC ${ccNum} to "${learningParamId}"`);

        document
          .querySelectorAll(".learn-button")
          .forEach((btn) => btn.classList.remove("flicker"));

        announce(
          `Mapped MIDI controller ${ccNum} to ${learningParamId.replace(
            /-/g,
            " "
          )}`
        );
        updateMappingTable();
        learningParamId = null;
        return;
      }

      // Mapped Parameter Handling
      const paramId = midiCCMappings.get(ccNum);
      if (!paramId) return;

      const input = document.getElementById(paramId);
      if (!input) {
        console.warn(`⚠️ No DOM element found for mapped paramId: ${paramId}`);
        return;
      }

      try {
        if (input.type === "range") {
          const min = parseFloat(input.min);
          const max = parseFloat(input.max);
          const val = ccValNorm * (max - min) + min;
          input.value = val.toFixed(2);
          input.dispatchEvent(new Event("input"));

          const label = input.getAttribute("aria-label") || paramId;
        } else if (input.tagName === "SELECT") {
          const options = Array.from(input.options);
          const index = Math.floor(ccValNorm * (options.length - 1));
          input.selectedIndex = index;
          input.dispatchEvent(new Event("change"));
        }
      } catch (err) {
        console.error(
          `❌ Failed to apply CC${ccNum} to paramId ${paramId}:`,
          err
        );
      }
    }

    // Pitch Bend
    else if (command === 0xe0) {
      const bendValue = ((data2 << 7) | data1) - 8192;
      currentPitchBend = (bendValue / 8192) * pitchBendRange;

      if (fmVoice && typeof fmVoice.setPitchBend === "function") {
        fmVoice.setPitchBend(currentPitchBend);
      }
    }
  }

  setupMIDI(handleMIDIMessage);

  document.addEventListener("keydown", (e) => {
    const note = keyboardMap[e.code];
    if (note !== undefined) {
      arp.addNote(note);
    }
    if (note !== undefined && !heldNotes.has(note)) {
      heldNotes.add(note);

      if (!arp.enabled) {
        fmVoice = noteOn(
          context,
          note,
          127,
          getOperatorParams,
          parseInt(algoSelect.value),
          masterBus,
          tremoloDelay,
          tremoloRate,
          tremoloDepth,
          pitchLFORate,
          pitchLFODepth,
          pitchLFOType,
          voiceMode,
          glideTime,
          masterBus
        );

        fmVoice.setPitchEnvelope({
          ...globalPitchEnvParams,
          depth: globalPitchEnvDepth,
        });
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    const note = keyboardMap[e.code];
    if (note !== undefined) {
      arp.removeNote(note);
    }
    if (note !== undefined) {
      heldNotes.delete(note);
      noteOff(note, masterBus);
    }
  });
});

function openModal({
  title,
  description,
  onConfirm,
  showInput = true,
  confirmLabel = "OK",
  defaultValue = "",
}) {
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("modal");
  const titleEl = document.getElementById("modal-title");
  const descEl = document.getElementById("modal-description");
  const inputEl = document.getElementById("modal-input");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  titleEl.textContent = title;
  descEl.textContent = description;
  confirmBtn.textContent = confirmLabel;

  if (showInput) {
    inputEl.style.display = "block";
    inputEl.value = defaultValue || "";
    setTimeout(() => inputEl.focus(), 50);
  } else {
    inputEl.style.display = "none";
    setTimeout(() => confirmBtn.focus(), 50);
  }

  overlay.hidden = false;
  modal.focus();

  function close() {
    overlay.hidden = true;
    confirmBtn.removeEventListener("click", confirmHandler);
    cancelBtn.removeEventListener("click", close);
  }

  function confirmHandler() {
    const val = showInput ? inputEl.value.trim() : null;
    close();
    onConfirm(val);
  }

  confirmBtn.addEventListener("click", confirmHandler);
  cancelBtn.addEventListener("click", close);

  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Basic focus trap (optional)
  const focusableEls = modal.querySelectorAll("button, input");
  let i = 0;
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      focusableEls[i % focusableEls.length].focus();
      i++;
    }
  });
}

function initAlgoColorSync() {
  const algoSelect = document.getElementById("algorithm-select");
  const algoSVG = document.getElementById("algorithm-visual");
  const bgPicker = document.getElementById("color-picker-2");
  const linePicker = document.getElementById("color-picker");

  if (
    !(
      algoSelect &&
      algoSVG &&
      bgPicker &&
      linePicker &&
      typeof drawAlgorithm === "function"
    )
  ) {
    // Try again later—page might not be ready yet.
    setTimeout(initAlgoColorSync, 500);
    return;
  }

  function getAlgoColors() {
    const lineCol = linePicker.value || "#ff7700";
    return {
      nodeFill: bgPicker.value || "#18100d",
      nodeStroke: lineCol,
      nodeLabel: lineCol,
      outLabel: lineCol,
      connStroke: lineCol,
      feedbackStroke: lineCol,
      glow: lineCol,
      arrow: lineCol,
    };
  }

  function redraw() {
    drawAlgorithm(parseInt(algoSelect.value), algoSVG, getAlgoColors());
  }

  // Defensive: remove any previous listeners (for hot reload)
  bgPicker.oninput = null;
  linePicker.oninput = null;
  algoSelect.onchange = null;

  // Attach event listeners
  bgPicker.addEventListener("input", redraw);
  linePicker.addEventListener("input", redraw);
  algoSelect.addEventListener("change", redraw);

  // MutationObserver for programmatic changes
  const obsCfg = { attributes: true, attributeFilter: ["value"] };
  const observer = new MutationObserver(redraw);
  observer.observe(bgPicker, obsCfg);
  observer.observe(linePicker, obsCfg);

  // Failsafe: also redraw every 1s (in case something slips through)
  if (!window._algoRedrawInterval) {
    window._algoRedrawInterval = setInterval(redraw, 1000);
  }

  // Initial draw
  redraw();
}

// Attach when DOM is loaded
window.addEventListener("DOMContentLoaded", initAlgoColorSync);
