function toggleSection(buttonId, sectionId) {
  const btn = document.getElementById(buttonId);
  const section = document.getElementById(sectionId);
  const baseLabel = btn.getAttribute("data-label");

  section.setAttribute("tabindex", "-1");

  btn.addEventListener("click", () => {
    section.classList.toggle("hidden");
    if (section.classList.contains("hidden")) {
      btn.textContent = "Show " + baseLabel;
    } else {
      btn.textContent = "Hide " + baseLabel;
      section.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  toggleSection("toggle-audio-preset-controls", "audio-preset-controls");
  toggleSection("toggle-midi-learn", "midi-learn");
  toggleSection("toggle-midi-mod", "mod-ui");
  toggleSection("toggle-arp", "arp");
});
