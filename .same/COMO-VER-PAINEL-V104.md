# 🎯 Como Ver o Painel Asana-Style V104

## ❓ Por que não aparece nada novo?

**O painel só abre quando você clica numa SUBTAREFA dentro de um card do Kanban.**

Atualmente seus projetos **não têm subtasks cadastradas**, por isso não aparece nada diferente.

---

## ✅ Como Adicionar Subtasks para Testar

### **Opção 1: Adicionar Manualmente via UI** (Mais Simples)

1. Acesse https://will-flow.up.railway.app
2. Faça login
3. Vá para **Projetos** → **Edição**
4. Clique no **menu "..."** de qualquer projeto
5. Clique em **"Editar"**
6. Role até a seção **"Subtarefas"** (no final do modal)
7. Digite o nome da subtarefa e clique **"Adicionar"**
8. Adicione 3-4 subtasks
9. Clique **"Salvar Alterações"**
10. Feche o modal
11. **AGORA**: Clique numa das subtasks que aparecem no card
12. **🎉 O painel Asana abre à direita!**

---

### **Opção 2: Executar Script de Teste** (Automático)

Criei um script que adiciona subtasks automaticamente em 5 projetos.

**Requisitos**:
- Ter o projeto rodando localmente
- Conectar ao banco de dados Railway

**Passos**:

1. **Configure a conexão com Railway DB**:
   ```bash
   # No arquivo .env do projeto
   DATABASE_URL="postgresql://postgres:..."
   ```

   Copie o `DATABASE_URL` do Railway (Settings → Variables → DATABASE_URL)

2. **Execute o script**:
   ```bash
   cd willflow-crm-atual
   bun run scripts/add-sample-subtasks.ts
   ```

3. **Resultado**:
   - Script adiciona 3-5 subtasks em cada um dos 5 projetos mais recentes
   - Cada subtask tem: título, descrição, prioridade, status, data, horas estimadas

4. **Teste**:
   - Acesse https://will-flow.up.railway.app
   - Vá para Projetos → Edição
   - Veja subtasks nos cards
   - Clique numa subtarefa
   - **🎉 Painel abre!**

---

### **Opção 3: Via API (para quem sabe usar Postman/curl)**

Use o endpoint existente:

```bash
POST https://will-flow.up.railway.app/api/projects/{projectId}/subtasks
Content-Type: application/json

{
  "title": "Editar vídeo principal",
  "description": "Editar todo o material capturado",
  "priority": "high",
  "status": "in_progress"
}
```

Substitua `{projectId}` pelo ID de um projeto real.

---

## 🎯 O que Você Vai Ver

Depois de adicionar subtasks:

### No Card do Projeto (Kanban):

```
┌─────────────────────────────────┐
│ Projeto: Casamento Ana & Pedro │
│ Cliente: Ana Silva              │
│                                 │
│ 📍 Lisboa                       │
│ 💰 €2.000                       │
│                                 │
│ ✨ TAREFAS (2/4) ← NOVO!        │
│ ✅ Importar arquivos NAS        │
│ ⬜ Editar sequência principal   │
│ ⬜ Adicionar trilha sonora      │
│    +1 mais                      │
└─────────────────────────────────┘
```

### Ao Clicar numa Subtarefa:

**Painel lateral abre à direita** com:
- ✅ Header: título editável, status, prioridade, botão "Concluir"
- ✅ 4 Tabs: Descrição, Checklist, Comentários, Atividade
- ✅ Autosave: "A guardar..." → "Guardado"
- ✅ Deep linking: URL muda para `?taskId=123`
- ✅ Fechar: X, ESC ou clicar fora

---

## 📸 Screenshot Esperado

**Desktop**:
```
┌────────────────────┬──────────────────────────┐
│  KANBAN BOARD      │  PAINEL LATERAL          │
│                    │  ┌────────────────────┐  │
│  [Cards...]        │  │ Editar vídeo       │  │
│                    │  │ Status: Em Andam.. │  │
│  [Cards...]        │  │ Prioridade: Alta   │  │
│                    │  ├────────────────────┤  │
│  [Cards...]        │  │ [Tabs]             │  │
│                    │  │ Descrição          │  │
│                    │  │ Checklist          │  │
│                    │  │ Comentários        │  │
│                    │  │ Atividade          │  │
│                    │  └────────────────────┘  │
└────────────────────┴──────────────────────────┘
```

**Mobile**: Painel ocupa tela inteira (bottom sheet)

---

## 🚀 Resumo Rápido

**TLDR**:
1. Adicione subtasks num projeto (via Edit modal ou script)
2. Clique numa subtask no card do Kanban
3. Painel Asana-style abre! 🎉

**Por que não viu nada**:
- Projetos sem subtasks = sem nada para clicar
- Painel só abre ao clicar numa subtask

**Recomendação**:
Use a **Opção 1** (manual via UI) - mais simples e rápido!

---

## 💡 Dica

Se quiser testar todas as features do painel:
- Crie pelo menos **3 subtasks** por projeto
- Use diferentes **status** (A Fazer, Em Andamento, Concluído)
- Defina **prioridades** diferentes (Baixa, Média, Alta, Urgente)
- Adicione **datas de entrega**

Assim você vê o painel com dados variados e pode testar melhor! 😊
