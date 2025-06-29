import { registerMIDIHandler } from "./midi.js";

let ccMapping = {};
let learning = false;
let currentTarget = null;

const ACTIVE_PRESET_KEY = "phonetical_midiCCMappings";
const PRESET_COLLECTION_KEY = "PHONETICAL_MIDI_CC_PRESETS";

// --- MIDI SETUP ---
export async function initMIDILearn(
  mappingListContainerId = "midi-mapping-list"
) {
  loadActiveMapping();
  renderMappingList(mappingListContainerId);
  renderPresetList("midi-preset-list");
  registerMIDIHandler(handleMIDIMessage);
}

function handleMIDIMessage(event) {
  const [status, data1, data2] = event.data;
  const isCC = (status & 0xf0) === 0xb0;
  const cc = data1;
  const value = data2 / 127;

  if (isCC) {
    if (learning && currentTarget) {
      assignCC(cc, currentTarget);
      currentTarget.dataset.cc = cc;
      currentTarget.closest(".slider-container")?.classList.remove("learning");

      const label =
        currentTarget.getAttribute("aria-label") || currentTarget.id;
      announce(`Assigned CC ${cc} to ${label}`);

      learning = false;
      currentTarget = null;
      saveActiveMapping();
      renderMappingList();
    } else if (ccMapping[cc]) {
      const el = document.getElementById(ccMapping[cc].id);
      if (!el) return;

      if (el.type === "range") {
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        const scaled = min + (max - min) * value;
        el.value = scaled;
        el.dispatchEvent(new Event("input"));
        announce(`${ccMapping[cc].label} set to ${scaled.toFixed(2)}`);
      } else if (el.tagName === "SELECT") {
        const index = Math.floor(value * (el.options.length - 1));
        el.selectedIndex = index;
        el.dispatchEvent(new Event("input"));
        announce(
          `${ccMapping[cc].label} set to ${el.options[el.selectedIndex].text}`
        );
      }
    }
  }
}

function assignCC(cc, element) {
  ccMapping[cc] = {
    id: element.id,
    label: element.getAttribute("aria-label") || element.id,
  };
}

// --- MAPPING CONTROLS ---
export function enableMIDILearnMode(containerId = "synth-ui") {
  const container =
    document.querySelector(`.${containerId}`) ||
    document.getElementById(containerId);

  if (!container) return;

  const controls = container.querySelectorAll("input, select");
  controls.forEach((el) => {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (learning && currentTarget) {
        currentTarget
          .closest(".slider-container")
          ?.classList.remove("learning");
      }
      learning = true;
      currentTarget = el;
      el.closest(".slider-container")?.classList.add("learning");
      console.log("🎛 Waiting for CC input to assign...");
    });
  });
}

function saveActiveMapping() {
  localStorage.setItem(ACTIVE_PRESET_KEY, JSON.stringify(ccMapping));
}

function loadActiveMapping() {
  const saved = localStorage.getItem(ACTIVE_PRESET_KEY);
  if (saved) {
    ccMapping = JSON.parse(saved);
  }
}

export function removeMapping(cc) {
  delete ccMapping[cc];
  saveActiveMapping();
  renderMappingList();
  announce(`Removed mapping for CC ${cc}`);
}

export function renderMappingList(containerId = "midi-mapping-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const title = document.createElement("h4");
  title.textContent = "MIDI CC Mappings";
  container.appendChild(title);

  if (Object.keys(ccMapping).length === 0) {
    container.innerHTML += "<em>No mappings</em>";
    return;
  }

  const list = document.createElement("ul");
  Object.entries(ccMapping).forEach(([cc, { id, label }]) => {
    const li = document.createElement("li");
    li.textContent = `CC ${cc} → ${label}`;

    const btn = document.createElement("button");
    btn.title = "Remove Mapping";
    btn.className = "remove-btn";
    btn.addEventListener("click", () => removeMapping(cc));

    li.appendChild(btn);
    list.appendChild(li);
  });

  container.appendChild(list);
}

// --- NAMED PRESET STORAGE ---
export function savePreset(name) {
  const presets = JSON.parse(localStorage.getItem(PRESET_COLLECTION_KEY)) || {};
  presets[name] = ccMapping;
  localStorage.setItem(PRESET_COLLECTION_KEY, JSON.stringify(presets));
  announce(`Saved preset: ${name}`);
  renderPresetList();
}

export function loadPreset(name) {
  const presets = JSON.parse(localStorage.getItem(PRESET_COLLECTION_KEY)) || {};
  ccMapping = presets[name] || {};
  saveActiveMapping();
  renderMappingList();
  announce(`Loaded preset: ${name}`);
}

export function deletePreset(name) {
  const presets = JSON.parse(localStorage.getItem(PRESET_COLLECTION_KEY)) || {};
  delete presets[name];
  localStorage.setItem(PRESET_COLLECTION_KEY, JSON.stringify(presets));
  renderPresetList();
  announce(`Deleted preset: ${name}`);
}

export function renderPresetList(containerId = "midi-preset-list") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const presets = JSON.parse(localStorage.getItem(PRESET_COLLECTION_KEY)) || {};

  const title = document.createElement("h4");
  title.textContent = "Saved Mapping";
  container.appendChild(title);

  const list = document.createElement("ul");

  Object.entries(presets).forEach(([name]) => {
    const li = document.createElement("li");

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load " + name;
    loadBtn.className = "remove-btn";
    loadBtn.addEventListener("click", () => loadPreset(name));

    const delBtn = document.createElement("button");
    delBtn.textContent = "REMOVE " + name;
    delBtn.title = "Delete Preset";
    delBtn.className = "remove-btn";
    delBtn.addEventListener("click", () => deletePreset(name));

    li.appendChild(loadBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  container.appendChild(list);
}

// --- FILE I/O ---
export function exportMappings(filename = "midi-cc-mappings.json") {
  const blob = new Blob([JSON.stringify(ccMapping, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function importMappings(file, name = "Imported", callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (typeof json === "object" && json !== null) {
        ccMapping = json;
        saveActiveMapping();
        savePreset(name);
        renderMappingList();
        announce(`Imported mappings as preset: ${name}`);
        callback?.(true);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.error("❌ Failed to import mappings:", err);
      announce("Failed to import MIDI mappings");
      callback?.(false);
    }
  };
  reader.readAsText(file);
}

// --- Accessibility Announcer ---
function announce(msg) {
  const region = document.getElementById("aria-status");
  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = msg;
    }, 10);
  }
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && learning && currentTarget) {
    currentTarget.closest(".slider-container")?.classList.remove("learning");
    announce("Cancelled MIDI Learn");
    learning = false;
    currentTarget = null;
  }

  // Check for 'm' or 'M' only when not editing text
  if (e.key === "m" || e.key === "M") {
    const el = document.activeElement;
    if (
      !el ||
      (el.tagName === "INPUT" &&
        // Exclude text-editing input types
        [
          "text",
          "password",
          "email",
          "search",
          "tel",
          "url",
          "number",
        ].includes(el.type)) ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    ) {
      return; // Don't activate MIDI Learn in text-editable fields
    }

    if (learning && currentTarget) {
      currentTarget.closest(".slider-container")?.classList.remove("learning");
    }

    learning = true;
    currentTarget = el;
    el.closest(".slider-container")?.classList.add("learning");
    console.log("🎛 Waiting for CC input to assign...");
    announce("MIDI Learn activated for focused control");
    e.preventDefault();
  }
});

export function clearAllMappings() {
  ccMapping = {};
  localStorage.removeItem("midiCCMappings");
  renderMappingList();
  announce("All MIDI mappings cleared");
}

// At the end of your file:
export function activateMIDILearnFor(el) {
  if (learning && currentTarget) {
    currentTarget.closest(".slider-container")?.classList.remove("learning");
  }
  learning = true;
  currentTarget = el;
  el.closest(".slider-container")?.classList.add("learning");
  announce("MIDI Learn activated for this control");
  console.log("🎛 Waiting for CC input to assign...");
}
