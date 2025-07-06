import { waveFileToLabel } from "../utils/wave-friendly-label.js";

export function getSynthParams(synth, audioContext) {
  const waveOptions = synth.waveFiles.map((name) => ({
    label: waveFileToLabel(name),
    value: name,
  }));

  return [
    {
      id: "osc1-a",
      label: "Wave A",
      type: "select",
      group: "Oscillator A",
      category: "Oscillator",
      options: waveOptions,
      value: synth.waveFiles[22],
      apply: (val) => synth.updateWave("osc1A", val),
    },
    {
      id: "osc1-b",
      label: "Wave B",
      type: "select",
      group: "Oscillator A",
      category: "Oscillator",
      options: waveOptions,
      value: synth.waveFiles[23],
      apply: (val) => synth.updateWave("osc1B", val),
    },
    {
      id: "detune1",
      label: "Detune",
      group: "Oscillator A",
      category: "Oscillator",
      min: -1200,
      max: 1200,
      step: 1,
      value: 0,
      type: "slider",
      apply: (val) =>
        synth.setDetune(parseFloat(val), synth.currentDetune2 || 0),
    },
    {
      id: "volume1",
      label: "Volume",
      group: "Oscillator A",
      category: "Oscillator",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      type: "slider",
      apply: (val) => {
        synth.volume1 = parseFloat(val);
        synth.node.port.postMessage({
          type: "volume",
          data: {
            volume1: synth.volume1,
            volume2: synth.volume2 ?? 1.0,
          },
        });
      },
    },
    {
      id: "osc2-a",
      label: "Wave A",
      type: "select",
      group: "Oscillator B",
      category: "Oscillator",
      options: waveOptions,
      value: synth.waveFiles[41],
      apply: (val) => synth.updateWave("osc2A", val),
    },
    {
      id: "osc2-b",
      label: "Wave B",
      type: "select",
      group: "Oscillator B",
      category: "Oscillator",
      options: waveOptions,
      value: synth.waveFiles[36],
      apply: (val) => synth.updateWave("osc2B", val),
    },
    {
      id: "detune2",
      label: "Detune",
      group: "Oscillator B",
      category: "Oscillator",
      min: -1200,
      max: 1200,
      step: 1,
      value: 0,
      type: "slider",
      apply: (val) =>
        synth.setDetune(synth.currentDetune1 || 0, parseFloat(val)),
    },
    {
      id: "volume2",
      label: "Volume",
      group: "Oscillator B",
      category: "Oscillator",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      type: "slider",
      apply: (val) => {
        synth.volume2 = parseFloat(val);
        synth.node.port.postMessage({
          type: "volume",
          data: {
            volume1: synth.volume1 ?? 1.0,
            volume2: synth.volume2,
          },
        });
      },
    },
    {
      id: "oscillator-mod-lfo-rate",
      label: "LFO Rate",
      group: "Oscillator Mod",
      category: "Oscillator",
      min: 0.01,
      max: 40,
      step: 0.01,
      value: 0.01,
      type: "slider",
      apply: (val) => {
        synth.currentLfoRate = parseFloat(val);
        synth.node.port.postMessage({
          type: "lfo",
          data: { rate: synth.currentLfoRate, depth: synth.currentLfoDepth },
        });
      },
    },
    {
      id: "lfo-depth",
      label: "LFO Depth",
      group: "Oscillator Mod",
      category: "Oscillator",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.0,
      type: "slider",
      apply: (val) => {
        synth.currentLfoDepth = parseFloat(val);
        synth.node.port.postMessage({
          type: "lfo",
          data: {
            rate: synth.currentLfoRate || 0.01,
            depth: synth.currentLfoDepth,
          },
        });
      },
    },
    {
      id: "lfo-target",
      label: "LFO Target",
      group: "Oscillator Mod",
      category: "Oscillator",
      type: "select",
      value: "both",
      options: [
        { label: "None", value: "none" },
        { label: "Morph", value: "morph" },
        { label: "Phase Mod", value: "modAmount" },
        { label: "Both", value: "both" },
      ],
      apply: (val) =>
        synth.node.port.postMessage({
          type: "lfoTarget",
          data: val,
        }),
    },
    {
      id: "lfo-shape",
      label: "LFO Shape",
      group: "Oscillator Mod",
      category: "Oscillator",
      type: "select",
      value: "sine",
      options: [
        { label: "Sine", value: "sine" },
        { label: "Triangle", value: "triangle" },
        { label: "Square", value: "square" },
        { label: "Sawtooth", value: "sawtooth" },
        { label: "Ramp", value: "ramp" },
      ],
      apply: (val) => {
        synth.currentLfoShape = val;
        synth.node.port.postMessage({
          type: "lfoShape",
          data: val,
        });
      },
    },
    {
      id: "morph",
      label: "Morph",
      group: "Oscillator Mod",
      category: "Oscillator",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
      type: "slider",
      apply: (val) => synth.setMorph(parseFloat(val)),
    },
    {
      id: "phase-modulation",
      label: "Phase Mod",
      group: "Oscillator Mod",
      category: "Oscillator",
      min: 0,
      max: 10,
      step: 0.01,
      value: 0,
      type: "slider",
      apply: (val) => synth.setModAmount(parseFloat(val)),
    },
    {
      id: "fx-lfo-enable",
      label: "Bypass",
      group: "Filter Morph",
      category: "Filters",
      type: "checkbox",
      value: synth.fxLfo?.bypass ?? true,
      toggleLabels: ["Off", "On"],
      apply: (val) => synth.setFxLfoBypass(val),
    },
    {
      id: "fx-lfo-rate",
      label: "LFO Rate",
      group: "Filter Morph",
      category: "Filters",
      min: 0.01,
      max: 5,
      step: 0.01,
      value: 0.2,
      type: "slider",
      apply: (val) => synth.setFxLfoRate(parseFloat(val)),
    },
    {
      id: "fx-lfo-depth",
      label: "LFO Depth",
      group: "Filter Morph",
      category: "Filters",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.0,
      type: "slider",
      apply: (val) => synth.setFxLfoDepth(parseFloat(val)),
    },
    {
      id: "fx-mix",
      label: "Filter Mix",
      group: "Filter Morph",
      category: "Filters",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      type: "slider",
      apply: (val) => synth.setEffectMix(parseFloat(val)),
    },
    {
      id: "dualFilter-drive",
      label: "Drive",
      group: "Filter A",
      category: "Filters",
      min: 0,
      max: 100,
      step: 1,
      value: 20,
      type: "slider",
      apply: (val) => (synth.dualFilter.drive = parseInt(val)),
    },
    {
      id: "filter1-type",
      label: "Type A",
      group: "Filter A",
      category: "Filters",
      type: "select",
      value: "lowpass",
      options: [
        { label: "Low", value: "lowpass" },
        { label: "High", value: "highpass" },
        { label: "Band", value: "bandpass" },
      ],
      apply: (val) => (synth.dualFilter.filterA.type = val),
    },
    {
      id: "dualFilter-freqA",
      label: "Frequency A",
      group: "Filter A",
      category: "Filters",
      min: 20,
      max: 20000,
      step: 1,
      value: 800,
      type: "slider",
      apply: (val) => (synth.dualFilter.freqA = parseInt(val)),
    },
    {
      id: "dualFilter-resA",
      label: "Resonance A",
      group: "Filter A",
      category: "Filters",
      min: 0,
      max: 20,
      step: 0.1,
      value: 4,
      type: "slider",
      apply: (val) => (synth.dualFilter.filterA.Q.value = parseFloat(val)),
    },
    {
      id: "filter2-type",
      label: "Type B",
      group: "Filter A",
      category: "Filters",
      type: "select",
      value: "lowpass",
      options: [
        { label: "Low", value: "lowpass" },
        { label: "High", value: "highpass" },
        { label: "Band", value: "bandpass" },
      ],
      apply: (val) => (synth.dualFilter.filterB.type = val),
    },
    {
      id: "dualFilter-freqB",
      label: "Frequency B",
      group: "Filter A",
      category: "Filters",
      min: 20,
      max: 20000,
      step: 1,
      value: 1200,
      type: "slider",
      apply: (val) => (synth.dualFilter.freqB = parseInt(val)),
    },
    {
      id: "dualFilter-resB",
      label: "Resonance B",
      group: "Filter A",
      category: "Filters",
      min: 0,
      max: 20,
      step: 0.1,
      value: 3,
      type: "slider",
      apply: (val) => (synth.dualFilter.filterB.Q.value = parseFloat(val)),
    },
    {
      id: "dualFilter-routing",
      label: "Routing",
      type: "checkbox",
      group: "Filter A",
      category: "Filters",
      toggleLabels: ["Parallel", "Serial"],
      value: synth.dualFilter.serialRouting,
      apply: (val) => (synth.dualFilter.serialRouting = val),
    },
    //morphing filter
    {
      id: "morphingFilter-typeA",
      label: "Type A",
      group: "Filter B",
      category: "Filters",
      type: "select",
      value: synth.morphingFilter.filterA.type,
      options: [
        { label: "Low", value: "lowpass" },
        { label: "High", value: "highpass" },
        { label: "Band", value: "bandpass" },
        { label: "Notch", value: "notch" },
        { label: "Peak", value: "peaking" },
      ],
      apply: (val) => (synth.morphingFilter.filterA.type = val),
    },
    {
      id: "morphingFilter-freqA",
      label: "Frequency A",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 300,
      min: 20,
      max: 20000,
      step: 1,
      apply: (val) => (synth.morphingFilter.freqA = val),
    },
    {
      id: "morphingFilter-resonanceA",
      label: "Resonance A",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 1.0,
      min: 0.1,
      max: 20,
      step: 0.1,
      apply: (val) => (synth.morphingFilter.resonanceA = val),
    },
    {
      id: "morphingFilter-typeB",
      label: "Type B",
      group: "Filter B",
      category: "Filters",
      type: "select",
      value: synth.morphingFilter.filterB.type,
      options: [
        { label: "Low", value: "lowpass" },
        { label: "High", value: "highpass" },
        { label: "Band", value: "bandpass" },
        { label: "Notch", value: "notch" },
        { label: "Peak", value: "peaking" },
      ],
      apply: (val) => (synth.morphingFilter.filterB.type = val),
    },
    {
      id: "morphingFilter-freqB",
      label: "Frequency B",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 6000,
      min: 20,
      max: 20000,
      step: 1,
      type: "slider",
      apply: (val) => (synth.morphingFilter.freqB = val),
    },
    {
      id: "morphingFilter-resonanceB",
      label: "Resonance B",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 1.0,
      min: 0.1,
      max: 20,
      step: 0.1,
      type: "slider",
      apply: (val) => (synth.morphingFilter.resonanceB = val),
    },
    {
      id: "morphingFilter-morph",
      label: "Morph",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      apply: (val) => (synth.morphingFilter.morph = val),
    },
    {
      id: "morphingFilter-lfoFrequency",
      label: "Rate",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 0.4,
      min: 0.01,
      max: 10,
      step: 0.01,
      type: "slider",
      apply: (val) => (synth.morphingFilter.lfoFrequency = val),
    },
    {
      id: "morphingFilter-lfoDepth",
      label: "Depth",
      group: "Filter B",
      category: "Filters",
      type: "slider",
      value: 0.35,
      min: 0,
      max: 1,
      step: 0.01,
      type: "slider",
      apply: (val) => (synth.morphingFilter.lfoDepth = val),
    },
    // Mod Envelope 1 Controls
    {
      id: "modenv1-attack",
      label: "Attack",
      group: "Mod Envelope 1",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[0] ? synth.uiModEnvs[0].attack : 0.1,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[0])
          synth.uiModEnvs[0].attack = parseFloat(val);
      },
    },
    {
      id: "modenv1-decay",
      label: "Decay",
      group: "Mod Envelope 1",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[0] ? synth.uiModEnvs[0].decay : 0.2,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[0])
          synth.uiModEnvs[0].decay = parseFloat(val);
      },
    },
    {
      id: "modenv1-sustain",
      label: "Sustain",
      group: "Mod Envelope 1",
      category: "Envelopes",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[0]
          ? synth.uiModEnvs[0].sustain
          : 0.7,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[0])
          synth.uiModEnvs[0].sustain = parseFloat(val);
      },
    },
    {
      id: "modenv1-release",
      label: "Release",
      group: "Mod Envelope 1",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[0]
          ? synth.uiModEnvs[0].release
          : 0.3,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[0])
          synth.uiModEnvs[0].release = parseFloat(val);
      },
    },

    // Draggable Source Widget for Mod Envelope
    {
      id: "modEnv1",
      label: "Env1",
      group: "Mod Envelope 1",
      category: "Envelopes",
      type: "mod-env-source",
    },
    // Mod Envelope 2 Controls
    {
      id: "modenv2-attack",
      label: "Attack",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[1] ? synth.uiModEnvs[1].attack : 0.1,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[1])
          synth.uiModEnvs[0].attack = parseFloat(val);
      },
    },
    {
      id: "modenv2-decay",
      label: "Decay",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[1] ? synth.uiModEnvs[1].decay : 0.2,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[1])
          synth.uiModEnvs[0].decay = parseFloat(val);
      },
    },
    {
      id: "modenv2-sustain",
      label: "Sustain",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[1]
          ? synth.uiModEnvs[1].sustain
          : 0.7,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[1])
          synth.uiModEnvs[1].sustain = parseFloat(val);
      },
    },
    {
      id: "modenv2-release",
      label: "Release",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value:
        synth.uiModEnvs && synth.uiModEnvs[1]
          ? synth.uiModEnvs[1].release
          : 0.3,
      apply: (val) => {
        if (synth.uiModEnvs && synth.uiModEnvs[1])
          synth.uiModEnvs[1].release = parseFloat(val);
      },
    },

    // Draggable Source Widget for Mod Envelope
    {
      id: "modEnv2",
      label: "Env2",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "mod-env-source",
    },
    // Amp Envelope Controls
    {
      id: "attack",
      label: "Attack",
      group: "Amp Envelope",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value: 0.01,
      apply: (val) => synth.setEnvelope({ attackTime: parseFloat(val) }),
    },
    {
      id: "decay",
      label: "Decay",
      group: "Amp Envelope",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 2,
      step: 0.01,
      value: 0.2,
      apply: (val) => synth.setEnvelope({ decayTime: parseFloat(val) }),
    },
    {
      id: "sustain",
      label: "Sustain",
      group: "Amp Envelope",
      category: "Envelopes",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.7,
      apply: (val) => synth.setEnvelope({ sustainLevel: parseFloat(val) }),
    },
    {
      id: "release",
      label: "Release",
      group: "Amp Envelope",
      category: "Envelopes",
      type: "slider",
      min: 0.001,
      max: 4,
      step: 0.01,
      value: 0.5,
      apply: (val) => synth.setEnvelope({ releaseTime: parseFloat(val) }),
    },
    //delay
    {
      id: "delay-bypass",
      label: "Bypass",
      type: "checkbox",
      group: "Delay",
      category: "Fx",
      toggleLabels: ["Off", "On"],
      value: true,
      apply: (val) => (synth.delay.bypass = val),
    },
    {
      id: "delay-time",
      label: "Time",
      group: "Delay",
      category: "Fx",
      type: "slider",
      value: 20,
      min: 20,
      max: 1000,
      step: 1,
      apply: (val) => (synth.delay.delayTime = parseInt(val)),
    },
    {
      id: "delay-feedback",
      label: "Feedback",
      group: "Delay",
      category: "Fx",
      type: "slider",
      value: 0.4,
      min: 0.0,
      max: 0.9,
      step: 0.01,
      apply: (val) => (synth.delay.feedback = parseFloat(val)),
    },
    {
      id: "delay-cut",
      label: "Cut Off",
      group: "Delay",
      category: "Fx",
      type: "slider",
      value: 20000,
      min: 20,
      max: 20000,
      step: 1,
      apply: (val) => (synth.delay.cutoff = parseInt(val)),
    },
    {
      id: "delay-wet",
      label: "Wet",
      group: "Delay",
      category: "Fx",
      type: "slider",
      value: 0.4,
      min: 0.0,
      max: 1.0,
      step: 0.1,
      apply: (val) => (synth.delay.wetLevel = parseFloat(val)),
    },
    {
      id: "distortion-bypass",
      label: "Bypass",
      type: "checkbox",
      group: "Distortion",
      category: "Fx",
      toggleLabels: ["Off", "On"],
      value: synth.distortion.bypass,
      apply: (val) => (synth.distortion.bypass = val),
    },
    {
      id: "distortion-drive",
      label: "Drive",
      group: "Distortion",
      category: "Fx",
      type: "slider",
      value: 1,
      min: 1,
      max: 10,
      step: 0.1,
      apply: (val) => (synth.distortion.drive = parseInt(val)),
    },
    {
      id: "distortion-curve",
      label: "Curve",
      group: "Distortion",
      category: "Fx",
      type: "slider",
      value: 200,
      min: 0,
      max: 1000,
      step: 1,
      apply: (val) => (synth.distortion.curveAmount = parseInt(val)),
    },
    //Ring Mod
    {
      id: "ring-mod-bypass",
      label: "Bypass",
      type: "checkbox",
      group: "Ring Mod",
      category: "Fx",
      toggleLabels: ["Off", "On"],
      value: synth.ringMod.bypass,
      apply: (val) => (synth.ringMod.bypass = val),
    },
    {
      id: "ring-mod-freq",
      label: "Freq",
      group: "Ring Mod",
      category: "Fx",
      type: "slider",
      value: 50,
      min: 0.1,
      max: 1000,
      step: 0.1,
      apply: (val) => (synth.ringMod.modFrequency = parseFloat(val)),
    },
    {
      id: "ring-mod-depth",
      label: "Depth",
      group: "Ring Mod",
      category: "Fx",
      type: "slider",
      value: 1,
      min: 0,
      max: 1,
      step: 0.01,
      apply: (val) => (synth.ringMod.modDepth = parseFloat(val)),
    },
    //Reverb
    {
      id: "reverb-bypass",
      label: "Bypass",
      type: "checkbox",
      group: "Reverb",
      category: "Fx",
      toggleLabels: ["Off", "On"],
      value: true,
      apply: (val) => (synth.verb.bypass = val),
    },
    {
      id: "reverb-decay",
      label: "Decay",
      group: "Reverb",
      category: "Fx",
      type: "select",
      value: "0.6",
      options: [
        { label: "Shortest", value: "0.2" },
        { label: "Short", value: "0.6" },
        { label: "Medium", value: "1.0" },
        { label: "Long", value: "1.5" },
        { label: "Longest", value: "2.0" },
      ],
      apply: (val) => {
        synth.verb.impulseDuration = parseFloat(val);
        synth.verb.regenerateImpulse();
      },
    },
    {
      id: "reverb-duration",
      label: "Duration",
      group: "Reverb",
      category: "Fx",
      type: "select",
      value: "0.6",
      options: [
        { label: "Shortest", value: "0.2" },
        { label: "Short", value: "0.6" },
        { label: "Medium", value: "1.0" },
        { label: "Long", value: "1.5" },
        { label: "Longest", value: "2.0" },
      ],
      apply: (val) => {
        synth.verb.impulseDuration = parseFloat(val);
        synth.verb.regenerateImpulse();
      },
    },
    {
      id: "reverb-highcut",
      label: "High Cut",
      group: "Reverb",
      category: "Fx",
      type: "slider",
      value: 20,
      min: 20,
      max: 22050,
      step: 1,
      type: "slider",
      apply: (val) => (synth.verb.highCut = parseInt(val)),
    },
    {
      id: "reverb-lowcut",
      label: "Low Cut",
      group: "Reverb",
      category: "Fx",
      type: "slider",
      value: 22050,
      min: 20,
      max: 22050,
      step: 1,
      type: "slider",
      apply: (val) => (synth.verb.lowCut = parseInt(val)),
    },
    {
      id: "reverb-wet",
      label: "Wet",
      group: "Reverb",
      category: "Fx",
      type: "slider",
      value: 1.0,
      min: 0.0,
      max: 1.0,
      step: 0.01,
      type: "slider",
      apply: (val) => (synth.verb.wetLevel = parseFloat(val)),
    },
    // LFO 1
    {
      id: "lfo1-rate",
      label: "Rate",
      group: "LFO 1",
      category: "LFO",
      min: 0.01,
      max: 20,
      step: 0.01,
      type: "slider",
      value: synth.uiLfos && synth.uiLfos[0] ? synth.uiLfos[0].rate : 1,
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[0]) {
          synth.uiLfos[0].rate = parseFloat(val);
          synth.uiLfos[0].osc.frequency.setValueAtTime(
            val,
            audioContext.currentTime
          );
        }
      },
    },
    {
      id: "ui-lfo1-shape",
      label: "Shape",
      group: "LFO 1",
      category: "LFO",
      type: "select",
      value:
        synth.uiLfos && synth.uiLfos[0] ? synth.uiLfos[0].osc.type : "sine",
      options: [
        { label: "Sine", value: "sine" },
        { label: "Triangle", value: "triangle" },
        { label: "Square", value: "square" },
        { label: "Sawtooth", value: "sawtooth" },
      ],
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[0]) {
          synth.uiLfos[0].osc.type = val;
        }
      },
    },
    {
      id: "lfo1",
      label: "LFO 1",
      group: "LFO 1",
      category: "LFO",
      type: "lfo-source",
    },

    // LFO 2
    {
      id: "lfo2-rate",
      label: "Rate",
      group: "LFO 2",
      category: "LFO",
      min: 0.01,
      max: 20,
      step: 0.01,
      type: "slider",
      value: synth.uiLfos && synth.uiLfos[1] ? synth.uiLfos[1].rate : 1,
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[1]) {
          synth.uiLfos[1].rate = parseFloat(val);
          synth.uiLfos[1].osc.frequency.setValueAtTime(
            val,
            audioContext.currentTime
          );
        }
      },
    },
    {
      id: "lfo2-shape",
      label: "Shape",
      group: "LFO 2",
      category: "LFO",
      type: "select",
      value:
        synth.uiLfos && synth.uiLfos[1] ? synth.uiLfos[1].osc.type : "sine",
      options: [
        { label: "Sine", value: "sine" },
        { label: "Triangle", value: "triangle" },
        { label: "Square", value: "square" },
        { label: "Sawtooth", value: "sawtooth" },
      ],
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[1]) {
          synth.uiLfos[1].osc.type = val;
        }
      },
    },
    {
      id: "lfo2",
      label: "LFO 2",
      group: "LFO 2",
      category: "LFO",
      type: "lfo-source",
    },

    // LFO 3
    {
      id: "lfo3-rate",
      label: "Rate",
      group: "LFO 3",
      category: "LFO",
      min: 0.01,
      max: 20,
      step: 0.01,
      type: "slider",
      value: synth.uiLfos && synth.uiLfos[2] ? synth.uiLfos[2].rate : 1,
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[2]) {
          synth.uiLfos[2].rate = parseFloat(val);
          synth.uiLfos[2].osc.frequency.setValueAtTime(
            val,
            audioContext.currentTime
          );
        }
      },
    },
    {
      id: "lfo3-shape",
      label: "Shape",
      group: "LFO 3",
      category: "LFO",
      type: "select",
      value:
        synth.uiLfos && synth.uiLfos[2] ? synth.uiLfos[2].osc.type : "sine",
      options: [
        { label: "Sine", value: "sine" },
        { label: "Triangle", value: "triangle" },
        { label: "Square", value: "square" },
        { label: "Sawtooth", value: "sawtooth" },
      ],
      apply: (val) => {
        if (synth.uiLfos && synth.uiLfos[2]) {
          synth.uiLfos[2].osc.type = val;
        }
      },
    },
    {
      id: "lfo3",
      label: "LFO 3",
      group: "LFO 3",
      category: "LFO",
      type: "lfo-source",
    },
  ];
}
