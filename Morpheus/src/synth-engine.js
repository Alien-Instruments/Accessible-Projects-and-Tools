import { audioContext } from "./utils/context.js";
import { loadScript } from "./utils/loadScript.js";
import { loadWaves } from "./wave-loader.js";

// You need this here or import it from another file!
async function loadWave(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const buffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  return audioBuffer.getChannelData(0).slice();
}

export async function createSynthEngine() {
  await audioContext.audioWorklet.addModule("src/wavetable-processor.js");
  const node = new AudioWorkletNode(audioContext, "wavetable-processor");
  await loadScript("src/tuna.js");
  const tuna = new Tuna(audioContext);
  const waveTableMap = await loadWaves(waveFiles);
  const dualFilter = new tuna.DualFilter({
    typeA: "lowpass",
    freqA: 800,
    qA: 4,
    typeB: "lowpass",
    freqB: 1200,
    qB: 3,
  });

  const morphingFilter = new tuna.MorphingFilter({
    typeA: "lowpass",
    typeB: "highpass",
    freqA: 300,
    freqB: 6000,
    resonanceA: 5,
    resonanceB: 3,
    lfoFrequency: 0.4,
    lfoDepth: 0.35,
    morph: 0.5,
    outputGain: 0.8,
  });

  const delay = new tuna.Delay({
    bypass: true,
    delayTime: 200,
    feedback: 0.4,
    cutoff: 20000,
    wetLevel: 0.0,
    dryLevel: 1.0,
  });

  const distortion = new tuna.Distortion({
    curveAmount: 500,
    drive: 5,
    oversample: "2x",
    bypass: true,
  });

  const ringMod = new tuna.RingModulator({
    modFrequency: 50,
    modDepth: 1,
    bypass: true,
  });

  const verb = new tuna.Convolver({
    bypass: true,
    highCut: 20,
    lowCut: 22050,
    dryLevel: 1,
    wetLevel: 1,
    level: 1,
    impulseDuration: 1,
    impulseDecay: 1,
  });

  const gainFilter = audioContext.createGain();
  const gainFeedback = audioContext.createGain();
  const merger = audioContext.createGain();

  node.connect(dualFilter.input);
  node.connect(morphingFilter.input);

  dualFilter.connect(gainFilter);
  morphingFilter.connect(gainFeedback);

  gainFilter.connect(merger);
  gainFeedback.connect(merger);

  merger.connect(delay.input);
  delay.connect(distortion.input);
  distortion.connect(ringMod.input);
  ringMod.connect(verb.input);
  verb.connect(audioContext.destination);

  const waveSources = [
    { folder: "Distorted", prefix: "Distorted", count: 20 },
    { folder: "Bass", prefix: "Bass", count: 20 },
    { folder: "Granular", prefix: "Granular", count: 20 },
    { folder: "Fm", prefix: "Fm", count: 20 },
    { folder: "OscChip", prefix: "OscChip", count: 20 },
  ];

  // Generate full file paths
  const waveFiles = [];
  for (const source of waveSources) {
    const { folder, prefix, count } = source;
    for (let i = 1; i <= count; i++) {
      const filename = `${prefix}${i}.wav`;
      const filePath = `${folder}/${filename}`;
      waveFiles.push(filePath);
    }
  }

  // Load and store wave data

  for (const filePath of waveFiles) {
    const data = await loadWave(filePath);
    waveTableMap[filePath] = data;
  }

  let currentWaveA1 = "Bass/Bass3.wav";
  let currentWaveB1 = "Bass/Bass4.wav";
  let currentWaveA2 = "Granular/Granular2.wav";
  let currentWaveB2 = "Fm/Fm5.wav";

  const envelopeState = {
    attackTime: 0.01,
    decayTime: 0.2,
    sustainLevel: 0.7,
    releaseTime: 0.5,
  };

  const synth = {
    node,
    currentModAmount: 0,
    volume1: 1.0,
    volume2: 1.0,
    waveFiles,
    dualFilter,
    morphingFilter,
    gainFilter,
    gainFeedback,
    effectMerger: merger,
    currentModAmount: 0,
    currentLfoRate: 0.0,
    currentLfoDepth: 0.0,
    currentLfoShape: "sine",
    delay,
    distortion,
    ringMod,
    verb,

    updateWave(osc, filename) {
      if (osc === "osc1A") currentWaveA1 = filename;
      if (osc === "osc1B") currentWaveB1 = filename;
      if (osc === "osc2A") currentWaveA2 = filename;
      if (osc === "osc2B") currentWaveB2 = filename;
      const waveA1 = waveTableMap[currentWaveA1];
      const waveB1 = waveTableMap[currentWaveB1];
      const waveA2 = waveTableMap[currentWaveA2];
      const waveB2 = waveTableMap[currentWaveB2];
      if (waveA1 && waveB1) {
        node.port.postMessage({
          type: "wavePair",
          data: { target: "osc1", waveA: waveA1, waveB: waveB1 },
        });
      }
      if (waveA2 && waveB2) {
        node.port.postMessage({
          type: "wavePair",
          data: { target: "osc2", waveA: waveA2, waveB: waveB2 },
        });
      }
    },
    setDetune(detune1, detune2) {
      node.port.postMessage({ type: "detune", data: { detune1, detune2 } });
    },
    setMorph(value) {
      node.port.postMessage({ type: "morph", data: value });
    },
    setModAmount(value) {
      this.currentModAmount = value; // optional for UI state
      node.port.postMessage({ type: "modAmount", data: value });
    },
    setEnvelope(update) {
      Object.assign(envelopeState, update);
      node.port.postMessage({ type: "envelope", data: envelopeState });
    },
    triggerAttack(noteName, _time, velocity = 1.0) {
      const midi = Tone.Frequency(noteName).toMidi();
      node.port.postMessage({
        type: "noteOn",
        data: { note: midi, velocity: velocity * 127 },
      });
    },
    triggerRelease(noteName) {
      const midi = Tone.Frequency(noteName).toMidi();
      node.port.postMessage({ type: "noteOff", data: { note: midi } });
    },
    noteOn(note, velocity) {
      node.port.postMessage({
        type: "noteOn",
        data: { note, velocity: velocity * 127 },
      });
    },
    noteOff(note) {
      node.port.postMessage({ type: "noteOff", data: { note } });
    },
    setEffectMix(value) {
      this.gainFilter.gain.value = 1 - value;
      this.gainFeedback.gain.value = value;
    },
    setPitchBend(bend) {
      node.port.postMessage({ type: "pitchBend", data: bend });
    },
  };
  return synth;
}
