#!/bin/sh
# Checagem a cada 5 min (cron: */5 * * * * sh ~/ops/monitor.sh). Registra no log se o site cair,
# se o HTTPS sair do ar ou se o certificado estiver perto de vencer.
URL="https://SEU-DOMINIO.com.br"; LOG="$HOME/backups/monitor.log"; HOST=${URL#https://}
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$URL")
[ "$CODE" = "200" ] || echo "$(date -Iseconds) ALERTA site respondeu $CODE" >> "$LOG"
END=$(echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
DAYS=$(( ($(date -d "$END" +%s) - $(date +%s)) / 86400 ))
[ "$DAYS" -lt 15 ] && echo "$(date -Iseconds) ALERTA certificado vence em $DAYS dias" >> "$LOG"
exit 0
