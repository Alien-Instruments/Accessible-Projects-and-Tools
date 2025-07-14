export class VectorPad {
  constructor(container, onChange) {
    this.x = 0.5;
    this.y = 0.5;
    this.speed = 1.0;
    this.mode = "static";
    this.onChange = onChange;
    this._animationFrame = null;

    // For slider sync
    this.xSlider = document.getElementById("vector-x");
    this.ySlider = document.getElementById("vector-y");

    // Animation state
    this._lfoPhase = 0;
    this._bounceX = 0.2;
    this._bounceY = 0.2;
    this._bounceVX = 0.008;
    this._bounceVY = 0.006;
    this._randT = 0;
    this._randSrc = { x: 0.5, y: 0.5 };
    this._randDst = { x: 0.5, y: 0.5 };

    // Pad element
    const pad = document.createElement("div");
    pad.tabIndex = 0;
    pad.style.width = "200px";
    pad.style.height = "200px";
    pad.style.background = "#404040";
    pad.style.position = "relative";
    pad.style.border = "2px solid #888";
    pad.style.borderRadius = "8px";
    pad.style.margin = "8px";
    pad.setAttribute("role", "slider");
    pad.setAttribute("aria-label", "Vector pad");
    pad.style.outline = "none";
    pad.classList.add("vector-pad");

    const corners = [
      { text: "Osc 1", top: "2px", left: "4px", align: "left" },
      { text: "Osc 2", top: "2px", right: "4px", align: "right" },
      { text: "Osc 3", bottom: "2px", left: "4px", align: "left" },
      { text: "Osc 4", bottom: "2px", right: "4px", align: "right" },
    ];

    corners.forEach((corner) => {
      const label = document.createElement("div");
      label.textContent = corner.text;
      label.style.position = "absolute";
      label.style.fontSize = "15px";
      label.style.color = "#888";
      label.style.pointerEvents = "none";
      label.style.userSelect = "none";
      label.style.padding = "0 3px";
      label.style.background = "#ffffff";
      label.style.color = "#000000";
      label.style.zIndex = "10";
      label.style.borderRadius = "3px";
      label.style.zIndex = "1";
      if (corner.top) label.style.top = corner.top;
      if (corner.left) label.style.left = corner.left;
      if (corner.right) label.style.right = corner.right;
      if (corner.bottom) label.style.bottom = corner.bottom;
      if (corner.align === "right") label.style.textAlign = "right";
      pad.appendChild(label);
    });

    // Thumb
    const thumb = document.createElement("div");
    thumb.style.width = "20px";
    thumb.style.height = "20px";
    thumb.style.position = "absolute";
    thumb.style.background = "#000000";
    thumb.style.outline = "2px solid rgb(18, 217, 111)";
    thumb.style.borderRadius = "50%";
    thumb.style.zIndex = "1";
    thumb.style.cursor = "pointer";

    pad.appendChild(thumb);

    // Update thumb position
    this._updateThumb = () => {
      const px = this.x * 180;
      const py = this.y * 180;
      thumb.style.left = px + "px";
      thumb.style.top = py + "px";
      pad.setAttribute(
        "aria-valuetext",
        `X ${Number(this.x).toFixed(2)}, Y ${Number(this.y).toFixed(2)}`
      );
    };

    // Animation
    this._animate = () => {
      if (this.mode === "lfo") {
        this._lfoPhase += 0.03 * this.speed;
        const x = 0.5 + 0.4 * Math.cos(this._lfoPhase);
        const y = 0.5 + 0.4 * Math.sin(this._lfoPhase * 1.2);
        this.set(x, y, false);
      } else if (this.mode === "bounce") {
        this._bounceX += this._bounceVX * this.speed;
        this._bounceY += this._bounceVY * this.speed;
        if (this._bounceX > 1 || this._bounceX < 0) this._bounceVX *= -1;
        if (this._bounceY > 1 || this._bounceY < 0) this._bounceVY *= -1;
        this.set(
          Math.max(0, Math.min(1, this._bounceX)),
          Math.max(0, Math.min(1, this._bounceY)),
          false
        );
      } else if (this.mode === "random") {
        this._randT += 0.008 * this.speed;
        if (this._randT >= 1) {
          this._randT = 0;
          this._randSrc = { x: this.x, y: this.y };
          this._randDst = { x: Math.random(), y: Math.random() };
        }
        const x =
          this._randSrc.x + (this._randDst.x - this._randSrc.x) * this._randT;
        const y =
          this._randSrc.y + (this._randDst.y - this._randSrc.y) * this._randT;
        this.set(x, y, false);
      } else if (this.mode === "spiral") {
        this._spiralPhase += 0.03 * this.speed;
        this._spiralRadius += 0.001 * this.speed;
        if (this._spiralRadius > 0.5) this._spiralRadius = 0;
        const x = 0.5 + this._spiralRadius * Math.cos(this._spiralPhase);
        const y = 0.5 + this._spiralRadius * Math.sin(this._spiralPhase);
        this.set(x, y, false);
      } else if (this.mode === "lissajous") {
        this._lissaPhase += 0.03 * this.speed;
        const x = 0.5 + 0.4 * Math.sin(this._lissaPhase);
        const y = 0.5 + 0.4 * Math.sin(this._lissaPhase * 3 + Math.PI / 2);
        this.set(x, y, false);
      } else if (this.mode === "drunk") {
        this._drunkX = Math.max(
          0,
          Math.min(1, this._drunkX + (Math.random() - 0.5) * 0.1 * this.speed)
        );
        this._drunkY = Math.max(
          0,
          Math.min(1, this._drunkY + (Math.random() - 0.5) * 0.1 * this.speed)
        );
        this.set(this._drunkX, this._drunkY, false);
      } else if (this.mode === "grid") {
        if (this._stepT === undefined || this._stepT >= 1) {
          this._stepT = 0;
          const values = [0, 1];
          this._stepX = values[Math.floor(Math.random() * 2)];
          this._stepY = values[Math.floor(Math.random() * 2)];
        }
        this._stepT += 0.08 * this.speed;
        this.set(this._stepX, this._stepY, false);
      } else if (this.mode === "chaos") {
        const a = 10,
          b = 28,
          c = 8 / 3;
        const dt = 0.008 * this.speed;

        const dx = a * (this._chaosY - this._chaosX) * dt;
        const dy = (this._chaosX * (b - this._chaosZ) - this._chaosY) * dt;
        const dz = (this._chaosX * this._chaosY - c * this._chaosZ) * dt;

        this._chaosX += dx;
        this._chaosY += dy;
        this._chaosZ += dz;

        // Map Lorenz XY to pad space [0,1]
        const x = 0.5 + 0.04 * this._chaosX;
        const y = 0.5 + 0.04 * this._chaosY;
        this.set(
          Math.max(0, Math.min(1, x)),
          Math.max(0, Math.min(1, y)),
          false
        );
      } else if (this.mode === "orbit") {
        const userX =
          this._orbitCenterX !== undefined ? this._orbitCenterX : 0.5;
        const userY =
          this._orbitCenterY !== undefined ? this._orbitCenterY : 0.5;
        this._orbitPhase += 0.04 * this.speed;
        const radius = 0.5;
        const x = userX + radius * Math.cos(this._orbitPhase);
        const y = userY + radius * Math.sin(this._orbitPhase);
        this.set(
          Math.max(0, Math.min(1, x)),
          Math.max(0, Math.min(1, y)),
          false
        );
      } else if (this.mode === "samplehold") {
        if (this._shT === undefined || this._shT >= 1) {
          this._shT = 0;
          this._shX = Math.random();
          this._shY = Math.random();
        }
        this._shT += 0.04 * this.speed;
        this.set(this._shX, this._shY, false);
      } else if (this.mode === "zigzag") {
        this._zigzagPhase += 0.04 * this.speed;
        // Moves back and forth diagonally, bounces off edges
        this._zigzagX += this._zigzagVX * this.speed;
        this._zigzagY += this._zigzagVY * this.speed;
        if (this._zigzagX > 1 || this._zigzagX < 0) this._zigzagVX *= -1;
        if (this._zigzagY > 1 || this._zigzagY < 0) this._zigzagVY *= -1;
        this.set(
          Math.max(0, Math.min(1, this._zigzagX)),
          Math.max(0, Math.min(1, this._zigzagY)),
          false
        );
      }

      if (this.mode !== "static") {
        this._animationFrame = requestAnimationFrame(this._animate);
      } else {
        this._animationFrame = null;
      }
    };

    this._startAnimationLoop = () => {
      if (!this._animationFrame && this.mode !== "static") {
        // For each mode, initialize any needed state variables
        if (this.mode === "bounce") {
          this._bounceX = this.x;
          this._bounceY = this.y;
          this._bounceVX =
            (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.01);
          this._bounceVY =
            (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.01);
        }
        if (this.mode === "random") {
          this._randT = 0;
          this._randSrc = { x: this.x, y: this.y };
          this._randDst = { x: Math.random(), y: Math.random() };
        }
        if (this.mode === "spiral") {
          this._spiralPhase = 0;
          this._spiralRadius = 0;
        }
        if (this.mode === "lissajous") {
          this._lissaPhase = 0;
        }
        if (this.mode === "drunk") {
          this._drunkX = this.x;
          this._drunkY = this.y;
        }
        if (this.mode === "grid") {
          this._stepT = 1;
        }
        if (this.mode === "chaos") {
          this._chaosX = Math.random() * 2 - 1;
          this._chaosY = Math.random() * 2 - 1;
          this._chaosZ = Math.random() * 2 - 1;
        }

        if (this.mode === "orbit") {
          this._orbitPhase = 0;
        }
        if (this.mode === "samplehold") {
          this._shT = 1;
        }
        if (this.mode === "zigzag") {
          this._zigzagX = this.x;
          this._zigzagY = this.y;
          this._zigzagVX =
            (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.01);
          this._zigzagVY =
            (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.01);
          this._zigzagPhase = 0;
        }
        this._animate();
      }
    };

    this._stopAnimationLoop = () => {
      if (this._animationFrame) {
        cancelAnimationFrame(this._animationFrame);
        this._animationFrame = null;
      }
    };

    // Pointer interaction
    pad.addEventListener("pointerdown", (e) => {
      pad.setPointerCapture(e.pointerId);
      movePointer(e);
      pad.addEventListener("pointermove", movePointer);
      pad.addEventListener("pointerup", up);
      function up() {
        pad.releasePointerCapture(e.pointerId);
        pad.removeEventListener("pointermove", movePointer);
        pad.removeEventListener("pointerup", up);
      }
    });
    const movePointer = (e) => {
      const rect = pad.getBoundingClientRect();
      let x = (e.clientX - rect.left) / rect.width;
      let y = (e.clientY - rect.top) / rect.height;
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));
      this.set(x, y, true);
    };

    // Keyboard accessibility
    pad.addEventListener("keydown", (e) => {
      let dx = 0,
        dy = 0;
      if (e.key === "ArrowLeft") dx = -0.01;
      if (e.key === "ArrowRight") dx = 0.01;
      if (e.key === "ArrowUp") dy = -0.01;
      if (e.key === "ArrowDown") dy = 0.01;
      if (dx !== 0 || dy !== 0) {
        this.set(
          Math.max(0, Math.min(1, this.x + dx)),
          Math.max(0, Math.min(1, this.y + dy)),
          true
        );
        e.preventDefault();
      }
    });

    // Initial
    this.set(0.5, 0.5);

    container.appendChild(pad);
    this.pad = pad;
    this.thumb = thumb;
  }

  set(x, y, user = false) {
    this.x = x;
    this.y = y;
    this._updateThumb();
    if (this.xSlider) this.xSlider.value = String(x);
    if (this.ySlider) this.ySlider.value = String(y);
    if (this.xSlider) {
      this.xSlider.value = String(x);
      const knob = this.xSlider.parentElement.querySelector(".range-knob");
      if (knob) updateKnobVisual(this.xSlider, knob);
    }
    if (this.ySlider) {
      this.ySlider.value = String(y);
      const knob = this.ySlider.parentElement.querySelector(".range-knob");
      if (knob) updateKnobVisual(this.ySlider, knob);
    }
    if (this.onChange) this.onChange(x, y);
  }

  setSliders(xSlider, ySlider) {
    this.xSlider = xSlider;
    this.ySlider = ySlider;
    if (xSlider) xSlider.value = this.x;
    if (ySlider) ySlider.value = this.y;
  }
  setSpeed(val) {
    this.speed = Number(val);
  }
  setMode(val) {
    if (this.mode !== val) {
      this.mode = val;
      this._stopAnimationLoop();
      if (this.mode !== "static") this._startAnimationLoop();
    }
  }
}

function updateKnobVisual(input, knob) {
  const min = Number(input.min),
    max = Number(input.max),
    val = Number(input.value);
  const deg = ((val - min) / (max - min)) * 270 - 135;
  knob.style.transform = `rotate(${deg}deg)`;
}
