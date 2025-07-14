export class Arpeggiator {
  constructor({
    context,
    noteOn,
    noteOff,
    rate = 0.25,
    pattern = "up",
    octaveRange = 6,
    customPattern = null,
  }) {
    this.context = context;
    this.noteOn = noteOn;
    this.noteOff = noteOff;
    this.lastNote = null;
    this.schedulerRunning = false;
    this.nextNoteTime = 0;
    this.swing = 0;
    this.latched = false;
    this.latchedNotes = new Set();
    this.gateTime = 0.9;
    this.pattern = pattern;
    this.rate = rate;
    this.octaveRange = octaveRange;
    this.customPattern = customPattern;
    this.ratchetCount = 1;
    this.randomRatchet = false;

    this.heldNotes = new Set();
    this.index = 0;
    this.enabled = false;

    setTimeout(() => {
      if (this.enabled && this.heldNotes.size > 0) {
        this.start();
      }
    }, 0);
  }

  addNote(note) {
    const wasEmpty = this.heldNotes.size === 0;
    this.heldNotes.add(note);
    console.log("[Arp] Added note:", note);
    if (this.latched) this.latchedNotes.add(note);
    if (this.enabled && wasEmpty) setTimeout(() => this.start(), 0);
  }

  removeNote(note) {
    if (!this.latched) {
      this.heldNotes.delete(note);
      if (this.heldNotes.size === 0) this.stop();
    }
  }

  getArpNotes() {
    const base = this.latched ? [...this.latchedNotes] : [...this.heldNotes];
    const sorted = base.sort((a, b) => a - b);
    const notes = [];
    for (const note of sorted) {
      for (let i = 0; i < this.octaveRange; i++) notes.push(note + i * 12);
    }
    return notes;
  }

  getNextNote(notes) {
    const len = notes.length;
    if (len === 0) return null;
    const i = this.index;

    switch (this.pattern) {
      case "up":
        return notes[i % len];
      case "down":
        return notes[len - 1 - (i % len)];
      case "updown": {
        const seq = [...notes, ...notes.slice(1, -1).reverse()];
        return seq[i % seq.length];
      }
      case "random":
        return notes[Math.floor(Math.random() * len)];
      case "randomwalk": {
        if (this.lastIndex === undefined || this.lastIndex >= len)
          this.lastIndex = 0;
        const delta = Math.random() < 0.5 ? -1 : 1;
        this.lastIndex = (this.lastIndex + delta + len) % len;
        return notes[this.lastIndex];
      }
      case "converge": {
        const mid = Math.floor(len / 2);
        const order = [];
        for (let j = 0; j <= mid; j++) {
          if (j < len - j) order.push(notes[j], notes[len - 1 - j]);
          else if (j === len - j) order.push(notes[j]);
        }
        return order[i % order.length];
      }
      case "diverge": {
        const center = Math.floor(len / 2);
        const order = [];
        for (let j = 0; j < len; j++) {
          const l = center - j,
            r = center + j;
          if (l >= 0) order.push(notes[l]);
          if (r < len && r !== l) order.push(notes[r]);
        }
        return order[i % order.length];
      }
      case "pairs": {
        const pairIdx = Math.floor(i / 2) % Math.ceil(len / 2);
        const idx = pairIdx * 2 + (i % 2);
        return notes[idx % len];
      }
      case "pedal": {
        const base = notes[0];
        const cycle = notes[(i >> 1) % len];
        return i % 2 === 0 ? base : cycle;
      }
      case "mirror": {
        const seq = [...notes, ...[...notes].reverse().slice(1)];
        return seq[i % seq.length];
      }
      case "zigzag": {
        const seq = [];
        for (let j = 0; j < Math.ceil(len / 2); j++) {
          seq.push(notes[j]);
          const mirror = notes[len - 1 - j];
          if (mirror !== notes[j]) seq.push(mirror);
        }
        return seq[i % seq.length];
      }
      case "up2down1": {
        const seq = [];
        for (let j = 0; j < len; j += 2) {
          if (j + 1 < len) seq.push(notes[j], notes[j + 1], notes[j + 1]);
          else seq.push(notes[j]);
        }
        return seq[i % seq.length];
      }
      case "euclidean": {
        const pattern = this.euclideanPattern || [1, 0, 1, 0, 1, 0, 0, 0];
        return pattern[i % pattern.length] ? notes[i % len] : null;
      }
      case "custom": {
        if (!Array.isArray(this.customPattern)) return null;
        const idx = this.customPattern[i % this.customPattern.length];
        return typeof idx === "number" && notes[idx] !== undefined
          ? notes[idx]
          : null;
      }
      case "up3down1": {
        const seq = [];
        for (let j = 0; j < len - 2; j++) {
          seq.push(notes[j], notes[j + 1], notes[j + 2], notes[j + 1]);
        }
        return seq[i % seq.length];
      }
      case "pendulum": {
        const seq = [...notes, ...notes.slice(0, -1).reverse()];
        return seq[i % seq.length];
      }
      case "brownian": {
        if (this.lastIndex === undefined || this.lastIndex >= len)
          this.lastIndex = 0;
        const delta =
          Math.random() < 0.7
            ? Math.random() < 0.5
              ? -1
              : 1
            : Math.random() < 0.5
            ? -2
            : 2;
        this.lastIndex = (this.lastIndex + delta + len) % len;
        return notes[this.lastIndex];
      }
      case "polyrhythm": {
        const rhythm = this.rhythmPattern || [1, 0, 1];
        return rhythm[i % rhythm.length] ? notes[i % len] : null;
      }
      case "stepskip": {
        const skipEvery = 3;
        return i % skipEvery === skipEvery - 1 ? null : notes[i % len];
      }
      case "spiral": {
        const seq = [];
        for (let j = 0; j < Math.ceil(len / 2); j++) {
          if (j < len - j) {
            seq.push(notes[j], notes[len - 1 - j]);
          } else if (j === len - j) {
            seq.push(notes[j]);
          }
        }
        return seq[i % seq.length];
      }
      case "fractal": {
        const base = [0];
        for (let j = 1; j < len; j++) {
          base.push(0, j);
        }
        return notes[base[i % base.length] % len];
      }
      case "echo": {
        const repeats = 3;
        return notes[Math.floor(i / repeats) % len];
      }
      case "clusterrandom": {
        if (!this.cluster || i % 4 === 0) {
          this.cluster = [];
          const size = Math.min(3, len);
          while (this.cluster.length < size) {
            const randNote = notes[Math.floor(Math.random() * len)];
            if (!this.cluster.includes(randNote)) this.cluster.push(randNote);
          }
        }
        return this.cluster[i % this.cluster.length];
      }
      case "fibonacci": {
        if (!this.fibSeq || this.fibSeqLen !== len) {
          this.fibSeq = [0, 1];
          while (this.fibSeq.length <= 100) {
            this.fibSeq.push(
              (this.fibSeq[this.fibSeq.length - 1] +
                this.fibSeq[this.fibSeq.length - 2]) %
                len
            );
          }
          this.fibSeqLen = len;
        }
        return notes[this.fibSeq[i % this.fibSeq.length]];
      }
      case "golden": {
        const phi = 1.61803398875;
        const idx = Math.floor((i * phi) % len);
        return notes[idx];
      }
      default:
        return notes[i % len];
    }
  }

  start() {
    if (this.schedulerRunning || this.heldNotes.size === 0) return;
    this.index = 0; // <== reset index cleanly here
    this.nextNoteTime = this.context.currentTime; // <== also reset this!
    this.schedulerRunning = true;
    this.schedule();
  }

  stop() {
    this.schedulerRunning = false;
    if (this.lastNote != null) this.noteOff(this.lastNote);
    this.lastNote = null;
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
        const dur = this.rate / ratchet;
        for (let i = 0; i < ratchet; i++) {
          const onTime = this.nextNoteTime + i * dur;
          const offTime = onTime + dur * this.gateTime;

          setTimeout(
            () => this.noteOn(note, 100),
            (onTime - this.context.currentTime) * 1000
          );
          setTimeout(
            () => this.noteOff(note),
            (offTime - this.context.currentTime) * 1000
          );
        }
        this.lastNote = note;
      }

      this.index = (this.index + 1) % 999999;
      const swing = this.index % 2 === 1 ? this.rate * this.swing : 0;
      this.nextNoteTime += this.rate + swing;
    }

    requestAnimationFrame(() => this.schedule());
  }

  toggle(on) {
    this.enabled = on;
    on ? this.start() : this.stop();
  }

  setRate(rate) {
    this.rate = rate;
  }
  setPattern(pattern) {
    this.pattern = pattern;
    this.refresh();
  }
  setOctaveRange(range) {
    this.octaveRange = range;
  }
  setCustomPattern(pat) {
    this.customPattern = pat;
    this.pattern = "custom";
    this.index = 0;
  }
  setSwing(amount) {
    this.swing = Math.max(0, Math.min(0.5, amount));
  }
  setLatched(state) {
    this.latched = state;
    if (!state) this.latchedNotes.clear();
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
    this.index = 0;
    this.lastIndex = 0; // reset randomwalk state if used
    if (this.enabled && this.heldNotes.size > 0) {
      this.stop();
      this.start();
    }
  }
}
