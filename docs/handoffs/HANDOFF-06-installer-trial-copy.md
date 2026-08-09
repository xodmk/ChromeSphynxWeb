# HANDOFF-06 — Installers: correct the trial copy

Issued by: **ChromeSphynxWeb** (master), 2026-08-10.
Targets: **both** installer repos, identical change in each.

- `csphxAudioPLUGX/XodBlockRotator_INSTALL`
- `csphxAudioPLUGX/XodPoltergeist_INSTALL`

Small and purely textual — no build-system changes, no licensing code. It
exists because the installers still describe the *superseded* licensing model
and state the wrong trial length to the customer.

## Why

Found while verifying HANDOFF-05. Both installers carry copy written against
`chrome-sphynx-license-spec` v3, which was superseded long ago:

| Location | Says | Actually |
|---|---|---|
| `src/App.jsx:362` | "**30-day** full-feature trial" | **20 days** (`cslic::kTrialDays`) |
| `src/App.jsx:173` (comment) | `license.txt`, `trial_start.txt` | `<product>.cslic`, `trial-start.txt` |
| `EULA.txt` | no trial clause at all | the website EULA now has one |

The 30-day figure is the serious one: it is shown to the customer during
installation, and it promises ten days more than the plugin grants. Someone
relying on it would find the plugin stopping a third of the way before they
expected.

## Tasks

### T1 — Correct the trial length (both repos)

In `src/App.jsx` around line 362, change **30-day** to **20-day**. Then grep
the whole repo for other day counts in user-visible strings — `grep -rniE
'[0-9]+[- ]day' src/ index.html` — and correct any others. Report every hit.

### T2 — Correct the stale storage comment (both repos)

`src/App.jsx:173` names files from the superseded spec. The current model
(spec v2.0 §9 / v1.3 §3) is:

```
<Documents>/Chrome Sphynx Audio/<Display Name>/
    <product>.cslic        purchased licence (Ed25519-signed)
    trial-start.txt        local trial start, epoch seconds
    license-state.txt      clock-rollback high-water mark
    Presets/               user presets
```

Note `trial-start.txt` uses hyphens, and there is no `license.txt`.

### T3 — Add a trial clause to `EULA.txt` (both repos)

The installer displays `EULA.txt` during installation and it must not
contradict the EULA on the website. Add, matching
`chromesphynx.com/legal/eula` §4:

```
4. TRIAL
The Software may be evaluated free of charge for 20 days. The trial begins
the first time you load the plugin and runs entirely on your own computer.
When the trial period ends the Software passes audio through without
processing until a purchased licence is entered.
```

Renumber the following clauses if needed, and keep both repos' EULAs
identical apart from the product name.

### T4 — Verify

- `./configure.sh` still succeeds and the app builds (`./build.sh` on Linux).
- No remaining user-visible reference to a 30-day trial, `license.txt`, or
  `trial_start.txt`: `grep -rniE '30[- ]day|license\.txt|trial_start' . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=.git`
- The two installers' `EULA.txt` differ only by product name (`diff` them).

### T5 — Report

Paste a short summary: what changed in each repo with commit SHAs, every
day-count hit found by the T1 grep, and confirmation of the T4 greps.

## Non-goals

`plugin.config.sh` values (already correct — both installers stage the
renamed artefacts and point at `chromesphynx.com/account`), the build system,
signing, and anything in the plugin repos.
