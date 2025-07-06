import { registerMIDIHandler } from "./midi.js";

let ccMapping = {};
window.learning = false;
window.currentTarget = null;

const ACTIVE_PRESET_KEY = "morpheus_midiCCMappings";
const PRESET_COLLECTION_KEY = "MORPHEUS_MIDI_CC_PRESETS";

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
      currentTarget.closest(".slider-div")?.classList.remove("learning");

      const label =
        currentTarget.getAttribute("aria-label") || currentTarget.id;
      announce(`Assigned CC ${cc} to ${label}`);

      window.learning = false;
      window.currentTarget = null;
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
        // Snap to the slider's step (if any), and use toFixed for display
        let announcedValue = scaled;
        if (el.step && el.step !== "any") {
          const step = parseFloat(el.step);
          if (step && step > 0) {
            announcedValue = Math.round((scaled - min) / step) * step + min;
          }
        }
        announce(`${ccMapping[cc].label} set to ${announcedValue.toFixed(2)}`);
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

export function triggerMIDILearnForControl(paramId) {
  // Directly activates learning for a specific element
  const el = document.getElementById(paramId);
  if (!el) {
    announce("Could not find control for MIDI learn");
    return;
  }
  if (learning && currentTarget) {
    currentTarget.closest(".slider-div")?.classList.remove("learning");
  }
  learning = true;
  currentTarget = el;
  el.closest(".slider-div")?.classList.add("learning");
  el.focus();
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  console.log("🎛 Waiting for CC input to assign...");
}

// Right click context menu support
export function enableMIDILearnMode(containerId = "synth-ui") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const controls = container.querySelectorAll("input, select");
  controls.forEach((el) => {
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      triggerMIDILearnForControl(el.id);
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
    btn.textContent = "REMOVE";
    btn.title = "Remove Mapping";
    btn.className = "remove-btn";
    btn.setAttribute("aria-label", `Remove mapping for ${label}`);
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
  renderPresetList("midi-preset-list", name);
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

export function renderPresetList(
  containerId = "midi-preset-list",
  selectedName = ""
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const presets = JSON.parse(localStorage.getItem(PRESET_COLLECTION_KEY)) || {};

  container.innerHTML = "<h4>Saved Mapping</h4>";

  // Build the select dropdown
  const select = document.createElement("select");
  select.id = "midi-preset-select";
  select.className = "lcd-select";
  select.setAttribute("aria-label", "Select MIDI CC mapping preset");
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

  // Set the select value if a selected name is provided and exists
  if (selectedName && presets[selectedName]) {
    select.value = selectedName;
  } else {
    select.value = "";
  }

  // Remove button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "lcd-button";
  delBtn.setAttribute("aria-label", "Delete selected MIDI preset");
  delBtn.disabled = !select.value;

  // When a preset is selected, load it and enable delete
  select.addEventListener("change", () => {
    if (select.value) {
      loadPreset(select.value);
      renderPresetList(containerId, select.value);
      delBtn.disabled = false;
    } else {
      delBtn.disabled = true;
      renderPresetList(containerId, "");
    }
  });

  // Delete selected preset
  delBtn.addEventListener("click", () => {
    if (select.value) {
      const modal = document.getElementById("midi-delete-modal");
      const nameSpan = document.getElementById("midi-delete-modal-preset-name");
      nameSpan.textContent = `Preset "${select.value}" will be permanently deleted. This cannot be undone.`;
      modal.classList.remove("hidden");
      modal.dataset.presetToDelete = select.value;
    }
  });

  container.appendChild(select);
  container.appendChild(delBtn);
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

export function cancelMIDILearn() {
  console.log("Cancel MIDI learn called", learning, currentTarget);
  if (learning && currentTarget) {
    currentTarget.closest(".slider-div")?.classList.remove("learning");
    learning = false;
    currentTarget = null;
  }
}

window.addEventListener("keydown", (e) => {
  // if (e.key === "Escape" && learning && currentTarget) {
  //   currentTarget.closest(".slider-div")?.classList.remove("learning");
  //   announce("Cancelled MIDI Learn");
  //   learning = false;
  //   currentTarget = null;
  // }
  // // Press "M" to enter MIDI Learn mode for focused element
  // if (e.key === "m" || e.key === "M") {
  //   const el = document.activeElement;
  //   if (!el || !["INPUT", "SELECT"].includes(el.tagName)) return;
  //   if (learning && currentTarget) {
  //     currentTarget.closest(".slider-div")?.classList.remove("learning");
  //   }
  //   learning = true;
  //   currentTarget = el;
  //   el.closest(".slider-div")?.classList.add("learning");
  //   console.log("🎛 Waiting for CC input to assign...");
  //   announce("MIDI Learn activated for focused control");
  //   e.preventDefault();
  // }
});

export function clearAllMappings() {
  ccMapping = {};
  localStorage.removeItem("midiCCMappings");
  renderMappingList();
  announce("All MIDI mappings cleared");
}
