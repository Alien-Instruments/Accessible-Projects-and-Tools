export function letterToPhonemes(word) {
  word = word.toUpperCase();
  const out = [];
  let i = 0;

  while (i < word.length) {
    // Digraphs and trigraphs
    if (word.startsWith("CH", i)) {
      out.push("CH");
      i += 2;
      continue;
    }
    if (word.startsWith("SH", i)) {
      out.push("SH");
      i += 2;
      continue;
    }
    if (word.startsWith("TH", i)) {
      // Voiceless or voiced? Use position or heuristics
      // Here, treat as "TH" (voiceless, /θ/) for simplicity
      out.push("TH");
      i += 2;
      continue;
    }
    if (word.startsWith("PH", i)) {
      out.push("F");
      i += 2;
      continue;
    }
    if (word.startsWith("WH", i)) {
      out.push("W");
      i += 2;
      continue;
    }
    if (word.startsWith("QU", i)) {
      out.push("K");
      out.push("W");
      i += 2;
      continue;
    }
    if (word.startsWith("NG", i)) {
      out.push("NG");
      i += 2;
      continue;
    }
    if (word.startsWith("CK", i)) {
      out.push("K");
      i += 2;
      continue;
    }
    if (word.startsWith("GH", i)) {
      out.push("G");
      i += 2;
      continue;
    }

    // Single tricky letters
    const ch = word[i];
    const next = word[i + 1] || "";
    const prev = word[i - 1] || "";

    // C: soft or hard
    if (ch === "C") {
      if ("EIY".includes(next)) out.push("S"); // soft C
      else out.push("K"); // hard C
      i++;
      continue;
    }

    // G: soft or hard
    if (ch === "G") {
      if ("EIY".includes(next)) out.push("JH"); // soft G (giraffe)
      else out.push("G"); // hard G
      i++;
      continue;
    }

    // X: usually /ks/
    if (ch === "X") {
      out.push("K");
      out.push("S");
      i++;
      continue;
    }

    // Q: always /kw/
    if (ch === "Q") {
      out.push("K");
      out.push("W");
      i++;
      continue;
    }

    // S: often S, but sometimes Z (not handled here)
    if (ch === "S") {
      // Example: "ROSE" S is /Z/, but default S for now
      out.push("S");
      i++;
      continue;
    }

    // Z: /Z/
    if (ch === "Z") {
      out.push("Z");
      i++;
      continue;
    }

    // Default mapping for vowels/consonants
    // (this is where you could improve with a larger table)
    if ("AEIOU".includes(ch)) {
      out.push(ch);
      i++;
      continue;
    }

    // Common consonants
    if ("BDFHJKLMNPRTVWY".includes(ch)) {
      out.push(ch);
      i++;
      continue;
    }

    // Special handling for "R" (could be "ER" at end, e.g. "water")
    if (ch === "R" && i === word.length - 1) {
      out.push("ER");
      i++;
      continue;
    }

    // Fallback: push the uppercase letter
    out.push(ch);
    i++;
  }
  return out;
}
