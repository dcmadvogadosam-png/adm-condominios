# ADM Condomínios — layout referência

Layout recriado com base na referência enviada, responsivo e pronto para Cloudflare Workers + D1.

## Antes do deploy
1. No `wrangler.jsonc`, mantenha o **database_id real** do seu D1 `adm-condominios-db`. Não deixe o placeholder.
2. Rode `npm run db:remote` uma vez para criar a tabela de leads.
3. Em `public/app.js`, troque `5592999999999` pelo WhatsApp real.
4. Faça commit no GitHub. Comando de deploy: `npx wrangler deploy`.

## Importante
A imagem arquitetônica do topo foi recortada da referência fornecida por você para aproximar visualmente o site do mockup. Se você tiver a imagem original dos prédios em alta resolução, basta substituir `public/assets/condominios-hero.jpg` mantendo o mesmo nome.
