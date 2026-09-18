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

## Painel administrativo
- `/admin.html` (ou `/admin`) é somente a tela de login.
- Após autenticar, o administrador é direcionado para `/painel.html`.
- O painel possui Solicitações e Pagamentos, além de Sair/Logout.
- Pagamentos: Entrada OK + 3 parcelas de R$ 300,00. O comprovante (PDF/PNG/JPG/JPEG, até 1 MB) é armazenado no D1; a parcela só pode ser marcada como paga após o upload.
- O Worker cria automaticamente a tabela `admin_payments` caso ela ainda não exista.
