# Plugin Implementation Record — Licensing (as built)

Master-side record of what the licensing handoffs actually put into the target
plugin projects. The per-repo reports (`docs/LICENSE_INTEGRATION_REPORT.md` in
each plugin) remain the detailed source; this file is the master's own copy of
the facts it needs to keep the plugins in sync, so that answering "what is
implemented, where, and is it the same in both?" never requires opening the
plugin repos.

- Compiled: 2026-08-03, from both integration reports, HANDOFF-03, and direct
  inspection of the three repos.
- Spec implemented: `PLUGIN_LICENSE_SPEC.md` **v1.4** (latched gate).
- Shared module: `csphxAudioPLUGX/cslicense` @ **`f3d6114`** in both plugins.

## Shared module state

| Commit | Content |
|---|---|
| `0ce4a61` | v0.1.0 — format, Ed25519 verify (monocypher `crypto_ed25519_check`), state machine, rollback guard |
| `954b766` | Storage aligned to `CSPHX_USER_DATA_STANDARD`; `defaultLicenseDir(displayName)` |
| `d2c0006` | `POSITION_INDEPENDENT_CODE ON` — required: VST3/AU are shared modules, a non-PIC static lib cannot link into one on Linux |
| `f3d6114` | `option(CSLICENSE_BUILD_TESTS)` replacing the `PROJECT_IS_TOP_LEVEL` guard; header/README refreshed v1.1/v1.2 → v1.4 |

Runtime behaviour is unchanged across all four commits after `954b766` —
`d2c0006` and `f3d6114` are build/doc only. No plugin repo carries a PIC line
for cslicense; both inherit it. (Both repos do still contain a
`POSITION_INDEPENDENT_CODE TRUE` on their **`BinData`** target — pre-existing,
present in each initial commit, unrelated to licensing.)

## As built — both plugins

Identical in behaviour and structure:

- **Audio gate**: one relaxed `std::atomic<bool>` load folded into the plugin's
  pre-existing `"bypass"` early-return. When it blocks, control takes the
  existing `return` — the host buffer is untouched, i.e. dry passthrough, never
  mute. No ramps, crossfades, buffer copies, locks, allocations, or I/O on the
  audio thread. **Zero DSP files changed in either repo** (verified by
  `git diff <prep-commit> --name-only -- plugin/{source,include}/DSP` returning
  empty in both).
- **Evaluation points** (spec §5, all non-realtime): processor construction,
  `prepareToPlay`, and after a license install attempt. Nowhere else — in
  particular, not from any GUI timer.
- **GUI refresh is display-only**: badge and panel read the cached `Status` and
  recompute remaining time from the cached payload's `expiresAt`; they never
  call `evaluate()` and never touch disk. ~1 Hz off each editor's existing
  timer.
- **License directory**: `cslic::defaultLicenseDir(<Display Name>)` via a single
  per-plugin helper, decoupled from preset storage (decision D-L2).
- **UI**: `LicensePanel` full-bounds child overlay + gold `#c8a23a` TRIAL pill
  switching to amber under 24 h; paste box → `installLicenseText`, clipboard
  auto-detect (only when both armor markers present), `FileChooser` + `.cslic`
  drag-drop, trial/buy URL buttons, inline error text carrying the §2 failure
  reason. Panel is non-dismissable in TrialExpired/Unlicensed, hidden entirely
  when Licensed.
- **Keys/URLs**: RFC 8032 TEST 1 public key and placeholder store URLs, both
  marked `TODO(release)`.

### Block Rotator — `XodBlockRotator_PLUGX`

Commits: `396724d` (prep) → `79ca326` (integration R1) → `7f191ee` (drop local
PIC workaround) → `842dc7c` (use `CSLICENSE_BUILD_TESTS`).

| Item | Detail |
|---|---|
| Product id / display name | `block-rotator` / "Block Rotator" |
| New files | `plugin/include/LicenseConfig.h`, `plugin/include/LicenseState.h`, `plugin/source/LicenseState.cpp`, `plugin/include/GUI/LicensePanel.h`, `plugin/source/GUI/LicensePanel.cpp`, `tests/test_license_gate.cpp` |
| Glue layout | Flat — headers at `plugin/include/` top level |
| Latch method | `licenseState_.refresh()` |
| `PluginProcessor.cpp` diff | **2 hunks**: gate condition + `refresh()` in `prepareToPlay`. Construction-time evaluation happens inside `LicenseState`'s own constructor (member init), so it needs no third hunk |
| Tests | `test_license_gate.cpp` (7 blocks) + 4 prep tests; **126/126 ctest pass** |
| macOS note | Preset base is the Apple presets tree (`~/Library/Audio/Presets/CSPHX/Block_Rotator`); license dir is Documents-based and deliberately differs |

### Poltergeist — `XodPoltergeist_PLUGX`

Commits: `7767c80` (prep, and where the D-L1 display-name rename actually
landed) → `909a727` (integration R1) → `6287779` (re-verify vs `d2c0006`; first
working Release build) → `7cad3cd` (use `CSLICENSE_BUILD_TESTS`).

| Item | Detail |
|---|---|
| Product id / display name | `poltergeist` / "Poltergeist" |
| New files | `plugin/include/Licensing/LicenseConfig.h`, `plugin/include/Licensing/LicenseState.h`, `plugin/source/Licensing/LicenseState.cpp`, `plugin/include/GUI/LicensePanel.h`, `plugin/source/GUI/LicensePanel.cpp`, `tests/LicenseTestVectors.h`, `tests/test_license_integration.cpp` |
| Glue layout | Namespaced — `plugin/{include,source}/Licensing/` |
| Latch method | `licenseState.evaluateAndLatch()` |
| `PluginProcessor.cpp` diff | **3 hunks**: gate condition + `prepareToPlay` + an explicit constructor call (+17/−3) |
| Tests | `test_license_integration.cpp` (21 blocks) + 3 prep tests; **249/258 ctest**, the 9 failures byte-identical to the documented pre-existing set (`GuiPaintGolden` ×4, `PitchShiftQuality` ×3, `SpectralGhostGolden.PitchShiftSustainedPinkNoise_v1`, `XodSpectralWarpFX.FullChainPerceptualMetrics_v1`) |
| D-L1 rename | `getBaseDirectory()` → "Poltergeist" (landed in `7767c80`); `migrateLegacyUserDataDir()` added in `909a727`, run once via `std::call_once`, moves a legacy "Spectral Ghost" folder, refuses to merge if the destination exists, no-ops otherwise |
| Preset XML root | `<xodSpectralGhostState>` deliberately unchanged — it is the serialisation identifier; renaming it would break every saved preset |

## Divergence between the two plugins

Same behaviour, different shape. Nothing here is a defect; it is a consistency
question to settle before a third plugin adopts licensing:

1. Glue file layout: `Licensing/` subdirectory (Poltergeist) vs flat
   `plugin/include/` (Block Rotator).
2. Latch method name: `evaluateAndLatch()` vs `refresh()`.
3. Member name: `licenseState` vs `licenseState_`.
4. Construction-time evaluation: explicit call in the processor constructor
   (Poltergeist) vs implicit via `LicenseState`'s constructor (Block Rotator) —
   this is why their audited diffs have three and two hunks respectively.

## Verification status

**Verified by measurement (both plugins):** Release VST3 links on Linux with
`cslic::` symbols present (19 Block Rotator / 20 Poltergeist); full ctest suites
at the counts above; gate decisions on pinned clocks (empty dir blocked,
unexpired trial allowed, past-expiry blocked, wrong-product rejected, rollback
guard trips, perpetual licence survives a year-long rollback); countdown
arithmetic at day/hour boundaries and failing closed on unparseable expiry;
migration on temp dirs (Poltergeist); headless construct/paint of the licensing
UI in all four §4 states.

**Not verified — inference, not measurement:**

- **Zero-CPU-impact is established structurally, not by profiling.** The diff
  provably adds one relaxed atomic load and touches no DSP file; no before/after
  benchmark has been run. Block Rotator already has an
  `AudioProcessLoadMeasurer` in `processBlock`, which is the cheapest route to
  turning this into a measurement.
- **No human has seen either license panel.** Headless tests prove it
  constructs, lays out and paints; they assert nothing about appearance at real
  editor size. DAW visual review still owed.
- **Mid-session expiry has not been observed end-to-end** — inferred from the
  latch and countdown tests, not watched in a live DAW.
- **Clipboard auto-detect, `FileChooser`, and drag-drop are untested** — all
  three need a live desktop session.
- **Migration's cross-device (EXDEV) copy fallback is unreached** by tests.

## Open items owned by master

Carried from HANDOFF-03, plus items raised in the plugin reports that
HANDOFF-03 did not forward (marked ✦):

- **Retire or re-scope `LicensePrep.UserDataHelperAgreesWithDefaultLicenseDir`**
  (Block Rotator). It asserts the preset/license coupling that D-L2 removed;
  passes on Linux only because the paths coincide, already skips on macOS. Left
  passing pending a decision.
- **Settle the glue divergence** (items 1–4 above) before a third plugin.
- ~~✦ **D-L1 is contradicted by shipped customer documentation**~~ — **issued
  as HANDOFF-04A** (2026-08-03). Poltergeist's `SpectralGhost_UserGuide.md`
  (22), `_QuickStart.md` (6) and `_ProductPage.md` (6). Note for whoever
  reviews the result: these are not all product references — §9's "Spectral
  Ghost Delay" is a *feature* name, retargeted to "Ghost Delay" to match the
  existing `GhostDelay` preset bank and `Ghost *` control vocabulary.
  Block Rotator's own docs are clean.
- ~~✦ **The DAW-visible plugin name is the `xod`-prefixed codename in both
  plugins**~~ — **decided as D-N1, issued as HANDOFF-04A/04B** (2026-08-03).
  Correction to this record's earlier wording: the installers already stage
  the artifact under the correct name via `PLUGIN_BUNDLE_NAME`
  (`Poltergeist.vst3` / `BlockRotator.vst3`), so the installed file was never
  wrong — only `JucePlugin_Name` inside the binary. The installer side is two
  `PLUGIN_UPSTREAM_*` data keys. Each handoff measures the VST3 class ID
  before and after, since the rename may shift the VST3 UID.
- ✦ **HANDOFF-02A/02B contained a wording defect** (corrected 2026-08-03): the
  diff-audit task said the `PluginProcessor.cpp` diff must show "exactly two
  things", while T2/T3 and spec §5 mandate three evaluation points including
  construction. The Poltergeist session correctly proceeded and flagged it
  rather than stopping. Fixed in both handoff files so a third plugin is not
  given a contradictory brief.
- ✦ **Minor, noted not actioned**: `XODMK_PLUGIN_NAME="xodSpectralGhost"` is
  dead (referenced by no source) in Poltergeist; the "Start free 20-day trial"
  button is a link to the website, not an in-plugin action, which its label
  slightly oversells.
- **Production key and store URLs** remain `TODO(release)` placeholders in both
  repos.
