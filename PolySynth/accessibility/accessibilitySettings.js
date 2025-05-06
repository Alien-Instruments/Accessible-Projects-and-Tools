// Page and UI element colouring
//========================================================
let textColorPicker;
const defaultColor = "#FFFFFF";
let buttonBackgroundColorPicker;
const defaultButtonBackgroundColor = "#00008b";
let buttonBorderPicker;
const defaultButtonBorder = "#FFFFFF";
let buttonFontPicker;
const buttonFontDefault = "#FFFFFF";
let backgroundPicker;
const backgroundDefault = "#000000";
let borderPicker;
const defaultBorderColor = "#FFFFFF";
let sliderColorPicker;
const sliderColorDefault = "#ffffff";
let sliderThumbColorPicker;
const sliderThumbColorDefault = "#ff0000";
let sliderOutlineColorPicker;
const sliderOutlineColorDefault = "#808080";
let focusColorPicker;
const defaultFocusColor = "#00FF00";
let labelBackgroundPicker;
const defaultLabelBackground = "#000000";
let labelBorderPicker;
const defaultLabelBorderColor = "#ffffff";
let labelFontPicker;
const defaultLabelFontColor = "#ffffff";
let outputBackgroundPicker;
const defaultOutputBackgroundColor = "#000000";
let outputBorderPicker;
const defaultOutputBoderColor = "#ffffff";
let outputFontPicker;
const defaultOutputFontColor = "#ffffff";
let selectBackgroundPicker;
const defaultSelectBackgroundColor = "#000000";
let selectBorderPicker;
const defaultSelectBorderColor = "#ffffff";
let selectFontPicker;
const defaultSelectFontColor = "#ffffff";
let panelBackgroundPicker;
const defaultPanelBackgroundColor = "#ffffff";
let panelGradientPicker;
const defaultPanelGradientColor = "#C5C4C4";
let panelBorderPicker;
const defaultPanelBorderColor = "#ffffff";

//virtual keyboard
let whiteKeysColourPicker;
const whiteKeysColourDefault = "#C5C4C4";
let blackKeysColourPicker;
const blackKeysColourDefault = "#1F1F1F";
let keyFontColourPicker;
const keyFontColourDefault = "#8a5555";

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

function updateFont(selectedFont) {
  const textElements = $(
    "body, th, h1, h2, h3, p, span, div, select, button, input[type='text']"
  );
  textElements.css(
    "font-family",
    selectedFont === "CustomFont" ? "OpenDyslexic, sans-serif" : selectedFont
  );
}

function toggleBold(isBold) {
  const textElements = $(
    "h1, h2, th, p, span, div, label, select, button, input[type='text']"
  );
  textElements.css("font-weight", isBold ? "bold" : "normal");
}

function applyFontStyle(style) {
  const textElements = $(
    "h1, h2, th, p, span, div, label, select, button, input[type='text']"
  );
  textElements.css({
    "font-style": "normal",
    "text-decoration": "none",
  });
  switch (style) {
    case "italic":
      textElements.css("font-style", "italic");
      break;
    case "underline":
      textElements.css("text-decoration", "underline");
      break;
    default:
      break;
  }
}

function applyFontVariant(variant) {
  const textElements = $(
    "h1, h2, th, p, span, div, label, select, button, input[type='text']"
  );
  textElements.css("font-variant", variant);
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

  borderRadiusSlider.on("input", function () {
    const borderRadius = this.value + "px";
    saveSliderValueToLocalStorage(this.id, this.value);
    updateBorderRadius(borderRadius);
  });
});

function saveFontSizeToLocalStorage(size) {
  localStorage.setItem("selectedFontSize2", size);
}

function saveBoldToLocalStorage(isBold) {
  localStorage.setItem("selectedBold2", isBold);
}

function saveFontStyleToLocalStorage(style) {
  localStorage.setItem("selectedFontStyle2", style);
}

function saveFontVariantToLocalStorage(variant) {
  localStorage.setItem("selectedFontVariant2", variant);
}

function saveFontFamilyToLocalStorage(font) {
  localStorage.setItem("selectedFontFamily2", font);
}

function saveSliderValueToLocalStorage(sliderId, value) {
  localStorage.setItem(sliderId, value);
}

function applyFontSize(size) {
  const textElements = $(
    "p, th, span, div, label, button, select, input[type='text']"
  );
  textElements.css("font-size", size + "px");
}

$(document).ready(function () {
  retrieveFontSizeFromLocalStorage();
  retrieveBoldFromLocalStorage();
  retrieveFontStyleFromLocalStorage();
  retrieveFontVariantFromLocalStorage();
  retrieveFontFamilyFromLocalStorage();
});

function retrieveFontSizeFromLocalStorage() {
  const savedFontSize = localStorage.getItem("selectedFontSize2");
  if (savedFontSize) {
    applyFontSize(savedFontSize);
  }
}

function retrieveBoldFromLocalStorage() {
  const savedBold = localStorage.getItem("selectedBold2");
  if (savedBold) {
    toggleBold(savedBold === "true");
  }
}

function retrieveFontStyleFromLocalStorage() {
  const savedFontStyle = localStorage.getItem("selectedFontStyle2");
  if (savedFontStyle) {
    applyFontStyle(savedFontStyle);
  }
}

function retrieveFontVariantFromLocalStorage() {
  const savedFontVariant = localStorage.getItem("selectedFontVariant2");
  if (savedFontVariant) {
    applyFontVariant(savedFontVariant);
  }
}

function retrieveFontFamilyFromLocalStorage() {
  const savedFontFamily = localStorage.getItem("selectedFontFamily2");
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

function applySliderValue(sliderId, value) {
  switch (sliderId) {
    case "focus-size-slider":
      updateFocusSize(value + "px");
      break;
    case "border-radius-slider":
      updateBorderRadius(value + "px");
      break;
    case "line-spacing-slider":
      applyStyleToClass("target-class", "lineHeight", parseFloat(value));
      break;
    case "letter-spacing-slider":
      applyStyleToClass("letterSpacing", "letterSpacing", value + "em");
      break;
    case "word-spacing-slider":
      applyStyleToClass("wordSpacing", "wordSpacing", value + "em");
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
    localStorage.getItem("panelBorderColor") || defaultSelectFontColor
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

$("#knob-design-select").on("change", function () {
  const selectedDesign = this.value;
  saveKnobDesignToLocalStorage(selectedDesign);
  applyKnobDesign(selectedDesign);
});

function saveKnobDesignToLocalStorage(design) {
  localStorage.setItem("selectedKnobDesign", design);
}

function applyKnobDesign(design) {
  const knobWrappers = $(".range-knob-wrapper");
  knobWrappers.removeClass(
    "classic minimal fancy retro modern neon flat shadow outline glow"
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

const toggleGradients = $("#toggle-gradients");

toggleGradients.on("change", function () {
  const elementsWithGradients = $(".center");

  elementsWithGradients.each(function () {
    if (toggleGradients.is(":checked")) {
      $(this).addClass("no-gradient");
    } else {
      $(this).removeClass("no-gradient");
    }
  });

  const elementsWithGradients2 = $(".center2");

  elementsWithGradients2.each(function () {
    if (toggleGradients.is(":checked")) {
      $(this).addClass("no-gradient");
    } else {
      $(this).removeClass("no-gradient");
    }
  });

  // Store toggle state in local storage
  localStorage.setItem("gradientsEnabled", toggleGradients.is(":checked"));
});

// Function to retrieve toggle state from local storage
function retrieveToggleStateFromLocalStorage() {
  const gradientsEnabled = localStorage.getItem("gradientsEnabled");
  if (gradientsEnabled !== null) {
    toggleGradients.prop("checked", gradientsEnabled === "true");
    // Trigger change event to apply toggle state
    toggleGradients.trigger("change");
  }
}

// Call the function to retrieve toggle state when the page loads
$(document).ready(function () {
  retrieveToggleStateFromLocalStorage();
});

//presets===================================================
$(document).ready(function () {
  // Define factory presets
  const factoryPresets = [
    {
      name: "Classic Dark",
      settings: {
        textColor: "#FFFFFF",
        buttonBackgroundColor: "#000000",
        buttonBorder: "#FFFFFF",
        buttonFont: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF",
        sliderColor: "#808080",
        sliderThumbColor: "#FF0000",
        sliderOutlineColor: "#808080",
        focusColor: "#00FF00",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#000000",
        labelBackground: "#000000",
        labelBorder: "#FFFFFF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#FFFFFF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#FFFFFF",
        selectFont: "#FFFFFF",
        panelBackground: "#000000",
        panelGradient: "#808080",
        panelBorder: "#FFFFFF",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "4",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "18",
          "bold-select": "normal",
          "font-family-select": "Arial",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "classic",
        },
        toggleGradients: false,
      },
    },
    {
      name: "Minimal Monochrome",
      settings: {
        textColor: "#030303",
        buttonBackgroundColor: "#221FD1",
        buttonBorder: "#030303",
        buttonFont: "#F1E9E9",
        backgroundColor: "#BCB8B8",
        borderColor: "#030303",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#DBD7D7",
        sliderOutlineColor: "#606060",
        focusColor: "#030303",
        whiteKeysColour: "#A0A0A0",
        blackKeysColour: "#707070",
        keyFontColour: "#909090",
        labelBackground: "#303030",
        labelBorder: "#505050",
        labelFont: "#E6E6E6",
        outputBackground: "#303030",
        outputBorder: "#505050",
        outputFont: "#E6E6E6",
        selectBackground: "#030303",
        selectBorder: "#505050",
        selectFont: "#EAE6E6",
        panelBackground: "#303030",
        panelGradient: "#404040",
        panelBorder: "#707070",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "4",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "18",
          "bold-select": "normal",
          "font-family-select": "Verdana",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "minimal",
        },
        toggleGradients: true,
      },
    },
    {
      name: "Fancy Blue",
      settings: {
        textColor: "#000000",
        buttonBackgroundColor: "#5A74DD",
        buttonBorder: "#000000",
        buttonFont: "#000000",
        backgroundColor: "#B3D7FF",
        borderColor: "#000000",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#747272",
        sliderOutlineColor: "#000000",
        focusColor: "#001EFF",
        whiteKeysColour: "#A0A0A0",
        blackKeysColour: "#707070",
        keyFontColour: "#909090",
        labelBackground: "#5A74DD",
        labelBorder: "#000000",
        labelFont: "#000000",
        outputBackground: "#5A74DD",
        outputBorder: "#000000",
        outputFont: "#000000",
        selectBackground: "#5A74DD",
        selectBorder: "#000000",
        selectFont: "#000000",
        panelBackground: "#DFD7D7",
        panelGradient: "#2D38C8",
        panelBorder: "#707070",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "4",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "18",
          "bold-select": "normal",
          "font-family-select": "Verdana",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "fancy",
        },
        toggleGradients: false,
      },
    },
    {
      name: "Retro Dark",
      settings: {
        textColor: "#FFFFFF",
        buttonBackgroundColor: "#A6A6A6",
        buttonBorder: "#FFFFFF",
        buttonFont: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF",
        sliderColor: "#242829",
        sliderThumbColor: "#18689A",
        sliderOutlineColor: "#D6D1D1",
        focusColor: "#00FF00",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#969292",
        labelBackground: "#000000",
        labelBorder: "#FFFFFF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#FFFFFF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#FFFFFF",
        selectFont: "#FFFFFF",
        panelBackground: "#000000",
        panelGradient: "#808080",
        panelBorder: "#FFFFFF",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "4",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "32",
          "bold-select": "bold",
          "font-family-select": "Geneva",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "retro",
        },
        toggleGradients: true,
      },
    },
    {
      name: "Modern",
      settings: {
        textColor: "#FFFFFF",
        buttonBackgroundColor: "#434AAD",
        buttonBorder: "#FFFFFF",
        buttonFont: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#5A5858",
        sliderOutlineColor: "#2E2E2E",
        focusColor: "#FFFFFF",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#969292",
        labelBackground: "#000000",
        labelBorder: "#FFFFFF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#FFFFFF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#FFFFFF",
        selectFont: "#FFFFFF",
        panelBackground: "#8781BB",
        panelGradient: "#6963BB",
        panelBorder: "#FFFFFF",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "4",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "26",
          "bold-select": "bold",
          "font-family-select": "Tahoma",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "modern",
        },
        toggleGradients: false,
      },
    },
    {
      name: "Neon",
      settings: {
        textColor: "#00FF1E",
        buttonBackgroundColor: "#000000",
        buttonBorder: "#00FF1E",
        buttonFont: "#00FF1E",
        backgroundColor: "#000000",
        borderColor: "#00FF1E",
        sliderColor: "#00FF1E",
        sliderThumbColor: "#5A5858",
        sliderOutlineColor: "#00FF1E",
        focusColor: "#00FF1E",
        whiteKeysColour: "#00FF33",
        blackKeysColour: "#2AC615",
        keyFontColour: "#058F07",
        labelBackground: "#000000",
        labelBorder: "#00FF1E",
        labelFont: "#00FF1E",
        outputBackground: "#000000",
        outputBorder: "#00FF1E",
        outputFont: "#00FF1E",
        selectBackground: "#000000",
        selectBorder: "#00FF1E",
        selectFont: "#00FF1E",
        panelBackground: "#000000",
        panelGradient: "#084F09",
        panelBorder: "#00FF1E",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "6",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "26",
          "bold-select": "bold",
          "font-family-select": "Gill Sans",
          "font-style-select": "normal",
          "font-variant-select": "small-caps",
          "knob-design-select": "neon",
        },
        toggleGradients: false,
      },
    },
    {
      name: "Flat Monochrome",
      settings: {
        textColor: "#B5B5B5",
        buttonBackgroundColor: "#A9A7A7",
        buttonBorder: "#FFFFFF",
        buttonFont: "#000000",
        backgroundColor: "#000000",
        borderColor: "#FFFFFF",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#5A5858",
        sliderOutlineColor: "#FFFFFF",
        focusColor: "#FFFFFF",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#636363",
        labelBackground: "#000000",
        labelBorder: "#FFFFFF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#FFFFFF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#FFFFFF",
        selectFont: "#FFFFFF",
        panelBackground: "#000000",
        panelGradient: "#084F09",
        panelBorder: "#FFFFFF",
        sliders: {
          "border-radius-slider": "15",
          "focus-size-slider": "6",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "32",
          "bold-select": "bold",
          "font-family-select": "Helvetica",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "flat",
        },
        toggleGradients: true,
      },
    },
    {
      name: "Shadow Light",
      settings: {
        textColor: "#000000",
        buttonBackgroundColor: "#0BAEF4",
        buttonBorder: "#000000",
        buttonFont: "#000000",
        backgroundColor: "#F6F4F4",
        borderColor: "#000000",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#E87373",
        sliderOutlineColor: "#000000",
        focusColor: "#E9OCOC",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#636363",
        labelBackground: "#E8E8E8",
        labelBorder: "#000000",
        labelFont: "#000000",
        outputBackground: "#E8E8E8",
        outputBorder: "#000000",
        outputFont: "#000000",
        selectBackground: "#E8E8E8",
        selectBorder: "#000000",
        selectFont: "#000000",
        panelBackground: "#FFFFFF",
        panelGradient: "#BBB9B9",
        panelBorder: "#000000",
        sliders: {
          "border-radius-slider": "12",
          "focus-size-slider": "3",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "32",
          "bold-select": "bold",
          "font-family-select": "Arial Narrow",
          "font-style-select": "normal",
          "font-variant-select": "normal",
          "knob-design-select": "shadow",
        },
        toggleGradients: false,
      },
    },
    {
      name: "Outline Dark",
      settings: {
        textColor: "#E3E3E3",
        buttonBackgroundColor: "#212121",
        buttonBorder: "#0008FF",
        buttonFont: "#FFFFFF",
        backgroundColor: "#000000",
        borderColor: "#0008FF",
        sliderColor: "#FFFFFF",
        sliderThumbColor: "#7573E8",
        sliderOutlineColor: "#FFFFFF",
        focusColor: "#00BFFF",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#636363",
        labelBackground: "#000000",
        labelBorder: "#0008FF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#0008FF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#0008FF",
        selectFont: "#FFFFFF",
        panelBackground: "#000000",
        panelGradient: "#BBB9B9",
        panelBorder: "#0008FF",
        sliders: {
          "border-radius-slider": "10",
          "focus-size-slider": "8",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "18",
          "bold-select": "normal",
          "font-family-select": "Trebuchet MS",
          "font-style-select": "normal",
          "font-variant-select": "small-caps",
          "knob-design-select": "outline",
        },
        toggleGradients: true,
      },
    },
    {
      name: "Glow Dark",
      settings: {
        textColor: "#FFFFFF",
        buttonBackgroundColor: "#5A5858",
        buttonBorder: "#FFFFFF",
        buttonFont: "#FFFFFF",
        backgroundColor: "#2B2B2B",
        borderColor: "#FFFFFF",
        sliderColor: "#00C8D6",
        sliderThumbColor: "#454545",
        sliderOutlineColor: "#00C8D6",
        focusColor: "#E0A500",
        whiteKeysColour: "#FFFFFF",
        blackKeysColour: "#000000",
        keyFontColour: "#636363",
        labelBackground: "#000000",
        labelBorder: "#FFFFFF",
        labelFont: "#FFFFFF",
        outputBackground: "#000000",
        outputBorder: "#FFFFFF",
        outputFont: "#FFFFFF",
        selectBackground: "#000000",
        selectBorder: "#FFFFFF",
        selectFont: "#FFFFFF",
        panelBackground: "#000000",
        panelGradient: "#403F3F",
        panelBorder: "#FFFFFF",
        sliders: {
          "border-radius-slider": "4",
          "focus-size-slider": "8",
          "letter-spacing-slider": "0",
          "word-spacing-slider": "0",
        },
        selects: {
          "font-size-select": "18",
          "bold-select": "normal",
          "font-family-select": "Gill Sans",
          "font-style-select": "normal",
          "font-variant-select": "small-caps",
          "knob-design-select": "glow",
        },
        toggleGradients: false,
      },
    },
  ];

  // Load factory presets into localStorage
  factoryPresets.forEach(function (preset) {
    localStorage.setItem(
      `factory_${preset.name}`,
      JSON.stringify(preset.settings)
    );
  });

  // Populate the preset list
  populatePresetList();

  // Retrieve and apply the saved preset when the page loads
  loadSelectedPreset();

  $("#save-preset").click(function () {
    const presetName = $("#preset-name").val().trim();
    if (presetName) {
      savePreset(presetName);
      populatePresetList();
      $("#preset-name").val("");
    } else {
      alert("Please enter a preset name.");
    }
  });

  $("#preset-list").change(function () {
    const presetName = $(this).val();
    if (presetName) {
      loadPreset(presetName);
      localStorage.setItem("selectedPreset", presetName); // Save selected preset to local storage
    }
  });

  // Call the function to retrieve toggle state when the page loads
  retrieveToggleStateFromLocalStorage();
});

function loadSelectedPreset() {
  const selectedPreset = localStorage.getItem("selectedPreset");
  if (selectedPreset) {
    $("#preset-list").val(selectedPreset);
    loadPreset(selectedPreset);
  }
}

function savePreset(presetName) {
  const settings = {
    textColor: $("#color-picker").val(),
    buttonBackgroundColor: $("#color-picker-5").val(),
    buttonBorder: $("#button-border-picker").val(),
    buttonFont: $("#button-font-picker").val(),
    backgroundColor: $("#color-picker-2").val(),
    borderColor: $("#border-picker").val(),
    sliderColor: $("#color-picker-4").val(),
    sliderThumbColor: $("#color-picker-3").val(),
    sliderOutlineColor: $("#slider-outline-picker").val(),
    focusColor: $("#focus-color-picker").val(),
    whiteKeysColour: $("#white-keys-colour-picker").val(),
    blackKeysColour: $("#black-keys-colour-picker").val(),
    keyFontColour: $("#key-font-colour-picker").val(),
    labelBackground: $("#label-background-picker").val(),
    labelBorder: $("#label-border-picker").val(),
    labelFont: $("#label-font-picker").val(),
    outputBackground: $("#output-background-picker").val(),
    outputBorder: $("#output-border-picker").val(),
    outputFont: $("#output-font-picker").val(),
    selectBackground: $("#select-background-picker").val(),
    selectBorder: $("#select-border-picker").val(),
    selectFont: $("#select-font-picker").val(),
    panelBackground: $("#panel-background-picker").val(),
    panelGradient: $("#panel-gradient-picker").val(),
    panelBorder: $("#panel-border-picker").val(),
    sliders: {},
    selects: {},
    toggleGradients: $("#toggle-gradients").is(":checked"),
  };

  // Save slider values
  $("input[type='range']").each(function () {
    settings.sliders[this.id] = $(this).val();
  });

  // Save select values
  $("select").each(function () {
    settings.selects[this.id] = $(this).val();
  });

  localStorage.setItem(`preset_${presetName}`, JSON.stringify(settings));
}

function loadPreset(presetName) {
  let settings;
  if (presetName.startsWith("factory_")) {
    // Load from factory presets
    settings = JSON.parse(localStorage.getItem(presetName));
  } else {
    // Load from user presets
    settings = JSON.parse(localStorage.getItem(`preset_${presetName}`));
  }

  if (settings) {
    $("#color-picker").val(settings.textColor);
    $("#color-picker-5").val(settings.buttonBackgroundColor);
    $("#button-border-picker").val(settings.buttonBorder);
    $("#button-font-picker").val(settings.buttonFont);
    $("#color-picker-2").val(settings.backgroundColor);
    $("#border-picker").val(settings.borderColor);
    $("#color-picker-4").val(settings.sliderColor);
    $("#color-picker-3").val(settings.sliderThumbColor);
    $("#slider-outline-picker").val(settings.sliderOutlineColor);
    $("#focus-color-picker").val(settings.focusColor);
    $("#white-keys-colour-picker").val(settings.whiteKeysColour);
    $("#black-keys-colour-picker").val(settings.blackKeysColour);
    $("#key-font-colour-picker").val(settings.keyFontColour);
    $("#label-background-picker").val(settings.labelBackground);
    $("#label-border-picker").val(settings.labelBorder);
    $("#label-font-picker").val(settings.labelFont);
    $("#output-background-picker").val(settings.outputBackground);
    $("#output-border-picker").val(settings.outputBorder);
    $("#output-font-picker").val(settings.outputFont);
    $("#select-background-picker").val(settings.selectBackground);
    $("#select-border-picker").val(settings.selectBorder);
    $("#select-font-picker").val(settings.selectFont);
    $("#panel-background-picker").val(settings.panelBackground);
    $("#panel-gradient-picker").val(settings.panelGradient);
    $("#panel-border-picker").val(settings.panelBorder);

    // Load slider values
    $.each(settings.sliders, function (id, value) {
      $(`#${id}`).val(value);
      applySliderValue(id, value); // Apply the value immediately
    });

    // Load select values
    $.each(settings.selects, function (id, value) {
      $(`#${id}`).val(value).trigger("change");
    });

    // Load toggle state
    $("#toggle-gradients")
      .prop("checked", settings.toggleGradients)
      .trigger("change");

    updateSliderColors();
    updateFocusColor();
    updateScrollbarColors();
  } else {
    alert("Preset not found.");
  }
}

function populatePresetList() {
  const presetList = $("#preset-list");
  presetList.empty();
  presetList.append('<option value="">Select a preset</option>');

  // Add user-defined presets
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("preset_")) {
      const presetName = key.replace("preset_", "");
      presetList.append(`<option value="${presetName}">${presetName}</option>`);
    }
  }

  // Add factory presets
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("factory_")) {
      const presetName = key.replace("factory_", "");
      presetList.append(
        `<option value="factory_${presetName}">${presetName}</option>`
      );
    }
  }
}

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
    buttonText === "Show Interface Settings"
      ? "Hide Interface Settings"
      : "Show Interface Settings"
  );
});
