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
      title: "Welcome to Alien Instruments UBIK!",
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
      title: "Popup Colours",
      text: "Set the colours of the popup window and text input.",
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
      title: "Slider Panel",
      text: "This is how the slider panel will look when added to the interface. The components are there to give a visual display of your colour changes and slider style.",
      attachTo: "#test-slider-tour",
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
      title: "Focus Size",
      text: "Use this slider to set the size of the focus outline.",
      attachTo: "#focus-tour",
    },
    {
      title: "Access Preset Manager",
      text: "This is where you can load factory colour presets. You can also save your own presets, we recomend you do this after making changes so you can keep them for later.",
      attachTo: "#preset-tour",
    },
    {
      title: "Preset Name",
      text: "Type the name for your preset here.",
      attachTo: "#preset-name",
    },
    {
      title: "Save Preset Button",
      text: "When you have added a name for your preset click this button to save it.",
      attachTo: "#save-preset",
    },
    {
      title: "Preset List",
      text: "Click on an option to load the preset. The factory presets demonstrate each slider style with suggested colour styles, including monochromatic designs.",
      attachTo: "#preset-list",
    },
    {
      title: "Hide Interface Settings",
      text: "Click this button to hide the interface settings.",
      attachTo: "#toggleAccess",
      clickOnFocus: true, // Custom attribute to indicate the button should be clicked on focus
    },
    {
      title: "Show MIDI Settings",
      text: "Click this button to show the settings for the MIDI in and out.",
      attachTo: "#toggleMIDISettings",
      clickOnFocus: true,
    },
    {
      title: "MIDI In Settings",
      text: "This is where you can select your controller and the input channel. You can also turn on spoken values.",
      attachTo: "#midi-in-tour",
    },
    {
      title: "MIDI In Device",
      text: "Use this menu to select the controller you wish to map.",
      attachTo: "#midi-inputs",
    },
    {
      title: "MIDI Input Channel",
      text: "Use this menu to select the input channel.",
      attachTo: "#midi-input-channel",
    },
    {
      title: "MIDI Out Settings",
      text: "This is where you can choose which device or software you wish to connect the MIDI output.",
      attachTo: "#midi-out-tour",
    },
    {
      title: "MIDI Output Device",
      text: "Use this menu to select the destination for the MIDI output",
      attachTo: "#midiOutputSelect",
    },
    {
      title: "MIDI Output Channel",
      text: "Use this menu to select the output channel.",
      attachTo: "#midi-channel",
    },
    {
      title: "MIDI Note Pass through",
      text: "Turn on this setting if you want to send note messages to the output device or software.",
      attachTo: "#midi-pass-tour",
    },
    {
      title: "Hide MIDI Settings",
      text: "Click this button to hide the MIDI settings.",
      attachTo: "#toggleMIDISettings",
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
      title: "Show Preset Manager Button",
      text: "Click this button to show the preset manager below. The preset manager consists of two parts, part one allows you to save the current layout and MIDI mapping configuration. Part two allows you to save parameter values within the loaded configuration.",
      attachTo: "#toggle-custom-preset-manager-button",
      clickOnFocus: true,
    },
    {
      title: "Layout Manager",
      text: "When you have finished mapping you can come here and save the current configuration.",
      attachTo: "#custom-preset-manager",
    },
    {
      title: "Preset Name",
      text: "This is where you name your preset.",
      attachTo: "#custom-preset-name",
    },
    {
      title: "Save Layout Button",
      text: "When you have entered a name click this button to save your preset.",
      attachTo: "#custom-save-preset-button",
    },
    {
      title: "Select Layout Menu",
      text: "This is where you will find your saved presets. To load a preset select it in the list below then click the load button.",
      attachTo: "#custom-preset-select",
    },
    {
      title: "Load Layout Button",
      text: "When you have selected a preset from the menu click this button, the page will refresh to load the interface.",
      attachTo: "#custom-load-preset-button",
    },
    {
      title: "Patch Manager",
      text: "This is where you can save patches for your layout.",
      attachTo: "#custom-patch-manager",
    },
    {
      title: "Patch Name",
      text: "This is where you name your patch.",
      attachTo: "#custom-patch-name",
    },
    {
      title: "Save Patch Button",
      text: "When you have entered a name click this button to save your patch.",
      attachTo: "#custom-save-patch-button",
    },
    {
      title: "Select Patch Menu",
      text: "This is where you will find your saved patches. To load a patch make sure the current layout is selected in the menu above, then select it in the list below then click the load button.",
      attachTo: "#custom-patch-select",
    },
    {
      title: "Load Patch Button",
      text: "When you have selected a preset from the menu click this button. When loading the controls will send there current value to the MIDI output.",
      attachTo: "#custom-load-patch-button",
    },
    {
      title: "Hide Preset Manager Button",
      text: "Click this button to hide the preset manager.",
      attachTo: "#toggle-custom-preset-manager-button",
      clickOnFocus: true,
    },
    {
      title: "MIDI Program Change",
      text: "This is where you can send program change messages. MIDI Program Change is a type of MIDI message used to switch between different instrument sounds or patches on a synthesizer or other MIDI-compatible device. When a Program Change message is sent, it tells the device to change its current instrument or preset to a new one",
      attachTo: "#program-change-container",
    },
    {
      title: "Bank select",
      text: "Use this menu to select the bank number.",
      attachTo: "#bank-select",
    },
    {
      title: "Program Select",
      text: "Use this menu to select the program number.",
      attachTo: "#program-select",
    },
    {
      title: "Send Program Change Button",
      text: "When you have set the bank and program numbers click this button to send the message.",
      attachTo: "#send-program-change",
    },
    {
      title: "Edit Buttons",
      text: "These buttons are used to disable and enable some of the interface buttons. For example each group or component you add has a delete button, these are locked by default to avoid accidental deletes.",
      attachTo: "#edit-tour",
    },
    {
      title: "Enable Delete Button",
      text: "Use this button to enable the delete buttons. This button defaults to delete buttons disabled",
      attachTo: "#toggleDeleteButton",
    },
    {
      title: "Disable Learn Buttons",
      text: "Use this button to disable the MIDI learn buttons when you have finished mapping if you wish. This button defaults to learn buttons enabled.",
      attachTo: "#toggleLearnButton",
    },
    {
      title: "Enable Edit CC",
      text: "If you wish to change a CC number for a component without deleting and making another use this buton to enable CC selects. This will enable the components CC menu. This button defaults to CC selects disabled.",
      attachTo: "#toggleSelectButton",
    },
    {
      title: "Speak Mapped Values",
      text: "Turn on this setting if you want to hear the output values of sliders and buttons. We will cover the speech settings in this tour.",
      attachTo: "#speak-tour",
    },
    {
      title: "Add Group Button",
      text: "This is where you start building your interface. When you click this button a menu will open and prompt you to name your group. You cant use the same label twice for groups or components due to the way they are saved and mapped, text inputs will not allow duplicate names. When nammed the group will be added horizontally below this button and subsequent groups below that one. When the group is open use the add button and slider buttons to add controls. A set of propmpts will guide you through adding components. This is the end of the tour, we hope you found this useful. Have fun and enjoy!",
      attachTo: "#addGroupButton",
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
