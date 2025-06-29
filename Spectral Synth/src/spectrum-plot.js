export function drawSpectrum(imag) {
  const harmonics = 16;
  const canvas = document.getElementById("plot");
  const ctx = canvas.getContext("2d");
  ctx.font = "16px sans-serif";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxVal = Math.max(...imag.slice(1).map(Math.abs), 0.01);

  let desc = `Harmonic spectrum, 16 harmonics. `;
  for (let n = 1; n <= harmonics; n++) {
    desc += `Harmonic ${n}: ${imag[n]?.toFixed(2) || "0.00"}`;
    if (n < harmonics) desc += ", ";
    else desc += ".";
  }

  // Draw the bars as before...
  for (let n = 1; n <= harmonics; n++) {
    let val = imag[n];
    let x = (n - 1) * (canvas.width / harmonics);
    let y = canvas.height * (1 - (val / maxVal + 1) / 2);
    ctx.fillStyle = "#802424";
    ctx.fillRect(x, y, canvas.width / harmonics - 2, canvas.height - y);
    ctx.fillStyle = "#ffffff";
    if (canvas.width / harmonics > 15)
      ctx.fillText(n, x + 6, canvas.height - 5);
  }

  // Update the screen reader description
  const descElem = document.getElementById("spectrum-desc");
  if (descElem) descElem.textContent = desc;
}
