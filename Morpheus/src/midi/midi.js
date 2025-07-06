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
        handleMIDIMessage(msg, synth);
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

function handleMIDIMessage(msg, synth) {
  const [status, data1, data2] = msg.data;
  const command = status & 0xf0;
  if (command === 0x90 && data2 > 0) {
    // NOTE ON
    const note = data1;
    const velocity = data2 / 127;
    synth.noteOn(note, velocity);
    if (synth.uiModEnvs) {
      synth.uiModEnvs.forEach((env) => env.trigger());
    }
  } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
    // NOTE OFF (with release velocity)
    const note = data1;
    const releaseVel = data2 / 127; // data2 is release velocity for 0x80 NOTE OFF
    synth.noteOff(note, releaseVel); // pass release velocity to noteOff
    if (synth.uiModEnvs) {
      synth.uiModEnvs.forEach((env) => env.releaseEnv());
    }
    if (synth.setReleaseVelocity) {
      synth.setReleaseVelocity(releaseVel);
    }
  } else if (command === 0xe0) {
    // PITCH BEND
    const value14bit = (data2 << 7) | data1;
    const bend = (value14bit - 8192) / 8192;
    synth.setPitchBend?.(bend);
  } else if (command === 0xb0 && data1 === 1) {
    // MOD WHEEL
    synth.setModWheel?.(data2 / 127);
  } else if (command === 0xd0) {
    // CHANNEL PRESSURE (aftertouch)
    synth.setAftertouch?.(data1 / 127);
  }
}

export function getSelectedMIDIChannel() {
  return selectedChannel;
}

export function getCurrentMIDIInput() {
  return currentInput;
}
