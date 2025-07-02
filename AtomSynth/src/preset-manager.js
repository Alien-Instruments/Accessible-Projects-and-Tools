import { getAllParticleTypes } from "./physics.js";
import {
  addElectron,
  addProton,
  addNeutron,
  removeAllParticles,
} from "./physics.js";
import { scene } from "./visuals.js";

const AUDIO_PRESET_COLLECTION_KEY = "ATOMSYNTH_AUDIO_PRESETS";

export function saveAudioPreset(name, synth) {
  const containers = ["particleControlPanel", "modPanel"];
  let controls = [];
  containers.forEach((id) => {
    const panel = document.getElementById(id);
    if (panel) {
      controls = controls.concat(
        Array.from(
          panel.querySelectorAll(
            "input[type='range'], input[type='number'], input[type='checkbox'], input[type='color'], select, button"
          )
        )
      );
    }
  });

  const preset = {};
  controls.forEach((el) => {
    if (el.id) {
      if (el.type === "range" || el.type === "number") {
        preset[el.id] = parseFloat(el.value);
      } else if (el.type === "checkbox") {
        preset[el.id] = el.checked;
      } else if (el.type === "color") {
        preset[el.id] = el.value;
      } else if (el.tagName === "SELECT") {
        preset[el.id] = el.value;
      }
    }
  });
  const particles = getAllParticleTypes();
  preset.activeParticles = particles.map((p) => ({
    type: p.type,
    id: p.id,
    position: {
      x: p.body?.position.x,
      y: p.body?.position.y,
      z: p.body?.position.z,
    },
    color: p.mesh?.material?.color?.getHex
      ? p.mesh.material.color.getHex()
      : undefined,
  }));

  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  presets[name] = preset;
  localStorage.setItem(AUDIO_PRESET_COLLECTION_KEY, JSON.stringify(presets));
  announce(`Saved audio preset: ${name}`);
  renderAudioPresetList();
}

export function loadAudioPreset(
  name,
  containerIds = ["particleControlPanel", "modPanel"],
  synth
) {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  const preset = presets[name];
  if (!preset) return;
  announce(`Loaded audio preset: ${name}`);

  // Loop over all UI-related keys, skipping any non-UI keys like "activeParticles"
  Object.entries(preset).forEach(([id, value]) => {
    if (id === "activeParticles") return;

    // Try to find the element in any of the panels
    let el = null;
    for (const panelId of containerIds) {
      const panel = document.getElementById(panelId);
      if (panel) {
        el = panel.querySelector(`#${CSS.escape(id)}`);
        if (el) break;
      }
    }
    if (!el) el = document.getElementById(id);
    if (!el) return;

    if (el.type === "range" || el.type === "number") {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (el.type === "checkbox") {
      el.checked = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (el.type === "color") {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (el.tagName === "SELECT") {
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (el.tagName === "BUTTON") {
      if (value) {
        el.classList.add("active");
        el.setAttribute("aria-pressed", "true");
      } else {
        el.classList.remove("active");
        el.setAttribute("aria-pressed", "false");
      }
      el.dispatchEvent(new Event("click", { bubbles: true }));
    }
  });

  // --- Restore all particles ---
  if (preset.activeParticles) {
    // Clear all particles from the scene/world/arrays
    removeAllParticles(scene);

    preset.activeParticles.forEach((p) => {
      let newParticle;
      if (p.type === "electron") {
        newParticle = addElectron(scene, p.position, p.color);
      } else if (p.type === "proton") {
        newParticle = addProton(scene, p.position, p.color);
      } else if (p.type === "neutron") {
        newParticle = addNeutron(scene, p.position, p.color);
      }
    });
  }
}

export function deleteAudioPreset(name) {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  delete presets[name];
  localStorage.setItem(AUDIO_PRESET_COLLECTION_KEY, JSON.stringify(presets));
  renderAudioPresetList();
  announce(`Deleted audio preset: ${name}`);
}

export function renderAudioPresetList(
  containerId = "audio-preset-list",
  synth
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  container.innerHTML = "<h4>Audio Presets</h4>";

  const list = document.createElement("ul");
  Object.keys(presets).forEach((name) => {
    const li = document.createElement("li");

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load " + name;
    loadBtn.className = "remove-btn";
    loadBtn.addEventListener("click", () =>
      loadAudioPreset(name, "particleControlPanel", synth)
    );

    const delBtn = document.createElement("button");
    delBtn.textContent = "REMOVE";
    delBtn.className = "remove-btn";
    delBtn.addEventListener("click", () => deleteAudioPreset(name));

    li.appendChild(loadBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  container.appendChild(list);
}

export function exportAudioPreset(filename = "audio-preset.json") {
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

export function importAudioPreset(file, name = "Imported", synth) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      const presets =
        JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};

      if (
        typeof json === "object" &&
        json !== null &&
        Object.values(json).every((v) => typeof v === "object")
      ) {
        // It's a full collection of presets
        Object.assign(presets, json);
        announce(`Imported multiple presets`);
      } else {
        // It's a single preset
        presets[name] = json;
        announce(`Imported audio preset as: ${name}`);
      }

      localStorage.setItem(
        AUDIO_PRESET_COLLECTION_KEY,
        JSON.stringify(presets)
      );
      renderAudioPresetList("audio-preset-list", synth);
    } catch (err) {
      console.error("Failed to import audio preset:", err);
      announce("Failed to import audio preset");
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
