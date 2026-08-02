# Chrome Sphynx License — Plugin Integration Spec (v1.1)

Audience: the C++/JUCE plugin repos (xodBlockRotator, Poltergeist).
Issuer-side implementation and design rationale: this repo,
`src/lib/licensing/license.ts` and `docs/LICENSING_DESIGN.md`.

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

On plugin load, discover licenses in (first *valid* file wins; prefer `full`
over `trial` when both are valid):

- macOS: `~/Library/Application Support/ChromeSphynx/*.cslic`
- Windows: `%APPDATA%/ChromeSphynx/*.cslic`
- Linux: `~/.config/csphx/*.cslic`

Accepted licenses (pasted or loaded) are stored in that directory as
`<product>.cslic` (trial: `<product>-trial.cslic`).

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

Dry passthrough must be click-free (apply the same ramp used for bypass).
Never mute: a customer opening an old session must hear their track, just
without the effect.

## 5. Expiry check cadence

Evaluate state on plugin instantiation and lazily at most once per minute on
the UI timer thread (never the audio thread). Crossing the expiry boundary
mid-session transitions to `TrialExpired` at the next check.

## 6. Clock-rollback guard (trial only)

Persist a high-water wall-clock mark in the license directory
(`state` file, plain text, epoch seconds): `hw = max(hw, now)` on every
check. If `now < hw - 24h`, set a persistent `rollback` flag ⇒ state
`TrialExpired` regardless of `expiresAt`. Full licenses ignore this entirely.
The 24h tolerance forgives timezone/DST fixes; deleting the state file only
helps an attacker if they also keep the clock rolled back for real.

## 7. Test vectors

Keypair: RFC 8032 Ed25519 TEST 1 (public knowledge — test use only):

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

## 8. Shared C++ module placement

Per DEVELOPMENT_PLAN Phase 3: one small shared module (Ed25519 verify + JSON
parse + this state machine), living in its own repo/submodule consumed by
both plugin repos. The JUCE-side UI (license panel, drag-drop, days-left
badge) stays per-plugin but thin.
