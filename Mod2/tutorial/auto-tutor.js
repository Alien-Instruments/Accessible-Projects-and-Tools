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

// setValue: ""
// setSlider: 1.5
// triggerKey: " "
// clickOnFocus: true
// manualSelection: true

document.addEventListener("DOMContentLoaded", function () {
  //add a step for each element in the tour.
  const tutorials = {
    basic: [
      {
        title: "Welcome to Alien Instruments Access Mod!",
        text: "This tutorial will show you how to make a basic patch.",
        attachTo: "h1",
      },
      {
        title: "Power",
        text: "Turn on the power to start the oscillators",
        attachTo: "#startButton",
        clickOnFocus: true,
      },
      {
        title: "Sequencer",
        text: "First open the sequencer step display",
        attachTo: "#toggleSequencer",
        clickOnFocus: true,
      },
      {
        title: "Step Count",
        text: "Next we will set our sequencer to 8 steps",
        attachTo: "#stepCount",
        setValue: "8",
      },
      {
        title: "Notes And Velocities",
        text: "Now lets program some notes and their velocities (how hard the key is pressed). We will set this step to C2.",
        attachTo: "#note-select-0",
        setValue: "36",
      },
      {
        title: "Velocity",
        text: "We will set this velocity to 104.",
        attachTo: "#velocity-select-0",
        setValue: "104",
      },
      {
        title: "Velocity",
        text: "We will set this velocity to 0 so the steps is silent.",
        attachTo: "#velocity-select-1",
        setValue: "0",
      },
      {
        title: "Velocity",
        text: "We will set this velocity to 0 so the steps is silent.",
        attachTo: "#velocity-select-2",
        setValue: "0",
      },
      {
        title: "Note",
        text: "We will set this step to play E2",
        attachTo: "#note-select-3",
        setValue: "40",
      },
      {
        title: "Velocity",
        text: "Lets play this step a little softer",
        attachTo: "#velocity-select-3",
        setValue: "72",
      },
      {
        title: "Velocity",
        text: "We will set this velocity to 0 so the steps is silent.",
        attachTo: "#velocity-select-4",
        setValue: "0",
      },
      {
        title: "Note",
        text: "We will play G2 on this step.",
        attachTo: "#note-select-5",
        setValue: "43",
      },
      {
        title: "Velocity",
        text: "Lets play this step a bit harder.",
        attachTo: "#velocity-select-5",
        setValue: "112",
      },
      {
        title: "Velocity",
        text: "We will set this velocity to 0 so the steps is silent.",
        attachTo: "#velocity-select-6",
        setValue: "0",
      },
      {
        title: "Note",
        text: "We will play B2 on this step.",
        attachTo: "#note-select-7",
        setValue: "47",
      },
      {
        title: "Velocity",
        text: "Lets play this step a bit softer.",
        attachTo: "#velocity-select-7",
        setValue: "48",
      },
      {
        title: "Setting The Oscillator",
        text: "Next we will use the Complex Oscillator to create the sound.",
        attachTo: "#complexOsc",
      },
      {
        title: "Saw Wave",
        text: "First we will set the saw wave out to midway",
        attachTo: "#Saw\\ Out",
        setSlider: 0.5,
      },
      {
        title: "Saw Wave",
        text: "Next we will set the square wave out to midway",
        attachTo: "#Square\\ Out",
        setSlider: 0.5,
      },
      {
        title: "Detune Square Wave",
        text: "Now lets detune the square wave by 1 octave or 1200 cents.",
        attachTo: "#Detune\\ Square",
        setSlider: -1200,
      },
      {
        title: "Apply Amplitude Modulation",
        text: "Next we will apply a little amplitude modulation to our oscillators. First we will set the modulation depth to 0.5.",
        attachTo: "#AM\\ Depth",
        setSlider: 0.5,
      },
      {
        title: "Set The Modulation Frequency",
        text: "Next we will set the frequency of the LFO modulating the amplitude to 10Hz.",
        attachTo: "#AM\\ Freq",
        setSlider: 10,
      },
      {
        title: "Connect The Output",
        text: "Next we will connect the audio output to a filter. Pressing Space Bar will pick up for drag and drop if you are using a screen reader or keyboard navigation, you can also drag with your mouse by clicking and holding left button.",
        attachTo: "#complexOscillator1-output",
        triggerKey: " ",
      },
      {
        title: "Filter Input",
        text: "Now we will connect the oscillator to the filter",
        attachTo: "#filter1-input",
        triggerKey: " ",
      },
      {
        title: "Filter Cut Off Frequency",
        text: "Next we will use the frequency control to set the cut off frequency in to 4050Hz. The filter type is set to lowpass so this will cut all frequencies above 4050Hz giving us a darker tone.",
        attachTo: "#Filter\\ One\\ Freq",
        setSlider: 4050,
      },
      {
        title: "Resonance",
        text: "Next we will adjust the resonance of the filter. This will boost frequencies at the cut off frequency. Lets set it to 18 for now.",
        attachTo: "#Filter\\ One\\ Resonance",
        setSlider: 18,
      },
      {
        title: "Filter Output",
        text: "Now we need to connect our filter to the next module. Lets route it to our chorus effect",
        attachTo: "#filter1-output",
        triggerKey: " ",
      },
      {
        title: "Chorus In",
        text: "Let’s bring the Chorus module into our signal path. Now the sound flows from the Complex Oscillator, through the Filter, and into the Chorus for some lush, dreamy movement.",
        attachTo: "#chorus-input",
        triggerKey: " ",
      },
      {
        title: "Feedback",
        text: "Time to dial in some character. We’ll set the Chorus feedback to 0.7 — this increases the resonance and adds a subtle shimmer to the modulation.",
        attachTo: "#Chorus\\ Feedback",
        setSlider: 0.7,
      },
      {
        title: "Delay",
        text: "Now we’ll set the delay time to 0.25. This controls how far apart the chorus voices are, shaping the overall texture and width.",
        attachTo: "#Chorus\\ Delay",
        setSlider: 0.25,
      },
      {
        title: "Depth",
        text: "Let’s set the modulation depth to 0.5. This determines how much the delayed voices shift — a good balance between subtlety and motion.",
        attachTo: "#Chorus\\ Depth",
        setSlider: 0.5,
      },
      {
        title: "Rate",
        text: "We’ll now increase the modulation rate to 5Hz. This speeds up the chorus movement, giving the sound a more animated feel.",
        attachTo: "#Chorus\\ Rate",
        setSlider: 5,
      },
      {
        title: "Wet/Dry",
        text: "Finally, we’ll push the Wet/Dry mix all the way to 1.0 — fully wet — so you can clearly hear the full effect of the chorus in action.",
        attachTo: "#Chorus\\ Wet",
        setSlider: 1,
      },
      {
        title: "Chorus Output",
        text: "Now lets connect our Chorus to the Amp Envelope",
        attachTo: "#chorus-output",
        triggerKey: " ",
      },
      {
        title: "Amp Envelope",
        text: "The Amplifier Envelope module includes both a built-in amp and an ADSR envelope. It shapes how the sound behaves over time — from how quickly it starts, to how long it holds, and how it fades. Our audio will now pass through this envelope before heading to other effects.",
        attachTo: "#ampEnvelope-input",
        triggerKey: " ",
      },
      {
        title: "Envelope Attack",
        text: "Attack controls how quickly the sound reaches full volume after a note starts. We’ll set it to 0.1 for a fast but smooth rise.",
        attachTo: "#Envelope\\ Attack",
        setSlider: 0.1,
      },
      {
        title: "Envelope Decay",
        text: "Decay is how quickly the sound drops to the sustain level after the attack. Setting this to 0.2 gives a gentle falloff after the initial peak.",
        attachTo: "#Envelope\\ Decay",
        setSlider: 0.2,
      },
      {
        title: "Envelope Sustain",
        text: "Sustain sets the level that holds while the note is held down. At 0.8, our sound will maintain most of its strength after the decay phase.",
        attachTo: "#Envelope\\ Sustain",
        setSlider: 0.8,
      },
      {
        title: "Envelope Release",
        text: "Release controls how long it takes the sound to fade out after the note ends. Setting it to 0.1 creates a quick tail, great for tight and snappy sounds.",
        attachTo: "#Envelope\\ Release",
        setSlider: 0.1,
      },
      {
        title: "Amp Envelope Output",
        text: "Now that our volume shape is in place, we’ll route the output to the Delay module to continue building our effects chain.",
        attachTo: "#ampEnvelope-output",
        triggerKey: " ",
      },
      {
        title: "Delay Input",
        text: "We’ll now connect the signal to the Delay module. This adds repeating echoes to our sound — perfect for rhythm and depth.",
        attachTo: "#delay-input",
        triggerKey: " ",
      },
      {
        title: "Delay Time",
        text: "Delay Time controls how far apart the echoes are. We’ll set it to 500ms, giving us a nice, noticeable repeat.",
        attachTo: "#Delay\\ Time",
        setSlider: 500,
      },
      {
        title: "Feedback",
        text: "Feedback controls how much of the delayed signal is fed back into the delay line. At 0.5, the echoes will gradually fade out.",
        attachTo: "#Delay\\ Feedback",
        setSlider: 0.5,
      },
      {
        title: "Cut Off",
        text: "This filter shapes the tone of the echoes. By setting the Cutoff to 4750Hz, we soften the repeats slightly — higher frequencies get filtered out with each echo.",
        attachTo: "#Delay\\ Cut",
        setSlider: 4750,
      },
      {
        title: "Wet/dry",
        text: "The Wet/Dry mix controls how much delay is heard versus the original signal. We’ll set it to 0.8 to keep the delay prominent.",
        attachTo: "#Delay\\ Wet",
        setSlider: 0.8,
      },
      {
        title: "Delay Out",
        text: "Now let’s send the delayed signal onward — we’ll route it to the Main Output so it can be heard through your system.",
        attachTo: "#delay-output",
        triggerKey: " ",
      },
      {
        title: "Output",
        text: "Our signal chain is complete: Oscillator → Filter → Chorus → Amp Envelope → Delay → Output. Let’s hear what we’ve built!",
        attachTo: "#output-input",
        triggerKey: " ",
      },
      {
        title: "Start Sequencer",
        text: "Now we can set the sequencer in motion and we will hear the output!",
        attachTo: "#startStop",
        clickOnFocus: true,
      },
    ],
    intermediate: [
      {
        title: "Intermediate",
        text: "Let’s dive deeper.",
        attachTo: "h1",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
    ],
    advanced: [
      {
        title: "Advanced Start",
        text: "Let’s dive into routing and modulation.",
        attachTo: "h1",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
      {
        title: "",
        text: "",
        attachTo: "",
      },
    ],
    MIDI_Input: [
      {
        title: "MIDI control",
        text: "Let’s dive into setting up you MIDI controller and parameter mapping.",
        attachTo: "h1",
      },
      {
        title: "Power On",
        text: "Make sure power is on.",
        attachTo: "#startButton",
        clickOnFocus: true,
      },
      {
        title: "Select Your MIDI Device",
        text: "Choose you MIDI controller or other MIDI output from the drop down menu.(If you are using a screen reader or keyboard navigation plese press Space or Enter to shift focus to the dropdown, after selecting your device focus will return to the next button in the window.)",
        attachTo: "#midiInputSelect",
        manualSelection: true,
      },
      {
        title: "Turn On MIDI In",
        text: "This button toggles the midi input and hides the step sequencer while it is not in use.",
        attachTo: "#midiToggle",
        clickOnFocus: true,
      },
      {
        title: "Start The Patch",
        text: "Now we will make some connections and create a small patch.",
        attachTo: "#oscillator1",
      },
      {
        title: "Set Level",
        text: "First lets set up an oscillator. We will set the output level.",
        attachTo: "#Osc\\ One\\ Level",
        setSlider: 0.6,
      },
      {
        title: "Set The Type",
        text: "Next we will select the saw wave from the osciilator types.",
        attachTo: "#Osc\\ One\\ Type",
        setValue: "1",
      },
      {
        title: "Patch The Output",
        text: "Now we will patch the oscillators output to the filter",
        attachTo: "#oscillator1-output",
        triggerKey: " ",
      },
      {
        title: "Filter Input",
        text: "now we have the filter in our audio chain lets patch the output.",
        attachTo: "#filter1-input",
        triggerKey: " ",
      },
      {
        title: "Filter Output",
        text: "Now we will connect the filters output to the amp envelope",
        attachTo: "#filter1-output",
        triggerKey: " ",
      },
      {
        title: "Amp Envelope",
        text: "When using MIDI the envelope is triggered by the note on message, the velocity is applied to this module too.",
        attachTo: "#ampEnvelope-input",
        triggerKey: " ",
      },
      {
        title: "Amp Envelope",
        text: "Now we can route our signal to the main output.",
        attachTo: "#ampEnvelope-output",
        triggerKey: " ",
      },
      {
        title: "Main Out",
        text: "Now you are connected and can play notes. Next we will do some CC mapping.",
        attachTo: "#output-input",
        triggerKey: " ",
      },
      {
        title: "Open CC Mapper",
        text: "This button opens up the mapping section.",
        attachTo: "#toggleCC",
        clickOnFocus: true,
      },
      {
        title: "Filter Mapping",
        text: "All the modules have there own section, lets open the filter and map the cut off.",
        attachTo: "#midi-category-filter",
        clickOnFocus: true,
      },
      {
        title: "Map Filter Cutoff",
        text: "Move a CC slider or knob on your MIDI device now and it will map to the filters cut off.",
        attachTo: 'button[title="Learn Filter One Freq"]',
        clickOnFocus: true,
      },
      {
        title: "Map Filter Resonance",
        text: "Move a CC slider or knob on your MIDI device now and it will map to the filters resonance.",
        attachTo: 'button[title="Learn Filter One Resonance"]',
        clickOnFocus: true,
      },
      {
        title: "Remove Mapping",
        text: "Mappings can be removed by clicking the adjacent button.",
        attachTo: 'button[title="Unmap Filter One Resonance"]',
        clickOnFocus: true,
      },
      {
        title: "Clear All Mappings",
        text: "This button can be used to clear all the mappings.",
        attachTo: "#clear-all-mappings",
      },
      {
        title: "Export Mappings",
        text: "This button can be used to export and download your mapping configuration.",
        attachTo: "#export-mappings",
      },
      {
        title: "Import Mappings",
        text: "Here you can upload your saved mappings from your computer.",
        attachTo: ".custom-file-upload",
      },
      {
        title: "End Of Tutorial",
        text: "Now you know how to set up your controller and map MIDI CC's to the module parameters.",
        attachTo: "h1",
      },
    ],
  };
  let currentStep = 0;

  const modal = document.getElementById("custom-tutor-modal");
  const title = document.getElementById("custom-tutor-title");
  const text = document.getElementById("custom-tutor-text");
  const prevButton = document.getElementById("tutor-custom-prev-step");
  const nextButton = document.getElementById("tutor-custom-next-step");
  const closeButton = document.getElementById("tutor-custom-close-tour");
  const startTourButton = document.getElementById("start-tutorial-button");
  const tutorialSelect = document.getElementById("tutorial-select");
  const loadTutorialButton = document.getElementById("load-tutorial-btn");

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
        if (attachToElement.tagName === "DETAILS") {
          attachToElement.open = true;
        } else {
          attachToElement.click();
        }
      }

      if (step.setValue !== undefined) {
        attachToElement.value = step.setValue;
        attachToElement.dispatchEvent(new Event("change", { bubbles: true }));
      }

      if (attachToElement && attachToElement.tagName === "SELECT") {
        // Step 1: Allow Enter or Space to shift focus from modal to the select
        const handleFocusKey = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            attachToElement.focus();

            // Once focused, remove this key listener from the modal
            text.removeEventListener("keydown", handleFocusKey);
          }
        };
        text.addEventListener("keydown", handleFocusKey);

        // Step 2: After user selects an option, return focus to the "Next" button
        const returnFocusToNext = () => {
          nextButton.focus();
          attachToElement.removeEventListener("change", returnFocusToNext);
        };
        attachToElement.addEventListener("change", returnFocusToNext);
      }

      if (step.setSlider !== undefined) {
        attachToElement.value = step.setSlider;
        attachToElement.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (step.triggerKey !== undefined) {
        setTimeout(() => {
          attachToElement.focus();

          const keyboardEvent = new KeyboardEvent("keydown", {
            key: step.triggerKey,
            code: step.triggerKey === " " ? "Space" : step.triggerKey,
            keyCode:
              step.triggerKey === " " ? 32 : step.triggerKey.charCodeAt(0),
            which: step.triggerKey === " " ? 32 : step.triggerKey.charCodeAt(0),
            bubbles: true,
            cancelable: true,
          });

          attachToElement.dispatchEvent(keyboardEvent);

          // Optional: keyup event if needed
          attachToElement.dispatchEvent(
            new KeyboardEvent("keyup", {
              key: step.triggerKey,
              code: step.triggerKey === " " ? "Space" : step.triggerKey,
              bubbles: true,
              cancelable: true,
            })
          );

          // Return focus to the modal
          setTimeout(() => {
            title.focus();
          }, 100); // Adjust timing if needed
        }, 200);
      }

      if (step.triggerEnter !== undefined) {
        attachToElement.focus();

        const keyboardEvent = new KeyboardEvent("keydown", {
          key: step.triggerEnter,
          code: step.triggerEnter === " " ? "Enter" : step.triggerEnter,
          keyCode:
            step.triggerEnter === " " ? 13 : step.triggerEnter.charCodeAt(0),
          which:
            step.triggerEnter === " " ? 13 : step.triggerEnter.charCodeAt(0),
          bubbles: true,
          cancelable: true,
        });

        attachToElement.dispatchEvent(keyboardEvent);

        // Optional: keyup event if needed
        attachToElement.dispatchEvent(
          new KeyboardEvent("keyup", {
            key: step.triggerEnter,
            code: step.triggerEnter === " " ? "Enter" : step.triggerEnter,
            bubbles: true,
            cancelable: true,
          })
        );
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
    modal.style.display = "flex";

    // Ensure modal content is keyboard-focusable
    title.setAttribute("tabindex", "0");
    text.setAttribute("tabindex", "0");

    // Set focus to the title for screen readers or keyboard nav
    setTimeout(() => tutorialSelect.focus(), 50);

    // Show tutorial selector if hidden
    document.getElementById("tutorial-selector").style.display = "block";
    document.getElementById("tutorial").style.display = "none";
  });

  loadTutorialButton.addEventListener("click", function () {
    const selected = tutorialSelect.value;
    tourSteps = tutorials[selected] || [];
    currentStep = 0;

    document.getElementById("tutorial").style.display = "block";
    // Hide the selector so it doesn't appear during the tutorial
    document.getElementById("tutorial-selector").style.display = "none";

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
