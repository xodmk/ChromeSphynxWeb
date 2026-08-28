<!-- doc-version: 1.2 | source: XodPoltergeist_PLUGX/docs/Poltergeist_UserGuide.md -->
# Poltergeist — User Guide

### Chrome Sphynx Audio

#### *All your bass are belong to us*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Installation](#2-installation)
3. [Interface Overview](#3-interface-overview)
4. [Phase Vocoder Spectral Engine](#4-phase-vocoder-spectral-engine)
5. [Spectral Pitch Shifting](#5-spectral-pitch-shifting)
6. [Spectral Wavefold (Drive)](#6-spectral-wavefold-drive)
7. [Resonant Spectral Comb Filter](#7-resonant-spectral-comb-filter)
8. [Formant Filter](#8-formant-filter)
9. [Ghost Delay](#9-ghost-delay)
10. [Output Mix & Stereo Width](#10-output-mix--stereo-width)
11. [Output Dynamics (Soft Saturation & Limiter)](#11-output-dynamics-soft-saturation--limiter)
12. [Capture A/B Warp Crossfader](#12-capture-ab-warp-crossfader)
13. [Visualization Display](#13-visualization-display)
14. [Preset Management](#14-preset-management)
15. [DAW Integration & Automation](#15-daw-integration--automation)
16. [Performance & CPU Usage](#16-performance--cpu-usage)
17. [Parameter Reference](#17-parameter-reference)

---

## 1. Introduction

Poltergeist is a effect processor based on a Phase Vocoder + several spectral domain processing functions.

This effect is meant to be versatile, and will produce a wide range of effects from basic pitch shifting to dramatic cascading formant filtering, comb filtering and distorion type sounds. The effect is not meant to fit nicely in a catagory, but instead, the intention is to create a unique character that adds punchy spectral crunchiness and haunting distorted vocalizations to any sound.

The effect is a configurable combination of several DSP techniques that combine internally in a unique 'Circuit Bent' way to produce a wide range of sonic results. The User Interface is designed to allow the user to easily fade in/out these different features.

The key features are:

- Phase Vocoder based Pitch up/down
- Spectral Delay with optional Tempo sync
- Spectral Comb Filtering
- Formant Filter with optional Cascade delay feedback
- Spectral Waveshaping with selectable algorithms
- Capture A/B Warp Crossfader + LFO modulation

### Usage Notes

The Spectral Delay Feedback is designed to interact with the different effect features. Notably, for the Formant filter 'Cascade' effect to be effective, the delay feedback must be turned up to allow for cascading formants to circulate through the feedback loop. The base formant is set by 'Vowel', then the formant is rotated each pass through the feedback loop, creating a warping vocalized effect.

The Capture A/B Warp Crossfader is my solution for creating plugin-state automations, or 'warps'. This automation concept works by First: enable the desired Faders to be automated, second: Capture the A state (Start Fader positions), Third: Capture the B state (End Fader positions). This simple process turns on the Crossfader, which will then warp from State A to State B, allowing for either direct manual control of the Crossfader, or LFO modulation, or, HOST automation.

The dedicated Crossfader LFO is also only enabled when the Capture A/B is active. The LFO can be free running, or tempo synced. Several LFO waveform shapes are available. The small indicator at the bottom of the crossfader is used to drag the LFO center swing position to the desired location.

There are several Selectable Background Visualizations that provide some visual feedback, plus some automatic overlays for the filter response curve, and SSB modulation frequency. The background visualizations are selectable by clicking the top-center graphic.

### FYI Tech Notes

A great deal of attention has been devoted to maintaining a consistent 'playable' output, so the goal is to minimize Sonic Dead Zones. In other words, no matter how the knobs are turned, the output should be musically useful.

This is a spectral processing effect, where all the functions are performed in the spectral domain. There is an inherent unavoidable processing delay due to the Time-Domain to Frequency Domain processing. The switch at the top-right selects between Hi-Res/Lo-Res, allowing for two fundamental FFT lengths, and hence two static processing delay length. The difference between Hi-Res and Lo-Res allows for two quite different characteristic results, related to the FFT resolution, not necessarily higher vs. lower quality at the output.

The Switch at the upper left optionally delays the input so the Dry audio is time compensated to align with the Wet (spectral processed) audio. The intention is for the effect to allow for zero-latency Dry + tail effects, or Delay compensated synchronized Dry/Wet effects.

### Signal Flow Overview

```
Stereo Input
    │
    ├──── [Save Dry Signal] ──── [Dry Latency Compensation] ─────┐
    │                                                             │
    ▼                                                             │
┌──────────────────────┐                                          │
│  STFT Analysis        │  Windowed FFT (Kaiser window)           │
└──────────┬───────────┘                                          │
           ▼                                                      │
┌──────────────────────┐                                          │
│  Spectral Effects     │  1. Pitch Shift (-12 to +12 ST)         │
│  Chain                │  2. Spectral Wavefold (drive)            │
│                       │  3. Spectral Comb (freq, reso, damp)    │
│                       │  4. Spectral Shift / Warp (morphable)   │
│                       │  5. Ghost Delay                         │
│                       │     (frame delay, feedback, gate,       │
│                       │      Bode shift on feedback path)       │
└──────────┬───────────┘                                          │
           ▼                                                      │
┌──────────────────────┐                                          │
│  ISTFT Synthesis      │  Overlap-add resynthesis                 │
└──────────┬───────────┘                                          │
           ▼                                                      │
┌──────────────────────┐         ┌───────────────┐                │
│  Wet / Dry Crossfade  │ ◄──────│  Dry Signal   │◄───────────────┘
│  (FX Mix control)     │        │  (compensated) │
└──────────┬───────────┘         └───────────────┘
           ▼
┌──────────────────────┐
│  Mid-Side Stereo      │  Stereo width processing
│  Width                │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Soft Saturation      │  Musical soft-clip (knee 0.92)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Brick-Wall Limiter   │  4ms lookahead protection
└──────────┬───────────┘
           ▼
      Stereo Output
```

---

## 2. Installation

### Plugin Files

Copy `Poltergeist.vst3` to the appropriate directory:

| Platform | VST3 Directory |
|----------|---------------|
| **macOS** | `~/Library/Audio/Plug-Ins/VST3/` |
| **Windows** | `C:\Program Files\Common Files\VST3\` |
| **Linux** | `~/.vst3/` |

### Factory Presets

Factory presets are installed automatically to the user configuration directory on first launch:

| Platform | Preset Directory |
|----------|-----------------|
| **macOS** | `~/Library/Application Support/XODMK/SpectralGhost/factory/` |
| **Windows** | `%APPDATA%\XODMK\SpectralGhost\factory\` |
| **Linux** | `~/.config/XODMK/SpectralGhost/factory/` |

User presets are stored in a `user/` subdirectory alongside the factory presets.

### DAW Setup

After placing the plugin file, restart your DAW or trigger a plugin rescan. Insert Poltergeist as a stereo effect (insert or send) on any audio track or bus.

---

## 3. Interface Overview

The Poltergeist interface is organized around a central heptagonal visualization display, with controls arranged in a nine-leaf perimeter layout and additional controls below.

![Annotated view of the Poltergeist interface, with labels naming each functional section of the control surface.](gfx/Poltergeist_GUI_Overview.png)
*Figure 1 — The control surface at a glance. Each section is detailed, with its own close-up figure, in the chapters that follow.*

### Central Display & Metering

The center of the interface features a heptagonal (seven-sided) display region showing one of four real-time visualization modes. Surrounding the display, a nine-leaf perimeter region houses the main parameter knobs. Level meters (left and right channels) are rendered as radial heptagonal rings flanking the display.

### Parameter Knobs (Nine-Leaf Perimeter)

Sixteen parameter knobs are arranged around the central display, using two custom knob styles:

- **XodKnobStyle** — Full rotary knobs for primary parameters
- **XodArcStyle** — Arc-style knobs for secondary parameters

### Warp / Morphing Section

Located below the main display:

- **Capture A / Capture B Buttons** — Pentagon-shaped buttons to snapshot parameter states.
- **Crossfader** — Horizontal slider that blends between Capture A and Capture B.
- **Warp LFO Frequency** — Speed of automatic crossfader modulation (0.05–5 Hz).
- **Warp LFO Amount** — Depth of automatic crossfader modulation (0.0–1.0).
- **A/B Diamond Switches** — 16 individual diamond toggles, one per morphable parameter, controlling which parameters participate in morphing.

### Mode & Sync Controls

- **HI-RES / LO-LAT** — Diamond toggle to switch STFT window mode.
- **DRY COMP** — Diamond toggle to enable dry signal latency compensation.
- **Display Mode** — Circular button cycling through Waveform, 3D Spectrum, Phase Scope, and Radial modes.
- **Tempo Sync / Quantize Sync** — Pentagon buttons for Warp LFO sync modes.
- **Ghost Sync** — Pentagon button for ghost delay tempo sync.
- **Gate Sync** — Pentagon button for gate tempo sync.
- **Waveform** — Pentagon button cycling through 7 LFO waveforms.
- **Colormap** — Triangle button cycling through 16 color themes.

### Preset Controls

- **Preset Selector** — Dropdown browser for factory and user presets.
- **Save / Delete** — Rectangular buttons for preset management.
- **Previous / Next** — Arrow buttons for quick browsing.

### Latency Display

A label showing the current STFT latency in both samples and milliseconds, updated when switching between HI-RES and LO-LAT modes.

---

## 4. Phase Vocoder Spectral Engine

Poltergeist's processing engine is a real-time STFT (Short-Time Fourier Transform) phase vocoder. All spectral effects operate on the frequency-domain representation of the audio, enabling manipulations that are impossible in the time domain.

![Close-up of the Dry Comp switch, latency read-out and STFT window toggle with callouts.](gfx/Poltergeist_GUI_STFT.png)
*Figure 2 — The STFT controls that bracket the top of the interface.*

### How It Works

1. **Analysis**: The input audio is windowed (Kaiser window, β = 8.6) and transformed to the frequency domain via FFT.
2. **Processing**: The spectral effects chain operates on the complex spectral data (magnitude and phase) of each frame.
3. **Synthesis**: The processed spectral frames are inverse-FFT'd and overlap-added to reconstruct the output audio.

### STFT Modes

Two STFT configurations are available, selectable via the HI-RES / LO-LAT toggle:

| Mode | FFT Size | Window Size | Hop Size | Overlap | Latency (@ 48 kHz) |
|------|----------|-------------|----------|---------|---------------------|
| **HI-RES** | 2048 | 1024 | 256 | 75% (4x) | ~21.3 ms (1024 samples) |
| **LO-LAT** | 1024 | 512 | 128 | 75% (4x) | ~10.7 ms (512 samples) |

**HI-RES** provides finer frequency resolution (23.4 Hz per bin at 48 kHz), resulting in smoother pitch shifting, more precise comb filtering, and cleaner spectral warping. Use this mode when latency is not critical.

**LO-LAT** halves the latency at the expense of coarser frequency resolution (46.9 Hz per bin at 48 kHz). Use this mode for live performance or when monitoring through the plugin.

### Dry Signal Latency Compensation

The STFT process introduces latency equal to the window size. When the **Dry Comp** switch is enabled, the dry signal is delayed by the window size through a ring buffer, time-aligning it with the wet signal. This prevents phase cancellation at intermediate FX Mix positions.

**Tip**: Enable Dry Comp when using FX Mix values between 0 and 1 for the cleanest blend. When using 100% wet (FX Mix = 1.0), Dry Comp has no audible effect.

---

## 5. Spectral Pitch Shifting

The first stage in the spectral effects chain is a frequency-domain pitch shifter that resamples spectral bins to shift pitch up or down.

![Close-up of the centre Pitch Shift knob and its A/B enable diamond, with callouts.](gfx/Poltergeist_GUI_PitchShift.png)
*Figure 3 — Pitch Shift, the large knob at the centre of the display.*

### Pitch Shift

**Range**: -1.0 – +1.0 (maps to -12 to +12 semitones, i.e., one octave down to one octave up)

**Default**: 0.0 (no shift)

At center (0.0), no pitch shifting is applied. Turning the knob left shifts pitch downward; turning right shifts pitch upward. The phase vocoder resamples the spectral bins, preserving the frame rate and temporal characteristics of the audio while changing the pitch.

**Tip**: Subtle detuning (small values near center) adds thickness and chorus-like width. Larger shifts create obvious transposition effects. Combine with the Ghost Delay for pitch-shifted echoes.

---

## 6. Spectral Wavefold (Drive)

The second stage applies a spectral wavefold effect — a distortion/drive process operating directly on spectral magnitudes.

![Close-up of the ALGO arc, WAVCHAR knob and WAVDRIVE knob with callouts.](gfx/Poltergeist_GUI_Wavefold.png)
*Figure 4 — Spectral Wavefold controls, lower left of the interface.*

### Wavefold

**Range**: 0.0 – 1.0

**Default**: 0.0 (off)

At 0.0, no drive is applied. Increasing the value adds harmonic richness and spectral distortion by folding spectral magnitudes. This operates before the comb filter and ghost delay, so the added harmonics are further processed by the downstream effects.

**Tip**: Use subtle amounts (0.1–0.3) to add presence and harmonic density. Higher amounts (0.5–1.0) produce aggressive spectral distortion — especially effective when fed into the ghost delay's feedback path.

---

### Mutate Char

`mutateChar` — 0.0 to 1.0, default 0.5. Character control for the active mutate
algorithm.

### Mutate Algorithm

`mutateAlgo` — selects the spectral waveshaping algorithm. Six are available:

| Algorithm | Character |
|-----------|-----------|
| **Baseline** | Neutral reference — no additional shaping |
| **HardFold** | Closed-form triangle wavefold, hard harmonic synthesis |
| **PhaseWarp** | Continuous nonlinear phase warping |
| **PhScram** | Phase scrambling |
| **SelfMult** | Cross-bin complex multiplication |
| **Buchla** | Multi-stage parallel magnitude fold |



## 7. Resonant Spectral Comb Filter

The third stage is a spectral-domain comb filter that creates resonant peaks at harmonically spaced intervals across the frequency spectrum.

![Close-up of the Comb Freq knob, Comb Rez knob and Comb Damp arc with callouts.](gfx/Poltergeist_GUI_Comb.png)
*Figure 5 — Spectral comb controls, down the right side of the interface.*

### Comb Freq

**Range**: 0.0 – 1.0 (normalized frequency)

**Default**: 0.0

Controls the fundamental frequency of the comb filter. This determines the spacing of the resonant peaks in the spectrum.

### Comb Reso

**Range**: 0.0 – 1.0

**Default**: 0.6

Controls the resonance (feedback) of the comb filter. Higher values create sharper, more pronounced resonant peaks. The internal feedback coefficient is scaled to 0.97 × the knob value for stability.

### Character (Comb Damp)

**Range**: 0.0 – 1.0

**Default**: 0.5

Controls the tonal character of the comb filter. At 0.0, the comb is warm (high frequencies damped). At 0.5, neutral. At 1.0, bright (full high-frequency content).

**Tip**: The spectral comb is always active alongside the Shift/Warp system. Use low Comb Reso for subtle spectral coloring, or high Reso with a specific Comb Freq to create pitched, tuned resonances from any input material.

---

## 8. Formant Filter

The formant stage reshapes the spectrum around vowel-like resonant peaks. It runs
on the main path and, when Cascade is engaged, is re-applied to the Ghost Delay
feedback path so the formant rotates on every repeat.

![Close-up of the FMT MIX arc, FMT SIZE, VOWEL and FMT RESO controls and the Cascade knob, with callouts.](gfx/Poltergeist_GUI_Formant.png)
*Figure 6 — Formant controls, spread across the upper interface.*

### Ghost FX Formant

`ghostFXFormant` — 0.0 to 1.0, default 0.0. Amount of formant filtering applied.
At 0.0 the stage is bypassed.

### Vowel

`formantVowel` — 0.0 to 1.0, default 0.5. Selects the base formant, sweeping
continuously through the vowel set. This is the starting formant that Cascade
rotates away from.

### Ghost FX Cascade

`ghostFXCascade` — 0.0 to 1.0, default 0.0. Depth of the formant applied to the
feedback path. For the cascade effect to be audible, **Ghost FB must be turned
up** — the formant is rotated once per pass through the delay loop, so with no
feedback there are no further passes to rotate. Together they produce the
warping vocalised effect.

### Ghost FX Depth

`formantReso` — 0.0 to 1.0, default 0.0. Formant contrast, mapped internally to
a gamma of 1 to 3. Higher values sharpen the resonant peaks.

### Ghost FX Bode

`formantSize` — 0.0 to 1.0, default 0.5. Formant size / gender shift, shared by
the main and cascade formant stages. The Bode frequency-shift and morph
behaviour is applied here rather than as a separate control. 0.5 is neutral.

---


## 9. Ghost Delay

The defining feature of Poltergeist — a frequency-domain frame delay that stores and replays entire spectral frames rather than time-domain audio samples. This creates "ghost" echoes where the spectral content repeats with full pitch fidelity, without the time-stretching artifacts of conventional delays.

![Close-up of the FB knob, DELAY arc, TIME knob and tempo-sync pentagon with callouts.](gfx/Poltergeist_GUI_GhostDelay.png)
*Figure 7 — Ghost Delay controls, upper and mid left of the interface.*

### Ghost Time

**Range**: 0.0 – 1.0 (maps to 0–2 seconds)

**Default**: 0.25

Controls the delay time of the Ghost Delay. The delay operates on STFT frames, so the actual delay is quantized to the frame rate (hop size / sample rate). At 48 kHz with a 256-sample hop, the frame rate is 187.5 Hz, giving a frame period of approximately 5.3 ms.

### Ghost Mix

**Range**: 0.0 – 1.0

**Default**: 0.5

Blends between the direct spectral signal and the delayed ghost signal. At 0.0, only the direct signal is heard. At 1.0, only the delayed ghost is heard.

### Ghost FB (Feedback)

**Range**: 0.0 – 1.0

**Default**: 0.0

Controls the feedback amount of the ghost delay. At 0.0, each echo occurs once and decays. Increasing feedback causes echoes to recirculate, creating decaying repetitions. At high values, echoes sustain for extended periods.

**Caution**: High feedback combined with Ghost FX (Bode shift) creates accumulating spectral drift — each repetition is further frequency-shifted. This is a core feature of Poltergeist's sound, but be aware that extreme settings can produce intense, building resonances. The built-in limiter prevents clipping.

---

## 10. Output Mix & Stereo Width

The two output-stage controls sit at the top and bottom of the right-hand column: FX Mix blends the processed spectrum against the dry input, and Stereo Width sets the mid-side spread of the result.

![Close-up of the WET and STEREO knobs with callouts.](gfx/Poltergeist_GUI_Mix.png)
*Figure 8 — Output mix and stereo width, right-hand column.*

### FX Mix

**Range**: 0.0 - 1.0

**Default**: 0.5

Dry/wet balance for the whole spectral chain, applied after the spectral effects and before the stereo width stage. At 0.0 only the dry input is heard; at 1.0 the dry path is muted entirely, which is why Dry Comp has no audible effect at that setting.

**Tip**: Intermediate values are where Dry Comp earns its keep - see section 4. Without it, the undelayed dry signal fights the wet signal and thins the result.

### Stereo Width

**Range**: 0.0 – 1.0

**Default**: 0.0

Applies mid-side stereo width processing to the mixed output signal. At 0.0, the stereo image passes unchanged. Increasing the value boosts the side (difference) channel relative to the mid (sum) channel, widening the stereo image. The internal scaling is: `msWidth = 1.0 + stereoWidth × 2.0`, ranging from 1.0 (unity) to 3.0 (maximum width enhancement).

**Tip**: Spectral processing can sometimes narrow the stereo image. Use Stereo Width to restore or exaggerate the stereo spread. Be careful with high values — excessive side boost can cause phase issues on mono playback systems.

---

## 11. Output Dynamics (Soft Saturation & Limiter)

Poltergeist includes two stages of output protection to prevent clipping from resonant spectral processing.

### Soft Saturation

Applied per-sample after the wet/dry mix and stereo width processing. Uses a soft-knee curve:

- **Knee**: 0.92 (-0.72 dBFS) — gentle compression begins here
- **Threshold**: 0.98 (-0.18 dBFS) — hard ceiling
- **Shape**: 0.65 — gradual curve that preserves dynamics

This catches most peaks musically, adding subtle warmth rather than hard clipping.

### Brick-Wall Lookahead Limiter

A true peak limiter with 4 ms lookahead and 50 ms release provides absolute clip protection:

- **Threshold**: 0.98 (-0.18 dBFS)
- **Target**: 0.95 (-0.43 dBFS)

The limiter rarely activates after the soft saturation stage, but guarantees the output never exceeds safe levels even under extreme feedback and resonance conditions.

---

## 12. Capture A/B Warp Crossfader

The parameter morphing automated crossfader allows you to capture two complete parameter snapshots and smoothly interpolate between them, creating evolving, time-varying effects. The crossfader includes a dedicated LFO with seven waveforms and host tempo sync for fully automated parameter morphing.

![Close-up of the Param Warp crossfader, capture pentagons, tempo sync buttons and LFO knobs, with callouts.](gfx/Poltergeist_GUI_Warp.png)
*Figure 9 — Capture and warp controls along the bottom edge.*

### How It Works

1. **Set up State A** — Adjust all parameters to your desired starting state.
2. **Press Capture A** — This snapshots the current values of all morphable parameters.
3. **Set up State B** — Adjust parameters to a contrasting state.
4. **Press Capture B** — This snapshots the second state.
5. **Use the Crossfader** — Move it to blend between State A (left) and State B (right).

### Per-Parameter Enable

Each of the 16 continuous parameters has a small diamond-shaped A/B toggle switch. When enabled (lit), that parameter will respond to the crossfader. When disabled, that parameter remains at its current manual setting regardless of crossfader position.

This allows precise control over which aspects of the sound morph. For example:
- Morph Ghost Time and Feedback while keeping Pitch Shift and FX Mix fixed.
- Morph only the Vowel for an isolated vocalised formant sweep.
- Morph everything except Ghost FX Depth for evolving delay with consistent feedback character.

#### Morphable Parameters

The following 16 parameters support A/B morphing:

- FX Mix
- Pitch Shift
- Ghost Time, Ghost Mix, Ghost FB
- Comb Freq, Comb Reso, Character
- Ghost FX Formant, Vowel, Ghost FX Cascade
- Ghost FX Depth, Ghost FX Bode
- Stereo Width
- Wavefold, Mutate Char

**Note**: Mutate Algorithm, Tempo Sync modes, Waveform selection, Delay Trigger Mode, Ghost Tempo Sync, Window Mode, and Display Mode are discrete parameters and do not participate in morphing.

### Warp LFO (Automatic Morphing)

The crossfader can be modulated automatically by a dedicated LFO with full waveform and tempo sync control:

- **Warp LFO Frequency** — Sets the speed of crossfader modulation (0.05–5.0 Hz).
- **Warp LFO Amount** — Sets the depth of crossfader modulation (0.0–1.0). At 0.0, the crossfader stays at its manual position. At 1.0, the LFO sweeps the full crossfader range.
- **Swing Point** — The diamond indicator on the crossfader shows the center point around which the LFO oscillates.

### Waveform Selection

Choose from seven LFO waveforms that shape the crossfader's morphing motion:

| Waveform | Effect |
|----------|--------|
| **Sine** | Smooth, symmetrical sweep between A and B. The most natural and musical morphing motion. |
| **Triangle** | Linear sweep with a sharper turnaround than sine. Slightly more pronounced transitions. |
| **Saw+** | Rising sawtooth. Ramps from A toward B and resets, creating a repeating build-up motion. |
| **Saw-** | Falling sawtooth. Ramps from B toward A and resets, creating a repeating wind-down motion. |
| **Square** | Alternates between the A and B states. Produces rhythmic switching between the two snapshots. |
| **Random** | Randomized crossfader position. Creates unpredictable, chaotic parameter movement. |
| **Sample & Hold** | Steps to random crossfader positions at the LFO rate. Produces stepped, glitchy parameter jumps. |

### Tempo Sync

The Warp LFO can be locked to the host DAW's tempo. Three sync modes are available:

- **Free** — LFO runs at the specified Hz, independent of host tempo.
- **Cycle** — LFO resets at measure/bar boundaries, maintaining phase coherence with the song position.
- **Quantized** — LFO frequency is locked to musical note divisions (1/1, 1/2, 1/4, 1/8, 1/16, with dotted variants).

### Creative Applications

- **Evolving Pads**: Capture a bright, pitch-shifted state as A and a dark, warped state as B. Use a slow Sine Warp LFO to create breathing, evolving spectral textures.
- **Build/Drop Effects**: Capture a subtle effect as A and extreme Ghost FX with high feedback as B. Automate the crossfader for dramatic spectral transitions.
- **Rhythmic Morphing**: Use quantized tempo sync with Square or S&H waveforms to create rhythmic parameter variations locked to your track.
- **Barber Pole Effects**: Use Saw+ or Saw- waveforms with Ghost FX to create continuously building or decaying spectral spirals.
- **Live Performance**: Map the crossfader to a MIDI controller for real-time morphing during performance.

---

## 13. Visualization Display

Poltergeist provides four real-time visualization modes displayed in a heptagonal (seven-sided) display region, surrounded by radial level metering.

![Close-up of the display mode button and the central visualizer, with callouts.](gfx/Poltergeist_GUI_Display.png)
*Figure 10 — The Display Mode button and the central visualizer.*

### Waveform Mode

Displays the real-time audio waveform as an oscilloscope-style trace. Useful for observing transient behavior, amplitude envelope, and the overall dynamic character of the processed output.

### 3D Spectrum Mode

Displays an animated three-dimensional spectral waterfall surface that scrolls in depth, showing spectral content evolving over time. This provides a visually striking representation of how the spectral effects transform the frequency content.

**Note**: 3D Spectrum mode requires more CPU for rendering than other display modes. If CPU usage is a concern, switch to Waveform or Radial mode.

### Phase Scope Mode

Displays a stereo phase correlation meter. This shows the relationship between the left and right output channels:
- A vertical line indicates mono (fully correlated) content.
- A horizontal line indicates fully out-of-phase content.
- A circular or diffuse pattern indicates wide, decorrelated stereo content.

This is useful for monitoring the stereo imaging impact of the spectral processing and Stereo Width control.

### Radial Mode

Displays a radial spectral visualization using the heptagonal geometry of the display region. Spectral energy is mapped radially from center to edge, providing an alternative frequency analysis view.

### Colormap Selection

Click the Colormap button to cycle through 16 color themes that affect the visualization displays and UI accents. Themes range from warm tones (Barong, Purpor) through cool palettes (Tiamat, Seijin) to metallic and grayscale schemes (Chrome, XodBone).

### Level Metering

The display is flanked by heptagonal ring-based level meters showing left and right channel output levels with peak cap indicators and smooth attack/decay envelope following.

---

## 14. Preset Management

![Close-up of the top control strip with callouts for power, colormap, preset list and save/delete.](gfx/Poltergeist_GUI_Global.png)
*Figure 11 — The top control strip: global and preset controls.*

### Loading Presets

Use the preset dropdown selector to browse and load presets. Factory presets are available immediately after first launch. Use the Previous and Next arrow buttons for quick browsing.

### Saving Presets

1. Adjust all parameters to your desired settings (including A/B captures if using morphing).
2. Click the **Save** button.
3. Enter a name for your preset.
4. The preset is saved to the user preset directory and appears in the preset selector.

### Deleting Presets

Select a user preset and click the **Delete** button to remove it. Factory presets cannot be deleted.

### What Gets Saved

A preset stores the complete plugin state:
- All 16 continuous parameter values
- Capture A and Capture B parameter snapshots
- Per-parameter morphing enable states (all 16 diamond switches)
- Tempo sync settings (Warp LFO, Ghost delay, Gate)
- LFO waveform selection
- Colormap selection

---

## 15. DAW Integration & Automation

### Parameter Automation

All continuous parameters are exposed to the DAW for automation. You can automate any parameter by using your DAW's standard automation workflow (write, read, touch, latch modes).

Key parameters for automation:
- **Crossfader (Parameter Warp)** — Automate the morph position for time-varying effects.
- **FX Mix** — Automate the wet/dry level for builds and transitions.
- **Ghost FX Formant** — Automate to bring the formant stage in and out.
- **Vowel** — Automate for sweeping vocalised transformations.
- **Ghost FX Bode** — Automate formant size / gender shift across a track.
- **Pitch Shift** — Automate for melodic pitch movement.

### Tempo Sync

When tempo sync is enabled for the Warp LFO, Ghost delay, or Gate, the respective module responds to the host DAW's BPM. Changes in tempo (including tempo automation) are followed automatically.

### Session Recall

Poltergeist saves and restores its complete state with your DAW session. All parameters, captures, morphing configuration, STFT mode, and display settings are recalled when you reopen a project.

### Latency Reporting

Poltergeist correctly reports its processing latency to the DAW for automatic delay compensation. The latency depends on the STFT mode:
- **HI-RES**: 1024 samples (~21.3 ms at 48 kHz)
- **LO-LAT**: 512 samples (~10.7 ms at 48 kHz)

---

## 16. Performance & CPU Usage

### CPU Considerations

Poltergeist performs significant real-time spectral processing. The primary CPU consumers are:

1. **STFT Processing** — The FFT analysis/synthesis and spectral effects chain. This scales with sample rate and FFT size.
2. **Ghost Delay Feedback** — The spectral frame buffer and feedback FX processing.
3. **GUI Rendering** — The visualization display, particularly 3D Spectrum mode.

### Optimization Tips

- **Close the GUI** when not actively editing parameters. DSP processing continues, but GUI rendering stops.
- **Use Waveform or Radial display** instead of 3D Spectrum for lower CPU rendering cost.
- **Use LO-LAT mode** if the higher frequency resolution of HI-RES is not needed. The smaller FFT reduces per-frame computation.
- **SIMD acceleration** is active automatically on supported hardware (SSE3 on Intel/AMD, NEON on Apple Silicon/ARM).
- **Higher buffer sizes** in your DAW reduce per-block overhead. If CPU is tight, try increasing your audio buffer from 128 to 256 or 512 samples.

---

## 17. Parameter Reference

All entries below are taken directly from `createParameterLayout()` in
`PluginProcessor.cpp`. The **ID** column is the automation ID your DAW sees.

| Parameter | ID | Range | Default |
|-----------|-----|-------|---------|
| **Bypass** | `bypass` | Off / On | Off |
| **Mix** | `fxMix` | 0.0 - 1.0 | 0.5 |
| **Pitch Shift** | `pitchShift` | -1.0 - +1.0 | 0.0 |
| **Wavefold** | `wavefold` | 0.0 - 1.0 | 0.0 |
| **Mutate Char** | `mutateChar` | 0.0 - 1.0 | 0.5 |
| **Mutate Algorithm** | `mutateAlgo` | Baseline / HardFold / PhaseWarp / PhScram / SelfMult / Buchla | Baseline |
| **Comb Freq** | `combFreq` | 0.0 - 1.0 | 0.0 |
| **Comb Reso** | `combReso` | 0.0 - 1.0 | 0.6 |
| **Character** | `combDamp` | 0.0 - 1.0 | 0.5 |
| **Ghost Time** | `ghostDelayTime` | 0.0 - 1.0 | 0.25 |
| **Ghost Mix** | `ghostDelayMix` | 0.0 - 1.0 | 0.5 |
| **Ghost FB** | `ghostDelayFB` | 0.0 - 1.0 | 0.0 |
| **Ghost Tempo Sync** | `ghostTempoSync` | 0 / 1 | 0 |
| **Delay Trigger Mode** | `dlyTriggerMode` | 0 / 1 | 0 |
| **Ghost FX Formant** | `ghostFXFormant` | 0.0 - 1.0 | 0.0 |
| **Vowel** | `formantVowel` | 0.0 - 1.0 | 0.5 |
| **Ghost FX Cascade** | `ghostFXCascade` | 0.0 - 1.0 | 0.0 |
| **Ghost FX Depth** | `formantReso` | 0.0 - 1.0 | 0.0 |
| **Ghost FX Bode** | `formantSize` | 0.0 - 1.0 | 0.5 |
| **Stereo Width** | `stereoWidth` | 0.0 - 1.0 | 0.0 |
| **Param Warp** | `paramWarp` | 0.0 - 1.0 | 0.0 |
| **Capture A** | `captureAToggle` | Off / On | Off |
| **Capture B** | `captureBToggle` | Off / On | Off |
| **Warp LFO Freq** | `warpLfoFreq` | 0.05 - 5.0 Hz | 0.5 Hz |
| **Warp LFO Amount** | `warpLfoAmount` | 0.0 - 1.0 | 0.0 |
| **Warp LFO Waveform** | `warpLfoWaveform` | 0 - 6 (Sine / Tri / Saw+ / Saw- / Square / Random / S&H) | Sine |
| **Tempo Sync Mode** | `tempoSyncMode` | 0 - 2 (Free / Cycle / Quant) | Free |
| **Quant Division** | `quantSyncDivision` | 0 - 8 | 0 |
| **Colormap Index** | `colormapIndex` | 0 - (colormap count - 1) | 0 |

---

## Support

For support, feature requests, and updates, visit **Chrome Sphynx Audio**.

---

*Poltergeist — where sound becomes spectral.*

**Chrome Sphynx Audio** — *All your bass are belong to us*
