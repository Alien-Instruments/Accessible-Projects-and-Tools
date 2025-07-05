document.addEventListener("DOMContentLoaded", function () {
  // Select only sliders with the desired class
  const rangeInputs = document.querySelectorAll(
    'input[type="range"].slider-hotkeys'
  );

  // const numberKey0 = document.getElementById("numberKey0").value.charCodeAt(0); // Default
  // const numberKey1 = document.getElementById("numberKey1").value.charCodeAt(0); // Min
  // const numberKey2 = document.getElementById("numberKey2").value.charCodeAt(0); // Max

  // Modifier keys (e.g., "shiftKey", "altKey", "ctrlKey")
  // const modifier1 = document.getElementById("modifier1").value; // e.g. "shiftKey"
  // const modifier2 = document.getElementById("modifier2").value; // e.g. "ctrlKey"

  // Add double-click to reset
  rangeInputs.forEach(function (input) {
    input.addEventListener("dblclick", function () {
      resetToDefault(input);
    });
  });

  // Handle key press on focused slider (with class)
  document.addEventListener("keydown", function (event) {
    const input = document.activeElement;
    if (
      !input ||
      input.type !== "range" ||
      !input.classList.contains("slider-hotkeys")
    )
      return;

    const step = parseFloat(input.step) || 1;
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    let value = parseFloat(input.value) || 0;
    let multiplier = 1;

    // if (event[modifier1]) multiplier *= 10;
    // if (event[modifier2]) multiplier *= 10;

    // switch (event.keyCode) {
    //   case numberKey0: // Reset to default
    //     resetToDefault(input);
    //     event.preventDefault();
    //     break;
    //   case numberKey1: // Set to min
    //     input.value = min;
    //     updateSlider(input);
    //     event.preventDefault();
    //     break;
    //   case numberKey2: // Set to max
    //     input.value = max;
    //     updateSlider(input);
    //     event.preventDefault();
    //     break;
    //   case 37: // Left
    //   case 40: // Down
    //     input.value = Math.max(min, value - step * multiplier);
    //     updateSlider(input);
    //     event.preventDefault();
    //     break;
    //   case 38: // Up
    //   case 39: // Right
    //     input.value = Math.min(max, value + step * multiplier);
    //     updateSlider(input);
    //     event.preventDefault();
    //     break;
    // }
  });

  function resetToDefault(input) {
    if (input.hasAttribute("defaultValue")) {
      input.value = input.defaultValue;
    } else {
      input.value = input.getAttribute("value") || 0;
    }
    updateSlider(input);
  }

  function updateSlider(input) {
    updateAriaAttributes(input);
    input.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
  }

  function updateAriaAttributes(input) {
    input.setAttribute("aria-valuenow", input.value);
    input.setAttribute("aria-valuetext", input.value);
    input.setAttribute("aria-valuemin", input.min);
    input.setAttribute("aria-valuemax", input.max);
  }
});
