#!/usr/bin/env bash
set -euo pipefail

npm run typecheck
npm run build

cat <<'MSG'
Release checks passed.
Before production deploy, confirm hosting env vars:
- NEXT_PUBLIC_SITE_URL=https://makocreators.com
- DATABASE_URL=<production postgres url>
- AUTH_SHOW_DEV_CODE=false
- real email/SMS delivery configured before public login traffic
MSG
