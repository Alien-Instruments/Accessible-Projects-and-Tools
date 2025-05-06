const manualModal = document.getElementById("manualModal");
const closeManual = document.getElementById("closeManual");

function openManual() {
  manualModal.classList.add("show");
  manualModal.setAttribute("aria-hidden", "false");
  manualModal.querySelector(".modal-content").focus();
}

// Close modal
function closeManualModal() {
  manualModal.classList.remove("show");
  manualModal.setAttribute("aria-hidden", "true");
}

// Trap focus inside modal
manualModal.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    const focusableElements = manualModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (e.key === "Escape") {
    closeManualModal();
  }
});

// Hook up button
closeManual.addEventListener("click", closeManualModal);

// Example: hook a Help button
document
  .getElementById("openManualButton")
  .addEventListener("click", openManual);
