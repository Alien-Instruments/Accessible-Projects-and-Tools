import { waveTableMap } from "./wavetable-loader.js";

// Helper for Tone.Frequency conversion, fallback if Tone not global
function noteToMidi(noteName) {
  if (window.Tone && Tone.Frequency) return Tone.Frequency(noteName).toMidi();
  return 60; // default to middle C
}

export function createSynth(audioGraph, audioContext, options = {}) {
  // Option defaults and state
  let {
    waveFiles = [],
    currentWaveA1 = "Bass/Bass3.wav",
    currentWaveB1 = "Bass/Bass4.wav",
    currentWaveA2 = "Granular/Granular2.wav",
    currentWaveB2 = "Fm/Fm5.wav",
    envelopeState = {
      attackTime: 0.01,
      decayTime: 0.2,
      sustainLevel: 0.7,
      releaseTime: 0.5,
    },
    announce = () => {},
    announceModeRef = { value: "aria" },
  } = options;

  // Destructure audio graph nodes
  const {
    node,
    dualFilter,
    morphingFilter,
    gainFilter,
    gainFeedback,
    merger,
    delay,
    distortion,
    ringMod,
    verb,
  } = audioGraph;

  // Synth controller object
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
    currentLfoRate: 0.0,
    currentLfoDepth: 0.0,
    currentLfoShape: "sine",
    delay,
    distortion,
    ringMod,
    verb,

    // Method: update wavetable pairings for each oscillator
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
      this.currentModAmount = value;
      node.port.postMessage({ type: "modAmount", data: value });
    },

    setEnvelope(update) {
      Object.assign(envelopeState, update);
      node.port.postMessage({ type: "envelope", data: envelopeState });
    },

    triggerAttack(noteName, _time, velocity = 1.0) {
      const midi = noteToMidi(noteName);
      node.port.postMessage({
        type: "noteOn",
        data: { note: midi, velocity: velocity * 127 },
      });
    },

    triggerRelease(noteName) {
      const midi = noteToMidi(noteName);
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

  // === LFOs (for UI modulation) ===
  synth.uiLfos = options.uiLfos || [];

  // === FX LFO for crossfade between filters ===
  synth.fxLfo = {
    osc: audioContext.createOscillator(),
    gain: audioContext.createGain(),
    offset: audioContext.createConstantSource(),
    invertGain: audioContext.createGain(),
    rate: 0.2,
    depth: 0.5,
    bypass: true,
  };

  synth.fxLfo.osc.type = "sine";
  synth.fxLfo.osc.frequency.value = synth.fxLfo.rate;
  synth.fxLfo.gain.gain.value = synth.fxLfo.depth;
  synth.fxLfo.offset.offset.value = 1;
  synth.fxLfo.invertGain.gain.value = -1;

  synth.fxLfo.osc.connect(synth.fxLfo.gain);
  synth.fxLfo.gain.connect(synth.gainFeedback.gain);

  synth.fxLfo.offset.connect(synth.fxLfo.invertGain);
  synth.fxLfo.gain.connect(synth.fxLfo.invertGain);
  synth.fxLfo.invertGain.connect(synth.gainFilter.gain);

  synth.fxLfo.osc.start();
  synth.fxLfo.offset.start();

  // FX LFO controls
  synth.setFxLfoRate = (val) => {
    synth.fxLfo.rate = val;
    synth.fxLfo.osc.frequency.setValueAtTime(val, audioContext.currentTime);
  };
  synth.setFxLfoDepth = (val) => {
    synth.fxLfo.depth = val;
    synth.fxLfo.gain.gain.setValueAtTime(val, audioContext.currentTime);
  };
  synth.setFxLfoBypass = (bypass) => {
    synth.fxLfo.bypass = bypass;
    if (!bypass) {
      synth.fxLfo.osc.connect(synth.fxLfo.gain);
      synth.fxLfo.offset.connect(synth.fxLfo.invertGain);
      synth.fxLfo.gain.connect(synth.gainFeedback.gain);
      synth.fxLfo.gain.connect(synth.fxLfo.invertGain);
      synth.fxLfo.invertGain.connect(synth.gainFilter.gain);
    } else {
      try {
        synth.fxLfo.osc.disconnect();
      } catch (e) {}
      try {
        synth.fxLfo.gain.disconnect();
      } catch (e) {}
      try {
        synth.fxLfo.offset.disconnect();
      } catch (e) {}
      try {
        synth.fxLfo.invertGain.disconnect();
      } catch (e) {}
    }
  };
  synth.setFxLfoBypass(synth.fxLfo.bypass);

  return synth;
}
