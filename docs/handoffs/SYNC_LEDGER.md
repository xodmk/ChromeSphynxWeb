# Plugin Sync Ledger

Master record of handoffs issued from ChromeSphynxWeb to plugin projects.
States: issued → in-progress → reported → verified.

RELEASE work directory (2026-08-03): `/home/csphx/XODMK/xodCode/csphxAudioPLUGX/`.
`csphxAudioVST3/` is the legacy dev directory.

| Handoff | Target | Repo | cslicense SHA | State | Notes |
|---|---|---|---|---|---|
| HANDOFF-01 | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `954b766` | **verified** 2026-08-03 | 119/119 tests; helper is private + macOS uses Apple presets tree (decision D-L2 below) |
| HANDOFF-01 | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `954b766` | **verified** 2026-08-03 | 227 pass / 9 pre-existing fails (unchanged set); display name hardcoded "Spectral Ghost" (decision D-L1 below) |
| HANDOFF-02A | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `f3d6114` | **verified** 2026-08-03 | R1 latched gate delivered; 126/126 tests; Release VST3 links (19 `cslic::` syms); diff audit = 2 hunks, no DSP change. Host UI check outstanding † |
| HANDOFF-02B | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `f3d6114` | **verified** 2026-08-03 | R1 latched gate delivered; 249/258 (9 pre-existing fails unchanged), 16/16 licensing; Release VST3 re-verified under HANDOFF-03 — it did **not** link before `d2c0006`. Host UI check outstanding † |
| HANDOFF-03 | master (report back) | — | `f3d6114` | **reported** 2026-08-03 | cslicense PIC fix; both plugins re-verified from clean trees; 3 upstream items + 4 open decisions |
| HANDOFF-04A | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` **+ `_INSTALL`** | n/a | **superseded** by 05 | Naming/docs work folded into HANDOFF-05 |
| HANDOFF-04B | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` **+ `_INSTALL`** | n/a | **superseded** by 05 | Naming work folded into HANDOFF-05 |
| HANDOFF-05 | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `55e83ce` | **verified** 2026-08-10 | Production key in, RFC key gone; `PRODUCT_NAME "BlockRotator"`; **VST3 class ID unchanged**; load measurer removed; 131/131 tests; production-signed licence cross-check passed |
| HANDOFF-05 | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | — | **issued**, not yet run | Same brief |
| HANDOFF-07 | Block Rotator first, then Poltergeist | each `*_PLUGX` | `057e809` | **issued** 2026-08-10 | Spec v3.0 session demo: 20-min per session, preset save disabled; replaces the calendar trial |
| HANDOFF-06 | both installers | each `*_INSTALL` | n/a | **issued** 2026-08-10 | Installer copy still says "30-day trial" (actual 20) and names superseded files; EULA has no trial clause |
| — | Block Rotator installer | `csphxAudioPLUGX/XodBlockRotator_INSTALL` | n/a | changed by 04B only | Still license-agnostic; 04B updates the two upstream bundle keys; PLUGIN_LICENSE_URL later |
| — | Poltergeist installer | `csphxAudioPLUGX/XodPoltergeist_INSTALL` | n/a | changed by 04A only | Same |

† **Scope of "verified" for 02A/02B.** Covers what was measured: clean-tree
Release VST3 links with `cslic::` symbols present, full ctest suites, and the
audio-thread diff audit (one relaxed atomic load in the pre-existing early
return; no DSP file touched). It does **not** cover manual verification of the
four spec §4 UI states in a DAW — neither report claims it, and both describe
what the code draws rather than what a host renders. Production key and store
URLs also remain `TODO(release)` placeholders in both repos.

Shared-module reference: `csphxAudioPLUGX/cslicense` @ **`057e809`**
(`954b766` → `d2c0006` PIC → `f3d6114` test option + doc refresh). Runtime
behaviour is unchanged from `954b766` throughout — both deltas are build/doc only. Required by every consumer that links
cslicense into a plugin target: VST3/AU are shared modules and a non-PIC static
library will not link into one on Linux. See HANDOFF-03.

`954b766` implements spec v1.2 — the v1.1→v1.2 delta raised in the Poltergeist
report was storage §3 + UI §4, both already present, so nothing is unimplemented.
`cslicense.h` and the README described v1.1/v1.2 and were corrected to v1.4 in
`f3d6114` (HANDOFF-03 action 2). The `PROJECT_IS_TOP_LEVEL` guard that stopped
consumers building `cslicense_tests` is also gone, replaced by
`option(CSLICENSE_BUILD_TESTS)`; both plugin repos dropped their duplicate
targets (HANDOFF-03 action 3).

## Decisions escalated by prep reports — RESOLVED 2026-08-03

- **D-L1 (Poltergeist)**: official display name is **Poltergeist**
  (product id `poltergeist`); "Spectral Ghost" stays internal-codename only.
  HANDOFF-02B carries the user-data folder rename + one-time migration.
- **D-L2 (license location)**: licenses live in
  `<Documents>/Chrome Sphynx Audio/<Display Name>/` on **every OS** via
  `cslic::defaultLicenseDir`, decoupled from preset storage
  (macOS presets stay in the Apple tree). Spec bumped to **v1.3**.
- **D-N1 (host-visible product name, 2026-08-03)**: `PRODUCT_NAME` must be
  the product, not the `xod` codename — `"Poltergeist"` and
  `"BlockRotator"`. Carried by HANDOFF-04A/04B, each of which measures the
  VST3 class ID before and after, because the rename may change the plugin's
  VST3 UID and is only free pre-release. `PLUGIN_CODE` /
  `PLUGIN_MANUFACTURER_CODE`, source identifiers, user-data folders and
  `kPluginDisplayName` are all unaffected.

  Correction to the earlier record: the installers **already** stage the
  build output under the correct customer-facing name
  (`Poltergeist.vst3` / `BlockRotator.vst3` via `PLUGIN_BUNDLE_NAME`), so the
  installed *file* was never wrong. Only the name compiled into the binary
  (`JucePlugin_Name`, what hosts display) is. The installer change is
  therefore two data keys, not a code change.

- **D-N2 (CPU load measurer, 2026-08-09)**: **remove** the
  `juce::AudioProcessLoadMeasurer` from Block Rotator's release build. It
  timed every `processBlock` while `getCpuLoad()` was never called by
  anything, so the result was discarded — two high-resolution clock reads per
  block costing more than the whole licensing gate. Poltergeist never had one.
  Carried by HANDOFF-05 T4c. If a CPU readout is wanted later, add it
  deliberately and to both plugins.

## Production signing key (registered 2026-08-07)

Public half — safe to publish, compiled into every released plugin:

```
deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275
```

Full record in `LICENSING_DESIGN.md` → "Key ceremony"; the C initializer to
paste into plugins is in `PLUGIN_LICENSE_SPEC.md` §7.1. The private half is
in Vercel (`CS_LICENSE_PRIVATE_KEY`) and the owner's password manager only —
never in any repository. Losing it invalidates every licence ever issued.

Any plugin still carrying the RFC 8032 test key
(`d75a9801…`) is **not** release-ready. HANDOFF-05 does the swap.

## As-built record

What actually landed in each plugin — files, classes, diffs, test counts,
divergences, and what is verified vs inferred — is recorded master-side in
[`PLUGIN_IMPLEMENTATION_RECORD.md`](PLUGIN_IMPLEMENTATION_RECORD.md),
compiled 2026-08-03 from both integration reports plus direct repo
inspection. Per-repo detail stays in each plugin's
`docs/LICENSE_INTEGRATION_REPORT.md`.

## Open items owned by master (2026-08-03)

From HANDOFF-03, plus items the plugin reports raised that HANDOFF-03 did
not forward (✦). Full context in the implementation record.

- Retire or re-scope Block Rotator's
  `LicensePrep.UserDataHelperAgreesWithDefaultLicenseDir` (asserts the
  preset/license coupling D-L2 removed).
- Settle the glue divergence before a third plugin: `Licensing/` subdir vs
  flat headers, `evaluateAndLatch()` vs `refresh()`.
- ~~✦ **D-L1 contradicted in shipped docs**~~ — **issued as HANDOFF-04A**
  (34 occurrences; the split between product references and the "Spectral
  Ghost Delay" *feature* name is specified in the handoff, since a blanket
  replace would rename a feature).
- ~~✦ **DAW-visible name is the codename in both plugins**~~ — **decided as
  D-N1, issued as HANDOFF-04A/04B.**
- ✦ **Handoff wording defect — FIXED 2026-08-03**: the diff-audit task said
  the processor diff must show "exactly two things" while T2/T3 and spec §5
  mandate three evaluation points. Corrected in HANDOFF-02A/02B.
- Neither panel has had human/DAW visual review. **Zero-CPU-impact is now
  measured, not merely structural**: the Block Rotator report puts the
  licensing gate at 0.20 ns/block against 48.9–86.4 ns/block for the load
  measurer that D-N2 removed — the gate costs roughly 1/300th of what was
  deleted alongside it.
- ✦ **D1 — `cslicense` is not pinned** (raised by the HANDOFF-05 Block Rotator
  report). It is consumed as a path dependency on the sibling working tree
  (`CSLICENSE_DIR`), with no submodule and no recorded SHA. That is precisely
  how a green suite went red with no commit in the plugin repo: `55e83ce`
  changed empty-directory semantics to `TrialActive` and three plugin tests
  asserting the old behaviour began failing. Harmless here, but a release
  built this way is not reproducible. Options: pin as a submodule, or record
  the expected SHA in each plugin and fail configure on mismatch. **Needs an
  owner decision before release builds are cut.**
- Production key and store URLs are still `TODO(release)` in both repos.
