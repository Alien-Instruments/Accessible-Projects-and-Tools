import { getFXChainState, setFXChainState } from "./master-fx.js";

const AUDIO_PRESET_COLLECTION_KEY = "PHONETICAL_AUDIO_PRESETS";

export function saveAudioPreset(name, containerId = "synth-ui") {
  const fxChainState = getFXChainState(); // [{className, params}, ...]
  const controls = document.querySelectorAll(
    `#${containerId} input[type="range"], 
     #${containerId} input[type="number"], 
     #${containerId} input[type="checkbox"], 
     #${containerId} select`
  );
  const controlState = {};
  controls.forEach((el) => {
    if (!el.id) return;
    if (el.type === "checkbox") {
      controlState[el.id] = el.checked;
    } else {
      controlState[el.id] = el.value;
    }
  });
  const buttons = document.querySelectorAll(`#${containerId} button[id]`);
  buttons.forEach((btn) => {
    controlState[btn.id] =
      btn.classList.contains("active") ||
      btn.getAttribute("aria-pressed") === "true";
  });
  const preset = {
    controls: controlState,
    fxChain: fxChainState,
  };
  // Save to localStorage
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  presets[name] = preset;
  localStorage.setItem(AUDIO_PRESET_COLLECTION_KEY, JSON.stringify(presets));
  announce(`Saved audio preset: ${name}`);
  renderAudioPresetList();
}

export function loadAudioPreset(name, containerId = "synth-ui") {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  const preset = presets[name];
  if (!preset) {
    announce(`No preset named '${name}'`);
    return;
  }

  // Restore FX chain first (so UI and audio match)
  if (preset.fxChain) setFXChainState(preset.fxChain);

  // Restore controls
  if (preset.controls) {
    Object.entries(preset.controls).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") {
        el.checked = value;
        el.dispatchEvent(new Event("input")); // to update listeners
      } else if (el.tagName === "BUTTON") {
        if (value) el.classList.add("active");
        else el.classList.remove("active");
        el.setAttribute("aria-pressed", value ? "true" : "false");
        el.dispatchEvent(new Event("input"));
      } else {
        el.value = value;
        el.dispatchEvent(new Event("input"));
      }
    });
  }
  announce(`Loaded audio preset: ${name}`);
}

export function deleteAudioPreset(name) {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  delete presets[name];
  localStorage.setItem(AUDIO_PRESET_COLLECTION_KEY, JSON.stringify(presets));
  renderAudioPresetList();
  announce(`Deleted audio preset: ${name}`);
}

export function renderAudioPresetList(containerId = "audio-preset-list") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  container.innerHTML = "<h4>Audio Presets</h4>";

  const list = document.createElement("ul");
  Object.keys(presets).forEach((name) => {
    const li = document.createElement("li");
    const loadBtn = document.createElement("button");
    loadBtn.textContent = "LOAD: " + name;
    loadBtn.className = "remove-btn";
    loadBtn.addEventListener("click", () => loadAudioPreset(name, "synth-ui"));
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "remove-btn";
    delBtn.addEventListener("click", () => deleteAudioPreset(name));
    li.appendChild(loadBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
  container.appendChild(list);
}

export function exportAudioPreset(filename = "audio-presets.json") {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  const blob = new Blob([JSON.stringify(presets, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAudioPreset(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      const presets =
        JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
      if (typeof json === "object" && json !== null) {
        Object.assign(presets, json);
        announce("Imported audio presets.");
        localStorage.setItem(
          AUDIO_PRESET_COLLECTION_KEY,
          JSON.stringify(presets)
        );
        renderAudioPresetList();
      }
    } catch (err) {
      console.error("Import failed:", err);
      announce("Failed to import presets.");
    }
  };
  reader.readAsText(file);
}

function announce(msg) {
  const region = document.getElementById("aria-status");
  if (region) {
    region.textContent = "";
    setTimeout(() => {
      region.textContent = msg;
    }, 10);
  }
}
