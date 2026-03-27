## Cash Closure API

API em **Node.js + Express + PostgreSQL** para o sistema de fechamento de caixa, com autenticação JWT, perfis de acesso, CRUD de usuários e operações de caixa/fechamento. Inclui documentação via **Swagger**.

### Estrutura de pastas

- **cash-closure-api/**
  - `package.json` — dependências e scripts do backend
  - `.env.example` — exemplo de variáveis de ambiente
  - `sql_init.sql` — script SQL para criar tabelas e admin inicial
  - **src/**
    - `server.js` — ponto de entrada da API
    - `db.js` — conexão com PostgreSQL
    - **middlewares/**
      - `auth.js` — middleware de autenticação JWT
    - **routes/**
      - `auth.js` — login, me, esqueci senha, reset de senha
      - `profiles.js` — CRUD de perfis de acesso
      - `users.js` — CRUD de usuários
      - `cash.js` — operações de caixa (saldo, fechamentos, movimentações)

### Pré-requisitos

- Node.js 18+ (recomendado)
- PostgreSQL em execução

### Configuração do banco (PostgreSQL)

1. Crie o banco de dados (por exemplo `doces_mimos`):

```sql
CREATE DATABASE doces_mimos;
```

2. Rode o script `sql_init.sql` dentro do banco:

```bash
cd cash-closure-api
psql -h localhost -U seu_usuario -d doces_mimos -f sql_init.sql
```

3. O script cria:

- Tabelas:
  - `access_profiles` — perfis de acesso com permissões em JSON
  - `users` — usuários
  - `password_reset_tokens` — tokens de recuperação de senha
  - `cash_transactions` — movimentações de caixa (entrada/saída)
  - `cash_closures` — fechamentos de caixa
- Perfil inicial **Administrador**
- Usuário inicial: nome original **Administrador**, username **admin**, email **admin@docesemimos.com** com `password_hash` **placeholder**

> **Importante**: antes de usar em produção, gere um hash bcrypt real para a senha do admin e substitua o valor em `sql_init.sql`.

Exemplo para gerar o hash via Node REPL:

```bash
node
```

```js
const bcrypt = require('bcryptjs');
bcrypt.hash('sua_senha_admin', 10).then(console.log);
```

Copie o hash gerado e substitua no `INSERT INTO users` de `sql_init.sql`.

### Variáveis de ambiente

1. Copie o arquivo de exemplo:

```bash
cd cash-closure-api
cp .env.example .env
```

2. Ajuste os valores em `.env`:

- **Servidor / JWT**
  - `PORT=5000` (mantém compatível com o frontend que chama `http://localhost:5000`)
  - `JWT_SECRET` — chave secreta forte
    - Para gerar uma JWT Secret segura (mínimo 256 bits), utilize ferramentas online como jwtsecretkeygenerator.com ou comandos no terminal. Recomendado: openssl rand -base64 32 ou node -e "console.log(require('crypto').randomBytes(32).toString('hex'))".
  - `JWT_EXPIRES_IN` — ex. `1d`
- **PostgreSQL**
  - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- **E-mail (recuperação de senha)**
  - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
  - *Consulte o guia detalhado [EMAIL_SETUP.md](./EMAIL_SETUP.md) para configurar o envio de e-mails usando o Gmail.*

### Instalação e execução

```bash
cd backend
npm install
npm run dev
```

Backend ficará disponível em:

- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

### Endpoints principais

- **Autenticação (`/api/auth`)**
  - `POST /api/auth/login` — login, retorna JWT + dados do usuário
  - `GET /api/auth/me` — dados do usuário autenticado
  - `POST /api/auth/forgot-password` — envia e-mail com link de reset
  - `POST /api/auth/reset-password` — redefinição de senha via token

- **Perfis de acesso (`/api/profiles`)**
  - `GET /api/profiles` — lista perfis
  - `POST /api/profiles` — cria perfil
  - `PUT /api/profiles/:id` — atualiza perfil
  - `DELETE /api/profiles/:id` — exclui perfil

- **Usuários (`/api/users`)**
  - `GET /api/users` — lista usuários
  - `GET /api/users/:id` — detalhes
  - `POST /api/users` — cria
  - `PUT /api/users/:id` — atualiza
  - `DELETE /api/users/:id` — exclui

- **Caixa / Fechamento (`/api/cash`)**
  - `POST /api/cash/transactions` — registra movimentação (entrada/saída)
  - `GET /api/cash/balance` — obtém saldo atual em dinheiro
  - `POST /api/cash/closures` — salva fechamento de caixa
  - `GET /api/cash/closures` — relatório de fechamentos (filtros `inicio` e `fim` opcionais)

### Integração com o frontend existente

Para as novas telas (cadastro de usuário, perfis, fechamento/relatórios), basta:

1. Ler o token salvo em `localStorage` (`token`) após o login.
2. Enviar o header `Authorization: Bearer <token>` nas requisições `fetch`.
3. Consumir os endpoints descritos acima ou consultar os detalhes em `http://localhost:5000/api-docs`.

