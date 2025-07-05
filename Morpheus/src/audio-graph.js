// src/audio-graph.js
import { audioContext } from "./utils/context.js";
import { loadScript } from "./utils/loadScript.js";

export async function createAudioGraph() {
  // Load AudioWorkletProcessor and Tuna
  await audioContext.audioWorklet.addModule("src/wavetable-processor.js");
  await loadScript("src/tuna.js");
  const node = new AudioWorkletNode(audioContext, "wavetable-processor");
  const tuna = new Tuna(audioContext);

  // === Create FX ===
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

  // === Connect Graph ===
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

  // Return all objects for use in synth setup
  return {
    node,
    tuna,
    dualFilter,
    morphingFilter,
    delay,
    distortion,
    ringMod,
    verb,
    gainFilter,
    gainFeedback,
    merger,
  };
}
