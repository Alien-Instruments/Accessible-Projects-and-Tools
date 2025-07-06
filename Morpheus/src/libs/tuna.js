/*
    Copyright (c) 2012 DinahMoe AB

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
    modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//Originally written by Alessandro Saccoia, Chris Coniglio and Oskar Eriksson
(function (window) {
  var userContext,
    userInstance,
    Tuna = function (context) {
      if (!window.AudioContext) {
        window.AudioContext = window.webkitAudioContext;
      }

      if (!context) {
        console.log(
          "tuna.js: Missing audio context! Creating a new context for you."
        );
        context = window.AudioContext && new window.AudioContext();
      }
      userContext = context;
      userInstance = this;
    },
    version = "0.1",
    set = "setValueAtTime",
    linear = "linearRampToValueAtTime",
    pipe = function (param, val) {
      param.value = val;
    },
    Super = Object.create(null, {
      activate: {
        writable: true,
        value: function (doActivate) {
          if (doActivate) {
            this.input.disconnect();
            this.input.connect(this.activateNode);
            if (this.activateCallback) {
              this.activateCallback(doActivate);
            }
          } else {
            this.input.disconnect();
            this.input.connect(this.output);
          }
        },
      },
      bypass: {
        get: function () {
          return this._bypass;
        },
        set: function (value) {
          if (this._lastBypassValue === value) {
            return;
          }
          this._bypass = value;
          this.activate(!value);
          this._lastBypassValue = value;
        },
      },
      connect: {
        value: function (target) {
          this.output.connect(target);
        },
      },
      disconnect: {
        value: function (target) {
          this.output.disconnect(target);
        },
      },
      connectInOrder: {
        value: function (nodeArray) {
          for (let i = 0; i < nodeArray.length - 1; i++) {
            const current = nodeArray[i];
            const next = nodeArray[i + 1];

            if (!current.connect) {
              console.error("connectInOrder: Not a connectable node", current);
              continue;
            }

            // Safely handle both raw AudioNodes and wrapper objects
            const destination = next.input || next;
            current.connect(destination);
          }
        },
      },
      getDefaults: {
        value: function () {
          var result = {};
          for (var key in this.defaults) {
            result[key] = this.defaults[key].value;
          }
          return result;
        },
      },
      automate: {
        value: function (property, value, duration, startTime) {
          var start = startTime
              ? ~~(startTime / 1000)
              : userContext.currentTime,
            dur = duration ? ~~(duration / 1000) : 0,
            _is = this.defaults[property],
            param = this[property],
            method;

          if (param) {
            if (_is.automatable) {
              if (!duration) {
                method = set;
              } else {
                method = linear;
                param.cancelScheduledValues(start);
                param.setValueAtTime(param.value, start);
              }
              param[method](value, dur + start);
            } else {
              param = value;
            }
          } else {
            console.error("Invalid Property for " + this.name);
          }
        },
      },
    }),
    FLOAT = "float",
    BOOLEAN = "boolean",
    STRING = "string",
    INT = "int";

  function dbToWAVolume(db) {
    return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
  }

  function fmod(x, y) {
    // http://kevin.vanzonneveld.net
    // +   original by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: fmod(5.7, 1.3);
    // *     returns 1: 0.5
    var tmp,
      tmp2,
      p = 0,
      pY = 0,
      l = 0.0,
      l2 = 0.0;

    tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
    p = parseInt(tmp[2], 10) - (tmp[1] + "").length;
    tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
    pY = parseInt(tmp[2], 10) - (tmp[1] + "").length;

    if (pY > p) {
      p = pY;
    }

    tmp2 = x % y;

    if (p < -100 || p > 20) {
      // toFixed will give an out of bound error so we fix it like this:
      l = Math.round(Math.log(tmp2) / Math.log(10));
      l2 = Math.pow(10, l);

      return (tmp2 / l2).toFixed(l - p) * l2;
    } else {
      return parseFloat(tmp2.toFixed(-p));
    }
  }

  function sign(x) {
    if (x === 0) {
      return 1;
    } else {
      return Math.abs(x) / x;
    }
  }

  function tanh(n) {
    return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
  }

  //Splitter===============================================
  Tuna.prototype.Splitter = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.splitter = userContext.createChannelSplitter(4);
    this.output1 = userContext.createGain();
    this.output2 = userContext.createGain();
    this.output3 = userContext.createGain();
    this.output4 = userContext.createGain();

    this.input.connect(this.splitter);

    this.splitter.connect(this.output1, 0);
    this.splitter.connect(this.output2, 1);
    this.splitter.connect(this.output3, 2);
    this.splitter.connect(this.output4, 3);

    this.out1 = properties.out1 || this.defaults.out1.value;
    this.out2 = properties.out2 || this.defaults.out2.value;
    this.out3 = properties.out3 || this.defaults.out3.value;
    this.out4 = properties.out4 || this.defaults.out4.value;
    this.inputGain = properties.inputGain || this.defaults.inputGain.value;

    this.output1.gain.value = this.in1;
    this.output2.gain.value = this.in2;
    this.output3.gain.value = this.in3;
    this.output4.gain.value = this.in4;
    this.input.gain.value = this.inputGain;
  };

  Tuna.prototype.Splitter.prototype = Object.create(Super, {
    name: {
      value: "Splitter",
    },
    defaults: {
      writable: true,
      value: {
        out1: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        out2: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        out3: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        out4: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        inputGain: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    out1: {
      enumerable: true,
      get: function () {
        return this.input1.gain;
      },
      set: function (value) {
        this.input1.gain.value = value;
      },
    },
    out2: {
      enumerable: true,
      get: function () {
        return this.input2.gain;
      },
      set: function (value) {
        this.input2.gain.value = value;
      },
    },
    out3: {
      enumerable: true,
      get: function () {
        return this.input3.gain;
      },
      set: function (value) {
        this.input3.gain.value = value;
      },
    },
    out4: {
      enumerable: true,
      get: function () {
        return this.input4.gain;
      },
      set: function (value) {
        this.input4.gain.value = value;
      },
    },
    inputGain: {
      enumerable: true,
      get: function () {
        return this.input.gain;
      },
      set: function (value) {
        this.input.gain.value = value;
      },
    },
  });
  // 4 In Mixer===========================================
  Tuna.prototype.FourInMix = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    this.input1 = userContext.createGain();
    this.input2 = userContext.createGain();
    this.input3 = userContext.createGain();
    this.input4 = userContext.createGain();
    this.output = userContext.createGain();
    this.mixer = userContext.createGain();

    this.input1.connect(this.mixer);
    this.input2.connect(this.mixer);
    this.input3.connect(this.mixer);
    this.input4.connect(this.mixer);

    this.mixer.connect(this.output);

    this.in1 = properties.in1 || this.defaults.in1.value;
    this.in2 = properties.in2 || this.defaults.in2.value;
    this.in3 = properties.in3 || this.defaults.in3.value;
    this.in4 = properties.in4 || this.defaults.in4.value;
    this.mix = properties.mix || this.defaults.mix.value;

    this.input1.gain.value = this.in1;
    this.input2.gain.value = this.in2;
    this.input3.gain.value = this.in3;
    this.input4.gain.value = this.in4;
    this.mixer.gain.value = this.mix;
  };

  Tuna.prototype.FourInMix.prototype = Object.create(Super, {
    name: {
      value: "FourInMix",
    },
    defaults: {
      writable: true,
      value: {
        in1: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        in2: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        in3: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        in4: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        mix: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    in1: {
      enumerable: true,
      get: function () {
        return this.input1.gain;
      },
      set: function (value) {
        this.input1.gain.value = value;
      },
    },
    in2: {
      enumerable: true,
      get: function () {
        return this.input2.gain;
      },
      set: function (value) {
        this.input2.gain.value = value;
      },
    },
    in3: {
      enumerable: true,
      get: function () {
        return this.input3.gain;
      },
      set: function (value) {
        this.input3.gain.value = value;
      },
    },
    in4: {
      enumerable: true,
      get: function () {
        return this.input4.gain;
      },
      set: function (value) {
        this.input4.gain.value = value;
      },
    },
    mix: {
      enumerable: true,
      get: function () {
        return this.mixer.gain;
      },
      set: function (value) {
        this.mixer.gain.value = value;
      },
    },
  });
  //Simple Oscillator/LFO=========================================
  const oscTypeMap = {
    0: "sine",
    1: "sawtooth",
    2: "square",
    3: "triangle",
  };

  Tuna.prototype.SimpleOscillator = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    this.oscillator = userContext.createOscillator();
    this.oscOut = userContext.createGain();
    this.output = userContext.createGain();

    this.oscillator.connect(this.oscOut);
    this.oscOut.connect(this.output);

    this.detune = properties.detune || this.defaults.detune.value;
    this.level = properties.level || this.defaults.level.value;
    this.oscillatorType =
      properties.oscillatorType || this.defaults.oscillatorType.value;

    this.frequency = properties.frequency || 440;

    this.oscillator.frequency.value = this.frequency;

    this.oscillator.detune.value = this.detune;
    this.oscOut.gain.value = this.level;

    // Start and stop methods for external control
    this.start = function () {
      this.oscillator.start();
    };

    this.stop = function () {
      this.oscillator.stop();
    };
  };

  Tuna.prototype.SimpleOscillator.prototype = Object.create(Super, {
    name: {
      value: "SimpleOscillator",
    },
    defaults: {
      writable: true,
      value: {
        level: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detune: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        oscillatorType: {
          value: 0,
          automatable: false,
          type: STRING,
        },
        frequency: {
          value: 440,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    oscillatorType: {
      enumerable: true,
      get: function () {
        return this.oscillator.type;
      },
      set: function (value) {
        if (oscTypeMap[value] !== undefined) {
          this.oscillator.type = oscTypeMap[value];
        } else {
          console.error(`Invalid oscillator type: ${value}`);
        }
      },
    },
    level: {
      enumerable: true,
      get: function () {
        return this.oscOut.gain.value;
      },
      set: function (value) {
        this.oscOut.gain.value = value;
      },
    },
    detune: {
      enumerable: true,
      get: function () {
        return this.oscillator.detune.value;
      },
      set: function (value) {
        this.oscillator.detune.value = value;
      },
    },
    frequency: {
      enumerable: true,
      get: function () {
        return this.oscillator.frequency.value;
      },
      set: function (value) {
        this.oscillator.frequency.value = value;
      },
    },
  });

  //Pulse Oscillator======================================
  var pulseCurve = new Float32Array(256);
  for (var i = 0; i < 128; i++) {
    pulseCurve[i] = -1;
    pulseCurve[i + 128] = 1;
  }
  var constantOneCurve = new Float32Array(2);
  constantOneCurve[0] = 1;
  constantOneCurve[1] = 1;

  Tuna.prototype.PulseOscillator = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    // Create the oscillator and nodes
    this.oscillator = userContext.createOscillator();
    this.oscOut = userContext.createGain();
    this.output = userContext.createGain();

    // Set oscillator type
    this.oscillator.type = "sawtooth";

    // Create the pulse shaper for wave manipulation
    this.pulseShaper = userContext.createWaveShaper();
    this.pulseShaper.curve = pulseCurve;

    // Connect the oscillator to the pulse shaper
    this.oscillator.connect(this.pulseShaper);

    // Create and configure the widthGain node
    this.widthGain = userContext.createGain();
    this.widthGain.gain.value = properties.width || 0;
    this.oscillator.width = this.widthGain.gain;
    this.widthGain.connect(this.pulseShaper);

    // Create the constant value shaper for pulse width manipulation
    this.constantOneShaper = userContext.createWaveShaper();
    this.constantOneShaper.curve = constantOneCurve;
    this.oscillator.connect(this.constantOneShaper);
    this.constantOneShaper.connect(this.widthGain);

    // Connect the pulseShaper output to oscOut and finally to the output
    this.pulseShaper.connect(this.oscOut);
    this.oscOut.connect(this.output);

    this.detune = properties.detune || this.defaults.detune.value;
    this.level = properties.level || this.defaults.level.value;
    this.frequency = properties.frequency || 440;

    // Apply settings to the oscillator
    this.oscillator.frequency.value = this.frequency;
    this.oscillator.detune.value = this.detune;
    this.oscOut.gain.value = this.level;

    this.start = function () {
      this.oscillator.start();
    };

    this.stop = function () {
      this.oscillator.stop();
    };
  };

  Tuna.prototype.PulseOscillator.prototype = Object.create(Super, {
    name: {
      value: "PulseOscillator",
    },
    defaults: {
      writable: true,
      value: {
        level: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detune: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        width: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        oscillatorType: {
          value: "sawtooth",
          automatable: false,
          type: STRING,
        },
        frequency: {
          value: 440,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    oscillatorType: {
      enumerable: true,
      get: function () {
        return this.oscillator.type;
      },
      set: function (value) {
        if (oscTypeMap[value] !== undefined) {
          this.oscillator.type = oscTypeMap[value];
        } else {
          console.error(`Invalid oscillator type: ${value}`);
        }
      },
    },
    level: {
      enumerable: true,
      get: function () {
        return this.oscOut.gain.value;
      },
      set: function (value) {
        this.oscOut.gain.value = value;
      },
    },
    detune: {
      enumerable: true,
      get: function () {
        return this.oscillator.detune.value;
      },
      set: function (value) {
        this.oscillator.detune.value = value;
      },
    },
    width: {
      enumerable: true,
      get: function () {
        return this.widthGain.gain.value;
      },
      set: function (value) {
        this.widthGain.gain.value = value;
      },
    },
    frequency: {
      enumerable: true,
      get: function () {
        return this.oscillator.frequency.value;
      },
      set: function (value) {
        this.oscillator.frequency.value = value;
      },
    },
  });

  //Complex Oscillator====================================
  Tuna.prototype.ComplexOscillator = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    this.sineOsc = userContext.createOscillator();
    this.sineLevel = userContext.createGain();
    this.sawOsc = userContext.createOscillator();
    this.sawLevel = userContext.createGain();
    this.squareOsc = userContext.createOscillator();
    this.squareLevel = userContext.createGain();
    this.triOsc = userContext.createOscillator();
    this.triLevel = userContext.createGain();
    this.modOsc = userContext.createOscillator();
    this.modLevel = userContext.createGain();
    this.fmOsc = userContext.createOscillator();
    this.fmLevel = userContext.createGain();

    this.output = userContext.createGain();

    // Oscillator routing
    this.sineOsc.connect(this.sineLevel);
    this.sawOsc.connect(this.sawLevel);
    this.squareOsc.connect(this.squareLevel);
    this.triOsc.connect(this.triLevel);

    this.sineLevel.connect(this.output);
    this.sawLevel.connect(this.output);
    this.squareLevel.connect(this.output);
    this.triLevel.connect(this.output);

    this.modOsc.connect(this.modLevel);
    this.modLevel.connect(this.output.gain);

    this.fmOsc.connect(this.fmLevel);
    this.fmLevel.connect(this.sineOsc.frequency);
    this.fmLevel.connect(this.sawOsc.frequency);
    this.fmLevel.connect(this.squareOsc.frequency);
    this.fmLevel.connect(this.triOsc.frequency);

    // Set initial values
    const frequency = properties.frequency || 440;

    this.sineOsc.frequency.value = frequency;
    this.sawOsc.frequency.value = frequency;
    this.squareOsc.frequency.value = frequency;
    this.triOsc.frequency.value = frequency;

    this.sineLevel.gain.value =
      properties.sineOut || this.defaults.sineOut.value;
    this.sawLevel.gain.value = properties.sawOut || this.defaults.sawOut.value;
    this.squareLevel.gain.value =
      properties.squareOut || this.defaults.squareOut.value;
    this.triLevel.gain.value = properties.triOut || this.defaults.triOut.value;

    this.sineOsc.detune.value =
      properties.detuneSine || this.defaults.detuneSine.value;
    this.sawOsc.detune.value =
      properties.detuneSaw || this.defaults.detuneSaw.value;
    this.squareOsc.detune.value =
      properties.detuneSquare || this.defaults.detuneSquare.value;
    this.triOsc.detune.value =
      properties.detuneTri || this.defaults.detuneTri.value;

    this.modOsc.frequency.value =
      properties.modFreq || this.defaults.modFreq.value;
    this.modLevel.gain.value = properties.modOut || this.defaults.modOut.value;

    this.fmOsc.frequency.value =
      properties.fmFreq || this.defaults.fmFreq.value;
    this.fmLevel.gain.value = properties.fmOut || this.defaults.fmOut.value;

    this.sineOsc.type = "sine";
    this.sawOsc.type = "sawtooth";
    this.squareOsc.type = "square";
    this.triOsc.type = "triangle";

    this.modOsc.type = "sine";
    this.fmOsc.type = "sine";

    //Expose GainNodes for LFO or external modulation
    this.sineOut = this.sineLevel;
    this.sawOut = this.sawLevel;
    this.squareOut = this.squareLevel;
    this.triOut = this.triLevel;
    this.modOut = this.modLevel;
    this.fmOut = this.fmLevel;

    // Start and stop
    this.start = function () {
      this.sineOsc.start();
      this.sawOsc.start();
      this.squareOsc.start();
      this.triOsc.start();
      this.modOsc.start();
      this.fmOsc.start();
    };

    this.stop = function () {
      this.sineOsc.stop();
      this.sawOsc.stop();
      this.squareOsc.stop();
      this.triOsc.stop();
      this.modOsc.stop();
      this.fmOsc.stop();
    };
  };

  Tuna.prototype.ComplexOscillator.prototype = Object.create(Super, {
    name: {
      value: "ComplexOscillator",
    },
    defaults: {
      writable: true,
      value: {
        sineOut: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detuneSine: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        sawOut: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detuneSaw: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        squareOut: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detuneSquare: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        triOut: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        detuneTri: {
          value: 0,
          min: -1200,
          max: 1200,
          automatable: true,
          type: FLOAT,
        },
        modOut: {
          value: 0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        modFreq: {
          value: 0,
          min: 0,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        fmOut: {
          value: 0,
          min: 0,
          max: 100,
          automatable: true,
          type: FLOAT,
        },
        fmFreq: {
          value: 0,
          min: 0,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        frequency: {
          value: 440,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    sineOut: {
      enumerable: true,
      get: function () {
        return this.sineLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.sineLevel.gain.value = num;
        }
      },
    },
    detuneSine: {
      enumerable: true,
      get: function () {
        return this.sineOsc.detune.value;
      },
      set: function (value) {
        this.sineOsc.detune.value = value;
      },
    },
    sawOut: {
      enumerable: true,
      get: function () {
        return this.sawLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.sawLevel.gain.value = num;
        } else {
        }
      },
    },

    detuneSaw: {
      enumerable: true,
      get: function () {
        return this.sawOsc.detune.value;
      },
      set: function (value) {
        this.sawOsc.detune.value = value;
      },
    },
    squareOut: {
      enumerable: true,
      get: function () {
        return this.squareLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.squareLevel.gain.value = num;
        } else {
        }
      },
    },

    detuneSquare: {
      enumerable: true,
      get: function () {
        return this.squareOsc.detune.value;
      },
      set: function (value) {
        this.squareOsc.detune.value = value;
      },
    },
    triOut: {
      enumerable: true,
      get: function () {
        return this.triLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.triLevel.gain.value = num;
        } else {
        }
      },
    },

    detuneTri: {
      enumerable: true,
      get: function () {
        return this.triOsc.detune.value;
      },
      set: function (value) {
        this.triOsc.detune.value = value;
      },
    },
    modOut: {
      enumerable: true,
      get: function () {
        return this.modLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.modLevel.gain.value = num;
        } else {
        }
      },
    },

    modFreq: {
      enumerable: true,
      get: function () {
        return this.modOsc.frequency.value;
      },
      set: function (value) {
        this.modOsc.frequency.value = value;
      },
    },
    fmOut: {
      enumerable: true,
      get: function () {
        return this.fmLevel.gain.value;
      },
      set: function (value) {
        const num = parseFloat(value);
        if (isFinite(num)) {
          this.fmLevel.gain.value = num;
        } else {
        }
      },
    },

    fmFreq: {
      enumerable: true,
      get: function () {
        return this.fmOsc.frequency.value;
      },
      set: function (value) {
        this.fmOsc.frequency.value = value;
      },
    },
    frequency: {
      enumerable: true,
      get: function () {
        return {
          sine: this.sineOsc.frequency.value,
          saw: this.sawOsc.frequency.value,
          square: this.squareOsc.frequency.value,
          triangle: this.triOsc.frequency.value,
        };
      },
      set: function (value) {
        this.sineOsc.frequency.value = value;
        this.sawOsc.frequency.value = value;
        this.squareOsc.frequency.value = value;
        this.triOsc.frequency.value = value;
      },
    },
  });

  Tuna.prototype.ExternalInput = function (properties) {
    this.input = userContext.createGain();
    this.output = userContext.createGain();
    this.streamSource = null;

    // Populate device selector if provided
    const select = document.getElementById("externalInputSelect");
    if (select) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        audioInputs.forEach((device) => {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.textContent = device.label || `Input ${select.length + 1}`;
          select.appendChild(option);
        });

        select.addEventListener("change", () => {
          this.connectToDevice(select.value);
        });
      });
    }

    this.connectToDevice = async (deviceId) => {
      if (this.streamSource) {
        this.streamSource.disconnect();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
      });
      this.streamSource = userContext.createMediaStreamSource(stream);
      this.streamSource.connect(this.input);
      this.input.connect(this.output);
    };

    // Connect to default device initially
    this.connectToDevice();
  };

  Tuna.prototype.ExternalInput.prototype = Object.create(Super, {
    name: { value: "ExternalInput" },
  });

  //Three band EQ=================================================
  Tuna.prototype.EQ3Band = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    // Create audio nodes
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.lowShelf = userContext.createBiquadFilter();
    this.peaking = userContext.createBiquadFilter();
    this.highShelf = userContext.createBiquadFilter();
    this.output = userContext.createGain();

    // Connect nodes to create the processing chain
    this.activateNode.connect(this.input);
    this.input.connect(this.lowShelf);
    this.lowShelf.connect(this.peaking);
    this.peaking.connect(this.highShelf);
    this.highShelf.connect(this.output);

    // Set default properties or use provided values
    this.lowGain = properties.lowGain || this.defaults.lowGain.value;
    this.midGain = properties.midGain || this.defaults.midGain.value;
    this.highGain = properties.highGain || this.defaults.highGain.value;
    this.lowFreq = properties.lowFreq || this.defaults.lowFreq.value;
    this.midFreq = properties.midFreq || this.defaults.midFreq.value;
    this.highFreq = properties.highFreq || this.defaults.highFreq.value;
    this.midRes = properties.midRes || this.defaults.midRes.value;

    // Configure filter types
    this.lowShelf.type = "lowshelf";
    this.peaking.type = "peaking";
    this.highShelf.type = "highshelf";
  };
  Tuna.prototype.EQ3Band.prototype = Object.create(Super, {
    name: {
      value: "EQ3Band",
    },
    defaults: {
      writable: true,
      value: {
        lowGain: {
          value: 0,
          min: -40,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        midGain: {
          value: 0,
          min: -40,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        highGain: {
          value: 0,
          min: -40,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        lowFreq: {
          value: 100,
          min: 20,
          max: 1000,
          automatable: true,
          type: FLOAT,
        },
        midFreq: {
          value: 1000,
          min: 200,
          max: 5000,
          automatable: true,
          type: FLOAT,
        },
        highFreq: {
          value: 5000,
          min: 1000,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        midRes: {
          value: 0,
          min: 0,
          max: 20,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    lowGain: {
      enumerable: true,
      get: function () {
        return this.lowShelf.gain;
      },
      set: function (value) {
        this.lowShelf.gain.value = value;
      },
    },
    midGain: {
      enumerable: true,
      get: function () {
        return this.peaking.gain;
      },
      set: function (value) {
        this.peaking.gain.value = value;
      },
    },
    highGain: {
      enumerable: true,
      get: function () {
        return this.highShelf.gain;
      },
      set: function (value) {
        this.highShelf.gain.value = value;
      },
    },
    lowFreq: {
      enumerable: true,
      get: function () {
        return this.lowShelf.frequency;
      },
      set: function (value) {
        this.lowShelf.frequency.value = value;
      },
    },
    midFreq: {
      enumerable: true,
      get: function () {
        return this.peaking.frequency;
      },
      set: function (value) {
        this.peaking.frequency.value = value;
      },
    },
    highFreq: {
      enumerable: true,
      get: function () {
        return this.highShelf.frequency;
      },
      set: function (value) {
        this.highShelf.frequency.value = value;
      },
    },
    midRes: {
      enumerable: true,
      get: function () {
        return this.peaking.Q;
      },
      set: function (value) {
        this.peaking.Q.value = value;
      },
    },
  });

  // Mutator====================================================
  Tuna.prototype.MutatorFilter = function (properties) {
    if (!properties) properties = this.getDefaults();

    this.input = userContext.createGain();
    this.output = userContext.createGain();
    this.filter = userContext.createBiquadFilter();
    this.analyser = userContext.createAnalyser();
    this.waveshaper = userContext.createWaveShaper();

    this.bitcrusher = createBitCrusher(
      userContext,
      properties.bitDepth || 8,
      properties.reduction || 0.25
    );

    this._bitDepth = properties.bitDepth || 8;
    this._reduction = properties.reduction || 0.25;

    // LFO
    this.lfo = userContext.createOscillator();
    this.lfoGain = userContext.createGain();
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
    this.lfo.frequency.value = properties.lfoRate || 0.5;
    this._lfoDepth = properties.lfoDepth || 0.0;
    this.lfoGain.gain.value = this._lfoDepth * 1000;

    this.start = function () {
      this.lfo.start();
    };
    // Filter
    this.filter.type = properties.filterType || "lowpass";
    this.filter.frequency.value = properties.cutoff || 400;
    this.filter.Q.value = properties.resonance || 1.0;

    // Envelope follower
    this.analyser.fftSize = 256;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this._envelope = 0;
    this._attack = properties.attack || 0.1;
    this._release = properties.release || 0.2;
    this._envelopeDepth = properties.envelopeDepth || 2.0;
    this.baseCutoff = properties.cutoff || 400;
    this.minCutoff = 40;
    this.maxCutoff = 20000;

    // Distortion settings
    this._distortionAmount = properties.distortionAmount || 20;
    this._distortionType = properties.distortionType || "soft";
    switch (this._distortionType) {
      case "foldback":
        this.waveshaper.curve = makeFoldbackCurve(0.3);
        break;
      case "clip":
        this.waveshaper.curve = makeHardClipCurve(0.8);
        break;
      default:
        this.waveshaper.curve = makeDistortionCurve(this._distortionAmount);
    }
    this.waveshaper.oversample = "4x";

    // Routing
    this.input.connect(this.analyser);
    this.input.connect(this.bitcrusher);
    this.bitcrusher.connect(this.waveshaper);
    this.waveshaper.connect(this.filter);
    this.filter.connect(this.output);

    this._reconnectBitcrusher = function () {
      this.input.disconnect();
      this.input.connect(this.analyser);
      this.input.connect(this.bitcrusher);
      this.bitcrusher.connect(this.waveshaper);
    };

    // Envelope loop
    const updateEnvelope = () => {
      this.analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const delta = rms - this._envelope;
      this._envelope += delta * (delta > 0 ? this._attack : this._release);
      const modFreq =
        this.baseCutoff + this._envelope * this._envelopeDepth * 1000;
      this.filter.frequency.value = Math.min(
        this.maxCutoff,
        Math.max(this.minCutoff, modFreq)
      );
      requestAnimationFrame(updateEnvelope);
    };
    updateEnvelope();
  };

  function makeDistortionCurve(amount) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] =
        ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  function makeFoldbackCurve(threshold = 0.3, drive = 1.0) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      const scaledX = x * drive;
      const folded =
        Math.abs(scaledX) > threshold
          ? Math.abs(
              Math.abs(
                (Math.abs(scaledX - threshold) % (threshold * 4)) -
                  threshold * 2
              ) - threshold
            )
          : scaledX;
      curve[i] = Math.sign(x) * folded;
    }
    return curve;
  }

  function makeHardClipCurve(threshold = 0.8, drive = 1.0) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; ++i) {
      let x = (i * 2) / samples - 1;
      curve[i] = Math.max(-threshold, Math.min(threshold, x * drive));
    }
    return curve;
  }
  function createBitCrusher(audioContext, bitDepth = 4, reduction = 0.25) {
    const node = audioContext.createScriptProcessor(512, 1, 1);
    let phaser = 0;
    let lastSample = 0;
    node.onaudioprocess = function (e) {
      const input = e.inputBuffer.getChannelData(0);
      const output = e.outputBuffer.getChannelData(0);
      const step = Math.pow(0.5, bitDepth);
      for (let i = 0; i < input.length; i++) {
        phaser += reduction;
        if (phaser >= 1.0) {
          phaser -= 1.0;
          lastSample = step * Math.floor(input[i] / step + 0.5);
        }
        output[i] = lastSample;
      }
    };
    return node;
  }

  Tuna.prototype.MutatorFilter.prototype = Object.create(Super, {
    name: { value: "MutatorFilter" },
    defaults: {
      writable: true,
      value: {
        distortionAmount: {
          value: 20,
          min: 0,
          max: 100,
          type: FLOAT,
        },
        distortionType: {
          value: "soft",
          type: STRING,
        }, // soft, foldback, clip
        cutoff: {
          value: 400,
          min: 20,
          max: 20000,
          type: FLOAT,
        },
        resonance: {
          value: 1.0,
          min: 0.1,
          max: 20,
          type: FLOAT,
        },
        filterType: {
          value: "lowpass",
          type: STRING,
        },
        envelopeDepth: {
          value: 2.0,
          min: 0,
          max: 5,
          type: FLOAT,
        },
        lfoRate: {
          value: 0.5,
          min: 0.1,
          max: 20,
          type: FLOAT,
        },
        lfoDepth: {
          value: 0.0,
          min: 0,
          max: 1000,
          type: FLOAT,
        },
        attack: {
          value: 0.1,
          min: 0.01,
          max: 1.0,
          type: FLOAT,
        },
        release: {
          value: 0.2,
          min: 0.01,
          max: 1.0,
          type: FLOAT,
        },
        bitDepth: {
          value: 8,
          min: 1,
          max: 16,
          type: INT,
        },
        reduction: {
          value: 0.25,
          min: 0.01,
          max: 1.0,
          type: FLOAT,
        },
      },
    },
    distortionAmount: {
      get: function () {
        return this._distortionAmount;
      },
      set: function (value) {
        this._distortionAmount = value;

        switch (this._distortionType) {
          case "foldback":
            this.waveshaper.curve = makeFoldbackCurve(0.3, value / 20); // scale drive
            break;
          case "clip":
            this.waveshaper.curve = makeHardClipCurve(0.8, value / 20);
            break;
          default:
            this.waveshaper.curve = makeDistortionCurve(value);
        }
      },
    },
    distortionType: {
      get: function () {
        return this._distortionType;
      },
      set: function (type) {
        this._distortionType = type;
        switch (type) {
          case "foldback":
            this.waveshaper.curve = makeFoldbackCurve(0.3);
            break;
          case "clip":
            this.waveshaper.curve = makeHardClipCurve(0.8);
            break;
          default:
            this.waveshaper.curve = makeDistortionCurve(this._distortionAmount);
        }
      },
    },
    cutoff: {
      get: function () {
        return this.baseCutoff;
      },
      set: function (value) {
        this.baseCutoff = value;
      },
    },
    resonance: {
      get: function () {
        return this.filter.Q.value;
      },
      set: function (value) {
        this.filter.Q.value = value;
      },
    },
    filterType: {
      get: function () {
        return this.filter.type;
      },
      set: function (value) {
        this.filter.type = value;
      },
    },
    envelopeDepth: {
      get: function () {
        return this._envelopeDepth;
      },
      set: function (value) {
        this._envelopeDepth = value;
      },
    },
    lfoRate: {
      get: function () {
        return this.lfo.frequency.value;
      },
      set: function (value) {
        this.lfo.frequency.value = value;
      },
    },
    lfoDepth: {
      get: function () {
        return this.lfoGain.gain.value;
      },
      set: function (value) {
        this._lfoDepth = value;
        this.lfoGain.gain.value = value * 1000;
      },
    },
    attack: {
      get: function () {
        return this._attack;
      },
      set: function (value) {
        this._attack = value;
      },
    },
    release: {
      get: function () {
        return this._release;
      },
      set: function (value) {
        this._release = value;
      },
    },
    bitDepth: {
      get: function () {
        return this._bitDepth;
      },
      set: function (value) {
        this._bitDepth = value;
        this.bitcrusher = createBitCrusher(userContext, value, this._reduction);
        this._reconnectBitcrusher();
      },
    },
    reduction: {
      get: function () {
        return this._reduction;
      },
      set: function (value) {
        this._reduction = value;
        this.bitcrusher = createBitCrusher(userContext, this._bitDepth, value);
        this._reconnectBitcrusher();
      },
    },
  });

  //dual filter================================================
  Tuna.prototype.DualFilter = function (properties) {
    if (!properties) properties = this.getDefaults();

    // Nodes
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.distortion = userContext.createWaveShaper();
    this.filterA = userContext.createBiquadFilter();
    this.filterB = userContext.createBiquadFilter();
    this.output = userContext.createGain();

    this.activateNode.connect(this.input);
    this.input.connect(this.distortion);

    // Apply soft waveshaping
    this.setDrive(properties.drive || this.defaults.drive.value);

    // Filter config
    this.filterA.type = properties.typeA || "lowpass";
    this.filterB.type = properties.typeB || "highpass";

    this.filterA.frequency.value = properties.freqA || 1000;
    this.filterB.frequency.value = properties.freqB || 5000;

    // Set routing
    this.serialRouting = properties.serialRouting ?? true;
    this.connectFilters();

    this.output.gain.value = 0.01;

    // Drive parameter
    this.drive = properties.drive || 20;
  };
  Tuna.prototype.DualFilter.prototype = Object.create(Super, {
    name: { value: "DualFilter" },

    defaults: {
      value: {
        drive: {
          value: 20,
          min: 0,
          max: 100,
          automatable: true,
          type: FLOAT,
        },
        freqA: {
          value: 1000,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        freqB: {
          value: 5000,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        serialRouting: {
          value: true,
          type: BOOLEAN,
        },
      },
    },

    setDrive: {
      value: function (amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const k = amount;
        for (let i = 0; i < samples; ++i) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + k) * x * 20 * Math.PI) / (Math.PI + k * Math.abs(x));
        }
        this.distortion.curve = curve;
        this.distortion.oversample = "4x";
      },
    },
    connectFilters: {
      value: function () {
        // Disconnect first
        this.distortion.disconnect();
        this.filterA.disconnect();
        this.filterB.disconnect();

        if (this.serialRouting) {
          // Serial: distortion → filterA → filterB → output
          this.distortion.connect(this.filterA);
          this.filterA.connect(this.filterB);
          this.filterB.connect(this.output);
        } else {
          // Parallel: distortion → both filters → summed → output
          const merger = userContext.createGain();
          this.distortion.connect(this.filterA);
          this.distortion.connect(this.filterB);
          this.filterA.connect(merger);
          this.filterB.connect(merger);
          merger.connect(this.output);
        }
      },
    },

    freqA: {
      get: function () {
        return this.filterA.frequency.value;
      },
      set: function (v) {
        this.filterA.frequency.value = v;
      },
    },

    freqB: {
      get: function () {
        return this.filterB.frequency.value;
      },
      set: function (v) {
        this.filterB.frequency.value = v;
      },
    },

    drive: {
      get: function () {
        return this._drive;
      },
      set: function (v) {
        this._drive = v;
        this.setDrive(v);
      },
    },

    serialRouting: {
      get: function () {
        return this._serialRouting;
      },
      set: function (v) {
        this._serialRouting = v;
        this.connectFilters();
      },
    },
  });

  //morphing filter============================================
  Tuna.prototype.MorphingFilter = function (properties) {
    if (!properties) properties = this.getDefaults();

    // Create Nodes
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.filterA = userContext.createBiquadFilter();
    this.filterB = userContext.createBiquadFilter();
    this.crossfadeA = userContext.createGain();
    this.crossfadeB = userContext.createGain();
    this.output = userContext.createGain();

    // Routing
    this.activateNode.connect(this.input);
    this.input.connect(this.filterA);
    this.input.connect(this.filterB);
    this.filterA.connect(this.crossfadeA);
    this.filterB.connect(this.crossfadeB);
    this.crossfadeA.connect(this.output);
    this.crossfadeB.connect(this.output);

    // Filter settings
    this.filterA.type = properties.typeA || "lowpass";
    this.filterB.type = properties.typeB || "highpass";
    this.filterA.frequency.value = properties.freqA || 400;
    this.filterB.frequency.value = properties.freqB || 4000;
    this.filterA.Q.value = properties.resonanceA || 1;
    this.filterB.Q.value = properties.resonanceB || 1;
    this.output.gain.value = properties.outputGain || 1.0;

    // === Audio-rate Morph Modulation ===
    // LFO
    this.lfo = userContext.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = properties.lfoFrequency || 0.3;

    // LFO depth
    this.lfoGain = userContext.createGain();
    this.lfoGain.gain.value = properties.lfoDepth || 0.3;
    this.lfo.connect(this.lfoGain);

    // Morph base value (DC offset)
    this.morphBase = userContext.createConstantSource();
    this.morphBase.offset.value =
      properties.morph !== undefined ? properties.morph : 0.5;
    this.morphBase.start();

    // Mixer: sum base + LFO
    this.morphAdder = userContext.createGain();
    this.lfoGain.connect(this.morphAdder);
    this.morphBase.connect(this.morphAdder);

    // morphAdder --> crossfadeB.gain (morph)
    this.morphAdder.connect(this.crossfadeB.gain);

    // 1 - morphAdder --> crossfadeA.gain (1 - morph)
    this.invertGain = userContext.createGain();
    this.invertGain.gain.value = -1;
    this.morphAdder.connect(this.invertGain);

    this.morphOffset = userContext.createConstantSource();
    this.morphOffset.offset.value = 1.0;
    this.morphOffset.start();
    this.morphOffset.connect(this.crossfadeA.gain);
    this.invertGain.connect(this.crossfadeA.gain);

    // Start LFO
    this.lfo.start();
  };

  Tuna.prototype.MorphingFilter.prototype = Object.create(Super, {
    name: { value: "MorphingFilter" },

    defaults: {
      value: {
        freqA: {
          value: 400,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        freqB: {
          value: 4000,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        resonanceA: {
          value: 1,
          min: 0.1,
          max: 20,
          automatable: true,
          type: FLOAT,
        },
        resonanceB: {
          value: 1,
          min: 0.1,
          max: 20,
          automatable: true,
          type: FLOAT,
        },
        morph: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        typeA: { value: "lowpass", type: STRING },
        typeB: { value: "highpass", type: STRING },
        outputGain: {
          value: 1.0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        lfoFrequency: {
          value: 0.5,
          min: 0.01,
          max: 10,
          automatable: true,
          type: FLOAT,
        },
        lfoDepth: {
          value: 0.25,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },

    // Removed updateCrossfade; it's no longer needed

    morph: {
      get: function () {
        return this.morphBase.offset.value;
      },
      set: function (v) {
        this.morphBase.offset.value = Math.max(0, Math.min(1, v));
      },
    },

    freqA: {
      get: function () {
        return this.filterA.frequency.value;
      },
      set: function (v) {
        this.filterA.frequency.value = v;
      },
    },
    freqB: {
      get: function () {
        return this.filterB.frequency.value;
      },
      set: function (v) {
        this.filterB.frequency.value = v;
      },
    },
    resonanceA: {
      get: function () {
        return this.filterA.Q.value;
      },
      set: function (v) {
        this.filterA.Q.value = v;
      },
    },
    resonanceB: {
      get: function () {
        return this.filterB.Q.value;
      },
      set: function (v) {
        this.filterB.Q.value = v;
      },
    },
    outputGain: {
      get: function () {
        return this.output.gain.value;
      },
      set: function (v) {
        this.output.gain.value = v;
      },
    },
    lfoFrequency: {
      get: function () {
        return this.lfo.frequency.value;
      },
      set: function (v) {
        this.lfo.frequency.value = v;
      },
    },
    lfoDepth: {
      get: function () {
        return this.lfoGain.gain.value;
      },
      set: function (v) {
        this.lfoGain.gain.value = v;
      },
    },
  });

  //Distortion
  Tuna.prototype.Distortion = function (properties) {
    const defaults = this.defaults || {
      curveAmount: { value: 400 },
      oversample: { value: "none" },
      drive: { value: 1 },
      bypass: { value: false },
    };

    properties = properties || {};

    this.input = userContext.createGain();
    this.output = userContext.createGain();

    this.bypassNode = userContext.createGain(); // used to route when bypass is on

    this.distortion = userContext.createWaveShaper();
    this.driveNode = userContext.createGain();

    // Private safe values
    this._curveAmount =
      typeof properties.curveAmount === "number"
        ? properties.curveAmount
        : defaults.curveAmount.value;
    this._drive =
      typeof properties.drive === "number"
        ? properties.drive
        : defaults.drive.value;
    this._oversample =
      typeof properties.oversample === "string"
        ? properties.oversample
        : defaults.oversample.value;
    this._bypass = !!properties.bypass;

    // Audio routing: bypass path
    this.input.connect(this.bypassNode);
    this.bypassNode.connect(this.output);

    // Audio routing: distortion path
    this.input.connect(this.driveNode);
    this.driveNode.connect(this.distortion);
    this.distortion.connect(this.output);

    // Configure
    this.driveNode.gain.value = this._drive;
    this.setCurve(this._curveAmount);
    this.distortion.oversample = this._oversample;

    this.updateBypassState(); // Apply bypass flag on init
  };

  Tuna.prototype.Distortion.prototype = Object.create(Super, {
    name: { value: "Distortion" },
    defaults: {
      writable: true,
      value: {
        curveAmount: {
          value: 400,
          min: 0,
          max: 1000,
          automatable: false,
          type: FLOAT,
        },
        oversample: {
          value: "none",
          automatable: false,
          type: STRING,
        },
        drive: {
          value: 1,
          min: 0,
          max: 10,
          automatable: true,
          type: FLOAT,
        },
        bypass: {
          value: false,
          automatable: false,
          type: BOOLEAN,
        },
      },
    },
    curveAmount: {
      enumerable: true,
      get: function () {
        return this._curveAmount;
      },
      set: function (value) {
        this._curveAmount = value;
        this.setCurve(value);
      },
    },
    oversample: {
      enumerable: true,
      get: function () {
        return this.distortion.oversample;
      },
      set: function (value) {
        this.distortion.oversample = value;
      },
    },
    drive: {
      enumerable: true,
      get: function () {
        return this.driveNode.gain.value;
      },
      set: function (value) {
        this._drive = value;
        this.driveNode.gain.value = value;
      },
    },
    bypass: {
      enumerable: true,
      get: function () {
        return this._bypass;
      },
      set: function (value) {
        this._bypass = !!value;
        this.updateBypassState();
      },
    },
  });
  Tuna.prototype.Distortion.prototype.updateBypassState = function () {
    // Disconnect everything first
    try {
      this.input.disconnect();
    } catch (e) {
      // may already be disconnected
    }

    if (this._bypass) {
      // Bypass path
      this.input.connect(this.bypassNode);
      this.bypassNode.connect(this.output);
    } else {
      // Distortion path
      this.input.connect(this.driveNode);
      this.driveNode.connect(this.distortion);
      this.distortion.connect(this.output);
    }
  };

  // 💡 Add the curve generation method to the prototype
  Tuna.prototype.Distortion.prototype.setCurve = function (amount) {
    const k = typeof amount === "number" ? amount : 50;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    this.distortion.curve = curve;
  };

  // ring mod==================================================
  Tuna.prototype.RingModulator = function (properties) {
    const defaults = this.defaults || {
      modFrequency: { value: 30 },
      modDepth: { value: 1 },
      bypass: { value: false },
    };

    properties = properties || {};

    this.input = userContext.createGain();
    this.output = userContext.createGain();
    this.modulatorGain = userContext.createGain();
    this.bypassNode = userContext.createGain();

    this._modFrequency =
      typeof properties.modFrequency === "number"
        ? properties.modFrequency
        : defaults.modFrequency.value;
    this._modDepth =
      typeof properties.modDepth === "number"
        ? properties.modDepth
        : defaults.modDepth.value;
    this._bypass = !!properties.bypass;

    // Oscillator acting as LFO
    this.modulator = userContext.createOscillator();
    this.modulator.frequency.value = this._modFrequency;

    // Audio-rate multiplier: modulator * input
    this.modGainNode = userContext.createGain();
    this.modGainNode.gain.value = this._modDepth;

    // Multiply input by modulator using gain modulation
    this.modulator.connect(this.modGainNode.gain);

    // Connect input through modGainNode (modulated signal)
    this.input.connect(this.modGainNode);
    this.modGainNode.connect(this.output);

    // Bypass path
    this.input.connect(this.bypassNode);
    this.bypassNode.connect(this.output);

    // Apply initial bypass state
    this.updateBypassState = function () {
      try {
        this.input.disconnect();
      } catch (e) {}

      if (this._bypass) {
        this.input.connect(this.bypassNode);
        this.bypassNode.connect(this.output);
      } else {
        this.input.connect(this.modGainNode);
        this.modGainNode.connect(this.output);
      }
    };

    this.updateBypassState(); // now works

    // Start the oscillator
    this.modulator.start();
  };
  Tuna.prototype.RingModulator.prototype.updateBypassState = function () {
    try {
      this.input.disconnect();
    } catch (e) {}

    if (this._bypass) {
      // Bypass: input → bypassNode → output
      this.input.connect(this.bypassNode);
      this.bypassNode.connect(this.output);
    } else {
      // Modulated: input → modGainNode → output
      this.input.connect(this.modGainNode);
      this.modGainNode.connect(this.output);
    }
  };
  Tuna.prototype.RingModulator.prototype = Object.create(Super, {
    name: { value: "RingModulator" },
    defaults: {
      writable: true,
      value: {
        modFrequency: {
          value: 30,
          min: 0.1,
          max: 1000,
          automatable: true,
          type: FLOAT,
        },
        modDepth: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        bypass: {
          value: false,
          automatable: false,
          type: BOOLEAN,
        },
      },
    },
    modFrequency: {
      enumerable: true,
      get: function () {
        return this.modulator.frequency.value;
      },
      set: function (value) {
        this._modFrequency = value;
        this.modulator.frequency.setValueAtTime(value, userContext.currentTime);
      },
    },
    modDepth: {
      enumerable: true,
      get: function () {
        return this.modGainNode.gain.value;
      },
      set: function (value) {
        this._modDepth = value;
        this.modGainNode.gain.setValueAtTime(value, userContext.currentTime);
      },
    },
    bypass: {
      enumerable: true,
      get: function () {
        return this._bypass;
      },
      set: function (value) {
        this._bypass = !!value;
        this.updateBypassState();
      },
    },
  });

  //stereo mod/panner==========================================
  Tuna.prototype.ModulatedStereoPanner = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    // Create audio nodes
    this.input = userContext.createGain();
    this.panNode = userContext.createStereoPanner();
    this.modulator = userContext.createOscillator();
    this.modulationGain = userContext.createGain();
    this.output = userContext.createGain();

    // Connect nodes to create the processing chain
    this.input.connect(this.panNode);
    this.modulator.connect(this.modulationGain);
    this.modulationGain.connect(this.panNode.pan);
    this.panNode.connect(this.output);

    // Set default properties or use provided values
    this.pan = properties.pan || this.defaults.pan.value;
    this.rate = properties.rate || this.defaults.rate.value;
    this.depth = properties.depth || this.defaults.depth.value;

    // Configure oscillator and modulation gain
    this.modulator.frequency.value = this.rate;
    this.modulationGain.gain.value = this.depth;

    // Start the modulator oscillator
    this.start = function () {
      this.modulator.start();
    };
  };

  Tuna.prototype.ModulatedStereoPanner.prototype = Object.create(Super, {
    name: {
      value: "ModulatedStereoPanner",
    },
    defaults: {
      writable: true,
      value: {
        pan: {
          value: 0,
          min: -1,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        rate: {
          value: 1,
          min: 0,
          max: 10,
          automatable: true,
          type: FLOAT,
        },
        depth: {
          value: 0.0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    pan: {
      enumerable: true,
      get: function () {
        return this.panNode.pan.value;
      },
      set: function (value) {
        this.panNode.pan.value = value;
      },
    },
    rate: {
      enumerable: true,
      get: function () {
        return this.modulator.frequency.value;
      },
      set: function (value) {
        this.modulator.frequency.value = value;
      },
    },
    depth: {
      enumerable: true,
      get: function () {
        return this.modulationGain.gain.value;
      },
      set: function (value) {
        this.modulationGain.gain.value = value;
      },
    },
  });

  const ARRAY = "array";

  //dimension expander==========================================
  Tuna.prototype.DimensionExpander = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    // Internal bypass state only
    this._bypass = properties.bypass ?? false;
    this.bypassGain = userContext.createGain();

    // Create audio nodes
    this.input = userContext.createGain();
    this.delay1 = userContext.createDelay();
    this.delay2 = userContext.createDelay();
    this.delay3 = userContext.createDelay();
    this.delay4 = userContext.createDelay();
    this.feedback1 = userContext.createGain();
    this.feedback2 = userContext.createGain();
    this.feedback3 = userContext.createGain();
    this.feedback4 = userContext.createGain();
    this.mix1 = userContext.createGain();
    this.mix2 = userContext.createGain();
    this.output = userContext.createGain();

    // Final output connection
    this.bypassGain.connect(userContext.destination);

    // Default signal path
    this.input.connect(this.mix1);
    this.input.connect(this.mix2);
    this.mix1.connect(this.delay1);
    this.mix1.connect(this.delay2);
    this.mix2.connect(this.delay3);
    this.mix2.connect(this.delay4);
    this.delay1.connect(this.feedback1);
    this.delay2.connect(this.feedback2);
    this.delay3.connect(this.feedback3);
    this.delay4.connect(this.feedback4);
    this.feedback1.connect(this.mix1);
    this.feedback2.connect(this.mix1);
    this.feedback3.connect(this.mix2);
    this.feedback4.connect(this.mix2);
    this.mix1.connect(this.output);
    this.mix2.connect(this.output);
    this.output.connect(this.bypassGain);

    // Parameters
    this.delayTimes = properties.delayTimes || this.defaults.delayTimes.value;
    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
    this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;

    this.delay1.delayTime.value = this.delayTimes[0];
    this.delay2.delayTime.value = this.delayTimes[1];
    this.delay3.delayTime.value = this.delayTimes[2];
    this.delay4.delayTime.value = this.delayTimes[3];

    this.feedback1.gain.value = this.feedback;
    this.feedback2.gain.value = this.feedback;
    this.feedback3.gain.value = this.feedback;
    this.feedback4.gain.value = this.feedback;

    this.setWetLevel(this.wetLevel);
    this.setDryLevel(this.dryLevel);
    this.updateBypassState();
  };
  Tuna.prototype.DimensionExpander.prototype = Object.create(Super, {
    name: {
      value: "DimensionExpander",
    },
    defaults: {
      writable: true,
      value: {
        delayTimes: {
          value: [0.002, 0.004, 0.006, 0.008], // Default delay times for each voice
          type: ARRAY,
        },
        feedback: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        wetLevel: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        dryLevel: {
          value: 1.0,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        bypass: {
          value: true,
          type: BOOLEAN,
        },
      },
    },
    delayTimes: {
      enumerable: true,
      get: function () {
        return [
          this.delay1.delayTime.value,
          this.delay2.delayTime.value,
          this.delay3.delayTime.value,
          this.delay4.delayTime.value,
        ];
      },
      set: function (values) {
        if (values.length === 4) {
          this.delay1.delayTime.value = values[0];
          this.delay2.delayTime.value = values[1];
          this.delay3.delayTime.value = values[2];
          this.delay4.delayTime.value = values[3];
        }
      },
    },
    feedback: {
      enumerable: true,
      get: function () {
        return this.feedback1.gain.value;
      },
      set: function (value) {
        this.feedback1.gain.value = value;
        this.feedback2.gain.value = value;
        this.feedback3.gain.value = value;
        this.feedback4.gain.value = value;
      },
    },
    wetLevel: {
      enumerable: true,
      get: function () {
        return this.mix2.gain.value;
      },
      set: function (value) {
        this.mix2.gain.value = value;
        this.mix1.gain.value = 1 - value;
      },
    },
    dryLevel: {
      enumerable: true,
      get: function () {
        return this.mix1.gain.value;
      },
      set: function (value) {
        this.mix1.gain.value = value;
        this.mix2.gain.value = 1 - value;
      },
    },
    setWetLevel: {
      value: function (level) {
        this.wetLevel = Math.min(1, Math.max(0, level)); // Clamp between 0 and 1
        this.mix2.gain.value = this.wetLevel;
        this.mix1.gain.value = 1 - this.wetLevel;
      },
    },
    setDryLevel: {
      value: function (level) {
        this.dryLevel = Math.min(1, Math.max(0, level)); // Clamp between 0 and 1
        this.mix1.gain.value = 1 - this.dryLevel;
        this.mix2.gain.value = this.dryLevel;
      },
    },
    bypass: {
      enumerable: true,
      get: function () {
        return this._bypass || false;
      },
      set: function (val) {
        this._bypass = !!val;
        this.updateBypassState();
      },
    },

    updateBypassState: {
      value: function () {
        // Toggle between dry and effect
        this.output.disconnect();
        this.input.disconnect();

        if (this.bypass) {
          this.input.connect(this.bypassGain);
        } else {
          // Not bypassed: connect full signal chain
          this.input.connect(this.mix1);
          this.input.connect(this.mix2);
          this.mix1.connect(this.delay1);
          this.mix1.connect(this.delay2);
          this.mix2.connect(this.delay3);
          this.mix2.connect(this.delay4);
          this.delay1.connect(this.feedback1);
          this.delay2.connect(this.feedback2);
          this.delay3.connect(this.feedback3);
          this.delay4.connect(this.feedback4);
          this.feedback1.connect(this.mix1);
          this.feedback2.connect(this.mix1);
          this.feedback3.connect(this.mix2);
          this.feedback4.connect(this.mix2);
          this.mix1.connect(this.output);
          this.mix2.connect(this.output);
          this.output.connect(this.bypassGain);
        }
      },
    },
  });

  //filter=======================================================
  const filterTypeMap = {
    0: "lowpass",
    1: "highpass",
    2: "bandpass",
    3: "lowshelf",
    4: "highshelf",
    5: "peaking",
    6: "notch",
    7: "allpass",
  };

  Tuna.prototype.Filter = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.filter = userContext.createBiquadFilter();
    this.output = userContext.createGain();

    this.activateNode.connect(this.filter);
    this.filter.connect(this.output);

    this.frequency = properties.frequency || this.defaults.frequency.value;
    this.Q = properties.resonance || this.defaults.Q.value;
    this.filterType = properties.filterType || this.defaults.filterType.value;
    this.gain = properties.gain || this.defaults.gain.value;
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Filter.prototype = Object.create(Super, {
    name: {
      value: "Filter",
    },
    defaults: {
      writable: true,
      value: {
        frequency: {
          value: 800,
          min: 20,
          max: 22050,
          automatable: true,
          type: FLOAT,
        },
        Q: {
          value: 1,
          min: 0.001,
          max: 100,
          automatable: true,
          type: FLOAT,
        },
        gain: {
          value: 0,
          min: -40,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        bypass: {
          value: true,
          automatable: false,
          type: BOOLEAN,
        },
        filterType: {
          value: 0,
          automatable: false,
          type: STRING,
        },
      },
    },
    filterType: {
      enumerable: true,
      get: function () {
        return this.filter.type;
      },
      set: function (value) {
        if (filterTypeMap[value] !== undefined) {
          this.filter.type = filterTypeMap[value];
        } else {
          console.error(`Invalid filter type: ${value}`);
        }
      },
    },
    Q: {
      enumerable: true,
      get: function () {
        return this.filter.Q;
      },
      set: function (value) {
        this.filter.Q.value = value;
      },
    },
    gain: {
      enumerable: true,
      get: function () {
        return this.filter.gain;
      },
      set: function (value) {
        this.filter.gain.value = value;
      },
    },
    frequency: {
      enumerable: true,
      get: function () {
        return this.filter.frequency;
      },
      set: function (value) {
        this.filter.frequency.value = value;
      },
    },
  });

  //cabinet===================================================
  Tuna.prototype.Cabinet = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }

    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.makeupNode = userContext.createGain();
    this.output = userContext.createGain();
    this.output.gain.value = 0.4;

    // Available impulse responses
    this.impulsePaths = [
      "../Cabinet-Impulses/Ampeg 8x10 D6 AH.wav",
      "../Cabinet-Impulses/Ampeg 8x10 e602 A107.wav",
      "../Cabinet-Impulses/Ampeg 8x10 e602 AH.wav",
      "../Cabinet-Impulses/Brit Class A2-Blackface Twin imp.wav",
      "../Cabinet-Impulses/Brit Class A2-Blackface Deluxe.wav",
      "../Cabinet-Impulses/Brit Class A2-Marshall Vintage 30.wav",
      "../Cabinet-Impulses/Brit Class A2-Matchless Chieftain.wav",
      "../Cabinet-Impulses/Fender 68-Vibrolux SM57.wav",
      "../Cabinet-Impulses/Fender Bassman NeumannUi87.wav",
      "../Cabinet-Impulses/Fender SuperChamp AT4050.wav",
      "../Cabinet-Impulses/Fender Tweed Deluxe.wav",
      "../Cabinet-Impulses/marshall G15R reverb.wav",
      "../Cabinet-Impulses/Marshall Vintage 30.wav",
      "../Cabinet-Impulses/Tube Preamp-Pod 4x12.wav",
      "../Cabinet-Impulses/Tube Preamp-Tweed Champ.wav",
      "../Cabinet-Impulses/Tube Preamp-Tweed Deluxe.wav",
      "../Cabinet-Impulses/Vintage 30 4x12 big.wav",
      "../Cabinet-Impulses/Vintage 30 4x12 close.wav",
      "../Cabinet-Impulses/worcester bright.wav",
      "../Cabinet-Impulses/worcester reissue.wav",
      "../Cabinet-Impulses/worcester stack.wav",
      "../Cabinet-Impulses/worcester standard.wav",
    ];

    // Choose initial IR
    const defaultImpulse =
      localStorage.getItem("cabinetIRSelect") ||
      properties.impulsePath ||
      this.impulsePaths[0];
    this.convolver = this.newConvolver(defaultImpulse);

    // Audio routing
    this.activateNode.connect(this.convolver.input);
    this.convolver.output.connect(this.makeupNode);
    this.makeupNode.connect(this.output);

    // Apply initial gain and bypass settings
    this.makeupGain = properties.makeupGain || this.defaults.makeupGain;
    this.bypass = properties.bypass || false;

    // Optional UI select for IR selection
    const select = document.getElementById("cabinetIRSelect");
    if (select) {
      select.innerHTML = "";
      this.impulsePaths.forEach((path) => {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = path.split("/").pop();
        select.appendChild(option);
      });

      // Set select to current IR
      select.value = defaultImpulse;

      // Handle changes
      select.addEventListener("change", (e) => {
        const path = e.target.value;
        localStorage.setItem("cabinetIRSelect", path);
        this.loadImpulseFromPath(path);
      });
    }
  };

  Tuna.prototype.Cabinet.prototype = Object.create(Super, {
    name: {
      value: "Cabinet",
    },
    defaults: {
      writable: true,
      value: {
        makeupGain: {
          value: 1,
          min: 0,
          max: 20,
          automatable: true,
          type: FLOAT,
        },
        bypass: {
          value: false,
          automatable: false,
          type: BOOLEAN,
        },
      },
    },

    // Create convolver from IR path
    newConvolver: {
      value: function (impulsePath) {
        return new userInstance.Convolver({
          impulse: impulsePath,
          dryLevel: 0,
          wetLevel: 1,
        });
      },
    },

    // Load a new IR and reconnect cleanly
    loadImpulseFromPath: {
      value: function (path) {
        const newConvolver = this.newConvolver(path);

        // Disconnect old convolver
        try {
          this.activateNode.disconnect();
          this.convolver.output.disconnect();
        } catch (e) {
          console.warn("Cabinet disconnect warning:", e);
        }

        // Reconnect new convolver
        this.activateNode.connect(newConvolver.input);
        newConvolver.output.connect(this.makeupNode);
        this.convolver = newConvolver;
      },
    },
    makeupGain: {
      enumerable: true,
      get: function () {
        return this.makeupNode.gain;
      },
      set: function (value) {
        this.makeupNode.gain.value = value;
      },
    },
  });

  //chorus======================================================
  Tuna.prototype.Chorus = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.attenuator = this.activateNode = userContext.createGain();
    this.splitter = userContext.createChannelSplitter(2);
    this.delayL = userContext.createDelay();
    this.delayR = userContext.createDelay();
    this.feedbackGainNodeLR = userContext.createGain();
    this.feedbackGainNodeRL = userContext.createGain();
    this.merger = userContext.createChannelMerger(2);
    this.output = userContext.createGain();

    // Create gain nodes for wet and dry signals
    this.wetGainNode = userContext.createGain();
    this.dryGainNode = userContext.createGain();

    this.lfoL = new userInstance.LFO({
      target: this.delayL.delayTime,
      callback: pipe,
    });
    this.lfoR = new userInstance.LFO({
      target: this.delayR.delayTime,
      callback: pipe,
    });

    this.input.connect(this.attenuator);

    this.attenuator.connect(this.dryGainNode); // Connect attenuator to dryGainNode
    this.attenuator.connect(this.wetGainNode); // Connect attenuator to wetGainNode
    this.dryGainNode.connect(this.output); // Connect dry signal to output
    this.wetGainNode.connect(this.output); // Connect wet signal to output

    this.attenuator.connect(this.splitter);
    this.splitter.connect(this.delayL, 0);
    this.splitter.connect(this.delayR, 1);
    this.delayL.connect(this.feedbackGainNodeLR);
    this.delayR.connect(this.feedbackGainNodeRL);
    this.feedbackGainNodeLR.connect(this.delayR);
    this.feedbackGainNodeRL.connect(this.delayL);
    this.delayL.connect(this.merger, 0, 0);
    this.delayR.connect(this.merger, 0, 1);
    this.merger.connect(this.wetGainNode);

    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.rate = properties.rate || this.defaults.rate.value;
    this.delay = properties.delay || this.defaults.delay.value;
    this.depth = properties.depth || this.defaults.depth.value;
    this.wetDryMix = properties.wetDryMix || this.defaults.wetDryMix.value;
    this.lfoR.phase = Math.PI / 2;
    this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
    this.lfoL.activate(true);
    this.lfoR.activate(true);
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Chorus.prototype = Object.create(Super, {
    name: {
      value: "Chorus",
    },
    defaults: {
      writable: true,
      value: {
        feedback: {
          value: 0.4,
          min: 0,
          max: 0.95,
          automatable: false,
          type: FLOAT,
        },
        delay: {
          value: 0.0045,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        depth: {
          value: 0.7,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        rate: {
          value: 1.5,
          min: 0,
          max: 8,
          automatable: false,
          type: FLOAT,
        },
        wetDryMix: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        bypass: {
          value: true,
          automatable: false,
          type: BOOLEAN,
        },
      },
    },
    delay: {
      enumerable: true,
      get: function () {
        return this._delay;
      },
      set: function (value) {
        this._delay = 0.0002 * (Math.pow(10, value) * 2);
        this.lfoL.offset = this._delay;
        this.lfoR.offset = this._delay;
        this._depth = this._depth;
      },
    },
    depth: {
      enumerable: true,
      get: function () {
        return this._depth;
      },
      set: function (value) {
        this._depth = value;
        this.lfoL.oscillation = this._depth * this._delay;
        this.lfoR.oscillation = this._depth * this._delay;
      },
    },
    feedback: {
      enumerable: true,
      get: function () {
        return this._feedback;
      },
      set: function (value) {
        this._feedback = value;
        this.feedbackGainNodeLR.gain.value = this._feedback;
        this.feedbackGainNodeRL.gain.value = this._feedback;
      },
    },
    rate: {
      enumerable: true,
      get: function () {
        return this._rate;
      },
      set: function (value) {
        this._rate = value;
        this.lfoL.frequency = this._rate;
        this.lfoR.frequency = this._rate;
      },
    },
    wetDryMix: {
      // Define getter and setter for wet/dry mix
      enumerable: true,
      get: function () {
        return this._wetDryMix;
      },
      set: function (value) {
        this._wetDryMix = value;
        var wet = this._wetDryMix;
        var dry = 1 - this._wetDryMix;
        this.dryGainNode.gain.value = dry;
        this.wetGainNode.gain.value = wet;
      },
    },
  });

  //compressor==================================================
  Tuna.prototype.Compressor = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.compNode = this.activateNode = userContext.createDynamicsCompressor();
    this.makeupNode = userContext.createGain();
    this.output = userContext.createGain();

    this.compNode.connect(this.makeupNode);
    this.makeupNode.connect(this.output);

    this.automakeup = properties.automakeup || this.defaults.automakeup.value;
    this.makeupGain = properties.makeupGain || this.defaults.makeupGain.value;
    this.threshold = properties.threshold || this.defaults.threshold.value;
    this.release = properties.release || this.defaults.release.value;
    this.attack = properties.attack || this.defaults.attack.value;
    this.ratio = properties.ratio || this.defaults.ratio.value;
    this.knee = properties.knee || this.defaults.knee.value;
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Compressor.prototype = Object.create(Super, {
    name: {
      value: "Compressor",
    },
    defaults: {
      writable: true,
      value: {
        threshold: {
          value: -20,
          min: -60,
          max: 0,
          automatable: true,
          type: FLOAT,
        },
        release: {
          value: 250,
          min: 10,
          max: 2000,
          automatable: true,
          type: FLOAT,
        },
        makeupGain: {
          value: 1,
          min: 1,
          max: 100,
          automatable: true,
          type: FLOAT,
        },
        attack: {
          value: 1,
          min: 0,
          max: 1000,
          automatable: true,
          type: FLOAT,
        },
        ratio: {
          value: 4,
          min: 1,
          max: 50,
          automatable: true,
          type: FLOAT,
        },
        knee: {
          value: 5,
          min: 0,
          max: 40,
          automatable: true,
          type: FLOAT,
        },
        automakeup: {
          value: false,
          automatable: false,
          type: BOOLEAN,
        },
        bypass: {
          value: true,
          automatable: false,
          type: BOOLEAN,
        },
      },
    },
    computeMakeup: {
      value: function () {
        var magicCoefficient = 4,
          // raise me if the output is too hot
          c = this.compNode;
        return (
          -(c.threshold.value - c.threshold.value / c.ratio.value) /
          magicCoefficient
        );
      },
    },
    automakeup: {
      enumerable: true,
      get: function () {
        return this._automakeup;
      },
      set: function (value) {
        this._automakeup = value;
        if (this._automakeup) this.makeupGain = this.computeMakeup();
      },
    },
    threshold: {
      enumerable: true,
      get: function () {
        return this.compNode.threshold;
      },
      set: function (value) {
        this.compNode.threshold.value = value;
        if (this._automakeup) this.makeupGain = this.computeMakeup();
      },
    },
    ratio: {
      enumerable: true,
      get: function () {
        return this.compNode.ratio;
      },
      set: function (value) {
        this.compNode.ratio.value = value;
        if (this._automakeup) this.makeupGain = this.computeMakeup();
      },
    },
    knee: {
      enumerable: true,
      get: function () {
        return this.compNode.knee;
      },
      set: function (value) {
        this.compNode.knee.value = value;
        if (this._automakeup) this.makeupGain = this.computeMakeup();
      },
    },
    attack: {
      enumerable: true,
      get: function () {
        return this.compNode.attack;
      },
      set: function (value) {
        this.compNode.attack.value = value / 1000;
      },
    },
    release: {
      enumerable: true,
      get: function () {
        return this.compNode.release;
      },
      set: function (value) {
        this.compNode.release = value / 1000;
      },
    },
    makeupGain: {
      enumerable: true,
      get: function () {
        return this.makeupNode.gain;
      },
      set: function (value) {
        this.makeupNode.gain.value = dbToWAVolume(value);
      },
    },
  });

  //Convolver effect===============================================
  Tuna.prototype.Convolver = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.convolver = userContext.createConvolver();
    this.dry = userContext.createGain();
    this.filterLow = userContext.createBiquadFilter();
    this.filterHigh = userContext.createBiquadFilter();
    this.wet = userContext.createGain();
    this.output = userContext.createGain();

    this.activateNode.connect(this.filterLow);
    this.activateNode.connect(this.dry);
    this.filterLow.connect(this.filterHigh);
    this.filterHigh.connect(this.convolver);
    this.convolver.connect(this.wet);
    this.wet.connect(this.output);
    this.dry.connect(this.output);

    this.impulseDuration = properties.impulseDuration || 1;
    this.impulseDecay = properties.impulseDecay || 1;

    // generate an impulse response
    function impulseResponse(duration, decay) {
      var length = userContext.sampleRate * duration;
      var impulse = userContext.createBuffer(2, length, userContext.sampleRate); // Creating a stereo buffer
      var leftChannel = impulse.getChannelData(0); // Getting the left channel
      var rightChannel = impulse.getChannelData(1); // Getting the right channel
      for (var i = 0; i < length; i++) {
        // Generating random values for both channels
        var randomValue =
          (2 * Math.random() - 1) * Math.pow(1 - i / length, decay);
        leftChannel[i] = randomValue; // Assigning to the left channel
        rightChannel[i] = randomValue; // Assigning to the right channel
      }
      return impulse;
    }

    // Generate an impulse response with duration 1 second and decay 1
    var impulse = impulseResponse(1, 1);

    // Set the properties of the Convolver effect
    this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;
    this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
    this.highCut = properties.highCut || this.defaults.highCut.value;
    // Set the generated impulse as the buffer
    this.buffer = impulse;
    this.lowCut = properties.lowCut || this.defaults.lowCut.value;
    this.level = properties.level || this.defaults.level.value;
    this.filterHigh.type = "highpass";
    this.filterLow.type = "lowpass";
    this.bypass = properties.bypass || false;
  };

  Tuna.prototype.Convolver.prototype = Object.create(Super, {
    name: {
      value: "Convolver",
    },
    defaults: {
      writable: true,
      value: {
        highCut: {
          value: 22050,
          min: 20,
          max: 22050,
          automatable: true,
          type: FLOAT,
        },
        lowCut: {
          value: 20,
          min: 20,
          max: 22050,
          automatable: true,
          type: FLOAT,
        },
        dryLevel: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        wetLevel: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        level: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    lowCut: {
      get: function () {
        return this.filterLow.frequency;
      },
      set: function (value) {
        this.filterLow.frequency.value = value;
      },
    },
    highCut: {
      get: function () {
        return this.filterHigh.frequency;
      },
      set: function (value) {
        this.filterHigh.frequency.value = value;
      },
    },
    level: {
      get: function () {
        return this.output.gain;
      },
      set: function (value) {
        this.output.gain.value = value;
      },
    },
    dryLevel: {
      get: function () {
        return this.dry.gain;
      },
      set: function (value) {
        this.dry.gain.value = value;
      },
    },
    wetLevel: {
      get: function () {
        return this.wet.gain;
      },
      set: function (value) {
        this.wet.gain.value = value;
      },
    },
    buffer: {
      enumerable: false,
      get: function () {
        return this.convolver.buffer;
      },
      set: function (impulse) {
        if (!impulse) {
          console.log("Tuna.Convolver.setBuffer: Missing impulse data!");
          return;
        }
        this.convolver.buffer = impulse;
        console.log("Convolver buffer set:", this.convolver.buffer);
      },
    },
    impulseDuration: {
      writable: true,
      configurable: true,
      value: 1, // default duration in seconds
    },
    impulseDecay: {
      writable: true,
      configurable: true,
      value: 1, // default decay
    },
    generateImpulse: {
      value: function () {
        const duration = this.impulseDuration;
        const decay = this.impulseDecay;
        const length = userContext.sampleRate * duration;
        const impulse = userContext.createBuffer(
          2,
          length,
          userContext.sampleRate
        );
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
          const val = (2 * Math.random() - 1) * Math.pow(1 - i / length, decay);
          left[i] = val;
          right[i] = val;
        }
        return impulse;
      },
      writable: true,
      configurable: true,
    },
    regenerateImpulse: {
      value: function () {
        this.buffer = this.generateImpulse();
      },
      writable: true,
      configurable: true,
    },
  });

  //delay=========================================================
  Tuna.prototype.Delay = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.dry = userContext.createGain();
    this.wet = userContext.createGain();
    this.filter = userContext.createBiquadFilter();
    this.delay = userContext.createDelay();
    this.feedbackNode = userContext.createGain();
    this.output = userContext.createGain();

    this.input.connect(this.activateNode);
    this.input.connect(this.output);
    this.activateNode.connect(this.delay);
    this.activateNode.connect(this.dry);
    this.delay.connect(this.filter);
    this.filter.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delay);
    this.feedbackNode.connect(this.wet);
    this.wet.connect(this.output);
    this.dry.connect(this.output);

    this.delayTime = properties.delayTime || this.defaults.delayTime.value;
    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
    this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;
    this.cutoff = properties.cutoff || this.defaults.cutoff.value;
    this.filter.type = "lowpass";
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Delay.prototype.setBypass = function (isBypassed) {
    this.bypass = isBypassed;

    if (this.bypass) {
      // Disconnect activateNode to cut effect
      this.input.disconnect(this.activateNode);
      this.dry.disconnect(this.output);
      this.wet.disconnect(this.output);
      this.feedbackNode.disconnect(this.wet);
    } else {
      // Reconnect full signal chain
      this.input.connect(this.activateNode);
      this.dry.connect(this.output);
      this.wet.connect(this.output);
      this.feedbackNode.connect(this.wet);
    }
  };
  Object.defineProperty(Tuna.prototype.Delay.prototype, "bypass", {
    get: function () {
      return this._bypass;
    },
    set: function (value) {
      this.setBypass(value);
      this._bypass = value;
    },
    enumerable: true,
  });

  Tuna.prototype.Delay.prototype = Object.create(Super, {
    name: {
      value: "Delay",
    },
    defaults: {
      writable: true,
      value: {
        delayTime: {
          value: 100,
          min: 20,
          max: 1000,
          automatable: false,
          type: FLOAT,
        },
        feedback: {
          value: 0.45,
          min: 0,
          max: 0.9,
          automatable: true,
          type: FLOAT,
        },
        cutoff: {
          value: 20000,
          min: 20,
          max: 20000,
          automatable: true,
          type: FLOAT,
        },
        wetLevel: {
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
        dryLevel: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    delayTime: {
      enumerable: true,
      get: function () {
        return this.delay.delayTime;
      },
      set: function (value) {
        this.delay.delayTime.value = value / 1000;
      },
    },
    wetLevel: {
      enumerable: true,
      get: function () {
        return this.wet.gain;
      },
      set: function (value) {
        this.wet.gain.value = value;
      },
    },
    dryLevel: {
      enumerable: true,
      get: function () {
        return this.dry.gain;
      },
      set: function (value) {
        this.dry.gain.value = value;
      },
    },
    feedback: {
      enumerable: true,
      get: function () {
        return this.feedbackNode.gain;
      },
      set: function (value) {
        this.feedbackNode.gain.value = value;
      },
    },
    cutoff: {
      enumerable: true,
      get: function () {
        return this.filter.frequency;
      },
      set: function (value) {
        this.filter.frequency.value = value;
      },
    },
  });

  //overdrive======================================================
  Tuna.prototype.Overdrive = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.inputDrive = userContext.createGain();
    this.waveshaper = userContext.createWaveShaper();
    this.outputDrive = userContext.createGain();
    this.output = userContext.createGain();

    this.activateNode.connect(this.inputDrive);
    this.inputDrive.connect(this.waveshaper);
    this.waveshaper.connect(this.outputDrive);
    this.outputDrive.connect(this.output);

    this.ws_table = new Float32Array(this.k_nSamples);
    this.drive = properties.drive || this.defaults.drive.value;
    this.outputGain = properties.outputGain || this.defaults.outputGain.value;
    this.curveAmount =
      properties.curveAmount || this.defaults.curveAmount.value;
    this.algorithmIndex =
      properties.algorithmIndex || this.defaults.algorithmIndex.value;
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Overdrive.prototype = Object.create(Super, {
    name: {
      value: "Overdrive",
    },
    defaults: {
      writable: true,
      value: {
        drive: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
          scaled: true,
        },
        outputGain: {
          value: 1,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
          scaled: true,
        },
        curveAmount: {
          value: 0.725,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        algorithmIndex: {
          value: 0,
          min: 0,
          max: 5,
          automatable: false,
          type: INT,
        },
      },
    },
    k_nSamples: {
      value: 8192,
    },
    drive: {
      get: function () {
        return this._drive;
      },
      set: function (value) {
        this._drive = value;
        this.inputDrive.gain.value = value; // Apply value to the gain node
      },
    },
    curveAmount: {
      get: function () {
        return this._curveAmount;
      },
      set: function (value) {
        this._curveAmount = value;
        if (this._algorithmIndex === undefined) {
          this._algorithmIndex = 0;
        }
        this.waveshaperAlgorithms[this._algorithmIndex](
          this._curveAmount,
          this.k_nSamples,
          this.ws_table
        );
        this.waveshaper.curve = this.ws_table;
      },
    },
    outputGain: {
      get: function () {
        return this._outputGain;
      },
      set: function (value) {
        this._outputGain = dbToWAVolume(value);
        this.outputDrive.gain.value = this._outputGain;
      },
    },
    algorithmIndex: {
      get: function () {
        return this._algorithmIndex;
      },
      set: function (value) {
        this._algorithmIndex = value;
        this.curveAmount = this._curveAmount;
      },
    },
    waveshaperAlgorithms: {
      value: [
        function (amount, n_samples, ws_table) {
          amount = Math.min(amount, 0.9999);
          var k = (2 * amount) / (1 - amount),
            i,
            x;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            ws_table[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
          }
        },
        function (amount, n_samples, ws_table) {
          var i, x, y;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            y = (0.5 * Math.pow(x + 1.4, 2) - 1) * y >= 0 ? 5.8 : 1.2;
            ws_table[i] = tanh(y);
          }
        },
        function (amount, n_samples, ws_table) {
          var i,
            x,
            y,
            a = 1 - amount;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
            ws_table[i] = tanh(y * 2);
          }
        },
        function (amount, n_samples, ws_table) {
          var i,
            x,
            y,
            abx,
            a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            abx = Math.abs(x);
            if (abx < a) y = abx;
            else if (abx > a)
              y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
            else if (abx > 1) y = abx;
            ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
          }
        },
        function (amount, n_samples, ws_table) {
          var i, x;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            if (x < -0.08905) {
              ws_table[i] =
                (-3 / 4) *
                  (1 -
                    Math.pow(1 - (Math.abs(x) - 0.032857), 12) +
                    (1 / 3) * (Math.abs(x) - 0.032847)) +
                0.01;
            } else if (x >= -0.08905 && x < 0.320018) {
              ws_table[i] = -6.153 * (x * x) + 3.9375 * x;
            } else {
              ws_table[i] = 0.630035;
            }
          }
        },
        function (amount, n_samples, ws_table) {
          var a = 2 + Math.round(amount * 14),
            bits = Math.round(Math.pow(2, a - 1)),
            i,
            x;
          for (i = 0; i < n_samples; i++) {
            x = (i * 2) / n_samples - 1;
            ws_table[i] = Math.round(x * bits) / bits;
          }
        },
      ],
    },
  });

  //phaser==========================================================
  Tuna.prototype.Phaser = function (properties) {
    const proto = Tuna.prototype.Phaser.prototype;

    if (!properties) properties = proto.defaults;

    this.defaults = proto.defaults;
    this.callback = proto.callback;
    this.stage = properties.stage || proto.stage.value;

    this.input = userContext.createGain();
    this.splitter = this.activateNode = userContext.createChannelSplitter(2);
    this.filtersL = [];
    this.filtersR = [];
    this.feedbackGainNodeL = userContext.createGain();
    this.feedbackGainNodeR = userContext.createGain();
    this.merger = userContext.createChannelMerger(2);
    this.output = userContext.createGain();

    // Dry and wet paths
    this.dryGainNode = userContext.createGain();
    this.wetGainNode = userContext.createGain();

    // Create filter chains
    for (let i = 0; i < this.stage; i++) {
      this.filtersL[i] = userContext.createBiquadFilter();
      this.filtersR[i] = userContext.createBiquadFilter();
      this.filtersL[i].type = "allpass";
      this.filtersR[i].type = "allpass";
    }

    // Create LFOs after filters
    this.lfoL = new userInstance.LFO({
      target: this.filtersL,
      callback: this.callback,
    });
    this.lfoR = new userInstance.LFO({
      target: this.filtersR,
      callback: this.callback,
    });

    // Input -> Dry/Wet Split
    this.input.connect(this.dryGainNode);
    this.input.connect(this.splitter);

    // Filter routing
    this.splitter.connect(this.filtersL[0], 0);
    this.splitter.connect(this.filtersR[0], 0);
    this.connectInOrder(this.filtersL);
    this.connectInOrder(this.filtersR);

    this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
    this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
    this.feedbackGainNodeL.connect(this.filtersL[0]);

    this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
    this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
    this.feedbackGainNodeR.connect(this.filtersR[0]);

    // Merger to wet gain
    this.merger.connect(this.wetGainNode);

    // Mix dry and wet to output
    this.dryGainNode.connect(this.output);
    this.wetGainNode.connect(this.output);

    this.rate = properties.rate || this.defaults.rate.value;
    this.baseModulationFrequency =
      properties.baseModulationFrequency ||
      this.defaults.baseModulationFrequency.value;
    this.depth = properties.depth || this.defaults.depth.value;
    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.stereoPhase =
      properties.stereoPhase || this.defaults.stereoPhase.value;
    this.wetDryMix = properties.wetDryMix || 0.5;

    // Mix levels
    this.wetGainNode.gain.value = this.wetDryMix;
    this.dryGainNode.gain.value = 1 - this.wetDryMix;

    this.lfoL.activate(true);
    this.lfoR.activate(true);
    this.bypass = properties.bypass || false;
  };

  Tuna.prototype.Phaser.prototype = Object.create(Super, {
    name: {
      value: "Phaser",
    },
    stage: {
      value: 4,
    },
    defaults: {
      writable: true,
      value: {
        rate: {
          value: 0.1,
          min: 0,
          max: 8,
          automatable: false,
          type: FLOAT,
        },
        depth: {
          value: 0.6,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        feedback: {
          value: 0.7,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        stereoPhase: {
          value: 40,
          min: 0,
          max: 180,
          automatable: false,
          type: FLOAT,
        },
        baseModulationFrequency: {
          value: 700,
          min: 500,
          max: 1500,
          automatable: false,
          type: FLOAT,
        },
        stage: {
          value: 4,
          min: 1,
          max: 12,
          automatable: false,
        },
      },
    },
    callback: {
      value: function (filters, value) {
        for (var stage = 0; stage < filters.length; stage++) {
          filters[stage].frequency.value = value;
        }
      },
    },
    depth: {
      get: function () {
        return this._depth;
      },
      set: function (value) {
        this._depth = value;
        this.lfoL.oscillation = this._baseModulationFrequency * value;
        this.lfoR.oscillation = this._baseModulationFrequency * value;
      },
    },
    rate: {
      get: function () {
        return this._rate;
      },
      set: function (value) {
        this._rate = value;
        this.lfoL.frequency = value;
        this.lfoR.frequency = value;
      },
    },
    baseModulationFrequency: {
      get: function () {
        return this._baseModulationFrequency;
      },
      set: function (value) {
        this._baseModulationFrequency = value;
        this.lfoL.offset = value;
        this.lfoR.offset = value;
        this.depth = this._depth;
      },
    },
    feedback: {
      get: function () {
        return this._feedback;
      },
      set: function (value) {
        this._feedback = value;
        this.feedbackGainNodeL.gain.value = value;
        this.feedbackGainNodeR.gain.value = value;
      },
    },
    stereoPhase: {
      get: function () {
        return this._stereoPhase;
      },
      set: function (value) {
        this._stereoPhase = value;
        var newPhase = this.lfoL._phase + (value * Math.PI) / 180;
        this.lfoR._phase = newPhase % (2 * Math.PI);
      },
    },
  });

  //tremolo======================================================
  Tuna.prototype.Tremolo = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    (this.splitter = this.activateNode = userContext.createChannelSplitter(2)),
      (this.amplitudeL = userContext.createGain()),
      (this.amplitudeR = userContext.createGain()),
      (this.merger = userContext.createChannelMerger(2)),
      (this.output = userContext.createGain());
    this.lfoL = new userInstance.LFO({
      target: this.amplitudeL.gain,
      callback: pipe,
    });
    this.lfoR = new userInstance.LFO({
      target: this.amplitudeR.gain,
      callback: pipe,
    });

    this.input.connect(this.splitter);
    this.splitter.connect(this.amplitudeL, 0);
    this.splitter.connect(this.amplitudeR, 1);
    this.amplitudeL.connect(this.merger, 0, 0);
    this.amplitudeR.connect(this.merger, 0, 1);
    this.merger.connect(this.output);

    this.rate = properties.rate || this.defaults.rate.value;
    this.intensity = properties.intensity || this.defaults.intensity.value;
    this.stereoPhase =
      properties.stereoPhase || this.defaults.stereoPhase.value;

    this.lfoL.offset = 1 - this.intensity / 2;
    this.lfoR.offset = 1 - this.intensity / 2;
    this.lfoL.phase = (this.stereoPhase * Math.PI) / 180;

    this.lfoL.activate(true);
    this.lfoR.activate(true);
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.Tremolo.prototype = Object.create(Super, {
    name: {
      value: "Tremolo",
    },
    defaults: {
      writable: true,
      value: {
        intensity: {
          value: 0.3,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        stereoPhase: {
          value: 0,
          min: 0,
          max: 180,
          automatable: false,
          type: FLOAT,
        },
        rate: {
          value: 5,
          min: 0.1,
          max: 11,
          automatable: false,
          type: FLOAT,
        },
      },
    },
    intensity: {
      enumerable: true,
      get: function () {
        return this._intensity;
      },
      set: function (value) {
        this._intensity = value;
        this.lfoL.offset = 1 - this._intensity / 2;
        this.lfoR.offset = 1 - this._intensity / 2;
        this.lfoL.oscillation = this._intensity;
        this.lfoR.oscillation = this._intensity;
      },
    },
    rate: {
      enumerable: true,
      get: function () {
        return this._rate;
      },
      set: function (value) {
        this._rate = value;
        this.lfoL.frequency = this._rate;
        this.lfoR.frequency = this._rate;
      },
    },
    stereoPhase: {
      enumerable: true,
      get: function () {
        return this._rate;
      },
      set: function (value) {
        this._stereoPhase = value;
        var newPhase = this.lfoL._phase + (this._stereoPhase * Math.PI) / 180;
        newPhase = fmod(newPhase, 2 * Math.PI);
        this.lfoR.phase = newPhase;
      },
    },
  });

  //lfo===========================================================
  Tuna.prototype.LFO = function (properties) {
    this.output = userContext.createScriptProcessor(256, 1, 1);
    this.activateNode = userContext.destination;

    this.frequency = properties.frequency || this.defaults.frequency.value;
    this.offset = properties.offset || this.defaults.offset.value;
    this.oscillation =
      properties.oscillation || this.defaults.oscillation.value;
    this.phase = properties.phase || this.defaults.phase.value;
    this.target = properties.target || {};
    this.output.onaudioprocess = this.callback(
      properties.callback || function () {}
    );
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.LFO.prototype = Object.create(Super, {
    name: {
      value: "LFO",
    },
    bufferSize: {
      value: 256,
    },
    sampleRate: {
      value: 44100,
    },
    defaults: {
      value: {
        frequency: {
          value: 1,
          min: 0,
          max: 20,
          automatable: false,
          type: FLOAT,
        },
        offset: {
          value: 0.85,
          min: 0,
          max: 22049,
          automatable: false,
          type: FLOAT,
        },
        oscillation: {
          value: 0.3,
          min: -22050,
          max: 22050,
          automatable: false,
          type: FLOAT,
        },
        phase: {
          value: 0,
          min: 0,
          max: 2 * Math.PI,
          automatable: false,
          type: FLOAT,
        },
      },
    },
    frequency: {
      get: function () {
        return this._frequency;
      },
      set: function (value) {
        this._frequency = value;
        this._phaseInc =
          (2 * Math.PI * this._frequency * this.bufferSize) / this.sampleRate;
      },
    },
    offset: {
      get: function () {
        return this._offset;
      },
      set: function (value) {
        this._offset = value;
      },
    },
    oscillation: {
      get: function () {
        return this._oscillation;
      },
      set: function (value) {
        this._oscillation = value;
      },
    },
    phase: {
      get: function () {
        return this._phase;
      },
      set: function (value) {
        this._phase = value;
      },
    },
    target: {
      get: function () {
        return this._target;
      },
      set: function (value) {
        this._target = value;
      },
    },
    activate: {
      value: function (doActivate) {
        if (!doActivate) {
          this.output.disconnect(userContext.destination);
        } else {
          this.output.connect(userContext.destination);
        }
      },
    },
    callback: {
      value: function (callback) {
        var that = this;
        return function () {
          that._phase += that._phaseInc;
          if (that._phase > 2 * Math.PI) {
            that._phase = 0;
          }
          callback(
            that._target,
            that._offset + that._oscillation * Math.sin(that._phase)
          );
        };
      },
    },
  });
  Tuna.toString = Tuna.prototype.toString = function () {
    return "You are running Tuna version " + version + " by Dinahmoe!";
  };
  if (typeof define === "function") {
    define("Tuna", [], function () {
      return Tuna;
    });
  } else {
    window.Tuna = Tuna;
  }
})(this);
