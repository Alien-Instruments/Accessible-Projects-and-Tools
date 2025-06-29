export const harmonics = 16;

// User spectrum (mutable, single source of truth)
export const userHarmonics = Array(harmonics).fill(0);

export function sawCoeffs() {
  const real = new Float32Array(harmonics + 1),
    imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    real[n] = 0;
    imag[n] = -1 / n;
  }
  return { real, imag };
}
export function squareCoeffs() {
  const real = new Float32Array(harmonics + 1),
    imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    real[n] = 0;
    imag[n] = n % 2 === 1 ? -1 / n : 0;
  }
  return { real, imag };
}
export function triangleCoeffs() {
  const real = new Float32Array(harmonics + 1),
    imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    imag[n] =
      n % 2 === 1
        ? (4 / (Math.PI * Math.PI)) * (1 / (n * n)) * (n % 4 === 1 ? 1 : -1)
        : 0;
    real[n] = 0;
  }
  return { real, imag };
}
export function userCoeffs() {
  const real = new Float32Array(harmonics + 1),
    imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    real[n] = 0;
    imag[n] = userHarmonics[n - 1] || 0;
  }
  return { real, imag };
}
