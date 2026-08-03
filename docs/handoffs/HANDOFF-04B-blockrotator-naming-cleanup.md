# HANDOFF-04B — Block Rotator: product-name cleanup

Issued by: **ChromeSphynxWeb** (master). Target session:
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodBlockRotator_PLUGX`
**This handoff also authorises changes in
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodBlockRotator_INSTALL`** (one
config file — see T3).

Scope: the naming half of HANDOFF-04A, applied to Block Rotator. **No
documentation work** — this plugin's customer docs are already clean (the
only "Spectral Ghost" hit in its `docs/` is inside the copied
`CSPHX_USER_DATA_STANDARD.md`, which is a shared standards document and is
not ours to edit here). No licensing changes, no DSP changes.

All values are pre-filled — no placeholders to resolve.

Run this **after** HANDOFF-04A if you can: 04A answers the VST3 UID question
first and its report is useful context. This brief is self-contained either
way, and T1 must be performed here regardless — Block Rotator has its own
`PLUGIN_CODE`, so its UID must be measured independently.

## Sources of truth

1. `SYNC_LEDGER.md` decision **D-N1** (below).
2. `docs/PLUGIN_LICENSE_SPEC.md` v1.4 (already in your repo) — unchanged by
   this work; do not modify licensing code.
3. `XodBlockRotator_INSTALL/plugin.config.sh` — already correct on the
   customer-facing side (`PLUGIN_NAME="Block Rotator"`,
   `PLUGIN_BUNDLE_NAME="BlockRotator.vst3"`). Only the *upstream* keys follow
   the rename.

**Conflict rule:** if this prompt conflicts with those documents or with what
you find, raise it and stop. Never silently choose.

## Decision this handoff carries

**D-N1 (2026-08-03, owner):** the DAW-visible plugin name must be the product
name, not the `xod` internal codename. For this repo:
`PRODUCT_NAME "xodBlockRotator"` → `"BlockRotator"`.

Note the form: **`BlockRotator`, one word, no space.** This matches the
artifact the installer already ships (`PLUGIN_BUNDLE_NAME="BlockRotator.vst3"`)
and keeps the built filename free of spaces. The spaced form "Block Rotator"
remains the display name everywhere else — installer UI (`PLUGIN_NAME`), the
user-data folder, the website, and `LicenseConfig.h`'s
`kPluginDisplayName` — and none of those change here. If you judge that the
host-visible name should instead be the spaced "Block Rotator", stop and
raise it rather than choosing.

Context you do not need to rediscover: the installer already stages the build
output and renames it to `BlockRotator.vst3`, so the *installed file* is
already correct. What is wrong is only the name compiled into the binary
(`PRODUCT_NAME` → `JucePlugin_Name` → `AudioProcessor::getName()`).

## Tasks

### T1 — VST3 unique-ID impact (do this BEFORE renaming anything)

**Working hypothesis, flagged as unverified:** JUCE derives the VST3 class ID
partly from the plugin name, so this rename may change the plugin's VST3 UID
and make existing DAW sessions fail to find it. Not yet confirmed for the
pinned JUCE. Confirm or refute by measurement, both ways:

1. **Source**: read the UID derivation in
   `libs/juce/modules/juce_audio_plugin_client/` (VST3 wrapper) and state
   whether `JucePlugin_Name` is an input. Quote the lines.
2. **Empirical**: record the class ID from the *current* Release build, then
   again after T2, and compare. Recent VST3 bundles carry
   `Contents/moduleinfo.json` containing the class `cid`; if absent, use the
   VST3 SDK validator or equivalent.

Report either way. **Proceed with T2 regardless** — this is pre-release
(v0.1.0, no customers) and the rename is authorised — but state the result
plainly, since it determines whether this class of rename is ever safe again.

### T2 — Rename the product in the plugin repo

In `plugin/CMakeLists.txt`, `juce_add_plugin(...)`:

```cmake
    PRODUCT_NAME "BlockRotator"     # was "xodBlockRotator" (D-N1)
```

Leave `PLUGIN_MANUFACTURER_CODE SPHX` and `PLUGIN_CODE BROT` **unchanged** —
identity, not display. Do not rename the CMake target, source identifiers
(`XodBlockRotatorProcessor` etc.), DSP files, or the repo.

### T3 — Follow the rename into the installer repo

The build output becomes `BlockRotator.vst3` / `BlockRotator.component`, so in
`XodBlockRotator_INSTALL/plugin.config.sh`:

```sh
PLUGIN_UPSTREAM_BUNDLE_NAME="BlockRotator.vst3"     # was xodBlockRotator.vst3
PLUGIN_UPSTREAM_AU_NAME="BlockRotator.component"    # was xodBlockRotator.component
```

Verify the current value of `PLUGIN_UPSTREAM_AU_NAME` before editing and
report if it differs from the assumption above. Nothing else in that repo.
Then run `./configure.sh` (idempotent) and confirm `./prepare-plugin.sh`
still locates and stages the bundle from your Release build — upstream and
staged names now coincide, so the rename step becomes a no-op, which is fine.
Commit separately in the installer repo, referencing D-N1.

### T4 — Verify

- Full `build_utest.sh` + `ctest`: expect **126/126 pass**, zero failures —
  this repo has no pre-existing failures, so any failure is a regression.
- Clean-tree Release build links and produces `BlockRotator.vst3` containing
  `cslic::` symbols (licensing must survive the rename untouched).
- `git diff --name-only` against your pre-T2 commit must show **no** file
  under `plugin/source/DSP`, `plugin/include/DSP`, or any licensing file.
- Confirm `LicenseConfig.h`'s `kPluginDisplayName` still reads
  `"Block Rotator"` (spaced) — the licence directory
  `<Documents>/Chrome Sphynx Audio/Block Rotator/` must **not** move. If this
  rename would change it, stop: that would orphan installed licences.

### T5 — Report

Write `docs/NAMING_CLEANUP_REPORT.md` and paste it in full as your final
message: the T1 UID finding (source quote + before/after class IDs), what
changed in each repo with commit SHAs, confirmation that the licence
directory is unchanged, test counts before/after, and any conflicts raised.

## Non-goals

Customer documentation (already clean), licensing code, DSP, GUI, source
identifiers, the CMake target name, the repo name, `kPluginDisplayName`, the
user-data folder, and the `PLUGIN_CODE`/`PLUGIN_MANUFACTURER_CODE` identity
pair.
