export class Arpeggiator {
  constructor({
    context,
    noteOn,
    noteOff,
    getCurrentAlgoId,
    getOperatorParams,
    masterBus,
    getPitchBend = () => 0,
    getModWheel = () => 0,
    getTremolo = () => ({ rate: 0, depth: 0, delay: 0 }),
    getPitchLFO = () => ({ rate: 0, depth: 0, type: "sine" }),
    rate = 0.25,
    pattern = "up",
    octaveRange = 6,
    customPattern = null,
  }) {
    this.getPitchBend = getPitchBend;
    this.getModWheel = getModWheel;
    this.getTremolo = getTremolo;
    this.getPitchLFO = getPitchLFO;
    this.context = context;
    this.noteOn = noteOn;
    this.noteOff = noteOff;
    this.getCurrentAlgoId = getCurrentAlgoId;
    this.getOperatorParams = getOperatorParams;
    this.masterBus = masterBus;
    this.lastNote = null;
    this.schedulerRunning = false;
    this.nextNoteTime = 0;
    this.swing = 0; // Range: 0 (no swing) to 0.5 (maximum shuffle)
    this.latched = false;
    this.latchedNotes = new Set();
    this.gateTime = 0.9;
    this.pattern = pattern;
    this.rate = rate;
    this.octaveRange = octaveRange;
    this.customPattern = customPattern;
    this.ratchetCount = 1; // default = 1 (no ratcheting)
    this.randomRatchet = false;

    this.heldNotes = new Set();

    this.index = 0;
    this.enabled = false;
    this.activeVoices = new Map();

    setTimeout(() => {
      if (this.enabled && this.heldNotes.size > 0) {
        this.start();
      }
    }, 0);
  }

  addNote(note) {
    const wasEmpty = this.heldNotes.size === 0;
    this.heldNotes.add(note);
    if (this.latched) {
      this.latchedNotes.add(note);
    }
    if (this.enabled && wasEmpty) {
      setTimeout(() => this.start(), 0);
    }
  }

  removeNote(note) {
    if (!this.latched) {
      this.heldNotes.delete(note);
      if (this.heldNotes.size === 0) this.stop();
    }
  }

  getArpNotes() {
    const baseNotes = this.latched
      ? [...this.latchedNotes].sort((a, b) => a - b)
      : [...this.heldNotes].sort((a, b) => a - b);

    const notes = [];

    for (const note of baseNotes) {
      for (let octave = 0; octave < this.octaveRange; octave++) {
        notes.push(note + octave * 12);
      }
    }

    return notes;
  }

  getNextNote(notes) {
    const length = notes.length;
    if (length === 0) return null;
    switch (this.pattern) {
      case "up":
        return notes[this.index % length];
      case "down":
        return notes[length - 1 - (this.index % length)];
      case "updown":
        const bounce = [...notes, ...notes.slice(1, -1).reverse()];
        return bounce[this.index % bounce.length];
      case "random":
        return notes[Math.floor(Math.random() * length)];
      case "converge":
        const half = Math.floor(length / 2);
        const order = [];
        for (let i = 0; i <= half; i++) {
          if (i < length - i) {
            order.push(notes[i], notes[length - 1 - i]);
          } else if (i === length - i) {
            order.push(notes[i]);
          }
        }
        return order[this.index % order.length];
      case "diverge":
        const center = Math.floor(length / 2);
        const divergeOrder = [];
        for (let i = 0; i < length; i++) {
          const left = center - i;
          const right = center + i;
          if (left >= 0) divergeOrder.push(notes[left]);
          if (right < length && right !== left) divergeOrder.push(notes[right]);
        }
        return divergeOrder[this.index % divergeOrder.length];
      case "pairs":
        const pairIndex = Math.floor(this.index / 2) % Math.ceil(length / 2);
        const idx = pairIndex * 2 + (this.index % 2);
        return notes[idx % length];
      case "pedal":
        if (length < 2) return notes[0];
        const pedalNote = notes[0];
        const cycleNote = notes[(this.index >> 1) % length];
        return this.index % 2 === 0 ? pedalNote : cycleNote;
      case "randomwalk":
        if (this.lastIndex === undefined) this.lastIndex = 0;
        const delta = Math.random() < 0.5 ? -1 : 1;
        this.lastIndex = (this.lastIndex + delta + length) % length;
        return notes[this.lastIndex];
      case "euclidean":
        const euclidPattern = this.euclideanPattern || [1, 0, 1, 0, 1, 0, 0, 0];
        const pos = this.index % euclidPattern.length;
        return euclidPattern[pos] ? notes[this.index % length] : null;
      case "custom":
        if (!this.customPattern || this.customPattern.length === 0) return null;
        const step = this.customPattern[this.index % this.customPattern.length];
        return typeof step === "number" && notes[step] !== undefined
          ? notes[step]
          : null;
      case "up2down1":
        if (!this._udState) {
          this._udState = { direction: 1, pos: 0, sequence: [] };
        }
        const ud = this._udState;
        if (ud.sequence.length !== notes.length * 3) {
          ud.sequence = [];
          let i = 0;
          while (i < notes.length) {
            if (i + 1 < notes.length) ud.sequence.push(notes[i], notes[i + 1]);
            if (i + 2 < notes.length) ud.sequence.push(notes[i + 1]); // go back 1
            i += 2;
          }
        }
        return ud.sequence[this.index % ud.sequence.length];
      case "zigzag": {
        const sortedNotes = [...notes];
        const zigzagSeq = [];
        const len = sortedNotes.length;
        for (let i = 0; i < Math.ceil(len / 2); i++) {
          zigzagSeq.push(sortedNotes[i]);
          const mirrored = sortedNotes[len - 1 - i];
          if (mirrored !== sortedNotes[i]) {
            zigzagSeq.push(mirrored);
          }
        }
        return zigzagSeq[this.index % zigzagSeq.length];
      }
      case "mirror":
        const up = notes;
        const down = [...notes].reverse().slice(1);
        const mirrored = up.concat(down);
        return mirrored[this.index % mirrored.length];
      default:
        return notes[this.index % length];
    }
  }

  start() {
    if (this.schedulerRunning || this.heldNotes.size === 0) return;

    this.index = 0;
    this.schedulerRunning = true;
    this.nextNoteTime = this.context.currentTime;

    this.schedule();
  }

  stop() {
    this.schedulerRunning = false;

    if (this.lastNote != null) {
      this.noteOff(this.lastNote);
      this.lastNote = null;
    }
  }

  setSwing(amount) {
    this.swing = Math.max(0, Math.min(0.5, amount)); // clamp between 0 and 0.5
  }

  schedule() {
    if (!this.schedulerRunning || !this.enabled || this.heldNotes.size === 0)
      return;

    while (this.nextNoteTime < this.context.currentTime + 0.1) {
      const notes = this.getArpNotes();
      const note = this.getNextNote(notes);
      const ratchet = this.randomRatchet
        ? Math.floor(Math.random() * this.ratchetCount) + 1
        : this.ratchetCount;

      if (typeof note === "number") {
        const stepDuration = this.rate;
        const ratchetDuration = stepDuration / ratchet;

        for (let i = 0; i < ratchet; i++) {
          const triggerTime = this.nextNoteTime + i * ratchetDuration;

          setTimeout(() => {
            this.noteOn(
              this.context,
              note,
              100,
              this.getOperatorParams,
              this.getCurrentAlgoId(),
              this.masterBus,
              this.getTremolo().delay,
              this.getTremolo().rate,
              this.getTremolo().depth,
              this.getPitchLFO().rate,
              this.getPitchLFO().depth,
              this.getPitchLFO().type,
              "mono",
              0.0,
              this.masterBus,
              this.getPitchBend(),
              this.getModWheel()
            );
          }, (triggerTime - this.context.currentTime) * 1000);
          const offTime = triggerTime + ratchetDuration * this.gateTime;
          setTimeout(() => {
            this.noteOff(note);
          }, (offTime - this.context.currentTime) * 1000);
        }
        this.lastNote = note;
      }

      if (typeof note === "number") {
        this.noteOn(
          this.context,
          note,
          100,
          this.getOperatorParams,
          this.getCurrentAlgoId(),
          this.masterBus,
          this.getTremolo().delay,
          this.getTremolo().rate,
          this.getTremolo().depth,
          this.getPitchLFO().rate,
          this.getPitchLFO().depth,
          this.getPitchLFO().type,
          "mono",
          0.0,
          this.masterBus,
          this.getPitchBend(),
          this.getModWheel()
        );

        this.lastNote = note;
      }

      this.index++;
      const isSwingStep = this.index % 2 === 1;
      const swingOffset = isSwingStep ? this.rate * this.swing : 0;
      this.nextNoteTime += this.rate + swingOffset;
    }

    requestAnimationFrame(() => this.schedule());
  }

  toggle(on) {
    this.enabled = on;
    if (on && this.heldNotes.size > 0) {
      this.start();
    } else {
      this.stop();
    }
  }

  setRate(rate) {
    this.rate = rate;
    this.refresh();
  }

  setPattern(pattern) {
    this.pattern = pattern;
    this.refresh();
  }

  setOctaveRange(range) {
    this.octaveRange = range;
    this.index = 0;
    this.refresh();
  }

  setCustomPattern(patternArray) {
    this.customPattern = patternArray;
    this.pattern = "custom";
    this.index = 0;
    this.refresh();
  }

  setSwing(amount) {
    this.swing = Math.max(0, Math.min(0.5, amount));
    this.refresh();
  }

  setLatched(state) {
    this.latched = state;
    if (!state) {
      this.latchedNotes.clear();
      if (this.heldNotes.size === 0) this.stop();
    }
  }

  setGateTime(gate) {
    this.gateTime = Math.max(0.05, Math.min(1.0, gate));
  }

  setRatchetCount(count) {
    this.ratchetCount = Math.max(1, Math.floor(count));
  }

  enableRandomRatchet(enabled) {
    this.randomRatchet = enabled;
  }

  refresh() {
    if (this.enabled && this.heldNotes.size > 0) {
      this.stop();
      this.start();
    }
  }
}
