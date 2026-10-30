#!/bin/sh
# Backup diário do site. Agende no cron da hospedagem:  0 3 * * *  sh ~/ops/backup.sh
# Guarda 30 dias de cópias compactadas fora da pasta pública.
SITE="$HOME/public_html"; DEST="$HOME/backups"; mkdir -p "$DEST"
STAMP=$(date +%Y-%m-%d_%H%M)
tar -czf "$DEST/site_$STAMP.tar.gz" -C "$SITE" . && echo "$(date -Iseconds) backup ok site_$STAMP" >> "$DEST/backup.log"
sha256sum "$DEST/site_$STAMP.tar.gz" >> "$DEST/checksums.txt"
find "$DEST" -name 'site_*.tar.gz' -mtime +30 -delete
