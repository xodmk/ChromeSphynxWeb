# HANDOFF-01 — Plugin License Integration: Preparation

> **Status: executed 2026-08-03** for `XodBlockRotator_PLUGX` and
> `XodPoltergeist_PLUGX` (reports in each repo's `docs/LICENSE_PREP_REPORT.md`,
> tracked in `SYNC_LEDGER.md`). Kept as the template for future plugins.
> Paths below reflect the RELEASE work directory `csphxAudioPLUGX/`.

Issued by: **ChromeSphynxWeb** (company-wide master for e-commerce, licensing,
and website integration). Target: one plugin project clone.
Scope: **preparation only** — wire in the shared license module, prove
interoperability, audit the project, report back. No GUI work, no audio-path
changes, no installer changes. Those arrive in HANDOFF-02 after this report
is reviewed.

> **How to use:** the owner creates a safe clone of the target development
> project, opens a Claude Code session in that clone, and pastes this entire
> file as the first message after filling in the placeholders below.

## Placeholders (owner fills before sending)

| Placeholder | Value | Example |
|---|---|---|
| `<TARGET_REPO>` | absolute path of the clone this session runs in | `~/XODMK/xodCode/csphxAudioPLUGX/XodBlockRotator_PLUGX` |
| `<CLONED_FROM>` | the development project it was cloned from | `xodBlockRotator_VST3MSTR` |
| `<PLUGIN_DISPLAY_NAME>` | user-visible name (Title Case With Spaces) | `Block Rotator` |
| `<PRODUCT_ID>` | licensing product id (kebab-case, from the master catalog) | `block-rotator` |

## Sources of truth (read before writing any code)

1. `csphxAudioPLUGX/cslicense/` — the shared C++ license module (repo).
   Read `README.md` and `include/cslicense/cslicense.h`. Do **not** modify
   this repo; integration problems get reported back instead.
2. `ChromeSphynxWeb/docs/PLUGIN_LICENSE_SPEC.md` **v1.2** — the integration
   contract (file format, state machine, storage, UI). Copy it into
   `<TARGET_REPO>/docs/` for reference.
3. `csphxAudioVST3/csphxInstall_prompts/CSPHX_USER_DATA_STANDARD.md` (legacy
   dev directory, still the canonical standard) — where license files live on
   disk (beside `Presets/`).

Ignore `csphxInstall_prompts/chrome-sphynx-license-spec.md` (v3) and
`license-integration-claudecode-prompt.md` — both are SUPERSEDED (banners at
the top say so). If any project file still references them, note it in the
report; do not follow them.

**Conflict rule:** if anything in this handoff conflicts with the spec
documents, or with what you find in the target repo, raise the conflict and
stop. Never silently choose.

## Decisions already made (do not re-litigate in the target session)

- Licenses are Ed25519-signed `.cslic` key blocks (RFC 8032 / SHA-512),
  pasted into the plugin (paste-first UX) or loaded as a file.
- Trial = same format with `expiresAt`, issued email-gated by the website,
  20 days. There is no locally-started trial and no `trial_start.txt`.
- No machine binding. Full licenses are perpetual.
- Expired/unlicensed behavior: **dry passthrough** + locked GUI. Never mute.
- License storage: the plugin's user-data root per `CSPHX_USER_DATA_STANDARD`
  (`<Documents>/Chrome Sphynx Audio/<PLUGIN_DISPLAY_NAME>/`), obtained from
  the plugin's existing user-data helper (PresetManager) — never re-derive
  the path.
- Until the production keypair is issued by the master project, all testing
  uses the RFC 8032 TEST 1 public key baked into the cslicense test suite.

## Tasks

### T1 — Baseline audit (no changes)

Build the project and run its existing test suite exactly as the repo
intends (`build_utest.sh` / `ctest` / whatever is present). Record in the
report: build result, test pass/fail counts, JUCE version, CMake layout
(top-level + `plugin/` + `tests/` targets), C++ standard, and whether a
PresetManager-style user-data helper exists that resolves the
`CSPHX_USER_DATA_STANDARD` directory (name the exact function).

### T2 — Wire in cslicense

Add the shared module to the build without vendoring its sources:

```cmake
# CSLICENSE_DIR overridable; default assumes the standard sibling layout.
set(CSLICENSE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../cslicense" CACHE PATH
    "Path to the shared cslicense repo")
add_subdirectory(${CSLICENSE_DIR} cslicense_build)
# link: target_link_libraries(<tests-or-plugin-target> PRIVATE cslicense)
```

Record the cslicense commit SHA you built against (`git -C ../cslicense
rev-parse HEAD`) in the report — the master project tracks sync by SHA.

### T3 — Interop verification test

Add `tests/test_license_prep.cpp` to the plugin's existing test target (match
its test conventions). Using the RFC 8032 TEST 1 public key and Vector A from
spec §7 (both are in `cslicense/tests/test_cslicense.cpp` — copy the
constants, not the whole file):

1. `cslic::evaluate(<temp dir>, "<PRODUCT_ID>", pub, now)` on an empty temp
   dir → `Unlicensed`.
2. `cslic::installLicenseText(...)` with Vector A (product id
   `block-rotator`; if `<PRODUCT_ID>` differs, expect and assert the
   wrong-product rejection instead, and additionally verify with
   `cslic::verifyLicense` that the vector parses and validates).
3. If the user-data helper from T1 exists: assert its resolved path equals
   `cslic::defaultLicenseDir("<PLUGIN_DISPLAY_NAME>")`. If it doesn't match,
   that is a **finding to report**, not something to fix here.

All existing tests must still pass after T2/T3.

### T4 — Report back

Write `<TARGET_REPO>/docs/LICENSE_PREP_REPORT.md` and paste its contents as
your final message, using exactly this structure:

```markdown
# LICENSE_PREP_REPORT — <PLUGIN_DISPLAY_NAME>
- Target repo / cloned from: <TARGET_REPO> / <CLONED_FROM>
- Date:
- Baseline: build OK? existing tests: N pass / M fail (list failures)
- JUCE version / C++ standard / CMake layout summary:
- User-data helper: <function name & file, or NONE> — matches
  defaultLicenseDir(): yes/no
- cslicense integrated at SHA: <sha>; prep tests: pass/fail
- Editor architecture note (for HANDOFF-02): main editor class, how overlays
  /modals are currently done, timer usage
- processBlock note (for HANDOFF-02): file/class, existing bypass/ramp logic
- Conflicts or surprises raised: <list or none>
```

## Verification checklist (run before reporting)

- [ ] Existing test suite passes (same count as baseline or better)
- [ ] `cslicense_tests` builds and passes from within this project's build
- [ ] `test_license_prep` passes
- [ ] `git status` shows only: CMake edit, new test file, docs additions
- [ ] Report file written and pasted in full

## Non-goals for this handoff

License panel UI, key-icon/badge, processBlock gating, clipboard detection,
installer or `plugin.config.sh` changes, production keys, and any DSP or
preset work. HANDOFF-02 (integration) follows once the master project
reviews this report.
