// === SETTINGS STORAGE AND DEFAULTS ===
const SETTINGS_KEY = "speechSettings";
const defaultSettings = {
  rate: 1.1,
  pitch: 1.0,
  volume: 1.0,
  voiceURI: "",
  lang: "",
};

function loadSettings() {
  return {
    ...defaultSettings,
    ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
  };
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

let speechSettingsRef = loadSettings();

const toggleHTML = `
  <button class="lcd-button" id="toggle-speech-controls" style="margin-top:1em;margin-bottom:0.5em;">
    Show Speech Settings
  </button>
`;
document.body.insertAdjacentHTML("afterbegin", toggleHTML);

// === HTML INJECTION ===
const controlsHTML = `
  <fieldset class="panel" tabindex="-1" id="speech-controls" style="margin:1em 0;padding:1em;border:1px solid #ccc; display:none;">
    <strong>Speech Settings</strong>
    <label class="panel">
      Language:
      <select class="lcd-select" id="speech-lang"></select>
    </label>
    <label class="panel">
      Voice:
      <select class="lcd-select" id="speech-voice"></select>
    </label>
    <div class="slider-container">
    <label class="panel">
      Rate: <input id="speech-rate" type="range" min="0.5" max="2" step="0.01" value="${speechSettingsRef.rate}"">
      <span class="lcd-text" id="speech-rate-value">${speechSettingsRef.rate}</span>
    </label>
    </div>
    <div class="slider-container">
    <label class="panel">
      Volume: <input id="speech-volume" type="range" min="0" max="1" step="0.01" value="${speechSettingsRef.volume}"">
      <span class="lcd-text" id="speech-volume-value">${speechSettingsRef.volume}</span>
    </label>
    </div>
  </fieldset>
`;
document.body.insertAdjacentHTML("afterbegin", controlsHTML);

// === DOM REFS ===
const rateSlider = document.getElementById("speech-rate");
const rateVal = document.getElementById("speech-rate-value");
const volSlider = document.getElementById("speech-volume");
const volVal = document.getElementById("speech-volume-value");
const voiceSelect = document.getElementById("speech-voice");
const langSelect = document.getElementById("speech-lang");

// === POPULATE LANGUAGES AND VOICES ===
function getUniqueLangs(voices) {
  const seen = new Set();
  return voices.filter((v) => {
    if (seen.has(v.lang)) return false;
    seen.add(v.lang);
    return true;
  });
}

function populateLanguages() {
  const voices = window.speechSynthesis.getVoices();
  const langs = getUniqueLangs(voices);
  langSelect.innerHTML = "";
  langs.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.lang;
    opt.textContent = `${v.lang} (${v.name})`;
    langSelect.appendChild(opt);
  });
  // Restore saved language if possible
  if (speechSettingsRef.lang) langSelect.value = speechSettingsRef.lang;
}

function populateVoices() {
  const voices = window.speechSynthesis.getVoices();
  const lang = langSelect.value;
  voiceSelect.innerHTML = "";
  voices
    .filter((v) => v.lang === lang)
    .forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = v.name + (v.default ? " (default)" : "");
      voiceSelect.appendChild(opt);
    });
  // Restore saved voice if possible
  if (speechSettingsRef.voiceURI)
    voiceSelect.value = speechSettingsRef.voiceURI;
}

function initVoices() {
  populateLanguages();
  populateVoices();
}
window.speechSynthesis.onvoiceschanged = initVoices;
initVoices();

// === CONTROL EVENT HANDLERS ===
rateSlider.addEventListener("input", (e) => {
  speechSettingsRef.rate = parseFloat(e.target.value);
  rateVal.textContent = speechSettingsRef.rate;
  saveSettings(speechSettingsRef);
});
volSlider.addEventListener("input", (e) => {
  speechSettingsRef.volume = parseFloat(e.target.value);
  volVal.textContent = speechSettingsRef.volume;
  saveSettings(speechSettingsRef);
});
langSelect.addEventListener("change", (e) => {
  speechSettingsRef.lang = langSelect.value;
  populateVoices();
  // Select first available voice
  speechSettingsRef.voiceURI = voiceSelect.value;
  saveSettings(speechSettingsRef);
});
voiceSelect.addEventListener("change", (e) => {
  speechSettingsRef.voiceURI = voiceSelect.value;
  saveSettings(speechSettingsRef);
});

// === INTEGRATE WITH ANNOUNCE SYSTEM ===
export const announceModeRef = { value: "aria" };

export function announce(msg) {
  const mode = announceModeRef.value;
  if (mode === "aria") {
    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = msg;
      }, 10);
    }
  } else if (mode === "speech") {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(msg);
      utter.rate = speechSettingsRef.rate;
      utter.pitch = speechSettingsRef.pitch;
      utter.volume = speechSettingsRef.volume;
      utter.lang = speechSettingsRef.lang;
      // Find and assign the chosen voice
      const voices = window.speechSynthesis.getVoices();
      utter.voice =
        voices.find(
          (v) =>
            v.voiceURI === speechSettingsRef.voiceURI &&
            v.lang === speechSettingsRef.lang
        ) || null;
      window.speechSynthesis.speak(utter);
    }
    const region = document.getElementById("aria-status");
    if (region) {
      region.textContent = msg;
    }
  }
}

// === SET DEFAULTS ON FIRST LOAD IF NO VOICE SELECTED ===
if (!speechSettingsRef.lang || !speechSettingsRef.voiceURI) {
  window.addEventListener("load", () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      speechSettingsRef.lang = langSelect.value = voices[0].lang;
      populateVoices();
      speechSettingsRef.voiceURI = voiceSelect.value = voices[0].voiceURI;
      saveSettings(speechSettingsRef);
    }
  });
}

const speechControls = document.getElementById("speech-controls");
const toggleBtn = document.getElementById("toggle-speech-controls");

toggleBtn.addEventListener("click", () => {
  const visible = speechControls.style.display !== "none";
  speechControls.style.display = visible ? "none" : "";
  toggleBtn.textContent = visible
    ? "Show Speech Settings"
    : "Hide Speech Settings";

  if (!visible) {
    speechControls.focus();
    speechControls.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
