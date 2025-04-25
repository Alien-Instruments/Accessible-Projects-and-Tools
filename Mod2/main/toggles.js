// Get references to the elements
const controlsDiv = document.getElementById("controls");
const visualizerCanvas = document.getElementById("visualizer");
const toggleButton = document.getElementById("toggleDisplayButton");

// Initial state: Controls and analyser are hidden
let displayVisible = false; // Set to false initially since they are hidden

// Function to toggle the visibility of the controls and analyser
toggleButton.addEventListener("click", () => {
  displayVisible = !displayVisible;

  controlsDiv.classList.toggle("hidden", !displayVisible);
  visualizerCanvas.classList.toggle("hidden", !displayVisible);

  toggleButton.textContent = displayVisible ? "Hide Analyser" : "Show Analyser";
});

document
  .getElementById("toggleSequencer")
  .addEventListener("click", function () {
    const stepSequencer = document.getElementById("stepSequencer");
    const toggleButton = document.getElementById("toggleSequencer");

    // Toggle visibility
    if (stepSequencer.style.display === "none") {
      stepSequencer.style.display = "block";
      toggleButton.textContent = "Hide Step Sequencer"; // Change button text
    } else {
      stepSequencer.style.display = "none";
      toggleButton.textContent = "Show Step Sequencer"; // Change button text
    }
  });

document.getElementById("toggleCC").addEventListener("click", function () {
  const stepSequencer = document.getElementById("midi-learn-container");
  const toggleButton = document.getElementById("toggleCC");

  // Toggle visibility
  if (stepSequencer.style.display === "none") {
    stepSequencer.style.display = "block";
    toggleButton.textContent = "Hide CC Mapper"; // Change button text
  } else {
    stepSequencer.style.display = "none";
    toggleButton.textContent = "Show CC Mapper"; // Change button text
  }
});
