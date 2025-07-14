import { audioCtx } from "../utils/audioCtx.js";
export function createUiLfo(id) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const out = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 1;
  gain.gain.value = 0.5;
  out.gain.value = 1;

  osc.connect(gain).connect(out);
  osc.start();

  return {
    id,
    osc,
    gain,
    out,
    rate: 2,
    depth: 0.5,
    targets: [],
  };
}
