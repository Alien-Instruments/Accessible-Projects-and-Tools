import {
  synth,
  setEnvelopeParams,
  setMasterVolume,
  setDelayTime,
  setDelayFeedback,
  setDelayWet,
  setTremDepth,
  setTremRate,
  setTremWet,
  setAutoBase,
  setAutoQ,
  setAutoOctave,
  setAutoDepth,
  setAutoRate,
  setAutoWet,
  setPhaserFreq,
  setPhaserOct,
  setPhaserBase,
  setPhaserStages,
  setPhaserQ,
  setPhaserWet,
  setPitchPitch,
  setPitchWindow,
  setPitchFeedback,
  setPitchDelay,
  setPitchWet,
} from "./synth.js";

import { modTargets } from "./mod-targets.js";
import { getAllParticles } from "./physics.js";

const currentEnvelope = {
  attack: 0.05,
  decay: 0.3,
  sustain: 0.5,
  release: 1.2,
};

const currentFilterEnv = {
  attack: 0.1,
  decay: 0.3,
  sustain: 0.4,
  release: 1.0,
};

function setParamByKey(key, value) {
  if (key === "filter.frequency") {
    synth.setFilterBaseFreq(value); // updates both filter.baseFrequency and filter.frequency.value in all voices
  } else if (key.startsWith("filter.")) {
    const subKey = key.split(".")[1];
    synth.voices.forEach((v) => {
      if (v.filter && v.filter[subKey] !== undefined) {
        v.filter[subKey].value = value;
      }
    });
    synth.options[`filter${subKey[0].toUpperCase() + subKey.slice(1)}`] = value;
  } else if (key.startsWith("filterEnv.")) {
    const subKey = key.split(".")[1];
    if (subKey === "depth") {
      synth.setFilterEnvDepth(value);
    } else {
      currentFilterEnv[subKey] = value;
      synth.setFilterEnvelope(currentFilterEnv);
    }
  } else if (key.startsWith("synth.envelope.")) {
    const subKey = key.split(".")[2];
    currentEnvelope[subKey] = value;
    setEnvelopeParams(currentEnvelope);
  } else if (key === "synth.volume") {
    setMasterVolume(value);
  } else if (key === "osc1.detune") {
    synth.voices.forEach((v) => {
      if (v.synth1 && v.synth1.oscillator) {
        v.synth1.oscillator.detune.value = value;
      }
    });
  } else if (key === "osc2.detune") {
    synth.voices.forEach((v) => {
      if (v.synth2 && v.synth2.oscillator) {
        v.synth2.oscillator.detune.value = value;
      }
    });
  } else if (key === "delay.time") {
    setDelayTime(value);
  } else if (key === "delay.wet") {
    setDelayWet(value);
  } else if (key === "delay.feedback") {
    setDelayFeedback(value);
  } else if (key === "trem.depth") {
    setTremDepth(value);
  } else if (key === "trem.frequency") {
    setTremRate(value);
  } else if (key === "trem.wet") {
    setTremWet(value);
  } else if (key === "auto.base") {
    setAutoBase(value);
  } else if (key === "auto.q") {
    setAutoQ(value);
  } else if (key === "auto.oct") {
    setAutoOctave(value);
  } else if (key === "auto.depth") {
    setAutoDepth(value);
  } else if (key === "auto.rate") {
    setAutoRate(value);
  } else if (key === "auto.wet") {
    setAutoWet(value);
  } else if (key === "phaser.base") {
    setPhaserBase(value);
  } else if (key === "phaser.q") {
    setPhaserQ(value);
  } else if (key === "phaser.stage") {
    setPhaserStages(value);
  } else if (key === "phaser.oct") {
    setPhaserOct(value);
  } else if (key === "phaser.rate") {
    setPhaserFreq(value);
  } else if (key === "phaser.wet") {
    setPhaserWet(value);
  } else if (key === "pitchShift.shift") {
    setPitchPitch(value);
  } else if (key === "pitchShift.window") {
    setPitchWindow(value);
  } else if (key === "pitchShift.delay") {
    setPitchDelay(value);
  } else if (key === "pitchShift.feedback") {
    setPitchFeedback(value);
  } else if (key === "pitchShift.wet") {
    setPitchWet(value);
  }
}

export function applyModulation() {
  modTargets.forEach((target) => {
    const { key, range } = target;
    const sourceId = document.getElementById(`${key}-source`)?.value;
    const axis = document.getElementById(`${key}-axis`)?.value;
    const baseSlider = document.getElementById(`${key}-base`);
    const depthSlider = document.getElementById(`${key}-depth`);
    const modValueSpan = document.getElementById(`${key}-current`);
    if (!baseSlider || !depthSlider || !modValueSpan) return;

    const base = Number(baseSlider.value);
    const depth = Number(depthSlider.value);

    let modValue = base; // Default to base value
    if (sourceId && axis) {
      const particle = getAllParticles().find((p) => p.id === sourceId);
      if (particle && particle.body && particle.body.position) {
        const pos = particle.body.position[axis];
        const norm = (pos + 5) / 10;
        const [min, max] = range;
        const modSpan = max - min;
        modValue = base + depth * (modSpan * norm - base);
        modValue = Math.max(min, Math.min(max, modValue));
      }
    }

    setParamByKey(key, modValue);
    modValueSpan.innerText = modValue.toFixed(2);
  });
}
