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

Deviation from DEVELOPMENT_PLAN.md v1 noted: Phase 3 originally recommended a
feature-limited demo (D6). Owner decision supersedes it with the 20-day
time-limited trial; the "offline verification, no activation server" principle
is preserved — the only online step is one-time trial/license *issuance*.

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

1. Durable issuance store replacing the `.data/` file store (L1).
2. Email provider + domain auth (L2); set `CS_LICENSE_EMAIL_FROM`.
3. Generate the production keypair (L4) and set env vars in Vercel.
4. End-to-end test: request trial → receive email → load file in plugin →
   expiry behavior at +20 days (with a short-expiry test license).
