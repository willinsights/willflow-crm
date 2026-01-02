# 🚀 Como Fazer Push Manual das Mudanças V104.1

## ⚠️ Problema Detectado

O `git push` está travado porque precisa de **autenticação do GitHub**.

---

## ✅ OPÇÃO 1: Push via GitHub CLI (RECOMENDADO)

Se você tem `gh` instalado e autenticado:

```bash
cd /home/project/willflow-crm-atual
gh auth login
git push origin main
```

---

## ✅ OPÇÃO 2: Push com Personal Access Token

1. **Criar token no GitHub**:
   - Acesse https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Dê permissão de `repo`
   - Copie o token

2. **Usar token no push**:
   ```bash
   cd /home/project/willflow-crm-atual
   git remote set-url origin https://TOKEN@github.com/willinsights/willflow-crm.git
   git push origin main
   ```

   Substitua `TOKEN` pelo token que você copiou.

---

## ✅ OPÇÃO 3: Push via SSH

1. **Configurar SSH**:
   ```bash
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Adicionar chave no GitHub**:
   - Copie a chave pública
   - Vá em https://github.com/settings/keys
   - Clique "New SSH key" e cole a chave

3. **Mudar remote para SSH**:
   ```bash
   cd /home/project/willflow-crm-atual
   git remote set-url origin git@github.com:willinsights/willflow-crm.git
   git push origin main
   ```

---

## ✅ OPÇÃO 4: Deploy Direto no Railway (SEM GITHUB)

Se não conseguir fazer push, o Railway pode fazer deploy direto do código local:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Deploy
railway up
```

---

## 📊 O Que Está Pendente de Push

**Commit**: `9105075`
**Mensagem**: "Fix: Mudar TaskDrawer para abrir ao clicar no CARD do projeto"

**Arquivos alterados** (4):
1. `src/components/kanban/KanbanBoard.tsx` - Mudou para abrir painel ao clicar no card
2. `src/components/projects/TaskDrawer.tsx` - Carrega projeto via API
3. `.same/COMO-VER-PAINEL-V104.md` - Guia de uso
4. `scripts/add-sample-subtasks.ts` - Script de teste

**Mudança principal**:
- ANTES: Painel abria ao clicar numa subtarefa
- DEPOIS: Painel abre ao clicar no card inteiro do projeto

---

## 🎯 Depois do Push

1. Railway vai detectar o novo commit
2. Build automático vai iniciar (~2-3 min)
3. Deploy em https://will-flow.up.railway.app
4. **TESTE**: Clique em qualquer card → painel abre! 🎉

---

## 💡 Dica

Se estiver no **Same.dev**, você pode clicar em "Tools" → "GitHub" → "Authenticate" para fazer push direto pela interface.
