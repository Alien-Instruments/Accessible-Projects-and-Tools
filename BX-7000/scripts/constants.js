export const keyboardMap = {
  KeyA: 60, // C4
  KeyW: 61,
  KeyS: 62,
  KeyE: 63,
  KeyD: 64,
  KeyF: 65,
  KeyT: 66,
  KeyG: 67,
  KeyY: 68,
  KeyH: 69,
  KeyU: 70,
  KeyJ: 71,
  KeyK: 72, // C5
};

export const ALGORITHMS = {
  1: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [{ from: 6, to: 1 }],
  },
  2: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 3, to: 2 },
      { from: 5, to: 4 },
    ],
  },
  3: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 3 },
    ],
    outputs: [1, 2, 3],
    feedback: [{ from: 6, to: 3 }],
  },
  4: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
    ],
    outputs: [1, 2, 3, 4],
    feedback: [
      { from: 5, to: 4 },
      { from: 6, to: 5 },
    ],
  },
  5: {
    paths: [
      { from: 6, to: 3 },
      { from: 5, to: 2 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [{ from: 6, to: 1 }],
  },
  6: {
    paths: [
      { from: 6, to: 2 },
      { from: 5, to: 2 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 4, to: 1 },
      { from: 5, to: 2 },
      { from: 6, to: 2 },
    ],
  },
  7: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 6, to: 5 },
      { from: 4, to: 3 },
    ],
  },
  8: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
      { from: 4, to: 3 },
    ],
    outputs: [1, 3],
    feedback: [
      { from: 5, to: 1 },
      { from: 4, to: 3 },
    ],
  },
  9: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [{ from: 6, to: 5 }],
  },
  10: {
    paths: [{ from: 6, to: 5 }],
    outputs: [1, 2, 3, 4, 5],
    feedback: [{ from: 6, to: 5 }],
  },
  11: {
    paths: [
      { from: 6, to: 4 },
      { from: 5, to: 3 },
    ],
    outputs: [1, 2, 3, 4],
    feedback: [
      { from: 5, to: 3 },
      { from: 6, to: 4 },
    ],
  },
  12: {
    paths: [
      { from: 6, to: 3 },
      { from: 5, to: 3 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [{ from: 4, to: 1 }],
  },
  13: {
    paths: [
      { from: 6, to: 2 },
      { from: 5, to: 2 },
      { from: 4, to: 2 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 4, to: 2 },
      { from: 6, to: 2 },
    ],
  },
  14: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
      { from: 3, to: 1 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
  },
  15: {
    paths: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
      { from: 3, to: 1 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
      { from: 3, to: 1 },
      { from: 2, to: 1 },
    ],
  },
  16: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
    outputs: [1, 2, 3, 4],
    feedback: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
  },
  17: {
    paths: [{ from: 6, to: 5 }],
    outputs: [1, 2, 3, 4, 5],
    feedback: [{ from: 6, to: 5 }],
  },
  18: {
    paths: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
    ],
  },
  19: {
    paths: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
    ],
    outputs: [1, 2, 3, 4],
    feedback: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
    ],
  },
  20: {
    paths: [
      { from: 6, to: 2 },
      { from: 5, to: 1 },
    ],
    outputs: [1, 2, 3, 4],
    feedback: [
      { from: 6, to: 2 },
      { from: 5, to: 1 },
    ],
  },
  21: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
      { from: 4, to: 3 },
    ],
    outputs: [1, 3],
    feedback: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
  },
  22: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [{ from: 5, to: 1 }],
  },
  23: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [
      { from: 5, to: 4 },
      { from: 4, to: 1 },
    ],
  },
  24: {
    paths: [
      { from: 6, to: 3 },
      { from: 5, to: 2 },
      { from: 4, to: 1 },
    ],
    outputs: [1, 2, 3],
    feedback: [
      { from: 4, to: 1 },
      { from: 5, to: 2 },
      { from: 6, to: 3 },
    ],
  },
  25: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 1 },
      { from: 3, to: 2 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 3, to: 2 },
      { from: 4, to: 1 },
      { from: 5, to: 4 },
    ],
  },
  26: {
    paths: [
      { from: 6, to: 2 },
      { from: 5, to: 2 },
      { from: 4, to: 2 },
      { from: 3, to: 1 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 3, to: 1 },
      { from: 4, to: 2 },
      { from: 5, to: 2 },
      { from: 6, to: 2 },
    ],
  },
  27: {
    paths: [
      { from: 6, to: 2 },
      { from: 5, to: 2 },
      { from: 4, to: 1 },
      { from: 3, to: 1 },
    ],
    outputs: [1, 2],
    feedback: [
      { from: 3, to: 1 },
      { from: 4, to: 1 },
      { from: 5, to: 2 },
      { from: 6, to: 2 },
    ],
  },
  28: {
    paths: [
      { from: 6, to: 1 },
      { from: 5, to: 1 },
      { from: 4, to: 1 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 3, to: 2 },
      { from: 2, to: 1 },
      { from: 6, to: 1 },
    ],
  },
  29: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 6, to: 5 },
      { from: 5, to: 1 },
    ],
  },
  30: {
    paths: [
      { from: 6, to: 4 },
      { from: 5, to: 4 },
      { from: 4, to: 2 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 3, to: 2 },
      { from: 2, to: 1 },
      { from: 6, to: 4 },
    ],
  },
  31: {
    paths: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
    outputs: [1],
    feedback: [
      { from: 6, to: 5 },
      { from: 5, to: 4 },
      { from: 4, to: 3 },
      { from: 3, to: 2 },
      { from: 2, to: 1 },
    ],
  },
  32: {
    paths: [],
    outputs: [1, 2, 3, 4, 5, 6],
    feedback: [
      { from: 6, to: 6 },
      { from: 5, to: 5 },
      { from: 4, to: 4 },
      { from: 3, to: 3 },
      { from: 2, to: 2 },
      { from: 1, to: 1 },
    ],
  },
};
