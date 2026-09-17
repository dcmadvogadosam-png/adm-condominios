# ADM Condomínios — Cloudflare

Site responsivo + Worker + D1.

## Configuração
1. `npm install`
2. `npx wrangler login`
3. `npx wrangler d1 create adm-condominios-db`
4. Copie o `database_id` retornado para `wrangler.jsonc`, substituindo `COLE_AQUI_O_DATABASE_ID`.
5. Execute `npm run db:remote` para criar a tabela de contatos.
6. Em `public/app.js`, altere o WhatsApp e o e-mail no objeto `CONTACT`.
7. Teste com `npm run dev`.
8. Publique com `npm run deploy`.

## GitHub
Envie a pasta inteira para o repositório. O projeto já inclui `.gitignore`, `package.json`, configuração do Wrangler, Worker, D1 e assets estáticos.

## Funcionalidades
- Layout preto/prata baseado na logomarca ADM
- Responsivo em desktop, tablet e celular
- Menu mobile
- Navegação suave
- Animações discretas
- CTA de proposta
- WhatsApp e e-mail configuráveis
- Formulário funcional gravando leads no Cloudflare D1
- Validação no frontend e no Worker
