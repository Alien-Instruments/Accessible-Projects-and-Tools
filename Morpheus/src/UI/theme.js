const themeSelect = document.getElementById("theme-select");
const themeIds = Array.from(
  document.querySelectorAll('link[rel="stylesheet"][id]')
).map((link) => link.id);

// Set dropdown and stylesheet to saved theme on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme");
  let activeTheme =
    savedTheme && themeIds.includes(savedTheme)
      ? savedTheme
      : themeIds.find((id) => !document.getElementById(id).disabled);

  if (activeTheme) {
    themeSelect.value = activeTheme;
    themeIds.forEach((id) => {
      document.getElementById(id).disabled = id !== activeTheme;
    });
  }
});

// When the select changes, activate theme and save to localStorage
themeSelect.addEventListener("change", function () {
  const selected = this.value;
  themeIds.forEach((id) => {
    const link = document.getElementById(id);
    link.disabled = id !== selected;
  });
  localStorage.setItem("selectedTheme", selected);
});
