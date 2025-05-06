(function () {
  var PolySynth, PolySynthVoice, VirtualKeyboard, noteToFrequency;

  PolySynth = (function () {
    function PolySynth(context) {
      this.context = context;
      this.tuna = new Tuna(this.context);
      this.output = this.context.createGain();
      this.filter1Gain = this.context.createGain();
      this.biquadFilter = this.context.createBiquadFilter();
      this.delay = new this.tuna.Delay({
        cutoff: 3000,
        delayTime: 20,
        feedback: 0.5,
        wetLevel: 0.5,
      });

      this.dimensionExpander = new this.tuna.DimensionExpander({
        delayTimes: [0.006, 0.009, 0.0012, 0.015],
        feedback: 0.4,
        setWetLevel: 1.0,
        setDryLevel: 1.0,
      });

      this.eQ3Band = new this.tuna.EQ3Band({
        lowGain: 0,
        midGain: 0,
        highGain: 0,
        lowFreq: 1000,
        midFreq: 8000,
        highFreq: 5000,
        midRes: 0,
      });

      this.filter1Gain.connect(this.biquadFilter);
      this.biquadFilter.connect(this.eQ3Band.input);
      this.eQ3Band.connect(this.dimensionExpander.input);
      this.dimensionExpander.connect(this.delay.input);
      this.delay.connect(this.output);
      this.voices = [];
      this.numSaws = 3;
      this.detune = 12;
      this.waveType = "square";
      this.attack = 0.001;
      this.decay = 0.001;
      this.sustain = 0.8;
      this.release = 0.3;
    }

    PolySynth.prototype.noteOn = function (note, time) {
      var freq, voice;
      if (this.voices[note] != null) {
        return;
      }
      if (time == null) {
        time = this.context.currentTime;
      }
      freq = noteToFrequency(note);
      voice = new PolySynthVoice(
        this.context,
        freq,
        this.numSaws,
        this.detune,
        this.waveType,
        this.attack,
        this.decay,
        this.sustain,
        this.release
      );
      voice.connect(this.filter1Gain);
      voice.start(time);
      return (this.voices[note] = voice);
    };

    PolySynth.prototype.noteOff = function (note, time) {
      if (this.voices[note] == null) {
        return;
      }
      if (time == null) {
        time = this.context.currentTime;
      }
      this.voices[note].stop(time);
      return delete this.voices[note];
    };

    PolySynth.prototype.connect = function (target) {
      return this.output.connect(target);
    };

    return PolySynth;
  })();

  PolySynthVoice = (function () {
    function PolySynthVoice(
      context,
      frequency,
      numSaws,
      detune,
      waveType,
      attack,
      decay,
      sustain,
      release
    ) {
      var i, saw, _i, _ref;
      this.context = context;
      this.frequency = frequency;
      this.numSaws = numSaws;
      this.detune = detune;
      this.output = this.context.createGain();
      this.maxGain = sustain / this.numSaws;
      this.attack = attack;
      this.decay = decay;
      this.release = release;
      this.saws = [];
      for (
        i = _i = 0, _ref = this.numSaws;
        0 <= _ref ? _i < _ref : _i > _ref;
        i = 0 <= _ref ? ++_i : --_i
      ) {
        saw = this.context.createOscillator();
        saw.type = waveType;
        saw.frequency.value = this.frequency;
        saw.detune.value =
          -this.detune + (i * 2 * this.detune) / (this.numSaws - 1);
        saw.start(this.context.currentTime);
        saw.connect(this.output);
        this.saws.push(saw);
      }
    }

    PolySynthVoice.prototype.start = function (time) {
      this.output.gain.value = 0;
      this.output.gain.setValueAtTime(0, time);
      this.output.gain.linearRampToValueAtTime(
        this.maxGain,
        time + this.attack
      );

      const decayValue = this.maxGain * 0.5;
      this.output.gain.linearRampToValueAtTime(
        decayValue,
        time + this.attack + this.decay
      );
    };

    PolySynthVoice.prototype.stop = function (time) {
      var _this = this;
      this.output.gain.cancelScheduledValues(time);
      this.output.gain.setValueAtTime(this.output.gain.value, time);
      this.output.gain.setTargetAtTime(0, time, this.release / 10);
      return this.saws.forEach(function (saw) {
        return saw.stop(time + _this.release);
      });
    };

    PolySynthVoice.prototype.connect = function (target) {
      return this.output.connect(target);
    };

    return PolySynthVoice;
  })();

  VirtualKeyboard = (function () {
    function VirtualKeyboard($el, params) {
      var _ref, _ref1, _ref2, _ref3;
      this.$el = $el;
      this.lowestNote = (_ref = params.lowestNote) != null ? _ref : 48;
      this.letters =
        (_ref1 = params.letters) != null
          ? _ref1
          : "awsedftgyhujkolp;'".split("");
      this.noteOn =
        (_ref2 = params.noteOn) != null
          ? _ref2
          : function (note) {
              return console.log("noteOn: " + note);
            };
      this.noteOff =
        (_ref3 = params.noteOff) != null
          ? _ref3
          : function (note) {
              return console.log("noteOff: " + note);
            };
      this.keysPressed = {};
      this.render();
      this.bindKeys();
      this.bindMouse();
    }

    VirtualKeyboard.prototype._noteOn = function (note) {
      if (note in this.keysPressed) {
        return;
      }
      $(this.$el.find("li").get(note - this.lowestNote)).addClass("active");
      this.keysPressed[note] = true;
      return this.noteOn(note);
    };

    VirtualKeyboard.prototype._noteOff = function (note) {
      if (!(note in this.keysPressed)) {
        return;
      }
      $(this.$el.find("li").get(note - this.lowestNote)).removeClass("active");
      delete this.keysPressed[note];
      return this.noteOff(note);
    };

    VirtualKeyboard.prototype.bindKeys = function () {
      var _this = this;

      this.letters.forEach(function (letter, i) {
        document.addEventListener("keydown", function (event) {
          if (event.key === letter) {
            _this._noteOn(_this.lowestNote + i);
          }
        });

        document.addEventListener("keyup", function (event) {
          if (event.key === letter) {
            _this._noteOff(_this.lowestNote + i);
          }
        });
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "z") {
          _this.lowestNote -= 12;
        } else if (event.key === "x") {
          _this.lowestNote += 12;
        }
      });
    };

    VirtualKeyboard.prototype.bindMouse = function () {
      var _this = this;

      this.$el.find("li").each(function (i, key) {
        $(key).mousedown(function () {
          _this._noteOn(_this.lowestNote + i);
        });
        $(key).mouseup(function () {
          _this._noteOff(_this.lowestNote + i);
        });
      });
    };

    VirtualKeyboard.prototype.render = function () {
      var $key, $ul, i, letter, _i, _len, _ref;
      this.$el.empty();
      $ul = $("<ul>");
      _ref = this.letters;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        letter = _ref[i];
        $key = $("<li>" + letter + "</li>");
        if (
          i === 1 ||
          i === 3 ||
          i === 6 ||
          i === 8 ||
          i === 10 ||
          i === 13 ||
          i === 15
        ) {
          $key.addClass("accidental");
        }
        $ul.append($key);
      }
      return this.$el.append($ul);
    };

    return VirtualKeyboard;
  })();

  noteToFrequency = function (note) {
    return Math.pow(2, (note - 69) / 12) * 440.0;
  };

  $(function () {
    var audioContext, masterGain, setDetune, setNumSaws, setWaveType;
    audioContext = new (
      typeof AudioContext !== "undefined" && AudioContext !== null
        ? AudioContext
        : webkitAudioContext
    )();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioContext.destination);
    window.polySynth = new PolySynth(audioContext);
    polySynth.connect(masterGain);

    var useMidiInput = false;
    var midiInputs = [];
    var midiChannel = 1; // Default MIDI channel

    function onMIDISuccess(midiAccess) {
      var inputs = midiAccess.inputs.values();
      for (var input of inputs) {
        midiInputs.push(input);
        var option = $("<option>").text(input.name).val(input.id);
        $("#midi-inputs").append(option);
      }
      $("#midi-inputs").on("change", function () {
        var selectedId = $(this).val();
        var selectedInput = midiInputs.find((input) => input.id === selectedId);
        if (selectedInput) {
          selectedInput.onmidimessage = handleMIDIMessage;
        }
      });
    }

    function onMIDIFailure() {
      console.error("Could not access your MIDI devices.");
    }

    function handleMIDIMessage(message) {
      var data = message.data;
      var type = data[0] & 0xf0;
      var channel = data[0] & 0x0f;
      var note = data[1];
      var velocity = data[2];
      if (channel === midiChannel - 1) {
        switch (type) {
          case 144:
            if (velocity > 0) {
              polySynth.noteOn(note);
            } else {
              polySynth.noteOff(note);
            }
            break;
          case 128:
            polySynth.noteOff(note);
            break;
          case 176: // MIDI CC
            handleMIDIControlChange(note, velocity);
            break;
        }
      }
    }

    function handleMIDIControlChange(controller, value) {
      switch (controller) {
        case 1: // Modulation Wheel
          polySynth.biquadFilter.frequency.value = (value / 127) * 20000;
          break;
        default:
        //console.log("Unhandled MIDI CC:", controller, value);
      }
    }

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("Web MIDI API not supported in this browser.");
    }

    var keyboard = new VirtualKeyboard($("#keyboard"), {
      noteOn: function (note) {
        if (!useMidiInput) {
          return polySynth.noteOn(note);
        }
      },
      noteOff: function (note) {
        if (!useMidiInput) {
          return polySynth.noteOff(note);
        }
      },
    });

    $("#input-method-toggle").on("change", function () {
      useMidiInput = $(this).is(":checked");
    });

    $("#midi-channel").on("change", function () {
      midiChannel = parseInt($(this).val());
    });

    setWaveType = function (waveType) {
      polySynth.waveType = waveType;
    };

    var $waveType = $("#wave-type-osc");

    $waveType.on("change", function () {
      setWaveType($(this).val());
    });

    const sawsOutput = document.getElementById("sawsOut");

    setNumSaws = function (numSaws) {
      polySynth.numSaws = parseInt(numSaws);
      sawsOutput.textContent = `${polySynth.numSaws}`;
    };

    const detuneOutput = document.getElementById("detuneOut");
    setDetune = function (detune) {
      polySynth.detune = parseInt(detune);
      detuneOutput.textContent = `${polySynth.detune}`;
    };

    var $sawsRange = $("#oscillators");
    var $detuneRange = $("#detune");

    $sawsRange.on("input", function () {
      setNumSaws($(this).val());
    });

    $detuneRange.on("input", function () {
      setDetune($(this).val());
    });

    const attackOutput = document.getElementById("attack-output2");
    setAttack = function (attack) {
      polySynth.attack = parseFloat(attack) / 100;
      attackOutput.textContent = polySynth.attack.toFixed(2);
    };

    const decayOutput = document.getElementById("decay-output2");
    setDecay = function (decay) {
      polySynth.decay = parseFloat(decay) / 100;
      decayOutput.textContent = polySynth.decay.toFixed(2);
    };

    const sustainOutput = document.getElementById("sustain-output2");
    setSustain = function (sustain) {
      polySynth.sustain = parseFloat(sustain) / 100;
      sustainOutput.textContent = polySynth.sustain.toFixed(2);
    };

    const releaseOutput = document.getElementById("release-output2");
    setRelease = function (release) {
      polySynth.release = parseFloat(release) / 100;
      releaseOutput.textContent = polySynth.release.toFixed(2);
    };

    var $attackSlider = $("#amp-attack");
    var $decaySlider = $("#amp-decay");
    var $sustainSlider = $("#amp-sustain");
    var $releaseSlider = $("#amp-release");

    $attackSlider.on("input", function () {
      setAttack($(this).val());
    });

    $decaySlider.on("input", function () {
      setDecay($(this).val());
    });

    $sustainSlider.on("input", function () {
      setSustain($(this).val());
    });

    $releaseSlider.on("input", function () {
      setRelease($(this).val());
    });

    const lfo1 = audioContext.createOscillator();
    const lfo1Frequency = 0.5;
    lfo1.frequency.value = lfo1Frequency;
    const lfoGain1 = audioContext.createGain();
    lfo1.connect(lfoGain1);
    let lfoDepth1 = 100;
    lfoGain1.gain.value = lfoDepth1;
    lfoGain1.connect(polySynth.biquadFilter.frequency);
    lfo1.start();

    function updateLfoWaveforms() {
      const lfoWaveform1 = $("#lfo-waveform-select1-f1").val();
      lfo1.type = lfoWaveform1;
    }

    $("#lfo-waveform-select1-f1").on("change", function () {
      updateLfoWaveforms();
    });
    updateLfoWaveforms();

    function updateLfoRates() {
      const lfoRate1Value = parseFloat($("#lfo-rate").val());
      lfo1.frequency.value = lfoRate1Value;
      $("#lfo-rate-output1-f1").text(lfoRate1Value.toFixed(1));
    }

    $("#lfo-rate").on("input", function () {
      updateLfoRates();
    });

    updateLfoRates();

    function updateLfoDepths() {
      const lfoDepth1Value = parseFloat($("#lfo-depth").val());
      lfoDepth1 = lfoDepth1Value;
      lfoGain1.gain.value = lfoDepth1;
      $("#lfo-depth-output1-f1").text(lfoDepth1Value.toFixed(1));
    }

    $("#lfo-depth").on("input", function () {
      updateLfoDepths();
    });

    updateLfoDepths();

    function updateFilterParams() {
      var frequency1 = parseFloat($("#filter-frequency").val());
      var Q1 = parseFloat($("#filter-resonance").val());
      var gain1 = parseFloat($("#filter-gain").val()) / 100;
      var filterType1 = $("#filter-one-type-control-f1").val();

      polySynth.biquadFilter.frequency.value = frequency1;
      polySynth.biquadFilter.Q.value = Q1;
      polySynth.filter1Gain.gain.value = gain1;
      polySynth.biquadFilter.type = filterType1;

      $("#filter-freq-output-f1").text(frequency1.toFixed());
      $("#resonance-output-f1").text(Q1.toFixed(1));
      $("#gain-output-f1").text(gain1.toFixed(2));
    }

    $(
      "#filter-frequency, #filter-resonance, #filter-gain, #filter-one-type-control-f1"
    ).on("input", function () {
      updateFilterParams();
    });

    updateFilterParams();

    function updateDelayParams() {
      var delayTime = parseFloat($("#delay-time").val()) / 100;
      var feedback = parseFloat($("#delay-feedback").val()) / 100;
      var wetLevel = parseFloat($("#delay-wet").val()) / 100;
      var cutoff = parseFloat($("#delay-frequency").val());

      polySynth.delay.delayTime.value = delayTime;
      polySynth.delay.feedback.value = feedback;
      polySynth.delay.wetLevel.value = wetLevel;
      polySynth.delay.cutoff.value = cutoff;

      $("#delay-time-output-nm").text(delayTime.toFixed(2));
      $("#feedback-output-nm").text(feedback.toFixed(2));
      $("#wet-level-output-nm").text(wetLevel.toFixed(2));
      $("#cutoff-output-nm").text(cutoff.toFixed());
    }

    $("#delay-time, #delay-feedback, #delay-wet, #delay-frequency").on(
      "input",
      function () {
        updateDelayParams();
      }
    );

    updateDelayParams();

    function updateExpanderParams() {
      var feedback = parseFloat($("#expander-feedback").val()) / 100;
      var wetLevel = parseFloat($("#expander-wet").val()) / 100;
      var delayTime = parseFloat($("#expander-space-time").val()) / 1000;
      polySynth.dimensionExpander.delayTimes = [
        delayTime,
        delayTime + 0.001,
        delayTime + 0.003,
        delayTime + 0.006,
      ];
      polySynth.dimensionExpander.feedback = feedback;
      polySynth.dimensionExpander.setWetLevel(wetLevel);
      polySynth.dimensionExpander.setDryLevel(1 - wetLevel);

      $("#expander-feed-out").text(feedback.toFixed(2));
      $("#expander-wet-out").text(wetLevel.toFixed(2));
      $("#expander-space-time-out").text(delayTime.toFixed(3));
    }

    $("#expander-feedback, #expander-wet, #expander-space-time").on(
      "input",
      function () {
        updateExpanderParams();
      }
    );
    updateExpanderParams();

    function updateEQParams() {
      var lowFreq = parseFloat($("#low-frequency").val());
      var midFreq = parseFloat($("#mid-frequency").val());
      var highFreq = parseFloat($("#high-frequency").val());
      var lowFreqGain = parseFloat($("#low-gain").val());
      var midFreqGain = parseFloat($("#mid-gain").val());
      var highFreqGain = parseFloat($("#high-gain").val());
      var midQFactor = parseFloat($("#mid-peak").val());

      polySynth.eQ3Band.lowFreq.value = lowFreq;
      polySynth.eQ3Band.midFreq.value = midFreq;
      polySynth.eQ3Band.highFreq.value = highFreq;
      polySynth.eQ3Band.lowGain.value = lowFreqGain;
      polySynth.eQ3Band.midGain.value = midFreqGain;
      polySynth.eQ3Band.highGain.value = highFreqGain;
      polySynth.eQ3Band.midRes.value = midQFactor;

      $("#low-frequency-value").text(lowFreq.toFixed() + " Hz");
      $("#mid-frequency-value").text(midFreq.toFixed() + " Hz");
      $("#high-frequency-value").text(highFreq.toFixed() + " Hz");
      $("#low-gain-value").text(lowFreqGain.toFixed() + " dB");
      $("#mid-gain-value").text(midFreqGain.toFixed() + " dB");
      $("#high-gain-value").text(highFreqGain.toFixed() + " dB");
      $("#mid-q-value").text(midQFactor.toFixed());
    }

    $(
      "#low-frequency, #mid-frequency, #high-frequency, #low-gain, #mid-gain, #high-gain, #mid-peak"
    ).on("input", function () {
      updateEQParams();
    });

    updateEQParams();
  });
}).call(this);

//toggle divs=====================================
document.addEventListener("DOMContentLoaded", function () {
  const toggleHotKeys = document.getElementById("toggleHotkeys");
  //const toggleVoiceSettings = document.getElementById("toggleVoiceSettings");
  const presetSettings = document.getElementById("togglePreset");

  const hotkeysDiv = document.getElementById("hotkeysDiv");
  //const voiceSettingsDiv = document.getElementById("voiceSettingsDiv");
  const presetDiv = document.getElementById("presetDiv");

  toggleHotKeys.addEventListener("click", function () {
    hotkeysDiv.classList.toggle("hidden");
  });

  // toggleVoiceSettings.addEventListener("click", function () {
  //   voiceSettingsDiv.classList.toggle("hidden");
  // });

  presetSettings.addEventListener("click", function () {
    presetDiv.classList.toggle("hidden");
  });
});

$(document).ready(function () {
  $("#toggleHotkeys").click(function () {
    var buttonText = $(this).text();
    $(this).text(
      buttonText === "Show Hotkey Map" ? "Hide Hotkey Map" : "Show Hotkey Map"
    );
  });

  // $("#toggleVoiceSettings").click(function () {
  //   var buttonText = $(this).text();
  //   $(this).text(
  //     buttonText === "Show Voice Settings"
  //       ? "Hide Voice Settings"
  //       : "Show Voice Settings"
  //   );
  // });

  $("#togglePreset").click(function () {
    var buttonText = $(this).text();
    $(this).text(
      buttonText === "Show Presets" ? "Hide Presets" : "Show Presets"
    );
  });
});

//Local storage settings for ui elements
//======================================================================
$(document).ready(function () {
  // Use event delegation to handle dynamically added sliders and selects
  $(document).on("input", 'input[type="range"]', function () {
    const id = this.id;
    const value = $(this).val();
    localStorage.setItem(id, value);
  });

  // Continue using event delegation for checkboxes
  $(document).on("change", 'input[type="checkbox"]', function () {
    const id = this.id;
    const isChecked = $(this).is(":checked");
    localStorage.setItem(id, isChecked);
  });

  // Function to retrieve values from local storage for sliders, selects, and checkboxes
  function retrieveFromLocalStorage() {
    // Retrieve and set slider values
    $('input[type="range"]').each(function () {
      const id = this.id;
      const savedValue = localStorage.getItem(id);
      if (savedValue) {
        $(this).val(savedValue);
        $(this).trigger("input"); // Trigger the input event to update the UI
      }
    });

    // Retrieve and set checkbox states
    $('input[type="checkbox"]').each(function () {
      const id = this.id;
      const savedState = localStorage.getItem(id) === "true";
      $(this).prop("checked", savedState);
      $(this).trigger("change"); // Trigger the change event to update the UI
    });
  }

  // Function to save select values to local storage
  function saveSelectValuesToLocalStorage() {
    $("select").each(function () {
      const id = this.id;
      const value = $(this).val();
      localStorage.setItem(id, value);
    });
  }

  // Function to retrieve select values from local storage
  function retrieveSelectValuesFromLocalStorage() {
    $("select").each(function () {
      const id = this.id;
      const savedValue = localStorage.getItem(id);
      if (savedValue) {
        $(this).val(savedValue);
        // Trigger the change event to simulate user input
        $(this).trigger("change");
      }
    });
  }

  // Call functions to add event listeners for saving to local storage and retrieve from local storage on page load
  retrieveSelectValuesFromLocalStorage();

  // Add event listener to save select values on change
  $("select").on("change", saveSelectValuesToLocalStorage);

  // Call the retrieve function on page load to initialize values
  retrieveFromLocalStorage();
});

//presets=================================================
$(document).ready(function () {
  populateAudioPresetList();

  $("#save-audio-preset").click(function () {
    const presetName = $("#audio-preset-name").val().trim();
    if (presetName) {
      saveAudioPreset(presetName);
      populateAudioPresetList();
      $("#audio-preset-name").val("");
    } else {
      alert("Please enter an audio preset name.");
    }
  });

  $("#audio-preset-list").change(function () {
    const presetName = $(this).val();
    if (presetName) {
      loadAudioPreset(presetName);
    }
  });

  // Add event listeners to save slider and select values to local storage
  $('input[type="range"]').on("input", function () {
    const id = this.id;
    const value = $(this).val();
    localStorage.setItem(id, value);
  });

  $("select").on("change", function () {
    const id = this.id;
    const value = $(this).val();
    localStorage.setItem(id, value);
  });

  // Retrieve initial values from local storage
  retrieveAudioParamsFromLocalStorage();
});

function saveAudioPreset(presetName) {
  const settings = {
    saws: $("#oscillators").val(),
    detune: $("#detune").val(),
    attack: $("#amp-attack").val(),
    decay: $("#amp-decay").val(),
    sustain: $("#amp-sustain").val(),
    release: $("#amp-release").val(),
    waveType: $("#wave-type-osc").val(),
    lfoWaveform1: $("#lfo-waveform-select1-f1").val(),
    lfoRate1: $("#lfo-rate").val(),
    lfoDepth1: $("#lfo-depth").val(),
    filterFrequency1: $("#filter-frequency").val(),
    filterQ1: $("#filter-resonance").val(),
    filterGain1: $("#filter-gain").val(),
    filterType1: $("#filter-one-type-control-f1").val(),
    delayTime: $("#delay-time").val(),
    delayFeedback: $("#delay-feedback").val(),
    delayWetLevel: $("#delay-wet").val(),
    delayCutoff: $("#delay-frequency").val(),
    expanderFeedback: $("#expander-feedback").val(),
    expanderWetLevel: $("#expander-wet").val(),
    expanderDelay: $("#expander-space-time").val(),
    eqLowFreq: $("#low-frequency").val(),
    eqMidFreq: $("#mid-frequency").val(),
    eqHighFreq: $("#high-frequency").val(),
    eqLowGain: $("#low-gain").val(),
    eqMidGain: $("#mid-gain").val(),
    eqHighGain: $("#high-gain").val(),
    eqMidQ: $("#mid-peak").val(),
    // Add other audio settings here
  };

  localStorage.setItem(`audio_preset_${presetName}`, JSON.stringify(settings));
}

function loadAudioPreset(presetName) {
  const settings = JSON.parse(
    localStorage.getItem(`audio_preset_${presetName}`)
  );
  if (settings) {
    $("#oscillators").val(settings.saws).trigger("input");
    $("#detune").val(settings.detune).trigger("input");
    $("#amp-attack").val(settings.attack).trigger("input");
    $("#amp-decay").val(settings.decay).trigger("input");
    $("#amp-sustain").val(settings.sustain).trigger("input");
    $("#amp-release").val(settings.release).trigger("input");
    $("#wave-type-osc").val(settings.waveType).trigger("change");
    $("#lfo-waveform-select1-f1").val(settings.lfoWaveform1).trigger("change");
    $("#lfo-rate").val(settings.lfoRate1).trigger("input");
    $("#lfo-depth").val(settings.lfoDepth1).trigger("input");
    $("#filter-frequency").val(settings.filterFrequency1).trigger("input");
    $("#filter-resonance").val(settings.filterQ1).trigger("input");
    $("#filter-gain").val(settings.filterGain1).trigger("input");
    $("#filter-one-type-control-f1")
      .val(settings.filterType1)
      .trigger("change");
    $("#delay-time").val(settings.delayTime).trigger("input");
    $("#delay-feedback").val(settings.delayFeedback).trigger("input");
    $("#delay-wet").val(settings.delayWetLevel).trigger("input");
    $("#delay-frequency").val(settings.delayCutoff).trigger("input");
    $("#expander-feedback").val(settings.expanderFeedback).trigger("input");
    $("#expander-wet").val(settings.expanderWetLevel).trigger("input");
    $("#expander-space-time").val(settings.expanderDelay).trigger("input");
    $("#low-frequency").val(settings.eqLowFreq).trigger("input");
    $("#mid-frequency").val(settings.eqMidFreq).trigger("input");
    $("#high-frequency").val(settings.eqHighFreq).trigger("input");
    $("#low-gain").val(settings.eqLowGain).trigger("input");
    $("#mid-gain").val(settings.eqMidGain).trigger("input");
    $("#high-gain").val(settings.eqHighGain).trigger("input");
    $("#mid-peak").val(settings.eqMidQ).trigger("input");
    // Apply other audio settings here

    // Apply the loaded settings immediately
    applyAudioSettings();
  } else {
    alert("Audio preset not found.");
  }
}

function applyAudioSettings() {
  const saws = $("#oscillators").val();
  const detune = $("#detune").val();
  const attack = $("#amp-attack").val();
  const decay = $("#amp-decay").val();
  const sustain = $("#amp-sustain").val();
  const release = $("#amp-release").val();
  const waveType = $("#wave-type-osc").val();
  const lfoWaveform1 = $("#lfo-waveform-select1-f1").val();
  const lfoRate1 = $("#lfo-rate").val();
  const lfoDepth1 = $("#lfo-depth").val();
  const filterFrequency1 = $("#filter-frequency").val();
  const filterQ1 = $("#filter-resonance").val();
  const filterGain1 = $("#filter-gain").val();
  const filterType1 = $("#filter-one-type-control-f1").val();
  const delayTime = $("#delay-time").val();
  const delayFeedback = $("#delay-feedback").val();
  const delayWetLevel = $("#delay-wet").val();
  const delayCutoff = $("#delay-frequency").val();
  const expanderFeedback = $("#expander-feedback").val();
  const expanderWetLevel = $("#expander-wet").val();
  const expanderDelay = $("#expander-space-time").val();
  const eqLowFreq = $("#low-frequency").val();
  const eqMidFreq = $("#mid-frequency").val();
  const eqHighFreq = $("#high-frequency").val();
  const eqLowGain = $("#low-gain").val();
  const eqMidGain = $("#mid-gain").val();
  const eqHighGain = $("#high-gain").val();
  const eqMidQ = $("#mid-peak").val();

  console.log(`Applied settings:
    Saws: ${saws},
    Detune: ${detune},
    Attack: ${attack},
    Decay: ${decay},
    Sustain: ${sustain},
    Release: ${release},
    Wave Type: ${waveType},
    LFO Waveform 1: ${lfoWaveform1},
    LFO Rate 1: ${lfoRate1},
    LFO Depth 1: ${lfoDepth1},
    Filter Frequency 1: ${filterFrequency1},
    Filter Q 1: ${filterQ1},
    Filter Gain 1: ${filterGain1},
    Filter Type 1: ${filterType1},
    Delay Time: ${delayTime},
    Delay Feedback: ${delayFeedback},
    Delay Wet Level: ${delayWetLevel},
    Delay Cutoff: ${delayCutoff},
    Expander Feedback: ${expanderFeedback},
    Expander Wet Level: ${expanderWetLevel},
    Expander Delay: ${expanderDelay},
    EQ Low Frequency: ${eqLowFreq},
    EQ Mid Frequency: ${eqMidFreq},
    EQ High Frequency: ${eqHighFreq},
    EQ Low Gain: ${eqLowGain},
    EQ Mid Gain: ${eqMidGain},
    EQ High Gain: ${eqHighGain},
    EQ Mid Q: ${eqMidQ}`);
}

function populateAudioPresetList() {
  const presetList = $("#audio-preset-list");
  presetList.empty();
  presetList.append('<option value="">Select an audio preset</option>');

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("audio_preset_")) {
      const presetName = key.replace("audio_preset_", "");
      presetList.append(`<option value="${presetName}">${presetName}</option>`);
    }
  }
}

function retrieveAudioParamsFromLocalStorage() {
  // Retrieve and set slider values
  $('input[type="range"]').each(function () {
    const id = this.id;
    const savedValue = localStorage.getItem(id);
    if (savedValue) {
      $(this).val(savedValue);
      $(this).trigger("input"); // Trigger the input event to update the UI
    }
  });

  // Retrieve and set select values
  $("select").each(function () {
    const id = this.id;
    const savedValue = localStorage.getItem(id);
    if (savedValue) {
      $(this).val(savedValue);
      $(this).trigger("change"); // Trigger the change event to update the UI
    }
  });
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("openModalBtn");

// Get the <span> element that closes the modal
var span = document.getElementById("closeModalBtn");

// Get the button inside the modal that closes the modal
var closeBtnInside = document.getElementById("closeBtnInside");

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks the button inside the modal, close the modal
closeBtnInside.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

//speech recognition =========================================
document.addEventListener("DOMContentLoaded", function () {
  var startButton = document.getElementById("start-recognition");
  var stopButton = document.getElementById("stop-recognition");
  var recognition;
  var isRecognizing = false;

  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function () {
      console.log("Speech recognition started");
      isRecognizing = true;
      startButton.disabled = true;
      stopButton.disabled = false;
      speak("Hello");
    };

    recognition.onresult = function (event) {
      var transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log("You said: ", transcript);
      processVoiceCommand(convertWordsToNumbers(transcript.toLowerCase()));
    };

    recognition.onerror = function (event) {
      console.error("Speech recognition error", event);
      speak("Oops, something went wrong. Please try again.");
    };

    recognition.onend = function () {
      console.log("Speech recognition ended");
      isRecognizing = false;
      startButton.disabled = false;
      stopButton.disabled = true;
      speak("Goodbye, See you soon");
    };
  } else {
    console.log("Speech recognition not supported in this browser.");
  }

  startButton.addEventListener("click", function () {
    if (!isRecognizing) {
      recognition.start();
    }
  });

  stopButton.addEventListener("click", function () {
    if (isRecognizing) {
      recognition.stop();
    }
  });

  // Add keyboard event listeners for starting and stopping recognition
  document.addEventListener("keydown", function (event) {
    if (event.key === ",") {
      if (!isRecognizing) {
        recognition.start();
      }
    } else if (event.key === ".") {
      if (isRecognizing) {
        recognition.stop();
      }
    }
  });

  // function speak(text) {
  //   const utterance = createUtterance(text);
  //   window.speechSynthesis.speak(utterance);
  // }

  function convertWordsToNumbers(command) {
    const wordsToNumbers = {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
    };

    command = command.replace(/\b(to)\b/gi, "2");

    command = command.replace(/\b(minus|negative)\b\s*/gi, "-");

    command = command.replace(/\b(sore|soar|so)\b/gi, "saw");

    command = command.replace(
      /\b(the tune|d tune|did tune|d-tune|d tuned)\b/gi,
      "detune"
    );

    command = command.replace(/\b(space-time)\b/gi, "space time");

    command = command.replace(/\b(low-cut|loca|local)\b/gi, "low cut");

    command = command.replace(/\b(filled|tilter|kilter)\b/gi, "filter");

    command = command.replace(/\b(released)\b/gi, "release");

    command = command.replace(/\b(hi)\b/gi, "high");
    command = command.replace(/\b(for)\b/gi, "four");

    const numberPattern =
      /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/gi;
    return command.replace(numberPattern, function (match) {
      return wordsToNumbers[match];
    });
  }

  function updateLocalStorage(sliderId, value) {
    localStorage.setItem(sliderId, value);
  }

  function processVoiceCommand(command) {
    // Parse and process the commands
    console.log("Received command:", command);

    if (command.includes("jihdfjhadfhalshoakldfdskhsd")) {
      speak("");

      //get slider range and combo choices
    } else if (command.includes("dimension wet range")) {
      speak("wet range is 0.00 to 1.00");
    } else if (command.includes("dimension feedback range")) {
      speak("feedback range is 0.00 to 0.45");
    } else if (command.includes("dimension space time range")) {
      speak("space time range is 0 to 100");
    } else if (command.includes("delay wet range")) {
      speak("wet range is 0.00 to 1.00");
    } else if (command.includes("delay feedback range")) {
      speak("feedback range is 0.00 to 0.80");
    } else if (command.includes("delay time range")) {
      speak("time range is 0.00 to 1.00");
    } else if (command.includes("delay low cut range")) {
      speak("low cut range is 20Hz to 20000Hz");
    } else if (command.includes("oscillator waveform list")) {
      speak("Waveforms are: Square, Saw and Triangle");
    } else if (command.includes("oscillators range")) {
      speak("Oscillators amount range is 2 to 16");
    } else if (command.includes("detune range")) {
      speak("De-tune range is 0 to 100");
    } else if (command.includes("attack range")) {
      speak("range is 0.00 to 1.00");
    } else if (command.includes("decay range")) {
      speak("range is 0.00 to 1.00");
    } else if (command.includes("sustain range")) {
      speak("range is 0.00 to 1.00");
    } else if (command.includes("release range")) {
      speak("range is 0.00 to 1.00");
    } else if (command.includes("lfo waveform list")) {
      speak("Waveforms are: Sine, Square, Saw, and Triangle.");
    } else if (command.includes("lfo depth range")) {
      speak("Depth range is minus 2000 to plus 2000.");
    } else if (command.includes("lfo rate range")) {
      speak("Rate range is 0 to 30.");
    } else if (command.includes("filter type list")) {
      speak(
        "Filter types are: Low-Pass, High-Pass, Band-pass, Notch and All-pass"
      );
    } else if (command.includes("filter gain range")) {
      speak("gain range is 0.00 to 1.00");
    } else if (command.includes("filter frequency range")) {
      speak("cut off range is 20Hz to 20000Hz");
    } else if (command.includes("filter resonance range")) {
      speak("range is 0 to 40");
    } else if (command.includes("low frequency range")) {
      speak("range is 20Hz to 20000Hz");
    } else if (command.includes("low gain range")) {
      speak("range is -40dB to 40dB");
    } else if (command.includes("mid frequency range")) {
      speak("range is 20Hz to 20000Hz");
    } else if (command.includes("mid gain range")) {
      speak("range is -40dB to 40dB");
    } else if (command.includes("mid peak range")) {
      speak("range is 1 to 10");
    } else if (command.includes("high frequency range")) {
      speak("range is 20Hz to 20000Hz");
    } else if (command.includes("high gain range")) {
      speak("range is -40dB to 40Db");

      // Speak current value commands
    } else if (command.includes("current dimension wet")) {
      var wetInput = document.getElementById("expander-wet");
      speak("Dimension wet value is " + wetInput.value);
    } else if (command.includes("current dimension feedback")) {
      var feedbackInput = document.getElementById("expander-feedback");
      speak("Dimension feedback value is " + feedbackInput.value);
    } else if (command.includes("current dimension space time")) {
      var delayInput = document.getElementById("expander-space-time");
      speak("Dimension space time value is " + delayInput.value);
    } else if (command.includes("current delay wet")) {
      var delayWet = document.getElementById("delay-wet");
      speak("Delay wet value is" + delayWet.value);
    } else if (command.includes("current delay feedback")) {
      var delayFeedback = document.getElementById("delay-feedback");
      speak("Delay feeback value is" + delayFeedback.value);
    } else if (command.includes("current delay time")) {
      var delayTime = document.getElementById("delay-time");
      speak("Delay time value is" + delayTime.value);
    } else if (command.includes("current delay low cut")) {
      var delayCut = document.getElementById("delay-frequency");
      speak("Delay low cut value is" + delayCut.value);
    } else if (command.includes("current waveform")) {
      var waveTypeInput = document.getElementById("wave-type-osc");
      var waveType = waveTypeInput.options[waveTypeInput.selectedIndex].text;
      speak("Waveform is " + waveType);
    } else if (command.includes("current oscillators")) {
      var oscillators = document.getElementById("oscillators");
      speak("Number of oscillators is" + oscillators.value);
    } else if (command.includes("current detune")) {
      var detune = document.getElementById("detune");
      speak("De-tune value is" + detune.value);
    } else if (command.includes("current attack")) {
      var attack = document.getElementById("amp-attack");
      speak("Attack value is" + attack.value);
    } else if (command.includes("current decay")) {
      var decay = document.getElementById("amp-decay");
      speak("Decay value is" + decay.value);
    } else if (command.includes("current sustain")) {
      var sustain = document.getElementById("amp-sustain");
      speak("Sustain value is" + sustain.value);
    } else if (command.includes("current release")) {
      var release = document.getElementById("amp-release");
      speak("Release value is" + release.value);
    } else if (command.includes("current lfo waveform")) {
      var lfoWaveformInput = document.getElementById("lfo-waveform-select1-f1");
      var lfoWaveform =
        lfoWaveformInput.options[lfoWaveformInput.selectedIndex].text;
      speak("LFO waveform is " + lfoWaveform);
    } else if (command.includes("current lfo depth")) {
      var lfoDepth = document.getElementById("lfo-depth");
      speak("LFO depth is " + lfoDepth.value);
    } else if (command.includes("current lfo rate")) {
      var lfoRate = document.getElementById("lfo-rate");
      speak("LFO rate value is " + lfoRate.value);
    } else if (command.includes("current filter type")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      var filterType =
        filterTypeInput.options[filterTypeInput.selectedIndex].text;
      speak("Filter type is " + filterType);
    } else if (command.includes("current filter gain")) {
      var filterGain = document.getElementById("filter-gain");
      speak("Filter gain value is" + filterGain.value);
    } else if (command.includes("current filter frequency")) {
      var cutOff = document.getElementById("filter-frequency");
      speak("Filter cut off value is" + cutOff.value);
    } else if (command.includes("current filter resonance")) {
      var resonance = document.getElementById("filter-resonance");
      speak("Resonance value is" + resonance.value);
    } else if (command.includes("current low frequency")) {
      var lowFreq = document.getElementById("low-frequency");
      speak("Low Frequency value is" + lowFreq.value);
    } else if (command.includes("current low gain")) {
      var lowGain = document.getElementById("low-gain");
      speak("Low Gain value is" + lowGain.value);
    } else if (command.includes("current mid frequency")) {
      var midFreq = document.getElementById("mid-frequency");
      speak("Mid Frequency value is" + midFreq.value);
    } else if (command.includes("current mid gain")) {
      var lowFreq = document.getElementById("mid-gain");
      speak("Mid Gain value is" + lowFreq.value);
    } else if (command.includes("current mid peak")) {
      var midPeak = document.getElementById("mid-peak");
      speak("Mid Peak value is" + midPeak.value);
    } else if (command.includes("current high frequency")) {
      var highFreq = document.getElementById("high-frequency");
      speak("High Frequency value is" + highFreq.value);
    } else if (command.includes("current high gain")) {
      var highGain = document.getElementById("high-gain");
      speak("High Gain value is" + highGain.value);

      //low freq
    } else if (command.match(/set low frequency ([\d,]+)/)) {
      var lowFreqInput = document.getElementById("low-frequency");
      var match = command.match(/set low frequency ([\d,]+)/);
      if (match && match[1]) {
        var newLowFreqValueStr = match[1].replace(/,/g, "");
        var newLowFreqValue = parseInt(newLowFreqValueStr, 10);
        if (newLowFreqValue < 20 || newLowFreqValue > 20000) {
          speak("Invalid value. Low frequency range is 20 to 20000.");
        } else {
          lowFreqInput.value = newLowFreqValue;
          lowFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-frequency", newLowFreqValue);
          speak("Low frequency set to " + lowFreqInput.value);
        }
      }
    } else if (command.match(/low frequency up ([\d,]+)/)) {
      var lowFreqInput = document.getElementById("low-frequency");
      var match = command.match(/low frequency up ([\d,]+)/);
      if (match && match[1]) {
        var incrementValueStr = match[1].replace(/,/g, "");
        var incrementValue = parseInt(incrementValueStr, 10);
        var currentLowFreqValue = parseInt(lowFreqInput.value, 10);
        var newLowFreqValue = currentLowFreqValue + incrementValue;
        if (newLowFreqValue > 20000) {
          speak("Value exceeds maximum. Low frequency range is 20 to 20000.");
        } else {
          lowFreqInput.value = newLowFreqValue;
          lowFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-frequency", newLowFreqValue);
          speak(
            "Low frequency increased by " +
              incrementValue +
              ". New value is " +
              lowFreqInput.value
          );
        }
      }
    } else if (command.match(/low frequency down ([\d,]+)/)) {
      var lowFreqInput = document.getElementById("low-frequency");
      var match = command.match(/low frequency down ([\d,]+)/);
      if (match && match[1]) {
        var decrementValueStr = match[1].replace(/,/g, "");
        var decrementValue = parseInt(decrementValueStr, 10);
        var currentLowFreqValue = parseInt(lowFreqInput.value, 10);
        var newLowFreqValue = currentLowFreqValue - decrementValue;
        if (newLowFreqValue < 20) {
          speak("Value is below minimum. Low frequency range is 20 to 20000.");
        } else {
          lowFreqInput.value = newLowFreqValue;
          lowFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-frequency", newLowFreqValue);
          speak(
            "Low frequency decreased by " +
              decrementValue +
              ". New value is " +
              lowFreqInput.value
          );
        }
      }

      // Low Gain
    } else if (command.match(/set low gain (-?\d+)/)) {
      var lowGainInput = document.getElementById("low-gain");
      var match = command.match(/set low gain (-?\d+)/);
      if (match && match[1]) {
        var newLowGainValue = parseInt(match[1], 10);
        if (newLowGainValue < -40 || newLowGainValue > 40) {
          speak("Invalid value. Low gain range is -40 to 40.");
        } else {
          lowGainInput.value = newLowGainValue;
          lowGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-gain", newLowGainValue);
          speak("Low gain set to " + lowGainInput.value);
        }
      }
    } else if (command.match(/low gain up (\d+)/)) {
      var lowGainInput = document.getElementById("low-gain");
      var match = command.match(/low gain up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentLowGainValue = parseInt(lowGainInput.value, 10);
        var newLowGainValue = currentLowGainValue + incrementValue;
        if (newLowGainValue > 40) {
          speak("Value exceeds maximum. Low gain range is -40 to 40.");
        } else {
          lowGainInput.value = newLowGainValue;
          lowGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-gain", newLowGainValue);
          speak(
            "Low gain increased by " +
              incrementValue +
              ". New value is " +
              lowGainInput.value
          );
        }
      }
    } else if (command.match(/low gain down (\d+)/)) {
      var lowGainInput = document.getElementById("low-gain");
      var match = command.match(/low gain down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentLowGainValue = parseInt(lowGainInput.value, 10);
        var newLowGainValue = currentLowGainValue - decrementValue;
        if (newLowGainValue < -40) {
          speak("Value is below minimum. Low gain range is -40 to 40.");
        } else {
          lowGainInput.value = newLowGainValue;
          lowGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-gain", newLowGainValue);
          speak(
            "Low gain decreased by " +
              decrementValue +
              ". New value is " +
              lowGainInput.value
          );
        }
      }

      // Mid Frequency
    } else if (command.match(/set mid frequency ([\d,]+)/)) {
      var midFreqInput = document.getElementById("mid-frequency");
      var match = command.match(/set mid frequency ([\d,]+)/);
      if (match && match[1]) {
        var newMidFreqValueStr = match[1].replace(/,/g, "");
        var newMidFreqValue = parseInt(newMidFreqValueStr, 10);
        if (newMidFreqValue < 20 || newMidFreqValue > 20000) {
          speak("Invalid value. Mid frequency range is 20 to 20000.");
        } else {
          midFreqInput.value = newMidFreqValue;
          midFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-frequency", newMidFreqValue);
          speak("Mid frequency set to " + midFreqInput.value);
        }
      }
    } else if (command.match(/mid frequency up ([\d,]+)/)) {
      var midFreqInput = document.getElementById("mid-frequency");
      var match = command.match(/mid frequency up ([\d,]+)/);
      if (match && match[1]) {
        var incrementValueStr = match[1].replace(/,/g, "");
        var incrementValue = parseInt(incrementValueStr, 10);
        var currentMidFreqValue = parseInt(midFreqInput.value, 10);
        var newMidFreqValue = currentMidFreqValue + incrementValue;
        if (newMidFreqValue > 20000) {
          speak("Value exceeds maximum. Mid frequency range is 20 to 20000.");
        } else {
          midFreqInput.value = newMidFreqValue;
          midFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-frequency", newMidFreqValue);
          speak(
            "Mid frequency increased by " +
              incrementValue +
              ". New value is " +
              midFreqInput.value
          );
        }
      }
    } else if (command.match(/mid frequency down ([\d,]+)/)) {
      var midFreqInput = document.getElementById("mid-frequency");
      var match = command.match(/mid frequency down ([\d,]+)/);
      if (match && match[1]) {
        var decrementValueStr = match[1].replace(/,/g, "");
        var decrementValue = parseInt(decrementValueStr, 10);
        var currentMidFreqValue = parseInt(midFreqInput.value, 10);
        var newMidFreqValue = currentMidFreqValue - decrementValue;
        if (newMidFreqValue < 20) {
          speak("Value is below minimum. Mid frequency range is 20 to 20000.");
        } else {
          midFreqInput.value = newMidFreqValue;
          midFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-frequency", newMidFreqValue);
          speak(
            "Mid frequency decreased by " +
              decrementValue +
              ". New value is " +
              midFreqInput.value
          );
        }
      }

      // Mid Gain
    } else if (command.match(/set mid gain (-?\d+)/)) {
      var midGainInput = document.getElementById("mid-gain");
      var match = command.match(/set mid gain (-?\d+)/);
      if (match && match[1]) {
        var newMidGainValue = parseInt(match[1], 10);
        if (newMidGainValue < -40 || newMidGainValue > 40) {
          speak("Invalid value. Mid gain range is -40 to 40.");
        } else {
          midGainInput.value = newMidGainValue;
          midGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-gain", newMidGainValue);
          speak("Mid gain set to " + midGainInput.value);
        }
      }
    } else if (command.match(/mid gain up (-?\d+)/)) {
      var midGainInput = document.getElementById("mid-gain");
      var match = command.match(/mid gain up (-?\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentMidGainValue = parseInt(midGainInput.value, 10);
        var newMidGainValue = currentMidGainValue + incrementValue;
        if (newMidGainValue > 40) {
          speak("Value exceeds maximum. Mid gain range is -40 to 40.");
        } else {
          midGainInput.value = newMidGainValue;
          midGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-gain", newMidGainValue);
          speak(
            "Mid gain increased by " +
              incrementValue +
              ". New value is " +
              midGainInput.value
          );
        }
      }
    } else if (command.match(/mid gain down (-?\d+)/)) {
      var midGainInput = document.getElementById("mid-gain");
      var match = command.match(/mid gain down (-?\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentMidGainValue = parseInt(midGainInput.value, 10);
        var newMidGainValue = currentMidGainValue - decrementValue;
        if (newMidGainValue < -40) {
          speak("Value is below minimum. Mid gain range is -40 to 40.");
        } else {
          midGainInput.value = newMidGainValue;
          midGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("mid-gain", newMidGainValue);
          speak(
            "Mid gain decreased by " +
              decrementValue +
              ". New value is " +
              midGainInput.value
          );
        }
      }

      // Mid Q Factor
    } else if (command.match(/set mid peak (\d+)/)) {
      var midQInput = document.getElementById("mid-peak");
      var match = command.match(/set mid peak (\d+)/);
      if (match && match[1]) {
        var newMidQValue = parseInt(match[1], 10);
        if (newMidQValue < 1 || newMidQValue > 10) {
          speak("Invalid value. Mid Peak range is 1 to 10.");
        } else {
          midQInput.value = newMidQValue;
          midQInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-q-slider", newMidQValue);
          speak("Mid Peak set to " + midQInput.value);
        }
      }
    } else if (command.match(/mid peak up (\d+)/)) {
      var midQInput = document.getElementById("mid-peak");
      var match = command.match(/mid peak up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentMidQValue = parseInt(midQInput.value, 10);
        var newMidQValue = currentMidQValue + incrementValue;
        if (newMidQValue > 10) {
          speak("Value exceeds maximum. Mid Peak range is 1 to 10.");
        } else {
          midQInput.value = newMidQValue;
          midQInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-q-slider", newMidQValue);
          speak(
            "Mid Peak increased by " +
              incrementValue +
              ". New value is " +
              midQInput.value
          );
        }
      }
    } else if (command.match(/mid peak down (\d+)/)) {
      var midQInput = document.getElementById("mid-peak");
      var match = command.match(/mid peak down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentMidQValue = parseInt(midQInput.value, 10);
        var newMidQValue = currentMidQValue - decrementValue;
        if (newMidQValue < 1) {
          speak("Value is below minimum. Mid Peak range is 1 to 10.");
        } else {
          midQInput.value = newMidQValue;
          midQInput.dispatchEvent(new Event("input"));
          updateLocalStorage("low-q-slider", newMidQValue);
          speak(
            "Mid Peak decreased by " +
              decrementValue +
              ". New value is " +
              midQInput.value
          );
        }
      }

      // High Frequency
    } else if (command.match(/set high frequency ([\d,]+)/)) {
      var highFreqInput = document.getElementById("high-frequency");
      var match = command.match(/set high frequency ([\d,]+)/);
      if (match && match[1]) {
        var newHighFreqValueStr = match[1].replace(/,/g, "");
        var newHighFreqValue = parseInt(newHighFreqValueStr, 10);
        if (newHighFreqValue < 20 || newHighFreqValue > 20000) {
          speak("Invalid value. High frequency range is 20 to 20000.");
        } else {
          highFreqInput.value = newHighFreqValue;
          highFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-frequency", newHighFreqValue);
          speak("High frequency set to " + highFreqInput.value);
        }
      }
    } else if (command.match(/high frequency up ([\d,]+)/)) {
      var highFreqInput = document.getElementById("high-frequency");
      var match = command.match(/high frequency up ([\d,]+)/);
      if (match && match[1]) {
        var incrementValueStr = match[1].replace(/,/g, "");
        var incrementValue = parseInt(incrementValueStr, 10);
        var currentHighFreqValue = parseInt(highFreqInput.value, 10);
        var newHighFreqValue = currentHighFreqValue + incrementValue;
        if (newHighFreqValue > 20000) {
          speak("Value exceeds maximum. High frequency range is 20 to 20000.");
        } else {
          highFreqInput.value = newHighFreqValue;
          highFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-frequency", newHighFreqValue);
          speak(
            "High frequency increased by " +
              incrementValue +
              ". New value is " +
              highFreqInput.value
          );
        }
      }
    } else if (command.match(/high frequency down ([\d,]+)/)) {
      var highFreqInput = document.getElementById("high-frequency");
      var match = command.match(/high frequency down ([\d,]+)/);
      if (match && match[1]) {
        var decrementValueStr = match[1].replace(/,/g, "");
        var decrementValue = parseInt(decrementValueStr, 10);
        var currentHighFreqValue = parseInt(highFreqInput.value, 10);
        var newHighFreqValue = currentHighFreqValue - decrementValue;
        if (newHighFreqValue < 20) {
          speak("Value is below minimum. High frequency range is 20 to 20000.");
        } else {
          highFreqInput.value = newHighFreqValue;
          highFreqInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-frequency", newHighFreqValue);
          speak(
            "High frequency decreased by " +
              decrementValue +
              ". New value is " +
              highFreqInput.value
          );
        }
      }

      // High Gain
    } else if (command.match(/set high gain (-?\d+)/)) {
      var highGainInput = document.getElementById("high-gain");
      var match = command.match(/set high gain (-?\d+)/);
      if (match && match[1]) {
        var newHighGainValue = parseInt(match[1], 10);
        if (newHighGainValue < -40 || newHighGainValue > 40) {
          speak("Invalid value. High gain range is -40 to 40.");
        } else {
          highGainInput.value = newHighGainValue;
          highGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-gain", newHighGainValue);
          speak("High gain set to " + highGainInput.value);
        }
      }
    } else if (command.match(/high gain up (-?\d+)/)) {
      var highGainInput = document.getElementById("high-gain");
      var match = command.match(/high gain up (-?\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentHighGainValue = parseInt(highGainInput.value, 10);
        var newHighGainValue = currentHighGainValue + incrementValue;
        if (newHighGainValue > 40) {
          speak("Value exceeds maximum. High gain range is -40 to 40.");
        } else {
          highGainInput.value = newHighGainValue;
          highGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-gain", newHighGainValue);
          speak(
            "High gain increased by " +
              incrementValue +
              ". New value is " +
              highGainInput.value
          );
        }
      }
    } else if (command.match(/high gain down (-?\d+)/)) {
      var highGainInput = document.getElementById("high-gain");
      var match = command.match(/high gain down (-?\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentHighGainValue = parseInt(highGainInput.value, 10);
        var newHighGainValue = currentHighGainValue - decrementValue;
        if (newHighGainValue < -40) {
          speak("Value is below minimum. High gain range is -40 to 40.");
        } else {
          highGainInput.value = newHighGainValue;
          highGainInput.dispatchEvent(new Event("input"));
          updateLocalStorage("high-gain", newHighGainValue);
          speak(
            "High gain decreased by " +
              decrementValue +
              ". New value is " +
              highGainInput.value
          );
        }
      }

      // FX Module commands
      // Dimension Expander Wet/Dry
    } else if (command.match(/set dimension wet (\d+)/)) {
      var wetInput = document.getElementById("expander-wet");
      var match = command.match(/set dimension wet (\d+)/);
      if (match && match[1]) {
        var newWetValue = parseInt(match[1], 10);
        if (newWetValue < 0 || newWetValue > 100) {
          speak(
            "Invalid dimension wet value. Please provide a value between 0 and 100."
          );
        } else {
          wetInput.value = Math.min(Math.max(newWetValue, 0), 100);
          wetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-wet", newWetValue);
          speak("Dimension wet set to " + wetInput.value);
        }
      }
    } else if (command.match(/dimension wet up (\d+)/)) {
      var wetInput = document.getElementById("expander-wet");
      var match = command.match(/dimension wet up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentWetValue = parseInt(wetInput.value, 10);
        var newWetValue = currentWetValue + incrementValue;
        if (newWetValue > 100) {
          speak("Value exceeds maximum. Dimension wet range is 0 to 100.");
        } else {
          wetInput.value = newWetValue;
          wetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-wet", newWetValue);
          speak(
            "Dimension wet increased by " +
              incrementValue +
              ". New value is " +
              wetInput.value
          );
        }
      }
    } else if (command.match(/dimension wet down (\d+)/)) {
      var wetInput = document.getElementById("expander-wet");
      var match = command.match(/dimension wet down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentWetValue = parseInt(wetInput.value, 10);
        var newWetValue = currentWetValue - decrementValue;
        if (newWetValue < 0) {
          speak("Value is below minimum. Dimension wet range is 0 to 100.");
        } else {
          wetInput.value = newWetValue;
          wetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-wet", newWetValue);
          speak(
            "Dimension wet decreased by " +
              decrementValue +
              ". New value is " +
              wetInput.value
          );
        }
      }

      // Dimension Expander Feedback
    } else if (command.match(/set dimension feedback (\d+)/)) {
      var feedbackInput = document.getElementById("expander-feedback");
      var match = command.match(/set dimension feedback (\d+)/);
      if (match && match[1]) {
        var newFeedbackValue = parseInt(match[1], 10);
        if (newFeedbackValue < 0 || newFeedbackValue > 45) {
          speak(
            "Invalid dimension feedback value. Please provide a value between 0 and 45."
          );
        } else {
          feedbackInput.value = Math.min(Math.max(newFeedbackValue, 0), 45);
          feedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-feedback", newFeedbackValue);
          speak("Dimension feedback set to " + feedbackInput.value);
        }
      }
    } else if (command.match(/dimension feedback up (\d+)/)) {
      var feedbackInput = document.getElementById("expander-feedback");
      var match = command.match(/dimension feedback up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentFeedbackValue = parseInt(feedbackInput.value, 10);
        var newFeedbackValue = currentFeedbackValue + incrementValue;
        if (newFeedbackValue > 45) {
          speak("Value exceeds maximum. Dimension feedback range is 0 to 45.");
        } else {
          feedbackInput.value = newFeedbackValue;
          feedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-feedback", newFeedbackValue);
          speak(
            "Dimension feedback increased by " +
              incrementValue +
              ". New value is " +
              feedbackInput.value
          );
        }
      }
    } else if (command.match(/dimension feedback down (\d+)/)) {
      var feedbackInput = document.getElementById("expander-feedback");
      var match = command.match(/dimension feedback down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentFeedbackValue = parseInt(feedbackInput.value, 10);
        var newFeedbackValue = currentFeedbackValue - decrementValue;
        if (newFeedbackValue < 0) {
          speak("Value is below minimum. Dimension feedback range is 0 to 45.");
        } else {
          feedbackInput.value = newFeedbackValue;
          feedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-feedback", newFeedbackValue);
          speak(
            "Dimension feedback decreased by " +
              decrementValue +
              ". New value is " +
              feedbackInput.value
          );
        }
      }

      // Dimension Expander Space Time
    } else if (command.match(/set dimension space time (\d+)/)) {
      var delayInput = document.getElementById("expander-space-time");
      var match = command.match(/set dimension space time (\d+)/);
      if (match && match[1]) {
        var newDelayValue = parseInt(match[1], 10);
        if (newDelayValue < 0 || newDelayValue > 100) {
          speak(
            "Invalid dimension space time value. Please provide a value between 0 and 100."
          );
        } else {
          delayInput.value = Math.min(Math.max(newDelayValue, 0), 100);
          delayInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-space-time", newDelayValue);
          speak("Dimension space time set to " + delayInput.value);
        }
      }
    } else if (command.match(/dimension space time up (\d+)/)) {
      var delayInput = document.getElementById("expander-space-time");
      var match = command.match(/dimension space time up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentDelayValue = parseInt(delayInput.value, 10);
        var newDelayValue = currentDelayValue + incrementValue;
        if (newDelayValue > 100) {
          speak(
            "Value exceeds maximum. Dimension space time range is 0 to 100."
          );
        } else {
          delayInput.value = newDelayValue;
          delayInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-space-time", newDelayValue);
          speak(
            "Dimension space time increased by " +
              incrementValue +
              ". New value is " +
              delayInput.value
          );
        }
      }
    } else if (command.match(/dimension space time down (\d+)/)) {
      var delayInput = document.getElementById("expander-space-time");
      var match = command.match(/dimension space time down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentDelayValue = parseInt(delayInput.value, 10);
        var newDelayValue = currentDelayValue - decrementValue;
        if (newDelayValue < 0) {
          speak(
            "Value is below minimum. Dimension space time range is 0 to 100."
          );
        } else {
          delayInput.value = newDelayValue;
          delayInput.dispatchEvent(new Event("input"));
          updateLocalStorage("expander-space-time", newDelayValue);
          speak(
            "Dimension space time decreased by " +
              decrementValue +
              ". New value is " +
              delayInput.value
          );
        }
      }

      // Delay Wet/Dry
    } else if (command.match(/set delay wet (\d+(\.\d+)?)/)) {
      var delayWetInput = document.getElementById("delay-wet");
      var match = command.match(/set delay wet (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newDelayWetValue = parseInt(match[1], 10);
        if (newDelayWetValue < 0 || newDelayWetValue > 100) {
          speak(
            "Invalid delay wet value. Please provide a value between 0 and 100."
          );
        } else {
          delayWetInput.value = Math.min(Math.max(newDelayWetValue, 0), 100);
          delayWetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-wet", newDelayWetValue);
          speak("Delay wet set to " + delayWetInput.value);
        }
      }
    } else if (command.match(/delay wet up (\d+)/)) {
      var delayWetInput = document.getElementById("delay-wet");
      var match = command.match(/delay wet up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentDelayWetValue = parseFloat(delayWetInput.value);
        var newDelayWetValue = currentDelayWetValue + incrementValue;
        if (newDelayWetValue > 100) {
          speak("Value exceeds maximum. Delay wet range is 0 to 100.");
        } else {
          delayWetInput.value = newDelayWetValue;
          delayWetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-wet", newDelayWetValue);
          speak(
            "Delay wet increased by " +
              incrementValue +
              ". New value is " +
              delayWetInput.value
          );
        }
      }
    } else if (command.match(/delay wet down (\d+)/)) {
      var delayWetInput = document.getElementById("delay-wet");
      var match = command.match(/delay wet down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentDelayWetValue = parseFloat(delayWetInput.value);
        var newDelayWetValue = currentDelayWetValue - decrementValue;
        if (newDelayWetValue < 0) {
          speak("Value is below minimum. Delay wet range is 0 to 100.");
        } else {
          delayWetInput.value = newDelayWetValue;
          delayWetInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-wet", newDelayWetValue);
          speak(
            "Delay wet decreased by " +
              decrementValue +
              ". New value is " +
              delayWetInput.value
          );
        }
      }

      // Delay Feedback
    } else if (command.match(/set delay feedback (\d+)/)) {
      var delayFeedbackInput = document.getElementById("delay-feedback");
      var match = command.match(/set delay feedback (\d+)/);
      if (match && match[1]) {
        var newDelayFeedbackValue = parseInt(match[1], 10);
        if (newDelayFeedbackValue < 0 || newDelayFeedbackValue > 100) {
          speak(
            "Invalid delay feedback value. Please provide a value between 0 and 100."
          );
        } else {
          delayFeedbackInput.value = Math.min(
            Math.max(newDelayFeedbackValue, 0),
            100
          );
          delayFeedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-feedback", newDelayFeedbackValue);
          speak("Delay feedback set to " + delayFeedbackInput.value);
        }
      }
    } else if (command.match(/delay feedback up (\d+)/)) {
      var delayFeedbackInput = document.getElementById("delay-feedback");
      var match = command.match(/delay feedback up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentDelayFeedbackValue = parseInt(delayFeedbackInput.value, 10);
        var newDelayFeedbackValue = currentDelayFeedbackValue + incrementValue;
        if (newDelayFeedbackValue > 100) {
          speak("Value exceeds maximum. Delay feedback range is 0 to 100.");
        } else {
          delayFeedbackInput.value = newDelayFeedbackValue;
          delayFeedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-feedback", newDelayFeedbackValue);
          speak(
            "Delay feedback increased by " +
              incrementValue +
              ". New value is " +
              delayFeedbackInput.value
          );
        }
      }
    } else if (command.match(/delay feedback down (\d+)/)) {
      var delayFeedbackInput = document.getElementById("delay-feedback");
      var match = command.match(/delay feedback down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentDelayFeedbackValue = parseInt(delayFeedbackInput.value, 10);
        var newDelayFeedbackValue = currentDelayFeedbackValue - decrementValue;
        if (newDelayFeedbackValue < 0) {
          speak("Value is below minimum. Delay feedback range is 0 to 100.");
        } else {
          delayFeedbackInput.value = newDelayFeedbackValue;
          delayFeedbackInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-feedback", newDelayFeedbackValue);
          speak(
            "Delay feedback decreased by " +
              decrementValue +
              ". New value is " +
              delayFeedbackInput.value
          );
        }
      }

      // Delay Time
    } else if (command.match(/set delay time (\d+(\.\d+)?)/)) {
      var delayTimeInput = document.getElementById("delay-time");
      var match = command.match(/set delay time (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newDelayTimeValue = parseInt(match[1], 10);
        if (newDelayTimeValue < 0 || newDelayTimeValue > 100) {
          speak(
            "Invalid delay time value. Please provide a value between 0 and 100."
          );
        } else {
          delayTimeInput.value = Math.min(Math.max(newDelayTimeValue, 0), 100);
          delayTimeInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-time", newDelayTimeValue);
          speak("Delay time set to " + delayTimeInput.value);
        }
      }
    } else if (command.match(/delay time up (\d+)/)) {
      var delayTimeInput = document.getElementById("delay-time");
      var match = command.match(/delay time up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentDelayTimeValue = parseFloat(delayTimeInput.value);
        var newDelayTimeValue = currentDelayTimeValue + incrementValue;
        if (newDelayTimeValue > 100) {
          speak("Value exceeds maximum. Delay time range is 0 to 100.");
        } else {
          delayTimeInput.value = newDelayTimeValue;
          delayTimeInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-time", newDelayTimeValue);
          speak(
            "Delay time increased by " +
              incrementValue +
              ". New value is " +
              delayTimeInput.value
          );
        }
      }
    } else if (command.match(/delay time down (\d+)/)) {
      var delayTimeInput = document.getElementById("delay-time");
      var match = command.match(/delay time down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentDelayTimeValue = parseFloat(delayTimeInput.value);
        var newDelayTimeValue = currentDelayTimeValue - decrementValue;
        if (newDelayTimeValue < 0) {
          speak("Value is below minimum. Delay time range is 0 to 100.");
        } else {
          delayTimeInput.value = newDelayTimeValue;
          delayTimeInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-time", newDelayTimeValue);
          speak(
            "Delay time decreased by " +
              decrementValue +
              ". New value is " +
              delayTimeInput.value
          );
        }
      }

      // Delay Low Cut
    } else if (command.match(/set delay low cut ([\d,]+)/)) {
      var lowCutInput = document.getElementById("delay-frequency");
      var match = command.match(/set delay low cut ([\d,]+)/);
      if (match && match[1]) {
        var newLowCutValueStr = match[1].replace(/,/g, "");
        var newLowCutValue = parseInt(newLowCutValueStr, 10);
        if (newLowCutValue < 20 || newLowCutValue > 20000) {
          speak(
            "Invalid low cut frequency value. Please provide a value between 20Hz and 20000Hz."
          );
        } else {
          lowCutInput.value = Math.min(Math.max(newLowCutValue, 20), 20000);
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-frequency", newLowCutValue);
          speak("Low cut frequency set to " + lowCutInput.value);
        }
      }
    } else if (command.match(/delay low cut up ([\d,]+)/)) {
      var lowCutInput = document.getElementById("delay-frequency");
      var match = command.match(/delay low cut up ([\d,]+)/);
      if (match && match[1]) {
        var incrementValueStr = match[1].replace(/,/g, "");
        var incrementValue = parseInt(incrementValueStr, 10);
        var currentLowCutValue = parseInt(lowCutInput.value, 10);
        var newLowCutValue = currentLowCutValue + incrementValue;
        if (newLowCutValue > 20000) {
          speak(
            "Value exceeds maximum. Delay low cut range is 20Hz to 20000Hz."
          );
        } else {
          lowCutInput.value = newLowCutValue;
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-frequency", newLowCutValue);
          speak(
            "Delay low cut increased by " +
              incrementValue +
              ". New value is " +
              lowCutInput.value
          );
        }
      }
    } else if (command.match(/delay low cut down ([\d,]+)/)) {
      var lowCutInput = document.getElementById("delay-frequency");
      var match = command.match(/delay low cut down ([\d,]+)/);
      if (match && match[1]) {
        var decrementValueStr = match[1].replace(/,/g, "");
        var decrementValue = parseInt(decrementValueStr, 10);
        var currentLowCutValue = parseInt(lowCutInput.value, 10);
        var newLowCutValue = currentLowCutValue - decrementValue;
        if (newLowCutValue < 20) {
          speak(
            "Value is below minimum. Delay low cut range is 20Hz to 20000Hz."
          );
        } else {
          lowCutInput.value = newLowCutValue;
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("delay-frequency", newLowCutValue);
          speak(
            "Delay low cut decreased by " +
              decrementValue +
              ". New value is " +
              lowCutInput.value
          );
        }
      }

      // Detune
    } else if (command.match(/set detune (\d+)/)) {
      var detuneInput = document.getElementById("detune");
      var match = command.match(/set detune (\d+)/);
      if (match && match[1]) {
        var newDetuneValue = parseInt(match[1], 10);
        if (newDetuneValue < 0 || newDetuneValue > 100) {
          speak(
            "Invalid de-tune value. Please provide a value between 0 and 100."
          );
        } else {
          detuneInput.value = Math.min(Math.max(newDetuneValue, 0), 100);
          detuneInput.dispatchEvent(new Event("input"));
          updateLocalStorage("detune", newDetuneValue);
          speak("De-Tune set to " + detuneInput.value);
        }
      }
    } else if (command.match(/detune up (\d+)/)) {
      var detuneInput = document.getElementById("detune");
      var match = command.match(/detune up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentDetuneValue = parseInt(detuneInput.value, 10);
        var newDetuneValue = currentDetuneValue + incrementValue;
        if (newDetuneValue > 100) {
          speak("Value exceeds maximum. Detune range is 0 to 100.");
        } else {
          detuneInput.value = newDetuneValue;
          detuneInput.dispatchEvent(new Event("input"));
          updateLocalStorage("detune", newDetuneValue);
          speak(
            "Detune increased by " +
              incrementValue +
              ". New value is " +
              detuneInput.value
          );
        }
      }
    } else if (command.match(/detune down (\d+)/)) {
      var detuneInput = document.getElementById("detune");
      var match = command.match(/detune down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentDetuneValue = parseInt(detuneInput.value, 10);
        var newDetuneValue = currentDetuneValue - decrementValue;
        if (newDetuneValue < 0) {
          speak("Value is below minimum. Detune range is 0 to 100.");
        } else {
          detuneInput.value = newDetuneValue;
          detuneInput.dispatchEvent(new Event("input"));
          updateLocalStorage("detune", newDetuneValue);
          speak(
            "Detune decreased by " +
              decrementValue +
              ". New value is " +
              detuneInput.value
          );
        }
      }

      // Oscillator count commands
    } else if (command.match(/set oscillators (\d+)/)) {
      var oscCountInput = document.getElementById("oscillators");
      var match = command.match(/set oscillators (\d+)/);
      if (match && match[1]) {
        var newOscCountValue = parseInt(match[1], 10);
        if (newOscCountValue < 2 || newOscCountValue > 16) {
          speak(
            "Invalid oscillator count. Please provide a value between 2 and 16."
          );
        } else {
          oscCountInput.value = Math.min(Math.max(newOscCountValue, 2), 16);
          oscCountInput.dispatchEvent(new Event("input"));
          updateLocalStorage("oscillators", newOscCountValue);
          speak("Oscillator count set to " + oscCountInput.value);
        }
      }
    } else if (command.match(/oscillators up (\d+)/)) {
      var oscCountInput = document.getElementById("oscillators");
      var match = command.match(/oscillators up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentOscCountValue = parseInt(oscCountInput.value, 10);
        var newOscCountValue = currentOscCountValue + incrementValue;
        if (newOscCountValue > 16) {
          speak("Value exceeds maximum. Oscillator count range is 2 to 16.");
        } else {
          oscCountInput.value = newOscCountValue;
          oscCountInput.dispatchEvent(new Event("input"));
          updateLocalStorage("oscillators", newOscCountValue);
          speak(
            "Oscillator count increased by " +
              incrementValue +
              ". New value is " +
              oscCountInput.value
          );
        }
      }
    } else if (command.match(/oscillators down (\d+)/)) {
      var oscCountInput = document.getElementById("oscillators");
      var match = command.match(/oscillators down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentOscCountValue = parseInt(oscCountInput.value, 10);
        var newOscCountValue = currentOscCountValue - decrementValue;
        if (newOscCountValue < 2) {
          speak("Value is below minimum. Oscillator count range is 2 to 16.");
        } else {
          oscCountInput.value = newOscCountValue;
          oscCountInput.dispatchEvent(new Event("input"));
          updateLocalStorage("oscillators", newOscCountValue);
          speak(
            "Oscillator count decreased by " +
              decrementValue +
              ". New value is " +
              oscCountInput.value
          );
        }
      }

      // Dynamic ADSR command handling
    } else if (command.match(/set attack (\d+(\.\d+)?)/)) {
      var attackSlider = document.getElementById("amp-attack");
      var match = command.match(/set attack (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newAttackValue = parseInt(match[1]);
        if (newAttackValue < 0 || newAttackValue > 100) {
          speak(
            "Invalid attack value. Please provide a value between 0 and 100."
          );
        } else {
          attackSlider.value = Math.min(Math.max(newAttackValue, 0), 100);
          attackSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-attack", newAttackValue);
          speak("Attack set to " + attackSlider.value);
        }
      }
    } else if (command.match(/attack up (\d+(\.\d+)?)/)) {
      var attackSlider = document.getElementById("amp-attack");
      var match = command.match(/attack up (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var incrementValue = parseFloat(match[1]);
        var currentAttackValue = parseFloat(attackSlider.value);
        var newAttackValue = currentAttackValue + incrementValue;
        if (newAttackValue > 100) {
          speak("Value exceeds maximum. Attack range is 0 to 100.");
        } else {
          attackSlider.value = newAttackValue;
          attackSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-attack", newAttackValue);
          speak(
            "Attack increased by " +
              incrementValue +
              ". New value is " +
              attackSlider.value
          );
        }
      }
    } else if (command.match(/attack down (\d+(\.\d+)?)/)) {
      var attackSlider = document.getElementById("amp-attack");
      var match = command.match(/attack down (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var decrementValue = parseFloat(match[1]);
        var currentAttackValue = parseFloat(attackSlider.value);
        var newAttackValue = currentAttackValue - decrementValue;
        if (newAttackValue < 0) {
          speak("Value is below minimum. Attack range is 0 to 100.");
        } else {
          attackSlider.value = newAttackValue;
          attackSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-attack", newAttackValue);
          speak(
            "Attack decreased by " +
              decrementValue +
              ". New value is " +
              attackSlider.value
          );
        }
      }
    } else if (command.match(/set decay (\d+(\.\d+)?)/)) {
      var decaySlider = document.getElementById("amp-decay");
      var match = command.match(/set decay (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newDecayValue = parseInt(match[1]);
        if (newDecayValue < 0 || newDecayValue > 100) {
          speak(
            "Invalid decay value. Please provide a value between 0 and 100."
          );
        } else {
          decaySlider.value = Math.min(Math.max(newDecayValue, 0), 100);
          decaySlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-decay", newDecayValue);
          speak("Decay set to " + decaySlider.value);
        }
      }
    } else if (command.match(/decay up (\d+(\.\d+)?)/)) {
      var decaySlider = document.getElementById("amp-decay");
      var match = command.match(/decay up (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var incrementValue = parseFloat(match[1]);
        var currentDecayValue = parseFloat(decaySlider.value);
        var newDecayValue = currentDecayValue + incrementValue;
        if (newDecayValue > 100) {
          speak("Value exceeds maximum. Decay range is 0 to 100.");
        } else {
          decaySlider.value = newDecayValue;
          decaySlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-decay", newDecayValue);
          speak(
            "Decay increased by " +
              incrementValue +
              ". New value is " +
              decaySlider.value
          );
        }
      }
    } else if (command.match(/decay down (\d+(\.\d+)?)/)) {
      var decaySlider = document.getElementById("amp-decay");
      var match = command.match(/decay down (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var decrementValue = parseFloat(match[1]);
        var currentDecayValue = parseFloat(decaySlider.value);
        var newDecayValue = currentDecayValue - decrementValue;
        if (newDecayValue < 0) {
          speak("Value is below minimum. Decay range is 0 to 100.");
        } else {
          decaySlider.value = newDecayValue;
          decaySlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-decay", newDecayValue);
          speak(
            "Decay decreased by " +
              decrementValue +
              ". New value is " +
              decaySlider.value
          );
        }
      }
    } else if (command.match(/set sustain (\d+(\.\d+)?)/)) {
      var sustainSlider = document.getElementById("amp-sustain");
      var match = command.match(/set sustain (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newSustainValue = parseInt(match[1]);
        if (newSustainValue < 0 || newSustainValue > 100) {
          speak(
            "Invalid sustain value. Please provide a value between 0 and 100."
          );
        } else {
          sustainSlider.value = Math.min(Math.max(newSustainValue, 0), 100);
          sustainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-sustain", newSustainValue);
          speak("Sustain set to " + sustainSlider.value);
        }
      }
    } else if (command.match(/sustain up (\d+(\.\d+)?)/)) {
      var sustainSlider = document.getElementById("amp-sustain");
      var match = command.match(/sustain up (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var incrementValue = parseFloat(match[1]);
        var currentSustainValue = parseFloat(sustainSlider.value);
        var newSustainValue = currentSustainValue + incrementValue;
        if (newSustainValue > 100) {
          speak("Value exceeds maximum. Sustain range is 0 to 100.");
        } else {
          sustainSlider.value = newSustainValue;
          sustainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-sustain", newSustainValue);
          speak(
            "Sustain increased by " +
              incrementValue +
              ". New value is " +
              sustainSlider.value
          );
        }
      }
    } else if (command.match(/sustain down (\d+(\.\d+)?)/)) {
      var sustainSlider = document.getElementById("amp-sustain");
      var match = command.match(/sustain down (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var decrementValue = parseFloat(match[1]);
        var currentSustainValue = parseFloat(sustainSlider.value);
        var newSustainValue = currentSustainValue - decrementValue;
        if (newSustainValue < 0) {
          speak("Value is below minimum. Sustain range is 0 to 100.");
        } else {
          sustainSlider.value = newSustainValue;
          sustainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-sustain", newSustainValue);
          speak(
            "Sustain decreased by " +
              decrementValue +
              ". New value is " +
              sustainSlider.value
          );
        }
      }
    } else if (command.match(/set release (\d+(\.\d+)?)/)) {
      var releaseSlider = document.getElementById("amp-release");
      var match = command.match(/set release (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newReleaseValue = parseInt(match[1]);
        if (newReleaseValue < 0 || newReleaseValue > 100) {
          speak(
            "Invalid release value. Please provide a value between 0 and 100."
          );
        } else {
          releaseSlider.value = Math.min(Math.max(newReleaseValue, 0), 100);
          releaseSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-release", newReleaseValue);
          speak("Release set to " + releaseSlider.value);
        }
      }
    } else if (command.match(/release up (\d+(\.\d+)?)/)) {
      var releaseSlider = document.getElementById("amp-release");
      var match = command.match(/release up (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var incrementValue = parseFloat(match[1]);
        var currentReleaseValue = parseFloat(releaseSlider.value);
        var newReleaseValue = currentReleaseValue + incrementValue;
        if (newReleaseValue > 100) {
          speak("Value exceeds maximum. Release range is 0 to 100.");
        } else {
          releaseSlider.value = newReleaseValue;
          releaseSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-release", newReleaseValue);
          speak(
            "Release increased by " +
              incrementValue +
              ". New value is " +
              releaseSlider.value
          );
        }
      }
    } else if (command.match(/release down (\d+(\.\d+)?)/)) {
      var releaseSlider = document.getElementById("amp-release");
      var match = command.match(/release down (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var decrementValue = parseFloat(match[1]);
        var currentReleaseValue = parseFloat(releaseSlider.value);
        var newReleaseValue = currentReleaseValue - decrementValue;
        if (newReleaseValue < 0) {
          speak("Value is below minimum. Release range is 0 to 100.");
        } else {
          releaseSlider.value = newReleaseValue;
          releaseSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("amp-release", newReleaseValue);
          speak(
            "Release decreased by " +
              decrementValue +
              ". New value is " +
              releaseSlider.value
          );
        }
      }

      // LFO Depth commands
    } else if (command.match(/set lfo depth ([-\d,]+)/)) {
      var lfoDepthSlider = document.getElementById("lfo-depth");
      var match = command.match(/set lfo depth ([-\d,]+)/);
      if (match && match[1]) {
        // Remove commas from the matched number string and handle negative values
        var newLfoDepthValueStr = match[1].replace(/,/g, "");
        var newLfoDepthValue = parseInt(newLfoDepthValueStr, 10);
        console.log("Parsed value:", newLfoDepthValue); // Debugging line
        if (newLfoDepthValue < -2000 || newLfoDepthValue > 2000) {
          speak(
            "Invalid LFO depth value. Please provide a value between minus 2000 and 2000."
          );
        } else {
          lfoDepthSlider.value = Math.min(
            Math.max(newLfoDepthValue, -2000),
            2000
          );
          console.log("Setting LFO depth to:", lfoDepthSlider.value); // Debugging line
          lfoDepthSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-depth", newLfoDepthValue);
          speak("LFO depth set to " + lfoDepthSlider.value);
        }
      }
    } else if (command.match(/lfo depth up ([-\d,]+)/)) {
      var lfoDepthSlider = document.getElementById("lfo-depth");
      var match = command.match(/lfo depth up ([-\d,]+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentLfoDepthValue = parseInt(lfoDepthSlider.value, 10);
        var newLfoDepthValue = currentLfoDepthValue + incrementValue;
        if (newLfoDepthValue > 2000) {
          speak("Value exceeds maximum. LFO depth range is -2000 to 2000.");
        } else {
          lfoDepthSlider.value = newLfoDepthValue;
          lfoDepthSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-depth", newLfoDepthValue);
          speak(
            "LFO depth increased by " +
              incrementValue +
              ". New value is " +
              lfoDepthSlider.value
          );
        }
      }
    } else if (command.match(/lfo depth down ([-\d,]+)/)) {
      var lfoDepthSlider = document.getElementById("lfo-depth");
      var match = command.match(/lfo depth down ([-\d,]+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentLfoDepthValue = parseInt(lfoDepthSlider.value, 10);
        var newLfoDepthValue = currentLfoDepthValue - decrementValue;
        if (newLfoDepthValue < -2000) {
          speak("Value is below minimum. LFO depth range is -2000 to 2000.");
        } else {
          lfoDepthSlider.value = newLfoDepthValue;
          lfoDepthSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-depth", newLfoDepthValue);
          speak(
            "LFO depth decreased by " +
              decrementValue +
              ". New value is " +
              lfoDepthSlider.value
          );
        }
      }

      // LFO Rate commands
    } else if (command.match(/set lfo rate (\d+(\.\d+)?)/)) {
      var lfoRateSlider = document.getElementById("lfo-rate");
      var match = command.match(/set lfo rate (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var newLfoRateValue = parseFloat(match[1]);
        if (newLfoRateValue < 0.01 || newLfoRateValue > 30) {
          speak(
            "Invalid LFO rate value. Please provide a value between 0.01 and 30."
          );
        } else {
          lfoRateSlider.value = Math.min(
            Math.max(newLfoRateValue, 0.01),
            30
          ).toFixed(2);
          lfoRateSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-rate", newLfoRateValue);
          speak("LFO rate set to " + lfoRateSlider.value);
        }
      }
    } else if (command.match(/lfo rate up (\d+(\.\d+)?)/)) {
      var lfoRateSlider = document.getElementById("lfo-rate");
      var match = command.match(/lfo rate up (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var incrementValue = parseFloat(match[1]);
        var currentLfoRateValue = parseFloat(lfoRateSlider.value);
        var newLfoRateValue = currentLfoRateValue + incrementValue;
        if (newLfoRateValue > 30) {
          speak("Value exceeds maximum. LFO rate range is 0.01 to 30.");
        } else {
          lfoRateSlider.value = newLfoRateValue.toFixed(2);
          lfoRateSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-rate", newLfoRateValue);
          speak(
            "LFO rate increased by " +
              incrementValue +
              ". New value is " +
              lfoRateSlider.value
          );
        }
      }
    } else if (command.match(/lfo rate down (\d+(\.\d+)?)/)) {
      var lfoRateSlider = document.getElementById("lfo-rate");
      var match = command.match(/lfo rate down (\d+(\.\d+)?)/);
      if (match && match[1]) {
        var decrementValue = parseFloat(match[1]);
        var currentLfoRateValue = parseFloat(lfoRateSlider.value);
        var newLfoRateValue = currentLfoRateValue - decrementValue;
        if (newLfoRateValue < 0.01) {
          speak("Value is below minimum. LFO rate range is 0.01 to 30.");
        } else {
          lfoRateSlider.value = newLfoRateValue.toFixed(2);
          lfoRateSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("lfo-rate", newLfoRateValue);
          speak(
            "LFO rate decreased by " +
              decrementValue +
              ". New value is " +
              lfoRateSlider.value
          );
        }
      }

      // Filter Type commands
    } else if (command.includes("set filter type low")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      filterTypeInput.value = "lowpass";
      filterTypeInput.dispatchEvent(new Event("change"));
      speak("Filter type changed to lowpass");
    } else if (command.includes("set filter type high")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      filterTypeInput.value = "highpass";
      filterTypeInput.dispatchEvent(new Event("change"));
      speak("Filter type changed to highpass");
    } else if (command.includes("set filter type band")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      filterTypeInput.value = "bandpass";
      filterTypeInput.dispatchEvent(new Event("change"));
      speak("Filter type changed to bandpass");
    } else if (command.includes("set filter type notch")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      filterTypeInput.value = "notch";
      filterTypeInput.dispatchEvent(new Event("change"));
      speak("Filter type changed to notch");
    } else if (command.includes("set filter type all pass")) {
      var filterTypeInput = document.getElementById(
        "filter-one-type-control-f1"
      );
      filterTypeInput.value = "allpass";
      filterTypeInput.dispatchEvent(new Event("change"));
      speak("Filter type changed to allpass");

      // Filter Gain commands
    } else if (command.match(/set filter gain (\d+)/)) {
      var filterGainSlider = document.getElementById("filter-gain");
      var match = command.match(/set filter gain (\d+)/);
      if (match && match[1]) {
        var newFilterGainValue = parseInt(match[1], 10);
        if (newFilterGainValue < 0 || newFilterGainValue > 100) {
          speak(
            "Invalid filter gain value. Please provide a value between 0 and 100."
          );
        } else {
          filterGainSlider.value = Math.min(
            Math.max(newFilterGainValue, 0),
            100
          );
          filterGainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-gain", newFilterGainValue);
          speak("Filter gain set to " + filterGainSlider.value);
        }
      }
    } else if (command.match(/filter gain up (\d+)/)) {
      var filterGainSlider = document.getElementById("filter-gain");
      var match = command.match(/filter gain up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentFilterGainValue = parseInt(filterGainSlider.value, 10);
        var newFilterGainValue = currentFilterGainValue + incrementValue;
        if (newFilterGainValue > 100) {
          speak("Value exceeds maximum. Filter gain range is 0 to 100.");
        } else {
          filterGainSlider.value = newFilterGainValue;
          filterGainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-gain", newFilterGainValue);
          speak(
            "Filter gain increased by " +
              incrementValue +
              ". New value is " +
              filterGainSlider.value
          );
        }
      }
    } else if (command.match(/filter gain down (\d+)/)) {
      var filterGainSlider = document.getElementById("filter-gain");
      var match = command.match(/filter gain down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentFilterGainValue = parseInt(filterGainSlider.value, 10);
        var newFilterGainValue = currentFilterGainValue - decrementValue;
        if (newFilterGainValue < 0) {
          speak("Value is below minimum. Filter gain range is 0 to 100.");
        } else {
          filterGainSlider.value = newFilterGainValue;
          filterGainSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-gain", newFilterGainValue);
          speak(
            "Filter gain decreased by " +
              decrementValue +
              ". New value is " +
              filterGainSlider.value
          );
        }
      }

      // Filter Cutoff Frequency commands
    } else if (command.match(/set filter frequency ([\d,]+)/)) {
      var lowCutInput = document.getElementById("filter-frequency");
      var match = command.match(/set filter frequency ([\d,]+)/);
      if (match && match[1]) {
        var newLowCutValueStr = match[1].replace(/,/g, "");
        var newLowCutValue = parseInt(newLowCutValueStr, 10);
        console.log("Parsed value:", newLowCutValue); // Debugging line
        if (newLowCutValue < 20 || newLowCutValue > 20000) {
          speak(
            "Invalid filter cutoff frequency. Please provide a value between 20Hz and 20000Hz."
          );
        } else {
          lowCutInput.value = Math.min(Math.max(newLowCutValue, 20), 20000);
          console.log("Setting low cut frequency to:", lowCutInput.value); // Debugging line
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-frequency", newLowCutValue);
          speak("Cut off frequency set to " + lowCutInput.value);
        }
      }
    } else if (command.match(/filter frequency up ([\d,]+)/)) {
      var lowCutInput = document.getElementById("filter-frequency");
      var match = command.match(/filter frequency up ([\d,]+)/);
      if (match && match[1]) {
        var incrementValueStr = match[1].replace(/,/g, "");
        var incrementValue = parseInt(incrementValueStr, 10);
        var currentLowCutValue = parseInt(lowCutInput.value, 10);
        var newLowCutValue = currentLowCutValue + incrementValue;
        if (newLowCutValue > 20000) {
          speak(
            "Value exceeds maximum. Filter cutoff frequency range is 20Hz to 20000Hz."
          );
        } else {
          lowCutInput.value = newLowCutValue;
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-frequency", newLowCutValue);
          speak(
            "Filter cutoff frequency increased by " +
              incrementValue +
              ". New value is " +
              lowCutInput.value
          );
        }
      }
    } else if (command.match(/filter frequency down ([\d,]+)/)) {
      var lowCutInput = document.getElementById("filter-frequency");
      var match = command.match(/filter frequency down ([\d,]+)/);
      if (match && match[1]) {
        var decrementValueStr = match[1].replace(/,/g, "");
        var decrementValue = parseInt(decrementValueStr, 10);
        var currentLowCutValue = parseInt(lowCutInput.value, 10);
        var newLowCutValue = currentLowCutValue - decrementValue;
        if (newLowCutValue < 20) {
          speak(
            "Value is below minimum. Filter cutoff frequency range is 20Hz to 20000Hz."
          );
        } else {
          lowCutInput.value = newLowCutValue;
          lowCutInput.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-frequency", newLowCutValue);
          speak(
            "Filter cutoff frequency decreased by " +
              decrementValue +
              ". New value is " +
              lowCutInput.value
          );
        }
      }

      // Filter Resonance commands
    } else if (command.match(/set filter resonance (\d+)/)) {
      var filterResonanceSlider = document.getElementById("filter-resonance");
      var match = command.match(/set filter resonance (\d+)/);
      if (match && match[1]) {
        var newFilterResonanceValue = parseInt(match[1], 10);
        if (newFilterResonanceValue < 0 || newFilterResonanceValue > 40) {
          speak(
            "Invalid filter resonance value. Please provide a value between 0 and 40."
          );
        } else {
          filterResonanceSlider.value = Math.min(
            Math.max(newFilterResonanceValue, 0),
            40
          );
          filterResonanceSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-resonance", newFilterResonanceValue);
          speak("Filter resonance set to " + filterResonanceSlider.value);
        }
      }
    } else if (command.match(/filter resonance up (\d+)/)) {
      var filterResonanceSlider = document.getElementById("filter-resonance");
      var match = command.match(/filter resonance up (\d+)/);
      if (match && match[1]) {
        var incrementValue = parseInt(match[1], 10);
        var currentFilterResonanceValue = parseInt(
          filterResonanceSlider.value,
          10
        );
        var newFilterResonanceValue =
          currentFilterResonanceValue + incrementValue;
        if (newFilterResonanceValue > 40) {
          speak("Value exceeds maximum. Filter resonance range is 0 to 40.");
        } else {
          filterResonanceSlider.value = newFilterResonanceValue;
          filterResonanceSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-resonance", newFilterResonanceValue);
          speak(
            "Filter resonance increased by " +
              incrementValue +
              ". New value is " +
              filterResonanceSlider.value
          );
        }
      }
    } else if (command.match(/filter resonance down (\d+)/)) {
      var filterResonanceSlider = document.getElementById("filter-resonance");
      var match = command.match(/filter resonance down (\d+)/);
      if (match && match[1]) {
        var decrementValue = parseInt(match[1], 10);
        var currentFilterResonanceValue = parseInt(
          filterResonanceSlider.value,
          10
        );
        var newFilterResonanceValue =
          currentFilterResonanceValue - decrementValue;
        if (newFilterResonanceValue < 0) {
          speak("Value is below minimum. Filter resonance range is 0 to 40.");
        } else {
          filterResonanceSlider.value = newFilterResonanceValue;
          filterResonanceSlider.dispatchEvent(new Event("input"));
          updateLocalStorage("filter-resonance", newFilterResonanceValue);
          speak(
            "Filter resonance decreased by " +
              decrementValue +
              ". New value is " +
              filterResonanceSlider.value
          );
        }
      }

      // LFO waveform commands
    } else if (command.includes("set lfo waveform sine")) {
      var lfoWaveformInput = document.getElementById("lfo-waveform-select1-f1");
      lfoWaveformInput.value = "sine";
      lfoWaveformInput.dispatchEvent(new Event("change"));
      speak("LFO waveform changed to sine");
    } else if (command.includes("set lfo waveform square")) {
      var lfoWaveformInput = document.getElementById("lfo-waveform-select1-f1");
      lfoWaveformInput.value = "square";
      lfoWaveformInput.dispatchEvent(new Event("change"));
      speak("LFO waveform changed to square");
    } else if (command.includes("set lfo waveform saw")) {
      var lfoWaveformInput = document.getElementById("lfo-waveform-select1-f1");
      lfoWaveformInput.value = "sawtooth";
      lfoWaveformInput.dispatchEvent(new Event("change"));
      speak("LFO waveform changed to sawtooth");
    } else if (command.includes("set lfo waveform triangle")) {
      var lfoWaveformInput = document.getElementById("lfo-waveform-select1-f1");
      lfoWaveformInput.value = "triangle";
      lfoWaveformInput.dispatchEvent(new Event("change"));
      speak("LFO waveform changed to triangle");
      //oscillator wave select
    } else if (command.includes("set waveform square")) {
      var waveTypeInput = document.getElementById("wave-type-osc");
      waveTypeInput.value = "square";
      waveTypeInput.dispatchEvent(new Event("change"));
      speak("Waveform changed to square");
    } else if (command.includes("set waveform saw")) {
      var waveTypeInput = document.getElementById("wave-type-osc");
      waveTypeInput.value = "sawtooth";
      waveTypeInput.dispatchEvent(new Event("change"));
      speak("Waveform changed to sawtooth");
    } else if (command.includes("set waveform triangle")) {
      var waveTypeInput = document.getElementById("wave-type-osc");
      waveTypeInput.value = "triangle";
      waveTypeInput.dispatchEvent(new Event("change"));
      speak("Waveform changed to triangle");

      //MIDI Mapping
    } else if (command.includes("low frequency map")) {
      document
        .getElementById("low-freq-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("low gain map")) {
      document
        .getElementById("low-gain-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("mid frequency map")) {
      document
        .getElementById("mid-freq-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("mid gain map")) {
      document
        .getElementById("mid-gain-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("mid peak map")) {
      document
        .getElementById("mid-peak-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("high frequency map")) {
      document
        .getElementById("high-freq-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("high gain map")) {
      document
        .getElementById("high-gain-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("expander wet map")) {
      document
        .getElementById("expander-wet-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("expander feedback map")) {
      document
        .getElementById("expander-feed-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("expander space time map")) {
      document
        .getElementById("expander-time-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("delay wet map")) {
      document
        .getElementById("delay-wet-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("delay time map")) {
      document
        .getElementById("delay-time-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("delay feedback map")) {
      document
        .getElementById("delay-feed-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("delay low cut map")) {
      document
        .getElementById("delay-low-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("oscillators map")) {
      document
        .getElementById("oscillators-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("detune map")) {
      document.getElementById("detune-learn").dispatchEvent(new Event("click"));
    } else if (command.includes("attack map")) {
      document.getElementById("attack-learn").dispatchEvent(new Event("click"));
    } else if (command.includes("decay map")) {
      document.getElementById("decay-learn").dispatchEvent(new Event("click"));
    } else if (command.includes("sustain map")) {
      document
        .getElementById("sustain-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("release map")) {
      document
        .getElementById("release-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("lfo depth map")) {
      document.getElementById("depth-learn").dispatchEvent(new Event("click"));
    } else if (command.includes("lfo rate map")) {
      document.getElementById("rate-learn").dispatchEvent(new Event("click"));
    } else if (command.includes("filter gain map")) {
      document
        .getElementById("filter-gain-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("filter frequency map")) {
      document
        .getElementById("filter-freq-learn")
        .dispatchEvent(new Event("click"));
    } else if (command.includes("filter resonance map")) {
      document
        .getElementById("resonance-learn")
        .dispatchEvent(new Event("click"));
    }
  }
});

// Fetch available voices and populate the voice selection dropdown
// function populateVoiceList() {
//   const voices = window.speechSynthesis.getVoices();
//   const voiceSelect = document.getElementById("speech-voice");
//   voiceSelect.innerHTML = ""; // Clear existing options

//   voices.forEach((voice, index) => {
//     const option = document.createElement("option");
//     option.textContent = `${voice.name} (${voice.lang})`;
//     option.value = index;
//     voiceSelect.appendChild(option);
//   });

//   // Set the selected voice from local storage
//   const savedVoiceIndex = localStorage.getItem("speech-voice");
//   if (savedVoiceIndex !== null) {
//     voiceSelect.value = savedVoiceIndex;
//   }
// }

// Function to create a SpeechSynthesisUtterance with the current parameters
// function createUtterance(text) {
//   const speechText = text || document.getElementById("speech-text").value;
//   const speechPitch =
//     parseFloat(document.getElementById("speech-pitch").value) / 100;
//   const speechRate =
//     parseFloat(document.getElementById("speech-rate").value) / 100;
//   const speechVolume =
//     parseFloat(document.getElementById("speech-volume").value) / 100;
//   const speechVoiceIndex = parseInt(
//     document.getElementById("speech-voice").value
//   );

//   const utterance = new SpeechSynthesisUtterance(speechText);
//   utterance.pitch = speechPitch;
//   utterance.rate = speechRate;
//   utterance.volume = speechVolume;

//   const voices = window.speechSynthesis.getVoices();
//   if (voices[speechVoiceIndex]) {
//     utterance.voice = voices[speechVoiceIndex];
//   } else {
//     console.warn("Selected voice is not available.");
//   }

//   return utterance;
// }

// Event listener for when voices are loaded
// if (
//   typeof speechSynthesis !== "undefined" &&
//   speechSynthesis.onvoiceschanged !== undefined
// ) {
//   speechSynthesis.onvoiceschanged = populateVoiceList;
// }

// document.getElementById("speak-button").addEventListener("click", () => {
//   const utterance = createUtterance();
//   window.speechSynthesis.speak(utterance);
// });

// // Initialize voice list on page load
// populateVoiceList();

// // Update output values when sliders change
// document.getElementById("speech-pitch").addEventListener("input", function () {
//   document.getElementById("pitch-output").textContent = this.value;
// });

// document.getElementById("speech-rate").addEventListener("input", function () {
//   document.getElementById("rate-output").textContent = this.value;
// });

// document.getElementById("speech-volume").addEventListener("input", function () {
//   document.getElementById("volume-output").textContent = this.value;
// });

// document.getElementById("speech-voice").addEventListener("change", function () {
//   saveSettings();
// });

// function updateOutputValues() {
//   document.getElementById("pitch-output").textContent =
//     document.getElementById("speech-pitch").value;
//   document.getElementById("rate-output").textContent =
//     document.getElementById("speech-rate").value;
//   document.getElementById("volume-output").textContent =
//     document.getElementById("speech-volume").value;
// }

// Load settings from local storage
// function loadSettings() {
//   const pitch = localStorage.getItem("speech-pitch");
//   const rate = localStorage.getItem("speech-rate");
//   const volume = localStorage.getItem("speech-volume");
//   const voiceIndex = localStorage.getItem("speech-voice");

//   if (pitch !== null) document.getElementById("speech-pitch").value = pitch;
//   if (rate !== null) document.getElementById("speech-rate").value = rate;
//   if (volume !== null) document.getElementById("speech-volume").value = volume;
//   if (voiceIndex !== null)
//     document.getElementById("speech-voice").value = voiceIndex;
//   updateOutputValues();
// }

// Save settings to local storage
// function saveSettings() {
//   localStorage.setItem(
//     "speech-pitch",
//     document.getElementById("speech-pitch").value
//   );
//   localStorage.setItem(
//     "speech-rate",
//     document.getElementById("speech-rate").value
//   );
//   localStorage.setItem(
//     "speech-volume",
//     document.getElementById("speech-volume").value
//   );
//   localStorage.setItem(
//     "speech-voice",
//     document.getElementById("speech-voice").value
//   );
// }

// document.getElementById("speech-pitch").addEventListener("input", function () {
//   document.getElementById("pitch-output").textContent = this.value;
//   saveSettings();
// });

// document.getElementById("speech-rate").addEventListener("input", function () {
//   document.getElementById("rate-output").textContent = this.value;
//   saveSettings();
// });

// document.getElementById("speech-volume").addEventListener("input", function () {
//   document.getElementById("volume-output").textContent = this.value;
//   saveSettings();
// });

// // Load settings and populate voices when the page loads
// window.onload = function () {
//   loadSettings();
//   populateVoiceList();
//   window.speechSynthesis.onvoiceschanged = populateVoiceList;
// };

//cc to param speech=======================================================
// Function to save MIDI mappings to local storage
function saveMidiMappings() {
  localStorage.setItem("midiMappings", JSON.stringify(midiMapping));
}

// Function to load MIDI mappings from local storage
function loadMidiMappings() {
  const storedMappings = localStorage.getItem("midiMappings");
  if (storedMappings) {
    midiMapping = JSON.parse(storedMappings);
  }
}

// Initialize variables
let debounceTimer;
const debounceDelay = 300; // 300 milliseconds delay
let currentMidiLearnParam = null;
let midiMapping = {};

document.addEventListener("DOMContentLoaded", function () {
  // Load saved MIDI mappings
  loadMidiMappings();

  // MIDI access success handler
  function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midiAccess.inputs.forEach(function (input) {
      input.onmidimessage = getMIDIMessage;
    });
  }

  // MIDI access failure handler
  function onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
  }

  // Request MIDI access
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

  // MIDI message handler
  function getMIDIMessage(message) {
    const [status, data1, data2] = message.data;

    // Ensure it's a control change message
    if ((status & 0xf0) === 0xb0) {
      const controllerNumber = data1;
      const value = data2;

      // Check if MIDI learn is enabled for a parameter
      if (currentMidiLearnParam) {
        // Map the controller number to the parameter
        for (const key in midiMapping) {
          if (midiMapping[key] === controllerNumber) {
            delete midiMapping[key];
          }
        }
        midiMapping[currentMidiLearnParam] = controllerNumber;
        speak(
          `Mapped ${currentMidiLearnParam.replace(
            /-/g,
            " "
          )} to CC ${controllerNumber}`
        );
        currentMidiLearnParam = null; // Reset MIDI learn
        // Save the mappings to local storage
        saveMidiMappings();
        return;
      }

      // Use the mapped controller numbers for updating parameters
      for (const paramId in midiMapping) {
        if (midiMapping[paramId] === controllerNumber) {
          if (paramId.includes("frequency")) {
            updateFrequencyParameter(paramId, value);
          } else if (paramId.includes("low-gain")) {
            updateGainParameter(paramId, value);
          } else if (paramId.includes("mid-gain")) {
            updateGainParameter(paramId, value);
          } else if (paramId.includes("high-gain")) {
            updateGainParameter(paramId, value);
          } else if (paramId.includes("mid-peak")) {
            updatePeakParameter(paramId, value);
          } else if (paramId.includes("delay-feedback")) {
            updateDelayFeedParameter(paramId, value);
          } else if (paramId.includes("expander-feedback")) {
            updateExpanderFeedParameter(paramId, value);
          } else if (paramId.includes("oscillators")) {
            updateOscParameter(paramId, value);
          } else if (paramId.includes("lfo-rate")) {
            updateLfoRateParameter(paramId, value);
          } else if (paramId.includes("lfo-depth")) {
            updateLfoDepthParameter(paramId, value);
          } else if (paramId.includes("filter-resonance")) {
            updateResParameter(paramId, value);
          } else {
            updateParameter(paramId, value);
          }
        }
      }
    }
  }

  // Update frequency parameter function
  function updateFrequencyParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to frequency range (20-20000)
    const frequencyValue = Math.round(mapRange(midiValue, 0, 127, 20, 20000));
    slider.value = frequencyValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${frequencyValue}Hz`);
      }
    }, debounceDelay);
  }

  // Update gain parameter function
  function updateGainParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to gain range (-40 to 40)
    const gainValue = Math.round(mapRange(midiValue, 0, 127, -40, 40));
    slider.value = gainValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${gainValue}dB`);
      }
    }, debounceDelay);
  }

  // Update delay feedback parameter function
  function updateDelayFeedParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to gain range (0 to 80)
    const gainValue = Math.round(mapRange(midiValue, 0, 127, 0, 80));
    slider.value = gainValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${gainValue}`);
      }
    }, debounceDelay);
  }

  // Update expander feedback parameter function
  function updateExpanderFeedParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to gain range (0 to )
    const gainValue = Math.round(mapRange(midiValue, 0, 127, 0, 45));
    slider.value = gainValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${gainValue}`);
      }
    }, debounceDelay);
  }

  // Update Peak function
  function updatePeakParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g., 0-10)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, 0, 10));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Update oscillator count function
  function updateOscParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g., 2-16)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, 2, 16));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Update lfo rate function
  function updateLfoRateParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g., 0-30)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, 0, 30));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Update lfo depth function
  function updateLfoDepthParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g., -2000-2000)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, -2000, 2000));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Update resonance function
  function updateResParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g.,0-40)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, 0, 40));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Update parameter function
  function updateParameter(sliderId, midiValue) {
    const slider = document.getElementById(sliderId);
    // Map MIDI value (0-127) to parameter range (e.g., 0-100)
    const parameterValue = Math.round(mapRange(midiValue, 0, 127, 0, 100));
    slider.value = parameterValue;
    slider.dispatchEvent(new Event("input"));
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      // Check if the speak MIDI toggle is enabled
      const speakMidiEnabled =
        document.getElementById("speak-midi-toggle").checked;
      if (speakMidiEnabled) {
        speak(`${sliderId.replace(/-/g, " ")} set to ${parameterValue}`);
      }
    }, debounceDelay);
  }

  // Map range function
  function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  // Speak function
  // function speak(text) {
  //   const utterance = createUtterance(text);
  //   window.speechSynthesis.speak(utterance);
  // }
  function speak(text) {
    const live = document.getElementById("aria-live");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => (live.textContent = text), 10);
  }
});

// Open MIDI Learn Menu
function openMidiLearnMenu() {
  document.getElementById("midi-learn-menu").style.display = "block";
}

// Close MIDI Learn Menu
function closeMidiLearnMenu() {
  document.getElementById("midi-learn-menu").style.display = "none";
  currentMidiLearnParam = null;
}

// Speak function
function speak(text) {
  const live = document.getElementById("aria-live");
  if (!live) return;
  live.textContent = "";
  setTimeout(() => (live.textContent = text), 10);
}

// Enable MIDI Learn for a specific parameter
function enableMidiLearn(paramId) {
  currentMidiLearnParam = paramId;
  // Remove previous mapping for this parameter if it exists
  for (const key in midiMapping) {
    if (midiMapping[key] === paramId) {
      delete midiMapping[key];
    }
  }
  speak(
    `Learn enabled for ${paramId.replace(/-/g, " ")}. Move a CC control to map.`
  );
}
