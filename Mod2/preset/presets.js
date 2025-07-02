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

function getAllPresets() {
  return JSON.parse(localStorage.getItem("app_presets") || "{}");
}

function savePreset(name) {
  if (!name) return showPresetInputModal("Enter a name for your preset");

  const data = {
    sliders: {},
    selects: {},
    colors: {},
    connections: [],
  };

  // Save sliders
  document.querySelectorAll("input[type='range']").forEach((slider) => {
    if (!accessibilityIds.has(slider.id)) {
      data.sliders[slider.id] = slider.value;
    }
  });

  // Save selects
  document.querySelectorAll("select").forEach((select) => {
    if (!accessibilityIds.has(select.id)) {
      data.selects[select.id] = select.value;
    }
  });

  // Save colors
  document.querySelectorAll("input[type='color']").forEach((picker) => {
    if (!accessibilityIds.has(picker.id)) {
      const styleVar = picker.getAttribute("data-var");
      if (styleVar) {
        data.colors[styleVar] = picker.value;
      }
    }
  });

  // Save audio connections
  if (typeof connections !== "undefined") {
    data.connections = connections.map((conn) => ({
      sourceId: conn.sourceId,
      targetId: conn.targetId,
    }));
  }

  const presets = getAllPresets();
  presets[name] = data;
  localStorage.setItem("app_presets", JSON.stringify(presets));

  populatePresetDropdown();
  document.getElementById("presetDropdown").value = name;
  showPresetMessageModal(`Preset "${name}" saved`);
}

function loadPreset(name) {
  const presets = getAllPresets();
  const data = presets[name];
  if (!data) return;

  // Restore selects
  for (const [id, value] of Object.entries(data.selects || {})) {
    const el = document.getElementById(id);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("change"));
    }
  }

  // Restore sliders
  for (const [id, value] of Object.entries(data.sliders || {})) {
    const el = document.getElementById(id);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("input"));
    }
  }

  // Restore colors
  for (const [cssVar, color] of Object.entries(data.colors || {})) {
    document.documentElement.style.setProperty(cssVar, color);
  }

  // Clear existing connections if needed
  if (typeof disconnectNodes === "function") {
    connections.slice().forEach((conn) => {
      const uiEl = document.querySelector(
        `#connectionDisplay button[aria-label*="${conn.sourceId}"]`
      );
      if (uiEl) uiEl.click();
    });
  }

  // Reconnect
  if (typeof connectNodes === "function") {
    data.connections?.forEach(({ sourceId, targetId }) => {
      connectNodes(sourceId, targetId);
      updateConnectionInfo(sourceId, targetId);
    });
  }

  document.getElementById("presetDropdown").value = name;
}

function deletePreset(name) {
  if (!name) return;
  const presets = getAllPresets();
  delete presets[name];
  localStorage.setItem("app_presets", JSON.stringify(presets));
  populatePresetDropdown();
  document.getElementById("presetDropdown").value = "";
}

function populatePresetDropdown() {
  const dropdown = document.getElementById("presetDropdown");
  dropdown.innerHTML = '<option value="">-- Select Preset --</option>';
  const presets = getAllPresets();
  Object.keys(presets).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    dropdown.appendChild(option);
  });
}

// Load selected preset when dropdown changes
document.getElementById("presetDropdown").addEventListener("change", (e) => {
  loadPreset(e.target.value);
});

const saveBtn = document.getElementById("savePresetBtn");
const deleteBtn = document.getElementById("deletePresetBtn");

saveBtn.addEventListener("click", () => {
  showPresetInputModal((name) => {
    savePreset(name);
    showPresetMessageModal(`Preset "${name}" saved!`, saveBtn);
  }, saveBtn);
});

deleteBtn.addEventListener("click", () => {
  const dropdown = document.getElementById("presetDropdown");
  const name = dropdown.value;

  if (!name) return;

  showPresetConfirmModal(
    `Delete preset "${name}"?`,
    (confirmed) => {
      if (confirmed) {
        deletePreset(name);
        showPresetMessageModal(`Preset "${name}" deleted`, deleteBtn);
      }
    },
    deleteBtn
  );
});

// Initialize
document.addEventListener("DOMContentLoaded", populatePresetDropdown);

//Export/Import Presets===============================================

// === Export All Presets ===
document.getElementById("exportPresetBtn").addEventListener("click", () => {
  showPresetInputModal((filename) => {
    if (!filename) return;

    const presets = getAllPresets();
    const blob = new Blob([JSON.stringify(presets, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // sanitize name and append .json if missing
    const safeName = filename.trim().replace(/\s+/g, "_");
    a.download = safeName.endsWith(".json") ? safeName : `${safeName}.json`;

    a.click();
    URL.revokeObjectURL(url);
  }, document.getElementById("exportPresetBtn")); // return focus to export button
});

// === Trigger hidden file input for import ===
document.getElementById("importPresetBtn").addEventListener("click", () => {
  document.getElementById("importPresetInput").click();
});

// === Import All Presets ===
document.getElementById("importPresetInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedPresets = JSON.parse(event.target.result);
      if (typeof importedPresets !== "object")
        throw new Error("Invalid format");

      // Merge with existing presets
      const currentPresets = getAllPresets();
      const merged = { ...currentPresets, ...importedPresets };
      localStorage.setItem("app_presets", JSON.stringify(merged));

      alert("Presets imported successfully!");
      populatePresetDropdown();
    } catch (err) {
      alert("Failed to import presets: " + err.message);
    }
  };
  reader.readAsText(file);
});

//Reset params=========================================================
const resetBtn = document.getElementById("resetPatchBtn");

resetBtn.addEventListener("click", () => {
  showPresetConfirmModal(
    "This will clear all synth settings and connections. Continue?",
    (confirmed) => {
      if (!confirmed) return;

      // Reset sliders
      document.querySelectorAll("input[type='range']").forEach((slider) => {
        if (accessibilityIds.has(slider.id)) return;
        slider.value = slider.defaultValue || 0;
        slider.dispatchEvent(new Event("input"));
      });

      // Reset selects
      document.querySelectorAll("select").forEach((select) => {
        if (accessibilityIds.has(select.id) || select.id === "presetDropdown")
          return;
        select.selectedIndex = 0;
        select.dispatchEvent(new Event("change"));
      });

      // Reset color pickers
      document.querySelectorAll("input[type='color']").forEach((picker) => {
        if (accessibilityIds.has(picker.id)) return;
        const styleVar = picker.getAttribute("data-var");
        if (styleVar) {
          document.documentElement.style.removeProperty(styleVar);
        }
      });

      // Disconnect all connections
      if (typeof disconnectNodes === "function") {
        connections.slice().forEach((conn) => {
          const uiEl = document.querySelector(
            `#connectionDisplay button[aria-label*="${conn.sourceId}"]`
          );
          if (uiEl) uiEl.click();
        });
      }

      // Clear the preset dropdown
      document.getElementById("presetDropdown").value = "";

      // Show confirmation message, return focus to Reset button
      showPresetMessageModal("Patch reset to default.", resetBtn);
    },
    resetBtn // Return focus to Reset button if cancel is chosen
  );
});
