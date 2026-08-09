# HANDOFF-07 — Session demo (spec v3.0)

Issued by: **ChromeSphynxWeb** (master), 2026-08-10.
**Run on Block Rotator first** (`csphxAudioPLUGX/XodBlockRotator_PLUGX`).
Poltergeist takes the same change folded into its pending HANDOFF-05.

Replaces the 20-day calendar trial with a **fully functional 20-minute
session demo, preset saving disabled**. Read `PLUGIN_LICENSE_SPEC.md` **v3.0**
§9 before starting — refresh your repo's copy from the master.

## Why this is smaller than it sounds

`cslicense` (commit `057e809`) has already been simplified: it now returns
only `Licensed` / `Unlicensed`, and `evaluate()` **never writes to disk**.
Deleted upstream: `refreshTrial()`, `daysLeft`, `trialStart`, `rollback`,
`trial-start.txt`, `license-state.txt`, `license-rollback.txt`.

So your repo *loses* code too. What you add is a counter and a ramp.

## T1 — Adopt the simplified module

Update the `LicenseState` glue for the new API. `Status` now has `state`,
`payload`, `settled` only. Delete any handling of trial days, rollback flags,
or trial files. `prepareToPlay` no longer calls `refreshTrialCheap()`.

## T2 — Demo budget in the processor

```cpp
std::atomic<bool> processingAllowed;   // existing §4 gate — unchanged
int64_t demoSamplesRemaining_ = 0;     // audio thread only, no atomics needed
bool    demoExpired_ = false;
float   demoGain_ = 1.0f;
```

`prepareToPlay` (non-realtime, and the only place the sample rate is known):

```cpp
if (licenseStatus_.settled) return;          // licensed: zero work, forever
demoSamplesRemaining_ = int64_t(20 * 60 * sampleRate) - demoSamplesConsumed_;
```

Track consumed samples so a sample-rate change mid-session **re-derives** the
budget rather than resetting it — see §9. Do not restart the demo on a
buffer-size change.

## T3 — `processBlock`

Licensed: unchanged — the existing one relaxed atomic load, nothing else.
Demo mode adds one subtract and one compare:

```cpp
if ((bypassParameter && bypassParameter->load())
    || !processingAllowed.load(std::memory_order_relaxed)) { return; }

// … existing DSP …

if (!licenseSettled_) {                       // demo only; licensed skips entirely
    demoSamplesRemaining_ -= buffer.getNumSamples();
    if (demoSamplesRemaining_ <= 0) { applyDemoFadeOut(buffer); }
}
```

`applyDemoFadeOut` ramps gain 1 → 0 over ~30 ms (≈1440 samples at 48 kHz),
once. When the ramp completes, set `demoExpired_` and clear
`processingAllowed` so every subsequent block takes the existing early-return
— dry passthrough, cheaper than processing, never silence.

**This ramp is the only per-sample work licensing may add, and only in demo
mode.** §4's no-ramp rule is relaxed here precisely because this is the one
gate that flips during playback.

## T4 — Disable preset saving

Refuse the **preset save** path only, with a message pointing at the licence
panel.

**`getStateInformation` must keep working.** It is how the host stores plugin
state in the project file — blocking it would break session recall and read as
data loss rather than a demo limit. If you find yourself touching
`getStateInformation` or `setStateInformation`, stop and re-read this.

## T5 — GUI

Badge shows a live countdown throughout — `DEMO · 12:04` — driven from
`demoSamplesRemaining_` on the existing editor timer (display only; never
evaluate). At zero, the panel reads "Demo ended — Buy / Paste licence / Load
file". Remove all "20-day trial" and "days remaining" copy.

## T6 — Tests

- Licensed: `settled`, no counter, no ramp, no files written.
- Demo: budget decrements; at zero the gate clears and audio becomes dry
  passthrough.
- The fade is click-free — assert the first faded block ends near zero and the
  next block is byte-identical to its input.
- Sample-rate change mid-demo re-derives rather than resets the budget.
- Preset save is refused while `getStateInformation` still returns state.
- Existing suite stays green (Block Rotator baseline: 131/131 at `4655656`).

## T7 — Report

`docs/SESSION_DEMO_REPORT.md`: what changed, test counts before/after, the
measured per-block cost in each of the three states, and confirmation that a
licensed build runs no counter and writes no files.

## Non-goals

Licence verification, the production key, naming, installers, DSP beyond the
fade, and `getStateInformation`.
