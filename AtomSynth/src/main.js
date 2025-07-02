import * as Tone from "https://esm.sh/tone";
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
import { initScene, animateScene, scene } from "./visuals.js";
import { modTargets, renderModTargets } from "./mod-targets.js";
import { getOrCreateCategory } from "./mod-targets.js";
import { createOscWaveUI } from "./osc-waves.js";
import {
  triggerNote,
  setEnvelopeParams,
  setOsc1Type,
  setOsc2Type,
  setPortamento,
  synth,
  noteOn,
  noteOff,
} from "./synth.js";
import {
  getNoteFromX,
  getVelocityFromY,
  setCurrentScale,
  setCurrentOctaves,
  setCurrentKey,
} from "./utils.js";

import {
  getElectrons,
  addElectron,
  addProton,
  addNeutron,
  getAllParticles,
  setParticleMovementType,
  setParticleMovementSpeed,
  setParticleForceAmount,
  setParticleRepellingForce,
  setElectronInfluenceForce,
  setElectronAttractionTime,
  setElectronRepulsionTime,
  setNeutronProtonDistance,
  applyUserImpulse,
  setProtonColor,
  setNeutronColor,
  setElectronColor,
  setCurrentForceInfluence,
} from "./physics.js";

import {
  particlePanelConfig,
  createParticleControlPanel,
} from "./particle-panel.js";

let currentScale = "major";

let currentBaseOctave = 4;
let currentOctaveRange = 2;
let currentOctaves = [4, 5];
let currentNoteLength = 400;
let currentGlide = 0;
let legatoMode = "off";
let currentChordMode = "off";
let currentNoteInterval = 1000;
let randomizeNoteLength = false;
let randomizeNoteInterval = false;

registerMIDIHandler((msg) => {
  const [status, data1, data2] = msg.data;
  const command = status & 0xf0;
  const note = Tone.Frequency(data1, "midi").toNote();

  if (command === 0x90 && data2 > 0) {
    noteOn(note, data2 / 127);
  } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
    noteOff(note);
  }
});

function updateCurrentOctaves() {
  currentOctaves = [];
  for (let i = 0; i < currentOctaveRange; i++) {
    currentOctaves.push(currentBaseOctave + i);
  }
  setCurrentOctaves(currentOctaves);
}

const leftPanel = document.createElement("div");
leftPanel.id = "particleControlPanel";
leftPanel.classList = "panel";

const rightPanel = document.getElementById("modPanel");
rightPanel.classList = "panel";

document.body.appendChild(leftPanel);

createParticleControlPanel(leftPanel, particlePanelConfig);

const modPanel = document.getElementById("modPanel");

const oscCategory = getOrCreateCategory(modPanel, "Oscillators");

createOscWaveUI(oscCategory, "Wave 1", (waveType) => {
  setOsc1Type(waveType);
});

createOscWaveUI(oscCategory, "Wave 2", (waveType) => {
  setOsc2Type(waveType);
});

renderModTargets(modPanel, modTargets);

//Refresh particle dropdowns
function refreshModSourceDropdown() {
  const particles = getAllParticles();
  modTargets.forEach(({ key }) => {
    const select = document.getElementById(`${key}-source`);
    if (!select) return;
    const currentValue = select.value; //save current selection
    select.innerHTML = "";
    // Always include "None"
    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.text = "None";
    select.appendChild(noneOption);
    // Add particles
    particles.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.text = p.id;
      select.appendChild(option);
    });
    //Restore previous selection if still valid
    if (currentValue === "" || particles.some((p) => p.id === currentValue)) {
      select.value = currentValue;
    } else {
      select.value = "";
    }
  });
}

// Basic chord formulas in semitones from root
const CHORDS = {
  off: [0],
  major: [0, 4, 7],
  minor: [0, 3, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
};

function triggerChord(rootNote, velocity, duration, chordMode) {
  if (!rootNote) return;
  const chord = CHORDS[chordMode] || [0];
  const rootMidi = Tone.Frequency(rootNote).toMidi();
  chord.forEach((interval) => {
    const midiNote = rootMidi + interval;
    const noteName = Tone.Frequency(midiNote, "midi").toNote();
    triggerNote(noteName, velocity, duration);
  });
}

let noteIntervalTimer = null;

function startNoteInterval() {
  if (noteIntervalTimer) clearTimeout(noteIntervalTimer);

  const nextInterval = randomizeNoteInterval
    ? Math.floor(Math.random() * 1200) + 200
    : currentNoteInterval;

  noteIntervalTimer = setTimeout(() => {
    triggerElectronsNotes();
    startNoteInterval(); // Schedule next
  }, nextInterval);
}

function triggerElectronsNotes() {
  getElectrons().forEach(({ body }) => {
    const note = getNoteFromX(body.position.x, currentScale, currentOctaves);
    const velocity = getVelocityFromY(body.position.y);
    const length = randomizeNoteLength
      ? (Math.random() * 800 + 200) / 1000 + "s"
      : currentNoteLength / 1000 + "s";

    triggerChord(note, velocity, length, currentChordMode);
  });
}

//Start everything
async function startSynthAndScene() {
  await Tone.start();
  console.log("AudioContext resumed");
  initScene();
  animateScene();
  await setupMIDI(handleIncomingNote);
  startNoteInterval();
}

function resetNoteInterval() {
  startNoteInterval();
}

//MIDI input handler
function handleIncomingNote(midiNote, velocity) {
  triggerNote(Tone.Frequency(midiNote, "midi").toNote(), velocity, "2n");
}

//Key handling for spawning particles
document.addEventListener("keydown", (e) => {
  if (e.key === "p") {
    const id = addProton(scene);
    refreshModSourceDropdown();
  }
  if (e.key === "n") {
    const id = addNeutron(scene);
    refreshModSourceDropdown();
  }
  if (e.key === "e") {
    addElectron(scene);
  }
});

//One-time synth/scene activation
document.getElementById("startButton").addEventListener("click", () => {
  startSynthAndScene();
  enableMIDILearnMode("particleControlPanel");
  enableMIDILearnMode("modPanel");
  initMIDILearn();
  renderAudioPresetList("audio-preset-list", synth);
  document.getElementById("startButton").style.display = "none";
  document.getElementById("theme-button").style.display = "";
});

// Helper: convert "#rrggbb" to number
function hexStringToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

document
  .getElementById("proton-color-picker")
  .addEventListener("input", (e) => {
    setProtonColor(hexStringToInt(e.target.value));
  });
document
  .getElementById("neutron-color-picker")
  .addEventListener("input", (e) => {
    setNeutronColor(hexStringToInt(e.target.value));
  });
document
  .getElementById("electron-color-picker")
  .addEventListener("input", (e) => {
    setElectronColor(hexStringToInt(e.target.value));
  });

// Movement Type Dropdown
document
  .getElementById("particle-movement-type")
  .addEventListener("change", (e) => {
    setParticleMovementType(e.target.value);
  });

// Movement Speed Slider
document
  .getElementById("particle-movement-speed")
  .addEventListener("input", (e) => {
    setParticleMovementSpeed(Number(e.target.value));
    document.getElementById("particle-movement-speed-value").innerText =
      e.target.value;
  });

// Force Amount Slider
document
  .getElementById("particle-force-slider")
  .addEventListener("input", (e) => {
    setParticleForceAmount(Number(e.target.value));
    document.getElementById("particle-force-slider-value").innerText =
      e.target.value;
  });

// Repelling Force Slider
document
  .getElementById("particle-repelling-slider")
  .addEventListener("input", (e) => {
    setParticleRepellingForce(Number(e.target.value));
    document.getElementById("particle-repelling-slider-value").innerText =
      e.target.value;
  });

document
  .getElementById("add-particle-electron")
  .addEventListener("click", () => {
    addElectron(scene);
    refreshModSourceDropdown();
  });

document.getElementById("add-particle-proton").addEventListener("click", () => {
  addProton(scene);
  refreshModSourceDropdown();
});
document
  .getElementById("add-particle-neutron")
  .addEventListener("click", () => {
    addNeutron(scene);
    refreshModSourceDropdown();
  });
document
  .getElementById("apply-particle-impulse")
  .addEventListener("click", () => {
    applyUserImpulse();
  });

document
  .getElementById("particle-attraction-force")
  .addEventListener("input", (e) =>
    setElectronInfluenceForce(Number(e.target.value))
  );

document
  .getElementById("particle-attraction-time")
  .addEventListener("input", (e) =>
    setElectronAttractionTime(Number(e.target.value))
  );
document
  .getElementById("particle-repulsion-time")
  .addEventListener("input", (e) =>
    setElectronRepulsionTime(Number(e.target.value))
  );
document
  .getElementById("particle-distance-constraint")
  .addEventListener("input", (e) =>
    setNeutronProtonDistance(Number(e.target.value))
  );

function updateEnvelopeFromUI() {
  const attack = Number(
    document.getElementById("synth.envelope.attack-base").value
  );
  const decay = Number(
    document.getElementById("synth.envelope.decay-base").value
  );
  const sustain = Number(
    document.getElementById("synth.envelope.sustain-base").value
  );
  const release = Number(
    document.getElementById("synth.envelope.release-base").value
  );

  setEnvelopeParams({ attack, decay, sustain, release });
}

// Then add this to all 3 envelope slider inputs:
["attack", "decay", "sustain", "release"].forEach((param) => {
  document
    .getElementById(`synth.envelope.${param}-base`)
    .addEventListener("input", updateEnvelopeFromUI);
});

document.getElementById("note-scale-select").addEventListener("change", (e) => {
  currentScale = e.target.value;
  setCurrentScale(currentScale);
});

document.getElementById("note-key-select").addEventListener("change", (e) => {
  setCurrentKey(e.target.value);
});

document
  .getElementById("note-base-octave-select")
  .addEventListener("change", (e) => {
    currentBaseOctave = Number(e.target.value);
    updateCurrentOctaves();
  });

document
  .getElementById("note-octave-range-slider")
  .addEventListener("input", (e) => {
    currentOctaveRange = Number(e.target.value);
    document.getElementById("note-octave-range-slider-value").innerText =
      currentOctaveRange;
    updateCurrentOctaves();
  });

currentNoteLength = Number(document.getElementById("note-length-slider").value);
document.getElementById("note-length-slider-value").innerText =
  currentNoteLength;

document.getElementById("note-length-slider").addEventListener("input", (e) => {
  currentNoteLength = Number(e.target.value);
  document.getElementById("note-length-slider-value").innerText =
    currentNoteLength;
});

currentGlide = Number(document.getElementById("note-glide-slider").value);
document.getElementById("note-glide-slider-value").innerText = currentGlide;

document.getElementById("note-glide-slider").addEventListener("input", (e) => {
  currentGlide = Number(e.target.value);
  document.getElementById("note-glide-slider-value").innerText = currentGlide;
  setPortamento(currentGlide / 1000); // seconds
});

legatoMode = document.getElementById("legato-mode-select").value;

document
  .getElementById("legato-mode-select")
  .addEventListener("change", (e) => {
    legatoMode = e.target.value;
    if (legatoMode === "on") {
      // Decide which note to play: e.g., the last electron, highest, lowest, or randomly
      const electrons = getElectrons();
      if (electrons.length > 0) {
        const { body } = electrons[electrons.length - 1];
        const note = getNoteFromX(
          body.position.x,
          currentScale,
          currentOctaves
        );
        const velocity = getVelocityFromY(body.position.y);
        triggerChord(
          note,
          velocity,
          currentNoteLength / 1000 + "s",
          currentChordMode
        );
      }
    } else {
      // Polyphonic mode, trigger all electrons as before
      getElectrons().forEach(({ body }) => {
        const note = getNoteFromX(
          body.position.x,
          currentScale,
          currentOctaves
        );
        const velocity = getVelocityFromY(body.position.y);
        triggerChord(
          note,
          velocity,
          currentNoteLength / 1000 + "s",
          currentChordMode
        );
      });
    }
  });

currentChordMode = document.getElementById("chord-mode-select").value;
document.getElementById("chord-mode-select").addEventListener("change", (e) => {
  currentChordMode = e.target.value;
});

const intervalSlider = document.getElementById("note-interval-slider");
const intervalValue = document.getElementById("note-interval-slider-value");

intervalSlider.addEventListener("input", (e) => {
  currentNoteInterval = Number(e.target.value);
  intervalValue.innerText = currentNoteInterval;
  resetNoteInterval();
});

document
  .getElementById("randomize-note-length")
  .addEventListener("change", (e) => {
    randomizeNoteLength = e.target.checked;
  });

document
  .getElementById("randomize-note-interval")
  .addEventListener("change", (e) => {
    randomizeNoteInterval = e.target.checked;
    resetNoteInterval(); // Restart with new interval mode
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

const openBtn = document.getElementById("open-midi-learn-btn");
const modal = document.getElementById("midi-learn-modal");
const closeBtn = document.getElementById("close-midi-learn");

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close on background click
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Optional: Close on Esc key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display !== "none") {
    modal.style.display = "none";
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

const openAudioBtn = document.getElementById("open-audio-preset-btn");
const audioModal = document.getElementById("audio-preset-modal");
const closeAudioBtn = document.getElementById("close-audio-preset-modal");

openAudioBtn.addEventListener("click", () => {
  audioModal.style.display = "flex";
});

closeAudioBtn.addEventListener("click", () => {
  audioModal.style.display = "none";
});

audioModal.addEventListener("click", (e) => {
  if (e.target === audioModal) {
    audioModal.style.display = "none";
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && audioModal.style.display !== "none") {
    audioModal.style.display = "none";
  }
});

function updateForceSlidersVisibility(selectedType) {
  document.querySelectorAll(".force-slider").forEach((slider) => {
    if (slider.classList.contains(`force-type-${selectedType}`)) {
      slider.parentElement.style.display = "";
    } else {
      slider.parentElement.style.display = "none";
    }
  });
}

const forceSelect = document.getElementById("force-influence-select");
if (forceSelect) {
  updateForceSlidersVisibility(forceSelect.value);
  setCurrentForceInfluence(forceSelect.value);
  forceSelect.addEventListener("change", (e) => {
    updateForceSlidersVisibility(e.target.value);
    setCurrentForceInfluence(e.target.value);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // Run once to sync on load
  const light = document.getElementById("light");
  const toggleAccess = document.getElementById("toggleAccess");
  if (light.disabled) {
    toggleAccess.style.display = "";
  } else {
    toggleAccess.style.display = "none";
  }
});
