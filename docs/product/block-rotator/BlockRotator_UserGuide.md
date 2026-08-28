<!-- doc-version: 1.2 | source: XodBlockRotator_PLUGX/docs/BlockRotator_UserGuide.md -->
# Block Rotator — User Guide

### Chrome Sphynx Audio

#### *All your bass are belong to us*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Installation](#2-installation)
3. [Interface Overview](#3-interface-overview)
4. [The 8-Channel Diffusion Feedback Network](#4-the-8-channel-diffusion-feedback-network)
5. [Mix Controls](#5-mix-controls)
6. [Reverb Core](#6-reverb-core)
7. [Chime Resonator](#7-chime-resonator)
8. [Diffusion Matrix](#8-diffusion-matrix)
9. [Early Reflections](#9-early-reflections)
10. [Modulation (SSB)](#10-modulation-ssb)
11. [Filter](#11-filter)
12. [Capture A/B Warp Crossfader](#12-capture-ab-warp-crossfader)
13. [Visualization Display](#13-visualization-display)
14. [Global Controls & Preset Management](#14-global-controls--preset-management)
15. [DAW Integration & Automation](#15-daw-integration--automation)
16. [Performance & CPU Usage](#16-performance--cpu-usage)
17. [Parameter Reference](#17-parameter-reference)

---

## 1. Introduction

BlockRotator is a unique effect processor based around a Multi-Channel Delay Feedback Network.

This effect is meant to be versatile, and will produce short dense resonant effects good for percussive or stacatto notes, or, long dramatic heavily modulated reverberations and cascading tail effects.

The effect is a configurable combination of several DSP techniques that combine internally in a unique 'Circuit Bent' way to produce a wide range of sonic results. The User Interface is designed to allow the user to easily fade in/out these different features.

The key features are:

- Stereo-to-MultiChannel up-conversion (8-Channel Analytic internal processing)
- Diffusion+Reverb
- Single Side-Band (SSB) Modulation
- 8x8 Selectable Matrix Operations (10 algorithms)
- Early Reflections
- Chime resonator
- Multi-Mode Filtering
- Capture A/B Warp Crossfader + LFO modulation

### Usage Notes

The Matrix Operations can be enabled/disabled. There are 10 different algorithms to choose from. These operations can be very subtle or more dramatic depending on the amount of saturation that exists in the Feedback loop. Experimentation is encouraged.

The SSB pitch up/down cascade effect is also intertwined with whatever is currently being fed through the feedback loop. Because the modulation sits inside that loop, every pass is pitch-shifted again, so successive reflections stack into a cascade rather than a single fixed detune. For the most dramatic cascading pitch effect, use 100% Wet Mix, heavier reverb settings, Matrix Mix off, Mod Depth (**CASCADE**) at 100%, and slower Mod Frequency settings.

The State Variable Filter, when turned up, has a variable mode, from Lowpass->Bandpass->Highpass. The filter will affect the both direct output plus the feedback path.

The Capture A/B Warp Crossfader is my solution for creating plugin-state automations, or 'warps'. This automation concept works by First: enable the desired Faders to be automated, second: Capture the A state (Start Fader positions), Third: Capture the B state (End Fader positions). This simple process turns on the Crossfader, which will then warp from State A to State B, allowing for either direct manual control of the Crossfader, or LFO modulation, or, HOST automation.

The dedicated Crossfader LFO is also only enabled when the Capture A/B is active. The LFO can be free running, or tempo synced. Several LFO waveform shapes are available. The small indicator at the bottom of the crossfader is used to drag the LFO center swing position to the desired location.

There are several Selectable Background Visualizations that provide some visual feedback, plus some automatic overlays for the filter response curve, and SSB modulation frequency. The background visualizations are selectable by clicking the top-center graphic.

### FYI Tech Notes

A great deal of attention has been devoted to maintaining a consistent 'playable' output, so the goal is to minimize Sonic Dead Zones. In other words, no matter how the knobs are turned, the output should be musically useful.

Because this style of feedback architecture is inherently unstable, internally, and sophisticated Feedback Hunt&Destroy circuit is working constantly behind the scenes to automatically detect and suppress feedback. Despite this, using heavy reverb settings and certain combinations can still produce heavy resonating feedback at the output. This is intentional, to allow for mass chaos at the extremes.

The individual features are deliberately not isolated from one another. The reverb, Matrix Operations, SSB modulation, early reflections and filter all share the same feedback path, so each one changes how the others behave. That co-dependence is the point — it is what produces the 'Circuit Bent' character, and it means the result of any given knob combination is intentionally only partly predictable. The Feedback Hunt&Destroy circuit is what keeps that unpredictability from running away. The design target is a **semi-chaotic** effect that nonetheless stays inside the bounds of musically useful output: surprising, but not out of control.

This effect takes advantage of processing in the Analytic Domain (In-phase + Quadrature), othewise known as the Complex Domain. The entire processing path maintains phase coherency around the feedback path. This type of processing allows for many subtle internal manipulations involving phase rotations, Matrix Operations, and other tricks that would normally not be accessible. This is done behind the scenes, and does not impact the User Controls.

### Signal Flow Overview

```
Stereo Input
    │
    ▼
┌──────────────────────┐
│  Input Conditioning   │  Signal preparation and diffusion
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  8-Channel Diffusion  │  Multi-channel feedback network with:
│  Feedback Network     │  • Diffusion Matrix transformation
│                       │  • SSB modulation
│                       │  • Feedback control and damping
│                       │  • Parallel early reflections
│                       │  • Parallel auxiliary reverb
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Resonant Filter      │  Multi-mode tonal shaping
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Output Limiter       │  Look-ahead protection
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Dry / Wet Mix        │  Final output balance
└──────────┬───────────┘
           ▼
      Stereo Output
```

---

## 2. Installation

### Plugin Files

Copy `BlockRotator.vst3` to the appropriate directory:

| Platform | VST3 Directory |
|----------|---------------|
| **macOS** | `~/Library/Audio/Plug-Ins/VST3/` |
| **Windows** | `C:\Program Files\Common Files\VST3\` |
| **Linux** | `~/.vst3/` |

### Factory Presets

Factory presets are installed automatically to the user configuration directory on first launch:

| Platform | Preset Directory |
|----------|-----------------|
| **macOS** | `~/Library/Application Support/XODMK/BlockRotator/factory/` |
| **Windows** | `%APPDATA%\XODMK\BlockRotator\factory\` |
| **Linux** | `~/.config/XODMK/BlockRotator/factory/` |

User presets are stored in a `user/` subdirectory alongside the factory presets.

### DAW Setup

After placing the plugin file, restart your DAW or trigger a plugin rescan. Insert Block Rotator as a stereo effect (insert or send) on any audio track or bus.

---

## 3. Interface Overview

The Block Rotator interface is a radial layout: a central heptagonal (seven-sided) visualizer with controls arranged around it, a global control strip across the top, and the morphing controls running along the bottom.

![Annotated view of the Block Rotator interface, with labels naming each functional section of the control surface.](gfx/BlockRotator_GUI_Overview.png)
*Figure 1 — The control surface at a glance. Each section is detailed, with its own close-up figure, in the chapters that follow.*

### Functional Groups

The controls are organized into ten functional groups. The remainder of this guide is structured around these groups.

| Group | Purpose |
|-------|---------|
| **Global** | Power/bypass and preset management. |
| **Mix** | Dry and wet output balance. |
| **Reverb Core** | The fundamental size, decay, and density of the reverb. |
| **Chime Resonator** | The chime resonator level and its damping. |
| **Diffusion Matrix** | Algorithm bank, algorithm selection, transformation intensity, and matrix engage. |
| **Early Reflections** | Level and timing of the initial spatial reflections. |
| **Modulation (SSB)** | Single-sideband modulation applied inside the feedback network. |
| **Filter** | Resonant multi-mode tonal shaping of the wet signal. |
| **Morph / Warp** | A/B capture, crossfader, and the automatic Warp LFO. |
| **Display** | Visualization mode, color theme, and the routing display. |

### Top Control Strip

A slim strip across the top of the interface holds the global controls, arranged left to right:

- **Power Button** — Bypasses all DSP processing.
- **Colormap Button** — Cycles the visualization color theme.
- **Previous / Next Preset** — Step backward and forward through the preset list.
- **Preset Selector** — Drop-down list for loading presets.
- **Save Preset** — Stores the current state as a user preset.
- **Delete Preset** — Removes the selected user preset.

### Central Visualizer

The heptagonal display at the center of the interface shows a real-time visualization of the audio. A circular **Display Mode** button directly above it cycles the visualization mode. The algorithm bank toggle, Matrix Mix toggle, and the pentagon algorithm selector sit above and to the upper right of the visualizer.

### Surrounding Controls

The Mix, Reverb Core, Chime Resonator, Early Reflections, Modulation, and Filter controls are distributed radially around the central visualizer as knobs and arc sliders.

### Morphing Section

The morphing controls run along the bottom of the interface: the Param Warp crossfader at center, the Capture A and Capture B buttons flanking it, the Warp LFO controls below, and the tempo-sync and waveform buttons near the lower edge of the visualizer.

---

## 4. The 8-Channel Diffusion Feedback Network

At the heart of Block Rotator is an 8-channel diffusion delay feedback network (FDN). Unlike conventional stereo reverbs that process two channels, Block Rotator distributes the input signal across eight parallel delay channels. These channels are continuously cross-fed through spatial matrix transformations and recirculated through the feedback network.

This multi-channel topology is what gives Block Rotator its characteristic depth, density, and three-dimensional spatial quality. The eight channels provide the foundation for the ten spatial algorithms, the SSB modulation, the parallel early reflections, and the auxiliary reverb — all of which operate within or alongside this network.

---

## 5. Mix Controls

The Mix controls set the final balance between the unprocessed input and the processed reverb at the plugin output.

![Close-up of the Dry Mix and Wet Mix knobs with callouts.](gfx/BlockRotator_GUI_Mix.png)
*Figure 2 — Mix controls, upper left of the interface.*

### Dry Mix

**Range**: 0.0 – 1.0  
**Default**: 0.58

Controls the level of the unprocessed input signal at the output. At 1.0 the original signal passes at full level; at 0.0 it is silenced and only the processed signal is heard.

### Wet Mix

**Range**: 0.0 – 1.0  
**Default**: 0.66

Controls the level of the processed signal at the output. Use in combination with Dry Mix to set the dry/wet balance.

**Tip**: For a send/return configuration, set Dry Mix to 0.0 and Wet Mix to 1.0, then control the reverb amount with your DAW's send level.

---

## 6. Reverb Core

The Reverb Core controls shape the fundamental size, decay, and density of the reverb network.

![Close-up of the Roomsize, Rev Time and Density knobs with callouts.](gfx/BlockRotator_GUI_ReverbCore.png)
*Figure 3 — Reverb Core controls, down the left side.*

### Room Size

**Range**: 3 – 750 ms  
**Default**: 66.8 ms

Scales the base delay times of the feedback network, analogous to the physical dimensions of a reverberant space. Smaller values produce tight, intimate spaces; larger values create vast, cavernous environments. Room Size also changes how each Diffusion Matrix algorithm sounds — the same algorithm behaves very differently at small versus large settings.

### Max Reverb Time

**Range**: 0.0 – 1.0  
**Default**: 0.68

Sets the maximum decay length of the reverb tail. Higher values lengthen the tail; lower values produce shorter, more controlled decays.

**Note**: The actual reverb time depends on the combined settings of multiple parameter sliders and which features are currently active in the processing path. Max Reverb Time sets a ceiling rather than an exact decay time.

### Density

**Range**: 0.0 – 0.99  
**Default**: 0.57

Controls the diffusion density of the reverb network — how tightly packed the individual reflections are. At low values the reverb is sparse, open, and grainy. As Density increases, reflections become thicker and more tightly packed, producing a smooth, continuous tail.

---

## 7. Chime Resonator

The Chime Resonator runs in parallel with the main 8-channel feedback network, adding a resonant chime layer on top of the processed signal. Its damping control is labelled **Aux Rev Damp** on screen, a legacy label retained in the GUI.

![Close-up of the Chime and Damping arc sliders with callouts.](gfx/BlockRotator_GUI_Chime.png)
*Figure 4 — Chime Resonator: the Chime and Damping arc sliders.*

### Chime

**Range**: 0.0 – 1.0  
**Default**: 0.84

Sets the blend level of the auxiliary parallel reverb path into the wet signal. At 0.0 the aux layer is inactive; higher values bring more of the parallel reverb into the output.

### Damp

**Range**: 0.0 – 1.0  
**Default**: 0.91

High-frequency damping applied to the auxiliary reverb path. Higher values progressively roll off the high frequencies, producing a darker, warmer parallel reverb. Lower values keep the aux layer bright and present.

---

## 8. Diffusion Matrix

Block Rotator's defining feature is its Diffusion Matrix processor, which determines how audio is routed, transformed, and mixed within the multi-channel feedback network. The algorithms are organized into two banks. The algorithms are not simple rotations — they are more complex matrix transformations that scatter, mutate, and spatially move the signal.

![Close-up of the pentagon algorithm selector, bank switch, matrix enable and MX Rot knob with callouts.](gfx/BlockRotator_GUI_Matrix.png)
*Figure 5 — Diffusion Matrix controls, upper right of the interface.*

### Matrix Bank

A toggle selects which of the two algorithm banks the pentagon selector draws from:

- **anteChamber** — Diffusion-oriented algorithms. These emphasize spectral transformation, scattering and mutating the frequency content of the reverb.
- **innerChamber** — Orbit-oriented algorithms. These emphasize spatial movement, creating the sensation of sound orbiting, spiraling, or physically moving through space.

### Matrix Algorithm

The pentagon-shaped selector cycles through the five algorithms in the currently active bank. Each algorithm is displayed on the interface as a **symbol glyph**, not its internal name. The symbol-to-name correspondence is given below.

Switching algorithms produces an immediate change in reverb character — there is no crossfade between algorithms, so transitions may be audible. Use the morphing system or DAW automation for smoother transitions.

#### anteChamber Bank — Diffusion Algorithms

| Symbol | Internal Name | Character |
|:------:|---------------|-----------|
| ☉ | **Cyclops** | Dense spectral wash with even energy distribution. A versatile starting point for lush, enveloping reverbs. |
| ☿ | **Apshai** | Resonant cascading behavior. Creates ringing, tuned qualities within the reverb tail. |
| ● | **EyeDescent** | Deep frequency scattering. Separates and redistributes spectral energy across the stereo field. |
| ⊕ | **Scarab** | Textured harmonic diffusion with a granular quality. Adds complexity and grit to the tail. |
| ☽ | **DeathIbis** | Complex phase mutations producing unpredictable, evolving spectral patterns. The most extreme diffusion algorithm. |

#### innerChamber Bank — Orbit Algorithms

| Symbol | Internal Name | Character |
|:------:|---------------|-----------|
| ♃ | **BlockRotate** | Classic spatial orbiting. Sound rotates smoothly around the stereo field. The most predictable rotation algorithm. |
| ♄ | **Schistdisc** | Phase-modulated spatial movement. Creates irregular, organic motion patterns. |
| ♂ | **BloodLoom** | Dual-rate spatial weaving. Two independent motion rates interleave, producing complex movement. |
| ♀ | **Sekhmetal** | Rhythmic spatial breathing. Movement pulses with an organic, breath-like quality. |
| ✷ | **Uncoiling** | Glacial tectonic shifts. Very slow, massive-scale spatial evolution. Best suited to long reverb times and ambient work. |

### Block Rotation

**Range**: −1.0 to +1.0  
**Default**: −0.25

Controls the speed and intensity of the spatial transformations applied by the active Matrix Algorithm. Near zero, the transformation is relatively static; as the magnitude increases, the spatial movement or spectral mutation becomes more pronounced and rapid. The control is bipolar — the sign sets the direction of the transformation and the magnitude sets its intensity.

### Matrix Mix

**Range**: Off / On  
**Default**: Off

A binary toggle that engages the selected mixing-matrix transform in the feedback path. When off, the network runs without the matrix transformation. When on, the active algorithm shapes the signal routing.

---

## 9. Early Reflections

The early reflections (ER) engine operates in parallel with the main reverb network, providing the initial spatial cues that define the perception of a physical space.

![Close-up of the Echotime knob and Echomix arc slider with callouts.](gfx/BlockRotator_GUI_EarlyReflections.png)
*Figure 6 — Early Reflections: Echotime and Echomix.*

### ER Inject

**Range**: 0.0 – 1.0  
**Default**: 0.33

Controls the level at which early reflections are mixed into the output. At 0.0 no early reflections are heard. Increase to add definition and a sense of room geometry alongside the diffuse reverb tail.

### ER Delay Time

**Range**: 5 – 300 ms  
**Default**: 84 ms

Sets the delay time of the early reflection tap points. Short values (5–30 ms) produce a tight, close-sounding room. Longer values (100–300 ms) create a sense of large physical distance between listener and reflective surfaces.

**Usage Tip**: Early reflections work best as a complement to the main reverb. Use moderate ER Inject (0.2–0.5) with short ER Delay Time (15–50 ms) to add presence and clarity to a diffuse tail. For special effects, try long ER Delay Time with high ER Inject for distinct echo-like reflections.

---

## 10. Modulation (SSB)

Block Rotator features an SSB (Single-Sideband) modulation engine that operates directly within the reverb feedback network. Because the modulation is applied inside the feedback loop, each successive reflection is modulated again, creating accumulating spectral drift in the reverb tail. The result is a reverb that doesn't just decay — it evolves, shimmers, and drifts over time.

![Close-up of the Mod Freq knob, Cascade arc slider and SSB mode switch with callouts.](gfx/BlockRotator_GUI_Modulation.png)
*Figure 7 — SSB Modulation controls, right side of the interface.*

### Mod Frequency

**Range**: −500 to +500 Hz  
**Default**: −86.5 Hz

Sets the SSB modulation frequency — the frequency, in hertz, of the single-sideband modulation applied to the signal inside the feedback network. Negative and positive values shift the spectrum in opposite directions. Small magnitudes produce subtle drift and detuning; larger magnitudes produce dramatic spectral movement and inharmonic transformation.

### Mod Depth

**Range**: 0.0 – 1.0  
**Default**: 1.0

Controls the intensity of the SSB modulation applied to the reverb reflections. At 0.0 no modulation occurs. At low values a subtle shimmer or detuning is applied; higher values produce increasingly pronounced spectral movement and cascading drift through the tail.

**Why the knob is labelled CASCADE**: the SSB modulation sits *inside* the feedback loop, so every pass through the network is pitch-shifted again. Successive reflections stack into a cascading pitch-shift rather than a single fixed detune. How far the cascade develops depends on the reverb settings, the dry/wet balance, and whether the Diffusion Matrix is engaged. When the matrix is engaged its effect on the shifted partials is subtle and varies with the selected algorithm and with the overall balance of the other enabled features — which is why the recipe below starts with Matrix Mix off.

**Usage Tip — maximum cascade**: The most dramatic cascading pitch-shift is reached with Wet Mix at 100%, heavier reverb settings, Matrix Mix off, Mod Depth at 100%, and slower Mod Frequency settings.

### SSB Mode

**Range**: Smooth / Beat  
**Default**: Smooth

Selects which of two flavours the SSB modulation takes as Mod Depth is raised. The switch is labelled **SMOOTH** / **BEAT** on the interface, to the right of the Mod Freq knob.

- **Smooth** — Raising Mod Depth produces a gradual, linear-sounding intensification of the modulation effect, without the pulsing described below.
- **Beat** — The modulated and unmodulated signals are deliberately allowed to interfere. The resulting constructive and destructive interference tends to produce **frequency beating**: a pulsating, sinusoidal drop-out that periodically attenuates the output. It is most pronounced at mid Mod Depth settings. The **rate** of that pulsing is a function of Mod Frequency, so the Mod Freq knob sets how fast the drop-out oscillates while Mod Depth sets how deep it cuts.

Smooth exists so that this pulsing can be avoided when you want the modulation to swell evenly; Beat keeps it available as a rhythmic effect in its own right.

**Note**: SSB Mode is a topology switch rather than a continuous control. It is not exposed to host automation and does not take part in A/B morphing.

---

## 11. Filter

A resonant multi-mode filter processes the reverb output, allowing you to shape the tonal character of the wet signal.

![Close-up of the four filter knobs spanning the lower interface, with callouts.](gfx/BlockRotator_GUI_Filter.png)
*Figure 8 — Filter controls, spread across the lower interface.*

### Filter Cutoff

**Range**: 20 – 16,000 Hz  
**Default**: ≈ 3.4 kHz

Sets the filter frequency. The control uses exponential (logarithmic) frequency scaling, so equal slider movement corresponds to an equal change in octaves.

### Filter Q

**Range**: 0.1 – 2.3  
**Default**: 1.0

Controls the resonance peak at the cutoff frequency. Low Q values produce a gentle, broad response; higher Q values create a pronounced resonant peak with added emphasis at the cutoff.

### Filter Mix

**Range**: 0.0 – 1.0  
**Default**: 0.76

Blends between the unfiltered and filtered signal. At 0.0 the filter has no effect; at 1.0 only the filtered signal is heard. Intermediate values allow parallel blending.

### Filter Mode

**Range**: 0.0 – 1.0  
**Default**: 0.0

Continuously morphs the filter response between three types: **lowpass** at 0.0, **bandpass** at 0.5, and **highpass** at 1.0. Intermediate values crossfade smoothly between adjacent types.

**Usage Tip**: The filter is particularly effective with the morphing system. Capture one state with a high cutoff and another with a low cutoff, then morph between them for automated filter sweeps synchronized to the reverb.

---

## 12. Capture A/B Warp Crossfader

The parameter morphing crossfader is one of Block Rotator's most powerful features. It allows you to capture two complete parameter snapshots and smoothly interpolate between them, creating evolving, time-varying effects. The crossfader includes a dedicated LFO with seven waveforms and host tempo sync for fully automated morphing.

![Close-up of the Param Warp crossfader, capture pentagons, tempo sync buttons and LFO knobs, with callouts.](gfx/BlockRotator_GUI_Morph.png)
*Figure 9 — Morph and Warp controls along the bottom edge.*

### How It Works

1. **Set up State A** — Adjust parameters to your desired starting state.
2. **Press Capture A** — Snapshots the current values of all morphable parameters.
3. **Set up State B** — Adjust parameters to a contrasting state.
4. **Press Capture B** — Snapshots the second state.
5. **Use the Crossfader** — Move it to blend between State A (left) and State B (right).

The Capture A and Capture B controls are the pentagon-shaped buttons flanking the crossfader.

### The Crossfader and Swing Point

The crossfader is a horizontal slider that blends between Capture A and Capture B. It carries a built-in **Swing Point** — a diamond marker that is part of the crossfader itself, showing the center point around which the Warp LFO oscillates. The manual crossfader position sets the Swing Point; the Warp LFO then sweeps around it.

### Per-Parameter Enable

Each morphable parameter has a small A/B enable toggle. When enabled, that parameter responds to the crossfader; when disabled, it stays at its current manual setting regardless of crossfader position. This allows precise control over which aspects of the sound morph — for example, morphing Room Size and Density while keeping Filter and Max Reverb Time fixed.

#### Morphable Parameters

The continuous parameters support A/B morphing: Dry Mix, Wet Mix, Room Size, Reverb Time, Density, Chime, Aux Rev Damp, Matrix Rot, ER Inject, ER Delay Time, Mod Frequency, Mod Depth, Filter Cutoff, Filter Q, Filter Mix, and Filter Mode.

**Note**: Discrete and topology controls — the Matrix Bank, Matrix Algorithm, Matrix Mix, SSB Mode, Tempo Sync mode, and Warp LFO Waveform — do not participate in morphing.

### Warp LFO (Automatic Morphing)

The crossfader can be modulated automatically by a dedicated LFO.

#### Warp LFO Freq

**Range**: 0.05 – 5.0 Hz  
**Default**: 0.5 Hz

Sets the rate of the automatic crossfader modulation.

#### Warp LFO Amount

**Range**: 0.0 – 1.0  
**Default**: 0.0

Sets the depth of the automatic crossfader modulation. At 0.0 the crossfader stays at its manual position (the Swing Point). At 1.0 the LFO sweeps the full crossfader range around the Swing Point.

#### Warp LFO Waveform

Selects the LFO shape that drives the morphing motion:

| Waveform | Effect |
|----------|--------|
| **Sine** | Smooth, symmetrical sweep between A and B. The most natural morphing motion. |
| **Triangle** | Linear sweep with a sharper turnaround than sine. |
| **Saw+** | Rising sawtooth. Ramps from A toward B and resets — a repeating build-up. |
| **Saw−** | Falling sawtooth. Ramps from B toward A and resets — a repeating wind-down. |
| **Square** | Alternates between the A and B states — rhythmic switching. |
| **Random** | Randomized crossfader position — unpredictable, chaotic movement. |
| **S&H** | Sample & hold. Steps to random positions at the LFO rate — stepped, glitchy jumps. |

### Tempo Sync

The Warp LFO can be locked to the host DAW's tempo. Three sync modes are available:

- **Free** — The LFO runs at the rate set by Warp LFO Freq, independent of host tempo.
- **Cycle** — The LFO resets at note-division boundaries, maintaining phase coherence with the song position.
- **Quant** — The LFO frequency is locked to a musical note division.

The note division used by Cycle and Quant modes can be set across nine values, from a whole note (1/1) down to a sixteenth (1/16), including dotted variants.

### Creative Applications

- **Evolving Pads** — Capture a bright, short reverb as A and a dark, long reverb as B. Use a slow Sine Warp LFO for breathing, evolving textures.
- **Build / Drop Effects** — Capture a subtle effect as A and an extreme setting as B. Automate the crossfader for dramatic transitions.
- **Rhythmic Morphing** — Use Quant tempo sync with Square or S&H waveforms for rhythmic parameter variations locked to your track.
- **Live Performance** — Map the crossfader to a MIDI controller for real-time morphing during performance.

---

## 13. Visualization Display

Block Rotator provides five real-time visualization modes displayed in the central heptagonal (seven-sided) display region. The circular **Display Mode** button directly above the visualizer cycles through the modes.

![Close-up of the display mode button and the heptagonal visualizer, with callouts.](gfx/BlockRotator_GUI_Display.png)
*Figure 10 — The Display Mode button and heptagonal visualizer.*

### Display Modes

- **Smooth Spectrum** *(default)* — A smooth, contoured spectral envelope of the output signal.
- **Spectrum** — A 2D FFT frequency analysis shown as color-coded vertical bars; low frequencies on the left, high on the right.
- **Waveform** — A real-time oscilloscope-style trace of the output, useful for observing transients and dynamic character.
- **3D Spectrum** — An animated three-dimensional spectral surface that rotates in space.
- **Phase Meter** — A stereo phase correlation display showing the relationship between the left and right output channels.

**Note**: 3D Spectrum mode requires more CPU for rendering than the other modes. If CPU usage is a concern, switch to Smooth Spectrum, Spectrum, or Waveform mode.

### Display Overlays

The visualizer also renders overlay layers on top of the active background mode: a frequency-axis reference, the current filter response curve (its visibility follows the Filter Mix control), and the modulation waveform (its visibility follows Mod Depth).

### Colormap Selection

The Colormap button in the top control strip cycles through **13 color themes** that affect all visualization modes and the routing display.

### Matrix Display

A routing display shows the current state of the internal mixing matrix as an 8×8 grid, giving visual feedback on how the active algorithm is transforming the signal routing. The matrix algorithm symbols correspond to the internal algorithm names as follows:

#### anteChamber Bank — Diffusion Algorithms

| Symbol | Internal Name |
|:------:|---------------|
| ☉ | Cyclops |
| ☿ | Apshai |
| ● | EyeDescent |
| ⊕ | Scarab |
| ☽ | DeathIbis |

#### innerChamber Bank — Orbit Algorithms

| Symbol | Internal Name |
|:------:|---------------|
| ♃ | BlockRotate |
| ♄ | Schistdisc |
| ♂ | BloodLoom |
| ♀ | Sekhmetal |
| ✷ | Uncoiling |

---

## 14. Global Controls & Preset Management

![Close-up of the top control strip with callouts for power, colormap, preset list and save/delete.](gfx/BlockRotator_GUI_Global.png)
*Figure 11 — The top control strip: global and preset controls.*

### Power

The Power button bypasses all DSP processing. When bypassed, audio passes through the plugin unprocessed.

### Loading Presets

Use the preset drop-down selector to browse and load presets. Factory presets are available immediately after first launch. Use the Previous (←) and Next (→) buttons for quick browsing.

### Saving Presets

1. Adjust all parameters to your desired settings (including A/B captures if using morphing).
2. Click the **Save** button.
3. Enter a name for your preset.
4. The preset is saved to the user preset directory and appears in the preset selector.

### Deleting Presets

Select a user preset and click the **Delete** button to remove it. Factory presets cannot be deleted.

### What Gets Saved

A preset stores the complete plugin state:

- All parameter values (mix, reverb core, aux reverb, matrix, ER, modulation, filter)
- Capture A and Capture B parameter snapshots
- Per-parameter morphing enable states
- Tempo sync settings
- Colormap and display-mode selection

---

## 15. DAW Integration & Automation

### Parameter Automation

All continuous parameters are exposed to the DAW for automation using your DAW's standard automation workflow (write, read, touch, latch).

Key parameters for automation:

- **Param Warp** — Automate the morph position for time-varying effects.
- **Wet Mix** — Automate reverb level for builds and transitions.
- **Room Size** — Automate for evolving spatial character.
- **Mod Depth** — Bring modulation in and out over the course of a track.
- **Filter Cutoff** — Automate for filter sweep effects.

### Tempo Sync

When the Warp LFO is in Cycle or Quant mode, it responds to the host DAW's BPM. Tempo changes — including tempo automation — are followed automatically.

### Session Recall

Block Rotator saves and restores its complete state with your DAW session. All parameters, captures, morphing configuration, and display settings are recalled when you reopen a project.

---

## 16. Performance & CPU Usage

### CPU Considerations

Block Rotator performs significant real-time processing. The primary CPU consumers are:

1. **DSP Processing** — The multi-channel reverb network with modulation and matrix algorithms. This scales with sample rate.
2. **GUI Rendering** — The visualization display, particularly 3D Spectrum mode.

### Optimization Tips

- **Close the GUI** when not actively editing parameters. DSP processing continues, but GUI rendering stops.
- **Use a lighter display mode** — Smooth Spectrum, Spectrum, or Waveform — instead of 3D Spectrum to reduce rendering cost.
- **SIMD acceleration** is active automatically on supported hardware (SSE on Intel/AMD, NEON on Apple Silicon/ARM).
- **Higher buffer sizes** in your DAW reduce per-block overhead. If CPU is tight, try increasing your audio buffer from 128 to 256 or 512 samples.

---

## 17. Parameter Reference

| Parameter | Section | Range | Default |
|-----------|---------|-------|---------|
| **Power (Bypass)** | Global | Off / On | Off |
| **Dry Mix** | Mix | 0.0 – 1.0 | 0.58 |
| **Wet Mix** | Mix | 0.0 – 1.0 | 0.66 |
| **Room Size** | Reverb Core | 3 – 750 ms | 66.8 ms |
| **Reverb Time** | Reverb Core | 0.0 – 1.0 (normalized) | 0.68 |
| **Density** | Reverb Core | 0.0 – 0.99 | 0.57 |
| **Chime** | Chime Resonator | 0.0 – 1.0 | 0.84 |
| **Aux Rev Damp** | Chime Resonator | 0.0 – 1.0 | 0.91 |
| **Matrix Bank** | Diffusion Matrix | anteChamber / innerChamber | anteChamber |
| **Matrix Algorithm** | Diffusion Matrix | 0 – 4 (5 slots; shown as symbols) | 4 |
| **Matrix Rot** | Diffusion Matrix | −1.0 to +1.0 | −0.25 |
| **Matrix Enable** | Diffusion Matrix | Off / On | Off |
| **ER Inject** | Early Reflections | 0.0 – 1.0 | 0.33 |
| **ER Delay Time** | Early Reflections | 5 – 300 ms | 84 ms |
| **Mod Frequency** | Modulation | −500 to +500 Hz | −86.5 Hz |
| **Mod Depth** | Modulation | 0.0 – 1.0 | 1.0 |
| **SSB Mode** | Modulation | Smooth / Beat | Smooth |
| **Filter Cutoff** | Filter | 20 – 16,000 Hz (exponential) | ≈ 3.4 kHz |
| **Filter Q** | Filter | 0.1 – 2.3 | 1.0 |
| **Filter Mix** | Filter | 0.0 – 1.0 | 0.76 |
| **Filter Mode** | Filter | 0.0 (LP) – 0.5 (BP) – 1.0 (HP) | 0.0 |
| **Param Warp** | Morph / Warp | 0.0 – 1.0 | 0.0 |
| **Capture A** | Morph / Warp | Trigger | — |
| **Capture B** | Morph / Warp | Trigger | — |
| **Warp LFO Freq** | Morph / Warp | 0.05 – 5.0 Hz | 0.5 Hz |
| **Warp LFO Amount** | Morph / Warp | 0.0 – 1.0 | 0.0 |
| **Warp LFO Waveform** | Morph / Warp | Sine / Tri / Saw+ / Saw− / Square / Random / S&H | Sine |
| **Tempo Sync Mode** | Morph / Warp | Free / Cycle / Quant | Free |
| **Quant Division** | Morph / Warp | 1/1 … 1/16 (incl. dotted) | 1/1 |
| **Display Mode** | Display | Smooth Spectrum / Spectrum / Waveform / 3D Spectrum / Phase Meter | Smooth Spectrum |
| **Colormap** | Display | 13 color themes | Theme 1 |

---

## Support

For support, feature requests, and updates, visit **Chrome Sphynx Audio**.

---

*Block Rotator — where reverb becomes rotation.*

**Chrome Sphynx Audio** — *All your bass are belong to us*
