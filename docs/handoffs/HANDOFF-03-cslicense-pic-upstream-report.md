# HANDOFF-03 — cslicense PIC fix + cross-plugin sync (report back)

**Direction: plugin projects → master.** This is a report, not a task issue.
Unlike HANDOFF-01/02A/02B it originates in the plugin repos and asks the master
project to update its records and decide three open items.

- Date: 2026-08-03
- Reported by: `csphxAudioPLUGX/XodBlockRotator_PLUGX` session
- Affects: **both** plugin repos, the shared module, and `SYNC_LEDGER.md`

## Headline

`cslicense` moved **`954b766` → `d2c0006`**. One line of CMake. Every plugin
that links cslicense into its *plugin* target needs this; without it the Linux
Release build cannot link at all.

This is a deliberate, owner-authorised exception to the standing
"do not modify cslicense; report problems back" rule.

## What was wrong

`cslicense` is a `STATIC` library that did not set `POSITION_INDEPENDENT_CODE`.
VST3/AU artefacts are **shared modules**, and a non-PIC static library cannot be
linked into a shared object on Linux:

```
relocation R_X86_64_PC32 against symbol `_ZTVSt9basic_iosIcSt11char_traitsIcEE@@GLIBCXX_3.4'
can not be used when making a shared object; recompile with -fPIC
final link failed: bad value
```

HANDOFF-01 never surfaced this because only the **test executable** linked
cslicense, and executables link non-PIC static libs fine. It appears the first
time the **plugin** target links it — i.e. at HANDOFF-02A/02B.

Both plugins hit it independently, and neither was in a good state:

| repo | what it did | consequence |
|---|---|---|
| Block Rotator | added a local `set_target_properties(... PIC ON)` workaround | built, but every future plugin would rediscover the same failure |
| Poltergeist | reported it upstream, added no workaround | **Release VST3 was never actually built with licensing linked** |

### Poltergeist finding — its Release build was unverified, not working

Worth stating explicitly because its HANDOFF-02B report reads as complete. The
report does not claim a Release build, and the artifact in its `BUILD/` tree was:

- timestamped **03:51**, roughly six hours *before* the licensing commit
  `909a727` (**09:48**) — a stale binary predating the work;
- containing **zero** `cslic::` symbols.

Since `plugin/CMakeLists.txt:190` does link `cslicense` into the plugin target, a
genuine Release build would have failed at link exactly as Block Rotator's did.
The failure was latent, not absent. No blame attaches to the HANDOFF-02B session —
its brief did not ask for a Release build — but the master project should not read
that report as evidence the shipping artifact worked.

## The fix

`cslicense/CMakeLists.txt`, beside the target definition:

```cmake
# Consumers are audio plugins: VST3/AU artefacts are SHARED modules, and a
# non-PIC static library cannot be linked into a shared object on Linux
# ("relocation R_X86_64_PC32 ... recompile with -fPIC"). Set here so every
# consumer inherits it rather than each plugin repo rediscovering the failure.
set_target_properties(cslicense PROPERTIES POSITION_INDEPENDENT_CODE ON)
```

Commit `d2c0006 Set POSITION_INDEPENDENT_CODE on the cslicense target`.
The Block Rotator workaround has been deleted. **No plugin repo needs a PIC line.**

## Verification — both plugins, clean trees

Both `BUILD/` and `BUILD_TESTS/` were deleted before measuring, so a stale CMake
cache could not mask whether the property is inherited through `add_subdirectory`.

| | Block Rotator | Poltergeist |
|---|---|---|
| Release VST3 links | yes — `xodBlockRotator.so`, 8.4 MB | yes — `xodPoltergeist.so`, 14.4 MB |
| `cslic::` symbols in artifact | 19 | **20 (was 0)** |
| ctest | **126/126 pass** | **249/258**, the 9 failures byte-identical to its documented pre-existing set |
| licensing tests | 10/10 pass | 16/16 pass |
| PIC workaround in repo | removed | never had one |
| spec copy | v1.4 | v1.4 |

Poltergeist's 9 failures are `GuiPaintGolden` ×4, `PitchShiftQuality` ×3,
`SpectralGhostGolden.PitchShiftSustainedPinkNoise_v1`, and
`XodSpectralWarpFX.FullChainPerceptualMetrics_v1` — all DSP/GUI golden tests,
none licensing, unchanged from before this work.

## Action required from master

1. **Update `SYNC_LEDGER.md`** to `f3d6114` (done in this change; please confirm).

Items 2 and 3 below were raised here and then **actioned on owner instruction**
(2026-08-03) rather than left for master. Recorded for the trail.

2. ~~**`cslicense.h`'s header comment is stale on two counts**~~ — **DONE**
   (`f3d6114`). It claimed spec **v1.1**, and the doc comment on
   `defaultLicenseDir()` still gave v1.2 guidance ("callers should pass the
   PresetManager base dir"), which D-L2 reversed in v1.3. Both corrected: the
   header now states v1.4, lists the v1.3/v1.4 deltas it already satisfies, and
   documents `defaultLicenseDir()` as the **canonical** location rather than a
   fallback — with the macOS reason it must not be substituted. The README carried
   the same stale advice plus "re-check on a UI timer", which v1.4 §5 replaced with
   the latched model; it now documents the three non-realtime evaluation points and
   states that `evaluate()` is not realtime-safe. Comments/docs only — no code
   changed, so no licensing behaviour was re-verified beyond rebuilds.

3. ~~**`cslicense_tests` is still guarded by `if(PROJECT_IS_TOP_LEVEL)`**~~ —
   **DONE** (`f3d6114`). Replaced with
   `option(CSLICENSE_BUILD_TESTS "..." ${PROJECT_IS_TOP_LEVEL})`, which preserves
   the previous standalone default while letting consumers opt in with
   `-DCSLICENSE_BUILD_TESTS=ON`. **Both plugin repos have had their duplicate
   targets deleted**; each root `CMakeLists.txt` now sets the option whenever
   `BUILD_UNIT_TESTS` is on, and both retain
   `add_dependencies(plugin_tests cslicense_tests)` because `build_utest.sh`
   builds only `--target plugin_tests`.

   Re-verified after the change, from deleted build trees: Block Rotator
   **126/126** with `cslicense_tests` passing; Poltergeist **249/258** with
   `cslicense_tests` passing and the same 9 pre-existing failures; cslicense
   standalone `cmake && ctest` still passes.

## Open decisions carried forward

- **Stale prep test (Block Rotator).**
  `LicensePrep.UserDataHelperAgreesWithDefaultLicenseDir` asserts that the
  PresetManager path equals `defaultLicenseDir(...)/Presets/User` — a coupling
  D-L2 deliberately removed. It passes on Linux only because the two coincide
  there, and already skips on macOS. Retire it, or keep it re-scoped as a
  preset-path regression gate? Left passing and untouched pending a decision.

- **Licensing glue has diverged between the plugins.** Same behaviour, different
  layout: Poltergeist uses `plugin/{include,source}/Licensing/`, Block Rotator
  puts `LicenseConfig.h` / `LicenseState.h` at `plugin/include/` top level. Method
  names differ too (`evaluateAndLatch()` vs `refresh()`). Harmless today; worth
  settling before a third plugin, or before any attempt to share the glue itself.

- **Neither plugin has had manual host verification** of the four §4 UI states.
  Both reports describe what the code draws, not what a DAW renders.

- **Production key and store URLs remain placeholders** in both repos, marked
  `TODO(release)`.

## Non-goals / unchanged

Installers were confirmed license-agnostic and need no change: zero `cslic`
references in either `*_INSTALL` project, and `cslic::installLicenseText()` calls
`fs::create_directories()` itself, so the license directory is self-creating on
first unlock. This matters on macOS, where preset storage lives in the Apple
presets tree and would otherwise never create the Documents-based license folder.
`XodBlockRotator_INSTALL`'s own welcome copy already states the correct contract:
"Your presets and license are created by the plug-in itself."
