import { ALGORITHMS } from "./constants.js";

export class Operator {
  constructor(context, id) {
    this.context = context;
    this.id = id;
    this.stopped = false;

    this.osc = context.createOscillator();
    this.gain = context.createGain();
    this.envelope = context.createGain();
    this.postEnvelopeGain = context.createGain();

    // Set initial gain values to prevent pops
    this.gain.gain.value = 0;
    this.envelope.gain.value = 0;
    this.postEnvelopeGain.gain.value = 1;

    this.osc.type = "sine";
    this.osc.connect(this.gain);
    this.gain.connect(this.envelope);
    this.envelope.connect(this.postEnvelopeGain);

    this.baseFrequency = 440;
    this.detune = 0;
    this.pitchAmount = 0;
    this.pitchAttack = 0.1;
    this.pitchRelease = 0.1;
    this.releaseDuration = 0.5;

    try {
      this.osc.start();
    } catch (e) {
      console.warn("Oscillator start failed:", e);
    }
  }

  connect(target) {
    this.postEnvelopeGain.connect(target);
  }

  connectToFrequency(targetOsc) {
    this.envelope.connect(targetOsc.frequency);
  }

  setFrequency(baseFreq, ratio = 1, detune = 0, glideTime = 0) {
    this.baseFrequency = baseFreq * ratio;
    this.detune = detune;
    const now = this.context.currentTime;

    this.osc.frequency.cancelScheduledValues(now);
    this.osc.frequency.linearRampToValueAtTime(
      this.baseFrequency,
      now + glideTime
    );
    this.osc.detune.setValueAtTime(this.detune, now);
  }

  setLevel(level, isModulator = false) {
    this.gain.gain.value = isModulator ? level * 300 : level;
  }

  setPitchEnvelope(amount, attack, release, mode = "attack") {
    this.pitchAmount = amount;
    this.pitchAttack = attack;
    this.pitchRelease = release;
    this.pitchMode = mode;
  }

  triggerEnvelope(attack = 0.01, release = 0.5) {
    const now = this.context.currentTime;
    const env = this.envelope.gain;

    const safeAttack = isFinite(attack) ? attack : 0.01;
    const safeRelease = isFinite(release) ? release : 0.5;

    env.cancelScheduledValues(now);

    // Use current value for smooth ramp-in (prevents step-click)
    const currentVal = env.value;
    env.setValueAtTime(currentVal, now);
    env.linearRampToValueAtTime(1, now + Math.max(safeAttack, 0.005));

    this.releaseDuration = safeRelease;
    this.stopped = false;
  }

  triggerPitchEnvelope() {
    if (!this.pitchAmount) return;

    const now = this.context.currentTime;
    const freq = this.osc.frequency;
    const semitoneMultiplier = Math.pow(2, this.pitchAmount / 12);
    const targetFreq = this.baseFrequency * semitoneMultiplier;

    freq.cancelScheduledValues(now);
    freq.setValueAtTime(this.baseFrequency, now);
    freq.linearRampToValueAtTime(targetFreq, now + this.pitchAttack);
    this.osc.detune.setValueAtTime(this.detune, now);
  }

  releaseEnvelope() {
    const now = this.context.currentTime;
    const env = this.envelope.gain;

    env.cancelScheduledValues(now);
    env.setValueAtTime(env.value, now);
    env.linearRampToValueAtTime(0, now + this.releaseDuration);

    if (this.pitchRelease > 0 && this.pitchAmount !== 0) {
      const freq = this.osc.frequency;
      const endFreq = this.baseFrequency * Math.pow(2, -this.pitchAmount / 12); // downward bend
      freq.cancelScheduledValues(now);
      freq.setValueAtTime(this.baseFrequency, now);
      freq.linearRampToValueAtTime(endFreq, now + this.pitchRelease);
    }
  }

  stop(time = this.context.currentTime) {
    if (this.stopped) return;
    this.stopped = true;

    // Stop oscillator
    try {
      this.osc.stop(time);
    } catch (e) {
      console.warn(`Operator ${this.id}: oscillator already stopped.`);
    }

    // Disconnect all nodes
    [this.osc, this.gain, this.envelope, this.postEnvelopeGain].forEach(
      (node) => {
        try {
          node.disconnect();
        } catch {}
      }
    );
  }
}

let globalPitchEnvParams = {
  attack: 0.1,
  decay: 0.2,
  sustain: 0.5,
  release: 0.5,
  delay: 0,
  loop: false,
};

let globalPitchEnvDepth = 0; // in semitones

export function setGlobalPitchEnvParam(key, value) {
  globalPitchEnvParams[key] = value;
}

export function setGlobalPitchEnvDepth(value) {
  globalPitchEnvDepth = value;
}

export function getGlobalPitchEnvParams() {
  return { ...globalPitchEnvParams, depth: globalPitchEnvDepth };
}
export class FMVoice {
  constructor(
    context,
    baseFreq,
    algorithmId = 1,
    opParams = [],
    velocity = 127
  ) {
    this.pitchBend = 0;
    this.context = context;
    this.output = context.createGain();
    this.output.gain.setValueAtTime(0, context.currentTime);
    this.output.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);

    this.operators = {};
    this.opParams = opParams;
    this.baseFreq = baseFreq;

    // === LFOs and Pitch Envelope ===
    this.pitchLFO = context.createOscillator();
    this.pitchLFOGain = context.createGain();
    this.pitchEnv = context.createConstantSource();

    this.pitchLFO.frequency.value = 1;
    this.pitchLFOGain.gain.value = 0;
    this.pitchLFO.connect(this.pitchLFOGain);
    this.pitchLFOGain.connect(this.pitchEnv.offset);

    this.pitchEnv.offset.value = 0;

    this.pitchLFO.start();
    this.pitchEnv.start();

    this.tremoloLFO = context.createOscillator();
    this.tremoloGain = context.createGain();
    this.tremoloLFO.frequency.value = 5;
    this.tremoloGain.gain.value = 0;
    this.tremoloLFO.connect(this.tremoloGain);
    this.tremoloLFO.start();

    this.pitchEnvParams = {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5,
    };
    this.pitchEnvDepth = 0;

    // === Build algorithm ===
    const algo = ALGORITHMS[algorithmId] || { paths: [], outputs: [] };
    const isModulator = {};
    algo.paths.forEach((path) => {
      isModulator[path.from] = true;
    });

    for (let i = 1; i <= 6; i++) {
      const op = new Operator(context, i);
      this.operators[i] = op;
      this.pitchEnv.connect(op.osc.detune);
      if (opParams[i - 1]) {
        const p = opParams[i - 1];
        op.setFrequency(baseFreq, p.ratio, p.detune);
        const velocityGain = velocity / 127; // normalize
        op.setLevel(p.level * velocityGain, isModulator[i]);
        op.setPitchEnvelope(
          p.pitchAmount || 0,
          p.pitchAttack || 0.1,
          p.pitchRelease || 0.1
        );
      }
    }

    // Connect modulator paths
    algo.paths.forEach(({ from, to }) => {
      this.operators[from].connectToFrequency(this.operators[to].osc);
    });

    // Feedback
    algo.feedback.forEach(({ from, to }) => {
      const fbGain = context.createGain();
      const uiAmount = opParams[from - 1]?.feedback ?? 0;
      fbGain.gain.value = uiAmount * 100;

      const fromOp = this.operators[from];
      const toOp = this.operators[to];

      fromOp.postEnvelopeGain.connect(fbGain);
      fbGain.connect(toOp.osc.frequency);
    });

    // Connect outputs
    algo.outputs.forEach((opId) => {
      this.operators[opId].connect(this.output);
    });

    // Apply tremolo
    for (let i = 1; i <= 6; i++) {
      this.tremoloGain.connect(this.operators[i].postEnvelopeGain.gain);
    }

    const now = context.currentTime;
    this.output.gain.setValueAtTime(0, now);
    this.output.gain.linearRampToValueAtTime(0.3, now + 0.02);
  }

  setPitchBend(semitones) {
    this.pitchBend = semitones;
    this.applyPitchBend();
  }

  applyPitchBend() {
    for (let i = 1; i <= 6; i++) {
      const op = this.operators[i];
      const p = this.opParams[i - 1];
      const ratio = p.ratio;
      const detune = p.detune;
      const freq = this.baseFreq * Math.pow(2, this.pitchBend / 12);
      op.setFrequency(freq, ratio, detune);
    }
  }

  setFrequencies(baseFreq, glideTime = 0) {
    this.baseFreq = baseFreq;
    const bentFreq = baseFreq * Math.pow(2, this.pitchBend / 12);
    for (let i = 1; i <= 6; i++) {
      const op = this.operators[i];
      const p = this.opParams[i - 1];
      op.setFrequency(bentFreq, p.ratio, p.detune, glideTime);
    }
  }

  setTremolo(rate, depth, delay = 0) {
    const now = this.context.currentTime;
    const FADE_TIME = 0.05;

    // Set tremolo LFO rate immediately
    this.tremoloLFO.frequency.setValueAtTime(rate, now);

    // Get current gain value to ramp from
    const currentGain = this.tremoloGain.gain.value;

    // Cancel previous scheduled changes, but preserve current value
    this.tremoloGain.gain.cancelScheduledValues(now);
    this.tremoloGain.gain.setValueAtTime(currentGain, now); // start from current

    // Smoothly ramp to new depth
    this.tremoloGain.gain.linearRampToValueAtTime(
      depth,
      now + delay + FADE_TIME
    );
  }

  setPitchLFO(rate, depth, type = "sine") {
    this.pitchLFO.frequency.setValueAtTime(rate, this.context.currentTime);
    this.pitchLFOGain.gain.setValueAtTime(
      depth * 100,
      this.context.currentTime
    );
    this.pitchLFO.type = type;
  }

  setPitchEnvelope({
    attack,
    decay,
    sustain,
    release,
    depth,
    loop,
    delay = 0,
  }) {
    this.pitchEnvParams = { attack, decay, sustain, release, delay };
    this.pitchEnvDepth = depth;
  }

  triggerPitchADSR() {
    const now = this.context.currentTime;
    const { attack, decay, sustain, delay } = this.pitchEnvParams;
    const offset = this.pitchEnv.offset;
    const peak = this.pitchEnvDepth * 100;
    const sustainLevel = peak * sustain;
    const start = now + delay;

    const cycleTime = attack + decay;

    offset.cancelScheduledValues(now);
    offset.setValueAtTime(0, now);
    offset.setValueAtTime(0, start);
    offset.linearRampToValueAtTime(peak, start + attack);
    offset.linearRampToValueAtTime(sustainLevel, start + attack + decay);
  }

  releasePitchADSR() {
    const now = this.context.currentTime;
    const { release } = this.pitchEnvParams;
    const offset = this.pitchEnv.offset;
    offset.cancelScheduledValues(now);
    offset.setValueAtTime(offset.value, now);
    offset.linearRampToValueAtTime(0, now + release);
  }

  trigger() {
    for (let i = 1; i <= 6; i++) {
      const p = this.opParams[i - 1];
      this.operators[i].triggerEnvelope(p.attack, p.release);
      this.operators[i].triggerPitchEnvelope();
    }
    this.triggerPitchADSR();
  }

  release() {
    for (let i = 1; i <= 6; i++) {
      this.operators[i].releaseEnvelope();
    }
    this.releasePitchADSR();
  }

  stop() {
    for (let i = 1; i <= 6; i++) {
      this.operators[i].stop();
    }

    try {
      this.pitchLFO.stop();
    } catch {}
    try {
      this.pitchLFO.disconnect();
    } catch {}

    try {
      this.tremoloLFO.stop();
    } catch {}
    try {
      this.tremoloLFO.disconnect();
    } catch {}

    try {
      this.pitchEnv.stop();
    } catch {}
    try {
      this.pitchEnv.disconnect();
    } catch {}

    this.output.disconnect();
  }

  disconnect() {
    for (let i = 1; i <= 6; i++) {
      try {
        this.operators[i].postEnvelopeGain.disconnect();
      } catch {}
    }
  }
}

let voice1 = null;
let voice2 = null;

export function noteOn(
  context,
  note,
  velocity,
  getOperatorParams,
  algorithmId,
  masterBus,
  tremoloDelay = 0,
  tremoloRate = 5,
  tremoloDepth = 0,
  pitchLFORate = 0,
  pitchLFODepth = 0,
  pitchLFOType = "sine",
  voiceMode = "mono",
  glideTime = 0
) {
  const freq = 440 * Math.pow(2, (note - 69) / 12);
  const opParams = getOperatorParams();

  function fadeOutAndStop(voice, masterBus, duration = 0.02) {
    if (!voice) return;

    const now = voice.context.currentTime;
    const gain = voice.output.gain;

    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + duration);

    setTimeout(() => {
      masterBus.disconnectSource(voice.output);
      voice.stop();
    }, (duration + 0.02) * 1000);
  }

  if (voiceMode === "duo") {
    // If voice1 is free
    if (!voice1 || voice1.stopped) {
      fadeOutAndStop(voice1, masterBus);

      voice1 = new FMVoice(context, freq, algorithmId, opParams, velocity);
      masterBus.connectSource(voice1.output);
      voice1.setFrequencies(freq, glideTime);
      voice1.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
      voice1.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
      voice1.setPitchEnvelope({ ...getGlobalPitchEnvParams() });
      voice1.trigger();
      return voice1;
    }

    // If voice2 is free
    if (!voice2 || voice2.stopped) {
      fadeOutAndStop(voice1, masterBus);

      voice2 = new FMVoice(context, freq, algorithmId, opParams, velocity);
      masterBus.connectSource(voice2.output);
      voice2.setFrequencies(freq, glideTime);
      voice2.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
      voice2.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
      voice2.setPitchEnvelope({ ...getGlobalPitchEnvParams() });
      voice2.trigger();
      return voice2;
    }

    // Steal voice1
    fadeOutAndStop(voice1, masterBus);
    voice1 = new FMVoice(context, freq, algorithmId, opParams, velocity);
    masterBus.connectSource(voice1.output);
    voice1.setFrequencies(freq, glideTime);
    voice1.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
    voice1.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
    voice1.setPitchEnvelope({ ...getGlobalPitchEnvParams() });
    voice1.trigger();
    return voice1;
  } else {
    // MONO
    fadeOutAndStop(voice1, masterBus);

    voice1 = new FMVoice(context, freq, algorithmId, opParams, velocity);
    masterBus.connectSource(voice1.output);
    voice1.setFrequencies(freq, glideTime);
    voice1.setTremolo(tremoloRate, tremoloDepth, tremoloDelay);
    voice1.setPitchLFO(pitchLFORate, pitchLFODepth, pitchLFOType);
    voice1.setPitchEnvelope({ ...getGlobalPitchEnvParams() });
    voice1.trigger();
    return voice1;
  }
}

export function noteOff(note) {
  [voice1, voice2].forEach((voice, i) => {
    if (!voice) return;
    voice.release();
    const maxRelease = Math.max(...voice.opParams.map((p) => p.release || 0.5));
    setTimeout(() => {
      voice.stop();
    }, (maxRelease + 0.2) * 1000);
  });
}

export class MasterBus {
  constructor(context) {
    this.context = context;

    // Master Gain
    this.outputGain = context.createGain();
    this.outputGain.gain.value = 0.1;

    // Reverb
    this.reverb = context.createConvolver();
    this.reverbGain = context.createGain();
    this.reverbGain.gain.value = 0.3;

    // Delay
    this.delay = context.createDelay();
    this.delay.delayTime.value = 0.25;
    this.delayFeedback = context.createGain();
    this.delayFeedback.gain.value = 0.3;
    this.delayGain = context.createGain();
    this.delayGain.gain.value = 0.3;

    // Stereo Widener
    this.splitter = context.createChannelSplitter(2);
    this.widenerDelay = context.createDelay();
    this.widenerDelay.delayTime.value = 0.01;
    this.merger = context.createChannelMerger(2);
    this.stereoWidthGain = context.createGain();
    this.stereoWidthGain.gain.value = 0.4;

    // Auto Panner
    this.pannerInput = context.createGain();
    this.panNode = context.createStereoPanner();
    this.pannerOutput = context.createGain();
    this.lfo = context.createOscillator();
    this.lfo.frequency.value = 0.25;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = 0.0;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.panNode.pan);
    this.pannerInput.connect(this.panNode);
    this.panNode.connect(this.pannerOutput);

    this.lfo.start();

    // Master filter
    this.masterFilter = context.createBiquadFilter();
    this.masterFilter.type = "lowpass";
    this.masterFilter.frequency.value = 18000;
    this.masterFilter.Q.value = 0.1;

    // Distortion
    this.distortionPreGain = context.createGain();
    this.distortionPreGain.gain.value = 0.0;

    this.distortion = context.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(400);
    this.distortion.oversample = "4x";

    this.distortionGain = context.createGain();
    this.distortionGain.gain.value = 0.0;

    // Routing FX
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.reverb.connect(this.reverbGain);

    // FX mix into outputGain
    this.delayGain.connect(this.outputGain);
    this.reverbGain.connect(this.outputGain);

    // Widener routing (done per source in connectSource)
    this.merger.connect(this.stereoWidthGain);
    this.stereoWidthGain.connect(this.outputGain);

    // Connect distortion in parallel with delay and reverb
    this.distortionPreGain.connect(this.distortion);
    this.distortion.connect(this.distortionGain);
    this.distortionGain.connect(this.outputGain);

    // Final master FX chain
    this.outputGain.connect(this.masterFilter);
    this.masterFilter.connect(this.pannerInput);
    this.pannerOutput.connect(context.destination);

    this.loadReverbImpulse();
  }

  connectSource(node) {
    // Dry path
    node.connect(this.outputGain);

    // FX paths
    node.connect(this.reverb);
    node.connect(this.delay);
    node.connect(this.distortionPreGain);
    // Stereo widening
    node.connect(this.splitter);
    this.splitter.connect(this.merger, 0, 0);
    this.splitter.connect(this.widenerDelay, 1);
    this.widenerDelay.connect(this.merger, 0, 1);
  }

  setMasterVolume(value) {
    this.outputGain.gain.value = value;
  }

  setReverbAmount(value) {
    this.reverbGain.gain.value = value;
  }

  setDelayFeedback(value) {
    this.delayFeedback.gain.value = value;
  }

  setDelayAmount(value) {
    this.delayGain.gain.value = value;
  }

  setStereoWidth(value) {
    this.stereoWidthGain.gain.value = value;
  }

  setFilterFrequency(value) {
    this.masterFilter.frequency.value = value;
  }

  setDistortionAmount(value) {
    this.distortion.curve = this.makeDistortionCurve(value);
  }

  setDistortionMix(value) {
    this.distortionGain.gain.value = value;
  }

  setDistortionPreGain(value) {
    this.distortionPreGain.gain.value = value;
  }

  setPannerRate(value) {
    this.lfo.frequency.value = value;
  }

  setPannerDepth(value) {
    this.lfoGain.gain.setValueAtTime(value, this.context.currentTime);
  }

  setPannerDirection(value) {
    this.panNode.pan.value = value;
  }

  disconnectSource(node) {
    try {
      node.disconnect(this.outputGain);
    } catch {}
    try {
      node.disconnect(this.reverb);
    } catch {}
    try {
      node.disconnect(this.delay);
    } catch {}
    try {
      node.disconnect(this.distortionPreGain);
    } catch {}
    try {
      node.disconnect(this.splitter);
    } catch {}
  }

  makeDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  loadReverbImpulse() {
    fetch("impulses/HepnerHall.wav")
      .then((res) => res.arrayBuffer())
      .then((data) => this.context.decodeAudioData(data))
      .then((buffer) => {
        this.reverb.buffer = buffer;
      });
  }
}
