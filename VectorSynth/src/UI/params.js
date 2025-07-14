import { masterGain } from "../effects/master-fx.js";
export function getSynthParams(
  synth,
  audioCtx,
  updateGlideVisibility,
  vectorPad,
  masterGain
) {
  const fxParams = [];
  const fxBlocks = document.querySelectorAll(".fx-block");

  fxBlocks.forEach((fxDiv) => {
    const group = fxDiv.dataset.fx || "FX";
    const inputs = fxDiv.querySelectorAll("input, select, button");

    inputs.forEach((el) => {
      const id = el.dataset.paramId || el.id;
      if (!id) return;

      const label =
        el.closest(".slider-div, .select-div")?.querySelector("label")
          ?.textContent ||
        el.getAttribute("aria-label") ||
        el.name ||
        id;

      const type =
        el.tagName === "SELECT"
          ? "select"
          : el.tagName === "BUTTON"
          ? "checkbox"
          : el.type;

      const value =
        el.tagName === "SELECT"
          ? el.value
          : el.type === "range" || el.type === "number"
          ? parseFloat(el.value)
          : el.type === "checkbox"
          ? el.checked
          : el.value;

      const options =
        el.tagName === "SELECT"
          ? [...el.options].map((opt) => ({
              label: opt.textContent.trim(),
              value: opt.value,
            }))
          : undefined;

      // ✅ DEBUG: Log select options
      if (options) {
        console.log(`FX Param "${label}" options:`, options);
      }

      fxParams.push({
        id,
        label,
        group,
        category: "FX",
        type,
        min: el.min ? parseFloat(el.min) : undefined,
        max: el.max ? parseFloat(el.max) : undefined,
        value,
        options,
        apply: (val) => {
          if (type === "checkbox" && el.tagName === "BUTTON") {
            el.click(); // toggles value
          } else {
            el.value = val;
            el.dispatchEvent(new Event("input"));
            el.dispatchEvent(new Event("change")); // <-- important for <select>
          }
        },
        toggleLabels:
          el.tagName === "BUTTON"
            ? [el.classList.contains("off") ? "Off" : "On"]
            : undefined,
      });
    });
  });

  return [
    ...fxParams,
    {
      id: "vector-x",
      label: "X",
      group: "Vector Pad",
      category: "global",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: vectorPad?.x ?? 0.5,
      apply: (val) => vectorPad.set(val, vectorPad.y, true),
    },
    {
      id: "vector-y",
      label: "Y",
      group: "Vector Pad",
      category: "global",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: vectorPad?.y ?? 0.5,
      apply: (val) => vectorPad.set(vectorPad.x, val, true),
    },
    {
      id: "vector-mode",
      label: "Vector Mode",
      group: "Vector Pad",
      category: "global",
      type: "select",
      value: vectorPad?.mode ?? "static",
      options: [
        { label: "Static", value: "static" },
        { label: "LFO", value: "lfo" },
        { label: "Bounce", value: "bounce" },
        { label: "Random", value: "random" },
        { label: "Spiral", value: "spiral" },
        { label: "Lissajous", value: "lissajous" },
        { label: "Drunk", value: "drunk" },
        { label: "Grid", value: "grid" },
        { label: "Chaos", value: "chaos" },
        { label: "Orbit", value: "orbit" },
        { label: "Samplehold", value: "samplehold" },
        { label: "Zigzag", value: "zigzag" },
      ],
      apply: (val) => vectorPad.setMode(val),
    },
    {
      id: "vector-speed",
      label: "Speed",
      group: "Vector Pad",
      category: "global",
      type: "slider",
      min: 0.1,
      max: 5.0,
      step: 0.01,
      value: vectorPad?.speed ?? 1,
      apply: (val) => vectorPad.setSpeed(val),
    },
    // --- Unison
    {
      id: "unison",
      label: "Unison",
      group: "Unison Controls",
      category: "global",
      type: "slider",
      min: 1,
      max: 8,
      step: 1,
      value: synth.unison ?? 3,
      apply: (val) => {
        synth.unison = Math.round(val);
      },
    },
    {
      id: "detune",
      label: "Detune",
      group: "Unison Controls",
      category: "global",
      type: "slider",
      min: 0,
      max: 50,
      step: 1,
      value: synth.detuneCents ?? 12,
      apply: (val) => {
        synth.detuneCents = val;
        // ensure all oscParams are in sync:
        for (const p of synth.oscParams) p.detuneCents = val;
        synth.setDetuneAll(val);
      },
    },
    {
      id: "voice-mode",
      label: "Voice Mode",
      group: "Portamento",
      category: "global",
      type: "select",
      value: synth.mode ?? "poly",
      options: [
        { label: "Poly", value: "poly" },
        { label: "Mono", value: "mono" },
      ],
      apply: (val) => {
        synth.setMode(val);
        updateGlideVisibility();
      },
    },
    {
      id: "glide-mode",
      label: "Glide Mode",
      group: "Portamento",
      category: "global",
      type: "select",
      value: synth.glideMode ?? "legato",
      options: [
        { label: "Legato", value: "legato" },
        { label: "Always", value: "always" },
      ],
      apply: (val) => synth.setGlideMode(val),
    },
    {
      id: "glide-time",
      label: "Glide Time",
      group: "Portamento",
      category: "global",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.glideTime ?? 0,
      apply: (val) => (synth.glideTime = parseFloat(val)),
    },
    {
      id: "outputVol",
      label: "Volume",
      group: "Master",
      category: "global",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
      apply: (val) => {
        masterGain.gain.value = parseFloat(val);
        const outputValue = document.getElementById("outputValue");
        if (outputValue) {
          outputValue.textContent = parseFloat(val).toFixed(2);
        }
      },
    },
    // --- Oscillator 1 Controls ---
    {
      id: "osc1-wave",
      label: "Wave",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[0]?.type ?? "sawtooth",
      options: [
        { label: "Saw", value: "sawtooth" },
        { label: "Square", value: "square" },
        { label: "Triangle", value: "triangle" },
        { label: "Sine", value: "sine" },
      ],
      apply: (val) => synth.setOscType?.(0, val),
    },
    {
      id: "osc1-octave",
      label: "Octave",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[0]?.octave ?? 0,
      options: [
        { label: "-2", value: -2 },
        { label: "-1", value: -1 },
        { label: "0", value: 0 },
        { label: "+1", value: 1 },
        { label: "+2", value: 2 },
      ],
      apply: (val) => synth.setOscOctave?.(0, Number(val)),
    },
    {
      id: "osc1-semitone",
      label: "Semitone",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "slider",
      min: -12,
      max: 12,
      step: 1,
      value: synth.oscParams?.[0]?.semitone ?? 0,
      apply: (val) => synth.setOscSemitone?.(0, Number(val)),
    },
    {
      id: "osc1-fine",
      label: "Fine Tune",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "slider",
      min: -50,
      max: 50,
      step: 1,
      value: synth.oscParams?.[0]?.fineTune ?? 0,
      apply: (val) => synth.setOscFineTune?.(0, Number(val)),
    },
    {
      id: "osc1-pan",
      label: "Pan",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "slider",
      min: -1,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[0]?.pan ?? 0,
      apply: (val) => synth.setOscPan?.(0, Number(val)),
    },
    {
      id: "osc1-level",
      label: "Level",
      group: "Oscillator 1",
      category: "Oscillator",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[0]?.gain ?? 1,
      apply: (val) => synth.setOscGain?.(0, Number(val)),
    },
    // --- Oscillator 2 Controls ---
    {
      id: "osc2-wave",
      label: "Wave",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[1]?.wave ?? "triangle",
      options: [
        { label: "Saw", value: "sawtooth" },
        { label: "Square", value: "square" },
        { label: "Triangle", value: "triangle" },
        { label: "Sine", value: "sine" },
      ],
      apply: (val) => synth.setOscWave?.(1, val),
    },
    {
      id: "osc2-octave",
      label: "Octave",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[1]?.octave ?? 0,
      options: [
        { label: "-2", value: -2 },
        { label: "-1", value: -1 },
        { label: "0", value: 0 },
        { label: "+1", value: 1 },
        { label: "+2", value: 2 },
      ],
      apply: (val) => synth.setOscOctave?.(1, Number(val)),
    },
    {
      id: "osc2-semitone",
      label: "Semitone",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "slider",
      min: -12,
      max: 12,
      step: 1,
      value: synth.oscParams?.[1]?.semitone ?? 0,
      apply: (val) => synth.setOscSemitone?.(1, Number(val)),
    },
    {
      id: "osc2-fine",
      label: "Fine Tune",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "slider",
      min: -50,
      max: 50,
      step: 1,
      value: synth.oscParams?.[1]?.fineTune ?? 0,
      apply: (val) => synth.setOscFineTune?.(1, Number(val)),
    },
    {
      id: "osc2-pan",
      label: "Pan",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "slider",
      min: -1,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[1]?.pan ?? 0,
      apply: (val) => synth.setOscPan?.(1, Number(val)),
    },
    {
      id: "osc2-level",
      label: "Level",
      group: "Oscillator 2",
      category: "Oscillator",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[1]?.gain ?? 1,
      apply: (val) => synth.setOscGain?.(1, Number(val)),
    },
    // --- Oscillator 3 Controls ---
    {
      id: "osc3-wave",
      label: "Wave",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[2]?.wave ?? "square",
      options: [
        { label: "Saw", value: "sawtooth" },
        { label: "Square", value: "square" },
        { label: "Triangle", value: "triangle" },
        { label: "Sine", value: "sine" },
      ],
      apply: (val) => synth.setOscWave?.(2, val),
    },
    {
      id: "osc3-octave",
      label: "Octave",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[2]?.octave ?? 0,
      options: [
        { label: "-2", value: -2 },
        { label: "-1", value: -1 },
        { label: "0", value: 0 },
        { label: "+1", value: 1 },
        { label: "+2", value: 2 },
      ],
      apply: (val) => synth.setOscOctave?.(2, Number(val)),
    },
    {
      id: "osc3-semitone",
      label: "Semitone",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "slider",
      min: -12,
      max: 12,
      step: 1,
      value: synth.oscParams?.[2]?.semitone ?? 0,
      apply: (val) => synth.setOscSemitone?.(2, Number(val)),
    },
    {
      id: "osc3-fine",
      label: "Fine Tune",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "slider",
      min: -50,
      max: 50,
      step: 1,
      value: synth.oscParams?.[2]?.fineTune ?? 0,
      apply: (val) => synth.setOscFineTune?.(2, Number(val)),
    },
    {
      id: "osc3-pan",
      label: "Pan",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "slider",
      min: -1,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[2]?.pan ?? 0,
      apply: (val) => synth.setOscPan?.(2, Number(val)),
    },
    {
      id: "osc3-level",
      label: "Level",
      group: "Oscillator 3",
      category: "Oscillator",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[2]?.gain ?? 1,
      apply: (val) => synth.setOscGain?.(2, Number(val)),
    },
    // --- Oscillator 4 Controls ---
    {
      id: "osc4-wave",
      label: "Wave",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[3]?.wave ?? "sine",
      options: [
        { label: "Saw", value: "sawtooth" },
        { label: "Square", value: "square" },
        { label: "Triangle", value: "triangle" },
        { label: "Sine", value: "sine" },
      ],
      apply: (val) => synth.setOscWave?.(3, val),
    },
    {
      id: "osc4-octave",
      label: "Octave",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "select",
      value: synth.oscParams?.[3]?.octave ?? 0,
      options: [
        { label: "-2", value: -2 },
        { label: "-1", value: -1 },
        { label: "0", value: 0 },
        { label: "+1", value: 1 },
        { label: "+2", value: 2 },
      ],
      apply: (val) => synth.setOscOctave?.(3, Number(val)),
    },
    {
      id: "osc4-semitone",
      label: "Semitone",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "slider",
      min: -12,
      max: 12,
      step: 1,
      value: synth.oscParams?.[3]?.semitone ?? 0,
      apply: (val) => synth.setOscSemitone?.(3, Number(val)),
    },
    {
      id: "osc4-fine",
      label: "Fine Tune",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "slider",
      min: -50,
      max: 50,
      step: 1,
      value: synth.oscParams?.[3]?.fineTune ?? 0,
      apply: (val) => synth.setOscFineTune?.(3, Number(val)),
    },
    {
      id: "osc4-pan",
      label: "Pan",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "slider",
      min: -1,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[3]?.pan ?? 0,
      apply: (val) => synth.setOscPan?.(3, Number(val)),
    },
    {
      id: "osc4-level",
      label: "Level",
      group: "Oscillator 4",
      category: "Oscillator",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.oscParams?.[3]?.gain ?? 1,
      apply: (val) => synth.setOscGain?.(3, Number(val)),
    },
    // --- Filter Controls
    {
      id: "filter-type",
      label: "Type",
      group: "Filter",
      category: "Main Filter",
      type: "select",
      value: synth?.filterType ?? "lowpass",
      options: [
        { label: "Lowpass", value: "lowpass" },
        { label: "Highpass", value: "highpass" },
        { label: "Band", value: "bandpass" },
        { label: "Notch", value: "notch" },
        { label: "Allpass", value: "allpass" },
      ],
      apply: (val) => synth.setFilterType(val),
    },
    {
      id: "filter-cutoff",
      label: "Frequency",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 50,
      max: 16000,
      step: 1,
      value: synth.filterCutoff ?? 12000,
      apply: (val) => {
        synth.filterCutoff = val;
        synth.setFilter?.(val, synth.filterResonance ?? 0.7);
      },
    },
    {
      id: "filter-resonance",
      label: "Resonance",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 0.1,
      max: 10,
      step: 0.01,
      value: synth.filterResonance ?? 0.7,
      apply: (val) => {
        synth.filterResonance = val;
        synth.setFilter?.(synth.filterCutoff ?? 1000, val);
      },
    },
    {
      id: "filter-env-depth",
      label: "Envelope Depth",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: -1,
      max: 1,
      step: 0.01,
      value: synth.filterEnvDepth ?? 0.5,
      apply: (val) => {
        synth.filterEnvDepth = val;
        synth.setFilterEnv?.({}, val);
      },
    },
    // --- Filter Envelope
    {
      id: "filter-env-attack",
      label: "Attack",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.filterEnv?.attack ?? 0.01,
      apply: (val) => {
        synth.filterEnv = { ...synth.filterEnv, attack: parseFloat(val) };
        synth.setFilterEnv?.(synth.filterEnv, synth.filterEnvDepth ?? 0.5);
      },
    },
    {
      id: "filter-env-decay",
      label: "Decay",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.filterEnv?.decay ?? 0.2,
      apply: (val) => {
        synth.filterEnv = { ...synth.filterEnv, decay: parseFloat(val) };
        synth.setFilterEnv?.(synth.filterEnv, synth.filterEnvDepth ?? 0.5);
      },
    },
    {
      id: "filter-env-sustain",
      label: "Sustain",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.filterEnv?.sustain ?? 0,
      apply: (val) => {
        synth.filterEnv = { ...synth.filterEnv, sustain: parseFloat(val) };
        synth.setFilterEnv?.(synth.filterEnv, synth.filterEnvDepth ?? 0.5);
      },
    },
    {
      id: "filter-env-release",
      label: "Release",
      group: "Filter",
      category: "Main Filter",
      type: "slider",
      min: 0.01,
      max: 2,
      step: 0.01,
      value: synth.filterEnv?.release ?? 0.2,
      apply: (val) => {
        synth.filterEnv = { ...synth.filterEnv, release: parseFloat(val) };
        synth.setFilterEnv?.(synth.filterEnv, synth.filterEnvDepth ?? 0.5);
      },
    },
    // --- Amp Envelope
    {
      id: "env-attack",
      label: "Attack",
      group: "Amp Envelope",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.envelope.attack ?? 0.2,
      apply: (val) => {
        synth.envelope = { ...synth.envelope, attack: parseFloat(val) };
      },
    },
    {
      id: "env-decay",
      label: "Decay",
      group: "Amp Envelope",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.envelope.decay ?? 0.1,
      apply: (val) => {
        synth.envelope = { ...synth.envelope, decay: parseFloat(val) };
      },
    },
    {
      id: "env-sustain",
      label: "Sustain",
      group: "Amp Envelope",
      category: "Main Filter",
      type: "slider",
      min: 0,
      max: 1,
      step: 0.01,
      value: synth.envelope.sustain ?? 0.7,
      apply: (val) => {
        synth.envelope = { ...synth.envelope, sustain: parseFloat(val) };
      },
    },
    {
      id: "env-release",
      label: "Release",
      group: "Amp Envelope",
      category: "Main Filter",
      type: "slider",
      min: 0.01,
      max: 2,
      step: 0.01,
      value: synth.envelope.release ?? 0.4,
      apply: (val) => {
        synth.envelope = { ...synth.envelope, release: parseFloat(val) };
      },
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
    {
      id: "modEnv2",
      label: "Env2",
      group: "Mod Envelope 2",
      category: "Envelopes",
      type: "mod-env-source",
    },
    // LFO 1
    {
      id: "lfo1-rate",
      label: "Rate",
      group: "LFO 1",
      category: "LFO",
      type: "slider",
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
            audioCtx.currentTime
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
      type: "slider",
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
            audioCtx.currentTime
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
      type: "slider",
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
            audioCtx.currentTime
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
