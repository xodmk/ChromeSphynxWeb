# Product documentation — published snapshots

These are **snapshots, not masters.** They exist here for two reasons only:

1. `public/docs/<plugin>/*.pdf` — the finalized PDFs the website links for
   customer download, served by Vercel at `/docs/<plugin>/<file>.pdf`.
2. `docs/product/<plugin>/*.md` — the same content in source form, so site
   development can read product wording without opening a PDF.

## Where the masters live

| Role | Location |
|---|---|
| Release master for the documents | the `_PLUGX` projects |
| PDF generation for local builds | the `_INSTALL` projects, via `build_docs.sh` |
| This repo | published snapshot + website distribution |

Do not edit the `.md` files here and expect it to reach a plugin. Edits go to
the `_PLUGX` master; the rebuilt PDF and its source are then copied back here.

## Versioning

`public/docs/<plugin>/DOC_VERSION` carries the version the PDFs were built
from, matching the `<!-- doc-version: X.Y -->` comment on line 1 of each `.md`.
Both plugin sets are currently at **1.2**. When updating a snapshot, replace
the PDFs, the `.md`, and `DOC_VERSION` together so they never disagree.
