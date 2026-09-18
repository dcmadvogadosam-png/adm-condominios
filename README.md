# ADM Condomínios

Site institucional + formulário de leads + painel administrativo protegido.

## Deploy

```bash
npm install
npx wrangler deploy
```

O projeto mantém o binding D1 `DB` configurado no `wrangler.jsonc`. A coluna `status` dos leads é criada automaticamente pelo Worker caso o banco já exista na versão anterior.

## Configurar o acesso administrativo

Antes de usar `/admin.html`, cadastre três secrets no Worker. Escolha seu próprio usuário, senha forte e uma chave secreta longa/aleatória:

```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

O Wrangler solicitará o valor de cada secret no terminal. Não coloque a senha diretamente no GitHub.

Depois acesse:

`/admin.html`

O painel permite visualizar, pesquisar, filtrar, abrir, responder pelo WhatsApp, alterar o status (Novo / Em atendimento / Finalizado) e excluir solicitações.

## Banco D1

Para uma instalação nova:

```bash
npm run db:remote
```

Em banco já existente, o Worker detecta e adiciona a coluna `status` automaticamente.
