function openModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  showInput = true,
}) {
  const modal = document.getElementById("custom-modal");
  const titleEl = document.getElementById("modal-title");
  const descEl = document.getElementById("modal-description");
  const inputEl = document.getElementById("modal-input");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  // Set modal content
  titleEl.textContent = title;
  descEl.textContent = description;
  confirmBtn.textContent = confirmLabel;

  // Show/hide input based on flag
  if (showInput) {
    inputEl.style.display = "block";
    inputEl.value = "";
    setTimeout(() => inputEl.focus(), 50);
  } else {
    inputEl.style.display = "none";
    setTimeout(() => confirmBtn.focus(), 50); // focus button if no input
  }

  modal.classList.add("visible");

  function closeModal() {
    modal.classList.remove("visible");
    modal.removeAttribute("aria-hidden");
    document.activeElement.blur();
  }

  function handleConfirm() {
    const val = showInput ? inputEl.value.trim() : null;
    closeModal();
    onConfirm(val);
  }

  confirmBtn.onclick = handleConfirm;
  cancelBtn.onclick = closeModal;

  // ESC key to close
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escListener);
    }
  });

  // Accessibility
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
}
