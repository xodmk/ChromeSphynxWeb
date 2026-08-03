# Plugin Sync Ledger

Master record of handoffs issued from ChromeSphynxWeb to plugin projects.
States: issued → in-progress → reported → verified.

RELEASE work directory (2026-08-03): `/home/csphx/XODMK/xodCode/csphxAudioPLUGX/`.
`csphxAudioVST3/` is the legacy dev directory.

| Handoff | Target | Repo | cslicense SHA | State | Notes |
|---|---|---|---|---|---|
| HANDOFF-01 | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `954b766` | **verified** 2026-08-03 | 119/119 tests; helper is private + macOS uses Apple presets tree (decision D-L2 below) |
| HANDOFF-01 | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `954b766` | **verified** 2026-08-03 | 227 pass / 9 pre-existing fails (unchanged set); display name hardcoded "Spectral Ghost" (decision D-L1 below) |
| HANDOFF-02A | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `d2c0006` | **reported** 2026-08-03 | R1 latched gate delivered; 126/126 tests; Release VST3 links (19 `cslic::` syms); diff audit = 2 hunks, no DSP change |
| HANDOFF-02B | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `d2c0006` | **reported** 2026-08-03 | R1 latched gate delivered; 249/258 (9 pre-existing fails unchanged), 16/16 licensing; Release VST3 re-verified under HANDOFF-03 — it did **not** link before `d2c0006` |
| HANDOFF-03 | master (report back) | — | `d2c0006` | **reported** 2026-08-03 | cslicense PIC fix; both plugins re-verified from clean trees; 3 upstream items + 4 open decisions |
| — | Block Rotator installer | `csphxAudioPLUGX/XodBlockRotator_INSTALL` | n/a | no changes needed | Installer is license-agnostic; only PLUGIN_LICENSE_URL later |
| — | Poltergeist installer | `csphxAudioPLUGX/XodPoltergeist_INSTALL` | n/a | no changes needed | Same |

Shared-module reference: `csphxAudioPLUGX/cslicense` @ **`d2c0006`**
(`954b766` + `POSITION_INDEPENDENT_CODE ON`). Behaviour is unchanged from
`954b766` — the delta is build-only. Required by every consumer that links
cslicense into a plugin target: VST3/AU are shared modules and a non-PIC static
library will not link into one on Linux. See HANDOFF-03.

`954b766` implements spec v1.2 — the v1.1→v1.2 delta raised in the Poltergeist
report was storage §3 + UI §4, both already present, so nothing is unimplemented.
Note `cslicense.h`'s header comment still *says* v1.1 and still gives v1.2
guidance on `defaultLicenseDir()`; comments only, code is correct (HANDOFF-03
action 2).

## Decisions escalated by prep reports — RESOLVED 2026-08-03

- **D-L1 (Poltergeist)**: official display name is **Poltergeist**
  (product id `poltergeist`); "Spectral Ghost" stays internal-codename only.
  HANDOFF-02B carries the user-data folder rename + one-time migration.
- **D-L2 (license location)**: licenses live in
  `<Documents>/Chrome Sphynx Audio/<Display Name>/` on **every OS** via
  `cslic::defaultLicenseDir`, decoupled from preset storage
  (macOS presets stay in the Apple tree). Spec bumped to **v1.3**.
