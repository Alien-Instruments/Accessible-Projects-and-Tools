export function setupVoiceControl({
  synth,
  audioContext,
  getSynthParams,
  triggerMIDILearnForControl,
  cancelMIDILearn,
  announce,
  announceModeRef = { value: "aria" },
}) {
  if (!window.voicePickupLFO) window.voicePickupLFO = null;

  window.SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition;
  let announceMode = announceModeRef.value;
  window.recognition = recognition;

  if (window.SpeechRecognition) {
    recognition = new window.SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Transcript:", transcript);
      handleVoiceCommand(transcript);
    };
  } else {
    console.warn("Speech Recognition not supported in this browser.");
    return;
  }

  document
    .getElementById("announce-toggle")
    ?.addEventListener("change", (e) => {
      announceModeRef.value = e.target.checked ? "speech" : "aria";
    });

  // Start voice recognition from button
  document.getElementById("voice-btn")?.addEventListener("click", () => {
    if (recognition) recognition.start();
  });

  // Transcript normalization and helpers
  function normalizeTranscript(str) {
    // Lowercase and normalize key mishearings BEFORE stripping whitespace!
    let normalized = str
      .toLowerCase()
      .replace(/\bd[\s-]?tune\b/g, "detune")
      .replace(/\bdee[\s-]?tune\b/g, "detune")
      .replace(/\bdq[\s-]?tune\b/g, "detune")
      .replace(/\bcereal\b/g, "serial")
      .replace(/\bseriel\b/g, "serial")
      .replace(/\bserie\b/g, "serial")
      .replace(/\bparalell\b/g, "parallel")
      .replace(/\bparrallel\b/g, "parallel")
      .replace(/\bparellel\b/g, "parallel")
      .replace(/\bresidence\b/g, "resonance")
      .replace(/\btriangle\b/g, "Triangle")
      .replace(/\bsign\b/g, "Sine")
      .replace(/\bsore ?tooth\b/g, "Sawtooth")
      .replace(/\bsore\b/g, "Saw")
      .replace(/\bbase\b/g, "bass")
      .replace(/\bAustralia\b/g, "oscillator")
      .replace(/\bgrip\b/g, "grit")
      .replace(/\briver\b/g, "reverb")
      .replace(/\btoo\b/g, "to");

    //Normalize all whitespace to single spaces
    normalized = normalized.replace(/\s+/g, " ");

    return normalized.trim();
  }

  function wordsToNumber(str) {
    const words = {
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
      hundred: 100,
      thousand: 1000,
      million: 1000000,
    };
    str = str.replace(/-/g, " ");
    let tokens = str.toLowerCase().split(/\s+/);
    let total = 0,
      current = 0;
    for (let t of tokens) {
      if (words.hasOwnProperty(t)) {
        let val = words[t];
        if (val === 100 || val === 1000 || val === 1000000) {
          if (current === 0) current = 1;
          current *= val;
        } else {
          current += val;
        }
      } else if (t === "and") {
        continue;
      } else if (!isNaN(parseFloat(t))) {
        current += parseFloat(t);
      } else {
        if (current > 0) {
          total += current;
          current = 0;
        }
      }
    }
    total += current;
    return total > 0 ? total : null;
  }

  function handleVoiceCommand(transcript) {
    const lower = transcript.toLowerCase();
    const normTranscript = normalizeTranscript(lower);

    // --- Handle select (dropdown) parameters ---
    const setSelectPattern = normTranscript.match(/(.+?) (to|as) (.+)/);
    if (setSelectPattern) {
      const paramText = setSelectPattern[1].trim();
      const valueText = setSelectPattern[3].trim();
      const params = getSynthParams(synth, audioContext);

      // Find the best-matching select parameter
      const candidates = params
        .filter((p) => p.type === "select" && p.options)
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const idNorm = normalizeTranscript(p.id || "");
          const groupNorm = normalizeTranscript(p.group || "");
          if (labelNorm.includes(paramText)) score += 3;
          if (idNorm.includes(paramText)) score += 2;
          if (groupNorm.includes(paramText)) score += 1;
          if (paramText.includes(labelNorm) && labelNorm.length > 0) score += 2;
          if (paramText.includes(idNorm) && idNorm.length > 0) score += 1;
          if (paramText.includes(groupNorm) && groupNorm.length > 0) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score);
      const best = candidates.find((c) => c.score > 0);
      if (!best) {
        announce(`Couldn't find parameter "${paramText}"`);
        return;
      }
      const p = best.p;

      // Now match the option value (fuzzy includes for best real-world results)
      const valNorm = normalizeTranscript(valueText);
      const opt = p.options.find((o) => {
        const labelNorm = normalizeTranscript(o.label || "");
        const valueNorm = normalizeTranscript(String(o.value));
        return (
          valNorm === labelNorm ||
          valNorm === valueNorm ||
          labelNorm.includes(valNorm) ||
          valueNorm.includes(valNorm) ||
          valNorm.includes(labelNorm) ||
          valNorm.includes(valueNorm)
        );
      });
      if (opt) {
        p.apply(opt.value);
        announce(`Set ${p.label} to ${opt.label || opt.value}`);

        // Optional: update UI select element if you want
        const input = document.getElementById(p.id);
        if (input && input.tagName === "SELECT") {
          input.value = opt.value;
          input.dispatchEvent(new Event("input"));
        }
        return;
      } else {
        announce(`Didn't recognize value "${valueText}" for ${p.label}`);
        return;
      }
    }

    // Focus command: "focus on [param]", "go to [param]", "select [param]"
    const focusPattern = normTranscript.match(
      /^(focus on|focus|go to|select) (.+)$/
    );
    if (focusPattern) {
      const paramText = focusPattern[2].trim();
      const params = getSynthParams(synth, audioContext);

      // Find the best-matching param (slider, select, or button)
      const candidates = params
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const idNorm = normalizeTranscript(p.id || "");
          const groupNorm = normalizeTranscript(p.group || "");
          if (labelNorm.includes(paramText)) score += 3;
          if (idNorm.includes(paramText)) score += 2;
          if (groupNorm.includes(paramText)) score += 1;
          if (paramText.includes(labelNorm) && labelNorm.length > 0) score += 2;
          if (paramText.includes(idNorm) && idNorm.length > 0) score += 1;
          if (paramText.includes(groupNorm) && groupNorm.length > 0) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score);

      const best = candidates.find((c) => c.score > 0);
      if (!best) {
        announce(`Couldn't find UI element "${paramText}"`);
        return;
      }
      const p = best.p;
      // Try to focus the element
      const input = document.getElementById(p.id);
      if (input && typeof input.focus === "function") {
        input.focus();
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        announce(`Focused on ${p.label}`);
      } else {
        announce(`Couldn't focus ${p.label} (not found in UI)`);
      }
      return;
    }

    // --- LFO number words for matching ---
    const lfoWordNumbers = { one: 1, two: 2, three: 3 };
    // ----------- LFO PICKUP ----------
    const lfoPickupPattern =
      /\b(?:pick up|grab)\b.*?\blfo\s*(\d|one|two|three)\b|\blfo\s*(\d|one|two|three)\b.*?\b(pick up|grab)\b/;
    const pickupMatch = normTranscript.match(lfoPickupPattern);
    let lfoNum = null;
    if (pickupMatch) {
      lfoNum = pickupMatch[1] || pickupMatch[2];
      if (lfoNum) {
        if (isNaN(lfoNum)) lfoNum = lfoWordNumbers[lfoNum];
        if (lfoNum && [1, 2, 3].includes(Number(lfoNum))) {
          const lfoId = "lfo" + lfoNum;
          const lfo = synth.uiLfos.find((l) => l.id.toLowerCase() === lfoId);
          if (lfo) {
            window.voicePickupLFO = lfo;
            announce(`Picked up ${lfoId.toUpperCase()}`);
          } else {
            announce(`Couldn't find ${lfoId.toUpperCase()}`);
          }
          return;
        }
      }
      announce(`Didn't recognize LFO number in "${transcript}"`);
      return;
    }

    // ----------- MIDI LEARN -----------
    const midiLearnMatch =
      normTranscript.match(/\bmidi ?learn (.+)/) ||
      normTranscript.match(/\blearn midi (.+)/) ||
      normTranscript.match(/\blearn (.+)/);
    if (midiLearnMatch) {
      const destText = midiLearnMatch[1].trim();
      const destNorm = normalizeTranscript(destText);
      const params = getSynthParams(synth, audioContext);
      const candidates = params
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const idNorm = normalizeTranscript(p.id || "");
          const groupNorm = normalizeTranscript(p.group || "");
          if (labelNorm.includes(destNorm)) score += 3;
          if (idNorm.includes(destNorm)) score += 2;
          if (groupNorm.includes(destNorm)) score += 1;
          if (destNorm.includes(labelNorm) && labelNorm.length > 0) score += 2;
          if (destNorm.includes(idNorm) && idNorm.length > 0) score += 1;
          if (destNorm.includes(groupNorm) && groupNorm.length > 0) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score);
      const best = candidates.find((c) => c.score > 0);
      if (!best) {
        announce(`Couldn't find parameter "${destText}" for MIDI learn`);
        return;
      }
      const paramId = best.p.id;
      triggerMIDILearnForControl(paramId);
      announce(`MIDI learn enabled for ${best.p.label} Move a CC to map`);
      return;
    }

    // ----------- CANCEL MIDI LEARN -----------
    if (normTranscript.match(/\b(cancel|exit|stop) midi ?learn\b/)) {
      cancelMIDILearn();
      announce("MIDI learn cancelled");
      return;
    }

    // ----------- RANGE/OPTIONS QUERY -----------
    const queryMatch = normTranscript.match(
      /^(.+?) (range|options|choices|values)$/
    );
    if (queryMatch) {
      const paramText = queryMatch[1].trim();
      const mode = queryMatch[2];
      const params = getSynthParams(synth, audioContext);
      const candidates = params
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const idNorm = normalizeTranscript(p.id || "");
          const groupNorm = normalizeTranscript(p.group || "");
          if (labelNorm.includes(paramText)) score += 3;
          if (idNorm.includes(paramText)) score += 2;
          if (groupNorm.includes(paramText)) score += 1;
          if (paramText.includes(labelNorm) && labelNorm.length > 0) score += 2;
          if (paramText.includes(idNorm) && idNorm.length > 0) score += 1;
          if (paramText.includes(groupNorm) && groupNorm.length > 0) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score);
      const best = candidates.find((c) => c.score > 0);
      if (!best) {
        announce(`Couldn't find parameter "${paramText}"`);
        return;
      }
      const p = best.p;
      if (
        (mode === "range" || mode === "values") &&
        (p.type === "slider" || p.type === "range")
      ) {
        announce(`${p.label}: min ${p.min}, max ${p.max}`);
        return;
      }
      if (
        (mode === "options" || mode === "choices" || mode === "values") &&
        p.options
      ) {
        announce(
          `${p.label} options: ` +
            p.options.map((o) => o.label || o.value).join(", ")
        );
        return;
      }
      announce(`No range or options for ${p.label}`);
      return;
    }

    // ----------- LFO DROP -----------
    const dropMatch = normTranscript.match(/\bdrop on (.+)/);
    if (dropMatch && window.voicePickupLFO) {
      const destText = dropMatch[1].trim();
      const destNorm = normalizeTranscript(destText);
      const params = getSynthParams(synth, audioContext);

      const candidates = params
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const idNorm = normalizeTranscript(p.id || "");
          const groupNorm = normalizeTranscript(p.group || "");
          if (labelNorm.includes(destNorm)) score += 3;
          if (idNorm.includes(destNorm)) score += 2;
          if (groupNorm.includes(destNorm)) score += 1;
          if (destNorm.includes(labelNorm) && labelNorm.length > 0) score += 2;
          if (destNorm.includes(idNorm) && idNorm.length > 0) score += 1;
          if (destNorm.includes(groupNorm) && groupNorm.length > 0) score += 1;
          return { p, score };
        })
        .sort((a, b) => b.score - a.score);
      const best = candidates.find((c) => c.score > 0);
      if (!best) {
        announce(`Couldn't find destination "${destText}"`);
        return;
      }
      const targetParam = best.p;
      const slider = document.getElementById(targetParam.id);
      if (!slider || slider.type !== "range") {
        announce(`Destination ${targetParam.label} is not a mod target`);
        return;
      }
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const range = max - min;
      const originalVal = parseFloat(slider.value);
      const target = {
        id: targetParam.id,
        slider,
        originalVal,
        range,
        depth: 1.0,
      };
      window.voicePickupLFO.targets.push(target);
      if (typeof window.attachModRing === "function") {
        window.attachModRing(target, synth, announce);
      }
      slider.classList.add("modulated");
      announce(
        `Dropped ${window.voicePickupLFO.id.toUpperCase()} on ${
          targetParam.label
        }`
      );
      window.voicePickupLFO = null;
      return;
    }

    // ----------- PARAMETER MATCHING -----------
    const params = getSynthParams(synth, audioContext);
    const candidates = params.map((p) => {
      let score = 0;
      if (p.label && normTranscript.includes(normalizeTranscript(p.label)))
        score += 3;
      if (p.id && normTranscript.includes(normalizeTranscript(p.id)))
        score += 2;
      if (p.group && normTranscript.includes(normalizeTranscript(p.group)))
        score += 1;
      if (
        p.label &&
        p.group &&
        normTranscript.includes(normalizeTranscript(p.label)) &&
        normTranscript.includes(normalizeTranscript(p.group))
      )
        score += 2;
      return { p, score };
    });

    candidates.sort((a, b) => b.score - a.score);

    const best = candidates.find((c) => c.score > 0);
    if (!best) {
      announce(`Sorry, didn't understand "${transcript}"`);
      return;
    }

    const p = best.p;
    let value = null;
    const numMatches = lower.match(/([+-]?[0-9]+(\.[0-9]+)?)/g);
    const lastNum = numMatches ? numMatches[numMatches.length - 1] : null;

    // Checkbox and toggle logic
    if (p.type === "checkbox") {
      if (p.id === "dualFilter-routing") {
        if (normTranscript.includes("serial")) {
          value = true;
        } else if (normTranscript.includes("parallel")) {
          value = false;
        } else {
          value =
            normTranscript.includes("on") ||
            normTranscript.includes("enable") ||
            normTranscript.includes("yes");
          if (
            normTranscript.includes("off") ||
            normTranscript.includes("disable") ||
            normTranscript.includes("no")
          )
            value = false;
        }
      } else {
        value =
          normTranscript.includes("on") ||
          normTranscript.includes("enable") ||
          normTranscript.includes("yes");
        if (
          normTranscript.includes("off") ||
          normTranscript.includes("disable") ||
          normTranscript.includes("no")
        )
          value = false;
      }
    } else if (p.options) {
      const opt = p.options.find(
        (o) =>
          lower.includes(o.label.toLowerCase()) ||
          lower.includes(String(o.value).toLowerCase())
      );
      if (opt) value = opt.value;
      else if (lastNum) value = lastNum;
      else {
        const wordNum = wordsToNumber(lower);
        if (wordNum !== null) value = wordNum;
      }
    } else if (lastNum) {
      value = lastNum;
    } else {
      const wordNum = wordsToNumber(lower);
      if (wordNum !== null) value = wordNum;
    }

    if (value !== null) {
      p.apply(value);

      // ------ Custom announcement label logic ------
      let announceValue = value;
      if (p.id === "dualFilter-routing") {
        announceValue = value ? "Serial" : "Parallel";
      } else if (p.type === "checkbox" && Array.isArray(p.toggleLabels)) {
        announceValue = value ? p.toggleLabels[1] : p.toggleLabels[0];
      }
      announce(`Set ${p.label} to ${announceValue}`);

      // ------ Update UI ------
      const input = document.getElementById(p.id);
      if (p.type === "checkbox" && input && input.tagName === "BUTTON") {
        input.setAttribute("aria-pressed", value);
        const [offLabel = "OFF", onLabel = "ON"] = p.toggleLabels || [];
        input.textContent =
          p.id === "dualFilter-routing"
            ? value
              ? "Serial"
              : "Parallel"
            : value
            ? onLabel
            : offLabel;
        input.setAttribute(
          "aria-label",
          `${p.label} ${
            p.id === "dualFilter-routing"
              ? value
                ? "Serial"
                : "Parallel"
              : value
              ? onLabel
              : offLabel
          }`
        );
      }
      if (input && input.tagName !== "BUTTON") {
        input.value = value;
        input.dispatchEvent(new Event("input"));
      }
    } else {
      announce(`Heard "${transcript}", but didn't get a value for ${p.label}`);
    }
  }

  return {
    recognition,
    start: () => recognition && recognition.start(),
    getMode: () => announceMode,
    setMode: (mode) => (announceMode = mode),
  };
}
