import { updateAudioRouting } from "../effects/master-fx.js";
import { FX_LIST, addFX } from "../effects/master-fx.js";
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
  if (!window.voicePickupModEnv) window.voicePickupModEnv = null;

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
      .replace(/\bFazer\b/g, "phaser")
      .replace(/\bvisa\b/g, "phaser")
      .replace(/\bcourse\b/g, "chorus")
      .replace(/\bmud\b/g, "mod")
      .replace(/\bdeath\b/g, "depth")
      .replace(/\bdeck\b/g, "depth")
      .replace(/\bpolly\b/g, "poly")
      .replace(/\bhi\b/g, "high")
      .replace(/\bhigh shelf\b/g, "highshelf")
      .replace(/\blow shelf\b/g, "lowshelf")
      .replace(/\bpeking\b/g, "peaking")
      .replace(/\blow pass\b/g, "lowpass")
      .replace(/\bhigh pass\b/g, "highpass")
      .replace(/\bband pass\b/g, "bandpass")
      .replace(/\bhyde park\b/g, "highpass")
      .replace(/\ball pass\b/g, "allpass")
      .replace(/\bbypass\b/g, "highpass")
      .replace(/\bduo tone\b/g, "duotone")
      .replace(/\bduo\b/g, "duotone")
      .replace(/\bmore\b/g, "morph")
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

  function getInsertIdx(fxChain, direction, targetFX) {
    const targetName = normalizeTranscript(targetFX.trim());
    const idx = fxChain.findIndex(
      (fxObj) =>
        normalizeTranscript(fxObj.name).includes(targetName) ||
        normalizeTranscript(fxObj.className).includes(targetName)
    );
    if (idx === -1) return fxChain.length; // Not found, append
    return direction === "before" ? idx : idx + 1;
  }

  function handleVoiceCommand(transcript, fxChain) {
    const lower = transcript.toLowerCase();
    const normTranscript = normalizeTranscript(lower);
    console.log("🎯 Normalized transcript (entry):", normTranscript);
    // --- Handle "[group] [label] to [value]" style ---
    const groupParamMatch = normTranscript.match(
      /^([a-z\s]+)\s+([a-z\s]+)\s+(?:to|level|value)\s+([0-9.]+)/
    );
    if (groupParamMatch) {
      const groupText = groupParamMatch[1].trim();
      const labelText = groupParamMatch[2].trim();
      const valueText = groupParamMatch[3].trim();

      const params = getSynthParams(synth, audioContext);

      const bestMatch = params.find((p) => {
        const groupNorm = normalizeTranscript(p.group || "");
        const labelNorm = normalizeTranscript(p.label || "");
        return groupNorm === groupText && labelNorm === labelText;
      });

      if (bestMatch) {
        const numValue = parseFloat(valueText);
        if (numValue < bestMatch.min || numValue > bestMatch.max) {
          announce(`Value ${numValue} is out of range for ${bestMatch.label}`);
          return;
        }

        bestMatch.apply(numValue);

        announce(`Set ${bestMatch.group} ${bestMatch.label} to ${numValue}`);

        const input = document.getElementById(bestMatch.id);
        if (input) {
          input.value = numValue;
          input.dispatchEvent(new Event("input"));
        }
        return;
      }
    }

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

        // Optional: update UI select element
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

    // --- Up/Down by Amount Command: "group param up/down value" ---
    const upDownMatch = normTranscript.match(/^(.*?)\s+(up|down)\s+([-\d.]+)/);
    if (upDownMatch) {
      const paramText = upDownMatch[1].trim(); // e.g. "reverb wet"
      const direction = upDownMatch[2]; // "up" or "down"
      const amount = parseFloat(upDownMatch[3]); // e.g. 0.2

      const params = getSynthParams(synth, audioContext);

      // Find best param candidate
      const candidates = params
        .map((p) => {
          let score = 0;
          const labelNorm = normalizeTranscript(p.label || "");
          const groupNorm = normalizeTranscript(p.group || "");
          const idNorm = normalizeTranscript(p.id || "");
          if ((groupNorm + " " + labelNorm).includes(paramText)) score += 5;
          if ((labelNorm + " " + groupNorm).includes(paramText)) score += 5;
          if ((groupNorm + labelNorm).includes(paramText.replace(/\s+/g, "")))
            score += 2;
          if (idNorm.includes(paramText)) score += 2;
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
        (p.type === "slider" || p.type === "range" || p.type === "number") &&
        typeof p.min === "number" &&
        typeof p.max === "number"
      ) {
        let currValue = typeof p.value === "function" ? p.value() : p.value;
        let newValue =
          direction === "up"
            ? parseFloat(currValue) + amount
            : parseFloat(currValue) - amount;

        // Clamp to min/max
        newValue = Math.max(p.min, Math.min(p.max, newValue));

        p.apply(newValue);

        announce(`Set ${p.group} ${p.label} to ${newValue}`);
        // Optionally update UI
        const input = document.getElementById(p.id);
        if (input) {
          input.value = newValue;
          input.dispatchEvent(new Event("input"));
        }
      } else {
        announce(`${p.group} ${p.label} cannot be changed up/down by value.`);
      }
      return;
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

    const envWordNumbers = { one: 1, two: 2 };
    // Add pickup for env
    const envPickupPattern =
      /\b(?:pick up|grab)\b.*?\b(env|mod envelope)\s*(\d|one|two)\b/;
    const envPickupMatch = normTranscript.match(envPickupPattern);
    if (envPickupMatch) {
      let envNum = envPickupMatch[2];
      if (isNaN(envNum)) envNum = envWordNumbers[envNum];
      if (envNum && [1, 2].includes(Number(envNum))) {
        const envId = "modEnv" + envNum;
        const env = synth.uiModEnvs.find(
          (e) => e.id.toLowerCase() === envId.toLowerCase()
        );
        if (env) {
          window.voicePickupModEnv = env;
          announce(`Picked up Mod Envelope ${envNum}`);
          return;
        }
      }
      announce(`Didn't recognize envelope number in "${transcript}"`);
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

    // --- Pick up FX from chain (supports both "pick up from chain reverb" and "pick up reverb from chain") ---
    const pickupChainPattern =
      /\b(pick up|grab)\b\s+(?:from|in)\s+(?:the\s+)?chain\s+([a-z0-9\s]+)|\b(pick up|grab)\b\s+([a-z0-9\s]+?)\s+(?:from|in)\s+(?:the\s+)?chain\b/;
    const pickupChainMatch = normTranscript.match(pickupChainPattern);

    if (pickupChainMatch) {
      const fxName = (pickupChainMatch[2] || pickupChainMatch[4] || "").trim();
      const search = normalizeTranscript(fxName);

      const fxIdx = (window.fxChain || []).findIndex((fxObj) => {
        const name = normalizeTranscript(fxObj.name);
        const className = normalizeTranscript(fxObj.className);
        return (
          name.includes(search) ||
          className.includes(search) ||
          search.includes(name) ||
          search.includes(className)
        );
      });

      if (fxIdx > -1) {
        const fx = window.fxChain[fxIdx];
        window.voicePickupFX = JSON.parse(JSON.stringify(fx));
        window.voicePickupFX._fromChain = true;
        window.voicePickupFX._chainIdx = fxIdx;

        // Optional UI highlight
        const chainUI = document.querySelectorAll("#fx-chain .fx-block");
        chainUI.forEach((el, i) => {
          if (i === fxIdx) {
            el.classList.add("pending-move");
            el.focus();
          } else {
            el.classList.remove("pending-move");
          }
        });

        announce(`Picked up ${fx.name} from chain`);
        return;
      } else {
        announce(`Couldn't find effect "${fxName}" in chain`);
        return;
      }
    }

    // --- Pick up from BANK ---
    // Only run this if you did NOT match "from chain"/"in chain"
    const pickupFXPattern =
      /\b(pick up|grab|move)\b\s+([a-z0-9\s]+?)\b(?!(?:\sfrom|\sin)\schain\b)/;
    const pickupFXMatch = normTranscript.match(pickupFXPattern);

    if (pickupFXMatch) {
      const fxName = pickupFXMatch[2].trim();
      const search = normalizeTranscript(fxName);

      // For debugging:
      console.log("🟨 Trying to pick up from bank:", search, window.fxBank);

      const fx = window.fxBank.find((fxObj) => {
        const name = normalizeTranscript(fxObj.name);
        const className = normalizeTranscript(fxObj.className);
        return (
          name.includes(search) ||
          className.includes(search) ||
          search.includes(name) ||
          search.includes(className)
        );
      });

      if (fx) {
        window.voicePickupFX = JSON.parse(JSON.stringify(fx));
        announce(`Picked up ${fx.name}`);
        return;
      } else {
        announce(`Couldn't find effect "${fxName}" in bank`);
        return;
      }
    }

    const dropFXPattern =
      /\b(drop|add|insert)\b\s+([a-z\s]+?)(?:\s+(before|after)\s+([a-z\s]+))?(?:\s+(?:to|in|into)\s+chain)?\b/;
    const dropFXMatch = normTranscript.match(dropFXPattern);

    if (dropFXMatch && window.voicePickupFX) {
      let insertIdx = null;
      if (dropFXMatch[3] && dropFXMatch[4]) {
        insertIdx = getInsertIdx(
          window.fxChain,
          dropFXMatch[3],
          dropFXMatch[4]
        );
      }

      if (window.voicePickupFX._fromChain) {
        // --- MOVE within chain ---
        const oldIdx = window.voicePickupFX._chainIdx;
        if (oldIdx > -1) {
          // Adjust insertIdx if moving forward in the array
          if (insertIdx !== null && insertIdx > oldIdx) insertIdx -= 1;
          const [fxMoved] = window.fxChain.splice(oldIdx, 1);
          window.fxChain.splice(insertIdx ?? window.fxChain.length, 0, fxMoved);

          renderFXChain();
          // === UI REFRESH: call your FX chain rendering function if it exists ===
          if (typeof renderFXChain === "function") renderFXChain();

          // Optionally update routing
          if (typeof updateAudioRouting === "function") updateAudioRouting();

          // Debug: Log new order
          console.log(
            "FX Chain (after move):",
            window.fxChain.map((fx) => fx.name)
          );

          announce(
            `Moved ${fxMoved.name} ${dropFXMatch[3] || ""} ${
              dropFXMatch[4] || ""
            }`
          );
        } else {
          announce(`Error: Could not find original effect in chain`);
        }
        window.voicePickupFX = null;
        return;
      }

      // --- ADD from bank ---
      const fxMeta = FX_LIST.find(
        (fx) => fx.className === window.voicePickupFX.className
      );
      if (fxMeta) {
        addFX(fxMeta, insertIdx, window.voicePickupFX.params);

        setTimeout(() => {
          if (typeof renderFXChain === "function") renderFXChain();
          if (typeof updateAudioRouting === "function") updateAudioRouting();

          announce(`Dropped ${fxMeta.name} in chain`);
          window.voicePickupFX = null;
        }, 20);
      } else {
        announce(`Error: Could not find FX type in list`);
      }
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

    // ----------- LFO / ENV DROP -----------
    const dropMatch = normTranscript.match(/\bdrop on (.+)/);
    if (dropMatch && (window.voicePickupLFO || window.voicePickupModEnv)) {
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

      if (window.voicePickupLFO) {
        // LFO drop (unchanged)
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

      if (window.voicePickupModEnv) {
        // ENV drop
        window.voicePickupModEnv.targets.push(target);
        if (typeof window.attachModRing === "function") {
          window.attachModRing(target, synth, announce);
        }
        slider.classList.add("modulated");
        announce(
          `Dropped ${window.voicePickupModEnv.id.toUpperCase()} on ${
            targetParam.label
          }`
        );
        window.voicePickupModEnv = null;
        return;
      }
    }

    // --- REMOVE FX from chain ---
    const removeFXPattern =
      /\b(delete)\b\s+(?:fx|effect|plugin)?\s*([a-z0-9\s]+)?/;
    const removeFXMatch = normTranscript.match(removeFXPattern);

    if (removeFXMatch) {
      const fxName = (removeFXMatch[2] || "").trim();
      const search = normalizeTranscript(fxName);

      const fxIdx = (window.fxChain || []).findIndex((fxObj) => {
        const name = normalizeTranscript(fxObj.name);
        const className = normalizeTranscript(fxObj.className);
        return (
          name.includes(search) ||
          className.includes(search) ||
          search.includes(name) ||
          search.includes(className)
        );
      });

      if (fxIdx > -1) {
        const removed = window.fxChain.splice(fxIdx, 1)[0];
        if (typeof renderFXChain === "function") renderFXChain();
        if (typeof updateAudioRouting === "function") updateAudioRouting();
        announce(`Removed ${removed.name} from FX chain`);
      } else {
        announce(`Couldn't find effect "${fxName}" to remove`);
      }
      return;
    }

    // ----------- REMOVE MODULATION (voice) -----------
    const removeModMatch = normTranscript.match(
      /\b(remove|clear)\s*(lfo|env|envelope|modulation)?\s*(?:from|on)?\s*(.+)$/
    );

    if (removeModMatch) {
      const modType = removeModMatch[2] ? removeModMatch[2].trim() : ""; // e.g., lfo, env, modulation
      const paramText = removeModMatch[3] ? removeModMatch[3].trim() : "";
      const params = getSynthParams(synth, audioContext);

      // Find the best-matching parameter (slider)
      const candidates = params
        .filter((p) => p.type === "slider" || p.type === "range")
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
        announce(`Couldn't find parameter "${paramText}" to remove modulation`);
        return;
      }

      const slider = document.getElementById(best.p.id);

      let removed = false;
      // Remove from all LFOs
      if (!modType || modType === "lfo" || modType === "modulation") {
        for (const lfo of synth.uiLfos || []) {
          const before = lfo.targets.length;
          lfo.targets = lfo.targets.filter(
            (t) => t.id !== best.p.id && t.slider !== slider
          );
          if (before !== lfo.targets.length) removed = true;
        }
      }
      // Remove from all Envelopes
      if (
        !modType ||
        modType === "env" ||
        modType === "envelope" ||
        modType === "modulation"
      ) {
        for (const env of synth.uiModEnvs || []) {
          const before = env.targets.length;
          env.targets = env.targets.filter(
            (t) => t.id !== best.p.id && t.slider !== slider
          );
          if (before !== env.targets.length) removed = true;
        }
      }

      if (removed && slider) {
        slider.classList.remove("modulated");
        // Remove mod ring if present
        slider
          .closest(".range-knob-wrapper")
          ?.querySelector(".mod-ring")
          ?.remove();
        announce(`Removed modulation from ${best.p.label}`);
      } else {
        announce(`No modulation found on ${best.p.label}`);
      }
      return;
    }

    // ----------- PARAMETER MATCHING -----------
    const params = getSynthParams(synth, audioContext);
    const candidates = params.map((p) => {
      const labelNorm = normalizeTranscript(p.label || "");
      const idNorm = normalizeTranscript(p.id || "");
      const groupNorm = normalizeTranscript(p.group || "");
      let score = 0;

      if (normTranscript.includes(`${groupNorm} ${labelNorm}`)) score += 10;
      if (normTranscript.includes(`${labelNorm} ${groupNorm}`)) score += 9;
      if (normTranscript.includes(labelNorm)) score += 4;
      if (normTranscript.includes(groupNorm)) score += 2;
      if (normTranscript.includes(idNorm)) score += 2;

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
      // ---- Out-of-range guard for sliders ----
      if (
        (p.type === "slider" || p.type === "range" || p.type === "number") &&
        typeof p.min === "number" &&
        typeof p.max === "number"
      ) {
        const numVal = parseFloat(value);
        if (numVal < p.min || numVal > p.max) {
          announce(
            `Value ${numVal} is out of range for ${p.label}. Please say a value between ${p.min} and ${p.max}.`
          );
          return; // Exit without applying
        }
      }
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
