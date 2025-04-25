function hexToRgb(hex) {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbStringToRgb(rgbString) {
  let result = rgbString.match(/\d+/g);
  return result
    ? {
        r: parseInt(result[0]),
        g: parseInt(result[1]),
        b: parseInt(result[2]),
      }
    : null;
}

function luminance(r, g, b) {
  let a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(lum1, lum2) {
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

// Function to check contrast ratio between two colors
function checkContrast() {
  let color1Input = document.getElementById("color1").value.trim();
  let color2Input = document.getElementById("color2").value.trim();

  document.documentElement.style.setProperty("--color1", color1Input);
  document.documentElement.style.setProperty("--color2", color2Input);

  let color1 = color1Input.startsWith("#")
    ? hexToRgb(color1Input)
    : rgbStringToRgb(color1Input);
  let color2 = color2Input.startsWith("#")
    ? hexToRgb(color2Input)
    : rgbStringToRgb(color2Input);

  if (!color1 || !color2) {
    document.getElementById("result").innerHTML =
      "<span class='fail'>Invalid color input!</span>";
    return;
  }

  // Calculate luminance
  let lum1 = luminance(color1.r, color1.g, color1.b);
  let lum2 = luminance(color2.r, color2.g, color2.b);

  // Calculate contrast ratio
  let ratio = contrastRatio(lum1, lum2);

  // Generate output for normal text, large text, and non-text contrast
  let resultText = `<p>Contrast Ratio: <strong>${ratio.toFixed(
    2
  )}</strong></p>`;

  // Normal text contrast (WCAG AA: 4.5:1, AAA: 7:1)
  resultText += `<p>Normal Text:<br><br> ${
    ratio >= 7
      ? "<span class='pass'>Passes WCAG AAA (7:1)</span>"
      : ratio >= 4.5
      ? "<span class='pass'>Passes WCAG AA (4.5:1)</span>"
      : "<span class='fail'>Fails WCAG AA (4.5:1)</span>"
  }</p>`;

  // Large text contrast (WCAG AA: 3:1, AAA: 4.5:1)
  resultText += `<p>Large Text:<br><br> ${
    ratio >= 4.5
      ? "<span class='pass'>Passes WCAG AAA (4.5:1)</span>"
      : ratio >= 3
      ? "<span class='pass'>Passes WCAG AA (3:1)</span>"
      : "<span class='fail'>Fails WCAG AA (3:1)</span>"
  }</p>`;

  // Non-text contrast (WCAG 2.1 non-text contrast requirement: 3:1)
  resultText += `<p>Non-Text Contrast:<br><br> ${
    ratio >= 3
      ? "<span class='pass'>Passes WCAG 2.1 Non-Text (3:1)</span>"
      : "<span class='fail'>Fails WCAG 2.1 Non-Text (3:1)</span>"
  }</p>`;

  // Display the result
  document.getElementById("result").innerHTML = resultText;
}

// Convert RGB to CSS-friendly string
function rgbToCssString(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

// Function to update CSS variables
function updateCSSVariable(colorNum, colorValue) {
  document.documentElement.style.setProperty(`--color${colorNum}`, colorValue);
}

// Get color from canvas when using pipette tool
imageCanvas.addEventListener("click", function (event) {
  if (!pipetteMode) return;

  const rect = imageCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const selectedColor = getColorFromCanvas(x, y); // Assume this returns {r: 255, g: 0, b: 0} etc.
  const rgbColor = rgbToCssString(
    selectedColor.r,
    selectedColor.g,
    selectedColor.b
  );

  if (pipetteMode === "color1") {
    // Update picker and input fields with hex and rgb value
    document.getElementById("picker1").value = rgbToHex(
      selectedColor.r,
      selectedColor.g,
      selectedColor.b
    );
    document.getElementById("color1").value = rgbColor;

    // Directly update the CSS variable for --color1
    updateCSSVariable(1, rgbColor);
  } else if (pipetteMode === "color2") {
    // Update picker and input fields with hex and rgb value
    document.getElementById("picker2").value = rgbToHex(
      selectedColor.r,
      selectedColor.g,
      selectedColor.b
    );
    document.getElementById("color2").value = rgbColor;

    // Directly update the CSS variable for --color2
    updateCSSVariable(2, rgbColor);
  }

  // Reset pipette mode after selecting the color
  pipetteMode = null;
});

// Sync picker value with text input and update CSS variable
function updateFromPicker(pickerNum) {
  const pickerValue = document.getElementById("picker" + pickerNum).value;
  document.getElementById("color" + pickerNum).value = pickerValue;
  updateCSSVariable(pickerNum, pickerValue); // Use the picker value for updating
}

// Sync input text field and update CSS variable
function updateFromInput(inputNum) {
  const inputValue = document.getElementById("color" + inputNum).value;
  if (inputValue.startsWith("#")) {
    document.getElementById("picker" + inputNum).value = inputValue;
  }
  updateCSSVariable(inputNum, inputValue); // Use the input value for updating
}

// Utility to convert RGB to Hex (helper function)
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
