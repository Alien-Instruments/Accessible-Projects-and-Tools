import { setupPresetUI } from "../UI/preset-ui.js";
import { renderAudioPresetList } from "../presets/preset-manager.js";
import { createFXBlockDiv } from "../effects/master-fx.js";

export function setupPresetsAndFXUI(synth, lastLoadedPresetName = "") {
  // Presets
  setupPresetUI({ synth });
  renderAudioPresetList("audio-preset-list", synth, lastLoadedPresetName);

  // FX Chain
  window.fxChain = window.fxChain || [];

  window.fxBank = [
    { name: "Delay", className: "Delay", params: {} },
    { name: "Phaser", className: "Phaser", params: {} },
    { name: "Chorus", className: "Chorus", params: {} },
    { name: "Distortion", className: "Distortion", params: {} },
    { name: "Mutator", className: "MutatorFilter", params: {} },
    { name: "RingMod", className: "RingModulator", params: {} },
    { name: "Morph", className: "MorphingFilter", params: {} },
    { name: "EQ3", className: "EQ3Band", params: {} },
    { name: "Compressor", className: "Compressor", params: {} },
    { name: "Duotone", className: "DualFilter", params: {} },
    { name: "AutoPanner", className: "ModulatedStereoPanner", params: {} },
  ];

  window.updateFXChainUI = function () {
    const fxChainDiv = document.getElementById("fx-chain");
    fxChainDiv.innerHTML = "";
    window.fxChain.forEach((fxObj, idx) => {
      fxChainDiv.appendChild(createFXBlockDiv(fxObj, idx));
    });
  };
}
