import { SoundSource } from "./SoundSource.js";
import { connectToFXChain } from "../effects/master-fx.js";

function safeNum(val, fallback) {
  return typeof val === "number" && isFinite(val) ? val : fallback;
}

export class Voice {
  constructor(
    audioCtx,
    note,
    vectorMix,
    unison = 1,
    detuneCents = 10,
    envelope = { attack: 0.2, decay: 0.1, sustain: 0.7, release: 0.4 },
    filter = {
      cutoff: 12000,
      resonance: 0.8,
      env: { attack: 0.01, decay: 0.2, sustain: 0.0, release: 0.2 },
      envDepth: 0.5,
    },
    pan = 0,
    driftCents = 0,
    oscParams,
    destinations = {}
  ) {
    this.audioCtx = audioCtx;
    this.note = note;
    this.pitchBendDest = destinations.pitchBendDest || "pitch";
    this.aftertouchDest = destinations.aftertouchDest || "filter";
    this.modWheelDest = destinations.modWheelDest || "vibrato";
    this.slideDest = destinations.slideDest || "vectorX";
    this.releasing = false;
    this.disposed = false;

    this.sources = (oscParams ?? []).map(
      (param) =>
        new SoundSource(
          audioCtx,
          param.type || "sawtooth",
          0,
          unison,
          param.detuneCents ?? detuneCents,
          param
        )
    );
    if (this.sources.length === 0) {
      this.sources = [
        new SoundSource(audioCtx, "sawtooth", 0, unison, detuneCents),
        new SoundSource(audioCtx, "triangle", 0, unison, detuneCents),
        new SoundSource(audioCtx, "square", 0, unison, detuneCents),
        new SoundSource(audioCtx, "sine", 0, unison, detuneCents),
      ];
    }

    const safeCutoff = safeNum(filter.cutoff, 12000);
    const safeResonance = safeNum(filter.resonance, 0.8);

    this.filter = audioCtx.createBiquadFilter();
    this.filter.type = filter.type || "lowpass";
    this.filter.frequency.value = safeCutoff;
    this.filter.Q.value = safeResonance;

    this.master = audioCtx.createGain();
    this.master.gain.value = 0;

    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.value = safeNum(pan, 0);
    this.driftCents = driftCents;

    this.sources.forEach((src) => src.connect(this.filter));
    this.filter.connect(this.master);

    if (!Voice.masterGain) {
      Voice.masterGain = this.audioCtx.createGain();
      Voice.masterGain.gain.value = 0.05;
      connectToFXChain(Voice.masterGain);
    }
    this.dcBlocker = audioCtx.createBiquadFilter();
    this.dcBlocker.type = "highpass";
    this.dcBlocker.frequency.value = 10;

    this.master.connect(this.dcBlocker);
    this.dcBlocker.connect(this.panner);

    this.panner.connect(Voice.masterGain);

    const defaultEnv = { attack: 0.2, decay: 0.1, sustain: 0.7, release: 0.4 };
    this.env = { ...defaultEnv, ...envelope };

    const defaultFiltEnv = {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.0,
      release: 0.2,
    };
    this.filterEnv = { ...defaultFiltEnv, ...(filter.env || {}) };

    this.filterCutoff = safeCutoff;
    this.filterResonance = safeResonance;
    this.filterEnvDepth = safeNum(filter.envDepth, 0.5);

    this.vectorMix = vectorMix || { x: 0.5, y: 0.5 };
    this.currentFreq = null;
    this.setNote(note, false);
    this.updateMix(this.vectorMix.x, this.vectorMix.y);

    this.velocity = 1;
    this.isPlaying = false;
  }

  setNote(midiNote, glide = false) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const driftedFreq = freq * Math.pow(2, this.driftCents / 1200);
    this.sources.forEach((src) => {
      if (glide && this.currentFreq != null && this.glideTime > 0) {
        src.setFrequency(driftedFreq, this.glideTime, this.currentFreq);
      } else {
        src.setFrequency(driftedFreq);
      }
    });
    this.currentFreq = driftedFreq;
    this.note = midiNote;
  }

  updateMix(x, y) {
    const gains = [(1 - x) * (1 - y), x * (1 - y), (1 - x) * y, x * y];
    const t = this.audioCtx.currentTime;
    this.sources.forEach((src, i) => {
      const target = safeNum(src.gainValue ?? 1, 1) * gains[i];
      src.gain.gain.cancelScheduledValues(t);
      src.gain.gain.linearRampToValueAtTime(target, t + 0.01);
    });
  }

  setFilter(cutoff, resonance) {
    this.filter.frequency.value = safeNum(cutoff, 1200);
    this.filter.Q.value = safeNum(resonance, 0.8);
    this.filterCutoff = safeNum(cutoff, 1200);
    this.filterResonance = safeNum(resonance, 0.8);
  }

  setFilterEnv(env, depth) {
    this.filterEnv = { ...this.filterEnv, ...env };
    if (typeof depth === "number" && isFinite(depth)) {
      this.filterEnvDepth = depth;
    }
  }

  noteOn(velocity = 100) {
    const now = this.audioCtx.currentTime;
    this.velocity = velocity / 127;

    this.master.gain.cancelScheduledValues(now);
    const currentGain = this.master.gain.value;
    this.master.gain.setValueAtTime(currentGain, now);
    this.master.gain.linearRampToValueAtTime(0.0, now + 0.005); // micro fade

    const attackStart = now + 0.005;
    this.master.gain.linearRampToValueAtTime(
      this.velocity,
      attackStart + this.env.attack
    );
    this.master.gain.linearRampToValueAtTime(
      this.velocity * this.env.sustain,
      attackStart + this.env.attack + this.env.decay
    );

    // Filter envelope
    const env = this.filterEnv;
    const baseCutoff = safeNum(this.filterCutoff, 1200);
    const depth = safeNum(this.filterEnvDepth, 0.5) * 3000;
    const envAttack = safeNum(env.attack, 0.01);
    const envDecay = safeNum(env.decay, 0.2);
    const envSustain = safeNum(env.sustain, 0.0);
    const target = Math.max(20, baseCutoff + depth);

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(baseCutoff, now + 0.005);
    this.filter.frequency.linearRampToValueAtTime(target, now + envAttack);
    this.filter.frequency.linearRampToValueAtTime(
      baseCutoff + depth * envSustain,
      now + envAttack + envDecay
    );

    this.isPlaying = true;
  }

  noteOff() {
    if (this.releasing || this.disposed) return;
    this.releasing = true;

    const now = this.audioCtx.currentTime;
    const release = safeNum(this.env.release, 0.2);
    const filterRelease = safeNum(this.filterEnv.release, 0.2);

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.setTargetAtTime(0.0, now, release / 4);

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(
      safeNum(this.filterCutoff, 1200),
      now + filterRelease
    );

    // 🧯 Micro-sag on global gain to suppress summing click
    if (Voice.masterGain && Voice.masterGain.gain.value > 0.005) {
      const mg = Voice.masterGain.gain;
      mg.cancelScheduledValues(now);
      mg.setValueAtTime(mg.value, now);
      mg.linearRampToValueAtTime(mg.value * 0.98, now + 0.005);
      mg.linearRampToValueAtTime(mg.value, now + 0.01);
    }

    const waitTime = Math.max(release, filterRelease);

    setTimeout(() => {
      if (this.master.gain.value > 0.001 && !this.disposed) {
        const now2 = this.audioCtx.currentTime;
        this.master.gain.cancelScheduledValues(now2);
        this.master.gain.setValueAtTime(this.master.gain.value, now2);
        this.master.gain.linearRampToValueAtTime(0, now2 + 0.008);
        setTimeout(() => this.dispose(), 10);
      } else {
        this.dispose();
      }
    }, waitTime * 1000 + 100);
  }

  dispose() {
    const g = this.master.gain;
    const now = this.audioCtx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.07);
    setTimeout(() => {
      this.master.disconnect();
      this.sources.forEach((src) => src.stop());
      this.disposed = true;
    }, 120);
  }

  isIdle() {
    return this.master.gain.value < 0.001 && !this.isPlaying;
  }

  setDetune(detuneCents) {
    this.sources.forEach((src) => {
      if (src.setDetune) src.setDetune(detuneCents);
    });
  }
  setPitchBend(bend) {
    switch (this.pitchBendDest) {
      case "pitch":
        this.pitchBend = bend;
        const freq = 440 * Math.pow(2, (this.note + (bend || 0) - 69) / 12);
        this.sources.forEach((src) => src.setFrequency(freq));
        this.currentFreq = freq;
        break;
      case "vectorX":
        this.vectorMix.x = (bend + 2) / 4; // assuming -2..+2 range mapped to 0..1
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "vectorY":
        this.vectorMix.y = (bend + 2) / 4;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "pan":
        this.panner.pan.value = ((bend + 2) / 4) * 2 - 1; // maps -2..+2 to -1..+1
        break;
      case "filter":
        this.filter.frequency.value =
          safeNum(this.filterCutoff, 1200) + bend * 1000;
        break;
      case "resonance":
        this.filter.Q.value = safeNum(this.filterResonance, 0.8) + bend * 2;
        break;
      case "detune":
        this.sources.forEach((src) => src.setDetune((bend || 0) * 100));
        break;
      case "volume":
        this.master.gain.value = this.velocity * (0.5 + 0.25 * (bend || 0));
        break;
    }
  }
  setAftertouch(value) {
    switch (this.aftertouchDest) {
      case "filter":
        this.filter.frequency.value =
          safeNum(this.filterCutoff, 1200) + value * 2000;
        break;
      case "volume":
        this.master.gain.value = this.velocity * (0.6 + 0.4 * value);
        break;
      case "pan":
        this.panner.pan.value = (value - 0.5) * 2;
        break;
      case "vectorX":
        this.vectorMix.x = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "vectorY":
        this.vectorMix.y = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "resonance":
        this.filter.Q.value = safeNum(this.filterResonance, 0.8) + value * 10;
        break;
      case "detune":
        this.sources.forEach((src) => src.setDetune((value - 0.5) * 200));
        break;
    }
  }
  setModWheel(value) {
    switch (this.modWheelDest) {
      case "filter":
        this.filter.frequency.value =
          safeNum(this.filterCutoff, 1200) + value * 1500;
        break;
      case "resonance":
        this.filter.Q.value = safeNum(this.filterResonance, 0.8) + value * 8;
        break;
      case "vectorX":
        this.vectorMix.x = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "vectorY":
        this.vectorMix.y = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "pan":
        this.panner.pan.value = (value - 0.5) * 2;
        break;
      case "detune":
        this.sources.forEach((src) => src.setDetune((value - 0.5) * 200));
        break;
      case "volume":
        this.master.gain.value = this.velocity * (0.5 + 0.5 * value);
        break;
    }
  }
  setSlide(value) {
    switch (this.slideDest) {
      case "vectorX":
        this.vectorMix.x = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "vectorY":
        this.vectorMix.y = value;
        this.updateMix(this.vectorMix.x, this.vectorMix.y);
        break;
      case "detune":
        this.sources.forEach((src) => src.setDetune((value - 0.5) * 200));
        break;
      case "pan":
        this.panner.pan.value = (value - 0.5) * 2;
        break;
      case "filter":
        this.filter.frequency.value =
          safeNum(this.filterCutoff, 1200) + value * 2000;
        break;
      case "resonance":
        this.filter.Q.value = safeNum(this.filterResonance, 0.8) + value * 10;
        break;
      case "volume":
        this.master.gain.value = this.velocity * (0.6 + 0.4 * value);
        break;
    }
  }
  setOscSemitone(index, st) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setSemitone === "function"
    ) {
      this.sources[index].setSemitone(st);
    }
  }
  setOscFineTune(index, cents) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setFineTune === "function"
    ) {
      this.sources[index].setFineTune(cents);
    }
  }
  setOscGain(index, val) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setGain === "function"
    ) {
      this.sources[index].setGain(val);
    }
  }
  setOscType(index, type) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setType === "function"
    ) {
      this.sources[index].setType(type);
    }
  }
  setOscOctave(index, oct) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setOctave === "function"
    ) {
      this.sources[index].setOctave(oct);
    }
  }
  setOscPan(index, pan) {
    if (
      this.sources[index] &&
      typeof this.sources[index].setPan === "function"
    ) {
      this.sources[index].setPan(pan);
    }
  }
  dispose() {
    const g = this.master.gain;
    const now = this.audioCtx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.07);
    setTimeout(() => {
      // Don't call stop yet
      this.master.disconnect();
      // Optionally stop oscillators now
      this.sources.forEach((src) => src.stop());
    }, 120); // 0.07s + a bit more
  }
}
