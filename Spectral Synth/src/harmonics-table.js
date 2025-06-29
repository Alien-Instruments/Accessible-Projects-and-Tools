import { harmonics, userHarmonics } from "./harmonics.js";

export function renderHarmonicsTable(onUpdate) {
  let tbl = `<table><tr>`;
  for (let n = 1; n <= harmonics; n++) {
    tbl += `<th aria-hidden="true">${n}</th>`;
  }
  tbl += `</tr><tr>`;
  for (let n = 1; n <= harmonics; n++) {
    tbl += `<td><div class="number-div"><input id="harmonic-${n}" type="number" step="0.01" min="-1" max="1" value="${
      userHarmonics[n - 1]
    }" data-n="${n - 1}" aria-label="Harmonic ${n}" /></div></td>`;
  }

  tbl += `</tr></table>`;
  document.getElementById("harmonics-table").innerHTML = tbl;
  document.querySelectorAll("#harmonics-table input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const idx = parseInt(e.target.getAttribute("data-n"));
      userHarmonics[idx] = parseFloat(e.target.value) || 0;
      if (onUpdate) onUpdate();
    });
  });
}
