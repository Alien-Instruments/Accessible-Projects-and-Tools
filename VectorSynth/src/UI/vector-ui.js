import { VectorPad } from "../controls/VectorPad.js";

export function setupVectorUI(synth) {
  const vectorPad = new VectorPad(
    document.getElementById("vector-ui"),
    (x, y) => {
      synth.setVector(x, y);
    }
  );

  vectorPad.set(0.5, 0.5);
  vectorPad.setSliders(
    document.getElementById("vector-x"),
    document.getElementById("vector-y")
  );

  window.vectorPad = vectorPad;

  return vectorPad;
}

export function setupMusicalTypingToggle(get, set) {
  let musicalTypingEnabled =
    localStorage.getItem("musicalTypingEnabled") !== "false";

  const button = document.getElementById("toggleMusicalTyping");
  button.textContent = musicalTypingEnabled
    ? "Disable Musical Typing"
    : "Enable Musical Typing";

  button.addEventListener("click", () => {
    musicalTypingEnabled = !musicalTypingEnabled;
    button.textContent = musicalTypingEnabled
      ? "Disable Musical Typing"
      : "Enable Musical Typing";
    localStorage.setItem("musicalTypingEnabled", musicalTypingEnabled);
    set(musicalTypingEnabled);
  });

  set(musicalTypingEnabled); // ensure state is initialized
}
