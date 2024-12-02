#!/bin/bash
set -euo pipefail

# Parse .dev.vars and set secrets
if [[ ! -f .dev.vars ]]; then
    echo "File .dev.vars not found!"
    exit 1
fi
while IFS='=' read -r name value
do
  # valueの前後のクオートを削除
  value=$(echo $value | sed -e 's/^"//' -e 's/"$//')
  echo "-------------------------------------------------------"
  echo "Setting $name" #: $value"
  echo $value | npx wrangler pages secret put "$name"
done < .dev.vars

pnpm deploy:pages
