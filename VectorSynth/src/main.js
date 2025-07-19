import { announce, announceModeRef } from "./announcement/announce.js";
import { PolySynth } from "./synth/PolySynth.js";
import { setupMIDI } from "./midi/midi.js";
import { audioCtx } from "./utils/audioCtx.js";
import { setupKeyboard } from "./controls/keyboard.js";
import { buildSynthUI } from "./UI/ui.js";
import { getSynthParams } from "./UI/params.js";
import { getFXParams } from "./effects/master-fx.js";
import { triggerMIDILearnForControl } from "./midi/midi-learn.js";
import { masterGain } from "./effects/master-fx.js";
import { setupVoiceControl } from "./voice-control/voice-commands.js";
import { attachModRing } from "./modulators/mod-ring.js";
import { createUiLfo } from "./modulators/lfo-ui.js";
import { setupModulationUI } from "./modulators/modulation-ui.js";
import { setupLfoModulationUI } from "./modulators/lfo-modulation-ui.js";
import { createUiModEnv, animateModEnvs } from "./modulators/mod-env-ui.js";
import { setupModEnvModulationUI } from "./modulators/mod-env-modulation-ui.js";
import { renderFXChain } from "./effects/master-fx.js";
import { setupFXChainKeyboardUI } from "./effects/master-fx.js";
import { createArpeggiator } from "./arpeggiator/createArp.js";
import { setupArpUI } from "./UI/arp-ui.js";
import { setupMIDIHandler } from "./midi/midi-handler.js";
import { setupVectorUI, setupMusicalTypingToggle } from "./UI/vector-ui.js";
import { setupMPEUI } from "./UI/mpe-ui.js";
import { setupPresetsAndFXUI } from "./UI/preset-fx-ui.js";
import { setupShortcutsUI } from "./UI/shortcuts-ui.js";
import { updateGlideVisibility } from "./UI/glide-ui.js";
import {
  setupKeyboardModSourceDrag,
  attachSynthSliderDragListeners,
  setupModSourceDragListeners,
} from "./UI/mod-ui.js";
import {
  initMIDILearn,
  enableMIDILearnMode,
  cancelMIDILearn,
} from "./midi/midi-learn.js";

window.renderFXChain = renderFXChain;
window.fxUI = setupFXChainKeyboardUI();
window.attachModRing = attachModRing;
export let isModulating = false;
export const baseParamValues = {};
window.lastFocusedRangeInput = null;
document.addEventListener("focusin", function (e) {
  if (e.target && e.target.type === "range") {
    window.lastFocusedRangeInput = e.target;
  }
});
window.fxChain = window.fxChain || [];

const synth = new PolySynth(audioCtx, 3, 12, {}, 8, "poly", "legato", {
  pitchBendDest: "pitch",
  aftertouchDest: "filter",
  modWheelDest: "vibrato",
  slideDest: "vectorX",
});

window.synth = synth;

window.audioCtx = audioCtx;

window.getSynthParams = getSynthParams;

let keyboardOctave = 0;
let musicalTypingEnabled = true;
setupMusicalTypingToggle(
  () => musicalTypingEnabled,
  (v) => (musicalTypingEnabled = v)
);

const vectorPad = setupVectorUI(synth);

const params = getSynthParams(
  synth,
  audioCtx,
  updateGlideVisibility,
  vectorPad,
  masterGain
);

setupModulationUI({
  synth,
  audioCtx,
  announce,
  announceModeRef,
  baseParamValues,
  isModulatingRef: { value: isModulating },
});
synth.uiLfos = [createUiLfo("lfo1"), createUiLfo("lfo2"), createUiLfo("lfo3")];
window.setupKeyboardModSourceDrag = setupKeyboardModSourceDrag;
const lfoUI = setupLfoModulationUI({
  synth,
  announce,
  audioCtx,
  containerSelector: "#synth-ui",
  lfoSourcesSelector: ".lfo-source",
});

lfoUI.rebindSliderDropTargets();

synth.uiModEnvs = [createUiModEnv("modEnv1"), createUiModEnv("modEnv2")];
animateModEnvs(synth);

setupModEnvModulationUI({
  synth,
  announce,
  audioCtx,
  containerSelector: "#synth-ui",
  modEnvSourcesSelector: ".mod-env-source",
});

const arp = createArpeggiator(synth);

setupArpUI();

setupKeyboard(
  synth,
  () => keyboardOctave,
  (v) => (keyboardOctave = v),
  () => musicalTypingEnabled,
  arp
);

window.envUI = setupModEnvModulationUI({
  synth,
  announce,
  audioCtx,
});

window.lfoUI = lfoUI;

function resumeAudio() {
  if (audioCtx.state === "suspended") audioCtx.resume();
  document.body.removeEventListener("pointerdown", resumeAudio);
}

document.body.addEventListener("pointerdown", resumeAudio);

window.voiceAPI = setupVoiceControl({
  synth,
  audioCtx,
  getSynthParams: (...args) => [
    ...getSynthParams(
      synth,
      audioCtx,
      updateGlideVisibility,
      vectorPad,
      masterGain
    ),
    ...getFXParams(),
  ],
  triggerMIDILearnForControl,
  cancelMIDILearn,
  announce,
  announceModeRef,
});

buildSynthUI(params, "synth-controls");
attachSynthSliderDragListeners();
setupMIDIHandler(synth, arp);
setupShortcutsUI({ announce, announceModeRef });
attachSynthSliderDragListeners("#synth-ui");
setupPresetsAndFXUI(synth);
setupMIDI(synth);
initMIDILearn();
setupKeyboardModSourceDrag("#synth-ui");
setupKeyboardModSourceDrag("#fx-chain");
enableMIDILearnMode("synth-ui");
updateGlideVisibility();
setupMPEUI(synth);
setupModSourceDragListeners();

vectorPad.setSliders(
  document.getElementById("vector-x"),
  document.getElementById("vector-y")
);
