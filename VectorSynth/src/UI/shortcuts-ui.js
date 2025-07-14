import { createActions } from "../shortcuts/actions.js";
import {
  getShortcut,
  setShortcut,
  getAllShortcuts,
} from "../shortcuts/shortcutManager.js";
import { defaultShortcuts } from "../shortcuts/defaultShortcuts.js";
import { setupKeyboardModSourceDrag } from "../UI/mod-ui.js";

let listEl;

export function setupShortcutsUI({ announce, announceModeRef }) {
  const openBtn = document.getElementById("open-shortcuts");
  const panel = document.getElementById("shortcuts-panel");
  const list = document.getElementById("shortcuts-list");
  const closeBtn = document.getElementById("close-shortcuts");
  listEl = list;

  const actions = createActions({
    announceModeRef,
    announce,
    recognition: window.recognition,
  });

  function renderShortcutsPanel() {
    list.innerHTML = "";
    Object.keys(defaultShortcuts).forEach((action) => {
      const current = getShortcut(action);
      const row = document.createElement("div");
      row.innerHTML = `
        <span>${action}</span>
        <input value="${current}" data-action="${action}" readonly />
        <button class="lcd-button" data-action="${action}">Change</button>
      `;
      list.appendChild(row);
    });
  }

  openBtn.onclick = function () {
    panel.style.display = "block";
    panel.focus();
    renderShortcutsPanel();
  };

  closeBtn.onclick = function () {
    panel.style.display = "none";
  };

  list.onclick = function (e) {
    if (e.target.tagName === "BUTTON") {
      const action = e.target.getAttribute("data-action");
      const input = list.querySelector(`input[data-action="${action}"]`);
      input.value = "Press shortcut...";
      input.classList.add("shortcut-input-editing");

      function onKeyDown(ev) {
        const ignoreKeys = ["Shift", "Control", "Alt", "Meta"];
        if (ignoreKeys.includes(ev.key)) return;

        const comboStr = getNormalizedCombo(ev);

        if (setShortcut(action, comboStr)) {
          input.classList.remove("shortcut-input-editing");
          renderShortcutsPanel();
          setupKeyboardModSourceDrag("#synth-ui");
          setupKeyboardModSourceDrag("#fx-chain");
          window.removeEventListener("keydown", onKeyDown, true);
        } else {
          input.value = "Press shortcut...";
        }
        ev.preventDefault();
        ev.stopPropagation();
      }

      window.addEventListener("keydown", onKeyDown, true);
    }
  };

  // Global key listener
  window.addEventListener("keydown", (e) => {
    if (
      document.activeElement &&
      document.activeElement.classList.contains("shortcut-input-editing")
    )
      return;

    const ae = document.activeElement;
    if (
      ae &&
      ((ae.tagName === "INPUT" &&
        ["text", "search", "email", "password"].includes(ae.type)) ||
        ae.tagName === "TEXTAREA" ||
        ae.isContentEditable)
    )
      return;

    const comboStr = getNormalizedCombo(e);
    const shortcuts = getAllShortcuts();

    for (let action in shortcuts) {
      if (shortcuts[action] === comboStr) {
        e.preventDefault();
        e.stopPropagation();
        actions[action] && actions[action]();
        break;
      }
    }
  });
}

export function getNormalizedCombo(e) {
  const mods = [];
  if (e.ctrlKey) mods.push("Control");
  if (e.shiftKey) mods.push("Shift");
  if (e.altKey) mods.push("Alt");
  if (e.metaKey) mods.push("Meta");

  let key;
  if (/^Key[A-Z]$/.test(e.code)) {
    key = e.code;
  } else if (/^Digit[0-9]$/.test(e.code)) {
    key = e.code;
  } else {
    key =
      typeof e.key === "string"
        ? e.key.length === 1
          ? e.key.toLowerCase()
          : e.key
        : "Unknown";
  }

  return [...mods, key].join("+");
}
