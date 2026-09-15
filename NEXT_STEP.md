# NEXT_STEP — Chrome Sphynx Audio

Status as of **2026-09-14**. Start here after a break, or in a new session.

This revision replaces the 2026-09-10 file rather than adding to it. That file's
Paddle section was built on a false premise (below). Earlier revisions are in
git: `git show bdf0efb:NEXT_STEP.md`.

> **2026-09-14 in one line:** the Paddle account exists and has for about a
> month, but **nothing is connected to it**. There is no checkout code, the
> production webhook reports `not configured`, this machine has no link to the
> Vercel project, and the Paddle Claude Code plugin was never installed.

> ### Correction: "No Paddle account exists" was wrong
>
> Every revision from 2026-08-28 to 2026-09-10, and the launch spec
> (`docs/superpowers/specs/2026-09-07-paddle-launch-design.md`, "Observed" item
> 1 and Track P), said no Paddle account had been submitted. **That was never
> measured.** Each session copied it from the previous document. The owner
> reports the account was set up around mid-August 2026.
>
> Withdrawn with it: "Track 1 — open the Paddle account today", the "3–7
> business day external clock", and any sequencing that put Paddle work behind
> account creation. What still stands is everything the account does not
> change: the licensing engineering is built, and the checkout is not.

This repo is the **company-wide master** for e-commerce, licensing, and the
website. Plugin and installer changes are **not** made from here. Decisions are
settled here, issued as HandOff prompts to sessions opened in the target repos,
then verified back here. See `docs/handoffs/SYNC_LEDGER.md` and
`docs/handoffs/ORDER_OF_WORK.md`.

Release work lives in `~/XODMK/xodCode/xodCpp/csphxAudioPLUGX/`. The `_PLUGX`
projects are the final RELEASE masters (code and documentation). The `_INSTALL`
projects package them and generate PDFs. `~/XODMK/xodCode/xodCpp/csphxAudioVST3/`
holds the `_VST3MSTR` projects: temporary pre-licence stand-ins, **not** masters,
even though some of their doc files are newer.

> Path note: older revisions wrote `/home/csphx/XODMK/xodCode/...`, which exists
> on no machine. The real prefix is `~/XODMK/xodCode/xodCpp/`.

---

## What we know vs. what we're inferring

### Observed (measured 2026-09-14 unless stated)

**Paddle and commerce**

| Fact | Source |
|---|---|
| A Paddle account exists, set up about mid-August 2026, and is in **sandbox** mode. Its catalog, price ids, client token and notification destinations are **recorded nowhere** on this machine or in this repo. | Owner, 2026-09-14 / 2026-09-15 |
| Production webhook is **not configured**: an unsigned `POST {}` to `https://chromesphynx.com/api/webhooks/paddle` returns `500 {"error":"not configured"}`. In `route.ts` that response means `PADDLE_WEBHOOK_SECRET_KEY` **or** `CS_LICENSE_PRIVATE_KEY` is missing from the production deployment. The probe cannot tell which. | Live probe; `src/app/api/webhooks/paddle/route.ts:20-25` |
| No Paddle.js on the live site: neither product page references `cdn.paddle.com`; both show "Not yet on sale". | Live fetch of `/plugins/block-rotator`, `/plugins/poltergeist` |
| **The checkout has never been written.** `src/app/plugins/[slug]/page.tsx:47` is still `TODO(mor): swap for the Paddle checkout overlay once the account is verified`, and the code under it links to `/support#buying`. `src/` has zero references to `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENV`, `Paddle.Initialize` or `cdn.paddle.com`. | grep of `src/` |
| Variables the code reads: `CS_LICENSE_PRIVATE_KEY`, `CS_LICENSE_EMAIL_FROM`, `CS_SUPPORT_EMAIL`, `CS_PADDLE_PRODUCT_MAP`, `PADDLE_API_KEY`, `PADDLE_API_BASE`, `PADDLE_WEBHOOK_SECRET_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`. | `grep process.env src/` |
| `PURCHASING_ENABLED = false`. | `src/lib/status.ts:8` |
| **No link between this machine and the Vercel project.** No `.vercel/` directory, no `vercel` CLI installed, no `.env.local`. Only `.env.example` exists, with every Paddle key commented out. No session on this machine can read the Vercel project's settings. | `ls -la`, `which vercel` |
| **The Paddle Claude Code plugin is installed but not yet connected to the account.** Installed 2026-09-15 05:46 UTC at `de7fcd3`, enabled, 10 `paddle:*` skills loaded. MCP state: `paddle-sandbox` **rejected with HTTP 401** ("Missing or invalid Authorization header"); `paddle-docs` waiting for browser OAuth; `paddle-live` waiting for OAuth (not needed while in sandbox). The owner's sandbox key, tested directly the same day, is **valid**: REST API 200 and `sandbox-mcp.paddle.com/mcp` initialize 200. So the 401 means the plugin never received the key, not that the key is bad. | `installed_plugins.json`; MCP connection report; direct probe 2026-09-15 |
| **The sandbox account is empty.** Products 0, prices 0, notification destinations 0, client-side tokens 0. Nothing has been configured in it yet. | Read-only `GET` on `/products`, `/prices`, `/notification-settings`, `/client-tokens`, 2026-09-15 |
| **What the plugin contains** (pinned `PaddleHQ/paddle-agent-skills@de7fcd3`). Three MCP servers: `paddle-docs`; `paddle-sandbox` (`sandbox-mcp.paddle.com`, authenticated by a **sandbox API key `pdl_sdbx_…`** asked for at install); `paddle-live` (browser OAuth, no key). Skills: `catalog-setup`, `checkout-web`, `webhooks`, `sandbox-testing`, `pricing-pages`, `customer-portal`, `billing-history`, `subscription-*`. | `.mcp.json`, `.claude-plugin/plugin.json` in that repo |

**Site, DNS, repo**

| Fact | Source |
|---|---|
| `https://chromesphynx.com` returns 200. | curl |
| `https://www.chromesphynx.com` still fails TLS (curl exit 60). Unchanged since 2026-09-03. | curl |
| Product PDFs are live: `/docs/block-rotator/BlockRotator_UserGuide.pdf` returns `200 application/pdf`. This resolves the 2026-09-03 404. | curl |
| `main` is **1 commit ahead** of `origin/main` (`bdf0efb`, the 09-10 NEXT_STEP). `docs/PLUGIN_LICENSE_SPEC.md` has uncommitted changes (§5/§9 corrections from 2026-09-11). | `git status -sb`, `git diff --stat` |
| Website EULA heading still reads `4. Trials` (`src/app/legal/eula/page.tsx:58`). The installer EULA says DEMO. | grep |
| Git remote is HTTPS with no credential helper, yet `main` was pushed on 2026-09-10. **How that push authenticated is unknown.** | `git remote -v`, `git config` |

**Plugins and installers**

| Repo | HEAD | Working tree | Notes |
|---|---|---|---|
| `XodBlockRotator_PLUGX` | `1fdc75a` (09-11) | **4 files uncommitted**: `SessionDemo.h`, `PluginProcessor.cpp`, `test_session_demo.cpp`, spec | 09-11 demo-expiry click fix (wet 1→0, then dry 0→1 over 30 ms). Suite was 174/174 on 09-11; **not re-run today** |
| `XodBlockRotator_INSTALL` | `e1e2fad` (09-11) | **4 files uncommitted**: `EULA.txt`, `README.md`, `prepare-plugin.sh`, `src/App.jsx` | Linux packages built **09-11 17:28**: `.deb` 7,883,386 / `.rpm` 7,883,869 / `.AppImage` 86,731,256. 09-11: `.so` md5 `a9cdee90…` matches between BUILD and `.deb` |
| *Installed on this machine* | — | — | 2026-09-15 13:00: `~/.vst3/csphx/BlockRotator.vst3`, installed from the **AppImage** (md5 `a15582b4…`, matches the AppImage payload; not registered with dpkg). It differs from BUILD/`.deb` (`a9cdee90…`) **only by an added `RUNPATH $ORIGIN`**: `.text`, `.rodata` and `.data` hash identical; all libraries resolve. A **Poltergeist.vst3 dated 2026-08-31** (pre-regeneration) sits beside it |
| `XodPoltergeist_PLUGX` | `02d92f0` (09-11) | clean | Regenerated from `xodPoltergeist_ESP`; licensing re-integrated; 1.0.0 |
| `XodPoltergeist_INSTALL` | `1904679` (09-11) | clean | Linux packages are **0.1.0 from 2026-08-07**. Stale; they predate 1.0.0 |
| `cslicense` | `057e809` (08-10) | clean | Pinned by both plugins |

### Working hypotheses (flagged, not confirmed)

- **H1: the missing production variable is `PADDLE_WEBHOOK_SECRET_KEY`.** The
  09-10 revision recorded `CS_LICENSE_PRIVATE_KEY` as "confirmed live", which
  would leave the webhook secret as the missing one. That earlier claim is
  itself unverified from this machine.
- **H2: the Paddle settings the owner expects in Vercel are missing, or not
  applied to production.** Possible forms: never added; added to the
  Preview/Development scope only; or added without a redeploy (env vars apply
  only to new deployments). All three produce the same 500.
- **Why no Paddle integration exists yet.** Three causes contributed; each is
  observed on its own, but how much each one mattered is inference. Ranking
  them is premature.
  1. **False premise.** The docs said there was no account, and the plan
     sequenced the checkout (spec W4) behind account creation (spec Track P,
     "start first"). The code TODO repeats it: "once the account is verified".
  2. **No access path.** The checkout needs the `pri_` price ids and a
     client-side token. Nothing here could fetch them: no Paddle plugin, no
     Vercel link, no `.env.local`. So no session could build or test the
     checkout against the real account.
  3. **Standing pause.** On 2026-09-10 the owner paused launch work until both
     `_PLUGX` projects are fixed and regenerated, Block Rotator first.
- Cloudflare's orange-cloud proxy is *expected* to break the webhook and deploy
  cache (see the warning below). This is reasoning from how the parts work;
  nothing proxied has been tested.

### Deferred — and the measurement that resolves each

| Question | What settles it |
|---|---|
| Do products and prices exist? What are the `pri_` ids? | Paddle MCP: list products/prices, or the dashboard catalog |
| Does a client-side token exist? Is a default payment link set? | Dashboard → Developer tools → Authentication; Checkout settings |
| Does a notification destination target `/api/webhooks/paddle` for `transaction.completed`? | Paddle MCP: list notification settings |
| Which variables are set in Vercel, and in which scope? | `vercel link` then `vercel env ls` (see step 0) |
| Is H1 right? | `vercel env ls production`; after fixing, the unsigned probe should return **403**, not 500 |
| Do the production keypair halves match? | Spec §7.1: `issue` with the private key, then `verify --pubkey deda76f2…`. **Never run** |
| Does a licence email arrive? | Configure Resend, run a sandbox purchase, check the inbox |
| Does `custom_data.email` arrive on the webhook (spec H3)? | Inspect the sandbox `transaction.completed` body |
| Does Block Rotator behave in a DAW (key icon at 694,8; demo-expiry click)? | `docs/DAW_VERIFICATION_SCRIPT.md` in Bitwig against the 09-11 17:28 `.deb` |
| Poltergeist preset migration with a real library | Run with actual `.xrp` files in the legacy folder |
| Does Poltergeist need its DSP/golden suite restored? | Owner decision; `tests/CMakeLists.txt` declares licensing tests only |
| How did the 09-10 push authenticate? | Check with the owner; matters before pushing from another machine |

---

## Where things stand

### Paddle integration: what is built, what is not

| Piece | State |
|---|---|
| Paddle account | **Exists, sandbox mode** (owner). Catalog unrecorded |
| Webhook receiver (raw-body HMAC, 403 on bad signature) | Built and unit-tested (`src/lib/licensing/paddle.ts`, `tests/paddle.test.ts`) |
| Licence issuing (Ed25519 `.cslic`, stateless, no DB) | Built |
| Lost-licence re-send via the Paddle API | Built (`src/app/api/account/resend/route.ts`, `src/lib/licensing/paddle-api.ts`) |
| Plugin-side verifier (`cslicense`) | Built, pinned in both plugins |
| **Checkout overlay (Paddle.js)** | **Not written.** The only new code the launch needs (spec W4) |
| Production env (`PADDLE_*`, `CS_PADDLE_PRODUCT_MAP`, client token) | **Not effective in production** (500 probe) |
| Catalog / price ids / notification destination | Unknown |
| Resend | `RESEND_API_KEY` unset as of 09-10; not re-measured |
| Sandbox end-to-end purchase | Never run |

Paddle Billing has **no checkout that works without JavaScript**: the default
payment link must be a page on an approved domain that loads Paddle.js. The
overlay is required, not a style choice (spec D1).

### Website: live, purchasing deliberately off

Fifteen routes. $79 per plugin. The legal pages carry the real trading
identity. Every buy button reads `PURCHASING_ENABLED` in `src/lib/status.ts`.
Flipping it goes live **only after** the checkout exists; flipping it today
would show a "Buy" button that links to `/support#buying`.

### Licensing

Ed25519-signed `.cslic` licences that the plugin verifies **offline, forever**.
No database: licences are derived from the order, so duplicates re-send an
identical file and lost licences are regenerated from Paddle's records. The
public key, compiled into both plugins:
`deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275`. The
private half lives only in Vercel and the owner's password manager. **Losing it
invalidates every licence ever issued.**

### Plugins

| | Block Rotator | Poltergeist |
|---|---|---|
| State | Licensing and demo complete **pending** a production-key licence and a DAW pass; 09-11 fix uncommitted | Regenerated and committed 09-11; waiting to receive the verified Block Rotator result |
| Tests | 174/174 (09-11) | 21/21 licensing only; DSP/golden suite absent |
| Version | 1.0.0 | 1.0.0 |
| `kBuyUrl` | `/plugins/block-rotator` | `/plugins/poltergeist` |
| Linux package | Built 09-11 17:28 | **Stale** (0.1.0, 08-07) |
| macOS package | Not built; Mac only | Not built; Mac only |

Unlicensed: a fully functional 20-minute session demo with preset saving
disabled. Licensed: no licensing work at all on the audio thread.

### Domain and DNS: apex live, `www` broken

Fix `www` in **Vercel** → project → Settings → Domains → add
`www.chromesphynx.com`, redirecting to the apex. The Cloudflare CNAME already
exists; Vercel won't issue a certificate for a hostname it hasn't been told
about. Do **not** fix it by deleting the `www` record.

> ### ⚠️ Two settings that will quietly break this
>
> **Do not delegate DNS to Vercel's nameservers.** Cloudflare Email Routing
> (`support@chromesphynx.com`) and the existing SPF record only work while
> Cloudflare is authoritative.
>
> **Do not enable Cloudflare's proxy (orange cloud).** It (1) caches in front of
> Vercel, so deploys keep serving the old site; (2) exposes the webhook to Bot
> Fight Mode / WAF challenges, and the HMAC check is over the raw body, so the
> result is 403 plus endless Paddle retries while the customer gets nothing;
> (3) can stall TLS issuance. If the WAF is wanted later: only after a sandbox
> purchase has succeeded, with a cache bypass for `/api/*` and a WAF skip for
> `/api/webhooks/*`.

> **Email is a launch blocker.** Without `RESEND_API_KEY` a real purchase
> creates a correct licence, fails to email it, returns 500, and Paddle retries
> forever. When configuring Resend, **merge its SPF `include:` into the existing
> TXT record**. Two SPF records send mail to spam.

---

## What is NOT done

1. **Checkout overlay not written** (`page.tsx:47`).
2. **Production Paddle configuration not effective**: webhook returns
   `not configured`.
3. **No tooling connection to Paddle or Vercel from Claude Code**: Paddle
   plugin not installed, Vercel project not linked.
4. **Paddle account state not recorded**: live approval, catalog, `pri_` ids,
   client token, notification destination.
5. **Block Rotator not signed off**: production-key licence not issued, DAW pass
   not run, 09-11 fixes uncommitted in PLUGX and INSTALL.
6. **Poltergeist Linux package stale** (0.1.0); preset migration untested on
   real files; DSP suite decision open.
7. **No macOS artefacts** for either plugin (Mac, Developer ID, notarisation).
8. **Resend not configured** (as of 09-10).
9. **`www` TLS broken.**
10. **Website EULA still says "4. Trials".**
11. **`bdf0efb` and the spec correction not pushed.**
12. **Plugin repos have no git remote.** The C++ source exists on one disk only.

---

## The next step

**The single next action:** the owner types the two `/plugin` commands in
step 1. Everything after it depends on Claude being able to reach the Paddle
sandbox.

### How the pieces talk to each other

There are three channels. Two are not set up yet, and that gap is why no
Paddle integration exists.

| Channel | Connects | Carries | State |
|---|---|---|---|
| **Paddle Claude Code plugin** | A Claude session in this repo ↔ the Paddle sandbox account | Paddle docs lookup; Paddle API calls (catalog, prices, notification destinations, transactions). Exact tool list unknown until installed | **Not installed** |
| **Vercel CLI** | This repo ↔ the Vercel project | Env var list and scope, `.env.local`, deploys | **Not installed or linked** |
| **HandOff prompts** (`docs/handoffs/`) | This repo (master) → Claude sessions opened in the plugin/installer repos | A written task one way; a report back into `SYNC_LEDGER.md` | **Working**: HANDOFF-01…07 |

HandOffs carry work between Claude sessions in **different repos**. They do not
reach Paddle. The Paddle work is all website-side, in this repo, so it needs no
HandOff; it needs the plugin. The plugin repos already have everything Paddle
requires of them (the public key and `kBuyUrl`). They re-enter only at the end,
when a sandbox-issued licence is pasted into a real build, and that step **is**
a HandOff.

### The sequence (sandbox throughout; live approval only at the end)

| # | Who | What | Done when |
|---|---|---|---|
| 1 | ✔ **DONE 2026-09-15.** `paddle-sandbox-key` (user-scope MCP server, added with `claude mcp add`) connects. Read-only calls through it: products 0, prices 0, notification destinations 0 (the API's `estimatedTotal` said 1–2, but the dashboard confirms "No notification destinations yet", 2026-09-15). Catalog and webhook draft: `docs/paddle/SANDBOX_CATALOG_DRAFT.md`, awaiting approval. The key pasted into chat now gets 403 on `/products`, so it no longer works. History of this step: marketplace added and plugin installed 2026-09-15. **`/plugin install` never asks for the key** (seen twice, including after an uninstall/reinstall), and Claude Code's docs don't describe how to set it. Workaround: register the sandbox server yourself in a normal terminal, outside Claude Code: `read -rs K; claude mcp add --transport http --scope user paddle-sandbox-key https://sandbox-mcp.paddle.com/mcp --header "Authorization: Bearer $K"; unset K`, then restart Claude Code. Use a **new** key: the first one was pasted into chat | A read-only product listing through that server succeeds |
| 2 | Claude | Call the `paddle-sandbox` MCP server | A read-only call (list products) succeeds |
| 3 | Claude | Inventory the sandbox: products, `pri_` prices, client-side token, default payment link, notification destinations. Propose anything missing (two $79 products; destination → `https://chromesphynx.com/api/webhooks/paddle` for `transaction.completed`); create them only after the owner approves. Record the **ids** here (never secrets) | Ids recorded in this file |
| 4 | Owner + Claude | `npm i -g vercel`, `vercel login`, `vercel link`, `vercel env ls`. Set the sandbox values from spec W3: `CS_LICENSE_PRIVATE_KEY`, `PADDLE_WEBHOOK_SECRET_KEY`, `PADDLE_API_KEY`, `PADDLE_API_BASE=https://sandbox-api.paddle.com`, `CS_PADDLE_PRODUCT_MAP`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_ENV=sandbox`. Redeploy | Unsigned webhook probe returns **403** instead of 500 |
| 5 | Claude | Write the checkout (spec W4): Paddle.js, `Paddle.Initialize`, `Paddle.Checkout.open()` with the `pri_` id, behind `PURCHASING_ENABLED` | `npm test` green; overlay opens on a Preview deploy with the gate on |
| 6 | Owner + Claude | Resend: API key, domain auth, SPF merged into the existing record | A test email arrives |
| 7 | **Owner** | Sandbox purchase with a Paddle test card | Webhook 200; licence email arrives |
| 8 | HandOff → Block Rotator session; **Owner** in Bitwig | Paste the sandbox-issued licence into the 09-11 `.deb` build; run `docs/DAW_VERIFICATION_SCRIPT.md` | Plugin unlocks. Because the sandbox signs with the **production** key (spec D3), this also settles the §7.1 keypair question |
| 9 | Owner + Claude | Commit Block Rotator; Poltergeist packaging via HandOff; macOS builds on the Mac; fix `www` and the EULA heading | Release artefacts exist |
| 10 | **Owner** | Request live approval; switch to live keys and `PADDLE_API_BASE`; redeploy; flip `PURCHASING_ENABLED` | First live sale |

**Standing constraint:** on 2026-09-10 the owner paused launch development until
both `_PLUGX` projects are fixed and regenerated. Steps 1–7 touch only this
repo and the external services. Whether they run during the pause is the
owner's decision. As of 2026-09-15 it has not been made.

---

## Working across machines

**Vercel and Cloudflare settings are not files.** They live on those services
and are visible from any logged-in machine. Only repository files travel
through git. `vercel env pull` is how secrets reach a second machine.

On a receiving machine:

```
git clone https://github.com/xodmk/ChromeSphynxWeb.git
cd ChromeSphynxWeb && npm install
vercel link && vercel env pull .env.local
```

The plugin trees have no remotes. Move them with `rsync` or `git bundle`
(spec D4).

---

## Facts worth not rediscovering

- **Do not take a document's claim about an external account as measured.**
  "No Paddle account exists" survived five revisions because each session
  copied it. Account and dashboard state comes from the owner, the dashboard,
  or the Paddle MCP, with the date it was checked.
- **`/plugin` commands are typed by the owner.** A session can only give the
  command. After installing, confirm in `~/.claude/plugins/installed_plugins.json`.
- **An unsigned POST to the webhook is a safe configuration probe.** 500
  `not configured` means a required secret is missing; 403 `invalid signature`
  means both are present. It creates nothing and sends nothing.
- **Commits must be pushed.** Vercel deploys from GitHub.
- **Vercel env vars only apply to new deployments.** Redeploy after adding one,
  and check the scope (Production vs Preview).
- **The Vercel dashboard slug is not the GitHub username.** Vercel 404s rather
  than 403s on anything the session cannot see.
- **This repo is public.** Anything in `public/` is world-readable once pushed.
- **Adopting a newer `cslicense` means bumping `CSLICENSE_EXPECTED_SHA`** in the
  same commit.
- **`getStateInformation` must never be blocked** by the demo. It is host
  session state, not preset saving.
- **A tree refresh from the development project silently removes licensing**
  and reverts naming decisions. It happened to Poltergeist on 2026-09-10.
  Refreshes also revert installer copy (EULA, `App.jsx`), not just plugin code.
  After any refresh, check:
  - `grep -rn cslicense CMakeLists.txt plugin/CMakeLists.txt`
  - `plugin/include/LicenseConfig.h` exists
  - the bundle name matches `plugin.config.sh`
- **Executable bits do not survive however these trees are copied.**
  "Permission denied" on `./build.sh` plus mode-only `git diff` means this.
- **Poltergeist presets moved** from `…/Spectral Ghost/` to `…/Poltergeist/`,
  with a one-time rename-only migration.
- **Spec §7.2 Vector A is a block-rotator trial; Vector B is a poltergeist full
  licence.** They are not interchangeable between the plugins' tests.
- **`juce_add_plugin` reports the sub-project version** in
  `plugin/CMakeLists.txt`, not the root `project()` version.
- **Block Rotator test results land in `utest_results/raw_output.txt`**
  (ANSI-coded), not in `./build_utest.sh`'s stdout.
- Legal drafts follow Paddle's requirements but have not been reviewed by a
  lawyer.
