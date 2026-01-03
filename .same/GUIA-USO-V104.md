# 🚀 Guia Rápido - Painel de Detalhes V104

**Versão**: 104
**Data**: 23/12/2025

---

## ✅ O que foi implementado

Painel de detalhes de tarefa/projeto **estilo Asana** com:

- ✅ Side panel à direita (desktop)
- ✅ Bottom sheet (mobile)
- ✅ 4 tabs: Descrição, Checklist, Comentários, Atividade
- ✅ Autosave com indicador visual
- ✅ Deep linking (URL com taskId)
- ✅ Permissões (oculta dados financeiros)

---

## 🎯 Como testar

### 1. Abrir o Painel

**Método 1**: Pelo Kanban
1. Acesse `/` e faça login
2. Vá para "Projetos"
3. Clique em qualquer **projeto que tenha subtarefas**
4. Clique em uma **subtarefa** (dentro do card do projeto)
5. O painel abrirá à direita 🎉

**Método 2**: Por URL direta (TODO)
```
http://localhost:3000/projetos/edicao?taskId=123
```
*Nota: Precisa implementar lógica para abrir automaticamente*

---

### 2. Navegar pelo Painel

#### Header (topo fixo)

**Botões**:
- **X** (esquerda) → Fechar painel
- **Concluir/Reabrir** → Toggle status da tarefa
- **...** (menu) → Arquivar, Duplicar, Deletar

**Campos editáveis**:
- **Título** → Clique e edite (autosave)
- **Status** → Dropdown: A Fazer, Em Andamento, Em Revisão, Concluído
- **Prioridade** → Dropdown: Baixa, Média, Alta, Urgente

**Campos somente leitura**:
- Responsável (badge)
- Data de entrega (badge)
- Tags (badges)
- Projeto/Cliente (texto)

---

#### Tab: Descrição

**Campos editáveis**:
- **Descrição** → Textarea grande
- **Data de Entrega** → Input date
- **Responsável** → Input text
- **Horas Estimadas** → Input number
- **Horas Reais** → Input number

**Campos financeiros** (apenas admin):
- Preço Cliente (€)
- Margem (€)

**Teste**:
1. Edite a descrição
2. Veja "A guardar..." aparecer
3. Após 800ms → "Guardado" ✅

---

#### Tab: Checklist

**Recursos**:
- ✅ Barra de progresso (X/Y items, %)
- ✅ Lista de items com checkbox
- ✅ Drag & drop para reordenar
- ✅ Adicionar novo item
- ✅ Deletar item (hover para ver botão trash)

**Teste**:
1. Clique na tab "Checklist"
2. Marque/desmarque items → veja progresso atualizar
3. Arraste um item para reordenar
4. Digite novo item e clique "+" para adicionar
5. Hover num item e clique trash para deletar

---

#### Tab: Comentários

**Recursos**:
- ✅ Thread de comentários
- ✅ Avatar + nome + data
- ✅ Editar/deletar próprios comentários
- ✅ Adicionar novo comentário

**Teste**:
1. Clique na tab "Comentários"
2. Leia comentários existentes (mock)
3. Escreva novo comentário
4. **Ctrl+Enter** para enviar (ou clique "Enviar")
5. Hover seu comentário → clique "..." → Editar ou Deletar

---

#### Tab: Atividade

**Recursos**:
- ✅ Histórico agrupado por data
- ✅ Avatar + mensagem formatada
- ✅ Ícones por tipo de ação
- ✅ Oculta dados financeiros para não-admin

**Teste**:
1. Clique na tab "Atividade"
2. Veja histórico de mudanças (mock)
3. Verifique agrupamento por data
4. Faça login como Editor → campos financeiros devem estar ocultos

---

### 3. Testar Autosave

**Campos com autosave**:
- Título
- Descrição
- Status
- Prioridade
- Data de entrega
- Responsável
- Horas estimadas/reais

**Fluxo**:
1. Edite qualquer campo
2. Veja indicador "A guardar..." (com spinner)
3. Após 800ms → "Guardado" (com checkmark verde)
4. Depois de 2s → indicador desaparece

**Teste de erro** (quando implementar APIs):
1. Desligue o servidor
2. Edite campo
3. Veja "Erro ao guardar" (vermelho)

---

### 4. Testar Deep Linking

**Fluxo**:
1. Abra uma tarefa
2. Veja URL mudar para `/projetos/edicao?taskId=123`
3. Copie a URL
4. Feche o painel
5. Veja URL voltar para `/projetos/edicao`
6. Cole a URL no navegador (TODO: deve abrir painel automaticamente)

---

### 5. Testar Responsividade

#### Desktop (≥1024px)
- Painel lateral 700px
- Kanban visível por trás
- Overlay escuro

#### Tablet (768-1023px)
- Painel lateral 600px
- Kanban parcialmente visível

#### Mobile (<768px)
- Painel ocupa tela inteira
- Comportamento de bottom sheet

**Teste**:
1. Abra painel no desktop
2. Redimensione janela para mobile
3. Veja painel adaptar tamanho
4. Teste scroll interno

---

### 6. Testar Permissões

#### Como Admin
1. Login com admin@willflow.com
2. Abra painel
3. Veja campos financeiros (Preço Cliente, Margem)
4. Vá na tab Atividade
5. Veja logs completos com mudanças financeiras

#### Como Editor/Freelancer
1. Login com editor@willflow.com
2. Abra painel
3. **Não veja** campos financeiros
4. Vá na tab Atividade
5. Veja logs sem detalhes financeiros:
   - ✅ "Admin alterou status de..."
   - ❌ "Admin alterou preço de €100 para €150"
   - ✅ "Admin atualizou informações financeiras"

---

## ⚠️ Limitações Atuais

### Dados Mock

**Tudo é mock atualmente**:
- Tarefa carrega dados fictícios (timeout 300ms)
- Checklist com 5 items de exemplo
- 3 comentários mock
- 7 atividades mock

**Para testar com dados reais**:
Precisa implementar as APIs (ver seção abaixo).

---

### Deep Link Incompleto

**Funciona**:
- ✅ URL atualiza ao abrir/fechar

**Não funciona**:
- ❌ Abrir URL direta com `?taskId=123` não abre painel

**Para implementar**:
```tsx
// No KanbanBoard, adicionar:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('taskId');
  if (taskId) {
    // Buscar tarefa e setar selectedSubtask
    setSelectedSubtask({ id: taskId });
  }
}, []);
```

---

### Sem Sincronização Kanban ↔ Drawer

**Não funciona**:
- ❌ Mudar status no drawer não move card no Kanban
- ❌ Arrastar card no Kanban não atualiza status no drawer

**Para implementar**:
Precisa callback `onTaskUpdate` no KanbanBoard para:
1. Atualizar estado Zustand
2. Chamar API
3. Re-renderizar Kanban

---

## 🔧 Próximos Passos (para devs)

### 1. Implementar APIs

**Necessário criar**:
```
GET    /api/subtasks/:id
PATCH  /api/subtasks/:id
GET    /api/subtasks/:id/checklist
POST   /api/subtasks/:id/checklist
PATCH  /api/subtasks/:id/checklist/:itemId
DELETE /api/subtasks/:id/checklist/:itemId
GET    /api/subtasks/:id/comments
POST   /api/subtasks/:id/comments
PATCH  /api/subtasks/:id/comments/:commentId
DELETE /api/subtasks/:id/comments/:commentId
GET    /api/subtasks/:id/attachments
POST   /api/subtasks/:id/attachments
DELETE /api/subtasks/:id/attachments/:attachmentId
GET    /api/subtasks/:id/activity
```

**Schema Prisma** (já existe):
- `Subtask`
- `SubtaskChecklist`
- `SubtaskComment`
- `SubtaskAttachment`
- `SubtaskActivity`

---

### 2. Substituir Mocks por Fetch

**Em cada componente**, substituir:

```tsx
// ANTES (mock):
setTimeout(() => {
  setTask({ id: taskId, title: 'Mock...' });
}, 300);

// DEPOIS (real):
const response = await fetch(`/api/subtasks/${taskId}`);
const data = await response.json();
setTask(data);
```

---

### 3. Implementar Cache

**Instalar**:
```bash
bun add @tanstack/react-query
```

**Wrapper**:
```tsx
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**Usar no TaskDrawer**:
```tsx
import { useQuery } from '@tanstack/react-query';

const { data: task, isLoading } = useQuery({
  queryKey: ['subtask', taskId],
  queryFn: () => fetch(`/api/subtasks/${taskId}`).then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 min
  enabled: !!taskId
});
```

---

### 4. Sincronização Kanban ↔ Drawer

**No KanbanBoard**:
```tsx
<TaskDrawer
  onTaskUpdate={(taskId, updates) => {
    // 1. Atualizar Zustand
    updateSubtask(taskId, updates);

    // 2. Se mudou status, mover card
    if (updates.status) {
      // Re-calcular coluna
      // Mover card visualmente
    }
  }}
/>
```

---

## 📝 Feedback

### O que testar

1. **UX geral**: Painel é fácil de usar?
2. **Performance**: Abre rápido? Tabs lazy carregam bem?
3. **Autosave**: Funciona como esperado?
4. **Permissões**: Campos ocultos para não-admin?
5. **Mobile**: Usável no celular?

### O que reportar

- Bugs visuais
- Erros de console
- Problemas de usabilidade
- Sugestões de melhoria

---

## 🎉 Resumo

**V104 entrega**:
- ✅ Painel completo estilo Asana
- ✅ 4 tabs funcionais (com mock)
- ✅ Autosave com indicador visual
- ✅ Deep linking (parcial)
- ✅ Permissões
- ✅ Lazy loading
- ✅ Responsivo

**Pendente**:
- ⏳ APIs reais
- ⏳ Cache (React Query)
- ⏳ Sincronização Kanban ↔ Drawer
- ⏳ Upload real de anexos

**Próxima versão**: Implementar APIs e conectar ao PostgreSQL.
