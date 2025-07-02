import * as Tone from "https://esm.sh/tone";

// Helper function for a single voice
function createDualOscVoice(options = {}) {
  // Oscillator 1 Synth
  const synth1 = new Tone.Synth({
    oscillator: { type: options.osc1Type || "sawtooth" },
    envelope: options.envelope || {},
  });

  // Oscillator 2 Synth
  const synth2 = new Tone.Synth({
    oscillator: { type: options.osc2Type || "triangle" },
    envelope: options.envelope || {},
  });

  const filterEnv = new Tone.FrequencyEnvelope({
    attack: options.filterEnv?.attack ?? 0.1,
    decay: options.filterEnv?.decay ?? 0.2,
    sustain: options.filterEnv?.sustain ?? 0.4,
    release: options.filterEnv?.release ?? 0.8,
    baseFrequency: options.filterBaseFreq ?? 200,
    octaves: options.filterEnvDepth ?? 1, // how many octaves up from baseFrequency
    exponent: 2, // more "natural" shape
  });

  // Each voice gets its own filter
  const filter = new Tone.Filter({
    type: options.filterType || "lowpass",
    frequency: options.filterBaseFreq ?? 200,
    Q: options.filterQ ?? 1,
  });

  filterEnv.connect(filter.frequency);

  // Mixer/gain for each
  const gain1 = new Tone.Gain(0.5);
  const gain2 = new Tone.Gain(0.5);

  synth1.connect(gain1);
  synth2.connect(gain2);

  // Output node for voice
  const output = new Tone.Gain(1);

  gain1.connect(filter);
  gain2.connect(filter);
  filter.connect(output);

  // Track the base cutoff for mod depth
  let filterBaseFreq = options.filterBaseFreq ?? 200;
  let filterEnvDepth = options.filterEnvDepth ?? 1;

  return {
    synth1,
    synth2,
    gain1,
    gain2,
    filter,
    filterEnv,
    output,
    active: false,
    note: null, // track which note is active for this voice
    triggerAttack(note, time, velocity) {
      this.note = note;
      synth1.triggerAttack(note, time, velocity);
      synth2.triggerAttack(note, time, velocity);
      filterEnv.triggerAttack(time);
      this.active = true;
    },
    triggerRelease(time) {
      synth1.triggerRelease(time);
      synth2.triggerRelease(time);
      filterEnv.triggerRelease(time);
      this.active = false;
      this.note = null;
    },
    setFilterEnvelope(params) {
      filterEnv.set(params);
    },
    setFilterEnvDepth(depth) {
      filterEnv.octaves = depth; // Higher = more sweep
      filterEnvDepth = depth;
    },
    setFilterBaseFreq(freq) {
      filter.frequency.value = freq;
      filterEnv.baseFrequency = freq;
      filterBaseFreq = freq;
    },
    setFilterQ(q) {
      filter.Q.value = q;
    },
    setFilterType(type) {
      filter.type = type;
    },
    setOsc1Type(type) {
      synth1.oscillator.type = type;
    },
    setOsc2Type(type) {
      synth2.oscillator.type = type;
    },
    setEnvelope(params) {
      synth1.envelope.set(params);
      synth2.envelope.set(params);
    },
    setPortamento(value) {
      this.synth1.portamento = value;
      this.synth2.portamento = value;
    },
    connect(node) {
      output.connect(node);
    },
    disconnect() {
      output.disconnect();
    },
  };
}

export class DualOscPoly {
  constructor(options = {}) {
    this.maxPolyphony = options.maxPolyphony || 8;
    this.options = options;
    this.voices = [];
    this.filter = options.filter || null;

    // Create voices on construction
    for (let i = 0; i < this.maxPolyphony; i++) {
      const v = createDualOscVoice(this.options);
      if (this.filter) v.connect(this.filter);
      this.voices.push(v);
    }
  }

  // Find a free voice, or steal the oldest one
  _getVoice(note) {
    // 1. Try to find a released voice
    let voice = this.voices.find((v) => !v.active);
    if (voice) return voice;

    // 2. Steal the voice that was triggered earliest (oldest active)
    // Optionally: Find by note for proper note-off
    voice = this.voices[0];
    voice.triggerRelease(); // Release the oldest
    return voice;
  }
  setPolyphony(n) {
    if (n === this.maxPolyphony) return;
    // Disconnect old voices
    this.voices.forEach((v) => v.disconnect());
    // Remove all voices
    this.voices = [];
    // Create new voices
    this.maxPolyphony = n;
    for (let i = 0; i < n; i++) {
      const v = createDualOscVoice(this.options);
      if (this.filter) v.connect(this.filter);
      //else v.connect(Tone.Destination);
      this.voices.push(v);
    }
  }

  triggerAttackRelease(
    note,
    duration = "8n",
    time = undefined,
    velocity = 0.8
  ) {
    const voice = this._getVoice(note);
    voice.triggerAttack(note, time, velocity);

    setTimeout(() => {
      voice.triggerRelease();
    }, Tone.Time(duration).toMilliseconds());
  }
  setFilterEnvelope(params) {
    this.voices.forEach((v) => v.setFilterEnvelope(params));
    this.options.filterEnv = params;
  }
  setFilterEnvDepth(depth) {
    this.voices.forEach((v) => v.setFilterEnvDepth(depth));
    this.options.filterEnvDepth = depth;
  }
  setFilterBaseFreq(freq) {
    this.voices.forEach((v) => v.setFilterBaseFreq(freq));
    this.options.filterBaseFreq = freq;
  }
  setFilterQ(q) {
    this.voices.forEach((v) => v.setFilterQ(q));
    this.options.filterQ = q;
  }
  setFilterType(type) {
    this.voices.forEach((v) => v.setFilterType(type));
    this.options.filterType = type;
  }
  setOsc1Type(type) {
    this.voices.forEach((v) => v.setOsc1Type(type));
    this.options.osc1Type = type;
  }
  setOsc2Type(type) {
    this.voices.forEach((v) => v.setOsc2Type(type));
    this.options.osc2Type = type;
  }
  setEnvelope(params) {
    this.voices.forEach((v) => v.setEnvelope(params));
    this.options.envelope = params;
  }
  setPortamento(seconds) {
    this.voices.forEach((v) => v.setPortamento(seconds));
  }
  connect(node) {
    this.filter = node;
    this.voices.forEach((v) => v.connect(node));
  }
}
