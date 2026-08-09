# HANDOFF-06 — Installers: correct the demo copy

Issued by: **ChromeSphynxWeb** (master), 2026-08-10. **Revised same day for
spec v3.0** — an earlier draft said to change "30-day" to "20-day", which
would have replaced one wrong number with another. There is no calendar trial
at all now.

**Run this LAST**, after HANDOFF-07 has landed in both plugins. The copy below
describes behaviour the plugins do not have yet.
Targets: **both** installer repos, identical change in each.

- `csphxAudioPLUGX/XodBlockRotator_INSTALL`
- `csphxAudioPLUGX/XodPoltergeist_INSTALL`

Small and purely textual — no build-system changes, no licensing code. It
exists because the installers still describe the *superseded* licensing model
and state the wrong trial length to the customer.

## Why

Found while verifying HANDOFF-05. Both installers carry copy written against
`chrome-sphynx-license-spec` v3, which was superseded long ago:

| Location | Says | Actually (spec v3.0) |
|---|---|---|
| `src/App.jsx:362` | "**30-day** full-feature trial" | **20-minute session demo**, preset saving disabled |
| `src/App.jsx:173` (comment) | `license.txt`, `trial_start.txt` | `<product>.cslic` only — the demo writes **nothing** |
| `EULA.txt` | no demo clause at all | the website EULA now has one |

The 30-day figure is the serious one: it is shown to the customer during
installation and describes a model that never shipped.

## Tasks

### T1 — Replace the trial copy with demo copy (both repos)

In `src/App.jsx` around line 362, replace the trial sentence with something
like:

> **Free demo** — fully functional for 20 minutes per session, with preset
> saving disabled. Reload the plugin for another session. Enter a licence to
> unlock it permanently.

Then grep the whole repo for other day counts or trial language in
user-visible strings — `grep -rniE '[0-9]+[- ]day|trial' src/ index.html` —
and correct every one. Report all hits.

### T2 — Correct the stale storage comment (both repos)

`src/App.jsx:173` names files from the superseded spec. Under v3.0 the demo
has **no persistent state at all** — no trial file, no rollback guard. The
plugin's user-data directory holds only:

```
<Documents>/Chrome Sphynx Audio/<Display Name>/
    <product>.cslic        purchased licence (Ed25519-signed)
    Presets/               user presets
```

There is no `license.txt`, no `trial_start.txt`, no `license-state.txt`.

### T3 — Add a demo clause to `EULA.txt` (both repos)

The installer displays `EULA.txt` during installation and it must not
contradict the EULA on the website. Add, matching
`chromesphynx.com/legal/eula` §4:

```
4. DEMO
The Software may be evaluated free of charge as a demo, which is fully
functional for 20 minutes of audio processing per session with preset saving
disabled. It runs entirely on your own computer; nothing is requested from
or sent to the Licensor. When a demo session ends the Software passes audio
through without processing until a purchased licence is entered. Reloading
the Software begins a new demo session. Use of the demo in commercial
production is not permitted.
```

Renumber the following clauses if needed, and keep both repos' EULAs
identical apart from the product name.

### T4 — Verify

- `./configure.sh` still succeeds and the app builds (`./build.sh` on Linux).
- Nothing user-visible mentions a day-count trial or the superseded files:
  `grep -rniE '[0-9]+[- ]day|license\.txt|trial_start' . --exclude-dir=node_modules --exclude-dir=target --exclude-dir=.git`
- The two installers' `EULA.txt` differ only by product name (`diff` them).

### T5 — Report

Paste a short summary: what changed in each repo with commit SHAs, every
day-count hit found by the T1 grep, and confirmation of the T4 greps.

## Non-goals

`plugin.config.sh` values (already correct — both installers stage the
renamed artefacts and point at `chromesphynx.com/account`), the build system,
signing, and anything in the plugin repos.
