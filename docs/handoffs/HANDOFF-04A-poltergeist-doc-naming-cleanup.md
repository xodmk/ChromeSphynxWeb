# HANDOFF-04A — Poltergeist: customer-doc and product-name cleanup

Issued by: **ChromeSphynxWeb** (master). Target session:
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodPoltergeist_PLUGX`
**This handoff also authorises changes in
`/home/csphx/XODMK/xodCode/csphxAudioPLUGX/XodPoltergeist_INSTALL`** (one
config file — see T3). Both are owner-created release clones.

Scope: finish decision **D-L1**. The user-data folder and licensing glue
already say "Poltergeist"; the shipped customer documentation and the
DAW-visible plugin name still say "Spectral Ghost" / "xodPoltergeist". No
licensing changes, no DSP changes, no GUI layout changes.

All values are pre-filled — no placeholders to resolve.

## Sources of truth

1. `SYNC_LEDGER.md` decision **D-L1**: official display name is
   **Poltergeist**, product id `poltergeist`; "Spectral Ghost" survives only
   as the internal DSP codename in source identifiers.
2. `docs/PLUGIN_LICENSE_SPEC.md` v1.4 (already in your repo) — unchanged by
   this work; do not modify licensing code.
3. `XodPoltergeist_INSTALL/plugin.config.sh` — already correct on the
   customer-facing side (`PLUGIN_NAME="Poltergeist"`,
   `PLUGIN_BUNDLE_NAME="Poltergeist.vst3"`). Only the two *upstream* keys
   need to follow the rename.

**Conflict rule:** if this prompt conflicts with those documents or with
what you find, raise it and stop. Never silently choose. In particular, see
the product-vs-feature distinction in T4 — when in doubt about a specific
occurrence, leave it and list it in the report.

## Decision this handoff carries

**D-N1 (2026-08-03, owner):** rename `PRODUCT_NAME` from `"xodPoltergeist"`
to `"Poltergeist"` so the DAW plugin list matches the product. Pre-release
(v0.1.0, no customers) is the only window in which this is free; the
VST3 unique ID must be checked first and the result recorded — see T1.

Context you do not need to rediscover: the installer already stages the
build output and renames it to `Poltergeist.vst3`, so the *installed file*
is already correct today. What is wrong is only the name compiled into the
binary (`PRODUCT_NAME` → `JucePlugin_Name` → `AudioProcessor::getName()`),
which is what hosts display.

## Tasks

### T1 — VST3 unique-ID impact (do this BEFORE renaming anything)

**Working hypothesis, flagged as unverified:** JUCE derives the VST3 class
ID partly from the plugin name, so changing `PRODUCT_NAME` may change the
plugin's VST3 UID — which would make existing DAW sessions fail to find the
plugin. This has *not* been confirmed for the JUCE version pinned here
(`9.0.0-4-g7dda739b9b`). Confirm or refute it by measurement, both ways:

1. **Source**: read the UID derivation in
   `libs/juce/modules/juce_audio_plugin_client/` (VST3 wrapper) and state
   whether `JucePlugin_Name` is an input to it. Quote the lines.
2. **Empirical**: record the class ID from the *current* Release build, then
   again after the T2 rename, and compare. Recent VST3 bundles carry
   `Contents/moduleinfo.json` containing the class `cid` — if present that is
   the cheapest source of truth; otherwise use the VST3 SDK validator or any
   equivalent that prints the class ID.

Report the finding either way. **Proceed with T2 regardless of the answer** —
this is pre-release and the rename is authorised — but if the UID does change,
say so plainly in the report, because it fixes the fact that this rename must
never happen again after launch.

### T2 — Rename the product in the plugin repo

In `plugin/CMakeLists.txt`, `juce_add_plugin(...)`:

```cmake
    PRODUCT_NAME "Poltergeist"      # was "xodPoltergeist" (D-N1)
```

Leave `PLUGIN_MANUFACTURER_CODE SPHX` and `PLUGIN_CODE PLTG` **unchanged** —
they are identity, not display. Do not rename the CMake target, the source
identifiers (`XodSpectralGhostProcessor` etc.), the DSP files, or the repo.
Those are internal codenames and D-L1 explicitly keeps them.

Also remove the dead `XODMK_PLUGIN_NAME="xodSpectralGhost"` define
(`plugin/CMakeLists.txt:155`) — the Poltergeist integration report confirmed
no source file references it. If anything does reference it, leave it and say
so.

### T3 — Follow the rename into the installer repo

The build output becomes `Poltergeist.vst3` / `Poltergeist.component`, so in
`XodPoltergeist_INSTALL/plugin.config.sh`:

```sh
PLUGIN_UPSTREAM_BUNDLE_NAME="Poltergeist.vst3"        # was xodPoltergeist.vst3
PLUGIN_UPSTREAM_AU_NAME="Poltergeist.component"       # was xodPoltergeist.component
```

Nothing else in that repo. Then run `./configure.sh` (it is idempotent) and
confirm `./prepare-plugin.sh` still locates and stages the bundle from your
Release build — upstream and staged names now coincide, so the internal
rename step becomes a no-op, which is fine. Commit in the installer repo
separately, referencing D-N1.

### T4 — Customer documentation

Three files, 34 "Spectral Ghost" occurrences. **This is not a blanket
find-and-replace** — the docs use the phrase in two distinct senses:

| Sense | Treatment | Examples |
|---|---|---|
| **The product** | → "Poltergeist" | "Spectral Ghost is an advanced spectral effects processor…", "Insert Spectral Ghost as a stereo effect", "Spectral Ghost's processing engine", the closing tagline |
| **The feature** — the frequency-domain frame delay in section 9 | → **"Ghost Delay"** | "Spectral Ghost Delay" (§9 heading, TOC entry, signal-flow diagram, "the defining feature of…") |

"Ghost Delay" is chosen because the product's own vocabulary already uses it:
the preset bank is `GhostDelay` and every control in that section is `Ghost
Time` / `Ghost FB` / `Ghost FX Depth` / `Ghost FX Char`. Phrases like "the
classic Spectral Ghost sound" describe the product — use judgement, and list
every occurrence you were unsure about in the report rather than guessing
silently.

Also in these files:
- Rename the files themselves: `git mv SpectralGhost_UserGuide.md
  Poltergeist_UserGuide.md`, likewise `_QuickStart.md` and `_ProductPage.md`.
  Fix any cross-references between them.
- Update install instructions to the post-rename artifact name
  (`Poltergeist.vst3`) and check any user-data paths quoted in the docs match
  `<Documents>/Chrome Sphynx Audio/Poltergeist/`.
- Leave `<xodSpectralGhostState>` (preset XML root) alone wherever mentioned —
  renaming it would break every saved preset.

### T5 — Verify

- Full `build_utest.sh` + `ctest`: expect **249/258**, with the same nine
  pre-existing failures byte-identical (`GuiPaintGolden` ×4,
  `PitchShiftQuality` ×3, `SpectralGhostGolden.PitchShiftSustainedPinkNoise_v1`,
  `XodSpectralWarpFX.FullChainPerceptualMetrics_v1`). Zero new failures.
- Clean-tree Release build links and produces `Poltergeist.vst3` containing
  `cslic::` symbols (licensing must survive the rename untouched).
- `git diff --name-only` against your pre-T2 commit must show **no** file
  under `plugin/source/DSP`, `plugin/include/DSP`, or any licensing file.
- `grep -rn "Spectral Ghost" docs/` afterwards returns only intentional
  survivors, each listed in the report.

### T6 — Report

Write `docs/DOC_NAMING_CLEANUP_REPORT.md` and paste it in full as your final
message: the T1 UID finding (source quote + before/after class IDs), what
changed in each repo with commit SHAs, the product-vs-feature calls you made
and anything you left ambiguous, test counts before/after, and any conflicts
raised.

## Non-goals

Licensing code, DSP, GUI layout, source identifiers, the CMake target name,
the repo name, preset XML roots, and the `PLUGIN_CODE`/`PLUGIN_MANUFACTURER_CODE`
identity pair. Also **not** in scope: adding trial/licensing sections to the
customer docs — the master owns that copy and will issue it separately.
