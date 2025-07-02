function toggleDiv(groupClass, clickedButton) {
  // Toggle visibility of content sections
  const allDivs = document.querySelectorAll(".toggle-group");
  allDivs.forEach((div) => {
    if (div.classList.contains(groupClass)) {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
  });

  document
    .querySelectorAll(".module-button")
    .forEach((btn) => btn.classList.remove("active"));

  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  toggleDiv("drumMachine");
});
