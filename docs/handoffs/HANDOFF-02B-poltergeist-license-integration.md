# HANDOFF-02B — Poltergeist: License Integration

Issued by: **ChromeSphynxWeb** (master). Target session:
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodPoltergeist_PLUGX`
(HANDOFF-01 verified there 2026-08-03: cslicense @ `954b766`, 227 passing +
9 pre-existing failures — that failing set must stay byte-identical).
All values in this prompt are pre-filled — no placeholders.

Scope: make Poltergeist fully license-aware per spec §4, including the
D-L1 naming resolution. No installer changes, no website changes, no
production key.

## Identity — decision D-L1 (2026-08-03)

- Official display name: **Poltergeist** · product id: **`poltergeist`**.
  "Spectral Ghost" is the internal DSP-core codename only (source
  identifiers like `XodSpectralGhostProcessor` stay as they are).
- Public key: RFC 8032 TEST 1
  (`d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a`) as a
  single constant `kLicensePublicKey` in one new header, marked
  `// TODO(release): swap for production key issued by ChromeSphynxWeb`.
- Store URLs (constants beside the key; master will finalize before release):
  trial `https://chromesphynx.com/trial`, buy `https://chromesphynx.com`.

## Sources of truth

1. `docs/PLUGIN_LICENSE_SPEC.md` — update your repo's copy from
   `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` (**v1.3**) first; v1.3 §3:
   licenses live in `cslic::defaultLicenseDir("Poltergeist")` on every OS.
2. `../cslicense/` — shared module, already wired in. Do not modify it;
   report problems back. Record the SHA you build against.
3. Your own `docs/LICENSE_PREP_REPORT.md` — the architecture notes below
   come from it.

**Conflict rule:** if this prompt conflicts with the spec or the code you
find, raise it and stop. Never silently choose.

## Tasks

### T1 — D-L1 rename + migration

`PresetManager::getBaseDirectory()` hardcodes `"Spectral Ghost"`
(presets.cpp:76). Change it to `"Poltergeist"`, and add a one-time
migration at first resolution: if
`…/Chrome Sphynx Audio/Spectral Ghost/` exists and
`…/Chrome Sphynx Audio/Poltergeist/` does not, rename the folder
(`std::filesystem::rename`, falling back to recursive copy + leave the
original on cross-device failure). Log/no-op on any error — migration must
never crash the plugin. Add a test with temp dirs. Sweep user-visible
strings (GUI title bar, installer-facing docs) for "Spectral Ghost" and
list every occurrence in the report — change only user-data path +
plugin-GUI display strings; leave code identifiers and DSP docs alone.

### T2 — License directory helper

Public `getLicenseDirectory()` returning
`cslic::defaultLicenseDir("Poltergeist")` — same value as the (renamed)
preset base on Linux/Windows, but keep it a separate function per spec
v1.3 (decoupled by design).

### T3 — Processor-side license state

A `LicenseState` owner on `XodSpectralGhostProcessor`: evaluates via
`cslic::evaluate(getLicenseDirectory(), "poltergeist", kLicensePublicKey,
std::time(nullptr))` at construction and on demand; publishes
`std::atomic<bool> processingAllowed` (Licensed/TrialActive) + full
`cslic::Status` behind a mutex for the GUI. `evaluate()` does filesystem
I/O — message thread only (editor timer, T5, and after license install).

### T4 — Audio gate (dry passthrough, click-free)

In `XodSpectralGhostProcessor::processBlock` (PluginProcessor.cpp:180),
gate on `processingAllowed` alongside the existing `"bypass"` early-return
(:186-188 — already dry passthrough, but unramped). Implement a short
linear crossfade (~30–50 ms) for license-gate transitions; leave the user
bypass exactly as is.

### T5 — License panel UI (spec §4 + §3 entry)

Follow your editor's existing full-bounds child-overlay pattern
(`NineLeafOverlay`, PluginEditor.cpp:693-695 + resized() sizing) for a new
`LicensePanel` component:
- States per spec §4: Licensed → nothing; TrialActive → gold `#c8a23a`
  "TRIAL · N days remaining" pill (amber + hours ≤24h) + key icon;
  TrialExpired/Unlicensed → panel auto-opens, not dismissable.
- Panel: paste box → `cslic::installLicenseText`, clipboard auto-detect
  button (both armor markers present), "Load license file" + drag-drop,
  trial/buy URL buttons, inline error text on failure.
- Re-check: reuse the editor's existing `timerCallback` at most once per
  minute, respecting the documented "user interaction tracking to prevent
  timer conflicts" block (PluginEditor.h:221); evaluate on editor
  construction too.

### T6 — Tests

Extend the GTest suite (temp dirs, pinned clocks, RFC key + spec §7
vectors): gate false on empty dir; trial install → allowed; expired →
blocked; full license → allowed with rollback flag; migration test from
T1. The 9 pre-existing failures must remain byte-identical — zero new
failures.

### T7 — Report

Write `docs/LICENSE_INTEGRATION_REPORT.md`: changes (files/classes),
cslicense SHA, test counts before/after (incl. the unchanged failing set),
the T1 string-sweep list, conflicts raised. Paste it in full as your final
message.

## Non-goals

Production keys, installer/`plugin.config.sh`, website, DSP changes beyond
the gate ramp, renaming source identifiers or repos.
