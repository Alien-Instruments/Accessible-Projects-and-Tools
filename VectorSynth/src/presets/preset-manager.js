import { getFXChainState, setFXChainState } from "../effects/master-fx.js";

const AUDIO_PRESET_COLLECTION_KEY = "VEXED_AUDIO_PRESETS";

let lastLoadedPresetName = "";

export function saveAudioPreset(name, containerId = "synth-ui") {
  const fxChainState = getFXChainState(); // [{className, params}, ...]
  const controls = document.querySelectorAll(
    `#${containerId} input[type="range"], 
     #${containerId} input[type="number"], 
     #${containerId} input[type="checkbox"],
     #${containerId} input[type="text"], 
     #${containerId} select`
  );
  const controlState = {};

  const preset = {
    controls: controlState,
    fxChain: fxChainState,
  };

  controls.forEach((el) => {
    if (!el.id) return;
    if (el.type === "checkbox") {
      controlState[el.id] = el.checked;
    } else {
      controlState[el.id] = el.value;
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

  const buttons = document.querySelectorAll(`#${containerId} button[id]`);
  buttons.forEach((btn) => {
    controlState[btn.id] =
      btn.classList.contains("active") ||
      btn.getAttribute("aria-pressed") === "true";
  });

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

  // Clear internal LFO target arrays
  if (synth?.uiLfos) {
    synth.uiLfos.forEach((lfo) => (lfo.targets = []));
  }

  // Restore controls
  if (preset.controls) {
    Object.entries(preset.controls).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") {
        el.checked = value;
        el.dispatchEvent(new Event("change", { bubbles: true })); // ✅ better for checkboxes
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

  // Safely restore LFO mods
  if (preset._lfoMods && synth?.uiLfos) {
    synth.uiLfos.forEach((lfo) => (lfo.targets = []));
    if (synth?.uiModEnvs) synth.uiModEnvs.forEach((env) => (env.targets = []));

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
