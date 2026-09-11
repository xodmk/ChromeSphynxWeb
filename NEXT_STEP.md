# NEXT_STEP — Chrome Sphynx Audio

Status as of **2026-09-10**. Start here after a break, or in a new session.
The body below was written 2026-08-28; the 2026-09-03 and 2026-09-10
measurements are in "Observed" and the claims they overturn are corrected in
place.

> **2026-09-10 in one line:** the plugin side moved, the commerce side did not.
> Block Rotator is licensing-complete and packaged for Linux; Poltergeist's
> licensing was rebuilt after being stripped by a tree refresh. Paddle, Resend,
> `www` and the checkout are exactly where 2026-09-03 left them.

This repo is the **company-wide master** for e-commerce, licensing, and the
website. Plugin and installer changes are **not** made from here — decisions
are settled here, then issued as HandOff prompts to sessions opened in the
target repos, and the results are verified back here. See
`docs/handoffs/SYNC_LEDGER.md` for what has been issued and verified, and
`docs/handoffs/ORDER_OF_WORK.md` for sequencing.

Release work lives in `~/XODMK/xodCode/xodCpp/csphxAudioPLUGX/`. The `_PLUGX`
projects are the final RELEASE masters; they each carry the documentation set
and the PDF generation script, and the `_INSTALL` projects are responsible for
generating the PDFs from the master `build_docs.sh`.

`csphxAudioVST3/` holds the `_VST3MSTR` projects. These are **temporary
pre-license RELEASE masters**, standing in only until licensing is complete —
which is itself blocked on Paddle and on the domain. They are **not** the
master. Their doc files are currently *newer* than the `_PLUGX` copies; reading
"newer" as "authoritative" inverts the intended flow and is the specific
mistake to avoid.

> Path note: earlier revisions of this file wrote these as
> `/home/csphx/XODMK/xodCode/...`, which exists on no machine as written. The
> real prefix is `~/XODMK/xodCode/xodCpp/`. Looking for the literal old path
> leads to the false conclusion that the trees are absent.

---

## What we know vs. what we're inferring

### Observed (measured 2026-08-28)

- `chromesphynx.com` is registered, with DNS authoritative at Cloudflare
  (`leonidas.ns.cloudflare.com` / `martha.ns.cloudflare.com` — Cloudflare's
  randomly assigned nameserver pair, *not* project-specific names).
- Cloudflare Email Routing is live at the DNS layer: `MX` →
  `route{1,2,3}.mx.cloudflare.net`; `TXT` → `v=spf1
  include:_spf.mx.cloudflare.net ~all`. Source: direct queries against 1.1.1.1.
- The domain had **no `A`, `AAAA`, or `CNAME`** record on apex or `www`, so it
  did not resolve at all. That — not a broken deployment — is what produced
  `DNS_PROBE_POSSIBLE` in the browser.
- The site itself is healthy: `chrome-sphynx-web.vercel.app` returns 200 on all
  15 routes; `/api/webhooks/paddle` returns 405 (POST-only, correct); the WIP
  notice renders and no Paddle checkout script loads — consistent with
  `PURCHASING_ENABLED = false`.
- `npm test` → **23/23 pass**, with no secrets configured.
- The doc toolchain reproduces the shipped PDFs on this machine: pandoc 2.9.2.1,
  XeTeX 3.141592653, python3 3.10.12, rsvg-convert 2.52.5, inkscape 1.1.2.
  Rebuilding `Poltergeist_ProductPage.pdf` produced 444,725 bytes against the
  committed 443,846 — normal PDF nondeterminism, not a content difference.
- `github.com/xodmk` is a personal **User** account, not an organization. The
  repo is **public**.
- `~/.ssh/escheiSSHKey` (RSA 3072) is **not registered** on that account —
  GitHub returns `Permission denied (publickey)` even when it is offered
  directly. No git credential helper is configured either.
- **None of the seven** plugin / installer / `cslicense` repos has a git remote.
- `_PLUGX` has the three user-facing `.md` but **no `build_docs.sh`, no
  `docs/gfx/`, no `docs/pdf/`** — it cannot currently build a PDF. The
  `_INSTALL` projects contain zero references to `build_docs`, `pandoc`, or
  `.pdf` in any script.

### Observed (measured 2026-09-03)

Re-measured after a machine crash. Nothing was lost: `ChromeSphynxWeb` has a
clean working tree, and every `_PLUGX` / `_INSTALL` / `cslicense` repo is
committed at the same HEAD the ledger records.

- **The domain now serves.** `chromesphynx.com` resolves to `66.33.60.193` /
  `76.76.21.241` (Cloudflare CNAME flattening, so the apex answers with `A`
  records) and returns **200** over HTTPS. Nameservers are unchanged at
  Cloudflare. The Cloudflare CNAME step described below is **done**.
- **`www.chromesphynx.com` is broken.** DNS is correct — it answers
  `cname.vercel-dns.com`, then the same two Vercel addresses — but the
  certificate Vercel serves carries `CN = chromesphynx.com` with a single SAN,
  `DNS:chromesphynx.com`. `www` is absent, so HTTPS fails to negotiate
  (`curl` exit 60). `http://www` still issues a 308 to `https://www`, which
  then dead-ends. A visitor typing `www.` gets a browser security warning, not
  the site.
- **The two newest commits are not on the remote.** `git fetch` confirms
  `main` is ahead of `origin/main` by `074f32d` (the v1.2 PDF publication) and
  `f7527ef` (this file). Consequence, measured against the live site: every
  published PDF path 404s —
  `/docs/block-rotator/BlockRotator_UserGuide.pdf`,
  `/docs/poltergeist/Poltergeist_UserGuide.pdf` and the `DOC_VERSION` files all
  return `404 text/html`.
- **Push is still unauthenticated.** `origin` is HTTPS, no credential helper is
  configured, `~/.ssh/config` does not exist, and `~/.ssh/escheiSSHKey` is
  present but still unregistered. This is the one thing standing between the
  committed work and the live site.
- `PURCHASING_ENABLED` is still `false` in `src/lib/status.ts` — unchanged, as
  intended.

### Observed (measured 2026-09-10)

A plugin-side session. Nothing about Paddle, DNS, Resend or the checkout moved;
everything below is the C++ trees and this repo's spec copy.

**Push is no longer a blocker.** `main` was pushed to `origin/main`
(`caf4d46..aabb73e`). The four commits that had never left this disk — the
product PDFs, the doc-publishing commit, the launch spec, and today's spec
correction — are now on GitHub, so the PDFs deploy and this file is readable
from another machine. That overturns the 2026-09-03 finding above.

**Executable bits had been stripped from 31 tracked shell scripts** across
`XodBlockRotator_INSTALL`, `XodPoltergeist_INSTALL` and `XodPoltergeist_PLUGX`
(mode `100755` → `100644`, zero content change — a copy across a filesystem
that dropped permissions). No `./build.sh` could run in any of them. Restored;
the working trees then matched their index again. **It recurred in
`XodPoltergeist_PLUGX` after that tree was refreshed**, so treat it as a
symptom of how these trees are copied, not a one-off.

**Block Rotator — licensing UI completed and shipped.** Spec §4 asked for the
licensee name "in an about box"; there was no about box, and no route to one,
because `LicensePanel` hid both itself *and* the KEY button once licensed. A
paying customer had no way to confirm the licence registered. Replaced with an
18 px key glyph pinned **top-right**, drawn as a `juce::Path` (no image asset),
present in **every** state including Licensed and hidden only while the panel
it opens is already up. Opening it while licensed shows a read-only view:
licensee, email, order id, perpetual-vs-expiry. The unlock form is hidden when
licensed. Suite went 172/172, determinism gate pass, 10/10 headers standalone.
Committed as `6197ef8`.

**Block Rotator has been packaged for the first time.** `Linux/` previously
held only `.gitkeep`. Now carries `.deb` (7,883,016), `.rpm` (7,883,625) and
`.AppImage` (86,731,256) at v1.0.0. The chain was verified byte-identical at
every hop — PLUGX `BUILD/` → `prepare-plugin.sh` staged payload → the binary
extracted back out of the `.deb`, all md5 `895ce3a6a4546672cb529a88808d94ae`,
the same build the 172 tests ran against. That closes the stale-binary defect
class for this artefact: the payload now postdates its own `LicensePanel.cpp`.

**Poltergeist had its licensing deliberately removed, and it has been
re-integrated.** The tree was refreshed from the pre-licence development
project. Absent from the working tree: all five licensing sources, both
`Licensing/` directories, every licensing reference in `PluginProcessor` and
`PluginEditor`, every `cslicense` CMake reference, **and the entire `tests/`
directory**. A build from that tree was a permanently-free plugin. Licensing
was rebuilt from Block Rotator as the reference, so the two now share one
structure (`namespace xodlic`, flat `plugin/include/`, standalone
`SessionDemo`). Licensing suite: **21/21 green**.

**Two D-L1/D-N1 naming decisions had been reverted by that refresh**, both
caught by building and testing rather than by reading:

- `PRODUCT_NAME` was back to `xodPoltergeist` (HEAD had `Poltergeist` from
  `0873501`), so the build emitted `xodPoltergeist.vst3` while the installer
  expects `Poltergeist.vst3`. Restored.
- `presets.cpp` wrote user presets to `<Documents>/Chrome Sphynx Audio/Spectral
  Ghost/` while licences resolve to `…/Poltergeist/` — one product's user data
  split across two folders, with the DSP codename leaking into a user-facing
  path. Fixed, **with a one-time migration** (see "Facts worth not
  rediscovering").

**Poltergeist is now at 1.0.0** in all five places, including
`plugin/CMakeLists.txt`'s sub-project version — which is the one JUCE reports
to the host, and the one easiest to miss.

**Spec §4's "UI styling" paragraph was stale** and had been since v3.0. It
still described `TrialActive`/`TrialExpired`/`Unlicensed` and a day-based trial
pill, none of which exist. It is the paragraph an implementer reads when wiring
the licence UI, so it would have misdirected the Poltergeist work in exactly
the place the two plugins must match. Corrected in this repo's master copy
(`aabb73e`) and synced to Block Rotator; both copies byte-identical.

### Working hypotheses (flagged — not confirmed)

- The Vercel account slug is **not** `xodmk`. Building a dashboard URL from the
  GitHub username gave a 404, but Vercel 404s rather than 403s on projects a
  session cannot see, so that does not distinguish "wrong slug" from "wrong
  account". Settle it by opening `vercel.com/dashboard` and reading the slug
  from the address bar.
- Cloudflare proxying is *expected* to break the Paddle webhook and deploy cache
  coherence (see the warning below). This is reasoning from how the components
  work, not an observed failure — no proxied request has been tested.

### Deferred — and the measurement that resolves each

| Question | What settles it |
|---|---|
| Does `chromesphynx.com` serve over TLS? | `curl -sSI https://chromesphynx.com` → 200, once the CNAME is live |
| Does Paddle's webhook arrive intact? | sandbox `transaction.completed` → expect 200, not 403 |
| Does a licence email actually arrive? | configure Resend, trigger `/api/account/resend`, check the inbox |
| Do the plugins behave in a real DAW? | `docs/DAW_VERIFICATION_SCRIPT.md`, once per plugin per format |
| Does the §4 key icon render where it is supposed to? | Load the Block Rotator `.deb` build in a host. Its position is arithmetic, never observed — 18 px at (694, 8) in a fixed 720×660 editor |
| **Do the production keypair halves actually match?** | `CS_LICENSE_PRIVATE_KEY=… node scripts/license-cli.ts issue --type full --product block-rotator --out /tmp/t.cslic`, then `verify --file /tmp/t.cslic --pubkey deda76f2…` (spec §7.1). **Never run.** A mismatch fails looking exactly like "my licence doesn't work", after a customer has paid |
| Does Poltergeist still need its DSP/golden suite, or will the development project supply one? | Ask before rebuilding it; `tests/CMakeLists.txt` currently declares licensing tests only |
| Does the Poltergeist preset migration behave on a real library? | Only ever run against an empty legacy folder (2026-09-10). Test with actual `.xrp` files present before shipping |

---

## Where things stand

**Everything structural is finished.** The engineering that stood between you
and selling is done and verified. What is left is account setup, release
builds, and one round of human testing.

### Website — built, live, purchasing deliberately disabled

Fifteen routes: home, two product pages, `/trial`, `/account`, `/support`,
four legal pages, and two API routes. Prices are $79 each. The legal pages
carry your real trading identity (Elliot Schei, Suginami-ku Takaido Higashi
3-16-33, Tokyo 168-0072), which was the last blocker on merchant-of-record
submission.

Purchasing is gated behind a single switch: `PURCHASING_ENABLED` in
`src/lib/status.ts`. Every buy button shows an amber "Work in progress — not
yet on sale" notice and an inert control. **Flipping that one constant is the
entire go-live action** for the site.

### Domain and DNS — apex live, `www` still broken

> **Status 2026-09-03:** both steps below were completed for the apex and it
> now serves. `www` was given its Cloudflare CNAME but never added in Vercel,
> so Vercel's certificate does not cover it and HTTPS on `www` fails. Repeat
> step 1 for `www.chromesphynx.com`. Everything else in this section is
> retained because the two warnings still apply.

The site was only ever reachable at `chrome-sphynx-web.vercel.app`; the domain
resolved to nothing. Activation is two steps in two dashboards, and Cloudflare
stays authoritative throughout:

1. **Vercel** → project → Settings → Domains → add `chromesphynx.com`.
2. **Cloudflare** → DNS → add:

   | Type | Name | Target | Proxy |
   |---|---|---|---|
   | CNAME | `@` | `cname.vercel-dns.com` | **DNS only** (grey) |
   | CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (grey) |

A CNAME at the apex is normally illegal; Cloudflare's CNAME flattening makes it
work. Use the CNAME rather than an A record — Vercel assigns addresses per
project and has changed them (`vercel.com` → `64.239.109.65`, `nextjs.org` →
`216.230.86.1`), so a hardcoded IP goes stale. `cname.vercel-dns.com` tracks the
right target automatically.

> ### ⚠️ Two settings that will quietly break this
>
> **Do not delegate DNS to Vercel's nameservers.** When Vercel offers to manage
> DNS, decline and keep Cloudflare. Cloudflare Email Routing only works while
> Cloudflare is authoritative — delegating would kill
> `support@chromesphynx.com` permanently (it cannot be recreated on Vercel DNS)
> and drop the SPF record that licence email will depend on.
>
> **Do not enable Cloudflare's proxy (orange cloud).** Cloudflare's "proxying is
> required for most security features" banner is generic advice for unprotected
> origins; Vercel already provides CDN, TLS, and DDoS mitigation. Proxying adds
> three specific hazards:
> 1. **It breaks the deploy loop.** Cloudflare caches in front of Vercel and
>    Vercel cannot purge it, so a successful deploy keeps serving the old site
>    until the TTL expires — with no error anywhere.
> 2. **It endangers the Paddle webhook.** Bot Fight Mode and WAF rules are
>    designed to challenge automated POSTs to API paths. Paddle would get a
>    challenge or 403 instead of reaching the route; the signature check in
>    `src/lib/licensing/paddle.ts` is HMAC over the *raw* body, so anything that
>    alters or blocks the request yields 403 and endless retries while the
>    customer receives nothing.
> 3. **It can stall TLS issuance**, producing certificate errors that look like
>    an unrelated fault.
>
> If Cloudflare's WAF is wanted later, enable it only *after* a sandbox purchase
> has succeeded, and add a cache-bypass rule for `/api/*` plus a WAF skip for
> `/api/webhooks/*`. Then re-test the purchase.

### Product documentation — published in this repo

The finalized **v1.2** documents for both plugins now ship from this repo:

- `public/docs/<plugin>/*.pdf` — intended to be served by Vercel at
  `/docs/block-rotator/BlockRotator_UserGuide.pdf` and equivalents. **They are
  not live yet:** as of 2026-09-03 every one of those paths returns 404,
  because the commit that adds them has never been pushed. An earlier revision
  of this file claimed they were verified at 200 as `application/pdf`; that was
  measured locally, not against the deployed site. Pushing resolves it.
- `docs/product/<plugin>/*.md` — the same content in source form, so site
  development can read product wording without opening a PDF.
- `public/docs/<plugin>/DOC_VERSION` — the version the PDFs were built from,
  matching the `<!-- doc-version: X.Y -->` comment on line 1 of each `.md`.

**These are snapshots, not masters.** `_PLUGX` remains the release master for
the documents and `_INSTALL` generates PDFs for local builds; this repo carries
the published copy so the website can link downloads and so site development can
read the content. See `docs/product/README.md`. When updating a snapshot,
replace the PDFs, the `.md`, and `DOC_VERSION` together so they never disagree.

They were taken from `_VST3MSTR` because that tree holds the only built PDFs —
`_PLUGX` has no `pdf/` at all. That is a gap in `_PLUGX`, not a change of
master.

### Licensing — stateless, no database

Ed25519-signed `.cslic` licences the plugin verifies **offline, forever**, with
no runtime dependency on us or on Paddle. There is no database and none is
needed: licences are derived deterministically from the order, so a duplicate
webhook re-sends the identical file and a lost licence is regenerated by asking
Paddle what the customer bought.

The production key is generated and registered. Public half:
`deda76f2f48f57795d1f7cc25e283d8811c6c492efb00bcaa936582586964275`. The private
half lives only in Vercel (`CS_LICENSE_PRIVATE_KEY`, confirmed live) and your
password manager — **losing it invalidates every licence ever issued.**

### Plugins — both at spec v3.0 (table refreshed 2026-09-10)

| | Block Rotator | Poltergeist |
|---|---|---|
| Tests | **172/172**, zero failures; determinism gate pass | **21/21 licensing** — see the caveat below |
| Production key | in | in (identical constant, verified against BR's) |
| `PRODUCT_NAME` | `BlockRotator` | `Poltergeist` (reverted by the refresh, restored) |
| Version | 1.0.0 | 1.0.0 (was 0.1.0) |
| Session demo | yes, standalone `SessionDemo` | yes, same class after re-integration |
| Key icon (§4) | yes, top-right, all states | yes, ported |
| `kBuyUrl` | `/plugins/block-rotator` | `/plugins/poltergeist` |
| Linux package | **built** — deb/rpm/AppImage | not built |
| `cslicense` pin | `7ba45b1` | `73e2246` (verified at `057e809`) |

> **Poltergeist's DSP/golden suite is missing, not passing.** The 247/256 figure
> in earlier revisions of this file described a tree that no longer exists — the
> refresh removed `tests/` entirely. What was rebuilt is a licensing-only
> `tests/CMakeLists.txt`; the DSP, algorithm and golden tests are **absent** and
> were deliberately not re-declared, on the assumption the development project
> supplies its own. Do not read 21/21 as equivalent to Block Rotator's 172/172.
> Restoring that suite is an open item.

Unlicensed plugins run a **fully functional 20-minute session demo with preset
saving disabled**. A licensed plugin does **no licensing work at all** —
`prepareToPlay` returns immediately and nothing touches disk. The audio-thread
cost is one relaxed atomic load; demo mode adds one 64-bit subtract and compare
(measured 0.62–0.73 ns/block). The VST3 class ID was **unchanged** by the
rename, so no saved sessions are at risk.

### Installers and shared module

Both installers describe the demo correctly and carry a matching DEMO clause in
their EULA. They remain licence-agnostic — they install binaries and point at
`chromesphynx.com/account`. `cslicense` is at `057e809` and is now **pinned** in
both plugins: if the module moves, configure fails with a message naming both
SHAs instead of a mystery compile error.

---

## What is NOT done

1. **No Paddle account exists.** Nothing has been submitted. This is the only
   item with an external clock — 3–7 business days.
2. **No human has opened either plugin in a DAW.** Every state is verified by
   unit test and disassembly; none has been *seen*. Script ready at
   `docs/DAW_VERIFICATION_SCRIPT.md`.
3. ~~**No release builds exist.**~~ **Partly done (2026-09-10).** Block Rotator
   now has Linux `.deb`, `.rpm` and `.AppImage` at v1.0.0, carrying a payload
   verified byte-identical to the tested build. Still missing: **Poltergeist's
   Linux package** (the plugin builds and its licensing passes, but
   `prepare-plugin.sh` and `build.sh` have not been run in its `_INSTALL`
   tree), and **every macOS artefact** for both plugins — signed and notarised
   `.pkg` can only be produced on the Mac, with the Developer ID certs.
4. **Email sending is not configured.** `RESEND_API_KEY` is unset. See the
   warning below — this one bites silently.
5. ~~**Domain not yet serving.**~~ **Done, apex only (2026-09-03).**
   `chromesphynx.com` resolves and returns 200; `support@chromesphynx.com`
   routing was already complete. What remains is `www`: add
   `www.chromesphynx.com` in **Vercel** → Settings → Domains (redirect to the
   apex). The Cloudflare `www` CNAME already exists, but Vercel will not issue
   a certificate for a hostname it has not been told about, so `www` currently
   fails TLS outright. Do **not** fix this by removing the `www` record — that
   trades a warning for a dead name.
6. **Nothing outside this repo can reach another machine.** All seven plugin,
   installer, and `cslicense` repos are git repos with **no remote configured**.
   Only `ChromeSphynxWeb` is on GitHub. Documentation now transfers because it
   is published here; plugin *source* still moves only by hand.
7. ~~**The published PDFs are committed but not deployed.**~~ **Done
   (2026-09-10).** `main` was pushed (`caf4d46..aabb73e`) and is level with
   `origin/main`. The eight product PDFs are on GitHub and deploy with the
   site. Note this made them world-readable — intended, but now actually true.
   **The plugin trees still have no remotes**, so the C++ source — including
   today's licensing work — exists on one disk only.
8. **`_PLUGX` cannot build its own documentation.** It holds stale copies of the
   three user-facing `.md` and has no `build_docs.sh`, no `docs/gfx/`, and no
   `docs/pdf/`. The `_INSTALL` projects reference PDF generation nowhere. The
   arrangement described at the top of this file is the intended target, not the
   current state.

> **Email is a launch blocker, not a nicety.** Without `RESEND_API_KEY`, a real
> purchase generates a correct licence, fails to email it, and returns 500 — so
> Paddle retries indefinitely while the customer receives nothing. Set it up
> before the first live sale. When you do, **merge Resend's SPF `include:` into
> the existing record** rather than adding a second TXT record; Cloudflare Email
> Routing already created one, and two SPF records will send mail to spam.

---

## The next step

> **Picking this up after 2026-09-10.** Track 2 below is now cheap to start:
> Block Rotator has an installable `.deb`/`.rpm`/`.AppImage`, so the DAW pass no
> longer needs a build first. It is also the single highest-value open item,
> because the key icon added on 2026-09-10 has **never been seen rendered** —
> its placement is arithmetic (18 px at 694,8 in a 720×660 editor whose top
> strip centres its controls at x≈113–607), not observation.
>
> Two smaller things are queued behind it, both plugin-side and both recorded
> in "Observed (measured 2026-09-10)": package Poltergeist for Linux, and
> decide whether to restore Poltergeist's DSP/golden test suite. Neither blocks
> Track 1.
>
> Nothing in the Poltergeist tree is committed yet.

**Two tracks. Start both now — neither blocks the other.**

### Track 1 — Open the Paddle account today

It is pure waiting time, and it is the only thing you cannot compress. Sign up
at paddle.com, then work through verification in the dashboard at
vendors.paddle.com. Three phases: **domain review** (submit
`chromesphynx.com`), **business verification** — skip it, explicitly not
required for sole traders — and **identity verification** (government ID plus
proof of address, via Sumsub).

Have ready: ID, proof of address at the Tokyo address, bank details for
payouts. The site already satisfies their published checklist: product
descriptions, pricing, features, and Terms / Refund / Privacy reachable from
site navigation.

Decide before submitting whether the "work in progress" notice stays up. It
should not block review, but a reviewer may ask.

### Track 2 — Run the DAW verification script

`docs/DAW_VERIFICATION_SCRIPT.md`, once per plugin per format. It is the
largest untested surface left, and it targets precisely what tests cannot see:
a panel rendering off-screen, a countdown reading negative, a modal that traps
the user, and — the single most important check — **a click at the demo expiry
boundary**. The script solves both setup problems (issuing a real licence, and
not waiting 20 minutes per expiry test).

Report failures back here; they become the next handoff rather than direct
edits, which is what keeps the repos from drifting.

### Then, in order

1. Fix anything the DAW pass finds.
2. Configure Resend and verify a licence email actually arrives.
3. Cut release builds — signed and notarised on macOS, packaged on Linux.
4. Create the Paddle catalog; set `PADDLE_WEBHOOK_SECRET_KEY`, `PADDLE_API_KEY`,
   and `CS_PADDLE_PRODUCT_MAP`; point a notification destination at
   `/api/webhooks/paddle` for `transaction.completed`.
5. End-to-end sandbox purchase: checkout → webhook → licence email → paste into
   the plugin → unlocked.
6. Publish downloads on the product pages. The PDFs are already in the repo and
   will be served once the pending commits are pushed — this is now only a link from
   `src/app/plugins/[slug]/page.tsx` to `/docs/<plugin>/<file>.pdf`.
7. Flip `PURCHASING_ENABLED` to `true`.

---

## Working across machines

**Vercel and Cloudflare changes are not files.** DNS records live on
Cloudflare's servers and domain settings and environment variables live on
Vercel's; both are already visible from any machine you log into. There is
nothing to commit or sync for either. Only repository files travel through git.

Before the first push from a new machine, authentication has to exist — neither
path currently works on the Linux box:

- The remote is HTTPS with **no credential helper**, and GitHub rejects account
  passwords; a Personal Access Token is required.
- `~/.ssh/escheiSSHKey` is **not registered** on the `xodmk` account.

To use SSH, register `~/.ssh/escheiSSHKey.pub` at `github.com/settings/keys`,
then point the remote at it and pin the identity (the key has a non-standard
filename, so SSH will not offer it automatically):

```
git remote set-url origin git@github.com:xodmk/ChromeSphynxWeb.git
printf 'Host github.com\n  IdentityFile ~/.ssh/escheiSSHKey\n  IdentitiesOnly yes\n' >> ~/.ssh/config
```

On the receiving machine:

```
git clone git@github.com:xodmk/ChromeSphynxWeb.git
cd ChromeSphynxWeb && npm install
vercel link && vercel env pull .env.local   # secrets, for local licence signing
```

`.env.local` is gitignored deliberately. Secrets come from Vercel, never from
git — `vercel env pull` is the whole distribution mechanism, and it is how
`CS_LICENSE_PRIVATE_KEY` reaches a second machine without ever entering the
repository.

---

## Facts worth not rediscovering

- **Commits must be pushed.** Vercel deploys from the GitHub remote; committing
  locally changes nothing that anyone can see.
- **Vercel env vars only apply to new deployments.** After adding one, redeploy.
- **The Vercel dashboard slug is not the GitHub username.** Hand-building
  `vercel.com/xodmk/...` returns 404. Open `vercel.com/dashboard` and click
  through; Vercel 404s rather than 403s on anything your session cannot see, so
  a 404 never tells you whether it is the wrong slug or the wrong account.
- **Cloudflare's nameserver names are random first names** — `leonidas`,
  `martha`. They carry no meaning and nothing about them needs configuring;
  seeing them only confirms the domain's DNS is hosted at Cloudflare.
- **Whoever holds the nameservers owns every record on the domain** — web,
  email, and verification tokens alike. Cloudflare already holds working email
  records, so Cloudflare keeps the nameservers and Vercel gets pointed to.
- **This repo is public.** Anything committed to `public/` is world-readable the
  moment it is pushed, the product PDFs included.
- **Adopting a newer `cslicense` means bumping `CSLICENSE_EXPECTED_SHA`** in the
  same commit that adapts the plugin to it. The pin exists because the module
  silently broke both plugins once.
- **The licensing gate is not where CPU goes.** It measured 0.20 ns/block —
  roughly 1/300th of the unused `AudioProcessLoadMeasurer` that was removed from
  Block Rotator alongside it.
- **`getStateInformation` must never be blocked** by the demo. It is host
  session state, not preset saving; blocking it reads as data loss.
- **A tree refresh from the development project silently removes licensing.**
  It happened to Poltergeist on 2026-09-10: five sources, both `Licensing/`
  dirs, all `cslicense` CMake wiring, every reference in the processor and
  editor, and the whole `tests/` directory — leaving a build that is a
  permanently-free plugin with no gate and no demo. It also reverted two
  committed naming decisions (`PRODUCT_NAME`, and the preset directory). After
  ANY such refresh, verify: `grep -rn cslicense CMakeLists.txt
  plugin/CMakeLists.txt`, that `plugin/include/LicenseConfig.h` exists, and
  that the build emits the bundle name `plugin.config.sh` expects.
- **Poltergeist's preset directory moved, with a one-time migration.** Presets
  used to live at `<Documents>/Chrome Sphynx Audio/Spectral Ghost/`; D-L1 makes
  that a DSP-core codename that must not appear in a user-facing path, and
  licences always resolved to `…/Poltergeist/`. `PresetManager` now migrates on
  first run — **rename only, never merge, never delete**, and only when the new
  folder does not already exist. A failed migration leaves the old folder
  untouched and creates an empty new tree, so presets are always recoverable by
  hand. Verified live on 2026-09-10: the legacy folder moved and the
  neighbouring `Block Rotator/` library (45 files) was untouched.
- **Spec §7.2 Vector A is a *block-rotator* trial and Vector B is a
  *poltergeist* full licence.** They are not interchangeable: each is the wrong
  product for the other plugin's build and must be rejected at §2 step 4. A
  test ported between the two plugins without swapping vectors will either fail
  or pass vacuously.
- **`juce_add_plugin` reports the SUB-project version**, the one in
  `plugin/CMakeLists.txt`, not the root `project()` version. Bumping only the
  root leaves the host showing the old number.
- **Executable bits do not survive however these trees are being copied.** Seen
  twice on 2026-09-10, on 31 scripts and then again after a refresh. If
  `./build.sh` reports "Permission denied", it is this, and `git diff` will
  show mode-only changes with zero content diff.
- Legal drafts follow Paddle's requirements and standard practice for
  downloadable software, but they have not been reviewed by a lawyer.
