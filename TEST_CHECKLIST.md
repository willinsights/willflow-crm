# ✅ Checklist de Testes - Dados Fictícios

Este documento contém uma checklist completa para testar todos os modais e funcionalidades do sistema com os dados fictícios criados.

## 🚀 Pré-requisitos

Antes de começar os testes:

1. ✅ Banco de dados PostgreSQL configurado
2. ✅ Variável `SEED_WITH_SAMPLE_DATA=true` definida
3. ✅ Comando `npm run db:seed` executado com sucesso
4. ✅ Aplicação rodando em modo desenvolvimento (`npm run dev`)

## 📝 Como Usar Esta Checklist

- Marque cada item testado com ✅
- Anote problemas encontrados na seção "Problemas Encontrados"
- Teste em diferentes tamanhos de tela (desktop, tablet, mobile)
- Teste com diferentes perfis de usuário quando aplicável

---

## 1️⃣ AUTENTICAÇÃO E ACESSO

### Login
- [ ] Login como admin (admin@in-sights.pt)
- [ ] Login como freelancer (joao.silva@exemplo.com)
- [ ] Login como editor (ana.ferreira@exemplo.com)
- [ ] Login como viewer (sofia.oliveira@exemplo.com)

---

## 2️⃣ DASHBOARD

### Visualização Geral
- [ ] Dashboard carrega corretamente
- [ ] Métricas financeiras exibidas (€45.000+ em receitas)
- [ ] Gráficos renderizados com dados
- [ ] Projetos em destaque visíveis
- [ ] Notificações não lidas aparecem (6 notificações criadas)

### Por Perfil
- [ ] Admin vê todas as informações financeiras
- [ ] Freelancer vê apenas seus projetos
- [ ] Editor vê projetos de edição
- [ ] Viewer vê visão limitada

---

## 3️⃣ KANBAN

### Visualização
- [ ] Kanban carrega com 8 projetos
- [ ] Colunas de fase exibidas corretamente
- [ ] Projetos distribuídos nas fases corretas:
  - [ ] Planejamento: 2 projetos
  - [ ] Captação: 3 projetos
  - [ ] Edição: 2 projetos
  - [ ] Concluído: 1 projeto

### Interação
- [ ] Drag & drop funciona entre colunas
- [ ] Cards exibem informações corretas
- [ ] Cores de categoria visíveis
- [ ] Status de pagamento indicado
- [ ] Prazos exibidos com cores adequadas (verde/amarelo/vermelho)

---

## 4️⃣ PROJETOS - LISTAGEM

### Lista de Projetos
- [ ] Todos os 8 projetos listados
- [ ] Filtros funcionam:
  - [ ] Por fase
  - [ ] Por categoria
  - [ ] Por cliente
  - [ ] Por status de pagamento
- [ ] Busca por nome funciona
- [ ] Ordenação funciona
- [ ] Paginação (se aplicável)

---

## 5️⃣ MODAIS DE PROJETO

### Modal: Criar Novo Projeto
- [ ] Modal abre corretamente
- [ ] Todos os campos disponíveis:
  - [ ] Título
  - [ ] Cliente (dropdown com 5 clientes)
  - [ ] Categoria (dropdown com 6 categorias)
  - [ ] Tipo de vídeo
  - [ ] Localização
  - [ ] Descrição
  - [ ] Valores financeiros
  - [ ] Datas
  - [ ] Responsáveis (freelancers e editores)
- [ ] Validação de campos obrigatórios
- [ ] Cálculo automático de margem
- [ ] Criação bem-sucedida

### Modal: Editar Projeto
- [ ] Abre com projeto "Campanha Ano Novo 2026"
- [ ] Todos os dados preenchidos corretamente
- [ ] Campos editáveis
- [ ] Salvar alterações funciona
- [ ] Cancelar descarta alterações

### Modal: Visualizar Detalhes do Projeto
Testar com "Campanha Ano Novo 2026" (projeto completo):

#### Aba Geral
- [ ] Informações básicas exibidas
- [ ] Cliente: Tech Innovations Lda
- [ ] Categoria: Vídeo Marketing
- [ ] Valor: €8.500
- [ ] Status financeiro correto
- [ ] Datas de prazo visíveis

#### Aba Comentários
- [ ] 2 comentários visíveis
- [ ] Comentário de Admin sobre aprovação do roteiro
- [ ] Comentário de João Silva sobre equipamento
- [ ] Possível adicionar novo comentário
- [ ] Possível editar comentário próprio
- [ ] Timestamps corretos

#### Aba Checklist
- [ ] 4 itens de checklist:
  - [ ] Contrato assinado ✅
  - [ ] Briefing recebido ✅
  - [ ] Locações confirmadas ✅
  - [ ] Material bruto organizado ⬜
- [ ] Possível marcar/desmarcar itens
- [ ] Possível adicionar novos itens
- [ ] Indicação de quem completou

#### Aba Arquivos
- [ ] 2 arquivos listados:
  - [ ] roteiro-campanha-v2.pdf
  - [ ] storyboard.png
- [ ] Ícones de tipo de arquivo corretos
- [ ] Tamanhos exibidos
- [ ] Possível fazer upload de novos arquivos
- [ ] Possível baixar arquivos

#### Aba Media
- [ ] 1 link Frame.io listado
- [ ] URL clicável
- [ ] Descrição visível
- [ ] Possível adicionar novos links

#### Aba Subtasks
- [ ] 3 subtasks listadas:
  - [ ] Pré-produção e roteiro (✅ concluída)
  - [ ] Captação de imagens (🔄 em progresso)
  - [ ] Edição e pós-produção (⏳ todo)
- [ ] Status coloridos e claros
- [ ] Prioridades indicadas
- [ ] Possível criar nova subtask
- [ ] Possível editar subtasks existentes
- [ ] Estimativas de horas visíveis

#### Aba Orçamento
- [ ] 3 itens de orçamento:
  - [ ] Equipamento: €600 (pago)
  - [ ] Filmmaker: €1.000 (pendente)
  - [ ] Edição: €2.000 (pendente)
- [ ] Total calculado corretamente
- [ ] Status de pagamento indicado
- [ ] Possível adicionar novos itens

#### Aba Atividades
- [ ] Log de atividades visível:
  - [ ] Criação do projeto
  - [ ] Mudança de fase
- [ ] Timestamps corretos
- [ ] Usuários identificados
- [ ] Ordem cronológica reversa

### Outros Projetos para Testar
- [ ] "Comercial TV Restaurante" (projeto atrasado)
  - [ ] Indicação de atraso visível
  - [ ] Comentários sobre mudanças
- [ ] "Vídeo Corporativo Clínica" (concluído)
  - [ ] Status de concluído claro
  - [ ] Vídeo final no Vimeo listado
- [ ] "Documentário História de Lisboa" (planejamento)
  - [ ] Campos ainda vazios apropriados
  - [ ] Pronto para começar captação

---

## 6️⃣ SUBTASKS

### Modal: Detalhes da Subtask
Testar com subtask "Captação de imagens":
- [ ] Modal abre corretamente
- [ ] Título e descrição visíveis
- [ ] Status atual: "in_progress"
- [ ] Prioridade: "urgent"
- [ ] Prazo visível
- [ ] Responsável: João Silva
- [ ] Estimativa: 16 horas
- [ ] Possível mudar status
- [ ] Possível adicionar comentários

### Modal: Criar Subtask
- [ ] Modal abre
- [ ] Campos disponíveis
- [ ] Validação funciona
- [ ] Criação bem-sucedida

---

## 7️⃣ CLIENTES

### Listagem
- [ ] 5 clientes listados:
  - [ ] Tech Innovations Lda (premium)
  - [ ] Restaurante Sabor Local
  - [ ] Clínica Saúde Plus
  - [ ] GreenEnergy Startup
  - [ ] BankCorp Portugal (corporativo)
- [ ] Métricas financeiras corretas
- [ ] Número de projetos correto

### Modal: Detalhes do Cliente
Testar com "Tech Innovations Lda":
- [ ] Informações de contato:
  - [ ] Email: contato@techinnovations.pt
  - [ ] Telefone: +351 912 345 678
- [ ] Métricas financeiras:
  - [ ] Receita Total: €45.000
  - [ ] Margem: €25.000
  - [ ] 5 projetos
- [ ] Lista de projetos do cliente
- [ ] Notas do cliente visíveis:
  - [ ] "Cliente muito satisfeito..."
- [ ] Comunicações registradas:
  - [ ] Proposta enviada
  - [ ] Reunião de Kickoff

### Modal: Criar Cliente
- [ ] Modal abre
- [ ] Campos disponíveis
- [ ] Validação funciona
- [ ] Criação bem-sucedida

---

## 8️⃣ CATEGORIAS

### Listagem
- [ ] 6 categorias listadas
- [ ] Cores diferenciadas
- [ ] Descrições visíveis

### Modal: Gerenciar Categorias
- [ ] Possível criar nova categoria
- [ ] Possível editar categoria existente
- [ ] Possível alterar cor
- [ ] Validação de nome único

---

## 9️⃣ NOTIFICAÇÕES

### Centro de Notificações
- [ ] 6 notificações criadas:
  1. [ ] Projeto atrasado (alta prioridade) - não lida
  2. [ ] Nova captação agendada - não lida
  3. [ ] Comentário no projeto - lida
  4. [ ] Pagamento pendente - não lida
  5. [ ] Pagamento atrasado (urgente) - não lida
  6. [ ] Projeto concluído (baixa) - lida

### Funcionalidades
- [ ] Badge com contagem de não lidas (4)
- [ ] Marcar como lida funciona
- [ ] Marcar todas como lidas funciona
- [ ] Links para projetos funcionam
- [ ] Prioridades visualmente diferentes
- [ ] Filtros por tipo de notificação

---

## 🔟 FINANÇAS

### Dashboard Financeiro
- [ ] Receita total calculada (€95.000+)
- [ ] Custos totais calculados (€50.000+)
- [ ] Margem total calculada (€45.000+)
- [ ] Gráficos de receita por cliente
- [ ] Gráficos de receita por categoria
- [ ] Status de pagamentos:
  - [ ] Pendentes listados
  - [ ] Parciais listados
  - [ ] Pagos listados
  - [ ] Atrasados destacados

### Filtros e Relatórios
- [ ] Filtro por período
- [ ] Filtro por cliente
- [ ] Filtro por status
- [ ] Exportação de dados (se implementado)

---

## 1️⃣1️⃣ CALENDÁRIO

### Visualização
- [ ] Calendário renderiza corretamente
- [ ] Projetos aparecem nas datas de captação
- [ ] Cores de categoria mantidas
- [ ] Tooltips com informações
- [ ] Navegação entre meses

### Projetos no Calendário
- [ ] Projeto daqui 3 dias: "Behind the Scenes"
- [ ] Projeto daqui 5 dias: "Campanha Ano Novo"
- [ ] Projeto daqui 7 dias: "Série GreenEnergy"
- [ ] Projeto daqui 20 dias: "Conferência Tech Summit"
- [ ] Projeto daqui 30 dias: "Documentário Lisboa"

---

## 1️⃣2️⃣ RESPONSIVIDADE

### Desktop (1920x1080)
- [ ] Layout adequado
- [ ] Todos os elementos visíveis
- [ ] Modais centralizados

### Tablet (768x1024)
- [ ] Menu adaptado
- [ ] Cards reorganizados
- [ ] Modais responsivos
- [ ] Tabelas scrolláveis

### Mobile (375x667)
- [ ] Menu hamburger
- [ ] Cards empilhados
- [ ] Modais full screen
- [ ] Formulários adaptados
- [ ] Touch gestures funcionam

---

## 1️⃣3️⃣ PERFORMANCE

### Tempos de Carregamento
- [ ] Dashboard carrega em < 2s
- [ ] Kanban carrega em < 2s
- [ ] Projetos carregam em < 1s
- [ ] Modais abrem instantaneamente
- [ ] Filtros respondem em < 500ms

### Quantidade de Dados
- [ ] Sistema responde bem com 8 projetos
- [ ] Sem lentidão ao scrollar
- [ ] Drag & drop suave
- [ ] Sem travamentos

---

## 1️⃣4️⃣ INTEGRAÇÃO

### Links Externos
- [ ] Links Frame.io testados (simulados)
- [ ] Links NAS testados (simulados)
- [ ] Links Vimeo testados (simulados)

---

## 📊 SUMÁRIO DOS TESTES

### Estatísticas
- Total de itens testados: ___
- Itens passaram: ___
- Itens falharam: ___
- Taxa de sucesso: ___%

### Problemas Encontrados

#### Críticos (Impedem o uso)
1. 

#### Médios (Funcionam mas com problemas)
1. 

#### Baixos (Melhorias sugeridas)
1. 

---

## 🎯 PRÓXIMOS PASSOS

Após completar esta checklist:

1. Documentar todos os problemas encontrados
2. Criar issues no GitHub para bugs
3. Priorizar correções
4. Testar novamente após correções
5. Validar em ambiente de staging
6. Preparar para produção

---

## 📝 NOTAS ADICIONAIS

### Ambiente de Teste
- Data do teste: ___________
- Testador: ___________
- Versão do sistema: ___________
- Navegador: ___________
- Sistema operacional: ___________

### Observações Gerais
