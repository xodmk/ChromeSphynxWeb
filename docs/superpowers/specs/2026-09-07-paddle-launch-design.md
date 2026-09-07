# Chrome Sphynx Audio — Paddle Launch Design (2026-09-07)

Scope: take the existing, built licensing system from "unconfigured" to "first
real sale." Launch products are **Block Rotator** and **Poltergeist**, as
**Linux VST3** and **macOS VST3 + AU**. Windows and CLAP are explicitly out of
scope and deferred.

This spec assumes `LICENSING_DESIGN.md` (architecture), `PLUGIN_LICENSE_SPEC.md`
v3.0 (file format, runtime states, keys), and `NEXT_STEP.md` (current state).
It does not restate them.

## What we know vs. what we're inferring

### Observed (measured facts, with source)

**The licensing system is built, not missing.** Measured by reading the trees
on this machine, 2026-09-07:

| Component | Location | State |
|---|---|---|
| Ed25519 issuance, `.cslic` armor | `src/lib/licensing/license.ts` | Implemented |
| Webhook receiver | `src/app/api/webhooks/paddle/route.ts` | Implemented |
| Signature verification | `src/lib/licensing/paddle.ts` | HMAC-SHA256 over `${ts}:${rawBody}`, 300 s tolerance |
| Payload → product mapping | `src/lib/licensing/paddle.ts` | `parseTransactionCompleted`, `resolveProductId` |
| Customer email lookup | `src/lib/licensing/paddle-api.ts` | Implemented |
| Licence re-send (no DB) | `src/app/api/account/resend/route.ts` | Implemented |
| C++ verifier | `cslicense/` | monocypher 4.0.2, `crypto_ed25519_check`, spec §7 vectors in ctest |
| Plugin integration | both `_PLUGX` trees | spec v3.0; BR 135/135 tests, PG 247/256 (9 pre-existing DSP goldens) |
| Production keypair | `PLUGIN_LICENSE_SPEC.md` §7.1 | Generated 2026-08-07, compiled into both plugins |
| macOS release pipeline | `*_INSTALL/build_mac.sh`, `build-pkg.sh`, `signing-lib.sh` | `pkgbuild` per component (VST3/AU/presets) → `productbuild` → `codesign --options runtime --timestamp` → `notarytool` → staple → verify |
| Linux installer | `*_INSTALL/build.sh`, Tauri | Bundles the `.vst3` as a resource |
| AU format | `plugin/CMakeLists.txt:17-26` | Appended to `FORMATS` under `if(APPLE)`; `PLUGIN_MANUFACTURER_CODE SPHX`, `PLUGIN_CODE BROT`, `BUNDLE_ID com.xodmk.xodBlockRotator` |

**The owner has the macOS prerequisites** (stated 2026-09-07): a Mac able to
build, paid Apple Developer Program membership, and Developer ID certificates
already issued.

**Paddle Billing requires Paddle.js** (fetched 2026-09-07,
`developer.paddle.com/build/transactions/default-payment-link`):

> "Your default payment link should be a page for an approved website that
> includes Paddle.js."
> "You cannot create transactions without first setting a default payment link
> — it must include Paddle.js and pass domain verification for live accounts."

Sandbox accepts `localhost` or a test domain as the payment link; live requires
a verified production domain. Client-side tokens come from **Developer tools →
Authentication** and are safe to publish. `transaction.completed` is the
documented event for confirming payment and starting fulfilment.

**The UI-occlusion defect was a stale binary, not live code.**
`XodBlockRotator_INSTALL/.../BlockRotator.so` is dated `2026-08-10 03:33`;
`LicensePanel.cpp` was last edited `2026-08-10 07:15` and committed
`2026-08-11 00:04` — the shipped binary predates its own licensing UI source by
~3.7 hours. Current source cannot occlude: `LicensePanel::hitTest` returns true
only inside the KEY button's bounds when the panel is closed, and
`LicensePanel::paint` draws only a corner countdown pill in that state. The
owner confirmed (2026-09-07) that the build they saw was an older installer.

**What is genuinely absent**, measured:

1. No Paddle account submitted. The only item with an external clock.
2. No checkout code. `src/app/plugins/[slug]/page.tsx:47` reads
   `// TODO(mor): swap for the Paddle checkout overlay`. No Paddle dependency in
   `package.json` — runtime deps are `next`, `react`, `react-dom` only.
3. `RESEND_API_KEY` unset.
4. Vercel env vars unset: `CS_LICENSE_PRIVATE_KEY`, `PADDLE_*`,
   `CS_PADDLE_PRODUCT_MAP`.
5. `main` is 2 commits ahead of `origin/main`; the push has never been
   authenticated (HTTPS remote, no credential helper; `~/.ssh/escheiSSHKey` not
   registered on the `xodmk` account).
6. `www.chromesphynx.com` has a Cloudflare CNAME but was never added in Vercel,
   so it fails TLS. The apex serves correctly.
7. No human has opened either plugin in a DAW. Script ready at
   `docs/DAW_VERIFICATION_SCRIPT.md`.
8. No release builds exist for either platform.
9. There is no CI anywhere. All builds are manual and local.
10. None of the five plugin/installer/`cslicense` repos has a git remote.

### Working hypotheses (flagged)

- **H1.** The stale-binary explanation fully accounts for the occlusion report,
  and a rebuild from current source resolves it with no GUI changes. Supported
  by the timestamp gap, the `hitTest`/`paint` logic, and the owner's
  confirmation. **Not yet confirmed by seeing it render** — DAW script §A
  (items A2, A5) is the measurement. Provisional until then.
- **H2.** The panel may still read as intrusive at small editor sizes even
  though it dismisses correctly: it clamps to `min(460, w-40) × min(300, h-40)`,
  so on a small editor an *open* panel covers most of the window. This is a
  separate, unmeasured question from H1. Resolved by the same DAW pass.
- **H3.** Prefilling the buyer's email into checkout `custom_data` will populate
  `data.custom_data.email` on the webhook payload, letting the route skip the
  `fetchCustomerEmail` API call. `parseTransactionCompleted` already reads that
  field. Confirmed by Paddle's prefill docs for the checkout side; **not
  confirmed end-to-end** on the webhook side. Falls back safely — the API
  lookup path already exists and is the default.
- **H4.** Legal drafts (EULA, Terms, Refunds, Privacy) satisfy Paddle's
  onboarding checklist. They follow Paddle's stated requirements and standard
  practice for downloadable software, but **have not been reviewed by a
  lawyer**. Carried forward unchanged from `NEXT_STEP.md`.

### Deferred questions + measurement plan to resolve them

| Question | Measurement that resolves it | When |
|---|---|---|
| Does the licensing UI render correctly in a real DAW on both platforms? | Run `DAW_VERIFICATION_SCRIPT.md` §A–B on Linux and on macOS (Logic, for AU) | Step V1 |
| Does a licence email physically arrive and render usably? | Send one to a real inbox after Resend is configured | Step W2 / F2 |
| Can Paddle host and deliver the installer files itself? | Unresolved — the Paddle help page on product delivery 404s. Not a blocker; we self-host. Re-check via Paddle docs if we later want to switch | Post-launch |
| Does `custom_data.email` arrive on the webhook payload (H3)? | Inspect the sandbox `transaction.completed` body in step F1 | Step F1 |
| Is the AU accepted by `auval`? | `auval -v aufx BROT SPHX` on the Mac after B3 | Step B3 |

## Design

### Target flow

```
Product page (chromesphynx.com/plugins/<slug>)
   │  Paddle.js overlay — client-side token + pri_ id, email into custom_data
   ▼
Paddle Checkout  ── collects payment, is merchant of record
   │  transaction.completed
   ▼
POST /api/webhooks/paddle   (Vercel serverless)
   ├─ verify HMAC over the RAW body
   ├─ map pri_/pro_ id → our product id via CS_PADDLE_PRODUCT_MAP
   ├─ derive licence deterministically from the order (never now())
   └─ email the .cslic + download links via Resend
   ▼
Customer  ── pastes the licence into the plugin
   ▼
Plugin  ── Ed25519 verify against the compiled-in public key. Offline, forever.
```

Nothing about this changes the existing architecture. The only new code is the
checkout entry point.

### Decisions settled by this spec

**D1 — Overlay checkout, not a hosted link.** Paddle Billing has no zero-JS
path (see Observed). We include Paddle.js and call `Paddle.Checkout.open()`.
This adds the first client-side dependency the site has had since the database
was removed; it is unavoidable, and it is confined to the product page.

**D2 — Self-host the installers.** Downloads are served from the site and linked
from both the product pages and the licence email. Rationale: verifiable today,
no dependency on an unconfirmed Paddle feature, and consistent with the threat
model — the binary was never the secret, the licence is. The repo is public, so
installers committed to `public/` are world-readable; this is acceptable and
intended, because the demo is the marketing.

**D3 — The sandbox end-to-end test uses the production signing key.** A sandbox
purchase minting a genuinely valid licence is a non-problem: it is the owner's
own purchase. A separate test key would add a key-management branch and mean
the tested path is not the shipped path.

**D4 — Source reaches the Mac by direct transfer, not new git remotes.** Both
machines belong to the owner. `rsync` or `git bundle` moves the trees in one
command. Creating and authenticating five GitHub remotes is real work with no
launch benefit. Deferred to post-launch as off-site backup — noting that the
C++ source currently exists on exactly one disk.

**D5 — No CI.** Two products, two platforms, manual releases. CI is a
post-launch improvement.

### Non-goals

Windows, CLAP, machine binding, online activation, a licence database, an
account system, and CI. Each is deliberately excluded; none is blocked by
anything in this design.

## Work breakdown

Tracks P, G, W and B/V run **in parallel**. P has an external clock and must
start first; nothing else waits on it until F.

Two ordering constraints inside that parallelism:

- **W1 (`www` in Vercel) should be done before or immediately after submitting
  P1.** Paddle's reviewer will visit the domain during approval, and `www`
  currently fails TLS outright. It is one dashboard action and it protects the
  3–7 day clock from an avoidable rejection.
- **W4 (the checkout) cannot be tested until P2 exists.** The code can be
  written beforehand, but it needs the client-side token and the `pri_` ids to
  run against anything.

### Track P — Paddle account (start first)

- **P1** Sign up. Submit `chromesphynx.com` for domain review. Complete identity
  verification via Sumsub — government ID, proof of address at the Tokyo address,
  bank details for payouts. **Skip business verification**: explicitly not
  required for sole traders.
- **P2** In **sandbox**, without waiting for P1 approval: create two products
  and two prices at $79 each; generate a client-side token (Developer tools →
  Authentication); set the default payment link; create a notification
  destination targeting `https://chromesphynx.com/api/webhooks/paddle`
  subscribed to `transaction.completed`. Record the `pri_`/`pro_` ids and the
  destination's `pdl_ntfset_...` secret.

Decision to make before submitting: whether the "Work in progress" notice stays
up during review. It should not block approval, but a reviewer may ask.

### Track G — git authentication

- **G1** Register `~/.ssh/escheiSSHKey.pub` at `github.com/settings/keys`.
  Switch the remote to SSH and pin the identity — the key has a non-standard
  filename, so SSH will not offer it automatically:
  ```
  git remote set-url origin git@github.com:xodmk/ChromeSphynxWeb.git
  printf 'Host github.com\n  IdentityFile ~/.ssh/escheiSSHKey\n  IdentitiesOnly yes\n' >> ~/.ssh/config
  ```
- **G2** Push the two pending commits. The product PDFs stop returning 404.

### Track W — website

- **W1** Add `www.chromesphynx.com` in Vercel → Settings → Domains, redirecting
  to the apex. The Cloudflare CNAME already exists; Vercel will not issue a
  certificate for a hostname it has not been told about. Do **not** fix this by
  deleting the `www` record.
- **W2** Configure Resend: API key, domain authentication. **Merge Resend's SPF
  `include:` into the existing Cloudflare TXT record** — Cloudflare Email
  Routing already created one, and two SPF records send mail to spam.
- **W3** Set Vercel environment variables: `CS_LICENSE_PRIVATE_KEY`,
  `PADDLE_WEBHOOK_SECRET_KEY`, `PADDLE_API_KEY`, `PADDLE_API_BASE`
  (`https://sandbox-api.paddle.com` initially), `CS_PADDLE_PRODUCT_MAP`,
  `RESEND_API_KEY`, `CS_LICENSE_EMAIL_FROM`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
  `NEXT_PUBLIC_PADDLE_ENV`. **Redeploy afterwards** — env vars apply only to new
  deployments.
- **W4** Write the checkout. This is the only new code in the launch.
  - Include Paddle.js, `Paddle.Environment.set()` from `NEXT_PUBLIC_PADDLE_ENV`,
    `Paddle.Initialize({ token })`.
  - Replace the inert control at `plugins/[slug]/page.tsx:47` with a button
    calling `Paddle.Checkout.open()` for the product's `pri_` id, passing the
    buyer's email through `custom_data` (H3).
  - The `PURCHASING_ENABLED` gate stays in place around it.
  - Tests: the existing `tests/` suite must stay green, `determinism.test.ts`
    especially — it protects the architecture, not a function.
- **W5** Link the installers (D2) and the existing product PDFs from
  `plugins/[slug]/page.tsx`.

### Track B — release builds

- **B1** Rebuild the Linux VST3 for both plugins from current `_PLUGX` source.
  **This is the remediation for the occluding-UI report** (H1). Re-stage into the
  `_INSTALL` resources and rebuild the Tauri installers.
- **B2** Transfer both `_PLUGX` trees, both `_INSTALL` trees, and `cslicense` to
  the Mac by direct copy (D4). Preserve the `CSLICENSE_EXPECTED_SHA` pins —
  `7ba45b1` for Block Rotator, `73e2246` for Poltergeist. Adopting a newer
  `cslicense` means bumping the pin in the same commit that adapts to it; the
  pin exists because the module silently broke both plugins once.
- **B3** On the Mac: run `check-signing.sh`, then `build_mac.sh` for each
  plugin, producing signed and notarised `.pkg` installers containing VST3 and
  AU. Confirm the AU with `auval`. While here, fix
  `plugin/CMakeLists.txt:222` — it hardcodes
  `message(STATUS "  Formats:        VST3")` and will report `VST3` while
  actually building VST3 + AU.

### Track V — verification

- **V1** Run `docs/DAW_VERIFICATION_SCRIPT.md` end to end: on Linux with a
  VST3 host, and on macOS in Logic to exercise the AU. Section A settles H1 and
  H2. Item A8 — `getStateInformation` must never be blocked by the demo — is the
  one that reads as data loss if it regresses.
- **V2** Fix anything V1 finds, then re-run the affected sections.

### Track F — go live

- **F1** Sandbox end-to-end: checkout → webhook → licence email → paste into the
  plugin → unlocked. Inspect the `transaction.completed` body to settle H3.
- **F2** Confirm a licence email physically arrives at a real inbox and is
  usable — the `.cslic` must be copy-pasteable or loadable as attached.
- **F3** Switch to live: live catalog, live client-side token, live notification
  destination and its secret, and `PADDLE_API_BASE` back to the production
  default. The default payment link must point at the verified production
  domain, not `localhost`.
- **F4** Set `PURCHASING_ENABLED = true` in `src/lib/status.ts`. Commit, push,
  confirm the deploy.

## Failure modes and standing hazards

Carried forward from `NEXT_STEP.md` because each has already cost time once, or
would silently break fulfilment:

- **Do not enable Cloudflare's proxy (orange cloud).** Bot Fight Mode and WAF
  rules challenge automated POSTs to API paths, so Paddle would receive a
  challenge instead of reaching the webhook. The signature check is HMAC over
  the *raw* body, so anything that alters or blocks the request produces 403 and
  endless retries while the customer receives nothing. It also caches in front
  of Vercel where Vercel cannot purge it, and can stall TLS issuance.
- **Do not delegate DNS to Vercel.** Cloudflare Email Routing only works while
  Cloudflare is authoritative; delegating would permanently kill
  `support@chromesphynx.com` and drop the SPF record licence email depends on.
- **Email failure is a launch blocker, not a nicety.** Without `RESEND_API_KEY`,
  a real purchase generates a correct licence, fails to email it, and returns
  500 — Paddle retries indefinitely while the customer receives nothing.
- **Commits must be pushed.** Vercel deploys from the GitHub remote.
- **Vercel env vars apply only to new deployments.** Redeploy after adding one.
- **The repo is public.** Anything in `public/` is world-readable once pushed.

## Success criteria

The launch is complete when all of the following are true and observed, not
inferred:

1. A sandbox purchase produces a licence email that unlocks a released build.
2. Both plugins pass `DAW_VERIFICATION_SCRIPT.md` on Linux and macOS, with the
   licence panel dismissible and the editor usable beneath it.
3. Signed, notarised `.pkg` installers exist for macOS (VST3 + AU) and Tauri
   installers for Linux (VST3), built from current source.
4. `chromesphynx.com` and `www.chromesphynx.com` both serve over valid TLS.
5. A licence email arrives at a real inbox from an SPF-authenticated domain.
6. `PURCHASING_ENABLED` is `true` and a live purchase completes end to end.

## Post-launch backlog

Not in scope, recorded so it is not rediscovered: git remotes for the five C++
repos (off-site backup for source that exists on one disk); CI; Windows; CLAP;
`_PLUGX` gaining its own `build_docs.sh` so it can build the documentation it is
master of; a lawyer's review of the legal pages (H4).
