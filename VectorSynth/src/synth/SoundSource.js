export class SoundSource {
  constructor(
    audioCtx,
    type = "sawtooth",
    frequency = 440,
    unison = 1,
    detuneCents = 10,
    options = {}
  ) {
    this.type = type;
    this.octave = options.octave || 0;
    this.semitone = options.semitone || 0;
    this.fineTune = options.fineTune || 0;
    this.detuneCents = detuneCents;
    this.gainValue = options.gain ?? 1;

    this.gain = audioCtx.createGain();
    this.gain.gain.value = this.gainValue;
    this.oscs = [];

    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.value = options.pan ?? 0; // -1 (left) to +1 (right)
    this.gain.connect(this.panner);

    for (let i = 0; i < unison; ++i) {
      const osc = audioCtx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = (i - (unison - 1) / 2) * detuneCents;
      osc.connect(this.gain);
      osc.start();
      this.oscs.push(osc);
    }
  }
  setPan(value) {
    this.panner.pan.value = value;
  }
  setType(type) {
    this.type = type;
    this.oscs.forEach((osc) => {
      osc.type = type;
    });
  }
  setOctave(octave) {
    this.octave = octave;
    this.updateFrequency();
  }
  setSemitone(semitone) {
    this.semitone = semitone;
    this.updateFrequency(this.baseFrequency);
  }
  setFineTune(cents) {
    this.fineTune = cents;
    this.updateFrequency(this.baseFrequency);
  }
  setDetune(cents) {
    this.detuneCents = cents;
    if (this.baseFrequency) this.setFrequency(this.baseFrequency);
  }
  setGain(val) {
    this.gainValue = val;
    const now = this.gain.context.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(val, now + 0.01);
  }

  updateFrequency(base = null) {
    const baseFreq = base ?? this.baseFrequency ?? 440; // or whatever last was used
    const octaveMult = Math.pow(2, this.octave);
    const semitoneMult = Math.pow(2, this.semitone / 12);
    const fineMult = Math.pow(2, (this.fineTune || 0) / 1200);
    const freq = baseFreq * octaveMult * semitoneMult * fineMult;
    this.oscs.forEach((osc) => {
      osc.frequency.setValueAtTime(freq, osc.context.currentTime);
    });
    this.baseFrequency = baseFreq;
  }
  setFrequency(freq, glideTime = 0) {
    const octaveMult = Math.pow(2, this.octave);
    const semitoneMult = Math.pow(2, this.semitone / 12);
    const fineMult = Math.pow(2, (this.fineTune || 0) / 1200);
    const unison = this.oscs.length;
    this.baseFrequency = freq;

    this.oscs.forEach((osc, i) => {
      const detuneCents =
        (i - (unison - 1) / 2) * this.detuneCents + (this.fineTune || 0);
      const detuneMult = Math.pow(2, detuneCents / 1200);
      const target = freq * octaveMult * semitoneMult * fineMult * detuneMult;
      const now = osc.context.currentTime;
      osc.frequency.cancelScheduledValues(now);
      if (glideTime > 0) {
        const currFreq = osc.frequency.value;
        osc.frequency.setValueAtTime(currFreq, now);
        osc.frequency.linearRampToValueAtTime(target, now + glideTime);
      } else {
        osc.frequency.setValueAtTime(osc.frequency.value, now); // only if you trust it
        // OR, skip setting the "from" value entirely and just ramp
        osc.frequency.linearRampToValueAtTime(target, now + 0.01);
      }
      osc.detune.value = 0;
    });
  }

  connect(dest) {
    this.panner.connect(dest);
  }
  stop() {
    this.oscs.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.gain.disconnect?.();
  }
}
