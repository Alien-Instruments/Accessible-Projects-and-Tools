export function getEnvelope() {
  return {
    attack: parseFloat(document.getElementById("envA").value),
    decay: parseFloat(document.getElementById("envD").value),
    sustain: parseFloat(document.getElementById("envS").value),
    release: parseFloat(document.getElementById("envR").value),
  };
}

export function getModEnvelope() {
  return {
    attack: parseFloat(document.getElementById("modEnvA").value),
    decay: parseFloat(document.getElementById("modEnvD").value),
    sustain: parseFloat(document.getElementById("modEnvS").value),
    release: parseFloat(document.getElementById("modEnvR").value),
    depth: parseFloat(document.getElementById("modEnvDepth").value),
  };
}
