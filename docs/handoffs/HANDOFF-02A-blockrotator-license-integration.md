# HANDOFF-02A — Block Rotator: License Integration

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
   `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` (**v1.3**) first; v1.3
   changed §3: licenses live in `cslic::defaultLicenseDir("Block Rotator")`
   (`<Documents>/Chrome Sphynx Audio/Block Rotator/`) on **every OS**,
   deliberately decoupled from the macOS Apple-presets tree (decision D-L2).
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

### T2 — Processor-side license state

A small `LicenseState` owner on `XodBlockRotatorProcessor`:
- Evaluates via `cslic::evaluate(getLicenseDirectory(), "block-rotator",
  kLicensePublicKey, std::time(nullptr))` at construction and on demand.
- Publishes `std::atomic<bool> processingAllowed` (true for `Licensed` /
  `TrialActive`) plus the full `cslic::Status` behind a mutex for the GUI.
- `evaluate()` does filesystem I/O — never call it on the audio thread.
  Re-evaluation happens on the message thread (editor timer, T4) and after
  any license install.

### T3 — Audio gate (dry passthrough, click-free)

In `XodBlockRotatorProcessor::processBlock` (PluginProcessor.cpp:271),
gate on `processingAllowed` alongside the existing `"bypass"` early-return
(:279-280). Your prep report confirmed **no ramp exists** on bypass; the
spec requires click-free. Implement a short linear gain crossfade
(~30–50 ms) between processed and dry paths when the license gate (not the
user bypass) flips, matching the file's existing code style. The user
bypass keeps its current behavior — do not change it.

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
- Re-check cadence: hang off the existing 30 Hz `timerCallback`
  (PluginEditor.cpp:1694) but at most once per minute (counter). Note the
  timer early-returns when `!isShowing()` and is **privately inherited** —
  evaluate on editor construction too, so state is fresh when the window
  opens.

### T5 — Tests

Extend the GTest suite (temp dirs, pinned clocks, RFC key + spec §7
vectors): gate flag false on empty dir; trial install → allowed; expired →
blocked; full license → allowed with rollback flag present. All 119
existing ctest entries must still pass.

### T6 — Report

Write `docs/LICENSE_INTEGRATION_REPORT.md`: what changed (files/classes),
cslicense SHA, test counts before/after, UI screenshots-in-words (states
exercised manually in a host if possible), conflicts raised. Paste it in
full as your final message.

## Non-goals

Production keys, installer/`plugin.config.sh`, website, preset work,
changing user bypass, DSP changes beyond the gate ramp.
