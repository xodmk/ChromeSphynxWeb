<!-- doc-version: 1.2 | source: XodBlockRotator_PLUGX/docs/BlockRotator_QuickStart.md -->
# Block Rotator — Quick Start Guide

### Chrome Sphynx Audio

#### *All your bass are belong to us*

---

## The Interface at a Glance

![Annotated view of the Block Rotator interface, with labels naming each functional section of the control surface.](gfx/BlockRotator_GUI_Overview.png)
*The Block Rotator control surface. Each labelled section has a detailed close-up in the User Guide.*

## Overview

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

---

## Installation

1. Copy the `BlockRotator.vst3` file to your system's VST3 plugin directory:
   - **macOS**: `~/Library/Audio/Plug-Ins/VST3/`
   - **Windows**: `C:\Program Files\Common Files\VST3\`
   - **Linux**: `~/.vst3/`
2. Restart your DAW or rescan plugins.
3. Insert **Block Rotator** on a track or bus as a stereo effect.

Factory presets are installed automatically on first launch.

---

## Interface Overview

Block Rotator uses a radial layout: a central heptagonal (seven-sided) visualizer with controls arranged around it, a global strip across the top, and the morphing controls along the bottom.

```
┌─────────────────────────────────────────────────────────────┐
│  [Power] [Colormap]  [◄][►] [Preset ▼] [Save] [Delete]        │  Top strip
├─────────────────────────────────────────────────────────────┤
│   Mix · Reverb Core · Chime · Early Reflections              │
│   Modulation · Filter   — knobs arranged around the display   │
│                                                               │
│           ┌─────────────────────────┐    Diffusion Matrix     │
│           │   Central Visualizer    │    controls (bank,      │
│           │   (heptagonal display)  │    algorithm, mix)      │
│           └─────────────────────────┘    upper right          │
│                                                               │
│   [Capture A]  ◄── Param Warp Crossfader ──►  [Capture B]     │
│   Warp LFO controls · Tempo Sync · Waveform                   │  Bottom
└─────────────────────────────────────────────────────────────┘
```

The controls are organized into ten functional groups — Global, Mix, Reverb Core, Chime Resonator, Diffusion Matrix, Early Reflections, Modulation, Filter, Morph/Warp, and Display. See the full User Guide for complete details.

---

## Getting Sound in 60 Seconds

1. **Load the plugin** on an audio track with source material (vocals, synth, guitar, drums — anything works).

2. **Set your mix** — Turn **Dry Mix** to around 0.7 and **Wet Mix** to around 0.5 to hear both the original signal and the reverb.

3. **Dial in the reverb core**:
   - **Room Size**: Start around 100 ms for a medium room; push higher (toward 750 ms) for cavernous spaces.
   - **Max Reverb Time**: 0.4–0.7 is a good starting range for medium-to-long tails.
   - **Density**: Start at 0.3–0.5 for moderate richness.

4. **Choose an algorithm**:
   - Set the **Matrix Bank** to **anteChamber** for lush diffusion washes or **innerChamber** for spatial movement.
   - Engage **Matrix Mix** (the on/off toggle) so the algorithm is active in the feedback path.
   - Select one of the five algorithms with the pentagon selector — each is shown as a symbol glyph.
   - Adjust **Block Rotation** to taste — higher magnitudes increase the intensity of the spatial transformation.

5. **Hit play** and explore.

---

## Five Things to Try Next

### 1. Add SSB Modulation

Turn up **Mod Depth** to around 0.3 and set **Mod Frequency** to a small value — try around −40 Hz. The SSB modulation engine shifts the reverb tails in pitch from inside the feedback network. Small magnitudes produce subtle drift and detuning; larger magnitudes produce dramatic spectral movement and inharmonic transformation.

### 2. Inject Early Reflections

Bring up **ER Inject** to 0.3–0.5 and set **ER Delay Time** between 20–80 ms. This adds spatial definition and a sense of room dimension alongside the diffuse tail.

### 3. Shape with the Filter

Set **Filter Mix** to 0.5, **Filter Cutoff** around 2000 Hz, and **Filter Q** to 1.5. **Filter Mode** morphs continuously from lowpass (0.0) through bandpass (0.5) to highpass (1.0). Sweep the cutoff while playing to hear the effect.

### 4. Morph Between Two States

- Dial in a sound you like. Press **Capture A**.
- Change several parameters to create a contrasting sound. Press **Capture B**.
- Move the **Param Warp** crossfader to blend between the two captured states.
- Use the small A/B enable switches next to each parameter to choose which ones participate in the morph.

### 5. Automate the Morph

Set **Warp LFO Amount** above zero and adjust **Warp LFO Freq** to add automatic movement to the crossfader. Choose a **Waveform** shape (Sine for smooth sweeps, Saw+ for ramp-style morphs, S&H for stepped glitch effects). Use **Tempo Sync** to lock the morphing rhythm to your track with Free, Cycle, or Quant sync modes.

---

## Choosing Algorithms

The GUI displays each algorithm as a symbol. The two banks are selected by the Matrix Bank toggle.

| Bank | Symbol | Algorithm | Character |
|------|:------:|-----------|-----------|
| **anteChamber** | ☉ | Cyclops | Dense spectral wash |
| | ☿ | Apshai | Resonant cascade |
| | ● | EyeDescent | Deep frequency scattering |
| | ⊕ | Scarab | Textured harmonic diffusion |
| | ☽ | DeathIbis | Complex phase mutations |
| **innerChamber** | ♃ | BlockRotate | Classic spatial orbiting |
| | ♄ | Schistdisc | Phase-modulated movement |
| | ♂ | BloodLoom | Dual-rate spatial weaving |
| | ♀ | Sekhmetal | Rhythmic spatial breathing |
| | ✷ | Uncoiling | Slow tectonic shifts |

Start with **Cyclops** ☉ (anteChamber) or **BlockRotate** ♃ (innerChamber) to learn the basics, then explore from there.

---

## Display Modes

Click the circular Display Mode button above the visualizer to cycle through five modes:

1. **Smooth Spectrum** *(default)* — A smooth, contoured spectral envelope.
2. **Spectrum** — Frequency content as a color-coded bar graph.
3. **Waveform** — The audio waveform in real time.
4. **3D Spectrum** — An animated 3D spectral surface (note: uses more CPU).
5. **Phase Meter** — Stereo imaging and phase correlation.

Click the **Colormap** button to cycle through 13 visualization color themes.

---

## Tips

- **Start subtle, then push** — Block Rotator can go from natural room reverb to extreme spectral effects. Start with lower Density, Mod Depth, and Block Rotation values, then increase.
- **Use the bypass** — The Power button bypasses all processing. Toggle it to A/B your wet and dry sounds quickly.
- **Save presets often** — When you discover a sound you like, save it. The morphing system means small parameter changes can yield dramatically different results.
- **CPU management** — If CPU usage is a concern, use a lighter display mode (Smooth Spectrum, Spectrum, or Waveform) rather than 3D Spectrum, or close the plugin GUI when not actively tweaking.
- **Browse factory presets** — Use the Previous/Next buttons to quickly audition factory presets and learn how different parameter combinations interact.

---

*Chrome Sphynx Audio* — *All your bass are belong to us*
