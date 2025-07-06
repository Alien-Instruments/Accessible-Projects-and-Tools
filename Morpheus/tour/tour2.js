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

document.addEventListener("DOMContentLoaded", function () {
  //add a step for each element in the tour. add clickOnFocus: true, to click buttons/open menus
  const tourSteps = [
    {
      title: "Welcome to Alien Instruments Morpheus",
      text: "This tour will guide you through the main features.",
      attachTo: "h1",
    },
    {
      title: "Show Interface Settings",
      text: "Click this button to show the interface settings.",
      attachTo: "#toggleAccess",
      clickOnFocus: true, // Custom attribute to indicate the button should be clicked on focus
    },
    {
      title: "Access Preset Manager",
      text: "This is where you can load factory colour presets. You can also save your own presets, we recomend you do this after making changes so you can keep them for later.",
      attachTo: ".preset-tour",
    },
    {
      title: "Preset Name",
      text: "Type the name for your preset here.",
      attachTo: "#preset-name",
    },
    {
      title: "Save Preset Button",
      text: "When you have added a name for your preset click this button to save it.",
      attachTo: "#save-preset-btn",
    },
    {
      title: "Preset List",
      text: "Click on an option to load the preset. The factory presets demonstrate each slider style with suggested colour styles, including monochromatic designs.",
      attachTo: "#preset-list",
    },
    {
      title: "Delete Preset Button",
      text: "Use this button to delete selected preset. Only user presets can be deleted",
      attachTo: "#delete-preset-btn",
    },
    {
      title: "Font Size",
      text: "Here you can adjust the font size.",
      attachTo: "#font-size-select",
    },
    {
      title: "Bold Font",
      text: "Use normal or bold font.",
      attachTo: "#bold-select",
    },
    {
      title: "Font Family",
      text: "Here you can choose your preferred font.",
      attachTo: "#font-family-select",
    },
    {
      title: "Font Style",
      text: "Select your preferred font style. Normal, Italic and Underline.",
      attachTo: "#font-style-select",
    },
    {
      title: "Font Variant",
      text: "Select small caps, displays all letters as capital letters and makes actual capitals larger.",
      attachTo: "#font-variant-select",
    },
    {
      title: "Letter Spacing",
      text: "Use this slider to set the spacing between letters.",
      attachTo: "#letter-tour",
    },
    {
      title: "Word Spacing",
      text: "Use this slider to set the spacing between words.",
      attachTo: "#word-tour",
    },
    {
      title: "Line Spacing",
      text: "Use this slider to set the spacing between lines.",
      attachTo: "#line-tour",
    },
    {
      title: "Colour Selection",
      text: "Below are colour pickers to set the page and control colours.",
      attachTo: ".pickers",
    },
    {
      title: "Page Colours",
      text: "Set the colours for the page background, borders, font and focus.",
      attachTo: "#page-tour",
    },
    {
      title: "Button Colours",
      text: "Set the colour of buttons and toggle buttons.",
      attachTo: "#button-tour",
    },
    {
      title: "Select Colours",
      text: "Set the colour of the drop down menus.",
      attachTo: "#select-tour",
    },
    {
      title: "Text Box Colours",
      text: "Set the colours of the text input box.",
      attachTo: "#popup-tour",
    },
    {
      title: "Slider Colour & Style",
      text: "Set the colours of the slider and choose a style.",
      attachTo: "#slider-tour",
    },
    {
      title: "Slider and Button Panel Colours",
      text: "Set the colours for the slider and button panels, use remove gradient toggle to turn of gradients.",
      attachTo: "#panel-tour",
    },
    {
      title: "Label Colours",
      text: "Set the colours of the labels.",
      attachTo: "#label-tour",
    },
    {
      title: "Output Colours",
      text: "Set the colours for the output that displays the sliders value.",
      attachTo: "#output-tour",
    },
    {
      title: "Border Radius",
      text: "Use this slider to add a radius to the corners of borders, labels, outputs and buttons.",
      attachTo: "#border-tour",
    },
    {
      title: "Border Thickness",
      text: "Use this slider to thicken the borders",
      attachTo: "#thickness-tour",
    },
    {
      title: "Focus Size",
      text: "Use this slider to set the size of the focus outline.",
      attachTo: "#focus-tour",
    },
    {
      title: "Hide Interface Settings",
      text: "Click this button to hide the interface settings.",
      attachTo: "#toggleAccess",
      clickOnFocus: true, // Custom attribute to indicate the button should be clicked on focus
    },
    {
      title: "Open The User Manual",
      text: "Opens the manual modal, click heading to reveal text.",
      attachTo: "#open-manual-btn",
    },
    {
      title: "Turn On/Off Musical Typing",
      text: "You can play note from your computer keyboard, use this button to disable musical typing.",
      attachTo: "#toggleMusicalTyping",
    },
    {
      title: "Open Shortcut Panel",
      text: "You can use this panel to edit all the keyboard shortcuts to suit your needs.",
      attachTo: "#open-shortcuts",
    },
    {
      title: "Show Audio Presets",
      text: "Use this button to show and hide the preset manager.",
      attachTo: "#toggle-audio-preset-controls",
      clickOnFocus: true,
    },
    {
      title: "Save Preset",
      text: "Use this button to name and save audio presets.",
      attachTo: "#open-audio-save-modal",
    },
    {
      title: "Export Saved Presets",
      text: "This allows you to export all saved presets and download as a .json file. Presets are stored in local storage, clearing browser history will delete them. This allows you to store localy.",
      attachTo: "#open-audio-export-modal",
    },
    {
      title: "Import Audio Presets",
      text: "Use this button to upload presets that have been exported.",
      attachTo: "#import-audio-label",
    },
    {
      title: "Preset List",
      text: "This is where you can load and delete stored presets.",
      attachTo: "#audio-preset-list",
    },
    {
      title: "Hide Audio Presets",
      text: "Hide the preset manager.",
      attachTo: "#toggle-audio-preset-controls",
      clickOnFocus: true,
    },
    {
      title: "Show MIDI Mapping Panel",
      text: "Use this button to show the MIDI mappings and presets.",
      attachTo: "#toggle-midi-learn",
      clickOnFocus: true,
    },
    {
      title: "Mapped Parameter List",
      text: "This is where mapped parameters are displayed. You can delete parameters with the remove buttons.",
      attachTo: "#midi-mapping-list",
    },
    {
      title: "Save Mapped Parameters",
      text: "Use this button to save mapping configurations as a preset.",
      attachTo: "#save-preset",
    },
    {
      title: "Export Saved Mappings",
      text: "You can use this button to export and download saved mappings locally.",
      attachTo: "#export-cc-btn",
    },
    {
      title: "Import Saved Mappings",
      text: "Use this button to import downloaded mapping presets.",
      attachTo: "#import-label",
    },
    {
      title: "Clear Current Mapped Parameters",
      text: "You can use this button to clear all current mapped parameters. This does not effect saved mapping presets.",
      attachTo: "#clear-mappings-btn",
    },
    {
      title: "Mapped Presets List",
      text: "This is where you saved mapping presets and be loaded or deleted.",
      attachTo: "#midi-preset-list",
    },
    {
      title: "Hide MIDI Mapping Panel",
      text: "Hide the mapping panel.",
      attachTo: "#toggle-midi-learn",
      clickOnFocus: true,
    },
    {
      title: "Show MIDI Modulation",
      text: "This button shows the MIDI modulation settings.",
      attachTo: "#toggle-midi-mod",
      clickOnFocus: true,
    },
    {
      title: "Mod Wheel Destination",
      text: "Choose which parameter is controlled with the mod wheel.",
      attachTo: "#modwheel-dest-select",
    },
    {
      title: "Mod Wheel Amount",
      text: "Set the amount of modulation applied to the selected parameter.",
      attachTo: "#modwheel-amount",
    },
    {
      title: "Chanel Aftertouch Destination",
      text: "Choose which parameter is controlled with channel presure.",
      attachTo: "#aftertouch-dest-select",
    },
    {
      title: "Aftertouch Amount",
      text: "Set the amount of modulation applied to the selected parameter.",
      attachTo: "#aftertouch-amount",
    },
    {
      title: "Release Velocity Destination",
      text: "Choose which parameter is controlled with relese velocity.",
      attachTo: "#releasevel-dest-select",
    },
    {
      title: "Release Velocity Amount",
      text: "Set the amount of modulation applied to the selected parameter.",
      attachTo: "#releasevel-amount",
    },
    {
      title: "Hide MIDI Modulation",
      text: "Hide the MIDI modulation panel.",
      attachTo: "#toggle-midi-mod",
      clickOnFocus: true,
    },
    {
      title: "Activate Voice Control",
      text: "Clicking this button will turn on the microphone and accept a voice command. Also you can press V.",
      attachTo: "#voice-btn",
    },
    {
      title: "Toggle Voice Feedback",
      text: "By default all feedback is routed to your screen reader via a live region. Toggle this control if you want to hear verbal feedback when using voice commands via text to speech (no screen reader required). This can also be activated with Shift + A.",
      attachTo: "#announce-toggle",
    },
    {
      title: "MIDI Device",
      text: "Use this menu to select your MIDI input device.",
      attachTo: "#midi-device-select",
    },
    {
      title: "MIDI Input Channel",
      text: "Use this menu to select MIDI input channel.",
      attachTo: "#midi-channel-select",
    },
    {
      title: "Oscillator A Wave A",
      text: "Select the wave for oscillator A wave A. You can morph between waves A and B",
      attachTo: "#osc1-a",
    },
    {
      title: "Oscillator A Wave B",
      text: "Select the wave for oscillator A wave A. You can morph between waves A and B",
      attachTo: "#osc1-b",
    },
    {
      title: "Oscillator A Detune",
      text: "Detune Oscillator A in cents.",
      attachTo: "#detune1",
    },
    {
      title: "Oscillator A Volume",
      text: "Adjust the volume of oscillator A.",
      attachTo: "#volume1",
    },
    {
      title: "Oscillator B Wave A",
      text: "Select the wave for oscillator A wave A. You can morph between waves A and B",
      attachTo: "#osc2-a",
    },
    {
      title: "Oscillator B Wave B",
      text: "Select the wave for oscillator A wave A. You can morph between waves A and B",
      attachTo: "#osc2-b",
    },
    {
      title: "Oscillator B Detune",
      text: "Detune Oscillator B in cents.",
      attachTo: "#detune2",
    },
    {
      title: "Oscillator B Volume",
      text: "Adjust the volume of oscillator B.",
      attachTo: "#volume2",
    },
    {
      title: "Oscillator Modulation LFO Rate",
      text: "The rate for the ocsillator modulation LFO.",
      attachTo: "#oscillator-mod-lfo-rate",
    },
    {
      title: "Oscillator Modulation LFO Depth",
      text: "The Depth for the ocsillator modulation LFO.",
      attachTo: "#lfo-depth",
    },
    {
      title: "Oscillator Modulation Target",
      text: "Use this menu to route the LFO to either Morph, Phase Mod or both.",
      attachTo: "#lfo-target",
    },
    {
      title: "LFO Shape",
      text: "Choose the shape for the modulation LFO.",
      attachTo: "#lfo-shape",
    },
    {
      title: "Oscillator Wave Morph",
      text: "This control can be used to morph between wave A & B for both oscillators. 0.00 is fully wave A, 1.00 is fully wave B.",
      attachTo: "#morph",
    },
    {
      title: "Phase Modulation",
      text: "Phase Modulation changes the shape of a sound by using one wave to bend the phase of another. This makes new, interesting tones—like bells or digital effects—by twisting the sound in real time.",
      attachTo: "#phase-modulation",
    },
    {
      title: "Bypass LFO",
      text: "When bypass is on the LFO is turned off and no modulation is applied.",
      attachTo: "#fx-lfo-enable",
    },
    {
      title: "Filter Morph LFO Rate",
      text: "Controls the rate of modulation to filter mix.",
      attachTo: "#fx-lfo-rate",
    },
    {
      title: "Filter Morph LFO Depth",
      text: "Controls the Depth of modulation to filter mix.",
      attachTo: "#fx-lfo-depth",
    },
    {
      title: "Filter Morph Mix",
      text: "Morphs between filter A & B, 0.00 is fully filter A and 1.00 is fully filter B.",
      attachTo: "#fx-mix",
    },
    {
      title: "Filter A Drive",
      text: "Sets the amount of input drive to the filter.",
      attachTo: "#dualFilter-drive",
    },
    {
      title: "Filter A Type",
      text: "Select the filter type for filter A.",
      attachTo: "#filter1-type",
    },
    {
      title: "Filter A Cut Off",
      text: "Sets the cut off frequency for filter A.",
      attachTo: "#dualFilter-freqA",
    },
    {
      title: "Filter A Resonance",
      text: "Sets the resonant peak of filter A.",
      attachTo: "#dualFilter-resA",
    },
    {
      title: "Filter B Type",
      text: "Select the filter type for filter B.",
      attachTo: "#filter2-type",
    },
    {
      title: "Filter B Cut Off",
      text: "Sets the cut off frequency for filter B.",
      attachTo: "#dualFilter-freqB",
    },
    {
      title: "Filter B Resonance",
      text: "Sets the resonant peak of filter B.",
      attachTo: "#dualFilter-resB",
    },
    {
      title: "Serial/Parallel Toggle",
      text: "Switch between serial and parallel modes.",
      attachTo: "#dualFilter-routing",
    },
    {
      title: "Filter B Type A",
      text: "Selects the filter type for filter A.",
      attachTo: "#morphingFilter-typeA",
    },
    {
      title: "Filter A Cut Off",
      text: "Sets the cut off frequency for filter A.",
      attachTo: "#morphingFilter-freqA",
    },
    {
      title: "Filter A Resonance",
      text: "Sets the resonant peak of filter A.",
      attachTo: "#morphingFilter-resonanceA",
    },
    {
      title: "Filter B Type B",
      text: "Selects the filter type for filter B.",
      attachTo: "#morphingFilter-typeB",
    },
    {
      title: "Filter B Cut Off",
      text: "Sets the cut off frequency for filter B.",
      attachTo: "#morphingFilter-freqB",
    },
    {
      title: "Filter B Resonance",
      text: "Sets the resonant peak of filter B.",
      attachTo: "#morphingFilter-resonanceB",
    },
    {
      title: "Morph between Filter A And Filter B",
      text: "Morph between filter A and B. 0.00 is filter A, 1.00 is filter B. Use the LFO to modulate this parameter.",
      attachTo: "#morphingFilter-morph",
    },
    {
      title: "Morph LFO Rate",
      text: "Sets the frequency of the morph LFO",
      attachTo: "#morphingFilter-lfoFrequency",
    },
    {
      title: "Morph LFO Depth",
      text: "Sets the amount of modulation set by the morph LFO",
      attachTo: "#morphingFilter-lfoDepth",
    },
    {
      title: "Mod Envelope Attack Time",
      text: "Sets the attack time for the envelopes attack phase.",
      attachTo: "#modenv1-attack",
    },
    {
      title: "Mod Envelope Decay Time",
      text: "Sets the Decay time for the envelopes attack phase.",
      attachTo: "#modenv1-decay",
    },
    {
      title: "Mod Envelope Sustain Level",
      text: "Sets the sustain level while holding note.",
      attachTo: "#modenv1-sustain",
    },
    {
      title: "Mod Envelope Release Time",
      text: "Sets the release time for the envelopes release phase.",
      attachTo: "#modenv1-release",
    },
    {
      title: "Mod Envelope Drag Source",
      text: "Use this to drag the envelope output to and slider in the UI. For keyboard access press P to pick up, navigate to the slider and press P to drop. Envelope depth is applied via the slider labelled Mod depth for param label.",
      attachTo: ".mod-env-source",
    },
    {
      title: "Mod Envelope 2",
      text: "Mod envelope 2 is the same as mod envelope 1.",
      attachTo: ".mod-env-source",
    },
    {
      title: "Amp Envelope Attack Time",
      text: "Sets the attack time for the envelopes attack phase.",
      attachTo: "#attack",
    },
    {
      title: "Amp Envelope Decay Time",
      text: "Sets the decay time for the envelopes attack phase.",
      attachTo: "#decay",
    },
    {
      title: "Amp Envelope Sustain Level",
      text: "Sets the sustain level while holding note.",
      attachTo: "#sustain",
    },
    {
      title: "Amp Envelope Release Time",
      text: "Sets the release time for the envelopes attack phase.",
      attachTo: "#release",
    },
    {
      title: "Delay Bypass",
      text: "Bypasses the delay, turn off to allow signal.",
      attachTo: "#delay-bypass",
    },
    {
      title: "Delay Time",
      text: "Delay time sets how long it takes for an echo or repeated sound to play after the original note. Longer delay times make the echo come later; shorter times make it closer to the original.",
      attachTo: "#delay-time",
    },
    {
      title: "Delay Feedback",
      text: "Delay feedback controls how much of the echoed sound is fed back into the delay. Higher feedback means more repeats and a longer echo tail; lower feedback means fewer repeats.",
      attachTo: "#delay-feedback",
    },
    {
      title: "Delay Filter Cut Off",
      text: "Delay repeates are routed through a low pass filter. Use this control to set the cut off frequency.",
      attachTo: "#delay-cut",
    },
    {
      title: "Delay Wet Level",
      text: "Delay wet level controls how much of the delayed (echoed) sound you hear compared to your original sound. Higher wet levels mean more echo; lower wet levels mean more of your dry, original sound.",
      attachTo: "#delay-wet",
    },
    {
      title: "Overdrive Bypass",
      text: "Bypasses the Overdrive, turn off to allow signal.",
      attachTo: "#overdrive-bypass",
    },
    {
      title: "Distortion Drive",
      text: "Distortion drive controls how much the sound is pushed or clipped, adding crunch, grit, or fuzz. Higher drive makes the sound more aggressive and distorted.",
      attachTo: "#overdrive-drive",
    },
    {
      title: "Overdrive Curve",
      text: "The distortion curve shapes how your sound gets distorted. Different curves create different types of crunch, fuzz, or warmth, letting you choose the character of the distortion.",
      attachTo: "#overdrive-curve",
    },
    {
      title: "Ring Mod Bypass",
      text: "Bypasses the ring mod, turn off to allow signal.",
      attachTo: "#ring-mod-bypass",
    },
    {
      title: "Ring Mod Frequency",
      text: "Ring mod frequency sets the speed of the extra wave used to create metallic or robotic sounds. Changing this frequency changes the tone and texture of the effect.",
      attachTo: "#ring-mod-freq",
    },
    {
      title: "Ring Mod Depth",
      text: "Ring mod depth controls how much the ring modulation effect changes your sound. Higher depth means a stronger, more noticeable metallic effect.",
      attachTo: "#ring-mod-depth",
    },
    {
      title: "Reverb Bypass",
      text: "Bypasses the reverb, turn off to allow signal.",
      attachTo: "#reverb-bypass",
    },
    {
      title: "Reverb Decay Time",
      text: "Reverb decay sets how long the reverb lasts after a sound. Longer decay means the echo fades out slowly, making spaces sound bigger.",
      attachTo: "#reverb-decay",
    },
    {
      title: "Reverb Duration",
      text: "Reverb duration controls how long the reverb effect lasts. A longer duration means the sound echoes for more time before fading away.",
      attachTo: "#reverb-duration",
    },
    {
      title: "Reverb High Cut Frequency",
      text: "Reverb high cut reduces the bright, high frequencies in the reverb effect. This makes the reverb sound warmer and less sharp.",
      attachTo: "#reverb-highcut",
    },
    {
      title: "Reverb Low Cut Frequency",
      text: "Reverb low cut removes deep, bassy sounds from the reverb effect. This keeps the reverb clear and prevents it from sounding muddy.",
      attachTo: "#reverb-lowcut",
    },
    {
      title: "Reverb Wet Level",
      text: "Reverb wet controls how much reverb effect you hear. Higher wet levels mean more reverb; lower levels mean more of your original sound.",
      attachTo: "#reverb-wet",
    },
    {
      title: "Lfo 1 Rate",
      text: "Sets the frequency of the LFO.",
      attachTo: "#lfo1-rate",
    },
    {
      title: "LFO 1 Shape",
      text: "Set the wave shape for LFO 1.",
      attachTo: "#ui-lfo1-shape",
    },
    {
      title: "LFO 1 Drag Source",
      text: "Use this to drag the lfo output to and slider in the UI. For keyboard access press P to pick up, navigate to the slider and press P to drop. LFO depth is applied via the slider labelled Mod depth for param label.",
      attachTo: ".lfo-source",
    },
    {
      title: "LFO 2 & 3",
      text: "LFO 2 and 3 are the same as lfo 1.",
      attachTo: ".lfo-source",
    },
  ];

  let currentStep = 0;

  const modal = document.getElementById("custom-tour-modal");
  const title = document.getElementById("custom-tour-title");
  const text = document.getElementById("custom-tour-text");
  const prevButton = document.getElementById("custom-prev-step");
  const nextButton = document.getElementById("custom-next-step");
  const closeButton = document.getElementById("custom-close-tour");
  const startTourButton = document.getElementById("start-tour-button");

  function updateModal() {
    const step = tourSteps[currentStep];
    title.textContent = step.title;
    text.textContent = step.text;

    // Remove existing focus highlights
    document.querySelectorAll(".focus-highlight").forEach((element) => {
      element.classList.remove("focus-highlight");
      element.removeAttribute("tabindex");
    });

    // Focus the attached element
    const attachToElement = document.querySelector(step.attachTo);
    if (attachToElement) {
      attachToElement.classList.add("focus-highlight");
      attachToElement.setAttribute("tabindex", "-1");

      // Simulate click if necessary
      if (step.clickOnFocus) {
        attachToElement.click();
      }

      // Calculate position
      const rect = attachToElement.getBoundingClientRect();

      const modalWidth = modal.offsetWidth;

      const viewportWidth = window.innerWidth;

      // Adjust these values to fine-tune the position
      const verticalOffset = 10; // Additional vertical offset
      const horizontalOffset = -200; // Additional horizontal offset

      // Calculate top position directly below the element
      let top = rect.bottom + window.scrollY + verticalOffset;
      // Calculate left position centered below the element
      let left =
        rect.left +
        window.scrollX -
        modalWidth / 2 +
        rect.width / 2 +
        horizontalOffset;

      // Ensure modal stays within the viewport
      if (left < 0) {
        left = 10; // Add some padding from the left edge
      } else if (left + modalWidth > viewportWidth) {
        left = viewportWidth - modalWidth - 10; // Add some padding from the right edge
      }

      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
    }

    prevButton.style.display = currentStep === 0 ? "none" : "inline-block";
    nextButton.textContent =
      currentStep === tourSteps.length - 1 ? "Finish" : "Next";
    modal.style.display = "flex";

    // Focus sequence: first title, then text, then buttons
    title.setAttribute("tabindex", "0");
    text.setAttribute("tabindex", "0");

    title.focus();

    // Trap focus within the modal
    trapFocusHandler(modal);
  }

  // Define the closeModal function
  function closeModal() {
    // Hide the modal
    modal.style.display = "none";

    // Remove focus highlights
    document.querySelectorAll(".focus-highlight").forEach((element) => {
      element.classList.remove("focus-highlight");
      element.removeAttribute("tabindex");
    });

    // Remove tabindex attributes from modal elements
    title.removeAttribute("tabindex");
    text.removeAttribute("tabindex");

    // Remove focus trapping event listener
    document.removeEventListener("keydown", trapFocusHandler);
  }

  // Event listener handler for trapping focus
  function trapFocusHandler(e) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];

    let isTabPressed = e.key === "Tab" || e.keyCode === 9;

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      // if shift key pressed for shift + tab combination
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus(); // add focus for the last focusable element
        e.preventDefault();
      }
    } else {
      // if tab key is pressed
      if (document.activeElement === lastFocusableElement) {
        // if focused has reached to last focusable element then focus first focusable element after pressing tab
        firstFocusableElement.focus(); // add focus for the first focusable element
        e.preventDefault();
      }
    }
  }

  startTourButton.addEventListener("click", function () {
    currentStep = 0;
    updateModal();
  });

  prevButton.addEventListener("click", function () {
    if (currentStep > 0) {
      currentStep--;
      closeModal(); // Close the modal first to remove highlight from previous element
      updateModal();
    }
  });

  nextButton.addEventListener("click", function () {
    if (currentStep < tourSteps.length - 1) {
      currentStep++;
      closeModal(); // Close the modal first to remove highlight from previous element
      updateModal();
    } else {
      closeModal();
    }
  });

  closeButton.addEventListener("click", function () {
    closeModal();
  });
});
