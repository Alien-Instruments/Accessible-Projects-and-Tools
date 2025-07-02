let currentScale = "Major";
let currentOctaves = [2, 3];
let currentKey = "C";

export const CHROMATIC = [
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

// Maps flats to sharps for normalization
const FLAT_TO_SHARP = {
  Db: "C#",
  Eb: "D#",
  Fb: "E",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Cb: "B",
};

// ---- SCALES ----
export const SCALES = {
  Major: ["C", "D", "E", "F", "G", "A", "B"],
  Minor: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  HarmonicMinor: ["C", "D", "Eb", "F", "G", "Ab", "B"],
  MelodicMinor: ["C", "D", "Eb", "F", "G", "A", "B"],
  Dorian: ["C", "D", "Eb", "F", "G", "A", "Bb"],
  Phrygian: ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],
  Lydian: ["C", "D", "E", "F#", "G", "A", "B"],
  Mixolydian: ["C", "D", "E", "F", "G", "A", "Bb"],
  Locrian: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
  MajorPentatonic: ["C", "D", "E", "G", "A"],
  MinorPentatonic: ["C", "Eb", "F", "G", "Bb"],
  Blues: ["C", "Eb", "F", "F#", "G", "Bb"],
  Chromatic: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  Egyptian: ["C", "D", "F", "G", "Bb"],
  HungarianMinor: ["C", "D", "Eb", "F#", "G", "Ab", "B"],
  Japanese: ["C", "Db", "F", "G", "Ab"],
  Enigmatic: ["C", "Db", "E", "F#", "G#", "A#", "B"],
  DoubleHarmonic: ["C", "Db", "E", "F", "G", "Ab", "B"],
  Flamenco: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
  Byzantine: ["C", "Db", "E", "F", "G", "Ab", "B"],
  Persian: ["C", "Db", "E", "F", "G", "Ab", "Bb"],
  WholeTone: ["C", "D", "E", "F#", "G#", "A#"],
  SuperLocrian: ["C", "Db", "Eb", "E", "Gb", "Ab", "Bb"],
  LydianAugmented: ["C", "D", "E", "F#", "G#", "A", "B"],
  NeapolitanMinor: ["C", "Db", "Eb", "F", "G", "Ab", "B"],
  NeapolitanMajor: ["C", "Db", "E", "F", "G", "A", "B"],
};

export const OCTAVES = [0, 1, 2, 3, 4, 5, 6];

function normalizeNoteName(note) {
  // Always return sharp names
  return FLAT_TO_SHARP[note] || note;
}

// Returns absolute intervals in semitones from root, e.g. [0,2,4,5,7,9,11] for major
function getScaleIntervals(scale) {
  const intervals = [0];
  let prev = CHROMATIC.indexOf(normalizeNoteName(scale[0]));
  for (let i = 1; i < scale.length; i++) {
    const curr = CHROMATIC.indexOf(normalizeNoteName(scale[i]));
    if (curr === -1) throw new Error(`Unknown note in scale: ${scale[i]}`);
    intervals.push((curr - prev + 12) % 12);
    prev = curr;
  }
  // Turn into absolute offsets from root:
  let sum = 0;
  return intervals.map((x) => (sum += x));
}

// Main flexible scale builder
export function buildScaleNotes(scaleName, octaves = [4], root = "C") {
  const scale = SCALES[scaleName] || SCALES["Major"];
  const intervals = getScaleIntervals(scale);
  const rootIdx = CHROMATIC.indexOf(normalizeNoteName(root));
  if (rootIdx === -1) throw new Error(`Unknown root note: ${root}`);
  let notes = [];
  octaves.forEach((oct) => {
    intervals.forEach((offset) => {
      const note = CHROMATIC[(rootIdx + offset) % 12] + oct;
      notes.push(note);
    });
  });
  return notes;
}

// Map X [-5, +5] to a note from the selected scale/key/octaves
export function getNoteFromX(x) {
  const scaleNotes = buildScaleNotes(currentScale, currentOctaves, currentKey);
  const index = Math.floor(((x + 5) / 10) * scaleNotes.length);
  return scaleNotes[Math.max(0, Math.min(index, scaleNotes.length - 1))];
}

export function getVelocityFromY(y) {
  const norm = (y + 5) / 10;
  return Math.max(0.1, Math.min(1.0, norm));
}

// ---- STATE SETTERS ----
export function setCurrentScale(s) {
  currentScale = s;
}
export function setCurrentOctaves(o) {
  currentOctaves = o;
}
export function setCurrentKey(k) {
  currentKey = k;
}

// generated notes for sanity check
// console.log(buildScaleNotes("Dorian", [4, 5], "D#"));
