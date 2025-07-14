import { audioCtx } from "../utils/audioCtx.js";

export function createUiModEnv(id) {
  return {
    id,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
    amount: 1.0,
    value: 0,
    targets: [],
    _isActive: false,
    _isReleasing: false,
    _startTime: 0,
    _releaseTime: 0,
    _sustainLevel: 0,
    trigger() {
      this._isActive = true;
      this._isReleasing = false;
      this._startTime = audioCtx.currentTime;
    },
    releaseEnv() {
      if (this._isActive && !this._isReleasing) {
        // Get current envelope value BEFORE setting to release
        const valAtRelease = this.getValue(audioCtx.currentTime);
        this._isReleasing = true;
        this._releaseTime = audioCtx.currentTime;
        this._sustainLevel = valAtRelease;
      }
    },
    getValue(now = audioCtx.currentTime) {
      if (!this._isActive && !this._isReleasing) return 0;

      const t = now - this._startTime;
      if (!this._isReleasing) {
        if (t < this.attack) {
          // Attack phase
          return (t / this.attack) * this.amount;
        } else if (t < this.attack + this.decay) {
          // Decay phase
          const d = t - this.attack;
          return (
            (1 - d / this.decay) * (this.amount - this.sustain) + this.sustain
          );
        } else {
          // Sustain phase
          return this.sustain;
        }
      } else {
        // Release phase
        const tRelease = now - this._releaseTime;
        if (tRelease < this.release) {
          if (this._isReleasing)
            // console.log(
            //   "Release value:",
            //   now,
            //   this._sustainLevel * (1 - tRelease / this.release)
            // );

            // Linear release from sustain/current to zero
            return this._sustainLevel * (1 - tRelease / this.release);
        } else {
          this._isActive = false;
          this._isReleasing = false;
          return 0;
        }
      }
    },
  };
}

// Optional: Animate all envelopes
export function animateModEnvs(synth) {
  requestAnimationFrame(() => animateModEnvs(synth));
  const now = audioCtx.currentTime;
  for (const env of synth.uiModEnvs) {
    const envVal = env.getValue(now);
    for (const target of env.targets) {
      if (env._isActive || env._isReleasing) {
        const modulatedVal =
          target.originalVal + envVal * target.range * target.depth;
        const clamped = Math.min(
          parseFloat(target.slider.max),
          Math.max(parseFloat(target.slider.min), modulatedVal)
        );
        target.slider.value = clamped;
        target.slider.dispatchEvent(new Event("input"));
      } else {
        target.slider.value = target.originalVal;
        target.slider.dispatchEvent(new Event("input"));
      }
    }
  }
}
