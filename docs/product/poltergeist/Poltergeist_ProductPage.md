<!-- doc-version: 1.2 | source: XodPoltergeist_PLUGX/docs/Poltergeist_ProductPage.md -->
# Poltergeist

### Chrome Sphynx Audio

#### *All your bass are belong to us*

---

![Annotated view of the Poltergeist interface, with labels naming each functional section of the control surface.](gfx/Poltergeist_GUI_Overview.png)
*Twelve functional sections arranged around a live nine-leaf spectral visualizer.*

## A Spectral Effects Processor That Haunts, Warps, and Decays

**Poltergeist** is an advanced spectral effects processor that operates entirely in the frequency domain via a real-time phase vocoder. It transforms audio through pitch shifting, spectral warping, spectral comb filtering, frequency-domain delay with gated feedback, and Bode frequency shifting — producing evolving, otherworldly textures that cannot be achieved with conventional time-domain effects. Whether you're designing alien soundscapes, creating spiraling spectral delays, or warping harmonic structures into new timbres, Poltergeist delivers a class of spectral manipulation that goes far beyond traditional processing.

---

## Key Features

### Phase Vocoder Spectral Engine

At the heart of Poltergeist is a real-time STFT (Short-Time Fourier Transform) phase vocoder that deconstructs audio into frequency-domain frames, applies a chain of spectral transformations, and resynthesizes the result. All effects operate on complex spectral data — magnitude and phase — enabling manipulations impossible in the time domain. Two STFT modes are available: High Resolution (1024-sample window) for maximum spectral detail, and Low Latency (512-sample window) for tighter response.

### Spectral Pitch Shifting

A frequency-domain pitch shifter provides up to one octave of shift in either direction (-12 to +12 semitones). The phase vocoder preserves transient quality and minimizes artifacts across the full pitch range, from subtle detuning to dramatic octave shifts.

### Spectral Warp & Shift with Morph Crossfade

Two distinct frequency transformation modes provide radically different timbral effects, with a continuous morph crossfade between them:

- **Spectral Shift** — A Bode-style linear frequency shifter that adds a constant Hz offset to every spectral component, progressively destroying harmonic relationships. Creates metallic, inharmonic textures and ring-modulation-like effects.
- **Spectral Warp** — A nonlinear frequency remapping that compresses or expands regions of the spectrum. Stretches lows while compressing highs, or vice versa, creating formant-like shifts and alien vocal transformations.
- **Spectral Morph** — Continuously crossfades between Shift and Warp modes, blending their characters for hybrid spectral textures.

### Resonant Spectral Comb Filter

A spectral-domain comb filter with independent frequency, resonance, and damping controls. Creates tuned resonances, harmonic emphasis, and metallic coloring directly in the frequency domain. The comb operates on spectral magnitude data, producing effects distinct from time-domain comb filtering.

### Ghost Delay

A frequency-domain frame delay that stores and recalls entire spectral frames rather than time-domain samples. This creates pitch-locked echoes where the spectral content repeats without time-stretching artifacts. Controls include delay time (0–2 seconds), wet/dry mix, and feedback for decaying spectral repetitions.

### Spectral Gate

A rhythmic gating system applied to the Ghost Delay, creating pulsing, chopped spectral textures. The gate speed ranges from rapid tremolo-like effects (20ms period) to slow rhythmic pulses (2-second period), with an intensity ramp controlling the onset and depth of gating. Tempo sync locks the gate to the DAW's BPM.

### Bode Frequency Shift on Feedback Path

Inside the ghost delay's feedback loop, a Bode frequency shift effect adds a constant Hz offset to the fed-back spectral frames. Each feedback iteration shifts the spectrum further, creating accumulating spectral drift — spiraling "barber pole" textures, infinite phaser effects, and progressive harmonic dissolution. Two feedback FX modes are available: Bode (frequency shift) and Morph.

### Spectral Wavefold (Drive)

A spectral-domain wavefold/drive stage that adds harmonic richness and distortion directly to the spectral data. Enhances overtone content and adds grit before the comb and delay stages.

### Parameter Morphing Automated Crossfader

Capture two complete parameter snapshots (A and B), then smoothly crossfade between them in real time:

- **Per-parameter control** — Enable or disable morphing independently for each of the 16 continuous parameters using diamond toggle switches.
- **LFO-driven crossfader** — Automate the morph with a built-in LFO. Choose from seven waveforms (Sine, Triangle, Saw+, Saw-, Square, Random, Sample & Hold).
- **Tempo sync** — Lock the crossfader LFO to your DAW's tempo with Free, Cycle, and Quantized sync modes.

### Real-Time Visualization

Four display modes give you instant visual feedback on your sound:

- **Waveform** — Real-time oscilloscope view of the audio signal
- **3D Spectrum** — Animated three-dimensional spectral waterfall surface
- **Phase Scope** — Stereo phase correlation meter for monitoring imaging
- **Radial** — Radial spectral visualization with heptagonal geometry

The visualizer features selectable color themes with 16 colormap options, rendered within a custom heptagonal display region with nine-leaf perimeter metering.

### Preset System

- Factory presets to get you started immediately
- Save, load, and manage your own user presets
- Full state recall including A/B captures and morphing configuration
- Quick-browse with previous/next navigation

---

## Technical Specifications

| Feature | Detail |
|---|---|
| **Plugin Format** | VST3 |
| **Channels** | Stereo In / Stereo Out |
| **Categories** | Spectral, Modulation, Fx |
| **Internal Processing** | Real-time STFT phase vocoder |
| **STFT Modes** | 2 (High Resolution 2048-FFT / Low Latency 1024-FFT) |
| **Spectral Effects Chain** | 5 stages (Pitch Shift, Wavefold, Comb, Warp/Shift, Ghost Delay) |
| **Ghost Feedback FX Modes** | 2 (Bode Shift, Morph) |
| **Crossfader LFO Waveforms** | 7 (Sine, Tri, Saw+, Saw-, Square, Random, S&H) |
| **Crossfader Tempo Sync** | Free, Cycle, Quantized |
| **Ghost Delay Tempo Sync** | Free, Sync |
| **Gate Tempo Sync** | Free, Sync |
| **Visualization Modes** | 4 (Waveform, 3D Spectrum, Phase Scope, Radial) |
| **Colormaps** | 16 selectable themes |
| **Output Protection** | Soft saturation + brick-wall lookahead limiter |
| **Platforms** | Linux, macOS (Universal Binary), Windows |
| **CPU Optimization** | SIMD-accelerated (SSE3 / NEON) |
| **Preset Format** | XML-based with full state recall |

---

## Who Is Poltergeist For?

- **Sound designers** seeking evolving, otherworldly spectral textures
- **Ambient and electronic producers** building immersive, shifting soundscapes
- **Film and game audio** professionals creating unique spectral effects
- **Experimental musicians** who want a spectral processor that's an instrument in itself
- **Mix engineers** looking for distinctive frequency-domain processing beyond the ordinary

---

## System Requirements

- A DAW that supports VST3 plugins
- macOS 11 (Big Sur) or later (Intel or Apple Silicon), Windows, or Linux
- Recommended: Multi-core CPU for optimal performance with visualization enabled

---

*Poltergeist — where sound becomes spectral.*

**Chrome Sphynx Audio** — *All your bass are belong to us*
