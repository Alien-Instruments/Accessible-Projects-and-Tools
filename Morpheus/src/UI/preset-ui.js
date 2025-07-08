import {
  saveAudioPreset,
  exportAudioPreset,
  importAudioPreset,
  deleteAudioPreset,
  renderAudioPresetList,
} from "../presets/preset-manager.js";

import {
  exportMappings,
  importMappings,
  savePreset,
  clearAllMappings,
  deletePreset,
  renderPresetList,
} from "../midi/midi-learn.js";

export function setupPresetUI({ synth, announce }) {
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("hidden");
    // Find the first focusable element and focus it
    const focusable = modal.querySelector(
      'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      setTimeout(() => focusable.focus(), 10); // Delay to ensure visibility
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const openModal = document.querySelector(".modal:not(.hidden)");
      if (!openModal) return;
      const focusableElements = openModal.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal")
        .forEach((modal) => modal.classList.add("hidden"));
    }
  });

  document
    .getElementById("clear-mappings-btn")
    ?.addEventListener("click", () => {
      openModal("clear-modal");
    });

  document
    .getElementById("audio-delete-confirm-btn")
    .addEventListener("click", () => {
      const modal = document.getElementById("audio-delete-modal");
      const name = modal.dataset.presetToDelete;
      if (name) {
        deleteAudioPreset(name);
        // After delete, re-render the preset list and clear selection
        renderAudioPresetList("audio-preset-list", synth, "");
        // Optionally, clear the global tracking variable
        if (
          typeof lastLoadedPresetName !== "undefined" &&
          lastLoadedPresetName === name
        ) {
          lastLoadedPresetName = "";
        }
      }
      modal.classList.add("hidden");
    });

  document.getElementById("clear-confirm-btn").addEventListener("click", () => {
    clearAllMappings();
    document.getElementById("clear-modal").classList.add("hidden");
  });

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // prevent accidental form submission
      btn.closest(".modal").classList.add("hidden");
    });
  });

  document.getElementById("save-preset")?.addEventListener("click", () => {
    openModal("save-modal");
  });

  document.getElementById("save-confirm-btn").addEventListener("click", () => {
    const name = document.getElementById("save-preset-name").value.trim();
    if (name) {
      savePreset(name);
      document.getElementById("save-modal").classList.add("hidden");
    }
  });

  document.getElementById("export-cc-btn")?.addEventListener("click", () => {
    openModal("export-modal");
  });

  document
    .getElementById("export-confirm-btn")
    .addEventListener("click", () => {
      const filename =
        document.getElementById("export-filename").value.trim() ||
        "midi-cc-mappings.json";
      exportMappings(filename);
      document.getElementById("export-modal").classList.add("hidden");
    });

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").classList.add("hidden");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal")
        .forEach((modal) => modal.classList.add("hidden"));
    }
  });

  document.getElementById("import-cc-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const name = file.name.replace(/\.json$/i, "");
      importMappings(file, name);
    }
  });

  const importLabel = document.getElementById("import-label");
  const fileInput = document.getElementById("import-cc-file");

  importLabel.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  document
    .getElementById("open-audio-save-modal")
    ?.addEventListener("click", () => openModal("audio-save-modal"));

  document
    .getElementById("audio-save-confirm-btn")
    ?.addEventListener("click", () => {
      const name = document
        .getElementById("audio-save-preset-name")
        .value.trim();
      if (name) {
        saveAudioPreset(name, "synth-ui", synth);
        document.getElementById("audio-save-modal").classList.add("hidden");
      }
    });

  document
    .getElementById("open-audio-export-modal")
    ?.addEventListener("click", () => openModal("audio-export-modal"));

  document
    .getElementById("audio-export-confirm-btn")
    ?.addEventListener("click", () => {
      const filename =
        document.getElementById("audio-export-filename").value.trim() ||
        "audio-presets.json";
      exportAudioPreset(filename);
      document.getElementById("audio-export-modal").classList.add("hidden");
    });

  document
    .getElementById("import-audio-label")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.getElementById("import-audio-file").click();
      }
    });

  document
    .getElementById("import-audio-file")
    ?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const name = file.name.replace(/\\.json$/i, "");
        importAudioPreset(file, name, synth);
      }
    });

  document
    .getElementById("midi-delete-confirm-btn")
    .addEventListener("click", () => {
      const modal = document.getElementById("midi-delete-modal");
      const name = modal.dataset.presetToDelete;
      if (name) {
        // First, hide modal
        modal.classList.add("hidden");
        // Then delete and re-render
        deletePreset(name);
        renderPresetList("midi-preset-list", "");
      }
    });
}
