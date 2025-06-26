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

  // Remove 'active' from all buttons, then set it on clicked one
  document
    .querySelectorAll(".module-button")
    .forEach((btn) => btn.classList.remove("active"));

  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

// Show 'sampler' group by default when the page loads
window.addEventListener("DOMContentLoaded", () => {
  toggleDiv("drumMachine");
});
