# Segurança do site AM Tecnologia (versão 25)

O site é **estático**: uma página HTML com imagens, sem servidor próprio, banco de dados ou login.
Por isso parte dos itens se resolve no código e parte na hospedagem. Abaixo está o que foi feito em cada um.

**Legenda:** ✅ pronto no código · 🟦 pronto em arquivo, ativa quando subir · 🟧 depende de um passo na hospedagem

| Requisito | Status | O que foi feito |
|---|---|---|
| HTTPS | 🟦 | `.htaccess` força https e tira o "www"; HSTS de 1 ano; `upgrade-insecure-requests` na página. Ative o SSL grátis (Let's Encrypt) no painel. |
| Rate limit | ✅ 🟦 🟧 | Formulário de agências: 1 envio a cada 20 s e no máximo 5 por visita. Servidor: bloqueio de robôs de varredura e limite por IP (mod_evasive / nginx `limit_req`). Para proteção forte contra ataques em massa, coloque o domínio atrás do Cloudflare (grátis). |
| Validação de inputs | ✅ | Nome só com letras (2 a 80), e-mail com formato rígido (até 120), `maxlength` nos campos, campo-armadilha anti-robô e bloqueio de envio rápido demais. |
| Sanitização de dados | ✅ | Remove caracteres de controle, `< > " ' { } \` e espaços repetidos antes de usar; o texto vai para o WhatsApp codificado (`encodeURIComponent`). Testado com `<img src=x onerror=alert(1)>`: barrado. Os pontos que inserem HTML só usam textos fixos do próprio código. |
| Rollback | 🟦 | `ops/deploy.sh` guarda a versão anterior a cada publicação; `ops/rollback.sh` volta em segundos. HTML sem cache para a troca aparecer na hora. |
| Expiração de sessão | ✅ | Não há login nem sessão no site. O que fica no navegador é só a preferência de tema e "já viu o pop-up", que somem ao fechar a aba (o tema fica). Nenhum dado pessoal é guardado. |
| CORS | 🟦 | Nenhum outro site pode ler os arquivos (sem `Access-Control-Allow-Origin`), `Cross-Origin-Resource-Policy` e `Opener-Policy` em same-origin, e o site não pode ser colocado dentro de outro (`frame-ancestors 'none'`). |
| Logs | 🟧 🟦 | A hospedagem já grava logs de acesso e erro (ative em "Logs" no painel). Os scripts gravam `deploy.log`, `backup.log` e `monitor.log`. O formulário não registra dados pessoais de propósito (LGPD). |
| Backups | 🟦 | `ops/backup.sh`: cópia diária compactada fora da pasta pública, com checksum, mantendo 30 dias. Agende no cron: `0 3 * * * sh ~/ops/backup.sh`. Ative também o backup automático da hospedagem. |
| Criptografia | ✅ 🟦 | Todo tráfego em HTTPS/TLS 1.2+ com HSTS. O site não armazena senhas nem dados, então não há o que criptografar em repouso. |
| Dependências | ✅ | Zero bibliotecas de JavaScript externas. A única dependência de fora é a fonte Rubik (Google Fonts), liberada na CSP só para os domínios do Google. Política: nenhum script de terceiros sem revisão. |
| PMP (princípio do menor privilégio) | ✅ 🟦 | CSP permite só o necessário (scripts por hash, sem `eval`), `Permissions-Policy` desliga câmera, microfone, localização e pagamento; servidor só aceita GET/HEAD; arquivos 644 e pastas 755; bloqueia `.env`, `.git`, backups e a pasta `ops/`. |
| Monitoramento | 🟦 🟧 | `ops/monitor.sh` a cada 5 min: avisa se o site cair ou se o certificado estiver perto de vencer. Recomendado: UptimeRobot grátis com alerta no e-mail/WhatsApp. |

## Como subir
1. Envie o conteúdo de `public_html/` para a pasta pública da hospedagem (inclui o `.htaccess` e `.well-known/`).
2. Envie a pasta `ops/` para **fora** da pasta pública (ex.: `~/ops`) e troque `SEU-DOMINIO.com.br` em `monitor.sh`.
3. No painel: ative SSL, backups automáticos e logs; agende `backup.sh` e `monitor.sh` no cron.
4. Teste em securityheaders.com e ssllabs.com/ssltest (a meta é nota A).

Se a hospedagem for VPS com nginx, use `ops/nginx-seguranca.conf` no lugar do `.htaccess`.

## Google Analytics (LGPD)
- Só carrega depois do "Aceitar" no aviso de cookies (Consent Mode). "Recusar" = nada é enviado.
- "Preferências de cookies" no rodapé permite mudar a escolha. Política em `privacidade.html`.
- Eventos enviados (sem dado pessoal): clique_whatsapp, clique_servico, clique_instagram, abriu_o_que_vendemos, jogo_iniciado, jogo_concluido, formulario_agencia_aberto, formulario_agencia_enviado.
- ID de medição ativo: G-61NNCXQHNG.
