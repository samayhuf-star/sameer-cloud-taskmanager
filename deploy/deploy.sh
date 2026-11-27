#!/usr/bin/env bash
# Build and copy the app to a server over SSH.
# Usage: ./deploy/deploy.sh user@host [/var/www/sameer-cloud-task]
set -euo pipefail
HOST="${1:?usage: deploy.sh user@host [remote_dir]}"
DIR="${2:-/var/www/sameer-cloud-task}"
npm ci
BASE_PATH=/task/ npm run build
ssh "$HOST" "mkdir -p '$DIR'"
rsync -az --delete dist/ "$HOST:$DIR/"
echo "Deployed to $HOST:$DIR — make sure the nginx snippet in deploy/nginx-task.conf is installed, then: sudo nginx -t && sudo systemctl reload nginx"
