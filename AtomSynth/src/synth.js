import * as Tone from "https://esm.sh/tone";
import { DualOscPoly } from "./dual-osc-poly.js";

const masterGain = new Tone.Gain(1).toDestination();

const pingPong = new Tone.PingPongDelay({
  delayTime: "8n",
  feedback: 0.5,
  wet: 0.5,
});

const trem = new Tone.Tremolo({
  frequency: 6,
  depth: 1.0,
  wet: 1.0,
});
trem.start();

const autoFilter = new Tone.AutoFilter({
  frequency: 20,
  depth: 1.0,
  baseFrequency: 200,
  octaves: 2.6,
  filter: {
    type: "lowpass",
    Q: 1,
  },
  wet: 1.0,
});
autoFilter.start();

const phaser = new Tone.Phaser({
  frequency: 15,
  octaves: 5,
  baseFrequency: 1000,
  stages: 4,
  Q: 10,
  wet: 0,
});

const pitchShift = new Tone.PitchShift({
  pitch: 0,
  windowSize: 0.1,
  feedback: 0,
  delayTime: 1,
  wet: 0,
});

const synth = new DualOscPoly({
  osc1Type: "sawtooth",
  osc2Type: "sawtooth",
  envelope: {
    attack: 0.05,
    decay: 0.3,
    sustain: 0.5,
    release: 1.2,
  },
  filterType: "lowpass",
  filterBaseFreq: 20, // starting cutoff
  filterEnv: {
    attack: 0.1,
    decay: 0.3,
    sustain: 0.2,
    release: 1.0,
  },
  filterEnvDepth: 1,
  filterQ: 1,
  maxPolyphony: 8,
});

synth.connect(phaser);
phaser.connect(trem);
trem.connect(autoFilter);
autoFilter.connect(pitchShift);
pitchShift.connect(pingPong);
pingPong.connect(masterGain);

export function setMasterVolume(gain) {
  masterGain.gain.value = gain;
}
export function setEnvelopeParams(params) {
  synth.setEnvelope(params);
}
export function setOsc1Type(type) {
  synth.setOsc1Type(type);
}
export function setOsc2Type(type) {
  synth.setOsc2Type(type);
}
export function setFilterEnvelope(params) {
  synth.setFilterEnvelope(params);
}
export function setFilterEnvDepth(depth) {
  synth.setFilterEnvDepth(depth);
}
export function setFilterBaseFreq(freq) {
  synth.setFilterBaseFreq(freq);
}
export function setFilterQ(q) {
  synth.setFilterQ(q);
}
export function setFilterType(type) {
  synth.setFilterType(type);
}
export function triggerNote(note, velocity = 0.8, duration = "8n") {
  synth.triggerAttackRelease(note, duration, undefined, velocity);
}
export function setPortamento(seconds) {
  synth.setPortamento(seconds);
}
export function setDelayTime(value) {
  pingPong.delayTime.value = Tone.Time(value).toSeconds();
}
export function setDelayFeedback(feedback) {
  pingPong.feedback.value = feedback;
}
export function setDelayWet(wet) {
  pingPong.wet.value = wet;
}
export function setTremDepth(depth) {
  trem.depth.value = depth;
}
export function setTremRate(rate) {
  trem.frequency.value = rate;
}
export function setTremWet(wet) {
  trem.wet.value = wet;
}
export function setAutoRate(rate) {
  autoFilter.frequency.value = rate;
}
export function setAutoDepth(depth) {
  autoFilter.depth.value = depth;
}
export function setAutoBase(base) {
  autoFilter.baseFrequency = base;
}
export function setAutoOctave(oct) {
  autoFilter.octaves = oct;
}
export function setAutoQ(res) {
  autoFilter.filter.Q.value = res;
}
export function setAutoWet(wet) {
  autoFilter.wet.value = wet;
}
export function setPhaserFreq(rate) {
  phaser.frequency.value = rate;
}
export function setPhaserOct(oct) {
  phaser.octaves = oct;
}
export function setPhaserBase(freq) {
  phaser.baseFrequency = freq;
}
export function setPhaserStages(stage) {
  phaser.stages = stage;
}
export function setPhaserQ(res) {
  phaser.Q.value = res;
}
export function setPhaserWet(wet) {
  phaser.wet.value = wet;
}
export function setPitchPitch(pitch) {
  pitchShift.pitch = pitch;
}
export function setPitchWindow(win) {
  pitchShift.windowSize = win;
}
export function setPitchFeedback(feed) {
  pitchShift.feedback.value = feed;
}
export function setPitchDelay(delay) {
  pitchShift.delay.value = delay;
}
export function setPitchWet(wet) {
  pitchShift.wet.value = wet;
}

export function noteOn(note, velocity = 0.8) {
  synth._getVoice(note).triggerAttack(note, undefined, velocity);
}
export function noteOff(note) {
  // Find any voice(s) playing this note and release them
  synth.voices.forEach((voice) => {
    if (voice.note === note && voice.active) {
      voice.triggerRelease();
    }
  });
}
export { synth };
