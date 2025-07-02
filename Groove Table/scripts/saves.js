let currentPresetKey = null;

function populatePresetSelect(selectedKey = currentPresetKey) {
  const select = document.getElementById("presetSelect");
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.disabled = true;
  placeholder.textContent = "Select a preset";
  select.appendChild(placeholder);

  for (const name in factoryPresets2 || {}) {
    const opt = document.createElement("option");
    opt.value = "factory:" + name;
    opt.textContent = name;
    select.appendChild(opt);
  }

  for (const key in localStorage) {
    if (key.startsWith("preset_")) {
      const name = key.replace("preset_", "");
      const opt = document.createElement("option");
      opt.value = "local:" + name;
      opt.textContent = `${name}`;
      select.appendChild(opt);
    }
  }

  if (
    selectedKey &&
    Array.from(select.options).some((o) => o.value === selectedKey)
  ) {
    select.value = selectedKey;
  } else {
    select.selectedIndex = 0;
  }
}

function handlePresetSelect(value) {
  const [type, name] = value.split(":");
  currentPresetKey = value;

  if (type === "factory") {
    setPreset(factoryPresets2[name]);
  } else if (type === "local") {
    loadPresetFromLocal(name);
  }

  populatePresetSelect(currentPresetKey);
}

// Save with user prompt
function saveCurrentAsLocalPreset() {
  showPresetInputModal((name) => {
    if (name) {
      savePresetToLocal(name);
      currentPresetKey = "local:" + name;
      populatePresetSelect();
      document.getElementById("presetSelect").value = currentPresetKey;
    }
  });
}

// Existing helpers
function getPreset() {
  const preset = {};
  const accessibilityIds = new Set([
    // Font settings
    "font-size-select",
    "bold-select",
    "font-family-select",
    "font-style-select",
    "font-variant-select",

    // Spacing sliders
    "access_letter-spacing-slider",
    "access_word-spacing-slider",
    "access_line-spacing-slider",
    "access_border-radius-slider",
    "access_border-thickness-slider",
    "access_focus-size-slider",

    // Accessibility color pickers
    "color-picker",
    "color-picker-2",
    "color-picker-3",
    "color-picker-4",
    "color-picker-5",
    "border-picker",
    "focus-color-picker",
    "button-border-picker",
    "button-font-picker",
    "group-background-picker",
    "select-background-picker",
    "select-border-picker",
    "select-font-picker",
    "black-keys-colour-picker",
    "white-keys-colour-picker",
    "key-font-colour-picker",
    "panel-background-picker",
    "panel-border-picker",
    "panel-gradient-picker",
    "label-background-picker",
    "label-border-picker",
    "label-font-picker",
    "output-background-picker",
    "output-border-picker",
    "output-font-picker",
    "slider-outline-picker",
    "LineThickness",

    // Checkbox and design selector
    "toggle-gradients",
    "knob-design-select",
  ]);

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    if (!el.id || accessibilityIds.has(el.id)) return;

    if (el.type === "checkbox") {
      preset[el.id] = el.checked;
    } else if (el.type === "radio") {
      if (el.checked) {
        preset[el.name] = el.value;
      }
    } else if (el.tagName === "SELECT" && el.multiple) {
      preset[el.id] = Array.from(el.selectedOptions).map((opt) => opt.value);
    } else {
      preset[el.id] = el.value;
    }
  });

  return preset;
}

function setPreset(preset) {
  for (const [key, value] of Object.entries(preset)) {
    const el = document.getElementById(key);

    if (!el) {
      const radios = document.querySelectorAll(
        `input[type="radio"][name="${key}"]`
      );
      if (radios.length > 0) {
        radios.forEach((radio) => {
          radio.checked = radio.value === String(value);
          if (radio.checked) {
            radio.dispatchEvent(new Event("input"));
          }
        });
      }
      continue;
    }

    if (el.type === "checkbox") {
      el.checked = Boolean(value);
    } else if (el.tagName === "SELECT" && el.multiple && Array.isArray(value)) {
      Array.from(el.options).forEach((option) => {
        option.selected = value.includes(option.value);
      });
    } else {
      const strVal = String(value);

      if (el.tagName === "SELECT") {
        const hasOption = Array.from(el.options).some(
          (opt) => opt.value === strVal
        );
        if (hasOption) {
          el.value = strVal;
        } else {
          console.warn(
            `setPreset: Value "${strVal}" not found in <select id="${key}">`
          );
        }
      } else {
        el.value = strVal;
      }
    }

    if (el.id !== "presetSelect") {
      ["input", "change"].forEach((type) => {
        el.dispatchEvent(new Event(type, { bubbles: true }));
      });
    }
  }
}

function deleteCurrentPreset() {
  if (!currentPresetKey || !currentPresetKey.startsWith("local:")) {
    showPresetMessageModal("Select a user preset to delete.");
    return;
  }

  const name = currentPresetKey.split(":")[1];
  showPresetConfirmModal(`Delete the preset "${name}"?`, (confirmed) => {
    if (confirmed) {
      localStorage.removeItem("preset_" + name);
      currentPresetKey = null;
      populatePresetSelect();
      document.getElementById("presetSelect").selectedIndex = 0;
    }
  });
}

function savePresetToLocal(name) {
  const preset = getPreset();
  localStorage.setItem("preset_" + name, JSON.stringify(preset));
}

function loadPresetFromLocal(name) {
  const data = localStorage.getItem("preset_" + name);
  if (data) {
    setPreset(JSON.parse(data));
  }
}

function exportPreset(filename = "presets") {
  const allPresets = {};

  for (const key in localStorage) {
    if (key.startsWith("preset_")) {
      const name = key.replace("preset_", "");
      try {
        allPresets[name] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        console.warn(`Skipping invalid preset: ${name}`);
      }
    }
  }

  const blob = new Blob([JSON.stringify(allPresets, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  a.click();
  URL.revokeObjectURL(url);
}

function exportPresetWithModal() {
  showPresetInputModal((name) => {
    if (!name) return;

    // Clean up the filename (e.g., remove spaces or special characters)
    let filename = name.trim().replace(/[^a-z0-9_\-]/gi, "_");

    // Ensure .json extension
    if (!filename.endsWith(".json")) {
      filename += ".json";
    }

    exportPreset(filename);
  });
}

function importPreset(file) {
  const reader = new FileReader();

  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (err) {
      showPresetMessageModal("Invalid JSON file.");
      return;
    }

    const keys = Object.keys(data);
    let index = 0;
    let imported = 0,
      skipped = 0;

    function next() {
      if (index >= keys.length) {
        populatePresetSelect();
        showPresetMessageModal(
          `Import complete.\nImported: ${imported}\nSkipped: ${skipped}`
        );
        return;
      }

      const name = keys[index++];
      const key = "preset_" + name;

      if (localStorage.getItem(key)) {
        showPresetConfirmModal(
          `Preset "${name}" already exists. Overwrite it?`,
          (confirmed) => {
            if (confirmed) {
              localStorage.setItem(key, JSON.stringify(data[name]));
              imported++;
            } else {
              skipped++;
            }
            next();
          }
        );
      } else {
        localStorage.setItem(key, JSON.stringify(data[name]));
        imported++;
        next();
      }
    }

    next();
  };

  reader.readAsText(file);
}

window.addEventListener("DOMContentLoaded", populatePresetSelect);

let factoryPresets2 = {};

async function loadFactoryPresets() {
  try {
    const response = await fetch("../factory-presets/factory.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    factoryPresets2 = await response.json();
    populatePresetSelect();
  } catch (err) {
    console.error("Failed to load factory presets:", err);
    showPresetMessageModal("Could not load factory presets.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadFactoryPresets();
});

function togglePresetPanel() {
  const modal = document.getElementById("presetModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

window.onclick = function (event) {
  const modal = document.getElementById("presetModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

function trapModalFocus(modal, focusables) {
  document.addEventListener(
    "keydown",
    function trap(e) {
      if (e.key === "Tab") {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      if (e.key === "Escape") {
        if (typeof modal.dataset.onEscape === "function") {
          modal.dataset.onEscape();
        }
      }
    },
    { once: true }
  );
}

function showPresetMessageModal(message, returnFocusEl = null) {
  const modal = document.getElementById("preset-message-modal");
  const modalMessage = document.getElementById("message-text");
  const modalOkBtn = document.getElementById("message-ok-btn");

  modalMessage.textContent = message;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");

  setTimeout(() => modalMessage.focus(), 0);

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    if (returnFocusEl) returnFocusEl.focus();
  }

  modal.dataset.onEscape = closeModal;
  trapModalFocus(modal, [modalMessage, modalOkBtn]);

  modalOkBtn.addEventListener("click", closeModal, { once: true });
}

function showPresetConfirmModal(message, onConfirm, returnFocusEl = null) {
  const modal = document.getElementById("confirm-modal");
  const messageEl = document.getElementById("confirm-modal-message");
  const yesBtn = document.getElementById("confirm-yes-btn");
  const noBtn = document.getElementById("confirm-no-btn");

  messageEl.textContent = message;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");

  setTimeout(() => messageEl.focus(), 0);

  function cleanup(result) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    if (returnFocusEl) returnFocusEl.focus();
    onConfirm(result);
  }

  modal.dataset.onEscape = () => cleanup(false);
  trapModalFocus(modal, [messageEl, yesBtn, noBtn]);

  yesBtn.addEventListener("click", () => cleanup(true), { once: true });
  noBtn.addEventListener("click", () => cleanup(false), { once: true });
}

function showPresetInputModal(callback, returnFocusEl = null) {
  const modal = document.getElementById("preset-input-modal");
  const input = document.getElementById("preset-name-input");
  const saveBtn = document.getElementById("preset-save-btn");
  const cancelBtn = document.getElementById("preset-cancel-btn");

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  input.value = "";

  setTimeout(() => input.focus(), 0);

  function cleanup(submit = false) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    if (returnFocusEl) returnFocusEl.focus();
    if (!submit) callback(null);
  }

  function onSave() {
    const name = input.value.trim();
    if (name) {
      try {
        callback(name);
      } catch (err) {
        console.error("Error in save callback:", err);
      }
      cleanup(true);
    } else {
      input.focus();
    }
  }

  function onCancel() {
    cleanup(false);
  }

  modal.dataset.onEscape = onCancel;
  trapModalFocus(modal, [input, saveBtn, cancelBtn]);

  saveBtn.onclick = onSave;
  cancelBtn.onclick = onCancel;

  input.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") onSave();
      if (e.key === "Escape") onCancel();
    },
    { once: true }
  );
}
