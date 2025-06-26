export const oscWaves = [
  { label: "Sawtooth", value: "sawtooth" },
  { label: "Sine", value: "sine" },
  { label: "Triangle", value: "triangle" },
  { label: "Square", value: "square" },
];

export function createOscWaveUI(container, oscLabel, onChange) {
  const group = document.createElement("div");
  group.className = "mod-group";

  // Create a unique ID for the select
  const selectId = `oscwave-${oscLabel.toLowerCase().replace(/\s+/g, "-")}`;

  const label = document.createElement("label");
  label.innerText = oscLabel;
  label.setAttribute("for", selectId);
  group.appendChild(label);

  const select = document.createElement("select");
  select.id = selectId;
  oscWaves.forEach(({ label, value }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.innerText = label;
    select.appendChild(opt);
  });
  group.appendChild(select);

  select.addEventListener("change", (e) => {
    if (onChange) onChange(e.target.value);
  });

  container.appendChild(group);
}
