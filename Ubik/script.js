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

let midiAccess = null;
let output = null;
let input = null;
let midiMapping = {};
let debounceTimer;
const debounceDelay = 300;
let currentMidiLearnParam = null;

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midi) {
  midiAccess = midi;
  populateMIDIDevices();
  populateMIDIInputs();
}

function onMIDIFailure() {
  console.error("Failed to access MIDI devices.");
}

function populateMIDIDevices() {
  const outputSelect = document.getElementById("midiOutputSelect");
  outputSelect.innerHTML = ""; // Clear existing options

  const outputs = midiAccess.outputs.values();
  for (let output of outputs) {
    const option = document.createElement("option");
    option.value = output.id;
    option.text = output.name;
    outputSelect.appendChild(option);
  }

  outputSelect.addEventListener("change", function () {
    const selectedId = this.value;
    output = midiAccess.outputs.get(selectedId);
  });

  if (outputSelect.options.length > 0) {
    outputSelect.selectedIndex = 0;
    output = midiAccess.outputs.get(outputSelect.options[0].value);
  }
}

function populateMIDIInputs() {
  const inputSelect = document.getElementById("midi-inputs");
  inputSelect.innerHTML = ""; // Clear existing options

  const inputs = midiAccess.inputs.values();
  for (let input of inputs) {
    const option = document.createElement("option");
    option.value = input.id;
    option.text = input.name;
    inputSelect.appendChild(option);
  }

  inputSelect.addEventListener("change", function () {
    const selectedId = this.value;
    input = midiAccess.inputs.get(selectedId);
    input.onmidimessage = getMIDIMessage;
  });

  if (inputSelect.options.length > 0) {
    inputSelect.selectedIndex = 0;
    input = midiAccess.inputs.get(inputSelect.options[0].value);
    input.onmidimessage = getMIDIMessage;
  }
}

function sendMIDIMessage(control, value) {
  if (output) {
    const midiChannel = parseInt(document.getElementById("midi-channel").value);
    output.send([0xb0 + midiChannel, control, value]);
  }
}

function saveConfiguration() {
  const controller = document.getElementById("controller");
  const groups = Array.from(controller.getElementsByClassName("group"));
  const configuration = groups.map((group) => {
    const groupName = group.getAttribute("aria-label");
    const sliders = Array.from(
      group.getElementsByClassName("slider-container")
    ).map((sliderContainer) => {
      const slider = sliderContainer.querySelector("input.slider");
      if (slider) {
        return {
          type: "slider",
          name: sliderContainer.querySelector("label").textContent,
          controlNumber: slider.dataset.control,
          value: slider.value,
          minValue: slider.dataset.minValue,
          maxValue: slider.dataset.maxValue,
          useFloat: slider.dataset.useFloat === "true",
        };
      }
      const button = sliderContainer.querySelector(
        "button:not(.delete-button):not([id$='-learn'])"
      );
      if (button) {
        return {
          type: "button",
          name: sliderContainer.querySelector("label").textContent,
          controlNumber: button.dataset.control,
          state: button.dataset.state,
          onValue: button.dataset.onValue,
        };
      }
    });
    return { groupName, sliders };
  });
  const midiChannel = document.getElementById("midi-channel").value;
  localStorage.setItem(
    "midiConfiguration",
    JSON.stringify({ configuration, midiChannel })
  );
}

function generateIdFromName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

let currentModalCallback = null;

function openModal(message, callback) {
  currentModalCallback = callback;
  const messageElement = document.getElementById("modal-message");
  messageElement.textContent = message;
  document.getElementById("modal-input").value = "";

  // Save the currently focused element
  lastFocusedElement = document.activeElement;

  // Display the modal and grab focus on the message
  const modal = document.getElementById("customPrompt");
  modal.style.display = "flex";

  // Make the message element focusable and focus on it
  messageElement.setAttribute("tabindex", "-1");
  messageElement.focus();
}

// Additional functions for closing and confirming the modal
function closeModal() {
  // Hide the modal
  const modal = document.getElementById("customPrompt");
  modal.style.display = "none";
  currentModalCallback = null;

  // Restore focus to the previously focused element
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function confirmModal() {
  const input = document.getElementById("modal-input").value;
  if (currentModalCallback) {
    currentModalCallback(input);
  }
  closeModal();
}

function addGroup() {
  openModal("Enter name for this group:", (groupName) => {
    if (!groupName) return;
    if (isDuplicateGroupName(groupName)) {
      alert("Group name already exists. Please choose a different name.");
      return;
    }

    const group = document.createElement("div");
    group.className = "group";
    group.setAttribute("aria-label", groupName);
    group.tabIndex = -1; // Make the group focusable

    group.innerHTML = `
      <div class="button-container">
        <h3>${groupName}</h3>
        <button id="add-slider" onclick="addSlider(this.parentElement.parentElement)">Add Slider</button>
        <button id="add-toggle" onclick="addToggleButton(this.parentElement.parentElement)">Add Toggle Button</button>
        <button id="delete-group" class="delete-button" onclick="deleteElement(this.parentElement.parentElement)" disabled>Delete Group</button>
      </div>
    `;

    // Append the group to the controller
    document.getElementById("controller").appendChild(group);

    // Set aria-labels dynamically after the HTML has been inserted
    group
      .querySelector("#add-slider")
      .setAttribute("aria-label", `${groupName} Add Slider`);
    group
      .querySelector("#add-toggle")
      .setAttribute("aria-label", `${groupName} Add Toggle Button`);
    group
      .querySelector("#delete-group")
      .setAttribute("aria-label", `${groupName} Delete Group`);

    // Set focus on the group
    group.focus();

    saveConfiguration();
  });
}

function isDuplicateGroupName(name) {
  const groups = document.querySelectorAll(".group[aria-label]");
  return Array.from(groups).some(
    (group) => group.getAttribute("aria-label") === name
  );
}

document.getElementById("addGroupButton").addEventListener("click", addGroup);

// Add event listener for confirming the modal input
document
  .getElementById("cc-number-modal-input")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      confirmCCNumberModal();
    }
  });

let currentSliderModalCallback = null;
let currentCCNumberCallback = null;
let currentMinMaxCallback = null;
let currentUseMinMaxCallback = null;
let lastFocusedElement = null;

function openSliderModal(message, callback) {
  currentSliderModalCallback = callback;
  const messageElement = document.getElementById("slider-modal-message");
  messageElement.textContent = message;
  document.getElementById("slider-modal-input").value = "";

  // Save the currently focused element
  lastFocusedElement = document.activeElement;

  // Display the modal and grab focus on the message
  const modal = document.getElementById("sliderPrompt");
  modal.style.display = "flex";
  messageElement.setAttribute("tabindex", "-1");
  messageElement.focus();
}

function closeSliderModal() {
  // Hide the modal
  document.getElementById("sliderPrompt").style.display = "none";
  currentSliderModalCallback = null;
}

function confirmSliderModal() {
  const input = document.getElementById("slider-modal-input").value;
  if (currentSliderModalCallback) {
    currentSliderModalCallback(input);
  }
  closeSliderModal();
}

function openCCNumberModal(callback) {
  currentCCNumberCallback = callback;
  const messageElement = document.getElementById("cc-number-modal-message");
  //const inputElement = document.getElementById("cc-number-modal-input");
  document.getElementById("cc-number-error").style.display = "none";
  document.getElementById("cc-number-modal").style.display = "flex";

  // Ensure the message element gets focus first
  messageElement.setAttribute("tabindex", "-1");
  messageElement.focus();

  // Save the currently focused element
  lastFocusedElement = document.activeElement;
}

function closeCCNumberModal() {
  document.getElementById("cc-number-modal").style.display = "none";
  currentCCNumberCallback = null;

  // Restore focus to the previously focused element
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function confirmCCNumberModal() {
  const ccNumber = document.getElementById("cc-number-modal-input").value;
  if (isDuplicateCCNumber(ccNumber)) {
    document.getElementById("cc-number-error").style.display = "block";
  } else {
    if (currentCCNumberCallback) {
      currentCCNumberCallback(ccNumber);
    }
    closeCCNumberModal();
  }
}

function openMinMaxModal(callback) {
  currentMinMaxCallback = callback;
  const messageElement = document.getElementById("min-max-modal-message");
  document.getElementById("min-value-input").value = "";
  document.getElementById("max-value-input").value = "";
  document.getElementById("min-max-modal").style.display = "flex";
  messageElement.setAttribute("tabindex", "-1");
  messageElement.focus();
}

function closeMinMaxModal() {
  document.getElementById("min-max-modal").style.display = "none";
  currentMinMaxCallback = null;
}

function confirmMinMaxModal() {
  const minValue = parseFloat(document.getElementById("min-value-input").value);
  const maxValue = parseFloat(document.getElementById("max-value-input").value);
  const useFloat = document.getElementById("use-float-checkbox").checked;
  if (currentMinMaxCallback) {
    currentMinMaxCallback(minValue, maxValue, useFloat);
  }
  closeMinMaxModal();
}

function openUseMinMaxModal(callback) {
  currentUseMinMaxCallback = callback;
  const messageElement = document
    .getElementById("use-min-max-modal")
    .querySelector("p");
  document.getElementById("use-min-max-modal").style.display = "flex";
  messageElement.setAttribute("tabindex", "-1");
  messageElement.focus();
}

function closeUseMinMaxModal() {
  document.getElementById("use-min-max-modal").style.display = "none";
  currentUseMinMaxCallback = null;
}

function confirmUseMinMax(useMinMax) {
  if (currentUseMinMaxCallback) {
    currentUseMinMaxCallback(useMinMax);
  }
  closeUseMinMaxModal();
}

function isDuplicateCCNumber(ccNumber) {
  const elements = document.querySelectorAll(".slider, button");
  return Array.from(elements).some((el) => el.dataset.control === ccNumber);
}

function addSlider(group) {
  openSliderModal("Enter name for this slider:", (sliderName) => {
    if (!sliderName) return;
    if (isDuplicateSliderName(sliderName)) {
      alert("Slider name already exists. Please choose a different name.");
      return;
    }

    openCCNumberModal((controlNumber) => {
      if (controlNumber === null) return;

      openUseMinMaxModal((useMinMax) => {
        if (useMinMax) {
          openMinMaxModal((minValue, maxValue, useFloat) => {
            if (minValue === null || maxValue === null) return;

            createSlider(
              sliderName,
              controlNumber,
              minValue,
              maxValue,
              useFloat,
              group
            );
          });
        } else {
          createSlider(sliderName, controlNumber, 0, 127, false, group);
        }
      });
    });
  });
}

function createSlider(
  sliderName,
  controlNumber,
  minValue,
  maxValue,
  useFloat,
  group
) {
  const sliderId = generateIdFromName(sliderName); // Use the name to generate the ID
  const outputId = `output-${sliderId}`;

  const sliderContainer = document.createElement("div");
  sliderContainer.className = "slider-container";

  // Apply the current knob design to the new slider container
  const currentDesign = localStorage.getItem("selectedKnobDesign") || "classic";
  sliderContainer.classList.add(currentDesign);

  const sliderLabel = document.createElement("label");
  sliderLabel.setAttribute("for", sliderId);
  sliderLabel.textContent = sliderName;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.className = "slider";
  slider.id = sliderId;
  slider.max = 127; // MIDI range max
  slider.min = 0; // MIDI range min
  slider.step = 1;
  slider.value = 64;
  slider.setAttribute("aria-label", sliderName);
  slider.dataset.control = controlNumber;
  slider.dataset.minValue = minValue;
  slider.dataset.maxValue = maxValue;
  slider.dataset.useFloat = useFloat;

  const output = document.createElement("span");
  output.id = outputId;
  output.className = "slider-output";
  const mappedValue = mapRange(
    slider.value,
    0,
    127,
    minValue,
    maxValue,
    useFloat
  );
  output.textContent = `${Number(mappedValue).toFixed(useFloat ? 2 : 0)}`;

  slider.oninput = function () {
    const control = parseInt(this.dataset.control);
    const midiValue = parseInt(this.value);
    sendMIDIMessage(control, midiValue);
    const useFloat = this.dataset.useFloat === "true";
    const mappedValue = mapRange(
      midiValue,
      0,
      127,
      parseFloat(this.dataset.minValue),
      parseFloat(this.dataset.maxValue),
      useFloat
    );
    output.textContent = `${Number(mappedValue).toFixed(useFloat ? 2 : 0)}`;
    output.setAttribute("aria-label", `${sliderId} Current Value`);
    saveConfiguration(); // Save the state whenever a slider is changed
  };

  const learnButton = document.createElement("button");
  learnButton.id = `${sliderId}-learn`;
  learnButton.textContent = `${sliderName} Learn`;
  learnButton.className = "learn-button";
  learnButton.onclick = function () {
    enableMidiLearn(sliderId);
  };

  const deleteButton = document.createElement("button");
  deleteButton.textContent = `Delete ${sliderName}`;
  deleteButton.className = "delete-button";
  deleteButton.onclick = function () {
    deleteElement(sliderContainer);
  };
  deleteButton.disabled = true;

  const ccSelect = createCCSelect(controlNumber, slider);
  ccSelect.setAttribute("aria-label", `${sliderId} CC`);
  ccSelect.id = `${sliderId}-CC`;
  sliderContainer.appendChild(sliderLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(output);
  sliderContainer.appendChild(ccSelect);
  sliderContainer.appendChild(learnButton);
  sliderContainer.appendChild(deleteButton);
  group.appendChild(sliderContainer);

  slider.focus();

  saveConfiguration();
}

function createCCSelect(currentCC, element) {
  const ccSelect = document.createElement("select");
  ccSelect.className = "cc-select";
  ccSelect.disabled = true;
  for (let i = 0; i < 128; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `CC ${i}`;
    if (i == currentCC) {
      option.selected = true;
    }
    ccSelect.appendChild(option);
  }
  ccSelect.onchange = function () {
    element.dataset.control = this.value;
    saveConfiguration();
  };
  return ccSelect;
}

function isDuplicateSliderName(name) {
  const sliders = document.querySelectorAll(".slider-container label");
  return Array.from(sliders).some((slider) => slider.textContent === name);
}

function promptForUniqueCCNumber(type) {
  while (true) {
    const ccNumber = prompt(`Enter CC number for this ${type}:`, "1");
    if (ccNumber === null) return null;
    if (isDuplicateCCNumber(ccNumber)) {
      alert("CC number already in use. Please choose a different CC number.");
    } else {
      return ccNumber;
    }
  }
}

function isDuplicateCCNumber(ccNumber) {
  const elements = document.querySelectorAll(".slider, button");
  return Array.from(elements).some((el) => el.dataset.control === ccNumber);
}

function isDuplicateButtonName(name) {
  const buttons = document.querySelectorAll(".slider-container label");
  return Array.from(buttons).some((button) => button.textContent === name);
}

function addToggleButton(group) {
  openModal("Enter name for this button:", (buttonName) => {
    if (!buttonName) return;
    if (isDuplicateButtonName(buttonName)) {
      alert("Button name already exists. Please choose a different name.");
      return;
    }

    openCCNumberModal((controlNumber) => {
      if (controlNumber === null) return;

      promptForUniqueOnValue((onValue) => {
        if (onValue === null) return;

        createToggleButton(buttonName, controlNumber, onValue, group);
      });
    });
  });
}

function createToggleButton(buttonName, controlNumber, onValue, group) {
  const buttonId = generateIdFromName(buttonName); // Use the name to generate the ID

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "slider-container";

  const buttonLabel = document.createElement("label");
  buttonLabel.textContent = buttonName;

  const button = document.createElement("button");
  button.id = buttonId;
  button.textContent = `${buttonName} Off`;
  //button.setAttribute("aria-label", buttonName);
  button.dataset.control = controlNumber;
  button.dataset.state = "off";
  button.dataset.onValue = onValue;

  button.onclick = function () {
    const control = parseInt(this.dataset.control);
    const onValue = parseInt(this.dataset.onValue);
    if (this.dataset.state === "on") {
      sendMIDIMessage(control, 0); // Send 0 to turn off
      this.textContent = `${buttonName} Off`;
      this.dataset.state = "off";
    } else {
      sendMIDIMessage(control, onValue); // Send user-defined value to turn on
      this.textContent = `${buttonName} On`;
      this.dataset.state = "on";
    }
    saveConfiguration(); // Save the state whenever a button is toggled
  };

  const learnButton = document.createElement("button");
  learnButton.id = `${buttonId}-learn`;
  learnButton.textContent = `${buttonName} Learn`;
  learnButton.className = "learn-button";
  learnButton.onclick = function () {
    enableMidiLearn(buttonId);
  };

  const deleteButton = document.createElement("button");
  deleteButton.textContent = `Delete ${buttonId}`;
  deleteButton.className = "delete-button";
  deleteButton.onclick = function () {
    deleteElement(buttonContainer);
  };
  deleteButton.disabled = true;

  const ccSelect = createCCSelect(controlNumber, button);
  ccSelect.setAttribute("aria-label", `${buttonId} CC`);
  ccSelect.id = `${buttonId}-CC`;
  const onValueSelect = createOnValueSelect(onValue, button);
  onValueSelect.setAttribute("aria-label", `${buttonId} On Value`);

  buttonContainer.appendChild(buttonLabel);
  buttonContainer.appendChild(button);
  buttonContainer.appendChild(onValueSelect);
  buttonContainer.appendChild(ccSelect);
  buttonContainer.appendChild(learnButton);
  buttonContainer.appendChild(deleteButton);
  group.appendChild(buttonContainer);

  button.focus();
  saveConfiguration();
}

function promptForUniqueOnValue(callback) {
  openModal("Enter ON value for this button:", (onValue) => {
    if (isNaN(onValue) || onValue < 0 || onValue > 127) {
      alert("Invalid value. Please enter a value between 0 and 127.");
      return callback(null);
    } else {
      return callback(parseInt(onValue));
    }
  });
}

function createOnValueSelect(currentOnValue, element) {
  const onValueSelect = document.createElement("select");
  for (let i = 0; i < 128; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `Value ${i}`;
    if (i == currentOnValue) {
      option.selected = true;
    }
    onValueSelect.appendChild(option);
  }
  onValueSelect.onchange = function () {
    element.dataset.onValue = this.value;
    saveConfiguration();
  };
  return onValueSelect;
}

function deleteElement(element) {
  element.remove();
  saveConfiguration();
}

function toggleDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.disabled = !button.disabled;
  });
  const toggleButton = document.getElementById("toggleDeleteButton");
  if (toggleButton.innerHTML.trim() === "Enable Delete Buttons") {
    toggleButton.innerHTML = "Disable Delete Buttons";
  } else {
    toggleButton.innerHTML = "Enable Delete Buttons";
  }
}

function toggleLearnButtons() {
  const learnButtons = document.querySelectorAll(".learn-button");
  learnButtons.forEach((button) => {
    button.disabled = !button.disabled;
  });
  const toggleButton = document.getElementById("toggleLearnButton");
  if (toggleButton.innerHTML.trim() === "Enable Learn Buttons") {
    toggleButton.innerHTML = "Disable Learn Buttons";
  } else {
    toggleButton.innerHTML = "Enable Learn Buttons";
  }
}

function toggleSelectButtons() {
  const selectElements = document.querySelectorAll(".cc-select");
  const isDisabled = selectElements[0].disabled; // Check the state of the first select element
  selectElements.forEach((select) => {
    select.disabled = !select.disabled;
  });
  const toggleButton = document.getElementById("toggleSelectButton");
  if (isDisabled) {
    toggleButton.innerHTML = "Disable Edit CC";
    localStorage.setItem("selectState", "enabled");
  } else {
    toggleButton.innerHTML = "Enable Edit CC";
    localStorage.setItem("selectState", "disabled");
  }
}

function loadConfiguration() {
  const storedData = JSON.parse(localStorage.getItem("midiConfiguration"));
  if (storedData) {
    const { configuration, midiChannel } = storedData;
    document.getElementById("midi-channel").value = midiChannel || "0";
    configuration.forEach((groupConfig) => {
      const group = document.createElement("div");
      group.className = "group";
      group.setAttribute("aria-label", groupConfig.groupName);
      group.innerHTML = `
        <div class="button-container">
        <h3>${groupConfig.groupName}</h3>
        <button id="add-slider" onclick="addSlider(this.parentElement.parentElement)">Add Slider</button>
        <button id="add-toggle" onclick="addToggleButton(this.parentElement.parentElement)">Add Toggle Button</button>
        <button id="delete-group" class="delete-button" onclick="deleteElement(this.parentElement.parentElement)" disabled>Delete Group</button>
      </div>
      `;
      document.getElementById("controller").appendChild(group);

      // Set aria-labels dynamically after the HTML has been inserted
      group
        .querySelector("#add-slider")
        .setAttribute("aria-label", `${groupConfig.groupName} Add Slider`);
      group
        .querySelector("#add-toggle")
        .setAttribute(
          "aria-label",
          `${groupConfig.groupName} Add Toggle Button`
        );
      group
        .querySelector("#delete-group")
        .setAttribute("aria-label", `${groupConfig.groupName} Delete Group`);

      groupConfig.sliders.forEach((control) => {
        if (control.type === "slider") {
          const sliderId = generateIdFromName(control.name);
          const outputId = `output-${sliderId}`;

          const sliderContainer = document.createElement("div");
          sliderContainer.className = "slider-container";

          const sliderLabel = document.createElement("label");
          sliderLabel.setAttribute("for", sliderId);
          sliderLabel.textContent = control.name;

          const slider = document.createElement("input");
          slider.type = "range";
          slider.className = "slider";
          slider.id = sliderId;
          slider.max = 127; // MIDI range max for the slider input
          slider.min = 0; // MIDI range min for the slider input
          slider.step = 1;
          slider.value = control.value;
          slider.setAttribute("aria-label", control.name);
          slider.dataset.control = control.controlNumber;
          slider.dataset.minValue = control.minValue;
          slider.dataset.maxValue = control.maxValue;
          slider.dataset.useFloat = control.useFloat;

          const output = document.createElement("span");
          output.id = outputId;
          output.className = "slider-output";
          const minValue = parseFloat(slider.dataset.minValue) || 0;
          const maxValue = parseFloat(slider.dataset.maxValue) || 127;
          const value = parseInt(slider.value);
          const useFloat = slider.dataset.useFloat === "true";
          const scaledValue = mapRange(
            value,
            0,
            127,
            minValue,
            maxValue,
            useFloat
          );
          output.textContent = `${scaledValue.toFixed(useFloat ? 2 : 0)}`;
          output.setAttribute("aria-label", `${sliderId} Current Value`);
          slider.oninput = function () {
            const control = parseInt(this.dataset.control);
            const midiValue = parseInt(this.value);
            sendMIDIMessage(control, midiValue);
            const mappedValue = mapRange(
              midiValue,
              0,
              127,
              parseFloat(this.dataset.minValue),
              parseFloat(this.dataset.maxValue),
              this.dataset.useFloat === "true"
            );
            output.textContent = `${mappedValue.toFixed(
              this.dataset.useFloat === "true" ? 2 : 0
            )}`;
            saveConfiguration(); // Save the state whenever a slider is changed
          };

          const learnButton = document.createElement("button");
          learnButton.id = `${sliderId}-learn`;
          learnButton.textContent = `${control.name} Learn`;
          learnButton.className = "learn-button";
          learnButton.onclick = function () {
            enableMidiLearn(sliderId);
          };

          const deleteButton = document.createElement("button");
          deleteButton.textContent = `Delete ${sliderId}`;
          deleteButton.className = "delete-button";
          deleteButton.onclick = function () {
            deleteElement(sliderContainer);
          };
          deleteButton.disabled = true;

          const ccSelect = createCCSelect(control.controlNumber, slider);
          ccSelect.setAttribute("aria-label", `${sliderId} CC`);
          ccSelect.id = `${sliderId}-CC`;
          sliderContainer.appendChild(sliderLabel);
          sliderContainer.appendChild(slider);
          sliderContainer.appendChild(output);
          sliderContainer.appendChild(ccSelect);
          sliderContainer.appendChild(learnButton);
          sliderContainer.appendChild(deleteButton);
          group.appendChild(sliderContainer);
        } else if (control.type === "button") {
          const buttonId = generateIdFromName(control.name);

          const buttonContainer = document.createElement("div");
          buttonContainer.className = "slider-container";

          const buttonLabel = document.createElement("label");
          buttonLabel.textContent = control.name;

          const button = document.createElement("button");
          button.id = buttonId;
          button.textContent = `${control.name} ${
            control.state === "on" ? "On" : "Off"
          }`;

          button.onclick = function () {
            const controlNumber = parseInt(this.dataset.control) || 1; // Default to CC 1
            const onValue = parseInt(this.dataset.onValue) || 63; // Default to 63 if not defined
            if (this.dataset.state === "on") {
              sendMIDIMessage(controlNumber, 0); // Send 0 to turn off
              this.textContent = `${control.name} Off`;
              this.dataset.state = "off";
            } else {
              sendMIDIMessage(controlNumber, onValue); // Send onValue to turn on
              this.textContent = `${control.name} On`;
              this.dataset.state = "on";
            }
            saveConfiguration(); // Save the state whenever a button is toggled
          };
          button.dataset.control = control.controlNumber;
          button.dataset.state = control.state;
          button.dataset.onValue = control.onValue || 63; // Default to 63 if not defined

          const learnButton = document.createElement("button");
          learnButton.id = `${buttonId}-learn`;
          learnButton.textContent = `${control.name} Learn`;
          learnButton.className = "learn-button";
          learnButton.onclick = function () {
            enableMidiLearn(buttonId);
          };

          const deleteButton = document.createElement("button");
          deleteButton.textContent = `Delete ${buttonId}`;
          deleteButton.className = "delete-button";
          deleteButton.onclick = function () {
            deleteElement(buttonContainer);
          };
          deleteButton.disabled = true;

          const ccSelect = createCCSelect(control.controlNumber, button);
          ccSelect.setAttribute("aria-label", `${buttonId} CC`);
          ccSelect.id = `${buttonId}-CC`;
          const onValueSelect = createOnValueSelect(control.onValue, button);
          onValueSelect.setAttribute("aria-label", `${buttonId} On Value`);
          buttonContainer.appendChild(buttonLabel);
          buttonContainer.appendChild(button);
          buttonContainer.appendChild(onValueSelect);
          buttonContainer.appendChild(ccSelect);
          buttonContainer.appendChild(learnButton);
          buttonContainer.appendChild(deleteButton);
          group.appendChild(buttonContainer);
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", loadConfiguration);

// MIDI message handler
function getMIDIMessage(message) {
  const [status, data1, data2] = message.data;
  const selectedInputChannel = parseInt(
    document.getElementById("midi-input-channel").value
  );

  if ((status & 0xf0) === 0xb0 && (status & 0x0f) === selectedInputChannel) {
    // Check for control change on the selected input channel
    const controllerNumber = data1;
    const value = data2;

    if (currentMidiLearnParam) {
      for (const key in midiMapping) {
        if (midiMapping[key] === controllerNumber) {
          delete midiMapping[key];
        }
      }
      midiMapping[currentMidiLearnParam] = controllerNumber;
      speak(
        `Mapped ${currentMidiLearnParam.replace(
          /-/g,
          " "
        )} to CC ${controllerNumber}`
      );
      currentMidiLearnParam = null;
      saveMidiMappings();
      return;
    }

    for (const paramId in midiMapping) {
      if (midiMapping[paramId] === controllerNumber) {
        if (paramId.includes("00998878788877766655544433")) {
          //option to handle params differently
          updateFrequencyParameter(paramId, value);
        } else {
          updateParameter(paramId, value);
        }
      }
    }
  } else if ((status & 0xf0) === 0x90 || (status & 0xf0) === 0x80) {
    if (document.getElementById("midi-note-passthrough").checked) {
      output.send([status, data1, data2]);
    }
  }
}

function updateParameter(paramId, midiValue) {
  const element = document.getElementById(paramId);
  if (!element) return;

  if (element.tagName === "BUTTON") {
    const onValue = parseInt(element.dataset.onValue) || 63; // Default to 63 if not set
    const isOn = midiValue >= onValue;
    const previousState = element.dataset.state;
    element.dataset.state = isOn ? "on" : "off";
    element.textContent = `${element.getAttribute("id")} ${
      isOn ? "On" : "Off"
    }`;

    if (previousState !== element.dataset.state) {
      const control = parseInt(element.dataset.control);
      sendMIDIMessage(control, isOn ? onValue : 0);

      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          speak(`${element.getAttribute("id")} ${isOn ? "On" : "Off"}`);
        }, debounceDelay);
      }
    }
  } else {
    const minValue = parseFloat(element.dataset.minValue) || 0;
    const maxValue = parseFloat(element.dataset.maxValue) || 127;
    const useFloat = element.dataset.useFloat === "true";

    const mappedValue = mapRange(
      midiValue,
      0,
      127,
      minValue,
      maxValue,
      useFloat
    );
    console.log(
      `updateParameter: midiValue=${midiValue}, mappedValue=${mappedValue}`
    );

    element.value = midiValue;
    const outputId = `output-${paramId}`;
    const output = document.getElementById(outputId);

    if (useFloat) {
      output.textContent = mappedValue.toFixed(2);
    } else {
      output.textContent = mappedValue.toFixed(0);
    }

    element.dispatchEvent(new Event("input"));

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        if (useFloat) {
          speakFloat(paramId.replace(/-/g, " "), mappedValue);
        } else {
          speakInt(paramId.replace(/-/g, " "), mappedValue);
        }
      }
    }, debounceDelay);
  }
}

function mapRange(value, inMin, inMax, outMin, outMax, useFloat) {
  const result =
    ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return useFloat ? result : Math.round(result);
}

function speakInt(paramId, mappedValue) {
  speak(`${paramId} set to ${Number(mappedValue).toFixed(0)}`);
}

function speakFloat(paramId, value) {
  speak(`${paramId} set to ${Number(value).toFixed(2)}`);
}

function createUtterance(text) {
  const speechText = text || document.getElementById("speech-text").value;
  const speechPitch =
    parseFloat(document.getElementById("speech-pitch").value) / 100;
  const speechRate =
    parseFloat(document.getElementById("speech-rate").value) / 100;
  const speechVolume =
    parseFloat(document.getElementById("speech-volume").value) / 100;
  const speechVoiceIndex = parseInt(
    document.getElementById("speech-voice").value
  );

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.pitch = speechPitch;
  utterance.rate = speechRate;
  utterance.volume = speechVolume;

  const voices = window.speechSynthesis.getVoices();
  if (voices[speechVoiceIndex]) {
    utterance.voice = voices[speechVoiceIndex];
  } else {
    console.warn("Selected voice is not available.");
  }

  return utterance;
}

function speak(text) {
  const utterance = createUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function enableMidiLearn(paramId) {
  currentMidiLearnParam = paramId;
  for (const key in midiMapping) {
    if (midiMapping[key] === paramId) {
      delete midiMapping[key];
    }
  }
  speak(
    `Learn enabled for ${paramId.replace(/-/g, " ")}. Move a CC control to map.`
  );
}

function saveMidiMappings() {
  localStorage.setItem("midiMappings", JSON.stringify(midiMapping));
}

function loadMidiMappings() {
  const storedMappings = localStorage.getItem("midiMappings");
  if (storedMappings) {
    midiMapping = JSON.parse(storedMappings);
  }
}

function populateVoiceList() {
  const voices = window.speechSynthesis.getVoices();
  const voiceSelect = document.getElementById("speech-voice");
  voiceSelect.innerHTML = ""; // Clear existing options

  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = index;
    voiceSelect.appendChild(option);
  });

  const savedVoiceIndex = localStorage.getItem("speech-voice");
  if (savedVoiceIndex !== null) {
    voiceSelect.value = savedVoiceIndex;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadMidiMappings();
  populateVoiceList();
  window.speechSynthesis.onvoiceschanged = populateVoiceList;

  document
    .getElementById("speech-pitch")
    .addEventListener("input", function () {
      document.getElementById("pitch-output").textContent = this.value;
      saveSettings();
    });

  document.getElementById("speech-rate").addEventListener("input", function () {
    document.getElementById("rate-output").textContent = this.value;
    saveSettings();
  });

  document
    .getElementById("speech-volume")
    .addEventListener("input", function () {
      document.getElementById("volume-output").textContent = this.value;
      saveSettings();
    });

  document
    .getElementById("speech-voice")
    .addEventListener("change", function () {
      saveSettings();
    });

  function updateOutputValues() {
    document.getElementById("pitch-output").textContent =
      document.getElementById("speech-pitch").value;
    document.getElementById("rate-output").textContent =
      document.getElementById("speech-rate").value;
    document.getElementById("volume-output").textContent =
      document.getElementById("speech-volume").value;
  }

  updateOutputValues(); // Initialize output values on page load

  function loadSettings() {
    const pitch = localStorage.getItem("speech-pitch");
    const rate = localStorage.getItem("speech-rate");
    const volume = localStorage.getItem("speech-volume");
    const voiceIndex = localStorage.getItem("speech-voice");

    if (pitch !== null) document.getElementById("speech-pitch").value = pitch;
    if (rate !== null) document.getElementById("speech-rate").value = rate;
    if (volume !== null)
      document.getElementById("speech-volume").value = volume;
    if (voiceIndex !== null)
      document.getElementById("speech-voice").value = voiceIndex;
    updateOutputValues();
  }

  function saveSettings() {
    localStorage.setItem(
      "speech-pitch",
      document.getElementById("speech-pitch").value
    );
    localStorage.setItem(
      "speech-rate",
      document.getElementById("speech-rate").value
    );
    localStorage.setItem(
      "speech-volume",
      document.getElementById("speech-volume").value
    );
    localStorage.setItem(
      "speech-voice",
      document.getElementById("speech-voice").value
    );
  }

  window.onload = function () {
    loadSettings();
    populateVoiceList();
  };

  document.getElementById("speak-button").addEventListener("click", () => {
    const utterance = createUtterance();
    window.speechSynthesis.speak(utterance);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  populateBankSelect();
  populateProgramSelect();

  document
    .getElementById("send-program-change")
    .addEventListener("click", sendProgramChangeMessage);
});

function populateBankSelect() {
  const bankSelect = document.getElementById("bank-select");
  for (let i = 0; i <= 127; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `Bank ${i}`;
    bankSelect.appendChild(option);
  }
}

function populateProgramSelect() {
  const programSelect = document.getElementById("program-select");
  for (let i = 0; i <= 127; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `Program ${i}`;
    programSelect.appendChild(option);
  }
}

function sendProgramChangeMessage() {
  const bank = parseInt(document.getElementById("bank-select").value);
  const program = parseInt(document.getElementById("program-select").value);
  const midiChannel = parseInt(document.getElementById("midi-channel").value);

  if (output) {
    output.send([0xb0 + midiChannel, 0, bank]);
    output.send([0xc0 + midiChannel, program]);
    console.log(
      `Sent Program Change: Bank ${bank}, Program ${program} on Channel ${midiChannel}`
    );
  } else {
    console.error("No MIDI output selected.");
  }
}

//div toggles for menus
document
  .getElementById("toggleVoiceSettings")
  .addEventListener("click", function () {
    const voiceSettingsDiv = document.getElementById("voiceSettingsDiv");
    voiceSettingsDiv.classList.toggle("hidden");

    if (voiceSettingsDiv.classList.contains("hidden")) {
      this.textContent = "Show Voice Settings";
    } else {
      this.textContent = "Hide Voice Settings";
    }
  });

document
  .getElementById("toggleMIDISettings")
  .addEventListener("click", function () {
    const MIDISettingsDiv = document.getElementById("MIDISettingsDiv");
    MIDISettingsDiv.classList.toggle("hidden");

    if (MIDISettingsDiv.classList.contains("hidden")) {
      this.textContent = "Show MIDI Settings";
    } else {
      this.textContent = "Hide MIDI Settings";
    }
  });
