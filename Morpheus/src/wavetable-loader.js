import { audioContext } from "./utils/context.js";

// Store loaded wave data (AudioBuffer channel data)
export const waveTableMap = {};

// Load a single wav file and return Float32Array data
export async function loadWave(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const buffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  return audioBuffer.getChannelData(0).slice();
}

// Bulk load all files from an array of file paths
export async function loadAllWaves(waveFiles) {
  for (const filePath of waveFiles) {
    const data = await loadWave(filePath);
    waveTableMap[filePath] = data;
  }
}
