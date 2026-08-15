# static Agent Guide

## Project

This repository hosts static files used by Tw93 projects, including app downloads, images, appcast files, and web assets.

Deploy surface: pushing `main` is production. Vercel publishes every push immediately, and these URLs are referenced live by other projects; there is no staging.

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
