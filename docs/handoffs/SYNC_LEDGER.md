# Plugin Sync Ledger

Master record of handoffs issued from ChromeSphynxWeb to plugin projects.
States: issued → in-progress → reported → verified.

RELEASE work directory (2026-08-03): `/home/csphx/XODMK/xodCode/csphxAudioPLUGX/`.
`csphxAudioVST3/` is the legacy dev directory.

| Handoff | Target | Repo | cslicense SHA | State | Notes |
|---|---|---|---|---|---|
| HANDOFF-01 | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `954b766` | **verified** 2026-08-03 | 119/119 tests; helper is private + macOS uses Apple presets tree (decision D-L2 below) |
| HANDOFF-01 | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `954b766` | **verified** 2026-08-03 | 227 pass / 9 pre-existing fails (unchanged set); display name hardcoded "Spectral Ghost" (decision D-L1 below) |
| HANDOFF-02A | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `f3d6114` | **reported** 2026-08-03 | R1 latched gate delivered; 126/126 tests; Release VST3 links (19 `cslic::` syms); diff audit = 2 hunks, no DSP change |
| HANDOFF-02B | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `f3d6114` | **reported** 2026-08-03 | R1 latched gate delivered; 249/258 (9 pre-existing fails unchanged), 16/16 licensing; Release VST3 re-verified under HANDOFF-03 — it did **not** link before `d2c0006` |
| HANDOFF-03 | master (report back) | — | `f3d6114` | **reported** 2026-08-03 | cslicense PIC fix; both plugins re-verified from clean trees; 3 upstream items + 4 open decisions |
| — | Block Rotator installer | `csphxAudioPLUGX/XodBlockRotator_INSTALL` | n/a | no changes needed | Installer is license-agnostic; only PLUGIN_LICENSE_URL later |
| — | Poltergeist installer | `csphxAudioPLUGX/XodPoltergeist_INSTALL` | n/a | no changes needed | Same |

Shared-module reference: `csphxAudioPLUGX/cslicense` @ **`f3d6114`**
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
- ✦ **D-L1 contradicted in shipped docs**: 34 "Spectral Ghost" occurrences
  across Poltergeist's UserGuide/QuickStart/ProductPage, including install
  instructions. Unresolved and customer-facing.
- ✦ **DAW-visible name is the codename in both plugins**
  (`PRODUCT_NAME "xodPoltergeist"` / `"xodBlockRotator"`); changing it
  renames the artifact that each installer's `prepare-plugin.sh` detects, so
  it is a coordinated plugin+installer decision.
- ✦ **Handoff wording defect — FIXED 2026-08-03**: the diff-audit task said
  the processor diff must show "exactly two things" while T2/T3 and spec §5
  mandate three evaluation points. Corrected in HANDOFF-02A/02B.
- Neither panel has had human/DAW visual review; zero-CPU-impact is
  structural, not profiled.
- Production key and store URLs are still `TODO(release)` in both repos.
