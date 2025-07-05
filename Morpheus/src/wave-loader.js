import { audioContext } from "./utils/context.js";

export function getWaveFilePaths(waveSources) {
  const waveFiles = [];
  for (const source of waveSources) {
    const { folder, prefix, count } = source;
    for (let i = 1; i <= count; i++) {
      waveFiles.push(`${folder}/${prefix}${i}.wav`);
    }
  }
  return waveFiles;
}

export async function loadWaves(waveFiles) {
  const waveTableMap = {};
  for (const filePath of waveFiles) {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Failed to load ${filePath}`);
    const buffer = await res.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    waveTableMap[filePath] = audioBuffer.getChannelData(0).slice();
  }
  return waveTableMap;
}
