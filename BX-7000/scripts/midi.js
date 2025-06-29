export function setupMIDI(handleMIDIMessage) {
  if (!navigator.requestMIDIAccess) {
    console.warn("Web MIDI API not supported in this browser.");
    return;
  }

  let midiIn = null;

  navigator
    .requestMIDIAccess()
    .then((midiAccess) => {
      const midiInputSelect = document.getElementById("midiInputSelect");
      if (!midiInputSelect) {
        console.warn("No <select> element with ID 'midiInputSelect' found.");
        return;
      }
      midiInputSelect.innerHTML = "";

      const inputNoneOption = document.createElement("option");
      inputNoneOption.value = "";
      inputNoneOption.textContent = "None";
      midiInputSelect.appendChild(inputNoneOption);

      // Populate MIDI input options
      for (const input of midiAccess.inputs.values()) {
        const option = document.createElement("option");
        option.value = input.id;
        option.textContent = input.name;
        midiInputSelect.appendChild(option);
      }

      // Handle selection changes
      midiInputSelect.addEventListener("change", (event) => {
        const selectedId = event.target.value;

        // Disconnect previous input
        if (midiIn) {
          midiIn.onmidimessage = null;
          midiIn = null;
        }

        if (selectedId && midiAccess.inputs.has(selectedId)) {
          midiIn = midiAccess.inputs.get(selectedId);
          midiIn.onmidimessage = (msg) => {
            try {
              handleMIDIMessage(msg);
            } catch (err) {
              console.error("MIDI handler error:", err, msg);
            }
          };

          console.log("🎵 Listening to:", midiIn.name);
        } else {
          console.log("🚫 MIDI input set to none.");
        }
      });
    })
    .catch((err) => {
      console.error("Failed to access MIDI devices:", err);
    });
}
