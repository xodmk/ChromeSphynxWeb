# Plugin Sync Ledger

Master record of handoffs issued from ChromeSphynxWeb to plugin projects.
States: issued → in-progress → reported → verified.

RELEASE work directory (2026-08-03): `/home/csphx/XODMK/xodCode/csphxAudioPLUGX/`.
`csphxAudioVST3/` is the legacy dev directory.

| Handoff | Target | Repo | cslicense SHA | State | Notes |
|---|---|---|---|---|---|
| HANDOFF-01 | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | `954b766` | **verified** 2026-08-03 | 119/119 tests; helper is private + macOS uses Apple presets tree (decision D-L2 below) |
| HANDOFF-01 | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | `954b766` | **verified** 2026-08-03 | 227 pass / 9 pre-existing fails (unchanged set); display name hardcoded "Spectral Ghost" (decision D-L1 below) |
| HANDOFF-02A | Block Rotator | `csphxAudioPLUGX/XodBlockRotator_PLUGX` | — | issued (drafted 2026-08-03) | Integration: license panel + ramped dry-passthrough gate; spec v1.3 |
| HANDOFF-02B | Poltergeist | `csphxAudioPLUGX/XodPoltergeist_PLUGX` | — | issued (drafted 2026-08-03) | Integration + D-L1 rename/migration; spec v1.3 |
| — | Block Rotator installer | `csphxAudioPLUGX/XodBlockRotator_INSTALL` | n/a | no changes needed | Installer is license-agnostic; only PLUGIN_LICENSE_URL later |
| — | Poltergeist installer | `csphxAudioPLUGX/XodPoltergeist_INSTALL` | n/a | no changes needed | Same |

Shared-module reference: `csphxAudioPLUGX/cslicense` @ `954b766`
(user-data-standard storage alignment; implements spec v1.2 — the v1.1→v1.2
delta raised in the Poltergeist report was storage §3 + UI §4, both already
in `954b766`, so nothing is unimplemented).

## Decisions escalated by prep reports — RESOLVED 2026-08-03

- **D-L1 (Poltergeist)**: official display name is **Poltergeist**
  (product id `poltergeist`); "Spectral Ghost" stays internal-codename only.
  HANDOFF-02B carries the user-data folder rename + one-time migration.
- **D-L2 (license location)**: licenses live in
  `<Documents>/Chrome Sphynx Audio/<Display Name>/` on **every OS** via
  `cslic::defaultLicenseDir`, decoupled from preset storage
  (macOS presets stay in the Apple tree). Spec bumped to **v1.3**.
