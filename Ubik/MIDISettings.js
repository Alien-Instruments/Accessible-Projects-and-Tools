/*
MIT License

Copyright (c) [2024] [Samuel J Prouse]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

/*
 █████╗ ██╗     ██╗███████╗███╗   ██╗
██╔══██╗██║     ██║██╔════╝████╗  ██║
███████║██║     ██║█████╗  ██╔██╗ ██║
██╔══██║██║     ██║██╔══╝  ██║╚██╗██║
██║  ██║███████╗██║███████╗██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝
 ╦╔╗╔╔═╗╔╦╗╦═╗╦ ╦╔╦╗╔═╗╔╗╔╔╦╗╔═╗
 ║║║║╚═╗ ║ ╠╦╝║ ║║║║║╣ ║║║ ║ ╚═╗
 ╩╝╚╝╚═╝ ╩ ╩╚═╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
*/

function saveSettings() {
  const midiInputChannel = document.getElementById("midi-input-channel").value;
  const speakMidiToggle = document.getElementById("speak-midi-toggle").checked;
  const midiOutputChannel = document.getElementById("midi-channel").value;
  const midiNotePassthrough = document.getElementById(
    "midi-note-passthrough"
  ).checked;

  const settings = {
    midiInputChannel,
    speakMidiToggle,
    midiOutputChannel,
    midiNotePassthrough,
  };

  localStorage.setItem("midiSettings", JSON.stringify(settings));
}

// Function to load settings from local storage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem("midiSettings"));

  if (settings) {
    document.getElementById("midi-input-channel").value =
      settings.midiInputChannel;
    document.getElementById("speak-midi-toggle").checked =
      settings.speakMidiToggle;
    document.getElementById("midi-channel").value = settings.midiOutputChannel;
    document.getElementById("midi-note-passthrough").checked =
      settings.midiNotePassthrough;

    // Dispatch change event to update speak-midi-toggle state
    document
      .getElementById("speak-midi-toggle")
      .dispatchEvent(new Event("change"));
  }
}

// Save settings when any input changes
document
  .getElementById("midi-input-channel")
  .addEventListener("change", saveSettings);
document
  .getElementById("speak-midi-toggle")
  .addEventListener("change", saveSettings);
document
  .getElementById("midi-channel")
  .addEventListener("change", saveSettings);
document
  .getElementById("midi-note-passthrough")
  .addEventListener("change", saveSettings);

// Populate MIDI devices on page load
window.addEventListener("load", loadSettings);
