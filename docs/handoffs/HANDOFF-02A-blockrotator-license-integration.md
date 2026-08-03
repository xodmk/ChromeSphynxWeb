# HANDOFF-02A — Block Rotator: License Integration (R1)

> **Revision R1 (2026-08-03) — supersedes the initial issue.** The original
> T2/T3 mandated a license crossfade in `processBlock`; that violated the
> zero-audio-thread-impact requirement and is withdrawn. If any session
> started from the earlier revision, revert ALL `plugin/` source changes to
> the HANDOFF-01 commit (`396724d`) before starting. Spec is now **v1.4**
> (latched gate, normative audio-thread budget).

Issued by: **ChromeSphynxWeb** (master). Target session:
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodBlockRotator_PLUGX`
(HANDOFF-01 verified there 2026-08-03: cslicense @ `954b766`, 119/119 tests).
All values in this prompt are pre-filled — no placeholders.

Scope: make Block Rotator fully license-aware per spec §4 — state machine
wired to audio + GUI. No installer changes, no website changes, no
production key.

## Identity

- Display name: **Block Rotator** · product id: **`block-rotator`**
- Public key: RFC 8032 TEST 1
  (`d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a`) as a
  single constant `kLicensePublicKey` in one new header, marked
  `// TODO(release): swap for production key issued by ChromeSphynxWeb`.
- Store URLs (constants beside the key; master will finalize before release):
  trial `https://chromesphynx.com/trial`, buy `https://chromesphynx.com`.

## Sources of truth

1. `docs/PLUGIN_LICENSE_SPEC.md` — update your repo's copy from
   `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` (**v1.4**) first. v1.3
   changed §3: licenses live in `cslic::defaultLicenseDir("Block Rotator")`
   (`<Documents>/Chrome Sphynx Audio/Block Rotator/`) on **every OS**,
   decoupled from the macOS Apple-presets tree (decision D-L2). v1.4 §4/§5:
   latched gate + normative audio-thread budget — read both before coding.
2. `../cslicense/` — shared module, already wired in. Do not modify it;
   report problems back. Record the SHA you build against.
3. Your own `docs/LICENSE_PREP_REPORT.md` — the architecture notes below
   come from it.

**Conflict rule:** if this prompt conflicts with the spec or the code you
find, raise it and stop. Never silently choose.

## Tasks

### T1 — License directory helper

Public `getLicenseDirectory()` (place beside the existing PresetManager or
as a free function in the new license glue) returning
`cslic::defaultLicenseDir("Block Rotator")`. Do NOT touch
`PresetManager::getBaseDirectory()` — presets stay where they are.

### T2 — Processor-side license state (latched, spec §5)

A small `LicenseState` owner on `XodBlockRotatorProcessor`:
- Calls `cslic::evaluate(getLicenseDirectory(), "block-rotator",
  kLicensePublicKey, std::time(nullptr))` in EXACTLY three places, all
  non-realtime: the processor constructor, `prepareToPlay`, and immediately
  after a successful `installLicenseText` (message thread).
- Latches `std::atomic<bool> processingAllowed` (true for `Licensed` /
  `TrialActive`) and caches the `cslic::Status` for the GUI (read on the
  message thread only).
- The gate is never flipped during playback. Mid-session expiry affects only
  the GUI; enforcement lands at the next `prepareToPlay`/session reload.
  The one exception is the user unlocking (install → re-evaluate → enable).

### T3 — Audio gate (zero audio-thread impact, spec §4 budget)

In `XodBlockRotatorProcessor::processBlock` (PluginProcessor.cpp:271), the
ONLY change is folding the latch into the existing `"bypass"` early-return
(:279-280):

```cpp
if ((bypassParameter && bypassParameter->load())
    || !licenseState.processingAllowed.load(std::memory_order_relaxed)) { return; }
```

Nothing else in `processBlock`, no new members touched from the audio
thread, no ramps/crossfades/copies (unnecessary — the gate is latched and
cannot flip mid-playback), and zero changes to any DSP code. The user
bypass keeps its current behavior.

### T4 — License panel UI (spec §4 + §3 entry)

Your editor (`XodBlockRotatorEditor`, ~2200 lines) has no overlay pattern —
this is new construction as one self-contained `LicensePanel` component
(full-bounds child, `addAndMakeVisible` + `toFront`), keeping the editor
diff minimal:
- States per spec §4: Licensed → nothing visible; TrialActive → gold
  `#c8a23a` "TRIAL · N days remaining" pill (amber + hours at ≤24h) + key
  icon; TrialExpired/Unlicensed → panel auto-opens, not dismissable.
- Panel: paste box (whole armored block → `cslic::installLicenseText`),
  "Use license from clipboard" button shown when the clipboard contains
  both armor markers, "Load license file" (FileChooser + drag-drop),
  "Start free trial" / "Buy" buttons opening the URLs, inline error text
  from `installLicenseText` on failure.
- GUI refresh is **display-only**: the badge/panel read the processor's
  cached `Status` and recompute remaining time from the cached payload's
  `expiresAt` — never call `cslic::evaluate()` from the timer (no disk I/O
  from GUI refresh). Refresh the display from the existing 30 Hz
  `timerCallback` (PluginEditor.cpp:1694) at most ~once per second; note it
  early-returns when `!isShowing()` and `juce::Timer` is privately
  inherited. Read cached state on editor construction so the panel is
  correct when the window opens.

### T5 — Tests + audio-thread diff audit

Extend the GTest suite (temp dirs, pinned clocks, RFC key + spec §7
vectors): gate flag false on empty dir; trial install → allowed; expired at
next evaluate → blocked; full license → allowed with rollback flag present.
All 119 existing ctest entries must still pass.

**Diff audit (mandatory, goes in the report):**
`git diff 396724d -- plugin/source/PluginProcessor.cpp` must show only the
licensing wiring T2/T3 call for, and nothing else:

- the one-line gate condition folded into the existing early-return;
- the non-realtime `evaluate` calls from T2's three §5 points that land in
  this file — `prepareToPlay` always, plus the processor constructor **if**
  construction-time evaluation is an explicit call rather than implicit in
  `LicenseState`'s own constructor (either is fine; say which you did);
- the member declaration and include in `PluginProcessor.h`.

Anything beyond that in this file — especially anything inside
`processBlock` other than the atomic load — is out of budget.

### T6 — Report

Write `docs/LICENSE_INTEGRATION_REPORT.md`: what changed (files/classes),
cslicense SHA, test counts before/after, UI screenshots-in-words (states
exercised manually in a host if possible), conflicts raised. Paste it in
full as your final message.

## Non-goals

Production keys, installer/`plugin.config.sh`, website, preset work,
changing user bypass, ramps/crossfades of any kind, and any DSP changes.
