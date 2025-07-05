let keyboardOctave = 0;

export function setupKeyboard(
  synth,
  getKeyboardOctave,
  setKeyboardOctave,
  getMusicalTypingEnabled
) {
  const keyToNote = {
    a: 0,
    w: 1,
    s: 2,
    e: 3,
    d: 4,
    f: 5,
    t: 6,
    g: 7,
    y: 8,
    h: 9,
    u: 10,
    j: 11,
    k: 12,
  };
  const heldKeys = new Set();

  window.addEventListener("keydown", (e) => {
    if (!getMusicalTypingEnabled()) return; // <-- Only respond if enabled
    if (e.repeat) return;
    if (e.key === "z") {
      setKeyboardOctave(Math.max(-2, getKeyboardOctave() - 1));
      console.log("Octave down:", getKeyboardOctave());
      return;
    } else if (e.key === "x") {
      setKeyboardOctave(Math.min(5, getKeyboardOctave() + 1));
      console.log("Octave up:", getKeyboardOctave());
      return;
    }

    const semitoneOffset = keyToNote[e.key];
    if (semitoneOffset !== undefined && !heldKeys.has(e.key)) {
      heldKeys.add(e.key);
      const midiNote = 60 + getKeyboardOctave() * 12 + semitoneOffset;
      synth.noteOn(midiNote, 1.0);
    }
  });

  window.addEventListener("keyup", (e) => {
    if (!getMusicalTypingEnabled()) return; // <-- Only respond if enabled
    const semitoneOffset = keyToNote[e.key];
    if (semitoneOffset !== undefined) {
      heldKeys.delete(e.key);
      const midiNote = 60 + getKeyboardOctave() * 12 + semitoneOffset;
      synth.noteOff(midiNote);
    }
  });
}
