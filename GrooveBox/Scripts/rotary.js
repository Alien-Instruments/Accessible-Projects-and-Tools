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
    const step = parseFloat(this.$rangeInput.attr("step")) || 1;
    const currentValue = parseFloat(this.$rangeInput.val());
    let multiplier = 1;

    // Hardcoded modifiers
    if (event.shiftKey) multiplier *= 10;
    if (event.ctrlKey) multiplier *= 10;

    let newValue = currentValue;

    switch (event.keyCode) {
      case 37: // Left
      case 40: // Down
        event.preventDefault();
        newValue -= step * multiplier;
        break;
      case 38: // Up
      case 39: // Right
        event.preventDefault();
        newValue += step * multiplier;
        break;
      default:
        return;
    }

    // Clamp within min/max
    newValue = Math.max(this.minValue, Math.min(this.maxValue, newValue));

    this.$rangeInput
      .val(newValue)[0]
      .dispatchEvent(new Event("input", { bubbles: true }));

    this.rotateKnob(newValue);
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

$(".range-knob-wrapper").rangeKnob();
