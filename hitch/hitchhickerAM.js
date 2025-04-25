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
      title: "Welcome to Alien Instruments Access Mod!",
      text: "This tour will guide you through the main features. (Screen reader users) The order of the tour follows the exact focus order of elements.",
      attachTo: "h1",
    },
    {
      title: "Auto Tutor",
      text: "This button will start a guided tutorial of a simple patch. The tutorial runs in a window like this and does all the work for you with adjusting parameters while you read along.",
      attachTo: "#start-tutorial-button",
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
      title: "Power On Button",
      text: "This button needs to be pressed to start the oscillators.",
      attachTo: "#startButton",
    },
    {
      title: "Audio Preset Manager",
      text: "This is where you can save and delete your patches.",
      attachTo: "#audio-presets",
    },
    {
      title: "Select Presets",
      text: "Use this menu to select and load your saved presets.",
      attachTo: "#presetDropdown",
    },
    {
      title: "Save Preset",
      text: "This button will open a popup for you to name and save your preset.",
      attachTo: "#savePresetBtn",
    },
    {
      title: "Delete Preset",
      text: "Deletes the currently loaded preset.",
      attachTo: "#deletePresetBtn",
    },
    {
      title: "Export Presets",
      text: "Pressing this will download all saved presets as a json file. Your presets are saved to your browsers local storage. Clearing history will remove them and they are only available when using your browser. This allows you to save them securely and import them if needed, you can also share your presets this way.",
      attachTo: "#exportPresetBtn",
    },
    {
      title: "Import Presets",
      text: "This button will open your file upload system. You can select the audio_presets.json file saved from exporting.",
      attachTo: "#importPresetBtn",
    },
    {
      title: "Reset All Controls",
      text: "This button returns all of the synthesiser parameters to their default settings and removes all connections between modules.",
      attachTo: "#resetPatchBtn",
    },
    {
      title: "MIDI Input Device",
      text: "Use this menu to select your MIDI device.",
      attachTo: "#midiInputSelect",
    },
    {
      title: "MIDI Input",
      text: "Switch between MIDI in and step sequencer",
      attachTo: "#midiToggle",
    },
    {
      title: "Show CC Mapping",
      text: "Use this menu to map MIDI CC's to parameters.",
      attachTo: "#toggleCC",
    },
    {
      title: "Sequencer Settings",
      text: "This is where you will find the settings for the step sequencer. This panel is hidden if you are using the MIDI in function. The sequencer is connected to the frequency of all 4 oscillators.",
      attachTo: ".seqControl",
    },
    {
      title: "Tempo",
      text: "Use the slider to set the tempo in BPM.",
      attachTo: "#tempo-div",
    },
    {
      title: "Start/Stop",
      text: "Use this button to start and stop the step sequencer.",
      attachTo: "#startStop",
    },
    {
      title: "Show/Hide",
      text: "This button is used to show and hide the step sequencer controls.",
      attachTo: "#toggleSequencer",
      clickOnFocus: true,
    },
    {
      title: "Step Highlight",
      text: "Here you can change the colour of the current step highlight. This shows visually which step is currently playing",
      attachTo: "#step-highlight",
    },
    {
      title: "Step Count",
      text: "This menu allows you to set how many steps the sequencer uses.",
      attachTo: "#stepCount",
    },
    {
      title: "Note Select",
      text: "Use this menu to select the note played in the step.",
      attachTo: "#note-select-0",
    },
    {
      title: "Step Velocity",
      text: "Here you can set the velocity for each step. This is applied to the Amp Envelope module, you need to include it in your patch for this to respond.",
      attachTo: "#velocity-select-0",
    },
    {
      title: "Step Modulation Destination",
      text: "Use this menu to select a modulation destination for each step.",
      attachTo: "#mod-target-0",
    },
    {
      title: "Step Modulation Amount",
      text: "Use this slider to select the amount of modulation applied to the target parameter.",
      attachTo: "#mod-amt-0",
    },
    {
      title: "Hide Sequencer",
      text: "Hides the sequncer.",
      attachTo: "#toggleSequencer",
      clickOnFocus: true,
    },
    {
      title: "Synth",
      text: "This area contains all the modules. You can drag outputs to inputs to connect the audio path.",
      attachTo: "#mod-row",
    },
    {
      title: "Complex Oscillator",
      text: "The Complex Oscillator contains 4 oscillators, sine, sawtooth, square and triangle that can be blended together using the out controls. Each oscillator has a detune control. This oscillator also has two LFO's for amplitude and frequency modulation. This can be applied with the amount and frequency controls.",
      attachTo: "#complexOsc",
    },
    {
      title: "Pulse Oscillator",
      text: "The Pulse Oscillator generates a rich, harmonically bright waveform with adjustable pulse width. Use the width control to shape the tone.",
      attachTo: "#pulseOsc",
    },
    {
      title: "Simple Oscillator",
      text: "A basic Oscillator with 4 waveforms, sine, saw, square and triangle.",
      attachTo: "#oscillator1",
    },
    {
      title: "Simple Oscillator 2",
      text: "A basic Oscillator with 4 waveforms, sine, saw, square and triangle.",
      attachTo: "#oscillator2",
    },
    {
      title: "External Input",
      text: "This module lets you select an audio input and patch it through the effects.",
      attachTo: "#external-in",
    },
    {
      title: "Filter 1",
      text: "A basic filter with control of cut off frequency and resonance. It has 3 basic filter types, lowpass, highpass and bandpass.",
      attachTo: "#filter1",
    },
    {
      title: "Dual Filter",
      text: "This module features two filters, each offering four selectable types: lowpass, highpass, bandpass, and notch. An input gain stage adds subtle to intense distortion to the incoming signal, enhancing harmonic content. You can switch between serial and parallel routing modes to shape your sound with greater flexibility.",
      attachTo: "#dualFilter",
    },
    {
      title: "Mutator",
      text: "This module is inspired by one channel of the classic Mutronics Mutator. It combines an envelope follower, filter, LFO modulation, and distortion. Use it to add animated movement or gritty character to your sound — perfect for synths, bass, or textures.",
      attachTo: "#mutator",
    },
    {
      title: "Delay",
      text: "The Delay module repeats your sound after a short time, creating echoes. You can adjust how long it waits and how much of the signal is repeated. Great for spacey textures or rhythmic effects.",
      attachTo: "#delay",
    },
    {
      title: "Phaser",
      text: "The Phaser adds a swirling, sweeping effect by shifting the phase of your sound. Use Rate and Depth to control the motion, Feedback to intensify the effect, Phase to adjust stereo spread, and Base Frequency to set where the sweep starts.",
      attachTo: "#phaser",
    },
    {
      title: "Chorus",
      text: "The Chorus module thickens your sound by adding slightly delayed copies that move over time. Use Rate and Depth to control the motion, Delay for the time offset, Feedback for resonance, and Wet/Dry to blend the effect with the original signal.",
      attachTo: "#chorus",
    },
    {
      title: "Reverb",
      text: "This reverb uses a custom-generated impulse response that you can tweak in real time. Adjust the duration and decay to shape the space — from tight rooms to deep, echoing halls.",
      attachTo: "#reverb",
    },
    {
      title: "Cabinet",
      text: "The Cabinet module simulates classic amp speaker tones. Emulates the Brit Class A2 Blackface Twin for shaping your sound’s character, and use the Gain control to adjust the output level.",
      attachTo: "#cabinet",
    },
    {
      title: "Auto Panner",
      text: "The Auto Panner moves your sound left and right automatically, creating a sense of motion. Use Rate to set how fast it moves, Depth to control how wide the movement is, and Pan Direction to reverse the sweep.",
      attachTo: "#autoPanner",
    },
    {
      title: "Dimension Expander",
      text: "This module creates a wider, more spacious sound using four short, staggered delays. Adjust Delay and Feedback to shape the effect, and use Wet/Dry to blend it with your original signal.",
      attachTo: "#expander",
    },
    {
      title: "Overdrive",
      text: "The Overdrive module adds warmth, edge, or aggressive distortion to your sound. Use Drive to control the amount of saturation, Gain to adjust output level, Curve to shape the distortion response, and Algorithm to switch between different distortion styles.",
      attachTo: "#drive",
    },
    {
      title: "4 Channel Mixer",
      text: "A simple 4-input mixer for blending audio signals. Use it to combine sounds from different modules and control their individual levels before sending to effects or output.",
      attachTo: "#mixer",
    },
    {
      title: "Amp Envelope",
      text: "Controls how your sound evolves over time using Attack, Decay, Sustain, and Release. This envelope directly shapes the output volume and responds to velocity from both MIDI input and the internal sequencer for expressive dynamics.",
      attachTo: "#ampEnvelope",
    },
    {
      title: "3 Band Equaliser",
      text: "Shape your sound across low, mid, and high frequencies. Each band has Gain and Frequency controls, with the Mid band also featuring a Peak control to adjust its width and focus.",
      attachTo: "#eq",
    },
    {
      title: "Main Output",
      text: "This module routes your final mixed signal to the system audio output. It also feeds the visual analyser at the bottom of the screen, so connect your final mix here to both hear and see your sound.",
      attachTo: "#mainOut",
    },
    {
      title: "Show Analyser",
      text: "Use this button to show and hide the analyser displayed at the bottom of the page.",
      attachTo: "#toggleDisplayButton",
      clickOnFocus: true,
    },
    {
      title: "Low Frequency Oscillator 1",
      text: "Generates slow modulation using sine, saw, square, or triangle waves. Control the Rate and Depth of the motion, choose between free-run or re-trigger modes, and route the LFO to up to four modulation targets using the destination menus.",
      attachTo: "#LFO_1",
    },
    {
      title: "Low Frequency Oscillator 2",
      text: "Generates slow modulation using sine, saw, square, or triangle waves. Control the Rate and Depth of the motion, choose between free-run or re-trigger modes, and route the LFO to up to four modulation targets using the destination menus.",
      attachTo: "#LFO_2",
    },
    {
      title: "Low Frequency Oscillator 3",
      text: "Generates slow modulation using sine, saw, square, or triangle waves. Control the Rate and Depth of the motion, choose between free-run or re-trigger modes, and route the LFO to up to four modulation targets using the destination menus.",
      attachTo: "#LFO_3",
    },
    {
      title: "Analyser Controls",
      text: "Here you can set the colours of the analyser and freeze frame the animation.",
      attachTo: "#controls",
    },
    {
      title: "Line Colour",
      text: "Here you can set the colour of the animated oscilloscope.",
      attachTo: "#lineColorPicker",
    },
    {
      title: "Background Colour",
      text: "Here you can set the background colour.",
      attachTo: "#bgColorPicker",
    },
    {
      title: "Line Thickness",
      text: "Here you can adjust the thickness of the line.",
      attachTo: "#lineThickness",
    },
    {
      title: "Freeze Display",
      text: "Use this button to freeze and un-freeze the display",
      attachTo: "#freezeButton",
    },
    {
      title: "Connection Display",
      text: "This area displays a list of connected modules, each connection can be disconected via the adjacent button.",
      attachTo: "#connectionDisplay",
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

    // Focus sequence: first title, then text, then buttons
    title.setAttribute("tabindex", "0");
    text.setAttribute("tabindex", "0");
    modal.style.display = "flex";
    modal.focus();
    setTimeout(() => title.focus(), 50);

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
