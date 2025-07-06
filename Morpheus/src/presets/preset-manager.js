import { attachModRing } from "../utils/mod-ring.js";

const AUDIO_PRESET_COLLECTION_KEY = "MORPHEUS_AUDIO_PRESETS";

let lastLoadedPresetName = "";

export function saveAudioPreset(name, containerId = "synth-ui", synth) {
  const controls = document.querySelectorAll(
    `#${containerId} input[type="range"],
     #${containerId} input[type="number"],
     #${containerId} input[type="checkbox"],
     #${containerId} select,
     #${containerId} button`
  );

  const preset = {};

  controls.forEach((el) => {
    if (el.id) {
      if (el.type === "range" || el.type === "number") {
        preset[el.id] = parseFloat(el.value);
      } else if (el.type === "checkbox") {
        preset[el.id] = el.checked;
      } else if (el.tagName === "SELECT") {
        preset[el.id] = el.value;
      } else if (el.tagName === "BUTTON") {
        preset[el.id] = el.getAttribute("aria-pressed") === "true";
      }
    }
    // Save LFO mod targets
    preset._lfoMods = synth.uiLfos.map((lfo) => ({
      id: lfo.id,
      targets: lfo.targets.map((t) => ({
        id: t.id,
        depth: t.depth,
      })),
    }));
    preset._modEnvMods =
      synth.uiModEnvs?.map((env) => ({
        id: env.id,
        targets: env.targets.map((t) => ({
          id: t.id,
          depth: t.depth,
        })),
      })) || [];
  });

  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  presets[name] = preset;
  localStorage.setItem(AUDIO_PRESET_COLLECTION_KEY, JSON.stringify(presets));
  announce(`Saved audio preset: ${name}`);
  renderAudioPresetList();
}

export function loadAudioPreset(name, containerId = "synth-ui", synth) {
  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  const preset = presets[name];
  if (!preset) return;

  // Clear previous mod rings and modulated sliders
  document
    .querySelectorAll(`#${containerId} .mod-ring`)
    .forEach((ring) => ring.remove());

  document
    .querySelectorAll(`#${containerId} input.modulated`)
    .forEach((slider) => slider.classList.remove("modulated"));

  // Clear internal LFO target arrays
  if (synth?.uiLfos) {
    synth.uiLfos.forEach((lfo) => (lfo.targets = []));
  }

  Object.entries(preset).forEach(([id, value]) => {
    if (id === "_lfoMods") return;
    const el = document.getElementById(id);
    if (el) {
      if (el.type === "checkbox") {
        el.checked = value;
      } else if (el.tagName === "BUTTON") {
        const current = el.getAttribute("aria-pressed") === "true";
        if (current !== value) {
          el.click();
        }
      } else {
        el.value = value;
      }
      el.dispatchEvent(new Event("input"));
    }
  });

  // Safely restore LFO mods
  if (preset._lfoMods && synth?.uiLfos) {
    synth.uiLfos.forEach((lfo) => (lfo.targets = []));

    preset._lfoMods.forEach((mod) => {
      const lfo = synth.uiLfos.find((l) => l.id === mod.id);
      if (!lfo) return;

      mod.targets.forEach((targetData) => {
        const slider = document.querySelector(
          `#${containerId} [data-param-id="${targetData.id}"]`
        );
        if (slider) {
          const min = parseFloat(slider.min);
          const max = parseFloat(slider.max);
          const range = max - min;
          const originalVal = parseFloat(slider.value);

          const target = {
            id: targetData.id,
            slider,
            originalVal,
            range,
            depth: targetData.depth,
          };

          lfo.targets.push(target);
          slider.classList.add("modulated");
          attachModRing(target);
        }
      });
    });
  }
  if (preset._modEnvMods && synth?.uiModEnvs) {
    synth.uiModEnvs.forEach((env) => (env.targets = []));

    preset._modEnvMods.forEach((mod) => {
      const env = synth.uiModEnvs.find((e) => e.id === mod.id);
      if (!env) return;

      mod.targets.forEach((targetData) => {
        const slider = document.querySelector(
          `#${containerId} [data-param-id="${targetData.id}"]`
        );
        if (slider) {
          const min = parseFloat(slider.min);
          const max = parseFloat(slider.max);
          const range = max - min;
          const originalVal = parseFloat(slider.value);

          const target = {
            id: targetData.id,
            slider,
            originalVal,
            range,
            depth: targetData.depth,
          };

          env.targets.push(target);
          slider.classList.add("modulated");
          attachModRing(target);
        }
      });
    });
  }
  //attachModRing(target);
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

export function renderAudioPresetList(
  containerId = "audio-preset-list",
  synth,
  selectedName = ""
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const presets =
    JSON.parse(localStorage.getItem(AUDIO_PRESET_COLLECTION_KEY)) || {};
  container.innerHTML = "<h4>Audio Presets</h4>";

  // Build select
  const select = document.createElement("select");
  select.id = "audio-preset-select";
  select.className = "lcd-select";
  select.setAttribute("aria-label", "Select audio preset");
  select.style.minWidth = "160px";
  select.style.marginRight = "1em";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Select Preset --";
  select.appendChild(defaultOption);

  Object.keys(presets).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  // Set the value to the current/last selected name if available
  if (selectedName && presets[selectedName]) {
    select.value = selectedName;
  } else {
    select.value = "";
  }

  // Build delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "lcd-button";
  delBtn.setAttribute("aria-label", "Delete selected preset");
  delBtn.disabled = !select.value; // Disable if no preset selected

  // Load on select
  select.addEventListener("change", () => {
    if (select.value) {
      lastLoadedPresetName = select.value; // Track selection!
      loadAudioPreset(select.value, "synth-ui", synth);
      renderAudioPresetList(containerId, synth, lastLoadedPresetName); // <-- Re-render, keep selection
      delBtn.disabled = false;
    } else {
      delBtn.disabled = true;
      lastLoadedPresetName = "";
      renderAudioPresetList(containerId, synth, ""); // Show nothing selected
    }
  });

  // Delete selected
  delBtn.addEventListener("click", () => {
    if (select.value) {
      const modal = document.getElementById("audio-delete-modal");
      const nameSpan = document.getElementById(
        "audio-delete-modal-preset-name"
      );
      nameSpan.textContent = `Preset "${select.value}" will be permanently deleted. This cannot be undone.`;
      modal.classList.remove("hidden");
      modal.dataset.presetToDelete = select.value;
    }
  });

  container.appendChild(select);
  container.appendChild(delBtn);
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
