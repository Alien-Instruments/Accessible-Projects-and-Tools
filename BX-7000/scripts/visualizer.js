import { ALGORITHMS } from "./constants.js";

/**
 * Draws the FM algorithm SVG diagram with user or default colors.
 * @param {number} algoId - The algorithm number.
 * @param {SVGElement} svg - The SVG element to draw into.
 * @param {object} colorConfig - (Optional) Object with color overrides.
 * @param {object} opts - (Optional) { disableGlow: boolean }
 */
export function drawAlgorithm(algoId, svg, colorConfig = null, opts = {}) {
  svg.innerHTML = "";

  // ---- Detect if we are in index2.html (disable glow) ----
  const disableGlow =
    opts.disableGlow ||
    window.location.pathname.endsWith("index2.html") ||
    document.body.classList.contains("index2");

  // ---- Default colors ----
  const DEFAULT_COLORS = {
    nodeFill: "#18100d",
    nodeStroke: "#ff0000",
    nodeLabel: "#ff0000",
    outLabel: "#ff0000",
    connStroke: "#ff0000",
    feedbackStroke: "#ff0000",
    glow: "#ff0000",
    arrow: "#ff0000",
  };
  // ---- Merge with any user-provided config ----
  const colors = { ...DEFAULT_COLORS, ...(colorConfig || {}) };

  const algo = ALGORITHMS[algoId];
  if (!algo) return;

  // Optional: Display current algorithm description
  const display = document.getElementById("algorithm-display");
  if (display) display.textContent = `Algorithm ${algoId}`;

  function describeAlgorithm(algoId, algo) {
    const lines = [];
    lines.push(`Algorithm ${algoId}.`);
    const outputList = algo.outputs?.join(", ") || "none";
    lines.push(`Outputs from operator(s): ${outputList}.`);
    if (algo.paths?.length) {
      const pathDescriptions = algo.paths.map(
        (p) => `Operator ${p.from} modulates ${p.to}.`
      );
      lines.push(...pathDescriptions);
    }
    if (algo.feedback?.length) {
      const fbDescriptions = algo.feedback.map(
        (fb) => `Feedback from operator ${fb.from} to ${fb.to}.`
      );
      lines.push(...fbDescriptions);
    }
    return lines.join(" ");
  }

  const descriptionDiv = document.getElementById("algorithm-description");
  if (descriptionDiv) {
    descriptionDiv.textContent = describeAlgorithm(algoId, algo);
  }

  // ---- Calculate node layout ----
  const depths = {};
  const visited = new Set();

  function computeDepth(op) {
    if (depths[op] !== undefined) return depths[op];
    if (visited.has(op)) return 0;
    visited.add(op);
    const modPaths = algo.paths.filter((p) => p.to === op);
    depths[op] = modPaths.length
      ? 1 + Math.max(...modPaths.map((p) => computeDepth(p.from)))
      : 0;
    return depths[op];
  }
  for (let i = 1; i <= 6; i++) computeDepth(i);

  // ---- Layout constants ----
  const spacingX = 60;
  const spacingY = 65;
  const nodeSize = 14;
  const padding = 30;

  const operatorPositions = {};
  const visibleOps = [];

  for (let i = 1; i <= 6; i++) {
    if (
      !algo.outputs.includes(i) &&
      !algo.paths.some((p) => p.from === i || p.to === i)
    )
      continue;
    visibleOps.push(i);
  }

  // Group operators by depth
  const depthMap = {};
  visibleOps.forEach((opId) => {
    const depth = computeDepth(opId);
    if (!depthMap[depth]) depthMap[depth] = [];
    depthMap[depth].push(opId);
  });

  const depthLevels = Object.keys(depthMap).map(Number);
  const maxDepth = Math.max(...depthLevels);
  const maxPerDepth = Math.max(
    ...Object.values(depthMap).map((arr) => arr.length)
  );
  const canvasWidth = padding * 2 + maxDepth * spacingX;
  const canvasHeight = padding * 2 + maxPerDepth * spacingY;

  svg.setAttribute("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // ---- Draw nodes ----
  for (const [depth, ops] of Object.entries(depthMap)) {
    const d = parseInt(depth);
    ops.forEach((opId, idx) => {
      const x = padding + d * spacingX;
      const totalHeight = (ops.length - 1) * spacingY;
      const y = canvasHeight / 2 - totalHeight / 2 + idx * spacingY;
      operatorPositions[opId] = { x, y };

      // Rectangle for operator
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x - nodeSize / 2);
      rect.setAttribute("y", y - nodeSize / 2);
      rect.setAttribute("width", nodeSize);
      rect.setAttribute("height", nodeSize);
      rect.setAttribute("fill", colors.nodeFill);
      rect.setAttribute("stroke", colors.nodeStroke);
      rect.setAttribute("stroke-width", "1.5");
      if (!disableGlow) rect.setAttribute("filter", "url(#glow)");
      svg.appendChild(rect);

      // Node number label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("x", x);
      label.setAttribute("y", y - nodeSize);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "18");
      label.setAttribute("font-family", "LCD");
      label.setAttribute("fill", colors.nodeLabel);
      if (!disableGlow) label.setAttribute("filter", "url(#glow)");
      label.textContent = opId;
      svg.appendChild(label);
    });
  }

  // ---- Draw connections ----
  for (const { from, to } of algo.paths) {
    const fromPos = operatorPositions[from];
    const toPos = operatorPositions[to];
    if (!fromPos || !toPos) continue; // safety

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", fromPos.x);
    line.setAttribute("y1", fromPos.y);
    line.setAttribute("x2", toPos.x);
    line.setAttribute("y2", toPos.y);
    line.setAttribute("stroke", colors.connStroke);
    line.setAttribute("stroke-width", "2.2");
    line.setAttribute("marker-end", "url(#arrow)");
    svg.appendChild(line);
  }

  // ---- Output labels ----
  for (const opId of algo.outputs || []) {
    const pos = operatorPositions[opId];
    if (!pos) continue;
    const outLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    outLabel.setAttribute("x", pos.x);
    outLabel.setAttribute("y", pos.y + nodeSize + 18);
    outLabel.setAttribute("text-anchor", "middle");
    outLabel.setAttribute("font-size", "18");
    outLabel.setAttribute("fill", colors.outLabel);
    outLabel.setAttribute("font-family", "LCD");
    if (!disableGlow) outLabel.setAttribute("filter", "url(#glow)");
    outLabel.textContent = "OUT";
    svg.appendChild(outLabel);
  }

  // ---- Draw feedback connections ----
  for (const { from, to } of algo.feedback || []) {
    const fromPos = operatorPositions[from];
    const toPos = operatorPositions[to];
    if (!fromPos || !toPos) continue; // safety

    const fbPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    // Feedback curve
    const cx1 = fromPos.x;
    const cy1 = fromPos.y - 30;
    const cx2 = toPos.x;
    const cy2 = toPos.y - 30;

    const d = `M ${fromPos.x} ${fromPos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toPos.x} ${toPos.y}`;
    fbPath.setAttribute("d", d);
    fbPath.setAttribute("stroke", colors.feedbackStroke);
    fbPath.setAttribute("stroke-width", "2.8");
    fbPath.setAttribute("fill", "none");
    fbPath.setAttribute("stroke-dasharray", "4,2");
    fbPath.setAttribute("marker-end", "url(#arrow)");
    svg.appendChild(fbPath);
  }

  // ---- SVG filters and arrow marker (with dynamic color) ----
  if (!disableGlow) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <marker id="arrow" markerWidth="7" markerHeight="5" refX="5" refY="2.5"
        orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 7 2.5, 0 5" fill="${colors.arrow}"/>
      </marker>`;
    svg.appendChild(defs);
  } else {
    // Always append arrow marker even if glow is off!
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="arrow" markerWidth="7" markerHeight="5" refX="5" refY="2.5"
        orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 7 2.5, 0 5" fill="${colors.arrow}"/>
      </marker>`;
    svg.appendChild(defs);
  }
}

// ------- Color picker support, robust for any page -------
const bgPicker = document.getElementById("color-picker-2");
const linePicker = document.getElementById("color-picker");

function getAlgoColors() {
  // Fallback if elements are missing or values are empty
  const nodeFill = bgPicker?.value || "#18100d";
  const lineCol = linePicker?.value || "#ff7700";
  return {
    nodeFill,
    nodeStroke: lineCol,
    nodeLabel: lineCol,
    outLabel: lineCol,
    connStroke: lineCol,
    feedbackStroke: lineCol,
    glow: lineCol,
    arrow: lineCol,
  };
}

const algoSelect = document.getElementById("algorithm-select");
const algoSVG = document.getElementById("algorithm-visual");
if (algoSelect && algoSVG) {
  drawAlgorithm(parseInt(algoSelect.value), algoSVG, getAlgoColors());
}

// Redraw with color pickers or on algo change, only if the elements exist:
if (algoSelect && algoSVG && bgPicker && linePicker) {
  function redrawAlgo() {
    drawAlgorithm(parseInt(algoSelect.value), algoSVG, getAlgoColors());
  }
  algoSelect.addEventListener("change", redrawAlgo);
  bgPicker.addEventListener("input", redrawAlgo);
  linePicker.addEventListener("input", redrawAlgo);
}
