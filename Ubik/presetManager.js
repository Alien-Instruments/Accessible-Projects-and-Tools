/*
MIT License

Copyright (c) [2024] [Samuel J Prouse]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

/*
 █████╗ ██╗     ██╗███████╗███╗   ██╗
██╔══██╗██║     ██║██╔════╝████╗  ██║
███████║██║     ██║█████╗  ██╔██╗ ██║
██╔══██║██║     ██║██╔══╝  ██║╚██╗██║
██║  ██║███████╗██║███████╗██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝
 ╦╔╗╔╔═╗╔╦╗╦═╗╦ ╦╔╦╗╔═╗╔╗╔╔╦╗╔═╗
 ║║║║╚═╗ ║ ╠╦╝║ ║║║║║╣ ║║║ ║ ╚═╗
 ╩╝╚╝╚═╝ ╩ ╩╚═╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
*/

document.addEventListener("DOMContentLoaded", function () {
  loadCustomPresets();

  document
    .getElementById("custom-save-preset-button")
    .addEventListener("click", saveCustomPreset);
  document
    .getElementById("custom-load-preset-button")
    .addEventListener("click", loadCustomPreset);
  document
    .getElementById("custom-save-patch-button")
    .addEventListener("click", saveCustomPatch);
  document
    .getElementById("custom-load-patch-button")
    .addEventListener("click", loadCustomPatch);
  document
    .getElementById("toggle-custom-preset-manager-button")
    .addEventListener("click", toggleCustomManagers);

  document
    .getElementById("custom-alert-ok-button")
    .addEventListener("click", closeCustomAlertModal);
});

function toggleCustomManagers() {
  const presetManager = document.getElementById("custom-preset-manager");
  const patchManager = document.getElementById("custom-patch-manager");
  const toggleButton = document.getElementById(
    "toggle-custom-preset-manager-button"
  );

  if (presetManager.style.display === "none" || !presetManager.style.display) {
    presetManager.style.display = "block";
    patchManager.style.display = "block";
    toggleButton.textContent = "Hide Custom Preset Manager";
  } else {
    presetManager.style.display = "none";
    patchManager.style.display = "none";
    toggleButton.textContent = "Show Custom Preset Manager";
  }
}

function saveCustomPreset() {
  const presetName = document.getElementById("custom-preset-name").value.trim();
  if (!presetName) {
    showCustomAlert("Please enter a preset name.");
    return;
  }

  const midiConfiguration = localStorage.getItem("midiConfiguration");
  const midiMappings = localStorage.getItem("midiMappings");
  const presets = JSON.parse(localStorage.getItem("customMidiPresets")) || {};

  presets[presetName] = { midiConfiguration, midiMappings };
  localStorage.setItem("customMidiPresets", JSON.stringify(presets));

  showCustomAlert("Preset saved!");
  populateCustomPresetSelect();
}

function loadCustomPreset() {
  const presetSelect = document.getElementById("custom-preset-select");
  const selectedPreset = presetSelect.value;
  if (!selectedPreset) {
    showCustomAlert("Please select a preset to load.");
    return;
  }

  const presets = JSON.parse(localStorage.getItem("customMidiPresets"));
  const preset = presets[selectedPreset];

  if (preset) {
    localStorage.setItem("midiConfiguration", preset.midiConfiguration);
    localStorage.setItem("midiMappings", preset.midiMappings);
    window.location.reload();
  }
}

function populateCustomPresetSelect() {
  const presetSelect = document.getElementById("custom-preset-select");
  presetSelect.innerHTML =
    '<option value="" disabled selected>Select a preset</option>';

  const presets = JSON.parse(localStorage.getItem("customMidiPresets")) || {};
  for (const presetName in presets) {
    const option = document.createElement("option");
    option.value = presetName;
    option.textContent = presetName;
    presetSelect.appendChild(option);
  }
}

function loadCustomPresets() {
  populateCustomPresetSelect();
}

function saveCustomPatch() {
  const patchName = document.getElementById("custom-patch-name").value.trim();
  if (!patchName) {
    showCustomAlert("Please enter a patch name.");
    return;
  }

  const presetSelect = document.getElementById("custom-preset-select");
  const selectedPreset = presetSelect.value;
  if (!selectedPreset) {
    showCustomAlert("Please select a preset first.");
    return;
  }

  const patches = JSON.parse(localStorage.getItem("customMidiPatches")) || {};
  if (!patches[selectedPreset]) {
    patches[selectedPreset] = {};
  }

  const controls = Array.from(document.querySelectorAll(".slider, button"));
  const patchData = controls.map((control) => ({
    id: control.id,
    value: control.value,
    state: control.dataset.state,
  }));

  patches[selectedPreset][patchName] = patchData;
  localStorage.setItem("customMidiPatches", JSON.stringify(patches));

  showCustomAlert("Patch saved!");
  populateCustomPatchSelect();
}

function loadCustomPatch() {
  const presetSelect = document.getElementById("custom-preset-select");
  const selectedPreset = presetSelect.value;
  if (!selectedPreset) {
    showCustomAlert("Please select a preset first.");
    return;
  }

  const patchSelect = document.getElementById("custom-patch-select");
  const selectedPatch = patchSelect.value;
  if (!selectedPatch) {
    showCustomAlert("Please select a patch to load.");
    return;
  }

  const patches = JSON.parse(localStorage.getItem("customMidiPatches"));
  const patchData = patches[selectedPreset][selectedPatch];

  patchData.forEach((controlData) => {
    const control = document.getElementById(controlData.id);
    if (control) {
      control.value = controlData.value;
      if (control.dataset.state !== undefined) {
        control.dataset.state = controlData.state;
        control.textContent = `${control.id.replace(/-/g, " ")} ${
          controlData.state === "on" ? "On" : "Off"
        }`;
        if (control.dataset.state === "on") {
          control.dispatchEvent(new Event("click"));
        }
      }
      control.dispatchEvent(new Event("input"));
    }
  });

  showCustomAlert("Patch loaded!");
}

function populateCustomPatchSelect() {
  const presetSelect = document.getElementById("custom-preset-select");
  const selectedPreset = presetSelect.value;
  const patchSelect = document.getElementById("custom-patch-select");

  patchSelect.innerHTML =
    '<option value="" disabled selected>Select a patch</option>';

  const patches = JSON.parse(localStorage.getItem("customMidiPatches")) || {};
  if (patches[selectedPreset]) {
    for (const patchName in patches[selectedPreset]) {
      const option = document.createElement("option");
      option.value = patchName;
      option.textContent = patchName;
      patchSelect.appendChild(option);
    }
  }
}

document
  .getElementById("custom-preset-select")
  .addEventListener("change", populateCustomPatchSelect);

function showCustomAlert(message) {
  const modal = document.getElementById("custom-alert-modal");
  const title = document.getElementById("custom-alert-title");
  const text = document.getElementById("custom-alert-text");

  text.textContent = message;
  modal.style.display = "block";

  title.setAttribute("tabindex", "0");
  text.setAttribute("tabindex", "0");
  document
    .getElementById("custom-alert-ok-button")
    .setAttribute("tabindex", "0");

  title.focus();

  trapFocusHandler(modal);
}

function closeCustomAlertModal() {
  const modal = document.getElementById("custom-alert-modal");

  modal.style.display = "none";

  const title = document.getElementById("custom-alert-title");
  const text = document.getElementById("custom-alert-text");
  const okButton = document.getElementById("custom-alert-ok-button");

  title.removeAttribute("tabindex");
  text.removeAttribute("tabindex");
  okButton.removeAttribute("tabindex");

  document.removeEventListener("keydown", trapFocusHandler);
}

function trapFocusHandler(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  document.addEventListener("keydown", function (event) {
    const isTabPressed = event.key === "Tab" || event.keyCode === 9;

    if (!isTabPressed) {
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        event.preventDefault();
      }
    }
  });
}
