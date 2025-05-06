let modifierKey = "altKey";
let keyMappings = {
  "key-m": "menu",
  "key-n": "vics",
  "key-b": "EQ",
  "key-v": "poly-synth-effects",
  "key-c": "poly-synth",
};

// Function to remove focus class from all sections
function clearFocus() {
  document.querySelectorAll(".focus").forEach((element) => {
    element.classList.remove("focus");
  });
}

// Function to add focus class to a specific section
function focusSection(sectionId) {
  clearFocus();
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("focus");
    section.scrollIntoView({ behavior: "smooth" });
    section.focus();
    console.log(`Focused section: ${sectionId}`);
  } else {
    console.log(`Section not found: ${sectionId}`);
  }
}

// Event listener for keydown
document.addEventListener("keydown", (event) => {
  if (event[modifierKey]) {
    const pressedKey = event.code.toLowerCase();
    for (let [key, section] of Object.entries(keyMappings)) {
      if (pressedKey === `key${key.charAt(key.length - 1)}`) {
        event.preventDefault(); // Prevent default action
        focusSection(section);
        break;
      }
    }
  }
});

// Event listener for form submission to update key mappings
document
  .getElementById("key-config-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    modifierKey = document.getElementById("modifier-key").value;
    keyMappings = {
      [`key-${document.getElementById("key-m").value.toLowerCase()}`]: "menu",
      [`key-${document.getElementById("key-n").value.toLowerCase()}`]: "vics",
      [`key-${document.getElementById("key-b").value.toLowerCase()}`]: "EQ",
      [`key-${document.getElementById("key-v").value.toLowerCase()}`]:
        "poly-synth-effects",
      [`key-${document.getElementById("key-c").value.toLowerCase()}`]:
        "poly-synth",
    };
    console.log("Configuration updated:", modifierKey, keyMappings);
  });
