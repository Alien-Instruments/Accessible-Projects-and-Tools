import { harmonics } from "./harmonics.js";

// 2D morphing: c00 = top left, c10 = top right, c01 = bottom left, c11 = bottom right
export function morph2D(c00, c10, c01, c11, x, y) {
  const real = new Float32Array(harmonics + 1),
    imag = new Float32Array(harmonics + 1);
  for (let n = 0; n <= harmonics; n++) {
    real[n] =
      (1 - x) * (1 - y) * c00.real[n] +
      x * (1 - y) * c10.real[n] +
      (1 - x) * y * c01.real[n] +
      x * y * c11.real[n];
    imag[n] =
      (1 - x) * (1 - y) * c00.imag[n] +
      x * (1 - y) * c10.imag[n] +
      (1 - x) * y * c01.imag[n] +
      x * y * c11.imag[n];
  }
  return { real, imag };
}
