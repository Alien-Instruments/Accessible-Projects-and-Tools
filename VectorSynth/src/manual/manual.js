const manualSections = [
  {
    title: "Introduction",
    content: `
    <h2>Welcome to Vexed</h2>
    <p>
      <strong>Vexed</strong> is a next-generation vector synthesizer designed for all creators, from total beginners to advanced users. Built with accessibility at its core, Vexed enables everyone to craft and perform rich electronic sounds—no matter their experience level or input device.
    </p>

    <h3>Key Features</h3>
    <ul>
      <li>Intuitive vector synthesis with smooth morphing via the X/Y Vector Pad</li>
      <li>Complete keyboard and screen reader accessibility for every parameter</li>
      <li>Voice control of all synth and effect parameters</li>
      <li>Full MIDI and MPE support with instant mapping and flexible audio routing</li>
      <li>Accessible, drag-and-drop modulation and effects chain</li>
      <li>Easy preset management and sharing</li>
      <li>Visual feedback with live output metering</li>
    </ul>

    <h3>Designed for Everyone</h3>
    <p>
      Whether you play with a mouse, keyboard, MIDI controller, or your voice, Vexed puts creative sound design at your fingertips. All controls are screen reader-friendly, and every feature is accessible by keyboard or assistive technology.
    </p>

    <h3>What is Vector Synthesis?</h3>
    <p>
      Vector synthesis lets you blend and morph between four oscillator “corners” using the Vector Pad. Move in real time, automate motion, or modulate the blend for evolving textures and expressive timbres.
    </p>

    <h3>Getting Started</h3>
    <p>
      New to synthesis? Start with the Quick Start guide to make your first sound. Looking for depth? Explore advanced modulation, MIDI/MPE mapping, and custom effects chains—Vexed grows with your skills.
    </p>
  `,
  },
  {
    title: "Quick Start",
    content: `
    <h2>Quick Start</h2>
    <p>
      Ready to make your first sound with <strong>Vexed</strong>? Follow these steps:
    </p>
    <ol>
      <li>
        <strong>Enable Audio</strong><br>
        Click anywhere on the page to enable audio if you haven't already.
      </li>
      <li>
        <strong>Play a Note</strong><br>
        <ul>
          <li>Use your computer keyboard: <kbd>Z</kbd> <kbd>X</kbd> to select octave, <kbd>A,S,D,F,G,H,J,K</kbd>... (white keys), <kbd>W,E,T,Y,U</kbd>... (black keys).</li>
          <li>Or use a MIDI controller—just connect and play!</li>
        </ul>
      </li>
      <li>
        <strong>Move the Vector Pad</strong><br>
        Drag the circle on the X/Y Vector Pad (bottom left) to morph between different sound corners in real time.
      </li>
      <li>
        <strong>Change a Sound Parameter</strong><br>
        Adjust sliders and dropdowns on the main panel to tweak your sound: try moving <strong>Filter Cutoff</strong>, <strong>Resonance</strong>, or <strong>Envelope Attack</strong>.<br>
        Every control is accessible by keyboard and works with screen readers.
      </li>
      <li>
        <strong>Try a Preset</strong><br>
        Open the <strong>Preset</strong> menu at the top, and select a sound. Presets instantly load and play.
      </li>
      <li>
        <strong>Experiment!</strong><br>
        Combine changes, move the vector pad while holding notes, and layer effects from the FX chain. There’s no way to break anything—explore!
      </li>
    </ol>

    <h3>Accessibility & Shortcuts</h3>
    <ul>
      <li>Tab and Shift+Tab to move between controls.</li>
      <li>Arrow keys to adjust sliders.</li>
      <li>Click the shortcut button to view/change keyboard shortcuts.</li>
      <li>Use the voice button to try controlling Vexed with speech ("Set filter cutoff to 800" or "Pick up LFO one").</li>
    </ul>

    <h3>Need Help?</h3>
    <p>
      Every control has a label and ARIA description. For extra assistance, enable screen reader announcements or use the "Announce" toggle.<br>
      Stuck or want to go deeper? Check the full manual sections!
    </p>
  `,
  },
  {
    title: "Arpeggiator",
    content: `
    <h2>Arpeggiator</h2>
    <p>
      The Arpeggiator cycles through held notes in rhythmic patterns. It's a powerful tool for generating melodic movement automatically. You can choose a playback mode, set timing, add swing, adjust gate length, and even create custom sequences.
    </p>

    <h3>Basic Controls</h3>
    <ul>
      <li><strong>On/Off:</strong> Toggle the arpeggiator engine.</li>
      <li><strong>BPM & Division:</strong> Sets speed and resolution (e.g. 1/4 for quarter notes, 1/16 for sixteenths).</li>
      <li><strong>Octave Range:</strong> Repeats notes across multiple octaves (up to 6).</li>
      <li><strong>Swing:</strong> Adds shuffle to every second step (0–0.5).</li>
      <li><strong>Gate Time:</strong> Sets how long each note plays (0.05 to 1.0).</li>
      <li><strong>Latch:</strong> Keeps notes playing after you release them.</li>
      <li><strong>Ratchets:</strong> Plays each step multiple times (burst effect). Enable <em>Random Ratchet</em> for variety.</li>
    </ul>

    <h3>Playback Modes</h3>
    <p>
      Choose from over 20 creative patterns:
    </p>
    <ul>
      <li><strong>Up / Down / UpDown:</strong> Play notes in ascending, descending, or bounce order.</li>
      <li><strong>Random / Random Walk:</strong> Select notes at random or take small random steps.</li>
      <li><strong>Converge / Diverge:</strong> Move inward or outward from the edges.</li>
      <li><strong>Pedal / Pairs:</strong> Repeat a root note or use two-note groupings.</li>
      <li><strong>Euclidean / Polyrhythm:</strong> Rhythmic pattern generation.</li>
      <li><strong>Mirror / Zigzag / Spiral / Pendulum:</strong> Symmetrical motion shapes.</li>
      <li><strong>Up2Down1 / Up3Down1:</strong> Two or three steps up, then one back.</li>
      <li><strong>Brownian / Cluster Random / Fibonacci / Golden:</strong> Generative and mathematical patterns.</li>
      <li><strong>Echo / Fractal / StepSkip:</strong> Repeats, skips, or recursive loops.</li>
      <li><strong>Custom:</strong> Design your own sequence in the Piano Roll.</li>
    </ul>

    <h3>Custom Pattern Editor</h3>
    <p>
      When using the <strong>Custom</strong> mode, the piano roll lets you assign which note plays at each of 16 steps.
    </p>
    <ul>
      <li>Click a cell or use <kbd>Space</kbd> to activate one note per step.</li>
      <li>Double-click or press <kbd>Space</kbd> to toggle.</li>
      <li>Use arrow keys to move between cells.</li>
      <li>Fully screen reader and keyboard accessible.</li>
      <li>Click <strong>Apply Pattern</strong> to update the sequence.</li>
    </ul>

    <h3>Tips</h3>
    <ul>
      <li>Combine swing and gate for expressive rhythms.</li>
      <li>Ratchets are great for energetic or glitchy textures.</li>
      <li>Experiment with patterns like <em>Euclidean</em> and <em>Brownian</em> for unexpected results.</li>
    </ul>
  `,
  },
  {
    title: "Oscillator Controls",
    content: `
    <p>
      The synth features <strong>four independent oscillators</strong> per voice. Each oscillator can be individually shaped, tuned, detuned, and blended using the vector pad or X/Y sliders.
    </p>

    <ul>
      <li>
        <strong>Waveform:</strong>
        Select Sawtooth, Square, Triangle, or Sine for each oscillator. The waveform shapes the basic character of the sound.
      </li>
      <li>
        <strong>Octave:</strong>
        Shifts the pitch of the oscillator up or down in steps of 12 semitones. Range: -2 to +2 octaves.
      </li>
      <li>
        <strong>Semitone:</strong>
        Fine-tune the oscillator’s pitch in semitone steps. Range: -12 to +12.
      </li>
      <li>
        <strong>Fine Tune:</strong>
        Micro-tune the oscillator in cent increments for precise pitch adjustment. Range: -50 to +50 cents.
      </li>
      <li>
        <strong>Pan:</strong>
        Set the pan direction of each oscillator to create wider sounds.
      </li>
      <li>
        <strong>Level:</strong>
        Sets the output volume of each oscillator. Range: 0.00 (off) to 1.00 (maximum).
      </li>
    </ul>

    <h3>Vector Mixing (X/Y Pad)</h3>
    <p>
      Use the vector pad (or X/Y sliders) to blend between oscillators:<br>
      <ul>
        <li><strong>Top Left:</strong> Only Oscillator 1 is heard.</li>
        <li><strong>Top Right:</strong> Only Oscillator 2 is heard.</li>
        <li><strong>Bottom Left:</strong> Only Oscillator 3 is heard.</li>
        <li><strong>Bottom Right:</strong> Only Oscillator 4 is heard.</li>
        <li><strong>Center:</strong> All oscillators are blended equally.</li>
      </ul>
      Move the pad to create evolving textures by blending oscillator timbres.
    </p>

    <h3>Tips</h3>
    <ul>
      <li>
        Setting all oscillator levels to 1.0 with the vector pad centered may cause audio clipping. Adjust levels for a balanced mix.
      </li>
      
      <li>
        Use different waveforms and tunings for each oscillator to create rich, layered sounds.
      </li>
    </ul>
  `,
  },
  {
    title: "Filter Section",
    content: `
    <p>
      The filter shapes the harmonic content of your sound, allowing for classic subtractive synthesis effects. Use the filter section to sculpt your tone, emphasize frequencies, and add movement with the envelope.
    </p>

    <ul>
      <li>
        <strong>Filter Type:</strong>
        Select the filter mode:
        <ul>
          <li><strong>Lowpass</strong>: Allows frequencies below the cutoff through, attenuates highs (classic analog synth sound).</li>
          <li><strong>Highpass</strong>: Allows frequencies above the cutoff through, attenuates lows.</li>
          <li><strong>Bandpass</strong>: Passes only frequencies around the cutoff, attenuates highs and lows.</li>
          <li><strong>Notch</strong>: Cuts frequencies near the cutoff (phasey/watery effect).</li>
          <li><strong>Allpass</strong>: Passes all frequencies, shifts phase (special FX).</li>
        </ul>
      </li>
      <li>
        <strong>Frequency (Cutoff):</strong>
        Sets the cutoff frequency. This controls where the filter starts to affect the signal. Lower values make the sound darker; higher values make it brighter.
      </li>
      <li>
        <strong>Resonance (Q):</strong>
        Emphasizes frequencies at the cutoff point. Higher resonance gives a “squelchy” or “sharp” character and can even self-oscillate at high values.
      </li>
      <li>
        <strong>Envelope Depth:</strong>
        Sets how much the filter envelope affects the cutoff frequency. Positive values push the cutoff up with the envelope, negative values invert the envelope’s effect. Set to 0 for no envelope modulation.
      </li>
    </ul>

    <h3>Filter Envelope</h3>
    <p>
      The filter envelope modulates the filter cutoff over time for each note, adding movement and articulation to your sound.
    </p>
    <ul>
      <li>
        <strong>Attack:</strong> How quickly the filter opens after a note is played (0 = instant, 1 = slow).
      </li>
      <li>
        <strong>Decay:</strong> How quickly the filter closes after the attack phase.
      </li>
      <li>
        <strong>Sustain:</strong> The steady state value the envelope holds after the decay, until note release.
      </li>
      <li>
        <strong>Release:</strong> How quickly the filter returns to its resting position after the note is released.
      </li>
    </ul>
    <p>
      For classic “pluck” sounds, use fast attack, moderate decay, low sustain, and short release. For evolving pads, use longer attack and release times.
    </p>
    <h3>Tips</h3>
    <ul>
      <li>
        Use high resonance with careful cutoff modulation for acid and squelch effects.
      </li>
      <li>
        Negative envelope depth creates downward filter sweeps.
      </li>
      <li>
        Try automating the filter cutoff and resonance for dynamic, expressive sound design.
      </li>
    </ul>
  `,
  },
  {
    title: "Envelope Generators",
    content: `
    <p>
      Envelopes shape the evolution of your sound over time, controlling how parameters change as you play and release notes. This synthesizer features several envelope generators:
    </p>
    <ul>
      <li>
        <strong>Amp Envelope</strong>: Controls the volume contour for each note. Classic <strong>ADSR</strong> controls (Attack, Decay, Sustain, Release) determine how quickly the note starts, fades, holds, and ends.
      </li>
      <li>
        <strong>Modulation Envelopes</strong>: Two additional envelopes (Mod Envelope 1 & 2) can be freely assigned to modulate other parameters such as pitch, filter, oscillator levels, or effects.
      </li>
    </ul>
    <h3>Amp Envelope Controls</h3>
    <ul>
      <li><strong>Attack</strong>: How quickly the sound rises when a note is played (0 = instant, 1 = slow).</li>
      <li><strong>Decay</strong>: How quickly the sound falls from peak level to the sustain level.</li>
      <li><strong>Sustain</strong>: The steady-state level held as long as a key is held.</li>
      <li><strong>Release</strong>: How quickly the sound fades out after the note is released.</li>
    </ul>
    <h3>Modulation Envelopes</h3>
    <ul>
      <li>Each mod envelope also has its own Attack, Decay, Sustain, and Release controls, letting you create unique modulation shapes for evolving, rhythmic, or percussive effects.</li>
      <li>To assign a modulation envelope, <strong>drag the Env1 or Env2 badge</strong> onto any compatible slider (such as pitch, filter cutoff, resonance, etc.). A colored ring appears around the destination control, indicating modulation is active.</li>
      <li>
        <strong>Mod Depth:</strong> Once assigned, you can adjust the depth of modulation using the ring around the slider. Higher values produce more dramatic modulation effects.
      </li>
    </ul>
    <h3>Tips</h3>
    <ul>
      <li>Use short attack and release for percussive sounds. Longer settings work well for pads or ambient textures.</li>
      <li>Try assigning a mod envelope to filter cutoff for classic “wah” or pluck effects, or to oscillator pitch for pitch sweeps.</li>
      <li>Multiple mod envelopes can be used simultaneously for complex, evolving modulation.</li>
    </ul>
  `,
  },
  {
    title: "LFOs (Low Frequency Oscillators)",
    content: `
    <p>
      <strong>LFOs</strong> are periodic modulation sources used to animate or modulate nearly any parameter on the synth. Each LFO can be set to a <strong>rate (speed)</strong> and <strong>waveform shape</strong>, letting you create effects such as vibrato, tremolo, auto-pan, rhythmic filter sweeps, and more.
    </p>
    <h3>LFO Controls</h3>
    <ul>
      <li>
        <strong>Rate:</strong> Sets how fast the LFO cycles (in Hz). Slow rates create gentle sweeps, faster rates create audio-rate FM or tremolo.
      </li>
      <li>
        <strong>Shape:</strong> Sets the waveform: Sine, Triangle, Square, or Sawtooth. Each shape creates a different motion or character.
      </li>
    </ul>
    <h3>Assigning LFO Modulation</h3>
    <ul>
      <li>
        <strong>To assign an LFO:</strong> Drag the LFO badge (e.g. "LFO 1") onto any compatible slider or knob.
      </li>
      <li>
        When an LFO is assigned, a <strong>colored modulation ring</strong> appears around the control.
      </li>
      <li>
        <strong>Adjust the modulation depth</strong> by dragging the ring.
      </li>
      <li>
        You can assign the same LFO to multiple parameters, and set the depth for each destination independently.
      </li>
    </ul>
    <h4>LFO Examples</h4>
    <ul>
      <li>
        Assign an LFO to filter cutoff for sweeping effects.
      </li>
      <li>
        Assign an LFO to oscillator pitch for vibrato.
      </li>
    </ul>
    <p>
      <em>LFO modulation is non-destructive: You can remove or reassign at any time. Each LFO remains active even if not currently assigned.</em>
    </p>
  `,
  },
  {
    title: "Effects Section (FX Chain)",
    content: `
    <p>
      The <strong>FX Chain</strong> lets you add, remove, and reorder effects to process your patches sound. Each effect (FX) is a building block, such as Chorus, Delay, Distortion, Mutator, EQ, Compressor, and more. Effects are processed in the order they appear in the chain, from top to bottom.
    </p>
    <h3>How to Use Effects</h3>
    <ul>
      <li>
        <strong>Add effects:</strong> Drag any effect from the FX bank (top row) into the FX chain area (bottom row).
      </li>
      <li>
        <strong>Reorder effects:</strong> Drag and drop effect blocks within the chain to change their processing order.
        <br>
        <em>Tip: You can also pick up and drop effects with the keyboard using the <kbd>P</kbd> key.</em>
      </li>
      <li>
        <strong>Remove effects:</strong> Click the <strong>X</strong> button on any FX block to remove it from the chain.
      </li>
    </ul>
    <h3>Effect Parameters</h3>
    <ul>
      <li>
        Each FX block exposes its main parameters as sliders, knobs, selects, or toggles.
      </li>
      <li>
        For most parameters, you can right-click a knob or slider to activate <strong>MIDI Learn</strong> and map it to a physical controller or press m.
      </li>
      <li>
        All parameter changes are immediately audible and can be saved as part of your preset.
      </li>
    </ul>
    <h3>Modulation (LFO/Envelope on FX)</h3>
    <ul>
      <li>
        <strong>Modulate FX parameters:</strong> Drag an envelope or LFO badge onto any FX parameter knob/slider, just like you do for synth parameters.
      </li>
      <li>
        A colored <strong>modulation ring</strong> appears around the control. Adjust modulation depth by resizing the ring.
      </li>
    </ul>
    <h3>Supported Effects</h3>
    <ul>
      <li><strong>Chorus</strong> – Adds movement and thickness by detuning and delaying the signal.</li>
      <li><strong>Phaser</strong> – Swirls the sound with shifting phase cancellation.</li>
      <li><strong>Delay</strong> – Echo/repeat effects, adjustable in time, feedback, and filter.</li>
      <li><strong>Distortion</strong> – Adds drive and harmonic grit.</li>
      <li><strong>Mutator</strong> – Lo-fi, bit reduction, distortion, and filter effects.</li>
      <li><strong>Ring Mod</strong> – Metallic amplitude modulation.</li>
      <li><strong>Morphing Filter</strong> – Morphs between two filter types in real time.</li>
      <li><strong>EQ3</strong> – 3-band equalizer for tone shaping.</li>
      <li><strong>Compressor</strong> – Controls dynamics and evens out volume.</li>
      <li><strong>DualFilter</strong> – Two independent filters, serial or parallel routing.</li>
      <li><strong>AutoPanner</strong> – Moves sound back and forth in stereo automatically.</li>
    </ul>
    <p>
      <em>All changes to the FX chain are non-destructive and can be undone by removing/reordering effects at any time.</em>
    </p>
  `,
  },
  {
    title: "Keyboard Shortcuts",
    content: `
    <p>
      Keyboard shortcuts speed up editing, navigation, and parameter control.
    </p>
    <h3>Core Shortcuts</h3>
    <ul>
      <li><strong>MIDI Learn:</strong> <kbd>m</kbd> &mdash; Activate MIDI learn for the focused control.</li>
      <li><strong>Cancel MIDI Learn:</strong> <kbd>Escape</kbd> &mdash; Cancel active MIDI learn.</li>
      <li><strong>Pick up/Drop (Drag mode):</strong> <kbd>p</kbd> &mdash; Pick up or drop an LFO or FX block with keyboard navigation.</li>
      <li><strong>Remove LFO modulation:</strong> <kbd>Shift</kbd>+<kbd>p</kbd> &mdash; Remove LFO modulation from the focused slider.</li>
      <li><strong>Toggle announcements (screen reader/speech):</strong> <kbd>Shift</kbd>+<kbd>a</kbd></li>
      <li><strong>Start Voice (speech):</strong> <kbd>v</kbd></li>
    </ul>
    <h3>Slider and Knob Navigation</h3>
    <ul>
      <li><strong>Set slider to minimum:</strong> <kbd>Shift + 1</kbd></li>
      <li><strong>Set slider to maximum:</strong> <kbd>Shift + 2</kbd></li>
      <li><strong>Reset slider to default:</strong> <kbd>Shift + 0</kbd></li>
      <li>
        <strong>Adjust slider by step:</strong>
        <ul>
          <li>Use <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> for fine control</li>
          <li>
            <kbd>Shift</kbd>+<kbd>ArrowLeft</kbd> / <kbd>Shift</kbd>+<kbd>ArrowRight</kbd>
            &mdash; Move slider by 10× the normal step size
          </li>
          <li>
            <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>ArrowLeft</kbd> / <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>ArrowRight</kbd>
            &mdash; Move slider by 100× the normal step size
          </li>
        </ul>
      </li>
    </ul>
    <h3>Panel/Section Navigation</h3>
    <ul>
      <li><strong>Go to Global panel:</strong> <kbd>Alt</kbd>+<kbd>z</kbd></li>
      <li><strong>Go to Oscillator section:</strong> <kbd>Alt</kbd>+<kbd>x</kbd></li>
      <li><strong>Go to Filter section:</strong> <kbd>Alt</kbd>+<kbd>c</kbd></li>
      <li><strong>Go to Mod Envelope section:</strong> <kbd>Alt</kbd>+<kbd>v</kbd></li>
      <li><strong>Go to LFO section:</strong> <kbd>Alt</kbd>+<kbd>b</kbd></li>
      <li><strong>Go to Add FX panel:</strong> <kbd>Alt</kbd>+<kbd>n</kbd></li>
      <li><strong>Go to FX Chain section:</strong> <kbd>Alt</kbd>+<kbd>m</kbd></li>
    </ul>
    <h4>Notes</h4>
    <ul>
      <li>
        When a slider/knob is focused, you can use all navigation shortcuts above.
        The <strong>Shift</strong> and <strong>Control+Shift</strong> combos multiply the step size (×10 and ×100), making fast large-value changes possible from the keyboard.
      </li>
      <li>
        To MIDI learn a slider, focus it and press <kbd>m</kbd>, then move a hardware knob/slider.
      </li>
      <li>
        Drag-and-drop (pick/drop) of modulation or FX blocks can also be done with <kbd>p</kbd> on the focused block.
      </li>
      <li>
        All of these shortcuts can be changed in the edit shortcuts panel. Simply press change and enter the new command, these are automatically saved to local storage.
      </li>
    </ul>
  `,
  },
  {
    title: "Voice Command Overview",
    content: `
      <p>
        You can control nearly every synth or effect parameter with natural speech. Use <b>set</b>, <b>focus</b>, <b>increase</b>, <b>grab</b>, <b>drop</b>, <b>remove</b>, and more. Names and numbers are recognized flexibly—you don't need to be exact.
      </p>
      <p>
        Supported actions: set values, focus controls, increment/decrement, modulate with LFOs/Envs, add/move/remove effects, query options/ranges, MIDI learn, and more.
      </p>
      <p>
      Toggle speak voice control feedback to switch between feedback routed to screen reader (default) and toggle for feedback from text to speech.
      </p>
    `,
  },

  {
    title: "Voice Command Patterns and Examples",
    content: `
      <ul>
        <li>
          <b>Set parameter to value:</b>
          <ul>
            <li>Set <i>cutoff</i> to <i>2000</i></li>
            <li>Change <i>osc 1 wave</i> to <i>triangle</i></li>
            <li>Make <i>resonance</i> 0.7</li>
            <li>Adjust <i>filter type</i> as <i>highpass</i></li>
          </ul>
        </li>
        <li>
          <b>Increment/Decrement by value:</b>
          <ul>
            <li><i>Filter cutoff up 1000</i></li>
            <li><i>Resonance down 0.2</i></li>
            <li><i>Oscillator 2 fine up 5</i></li>
          </ul>
        </li>
        <li>
          <b>Focus/Go to parameter:</b>
          <ul>
            <li>Focus on <i>mod envelope 1 attack</i></li>
            <li>Go to <i>vector pad</i></li>
            <li>Select <i>osc 3 detune</i></li>
          </ul>
        </li>
        <li>
          <b>Query range/options:</b>
          <ul>
            <li>What are the <i>osc 1 wave options</i>?</li>
            <li><i>Filter resonance range</i></li>
            <li><i>Voice mode choices</i></li>
          </ul>
        </li>
        <li>
          <b>LFO/Envelope pickup & drop:</b>
          <ul>
            <li>Pick up <i>LFO 1</i></li>
            <li>Grab <i>mod envelope 2</i></li>
            <li>Drop on <i>filter cutoff</i></li>
            <li>Drop LFO 2 on <i>osc 1 level</i></li>
          </ul>
        </li>
        <li>
          <b>Add/move/delete FX:</b>
          <ul>
            <li>Pick up <i>chorus</i> from bank</li>
            <li>Pick up <i>reverb</i> from chain</li>
            <li>Drop <i>reverb</i> into chain</li>
            <li>Drop <i>chorus</i> after <i>reverb</i></li>
            <li>Drop <i>phaser</i> before <i>delay</i></li>
            <li>Delete <i>phaser</i></li>
          </ul>
        </li>
        <li>
          <b>Remove modulation:</b>
          <ul>
            <li>Remove LFO from <i>filter cutoff</i></li>
            <li>Clear modulation from <i>volume</i></li>
          </ul>
        </li>
        <li>
          <b>MIDI learn:</b>
          <ul>
            <li>MIDI learn <i>filter cutoff</i></li>
            <li>Learn MIDI <i>mod env 1 attack</i></li>
            <li>Cancel MIDI learn</li>
          </ul>
        </li>
        <li>
          <b>General tips:</b>
          <ul>
            <li>You can use digits or words for numbers ("two", "ten", "point five", etc.)</li>
            <li>Parameter, group, and effect names match loosely—close is good enough!</li>
          </ul>
        </li>
      </ul>
    `,
  },
  {
    title: "Parameter Reference: Synth Controls",
    content: `
    <p>Every parameter below can be controlled by speech:</p>
    <table>
      <thead>
        <tr>
          <th>Group</th><th>Name</th><th>Type</th><th>Range / Options</th>
        </tr>
      </thead>
      <tbody>
        <!-- Vector Pad -->
        <tr><td>Vector Pad</td><td>X</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Vector Pad</td><td>Y</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Vector Pad</td><td>Vector Mode</td><td>select</td>
            <td>Static, LFO, Bounce, Random, Spiral, Lissajous, Drunk, Grid, Chaos, Orbit, Samplehold, Zigzag</td></tr>
        <tr><td>Vector Pad</td><td>Speed</td><td>slider</td><td>0.1–5.0</td></tr>

        <!-- Unison -->
        <tr><td>Unison Controls</td><td>Unison</td><td>slider</td><td>1–8</td></tr>
        <tr><td>Unison Controls</td><td>Detune</td><td>slider</td><td>0–50</td></tr>

        <!-- Portamento -->
        <tr><td>Portamento</td><td>Voice Mode</td><td>select</td><td>Poly, Mono</td></tr>
        <tr><td>Portamento</td><td>Glide Mode</td><td>select</td><td>Legato, Always</td></tr>
        <tr><td>Portamento</td><td>Glide Time</td><td>slider</td><td>0–1</td></tr>

        <!-- Master -->
        <tr><td>Master</td><td>Volume</td><td>slider</td><td>0–1</td></tr>

        <!-- Oscillators -->
        <tr><td>Oscillators</td><td>Wave</td><td>select</td><td>Saw, Square, Triangle, Sine</td></tr>
        <tr><td>Oscillators</td><td>Octave</td><td>select</td><td>-2 to +2</td></tr>
        <tr><td>Oscillators</td><td>Semitone</td><td>slider</td><td>-12–12</td></tr>
        <tr><td>Oscillators</td><td>Fine Tune</td><td>slider</td><td>-50–50</td></tr>
        <tr><td>Oscillators</td><td>Pan</td><td>slider</td><td>-1–1</td></tr>
        <tr><td>Oscillators</td><td>Level</td><td>slider</td><td>0–1</td></tr>

        <!-- Filter -->
        <tr><td>Filter</td><td>Type</td><td>select</td><td>Lowpass, Highpass, Band, Notch, Allpass</td></tr>
        <tr><td>Filter</td><td>Frequency</td><td>slider</td><td>50–16000</td></tr>
        <tr><td>Filter</td><td>Resonance</td><td>slider</td><td>0.1–10</td></tr>
        <tr><td>Filter</td><td>Envelope Depth</td><td>slider</td><td>-1–1</td></tr>

        <!-- Filter Envelope -->
        <tr><td>Filter Envelope</td><td>Attack</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Filter Envelope</td><td>Decay</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Filter Envelope</td><td>Sustain</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Filter Envelope</td><td>Release</td><td>slider</td><td>0.01–2</td></tr>

        <!-- Amp Envelope -->
        <tr><td>Amp Envelope</td><td>Attack</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Amp Envelope</td><td>Decay</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Amp Envelope</td><td>Sustain</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Amp Envelope</td><td>Release</td><td>slider</td><td>0.01–2</td></tr>

        <!-- Mod Envelope 1 -->
        <tr><td>Mod Envelope 1</td><td>Attack</td><td>slider</td><td>0.001–2</td></tr>
        <tr><td>Mod Envelope 1</td><td>Decay</td><td>slider</td><td>0.001–2</td></tr>
        <tr><td>Mod Envelope 1</td><td>Sustain</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Mod Envelope 1</td><td>Release</td><td>slider</td><td>0.001–2</td></tr>

        <!-- Mod Envelope 2 -->
        <tr><td>Mod Envelope 2</td><td>Attack</td><td>slider</td><td>0.001–2</td></tr>
        <tr><td>Mod Envelope 2</td><td>Decay</td><td>slider</td><td>0.001–2</td></tr>
        <tr><td>Mod Envelope 2</td><td>Sustain</td><td>slider</td><td>0–1</td></tr>
        <tr><td>Mod Envelope 2</td><td>Release</td><td>slider</td><td>0.001–2</td></tr>

        <!-- LFO 1 -->
        <tr><td>LFO 1</td><td>Rate</td><td>slider</td><td>0.01–20</td></tr>
        <tr><td>LFO 1</td><td>Shape</td><td>select</td><td>Sine, Triangle, Square, Sawtooth</td></tr>

        <!-- LFO 2 -->
        <tr><td>LFO 2</td><td>Rate</td><td>slider</td><td>0.01–20</td></tr>
        <tr><td>LFO 2</td><td>Shape</td><td>select</td><td>Sine, Triangle, Square, Sawtooth</td></tr>

        <!-- LFO 3 -->
        <tr><td>LFO 3</td><td>Rate</td><td>slider</td><td>0.01–20</td></tr>
        <tr><td>LFO 3</td><td>Shape</td><td>select</td><td>Sine, Triangle, Square, Sawtooth</td></tr>
      </tbody>
    </table>
  `,
  },
  {
    title: "Parameter Reference: FX and Modulators",
    content: `
    <p>
      Effect parameters can be set by voice, for example:
      <code>set chorus depth to 0.7</code> or <code>phaser rate up 0.5</code>
    </p>
    <ul>
      <li><b>Phaser:</b>
        <ul>
          <li>Rate: <b>0.01 – 8</b></li>
          <li>Depth: <b>0 – 1</b></li>
          <li>Feedback: <b>0 – 0.9</b></li>
          <li>Stereo Phase: <b>0 – 180</b></li>
          <li>Base Freq: <b>20 – 2000</b></li>
        </ul>
      </li>
      <li><b>Delay:</b>
        <ul>
          <li>Delay (ms): <b>1 – 2000</b></li>
          <li>Feedback: <b>0 – 0.9</b></li>
          <li>Cutoff: <b>100 – 20000</b></li>
          <li>Wet Level: <b>0 – 1</b></li>
        </ul>
      </li>
      <li><b>Chorus:</b>
        <ul>
          <li>Rate (Hz): <b>0.01 – 8</b></li>
          <li>Depth: <b>0 – 1</b></li>
          <li>Feedback: <b>0 – 0.9</b></li>
          <li>Delay (s): <b>0 – 0.1</b></li>
          <li>Wet Level: <b>0 – 1</b></li>
          <li>Dry Level: <b>0 – 1</b></li>
          <li>Stereo Phase: <b>0 – 180</b></li>
        </ul>
      </li>
      <li><b>Distortion:</b>
        <ul>
          <li>Drive: <b>0 – 1</b></li>
          <li>Curve: <b>0 – 1000</b></li>
        </ul>
      </li>
      <li><b>Mutator:</b>
        <ul>
          <li>Bit Depth: <b>1 – 16</b></li>
          <li>Reduction: <b>0.01 – 1</b></li>
          <li>Distortion: <b>10 – 100</b></li>
          <li>Distortion Type: <b>soft, clip</b></li>
          <li>Filter Type: <b>lowpass, highpass, bandpass, lowshelf, highshelf</b></li>
          <li>Cutoff: <b>20 – 20000</b></li>
          <li>Resonance: <b>0.1 – 20</b></li>
          <li>Env Depth: <b>0 – 20</b></li>
          <li>LFO Rate: <b>0.1 – 20</b></li>
          <li>LFO Depth: <b>0 – 1</b></li>
          <li>Attack: <b>0.01 – 1</b></li>
          <li>Release: <b>0.01 – 1</b></li>
        </ul>
      </li>
      <li><b>RingModulator:</b>
        <ul>
          <li>Mod Frequency: <b>0.1 – 2000</b></li>
          <li>Depth: <b>0 – 1</b></li>
        </ul>
      </li>
      <li><b>Morph:</b>
        <ul>
          <li>Type A / Type B: <b>lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass</b></li>
          <li>Freq A / Freq B: <b>20 – 20000</b></li>
          <li>Resonance A / B: <b>0.1 – 20</b></li>
          <li>Output Gain: <b>0 – 1</b></li>
          <li>Morph: <b>0 – 1</b></li>
          <li>LFO Frequency: <b>0.01 – 10</b></li>
          <li>LFO Depth: <b>0 – 1</b></li>
        </ul>
      </li>
      <li><b>Equaliser:</b>
        <ul>
          <li>Low Gain (dB): <b>-40 – 40</b></li>
          <li>Low Freq (Hz): <b>20 – 1000</b></li>
          <li>Mid Gain (dB): <b>-40 – 40</b></li>
          <li>Mid Freq (Hz): <b>200 – 5000</b></li>
          <li>Mid Peak: <b>0 – 20</b></li>
          <li>High Gain (dB): <b>-40 – 40</b></li>
          <li>High Freq (Hz): <b>2000 – 18000</b></li>
        </ul>
      </li>
      <li><b>Compressor:</b>
        <ul>
          <li>Threshold (dB): <b>-60 – 0</b></li>
          <li>Attack (ms): <b>1 – 1000</b></li>
          <li>Release (ms): <b>10 – 2000</b></li>
          <li>Makeup Gain: <b>1 – 10</b></li>
          <li>Ratio: <b>1 – 50</b></li>
          <li>Knee: <b>0 – 40</b></li>
        </ul>
      </li>
      <li><b>DualFilter:</b>
        <ul>
          <li>Type A / Type B: <b>lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass</b></li>
          <li>Freq A / Freq B (Hz): <b>20 – 20000</b></li>
          <li>Q A / Q B: <b>0.1 – 20</b></li>
          <li>Serial Routing: <b>Serial, Parallel</b></li>
        </ul>
      </li>
      <li><b>ModulatedStereoPanner:</b>
        <ul>
          <li>Direction: <b>-1 – 1</b></li>
          <li>Rate: <b>0.1 – 10</b></li>
          <li>Depth: <b>0 – 1</b></li>
        </ul>
      </li>
    </ul>
    <p>
      For select/toggle options, see the next section.
    </p>
  `,
  },
  {
    title: "Parameter Options (Dropdown/Toggle Values)",
    content: `
      <ul>
        <li><b>Oscillator Wave:</b> Saw, Square, Triangle, Sine</li>
        <li><b>Octave:</b> -2, -1, 0, +1, +2</li>
        <li><b>Vector Mode:</b> Static, LFO, Bounce, Random, Spiral, Lissajous, Drunk, Grid, Chaos, Orbit, Samplehold, Zigzag</li>
        <li><b>Voice Mode:</b> Poly, Mono</li>
        <li><b>Glide Mode:</b> Legato, Always</li>
        <li><b>Filter Type / Mutator Filter Type / DualFilter Type / MorphingFilter Type:</b> Lowpass, Highpass, Bandpass, Lowshelf, Highshelf, Peaking, Notch, Allpass</li>
        <li><b>Distortion Type:</b> Soft, Clip</li>
        <li><b>DualFilter Routing:</b> Serial, Parallel</li>
      </ul>
    `,
  },

  {
    title: "Voice Command Pro Tips",
    content: `
      <ul>
        <li>You can use either numbers or words for values. For example: "set cutoff to 2000", "set cutoff to two thousand", or "set cutoff to point five".</li>
        <li>Try "up" or "down" with a number to nudge parameters: "attack up 0.1", "osc 2 fine down 5".</li>
        <li>Ask for parameter options or range: "filter type options", "lfo rate range", "voice mode choices".</li>
        <li>Pickup and drop LFOs or envelopes: "pick up lfo 2", "drop on filter cutoff".</li>
        <li>Add and move FX: "pick up chorus from bank", "drop after delay".</li>
        <li>Remove modulations: "remove lfo from cutoff", "clear envelope on volume".</li>
        <li>MIDI learn: "midi learn filter cutoff", "cancel midi learn".</li>
      </ul>
    `,
  },
  {
    title: "MPE (MIDI Polyphonic Expression)",
    content: `
    <p>
      <b>MPE support</b> lets you assign expressive MIDI gestures—like pitch bend, aftertouch, mod wheel, and slide (Y-axis)—to different synth parameters per note.<br>
      Enable or disable MPE using the <b>Enable MPE / Disable MPE</b> button. When MPE is on, destination dropdowns appear for each dimension below.
    </p>
    <ul>
      <li>
        <b>Pitch Bend:</b>
        <ul>
          <li>Pitch</li>
          <li>Vector X</li>
          <li>Vector Y</li>
          <li>Osc Detune</li>
          <li>Pan</li>
          <li>Filter Cutoff</li>
          <li>Volume</li>
          <li>Resonance</li>
        </ul>
      </li>
      <li>
        <b>Aftertouch:</b>
        <ul>
          <li>Filter Cutoff</li>
          <li>Volume</li>
          <li>Pan</li>
          <li>Vector X</li>
          <li>Vector Y</li>
          <li>Resonance</li>
        </ul>
      </li>
      <li>
        <b>Mod Wheel:</b>
        <ul>
          <li>Filter Cutoff</li>
          <li>Volume</li>
          <li>Pan</li>
          <li>Vector X</li>
          <li>Vector Y</li>
          <li>Resonance</li>
        </ul>
      </li>
      <li>
        <b>Slide (Y-axis):</b>
        <ul>
          <li>Vector X</li>
          <li>Vector Y</li>
          <li>Osc Detune</li>
          <li>Pan</li>
          <li>Filter Cutoff</li>
          <li>Volume</li>
          <li>Resonance</li>
        </ul>
      </li>
    </ul>
    <p>
      To remap, just pick a new destination from the dropdown for each dimension.<br>
      <b>Tip:</b> All MPE assignments update instantly for all active notes and new notes.
    </p>
  `,
  },
];

function createAccordion(sections) {
  const container = document.getElementById("manual-container");
  container.innerHTML = ""; // clear if already present
  sections.forEach((section, i) => {
    const secDiv = document.createElement("div");
    secDiv.className = "accordion-section";

    const header = document.createElement("button");
    header.className = "accordion-header";
    header.innerText = section.title;
    header.setAttribute("aria-expanded", "false");
    header.setAttribute("aria-controls", `panel-${i}`);

    const content = document.createElement("div");
    content.className = "accordion-content";
    content.id = `panel-${i}`;
    content.innerHTML = section.content;

    header.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".accordion-header").forEach((h) => {
        h.setAttribute("aria-expanded", "false");
        h.classList.remove("active");
      });
      document.querySelectorAll(".accordion-content").forEach((c) => {
        c.style.display = "none";
      });
      if (!expanded) {
        this.setAttribute("aria-expanded", "true");
        this.classList.add("active");
        content.style.display = "block";
      }
    });

    secDiv.appendChild(header);
    secDiv.appendChild(content);
    container.appendChild(secDiv);
  });
}

createAccordion(manualSections);

// Modal logic
const toggleManualBtn = document.getElementById("toggle-manual-btn");
const modal = document.getElementById("manual-modal");
const closeModalBtn = modal.querySelector(".modal-close");
const backdrop = modal.querySelector(".modal-backdrop");

function openModal() {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scroll
  modal.querySelector(".modal-dialog").focus();
}

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = ""; // Restore scroll
  toggleManualBtn.focus();
}

// Open modal on button click
toggleManualBtn.addEventListener("click", openModal);
// Close on close button
closeModalBtn.addEventListener("click", closeModal);
// Close on backdrop click
backdrop.addEventListener("click", closeModal);
// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (modal.style.display === "flex" && e.key === "Escape") closeModal();
});
