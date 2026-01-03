# Configurar SMTP no Railway para Produção

## Passo a Passo

### 1. Aceda ao Railway Dashboard
Vá para: https://railway.app/dashboard

### 2. Selecione o Projeto WillFlow
Clique no projeto "willflow-crm" ou similar

### 3. Aceda às Variáveis de Ambiente
- Clique no serviço (container do Next.js)
- Vá para a aba **"Variables"**

### 4. Adicione as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `willdesign7@gmail.com` |
| `SMTP_PASSWORD` | `gbjhkhlsfhvxygmm` |
| `SMTP_FROM` | `WillFlow <willdesign7@gmail.com>` |

### 5. Guarde e Redeploy
Após adicionar todas as variáveis, o Railway fará redeploy automático.

---

## Verificar se Funcionou

Após o redeploy, aceda a:
```
https://will-flow.up.railway.app/api/test-email?to=SEU_EMAIL&type=welcome
```

Se receber o email, está configurado corretamente!

---

## Templates Disponíveis para Teste

- `welcome` - Email de boas-vindas com credenciais
- `password-changed` - Confirmação de alteração de senha
- `password-reset` - Nova senha gerada
- `project-created` - Novo projeto atribuído
- `project-completed` - Projeto finalizado
- `status-changed` - Status do projeto alterado
- `deadline` - Lembrete de prazo (2 dias)
- `deadline-urgent` - Prazo vence hoje
- `payment` - Pagamento recebido
- `freelancer-payment` - Pagamento pendente a freelancer
