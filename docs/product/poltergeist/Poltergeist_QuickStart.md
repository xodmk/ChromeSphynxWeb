<!-- doc-version: 1.2 | source: XodPoltergeist_PLUGX/docs/Poltergeist_QuickStart.md -->
# Poltergeist — Quick Start Guide

### Chrome Sphynx Audio

#### *All your bass are belong to us*

---

## The Interface at a Glance

![Annotated view of the Poltergeist interface, with labels naming each functional section of the control surface.](gfx/Poltergeist_GUI_Overview.png)
*The Poltergeist control surface. Each labelled section has a detailed close-up in the User Guide.*

## Overview

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

---

## Installation

1. Copy the `Poltergeist.vst3` file to your system's VST3 plugin directory:
   - **macOS**: `~/Library/Audio/Plug-Ins/VST3/`
   - **Windows**: `C:\Program Files\Common Files\VST3\`
   - **Linux**: `~/.vst3/`
2. Restart your DAW or rescan plugins.
3. Insert **Poltergeist** on a track or bus as a stereo effect.

Factory presets are installed automatically on first launch.

---

## Interface Overview

Poltergeist's interface is organized around a central heptagonal visualization display with controls arranged in a nine-leaf perimeter layout:

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Power]                                              [Preset Nav]  │
│                                                       [Save] [Del]  │
├──────────────────────────────────────────────────────────────────────┤
│              ┌───────────────────────┐                               │
│   Pitch      │                       │    Ghost Time                 │
│   Shift      │   Visualization       │    Ghost Mix                  │
│              │   Display             │    Ghost FB                   │
│   Spectral   │   (Wave / 3D /        │                               │
│   Warp       │    Phase / Radial)    │    Ghost FX Depth             │
│              │                       │    Ghost FX Depth             │
│   FX Mix     │                       │    Ghost FX Bode              │
│              └───────────────────────┘                               │
│   Comb Freq   Comb Reso   Character      Ghost FX Formant           │
│   Vowel   Ghost FX Cascade   Stereo Width   Wavefold                │
├──────────────────────────────────────────────────────────────────────┤
│  [Capture A]  ═══════ Crossfader ═══════  [Capture B]               │
│  Warp LFO Freq   Warp LFO Amount   [Sync] [Wave]                   │
│  A/B diamond switches per parameter                                 │
│  [HI-RES/LO-LAT]  [DRY COMP]  [Display Mode]  [Colormap]          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Getting Sound in 60 Seconds

1. **Load the plugin** on an audio track with source material (vocals, synth, guitar, pads — anything works).

2. **Set your mix** — Turn the **FX Mix** knob to around 0.5 to hear an equal blend of the original signal and the spectral processing.

3. **Explore pitch shifting**:
   - Turn the **Pitch Shift** knob away from center. Left shifts down, right shifts up (up to one octave in either direction).
   - Return to center (0) for no pitch change.

4. **Add spectral warp/shift**:
   - Turn up **Ghost FX Formant** to engage the formant stage, then sweep **Vowel** to move through the vowel set.
   - **Ghost FX Bode** shifts formant size / gender; 0.5 is neutral. **Ghost FX Depth** sharpens the resonant peaks.

5. **Hit play** and explore.

---

## Five Things to Try Next

### 1. Create Ghost Delay Echoes

Turn up **Ghost Mix** to around 0.5, set **Ghost Time** to 0.3–0.5, and bring **Ghost FB** (feedback) to 0.3. You'll hear spectral echoes — frequency-domain repetitions of your signal that maintain pitch fidelity without time-stretching artifacts. Increase feedback for longer, decaying echo trails.

### 2. Add Spiraling Feedback FX

With Ghost FB above zero, turn up **Ghost FX Cascade**. The formant is rotated once per pass through the delay loop, so each repetition warps further from the base **Vowel** setting. **Ghost FX Depth** sharpens the resonant peaks; **Ghost FX Bode** shifts formant size / gender, with 0.5 neutral. Small amounts create drifting vocalised textures; large amounts produce alien metallic dissolution.

### 4. Morph Between Two States

   - Dial in a sound you like. Press **Capture A**.
   - Change several parameters to create a contrasting sound. Press **Capture B**.
   - Move the **Crossfader** to blend between the two captured states.
   - Use the small diamond switches next to each parameter to choose which ones participate in the morph.

### 5. Automate the Morph

Set **Warp LFO Amount** above zero and adjust **Warp LFO Frequency** to add automatic movement to the crossfader. Choose a **Waveform** shape (Sine for smooth sweeps, Saw+ for ramp-style morphs, S&H for stepped glitch effects). Enable **Tempo Sync** to lock the morphing rhythm to your track with Free, Cycle, or Quantized sync modes.

---

## Spectral Effects Chain

Audio flows through the spectral effects in this order:

| Stage | Controls | Character |
|-------|----------|-----------|
| **Pitch Shift** | Pitch Shift knob | -12 to +12 semitones, frequency-domain pitch shifting |
| **Spectral Wavefold** | Wavefold knob | Spectral drive and harmonic enrichment |
| **Spectral Comb** | Comb Freq, Comb Reso, Character | Resonant spectral filtering and harmonic emphasis |
| **Formant Filter** | Ghost FX Formant, Vowel, Ghost FX Cascade, Ghost FX Depth, Ghost FX Bode | Vowel-like resonant shaping, rotated per feedback pass when Cascade is up |
| **Ghost Delay** | Ghost Time, Mix, FB, FX Depth, FX Char, Gate | Frequency-domain delay with gated feedback and Bode shift |

---

## Display Modes

Click the circular display mode button to cycle through:

1. **Waveform** — Watch the audio waveform in real time.
2. **3D Spectrum** — An animated 3D spectral waterfall surface (note: uses more CPU).
3. **Phase Scope** — Monitor stereo imaging and phase correlation.
4. **Radial** — Radial spectral visualization with heptagonal geometry.

Click the **Colormap** button to change the visualization color theme (16 themes available).

---

## Tips

- **Start subtle, then push** — Poltergeist can go from transparent pitch shifting to extreme spectral destruction. Start with lower Warp, Morph, and FX Depth values, then increase.
- **Use the bypass** — The power button bypasses all processing. Toggle it to A/B your wet and dry sounds quickly.
- **Switch STFT modes** — Use HI-RES mode for maximum spectral detail and smooth processing. Switch to LO-LAT mode for tighter transient response and half the latency.
- **Enable Dry Compensation** — When using intermediate FX Mix positions, enable Dry Comp to time-align the dry signal with the STFT-delayed wet signal, preventing phase cancellation.
- **Save presets often** — When you discover a sound you like, save it. The morphing system means small parameter changes can yield dramatically different results.
- **CPU management** — If CPU usage is a concern, use Waveform display mode rather than 3D Spectrum, or close the plugin GUI when not actively tweaking.
- **Browse factory presets** — Use the Previous/Next buttons to quickly audition factory presets and learn how different parameter combinations interact.

---

*Chrome Sphynx Audio* — *All your bass are belong to us*
