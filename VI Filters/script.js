let originalImageData;
const imageCanvas = document.getElementById("imageCanvas");
const ctx = imageCanvas.getContext("2d");

document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const maxCanvasWidth = 1200; 
        const maxCanvasHeight = 1000; 

        // Get the image's original aspect ratio
        const aspectRatio = img.width / img.height;

        // Calculate new dimensions while maintaining the aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxCanvasWidth) {
          newWidth = maxCanvasWidth;
          newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxCanvasHeight) {
          newHeight = maxCanvasHeight;
          newWidth = newHeight * aspectRatio;
        }

        // Set canvas dimensions to the resized image size
        imageCanvas.width = newWidth;
        imageCanvas.height = newHeight;

        // Draw the resized image on the canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        originalImageData = ctx.getImageData(0, 0, newWidth, newHeight);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

let pipetteMode = null; // To track which color picker is active for selection

// Add event listener for the delete button
document.getElementById("deleteImage").addEventListener("click", function () {
  // Clear the canvas by setting its width (which clears all content)
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

  // Reset the originalImageData to null
  originalImageData = null;

  // To reset the file input field in Safari
  const oldInput = document.getElementById("imageUpload");
  const newInput = document.createElement("input");

  newInput.type = "file";
  newInput.id = "imageUpload";
  newInput.accept = "image/*"; 
  newInput.className = oldInput.className; 

  // Re-attach the event listener for image upload
  newInput.addEventListener("change", oldInput.onchange);

  // Replace the old input with the new one
  oldInput.parentNode.replaceChild(newInput, oldInput);
});

// Function to get the RGB color from a canvas pixel
function getColorFromCanvas(x, y) {
  const pixelData = ctx.getImageData(x, y, 1, 1).data;
  return { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
}

// Function to convert RGB to HEX (for updating the picker)
function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

// Handle canvas clicks (pipette mode)
imageCanvas.addEventListener("click", function (event) {
  if (!pipetteMode) return; // Only allow selection when pipette mode is active

  const rect = imageCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const selectedColor = getColorFromCanvas(x, y);
  const hexColor = rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);

  if (pipetteMode === "color1") {
    document.getElementById("picker1").value = hexColor;
    document.getElementById(
      "color1"
    ).value = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
  } else if (pipetteMode === "color2") {
    document.getElementById("picker2").value = hexColor;
    document.getElementById(
      "color2"
    ).value = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
  }

  pipetteMode = null;
});

// Pipette button event listeners
document.getElementById("pipetteColor1").addEventListener("click", function () {
  pipetteMode = "color1"; // Set pipette mode to select Color 1
});

document.getElementById("pipetteColor2").addEventListener("click", function () {
  pipetteMode = "color2"; // Set pipette mode to select Color 2
});

// Add event listener for the save button
document.getElementById("saveImage").addEventListener("click", function () {
  // Get the user-provided filename
  let filename = document.getElementById("filename").value;

  // Use default name if no filename is provided
  if (!filename) {
    filename = "filtered-image"; // Default name
  }

  // Get the data URL of the canvas (PNG format by default)
  const imageURL = imageCanvas.toDataURL("image/png");

  // Create a temporary anchor element
  const link = document.createElement("a");
  link.href = imageURL;

  // Set the download attribute with the user-provided or default filename
  link.download = `${filename}.png`;

  // Trigger the download by simulating a click event
  link.click();
});

//Filters==========================================================
// Apply Deuteranopia (Red-Green Color Blindness)
function applyDeuteranopia() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Simulate Deuteranopia by adjusting the red-green balance
    const newR = r * 0.62 + g * 0.38;
    const newG = r * 0.7 + g * 0.3;
    const newB = b;

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Deuteranopia: A type of red-green color blindness where green cones in the eye do not function properly, leading to difficulty distinguishing between red and green."
  );
}

// Apply Protanopia (Another type of Red-Green Color Blindness)
function applyProtanopia() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Simulate Protanopia by adjusting the red-green balance differently
    const newR = r * 0.567 + g * 0.433;
    const newG = r * 0.558 + g * 0.442;
    const newB = b;

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Protanopia: A type of red-green color blindness where the red cones in the eye are absent or malfunctioning, causing red to appear as green or dark."
  );
}

// Apply Tritanopia (Blue-Yellow Color Blindness)
function applyTritanopia() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Tritanopia color blindness matrix (approximation)
    const newR = 0.95 * r + 0.05 * g + 0 * b;
    const newG = 0 * r + 0.433 * g + 0.567 * b;
    const newB = 0 * r + 0.475 * g + 0.525 * b;

    // Assign new RGB values back to the image
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Tritanopia: A rare type of color blindness where blue cones are absent or malfunctioning, making it difficult to distinguish between blue and yellow."
  );
}

//Apply Achromatopsia (complete colour loss)
function applyAchromatopsia() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert to grayscale by averaging RGB values
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Assign the same grayscale value to all channels
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Achromatopsia: A rare, severe condition where the person cannot perceive any colors at all, seeing only shades of grey."
  );
}

//Apply Protanomaly (Reduced Red Sensitivity)
function applyProtanomaly() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Protanomaly color blindness matrix (approximation)
    const newR = 0.817 * r + 0.183 * g + 0 * b;
    const newG = 0.333 * r + 0.667 * g + 0 * b;
    const newB = 0 * r + 0.125 * g + 0.875 * b;

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Protanomaly: A milder form of red-green color blindness where the red cones do not work as efficiently, reducing sensitivity to red."
  );
}

//Apply Deuteranomaly (Reduced Green Sensitivity)
function applyDeuteranomaly() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Deuteranomaly color blindness matrix (approximation)
    const newR = 0.8 * r + 0.2 * g + 0 * b;
    const newG = 0.258 * r + 0.742 * g + 0 * b;
    const newB = 0 * r + 0.142 * g + 0.858 * b;

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Deuteranomaly: The most common type of red-green color blindness where green cones are less sensitive, causing green to appear more like red."
  );
}

//Apply Tritanomaly (Reduced Blue Sensitivity)
function applyTritanomaly() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Tritanomaly color blindness matrix (approximation)
    const newR = 0.967 * r + 0.033 * g + 0 * b;
    const newG = 0 * r + 0.733 * g + 0.267 * b;
    const newB = 0 * r + 0.183 * g + 0.817 * b;

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  ctx.putImageData(imageData, 0, 0);

  updateColorInfoText(
    "Tritanomaly: A rare condition where blue cones do not work properly, reducing sensitivity to blue and affecting blue-yellow perception."
  );
}

// Apply Cataracts (Blurry Vision)
function applyCataracts() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;
  const width = imageCanvas.width;
  const height = imageCanvas.height;

  // Apply a simple blur (5x5 kernel Gaussian blur approximation)
  const blurredData = blurImage(data, width, height, 5); // 5 is the blur radius

  // Apply brightness and contrast reduction
  const brightnessFactor = 0.8; // Reduce brightness a bit for cataracts effect
  for (let i = 0; i < blurredData.length; i += 4) {
    blurredData[i] *= brightnessFactor; // Red
    blurredData[i + 1] *= brightnessFactor; // Green
    blurredData[i + 2] *= brightnessFactor; // Blue
  }

  // Apply lighter patches (radial gradient effect)
  applyLighterPatch(blurredData, width, height);

  // Put the processed data back into the canvas
  const newImageData = new ImageData(blurredData, width, height);
  ctx.putImageData(newImageData, 0, 0);

  updateLowVisInfoText(
    "Cataracts are a common eye condition where the lens of the eye becomes cloudy, leading to blurry vision, difficulty seeing at night, and increased sensitivity to light. The lens is normally clear, allowing light to pass through and focus on the retina for sharp vision. With cataracts, proteins in the lens break down and clump together, causing cloudiness that impairs vision."
  );
}

// Apply lighter patches at the center using a radial gradient
function applyLighterPatch(data, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY); // Max distance from the center

  // Define how strong the whiteness is and how far it extends
  const maxWhiteOverlay = 0.8; // How white the center patch gets (0 to 1)
  const patchRadius = maxDistance * 0.4; // The effective radius of the white patch

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Calculate the whiteness factor based on distance from center
      const whiteness =
        Math.max(0, (patchRadius - distance) / patchRadius) * maxWhiteOverlay;

      const index = (y * width + x) * 4;

      // Blend white into Red, Green, Blue channels (increasing white)
      data[index] = data[index] + (255 - data[index]) * whiteness; // Red
      data[index + 1] = data[index + 1] + (255 - data[index + 1]) * whiteness; // Green
      data[index + 2] = data[index + 2] + (255 - data[index + 2]) * whiteness; // Blue
    }
  }
}

// Helper function to apply Gaussian blur (simplified version)
function blurImage(data, width, height, radius) {
  const blurredData = new Uint8ClampedArray(data.length);
  const kernelSize = radius * 2 + 1;
  const kernelArea = kernelSize * kernelSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1);
          const py = Math.min(Math.max(y + ky, 0), height - 1);

          const index = (py * width + px) * 4;
          sumR += data[index];
          sumG += data[index + 1];
          sumB += data[index + 2];
        }
      }

      const i = (y * width + x) * 4;
      blurredData[i] = sumR / kernelArea; // Red
      blurredData[i + 1] = sumG / kernelArea; // Green
      blurredData[i + 2] = sumB / kernelArea; // Blue
      blurredData[i + 3] = data[i + 3]; // Alpha (unchanged)
    }
  }

  return blurredData;
}

//Apply Peripheral Vision Loss (Central clear, peripheral dark)
let blurEnabled = false; // Track whether blur is enabled
function applyPeripheralVisionLoss(applyBlur = blurEnabled) {
  blurEnabled = applyBlur;

  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  // Get a fresh copy of the original image data
  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  const sliderValue = document.getElementById("visionRadius").value;
  let radiusPercentage = sliderValue / 100;
  const minRadiusPercentage = 0.05;
  radiusPercentage = Math.max(radiusPercentage, minRadiusPercentage);

  // Adjust radius (this controls the clear area in the center)
  const radius =
    (radiusPercentage * Math.min(imageCanvas.width, imageCanvas.height)) / 2;
  const blurRadiusMultiplier = 2.5; // Increase this multiplier to make the blur area larger
  const blurRadius = blurRadiusMultiplier * radius; // Extend the blur area beyond the visible area

  const centerX = imageCanvas.width / 2;
  const centerY = imageCanvas.height / 2;
  const data = imageData.data;

  for (let y = 0; y < imageCanvas.height; y++) {
    for (let x = 0; x < imageCanvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const i = (y * imageCanvas.width + x) * 4;

      if (distance > radius) {
        let darkenFactor = Math.min((distance - radius) / radius, 1.0);
        darkenFactor = Math.pow(darkenFactor, 3);

        data[i] *= 1 - darkenFactor; // Red
        data[i + 1] *= 1 - darkenFactor; // Green
        data[i + 2] *= 1 - darkenFactor; // Blue
      }
    }
  }

  if (blurEnabled) {
    applyCentralBlur(imageData, blurRadius); // Apply blur using the extended blur radius
  }

  ctx.putImageData(imageData, 0, 0);

  updateLowVisInfoText(
    "Peripheral vision loss, also known as tunnel vision, refers to the inability to see objects or movement outside of the direct line of sight, while central vision remains relatively clear. This results in a narrowed field of vision, as if looking through a tunnel.<br><br> Causes of peripheral vision loss include: <br><br>Retinitis Pigmentosa: A genetic disorder that gradually destroys the retina, particularly affecting peripheral vision.<br><br>Stroke: A stroke affecting the visual areas of the brain can result in partial or full loss of peripheral vision.<br><br>Optic nerve damage: From trauma or diseases like multiple sclerosis, which can impact the ability to see peripherally."
  );
}

function applyCentralBlur(imageData, blurRadius) {
  const width = imageCanvas.width;
  const height = imageCanvas.height;
  const data = imageData.data;
  const blurredData = new Uint8ClampedArray(data.length);

  const centerX = width / 2;
  const centerY = height / 2;

  // 5x5 Box blur kernel
  const kernel = [
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
    1 / 25,
  ];

  // Apply kernel convolution to each pixel in the central area (within blurRadius)
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= blurRadius) {
        const i = (y * width + x) * 4;
        let r = 0,
          g = 0,
          b = 0;

        // Apply 5x5 kernel
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            const ni = ((y + ky) * width + (x + kx)) * 4; // Neighbor index

            r += data[ni] * kernel[(ky + 2) * 5 + (kx + 2)];
            g += data[ni + 1] * kernel[(ky + 2) * 5 + (kx + 2)];
            b += data[ni + 2] * kernel[(ky + 2) * 5 + (kx + 2)];
          }
        }

        // Set blurred pixel values in the blurredData array
        blurredData[i] = r;
        blurredData[i + 1] = g;
        blurredData[i + 2] = b;
        blurredData[i + 3] = data[i + 3]; // Copy alpha channel as is
      } else {
        // Copy original pixel if outside the blur radius
        const i = (y * width + x) * 4;
        blurredData[i] = data[i];
        blurredData[i + 1] = data[i + 1];
        blurredData[i + 2] = data[i + 2];
        blurredData[i + 3] = data[i + 3]; // Copy alpha channel
      }
    }
  }

  // Replace the image data with the blurred central region
  imageData.data.set(blurredData);
}

function updateRadiusValue() {
  document.getElementById("radiusValue").innerText =
    document.getElementById("visionRadius").value + "%";
}

//Apply Glaucoma (Tunnel Vision)
function applyGlaucoma() {
  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  const centerX = imageCanvas.width / 2;
  const centerY = imageCanvas.height / 2;

  // Increase the radius for an even smoother and wider tunnel effect
  const maxRadius = Math.min(imageCanvas.width, imageCanvas.height) / 2;
  const data = imageData.data;

  for (let y = 0; y < imageCanvas.height; y++) {
    for (let x = 0; x < imageCanvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const i = (y * imageCanvas.width + x) * 4;

      // Start darkening even closer to the center
      if (distance > maxRadius / 4) {
        // Darkening starts closer to the center
        // Wider, smoother gradient based on distance
        let darkenFactor = (distance - maxRadius / 4) / (maxRadius / 1.25); // Widened transition area
        darkenFactor = Math.pow(darkenFactor, 1.5); // Even lower exponent for wider gradient

        // Ensure darkenFactor stays between 0 and 1
        darkenFactor = Math.min(darkenFactor, 1.0);

        // Apply darkening to the RGB channels
        data[i] *= 1 - darkenFactor; // Red
        data[i + 1] *= 1 - darkenFactor; // Green
        data[i + 2] *= 1 - darkenFactor; // Blue
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  updateLowVisInfoText(
    "Glaucoma is a group of eye conditions that damage the optic nerve, which is crucial for good vision. This damage is often caused by abnormally high pressure in the eye (intraocular pressure), but it can also occur with normal eye pressure.<br><br>How Glaucoma Affects Vision:<br><br>Peripheral Vision Loss: Glaucoma primarily affects peripheral (side) vision first. This can lead to 'tunnel vision', where a person can only see what is directly in front of them, as the outer areas of their visual field deteriorate.<br><br>Glaucoma can reduce a person's ability to distinguish between objects of similar colors or shades, especially in low-light environments. This makes it harder to detect contrasts, and things may appear less distinct or washed out. Everyday tasks, such as recognizing faces, reading, or navigating in dim lighting, can become difficult. "
  );
}

//Apply Macular Degeneration
function applyMacularDegeneration() {
  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  const centerX = imageCanvas.width / 2;
  const centerY = imageCanvas.height / 2;

  // Increase the radius further
  const radius = Math.min(imageCanvas.width, imageCanvas.height) * 0.75; // Radius is now 3/4 of the smaller canvas dimension

  const data = imageData.data;

  for (let y = 0; y < imageCanvas.height; y++) {
    for (let x = 0; x < imageCanvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const i = (y * imageCanvas.width + x) * 4;

      if (distance < radius) {
        let darkenFactor = 1 - distance / radius;

        // Use a lower exponent to make the transition more gradual
        darkenFactor = Math.pow(darkenFactor, 2); // Changed exponent from 3 to 2 for a smoother transition

        data[i] *= 1 - darkenFactor; // Red
        data[i + 1] *= 1 - darkenFactor; // Green
        data[i + 2] *= 1 - darkenFactor; // Blue
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  updateLowVisInfoText(
    "Macular degeneration, specifically age-related macular degeneration (AMD), is a progressive eye condition that affects the macula, the central part of the retina responsible for sharp, detailed vision. It leads to central vision loss, which can impair activities like reading, driving, and recognizing faces, while peripheral vision usually remains intact."
  );
}

//Apply Diabetic Retinopathy
function applyDiabeticRetinopathy() {
  const numBlotchClusters = 14; // Number of clusters
  const numBlotchesPerCluster = 10; // Number of blotches in each cluster
  const maxBlotchSize = 80; // Maximum size of blotches
  const clusterSpread = 100; // How far blotches within a cluster can be spread apart

  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  const data = imageData.data;

  // Apply blotches first
  for (let c = 0; c < numBlotchClusters; c++) {
    const clusterCenterX = Math.random() * imageCanvas.width;
    const clusterCenterY = Math.random() * imageCanvas.height;

    for (let i = 0; i < numBlotchesPerCluster; i++) {
      const blotchCenterX =
        clusterCenterX + Math.random() * clusterSpread - clusterSpread / 2;
      const blotchCenterY =
        clusterCenterY + Math.random() * clusterSpread - clusterSpread / 2;
      const blotchSize = Math.random() * maxBlotchSize + 10;

      for (let y = 0; y < imageCanvas.height; y++) {
        for (let x = 0; x < imageCanvas.width; x++) {
          const dx = x - blotchCenterX + (Math.random() - 0.5) * 5;
          const dy = y - blotchCenterY + (Math.random() - 0.5) * 5;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const idx = (y * imageCanvas.width + x) * 4;

          if (distance < blotchSize) {
            const darkenFactor =
              Math.min(1, (blotchSize - distance) / blotchSize) *
              (0.8 + Math.random() * 0.4);

            // Apply darkening effect
            data[idx] *= 1 - darkenFactor; // Red
            data[idx + 1] *= 1 - darkenFactor; // Green
            data[idx + 2] *= 1 - darkenFactor; // Blue
          }
        }
      }
    }
  }

  // Now apply a blur effect
  const blurRadius = 2; // Adjust for stronger or weaker blur

  blurImageData(imageData, blurRadius);

  ctx.putImageData(imageData, 0, 0);

  updateLowVisInfoText(
    "Diabetic retinopathy is a complication of diabetes that affects the blood vessels in the retina, the light-sensitive tissue at the back of the eye. It can lead to vision problems and, if left untreated, even blindness. The condition progresses in stages, with symptoms worsening over time.<br><br>Effects of Diabetic Retinopathy:<br><br>Floaters: Spots or dark shapes (floaters) may appear in your field of vision due to bleeding from damaged blood vessels in the retina.<br>Blurred Vision: As blood vessels in the retina become damaged, fluid can leak into the retina, causing swelling and distorted vision.<br>Loss of Central Vision: In advanced stages, the macula (responsible for sharp, central vision) can swell (macular edema), leading to central vision loss.<br>Color Vision Changes: There may be difficulty distinguishing colors as the condition worsens."
  );
}

// Function to apply a simple box blur
function blurImageData(imageData, radius) {
  const { width, height } = imageData;
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data); // Copy of original data for temporary use

  // Iterate over every pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      // Iterate over the neighboring pixels within the blur radius
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          // Make sure the neighboring pixel is within image bounds
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += tempData[idx];
            g += tempData[idx + 1];
            b += tempData[idx + 2];
            count++;
          }
        }
      }

      // Calculate the average color
      const idx = (y * width + x) * 4;
      data[idx] = r / count; // Red
      data[idx + 1] = g / count; // Green
      data[idx + 2] = b / count; // Blue
      // Alpha channel remains unchanged
    }
  }
}

// Apply Scotomas (Random blind spots)
function applyScotomas() {
  // Get slider value for number of spots
  const numSpots = document.getElementById("scotomaAmount").value;

  // Update the text next to the slider
  document.getElementById("amountValue").innerText = numSpots;

  // Fetch original image data
  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  // Create a fresh copy of the original image data
  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  const data = imageData.data;

  for (let i = 0; i < numSpots; i++) {
    const centerX = Math.random() * imageCanvas.width;
    const centerY = Math.random() * imageCanvas.height;

    // Randomize the radius of each spot (between 20 and 120)
    const spotRadius = Math.random() * 100 + 20;

    // Loop through every pixel to apply the scotoma effect
    for (let y = 0; y < imageCanvas.height; y++) {
      for (let x = 0; x < imageCanvas.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const idx = (y * imageCanvas.width + x) * 4;

        // Fully darken the center and apply blurring at the edges
        if (distance < spotRadius) {
          const darkenFactor = Math.min(
            1,
            (spotRadius - distance) / (spotRadius * 0.5)
          );

          // Apply the darkening effect
          data[idx] *= 1 - darkenFactor; // Red
          data[idx + 1] *= 1 - darkenFactor; // Green
          data[idx + 2] *= 1 - darkenFactor; // Blue
        }
      }
    }
  }

  // Apply the updated image data to the canvas
  ctx.putImageData(imageData, 0, 0);

  updateLowVisInfoText(
    "A scotoma is an area of partial or complete loss of vision in an otherwise normal visual field, essentially creating a blind spot. These blind spots can vary in size and shape and may appear in different areas of a person's vision. Scotomas can affect central, peripheral, or both parts of the visual field, depending on their cause and location."
  );
}

// Function to set random values for scotomas
function randomizeScotomas() {
  const randomNumSpots = Math.floor(Math.random() * 10) + 1; // Random number of spots between 1 and 10

  // Update sliders with random values
  document.getElementById("scotomaAmount").value = randomNumSpots;

  // Update text fields
  document.getElementById("amountValue").innerText = randomNumSpots;

  // Apply the updated scotomas effect with the random values
  applyScotomas();
}

// Add event listener to the randomize button
document
  .getElementById("randomizeScotomas")
  .addEventListener("click", randomizeScotomas);

// Apply Diplopia
function applyDiplopia() {
  const displacement = 10; // Displacement amount in pixels for the double vision effect
  const alpha = 0.5; // Transparency for the overlapping image

  if (!originalImageData) {
    originalImageData = ctx.getImageData(
      0,
      0,
      imageCanvas.width,
      imageCanvas.height
    );
  }

  // Get the original image data
  const imageData = ctx.createImageData(originalImageData);
  imageData.data.set(originalImageData.data);

  // Create a duplicate of the image data to displace
  const displacedImageData = ctx.createImageData(originalImageData);
  displacedImageData.data.set(originalImageData.data);

  // Loop through pixels and displace the image horizontally
  for (let y = 0; y < imageCanvas.height; y++) {
    for (let x = 0; x < imageCanvas.width; x++) {
      const idx = (y * imageCanvas.width + x) * 4;
      const displacedX = x + displacement;

      // Only apply displacement if within canvas bounds
      if (displacedX < imageCanvas.width) {
        const displacedIdx = (y * imageCanvas.width + displacedX) * 4;

        // Blend displaced image with original (using alpha transparency)
        for (let i = 0; i < 3; i++) {
          // Apply for R, G, B channels
          displacedImageData.data[idx + i] =
            alpha * displacedImageData.data[displacedIdx + i] +
            (1 - alpha) * imageData.data[idx + i];
        }
      }
    }
  }

  // Put the updated image data back on the canvas
  ctx.putImageData(displacedImageData, 0, 0);

  updateLowVisInfoText(
    "Diplopia, commonly known as double vision, occurs when a person sees two images of a single object. It can affect one or both eyes and may result from various conditions such as eye muscle imbalances (strabismus), neurological disorders, or corneal irregularities. Diplopia can be temporary or chronic and might indicate underlying health issues like nerve damage, brain injury, or eye muscle disorders."
  );
}

function applyLightPerceptionWithBlur() {
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  // First, convert the image to grayscale based on brightness
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]; // Red channel
    const g = data[i + 1]; // Green channel
    const b = data[i + 2]; // Blue channel

    // Convert to grayscale using light intensity formula
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply a threshold so only bright areas are visible (simulate light perception)
    const lightThreshold = 100; // Adjust this for more/less light sensitivity
    if (brightness < lightThreshold) {
      data[i] = 0; // Darken pixels below the threshold
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else {
      data[i] = 255; // Brighten pixels above the threshold
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  // Now apply a blur to simulate the perception of blurry light
  const blurredData = blurImage2(
    data,
    imageCanvas.width,
    imageCanvas.height,
    10
  ); // Adjust the blur radius

  // Create new image data from the blurred pixels
  const newImageData = new ImageData(
    blurredData,
    imageCanvas.width,
    imageCanvas.height
  );
  ctx.putImageData(newImageData, 0, 0);

  updateLowVisInfoText(
    "A person with severely reduced vision may lose the ability to perceive fine details, colors, shapes, or movement, but still retain the ability to distinguish between light and dark. This condition is referred to as light perception (LP), which represents one of the lowest levels of functional vision. Even with extensive vision loss, individuals with LP can still detect the presence of light and identify its source or direction."
  );
}

// Simple box blur function to apply blur effect
function blurImage2(data, width, height, radius) {
  const blurredData = new Uint8ClampedArray(data.length);

  const kernelSize = radius * 2 + 1; // Size of the blur kernel
  const kernelArea = kernelSize * kernelSize; // Total number of pixels in the blur kernel

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0;

      // Loop through kernel
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1); // Clamp to canvas bounds
          const py = Math.min(Math.max(y + ky, 0), height - 1);

          const index = (py * width + px) * 4;
          sumR += data[index]; // Red
          sumG += data[index + 1]; // Green
          sumB += data[index + 2]; // Blue
        }
      }

      const i = (y * width + x) * 4;
      blurredData[i] = sumR / kernelArea; // Red
      blurredData[i + 1] = sumG / kernelArea; // Green
      blurredData[i + 2] = sumB / kernelArea; // Blue
      blurredData[i + 3] = data[i + 3]; // Alpha (unchanged)
    }
  }

  return blurredData;
}

function applySnellenAcuity(snellenRatio) {
  updateLowVisInfoText(
    "This tool allows you to simulate various levels of visual acuity, measured by the Snellen scale. The Snellen scale is commonly used to assess a person’s clarity of vision. For example, 20/20 vision is considered normal, meaning you can see at 20 feet what a person with normal vision would see at 20 feet. In contrast, someone with 20/40 vision can only see at 20 feet what a person with normal vision can see at 40 feet. As the denominator increases, vision becomes progressively worse, meaning objects appear blurrier, simulating the experience of nearsightedness or other vision impairments.<br><br>20/20: Normal vision, no blur.<br><br>20/40: Mild blur, representing early stages of visual impairment.<br><br>20/60: Moderate blur, noticeable difficulty in seeing fine details.<br><br>20/80: Significant blur, reduced ability to read or recognize details.<br><br>20/100: Severe vision loss; objects appear heavily blurred, similar to legal blindness."
  );
  resetImage();
  const acuityMap = {
    "20/20": 0, // Perfect vision, no blur
    "20/40": 5, // Mild blur for 20/40 vision
    "20/60": 10, // Moderate blur for 20/60 vision
    "20/80": 15, // Noticeable blur for 20/80 vision
    "20/100": 20, // Significant blur for 20/100 vision
    "20/200": 30, // Severe blur for 20/200 vision (legally blind)
  };

  const blurRadius = acuityMap[snellenRatio] || 0; // Default to no blur if unknown acuity

  const ctx = imageCanvas.getContext("2d", { willReadFrequently: true });

  // Now when you do this, it will be optimized for frequent reads
  const imageData = ctx.getImageData(
    0,
    0,
    imageCanvas.width,
    imageCanvas.height
  );
  const data = imageData.data;

  // Apply the blur using the specified radius
  const blurredData = blurImage(
    data,
    imageCanvas.width,
    imageCanvas.height,
    blurRadius
  );

  // Create new image data with the blurred pixels
  const newImageData = new ImageData(
    blurredData,
    imageCanvas.width,
    imageCanvas.height
  );
  ctx.putImageData(newImageData, 0, 0);
}

// Simple blur function (similar to the one we used before)
function blurImage(data, width, height, radius) {
  const blurredData = new Uint8ClampedArray(data.length);
  const kernelSize = radius * 2 + 1;
  const kernelArea = kernelSize * kernelSize;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(Math.max(x + kx, 0), width - 1); // Stay within bounds
          const py = Math.min(Math.max(y + ky, 0), height - 1);

          const index = (py * width + px) * 4;
          sumR += data[index]; // Red
          sumG += data[index + 1]; // Green
          sumB += data[index + 2]; // Blue
        }
      }

      const i = (y * width + x) * 4;
      blurredData[i] = sumR / kernelArea; // Red
      blurredData[i + 1] = sumG / kernelArea; // Green
      blurredData[i + 2] = sumB / kernelArea; // Blue
      blurredData[i + 3] = data[i + 3]; // Alpha
    }
  }

  return blurredData;
}

// Reset to the original image
function resetImage() {
  if (originalImageData) {
    // Redraw the original image data to the canvas, effectively removing filters
    ctx.putImageData(originalImageData, 0, 0);
  } else {
    console.warn("No original image data to reset.");
  }
}

function updateColorInfoText(text) {
  document.getElementById("info-text").innerText = text;
}

function updateLowVisInfoText(text) {
  document.getElementById("low-vis-info-text").innerHTML = text;
}
