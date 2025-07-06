export const announceModeRef = { value: "aria" };

import { audioContext } from "./utils/context.js";
import { attachModRing } from "./utils/mod-ring.js";
import { createUiLfo } from "./UI/lfo-ui.js";
import { setupMIDI } from "./midi/midi.js";
import { setupKeyboard } from "./utils/keyboard.js";
import { triggerMIDILearnForControl } from "./midi/midi-learn.js";
import { setupVoiceControl } from "./voice-control/voice-commands.js";
import { loadAllWaves } from "./wavetable-loader.js";
import { createAudioGraph } from "./audio-graph.js";
import { createSynth } from "./synth-controller.js";
import { setupModulationUI } from "./modEnv/modulation-ui.js";
import { setupLfoModulationUI } from "./lfo-modulation-ui.js";
import { setupPresetUI } from "./UI/preset-ui.js";
import { waveSources } from "./wave-source.js";
import { createActions } from "./utils/actions.js";
import { getShortcut, setShortcut } from "./utils/shortcutManager.js";
import { defaultShortcuts } from "./utils/defaultShortcuts.js";
import { buildSynthUI } from "./UI/ui.js";
import { getSynthParams } from "./UI/params.js";
import { renderAudioPresetList } from "./presets/preset-manager.js";
import { getAllShortcuts } from "./utils/shortcutManager.js";
import { createUiModEnv, animateModEnvs } from "./modEnv/mod-env-ui.js";
import { setupModEnvModulationUI } from "./UI/mod-env-modulation-ui.js";

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
let lastLoadedPresetName = "";
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
  // Add check for e.key being defined
  const key =
    typeof e.key === "string"
      ? e.key.length === 1
        ? e.key.toLowerCase()
        : e.key
      : "Unknown";
  return [...mods, key].join("+");
}

window.addEventListener("keydown", (e) => {
  // 1. Ignore if user is editing a shortcut input (your UI for changing shortcuts)
  if (
    document.activeElement &&
    document.activeElement.classList.contains("shortcut-input-editing")
  )
    return;

  // 2. Ignore if focus is in a text input, textarea, or contenteditable
  const ae = document.activeElement;
  if (
    ae &&
    ((ae.tagName === "INPUT" &&
      (ae.type === "text" ||
        ae.type === "search" ||
        ae.type === "email" ||
        ae.type === "password")) ||
      ae.tagName === "TEXTAREA" ||
      ae.isContentEditable)
  )
    return;

  // 3. Actually handle the shortcut
  const comboStr = getNormalizedCombo(e);
  const shortcuts = getAllShortcuts(); // Always get up-to-date mapping!
  for (let action in shortcuts) {
    if (shortcuts[action] === comboStr) {
      e.preventDefault();
      e.stopPropagation();
      actions[action] && actions[action]();
      break;
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

synth.uiModEnvs = [createUiModEnv("modEnv1"), createUiModEnv("modEnv2")];
animateModEnvs(synth);

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

function setupKeyboardModSourceDrag(containerSelector = "#synth-ui") {
  // Allow drag with keyboard on both .lfo-source and .mod-env-source
  document
    .querySelectorAll(
      `${containerSelector} .lfo-source, ${containerSelector} .mod-env-source`
    )
    .forEach((el) => {
      el.addEventListener("keydown", (e) => {
        // 'P' for pick up / drag start
        if (e.key.toLowerCase() === "p" && !e.shiftKey) {
          e.preventDefault();
          el.classList.add("dragging-by-keyboard");
          // Store on window/global what is being "dragged"
          window.keyboardDragSource = el;
          // Announce/indicate, or focus next drop target
          announce(
            `${el.textContent.trim()} picked up. Tab to a knob and press P again to drop.`
          );
        } else if (e.key.toLowerCase() === "p" && e.shiftKey) {
          // Remove modulation assignment if focused and Shift+P
          e.preventDefault();
          // This is for removing mod assignment from the currently focused slider
          const slider = document.activeElement
            .closest(".range-knob-wrapper")
            ?.querySelector("input[type=range]");
          if (slider) {
            const paramId = slider.dataset.paramId;
            if (el.classList.contains("lfo-source")) {
              const lfoId = el.dataset.lfoId;
              const lfo = synth.uiLfos.find((l) => l.id === lfoId);
              if (lfo) {
                lfo.targets = lfo.targets.filter((t) => t.id !== paramId);
                slider.classList.remove("modulated");
                slider
                  .closest(".range-knob-wrapper")
                  ?.querySelector(".mod-ring")
                  ?.remove();
                announce(`LFO removed from ${paramId}`);
              }
            } else if (el.classList.contains("mod-env-source")) {
              const envId = el.dataset.modEnvId;
              const env = synth.uiModEnvs.find((e) => e.id === envId);
              if (env) {
                env.targets = env.targets.filter((t) => t.id !== paramId);
                slider.classList.remove("modulated");
                slider
                  .closest(".range-knob-wrapper")
                  ?.querySelector(".mod-ring")
                  ?.remove();
                announce(`Envelope removed from ${paramId}`);
              }
            }
          }
        }
      });
    });

  // Drop via keyboard when slider is focused and "P" is pressed
  document
    .querySelectorAll(`${containerSelector} input[type=range]`)
    .forEach((slider) => {
      slider.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p" && window.keyboardDragSource) {
          e.preventDefault();
          const source = window.keyboardDragSource;
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

          if (source.classList.contains("lfo-source")) {
            const lfoId = source.dataset.lfoId;
            const lfo = synth.uiLfos.find((l) => l.id === lfoId);
            if (lfo && !lfo.targets.some((t) => t.slider === slider)) {
              lfo.targets.push(target);
              attachModRing(target, synth, announce);
              slider.classList.add("modulated");
              announce(`LFO assigned to ${paramId}`);
            }
          } else if (source.classList.contains("mod-env-source")) {
            const envId = source.dataset.modEnvId;
            const env = synth.uiModEnvs.find((e) => e.id === envId);
            if (env && !env.targets.some((t) => t.slider === slider)) {
              env.targets.push(target);
              attachModRing(target, synth, announce);
              slider.classList.add("modulated");
              announce(`Envelope assigned to ${paramId}`);
            }
          }
          // Clean up
          source.classList.remove("dragging-by-keyboard");
          window.keyboardDragSource = null;
        }
      });
    });
}

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
  setupKeyboardModSourceDrag("#synth-ui");

  setupModEnvModulationUI({
    synth,
    announce,
    audioContext,
    containerSelector: "#synth-ui",
    modEnvSourcesSelector: ".mod-env-source",
  });

  document.querySelectorAll(".lfo-source").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.lfoId);
      e.dataTransfer.setData("modType", "lfo");
    });
  });
  document.querySelectorAll(".mod-env-source").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.modEnvId);
      e.dataTransfer.setData("modType", "modEnv");
    });
  });

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

      document.addEventListener("mousedown", function (e) {
        if (e.shiftKey && e.target.classList.contains("mod-ring")) {
          const slider = e.target
            .closest(".range-knob-wrapper")
            ?.querySelector("input[type=range]");
          if (slider) {
            slider.focus(); // Always focus the slider
            // Remove LFO assignments
            let removedAny = false;
            for (const lfo of synth.uiLfos) {
              const before = lfo.targets.length;
              lfo.targets = lfo.targets.filter((t) => t.slider !== slider);
              if (before !== lfo.targets.length) removedAny = true;
            }
            // Remove ModEnv assignments
            for (const env of synth.uiModEnvs) {
              const before = env.targets.length;
              env.targets = env.targets.filter((t) => t.slider !== slider);
              if (before !== env.targets.length) removedAny = true;
            }
            if (removedAny) {
              slider.classList.remove("modulated");
              e.target.remove(); // Remove just this mod ring!
            }
          }
          e.preventDefault();
          e.stopPropagation();
        }
      });

      slider.addEventListener("drop", (e) => {
        e.preventDefault();
        slider.classList.remove("drop-target");
        const modType = e.dataTransfer.getData("modType");
        console.log("[drop] modType:", modType);
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

        if (modType === "lfo") {
          const lfoId = e.dataTransfer.getData("text/plain");
          const lfo = synth.uiLfos.find((l) => l.id === lfoId);
          if (!lfo) return;

          // Prevent duplicate assignments to same slider for this LFO
          if (lfo.targets.some((t) => t.slider === slider)) return;

          lfo.targets.push(target);
          attachModRing(target, synth, announce);

          slider.classList.add("modulated");
          console.log(`✅ ${lfoId} assigned to ${paramId}`);
        } else if (modType === "modEnv") {
          const modEnvId = e.dataTransfer.getData("text/plain");
          const env = synth.uiModEnvs.find((m) => m.id === modEnvId);
          console.log("Env found?", env);
          if (!env) return;

          // Prevent duplicate assignments to same slider for this env
          if (env.targets.some((t) => t.slider === slider)) return;

          env.targets.push(target);
          console.log("[modEnv] Added target for", env.id, target);
          attachModRing(target, synth, announce);

          slider.classList.add("modulated");
          console.log(`✅ ${modEnvId} assigned to ${paramId}`);
        }
      });
    });

  await setupMIDI(synth);
  await initMIDILearn();
  enableMIDILearnMode("synth-ui");
  renderAudioPresetList("audio-preset-list", synth, lastLoadedPresetName);
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
