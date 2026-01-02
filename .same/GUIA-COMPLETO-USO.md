# 🎯 GUIA COMPLETO - WillFlow CRM

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### 1️⃣ POPUP NO KANBAN (JÁ IMPLEMENTADO!)

Quando você clica em uma **subtask** no Kanban, abre um popup completo com:

✅ **4 Abas:**
- 📝 **Detalhes** - Editar título, descrição, status, prioridade, etc.
- ☑️ **Checklist** - Adicionar items, marcar como completo ✓
- 💬 **Comentários** - Escrever e ler comentários da equipe
- 📊 **Histórico** - Ver todas as mudanças feitas

✅ **Funcionalidades Editáveis:**
- ☑️ Dar OK em checklist items
- 📝 Mudar status (Todo → Em Andamento → Revisão → Concluído)
- 🎯 Alterar prioridade (Baixa → Média → Alta → Urgente)
- 👤 Atribuir responsável
- 📅 Definir data de vencimento
- ⏱️ Registrar horas estimadas/reais
- 🏷️ Adicionar tags
- 💬 Escrever comentários
- 📎 Anexar arquivos (UI pronto)

---

## 🔗 CONECTAR AO BANCO DO RAILWAY (Dados Reais)

### PASSO 1: Pegar a DATABASE_URL

1. Abra https://railway.app
2. Clique no projeto **"WillFlow"**
3. Clique no serviço **"Postgres"** (🐘 ícone de elefante)
4. Clique na aba **"Variables"**
5. Procure **"DATABASE_URL"**
6. Clique no ícone de **copiar** 📋
7. Copie a URL completa (começa com `postgresql://`)

**Exemplo de URL:**
```
postgresql://postgres:senha123@containers-us-west.railway.app:5432/railway
```

---

### PASSO 2: Criar arquivo .env local

No seu computador, na pasta do projeto:

```bash
cd /Users/wilkerpereira/Downloads/New-Project\ \(36\)/willflow-crm-atual
touch .env
```

Ou crie manualmente o arquivo `.env` na pasta `willflow-crm-atual`.

---

### PASSO 3: Adicionar a URL no .env

Abra o arquivo `.env` e cole:

```env
DATABASE_URL="cole-aqui-a-url-que-voce-copiou-do-railway"
```

**Exemplo real:**
```env
DATABASE_URL="postgresql://postgres:abc123xyz@containers-us-west.railway.app:5432/railway"
```

⚠️ **IMPORTANTE:** Substitua pela SUA URL copiada do Railway!

---

### PASSO 4: Rodar o projeto localmente

No terminal:

```bash
# Entrar na pasta do projeto
cd willflow-crm-atual

# Instalar dependências (se ainda não instalou)
bun install

# Gerar Prisma Client
bunx prisma generate

# Rodar em modo desenvolvimento
bun run dev
```

---

### PASSO 5: Abrir no navegador

Abra: **http://localhost:3000**

🎉 **Pronto! Agora você está vendo os DADOS REAIS do Railway!**

---

## 🎯 COMO USAR O POPUP NO KANBAN

### 1. Onde Encontrar

**Método 1: Via Kanban (Captação ou Edição)**
1. Menu lateral → **Captação** ou **Edição**
2. Procure um card de projeto
3. Dentro do card, veja a lista de **subtasks**
4. **Clique em qualquer subtask** → Popup abre! 🎉

**Método 2: Via Modal de Editar Projeto**
1. Menu → **Projetos**
2. Clique nos **3 pontinhos (⋮)** de um projeto
3. Clique em **"Editar"**
4. Role até o final do modal
5. Veja a seção **"📋 Subtasks"**
6. **Clique em "+ Adicionar"** para criar nova subtask
7. **Clique na subtask** → Popup abre! 🎉

---

### 2. Funcionalidades do Popup

#### ABA 1: DETALHES

**O que você pode fazer:**
- ✏️ Editar título e descrição
- 🎯 Mudar status:
  - Todo (A Fazer)
  - In Progress (Em Andamento)
  - Review (Em Revisão)
  - Done (Concluído)
- 🚨 Alterar prioridade:
  - Low (Baixa) - Verde
  - Medium (Média) - Azul
  - High (Alta) - Laranja
  - Urgent (Urgente) - Vermelho
- 👤 Atribuir responsável
- 📅 Definir data de vencimento
- ⏱️ Horas estimadas vs. horas reais
- 🏷️ Adicionar tags
- 📎 Ver anexos

**Como editar:**
1. Clique no botão **"✏️ Editar"** (canto superior direito)
2. Altere os campos desejados
3. Clique em **"✓ Salvar"**

---

#### ABA 2: CHECKLIST

**O que você pode fazer:**
- ➕ Adicionar novos items à checklist
- ☑️ Marcar items como completos (dar OK!)
- ❌ Deletar items
- 📊 Ver progresso visual (barra de %)

**Como usar:**
1. Digite o nome do item no campo
2. Pressione **Enter** ou clique **"+ Adicionar"**
3. Para marcar como completo: **Clique no checkbox** ☑️
4. Para deletar: **Clique no X** que aparece ao passar o mouse

**Exemplo:**
```
☑️ Revisar material bruto (completo)
☑️ Fazer cortes principais (completo)
☐ Adicionar transições (pendente)
☐ Correção de cor (pendente)

Progresso: 50%
```

---

#### ABA 3: COMENTÁRIOS

**O que você pode fazer:**
- 💬 Escrever comentários
- ✏️ Editar comentários
- 👥 Mencionar pessoas (@username - em breve)
- 📅 Ver histórico de comentários

**Como usar:**
1. Digite seu comentário no campo de texto
2. Clique em **"💬 Comentar"**
3. O comentário aparece na lista com:
   - Seu nome
   - Data e hora
   - Conteúdo do comentário

**Exemplo de uso:**
```
💬 João Silva - 23/12/2025 14:30
"Cliente pediu para dar mais ênfase na cerimônia"

💬 Maria Santos - 23/12/2025 15:45
"Já ajustei! Pode revisar agora."
```

---

#### ABA 4: HISTÓRICO

**O que você vê:**
- 📜 Log completo de todas as atividades
- 👤 Quem fez cada alteração
- 📅 Quando foi feito
- 🔄 Valores antes → depois

**Exemplo:**
```
📊 admin@willflow.pt atualizou status
   "todo" → "in_progress"
   23/12/2025 14:20

📊 admin@willflow.pt criou a tarefa
   "Edição principal do vídeo"
   23/12/2025 14:00
```

---

## 📋 FLUXO COMPLETO DE TRABALHO

### Cenário: Editar vídeo de casamento

**1. Criar Subtask:**
- Vá em Edição (Kanban)
- Ou abra o projeto e vá em "Editar"
- Adicione subtask: "Editar vídeo do casamento"

**2. Configurar Detalhes:**
- Clique na subtask
- Aba "Detalhes":
  - Status: "Em Andamento"
  - Prioridade: "Alta"
  - Responsável: "João Editor"
  - Horas estimadas: 10h
  - Data vencimento: 25/12/2025

**3. Criar Checklist:**
- Aba "Checklist":
  - ☐ Revisar material bruto
  - ☐ Fazer cortes principais
  - ☐ Adicionar transições
  - ☐ Correção de cor
  - ☐ Adicionar música
  - ☐ Renderizar versão final

**4. Trabalhar e Marcar Progresso:**
- Conforme faz cada tarefa, clique no ☑️
- Progresso atualiza automaticamente: 0% → 17% → 33%...

**5. Comunicar com Equipe:**
- Aba "Comentários":
  - "Cliente pediu mais close-ups da noiva"
  - "Música escolhida: Canção XYZ"

**6. Finalizar:**
- Marcar todos os items da checklist: ☑️
- Mudar status para "Concluído"
- Registrar horas reais: 12h
- Comentário final: "Vídeo entregue!"

**7. Ver Histórico:**
- Aba "Histórico" mostra tudo que foi feito
- Transparência total para o cliente

---

## ⚡ ATALHOS E DICAS

### Atalhos de Teclado:
- **Enter** no campo de checklist → Adiciona item
- **Enter** no campo de subtask → Cria subtask
- **Esc** → Fecha o modal

### Boas Práticas:
- ✅ Use checklist para dividir tarefas grandes
- ✅ Atualize o status regularmente
- ✅ Comente mudanças importantes
- ✅ Registre horas reais para tracking
- ✅ Use prioridades para organizar trabalho

### Cores das Prioridades:
- 🟢 **Verde** = Baixa (Low)
- 🔵 **Azul** = Média (Medium)
- 🟠 **Laranja** = Alta (High)
- 🔴 **Vermelho** = Urgente (Urgent)

### Status do Workflow:
- **Todo** → Ainda não começou
- **In Progress** → Trabalhando agora
- **Review** → Aguardando revisão
- **Done** → Completo! ✓

---

## 🐛 PROBLEMAS COMUNS

### "Não vejo dados reais, só dados de exemplo"
**Solução:** Configure o .env com DATABASE_URL do Railway

### "Popup não abre ao clicar na subtask"
**Solução:**
1. Faça hard refresh: Cmd+Shift+R
2. Verifique se está clicando NA SUBTASK (não no projeto)
3. Aguarde deploy terminar no Railway

### "Não consigo adicionar subtask"
**Solução:**
1. Vá em Editar Projeto
2. Role até o final
3. Use o campo "Adicionar nova subtask..."

### "Mudanças não salvam"
**Solução:**
1. Clique em "Editar" (botão ✏️)
2. Faça as alterações
3. Clique em "Salvar" (botão ✓)
4. Aguarde confirmação

---

## 🔒 SEGURANÇA

### ⚠️ NUNCA faça:
- ❌ Commit do arquivo `.env`
- ❌ Compartilhar DATABASE_URL
- ❌ Expor credenciais do banco

### ✅ SEMPRE faça:
- ✅ Mantenha `.env` local
- ✅ Use `.env.example` para documentar
- ✅ .env já está no .gitignore

---

## 📞 SUPORTE

Se algo não funcionar:
1. Verifique se o deploy terminou (Railway)
2. Faça hard refresh no navegador
3. Verifique logs do Railway
4. Consulte a documentação

---

**Última atualização:** 23/12/2025
**Versão:** 103
**Status:** ✅ Totalmente Funcional
