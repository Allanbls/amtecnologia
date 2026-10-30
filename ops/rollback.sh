#!/bin/sh
# Volta o site para a versão anterior ao último deploy.
# Uso: sh ops/rollback.sh            (última)    |   sh ops/rollback.sh antes_2026-10-30_1500.tar.gz
set -e
SITE="$HOME/public_html"; REL="$HOME/releases"
PKG="${1:-$(ls -t "$REL"/antes_*.tar.gz | head -1 | xargs basename)}"
find "$SITE" -mindepth 1 -maxdepth 1 ! -name '.well-known' -exec rm -rf {} +
tar -xzf "$REL/$PKG" -C "$SITE"
echo "$(date -Iseconds) rollback para $PKG" >> "$REL/deploy.log"; echo "Site voltou para $PKG"
