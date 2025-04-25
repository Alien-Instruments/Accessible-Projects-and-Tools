audioContext = new (
  typeof AudioContext !== "undefined" && AudioContext !== null
    ? AudioContext
    : webkitAudioContext
)();

this.tuna = new Tuna(this.audioContext);
//Complex Oscillator 1==============================================
this.complexOscillator1 = new this.tuna.ComplexOscillator({
  sineOut: 0,
  detuneSine: 0,
  sawOut: 0,
  detuneSaw: 0,
  squareOut: 0,
  detuneSquare: 0,
  triOut: 0,
  detuneTri: 0,
  modOut: 0,
  modFreq: 2,
  fmOut: 0,
  fmFreq: 0,
  frequency: 220,
});
//Pulse Oscillator 1================================================
this.pulseOsc1 = new this.tuna.PulseOscillator({
  level: 0.2,
  detune: 0,
  width: 0.7,
  frequency: 220,
});
//Simple Oscillator 1================================================
this.oscillator1 = new this.tuna.SimpleOscillator({
  level: 0,
  detune: 0,
  oscillatorType: 0,
  frequency: 220,
});
//Simple Oscillator 2=====================================================
this.oscillator2 = new this.tuna.SimpleOscillator({
  level: 0,
  detune: 0,
  oscillatorType: 0,
  frequency: 220,
});
//Filter 1============================================================
this.filter1 = new this.tuna.Filter({
  frequency: 12000,
  Q: 10,
  gain: 0,
  bypass: false,
  filterType: 0,
});
//Dual Filter=======================================================
this.dualFilter = new this.tuna.DualFilter({
  mode: "parallel",
  inputDrive: 1,
  typeA: "bandpass",
  freqA: 800,
  qA: 4,
  gainA: 1,
  typeB: "lowpass",
  freqB: 1200,
  qB: 3,
});
//Cabinet======================
this.cab = new this.tuna.Cabinet({
  makeupGain: 10,
  bypass: false,
});
window.cabinetModule = this.cab;
//Chorus===========================================================
this.chorus = new this.tuna.Chorus({
  feedback: 0.8,
  delay: 0.0045,
  depth: 0.7,
  rate: 4.5,
  wetDryMix: 0.8,
  bypass: false,
});
document.getElementById("toggleChorus").addEventListener("click", function () {
  chorus.bypass = !chorus.bypass;
  this.innerHTML = chorus.bypass ? "Enable<br>Chorus" : "Disable<br>Chorus";

  console.log("Chorus bypass state: ", chorus.bypass ? "Bypassed" : "Active");
});
//Auto Panner=====================================================
this.autoPan = new this.tuna.ModulatedStereoPanner({
  pan: 0,
  rate: 1,
  depth: 0,
});
//Overdrive============================================================
this.drive = new this.tuna.Overdrive({
  drive: 0.5,
  outputGain: 0,
  curveAmount: 0.725,
  algorithmIndex: 2,
});
//Delay===========================================================================
this.delay = new this.tuna.Delay({
  delayTime: 100,
  feedback: 0.45,
  cutoff: 20000,
  wetLevel: 0.5,
  dryLevel: 1,
});
//Phaser==========================================================================
this.phaser = new this.tuna.Phaser({
  rate: 0.1,
  depth: 0.6,
  feedback: 0.7,
  stereoPhase: 40,
  baseModulationFrequency: 700,
});
//Dimension Expander==============================================================
this.expander = new this.tuna.DimensionExpander({
  delayTimes: [0.006, 0.009, 0.0012, 0.015],
  feedback: 0.5,
  wetLevel: 0.5,
  dryLevel: 1.0,
});
//3 Band EQ=======================================================
this.eq = new this.tuna.EQ3Band({
  lowGain: 0,
  midGain: 0,
  highGain: 0,
  lowFreq: 100,
  midFreq: 1000,
  midRes: 0,
  highFreq: 5000,
});
//convolver=======================================================
this.verb = new this.tuna.Convolver({
  highCut: 22050,
  lowCut: 20,
  dryLevel: 1,
  wetLevel: 1,
  level: 1,
  impulseDuration: 1,
  impulseDecay: 1,
});
//external input==========================================
this.externalInput = new this.tuna.ExternalInput({});
//mutator=================================================
this.mutator = new this.tuna.MutatorFilter({
  distortionAmount: 20,
  distortionType: "soft",
  cutoff: 20,
  resonance: 20,
  filterType: "lowpass",
  lfoRate: 2,
  lfoDepth: 0.0,
  attack: 0.1,
  release: 0.1,
  envelopeDepth: 0,
  bitDepth: 8,
  reduction: 0.25,
});

let sequencer;

window.addEventListener("DOMContentLoaded", () => {
  selectBindings.forEach(([id, callback]) => {
    bindSelectToCallback(id, callback);
  });

  // ✅ Delay StepSequencer until after bindings are done
  sequencer = new StepSequencer();
});
//Bindings=======================================================
const sliderBindings = [
  // 🕓 Sequencer
  [
    "tempo",
    (v) => {
      const val = parseInt(v, 10);
      if (!isNaN(val)) {
        if (typeof sequencer !== "undefined") {
          sequencer.tempo = val;
          if (sequencer.isPlaying) sequencer.restartSequencer();
        }
        const tempoLabel = document.getElementById("tempoValue");
        if (tempoLabel) tempoLabel.textContent = val;
      }
    },
    "int",
    "Sequencer",
  ],
  // 🎛️ Complex Oscillator
  [
    "Sine Out",
    (v) => (complexOscillator1.sineOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "Detune Sine",
    (v) => (complexOscillator1.detuneSine = v),
    "int",
    "Complex Oscillator",
  ],
  [
    "Saw Out",
    (v) => (complexOscillator1.sawOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "Detune Saw",
    (v) => (complexOscillator1.detuneSaw = v),
    "int",
    "Complex Oscillator",
  ],
  [
    "Square Out",
    (v) => (complexOscillator1.squareOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "Detune Square",
    (v) => (complexOscillator1.detuneSquare = v),
    "int",
    "Complex Oscillator",
  ],
  [
    "Triangle Out",
    (v) => (complexOscillator1.triOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "Detune Triangle",
    (v) => (complexOscillator1.detuneTri = v),
    "int",
    "Complex Oscillator",
  ],
  [
    "AM Depth",
    (v) => (complexOscillator1.modOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "AM Freq",
    (v) => (complexOscillator1.modFreq = v),
    "int",
    "Complex Oscillator",
  ],
  [
    "FM Depth",
    (v) => (complexOscillator1.fmOut = v),
    "float",
    "Complex Oscillator",
  ],
  [
    "FM Freq",
    (v) => (complexOscillator1.fmFreq = v),
    "int",
    "Complex Oscillator",
  ],

  // 🎛️ Pulse Oscillator
  ["Pulse Level", (v) => (pulseOsc1.level = v), "float", "Pulse Oscillator"],
  ["Pulse Detune", (v) => (pulseOsc1.detune = v), "int", "Pulse Oscillator"],
  ["Pulse Width", (v) => (pulseOsc1.width = v), "float", "Pulse Oscillator"],
  [
    "Pulse Frequency",
    (v) => (pulseOsc1.frequency = v),
    "int",
    "Pulse Oscillator",
  ],

  // 🎛️ Simple Oscillators
  [
    "Osc One Level",
    (v) => (oscillator1.level = v),
    "float",
    "Simple Oscillators",
  ],
  [
    "Osc One Detune",
    (v) => (oscillator1.detune = v),
    "int",
    "Simple Oscillators",
  ],
  [
    "Osc Two Level",
    (v) => (oscillator2.level = v),
    "float",
    "Simple Oscillators",
  ],
  [
    "Osc Two Detune",
    (v) => (oscillator2.detune = v),
    "int",
    "Simple Oscillators",
  ],

  // 🎚️ Filter
  ["Filter One Freq", (v) => (filter1.frequency = v), "int", "Filter"],
  ["Filter One Resonance", (v) => (filter1.Q = v), "float", "Filter"],
  // 🎚️ Dual Filter
  ["Dual Filter Drive", (v) => (dualFilter.drive = v), "int", "Dual Filter"],
  [
    "Filter A Freq",
    (v) => (dualFilter.filterA.frequency.value = v),
    "int",
    "Dual Filter",
  ],
  [
    "Filter A Res",
    (v) => (dualFilter.filterA.Q.value = v),
    "float",
    "Dual Filter",
  ],
  [
    "Filter B Freq",
    (v) => (dualFilter.filterB.frequency.value = v),
    "int",
    "Dual Filter",
  ],
  [
    "Filter B Res",
    (v) => (dualFilter.filterB.Q.value = v),
    "float",
    "Dual Filter",
  ],
  // Mutator
  ["Mutator Drive", (v) => (mutator.distortionAmount = v), "int", "Mutator"],
  ["Mutator Cut Off", (v) => (mutator.cutoff = v), "int", "Mutator"],
  ["Mutator Resonance", (v) => (mutator.resonance = v), "float", "Mutator"],
  ["Mutator LFO Rate", (v) => (mutator.lfoRate = v), "float", "Mutator"],
  ["Mutator LFO Depth", (v) => (mutator.lfoDepth = v), "float", "Mutator"],
  ["Mutator Attack", (v) => (mutator.attack = v), "float", "Mutator"],
  ["Mutator Release", (v) => (mutator.release = v), "float", "Mutator"],
  ["Mutator Env Depth", (v) => (mutator.envelopeDepth = v), "float", "Mutator"],
  ["Mutator Bit Depth", (v) => (mutator.bitDepth = v), "int", "Mutator"],
  ["Mutator Bit Reduction", (v) => (mutator.reduction = v), "float", "Mutator"],
  // 🕒 Delay
  ["Delay Time", (v) => (delay.delayTime = v), "int", "Delay"],
  ["Delay Feedback", (v) => (delay.feedback = v), "float", "Delay"],
  ["Delay Cut", (v) => (delay.cutoff = v), "int", "Delay"],
  ["Delay Wet", (v) => (delay.wetLevel = v), "float", "Delay"],
  // 🌀 Phaser
  ["Phaser Rate", (v) => (phaser.rate = v), "float", "Phaser"],
  ["Phaser Depth", (v) => (phaser.depth = v), "float", "Phaser"],
  ["Phaser Feedback", (v) => (phaser.feedback = v), "float", "Phaser"],
  ["Phaser Stereo", (v) => (phaser.stereoPhase = v), "int", "Phaser"],
  [
    "Phaser Base Freq",
    (v) => (phaser.baseModulationFrequency = v),
    "int",
    "Phaser",
  ],
  // 🌊 Chorus
  ["Chorus Feedback", (v) => (chorus.feedback = v), "float", "Chorus"],
  ["Chorus Delay", (v) => (chorus.delay = v), "float", "Chorus"],
  ["Chorus Depth", (v) => (chorus.depth = v), "float", "Chorus"],
  ["Chorus Rate", (v) => (chorus.rate = v), "float", "Chorus"],
  ["Chorus Wet", (v) => (chorus.wetDryMix = v), "float", "Chorus"],
  // Reverb
  ["Reverb High Cut", (v) => (verb.highCut = v), "int", "Reverb"],
  ["Reverb Low Cut", (v) => (verb.lowCut = v), "int", "Reverb"],
  ["Reverb Dry", (v) => (verb.dryLevel = v), "float", "Reverb"],
  ["Reverb Wet", (v) => (verb.wetLevel = v), "float", "Reverb"],
  // ["Reverb Level", (v) => (verb.level = v), "float", "Reverb"],
  [
    "Reverb Duration",
    (v) => {
      verb.impulseDuration = v;
      verb.regenerateImpulse();
    },
    "float",
    "Reverb",
  ],
  [
    "Reverb Decay",
    (v) => {
      verb.impulseDecay = v;
      verb.regenerateImpulse();
    },
    "float",
    "Reverb",
  ],
  // 📦 Cabinet
  ["Cabinet Gain", (v) => (cab.makeupGain = v), "float", "Cabinet"],
  // ↔️ Auto Panner
  ["Pan Direction", (v) => (autoPan.pan = v), "float", "Auto Panner"],
  ["Pan Rate", (v) => (autoPan.rate = v), "float", "Auto Panner"],
  ["Pan Depth", (v) => (autoPan.depth = v), "float", "Auto Panner"],
  // 🧪 Dimension Expander
  [
    "Expander Delay",
    (v) => {
      expander.delayTimes = [v, v + 0.001, v + 0.003, v + 0.006];
    },
    "float",
    "Expander",
  ],
  ["Expander Feedback", (v) => (expander.feedback = v), "float", "Expander"],
  [
    "Expander Wet",
    (v) => {
      expander.setWetLevel(v);
      expander.setDryLevel(1 - v);
    },
    "float",
    "Expander",
  ],
  // ⚡ Overdrive
  ["Drive Drive", (v) => (drive.drive = v), "float", "Overdrive"],
  ["Drive Gain", (v) => (drive.outputGain = v), "float", "Overdrive"],
  ["Drive Curve", (v) => (drive.curveAmount = v), "float", "Overdrive"],
  ["Drive Algorithm", (v) => (drive.algorithmIndex = v), "int", "Overdrive"],
  // 🔊 Mixer
  ["Mixer 1 Gain", (v) => (mixerChannels[0].gain.value = v), "float", "Mixer"],
  ["Mixer 2 Gain", (v) => (mixerChannels[1].gain.value = v), "float", "Mixer"],
  ["Mixer 3 Gain", (v) => (mixerChannels[2].gain.value = v), "float", "Mixer"],
  ["Mixer 4 Gain", (v) => (mixerChannels[3].gain.value = v), "float", "Mixer"],
  // 📈 Envelope
  ["Envelope Attack", (v) => {}, "float", "Envelope"],
  ["Envelope Decay", (v) => {}, "float", "Envelope"],
  ["Envelope Sustain", (v) => {}, "float", "Envelope"],
  ["Envelope Release", (v) => {}, "float", "Envelope"],
  // 🎚️ EQ
  ["Low Gain", (v) => (eq.lowGain = v), "int", "EQ"],
  ["Low Freq", (v) => (eq.lowFreq = v), "int", "EQ"],
  ["Mid Gain", (v) => (eq.midGain = v), "int", "EQ"],
  ["Mid Freq", (v) => (eq.midFreq = v), "int", "EQ"],
  ["Mid Res", (v) => (eq.midRes = v), "int", "EQ"],
  ["High Gain", (v) => (eq.highGain = v), "int", "EQ"],
  ["High Freq", (v) => (eq.highFreq = v), "int", "EQ"],
  // 🔁 LFO 1–3
  ["Lfo 1 Rate", (v) => (lfos[0].osc.frequency.value = v), "float", "LFO 1"],
  [
    "Lfo 1 Depth",
    (v) => {
      const selectors = [
        document.getElementById("LFO 1 Destination 1"),
        document.getElementById("LFO 1 Destination 2"),
        document.getElementById("LFO 1 Destination 3"),
        document.getElementById("LFO 1 Destination 4"),
      ];
      selectors.forEach((sel, i) => {
        const target = sel?.value;
        if (!target) return;
        const scale = lfoScales[target] || 1;
        if (lfos[0].targets[i]) {
          lfos[0].targets[i].gain.value = v * scale;
        }
      });
    },
    "float",
    "LFO 1",
  ],

  ["Lfo 2 Rate", (v) => (lfos[1].osc.frequency.value = v), "float", "LFO 2"],
  [
    "Lfo 2 Depth",
    (v) => {
      const selectors = [
        document.getElementById("LFO 2 Destination 1"),
        document.getElementById("LFO 2 Destination 2"),
        document.getElementById("LFO 2 Destination 3"),
        document.getElementById("LFO 2 Destination 4"),
      ];
      selectors.forEach((sel, i) => {
        const target = sel?.value;
        if (!target) return;
        const scale = lfoScales[target] || 1;
        if (lfos[1].targets[i]) {
          lfos[1].targets[i].gain.value = v * scale;
        }
      });
    },
    "float",
    "LFO 2",
  ],

  ["Lfo 3 Rate", (v) => (lfos[2].osc.frequency.value = v), "float", "LFO 3"],
  [
    "Lfo 3 Depth",
    (v) => {
      const selectors = [
        document.getElementById("LFO 3 Destination 1"),
        document.getElementById("LFO 3 Destination 2"),
        document.getElementById("LFO 3 Destination 3"),
        document.getElementById("LFO 3 Destination 4"),
      ];
      selectors.forEach((sel, i) => {
        const target = sel?.value;
        if (!target) return;
        const scale = lfoScales[target] || 1;
        if (lfos[2].targets[i]) {
          lfos[2].targets[i].gain.value = v * scale;
        }
      });
    },
    "float",
    "LFO 3",
  ],
  [
    "Output Gain",
    (v) => (outputGain.gain.value = parseFloat(v)),
    "float",
    "Output",
  ],
];

window.addEventListener("DOMContentLoaded", () => {
  sliderBindings.forEach(([id, callback, parseAs]) =>
    bindSliderToValue(id, callback, parseAs)
  );
});

function bindSliderToValue(sliderId, updateCallback, parseAs = "float") {
  const slider = document.getElementById(sliderId);
  const outputId = slider.dataset.target;
  const output = document.getElementById(outputId);

  if (!slider || !output) {
    console.warn(`Missing slider or output for: ${sliderId}`);
    return;
  }

  const parse = parseAs === "int" ? parseInt : parseFloat;

  // 🟢 Restore from localStorage (if saved previously)
  const saved = localStorage.getItem(`slider_${sliderId}`);
  if (saved !== null) {
    slider.value = saved;
  }

  // 🟢 Initial sync
  const initValue = parse(slider.value);
  output.textContent = initValue;
  if (updateCallback) updateCallback(initValue);

  // 🔁 Update on input
  slider.addEventListener("input", function () {
    const value = parse(this.value);
    output.textContent = value;
    if (updateCallback) updateCallback(value);
    localStorage.setItem(`slider_${sliderId}`, this.value); // Save as string
  });
}

const selectBindings = [
  // Simple Oscillator 1
  [
    "Osc One Type",
    (v) => (oscillator1.oscillatorType = parseInt(v)),
    "Simple Oscillators",
  ],

  // Simple Oscillator 2
  [
    "Osc Two Type",
    (v) => (oscillator2.oscillatorType = parseInt(v)),
    "Simple Oscillators",
  ],

  // Filter type
  ["Filter One Type", (v) => (filter1.filterType = parseInt(v)), "Filter"],

  // Dual Filter routing
  [
    "Dual Filter Routing",
    (v) => (dualFilter.serialRouting = v === "serial"),
    "Dual Filter",
  ],

  //Dual Filter type
  [
    "Filter A Type",
    (v) => {
      dualFilter.filterA.type = v;
      localStorage.setItem("filterAType", v);
    },
    "Dual Filter",
  ],

  [
    "Filter B Type",
    (v) => {
      dualFilter.filterB.type = v;
      localStorage.setItem("filterBType", v);
    },
    "Dual Filter",
  ],

  [
    "Mutator Distortion Type",
    (v) => {
      mutator.distortionType = v;
      localStorage.setItem("mutatorDistType", v);
    },
    "Mutator",
  ],
  [
    "Mutator Filter Type",
    (v) => {
      mutator.filterType = v;
      localStorage.setItem("mutatorFilterType", v);
    },
    "Mutator",
  ],

  [
    "cabinetIRSelect",
    (v) => {
      cabinetModule.loadImpulseFromPath(v); // ✅ corrected name
      localStorage.setItem("cabinetIRSelect", v);
    },
    "Cabinet",
  ],

  // LFO 1
  ["LFO 1 Type", (v) => (lfos[0].osc.type = v), "LFO 1"],
  ["LFO 1 Retrigger", (v) => (lfos[0].mode = v), "LFO 1"],
  ["LFO 1 Destination 1", () => updateLfoConnections(0), "LFO 1"],
  ["LFO 1 Destination 2", () => updateLfoConnections(0), "LFO 1"],
  ["LFO 1 Destination 3", () => updateLfoConnections(0), "LFO 1"],
  ["LFO 1 Destination 4", () => updateLfoConnections(0), "LFO 1"],

  // LFO 2
  ["LFO 2 Type", (v) => (lfos[1].osc.type = v), "LFO 2"],
  ["LFO 2 Retrigger", (v) => (lfos[1].mode = v), "LFO 2"],
  ["LFO 2 Destination 1", () => updateLfoConnections(1), "LFO 2"],
  ["LFO 2 Destination 2", () => updateLfoConnections(1), "LFO 2"],
  ["LFO 2 Destination 3", () => updateLfoConnections(1), "LFO 2"],
  ["LFO 2 Destination 4", () => updateLfoConnections(1), "LFO 2"],

  // LFO 3
  ["LFO 3 Type", (v) => (lfos[2].osc.type = v), "LFO 3"],
  ["LFO 3 Retrigger", (v) => (lfos[2].mode = v), "LFO 3"],
  ["LFO 3 Destination 1", () => updateLfoConnections(2), "LFO 3"],
  ["LFO 3 Destination 2", () => updateLfoConnections(2), "LFO 3"],
  ["LFO 3 Destination 3", () => updateLfoConnections(2), "LFO 3"],
  ["LFO 3 Destination 4", () => updateLfoConnections(2), "LFO 3"],

  [
    "stepCount",
    (v) => {
      const val = parseInt(v, 10);
      if (sequencer) {
        sequencer.numSteps = val;
        sequencer.stepActive = Array(val).fill(true);
        sequencer.createSliders();
      }
    },
  ],
];

function bindSelectToCallback(selectId, callback) {
  const select = document.getElementById(selectId);
  if (!select) {
    console.warn(`Missing select element for: ${selectId}`);
    return;
  }

  // ⬅️ Restore from localStorage if available
  const saved = localStorage.getItem(`select_${selectId}`);
  if (saved !== null) {
    select.value = saved;
  }

  select.addEventListener("change", (e) => {
    const value = e.target.value;
    localStorage.setItem(`select_${selectId}`, value); // 💾 Save on change
    callback(value);
  });

  // 🔄 Apply current or restored value
  callback(select.value);
}

window.addEventListener("DOMContentLoaded", () => {
  selectBindings.forEach(([id, callback]) => {
    bindSelectToCallback(id, callback);
  });
});

//Start oscilators/hide button to not call start more than once
document
  .querySelector("#startButton")
  .addEventListener("click", async (event) => {
    if (
      typeof audioContext !== "undefined" &&
      audioContext.state === "suspended"
    ) {
      await audioContext.resume(); // ✅ Important: resume context first
      console.log("AudioContext resumed");
    }

    // Now safe to start oscillators
    this.complexOscillator1.start();
    this.pulseOsc1.start();
    this.oscillator2.start();
    this.oscillator1.start();
    this.autoPan.start();
    this.mutator.start();
    startLFOs();

    event.target.style.display = "none";
    console.log("Oscillators started");
  });

let useMIDIInput = false;

let currentMIDIInput = null;

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.warn("Web MIDI API not supported in this browser.");
}

function onMIDISuccess(midiAccess) {
  const select = document.getElementById("midiInputSelect");
  select.innerHTML = '<option value="">-- Choose Device --</option>';

  // Populate dropdown
  for (let input of midiAccess.inputs.values()) {
    const option = document.createElement("option");
    option.value = input.id;
    option.textContent = `${input.name} (${input.manufacturer})`;
    select.appendChild(option);
  }

  // Handle selection
  select.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if (currentMIDIInput) {
      currentMIDIInput.onmidimessage = null; // Disconnect old listener
    }

    if (selectedId) {
      currentMIDIInput = [...midiAccess.inputs.values()].find(
        (input) => input.id === selectedId
      );

      if (currentMIDIInput) {
        currentMIDIInput.onmidimessage = handleMIDIMessage;
        console.log(`🎹 Listening to: ${currentMIDIInput.name}`);
      }
    } else {
      currentMIDIInput = null;
      console.log("🎹 MIDI input disconnected.");
    }
  });
}

function onMIDIFailure() {
  console.warn("Could not access your MIDI devices.");
}

function autoBindSlidersToParams() {
  const paramNames = sliderBindings.map(([name]) => name);
  paramNames.forEach((param) => {
    const el = document.getElementById(param);
    if (el && el.tagName === "INPUT" && el.type === "range") {
      el.setAttribute("data-param", param);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  autoBindSlidersToParams();
});

function updateSliderVisual(paramName, scaledValue, type) {
  const slider = document.querySelector(`[data-param="${paramName}"]`);
  if (slider) {
    const value =
      type === "int" ? Math.round(scaledValue * 127) : scaledValue.toFixed(2);

    slider.value = value;
    slider.dispatchEvent(new Event("input"));

    // ✅ Also update .range-knob if it's present
    const wrapper = slider.closest(".second-knob-wrapper");
    if (wrapper) {
      const knob = wrapper.querySelector(".range-knob");
      if (knob) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const percent = ((value - min) / (max - min)) * 100;
        knob.style.left = `${percent}%`; // or transform: translateX()
      }
    }

    // Optional glow
    slider.classList.add("midi-flash");
    setTimeout(() => {
      slider.classList.remove("midi-flash");
    }, 150);

    // Update any visible value
    const targetId = slider.getAttribute("data-target");
    const target = targetId && document.getElementById(targetId);
    if (target) target.textContent = value;
  }
}

function handlePitchBend(lsb, msb) {
  const value14bit = (msb << 7) | lsb;
  const bendAmount = value14bit - 8192; // center is 8192
  const normalizedBend = bendAmount / 8192; // range from -1 to +1

  applyPitchBendToOscillators(normalizedBend);
}

function handleMIDIMessage(message) {
  if (!useMIDIInput) return;

  const [command, data1, data2] = message.data;

  if (command === 144 && data2 > 0) {
    // Note on

    const frequency = sequencer.midiToFrequency(data1);
    sequencer.currentFrequency = frequency;
    sequencer.playFrequency(frequency);

    triggerEnvelope(data2);
    lfos.forEach((lfo, index) => {
      if (lfo.mode === "trigger") {
        retriggerLFO(index);
      }
    });
  } else if (command === 128 || (command === 144 && data2 === 0)) {
    // Note off
    triggerRelease();
  } else if ((command & 0xf0) === 0xb0) {
    // 🎚 Control Change (CC)
    const ccNumber = data1;
    const ccValue = data2;
    console.log("🎛 MIDI CC received:", ccNumber, ccValue);
    handleCC(ccNumber, ccValue); // ✅ call this — logic lives there
  } else if ((command & 0xf0) === 0xe0) {
    // 🎹 Pitch Bend
    const lsb = data1;
    const msb = data2;
    handlePitchBend(lsb, msb);
  }
}

function applyPitchBendToOscillators(normalizedBend) {
  const semitoneRange = 2;
  const pitchBendInSemitones = normalizedBend * semitoneRange;
  const pitchMultiplier = Math.pow(2, pitchBendInSemitones / 12); // frequency scaling

  // Update all oscillator frequencies
  const baseFreq = sequencer.currentFrequency || 440; // save this when note is played

  const newFreq = baseFreq * pitchMultiplier;

  complexOscillator1.frequency = newFreq;
  pulseOsc1.frequency = newFreq;
  oscillator1.frequency = newFreq;
  oscillator2.frequency = newFreq;
}

function handleCC(ccNumber, value) {
  const normalizedValue = value / 127;

  if (learnMode && paramToMap) {
    ccMappings[ccNumber] = paramToMap;
    announceToAria(`Mapped CC ${ccNumber} to ${paramToMap}`);
    learnMode = false;
    paramToMap = null;
    return;
  }

  const paramName = ccMappings[ccNumber];
  if (!paramName) return;

  const binding = sliderBindings.find(([name]) => name === paramName);
  if (binding) {
    const [, setFunc, type] = binding;
    const scaledValue =
      type === "int" ? Math.round(normalizedValue * 127) : normalizedValue;

    setFunc(scaledValue);
    updateSliderVisual(paramName, normalizedValue, type);
    announceToAria(
      `${paramName} set to ${Math.round(normalizedValue * 100)} percent`
    );
  }
}

document.getElementById("midiToggle").addEventListener("click", function () {
  const isPressed = this.getAttribute("aria-pressed") === "true";
  const newState = !isPressed;

  this.setAttribute("aria-pressed", String(newState));
  this.textContent = newState ? "MIDI ON" : "MIDI OFF";

  useMIDIInput = newState;
  localStorage.setItem("useMIDIInput", String(useMIDIInput)); // Save state

  const seqControl = document.querySelector(".seqControl");
  const stepSequencer = document.getElementById("stepSequencer");

  if (useMIDIInput) {
    sequencer?.stopSequencer?.();
    seqControl.style.display = "none";
    stepSequencer.style.display = "none";
  } else {
    seqControl.style.display = "flex";
    stepSequencer.style.display = "none"; // ← as you prefer
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const savedState = localStorage.getItem("useMIDIInput");
  const midiToggle = document.getElementById("midiToggle");

  if (savedState === "true") {
    midiToggle.setAttribute("aria-pressed", "true");
    midiToggle.textContent = "MIDI ON";
    useMIDIInput = true;

    sequencer?.stopSequencer?.();
    document.querySelector(".seqControl").style.display = "none";
    document.getElementById("stepSequencer").style.display = "none";
  } else {
    midiToggle.setAttribute("aria-pressed", "false");
    midiToggle.textContent = "MIDI OFF";
    useMIDIInput = false;

    document.querySelector(".seqControl").style.display = "flex";
    document.getElementById("stepSequencer").style.display = "none"; // optional
  }
});

function triggerEnvelope(velocity = 127) {
  const now = audioContext.currentTime;
  const attack = parseFloat(document.getElementById("Envelope Attack").value);
  const decay = parseFloat(document.getElementById("Envelope Decay").value);
  const sustain = parseFloat(document.getElementById("Envelope Sustain").value);

  const normalizedGain = velocity / 127; // scale 0–127 to 0.0–1.0

  ampEnvelope.gain.cancelScheduledValues(now);
  ampEnvelope.gain.setValueAtTime(0, now);
  ampEnvelope.gain.linearRampToValueAtTime(normalizedGain, now + attack);
  ampEnvelope.gain.linearRampToValueAtTime(
    normalizedGain * sustain,
    now + attack + decay
  );
}

function triggerRelease() {
  const now = audioContext.currentTime;
  const release = parseFloat(document.getElementById("Envelope Release").value);
  ampEnvelope.gain.cancelScheduledValues(now);
  ampEnvelope.gain.setValueAtTime(ampEnvelope.gain.value, now);
  ampEnvelope.gain.linearRampToValueAtTime(0, now + release);
}

//Class to make the step sequencer
class StepSequencer {
  constructor() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.tempo = 120;
    this.intervalId = null;

    this.stepCountSelect = document.getElementById("stepCount");
    const savedCount = parseInt(this.stepCountSelect.value, 10);
    this.numSteps = isNaN(savedCount) ? 16 : savedCount;

    this.stepDuration = 0;
    this.stepActive = Array(this.numSteps).fill(true);

    this.sliders = [];
    this.noteLabels = [];
    this.velocities = [];
    this.modTargets = [];
    this.modAmounts = [];
    this.createSliders();

    this.startStopButton = document.getElementById("startStop");
    this.tempoControl = document.getElementById("tempo");
    this.tempoValueDisplay = document.getElementById("tempoValue");
    this.bindUI();

    this.stepCountSelect.addEventListener("change", (e) => {
      this.numSteps = parseInt(e.target.value);
      this.stepActive = Array(this.numSteps).fill(true);
      this.createSliders();
    });
  }

  createSliders() {
    this.isCreatingSliders = true;

    requestAnimationFrame(() => {
      const sliderContainer = document.getElementById("sliders");
      sliderContainer.innerHTML = "";
      this.sliders = [];
      this.noteLabels = [];
      this.velocities = [];
      this.modTargets = [];
      this.modAmounts = [];

      const minMidiNote = 21;
      const maxMidiNote = 108;

      for (let i = 0; i < this.numSteps; i++) {
        const stepContainer = document.createElement("div");
        stepContainer.className = "step-container";

        const noteId = `note-select-${i}`;
        const velocityId = `velocity-select-${i}`;
        const modAmtId = `mod-amt-${i}`;
        const modTargetId = `mod-target-${i}`;

        // Note Label + Select
        const noteLabel = document.createElement("label");
        noteLabel.setAttribute("for", noteId);
        noteLabel.className = "note-label";
        noteLabel.textContent = "Note:";

        const noteSelect = document.createElement("select");
        noteSelect.id = noteId;
        noteSelect.className = "note-select";

        for (let midi = minMidiNote; midi <= maxMidiNote; midi++) {
          const option = document.createElement("option");
          option.value = midi;
          option.textContent = this.midiToNoteName(midi);
          noteSelect.appendChild(option);
        }

        const savedNote = localStorage.getItem(`step_note_${i}`);
        noteSelect.value = savedNote !== null ? savedNote : 24;

        noteSelect.addEventListener("change", (e) => {
          const noteValue = e.target.value;
          localStorage.setItem(`step_note_${i}`, noteValue);
        });

        this.sliders.push(noteSelect);

        // Velocity Label + Select
        const velocityLabel = document.createElement("label");
        velocityLabel.setAttribute("for", velocityId);
        velocityLabel.className = "velocity-label";
        velocityLabel.textContent = "Velocity:";

        const velocitySelect = document.createElement("select");
        velocitySelect.id = velocityId;
        velocitySelect.className = "velocity-select";

        for (let vel = 0; vel <= 127; vel += 8) {
          const option = document.createElement("option");
          option.value = vel;
          option.textContent = vel;
          velocitySelect.appendChild(option);
        }

        const savedVelocity = localStorage.getItem(`step_velocity_${i}`);
        velocitySelect.value = savedVelocity !== null ? savedVelocity : "96";

        velocitySelect.addEventListener("change", (e) => {
          localStorage.setItem(`step_velocity_${i}`, e.target.value);
        });

        this.velocities.push(velocitySelect);

        // Mod Target Select
        const modTargetLabel = document.createElement("label");
        modTargetLabel.setAttribute("for", modTargetId);
        modTargetLabel.className = "mod-target-label";
        modTargetLabel.textContent = "Mod Destination:";

        const modTargetSelect = document.createElement("select");
        modTargetSelect.id = modTargetId;

        const targets = [
          "none",
          "filter 1 cut off",
          "dual filter cut off A",
          "dual filter cut off B",
          "gain",
        ];

        targets.forEach((val) => {
          const opt = document.createElement("option");
          opt.value = val;
          opt.textContent = val;
          modTargetSelect.appendChild(opt);
        });

        const savedTarget = localStorage.getItem(`step_modTarget_${i}`);
        modTargetSelect.value = savedTarget !== null ? savedTarget : "none";

        modTargetSelect.addEventListener("change", (e) => {
          localStorage.setItem(`step_modTarget_${i}`, e.target.value);
        });

        this.modTargets.push(modTargetSelect);

        // Mod Amount Slider
        const modSliderContainer = document.createElement("div");
        modSliderContainer.className = "slider-container";

        const modAmtLabel = document.createElement("label");
        modAmtLabel.setAttribute("for", modAmtId);
        modAmtLabel.className = "mod-amount-label";
        modAmtLabel.textContent = "Mod Amount:";

        const modAmountInput = document.createElement("input");
        modAmountInput.id = modAmtId;
        modAmountInput.type = "range";
        modAmountInput.min = -1;
        modAmountInput.max = 1;
        modAmountInput.step = 0.01;

        const modAmtSpan = document.createElement("span");
        modAmtSpan.id = `${modAmtId}-val`;
        modAmtSpan.className = "mod-amount-value";

        const savedAmt = localStorage.getItem(`step_modAmt_${i}`);
        const restoredValue = savedAmt !== null ? parseFloat(savedAmt) : 0;
        modAmountInput.value = restoredValue;
        modAmtSpan.textContent = restoredValue;

        modAmountInput.addEventListener("input", () => {
          modAmtSpan.textContent = modAmountInput.value;
          localStorage.setItem(`step_modAmt_${i}`, modAmountInput.value);
        });

        this.modAmounts.push(modAmountInput);

        modSliderContainer.appendChild(modAmtLabel);
        modSliderContainer.appendChild(modAmountInput);
        modSliderContainer.appendChild(modAmtSpan);

        // Step Number Label
        const stepLabel = document.createElement("span");
        stepLabel.textContent = `Step ${i + 1}`;
        stepLabel.className = "step-label";

        // Assemble step
        stepContainer.appendChild(noteLabel);
        stepContainer.appendChild(noteSelect);
        stepContainer.appendChild(velocityLabel);
        stepContainer.appendChild(velocitySelect);
        stepContainer.appendChild(modTargetLabel);
        stepContainer.appendChild(modTargetSelect);
        stepContainer.appendChild(modSliderContainer);
        stepContainer.appendChild(stepLabel);

        sliderContainer.appendChild(stepContainer);
      }
      // Re-apply knob design to new slider containers
      const currentDesign =
        localStorage.getItem("selectedKnobDesign") || "classic";
      applyKnobDesign(currentDesign);

      this.isCreatingSliders = false;
    });
  }

  bindUI() {
    this.startStopButton.addEventListener("click", () => this.togglePlay());
    this.tempoControl.addEventListener("input", (e) => {
      this.tempo = e.target.value;
      this.tempoValueDisplay.textContent = this.tempo;
      if (this.isPlaying) this.restartSequencer();
    });
  }

  togglePlay() {
    if (this.isPlaying) this.stopSequencer();
    else this.startSequencer();
  }

  startSequencer() {
    this.isPlaying = true;
    this.startStopButton.textContent = "Stop";
    this.currentStep = 0;
    this.stepDuration = (60 / this.tempo) * 1000;
    this.intervalId = setInterval(() => this.playStep(), this.stepDuration);
  }

  stopSequencer() {
    this.isPlaying = false;
    clearInterval(this.intervalId);
    this.startStopButton.textContent = "Start";
    this.clearHighlight();
  }

  restartSequencer() {
    clearInterval(this.intervalId);
    this.stepDuration = (60 / this.tempo) * 1000;
    this.intervalId = setInterval(() => this.playStep(), this.stepDuration);
  }

  playStep() {
    this.clearHighlight();
    if (this.stepActive[this.currentStep]) {
      const midiNote = parseInt(this.sliders[this.currentStep].value);
      const velocity = parseInt(this.velocities[this.currentStep].value);
      const frequency = this.midiToFrequency(midiNote);
      const gain = velocity / 127;
      lfos.forEach((lfo, index) => {
        if (lfo.mode === "trigger") retriggerLFO(index);
      });

      const modTarget = this.modTargets[this.currentStep].value;
      const modAmount = parseFloat(this.modAmounts[this.currentStep].value);
      const now = audioContext.currentTime;

      if (modTarget === "filter 1 cut off") {
        const base = 600;
        const targetValue = base + base * modAmount;
        filter1.filter.frequency.cancelScheduledValues(now);
        filter1.filter.frequency.setTargetAtTime(targetValue, now, 0.02);
      } else if (modTarget === "gain") {
        const targetValue = gain + modAmount;
        outputGain.gain.cancelScheduledValues(now);
        outputGain.gain.setTargetAtTime(targetValue, now, 0.02);
      } else if (modTarget === "dual filter cut off A") {
        const base = 600;
        const targetValue = base + base * modAmount;
        dualFilter.filterA.frequency.cancelScheduledValues(now);
        dualFilter.filterA.frequency.setTargetAtTime(targetValue, now, 0.02);
      } else if (modTarget === "dual filter cut off B") {
        const base = 600;
        const targetValue = base + base * modAmount;
        dualFilter.filterB.frequency.cancelScheduledValues(now);
        dualFilter.filterB.frequency.setTargetAtTime(targetValue, now, 0.02);
      }

      this.playFrequency(frequency);
      this.sliders[this.currentStep].classList.add("active");

      const attack = parseFloat(
        document.getElementById("Envelope Attack").value
      );
      const decay = parseFloat(document.getElementById("Envelope Decay").value);
      const sustain = parseFloat(
        document.getElementById("Envelope Sustain").value
      );
      const release = parseFloat(
        document.getElementById("Envelope Decay").value
      );

      ampEnvelope.gain.cancelScheduledValues(now);
      ampEnvelope.gain.setValueAtTime(0, now);
      ampEnvelope.gain.linearRampToValueAtTime(gain, now + attack);
      ampEnvelope.gain.linearRampToValueAtTime(
        gain * sustain,
        now + attack + decay
      );

      const totalStepTime = 60 / this.tempo;
      const releaseStartTime = now + attack + decay + totalStepTime * 0.5;
      ampEnvelope.gain.linearRampToValueAtTime(0, releaseStartTime + release);
    }
    this.currentStep = (this.currentStep + 1) % this.numSteps;
  }

  clearHighlight() {
    this.sliders.forEach((slider) => slider.classList.remove("active"));
  }

  midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  midiToNoteName(midiNote) {
    const notes = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return notes[noteIndex] + octave;
  }

  playFrequency(frequency) {
    complexOscillator1.frequency = frequency;
    pulseOsc1.frequency = frequency;
    oscillator1.frequency = frequency;
    oscillator2.frequency = frequency;
  }
}

// === Highlight Color Bindings ===
document
  .getElementById("highlightColor")
  .addEventListener("input", function () {
    const selectedColor = this.value;
    document.documentElement.style.setProperty(
      "--active-highlight",
      selectedColor
    );
    localStorage.setItem("highlightColor", selectedColor);
  });

document.addEventListener("DOMContentLoaded", () => {
  const savedColor = localStorage.getItem("highlightColor");
  if (savedColor) {
    document.documentElement.style.setProperty(
      "--active-highlight",
      savedColor
    );
    document.getElementById("highlightColor").value = savedColor;
  }
});

//4 Chanel Mixer============================================================
this.mixerChannels = [
  audioContext.createGain(),
  audioContext.createGain(),
  audioContext.createGain(),
  audioContext.createGain(),
];
this.mixerOutput = audioContext.createGain();
this.mixerOutput.gain.value = 1;
this.mixerChannels.forEach((channel) => channel.connect(this.mixerOutput));
//Amp envelope==============================================================
this.ampEnvelope = audioContext.createGain();
this.ampEnvelope.gain.value = 0;
//Output gain for master output======================================
this.outputGain = audioContext.createGain();
this.outputGain.gain.value = 1;
this.outputGain.connect(audioContext.destination);
//Analyser=========================================================
this.analyser = this.audioContext.createAnalyser();
// Set up analyser properties (optional)
this.analyser.fftSize = 2048; // Defines the number of samples to transform
this.bufferLength = this.analyser.frequencyBinCount; // Half of fftSize
this.dataArray = new Uint8Array(this.bufferLength); // Array to hold time-domain data
let isFrozen = false; // Variable to track if the visualization is frozen
let lineWidth = 4; // Default line width

// Function to update the CSS variable for background color
function updateBackgroundColor() {
  const bgColorPicker = document.getElementById("bgColorPicker");
  const selectedColor = bgColorPicker.value;
  document.documentElement.style.setProperty(
    "--background-colour",
    selectedColor
  );
  // Save to localStorage
  localStorage.setItem("backgroundColor2", selectedColor);
}

// Load background color from localStorage on page load
window.addEventListener("load", () => {
  const storedColor = localStorage.getItem("backgroundColor2");
  if (storedColor) {
    document.getElementById("bgColorPicker").value = storedColor;
    document.documentElement.style.setProperty(
      "--background-colour",
      storedColor
    );
  } else {
    // Use default from picker if no saved value
    updateBackgroundColor();
  }
});

// Attach the event listener to the color picker
document
  .getElementById("bgColorPicker")
  .addEventListener("input", updateBackgroundColor);

// Function to handle the freeze/unfreeze button
document.getElementById("freezeButton").addEventListener("click", function () {
  isFrozen = !isFrozen;
  this.textContent = isFrozen ? "Unfreeze" : "Freeze"; // Toggle button text
});

// Function to handle line thickness changes
document.getElementById("lineThickness").addEventListener("input", function () {
  lineWidth = parseFloat(this.value);
  localStorage.setItem("lineThickness", this.value);
});

window.addEventListener("load", () => {
  const savedThickness = localStorage.getItem("lineThickness");
  if (savedThickness !== null) {
    const thicknessSlider = document.getElementById("lineThickness");
    thicknessSlider.value = savedThickness;
    lineWidth = parseFloat(savedThickness);
  }
});

// Visualize the analyser data (optional)
function draw() {
  if (!isFrozen) {
    requestAnimationFrame(draw); // Continue the animation only if not frozen
    // Get the frequency data or time-domain data from the analyser
    this.analyser.getByteTimeDomainData(this.dataArray);
    // Example of drawing the waveform to a canvas
    const canvas = document.getElementById("visualizer");
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.imageSmoothingEnabled = true;
    // Clear the canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    // Get the color from the color picker for the waveform line
    const lineColorPicker = document.getElementById("lineColorPicker");
    const selectedLineColor = lineColorPicker.value;
    // === Line Color: Save and Load from localStorage ===

    // Function to update the waveform line color and save it
    function updateLineColor() {
      const lineColorPicker = document.getElementById("lineColorPicker");
      const selectedColor = lineColorPicker.value;

      // Save to localStorage
      localStorage.setItem("lineColor", selectedColor);
    }

    // Load saved line color on page load
    window.addEventListener("load", () => {
      const storedLineColor = localStorage.getItem("lineColor");
      if (storedLineColor) {
        const picker = document.getElementById("lineColorPicker");
        picker.value = storedLineColor;
      }
    });

    // Listen for changes to the line color picker
    document
      .getElementById("lineColorPicker")
      .addEventListener("input", updateLineColor);

    // Draw the waveform
    canvasCtx.lineWidth = lineWidth; // Use the selected line thickness
    canvasCtx.strokeStyle = selectedLineColor; // Use the selected line color
    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0; // Normalize the value
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  } else {
    requestAnimationFrame(draw); // Keep the draw loop running to allow unfreeze
  }
}
draw();

//connections==============================================
let sourceNode = null;
let targetNode = null;
let sourceType = null; // Track whether we're dragging from input or output

let focusedNode = null; // Track the currently focused node

// Function to update ARIA live region for screen readers
function updateAriaLiveRegion(message) {
  const ariaLiveRegion = document.getElementById("ariaLiveRegion");
  ariaLiveRegion.textContent = message; // Update live region for screen readers
}

// Initialize this object to store initial aria-labels
const initialAriaLabels = {};

// Function to update aria-labels when a connection is made dynamically
function updateConnectionInfo(sourceNodeId, targetNodeId) {
  // Get elements by their IDs
  const sourceElement = document.getElementById(sourceNodeId);
  const targetElement = document.getElementById(targetNodeId);

  // Check if the elements were found
  if (!sourceElement || !targetElement) {
    console.error(
      `Elements not found for source: ${sourceNodeId}, target: ${targetNodeId}`
    );
    return;
  }

  // Store initial aria-labels before making any updates
  if (!initialAriaLabels[sourceNodeId]) {
    initialAriaLabels[sourceNodeId] =
      sourceElement.getAttribute("aria-label") || `${sourceNodeId} Output`;
  }
  if (!initialAriaLabels[targetNodeId]) {
    initialAriaLabels[targetNodeId] =
      targetElement.getAttribute("aria-label") || `${targetNodeId} Input`;
  }

  // Update aria-labels to reflect the new connection
  const sourceLabel = sourceElement.getAttribute("aria-label") || sourceNodeId;
  const targetLabel = targetElement.getAttribute("aria-label") || targetNodeId;

  sourceElement.setAttribute(
    "aria-label",
    `${sourceLabel} connected to ${targetLabel}`
  );
  targetElement.setAttribute(
    "aria-label",
    `${targetLabel} connected to ${sourceLabel}`
  );

  // Track the connection in both directions
  connections[sourceNodeId] = targetNodeId;
  connections[targetNodeId] = sourceNodeId;

  console.log(`Connection updated: ${sourceNodeId} → ${targetNodeId}`);
  console.log(
    `Aria-label for source: ${sourceElement.getAttribute("aria-label")}`
  );
  console.log(
    `Aria-label for target: ${targetElement.getAttribute("aria-label")}`
  );
}

// Function to reset aria-labels when a connection is removed
function removeConnection(sourceNodeId) {
  const targetNodeId = connections[sourceNodeId]; // Find the target node
  if (targetNodeId) {
    const sourceElement = document.getElementById(sourceNodeId);
    const targetElement = document.getElementById(targetNodeId);

    // Check if the elements were found
    if (!sourceElement || !targetElement) {
      console.error(
        `Could not find elements for ${sourceNodeId} or ${targetNodeId}`
      );
      return;
    }

    // Reset aria-labels to initial values or defaults
    const initialSourceLabel =
      initialAriaLabels[sourceNodeId] || `${sourceNodeId} Output`;
    const initialTargetLabel =
      initialAriaLabels[targetNodeId] || `${targetNodeId} Input`;

    sourceElement.setAttribute("aria-label", initialSourceLabel);
    targetElement.setAttribute("aria-label", initialTargetLabel);

    // Remove visual feedback if necessary (e.g., CSS classes)
    sourceElement.classList.remove("connected");
    targetElement.classList.remove("connected");

    // Log the disconnection for debugging
    console.log(`Aria-labels reset: ${sourceNodeId} → ${targetNodeId}`);

    // Clean up both sides of the connection
    delete connections[sourceNodeId];
    delete connections[targetNodeId];
  } else {
    //console.warn(`No connection found for source node: ${sourceNodeId}`);
  }
}

// Handle keydown event for spacebar to start drag or drop
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault(); // Prevent default spacebar behavior (e.g., scrolling)

    // If no sourceNode, pick up the focused node for dragging
    if (!sourceNode && focusedNode) {
      handleDragStart({ target: focusedNode });
      updateAriaLiveRegion(`Picked up ${focusedNode.id} for dragging`);
      console.log(`Picked up node: ${focusedNode.id}`);
    }
    // If sourceNode exists, drop it on the focused node
    else if (sourceNode && focusedNode) {
      // Set the targetNode from the focusedNode during the drop
      targetNode = focusedNode.id.split("-")[0]; // Module ID (e.g., oscillator1, filter1, etc.)

      // Update ARIA live region before handleDrop is called
      updateAriaLiveRegion(`Dropped ${sourceNode} onto ${targetNode}`);

      // Perform the drop action
      handleDrop({ target: focusedNode });

      console.log(`Dropped node: ${sourceNode} onto ${targetNode}`);
    }
    document
      .querySelectorAll(".connected")
      .forEach((el) => el.classList.remove("connected"));
  }
});

document.addEventListener("click", (e) => {
  e.target.focus(); // force real focus
});

// Attach focus and blur event listeners to input and output nodes
document.querySelectorAll(".input, .output").forEach((module) => {
  module.setAttribute("tabindex", "0"); // Make elements focusable
  module.addEventListener("focus", (event) => {
    focusedNode = event.target;
  });

  module.addEventListener("blur", () => {
    focusedNode = null;
  });

  module.addEventListener("dragstart", handleDragStart);
  module.addEventListener("dragover", handleDragOver);
  module.addEventListener("drop", handleDrop);
});

// Drag start handler
function handleDragStart(event) {
  sourceNode = event.target.id.split("-")[0];
  sourceType = event.target.classList.contains("output") ? "output" : "input";
}

// Allow drop handler
function handleDragOver(event) {
  event.preventDefault();
}

// Drop handler
function handleDrop(event) {
  // Get targetNode based on the focused element (the drop target)
  targetNode = event.target.id.split("-")[0]; // Module ID (e.g., oscillator1, filter1, etc.)
  const targetType = event.target.classList.contains("output")
    ? "output"
    : "input";

  // Only connect if dragging output to input
  if (sourceNode && sourceType === "output" && targetType === "input") {
    connectNodes(sourceNode, targetNode); // Use sourceNode and targetNode
    updateConnectionInfo(sourceNode, targetNode); // Update aria-labels

    // Update ARIA live region before resetting sourceNode
    updateAriaLiveRegion(`Dropped ${sourceNode} onto ${targetNode}`);
  }

  // Reset sourceNode and sourceType after the drop
  sourceNode = null;
  sourceType = null;
}

// Get the specific input or output audio node based on the module ID
function getAudioNodeById(id, type) {
  switch (id) {
    case "complexOscillator1":
      return this.complexOscillator1[type];
    case "pulseOscillator1":
      return this.pulseOsc1[type];
    case "oscillator1":
      return this.oscillator1[type];
    case "oscillator2":
      return this.oscillator2[type];
    case "filter1":
      return this.filter1[type];
    case "dualFilter":
      return this.dualFilter[type];
    case "chorus":
      return this.chorus[type];
    case "cabinet":
      return this.cab[type];
    case "panner":
      return this.autoPan[type];
    case "drive":
      return this.drive[type];
    case "expander":
      return this.expander[type];
    case "delay":
      return this.delay[type];
    case "phaser":
      return this.phaser[type];
    case "reverb":
      return this.verb[type];
    case "externalInput":
      return this.externalInput[type];
    case "mutator":
      return this.mutator[type];
    case "ampEnvelope":
      return this.ampEnvelope;
    case "eq":
      return this.eq[type];
    case "analyser":
      // Analyser doesn't have distinct input/output, it connects to source
      return type === "input" ? this.analyser : null;
    case "output":
      return type === "input" ? this.outputGain : null;
    case "mixer1":
      return this.mixerChannels[0];
    case "mixer2":
      return this.mixerChannels[1];
    case "mixer3":
      return this.mixerChannels[2];
    case "mixer4":
      return this.mixerChannels[3];
    case "mixerOut":
      return this.mixerOutput;

    default:
      return null;
  }
}

let connections = [];
// Function to connect nodes
function connectNodes(sourceId, targetId) {
  const sourceOutputNode = getAudioNodeById(sourceId, "output");
  const targetInputNode = getAudioNodeById(targetId, "input");

  if (sourceOutputNode && targetInputNode) {
    // Check if connecting to the analyser
    if (targetId === "analyser") {
      sourceOutputNode.connect(this.analyser);
      console.log(`Connected ${sourceId} output to analyser`);

      // Store the connection
      connections.push({
        sourceId,
        targetId: "analyser",
        sourceNode: sourceOutputNode,
        targetNode: this.analyser,
      });
    } else {
      // Regular connection
      sourceOutputNode.connect(targetInputNode);

      // Apply the background color from the source to the target input
      const sourceElement = document.getElementById(`${sourceId}-output`);
      const targetElement = document.getElementById(`${targetId}-input`);
      const sourceBgColor =
        window.getComputedStyle(sourceElement).backgroundColor;

      // Set the target input's background color to match the source output's color
      targetElement.style.backgroundColor = sourceBgColor;

      // Store the regular connection
      connections.push({
        sourceId,
        targetId,
        sourceNode: sourceOutputNode,
        targetNode: targetInputNode,
      });
      console.log(`Connected ${sourceId} output to ${targetId} input`);
    }
    saveConnectionsToLocalStorage();

    // Display the connection visually
    displayConnection(sourceId, targetId);
  }
}

function saveConnectionsToLocalStorage() {
  const simplifiedConnections = connections.map(({ sourceId, targetId }) => ({
    sourceId,
    targetId,
  }));
  localStorage.setItem(
    "moduleConnections",
    JSON.stringify(simplifiedConnections)
  );
}

window.addEventListener("DOMContentLoaded", () => {
  restoreConnectionsFromLocalStorage();
  // 🆕 Restore saved colors
  restoreColorPickers();
});

function restoreColorPickers() {
  colorPickers.forEach(({ pickerId, varName, sourceId }) => {
    const savedColor = localStorage.getItem(`color_${pickerId}`);
    const colorPicker = document.getElementById(pickerId);

    if (savedColor && colorPicker) {
      colorPicker.value = savedColor;
      document.documentElement.style.setProperty(
        varName,
        hexToRgba(savedColor, 0.5)
      );

      // Restore connection visual colors
      connections.forEach(
        ({ sourceId: connectedSource, targetId: connectedTarget }) => {
          if (connectedSource === sourceId) {
            const targetElement = document.getElementById(
              `${connectedTarget}-input`
            );
            targetElement.style.backgroundColor = hexToRgba(savedColor, 0.5);
          }
        }
      );
    }
  });
}

function restoreConnectionsFromLocalStorage() {
  const stored = localStorage.getItem("moduleConnections");
  if (!stored) return;

  const storedConnections = JSON.parse(stored);

  storedConnections.forEach(({ sourceId, targetId }) => {
    const sourceNode = getAudioNodeById(sourceId, "output");
    const targetNode = getAudioNodeById(targetId, "input");

    if (sourceNode && targetNode) {
      sourceNode.connect(targetNode);
      updateConnectionInfo(sourceId, targetId); // Update aria-labels
      displayConnection(sourceId, targetId); // Display visually
      connections.push({ sourceId, targetId, sourceNode, targetNode });
    } else {
      console.warn(
        `Could not restore connection from ${sourceId} to ${targetId}`
      );
    }
  });
}

// Array of mappings between color pickers and CSS variables with sourceId
const colorPickers = [
  {
    pickerId: "complexOscillator1ColorPicker",
    varName: "--complexOscillator1-bg-color",
    sourceId: "complexOscillator1",
  },
  {
    pickerId: "pulseOscillator1ColorPicker",
    varName: "--pulseOscillator1-bg-color",
    sourceId: "pulseOscillator1",
  },
  {
    pickerId: "filter1ColorPicker",
    varName: "--filter1-bg-color",
    sourceId: "filter1",
  },
  {
    pickerId: "chorusColorPicker",
    varName: "--chorus-bg-color",
    sourceId: "chorus",
  },
  {
    pickerId: "cabinetColorPicker",
    varName: "--cabinet-bg-color",
    sourceId: "cabinet",
  },
  {
    pickerId: "pannerColorPicker",
    varName: "--panner-bg-color",
    sourceId: "panner",
  },
  {
    pickerId: "driveColorPicker",
    varName: "--drive-bg-color",
    sourceId: "drive",
  },
  {
    pickerId: "oscillator1ColorPicker",
    varName: "--oscillator1-bg-color",
    sourceId: "oscillator1",
  },
  {
    pickerId: "expanderColorPicker",
    varName: "--expander-bg-color",
    sourceId: "expander",
  },
  {
    pickerId: "oscillator2ColorPicker",
    varName: "--oscillator2-bg-color",
    sourceId: "oscillator2",
  },
  {
    pickerId: "ampEnvelopeColorPicker",
    varName: "--AmpEnvelope-bg-color",
    sourceId: "ampEnvelope",
  },
  {
    pickerId: "mixerColorPicker",
    varName: "--mixer-bg-color",
    sourceId: "mixerOut",
  },
  {
    pickerId: "delayColorPicker",
    varName: "--delay-bg-color",
    sourceId: "delayOut",
  },
  {
    pickerId: "phaserColorPicker",
    varName: "--phaser-bg-color",
    sourceId: "phaserOut",
  },
  {
    pickerId: "eqColorPicker",
    varName: "--eq-bg-color",
    sourceId: "eqOut",
  },
  {
    pickerId: "dualFilterColorPicker",
    varName: "--dualFilter-bg-color",
    sourceId: "dualFilterOut",
  },
  {
    pickerId: "externalColorPicker",
    varName: "--externalInput-bg-color",
    sourceId: "externalInput",
  },
  {
    pickerId: "reverbColorPicker",
    varName: "--reverb-bg-color",
    sourceId: "reverb",
  },
  {
    pickerId: "mutatorColorPicker",
    varName: "--mutator-bg-color",
    sourceId: "mutator",
  },
];

// Add event listeners to all color pickers
colorPickers.forEach(({ pickerId, varName, sourceId }) => {
  const colorPicker = document.getElementById(pickerId);

  colorPicker.addEventListener("input", function (event) {
    const selectedColor = event.target.value;

    // Update the CSS variable for the selected output
    document.documentElement.style.setProperty(
      varName,
      hexToRgba(selectedColor, 0.5)
    );

    // Find all inputs connected to this output and update their background color
    connections.forEach(
      ({ sourceId: connectedSource, targetId: connectedTarget }) => {
        if (connectedSource === sourceId) {
          const targetElement = document.getElementById(
            `${connectedTarget}-input`
          );
          targetElement.style.backgroundColor = hexToRgba(selectedColor, 0.5);
        }
      }
    );
  });
});

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
// Function to display connections in the UI
function displayConnection(sourceId, targetId) {
  const connectionDisplay = document.getElementById("connectionDisplay");
  // Create a container for the connection display
  const connectionContainer = document.createElement("div");
  // Connection text
  const connectionText = document.createElement("span");
  connectionText.textContent = `${sourceId} To ${targetId}`;
  // Disconnect button
  const disconnectButton = document.createElement("button");
  disconnectButton.textContent = "Disconnect";
  disconnectButton.setAttribute(
    "aria-label",
    `Disconnect the connection between ${sourceId} and ${targetId}`
  );
  disconnectButton.addEventListener(
    "click",
    () => disconnectNodes(sourceId, targetId, connectionContainer) // passing container to remove
  );
  connectionContainer.appendChild(connectionText);
  connectionContainer.appendChild(disconnectButton);
  connectionDisplay.appendChild(connectionContainer);
}

// Function to reset background color when disconnecting
function resetBackgroundColor(targetId) {
  const targetElement = document.getElementById(`${targetId}-input`);
  targetElement.style.backgroundColor = ""; // Reset to default background
}

// Function to disconnect nodes
function disconnectNodes(sourceId, targetId, connectionText) {
  const connectionIndex = connections.findIndex(
    (conn) => conn.sourceId === sourceId && conn.targetId === targetId
  );

  if (connectionIndex !== -1) {
    const { sourceNode, targetNode } = connections[connectionIndex];

    // Disconnect from either a regular target or the analyser
    if (targetId === "analyser") {
      sourceNode.disconnect(analyser);
      console.log(`Disconnected ${sourceId} from analyser`);
    } else {
      sourceNode.disconnect(targetNode);
      console.log(`Disconnected ${sourceId} from ${targetId}`);
    }

    // Reset aria-labels before removing the connection
    removeConnection(sourceId); // <--- Call this first

    // Reset background color
    resetBackgroundColor(targetId); // <--- Reset background color on disconnect

    // Remove the connection from the display (UI)
    connectionText.remove();

    // Remove the connection from the array
    connections.splice(connectionIndex, 1); // <--- Move this after removeConnection
  } else {
    console.warn(`Connection between ${sourceId} and ${targetId} not found.`);
  }
  saveConnectionsToLocalStorage();
}

// Attach event listeners to all input and output nodes
document.querySelectorAll(".input, .output").forEach((module) => {
  module.addEventListener("dragstart", handleDragStart);
  module.addEventListener("dragover", handleDragOver);
  module.addEventListener("drop", handleDrop);
});

// Create LFO and modulation gain
const lfos = [
  {
    osc: audioContext.createOscillator(),
    gain: audioContext.createGain(),
    targets: [],
    type: "sine",
  },
  {
    osc: audioContext.createOscillator(),
    gain: audioContext.createGain(),
    targets: [],
    type: "sine",
  },
  {
    osc: audioContext.createOscillator(),
    gain: audioContext.createGain(),
    targets: [],
    type: "sine",
  },
];

const lfoGains = [];
const lfoDestinations = [[], [], []]; // Each LFO can modulate up to 4 destinations

// Scaling factors for each LFO target
const lfoScales = {
  compSineOut: 0.001,
  compSineDetune: 1,
  compSawOut: 0.001,
  compSawDetune: 1,
  compSquareOut: 0.001,
  compSquareDetune: 1,
  compTriOut: 0.001,
  compTriDetune: 1,
  compOscAmFreq: 1,
  compOscAmAmt: 0.001,
  compOscFmFreq: 1,
  compOscFmAmt: 1,
  osc1Out: 0.001,
  osc1frequency: 50,
  osc1detune: 1,
  osc2Out: 0.001,
  osc2frequency: 50,
  osc2detune: 1,
  gain: 0.001,
  filterFrequency1: 500,
  filterQ1: 1,
  dualFilterFreqA: 500,
  dualFilterQ_A: 1,
  dualFilterFreqB: 500,
  dualFilterQ_B: 1,
  pulseFreqMod: 50,
  pulseDetuneMod: 1,
  pulseWidthMod: 0.001,
  delayTime: 1,
  delayFeedback: 0.001,
  delayWet: 0.1,
  delayCutoff: 500,
  chorusRate: 1,
  chorusDepth: 1,
  chorusDelay: 0.05,
  chorusWet: 0.1,
  panRate: 0.1,
  panDepth: 0.1,
  overdriveDrive: 0.1,
  overdriveOutputGain: 0.1,
  mix1: 0.001,
  mix2: 0.001,
  mix3: 0.001,
  mix4: 0.001,
  eqLowGain: 0.01,
  eqLowFreq: 50,
  eqMidGain: 0.01,
  eqMidFreq: 100,
  eqMidPeak: 0.01,
  eqHighGain: 0.01,
  eqHighFreq: 100,
};

// Assign the correct AudioParam for a given target
function getLfoParam(target) {
  switch (target) {
    case "compSineOut":
      return complexOscillator1.sineLevel.gain;
    case "compSineDetune":
      return complexOscillator1.sineOsc.detune;
    case "compSawOut":
      return complexOscillator1.sawLevel.gain;
    case "compSawDetune":
      return complexOscillator1.sawOsc.detune;
    case "compSquareOut":
      return complexOscillator1.squareLevel.gain;
    case "compSquareDetune":
      return complexOscillator1.squareOsc.detune;
    case "compTriOut":
      return complexOscillator1.triLevel.gain;
    case "compTriDetune":
      return complexOscillator1.triOsc.detune;
    case "compOscAmFreq":
      return complexOscillator1.modOsc.frequency;
    case "compOscAmAmt":
      return complexOscillator1.modLevel.gain;
    case "compOscFmFreq":
      return complexOscillator1.fmOsc.frequency;
    case "compOscFmAmt":
      return complexOscillator1.fmLevel.gain;
    case "osc1Out":
      return oscillator1.oscOut.gain;
    case "osc1frequency":
      return oscillator1.oscillator.frequency;
    case "osc1detune":
      return oscillator1.oscillator.detune;
    case "osc2Out":
      return oscillator2.oscOut.gain;
    case "osc2frequency":
      return oscillator2.oscillator.frequency;
    case "osc2detune":
      return oscillator2.oscillator.detune;
    case "gain":
      return outputGain.gain;
    case "filterFrequency1":
      return filter1.filter.frequency;
    case "filterQ1":
      return filter1.filter.Q;
    case "dualFilterFreqA":
      return dualFilter.filterA.frequency;
    case "dualFilterQ_A":
      return dualFilter.filterA.Q;
    case "dualFilterFreqB":
      return dualFilter.filterB.frequency;
    case "dualFilterQ_B":
      return dualFilter.filterB.Q;
    case "pulseFreqMod":
      return pulseOsc1.oscillator.frequency;
    case "pulseDetuneMod":
      return pulseOsc1.oscillator.detune;
    case "pulseWidthMod":
      return pulseOsc1.widthGain.gain;
    case "delayTime":
      return delay.delay.delayTime;
    case "delayFeedback":
      return delay.feedbackNode.gain;
    case "delayWet":
      return delay.wet.gain;
    case "delayCutoff":
      return delay.filter.frequency;
    case "chorusRate":
      return chorus.lfoL.frequency;
    case "chorusDepth":
      return chorus.lfoL.oscillation;
    case "chorusDelay":
      return chorus.lfoL.offset;
    case "chorusWet":
      return chorus.wetGainNode.gain;
    case "panRate":
      return autoPan.modulator.frequency;
    case "panDepth":
      return autoPan.modulationGain.gain;
    case "overdriveDrive":
      return drive.inputDrive.gain;
    case "overdriveOutputGain":
      return drive.outputDrive.gain;
    case "mix1":
      return mixerChannels[0].gain;
    case "mix2":
      return mixerChannels[1].gain;
    case "mix3":
      return mixerChannels[2].gain;
    case "mix4":
      return mixerChannels[3].gain;
    case "eqLowGain":
      return eq.lowShelf.gain;
    case "eqLowFreq":
      return eq.lowShelf.frequency;
    case "eqMidGain":
      return eq.peaking.gain;
    case "eqMidFreq":
      return eq.peaking.frequency;
    case "eqMidPeak":
      return eq.peaking.Q;
    case "eqHighGain":
      return eq.highShelf.gain;
    case "eqHighFreq":
      return eq.highShelf.frequency;
    default:
      return null;
  }
}

function updateLfoConnections(index) {
  const lfo = lfos[index];
  lfo.gain.disconnect();
  lfo.targets = [];

  for (let i = 1; i <= 4; i++) {
    const select = document.getElementById(`LFO ${index + 1} Destination ${i}`);
    const target = select?.value;
    const param = getLfoParam(target);
    if (param) {
      const scale = lfoScales[target] || 1;
      const scaledGain = audioContext.createGain();
      const depth = parseFloat(
        document.getElementById(`Lfo ${index + 1} Depth`).value
      );
      scaledGain.gain.value = depth * scale;
      lfo.gain.connect(scaledGain).connect(param);
      lfo.targets.push(scaledGain);
    }
  }
}

function retriggerLFO(index) {
  const oldLFO = lfos[index].osc;
  try {
    oldLFO?.stop();
  } catch (e) {}
  if (oldLFO) oldLFO.disconnect();
  lfos[index].gain.disconnect();

  const newLFO = audioContext.createOscillator();
  newLFO.type = "sine";
  newLFO.frequency.value = parseFloat(
    document.getElementById(`Lfo ${index + 1} Depth`).value
  );
  lfos[index].osc = newLFO;
  newLFO.connect(lfos[index].gain);
  updateLfoConnections(index);
}

function setupLfo(index) {
  lfos[index].gain = audioContext.createGain();
  lfos[index].gain.gain.value = 1;

  const lfo = audioContext.createOscillator();
  lfo.type = "sine";
  const rateInput = document.getElementById(`Lfo ${index + 1} Rate`);
  if (rateInput) {
    lfo.frequency.value = parseFloat(rateInput.value);
  } else {
    lfo.frequency.value = 1; // fallback default
  }

  lfo.connect(lfos[index].gain);
  lfos[index].osc = lfo;
  //lfo.start();
  const modeSelect = document.getElementById(`LFO ${index + 1} Retrigger`);
  if (modeSelect) {
    modeSelect.addEventListener("change", (e) => {
      lfos[index].mode = e.target.value;
    });
    lfos[index].mode = modeSelect.value; // Initialize from current selection
  }

  const rateControl = document.getElementById(`Lfo ${index + 1} Rate`);
  if (rateControl) {
    rateControl.addEventListener("input", (e) => {
      lfos[index].osc.frequency.value = parseFloat(e.target.value);
    });
  } else {
  }

  const depthControl = document.getElementById(`Lfo ${index + 1} Depth`);
  if (depthControl) {
    depthControl.addEventListener("input", () => {
      updateLfoConnections(index);
    });
  } else {
  }

  for (let i = 1; i <= 4; i++) {
    const sel = document.getElementById(`LFO ${index + 1} Destination ${i}`);
    if (sel) sel.addEventListener("change", () => updateLfoConnections(index));
  }

  updateLfoConnections(index);
}

function startLFOs() {
  lfos.forEach((lfo, index) => {
    try {
      if (lfo?.osc?.start) {
        lfo.osc.start();
        console.log(`LFO ${index} started`);
      }
    } catch (e) {
      console.warn(`LFO ${index} could not start (likely already started)`, e);
    }
  });
}

lfos.forEach((_, index) => setupLfo(index));

// === MIDI LEARN MODE EXTENSIONS ======================

// 🎛️ MIDI Learn Mode Globals
let learnMode = false;
let paramToMap = null;
let isSelectTarget = false;
let ccMappings = {};
let ccSelectMappings = {};

// Load mappings on page load
window.addEventListener("DOMContentLoaded", () => {
  loadMidiMappings();
  injectLearnButtons();
});

// === MIDI Learn Core ===
function enterLearnMode(paramName) {
  learnMode = true;
  paramToMap = paramName;
  announceToAria(`Learning: move a controller to assign it to ${paramName}`);
}

function handleCC(ccNumber, value) {
  const normalizedValue = value / 127;

  // 🎛 Learn Mode (for sliders or selects)
  if (learnMode && paramToMap) {
    const mappings = isSelectTarget ? ccSelectMappings : ccMappings;

    // Remove existing mapping for that param
    for (const [cc, param] of Object.entries(mappings)) {
      if (param === paramToMap) {
        delete mappings[cc];
        break;
      }
    }

    mappings[ccNumber] = paramToMap;
    saveMidiMappings();
    injectLearnButtons();
    announceToAria(`Mapped CC ${ccNumber} to ${paramToMap}`);
    learnMode = false;
    paramToMap = null;
    isSelectTarget = false;
    return;
  }

  // === 🎚 Slider mapping ===
  const paramName = ccMappings[ccNumber];
  if (paramName) {
    const binding = sliderBindings.find(([name]) => name === paramName);
    if (!binding) return;

    const [, setFunc] = binding;
    const sliderEl = document.querySelector(`[data-param="${paramName}"]`);
    if (!sliderEl) {
      announceToAria(`${paramName} updated`);
      return;
    }

    const min = parseFloat(sliderEl.min);
    const max = parseFloat(sliderEl.max);
    const step = parseFloat(sliderEl.step || "1");

    let realValue = min + normalizedValue * (max - min);
    const precision = (step.toString().split(".")[1] || "").length;
    realValue = parseFloat(realValue.toFixed(precision));

    sliderEl.value = realValue;
    sliderEl.dispatchEvent(new Event("input"));
    setFunc(realValue);

    const targetId = sliderEl.getAttribute("data-target");
    const targetSpan = targetId && document.getElementById(targetId);
    if (targetSpan) targetSpan.textContent = realValue;

    announceToAria(`${paramName} set to ${realValue}`);
    return;
  }

  // === 🔽 Select mapping ===
  const selectParam = ccSelectMappings[ccNumber];
  if (selectParam) {
    const selectBinding = selectBindings.find(([name]) => name === selectParam);
    if (!selectBinding) {
      console.warn("No select binding found for:", selectParam);
      return;
    }

    const [, setFunc] = selectBinding;
    const selectEl = document.getElementById(selectParam);
    if (!selectEl) {
      console.warn("No select element found for:", selectParam);
      return;
    }

    const optionCount = selectEl.options.length;
    const index = Math.floor(normalizedValue * (optionCount - 1));
    const option = selectEl.options[index];
    if (!option) {
      console.warn("No option at index", index, "in", selectParam);
      return;
    }

    const optionValue = String(option.value);

    // Apply to UI
    selectEl.value = optionValue;
    selectEl.dispatchEvent(new Event("change"));
    setFunc(optionValue);

    // Speak selected label
    const label = option.text || optionValue;
    announceToAria(`${selectParam} set to ${label}`);
    return;
  }
}

function announceToAria(text) {
  const live = document.getElementById("aria-live");
  if (!live) return;
  live.textContent = "";
  setTimeout(() => (live.textContent = text), 10);
}

// === Save & Load Mappings ===
function saveMidiMappings() {
  const data = {
    sliders: ccMappings,
    selects: ccSelectMappings,
  };
  localStorage.setItem("midiMappings", JSON.stringify(data));
}

function loadMidiMappings() {
  const stored = localStorage.getItem("midiMappings");
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    ccMappings = parsed.sliders || {};
    ccSelectMappings = parsed.selects || {};
  } catch (err) {
    console.error("Failed to load MIDI mappings:", err);
  }
}

// === Unmap & Reset ===
function removeMidiMapping(paramName) {
  for (const [cc, param] of Object.entries(ccMappings)) {
    if (param === paramName) {
      delete ccMappings[cc];
      saveMidiMappings();
      injectLearnButtons();
      announceToAria(`${paramName} mapping removed`);
      return;
    }
  }
  announceToAria(`${paramName} had no mapping`);
}

function clearAllMappings() {
  ccMappings = {};
  ccSelectMappings = {};
  saveMidiMappings();
  injectLearnButtons();
  announceToAria("All MIDI mappings cleared");
}

function injectLearnButtons() {
  const openSections = new Set(
    Array.from(document.querySelectorAll("#midi-learn-container details"))
      .filter((d) => d.open)
      .map((d) => d.querySelector("summary")?.textContent?.trim())
  );

  const container = document.getElementById("midi-learn-container");
  if (!container) return;
  container.innerHTML = "";

  // Group all bindings by category
  const grouped = {};

  // Add sliders to groups
  sliderBindings.forEach(([name, , , category = "Other"]) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ name, type: "slider" });
  });

  // Add selects to groups
  selectBindings.forEach(([name, , category = "Other"]) => {
    if (name === "stepCount") return;
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ name, type: "select" });
  });

  // Create UI for each category
  for (const [category, params] of Object.entries(grouped)) {
    const section = document.createElement("details");
    section.id = `midi-category-${category.toLowerCase().replace(/\s+/g, "-")}`;
    section.open = openSections.has(category);

    section.addEventListener("toggle", () => {
      announceToAria(
        `${category} section ${section.open ? "expanded" : "collapsed"}`
      );
    });

    const summary = document.createElement("summary");
    summary.textContent = category;
    summary.style.marginBottom = "0.5em";
    section.appendChild(summary);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.justifyItems = "space-evenly";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
    grid.style.gap = "0.5em";
    grid.style.paddingLeft = "0.5em";

    params.forEach(({ name: paramName, type }) => {
      const box = document.createElement("div");
      box.classList.add("midi-param-box");

      const label = document.createElement("span");
      label.textContent = paramName;
      label.style.marginBottom = "0.5em";
      label.style.whiteSpace = "normal";
      label.style.wordBreak = "break-word";
      label.style.textAlign = "center";

      const ccBadge = document.createElement("span");
      ccBadge.style.textAlign = "center";
      ccBadge.style.margin = "0 0 0.5em 0";

      let matchedCC;

      if (type === "slider") {
        matchedCC = Object.entries(ccMappings).find(
          ([, param]) => param === paramName
        );
      } else {
        matchedCC = Object.entries(ccSelectMappings).find(
          ([, param]) => param === paramName
        );
      }

      if (matchedCC) {
        const [cc] = matchedCC;
        ccBadge.textContent = `CC ${cc}`;
      }

      const btnGroup = document.createElement("div");
      btnGroup.style.display = "flex";
      btnGroup.style.justifyContent = "space-between";

      const learnBtn = document.createElement("button");
      learnBtn.textContent = "Map 🎛️";
      learnBtn.title = `Learn ${paramName}`;
      learnBtn.onclick = () => {
        learnMode = true;
        paramToMap = paramName;
        isSelectTarget = type === "select";
        announceToAria(
          `Learning: move a controller to assign it to ${paramName}`
        );
      };

      const unmapBtn = document.createElement("button");
      unmapBtn.textContent = "❌";
      unmapBtn.title = `Unmap ${paramName}`;
      unmapBtn.onclick = () => {
        const mapping = type === "slider" ? ccMappings : ccSelectMappings;
        for (const cc in mapping) {
          if (mapping[cc] === paramName) {
            delete mapping[cc];
            break;
          }
        }
        saveMidiMappings();
        injectLearnButtons();
        announceToAria(`Unmapped ${paramName}`);
      };

      btnGroup.appendChild(learnBtn);
      btnGroup.appendChild(unmapBtn);

      box.appendChild(label);
      box.appendChild(ccBadge);
      box.appendChild(btnGroup);

      grid.appendChild(box);
    });

    section.appendChild(grid);
    container.appendChild(section);
  }

  // Export / Import / Reset controls
  const controlsRow = document.createElement("div");
  controlsRow.style.display = "flex";
  controlsRow.style.flexWrap = "wrap";
  controlsRow.style.gap = "0.5em";
  controlsRow.style.marginTop = "1em";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "📤 Export Mappings";
  exportBtn.id = "export-mappings";
  exportBtn.onclick = showExportModal;

  const importLabel = document.createElement("label");
  importLabel.className = "custom-file-upload";
  importLabel.textContent = "📥 Import Mapping";

  // Create hidden file input
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.style.display = "none";

  importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) importMidiMappingsFromFile(file);
  };

  // Append input inside label (clicking label will open it)
  importLabel.appendChild(importInput);

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🧹 Clear All Mappings";
  resetBtn.id = "clear-all-mappings";
  resetBtn.onclick = () => {
    showConfirmModal(
      "Are you sure you want to clear all MIDI mappings?",
      clearAllMappings
    );
  };

  controlsRow.appendChild(exportBtn);
  controlsRow.appendChild(importLabel);
  controlsRow.appendChild(resetBtn);
  container.appendChild(document.createElement("hr"));
  container.appendChild(controlsRow);
}

function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById("confirm-modal");
  const messageEl = document.getElementById("confirm-modal-message");
  const yesBtn = document.getElementById("confirm-yes-btn");
  const noBtn = document.getElementById("confirm-no-btn");

  if (!modal || !messageEl || !yesBtn || !noBtn) return;

  // Set up modal content
  messageEl.textContent = message;
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";

  // Focus for screen reader + keyboard nav
  messageEl.focus();

  // Cleanup any previous listeners
  yesBtn.onclick = null;
  noBtn.onclick = null;

  // Confirm button
  yesBtn.onclick = () => {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    onConfirm();
  };

  // Cancel button
  noBtn.onclick = () => {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    announceToAria("Action canceled");
  };
}

function showExportModal() {
  const modal = document.getElementById("preset-input-modal");
  const input = document.getElementById("preset-name-input");
  const saveBtn = document.getElementById("preset-save-btn");
  const cancelBtn = document.getElementById("preset-cancel-btn");

  if (!modal || !input || !saveBtn || !cancelBtn) return;

  // Make modal visible and accessible
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";

  // Wait until next frame to ensure DOM update, then focus
  requestAnimationFrame(() => input.focus());

  // Optional: trap focus inside modal
  const focusable = [input, saveBtn, cancelBtn];
  let focusIndex = 0;

  function trapFocus(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      focusIndex += e.shiftKey ? -1 : 1;
      if (focusIndex < 0) focusIndex = focusable.length - 1;
      if (focusIndex >= focusable.length) focusIndex = 0;
      focusable[focusIndex].focus();
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    document.removeEventListener("keydown", trapFocus);
    saveBtn.removeEventListener("click", onSave);
    cancelBtn.removeEventListener("click", onCancel);
  }

  function onSave() {
    const name = input.value.trim();
    if (!name) {
      announceToAria("Please enter a name");
      return;
    }

    const data = {
      sliders: ccMappings,
      selects: ccSelectMappings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = name.endsWith(".json") ? name : `${name}.json`;
    link.href = url;
    link.click();

    announceToAria(`Exported mappings as ${link.download}`);
    closeModal();
  }

  function onCancel() {
    announceToAria("Export cancelled");
    closeModal();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSave();
  });

  saveBtn.addEventListener("click", onSave);
  cancelBtn.addEventListener("click", onCancel);
  document.addEventListener("keydown", trapFocus);
}

function importMidiMappingsFromFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);

      if (typeof json !== "object") throw new Error("Invalid format");

      // Overwrite mappings safely
      ccMappings = json.sliders || {};
      ccSelectMappings = json.selects || {};

      saveMidiMappings(); // Persist updated mappings
      injectLearnButtons(); // Refresh UI
      announceToAria("Mappings imported");
    } catch (e) {
      console.error("Failed to import MIDI mappings:", e);
      announceToAria("Error importing mappings");
    }
  };

  reader.readAsText(file);
}
