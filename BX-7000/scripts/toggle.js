function switchView(select) {
  const views = ["banner", "preset-manager", "midi-map", "arp"];
  views.forEach((view) => {
    const el = document.querySelector(`.${view}`);
    if (el) {
      if (select.value === view) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });
}

const analyzerSection = document.getElementById("analyzers");
const toggleBtn = document.getElementById("toggle-analyzers");

toggleBtn.addEventListener("click", () => {
  const isVisible = analyzerSection.style.display === "flex";
  analyzerSection.style.display = isVisible ? "none" : "flex";
  toggleBtn.textContent = isVisible ? "Show Analyzers" : "Hide Analyzers";
});

const arpModeSelect = document.getElementById("arp-mode");
const arpSliders = document.querySelector(".arp-sliders");
const arpRoll = document.querySelector(".arp-roll");

arpModeSelect.addEventListener("change", () => {
  if (arpModeSelect.value === "custom") {
    arpSliders.classList.add("hidden");
    arpRoll.classList.remove("hidden");
  } else {
    arpSliders.classList.remove("hidden");
    arpRoll.classList.add("hidden");
  }
});

// Optional: Set the correct state on page load
if (arpModeSelect.value === "custom") {
  arpSliders.classList.add("hidden");
  arpRoll.classList.remove("hidden");
} else {
  arpSliders.classList.remove("hidden");
  arpRoll.classList.add("hidden");
}
