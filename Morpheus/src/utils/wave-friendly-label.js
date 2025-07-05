export function waveFileToLabel(filePath) {
  // "Distorted/Distorted1.wav" => "Distorted 1"
  // 1. Remove extension
  let withoutExt = filePath.replace(/\.wav$/i, "");
  // 2. Remove folder if present
  let parts = withoutExt.split(/[\\/]/);
  let name = parts[parts.length - 1];
  // 3. Split prefix and number: "Distorted1" => ["Distorted", "1"]
  let match = name.match(/^([A-Za-z]+)(\d+)$/);
  if (match) {
    let prefix = match[1].replace(/([A-Z])/g, " $1").trim(); // Fm10 → Fm 10 (handles Fm, OscChip, etc.)
    let num = match[2];
    return `${prefix} ${num}`;
  }
  // fallback, just replace -/_ with space
  return name.replace(/[-_]/g, " ");
}
