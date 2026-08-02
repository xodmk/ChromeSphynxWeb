# HANDOFF-02B — Poltergeist: License Integration (R1)

> **Revision R1 (2026-08-03) — supersedes the initial issue.** The original
> T4 mandated a license crossfade in `processBlock`; that violated the
> zero-audio-thread-impact requirement and is withdrawn. If any session
> started from the earlier revision, revert ALL `plugin/` source changes to
> the HANDOFF-01 commit (`7767c80`) before starting. Spec is now **v1.4**
> (latched gate, normative audio-thread budget).

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
   `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` (**v1.4**) first; v1.3 §3:
   licenses live in `cslic::defaultLicenseDir("Poltergeist")` on every OS;
   v1.4 §4/§5: latched gate + normative audio-thread budget — read both
   before coding.
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

### T3 — Processor-side license state (latched, spec §5)

A `LicenseState` owner on `XodSpectralGhostProcessor`: calls
`cslic::evaluate(getLicenseDirectory(), "poltergeist", kLicensePublicKey,
std::time(nullptr))` in EXACTLY three places, all non-realtime — the
processor constructor, `prepareToPlay`, and immediately after a successful
`installLicenseText` (message thread). Latches
`std::atomic<bool> processingAllowed` (Licensed/TrialActive) and caches the
`cslic::Status` for the GUI (message-thread reads only). The gate never
flips during playback; mid-session expiry affects only the GUI, enforcement
lands at the next `prepareToPlay`. The one exception is the user unlocking.

### T4 — Audio gate (zero audio-thread impact, spec §4 budget)

In `XodSpectralGhostProcessor::processBlock` (PluginProcessor.cpp:180), the
ONLY change is folding the latch into the existing `"bypass"` early-return
(:186-188):

```cpp
if ((bypassParameter && bypassParameter->load())
    || !licenseState.processingAllowed.load(std::memory_order_relaxed)) { return; }
```

Nothing else in `processBlock`, no ramps/crossfades/copies (unnecessary —
the gate is latched), and zero changes to any DSP code. Leave the user
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
- GUI refresh is **display-only**: badge/panel read the processor's cached
  `Status` and recompute remaining time from the cached payload's
  `expiresAt` — never call `cslic::evaluate()` from the timer (no disk I/O
  in GUI refresh). Reuse the editor's existing `timerCallback` (~once per
  second is plenty), respecting the documented "user interaction tracking to
  prevent timer conflicts" block (PluginEditor.h:221); read cached state on
  editor construction too.

### T6 — Tests + audio-thread diff audit

Extend the GTest suite (temp dirs, pinned clocks, RFC key + spec §7
vectors): gate false on empty dir; trial install → allowed; expired at next
evaluate → blocked; full license → allowed with rollback flag; migration
test from T1. The 9 pre-existing failures must remain byte-identical —
zero new failures.

**Diff audit (mandatory, goes in the report):**
`git diff 7767c80 -- plugin/source/PluginProcessor.cpp` must show exactly
two things — the one-line gate condition in the existing early-return, and
the `evaluate` call in `prepareToPlay` (plus the member/include). Anything
else in that file is out of budget.

### T7 — Report

Write `docs/LICENSE_INTEGRATION_REPORT.md`: changes (files/classes),
cslicense SHA, test counts before/after (incl. the unchanged failing set),
the T1 string-sweep list, conflicts raised. Paste it in full as your final
message.

## Non-goals

Production keys, installer/`plugin.config.sh`, website, ramps/crossfades of
any kind, any DSP changes, renaming source identifiers or repos.
