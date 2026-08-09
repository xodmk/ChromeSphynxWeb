# HANDOFF-05 — Release preparation: production key + product naming

Issued by: **ChromeSphynxWeb** (master), 2026-08-07.

**Supersedes HANDOFF-04A and 04B.** Those carried the naming work alone; the
production keypair now exists, and both changes are compiled into the binary.
Doing them in one pass means each plugin is edited, rebuilt and re-verified
once. If 04A/04B have already been run in a repo, skip the tasks marked
*(04 carry-over)* there and say so in the report.

Run one session per plugin. Each session also touches that plugin's
`*_INSTALL` repo — one config file, see T3.

| | Block Rotator | Poltergeist |
|---|---|---|
| Plugin repo | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `csphxAudioPLUGX/XodPoltergeist_PLUGX` |
| Installer repo | `csphxAudioPLUGX/XodBlockRotator_INSTALL` | `csphxAudioPLUGX/XodPoltergeist_INSTALL` |
| Product id | `block-rotator` | `poltergeist` |
| Display name | `Block Rotator` | `Poltergeist` |
| New `PRODUCT_NAME` | `BlockRotator` | `Poltergeist` |
| Key file | `plugin/include/LicenseConfig.h` | `plugin/include/Licensing/LicenseConfig.h` |
| Baseline tests | 126/126, zero failures | 249/258, 9 pre-existing failures unchanged |

## Sources of truth

1. `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` **v1.4** — refresh your
   repo's copy. §7.1 now carries the production key; §7.2 is the test key,
   which stays in the test suite.
2. `SYNC_LEDGER.md` decisions **D-N1** (product naming) and the key ceremony
   in `LICENSING_DESIGN.md`.

**Conflict rule:** if this prompt disagrees with those documents or with what
you find, raise it and stop. Never silently choose.

## T1 — Swap in the production public key

Replace the `kLicensePublicKey` initializer in the key file above with:

```cpp
inline constexpr uint8_t kLicensePublicKey[32] = {
    0xde, 0xda, 0x76, 0xf2, 0xf4, 0x8f, 0x57, 0x79,
    0x5d, 0x1f, 0x7c, 0xc2, 0x5e, 0x28, 0x3d, 0x88,
    0x11, 0xc6, 0xc4, 0x92, 0xef, 0xb0, 0x0b, 0xca,
    0xa9, 0x36, 0x58, 0x25, 0x86, 0x96, 0x42, 0x75,
};
```

(hex `deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275`)

Delete the `TODO(release)` comment and the RFC-test-key note above it,
replacing them with a line stating this is the production key and that its
private half lives only in the website's environment.

**Do not change the test suite's key.** The §7.2 vectors are signed with the
RFC test key and must keep verifying against it — those tests prove the
verifier is correct, independently of which key ships. If any test hard-codes
`kLicensePublicKey` for vector checking, point it at the test key explicitly
instead, and say so in the report.

## T2 — Product name *(04 carry-over)*

In `plugin/CMakeLists.txt`, set `PRODUCT_NAME` to the value in the table
above. Leave `PLUGIN_MANUFACTURER_CODE` and `PLUGIN_CODE` untouched — they
are identity, not display. Do not rename the CMake target, source
identifiers, DSP files, or the repo.

**Before renaming, record the VST3 class ID; after renaming, record it
again.** JUCE may derive the VST3 UID from the plugin name, and if it changes,
every saved DAW session referencing the plugin breaks. Recent VST3 bundles
carry `Contents/moduleinfo.json` containing the class `cid`; use that, or the
VST3 SDK validator. Report both values. Proceed either way — pre-release is
the only free window — but the result must be recorded, because it determines
whether this rename is ever safe again.

Poltergeist only: also remove the dead `XODMK_PLUGIN_NAME="xodSpectralGhost"`
define (`plugin/CMakeLists.txt:155`) if no source references it.

## T3 — Follow the rename into the installer *(04 carry-over)*

In the installer repo's `plugin.config.sh`, set the two upstream keys to
match the new build output — e.g. for Block Rotator
`PLUGIN_UPSTREAM_BUNDLE_NAME="BlockRotator.vst3"` and
`PLUGIN_UPSTREAM_AU_NAME="BlockRotator.component"`. Verify the current values
first and report if they differ from expectation. Nothing else in that repo.
Run `./configure.sh` (idempotent), confirm `./prepare-plugin.sh` still finds
and stages the bundle, and commit separately referencing D-N1.

## T4 — Poltergeist customer docs *(04 carry-over, Poltergeist only)*

34 occurrences of "Spectral Ghost" across `SpectralGhost_UserGuide.md` (22),
`_QuickStart.md` (6) and `_ProductPage.md` (6). **Not a blanket replace** —
the phrase is used in two senses:

- **the product** → "Poltergeist" ("Insert Spectral Ghost on a track",
  "Spectral Ghost's processing engine", the closing tagline);
- **the feature** — §9's frequency-domain frame delay → **"Ghost Delay"**,
  matching the existing `GhostDelay` preset bank and `Ghost *` controls.

Rename the files too (`git mv` to `Poltergeist_*.md`), fix cross-references,
update install instructions to the new artifact name, and leave
`<xodSpectralGhostState>` alone — it is the preset serialisation identifier
and renaming it breaks every saved preset. List anything ambiguous in the
report rather than guessing.

## T4b — Runtime cost model (spec v2.1 §5) — **required**

The shipped integration follows v1.4, which called `evaluate()` from
`prepareToPlay`. That is now a defect: `evaluate()` scans the licence
directory, verifies an Ed25519 signature and writes the rollback mark, and
hosts call `prepareToPlay` on every sample-rate and buffer-size change.

**`cslicense` already implements the fix** (commit `55e83ce`) — do not
reimplement it. `Status` now carries `settled`, `trialStart` and `rollback`,
and there is a new `cslic::refreshTrial(status, now)` that is pure arithmetic.
Your job is to use them:

1. **Remove the `evaluate()` call from `prepareToPlay`.** Full evaluation runs
   only at processor construction and after a user installs a licence.
2. Cache the `Status` from construction. `prepareToPlay` becomes:
   ```cpp
   if (licenseStatus_.settled) return;      // licensed: zero work, forever
   auto s = cslic::refreshTrial(licenseStatus_, std::time(nullptr));
   licenseStatus_.state = s;
   processingAllowed.store(s == cslic::State::Licensed ||
                           s == cslic::State::TrialActive,
                           std::memory_order_relaxed);
   ```
   No file access, no crypto.
3. `processBlock` is unchanged: exactly one relaxed atomic load folded into
   the existing bypass early-return. Add nothing else.
4. The local 20-day trial is now `cslicense`'s job, not yours — it starts
   automatically on first run. Remove any trial-licence request UI; the
   website no longer issues trial `.cslic` files. The licence panel keeps the
   paste box, file load, and buy/trial links.

**Prove it, don't assert it.** In the report, state for each of the three
states (licensed / trial / expired) exactly what `prepareToPlay` and
`processBlock` execute, and confirm a licensed instance creates no
`trial-start.txt` or `license-state.txt`.

## T4c — Decide the CPU load measurer (Block Rotator only)

`XodBlockRotatorProcessor::processBlock` opens with

```cpp
juce::AudioProcessLoadMeasurer::ScopedTimer loadMeasure (loadMeasurer_, buffer.getNumSamples());
```

and `PluginProcessor.h` exposes `getCpuLoad()` — **which nothing calls.** The
editor never reads it. So every block pays two high-resolution clock reads and
the result is discarded. Poltergeist has no equivalent, so the two plugins are
also inconsistent.

Two high-resolution clock reads per block cost meaningfully more than the
entire licensing gate (one cached bool load). Default action, unless the owner
says otherwise: **remove it from the release build** — the `ScopedTimer`, the
`loadMeasurer_` member, the `reset()` in `prepareToPlay`, and `getCpuLoad()`.

If a CPU readout is wanted later it should be added deliberately and wired to
the GUI, ideally in both plugins. Report the measured before/after difference
if you can, using the measurer itself before deleting it.

## T5 — Verify

- Full suite at the baseline in the table. Zero new failures.
- Clean-tree Release build links and produces the newly-named artifact with
  `cslic::` symbols present.
- `git diff` against your starting commit shows **no** file under
  `plugin/{source,include}/DSP` and no change to `processBlock` beyond what
  already shipped.
- Confirm `kPluginDisplayName` / `kDisplayName` is unchanged, so the licence
  directory `<Documents>/Chrome Sphynx Audio/<Display Name>/` does not move.
  If this rename would move it, **stop** — that orphans installed licences.
- **Cross-check against the real key**: ask the master project for a test
  licence signed with the production private key, load it into a debug build,
  and confirm it verifies. This is the one check that proves the two halves
  match; nothing else in this handoff can.

## T6 — Report

Write `docs/RELEASE_PREP_REPORT.md` and paste it in full: the VST3 class ID
before and after, what changed in each repo with commit SHAs, test counts,
the product-vs-feature calls (Poltergeist), confirmation the licence
directory is unchanged, and any conflicts raised.

## Non-goals

Licensing logic, DSP, GUI layout, source identifiers, CMake target names,
repo names, preset XML roots, `PLUGIN_CODE`/`PLUGIN_MANUFACTURER_CODE`, and
the store URLs (still placeholders pending the Paddle catalog).
