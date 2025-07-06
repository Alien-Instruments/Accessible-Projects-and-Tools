class LFO {
  constructor(rate, depth, sampleRate, shape = "sine") {
    this.rate = rate;
    this.depth = depth;
    this.sampleRate = sampleRate;
    this.phase = 0;
    this.shape = shape;
  }
  setRate(rate) {
    this.rate = rate;
  }
  setDepth(depth) {
    this.depth = depth;
  }
  setShape(shape) {
    this.shape = shape;
  }
  next() {
    let val;
    switch (this.shape) {
      case "sine":
        val = Math.sin(this.phase * 2 * Math.PI);
        break;
      case "triangle":
        val = 2 * Math.abs(2 * (this.phase - Math.floor(this.phase + 0.5))) - 1;
        break;
      case "square":
        val = this.phase < 0.5 ? 1 : -1;
        break;
      case "sawtooth":
        val = 2 * (this.phase - Math.floor(this.phase)) - 1;
        break;
      case "ramp":
        val = 1 - 2 * (this.phase - Math.floor(this.phase));
        break;
      default:
        val = 0;
    }
    const output = val * this.depth;
    this.phase += (this.rate / this.sampleRate) * 64;
    if (this.phase >= 1) this.phase -= 1;

    return output;
  }
}

class Voice {
  constructor(
    note,
    frequency,
    osc1,
    osc2,
    morph,
    sampleRate,
    envelope,
    detune1,
    detune2,
    modAmount = 0,
    volume1 = 1.0,
    volume2 = 1.0,
    pitchBend = 0,
    velocity = 1.0
  ) {
    this.note = note;
    this.frequency = frequency;
    this.osc1 = osc1;
    this.osc2 = osc2;
    this.morph = morph;
    this.sampleRate = sampleRate;
    this.detune1 = detune1;
    this.detune2 = detune2;
    this.phase1 = 0;
    this.phase2 = 0;
    this.active = true;
    this.modAmount = modAmount;
    this.envStage = "attack";
    this.envValue = 0;
    this.attackTime = envelope.attackTime;
    this.decayTime = envelope.decayTime;
    this.sustainLevel = envelope.sustainLevel;
    this.releaseTime = envelope.releaseTime;
    this.volume1 = volume1;
    this.volume2 = volume2;
    this.pitchBend = pitchBend;
    this.velocity = velocity;
  }
  nextSample() {
    if (!this.active) return 0;
    const sample = (osc, phase) => {
      const tableSize = osc.waveA.length;
      const index = phase * tableSize;
      const i0 = Math.floor(index) % tableSize;
      const i1 = (i0 + 1) % tableSize;
      const frac = index - i0;

      const sa = (1 - frac) * osc.waveA[i0] + frac * osc.waveA[i1];
      const sb = (1 - frac) * osc.waveB[i0] + frac * osc.waveB[i1];
      return (1 - this.morph) * sa + this.morph * sb;
    };
    const dt = 1 / this.sampleRate;

    const bendSemitones = 2 * (this.pitchBend || 0);
    const freq1 =
      this.frequency * Math.pow(2, this.detune1 / 1200 + bendSemitones / 12);
    const freq2 =
      this.frequency * Math.pow(2, this.detune2 / 1200 + bendSemitones / 12);

    // Advance modulator (osc2) phase first!
    this.phase2 += freq2 / this.sampleRate;
    if (this.phase2 >= 1) this.phase2 -= 1;
    // Get the modulating signal from osc2 at updated phase
    const mod = sample(this.osc2, this.phase2);
    // Apply phase modulation to osc1's phase
    let modulatedPhase = (this.phase1 + mod * this.modAmount) % 1;
    if (modulatedPhase < 0) modulatedPhase += 1;

    const s1 = sample(this.osc1, modulatedPhase) * this.volume1;
    const s2 = mod * this.volume2;
    const out = (s1 + s2) * 0.5;

    // Advance carrier (osc1) phase
    this.phase1 += freq1 / this.sampleRate;
    if (this.phase1 >= 1) this.phase1 -= 1;
    // Apply envelope
    switch (this.envStage) {
      case "attack":
        this.envValue += dt / this.attackTime;
        if (this.envValue >= 1) {
          this.envValue = 1;
          this.envStage = "decay";
        }
        break;
      case "decay":
        this.envValue -= (dt * (1 - this.sustainLevel)) / this.decayTime;
        if (this.envValue <= this.sustainLevel) {
          this.envValue = this.sustainLevel;
          this.envStage = "sustain";
        }
        break;
      case "release":
        this.envValue -= dt / this.releaseTime;
        if (this.envValue <= 0) {
          this.envValue = 0;
          this.active = false;
        }
        break;
    }
    return out * this.envValue * this.velocity;
  }
  noteOff() {
    this.envStage = "release";
  }
}

class WavetableProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.osc1 = {
      waveA: new Float32Array(2048),
      waveB: new Float32Array(2048),
    };
    this.osc2 = {
      waveA: new Float32Array(2048),
      waveB: new Float32Array(2048),
    };
    this.masterGain = 0.04;
    this.morph = 0;
    this.detune1 = 0;
    this.detune2 = 0;
    this.voices = [];
    this.maxVoices = 8;
    this.modAmount = 0;
    this.volume1 = 1.0;
    this.volume2 = 1.0;
    this.pitchBend = 0;
    this.lfo = new LFO(2.0, 0.5, sampleRate);
    this.lfoTarget = "none"; // Options: "morph", "modAmount", "both"
    this.envelope = {
      attackTime: 0.01,
      decayTime: 0.2,
      sustainLevel: 0.7,
      releaseTime: 0.5,
    };
    this.port.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === "wavePair") {
        const { target, waveA, waveB } = data;
        if (target === "osc1") {
          this.osc1.waveA = new Float32Array(waveA);
          this.osc1.waveB = new Float32Array(waveB);
        } else if (target === "osc2") {
          this.osc2.waveA = new Float32Array(waveA);
          this.osc2.waveB = new Float32Array(waveB);
        }
      } else if (type === "morph") {
        this.morph = data;
        this.voices.forEach((v) => (v.morph = data));
      } else if (type === "modAmount") {
        this.modAmount = data;
        this.voices.forEach((v) => (v.modAmount = data));
      } else if (type === "lfo") {
        const { rate, depth } = data;
        this.lfo.setRate(rate);
        this.lfo.setDepth(depth);
      } else if (type === "volume") {
        const { volume1, volume2 } = data;
        this.volume1 = volume1;
        this.volume2 = volume2;
        this.voices.forEach((v) => {
          v.volume1 = volume1;
          v.volume2 = volume2;
        });
      } else if (type === "detune") {
        this.detune1 = data.detune1;
        this.detune2 = data.detune2;
        this.voices.forEach((v) => {
          v.detune1 = data.detune1;
          v.detune2 = data.detune2;
        });
      } else if (type === "lfoTarget") {
        this.lfoTarget = data; // "morph", "modAmount", "both", "none"
      } else if (type === "lfoShape") {
        this.lfo.setShape(data);
      } else if (type === "noteOn") {
        const freq = 440 * Math.pow(2, (data.note - 69) / 12);
        const velocity =
          typeof data.velocity === "number" ? data.velocity / 127 : 1.0;
        if (event.data.type === "masterGain") {
          this.masterGain = event.data.data;
        }
        if (this.voices.length >= this.maxVoices) this.voices.shift();
        this.voices.push(
          new Voice(
            data.note,
            freq,
            this.osc1,
            this.osc2,
            this.morph,
            sampleRate,
            { ...this.envelope },
            this.detune1,
            this.detune2,
            this.modAmount,
            this.volume1,
            this.volume2,
            this.pitchBend,
            velocity
          )
        );
      } else if (type === "noteOff") {
        for (let v of this.voices) {
          if (v.note === data.note) v.noteOff();
        }
      } else if (type === "envelope") {
        Object.assign(this.envelope, data);
      } else if (type === "pitchBend") {
        this.pitchBend = data; // value between -1..+1
      }
    };
  }
  process(_, outputs) {
    const output = outputs[0][0];
    const lfoValue = this.lfo.next(); // compute once per block for consistency

    let modMorph = this.morph;
    let modAmount = this.modAmount;

    for (let v of this.voices) {
      v.pitchBend = this.pitchBend;
    }

    switch (this.lfoTarget) {
      case "morph":
        modMorph += lfoValue;
        modMorph = Math.min(1, Math.max(0, modMorph));
        break;
      case "modAmount":
        modAmount += lfoValue;
        break;
      case "both":
        modMorph += lfoValue;
        modAmount += lfoValue;
        modMorph = Math.min(1, Math.max(0, modMorph));
        break;
    }
    for (let i = 0; i < output.length; i++) {
      let sample = 0;
      for (let v of this.voices) {
        v.morph = modMorph;
        v.modAmount = modAmount;
        sample += v.nextSample();
      }
      output[i] = sample * this.masterGain; // <-- overall gain applied
    }
    this.voices = this.voices.filter((v) => v.active);
    return true;
  }
}
registerProcessor("wavetable-processor", WavetableProcessor);
