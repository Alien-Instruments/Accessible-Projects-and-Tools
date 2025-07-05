document.addEventListener("keydown", function (e) {
  if (!e.altKey) return;

  const keyClassMap = {
    KeyC: "category oscillator panel",
    KeyV: "category filters panel",
    KeyB: "category envelopes panel",
    KeyN: "category fx panel",
    KeyM: "category lfo panel",
  };

  const className = keyClassMap[e.code];
  if (className) {
    const selector = "." + className.trim().split(/\s+/).join(".");
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus();
      e.preventDefault();
    }
  }
});
