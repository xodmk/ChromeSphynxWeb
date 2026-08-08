# Chrome Sphynx License — Plugin Integration Spec (v2.0)

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

On plugin load, discover `*.cslic` files in that directory (first *valid*
file wins; prefer `full` over `trial` when both are valid). Accepted licenses
(pasted or loaded) are stored there as `<product>.cslic` (trial:
`<product>-trial.cslic`).

Design note: a short typeable serial (`XXXX-XXXX-…`) is deliberately **not**
supported — 64-byte Ed25519 signatures cannot fit one, and the symmetric
checksum schemes that can are keygen-able. The pasted block is the modern
equivalent used by u-he/FabFilter-class vendors.

## 4. Runtime states

| state | condition | audio | GUI |
|-------|-----------|-------|-----|
| `Licensed` | valid `full` license | normal | normal; licensee name in about box |
| `TrialActive` | valid unexpired `trial` | normal | normal + unobtrusive "N days left" badge linking to the store |
| `TrialExpired` | valid but expired `trial`, or rollback flag (§6) | **dry passthrough** (input copied to output, no processing) | locked panel: "Trial expired — Buy / Paste license / Load file" |
| `Unlicensed` | no (valid) license file | dry passthrough | panel: "Start free 20-day trial / Buy / Paste license / Load file" |

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

## 6. Clock-rollback guard (trial only)

Persist a high-water wall-clock mark in the license directory
(`license-state.txt`, plain text, epoch seconds; rollback flag in
`license-rollback.txt`): `hw = max(hw, now)` on every
check. If `now < hw - 24h`, set a persistent `rollback` flag ⇒ state
`TrialExpired` regardless of `expiresAt`. Full licenses ignore this entirely.
The 24h tolerance forgives timezone/DST fixes; deleting the state file only
helps an attacker if they also keep the clock rolled back for real.

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

## 9. Local trial (v2.0)

The plugin owns the trial. No network, no licence file, no server.

**State** lives beside the licence, in the directory from §3
(`<Documents>/Chrome Sphynx Audio/<Display Name>/`):

| File | Contents |
|---|---|
| `trial-start.txt` | epoch seconds of first run, plain text |
| `license-state.txt` | existing high-water clock mark (§6) |
| `license-rollback.txt` | existing rollback flag (§6) |

**Rules**

1. On first evaluation with no valid licence and no `trial-start.txt`, write
   the current time and enter `TrialActive` with the full 20 days.
2. With `trial-start.txt` present, remaining = `20 days - (now - start)`.
   `TrialActive` while positive, `TrialExpired` once not.
3. An unparseable or future-dated `trial-start.txt` ⇒ `TrialExpired`. Fail
   closed; never rewrite it, or deleting the contents would reset the trial.
4. The §6 rollback guard applies unchanged: a persisted rollback flag forces
   `TrialExpired` regardless of arithmetic.
5. A valid `full` licence always wins — it is checked before any trial state,
   and trial files are then irrelevant.

**Cost rules (normative, per §5)**

6. `trial-start.txt` is read **once**, at construction, and its value cached
   in memory. `prepareToPlay` compares against the cached integer and never
   re-reads the file.
7. The §6 high-water mark is written **at most once per plugin instance**, at
   construction, and **only while a trial is in effect**. A licensed plugin
   writes nothing, ever. Repeatedly rewriting it on every evaluation — as a
   naive reading of §6 would suggest — would put a file write on the host's
   prepare path for no benefit.
8. When a valid `full` licence is present, none of §9 executes at all: no
   trial file is opened, no timestamp is compared, and `settled` is set so
   `prepareToPlay` returns immediately.

**Threat model, stated plainly.** Deleting `trial-start.txt`, or reinstalling
into a clean user-data directory, restarts the trial. This is accepted: it is
casual deterrence, matching how indie audio software generally behaves, and
the alternative (server-issued trials) cost a database and was defeated by a
second email address anyway.

**States** are otherwise exactly §4 — a trial and a licence produce the same
`TrialActive` / `Licensed` behaviour, and expiry still means dry passthrough,
never silence.

## 8. Shared C++ module placement

Per DEVELOPMENT_PLAN Phase 3: one small shared module (Ed25519 verify + JSON
parse + this state machine), living in its own repo/submodule consumed by
both plugin repos. The JUCE-side UI (license panel, drag-drop, days-left
badge) stays per-plugin but thin.
