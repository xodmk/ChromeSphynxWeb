# Order of work — plugin release sequence

Current as of 2026-08-10. Read this before running any handoff; the ledger
records *state*, this records *sequence*.

## Right now: both plugins do not compile

`cslicense` moved to **`057e809`** (spec v3.0), which deleted
`State::TrialActive`, `State::TrialExpired`, `refreshTrial()`, `Status::daysLeft`
and `Status::trialStart`. Both plugin repos still reference those symbols, and
because `cslicense` is consumed as a **path dependency on the sibling working
tree** — not a pinned submodule — the breakage arrived with no commit in either
plugin repo.

This is open item **D1**, and it has now bitten twice. Nothing is lost (both
repos are clean and committed), but the fix is to run the handoffs below, in
this order.

## The sequence

### 1. Block Rotator → HANDOFF-07 (session demo) — do this first

It is the only thing standing between Block Rotator and a compiling,
release-ready plugin. Everything else there is done: production key, naming,
installer sync, load measurer removed, v2.1 cost model.

Scope is small — adopt the simplified `cslicense` API, add the sample counter
and fade, disable preset saving, replace trial copy in the GUI.

### 2. Poltergeist → HANDOFF-05 **and** HANDOFF-07 in ONE session

Poltergeist has had nothing since HANDOFF-02B. Give it both briefs together
and let it do a single edit-build-verify cycle:

- **HANDOFF-05**: production key, `PRODUCT_NAME "Poltergeist"`, VST3 class-ID
  measurement, installer upstream keys, customer-doc cleanup (the 34 "Spectral
  Ghost" occurrences, with the product-vs-feature split), v2.1 cost model.
- **HANDOFF-07**: session demo.

Do **not** run these as two sessions. Both touch `processBlock` and
`LicenseConfig.h`; combining them is the whole reason 04A/04B were folded into
05 in the first place. Note Block Rotator's result: the VST3 class ID was
**unchanged** by the rename, so that risk is now measured rather than feared.

Baseline to expect: 249/258 with nine documented pre-existing failures, plus
whatever the v3.0 API change breaks — the session should fix those, not
preserve them.

### 3. Both installers → HANDOFF-06 (demo copy) — last

Only meaningful once the plugins actually behave this way. It was rewritten
on 2026-08-10 for v3.0; an earlier draft would have changed "30-day" to
"20-day", which is also wrong.

### 4. Then, before any public build

- **Decide D1** — pin `cslicense` per release (submodule, or record the
  expected SHA and fail configure on mismatch). Recommended: the SHA check,
  which is lighter and would have turned both of today's breakages into one
  clear message at configure time.
- **Host verification** — load both plugins in a real DAW and confirm the four
  §4 states render. Never yet done by a human, in either plugin.
- **Paddle onboarding** — independent of all the above and the longest
  external clock (3–7 business days); can start any time.

## Why this order

Block Rotator first because it is one small change from done, and because a
smaller repo with zero pre-existing failures surfaces surprises unambiguously.
Poltergeist second and combined, because it is furthest behind and benefits
most from one pass. Installers last, because their copy documents plugin
behaviour that must exist first.
