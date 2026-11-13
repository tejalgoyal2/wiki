#!/bin/sh
# Check, build and publish the wiki to Cloudflare Pages (project "wiki") with wrangler.
# Needs `npx wrangler login` once on this machine. Refuses to deploy uncommitted or failing work.
#
#   sh scripts/deploy.sh
set -e
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "Commit your changes first: only committed work is deployed." >&2
  exit 1
fi

node scripts/generate.mjs --check
node scripts/link.mjs --check
node scripts/check.mjs
npx quartz build
node scripts/check-built.mjs public

npx -y wrangler@4 pages deploy public --project-name wiki --branch main \
  --commit-hash "$(git rev-parse HEAD)" --commit-message "$(git log -1 --format=%s)"
