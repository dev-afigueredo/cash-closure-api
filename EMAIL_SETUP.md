# Configuração de E-mail para Recuperação de Senha

O sistema de **Cash Closure API** permite o envio de e-mails para que os usuários possam redefinir suas senhas. Para isso, é necessário configurar um serviço SMTP. 

Você pode usar o **Gmail** de forma simples, mas como o Google não permite mais o uso direto da senha da sua conta para aplicativos de terceiros, você precisará gerar uma **Senha de App** na sua conta Google.

## Passo a passo para configurar com Gmail

### 1. Preparar a conta do Google (Gmail)
1. Acesse as configurações da sua conta Google: [https://myaccount.google.com/](https://myaccount.google.com/).
2. No menu geral (lado esquerdo), clique em **Segurança** (Security).
3. Na seção "Como você faz login no Google", certifique-se de que a **Verificação em duas etapas** (2-Step Verification) está **ativada**. Isso é um requisito obrigatório para gerar senhas de app.
4. Use a barra de pesquisa no topo da página e busque por **Senhas de app** (App passwords).
5. Na tela que se abrir, digite um nome para identificar em qual aplicativo essa senha será usada (ex: "Cash Closure API") e clique em **Criar** (Create).
6. Um modal será aberto exibindo uma senha de 16 letras gerada (geralmente exibida com espaços). **Copie essa senha por inteiro** (você pode ignorar os espaços se quiser). *Aviso: essa é a única vez que o Google mostrará essa senha.*

### 2. Configurar as variáveis de ambiente

No arquivo `.env` na raiz do projeto, preencha as variáveis de ambiente relacionadas ao envio de e-mails com as informações correspondentes:

```env
# E-mail (recuperação de senha)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu_email@gmail.com
MAIL_PASS=senha_de_app_gerada_no_passo_anterior_aqui
MAIL_FROM=seu_email@gmail.com
COMPANY_NAME="Doces Mimos"
```

**Detalhes sobre cada variável:**
- **MAIL_HOST**: Para o Gmail, será sempre `smtp.gmail.com`.
- **MAIL_PORT**: Usaremos `587` (que é a porta recomendada para o uso da conexão com o nodemailer, sem "secure: true").
- **MAIL_USER**: O seu endereço de e-mail do Gmail, que você usará para enviar os e-mails, ex: `contato@gmail.com`.
- **MAIL_PASS**: A **senha de app** de 16 caracteres que você gerou no passo 1. **Não** digite a senha real de login do seu e-mail padrão.
- **MAIL_FROM**: O endereço que os destinatários verão como remetente (na maioria das vezes é igual ao `MAIL_USER`).
- **COMPANY_NAME**: O nome do seu negócio ou projeto que constará no "Assunto" (Subject) do e-mail de recuperação de senha.

### 3. Testar o envio de E-mail

1. Inicie ou reinicie o servidor da API caso ele já estivesse rodando:
   ```bash
   npm run dev
   ```
2. Realize uma chamada para o endpoint de solicitar redefinição de senha (`POST /api/auth/forgot-password`).
   - No corpo da requisição (`JSON`), envie o e-mail de um cadastro de usuário válido:
     ```json
     {
       "email": "usuario-teste@exemplo.com"
     }
     ```
3. Se tudo foi configurado corretamente, a API retornará uma resposta de sucesso e o e-mail de teste chegará na caixa de entrada do `usuario-teste@exemplo.com` com o link temporário de recuperação.
