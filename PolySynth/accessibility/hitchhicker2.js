document.addEventListener("DOMContentLoaded", function () {
  const tourSteps = [
    {
      title: "Welcome to Alien Instruments POLY SYNTH!",
      text: "This tour will guide you through the main features.",
      attachTo: "#menu",
    },
    {
      title: "Show Hotkeys",
      text: "This is where you can change the keyboard shortcuts to suit your layout.",
      attachTo: "#toggleHotkeys",
      clickOnFocus: true,
    },
    {
      title: "Navigation Shortcuts",
      text: "This set of shortcuts can be used to shift focus to the different areas of the interface.",
      attachTo: "#nav-keys-tour",
    },
    {
      title: "Slider Shortcuts",
      text: "This set of shortcuts can be used for slider interactions. X10 modifier multiplies the step value of the current slider by 10, holding X100 multiplier with X10 multiplies by 100. This will allow for course and fine tuning of params. This also provides hotkeys to jump between min, max and defaults values.",
      attachTo: "#slider-help-tour",
    },
    {
      title: "Update Shortcuts",
      text: "When you have chosen the new shortcuts click this button to update them.",
      attachTo: "#update-tour",
    },
    {
      title: "Hide Hotkeys",
      text: "Use this button to close the menu when you are finished.",
      attachTo: "#toggleHotkeys",
      clickOnFocus: true,
    },
    {
      title: "Show Voice Settings",
      text: "This is where you will find the settings for spoken values and mapping.",
      attachTo: "#toggleVoiceSettings",
      clickOnFocus: true,
    },
    {
      title: "Speech Pitch",
      text: "Use this slider to set the voice pitch.",
      attachTo: "#pitch-tour",
    },
    {
      title: "Speech Rate",
      text: "Use this slider to set the voice rate.",
      attachTo: "#rate-tour",
    },
    {
      title: "Speech Volume",
      text: "Use this slider to set the voice Volume.",
      attachTo: "#volume-tour",
    },
    {
      title: "Voice Selection",
      text: "Use this menu to select the voice you would like to hear.",
      attachTo: "#speech-voice",
    },
    {
      title: "Test Speech",
      text: "You can type anything here and use the speak button to hear the current voice settings.",
      attachTo: "#speech-text",
    },
    {
      title: "Speak Button",
      text: "Click here to hear the phrase you typed.",
      attachTo: "#speak-button",
    },
    {
      title: "Hide Voice Settings",
      text: "Click this button to hide the Voice settings",
      attachTo: "#toggleVoiceSettings",
      clickOnFocus: true,
    },
    {
      title: "Open Manual",
      text: "This is where you will find detailed information about this software.",
      attachTo: "#openModalBtn",
    },

    {
      title: "Open MIDI Settings",
      text: "This is where you can select your MIDI input device and map your controller.",
      attachTo: "#midi-tour",
      clickOnFocus: true,
    },
    {
      title: "Turn Off Musical Typing",
      text: "If you don't a MIDI controller you can play the synth with your computers keyboard. You may wish to turn this off when using a controller.",
      attachTo: "#input-mode-tour",
    },
    {
      title: "MIDI Input Device",
      text: "This is where you can select your controller.",
      attachTo: "#midi-inputs",
    },
    {
      title: "MIDI Input Channel",
      text: "This is where you can select the MIDI Channel for your controller.",
      attachTo: "#midi-channel",
    },
    {
      title: "Spoken Parameters",
      text: "If you would like to hear the parameter values when sending CC mesages then turn on Speak Values here.",
      attachTo: "#speak-tour",
    },
    {
      title: "MIDI Learn Controls",
      text: "Each of the buttons in this area allow you to map your MIDI controller. Click the button with the param you wish to map and follow the voice prompts and move a control on your controller to map.",
      attachTo: "#midi-learn-tour",
    },
    {
      title: "Close MIDI Settings",
      text: "",
      attachTo: "#close-midi-tour",
      clickOnFocus: true,
    },
    {
      title: "Show Presets",
      text: "This is where you can save and load audio presets when you create sounds.",
      attachTo: "#togglePreset",
      clickOnFocus: true,
    },
    {
      title: "Name Preset",
      text: "Enter a name here for your new preset.",
      attachTo: "#audio-preset-name",
    },
    {
      title: "Save Preset",
      text: "When you have entered a name click this button to save your preset.",
      attachTo: "#save-audio-preset",
    },
    {
      title: "Load Preset",
      text: "Select an option from this list to load the preset.",
      attachTo: "#audio-preset-list",
    },
    {
      title: "Hide Presets",
      text: "Use this button to hide the preset manager.",
      attachTo: "#togglePreset",
      clickOnFocus: true,
    },

    {
      title: "Go to Custom Interface",
      text: "Use this button to switch between interfaces.",
      attachTo: "#inter-tour",
    },
    {
      title: "Turn On Voice initiated Command System",
      text: "Click this button to turn on the voice command system and use your voice to interact with the interface.",
      attachTo: "#start-recognition",
    },
    {
      title: "Turn Off Voice initiated Command System",
      text: "Click this button to turn off the voice command system.",
      attachTo: "#stop-recognition",
    },
    {
      title: "3 Band Equaliser",
      text: "This is a simple 3 band EQ with Low, Mid & High bands. Mid band has peak control.",
      attachTo: "#EQ",
    },
    {
      title: "Space Time Continuum",
      text: "This is a dimension expander and delay in one unit.",
      attachTo: "#poly-synth-effects",
    },
    {
      title: "Poly Synth",
      text: "This is a polyphonic synthesiser with modulated filter.",
      attachTo: "#poly-synth",
    },
    {
      title: "Virtual Keyboard",
      text: "Virtual keyboard mapped to your computer keys. Can be turned of in MIDI Settings.",
      attachTo: "#keyboard",
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

      // Calculate and set the modal position
      setPosition();

      // Add scroll event listener to adjust modal position
      window.addEventListener("scroll", setPosition);
      window.addEventListener("resize", setPosition);
    }

    function setPosition() {
      const step = tourSteps[currentStep];
      const attachToElement = document.querySelector(step.attachTo);
      const rect = attachToElement.getBoundingClientRect();

      const modalWidth = modal.offsetWidth;
      const modalHeight = modal.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust these values to fine-tune the position
      const verticalOffset = 10; // Additional vertical offset
      const horizontalOffset = -100; // Additional horizontal offset

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

      if (top + modalHeight > viewportHeight + window.scrollY) {
        window.scrollTo({
          top: rect.bottom + modalHeight - viewportHeight + verticalOffset,
          behavior: "auto",
        });
        top = viewportHeight - modalHeight - 10 + window.scrollY; // Add some padding from the bottom edge
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
    // setTimeout(() => {
    //   text.focus();
    // }, 1000); // Adjust timing if necessary

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
