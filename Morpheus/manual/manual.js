const openBtn = document.getElementById("open-manual-btn");
const modal = document.getElementById("manual-modal");
const closeBtn = document.getElementById("close-manual-btn");
let lastFocused;

function openModal() {
  lastFocused = document.activeElement;
  modal.hidden = false;
  modal.setAttribute("tabindex", "-1");
  modal.focus();
  // Focus first focusable element
  setTimeout(() => closeBtn.focus(), 10);
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

// Focus trap
modal.addEventListener("keydown", function (e) {
  const FOCUSABLE =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableEls = modal.querySelectorAll(FOCUSABLE);
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];
  if (e.key === "Tab") {
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
  if (e.key === "Escape") {
    closeModal();
  }
});

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

// Close modal on outside click (optional)
modal.addEventListener("mousedown", function (e) {
  if (e.target === modal) closeModal();
});

// Accordion behavior: toggles panels open/closed
document.querySelectorAll(".accordion-toggle").forEach((btn) => {
  btn.addEventListener("click", function () {
    const expanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !expanded);
    const panel = document.getElementById(this.getAttribute("aria-controls"));
    panel.hidden = expanded;
    if (!expanded) {
      // Optionally close other panels for true accordion behavior
      document.querySelectorAll(".accordion-toggle").forEach((otherBtn) => {
        if (otherBtn !== this) {
          otherBtn.setAttribute("aria-expanded", "false");
          document.getElementById(
            otherBtn.getAttribute("aria-controls")
          ).hidden = true;
        }
      });
    }
  });

  // Keyboard support (optional: open with Enter or Space)
  btn.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      btn.click();
    }
  });
});

function openModal2() {
  const modal = document.querySelector(".modal2");
  modal.hidden = false;
  // Ensure modal content is scrolled to top
  const content = modal.querySelector(".modal-content2");
  if (content) content.scrollTop = 0;
  // Optionally, scroll the window to top as well:
  window.scrollTo(0, 0);
}
