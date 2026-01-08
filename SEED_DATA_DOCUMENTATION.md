# 🌱 Seed Data Documentation

Este documento explica como usar o sistema de seed do WillFlow CRM para popular o banco de dados com dados de teste completos e realistas.

## 📋 Visão Geral

O sistema de seed foi expandido para criar um conjunto abrangente de dados de teste que cobre **TODOS os campos** de **TODAS as entidades** do sistema, permitindo testar todos os cenários e funcionalidades.

## 🎯 Dados Criados

### 👥 Usuários (12 total)
- **2 Administradores**
  - admin@in-sights.pt (senha: admin123)
  - miguel.santos@in-sights.pt (senha: admin456)
- **4 Filmmakers/Photographers**
  - João Silva (filmmaker)
  - Maria Santos (photographer)
  - Pedro Costa (both)
  - Ricardo Almeida (filmmaker)
  - Luísa Rodrigues (photographer)
- **3 Editores**
  - Ana Ferreira
  - Carlos Mendes
  - Bruno Martins
- **1 Viewer**
  - Sofia Oliveira
- **1 Usuário Inativo** (para testes)
  - Teresa Cardoso

Todos incluem dados bancários (IBAN, NIF), tipo de colaborador, e permissões configuradas.

### 🏢 Clientes (16 total)
- **Clientes Premium** (alto volume)
  - Tech Innovations Lda
  - BankCorp Portugal
  - Hotel Estrela do Mar
- **Clientes Regulares**
  - Restaurante Sabor Local
  - Clínica Saúde Plus
  - GreenEnergy Startup
  - E outros...
- **Cliente Novo** (zero revenue)
  - Startup InnovaTech
- **Cliente Inativo** (para testes)
  - Antiga Parceria Comércio

Todos incluem: name, email, phone, company, totalRevenue, totalCosts, totalMargin, projectCount.

### 📁 Categorias (12 total)
Com cores e descrições variadas:
- Vídeo Marketing
- Documentário
- Publicidade
- Corporativo
- Eventos
- Redes Sociais
- **Hotel** (novo)
- **Experiência** (novo)
- **Drone** (novo)
- **Reels** (novo)
- **Casamento** (novo)
- **Imobiliário** (novo)

### 🎬 Projetos (30 total)
Distribuídos em **TODAS as fases e status**:

**CAPTACAO:**
- A agendar: 3 projetos
- Agendado: 5 projetos
- Em execução: 6 projetos
- Entregue: 4 projetos

**EDICAO:**
- A iniciar: 4 projetos
- Em edição: 5 projetos
- Em revisão: 5 projetos
- Entregue: 4 projetos

Cada projeto inclui **TODOS os campos**:
- Informações básicas (title, description, location, customId)
- Links (nasLink, frameIoLink)
- Financeiros (clientPrice, captationCost, editionCost, margin)
- Status de pagamento (paymentStatus, freelancerPaymentStatus)
  - `pending`, `partial`, `paid` para clientes
  - `pending`, `paid`, `not_applicable` para freelancers
- Datas (captacaoDate, clientDueDate, clientReceivedDate, freelancerDueDate, freelancerPaidDate)
- Responsáveis (responsavelCaptacaoId, responsavelEdicaoId)
- Tipos de vídeo variados

### ✅ Subtasks (30+ total)
Distribuídas entre os projetos com **TODOS os campos**:
- `title`, `description`
- `priority`: low, medium, high, urgent (todos representados)
- `status`: todo, in_progress, review, done (todos representados)
- `dueDate` (variadas - passadas, presentes, futuras)
- `assignedTo` (vários usuários)
- `estimatedHours`, `actualHours` (para rastreamento)
- `tags` (JSON array com tags relevantes)
- `order` (para ordenação)
- `completed`, `completedAt` (para histórico)

### ☑️ SubtaskChecklist
Itens de checklist para subtasks:
- Alguns marcados como completos
- Outros pendentes
- Com `completedBy` e `completedAt` quando aplicável

### 💬 SubtaskComment
Comentários em subtasks:
- Múltiplos comentários por subtask
- Diferentes autores
- Datas variadas

### 📎 SubtaskAttachment
Anexos de exemplo:
- PDFs (roteiros, documentos)
- Imagens (storyboards, referências)
- Com metadados completos (fileName, fileSize, fileType, fileUrl)

### 📝 SubtaskActivity
Log completo de atividades:
- Criação
- Mudanças de status
- Comentários adicionados
- Com userId e timestamps

### 🔔 Notificações (17+ total)
Cobrindo **TODOS os tipos e prioridades**:

**Tipos:**
- `deadline` (prazos)
- `payment` (pagamentos)
- `project` (projetos)
- `comment` (comentários)
- `system` (sistema)

**Prioridades:**
- `low` (baixa)
- `medium` (média)
- `high` (alta)
- `urgent` (urgente)

**Status:**
- Algumas lidas (`isRead: true`, com `readAt`)
- Outras não lidas (`isRead: false`)

### 📞 Comunicações com Clientes (12+ total)
Cobrindo **TODOS os tipos e status**:

**Tipos:**
- `email` (e-mails)
- `phone` (ligações)
- `meeting` (reuniões)
- `message` (mensagens)

**Status:**
- `pending` (pendente)
- `sent` (enviado)
- `received` (recebido)
- `completed` (concluído)

Cada comunicação inclui: subject, content, sentBy, sentAt, notes (opcional).

### 📝 Notas de Clientes (7+ total)
Notas internas sobre clientes:
- Preferências de comunicação
- Características do cliente
- Histórico de relacionamento
- Com autoria e datas

### 💰 Itens de Orçamento
Múltiplos itens por projeto:
- Categorias: equipamento, equipe, transporte, alimentacao, pos-producao
- Com quantity, unitPrice, total
- Fase (captacao/edicao)
- Status de pagamento (isPaid)

### 📄 Arquivos de Projeto
Exemplos de arquivos:
- Documentos (PDFs)
- Imagens (PNG, JPG)
- Vídeos (MP4)
- Com metadados completos

### 🎥 Links de Media
- Frame.io (para revisão)
- Vimeo (vídeos publicados)
- NAS (armazenamento interno)

## 🚀 Como Usar

### Opção 1: Seed Básico (Admin + Colunas Kanban)
```bash
npm run db:seed
```

Cria apenas:
- Usuário administrador
- Colunas do Kanban

### Opção 2: Seed Completo (Recomendado para Desenvolvimento)
```bash
npm run seed:full
```

ou

```bash
SEED_CLEAN_DATABASE=true SEED_WITH_SAMPLE_DATA=true npm run db:seed
```

Cria **TODOS os dados** listados acima.

### Opção 3: Via API (para desenvolvimento remoto)
```bash
curl -X POST http://localhost:3000/api/debug/seed-demo
```

Cria um subset dos dados (mais rápido para testes rápidos).

## 🔄 Resetar e Recriar

Para limpar completamente e recriar:
```bash
npm run db:reset
# ou
SEED_CLEAN_DATABASE=true SEED_WITH_SAMPLE_DATA=true npm run db:seed
```

## ✨ Características Especiais

### 📅 Datas Dinâmicas
Todas as datas são calculadas **relativamente ao mês atual** usando a função `getDateOffset(days)`:
- Projetos atrasados: datas no passado
- Projetos em andamento: datas próximas
- Projetos futuros: datas no futuro

Isso garante que os dados sempre pareçam atuais, independente de quando o seed for executado.

### 💰 Dados Financeiros Realistas
- Valores variados por tipo de cliente
- Margens positivas e realistas
- Alguns projetos com pagamento parcial
- Freelancers pagos e pendentes
- Budget items detalhados

### 🎯 Cobertura Completa
- **TODOS os campos** de **TODAS as entidades** são preenchidos
- Todos os status possíveis estão representados
- Todos os tipos de enum estão presentes
- Relacionamentos corretos entre entidades

## 🧪 Testando os Dados

Após executar o seed, você pode verificar:

### Dashboard
- Deve mostrar métricas variadas
- Projetos em diferentes estados
- Notificações não lidas

### Kanban
- Projetos distribuídos em todas as colunas
- Tanto CAPTACAO quanto EDICAO
- Arraste e solte funcionando

### Página de Clientes
- Lista completa com 16 clientes
- Dados financeiros variados
- Histórico de comunicações

### Página de Projetos
- 30 projetos com dados completos
- Filtros funcionando
- Detalhes completos ao abrir

### Relatórios Financeiros
- Receitas, custos e margens variadas
- Status de pagamento diversos
- Dados realistas para análise

### Notificações
- 17+ notificações variadas
- Algumas lidas, outras não
- Diferentes prioridades

## 📊 Estatísticas

| Entidade | Quantidade | Campos Preenchidos |
|----------|------------|-------------------|
| Users | 12 | Todos (including IBAN, NIF, role, permissions) |
| Clients | 16 | Todos (including financials) |
| Categories | 12 | Todos (including colors, descriptions) |
| Projects | 30 | Todos (including dates, finances, links) |
| Subtasks | 30+ | Todos (including priority, status, hours, tags) |
| SubtaskChecklist | Múltiplos | Todos |
| SubtaskComment | Múltiplos | Todos |
| SubtaskAttachment | Múltiplos | Todos |
| SubtaskActivity | Múltiplos | Todos |
| Notifications | 17+ | Todos |
| Communications | 12+ | Todos |
| ClientNote | 7+ | Todos |
| BudgetItem | Múltiplos | Todos |
| ProjectFile | Múltiplos | Todos |
| ProjectMedia | Múltiplos | Todos |

## 🎨 Nomes Realistas

Todos os dados usam nomes e empresas realistas para o mercado português:
- Empresas portuguesas típicas (Lda, SA, Unipessoal)
- Números de telefone portugueses (+351)
- IBANs portugueses
- Localizações em Portugal
- NIFs válidos em formato

## 🔒 Segurança

- A API `/api/debug/seed-demo` **só funciona em development/staging**
- Bloqueada em produção para segurança
- Senhas são hasheadas mesmo em dados de teste
- Dados de teste claramente identificáveis

## 📝 Notas

- O seed é **idempotente** quando `SEED_CLEAN_DATABASE=true`
- Sem esse flag, dados são adicionados (pode causar duplicatas)
- Recomendado usar sempre `SEED_CLEAN_DATABASE=true` em desenvolvimento
- IDs são gerados automaticamente (UUID)
- Relacionamentos são criados corretamente

## 🤝 Contribuindo

Para adicionar mais dados de teste:
1. Edite `prisma/seed.ts`
2. Adicione novos dados na seção apropriada
3. Mantenha datas relativas usando `getDateOffset()`
4. Documente as mudanças neste arquivo
5. Teste com `npm run seed:full`

## ❓ Problemas Comuns

### Erro: "Database URL not found"
Certifique-se de ter o arquivo `.env` configurado com `DATABASE_URL`.

### Erro: "Table does not exist"
Execute as migrações primeiro:
```bash
npm run db:push
```

### Dados duplicados
Use `SEED_CLEAN_DATABASE=true` para limpar antes de seed:
```bash
SEED_CLEAN_DATABASE=true SEED_WITH_SAMPLE_DATA=true npm run db:seed
```

### Seed muito lento
O seed completo cria 30+ projetos com todos os relacionamentos. É normal levar alguns segundos.

## 📚 Referências

- Código: `prisma/seed.ts`
- Schema: `prisma/schema.prisma`
- API: `src/app/api/debug/seed-demo/route.ts`
