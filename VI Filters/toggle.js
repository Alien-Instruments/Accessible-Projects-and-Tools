let showColourLoss = true;

function toggleDivs() {
  const colourLossDiv = document.getElementById("colour-loss");
  const visionLossDiv = document.getElementById("vision-loss");
  const toggleButton = document.getElementById("toggleButton");

  if (showColourLoss) {
    colourLossDiv.style.display = "none";
    visionLossDiv.style.display = "block";
    toggleButton.textContent = "Show Colour Blindness Weakness Filters";
  } else {
    colourLossDiv.style.display = "block";
    visionLossDiv.style.display = "none";
    toggleButton.textContent = "Show Vision Loss Filters";
  }

  showColourLoss = !showColourLoss;
}
