import { Voice } from "./Voice.js";

function assignPansToNotes(midiNotes) {
  const total = midiNotes.length;
  midiNotes = midiNotes.slice().sort((a, b) => a - b);
  return midiNotes.map((note, i) => ({
    note,
    pan: getVoicePan(i, total),
  }));
}
function getVoicePan(index, totalVoices) {
  if (totalVoices === 1) return 0;
  const panSpread = 0.9;
  return (
    panSpread * ((index - (totalVoices - 1) / 2) / ((totalVoices - 1) / 2))
  );
}

export class PolySynth {
  constructor(
    audioCtx,
    unison = 1,
    detuneCents = 10,
    envelope = {},
    maxPolyphony = 8,
    mode = "poly",
    glideMode = "legato",
    filter = {
      cutoff: 12000,
      resonance: 0.8,
      env: { attack: 0.1, decay: 0.2, sustain: 0.0, release: 0.2 },
      envDepth: 0.5,
    },
    mpeDestinations = {}
  ) {
    this.filter = { ...filter };
    this.filterCutoff = filter.cutoff;
    this.filterResonance = filter.resonance;
    this.filterEnvDepth = filter.envDepth;
    this.filterEnv = { ...filter.env };
    this.glideMode = glideMode;
    this.ctx = audioCtx;
    this.unison = unison;
    this.detuneCents = detuneCents;
    this.envelope = envelope;
    this.vectorMix = { x: 0.5, y: 0.5 };
    this.glideTime = 0.0;
    this.pitchBend = 0;
    this.voices = {};
    this.activeVoices = [];
    this.maxPolyphony = maxPolyphony;
    this.mode = mode;
    this.lastFreq = null;
    this.lastNote = null;
    this.noteStack = [];
    this.activeNotes = [];
    this.mpeEnabled = false;
    this.channelToVoice = {};
    this.noteToChannel = {};
    this.retiringVoices = [];
    this.oscParams = [
      {
        type: "sawtooth",
        octave: 0,
        semitone: 0,
        fineTune: 0,
        detuneCents: 10,
        gain: 1,
      },
      {
        type: "triangle",
        octave: 0,
        semitone: 0,
        fineTune: 0,
        detuneCents: 10,
        gain: 1,
      },
      {
        type: "square",
        octave: 0,
        semitone: 0,
        fineTune: 0,
        detuneCents: 10,
        gain: 1,
      },
      {
        type: "sine",
        octave: 0,
        semitone: 0,
        fineTune: 0,
        detuneCents: 10,
        gain: 1,
      },
    ];
    this.mpeDestinations = {
      pitchBendDest: mpeDestinations.pitchBendDest || "pitch",
      aftertouchDest: mpeDestinations.aftertouchDest || "filter",
      modWheelDest: mpeDestinations.modWheelDest || "vibrato",
      slideDest: mpeDestinations.slideDest || "vectorX",
    };
  }
  _createVoice(note, pan = 0, driftCents = 0) {
    return new Voice(
      this.ctx,
      note,
      this.vectorMix,
      this.unison,
      this.detuneCents,
      { ...this.envelope },
      {
        cutoff: this.filterCutoff,
        resonance: this.filterResonance,
        env: { ...this.filterEnv },
        envDepth: this.filterEnvDepth,
        type: this.filterType,
      },
      pan,
      driftCents,
      this.oscParams,
      this.mpeDestinations
    );
  }
  setFilter(cutoff, resonance) {
    this.filterCutoff = cutoff;
    this.filterResonance = resonance;
    for (const v of this.activeVoices) v.setFilter(cutoff, resonance);
  }
  setFilterEnv(env, depth) {
    if (env) this.filterEnv = { ...this.filterEnv, ...env };
    if (typeof depth === "number") this.filterEnvDepth = depth;
    for (const v of this.activeVoices)
      v.setFilterEnv?.(this.filterEnv, this.filterEnvDepth);
  }
  setGlideMode(mode) {
    this.glideMode = mode;
  }
  setMode(mode) {
    this.mode = mode;
    this.activeVoices.forEach((v) => v.noteOff());
    this.voices = {};
    this.activeVoices = [];
    this.lastFreq = null;
    this.lastNote = null;
    this.noteStack = [];
  }
  noteOn(midiNote, velocity = 100) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    if (this.mode === "mono") {
      this.noteStack = this.noteStack.filter((n) => n !== midiNote);
      this.noteStack.push(midiNote);

      let voice = this.activeVoices[0];
      if (!voice) {
        voice = this._createVoice(midiNote, 0, 0);
        voice.glideTime = this.glideTime;
        if (typeof this.pitchBend === "number") {
          voice.setPitchBend(this.pitchBend);
        }
        this.activeVoices.push(voice);
      }
      // Glide
      let shouldGlide = false;
      if (this.glideMode === "always")
        shouldGlide = this.lastFreq !== null && this.glideTime > 0;
      else if (this.glideMode === "legato")
        shouldGlide = this.noteStack.length > 1 && this.glideTime > 0;
      voice.currentFreq = shouldGlide ? this.lastFreq : null;
      voice.glideTime = this.glideTime;
      voice.setNote(midiNote, shouldGlide);
      voice.note = midiNote;
      this.voices = { [midiNote]: voice };
      voice.noteOn(velocity);

      this.lastFreq = freq;
      this.lastNote = midiNote;
      return;
    }
    // POLY MODE
    if (!this.activeNotes.includes(midiNote)) this.activeNotes.push(midiNote);
    if (this.activeNotes.length > this.maxPolyphony) {
      const oldestNote = this.activeNotes.shift();
      const oldestVoice = this.voices[oldestNote];
      if (oldestVoice) {
        oldestVoice.noteOff();
        this.retiringVoices.push(oldestVoice);
        const idx = this.activeVoices.indexOf(oldestVoice);
        if (idx !== -1) this.activeVoices.splice(idx, 1);
        delete this.voices[oldestNote];
        setTimeout(() => {
          const idx = this.retiringVoices.indexOf(oldestVoice);
          if (idx !== -1) this.retiringVoices.splice(idx, 1);
          oldestVoice.dispose?.();
        }, (oldestVoice.env.release ?? 0.2) * 1000 + 50);
      }
    }

    const notePanPairs = assignPansToNotes(this.activeNotes);
    const now = this.ctx.currentTime;

    notePanPairs.forEach(({ note, pan }, i) => {
      let voice = this.voices[note];

      const delayTime = now + i * 0.001; // Stagger to avoid simultaneous gain ramps

      if (!voice) {
        const driftAmount = 5;
        const driftCents = (Math.random() - 0.5) * 2 * driftAmount;
        voice = this._createVoice(note, pan, driftCents);
        if (typeof this.pitchBend === "number") {
          voice.setPitchBend(this.pitchBend);
        }
        voice.glideTime = this.glideTime;
        voice.setNote(note, false);
        this.voices[note] = voice;
        this.activeVoices.push(voice);
        if (note === midiNote) {
          setTimeout(() => voice.noteOn(velocity), i);
        }
      } else {
        // Smooth pan transition
        if (voice.panner && voice.panner.pan.value !== pan) {
          voice.panner.pan.cancelScheduledValues(now);
          voice.panner.pan.setValueAtTime(voice.panner.pan.value, now);
          voice.panner.pan.linearRampToValueAtTime(pan, now + 0.01);
        }

        // Only trigger if not already releasing
        if (
          note === midiNote &&
          !voice.releasing &&
          voice.isIdle?.() === false
        ) {
          setTimeout(() => voice.noteOn(velocity), i);
        }
      }
    });
  }
  noteOff(midiNote) {
    if (this.mode === "mono") {
      this.noteStack = this.noteStack.filter((n) => n !== midiNote);
      if (this.noteStack.length > 0) {
        const prevNote = this.noteStack[this.noteStack.length - 1];
        const freq = 440 * Math.pow(2, (prevNote - 69) / 12);
        const voice = this.activeVoices[0];
        let shouldGlide =
          (this.glideMode === "always" && this.glideTime > 0) ||
          (this.glideMode === "legato" && this.glideTime > 0);
        voice.currentFreq = this.lastFreq;
        voice.glideTime = this.glideTime;
        voice.setNote(prevNote, shouldGlide);
        voice.note = prevNote;
        this.voices = { [prevNote]: voice };
        this.lastFreq = freq;
        this.lastNote = prevNote;
      } else {
        if (this.activeVoices[0]) {
          this.activeVoices[0].noteOff();
        }
        this.voices = {};
        this.activeVoices = [];
        this.lastNote = null;
      }
      return;
    }
    // POLY
    this.activeNotes = this.activeNotes.filter((n) => n !== midiNote);
    const voice = this.voices[midiNote];
    if (voice) {
      this.lastFreq = voice.currentFreq;
      voice.noteOff();
      const idx = this.activeVoices.indexOf(voice);
      if (idx !== -1) this.activeVoices.splice(idx, 1);
      delete this.voices[midiNote];
    }
    const notePanPairs = assignPansToNotes(this.activeNotes);
    notePanPairs.forEach(({ note, pan }) => {
      let v = this.voices[note];
      if (v && v.panner && v.panner.pan.value !== pan) {
        v.panner.pan.value = pan;
      }
    });
  }
  setVector(x, y) {
    this.vectorMix = { x, y };
    for (const v of this.activeVoices) {
      v.updateMix(x, y);
    }
  }
  setPitchBend(value) {
    const range = 2;
    const bend = ((value - 8192) / 8192) * range;
    for (const v of this.activeVoices) {
      v.setPitchBend(bend);
    }
    this.pitchBend = bend;
  }
  setDetuneAll(detuneCents) {
    for (const v of this.activeVoices) {
      if (v.setDetune) v.setDetune(detuneCents);
    }
  }
  setFilterType(type) {
    this.filterType = type;
    for (const v of this.activeVoices) {
      if (typeof v.setFilterType === "function") {
        v.setFilterType(type);
        console.log("Set voice filter type to", type);
      }
    }
  }
  getVoicePan(index, totalVoices) {
    return getVoicePan(index, totalVoices);
  }
  setOscType(index, type) {
    this.oscParams[index].type = type;
    for (const v of this.activeVoices) v.setOscType(index, type);
  }
  setOscOctave(index, oct) {
    this.oscParams[index].octave = oct;
    for (const v of this.activeVoices) v.setOscOctave?.(index, oct);
  }
  setOscSemitone(index, st) {
    this.oscParams[index].semitone = st;
    for (const v of this.activeVoices) v.setOscSemitone?.(index, st);
  }
  setOscFineTune(index, cents) {
    this.oscParams[index].fineTune = cents;
    for (const v of this.activeVoices) v.setOscFineTune?.(index, cents);
  }
  setOscGain(index, val) {
    this.oscParams[index].gain = val;
    for (const v of this.activeVoices) {
      v.setOscGain?.(index, val);
      v.updateMix(this.vectorMix.x, this.vectorMix.y);
    }
  }
  setOscPan(index, pan) {
    this.oscParams[index].pan = pan;
    for (const v of this.activeVoices) v.setOscPan?.(index, pan);
  }
  enableMPE(on = true) {
    this.mpeEnabled = !!on;
    this.allNotesOff();
    this.channelToVoice = {};
    this.noteToChannel = {};
  }
  noteOnMPE(midiNote, velocity, channel) {
    if (this.channelToVoice[channel]) {
      this.channelToVoice[channel].noteOff();
    }
    const driftAmount = 5;
    const driftCents = (Math.random() - 0.5) * 2 * driftAmount;
    const pan = 0;
    const voice = this._createVoice(midiNote, pan, driftCents); // FIXED!
    voice.mpeChannel = channel;
    this.channelToVoice[channel] = voice;
    this.noteToChannel[midiNote] = channel;
    voice.noteOn(velocity);
  }
  noteOffMPE(midiNote, channel) {
    const ch = channel ?? this.noteToChannel[midiNote];
    const voice = this.channelToVoice[ch];
    if (voice) {
      voice.noteOff();
      delete this.channelToVoice[ch];
    }
    delete this.noteToChannel[midiNote];
  }
  handleMPEPitchBend(channel, value14) {
    const voice = this.channelToVoice[channel];
    if (voice) {
      const bend = ((value14 - 8192) / 8192) * 2;
      voice.setPitchBend(bend);
    }
  }
  handleMPEAftertouch(channel, value) {
    const voice = this.channelToVoice[channel];
    if (voice && typeof voice.setAftertouch === "function") {
      voice.setAftertouch(value / 127);
    }
  }
  handleMPEModWheel(channel, value) {
    const voice = this.channelToVoice[channel];
    if (voice && typeof voice.setModWheel === "function") {
      voice.setModWheel(value);
    }
  }
  handleMPESlide(channel, value) {
    const voice = this.channelToVoice[channel];
    if (voice && typeof voice.setSlide === "function") {
      voice.setSlide(value);
    }
  }
  allNotesOff() {
    if (this.activeVoices) this.activeVoices.forEach((v) => v.noteOff());
    Object.values(this.channelToVoice).forEach((v) => v.noteOff());
    this.voices = {};
    this.activeVoices = [];
    this.channelToVoice = {};
    this.noteToChannel = {};
  }
}
