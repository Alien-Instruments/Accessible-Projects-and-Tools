let midiAccess = null;
let currentInput = null;
let selectedChannel = 1;
const externalHandlers = [];

export function registerMIDIHandler(fn) {
  externalHandlers.push(fn);
}

export async function setupMIDI(synth, uiContainerId = "midi-ui") {
  if (!navigator.requestMIDIAccess) {
    console.warn("Web MIDI is not supported in this browser.");
    return;
  }

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const container = document.getElementById(uiContainerId);
    container.innerHTML = "";

    const deviceWrapper = document.createElement("div");
    deviceWrapper.className = "midi-select-wrapper";

    const deviceLabel = document.createElement("label");
    deviceLabel.textContent = "MIDI Device ";
    deviceLabel.setAttribute("for", "midi-device-select");

    const deviceSelect = document.createElement("select");
    deviceSelect.id = "midi-device-select";
    deviceSelect.className = "lcd-select";
    deviceWrapper.appendChild(deviceLabel);
    deviceWrapper.appendChild(deviceSelect);

    const channelWrapper = document.createElement("div");
    channelWrapper.className = "midi-select-wrapper";

    const channelLabel = document.createElement("label");
    channelLabel.textContent = "MIDI Channel ";
    channelLabel.setAttribute("for", "midi-channel-select");

    const channelSelect = document.createElement("select");
    channelSelect.id = "midi-channel-select";
    channelSelect.className = "lcd-select";
    for (let ch = 1; ch <= 16; ch++) {
      const opt = document.createElement("option");
      opt.value = ch;
      opt.textContent = `Channel ${ch}`;
      channelSelect.appendChild(opt);
    }

    channelWrapper.appendChild(channelLabel);
    channelWrapper.appendChild(channelSelect);

    container.appendChild(deviceWrapper);
    container.appendChild(channelWrapper);

    channelSelect.addEventListener("change", (e) => {
      selectedChannel = parseInt(e.target.value);
    });

    const filteredMIDIHandler = (msg) => {
      const [status] = msg.data;
      const channel = (status & 0x0f) + 1;
      if (channel === selectedChannel) {
        // Don't call handleMIDIMessage(msg, synth);
        externalHandlers.forEach((fn) => fn(msg));
      }
    };

    const inputsMap = new Map();
    for (let input of midiAccess.inputs.values()) {
      inputsMap.set(input.id, input);
      const opt = document.createElement("option");
      opt.value = input.id;
      opt.textContent = input.name;
      deviceSelect.appendChild(opt);
    }

    const attachInputHandler = (inputId) => {
      for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = null;
      }
      currentInput = inputsMap.get(inputId);
      if (currentInput) {
        currentInput.onmidimessage = filteredMIDIHandler;
        console.log(`Connected to MIDI: ${currentInput.name}`);
      }
    };

    deviceSelect.addEventListener("change", (e) => {
      attachInputHandler(e.target.value);
    });

    if (deviceSelect.options.length > 0) {
      deviceSelect.selectedIndex = 0;
      attachInputHandler(deviceSelect.value);
    }

    midiAccess.onstatechange = (e) => {
      console.log(`MIDI ${e.port.name} ${e.port.state}`);
    };
  } catch (err) {
    console.error("Error accessing MIDI:", err);
  }
}

export function getSelectedMIDIChannel() {
  return selectedChannel;
}

export function getCurrentMIDIInput() {
  return currentInput;
}
