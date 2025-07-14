import { registerMIDIHandler } from "./midi.js";

export function setupMIDIHandler(synth, arp) {
  registerMIDIHandler((msg) => {
    const [status, data1, data2] = msg.data;
    const command = status & 0xf0;
    const channel = (status & 0x0f) + 1; // Channels are 1-based in MPE
    // MPE typically uses channels 2-16 for per-note, channel 1 for global

    // --- Pitch Bend ---
    if (command === 0xe0) {
      // Pitch Bend
      const value14bit = (data2 << 7) | data1; // (data2 = MSB, data1 = LSB)
      if (synth.mpeEnabled) {
        synth.handleMPEPitchBend(channel, value14bit);
      } else {
        synth.setPitchBend(value14bit); // Your old method
      }
      return;
    }

    // --- Channel Aftertouch ---
    if (command === 0xd0) {
      if (synth.mpeEnabled) {
        synth.handleMPEAftertouch(channel, data1);
      } else {
        synth.setAftertouch?.(data1 / 127);
      }
      return;
    }

    // --- Control Change (CC) ---
    if (command === 0xb0) {
      if (data1 === 1) {
        // Mod Wheel (CC1)
        if (synth.mpeEnabled) {
          synth.handleMPEModWheel(channel, data2 / 127);
        } else {
          synth.setModWheel?.(data2 / 127);
        }
        return;
      }
      if (data1 === 74) {
        // SLIDE (CC74) - ROLI Seaboard "slide"
        if (synth.mpeEnabled) {
          synth.handleMPESlide(channel, data2 / 127);
        }
        // Optionally: in non-MPE mode, you could map CC74 globally here.
        return;
      }
      // You can handle other CCs as needed here.
    }

    // --- Note On/Off ---
    if (synth.mpeEnabled && channel >= 2 && channel <= 16) {
      // Only handle channels 2-16 for per-note in MPE
      if (command === 0x90 && data2 > 0) {
        if (arp.enabled) {
          arp.addNote(data1, data2);
        } else {
          synth.noteOnMPE(data1, data2, channel);
        }
      } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
        if (arp.enabled) {
          arp.removeNote(data1);
        } else {
          synth.noteOffMPE(data1, channel);
        }
      }
    } else {
      // Legacy handling (mono/poly)
      if (command === 0x90 && data2 > 0) {
        if (arp.enabled) {
          arp.addNote(data1, data2);
        } else {
          synth.noteOn(data1, data2);
        }
      } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
        if (arp.enabled) {
          arp.removeNote(data1);
        } else {
          synth.noteOff(data1);
          if (synth.uiModEnvs) {
            synth.uiModEnvs.forEach((env) => env.releaseEnv());
          }
          if (synth.setReleaseVelocity) {
            synth.setReleaseVelocity(data2); // <-- RELEASE VELOCITY
          }
        }
      }
    }
  });
}
