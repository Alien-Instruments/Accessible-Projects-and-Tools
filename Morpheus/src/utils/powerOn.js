window.addEventListener("DOMContentLoaded", () => {
  // For visual users
  const visualAlert = document.getElementById("visual-alert");
  visualAlert.setAttribute("aria-hidden", "false");
  visualAlert.classList.remove("hide");

  setTimeout(() => {
    visualAlert.classList.add("hide");
    visualAlert.setAttribute("aria-hidden", "true");
  }, 5000);
});
