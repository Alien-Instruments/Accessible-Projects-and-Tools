const LOCAL_MIDI_MAP_KEY = "BXmidiCCMappings";

export function saveCCMappings(mappings) {
  const obj = {};
  for (const [cc, paramId] of mappings.entries()) {
    obj[cc] = paramId;
  }
  localStorage.setItem(LOCAL_MIDI_MAP_KEY, JSON.stringify(obj));
}

export function loadCCMappings() {
  const raw = localStorage.getItem(LOCAL_MIDI_MAP_KEY);
  if (!raw) return new Map();

  try {
    const obj = JSON.parse(raw);
    return new Map(
      Object.entries(obj).map(([cc, paramId]) => [parseInt(cc), paramId])
    );
  } catch (e) {
    console.error("Failed to parse MIDI CC mappings:", e);
    return new Map();
  }
}

export function clearCCMappings() {
  localStorage.removeItem(LOCAL_MIDI_MAP_KEY);
}
