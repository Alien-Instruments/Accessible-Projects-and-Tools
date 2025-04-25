/*
MIT License

Copyright (c) [2024] [Samuel J Prouse]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

/*
 █████╗ ██╗     ██╗███████╗███╗   ██╗
██╔══██╗██║     ██║██╔════╝████╗  ██║
███████║██║     ██║█████╗  ██╔██╗ ██║
██╔══██║██║     ██║██╔══╝  ██║╚██╗██║
██║  ██║███████╗██║███████╗██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝
 ╦╔╗╔╔═╗╔╦╗╦═╗╦ ╦╔╦╗╔═╗╔╗╔╔╦╗╔═╗
 ║║║║╚═╗ ║ ╠╦╝║ ║║║║║╣ ║║║ ║ ╚═╗
 ╩╝╚╝╚═╝ ╩ ╩╚═╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
*/

// Page and UI element colouring
//========================================================
let textColorPicker;
const defaultColor = "#000000";
let buttonBackgroundColorPicker;
const defaultButtonBackgroundColor = "#CFCFCF";
let buttonBorderPicker;
const defaultButtonBorder = "#000000";
let buttonFontPicker;
const buttonFontDefault = "#000000";
let backgroundPicker;
const backgroundDefault = "#DFEDFB";
let borderPicker;
const defaultBorderColor = "#9F9D9D";
let sliderColorPicker;
const sliderColorDefault = "#000000";
let sliderThumbColorPicker;
const sliderThumbColorDefault = "#B0B0B0";
let sliderOutlineColorPicker;
const sliderOutlineColorDefault = "#343232";
let focusColorPicker;
const defaultFocusColor = "#000000";
let labelBackgroundPicker;
const defaultLabelBackground = "#FFFFFF";
let labelBorderPicker;
const defaultLabelBorderColor = "#B0B0B0";
let labelFontPicker;
const defaultLabelFontColor = "#000000";
let outputBackgroundPicker;
const defaultOutputBackgroundColor = "#FFFFFF";
let outputBorderPicker;
const defaultOutputBoderColor = "#000000";
let outputFontPicker;
const defaultOutputFontColor = "#000000";
let selectBackgroundPicker;
const defaultSelectBackgroundColor = "#FFFFFF";
let selectBorderPicker;
const defaultSelectBorderColor = "#000000";
let selectFontPicker;
const defaultSelectFontColor = "#000000";
let panelBackgroundPicker;
const defaultPanelBackgroundColor = "#F0F6FF";
let panelGradientPicker;
const defaultPanelGradientColor = "#C6CCF0";
let panelBorderPicker;
const defaultPanelBorderColor = "#403F3F";
let groupBackgroundPicker;
const defaultGroupBackgroundColor = "#00FF04";

//virtual keyboard
let whiteKeysColourPicker;
const whiteKeysColourDefault = "#000000";
let blackKeysColourPicker;
const blackKeysColourDefault = "#FFFFFF";
let keyFontColourPicker;
const keyFontColourDefault = "#000000";

$(document).ready(function () {
  startup();
});

function startup() {
  // Selecting elements
  textColorPicker = $("#color-picker");
  buttonBackgroundColorPicker = $("#color-picker-5");
  buttonBorderPicker = $("#button-border-picker");
  buttonFontPicker = $("#button-font-picker");
  backgroundPicker = $("#color-picker-2");
  borderPicker = $("#border-picker");
  sliderColorPicker = $("#color-picker-4");
  sliderThumbColorPicker = $("#color-picker-3");
  sliderOutlineColorPicker = $("#slider-outline-picker");
  focusColorPicker = $("#focus-color-picker");
  whiteKeysColourPicker = $("#white-keys-colour-picker");
  blackKeysColourPicker = $("#black-keys-colour-picker");
  keyFontColourPicker = $("#key-font-colour-picker");
  labelBackgroundPicker = $("#label-background-picker");
  labelBorderPicker = $("#label-border-picker");
  labelFontPicker = $("#label-font-picker");
  outputBackgroundPicker = $("#output-background-picker");
  outputBorderPicker = $("#output-border-picker");
  outputFontPicker = $("#output-font-picker");
  selectBackgroundPicker = $("#select-background-picker");
  selectBorderPicker = $("#select-border-picker");
  selectFontPicker = $("#select-font-picker");
  panelBackgroundPicker = $("#panel-background-picker");
  panelGradientPicker = $("#panel-gradient-picker");
  panelBorderPicker = $("#panel-border-picker");
  groupBackgroundPicker = $("#group-background-picker");

  // Load colors from localStorage or use defaults
  textColorPicker.val(localStorage.getItem("textColor") || defaultColor);
  buttonBackgroundColorPicker.val(
    localStorage.getItem("buttonBackgroundColor") ||
      defaultButtonBackgroundColor
  );
  buttonBorderPicker.val(
    localStorage.getItem("buttonBorderColour") || defaultButtonBorder
  );
  buttonFontPicker.val(
    localStorage.getItem("buttonFontColor") || buttonFontDefault
  );
  backgroundPicker.val(
    localStorage.getItem("backgroundColor") || backgroundDefault
  );
  borderPicker.val(localStorage.getItem("borderColor") || defaultBorderColor);
  sliderColorPicker.val(
    localStorage.getItem("sliderColor") || sliderColorDefault
  );
  sliderThumbColorPicker.val(
    localStorage.getItem("sliderThumbColor") || sliderThumbColorDefault
  );
  sliderOutlineColorPicker.val(
    localStorage.getItem("sliderOutlineColor") || sliderOutlineColorDefault
  );
  focusColorPicker.val(localStorage.getItem("focusColor") || defaultFocusColor);
  whiteKeysColourPicker.val(
    localStorage.getItem("whiteKeysColour") || whiteKeysColourDefault
  );
  blackKeysColourPicker.val(
    localStorage.getItem("blackKeysColour") || blackKeysColourDefault
  );
  keyFontColourPicker.val(
    localStorage.getItem("keyFontColour") || keyFontColourDefault
  );
  labelBackgroundPicker.val(
    localStorage.getItem("labelBackgroundColor") || defaultLabelBackground
  );
  labelBorderPicker.val(
    localStorage.getItem("labelBorderColor") || defaultLabelBorderColor
  );
  labelFontPicker.val(
    localStorage.getItem("labelFontColor") || defaultLabelFontColor
  );
  selectBackgroundPicker.val(
    localStorage.getItem("selectBackgroundColor") ||
      defaultSelectBackgroundColor
  );
  selectBorderPicker.val(
    localStorage.getItem("selectBorderColor") || defaultSelectBorderColor
  );
  selectFontPicker.val(
    localStorage.getItem("selectFontColor") || defaultSelectFontColor
  );
  outputBackgroundPicker.val(
    localStorage.getItem("outputBackgroundColor") ||
      defaultOutputBackgroundColor
  );
  outputBorderPicker.val(
    localStorage.getItem("outputBorderColor") || defaultOutputBoderColor
  );
  outputFontPicker.val(
    localStorage.getItem("outputFontColor") || defaultOutputFontColor
  );
  panelBackgroundPicker.val(
    localStorage.getItem("panelBackgroundColor") || defaultPanelBackgroundColor
  );
  panelGradientPicker.val(
    localStorage.getItem("panelGradientColor") || defaultPanelGradientColor
  );
  panelBorderPicker.val(
    localStorage.getItem("panelBorderColor") || defaultPanelBorderColor
  );
  groupBackgroundPicker.val(
    localStorage.getItem("groupBackgroundColor") || defaultGroupBackgroundColor
  );
  // Adding event listeners
  textColorPicker.on("input", updateSliderColors);
  backgroundPicker.on("input", updateSliderColors);
  borderPicker.on("input", updateSliderColors);
  buttonBackgroundColorPicker.on("input", updateSliderColors);
  buttonBorderPicker.on("input", updateSliderColors);
  buttonFontPicker.on("input", updateSliderColors);
  sliderColorPicker.on("input", updateSliderColors);
  sliderThumbColorPicker.on("input", updateSliderColors);
  sliderOutlineColorPicker.on("input", updateSliderColors);
  focusColorPicker.on("input", updateFocusColor);
  whiteKeysColourPicker.on("input", updateSliderColors);
  blackKeysColourPicker.on("input", updateSliderColors);
  keyFontColourPicker.on("input", updateSliderColors);
  labelBackgroundPicker.on("input", updateSliderColors);
  labelBorderPicker.on("input", updateSliderColors);
  labelFontPicker.on("input", updateSliderColors);
  outputBackgroundPicker.on("input", updateSliderColors);
  outputBorderPicker.on("input", updateSliderColors);
  outputFontPicker.on("input", updateSliderColors);
  selectBackgroundPicker.on("input", updateSliderColors);
  selectBorderPicker.on("input", updateSliderColors);
  selectFontPicker.on("input", updateSliderColors);
  panelBackgroundPicker.on("input", updateSliderColors);
  panelGradientPicker.on("input", updateSliderColors);
  panelBorderPicker.on("input", updateSliderColors);
  groupBackgroundPicker.on("input", updateSliderColors);

  // Font Size Select
  $("#font-size-select").on("change", function () {
    const selectedFontSize = this.value;
    saveFontSizeToLocalStorage(selectedFontSize);
    applyFontSize(selectedFontSize);
  });

  // Bold Font Select
  $("#bold-select").on("change", function () {
    const selectedBold = this.value === "bold";
    saveBoldToLocalStorage(selectedBold);
    toggleBold(selectedBold);
  });

  // Font Style Select
  $("#font-style-select").on("change", function () {
    const selectedStyle = this.value;
    saveFontStyleToLocalStorage(selectedStyle);
    applyFontStyle(selectedStyle);
  });

  // Font Variant Select
  $("#font-variant-select").on("change", function () {
    const selectedVariant = this.value;
    saveFontVariantToLocalStorage(selectedVariant);
    applyFontVariant(selectedVariant);
  });

  // Font Family Select
  $("#font-family-select").on("change", function () {
    const selectedFont = this.value;
    saveFontFamilyToLocalStorage(selectedFont);
    updateFont(selectedFont);
  });

  // Retrieve color picker values from local storage
  retrieveColorPickersFromLocalStorage();

  // Retrieve and apply select values from local storage
  retrieveAndApplySelectValues();

  // Adding event listeners for sliders
  $("input[type='range']").on("input", function () {
    const value = this.value;
    saveSliderValueToLocalStorage(this.id, value);
    applySliderValue(this.id, value);
  });

  // Retrieve and apply slider values from local storage
  retrieveAndApplySliderValues();
}

function updateSliderColors() {
  const textColor = textColorPicker.val();
  const backgroundColor = backgroundPicker.val();
  const borderColor = borderPicker.val();
  const buttonBackground = buttonBackgroundColorPicker.val();
  const buttonBorder = buttonBorderPicker.val();
  const buttonFont = buttonFontPicker.val();
  const sliderOutlineColor = sliderOutlineColorPicker.val();
  const sliderColor = sliderColorPicker.val();
  const sliderThumbColor = sliderThumbColorPicker.val();
  const keyboardWhiteKeysColour = whiteKeysColourPicker.val();
  const keyboardBlackKeysColour = blackKeysColourPicker.val();
  const keyFontsColours = keyFontColourPicker.val();
  const labelBackground = labelBackgroundPicker.val();
  const labelBorder = labelBorderPicker.val();
  const labelFont = labelFontPicker.val();
  const outputBackground = outputBackgroundPicker.val();
  const outputBorder = outputBorderPicker.val();
  const outputFont = outputFontPicker.val();
  const selectBackground = selectBackgroundPicker.val();
  const selectBorder = selectBorderPicker.val();
  const selectFont = selectFontPicker.val();
  const panelBackground = panelBackgroundPicker.val();
  const panelBorder = panelBorderPicker.val();
  const panelGradient = panelGradientPicker.val();
  const groupBackground = groupBackgroundPicker.val();

  // Update arrow color to match text color
  const arrowColor = selectFont;
  document.querySelectorAll("select").forEach((element) => {
    // Update the fill and stroke attributes of the SVG
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${arrowColor}" stroke="${arrowColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 9 12 15 18 9"></polygon></svg>`
    );
    element.style.backgroundImage = `url('data:image/svg+xml;utf8,${svg}')`;
  });

  document.documentElement.style.setProperty("--font-color", textColor);
  document.documentElement.style.setProperty(
    "--background-color",
    backgroundColor
  );
  document.documentElement.style.setProperty("--border-color", borderColor);
  document.documentElement.style.setProperty(
    "--button-background",
    buttonBackground
  );
  document.documentElement.style.setProperty("--button-font", buttonFont);
  document.documentElement.style.setProperty("--button-border", buttonBorder);
  document.documentElement.style.setProperty(
    "--slider-track-color",
    sliderColor
  );
  document.documentElement.style.setProperty(
    "--slider-thumb-color",
    sliderThumbColor
  );
  document.documentElement.style.setProperty(
    "--slider-outline-color",
    sliderOutlineColor
  );
  document.documentElement.style.setProperty(
    "--label-background-color",
    labelBackground
  );
  document.documentElement.style.setProperty(
    "--label-border-color",
    labelBorder
  );
  document.documentElement.style.setProperty("--label-font-color", labelFont);
  document.documentElement.style.setProperty(
    "--white-keys-color",
    keyboardWhiteKeysColour
  );
  document.documentElement.style.setProperty(
    "--output-background-color",
    outputBackground
  );
  document.documentElement.style.setProperty(
    "--output-border-color",
    outputBorder
  );
  document.documentElement.style.setProperty("--output-font-color", outputFont);
  document.documentElement.style.setProperty(
    "--select-background-color",
    selectBackground
  );
  document.documentElement.style.setProperty(
    "--select-border-color",
    selectBorder
  );
  document.documentElement.style.setProperty(
    "--panel-background-color",
    panelBackground
  );
  document.documentElement.style.setProperty(
    "--panel-gradient-color",
    panelGradient
  );
  document.documentElement.style.setProperty(
    "--panel-border-color",
    panelBorder
  );
  document.documentElement.style.setProperty("--select-font-color", selectFont);
  document.documentElement.style.setProperty(
    "--black-keys-color",
    keyboardBlackKeysColour
  );
  document.documentElement.style.setProperty(
    "--font-keys-color",
    keyFontsColours
  );

  document.documentElement.style.setProperty(
    "--group-background-color",
    groupBackground
  );
}

function updateFocusColor() {
  const focusColor = focusColorPicker.val();
  document.documentElement.style.setProperty("--focus-color", focusColor);
}

function updateScrollbarColors() {
  const sliderTrackColor = sliderColorPicker.val();
  const sliderThumbColor = sliderThumbColorPicker.val();

  document.documentElement.style.setProperty(
    "--scrollbar-track-color",
    sliderTrackColor
  );
  document.documentElement.style.setProperty(
    "--scrollbar-thumb-color",
    sliderThumbColor
  );
}

function updateFocusSize(size) {
  document.documentElement.style.setProperty("--focus-size", size);
}

function updateBorderRadius(borderRadius) {
  document.documentElement.style.setProperty("--border-radius", borderRadius);
}

function updateBorderThickness(borderThickness) {
  document.documentElement.style.setProperty(
    "--border-thickness",
    borderThickness
  );
}

function updateFont(selectedFont) {
  document.documentElement.style.setProperty(
    "--font-family",
    selectedFont === "CustomFont" ? "OpenDyslexic, sans-serif" : selectedFont
  );
}

function applyFontSize(size) {
  document.documentElement.style.setProperty("--font-size", size + "px");
}

function toggleBold(isBold) {
  document.documentElement.style.setProperty(
    "--font-weight",
    isBold ? "bold" : "normal"
  );
}

function applyFontStyle(style) {
  switch (style) {
    case "italic":
      document.documentElement.style.setProperty("--font-style", "italic");
      break;
    case "underline":
      document.documentElement.style.setProperty(
        "--text-decoration",
        "underline"
      );
      break;
    default:
      document.documentElement.style.setProperty("--font-style", "normal");
      document.documentElement.style.setProperty("--text-decoration", "none");
      break;
  }
}

function applyFontVariant(variant) {
  document.documentElement.style.setProperty("--font-variant", variant);
}

$(document).ready(function () {
  const focusSizeSlider = $("#focus-size-slider");

  focusSizeSlider.on("input", function () {
    const focusSize = this.value + "px";
    saveSliderValueToLocalStorage(this.id, this.value);
    updateFocusSize(focusSize);
  });
});

$(document).ready(function () {
  const borderRadiusSlider = $("#border-radius-slider");
  const borderThicknessSlider = $("#border-thickness-slider");

  borderRadiusSlider.on("input", function () {
    const borderRadius = this.value + "px";
    saveSliderValueToLocalStorage(this.id, this.value);
    updateBorderRadius(borderRadius);
  });

  borderThicknessSlider.on("input", function () {
    const borderThick = this.value + "px";
    saveSliderValueToLocalStorage(this.id, this.value);
    updateBorderThickness(borderThick);
  });
});

function saveFontSizeToLocalStorage(size) {
  localStorage.setItem("selectedFontSize", size);
}

function saveBoldToLocalStorage(isBold) {
  localStorage.setItem("selectedBold", isBold);
}

function saveFontStyleToLocalStorage(style) {
  localStorage.setItem("selectedFontStyle", style);
}

function saveFontVariantToLocalStorage(variant) {
  localStorage.setItem("selectedFontVariant", variant);
}

function saveFontFamilyToLocalStorage(font) {
  localStorage.setItem("selectedFontFamily", font);
}

function saveSliderValueToLocalStorage(sliderId, value) {
  localStorage.setItem(sliderId, value);
}

$(document).ready(function () {
  retrieveFontSizeFromLocalStorage();
  retrieveBoldFromLocalStorage();
  retrieveFontStyleFromLocalStorage();
  retrieveFontVariantFromLocalStorage();
  retrieveFontFamilyFromLocalStorage();
  triggerSliderChangeEvents();
});

// Function to trigger 'input' events on sliders
function triggerSliderChangeEvents() {
  // Select all the sliders related to focus size, border thickness, and border radius
  const focusSizeSlider = $("#focus-size-slider");
  const borderRadiusSlider = $("#border-radius-slider");
  const borderThicknessSlider = $("#border-thickness-slider");

  // Trigger 'input' event to simulate user changing the value
  focusSizeSlider.trigger("input");
  borderRadiusSlider.trigger("input");
  borderThicknessSlider.trigger("input");
}

function retrieveFontSizeFromLocalStorage() {
  const savedFontSize = localStorage.getItem("selectedFontSize");
  if (savedFontSize) {
    applyFontSize(savedFontSize);
  }
}

function retrieveBoldFromLocalStorage() {
  const savedBold = localStorage.getItem("selectedBold");
  if (savedBold) {
    toggleBold(savedBold === "true");
  }
}

function retrieveFontStyleFromLocalStorage() {
  const savedFontStyle = localStorage.getItem("selectedFontStyle");
  if (savedFontStyle) {
    applyFontStyle(savedFontStyle);
  }
}

function retrieveFontVariantFromLocalStorage() {
  const savedFontVariant = localStorage.getItem("selectedFontVariant");
  if (savedFontVariant) {
    applyFontVariant(savedFontVariant);
  }
}

function retrieveFontFamilyFromLocalStorage() {
  const savedFontFamily = localStorage.getItem("selectedFontFamily");
  if (savedFontFamily) {
    updateFont(savedFontFamily);
  }
}

function retrieveAndApplySliderValues() {
  $("input[type='range']").each(function () {
    const savedValue = localStorage.getItem(this.id);
    if (savedValue) {
      $(this).val(savedValue);
      applySliderValue(this.id, savedValue);
    }
  });
}

function applyStyleToClass(className, styleProperty, value) {
  const elements = $(`.${className}`);
  elements.css(styleProperty, value);
}

function applyLineSpacing(value) {
  document.documentElement.style.setProperty("--line-spacing", value);
}

function applyLetterSpacing(value) {
  document.documentElement.style.setProperty("--letter-spacing", value + "em");
}

function applyWordSpacing(value) {
  document.documentElement.style.setProperty("--word-spacing", value + "em");
}

function applySliderValue(sliderId, value) {
  switch (sliderId) {
    case "focus-size-slider":
      updateFocusSize(value + "px");
      break;
    case "border-radius-slider":
      updateBorderRadius(value + "px");
      break;
    case "border-thickness-slider":
      updateBorderThickness(value + "px");
      break;
    case "line-spacing-slider":
      applyLineSpacing(value);
      break;
    case "letter-spacing-slider":
      applyLetterSpacing(value);
      break;
    case "word-spacing-slider":
      applyWordSpacing(value);
      break;
    default:
      break;
  }
}

// Event listeners for the sliders
$("#line-spacing-slider").on("input", function () {
  const value = parseFloat(this.value);
  saveSliderValueToLocalStorage(this.id, value);
  applySliderValue(this.id, value);
});

$("#letter-spacing-slider").on("input", function () {
  const value = parseFloat(this.value);
  saveSliderValueToLocalStorage(this.id, value);
  applySliderValue(this.id, value);
});

$("#word-spacing-slider").on("input", function () {
  const value = parseFloat(this.value);
  saveSliderValueToLocalStorage(this.id, value);
  applySliderValue(this.id, value);
});

// Add event listeners to save color picker values to local storage
function addColorPickerListeners() {
  textColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("textColor", color);
    updateSliderColors();
  });

  buttonBackgroundColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("buttonBackgroundColor", color);
    updateSliderColors();
  });

  buttonBorderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("buttonBorderColour", color);
    updateSliderColors();
  });

  buttonFontPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("buttonFontColor", color);
    updateSliderColors();
  });

  backgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("backgroundColor", color);
    updateSliderColors();
  });

  borderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("borderColor", color);
    updateSliderColors();
  });

  sliderColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("sliderColor", color);
    updateSliderColors();
    updateScrollbarColors();
  });

  sliderThumbColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("sliderThumbColor", color);
    updateSliderColors();
    updateScrollbarColors();
  });

  sliderOutlineColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("sliderOutlineColor", color);
    updateSliderColors();
  });

  labelBackgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("labelBackgroundColor", color);
    updateSliderColors();
  });

  labelBorderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("labelBorderColor", color);
    updateSliderColors();
  });

  labelFontPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("labelFontColor", color);
    updateSliderColors();
  });

  outputBackgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("outputBackgroundColor", color);
    updateSliderColors();
  });

  outputBorderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("outputBorderColor", color);
    updateSliderColors();
  });

  outputFontPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("outputFontColor", color);
    updateSliderColors();
  });

  selectBackgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("selectBackgroundColor", color);
    updateSliderColors();
  });

  selectBorderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("selectBorderColor", color);
    updateSliderColors();
  });

  selectFontPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("selectFontColor", color);
    updateSliderColors();
  });

  panelBackgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("panelBackgroundColor", color);
    updateSliderColors();
  });

  panelGradientPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("panelGradientColor", color);
    updateSliderColors();
  });

  panelBorderPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("panelBorderColor", color);
    updateSliderColors();
  });

  focusColorPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("focusColor", color);
    updateFocusColor();
  });

  whiteKeysColourPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("keyboardWhiteKeys", color);
    updateSliderColors();
  });

  blackKeysColourPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("keyboardBlackKeys", color);
    updateSliderColors();
  });

  keyFontColourPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("keyboardFontColours", color);
    updateSliderColors();
  });

  groupBackgroundPicker.on("input", function () {
    const color = this.value;
    localStorage.setItem("groupBackgroundColor", color);
    updateSliderColors();
  });
}

function retrieveColorPickersFromLocalStorage() {
  textColorPicker.val(localStorage.getItem("textColor") || defaultColor);

  buttonBackgroundColorPicker.val(
    localStorage.getItem("buttonBackgroundColor") ||
      defaultButtonBackgroundColor
  );
  buttonBorderPicker.val(
    localStorage.getItem("buttonBorderColour") || defaultButtonBorder
  );
  buttonFontPicker.val(
    localStorage.getItem("buttonFontColor") || buttonFontDefault
  );
  backgroundPicker.val(
    localStorage.getItem("backgroundColor") || backgroundDefault
  );
  sliderColorPicker.val(
    localStorage.getItem("sliderColor") || sliderColorDefault
  );
  sliderThumbColorPicker.val(
    localStorage.getItem("sliderThumbColor") || sliderThumbColorDefault
  );
  sliderOutlineColorPicker.val(
    localStorage.getItem("sliderOutlineColor") || sliderOutlineColorDefault
  );
  focusColorPicker.val(localStorage.getItem("focusColor") || defaultFocusColor);
  whiteKeysColourPicker.val(
    localStorage.getItem("keyboardWhiteKeys") || whiteKeysColourDefault
  );
  blackKeysColourPicker.val(
    localStorage.getItem("keyboardBlackKeys") || blackKeysColourDefault
  );
  keyFontColourPicker.val(
    localStorage.getItem("keyboardFontColours") || keyFontColourDefault
  );
  labelBackgroundPicker.val(
    localStorage.getItem("labelBackgroundColor") || defaultLabelBackground
  );
  labelBorderPicker.val(
    localStorage.getItem("labelBorderColor") || defaultLabelBorderColor
  );
  labelFontPicker.val(
    localStorage.getItem("labelFontColor") || defaultLabelFontColor
  );
  selectBackgroundPicker.val(
    localStorage.getItem("selectBackgroundColor") ||
      defaultSelectBackgroundColor
  );
  selectBorderPicker.val(
    localStorage.getItem("selectBorderColor") || defaultSelectBorderColor
  );
  selectFontPicker.val(
    localStorage.getItem("selectFontColor") || defaultSelectFontColor
  );
  outputBackgroundPicker.val(
    localStorage.getItem("outputBackgroundColor") ||
      defaultOutputBackgroundColor
  );
  outputBorderPicker.val(
    localStorage.getItem("outputBorderColor") || defaultOutputBoderColor
  );
  outputFontPicker.val(
    localStorage.getItem("outputFontColor") || defaultOutputFontColor
  );
  panelBackgroundPicker.val(
    localStorage.getItem("panelBackgroundColor") || defaultPanelBackgroundColor
  );
  panelGradientPicker.val(
    localStorage.getItem("panelGradientColor") || defaultPanelGradientColor
  );
  panelBorderPicker.val(
    localStorage.getItem("panelBorderColor") || defaultSelectFontColor
  );
  groupBackgroundPicker.val(
    localStorage.getItem("groupBackgroundColor") || defaultGroupBackgroundColor
  );

  updateSliderColors();
  updateFocusColor();
  updateScrollbarColors();
}

function retrieveAndApplySelectValues() {
  const savedFontSize = localStorage.getItem("selectedFontSize");
  if (savedFontSize) {
    applyFontSize(savedFontSize);
    $("#font-size-select").val(savedFontSize);
  }

  const savedBold = localStorage.getItem("selectedBold");
  if (savedBold) {
    toggleBold(savedBold === "true");
    $("#bold-select").val(savedBold === "true" ? "bold" : "normal");
  }

  const savedFontStyle = localStorage.getItem("selectedFontStyle");
  if (savedFontStyle) {
    applyFontStyle(savedFontStyle);
    $("#font-style-select").val(savedFontStyle);
  }

  const savedFontVariant = localStorage.getItem("selectedFontVariant");
  if (savedFontVariant) {
    applyFontVariant(savedFontVariant);
    $("#font-variant-select").val(savedFontVariant);
  }

  const savedFontFamily = localStorage.getItem("selectedFontFamily");
  if (savedFontFamily) {
    updateFont(savedFontFamily);
    $("#font-family-select").val(savedFontFamily);
  }
}

// Call functions to add event listeners for saving to local storage and retrieve from local storage on page load
$(document).ready(function () {
  addColorPickerListeners();
  retrieveColorPickersFromLocalStorage();
  retrieveAndApplySelectValues();
  retrieveAndApplySliderValues();
});

const toggleGradients = $("#toggleGradients");

toggleGradients.on("click", function () {
  const isActive = $(this).attr("aria-pressed") === "true";
  const newState = !isActive;

  // Update button
  $(this).attr("aria-pressed", String(newState));
  $(this).html(newState ? "SHOW<br>GRADIENT" : "REMOVE<br>GRADIENT");

  // Store state
  localStorage.setItem("gradientsEnabled", String(newState));

  // Apply classes
  $(".panel").each(function () {
    $(this).toggleClass("no-gradient", newState);
  });

  $(".slider-container").each(function () {
    $(this).toggleClass("no-gradient", newState);
  });
});

// Function to retrieve toggle state from local storage
$(document).ready(function () {
  const saved = localStorage.getItem("gradientsEnabled") === "true";

  $("#toggleGradients").attr("aria-pressed", String(saved));
  $(this).html(saved ? "SHOW<br>GRADIENT" : "REMOVE<br>GRADIENT");

  $(".panel").each(function () {
    $(this).toggleClass("no-gradient", saved);
  });

  $(".slider-container").each(function () {
    $(this).toggleClass("no-gradient", saved);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleAccess = document.getElementById("toggleAccess");

  const accessDiv = document.getElementById("accessDiv");

  toggleAccess.addEventListener("click", function () {
    accessDiv.classList.toggle("hidden");
  });
});

$("#toggleAccess").click(function () {
  var buttonText = $(this).text();
  $(this).text(
    buttonText === "Hide Interface Settings"
      ? "Show Interface Settings"
      : "Hide Interface Settings"
  );
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleAccess");
  const menu = document.getElementById("accessDiv"); // Use 'accessDiv' instead of 'menu'

  if (toggleButton && menu) {
    // Ensure both elements exist
    toggleButton.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";

      // Toggle aria-expanded
      this.setAttribute("aria-expanded", !expanded);

      // Toggle the visibility of the menu
      menu.setAttribute("aria-hidden", expanded);

      // Optionally toggle the menu's visibility with CSS
      if (!expanded) {
        menu.style.display = "block"; // Show menu
      } else {
        menu.style.display = "none"; // Hide menu
      }
    });
  } else {
    console.error("Menu or toggle button is not found in the DOM");
  }
});

$("#knob-design-select").on("change", function () {
  const selectedDesign = this.value;
  saveKnobDesignToLocalStorage(selectedDesign);
  applyKnobDesign(selectedDesign);
});

function saveKnobDesignToLocalStorage(design) {
  localStorage.setItem("selectedKnobDesign", design);
}

function applyKnobDesign(design) {
  const knobWrappers = $(".slider-container");
  knobWrappers.removeClass(
    "classic minimal fancy retro modern twist flat shadow outline simple"
  );
  knobWrappers.addClass(design);
}

// On page load, retrieve and apply the saved knob design
$(document).ready(function () {
  const savedKnobDesign = localStorage.getItem("selectedKnobDesign");
  if (savedKnobDesign) {
    $("#knob-design-select").val(savedKnobDesign);
    applyKnobDesign(savedKnobDesign);
  } else {
    applyKnobDesign("classic"); // Default design
  }
});

//Preset Management=========================================
$(document).ready(function () {
  const presetNameInput = $("#preset-name");
  const savePresetBtn = $("#save-preset-btn");
  const deletePresetBtn = $("#delete-preset-btn");
  const presetList = $("#preset-list");

  const modal = $("#custom-modal");
  const modalMessage = $("#modal-message");
  const modalOkBtn = $("#modal-ok-btn");
  const toggleAccessBtn = $("#toggleAccess"); // Button to focus after modal is closed

  // Helper function to show modal and announce text
  function showModal(message) {
    modalMessage.text(message);
    modal.attr("aria-hidden", "false");

    // Defer focus until after DOM updates
    setTimeout(() => {
      modalMessage.focus();
    }, 0);

    // Trap focus inside the modal
    $(document).on("keydown", function (e) {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === modalMessage[0]) {
          e.preventDefault();
          modalOkBtn.focus();
        } else if (!e.shiftKey && document.activeElement === modalOkBtn[0]) {
          e.preventDefault();
          modalMessage.focus();
        }
      }
    });
  }

  // Hide modal when OK button is clicked
  modalOkBtn.on("click", function () {
    modal.attr("aria-hidden", "true");
    $(document).off("keydown"); // Remove focus trap

    // Move focus back to the toggleAccess button
    toggleAccessBtn.focus(); // Set focus on the target button
  });

  // Load available presets on page load
  loadPresetList();

  // Event listener to save a preset
  savePresetBtn.on("click", function () {
    const presetName = presetNameInput.val().trim();
    if (presetName === "") {
      showModal("Please enter a preset name.");
      return;
    }

    const presetData = gatherCurrentSettings();
    localStorage.setItem(`preset-${presetName}`, JSON.stringify(presetData));
    showModal(`Preset "${presetName}" saved!`);

    // Update preset list
    loadPresetList();
  });

  // Event listener to load a selected preset
  presetList.on("change", function () {
    const selectedPreset = $(this).val();

    if (selectedPreset) {
      if (selectedPreset.startsWith("factory-")) {
        const factoryPresetName = selectedPreset.replace("factory-", "");
        const presetData = factoryPresets[factoryPresetName];
        if (presetData) {
          applyPresetSettings(presetData);
          showModal(`Factory Preset "${factoryPresetName}" loaded!`);
        }
      } else {
        const presetData = JSON.parse(
          localStorage.getItem(`preset-${selectedPreset}`)
        );
        if (presetData) {
          applyPresetSettings(presetData);
          showModal(`Custom Preset "${selectedPreset}" loaded!`);
        }
      }
    }
  });

  // Event listener to delete a selected preset
  deletePresetBtn.on("click", function () {
    const selectedPreset = presetList.val();
    if (selectedPreset) {
      localStorage.removeItem(`preset-${selectedPreset}`);
      showModal(`Preset "${selectedPreset}" deleted!`);

      // Update preset list
      loadPresetList();
    } else {
      showModal("Please select a preset to delete.");
    }
  });

  // Function to load presets into the dropdown
  function loadPresetList() {
    presetList
      .empty()
      .append('<option value="" disabled selected>Select a preset</option>');

    // Add factory presets to the list
    Object.keys(factoryPresets).forEach((presetName) => {
      presetList.append(
        `<option value="factory-${presetName}">${presetName}</option>`
      );
    });

    // Add custom presets from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("preset-")) {
        const presetName = key.replace("preset-", "");
        presetList.append(
          `<option value="${presetName}">${presetName}</option>`
        );
      }
    });
  }

  // Function to gather current settings (from the color pickers, font selectors, etc.)
  function gatherCurrentSettings() {
    return {
      //Colour pickers
      textColor: textColorPicker.val(),
      buttonBackgroundColor: buttonBackgroundColorPicker.val(),
      buttonBorderColor: buttonBorderPicker.val(),
      buttonFontColor: buttonFontPicker.val(),
      backgroundColor: backgroundPicker.val(),
      borderColor: borderPicker.val(),
      sliderColor: sliderColorPicker.val(),
      sliderThumbColor: sliderThumbColorPicker.val(),
      sliderOutlineColor: sliderOutlineColorPicker.val(),
      focusColor: focusColorPicker.val(),
      whiteKeysColour: whiteKeysColourPicker.val(),
      blackKeysColour: blackKeysColourPicker.val(),
      keyFontColour: keyFontColourPicker.val(),
      labelBackgroundColor: labelBackgroundPicker.val(),
      labelBorderColor: labelBorderPicker.val(),
      labelFontColor: labelFontPicker.val(),
      outputBackgroundColor: outputBackgroundPicker.val(),
      outputBorderColor: outputBorderPicker.val(),
      outputFontColor: outputFontPicker.val(),
      selectBackgroundColor: selectBackgroundPicker.val(),
      selectBorderColor: selectBorderPicker.val(),
      selectFontColor: selectFontPicker.val(),
      panelBackgroundColor: panelBackgroundPicker.val(),
      panelGradientColor: panelGradientPicker.val(),
      panelBorderColor: panelBorderPicker.val(),
      groupBackgroundColor: groupBackgroundPicker.val(),
      // Sliders
      focusSizeSlider: $("#focus-size-slider").val(),
      borderRadiusSlider: $("#border-radius-slider").val(),
      borderThicknessSlider: $("#border-thickness-slider").val(),
      lineSpacingSlider: $("#line-spacing-slider").val(),
      letterSpacingSlider: $("#letter-spacing-slider").val(),
      wordSpacingSlider: $("#word-spacing-slider").val(),
      // Select inputs
      fontSizeSelect: $("#font-size-select").val(),
      boldSelect: $("#bold-select").val(),
      fontStyleSelect: $("#font-style-select").val(),
      fontVariantSelect: $("#font-variant-select").val(),
      fontFamilySelect: $("#font-family-select").val(),
      knobDesignSelect: $("#knob-design-select").val(),

      gradientsEnabled: toggleGradients.is(":checked"),
    };
  }

  // Function to apply preset settings to the UI
  function applyPresetSettings(presetData) {
    textColorPicker.val(presetData.textColor).trigger("input");
    buttonBackgroundColorPicker
      .val(presetData.buttonBackgroundColor)
      .trigger("input");
    buttonBorderPicker.val(presetData.buttonBorderColor).trigger("input");
    buttonFontPicker.val(presetData.buttonFontColor).trigger("input");
    backgroundPicker.val(presetData.backgroundColor).trigger("input");
    borderPicker.val(presetData.borderColor).trigger("input");
    sliderColorPicker.val(presetData.sliderColor).trigger("input");
    sliderThumbColorPicker.val(presetData.sliderThumbColor).trigger("input");
    sliderOutlineColorPicker
      .val(presetData.sliderOutlineColor)
      .trigger("input");
    focusColorPicker.val(presetData.focusColor).trigger("input");
    whiteKeysColourPicker.val(presetData.whiteKeysColour).trigger("input");
    blackKeysColourPicker.val(presetData.blackKeysColour).trigger("input");
    keyFontColourPicker.val(presetData.keyFontColour).trigger("input");
    labelBackgroundPicker.val(presetData.labelBackgroundColor).trigger("input");
    labelBorderPicker.val(presetData.labelBorderColor).trigger("input");
    labelFontPicker.val(presetData.labelFontColor).trigger("input");
    outputBackgroundPicker
      .val(presetData.outputBackgroundColor)
      .trigger("input");
    outputBorderPicker.val(presetData.outputBorderColor).trigger("input");
    outputFontPicker.val(presetData.outputFontColor).trigger("input");
    selectBackgroundPicker
      .val(presetData.selectBackgroundColor)
      .trigger("input");
    selectBorderPicker.val(presetData.selectBorderColor).trigger("input");
    selectFontPicker.val(presetData.selectFontColor).trigger("input");
    panelBackgroundPicker.val(presetData.panelBackgroundColor).trigger("input");
    panelGradientPicker.val(presetData.panelGradientColor).trigger("input");
    panelBorderPicker.val(presetData.panelBorderColor).trigger("input");
    groupBackgroundPicker.val(presetData.groupBackgroundColor).trigger("input");

    // Apply slider values
    $("#focus-size-slider").val(presetData.focusSizeSlider).trigger("input");
    $("#border-radius-slider")
      .val(presetData.borderRadiusSlider)
      .trigger("input");
    $("#border-thickness-slider")
      .val(presetData.borderThicknessSlider)
      .trigger("input");
    $("#line-spacing-slider")
      .val(presetData.lineSpacingSlider)
      .trigger("input");
    $("#letter-spacing-slider")
      .val(presetData.letterSpacingSlider)
      .trigger("input");
    $("#word-spacing-slider")
      .val(presetData.wordSpacingSlider)
      .trigger("input");

    // Apply select inputs
    $("#font-size-select").val(presetData.fontSizeSelect).trigger("change");
    $("#bold-select").val(presetData.boldSelect).trigger("change");
    $("#font-style-select").val(presetData.fontStyleSelect).trigger("change");
    $("#font-variant-select")
      .val(presetData.fontVariantSelect)
      .trigger("change");
    $("#font-family-select").val(presetData.fontFamilySelect).trigger("change");
    $("#knob-design-select").val(presetData.knobDesignSelect).trigger("change");

    toggleGradients
      .prop("checked", presetData.gradientsEnabled)
      .trigger("change");
  }
});

const factoryPresets = {
  "Classic Light": {
    textColor: "#000000",
    buttonBackgroundColor: "#CFCFCF",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    backgroundColor: "#DFEDFB",
    borderColor: "#9F9D9D",
    sliderColor: "#000000",
    sliderThumbColor: "#B0B0B0",
    sliderOutlineColor: "#343232",
    focusColor: "#000000",
    whiteKeysColour: "#000000",
    blackKeysColour: "#FFFFFF",
    keyFontColour: "#000000",
    labelBackgroundColor: "#FFFFFF",
    labelBorderColor: "#B0B0B0",
    labelFontColor: "#000000",
    outputBackgroundColor: "#FFFFFF",
    outputBorderColor: "#000000",
    outputFontColor: "#000000",
    selectBackgroundColor: "#FFFFFF",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    panelBackgroundColor: "#F0F6FF",
    panelGradientColor: "#C6CCF0",
    panelBorderColor: "#403F3F",
    groupBackgroundColor: "#00FF04",
    focusSizeSlider: "2",
    borderRadiusSlider: "10",
    borderThicknessSlider: "2",
    lineSpacingSlider: "0",
    letterSpacingSlider: "0",
    wordSpacingSlider: "0",
    fontSizeSelect: "18",
    boldSelect: "normal",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    fontFamilySelect: "Arial",
    knobDesignSelect: "classic",
    gradientsEnabled: false,
  },
  "Minimal Dark": {
    textColor: "#FFFFFF",
    buttonBackgroundColor: "#333333",
    buttonBorderColor: "#FFFFFF",
    buttonFontColor: "#FFFFFF",
    backgroundColor: "#121212",
    borderColor: "#FFFFFF",
    sliderColor: "#FFFFFF",
    sliderThumbColor: "#777777",
    sliderOutlineColor: "#FFFFFF",
    focusColor: "#FFFFFF",
    whiteKeysColour: "#FFFFFF",
    blackKeysColour: "#000000",
    keyFontColour: "#FFFFFF",
    labelBackgroundColor: "#333333",
    labelBorderColor: "#FFFFFF",
    labelFontColor: "#FFFFFF",
    outputBackgroundColor: "#333333",
    outputBorderColor: "#FFFFFF",
    outputFontColor: "#FFFFFF",
    selectBackgroundColor: "#333333",
    selectBorderColor: "#FFFFFF",
    selectFontColor: "#FFFFFF",
    panelBackgroundColor: "#202020",
    panelGradientColor: "#404040",
    panelBorderColor: "#FFFFFF",
    groupBackgroundColor: "#FF0000",
    focusSizeSlider: "2",
    borderRadiusSlider: "5",
    borderThicknessSlider: "2",
    lineSpacingSlider: "0",
    letterSpacingSlider: "0",
    wordSpacingSlider: "0",
    fontSizeSelect: "18",
    boldSelect: "bold",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    fontFamilySelect: "Helvetica",
    knobDesignSelect: "minimal",
    gradientsEnabled: false,
  },
  "Fancy Light": {
    backgroundColor: "#f5fcff",
    blackKeysColour: "#ffffff",
    boldSelect: "bold",
    borderColor: "#000000",
    borderRadiusSlider: "5",
    borderThicknessSlider: "2",
    buttonBackgroundColor: "#ffffff",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#585656",
    focusSizeSlider: "3",
    fontFamilySelect: "Optima",
    fontSizeSelect: "18",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#ff0000",
    keyFontColour: "#000000",
    knobDesignSelect: "fancy",
    labelBackgroundColor: "#333333",
    labelBorderColor: "#ffffff",
    labelFontColor: "#ffffff",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#333333",
    outputBorderColor: "#ffffff",
    outputFontColor: "#ffffff",
    panelBackgroundColor: "#ffffff",
    panelBorderColor: "#000000",
    panelGradientColor: "#e8e8e8",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#a2a0a0",
    sliderOutlineColor: "#5b5757",
    sliderThumbColor: "#c3eef9",
    textColor: "#000000",
    whiteKeysColour: "#707070",
    wordSpacingSlider: "0",
    gradientsEnabled: false,
  },
  "Retro Dark Mono": {
    backgroundColor: "#575757",
    blackKeysColour: "#ffffff",
    boldSelect: "normal",
    borderColor: "#d7d6d6",
    borderRadiusSlider: "5",
    borderThicknessSlider: "2",
    buttonBackgroundColor: "#ffffff",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#ffffff",
    focusSizeSlider: "3",
    fontFamilySelect: "Verdana",
    fontSizeSelect: "18",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#969696",
    keyFontColour: "#000000",
    knobDesignSelect: "retro",
    labelBackgroundColor: "#333333",
    labelBorderColor: "#ffffff",
    labelFontColor: "#ffffff",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#333333",
    outputBorderColor: "#ffffff",
    outputFontColor: "#ffffff",
    panelBackgroundColor: "#303030",
    panelBorderColor: "#b0b0b0",
    panelGradientColor: "#3b3a3a",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#000000",
    sliderOutlineColor: "#ebebeb",
    sliderThumbColor: "#757575",
    textColor: "#ffffff",
    whiteKeysColour: "#707070",
    wordSpacingSlider: "0",
    gradientsEnabled: true,
  },
  "Modern Light Mono": {
    backgroundColor: "#a8a4a4",
    blackKeysColour: "#ffffff",
    boldSelect: "bold",
    borderColor: "#7c7979",
    borderRadiusSlider: "5",
    borderThicknessSlider: "2",
    buttonBackgroundColor: "#ffffff",
    buttonBorderColor: "#ffffff",
    buttonFontColor: "#000000",
    focusColor: "#ffffff",
    focusSizeSlider: "3",
    fontFamilySelect: "Tahoma",
    fontSizeSelect: "18",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#969696",
    keyFontColour: "#000000",
    knobDesignSelect: "modern",
    labelBackgroundColor: "#adadad",
    labelBorderColor: "#adadad",
    labelFontColor: "#000000",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#adadad",
    outputBorderColor: "#ffffff",
    outputFontColor: "#000000",
    panelBackgroundColor: "#adadad",
    panelBorderColor: "#545454",
    panelGradientColor: "#979595",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#d1d1d1",
    sliderOutlineColor: "#ebebeb",
    sliderThumbColor: "#4d4d4d",
    textColor: "#000000",
    whiteKeysColour: "#707070",
    wordSpacingSlider: "0",
    gradientsEnabled: false,
  },
  "Twist Plain": {
    backgroundColor: "#ffffff",
    blackKeysColour: "#ffffff",
    boldSelect: "normal",
    borderColor: "#e6e6e6",
    borderRadiusSlider: "5",
    borderThicknessSlider: "1",
    buttonBackgroundColor: "#d1d1d1",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#000000",
    focusSizeSlider: "3",
    fontFamilySelect: "Gill Sans",
    fontSizeSelect: "26",
    fontStyleSelect: "normal",
    fontVariantSelect: "small-caps",
    groupBackgroundColor: "#969696",
    keyFontColour: "#000000",
    knobDesignSelect: "twist",
    labelBackgroundColor: "#ffffff",
    labelBorderColor: "#262626",
    labelFontColor: "#000000",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#ffffff",
    outputBorderColor: "#ffffff",
    outputFontColor: "#000000",
    panelBackgroundColor: "#ffffff",
    panelBorderColor: "#545454",
    panelGradientColor: "#979595",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#000000",
    sliderOutlineColor: "#919191",
    sliderThumbColor: "#000000",
    textColor: "#000000",
    whiteKeysColour: "#000000",
    wordSpacingSlider: "0",
    gradientsEnabled: true,
  },
  "Flat Large Font": {
    backgroundColor: "#c9d9d2",
    blackKeysColour: "#ffffff",
    boldSelect: "normal",
    borderColor: "#575757",
    borderRadiusSlider: "10",
    borderThicknessSlider: "5",
    buttonBackgroundColor: "#80a39a",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#000000",
    focusSizeSlider: "5",
    fontFamilySelect: "Gill Sans",
    fontSizeSelect: "34",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#969696",
    keyFontColour: "#000000",
    knobDesignSelect: "flat",
    labelBackgroundColor: "#ffffff",
    labelBorderColor: "#262626",
    labelFontColor: "#000000",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#ffffff",
    outputBorderColor: "#ffffff",
    outputFontColor: "#000000",
    panelBackgroundColor: "#abc4b4",
    panelBorderColor: "#424242",
    panelGradientColor: "#7c9289",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#ffffff",
    sliderOutlineColor: "#000000",
    sliderThumbColor: "#f7f3f3",
    textColor: "#000000",
    whiteKeysColour: "#000000",
    wordSpacingSlider: "0",
    gradientsEnabled: false,
  },
  "Shadow Light": {
    backgroundColor: "#ffffff",
    blackKeysColour: "#ffffff",
    boldSelect: "normal",
    borderColor: "#ededed",
    borderRadiusSlider: "5",
    borderThicknessSlider: "1",
    buttonBackgroundColor: "#ffffff",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#000000",
    focusSizeSlider: "3",
    fontFamilySelect: "Tahoma",
    fontSizeSelect: "26",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#969696",
    keyFontColour: "#000000",
    knobDesignSelect: "shadow",
    labelBackgroundColor: "#ffffff",
    labelBorderColor: "#ffffff",
    labelFontColor: "#000000",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#ffffff",
    outputBorderColor: "#ffffff",
    outputFontColor: "#000000",
    panelBackgroundColor: "#ffffff",
    panelBorderColor: "#b5b5b5",
    panelGradientColor: "#f0f0f0",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#000000",
    sliderOutlineColor: "#000000",
    sliderThumbColor: "#bababa",
    textColor: "#000000",
    whiteKeysColour: "#000000",
    wordSpacingSlider: "0",
    gradientsEnabled: false,
  },
  "Outline Dark": {
    backgroundColor: "#000000",
    blackKeysColour: "#000000",
    boldSelect: "bold",
    borderColor: "#ffffff",
    borderRadiusSlider: "15",
    borderThicknessSlider: "4",
    buttonBackgroundColor: "#ffffff",
    buttonBorderColor: "#ffffff",
    buttonFontColor: "#000000",
    focusColor: "#ff0000",
    focusSizeSlider: "6",
    fontFamilySelect: "Gill Sans",
    fontSizeSelect: "18",
    fontStyleSelect: "normal",
    fontVariantSelect: "small-caps",
    groupBackgroundColor: "#969696",
    keyFontColour: "#ffffff",
    knobDesignSelect: "outline",
    labelBackgroundColor: "#000000",
    labelBorderColor: "#000000",
    labelFontColor: "#ffffff",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#ffffff",
    outputBorderColor: "#ffffff",
    outputFontColor: "#000000",
    panelBackgroundColor: "#000000",
    panelBorderColor: "#ffffff",
    panelGradientColor: "#f0f0f0",
    selectBackgroundColor: "#000000",
    selectBorderColor: "#ffffff",
    selectFontColor: "#ffffff",
    sliderColor: "#ffffff",
    sliderOutlineColor: "#ffffff",
    sliderThumbColor: "#ffffff",
    textColor: "#ffffff",
    whiteKeysColour: "#ffffff",
    wordSpacingSlider: "0",
    gradientsEnabled: false,
  },
  "Simple Dark Bold": {
    backgroundColor: "#000000",
    blackKeysColour: "#ffffff",
    boldSelect: "bold",
    borderColor: "#9f9d9d",
    borderRadiusSlider: "10",
    borderThicknessSlider: "2",
    buttonBackgroundColor: "#cfcfcf",
    buttonBorderColor: "#000000",
    buttonFontColor: "#000000",
    focusColor: "#FFFFFF",
    focusSizeSlider: "8",
    fontFamilySelect: "Tahoma",
    fontSizeSelect: "26",
    fontStyleSelect: "normal",
    fontVariantSelect: "normal",
    groupBackgroundColor: "#00ff04",
    keyFontColour: "#000000",
    knobDesignSelect: "simple",
    labelBackgroundColor: "#ffffff",
    labelBorderColor: "#b0b0b0",
    labelFontColor: "#000000",
    letterSpacingSlider: "0",
    lineSpacingSlider: "1",
    outputBackgroundColor: "#000000",
    outputBorderColor: "#ffffff",
    outputFontColor: "#ffffff",
    panelBackgroundColor: "#333c57",
    panelBorderColor: "#ebebeb",
    panelGradientColor: "#7185f9",
    selectBackgroundColor: "#ffffff",
    selectBorderColor: "#000000",
    selectFontColor: "#000000",
    sliderColor: "#000000",
    sliderOutlineColor: "#ffffff",
    sliderThumbColor: "#ffffff",
    textColor: "#ffffff",
    whiteKeysColour: "#000000",
    wordSpacingSlider: "0",
    gradientsEnabled: true,
  },
};
