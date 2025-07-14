export function updateGlideVisibility() {
  const isMono = synth.mode === "mono";
  ["glide-mode", "glide-time", "glide-time-value"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = !isMono;
      // Optionally add/remove a CSS class on the parent .slider-div for greying out
      const sliderDiv = el.closest(".slider-div");
      if (sliderDiv) {
        sliderDiv.classList.toggle("disabled", !isMono);
      }
    }
  });
}
