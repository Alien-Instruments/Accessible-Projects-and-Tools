import { defaultShortcuts } from "./defaultShortcuts.js";

const STORAGE_KEY = "VexedUserShortcuts";

// Get the latest mapping object (user-defined only)
function getUserShortcutMap() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

// Returns the merged mapping (user + default fallback)
export function getAllShortcuts() {
  return { ...defaultShortcuts, ...getUserShortcutMap() };
}

// Get shortcut for an action
export function getShortcut(action) {
  return getUserShortcutMap()[action] || defaultShortcuts[action];
}

// Set a shortcut for an action, ensuring NO duplicates
export function setShortcut(action, newKey) {
  const userMap = getUserShortcutMap();

  // Check for duplicates in ALL current assignments (user + defaults, ignoring this action)
  const allShortcuts = { ...defaultShortcuts, ...userMap };
  for (const [act, key] of Object.entries(allShortcuts)) {
    if (act !== action && key.toLowerCase() === newKey.toLowerCase()) {
      showShortcutWarning(
        `Key "${newKey}" is already assigned to "${act}". Please choose another key.`
      );
      return false;
    }
  }

  // Assign new shortcut
  userMap[action] = newKey;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userMap));
  clearShortcutWarning();
  return true;
}

function showShortcutWarning(msg) {
  const warn = document.getElementById("shortcut-warning");
  if (warn) warn.textContent = msg;
}
function clearShortcutWarning() {
  const warn = document.getElementById("shortcut-warning");
  if (warn) warn.textContent = "";
}

export function removeShortcut(action) {
  const userMap = getUserShortcutMap();
  delete userMap[action];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userMap));
}

export function resetShortcuts() {
  localStorage.removeItem(STORAGE_KEY);
}
