import { getArp } from "../arpeggiator/createArp.js";

export function setupArpUI() {
  const arp = getArp();

  // Toggle on/off
  document.getElementById("arp-toggle").addEventListener("change", (e) => {
    arp.toggle(e.target.checked);
  });

  // Arpeggiator timing: BPM + Division → Rate
  const bpmSlider = document.getElementById("arp-bpm");
  const bpmVal = document.getElementById("arp-bpm-val");
  const divisionSelect = document.getElementById("arp-division");
  const rateDisplay = document.getElementById("arp-rate-label");

  const divisions = {
    "1/1": 1,
    "1/2": 0.5,
    "1/4": 0.25,
    "1/8": 0.125,
    "1/16": 0.0625,
    "1/32": 0.03125,
  };

  function getRateFromDivision(bpm, division) {
    const beatsPerSecond = bpm / 60;
    return 1 / (beatsPerSecond / divisions[division]);
  }

  function updateArpRateFromBPM() {
    const bpm = parseFloat(bpmSlider.value);
    const division = divisionSelect.value;
    const rate = getRateFromDivision(bpm, division);

    arp.setRate(rate);
    arp.refresh(); // re-schedules with new timing

    bpmVal.textContent = bpm;
    // rateDisplay.textContent = `= ${rate.toFixed(3)}s per step`;
  }

  // Wire up listeners
  bpmSlider.addEventListener("input", updateArpRateFromBPM);
  divisionSelect.addEventListener("change", updateArpRateFromBPM);

  // Initial call
  updateArpRateFromBPM();

  // Octave Range
  document.getElementById("arp-octaves").addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    document.getElementById("arp-octaves-value").textContent = val;
    arp.setOctaveRange(val);
  });

  // Swing
  const swingSlider = document.getElementById("arp-swing");
  const swingVal = document.getElementById("arp-swing-val");
  swingSlider.addEventListener("input", () => {
    const value = parseFloat(swingSlider.value);
    swingVal.textContent = value.toFixed(2);
    arp.setSwing(value);
  });

  // Gate time
  const gateSlider = document.querySelector("#gateTimeSlider");
  const gateDisplay = document.getElementById("gateTimeValue");
  gateSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    arp.setGateTime(val);
    gateDisplay.textContent = val.toFixed(2);
  });

  // Latch
  document.getElementById("arp-latch").addEventListener("change", (e) => {
    arp.setLatched(e.target.checked);
  });

  // Ratchets
  const ratchetSelect = document.getElementById("ratchet-count");
  const randomCheckbox = document.getElementById("random-ratchet");

  ratchetSelect.addEventListener("change", (e) => {
    const count = parseInt(e.target.value, 10);
    arp.setRatchetCount(count);
  });

  randomCheckbox.addEventListener("change", (e) => {
    arp.enableRandomRatchet(e.target.checked);
  });

  // Pattern select
  const arpModeSelect = document.getElementById("arp-mode");
  const arpSliders = document.querySelector(".arp-sliders");
  const arpRoll = document.querySelector(".arp-roll");
  const arpViewToggle = document.getElementById("arp-view-toggle");

  function updateArpView() {
    if (arpModeSelect.value === "custom") {
      arpViewToggle.classList.remove("hidden");

      if (arpRoll.classList.contains("hidden")) {
        arpRoll.classList.remove("hidden");
        arpSliders.classList.add("hidden");
        arpViewToggle.textContent = "Show Sliders";
      } else {
        arpRoll.classList.add("hidden");
        arpSliders.classList.remove("hidden");
        arpViewToggle.textContent = "Show Piano Roll";
      }
    } else {
      arpViewToggle.classList.add("hidden");
      arpRoll.classList.add("hidden");
      arpSliders.classList.remove("hidden");
    }
  }

  arpModeSelect.addEventListener("change", (e) => {
    arp.setPattern(e.target.value);
    updateArpView();
  });

  updateArpView();

  arpViewToggle.addEventListener("click", () => {
    if (arpRoll.classList.contains("hidden")) {
      arpRoll.classList.remove("hidden");
      arpSliders.classList.add("hidden");
      arpViewToggle.textContent = "Show Sliders";
    } else {
      arpRoll.classList.add("hidden");
      arpSliders.classList.remove("hidden");
      arpViewToggle.textContent = "Show Piano Roll";
    }
  });

  // Piano roll grid
  const pianoRoll = document.getElementById("piano-roll");
  const applyButton = document.getElementById("apply-pattern");
  const steps = 16;
  const notes = 6;

  for (let y = notes - 1; y >= 0; y--) {
    for (let x = 0; x < steps; x++) {
      const cell = document.createElement("div");
      cell.classList.add("piano-roll-cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute("role", "button");
      cell.setAttribute("aria-label", `Step ${x + 1}, Note ${y + 1}`);
      cell.setAttribute("aria-pressed", "false");
      cell.tabIndex = 0;
      pianoRoll.appendChild(cell);
    }
  }

  pianoRoll.addEventListener("click", (e) => {
    if (e.target.classList.contains("piano-roll-cell")) {
      const x = parseInt(e.target.dataset.x);
      document
        .querySelectorAll(`.piano-roll-cell[data-x='${x}']`)
        .forEach((cell) => {
          cell.classList.remove("active");
          cell.setAttribute("aria-pressed", "false");
        });

      e.target.classList.add("active");
      e.target.setAttribute("aria-pressed", "true");
    }
  });

  pianoRoll.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("piano-roll-cell")) {
      e.target.classList.remove("active");
      e.target.setAttribute("aria-pressed", "false");
    }
  });

  pianoRoll.addEventListener("keydown", (e) => {
    const cell = e.target;
    if (!cell.classList.contains("piano-roll-cell")) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        const isActive = cell.classList.contains("active");
        document
          .querySelectorAll(`.piano-roll-cell[data-x='${x}']`)
          .forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-pressed", "false");
          });
        if (!isActive) {
          cell.classList.add("active");
          cell.setAttribute("aria-pressed", "true");
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        focusCell(x + 1, y);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusCell(x - 1, y);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusCell(x, y + 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        focusCell(x, y - 1);
        break;
    }
  });

  function focusCell(x, y) {
    const cell = document.querySelector(
      `.piano-roll-cell[data-x='${x}'][data-y='${y}']`
    );
    if (cell) cell.focus();
  }

  applyButton.addEventListener("click", () => {
    const pattern = [];
    for (let x = 0; x < steps; x++) {
      const activeCell = document.querySelector(
        `.piano-roll-cell.active[data-x='${x}']`
      );
      if (activeCell) {
        pattern.push(parseInt(activeCell.dataset.y));
      } else {
        pattern.push(null);
      }
    }
    arp.setCustomPattern(pattern);
  });
}
