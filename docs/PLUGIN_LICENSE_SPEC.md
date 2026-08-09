# Chrome Sphynx License — Plugin Integration Spec (v3.0)

> **v3.0 (2026-08-10) — session demo replaces the 20-day trial.**
> An unlicensed plugin now runs a **fully functional 20-minute session demo
> with preset saving disabled**, instead of a 20-day calendar trial.
>
> This is a net *simplification*. Deleted outright: `trial-start.txt`, the
> 20-day arithmetic, the whole clock-rollback guard (`license-state.txt`,
> `license-rollback.txt`, the 24 h tolerance, §6) and every fail-closed tamper
> rule in the old §9. A sample counter cannot be defeated by moving the clock,
> so that machinery has nothing left to defend. It also closes the real
> weakness of the calendar trial: deleting one file restarted it, whereas a
> session demo has no state to delete.
>
> **Responsibility moves.** `cslicense` no longer knows about trials or demos
> at all — it answers one question: *is there a valid licence for this
> product?* The demo timer belongs to the processor, because counting samples
> needs a sample rate and a buffer, which the shared module has no view of.
>
> Owner decisions taken with this revision — override if you disagree:
> **per-instance** timer rather than per-DAW-session (cross-instance
> coordination buys friction, not protection); **dry passthrough** on expiry,
> consistent with §4 and never a silent track; **countdown visible
> throughout**, reusing the existing badge.
>
> Superseded: §6 entirely, and v2.0's §9 local calendar trial.

> **v2.1 (2026-08-09) — normative cost model.** §5 is rewritten: a licensed
> plugin performs **no licensing work at all** after construction — nothing in
> `prepareToPlay`, no disk, no crypto. Full evaluation runs exactly twice in a
> plugin's life (construction, and after a user installs a licence). v1.4's
> instruction to evaluate in `prepareToPlay` is withdrawn as a defect: hosts
> call it on every sample-rate and buffer-size change.
>
> **v2.0 (2026-08-09) — the trial is now plugin-managed.** Trials are no
> longer issued as signed `.cslic` files by the website. The plugin starts its
> own 20-day trial on first run and tracks it locally. Purchased licences are
> unchanged: still Ed25519-signed, still verified offline, still perpetual.
>
> What this changes for implementers:
> - The website no longer has a trial endpoint; nothing is requested or
>   emailed for a trial.
> - `cslicense` gains local trial state (§9) alongside licence verification.
> - Every `.cslic` a customer receives is now `type: "full"`. The `trial` type
>   and `expiresAt` remain in the format — the verifier must still handle them
>   — but nothing issues them today.
> - Purchased licences are **deterministic**: derived from the order, never
>   from a clock, so a re-send is byte-identical to the original.


Audience: the C++/JUCE plugin repos (Block Rotator, Poltergeist).
Issuer-side implementation and design rationale: this repo,
`src/lib/licensing/license.ts` and `docs/LICENSING_DESIGN.md`.
Reference C++ implementation: `csphxAudioPLUGX/cslicense/` (all §7 vectors pass).

Lineage: supersedes `csphxInstall_prompts/chrome-sphynx-license-spec.md` v3
(HMAC short serials, 5-day local trial, silence on expiry). Retained from v3:
license storage per `CSPHX_USER_DATA_STANDARD.md` (§3) and the UI styling
details (§4). See `docs/LICENSING_DESIGN.md` "Spec lineage & reconciliation".

## 1. File format (`.cslic`)

```
-----BEGIN CHROME SPHYNX LICENSE-----
<base64, line-wrapped at 64 chars>
-----END CHROME SPHYNX LICENSE-----
```

The base64 decodes to an **envelope** (JSON object):

| field | type | meaning |
|-------|------|---------|
| `v` | int | envelope/format version, currently `1` |
| `payload` | string | the license payload as a JSON **string** (exact signed bytes) |
| `sig` | string | base64 Ed25519 signature over the UTF-8 bytes of `payload` |

The **payload** string parses to:

| field | type | presence | meaning |
|-------|------|----------|---------|
| `v` | int | always | payload version, currently `1` |
| `type` | string | always | `"trial"` or `"full"` |
| `product` | string | always | product id: `"block-rotator"`, `"poltergeist"` |
| `licensee` | string | always | display name for the plugin UI |
| `email` | string | always | requester/customer email (watermark) |
| `issuedAt` | string | always | ISO 8601 UTC, e.g. `2026-08-02T00:00:00Z` |
| `expiresAt` | string | trial only | ISO 8601 UTC; absent ⇒ perpetual |
| `orderId` | string | full only | MoR order reference |

Critical rule: **verify the signature over the raw `payload` string bytes,
then parse it.** Never re-serialize JSON for verification — no canonical-JSON
logic exists or is needed on either side.

## 2. Verification algorithm

1. Strip the BEGIN/END armor lines; concatenate remaining lines; strip all
   whitespace; base64-decode → envelope JSON.
2. Reject unless `v == 1` and `payload`/`sig` are strings.
3. Ed25519-verify `sig` over the UTF-8 bytes of `payload` using the embedded
   public key (raw 32 bytes). Suggested library: monocypher
   (`crypto_ed25519_check`) or libsodium — do not pull in OpenSSL.
4. Parse `payload` as JSON; reject unless `v == 1`, `type` is known, and
   `product` matches this plugin (or is `"*"`, reserved for future bundles).
5. If `expiresAt` present: expired when `now_utc > expiresAt`.

Any failure ⇒ the file is ignored (treated as absent), with the reason shown
in the license panel if the user explicitly loaded it.

## 3. License entry & discovery

**Primary entry is paste** (u-he-style offline unlock): the license panel has
a text box where the user pastes the whole armored block from the email. The
"name + serial" pair is carried *inside* the block — the licensee name lives
in the signed payload, so there is nothing else to type. On paste: run §2;
if valid, write the block to the license directory below and show the new
state; if invalid, show the §2 failure reason inline.

**Clipboard auto-detect** (FabFilter-style): when the license panel opens and
the system clipboard contains both armor markers, offer a one-click
"Use license from clipboard" button instead of requiring a manual paste.

**Secondary entry**: "Load license file" / drag-drop of a `.cslic` file.

**License directory** (v1.3, decision D-L2 2026-08-03): licenses live in the
Documents-based standard directory on **every OS**:

```
<Documents>/Chrome Sphynx Audio/<Plugin Display Name>/
```

obtained from `cslic::defaultLicenseDir(displayName)`. Each plugin exposes
one public `getLicenseDirectory()` helper returning exactly this, used
everywhere licensing touches disk. This is deliberately **decoupled from
preset storage**, which may live elsewhere (e.g. Apple's presets tree on
macOS): presets follow the preset helper, licenses follow this rule.
(v1.2 said "obtain from the PresetManager helper"; that failed on macOS
where Block Rotator's preset base is `~/Library/Audio/Presets/CSPHX/…`.)

On plugin load, discover `*.cslic` files in that directory; the first valid,
unexpired `full` licence for this product wins. Accepted licences (pasted or
loaded) are stored there as `<product>.cslic`. Since v3.0 nothing issues
`trial`-type licences — the verifier still parses them, but only a perpetual
`full` licence unlocks the plugin.

Design note: a short typeable serial (`XXXX-XXXX-…`) is deliberately **not**
supported — 64-byte Ed25519 signatures cannot fit one, and the symmetric
checksum schemes that can are keygen-able. The pasted block is the modern
equivalent used by u-he/FabFilter-class vendors.

## 4. Runtime states

| state | condition | audio | GUI |
|-------|-----------|-------|-----|
| `Licensed` | valid `full` licence | normal | normal; licensee name in about box |
| `DemoActive` | no licence, demo budget remaining (§9) | normal | countdown badge `DEMO · 12:04`, linking to the store; preset **save** disabled |
| `DemoExpired` | no licence, demo budget exhausted | **dry passthrough** (input copied to output, no processing) | locked panel: "Demo ended — Buy / Paste licence / Load file" |

(v3.0 replaced `TrialActive`/`TrialExpired`/`Unlicensed`. There is no longer
an "unlicensed but not demoing" state: absence of a licence *is* the demo.)

Dry passthrough is implemented via the plugin's **existing** bypass-style
early return in `processBlock` — never by new per-block processing. Never
mute: a customer opening an old session must hear their track, just without
the effect.

**Audio-thread budget (v1.4, normative — zero CPU impact):** the entire
audio-thread footprint of licensing is one relaxed `std::atomic<bool>` load
folded into the existing early-return condition
(`if (bypass || !processingAllowed) return;`). No ramps, no crossfades, no
dry-buffer copies, no locks, no allocations, no file I/O, no other added
work in `processBlock`, and no modification to the internal DSP. Click-free
transition logic is unnecessary because the gate is latched (§5): its value
never changes during continuous playback. (v1.3's "click-free ramp"
requirement is withdrawn — it induced per-block crossfade machinery, which
violates this budget.)

UI styling (carried over from license-spec v3 §7): Licensed shows nothing —
identical to a license-free plugin. TrialActive shows a small
"TRIAL · N days remaining" pill in gold `#c8a23a` (amber + hours at ≤24h)
beside a key-icon button that opens the license panel. TrialExpired /
Unlicensed auto-open the panel when the editor opens; it is not dismissable
while unlicensed. "Get your license" opens the store URL in the default
browser. Serial auto-format from v3 does not apply — the paste box takes the
whole armored block.

## 5. Evaluation points & the settled gate (v2.1 — normative cost model)

**Once a valid perpetual licence is found, the plugin does no licensing work
of any kind for the rest of its life** — no disk access, no cryptography, no
arithmetic, nothing in `prepareToPlay`. The only residue anywhere is a single
atomic load in `processBlock`, described in §4.

### Full evaluation — expensive, and strictly bounded

`cslic::evaluate()` scans the licence directory, reads files, verifies an
Ed25519 signature, and may write the rollback high-water mark. It is far too
costly to repeat casually. It runs in exactly two situations, both
non-realtime:

1. **Once at processor construction.**
2. **After the user installs a licence** (paste / load file / drag-drop),
   on the message thread.

It must **not** run in `prepareToPlay`, and must not run on a timer.
(v1.4 placed it in `prepareToPlay`; that was wrong — hosts call
`prepareToPlay` on every sample-rate and buffer-size change, and some on each
transport start, so a directory scan plus signature verification plus a file
write repeated on a hot path is exactly the overhead this spec exists to
prevent.)

### The settled flag

Evaluation produces a latched `std::atomic<bool> processingAllowed` plus a
plain `bool settled`. `settled` is true when the outcome can never change on
its own — that is, when a valid `full` licence was found. From then on:

| | Licensed (settled) | Trial active | Expired / unlicensed |
|---|---|---|---|
| `processBlock` | 1 relaxed atomic load | 1 relaxed atomic load | 1 relaxed atomic load |
| `prepareToPlay` | **nothing — immediate return** | one integer comparison | one integer comparison |
| Disk / crypto | never again | never (values cached in memory) | never |

### `prepareToPlay` — the only permitted periodic check

```
if (settled) return;                 // licensed: zero work, forever
if (now - cachedTrialStart >= 20 days) processingAllowed = false;
```

Two integers and a comparison, against values already resident in memory from
construction. No file is opened, no signature is checked, and nothing is
written. This is what lets a running trial notice its own expiry without
polling anything.

### The gate is latched during playback

`processingAllowed` never flips between `processBlock` calls in a continuous
stream — it changes only at `prepareToPlay` or on a user-initiated unlock, so
no ramp or crossfade is needed (§4). Crossing the expiry boundary mid-session
updates only the GUI, from cached values; audio enforcement lands at the next
`prepareToPlay`. The single permitted mid-session change is the user pasting a
licence, where a one-time transition is accepted.

### Why the atomic load cannot be zero

Something must distinguish licensed from unlicensed at block scope, and a
relaxed load of an in-cache `bool` is the cheapest possible expression of it —
the same operation the existing bypass check already performs, on a branch the
predictor gets right every time. Removing it would require indirect dispatch
(function pointer or virtual call), which costs strictly more than the load it
replaces. One predictable load per buffer is the floor, and it is not
measurable against any real DSP workload.

## 6. Clock-rollback guard — REMOVED in v3.0

This section is deleted. It existed only to stop someone winding the system
clock back to extend a 20-day calendar trial. The v3.0 demo counts **samples
processed**, so the clock is irrelevant and there is nothing to guard.

Implementations must remove `license-state.txt` and `license-rollback.txt`
along with the tolerance logic. Existing files may be left on disk harmlessly;
do not read them, and do not write new ones.

Purchased licences are perpetual and were never affected by this guard.

## 7. Keys

Two keys exist and must never be confused. The **production** key is what
ships; the **test** key exists only so the §7.2 vectors can be checked by
anyone, including in public CI.

### 7.1 Production signing key (generated 2026-08-07)

This is the key to compile into every released plugin. The private half is
held only in the website's `CS_LICENSE_PRIVATE_KEY` environment variable and
in the owner's password manager — it is not in this repository and must never
be.

```
deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275
```

```cpp
inline constexpr uint8_t kLicensePublicKey[32] = {
    0xde, 0xda, 0x76, 0xf2, 0xf4, 0x8f, 0x57, 0x79,
    0x5d, 0x1f, 0x7c, 0xc2, 0x5e, 0x28, 0x3d, 0x88,
    0x11, 0xc6, 0xc4, 0x92, 0xef, 0xb0, 0x0b, 0xca,
    0xa9, 0x36, 0x58, 0x25, 0x86, 0x96, 0x42, 0x75,
};
```

Publishing a public key is safe by design: it can verify signatures but
cannot create them. Regenerate the C initializer at any time with
`npm run license -- cppkey --pubkey <hex>`.

A plugin built against this key accepts only licences signed by its private
half. Mismatched halves fail in a way that looks like "my licence doesn't
work", so verify the pair before any release build:

```
npm run license -- issue --type full --product block-rotator \
  --email you@example.com --out /tmp/t.cslic
npm run license -- verify --file /tmp/t.cslic --pubkey deda76f2…
```

### 7.2 Test vectors

Keypair: RFC 8032 Ed25519 TEST 1 (public knowledge — test use only). The
vectors below are signed with it, so they verify **only** against this key,
never against the production key above:

- private seed: `9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60`
- public key:  `d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a`

**Vector A — trial license.** Must verify OK; expired iff `now > 2026-08-22T00:00:00Z`.

```
-----BEGIN CHROME SPHYNX LICENSE-----
eyJ2IjoxLCJwYXlsb2FkIjoie1widlwiOjEsXCJ0eXBlXCI6XCJ0cmlhbFwiLFwi
cHJvZHVjdFwiOlwiYmxvY2stcm90YXRvclwiLFwibGljZW5zZWVcIjpcInRlc3RA
ZXhhbXBsZS5jb21cIixcImVtYWlsXCI6XCJ0ZXN0QGV4YW1wbGUuY29tXCIsXCJp
c3N1ZWRBdFwiOlwiMjAyNi0wOC0wMlQwMDowMDowMFpcIixcImV4cGlyZXNBdFwi
OlwiMjAyNi0wOC0yMlQwMDowMDowMFpcIn0iLCJzaWciOiJUNW9XT2l5L3YrSnlD
UlR2dmhBbmM1eVpwUkVrOENhbzlwb2ZiRXJCRHFTRUZWbzUvUGRyUHJjYjhocVJp
MEc4WTF4T2dqam9QbG9qeTVmdW91UnlDZz09In0=
-----END CHROME SPHYNX LICENSE-----
```

**Vector B — full license** for product `poltergeist`, licensee "Jane Doe".
Must verify OK; never expires. (Also: loaded into a *block-rotator* build it
must be rejected at step 4 — wrong product.)

```
-----BEGIN CHROME SPHYNX LICENSE-----
eyJ2IjoxLCJwYXlsb2FkIjoie1widlwiOjEsXCJ0eXBlXCI6XCJmdWxsXCIsXCJw
cm9kdWN0XCI6XCJwb2x0ZXJnZWlzdFwiLFwibGljZW5zZWVcIjpcIkphbmUgRG9l
XCIsXCJlbWFpbFwiOlwiamFuZUBleGFtcGxlLmNvbVwiLFwiaXNzdWVkQXRcIjpc
IjIwMjYtMDgtMDJUMDA6MDA6MDBaXCIsXCJvcmRlcklkXCI6XCJURVNULTAwMDFc
In0iLCJzaWciOiJKL2s0ampOZFlRRDJvYklKYmZvQjg3ZWJYdisrbWdnZndYeXc5
UDhsN05iUHBGZzJ6Y1VYN3R0U1ZXb0d2UUN4ZFFReW93bUVneWswUTNRdXgxcE9D
dz09In0=
-----END CHROME SPHYNX LICENSE-----
```

**Vector C — tamper check.** Take Vector A, base64-decode the armor body,
change any byte inside the `payload` string, re-encode: verification must
fail at step 3.

Regenerate vectors any time with this repo:
`node scripts/license-cli.ts issue …` / `verify --pubkey <hex>`.

## 9. Session demo (v3.0)

An unlicensed plugin is **fully functional for 20 minutes of processing per
instance, with preset saving disabled**. There is no persistent state of any
kind: no files, no timestamps, nothing to tamper with or delete.

The demo lives entirely in the processor. `cslicense` is not involved — it
reports `Licensed` or `Unlicensed` and knows nothing about demos.

### Counting

Count **samples processed**, never wall-clock time:

```cpp
demoSamplesRemaining_ -= numSamples;   // set to 20*60*sampleRate in prepareToPlay
```

Sample counting is why §6's rollback guard is gone — the clock is irrelevant,
so moving it achieves nothing. It also means a paused transport does not burn
the demo, which is fairer than wall time.

`prepareToPlay` sets the budget from the current sample rate. A host changing
sample rate mid-session re-derives it; do **not** treat that as a reset —
scale the remaining budget, or simply recompute from the fraction already
consumed.

### Expiry, without a click

The gate flips *during* playback, which no other state in this spec does, so
it needs a ramp — the one place §4's "no ramps" rule is deliberately relaxed:

1. While `demoSamplesRemaining_ > 0`: process normally.
2. On reaching zero: ramp output gain 1 → 0 over ~30 ms (about 1440 samples at
   48 kHz), applied once.
3. Once the ramp completes: latch `demoExpired_` and take the **existing**
   bypass early-return — dry passthrough, never silence, exactly as §4.

After step 3 the plugin is cheaper than a licensed one: it returns before any
DSP runs. The ramp executes once per instance, in demo mode only, and never in
a licensed build.

### Preset saving

Disable **preset saving only** — the "Save" path in the preset manager.

**`getStateInformation` must keep working.** It is how the host stores plugin
state in the project file; blocking it would break session recall and read as
data loss rather than a demo limit. Only the user-facing preset save is
refused, with a message pointing at the licence panel.

### Cost rules (normative, per §5)

1. When a valid licence is present, **none of §9 executes**: no counter is
   decremented, no ramp exists, `settled` is set, and `prepareToPlay` returns
   immediately. A paying customer pays nothing for the demo mechanism.
2. In demo mode the per-block cost is one 64-bit subtract and one compare,
   alongside the §4 atomic load. No clock call, no allocation, no I/O.
3. The ramp is the only per-sample work, once per instance, ~30 ms.

### States

`Licensed` and `DemoActive` both process audio normally. `DemoExpired` is
`TrialExpired` under a new name: dry passthrough plus the licence panel. The
badge shows the countdown throughout — `DEMO · 12:04` — switching to a
"demo ended" panel at zero.

### Threat model, stated plainly

Removing and re-adding the plugin grants another 20 minutes, and two instances
on separate tracks each get their own. That is accepted and is not the point:
**disabled preset saving is what prevents production use**, not the timer. The
demo has no reset to find, no file to delete, and no clock to move — strictly
more robust than the calendar trial it replaces, at the cost of uninterrupted
long-session evaluation.

## 8. Shared C++ module placement

Per DEVELOPMENT_PLAN Phase 3: one small shared module (Ed25519 verify + JSON
parse + this state machine), living in its own repo/submodule consumed by
both plugin repos. The JUCE-side UI (license panel, drag-drop, days-left
badge) stays per-plugin but thin.
