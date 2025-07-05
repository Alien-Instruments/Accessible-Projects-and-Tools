export const announceModeRef = { value: "aria" };

import { audioContext } from "./utils/context.js";
import { attachModRing } from "./mod-ring.js";
import { createUiLfo } from "./UI/lfo-ui.js";
import { setupMIDI } from "./midi/midi.js";
import { setupKeyboard } from "./keyboard.js";
import { triggerMIDILearnForControl } from "./midi/midi-learn.js";
import { setupVoiceControl } from "./voice-control/voice-commands.js";
import { loadAllWaves } from "./wavetable-loader.js";
import { createAudioGraph } from "./audio-graph.js";
import { createSynth } from "./synth-controller.js";
import { setupModulationUI } from "./modulation-ui.js";
import { setupLfoModulationUI } from "./lfo-modulation-ui.js";
import { setupPresetUI } from "./UI/preset-ui.js";
import { waveSources } from "./wave-source.js";
import { createActions } from "./utils/actions.js";
import { getShortcut, setShortcut } from "./utils/shortcutManager.js";
import { defaultShortcuts } from "./utils/defaultShortcuts.js";
import { buildSynthUI } from "./UI/ui.js";
import { getSynthParams } from "./UI/params.js";
import { renderAudioPresetList } from "./preset-manager.js";
import { getAllShortcuts } from "./utils/shortcutManager.js";
import {
  initMIDILearn,
  enableMIDILearnMode,
  cancelMIDILearn,
} from "./midi/midi-learn.js";

window.lastFocusedRangeInput = null;
document.addEventListener("focusin", function (e) {
  if (e.target && e.target.type === "range") {
    window.lastFocusedRangeInput = e.target;
  }
});

window.attachModRing = attachModRing;

const actions = createActions({
  announceModeRef,
  announce,
  recognition: window.recognition,
});

export let isModulating = false;
let musicalTypingEnabled =
  localStorage.getItem("musicalTypingEnabled") === "false" ? false : true;

export const baseParamValues = {};

const waveFiles = [];
let keyboardOctave = 0;

// Generate full file paths
for (const source of waveSources) {
  const { folder, prefix, count } = source;
  for (let i = 1; i <= count; i++) {
    const filename = `${prefix}${i}.wav`;
    const filePath = `${folder}/${filename}`;
    waveFiles.push(filePath);
  }
}

let currentWaveA1 = "Bass/Bass3.wav";
let currentWaveB1 = "Bass/Bass4.wav";
let currentWaveA2 = "Granular/Granular2.wav";
let currentWaveB2 = "Fm/Fm1.wav";

function getNormalizedCombo(e) {
  const mods = [];
  if (e.ctrlKey) mods.push("Control");
  if (e.shiftKey) mods.push("Shift");
  if (e.altKey) mods.push("Alt");
  if (e.metaKey) mods.push("Meta");
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  return [...mods, key].join("+");
}

const shortcuts = getAllShortcuts();

window.addEventListener("keydown", (e) => {
  // If user is editing a shortcut, ignore
  if (
    document.activeElement &&
    document.activeElement.classList.contains("shortcut-input-editing")
  )
    return;

  const comboStr = getNormalizedCombo(e);
  const shortcuts = getAllShortcuts(); // <-- MOVE THIS HERE
  for (let action in shortcuts) {
    if (shortcuts[action] === comboStr) {
      e.preventDefault();
      e.stopPropagation();
      actions[action] && actions[action]();
      break; // Stop after first match!
    }
  }
});

const openBtn = document.getElementById("open-shortcuts");
const panel = document.getElementById("shortcuts-panel");
const list = document.getElementById("shortcuts-list");
const closeBtn = document.getElementById("close-shortcuts");

openBtn.onclick = function () {
  panel.style.display = "block";

  list.innerHTML = "";

  Object.keys(defaultShortcuts).forEach((action) => {
    const current = getShortcut(action);
    const row = document.createElement("div");
    row.innerHTML = `
      <span>${action}</span>
      <input value="${current}" data-action="${action}" readonly />
      <button class="lcd-button" data-action="${action}">Change</button>
    `;
    list.appendChild(row);
  });
};

closeBtn.onclick = function () {
  panel.style.display = "none";
};

list.onclick = function (e) {
  if (e.target.tagName === "BUTTON") {
    const action = e.target.getAttribute("data-action");
    const input = list.querySelector(`input[data-action="${action}"]`);
    input.value = "Press shortcut...";
    input.classList.add("shortcut-input-editing");

    function onKeyDown(ev) {
      const ignoreKeys = ["Shift", "Control", "Alt", "Meta"];
      if (ignoreKeys.includes(ev.key)) return;

      const comboStr = getNormalizedCombo(ev);

      // Try to set the shortcut
      if (setShortcut(action, comboStr)) {
        input.classList.remove("shortcut-input-editing");
        renderShortcutsPanel(); // Re-render to show new value
        window.removeEventListener("keydown", onKeyDown, true);
      } else {
        // Warn but keep listening!
        input.value = "Press shortcut...";
        // (Warning display is handled by setShortcut/showShortcutWarning)
      }
      ev.preventDefault();
      ev.stopPropagation();
    }

    window.addEventListener("keydown", onKeyDown, true);
  }
};

function renderShortcutsPanel() {
  list.innerHTML = "";
  Object.keys(defaultShortcuts).forEach((action) => {
    const current = getShortcut(action);
    const row = document.createElement("div");
    row.innerHTML = `
      <span>${action}</span>
      <input value="${current}" data-action="${action}" readonly />
      <button class="lcd-button" data-action="${action}">Change</button>
    `;
    list.appendChild(row);
  });
}

const audioGraph = await createAudioGraph();

const synth = createSynth(audioGraph, audioContext, {
  waveFiles,
});
synth.uiLfos = [createUiLfo("lfo1"), createUiLfo("lfo2"), createUiLfo("lfo3")];

setupModulationUI({
  synth,
  audioContext,
  announce,
  announceModeRef,
  baseParamValues,
  isModulatingRef: { value: isModulating },
});

const lfoUI = setupLfoModulationUI({
  synth,
  announce,
  audioContext,
  containerSelector: "#synth-ui",
  lfoSourcesSelector: ".lfo-source",
});
lfoUI.rebindSliderDropTargets();

synth.node.port.postMessage({
  type: "lfo",
  data: { rate: 5.0, depth: 0.3 },
});

synth.node.port.postMessage({
  type: "lfoTarget",
  data: "both",
});

const button = document.getElementById("toggleMusicalTyping");
button.textContent = musicalTypingEnabled
  ? "Disable Musical Typing"
  : "Enable Musical Typing";

button.addEventListener("click", () => {
  musicalTypingEnabled = !musicalTypingEnabled;
  button.textContent = musicalTypingEnabled
    ? "Disable Musical Typing"
    : "Enable Musical Typing";
  localStorage.setItem("musicalTypingEnabled", musicalTypingEnabled);
});

setupKeyboard(
  synth,
  () => keyboardOctave,
  (v) => (keyboardOctave = v),
  () => musicalTypingEnabled
);

setupPresetUI({ synth, announce });

synth.currentLfoRate = 0.01;
synth.currentLfoDepth = 0.0;
synth.node.port.postMessage({ type: "lfo", data: { rate: 0.01, depth: 0.0 } });

window.voiceAPI = setupVoiceControl({
  synth,
  audioContext,
  getSynthParams,
  triggerMIDILearnForControl,
  cancelMIDILearn,
  announce,
  announceModeRef,
});

await loadAllWaves(waveFiles);

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
        attachModRing(target, synth, announce);

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

window.lfoUI = lfoUI;
export function announce(msg) {
  const mode = announceModeRef.value;
  if (mode === "aria") {
    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = msg;
      }, 10);
    }
  } else if (mode === "speech") {
    if ("speechSynthesis" in window) {
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
