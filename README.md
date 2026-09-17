# ADM Condomínios — Premium

Versão premium responsiva para Cloudflare Workers + D1.

## IMPORTANTE antes de publicar
- Preserve no `wrangler.jsonc` o `database_id` REAL do banco `adm-condominios-db` que já funcionou no seu deploy anterior. Substitua `COLE_AQUI_O_DATABASE_ID_REAL` pelo seu ID.
- Em `public/app.js`, substitua `5592999999999` pelo WhatsApp oficial (55 + DDD + número, somente dígitos).
- Se a tabela ainda não existir: `npm run db:remote`.
- Deploy: `npx wrangler deploy`.

A imagem premium aprovada está em `public/assets/hero-adm-premium.jpg` e a logo sem fundo em `public/assets/logo-adm-transparent.png`.
