# Chrome Sphynx Audio — Licensing & 20-Day Trial Design

Status: v1.1 — 2026-08-03 (v1 decisions confirmed 2026-08-02; paste-first
delivery UX + 20-day length re-confirmed 2026-08-03; website side implemented)
Companion spec for the plugin repos: `docs/PLUGIN_LICENSE_SPEC.md`

## What we know vs. what we're inferring

### Observed (measured facts, with source)

**Reference vendors (fetched/searched 2026-08-02)**
- Audio Damage ships **no DRM**: no iLok, no online activation, no account;
  customers install on any machines they own. Historically no demo versions
  (money-back guarantee instead); newer demos (Circa) are *session*-limited —
  no preset save, audio stops 20 minutes after insertion — not calendar
  trials. License transfers are no longer allowed.
  (Sources: audiodamage.com/pages/support; Circa manual PDF; KVR threads
  t=409891, t=487518; Gearspace t=1192034.)
- u-he uses offline name+serial unlock typed into the plugin; one license
  covers macOS/Windows/Linux; demos never expire but emit periodic crackle.
  (Sources: u-he.com/support/faq/licenses/; KVR t=576454.)
- Community sentiment on KVR/Gearspace is strongly hostile to dongles and
  online-required activation; offline serial/license-file systems are the
  accepted norm for indie vendors.

**This project**
- No licensing/activation code exists in the plugin or installer repos
  (grep, DEVELOPMENT_PLAN.md "Observed").
- Website: Next.js 14 App Router on Vercel; Node 22 available locally.
- Implemented in this repo (this revision, all tests passing, `npm test`):
  `src/lib/licensing/` (Ed25519 sign/verify, .cslic armor, trial payload),
  `/api/trial` route, `/trial` page, `scripts/license-cli.ts`.

### Working hypotheses (flagged)

- H-L1: Email-gating provides enough friction for a 20-day trial; serial
  trial-farming via throwaway emails will be economically irrelevant at our
  scale. To be re-measured after launch (issuance vs. purchase rates).
- H-L2: Dry passthrough on expiry generates fewer support tickets than
  muting. Based on vendor-forum anecdotes, not measurement.
- H-L3: A per-instance in-memory rate limit is adequate pre-launch traffic
  protection on Vercel. Provisional.

### Deferred questions + measurement plan

| # | Question | How to resolve |
|---|----------|----------------|
| L1 | Durable trial-issuance store (Turso vs Vercel Postgres) | Decide during MoR/Vercel setup; the store seam is `src/lib/licensing/store.ts`. Required before launch. |
| L2 | Transactional email provider + sending domain (SPF/DKIM) | Set up Resend (already wired via `RESEND_API_KEY`) or swap; test deliverability to gmail/outlook. Required before launch. |
| L3 | Disposable-email filtering needed? | Ship without; measure trial-issuance patterns post-launch (H-L1). |
| L4 | Key ceremony: where is the private key generated/backed up? | Owner decision; see Operations below. Required before first real license. |

## Decisions (owner-confirmed 2026-08-02)

1. **Trial issuance**: email-gated. The website issues an Ed25519-signed
   trial license valid for 20 days, one per (email, product). No in-plugin
   networking; runtime verification is fully offline.
2. **Machine binding**: none — for trials or full licenses. Full licenses
   follow the Audio Damage model: install on any machines you own; the
   licensee name/email embedded in the file is the (social) watermark.
3. **Expiry behavior**: when the trial lapses with no full license present,
   the plugin passes audio through dry and locks the GUI behind a
   "Trial expired — buy or load license" panel. It never mutes a session.
4. **Scope now**: website side + specs in this repo; the C++ verifier and
   JUCE unlock UI are implemented later in the plugin repos against
   `PLUGIN_LICENSE_SPEC.md`.
5. **Delivery UX** (2026-08-03): paste-first, u-he-style. The armored key
   block is sent inline in the email (file attachment secondary); the user
   pastes it into the plugin's license panel, with FabFilter-style clipboard
   auto-detect. The licensee "name + serial" both live inside the signed
   block. Short typeable serials were considered and rejected: they cannot
   carry an Ed25519 signature, and the symmetric schemes that fit are
   keygen-able (the historical weakness of classic serial systems).
6. **Trial length** (2026-08-03): re-confirmed at 20 days after comparing
   the FabFilter 30-day norm; the constant is `TRIAL_DAYS` in
   `src/lib/licensing/license.ts`.
7. **D-L1** (2026-08-03, escalated by the Poltergeist prep report): official
   display name is **Poltergeist** (product id `poltergeist`);
   "Spectral Ghost" remains the internal DSP-core codename only. HANDOFF-02
   renames the user-data folder with a one-time migration.
8. **D-L2** (2026-08-03, escalated by the Block Rotator prep report):
   license files live in `<Documents>/Chrome Sphynx Audio/<Display Name>/`
   on every OS (`cslic::defaultLicenseDir`), decoupled from preset storage.
   Spec bumped to v1.3.
9. **Zero audio-thread impact** (owner directive 2026-08-03): licensing adds
   zero CPU cost to real-time processing, modifies no DSP, and adds nothing
   to `processBlock` beyond one relaxed atomic load folded into the existing
   bypass early-return. Evaluation runs only at construction /
   post-install (spec v2.1 §5 removed `prepareToPlay`, where hosts call it on
   every sample-rate change); once licensed the plugin does no licensing work
   at all, and `prepareToPlay` returns immediately. The gate is latched and
   never flips
   during playback. Spec bumped to v1.4.

   Correction record: the observation remains that expired plugins must pass
   audio through dry (decision #3). What changes is the mechanism — the
   click-free crossfade required by spec ≤v1.3 §4 and mandated in the
   initial HANDOFF-02 issue induced per-block ramp/copy work on the audio
   thread and is withdrawn; the latched gate makes ramping unnecessary
   because state cannot change mid-playback. No incorrect code reached the
   target repos' committed state (verified: both at their HANDOFF-01
   commits with clean `plugin/` trees).

Deviation from DEVELOPMENT_PLAN.md v1 noted: Phase 3 originally recommended a
feature-limited demo (D6). Owner decision supersedes it with the 20-day
time-limited trial; the "offline verification, no activation server" principle
is preserved — the only online step is one-time trial/license *issuance*.

## Architecture revision — stateless (2026-08-09)

Owner directive after reviewing complexity: keep offline self-signed licences,
but remove the infrastructure. **There is no database.** Paddle is the system
of record; we store nothing.

Three changes made it possible:

1. **The trial moved into the plugin.** It writes a first-run timestamp and
   counts 20 days locally, guarded by the §6 clock-rollback check. No trial
   endpoint, no email, no per-address enforcement. *This reverses decision #1
   (email-gated trials), which was the single requirement that forced a
   database.* Its anti-abuse value was always weak — a second email address
   defeated it — and it cost a store, a mail provider, and a web form. The
   original `chrome-sphynx-license-spec` v3 had a local trial; this returns to
   it, at 20 days rather than 5.
2. **Licence generation is deterministic.** The payload is derived entirely
   from the order — product, email, transaction id, and the transaction's own
   timestamp — never from `now()`. The same purchase therefore signs to
   byte-identical output forever. A duplicate webhook re-sends the same file
   instead of minting a second licence, so the idempotency table is gone.
   Guarded by `tests/determinism.test.ts`, which exists to protect the
   architecture rather than the function.
3. **Re-sends query Paddle.** `/account` asks Paddle what the customer bought
   (`GET /customers?email=` then `GET /transactions?customer_id=&status=completed`)
   and regenerates each licence. No order table.

Removed: `store.ts`, `store-postgres.ts`, `schema.sql`, `db-migrate.ts`, the
`pg` dependency, `DATABASE_URL`, and `/api/trial`. Runtime dependencies are
back to Next and React alone. What survives is the part that mattered — an
Ed25519 licence the plugin verifies offline, with no runtime dependency on us
or on Paddle.

Trade-offs accepted: a local trial is resettable by a determined user
(reinstall or clock manipulation past the guard) — normal for indie audio
software and treated as casual deterrence, not protection; and licence
re-sends now depend on Paddle's API being reachable, though only for re-sends,
never for a plugin to keep working.

## Spec lineage & reconciliation (2026-08-03)

An earlier spec exists at
`csphxAudioVST3/csphxInstall_prompts/chrome-sphynx-license-spec.md` (v3, in
the legacy dev directory),
with a companion handoff prompt (`license-integration-claudecode-prompt.md`).
It predates the owner decisions above and itself deferred Ed25519 to a
"future v4". This design is that v4. Reconciliation:

| v3 element | Disposition |
|---|---|
| HMAC-SHA256 truncated serials (`BR-XXXXX-…`) | **Superseded** by Ed25519-signed key block (owner decision #1/#5). |
| 5-day trial, auto-started locally on first run | **Superseded** by 20-day email-gated signed trial (#1/#6). |
| Audio silenced on expiry (200 ms ramp) | **Superseded** by dry passthrough + locked GUI (#3). |
| Future-timestamp anti-rollback check | **Superseded** by the 24 h high-water guard (spec §6). |
| License storage per `CSPHX_USER_DATA_STANDARD.md` (`<Documents>/Chrome Sphynx Audio/<Plugin Display Name>/`, resolved via the plugin's PresetManager helper) | **Adopted** into spec v1.2 §3 and `cslicense`. |
| UI styling: gold TRIAL pill, amber ≤24 h, key icon, auto-open non-dismissable panel on expiry, wrong-product status | **Adopted** into spec v1.2 §4 (paste box replaces the serial field). |

Both v3 files carry SUPERSEDED banners pointing here. The installer template
(`license_install/`) needs **no changes**: it is license-agnostic by design
and only points users at `PLUGIN_LICENSE_URL`.

## HandOff workflow (master-project process)

This repo is the company-wide master for e-commerce, licensing, and website
integration. Plugin-side changes are NOT made from this project directly.
Instead:

1. Decisions and specs are finalized here (this doc + `PLUGIN_LICENSE_SPEC.md`).
2. A **HandOff prompt** is written to `docs/handoffs/` and passed as the first
   message to a Claude Code session opened in the target plugin project.
   Since 2026-08-03 the RELEASE work directory is
   `/home/csphx/XODMK/xodCode/csphxAudioPLUGX/` (cslicense +
   `XodBlockRotator_PLUGX`, `XodPoltergeist_PLUGX`, `XodBlockRotator_INSTALL`,
   `XodPoltergeist_INSTALL`); `csphxAudioVST3/` is the legacy dev directory.
3. Every handoff embeds: source-of-truth references, the exact tasks, a
   conflict rule ("raise and stop, never silently choose"), verification
   tests the target must run, and a report-back format this project uses to
   track sync status.
4. This project keeps a per-plugin sync ledger (handoff issued → completed →
   verified) as handoffs are executed.

## System design

### One format, two license types

A trial license **is** a license: same `.cslic` file format, same verifier,
plus an `expiresAt` field. This keeps the C++ side to a single code path and
lets a purchased license simply replace the trial file.

Format details, discovery paths, and test vectors: `PLUGIN_LICENSE_SPEC.md`.

### Trial flow

1. User visits `/trial`, picks a product, enters an email.
2. `POST /api/trial` validates input, rate-limits per IP, refuses if a trial
   for (email, product) was already issued, signs a payload with
   `expiresAt = issuedAt + 20 days`, records the issuance, and emails the
   key block inline (plus a `.cslic` attachment) via Resend. Without
   `RESEND_API_KEY` (dev) the license is returned in the response.
3. User pastes the block into the plugin's license panel (or loads the
   file). The plugin verifies offline and shows days remaining.
4. On purchase (Phase 4, MoR webhook), the same `issueLicense()` produces a
   perpetual `type: "full"` key block, emailed the same way; pasting it into
   the same dialog replaces the trial — no re-download, the trial build is
   the full build.

### Threat model (accepted residual risk in italics)

| Vector | Mitigation |
|--------|------------|
| Trial reset by reinstalling/deleting files | License is server-issued; server refuses re-issuance per (email, product). *New email addresses work — accepted (H-L1).* |
| Clock rollback to extend trial | Plugin persists a high-water timestamp; clock regression beyond 24h ⇒ treated as expired (spec §6). |
| Trial file shared publicly | Expires ≤20 days after issuance; watermarked with the requester's email. *Accepted.* |
| Forged/edited license | Ed25519 signature over the exact payload bytes; public key compiled into the plugin. |
| Binary patching of the plugin | *Out of scope — accepted, per Audio Damage philosophy; DRM arms races punish customers.* |
| Trial-endpoint abuse (bots) | Per-IP rate limit now; edge rate limiting + store-backed counters before launch (L3). |

### Key ceremony — production keypair (2026-08-07)

| | |
|---|---|
| Generated | 2026-08-07, `npm run license -- keygen` on the owner's machine |
| Public key | `deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275` |
| Private half held in | Vercel env var `CS_LICENSE_PRIVATE_KEY` (Production scope) + owner's password manager |
| Private half NOT in | this repository, any plugin repo, any log, any chat transcript |
| Verified | 64 hex chars; C initializer regenerated from the hex and diffed against the printed block — identical |

The public key is recorded in `PLUGIN_LICENSE_SPEC.md` §7.1 and is safe to
publish: it verifies signatures and cannot produce them.

**Loss of the private key is unrecoverable.** Every licence ever issued
becomes unverifiable, and the only remedy is shipping a plugin update built
against a new key. Back it up before deleting the local file.

**Rotation / compromise procedure**: generate a new pair, ship a plugin
release that accepts both the old and new public keys for one version cycle,
reissue on request, then drop the old key in the following release.

### Operations

- `npm run license -- keygen` → prints the keypair. Private key goes **only**
  into the Vercel env var `CS_LICENSE_PRIVATE_KEY` (+ an offline backup, L4);
  the public key is embedded in the plugins and used by `verify`.
- Manual issuance/reissuance (support cases):
  `npm run license -- issue --type full --product block-rotator --email … --name … --order …`
- Key compromise recovery: rotate the keypair, ship a plugin update with both
  public keys accepted for one release cycle, reissue on request.

### Plugin-side work breakdown (milestones)

No DSP or installer changes anywhere below; effort assumes one developer.

- **M1 — shared license module** (2–4 days): new repo/submodule `cslicense`
  (per DEVELOPMENT_PLAN Phase 3): armor/base64 decode, minimal JSON parse,
  Ed25519 verify via vendored monocypher, the §4 state machine, license-dir
  persistence, §6 rollback guard. ~600–900 LOC + unit tests. Exit criterion:
  spec §7 vectors A/B/C pass byte-for-byte.
- **M2 — Block Rotator integration** (1–2 days): JUCE license panel (paste
  box, clipboard auto-detect, load-file, days-left badge, buy link,
  ~250 LOC) + ~20 LOC dry-passthrough gating in the processor, state checked
  on the UI timer, never the audio thread. Exit: manual pass of all four §4
  states using a short-expiry test license.
- **M3 — end-to-end trial flow** (0.5 day): `/trial` → email → paste →
  `TrialActive` → forced expiry → `TrialExpired` → paste full license →
  `Licensed`, on macOS + Linux. Exit: screen-recorded run of the full loop.
- **M4 — Poltergeist integration + purchase wiring** (1–2 days + Phase 4):
  repeat M2 for Poltergeist; connect the MoR webhook to `issueLicense()` for
  `type: "full"` fulfillment once the MoR account (D1/D2) exists.

### Before launch (hard requirements)

1. ~~Durable issuance store~~ — **built** (2026-08-04). Postgres backend in
   `store-postgres.ts`, selected whenever `DATABASE_URL` is set; schema in
   `schema.sql`, applied with `npm run db:migrate`. **Still outstanding:**
   provision the database (any Postgres — Neon, Supabase), use the **pooled**
   connection string, set `DATABASE_URL` in Vercel, and run the migration.

   *Correction (2026-08-08, found by probing the live deployment.)* An earlier
   revision said a missing `DATABASE_URL` merely loses data. That was wrong.
   Vercel's filesystem is read-only outside `/tmp`, so the file backend's
   `mkdirSync`/`writeFileSync` **throw**, and `/api/trial` returned an opaque
   HTTP 500 with an empty body. Reads still worked — `/api/account/resend`
   answered 200 — which is what isolated it to writes. The endpoint now checks
   `storeIsDurable()` and returns a clear 503 instead, because issuing a trial
   we cannot record would make one-per-email silently unenforceable. The real
   fix remains provisioning the database.
2. Email provider + domain auth (L2); set `CS_LICENSE_EMAIL_FROM`. Note the
   domain has exactly one SPF TXT record — Cloudflare Email Routing already
   created one, so Resend's `include:` must be **merged into it**, not added
   as a second record.
3. ~~Generate the production keypair (L4)~~ — **done 2026-08-07**; see "Key
   ceremony" above and `PLUGIN_LICENSE_SPEC.md` §7.1. Remaining: set
   `CS_LICENSE_PRIVATE_KEY` in Vercel, and run HANDOFF-05 to replace the RFC
   test key in both plugins' `LicenseConfig.h`.
4. Paddle: create the catalog, set `PADDLE_WEBHOOK_SECRET_KEY`,
   `PADDLE_API_KEY`, and `CS_PADDLE_PRODUCT_MAP` (Paddle price/product id →
   our product id), and point a notification destination at
   `/api/webhooks/paddle` for `transaction.completed`.
5. End-to-end test: request trial → receive email → load file in plugin →
   expiry behavior at +20 days (with a short-expiry test license).

### Purchase fulfilment (built 2026-08-04)

`/api/webhooks/paddle` verifies the signature (HMAC-SHA256 over
`${ts}:${rawBody}`, timing-safe compare, timestamp tolerance), claims the
event id so a retry cannot mint a second licence, resolves our product id
from the configured map, issues a perpetual licence through the same
`issueLicense()` the trial uses, records the order, and emails it.

Failure policy: 403 for a bad signature; 200 for events we ignore (a
permanent 4xx would make Paddle retry forever); 500 only for faults a retry
can fix — the licence is recorded *before* the email, so a retry re-sends
without re-issuing.

Verified end-to-end against a running server with genuinely signed payloads:
the issued licence verifies against its public key; duplicate delivery is
refused; forged signature, tampered body, and stale timestamp are all
rejected.
