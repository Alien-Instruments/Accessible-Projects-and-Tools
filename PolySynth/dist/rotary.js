document.addEventListener("DOMContentLoaded", function () {
  const rangeInputs = document.querySelectorAll('input[type="range"]');

  rangeInputs.forEach(function (rangeInput) {
    rangeInput.addEventListener("dblclick", function () {
      resetToDefault(this);
    });
  });

  function resetToDefault(input) {
    input.value = input.defaultValue;
    updateAriaAttributes(input);
    triggerInputEvent(input);
  }

  function triggerInputEvent(input) {
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(inputEvent);
  }

  function updateAriaAttributes(input) {
    input.setAttribute("aria-valuenow", input.value);
    input.setAttribute("aria-valuetext", input.value);
    input.setAttribute("aria-valuemin", input.min);
    input.setAttribute("aria-valuemax", input.max);
  }

  document.addEventListener("keydown", function (event) {
    const focusedInput = document.activeElement;
    if (focusedInput && focusedInput.type === "range") {
      handleKeyEvent(event, focusedInput);
    }
  });

  function handleKeyEvent(event, input) {
    let handled = false;
    const numberKey0 = document
      .getElementById("numberKey0")
      .value.charCodeAt(0);
    const numberKey1 = document
      .getElementById("numberKey1")
      .value.charCodeAt(0);
    const numberKey2 = document
      .getElementById("numberKey2")
      .value.charCodeAt(0);

    switch (event.keyCode) {
      case numberKey0:
        resetToDefault(input);
        handled = true;
        break;
      case numberKey1:
        input.value = input.min;
        updateAriaAttributes(input);
        triggerInputEvent(input);
        handled = true;
        break;
      case numberKey2:
        input.value = input.max;
        updateAriaAttributes(input);
        triggerInputEvent(input);
        handled = true;
        break;
    }
    if (handled) {
      event.preventDefault();
    }
  }
});

var RangeKnob = function (element) {
  this.$element = $(element);
  this.$rangeInput = this.$element.find('input[type="range"]');
  this.$knob = this.$element.find(".range-knob");
  this.minValue = parseFloat(this.$rangeInput.attr("min"));
  this.maxValue = parseFloat(this.$rangeInput.attr("max"));
  this.defaultValue = this.$rangeInput.val();
  this.init();
};

RangeKnob.prototype = {
  init: function () {
    this.rotateKnob(this.$rangeInput.val());
    this.$rangeInput.on("input", _.bind(this.inputHandler, this));
    this.$rangeInput.on("keydown", _.bind(this.keydownHandler, this));
    this.$rangeInput.on("dblclick", _.bind(this.resetToDefault, this));
    this.updateAriaAttributes();
  },

  inputHandler: function () {
    var value = this.$rangeInput.val();
    this.rotateKnob(value);
    this.updateAriaAttributes();
  },

  keydownHandler: function (event) {
    const modifier1 = document.getElementById("modifier1").value;
    const modifier2 = document.getElementById("modifier2").value;
    var step = parseFloat(this.$rangeInput.attr("step"));
    var currentValue = parseFloat(this.$rangeInput.val());
    var multiplier = 1;
    var newValue;

    if (event[modifier1]) {
      multiplier *= 10;
    }
    if (event[modifier2]) {
      multiplier *= 10;
    }

    switch (event.keyCode) {
      case 37: // Left arrow
      case 40: // Down arrow
        event.preventDefault();
        newValue = Math.max(this.minValue, currentValue - step * multiplier);
        break;
      case 38: // Up arrow
      case 39: // Right arrow
        event.preventDefault();
        newValue = Math.min(this.maxValue, currentValue + step * multiplier);
        break;
      case 48: // '0' key
        this.resetToDefault();
        break;
      case 49: // '1' key
        newValue = this.minValue;
        break;
      case 50: // '2' key
        newValue = this.maxValue;
        break;
      default:
        return;
    }

    if (newValue !== undefined) {
      this.$rangeInput.val(newValue).trigger("input");
    }
  },

  resetToDefault: function () {
    this.$rangeInput.val(this.defaultValue).trigger("input");
  },

  rotateKnob: function (rotation) {
    var calculatedRotation =
      ((rotation - this.minValue) / (this.maxValue - this.minValue)) * 270 -
      135;
    this.$knob.css("transform", "rotate(" + calculatedRotation + "deg)");
  },

  updateAriaAttributes: function () {
    var value = this.$rangeInput.val();
    this.$rangeInput.attr("aria-valuenow", value);
    this.$rangeInput.attr("aria-valuetext", value);
    this.$rangeInput.attr("aria-valuemin", this.minValue);
    this.$rangeInput.attr("aria-valuemax", this.maxValue);
  },
};

$.fn.rangeKnob = function () {
  this.each(function () {
    new RangeKnob(this);
  });
};

$(
  ".range-knob-wrapper, .second-knob-wrapper, .third-knob-wrapper, .fourth-knob-wrapper"
).rangeKnob();
