import { Arpeggiator } from "../arpeggiator/arpeggiator.js";
import { audioCtx } from "../utils/audioCtx.js";

let arp;

export function createArpeggiator(synth) {
  arp = new Arpeggiator({
    context: audioCtx,
    noteOn: (note, velocity) => synth.noteOn(note, velocity),
    noteOff: (note) => synth.noteOff(note),
    rate: 0.25,
    pattern: "up",
    octaveRange: 6,
  });

  // Optional reset if pre-enabled
  if (arp.enabled && arp.heldNotes.size > 0) {
    arp.stop();
    arp.start();
  }

  return arp;
}

export function getArp() {
  return arp;
}
