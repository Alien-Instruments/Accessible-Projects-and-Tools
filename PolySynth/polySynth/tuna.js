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
          var i = nodeArray.length - 1;
          while (i--) {
            if (!nodeArray[i].connect) {
              return console.error(
                "AudioNode.connectInOrder: TypeError: Not an AudioNode.",
                nodeArray[i]
              );
            }
            if (nodeArray[i + 1].input) {
              nodeArray[i].connect(nodeArray[i + 1].input);
            } else {
              nodeArray[i].connect(nodeArray[i + 1]);
            }
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

  //Three band EQ=================================================
  Tuna.prototype.EQ3Band = function (properties) {
    // If properties are not provided, use default values
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

  // Define the EQ3Band prototype
  Tuna.prototype.EQ3Band.prototype = Object.create(Super, {
    // Name of the effect
    name: {
      value: "EQ3Band",
    },
    // Default parameters
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
    // Getters and setters for properties
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

  //stereo mod/panner
  Tuna.prototype.ModulatedStereoPanner = function (properties) {
    // If properties are not provided, use default values
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
    //this.activateNode.connect(this.input);
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
    this.modulator.start();
  };

  // Define the ModulatedStereoPanner prototype
  Tuna.prototype.ModulatedStereoPanner.prototype = Object.create(Super, {
    // Name of the effect
    name: {
      value: "ModulatedStereoPanner",
    },
    // Default parameters
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
    // Getters and setters for properties
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

  //dimension expander==========================
  Tuna.prototype.DimensionExpander = function (properties) {
    // If properties are not provided, use default values
    if (!properties) {
      properties = this.getDefaults();
    }

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

    // Connect nodes to create the processing chain
    this.input.connect(this.output);
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

    // Set default properties or use provided values
    this.delayTimes = properties.delayTimes || this.defaults.delayTimes.value;
    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.wetLevel = properties.wetLevel || this.defaults.wetLevel.value;
    this.dryLevel = properties.dryLevel || this.defaults.dryLevel.value;

    // Configure delays and feedback gains
    this.delay1.delayTime.value = this.delayTimes[0];
    this.delay2.delayTime.value = this.delayTimes[1];
    this.delay3.delayTime.value = this.delayTimes[2];
    this.delay4.delayTime.value = this.delayTimes[3];
    this.feedback1.gain.value = this.feedback;
    this.feedback2.gain.value = this.feedback;
    this.feedback3.gain.value = this.feedback;
    this.feedback4.gain.value = this.feedback;

    // Set initial wet/dry levels
    this.setWetLevel(this.wetLevel);
    this.setDryLevel(this.dryLevel);
  };

  // Define the DimensionExpander prototype
  Tuna.prototype.DimensionExpander.prototype = Object.create(Super, {
    // Name of the effect
    name: {
      value: "DimensionExpander",
    },
    // Default parameters
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
          value: 0.5,
          min: 0,
          max: 1,
          automatable: true,
          type: FLOAT,
        },
      },
    },
    // Getters and setters for properties
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
    // Functions to set wet and dry levels
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
  });

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
          value: "lowpass",
          automatable: false,
          type: STRING,
        },
      },
    },
    filterType: {
      enumerable: true,
      get: function () {
        return filterTypeMap[this.filter.type];
      },
      set: function (value) {
        for (let type in filterTypeMap) {
          if (filterTypeMap[type] === value) {
            this.filter.type = parseInt(type);
            return;
          }
        }
        this.filter.type = 1; // Defaulting to lowpass
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
  Tuna.prototype.Cabinet = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.convolver = this.newConvolver(
      properties.impulsePath || "../impulses/impulse_guitar.wav"
    );
    this.makeupNode = userContext.createGain();
    this.output = userContext.createGain();

    this.activateNode.connect(this.convolver.input);
    this.convolver.output.connect(this.makeupNode);
    this.makeupNode.connect(this.output);

    this.makeupGain = properties.makeupGain || this.defaults.makeupGain;
    this.bypass = properties.bypass || false;
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
    makeupGain: {
      enumerable: true,
      get: function () {
        return this.makeupNode.gain;
      },
      set: function (value) {
        this.makeupNode.gain.value = value;
      },
    },
    newConvolver: {
      value: function (impulsePath) {
        return new userInstance.Convolver({
          impulse: impulsePath,
          dryLevel: 0,
          wetLevel: 1,
        });
      },
    },
  });
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
    this.wetDryMix = properties.wetDryMix || this.defaults.wetDryMix.value; // Add wet/dry mix property
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
          // Add wet/dry mix property to defaults
          value: 0.5, // default to equal parts wet and dry
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
        var wet = this._wetDryMix; // Scale the wet signal by the wetDryMix
        var dry = 1 - this._wetDryMix; // Scale the dry signal by the inverse of wetDryMix
        this.dryGainNode.gain.value = dry; // Adjust dry signal gain
        this.wetGainNode.gain.value = wet; // Adjust wet signal gain
      },
    },
  });

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
  // Define your Convolver effect constructor
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

    // Function to generate an impulse response
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
    this.filterHigh.type = "lowpass";
    this.filterLow.type = "highpass";
    this.bypass = properties.bypass || false;
  };

  // Prototype definition for the Convolver effect
  Tuna.prototype.Convolver.prototype = Object.create(Super, {
    name: {
      value: "Convolver",
    },
    // Default properties for the Convolver effect
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
    // Getter and setter for lowCut frequency
    lowCut: {
      get: function () {
        return this.filterLow.frequency;
      },
      set: function (value) {
        this.filterLow.frequency.value = value;
      },
    },
    // Getter and setter for highCut frequency
    highCut: {
      get: function () {
        return this.filterHigh.frequency;
      },
      set: function (value) {
        this.filterHigh.frequency.value = value;
      },
    },
    // Getter and setter for output gain level
    level: {
      get: function () {
        return this.output.gain;
      },
      set: function (value) {
        this.output.gain.value = value;
      },
    },
    // Getter and setter for dry signal gain level
    dryLevel: {
      get: function () {
        return this.dry.gain;
      },
      set: function (value) {
        this.dry.gain.value = value;
      },
    },
    // Getter and setter for wet signal gain level
    wetLevel: {
      get: function () {
        return this.wet.gain;
      },
      set: function (value) {
        this.wet.gain.value = value;
      },
    },
    // Getter and setter for the impulse response buffer
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
        // Set the generated impulse directly to the convolver buffer
        this.convolver.buffer = impulse;
        console.log("Convolver buffer set:", this.convolver.buffer);
      },
    },
  });

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
        return this.inputDrive.gain;
      },
      set: function (value) {
        this._drive = value;
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
        return this.outputDrive.gain;
      },
      set: function (value) {
        this._outputGain = dbToWAVolume(value);
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
          // fixed curve, amount doesn't do anything, the distortion is just from the drive
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
            // we go from 2 to 16 bits, keep in mind for the UI
            bits = Math.round(Math.pow(2, a - 1)),
            // real number of quantization steps divided by 2
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
  Tuna.prototype.Phaser = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.splitter = this.activateNode = userContext.createChannelSplitter(2);
    this.filtersL = [];
    this.filtersR = [];
    this.feedbackGainNodeL = userContext.createGain();
    this.feedbackGainNodeR = userContext.createGain();
    this.merger = userContext.createChannelMerger(2);
    this.filteredSignal = userContext.createGain();
    this.output = userContext.createGain();
    this.lfoL = new userInstance.LFO({
      target: this.filtersL,
      callback: this.callback,
    });
    this.lfoR = new userInstance.LFO({
      target: this.filtersR,
      callback: this.callback,
    });

    var i = this.stage;
    while (i--) {
      this.filtersL[i] = userContext.createBiquadFilter();
      this.filtersR[i] = userContext.createBiquadFilter();
      this.filtersL[i].type = "allpass";
      this.filtersR[i].type = "allpass";
    }
    this.input.connect(this.splitter);
    this.input.connect(this.output);
    this.splitter.connect(this.filtersL[0], 0, 0);
    this.splitter.connect(this.filtersR[0], 1, 0);
    this.connectInOrder(this.filtersL);
    this.connectInOrder(this.filtersR);
    this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
    this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
    this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
    this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
    this.feedbackGainNodeL.connect(this.filtersL[0]);
    this.feedbackGainNodeR.connect(this.filtersR[0]);
    this.merger.connect(this.output);

    this.rate = properties.rate || this.defaults.rate.value;
    this.baseModulationFrequency =
      properties.baseModulationFrequency ||
      this.defaults.baseModulationFrequency.value;
    this.depth = properties.depth || this.defaults.depth.value;
    this.feedback = properties.feedback || this.defaults.feedback.value;
    this.stereoPhase =
      properties.stereoPhase || this.defaults.stereoPhase.value;

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
      },
    },
    callback: {
      value: function (filters, value) {
        for (var stage = 0; stage < 4; stage++) {
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
        this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
        this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
      },
    },
    rate: {
      get: function () {
        return this._rate;
      },
      set: function (value) {
        this._rate = value;
        this.lfoL.frequency = this._rate;
        this.lfoR.frequency = this._rate;
      },
    },
    baseModulationFrequency: {
      enumerable: true,
      get: function () {
        return this._baseModulationFrequency;
      },
      set: function (value) {
        this._baseModulationFrequency = value;
        this.lfoL.offset = this._baseModulationFrequency;
        this.lfoR.offset = this._baseModulationFrequency;
        this._depth = this._depth;
      },
    },
    feedback: {
      get: function () {
        return this._feedback;
      },
      set: function (value) {
        this._feedback = value;
        this.feedbackGainNodeL.gain.value = this._feedback;
        this.feedbackGainNodeR.gain.value = this._feedback;
      },
    },
    stereoPhase: {
      get: function () {
        return this._stereoPhase;
      },
      set: function (value) {
        this._stereoPhase = value;
        var newPhase = this.lfoL._phase + (this._stereoPhase * Math.PI) / 180;
        newPhase = fmod(newPhase, 2 * Math.PI);
        this.lfoR._phase = newPhase;
      },
    },
  });
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
  Tuna.prototype.WahWah = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.activateNode = userContext.createGain();
    this.envelopeFollower = new userInstance.EnvelopeFollower({
      target: this,
      callback: function (context, value) {
        context.sweep = value;
      },
    });
    this.filterBp = userContext.createBiquadFilter();
    this.filterPeaking = userContext.createBiquadFilter();
    this.output = userContext.createGain();

    //Connect AudioNodes
    this.activateNode.connect(this.filterBp);
    this.filterBp.connect(this.filterPeaking);
    this.filterPeaking.connect(this.output);

    //Set Properties
    this.init();
    this.automode = properties.enableAutoMode || this.defaults.automode.value;
    this.resonance = properties.resonance || this.defaults.resonance.value;
    this.sensitivity =
      properties.sensitivity || this.defaults.sensitivity.value;
    this.baseFrequency =
      properties.baseFrequency || this.defaults.baseFrequency.value;
    this.excursionOctaves =
      properties.excursionOctaves || this.defaults.excursionOctaves.value;
    this.sweep = properties.sweep || this.defaults.sweep.value;

    this.activateNode.gain.value = 2;
    this.envelopeFollower.activate(true);
    this.bypass = properties.bypass || false;
  };
  Tuna.prototype.WahWah.prototype = Object.create(Super, {
    name: {
      value: "WahWah",
    },
    defaults: {
      writable: true,
      value: {
        automode: {
          value: true,
          automatable: false,
          type: BOOLEAN,
        },
        baseFrequency: {
          value: 0.05,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        excursionOctaves: {
          value: 2,
          min: 1,
          max: 6,
          automatable: false,
          type: FLOAT,
        },
        sweep: {
          value: 0.2,
          min: 0,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
        resonance: {
          value: 10,
          min: 1,
          max: 100,
          automatable: false,
          type: FLOAT,
        },
        sensitivity: {
          value: 0.5,
          min: -1,
          max: 1,
          automatable: false,
          type: FLOAT,
        },
      },
    },
    activateCallback: {
      value: function (value) {
        this.automode = value;
      },
    },
    automode: {
      get: function () {
        return this._automode;
      },
      set: function (value) {
        this._automode = value;
        if (value) {
          this.activateNode.connect(this.envelopeFollower.input);
          this.envelopeFollower.activate(true);
        } else {
          this.envelopeFollower.activate(false);
          this.activateNode.disconnect();
          this.activateNode.connect(this.filterBp);
        }
      },
    },
    sweep: {
      enumerable: true,
      get: function () {
        return this._sweep.value;
      },
      set: function (value) {
        this._sweep = Math.pow(
          value > 1 ? 1 : value < 0 ? 0 : value,
          this._sensitivity
        );
        this.filterBp.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
        this.filterPeaking.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
      },
    },
    baseFrequency: {
      enumerable: true,
      get: function () {
        return this._baseFrequency;
      },
      set: function (value) {
        this._baseFrequency = 50 * Math.pow(10, value * 2);
        this._excursionFrequency = Math.min(
          this.sampleRate / 2,
          this.baseFrequency * Math.pow(2, this._excursionOctaves)
        );
        this.filterBp.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
        this.filterPeaking.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
      },
    },
    excursionOctaves: {
      enumerable: true,
      get: function () {
        return this._excursionOctaves;
      },
      set: function (value) {
        this._excursionOctaves = value;
        this._excursionFrequency = Math.min(
          this.sampleRate / 2,
          this.baseFrequency * Math.pow(2, this._excursionOctaves)
        );
        this.filterBp.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
        this.filterPeaking.frequency.value =
          this._baseFrequency + this._excursionFrequency * this._sweep;
      },
    },
    sensitivity: {
      enumerable: true,
      get: function () {
        return this._sensitivity;
      },
      set: function (value) {
        this._sensitivity = Math.pow(10, value);
      },
    },
    resonance: {
      enumerable: true,
      get: function () {
        return this._resonance;
      },
      set: function (value) {
        this._resonance = value;
        this.filterPeaking.Q = this._resonance;
      },
    },
    init: {
      value: function () {
        this.output.gain.value = 1;
        this.filterPeaking.type = "peaking";
        this.filterBp.type = "bandpass";
        this.filterPeaking.frequency.value = 100;
        this.filterPeaking.gain.value = 20;
        this.filterPeaking.Q.value = 5;
        this.filterBp.frequency.value = 100;
        this.filterBp.Q.value = 1;
        this.sampleRate = userContext.sampleRate;
      },
    },
  });
  Tuna.prototype.EnvelopeFollower = function (properties) {
    if (!properties) {
      properties = this.getDefaults();
    }
    this.input = userContext.createGain();
    this.jsNode = this.output = userContext.createScriptProcessor(
      this.buffersize,
      1,
      1
    );

    this.input.connect(this.output);

    this.attackTime = properties.attackTime || this.defaults.attackTime.value;
    this.releaseTime =
      properties.releaseTime || this.defaults.releaseTime.value;
    this._envelope = 0;
    this.target = properties.target || {};
    this.callback = properties.callback || function () {};
  };
  Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
    name: {
      value: "EnvelopeFollower",
    },
    defaults: {
      value: {
        attackTime: {
          value: 0.003,
          min: 0,
          max: 0.5,
          automatable: false,
          type: FLOAT,
        },
        releaseTime: {
          value: 0.5,
          min: 0,
          max: 0.5,
          automatable: false,
          type: FLOAT,
        },
      },
    },
    buffersize: {
      value: 256,
    },
    envelope: {
      value: 0,
    },
    sampleRate: {
      value: 44100,
    },
    attackTime: {
      enumerable: true,
      get: function () {
        return this._attackTime;
      },
      set: function (value) {
        this._attackTime = value;
        this._attackC = Math.exp(
          ((-1 / this._attackTime) * this.sampleRate) / this.buffersize
        );
      },
    },
    releaseTime: {
      enumerable: true,
      get: function () {
        return this._releaseTime;
      },
      set: function (value) {
        this._releaseTime = value;
        this._releaseC = Math.exp(
          ((-1 / this._releaseTime) * this.sampleRate) / this.buffersize
        );
      },
    },
    callback: {
      get: function () {
        return this._callback;
      },
      set: function (value) {
        if (typeof value === "function") {
          this._callback = value;
        } else {
          console.error(
            "tuna.js: " + this.name + ": Callback must be a function!"
          );
        }
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
        this.activated = doActivate;
        if (doActivate) {
          this.jsNode.connect(userContext.destination);
          this.jsNode.onaudioprocess = this.returnCompute(this);
        } else {
          this.jsNode.disconnect();
          this.jsNode.onaudioprocess = null;
        }
      },
    },
    returnCompute: {
      value: function (instance) {
        return function (event) {
          instance.compute(event);
        };
      },
    },
    compute: {
      value: function (event) {
        var count = event.inputBuffer.getChannelData(0).length,
          channels = event.inputBuffer.numberOfChannels,
          current,
          chan,
          rms,
          i;
        chan = rms = i = 0;
        if (channels > 1) {
          //need to mixdown
          for (i = 0; i < count; ++i) {
            for (; chan < channels; ++chan) {
              current = event.inputBuffer.getChannelData(chan)[i];
              rms += (current * current) / channels;
            }
          }
        } else {
          for (i = 0; i < count; ++i) {
            current = event.inputBuffer.getChannelData(0)[i];
            rms += current * current;
          }
        }
        rms = Math.sqrt(rms);

        if (this._envelope < rms) {
          this._envelope *= this._attackC;
          this._envelope += (1 - this._attackC) * rms;
        } else {
          this._envelope *= this._releaseC;
          this._envelope += (1 - this._releaseC) * rms;
        }
        this._callback(this._target, this._envelope);
      },
    },
  });
  Tuna.prototype.LFO = function (properties) {
    //Instantiate AudioNode
    this.output = userContext.createScriptProcessor(256, 1, 1);
    this.activateNode = userContext.destination;

    //Set Properties
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
