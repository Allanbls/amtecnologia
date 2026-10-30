#!/bin/sh
# Publica uma nova versão guardando a anterior (para rollback).
# Uso: sh ops/deploy.sh site-am-tecnologia-v23.zip
set -e
ZIP="$1"; SITE="$HOME/public_html"; REL="$HOME/releases"; mkdir -p "$REL"
STAMP=$(date +%Y-%m-%d_%H%M)
tar -czf "$REL/antes_$STAMP.tar.gz" -C "$SITE" .          # versão atual guardada
unzip -oq "$ZIP" -d "$SITE"
find "$SITE" -type d -exec chmod 755 {} \;                 # menor privilégio: pastas 755
find "$SITE" -type f -exec chmod 644 {} \;                 # arquivos 644 (ninguém além do dono escreve)
echo "$(date -Iseconds) deploy $ZIP (anterior: antes_$STAMP)" >> "$REL/deploy.log"
