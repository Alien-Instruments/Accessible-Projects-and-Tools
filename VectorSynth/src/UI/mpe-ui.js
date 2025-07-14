import { MPE_DEST_OPTIONS } from "../MPE/mpe-dest.js";

export function setupMPEUI(synth) {
  const mpeToggle = document.getElementById("toggle-mpe");
  const mpeModDiv = document.getElementById("MPE-Mod");

  // Toggle MPE on/off
  mpeToggle.addEventListener("click", () => {
    synth.enableMPE(!synth.mpeEnabled);
    mpeToggle.textContent = synth.mpeEnabled ? "Disable MPE" : "Enable MPE";
    mpeModDiv.style.display = synth.mpeEnabled ? "" : "none";
    if (synth.mpeEnabled) {
      mpeModDiv.setAttribute("tabindex", "-1");
      mpeModDiv.focus();
    }
  });

  updateMPESelects(synth);

  ["pitchBendDest", "aftertouchDest", "modWheelDest", "slideDest"].forEach(
    (key) => {
      document.getElementById(key).addEventListener("change", (e) => {
        synth.mpeDestinations[key] = e.target.value;

        // Update current voices
        synth.activeVoices.forEach((v) => (v[key] = e.target.value));

        // For MPE mode, update channel-based voices
        Object.values(synth.channelToVoice).forEach((v) => {
          v[key] = e.target.value;
        });
      });
    }
  );
}

function updateMPESelects(synth) {
  populateSelect(
    "pitchBendDest",
    MPE_DEST_OPTIONS.pitchBendDest,
    synth.mpeDestinations.pitchBendDest
  );
  populateSelect(
    "aftertouchDest",
    MPE_DEST_OPTIONS.aftertouchDest,
    synth.mpeDestinations.aftertouchDest
  );
  populateSelect(
    "modWheelDest",
    MPE_DEST_OPTIONS.modWheelDest,
    synth.mpeDestinations.modWheelDest
  );
  populateSelect(
    "slideDest",
    MPE_DEST_OPTIONS.slideDest,
    synth.mpeDestinations.slideDest
  );
}

function populateSelect(id, options, current) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";
  options.forEach((opt) => {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = opt.label;
    if (current === opt.value) el.selected = true;
    sel.appendChild(el);
  });
}
