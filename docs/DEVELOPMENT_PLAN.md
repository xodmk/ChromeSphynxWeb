# Chrome Sphynx Audio — Website & Commerce Development Plan

Status: Draft v1.1 — 2026-08-02 (D6 resolved: 20-day email-gated trial; see
docs/LICENSING_DESIGN.md)
Scope: ChromeSphynxWeb (Next.js site), licensing system, Merchant-of-Record
commerce integration, installer integration for Block Rotator and Poltergeist.

---

## What we know vs. what we're inferring

### Observed (measured facts, with source)

**Website (`ChromeSphynxWeb`, deployed at chrome-sphynx-web.vercel.app)**
- Next.js 14 (App Router) + React 18 + TypeScript; Tailwind is in
  devDependencies but the page uses hand-rolled CSS classes
  (source: `package.json`, `src/app/page.tsx`).
- The entire site is a single page (`src/app/page.tsx`) rendered from
  `src/content/content.json` — header, hero, plugin cards, showcase,
  features, optional testimonials, footer. No routing, no per-product
  pages, no API routes, no commerce, no downloads, no auth
  (source: repo tree, `page.tsx`).
- `next.config.js` sets `eslint.ignoreDuringBuilds` and
  `typescript.ignoreBuildErrors` — build-time checks are disabled
  (source: `next.config.js`).
- `content.json` lists four plugins (Block Rotator, DDLSD Stereo Delay,
  GodVader, +1). **Poltergeist is not among them.** Several entries share
  copy-pasted placeholder descriptions ("Transform sounds with spectral
  precision…"), placeholder image paths (`spectral-morph.jpg`), and demo
  audio paths; footer links point to `/privacy`, `/terms`, `/contact`,
  `/support` — none of these pages exist (source: `content.json`, repo tree).

**Plugins**
- Both are JUCE/CMake C++17 VST3 projects: `xodBlockRotator_VST3` v1.0.0,
  Poltergeist (`xodSpectralGhost` DSP core) (source: `CMakeLists.txt` of both).
- Both have test suites (`tests/`, `build_utest.sh`) (source: repo trees).

**Installers (`*_install` repos)**
- A deliberately reusable, plugin-agnostic installer architecture:
  `plugin.config.sh` is the single source of truth; `configure.sh` injects
  it into all layers (source: `ARCHITECTURE.md`).
- macOS: native signed + notarized `.pkg` (VST3 + AU + factory presets);
  signing is global (`~/.config/csphx/`, `signing-lib.sh`), not per-plugin.
  Linux: Tauri custom-GUI installer producing `.deb`/`.rpm`/`.AppImage`.
  Windows: latent in the Tauri layer, not currently built or shipped
  (source: `ARCHITECTURE.md`).
- `EULA.txt` exists and is embedded in the Linux app / shown in the `.pkg`
  (source: `ARCHITECTURE.md`, installer trees).

**Licensing**
- No licensing/activation infrastructure exists in the installers
  (source: grep of installer scripts — hits are EULA text and license
  headers only).

**Merchant of Record landscape (web sources, 2026)**
- Paddle: 5% + $0.50/txn, no monthly fee; accepts individuals/sole traders
  without incorporation.
- Lemon Squeezy: 5% + $0.50 (+1.5% international card surcharge); payouts
  via bank transfer (79 countries) or PayPal (200+).
- FastSpring: negotiated rates (typically ~5.9%+); supports Individual
  account type with national Tax ID; JPY is a supported payout currency.
  (Sources listed at bottom.)

### Working hypotheses (flagged)

- H1: The `licens|serial|activat` grep hits inside plugin `source/` are
  license *headers* and preset-related text, not activation code. Not yet
  confirmed by reading those files.
- H2: All three MoR candidates can onboard a Japan-based sole proprietor
  (個人事業主). Supported by general "individuals accepted" and payout-country
  statements, but **no source explicitly confirmed Japan sole-proprietor
  onboarding for any of the three.** Provisional.
- H3: FastSpring and Paddle are the platforms most commonly used by
  established audio-plugin vendors; Lemon Squeezy skews indie/newer. Based
  on comparison articles, not a survey of actual plugin vendors. Provisional.
- H4: Under the MoR model, the MoR is the legal seller to end customers, so
  consumer-facing tax (EU VAT, JP consumption tax on domestic sales) and
  the Japanese 特定商取引法 seller-disclosure burden fall primarily on the
  MoR, while your revenue is B2B income from the MoR. Plausible and widely
  claimed, but must be confirmed with the chosen MoR and a Japanese tax
  professional.

### Deferred questions + measurement plan

| # | Question | How to resolve |
|---|----------|----------------|
| D1 | Which MoRs onboard a Japan 個人事業主 with JPY or USD payouts, and what KYC docs do they need? | Open onboarding/sandbox accounts at Paddle, Lemon Squeezy, FastSpring; ask support directly. ~1 evening each. |
| D2 | Do the acquirer rules of each MoR allow "downloadable software with license keys" without extra review? | Same support tickets as D1. |
| D3 | JP tax treatment of MoR payouts (export B2B service? consumption-tax exempt?) and blue-return bookkeeping shape | One consultation with a JP tax accountant (税理士) before first sale. |
| D4 | Is there any existing activation code in plugin sources (H1)? | 30-min read of the grep-hit files before designing the license module. |
| D5 | Windows installer: required for launch? (Most plugin customers are on Windows/macOS.) | Business decision; measure demand or commit to building the latent Tauri Windows path. |
| D6 | ~~Where do demo/trial builds fit (feature-limited vs. time-limited)?~~ **Resolved 2026-08-02**: 20-day time-limited trial, issued as an email-gated Ed25519-signed license (owner decision, influenced by Audio Damage/u-he research). Design + website implementation: `docs/LICENSING_DESIGN.md`, `docs/PLUGIN_LICENSE_SPEC.md`. | — |

---

## 1. Current-state summary

The site is a clean but static single-page brochure driven by one JSON file.
The plugin and installer side is substantially more mature than the web side:
a reusable, signed, multi-OS installer pipeline already exists. The missing
middle is everything commercial: product truth (Poltergeist absent, placeholder
copy), legal pages, checkout, license generation, license verification in the
plugins, and delivery of installers to paying customers.

## 2. Target architecture (end state)

```
Customer browser
   │
   ▼
Next.js site (Vercel)
   ├─ Marketing pages (home, /plugins/[slug], /support, legal)
   ├─ MoR checkout (overlay/hosted page from Paddle or LS or FastSpring)
   │
   ▼  webhook (purchase completed)
Vercel API route (serverless)
   ├─ verifies webhook signature
   ├─ generates Ed25519-signed license key/file (private key in env vars)
   ├─ records order (serverless Postgres/SQLite — Vercel Postgres or Turso)
   └─ triggers fulfillment email: license + download links
   │
   ▼
Customer machine
   ├─ downloads installer (MoR file delivery or R2/S3 signed URLs)
   ├─ installer installs VST3/AU (+ optionally places license file)
   └─ plugin verifies license offline with embedded public key
```

Design principle: **offline verification, no activation server.** An
Ed25519-signed license file checked by a public key compiled into the plugin
gives zero server dependency at runtime, zero "activation server down" support
burden, and is the norm for respected indie audio vendors. Machine binding /
online activation is deliberately deferred — it can be layered on later without
breaking the file format if piracy proves material.

## 3. Phases

### Phase 0 — Repo & content hygiene (small, do first)
- Re-enable TypeScript/ESLint build checks in `next.config.js`; fix what breaks.
- Add Poltergeist to `content.json`; remove or clearly mark "coming soon" the
  plugins that aren't launching (DDLSD, GodVader, …). Launch focus: Block
  Rotator + Poltergeist only.
- Replace placeholder descriptions/images/audio for the two launch products
  with real assets (screenshots from the actual GUIs, real demo renders).
- Fix typos in content ("Steteo", "Stero", "Reverband", "Multimodefiltering").

### Phase 1 — Site structure & product pages
- Introduce routing: `/` (home), `/plugins/[slug]` (deep product pages),
  `/support`, `/privacy`, `/terms`, `/eula`, `/contact` (footer already links
  to several of these; MoR onboarding also requires working legal pages).
- Product page anatomy: hero screenshot, feature grid, audio demos
  (before/after A-B player), spec table (formats, OS, DAW compatibility),
  changelog, FAQ, buy button, demo download.
- Keep the content-driven JSON approach — extend the schema per product
  rather than hard-coding pages. Move per-product content to
  `src/content/plugins/<slug>.json` if `content.json` gets unwieldy.
- Visual pass: the "visually dynamic" goal — animated hero, product-card
  motion, dark aesthetic consistent with the Chrome Sphynx branding assets
  already in the installer repos (`branding/`).

### Phase 2 — MoR selection & onboarding (parallel with Phase 1)
- Resolve D1/D2 with real support tickets and sandbox accounts.
- Selection criteria, in order: (1) confirmed Japan sole-proprietor
  onboarding + payout; (2) webhook quality & sandbox for license-key
  fulfillment; (3) fees; (4) checkout UX (overlay vs redirect);
  (5) built-in file delivery (nice-to-have, not required).
- Working recommendation (provisional until D1 lands): **Paddle** first
  choice for checkout overlay + flat pricing + individual-seller support;
  **FastSpring** the fallback with the longest audio-industry track record;
  **Lemon Squeezy** acceptable for fastest setup but weakest fit at scale
  (Stripe-owned, higher effective international fees).
- Japan admin (outside the website, tracked here for context): file 開業届
  within 1 month of starting business, 青色申告承認申請書 within 2 months
  (or by 15 March of the year); book D3 accountant consultation.

### Phase 3 — Licensing system (design doc first, then build)
This is the highest-risk integration; write a short spec before code.
- **License format**: JSON payload (product ID, customer name/email hash,
  order ID, issue date, version ceiling or "perpetual + N years updates") +
  Ed25519 signature, base64-encoded into a `.cslic` file and/or a pasteable
  key block.
- **Generation**: tiny TypeScript module in the website repo, invoked from
  the MoR webhook route. Private key only in Vercel env vars; a CLI wrapper
  for manual issuance/reissuance (support cases).
- **Verification**: one small shared C++ module (Ed25519 verify + JSON parse,
  e.g. monocypher/libsodium — no OpenSSL dependency) consumed by both plugin
  repos; JUCE-side UI = "Drop license file / paste key" dialog + unlicensed
  nag or feature-limit mode. Shared module lives in its own repo/submodule so
  both plugins and future products reuse it.
- **License location**: OS-standard app-data dirs (`~/Library/Application
  Support/ChromeSphynx/`, `%APPDATA%/ChromeSphynx/`, `~/.config/csphx/` —
  the installers' Tauri/pkg layers can optionally place the file there).
- **Installer integration**: installers stay license-agnostic (install
  binaries only); the plugin handles licensing on first run. This keeps the
  existing `.pkg`/Tauri architecture untouched.
- **Demo strategy** (D6, resolved 2026-08-02): 20-day time-limited trial.
  The trial is itself an Ed25519-signed license with `expiresAt`, issued
  email-gated from `/trial` (one per email+product), so runtime verification
  stays fully offline — the earlier feature-limited recommendation is
  superseded by owner decision. On expiry: dry passthrough + locked GUI.
  Full spec and threat model: `docs/LICENSING_DESIGN.md`,
  `docs/PLUGIN_LICENSE_SPEC.md`. Website side implemented
  (`src/lib/licensing/`, `/api/trial`, `/trial`, `scripts/license-cli.ts`).

### Phase 4 — Commerce wiring & fulfillment
- Buy buttons → MoR checkout (overlay preferred) per product.
- Webhook endpoint (`/api/webhooks/<mor>`): signature verification, license
  generation, order persistence, fulfillment email (license + signed
  download URLs). Installer binaries hosted on Cloudflare R2 (no egress
  fees) unless the chosen MoR's file delivery is adequate.
- "Resend my license / downloads" self-serve page keyed on order email —
  cuts most support load.
- End-to-end sandbox test: checkout → webhook → license file → install →
  plugin accepts license, on macOS and Linux (and Windows if D5 says yes).

### Phase 5 — Launch & post-launch
- Analytics (privacy-light: Plausible/Umami), basic SEO/OG metadata,
  newsletter capture (launch discount list).
- Demo builds for both plugins published on product pages.
- Post-launch backlog: user account area (optional — MoR order lookup may
  suffice), remaining plugins (DDLSD, GodVader), Windows installer if
  deferred, bundle pricing.

## 4. Suggested sequencing

Phases 0→1 are pure website work and can start immediately. Phase 2 is
mostly waiting on third parties — start the D1/D2 support tickets *now* so
answers arrive while Phase 1 is underway. Phase 3's spec can be written
before the MoR is chosen (the license format is MoR-independent; only the
webhook adapter differs). Phase 4 depends on Phases 1–3. Nothing in this
plan requires changes to the existing installer architecture.

## 5. Sources (MoR landscape)

- https://dodopayments.com/blogs/best-merchant-of-record-platforms
- https://freemius.com/blog/best-merchant-of-record-software-developers/
- https://fungies.io/paddle-vs-fastspring-vs-lemon-squeezy/
- https://www.paddle.com/compare/lemon-squeezy
- https://www.boathouse.co/paddle-video-series-episode/3-do-you-need-to-incorporate-to-sell-with-paddle
- https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- https://www.lemonsqueezy.com/blog/new-bank-payouts
- https://developer.fastspring.com/docs/activate-your-payout-account
- https://developer.fastspring.com/docs/currencies-and-conversions
