# static Agent Guide

## Project

This repository hosts static files used by Tw93 projects, including app downloads, images, appcast files, and web assets.

Deploy surface: `cdn.tw93.fun` is served entirely by the Cloudflare R2 bucket `tw93` behind Cloudflare's proxy, and since 2026-11-06 `.github/workflows/sync-r2.yml` uploads every file a push to `main` adds or changes (rclone with the repository secrets `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`, an R2 token limited to that bucket), then fetches each from `cdn.tw93.fun` and compares bytes; a manual run of the workflow compares every tracked file. It never deletes from R2, and a pushed file over 20 MB fails the run: large binaries go to R2 directly (`npx wrangler r2 object put tw93/<path> --file <path> --remote`), not into this repository. An edited file that Cloudflare already cached may take the edge TTL to show; the check reads origin through a query string. The whole bucket is backed up to the LazyCat NAS under `Mac备份/R2/tw93`. Pushing `main` still deploys the Vercel project `static`, which now serves only `static.tw93.fun` and `tw93.vercel.app`; `cdn.tw93.fun` was removed from it the same day, since its DNS never pointed there and Vercel kept mailing a misconfigured-domain warning. The bucket also holds objects this repository does not track (Mole's Mac DMGs and Windows packages, 32 of the bucket's 43.7 GB on 2026-11-06, uploaded by the Mole release lanes, some under an R2 Bucket Lock), so never mirror-delete the bucket against the repository. There is no staging. The workflow uploads `clash/fclash_override.js` with `Cache-Control: public, max-age=300`, and a manual upload of it keeps that header (`--cache-control "public, max-age=300"`): without it Cloudflare holds `.js` at the edge for 4 hours per URL, and the Android tablet's FlClash fetches the script by a fixed URL, so an update would not reach it.

## Repository Map

- `app/` - downloadable app artifacts.
- `img/` - shared images and icons.
- `miaoyan/` - MiaoYan media assets.
- `mole/` - Mole update feed and related assets.
- `pake/` - Pake screenshots, icons, and media.
- `pic/` - miscellaneous images and documents.
- `uPic/` - uPic static assets.
- `video/` - hosted video assets.
- `clash/` - Clash configuration and related public files.
- `index.html` - simple static index.
- `vercel.json` - Vercel deployment configuration; today it only silences the GitHub integration, there are no routes or headers in it.

## Working Rules

- Treat files here as public CDN assets.
- Do not delete or rename assets unless the referencing project is updated at the same time.
- Preserve stable URLs for downloads, appcasts, screenshots, and README assets.
- Treat `clash/` configs as public files; avoid adding private endpoints, tokens, or machine-specific values.
- Avoid committing local editor files or generated temporary artifacts.

## Verification

- Asset replacement: confirm the target path is intentional and referenced by the owning project.
- Appcast changes: validate XML structure and confirm download URLs are reachable.
- Clash config changes: inventory every sibling under `clash/` before editing. The public rule set currently spans `.sgmodule`, `.js`, `.stoverride`, and `.yaml` clients; a fix for one client is not complete until the analogous files are marked changed or not applicable. Validate each touched format, scan for private endpoints or secrets, and report checked / changed / not-applicable counts before committing.
- HTML changes: open or build-check the affected static page when possible.
- Documentation-only changes: check links and paths.

## GitHub Operations

- Use `gh` for issue and PR inspection.
- Do not post public comments unless the maintainer explicitly asks.
