# DAW verification script — licensing and demo

Every licensing state has been verified by unit test and by disassembly.
**None has been seen by a human.** This script closes that gap.

It exists because the failures that remain are exactly the ones tests cannot
catch: a panel that renders off-screen, a countdown that reads "DEMO · -1:23",
a fade that clicks on real hardware, a modal that traps the user with no way
out. Work through it once per plugin, per platform.

- Plugins: Block Rotator, Poltergeist
- Formats: VST3 (all platforms) and **AU on macOS — a separate wrapper with a
  different lifecycle, so it must be tested separately, not assumed**
- Suggested hosts: Reaper (cheap, scriptable, all platforms), plus one of
  Bitwig / Ardour / Logic. Two hosts is meaningfully better than one — plugin
  lifecycle differs between them.

---

## Before you start: two setup problems, solved

### 1. Testing the *licensed* state needs a real licence

Issue one locally with the production private key. From `ChromeSphynxWeb`:

```
CS_LICENSE_PRIVATE_KEY=<from your password manager> \
  npm run license -- issue --type full --product block-rotator \
  --email you@example.com --name "Elliot Schei" --out /tmp/br.cslic

CS_LICENSE_PRIVATE_KEY=<...> \
  npm run license -- issue --type full --product poltergeist \
  --email you@example.com --name "Elliot Schei" --out /tmp/pg.cslic
```

Sanity-check before using it — this also re-proves the key pair matches what
is compiled into the plugin:

```
npm run license -- verify --file /tmp/br.cslic \
  --pubkey deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275
```

### 2. Testing *demo expiry* would otherwise take 20 minutes per run

Both processors expose a test seam — `setDemoBudgetSecondsForTest` (Block
Rotator) / `setDemoBudgetSecondsForTesting` (Poltergeist) — but a DAW cannot
call it. So build a **temporary short-demo build** for section C:

In the plugin repo, temporarily change the demo budget constant to 60 seconds,
build, and test expiry mechanics with a one-minute timer. **Then discard that
build** — never install it, never sign it, and confirm `git status` is clean
afterwards. Section D re-checks the real timing once, at full length.

If you would rather not build a variant, run section C with the real 20
minutes and do something else while it counts down. Slower, but nothing is
special about the shortened build beyond convenience.

---

## A. Demo — first load (no licence installed)

Start clean: move `<Documents>/Chrome Sphynx Audio/<Plugin>/` aside so no
licence is present, and confirm no `.cslic` remains.

| # | Do | Expect | ✔ |
|---|---|---|---|
| A1 | Load the plugin on a track with audio playing | Processes normally — full quality, no noise, nothing greyed out | |
| A2 | Look at the badge | Countdown reading `DEMO · 19:5x`, legible against the background, not clipped or overlapping | |
| A3 | Watch for 60 seconds | Counts **down**, roughly real-time, no stutter or jumps | |
| A4 | Stop the transport for 30 s, then check | Barely moved — it counts *processed* audio, not wall time | |
| A5 | Open the licence panel (key icon) | Opens, readable, and **can be dismissed** — a demo with time left must not trap you | |
| A6 | Click "Buy" and "Get a licence"/trial | Opens `chromesphynx.com` in your browser; plugin keeps playing | |
| A7 | Try to save a preset | Refused, with a message naming the demo and pointing at the licence panel. **Not a crash, not a silent no-op** | |
| A8 | Save the DAW project, close, reopen | Project reloads; every parameter is exactly as left. This is `getStateInformation`, which the demo must never block | |

## B. Multiple instances

| # | Do | Expect | ✔ |
|---|---|---|---|
| B1 | Add a second instance on another track | Each has its own countdown — per-instance is the documented decision | |
| B2 | Let both run a few minutes | Both audible, no interference, no shared-state weirdness | |

## C. Demo expiry — the transition (use the short-demo build)

**Capture audio for this section.** Record the plugin's output across the
expiry boundary and inspect the waveform afterwards.

| # | Do | Expect | ✔ |
|---|---|---|---|
| C1 | Play sustained material (pad, noise, or a held chord) and let the timer reach zero | Output fades smoothly to nothing over ~30 ms | |
| C2 | **Listen for a click or pop at the transition** | None. This is the single most important check in this script — the fade is the only per-sample work licensing adds, and it exists purely to prevent this | |
| C3 | Inspect the recording at the boundary | Smooth decay to zero, no discontinuity, no full-scale sample | |
| C4 | Keep playing after expiry | Audio continues **dry** — the unprocessed input, not silence. Your track must not go quiet | |
| C5 | Watch the badge and panel | Panel opens by itself, says the demo ended, offers Buy / paste / load | |
| C6 | Try to close the panel | **Cannot be dismissed** while unlicensed — but the DAW window itself must still close normally | |
| C7 | Check CPU meter before vs after expiry | Same or lower after. An expired plugin returns before any DSP runs | |
| C8 | Remove the plugin and add it fresh | New instance gets a full demo again — documented and expected | |

## D. Demo timing at full length (real build, once per plugin)

| # | Do | Expect | ✔ |
|---|---|---|---|
| D1 | Load the real build, note the clock, play continuously | Expires at 20 minutes of processing, ±30 s | |
| D2 | Change sample rate mid-demo (48k → 96k) | Countdown continues from roughly where it was. **Must not reset, must not jump to zero** | |
| D3 | Change buffer size mid-demo | Same — no reset | |

## E. Unlocking

| # | Do | Expect | ✔ |
|---|---|---|---|
| E1 | Copy the whole licence block (BEGIN…END) to the clipboard, open the panel | "Use licence from clipboard" appears | |
| E2 | Click it | Unlocks immediately; badge and countdown disappear entirely | |
| E3 | Try saving a preset | Works now | |
| E4 | Play for several minutes | Never expires; no badge reappears | |
| E5 | Close and reopen the DAW project | Still licensed, no panel, no countdown | |
| E6 | Fresh instance, panel → paste the block into the text box manually | Same result | |
| E7 | Fresh instance → "Load licence file", pick the `.cslic` | Same result | |
| E8 | Fresh instance → drag the `.cslic` onto the plugin window | Same result | |
| E9 | Paste **Block Rotator's** licence into **Poltergeist** | Refused, with a clear wrong-product message — not a generic failure | |
| E10 | Paste obvious garbage | Refused with a readable reason; no crash | |
| E11 | Check `<Documents>/Chrome Sphynx Audio/<Plugin>/` | Contains `<product>.cslic` and `Presets/` — and **no** `trial-start.txt` or `license-state.txt`, which v3.0 removed | |

## F. Licensed steady state

| # | Do | Expect | ✔ |
|---|---|---|---|
| F1 | With a licence installed, load a fresh instance | No panel, no badge — visually identical to software with no licensing in it | |
| F2 | Compare CPU against a demo instance | No measurable difference | |
| F3 | Delete the `.cslic` while the plugin is loaded, keep playing | Keeps working — evaluation is once per instance by design | |
| F4 | Reload the plugin with the licence gone | Back to demo | |

---

## What to capture

For each plugin × format × host:

1. **Screenshots** of: demo badge, licence panel open during demo, expired
   panel, and a licensed instance (showing nothing).
2. **An audio recording across the expiry boundary** (section C) — the
   artefact that proves C2, and the one worth keeping.
3. **The filled table above**, with a note against anything not a clean pass.
4. **Anything that merely felt wrong** — cramped text, an ambiguous message, a
   countdown that reads oddly at 0:59. Tests cannot see any of this, which is
   the entire reason for doing it by hand.

## If something fails

Record what you saw, which plugin, format, host, and platform, and whether it
reproduces. Send it back here and it becomes the next handoff. Do not fix it
in the plugin repo directly — that is how the two repos drift apart.
