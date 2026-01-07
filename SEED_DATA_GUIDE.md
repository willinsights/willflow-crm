# 🌱 Guia de Dados de Teste (Seed Data)

Este documento descreve os dados fictícios disponíveis no sistema para testes completos de todas as funcionalidades.

## 📋 Visão Geral

O sistema inclui dados de teste abrangentes que simulam cenários reais de produção audiovisual, incluindo:
- Múltiplos usuários com diferentes perfis
- Clientes premium e regulares
- Projetos em diversas fases (captação, edição)
- Projetos para o mês atual e próximos meses
- Dados financeiros realistas
- Notificações, comentários, e atividades
- Subtasks, checklists e arquivos
- **Colunas do Kanban pré-configuradas para CAPTACAO e EDICAO**

## ✨ Novo: Modo Idempotente

O seed agora é **idempotente** - pode ser executado várias vezes sem duplicar dados!

### Variáveis de Ambiente

- `SEED_WITH_SAMPLE_DATA=true` - Criar dados de teste completos (6 clientes, 10 projetos)
- `SEED_CLEAN_DATABASE=true` - Limpar banco antes de criar dados (use com cuidado!)

### Modos de Operação

#### 1. Primeira Execução com Dados Completos
```bash
export SEED_WITH_SAMPLE_DATA=true
export SEED_CLEAN_DATABASE=true
npm run db:seed
```

#### 2. Modo Idempotente (Seguro - Recomendado)
```bash
# Verifica dados existentes e só cria o que está faltando
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed
```
Resultado: 
- ✅ Se dados já existem: "Dados de exemplo já existem (X projetos encontrados)"
- 📦 Se não existem: Cria todos os dados

#### 3. Apenas Configuração Básica
```bash
# Cria apenas admin e colunas do Kanban
npm run db:seed
```

## 🚀 Como Usar

### Ativar Dados de Teste

Para popular o banco de dados com os dados de teste:

```bash
# Definir variável de ambiente
export SEED_WITH_SAMPLE_DATA=true

# Executar seed
npm run db:seed
# ou
bun run db:seed
```

### Limpar Banco (Apenas Admin)

Para limpar e recriar todos os dados:

```bash
# ⚠️ ATENÇÃO: Apaga todos os dados do banco!
export SEED_CLEAN_DATABASE=true
export SEED_WITH_SAMPLE_DATA=true

# Executar seed
npm run db:seed
```

## 📊 Dados Criados

### Colunas do Kanban (Sempre Criadas)

#### Fase: CAPTACAO
1. **A agendar** (statusKey: `a-agendar`)
2. **Agendado** (statusKey: `agendado`)
3. **Em execução** (statusKey: `em-execucao`)
4. **Entregue** 🔒 (statusKey: `entregue`, systemKey: `DELIVERED`)

#### Fase: EDICAO
1. **A iniciar** (statusKey: `a-iniciar`)
2. **Em edição** (statusKey: `em-edicao`)
3. **Em revisão** (statusKey: `em-revisao`)
4. **Entregue** 🔒 (statusKey: `entregue`, systemKey: `DELIVERED`)

> 🔒 Colunas "Entregue" são bloqueadas e não podem ser movidas ou removidas.

## 👥 Usuários Criados

### Administrador (Sempre Criado)
- **Nome**: Administrador
- **Email**: admin@in-sights.pt
- **Senha**: admin123
- **Role**: admin
- **Permissões**: Acesso total ao sistema

### Freelancers de Captação
1. **João Silva** (joao.silva@exemplo.com)
   - Tipo: Filmmaker
   - Especialidade: Filmagem profissional
   - Dados bancários: Completos

2. **Maria Santos** (maria.santos@exemplo.com)
   - Tipo: Fotógrafo
   - Especialidade: Fotografia profissional
   - Dados bancários: Completos

3. **Pedro Costa** (pedro.costa@exemplo.com)
   - Tipo: Ambos (Foto + Film)
   - Especialidade: Foto e vídeo
   - Dados bancários: Completos

### Editores
1. **Ana Ferreira** (ana.ferreira@exemplo.com)
   - Editor de edição
   - Pode editar projetos
   - Dados bancários: Completos

2. **Carlos Mendes** (carlos.mendes@exemplo.com)
   - Editor de edição
   - Pode editar projetos
   - Dados bancários: Completos

### Visualizador
- **Sofia Oliveira** (sofia.oliveira@exemplo.com)
  - Role: viewer
  - Pode visualizar todos os projetos
  - Sem permissões de edição ou finanças

## 🏢 Clientes Criados

### Cliente Premium
- **Tech Innovations Lda**
  - Email: contato@techinnovations.pt
  - Telefone: +351 912 345 678
  - Receita Total: €45.000
  - Margem: €25.000
  - 5 projetos

### Clientes Regulares
1. **Restaurante Sabor Local**
   - Email: marketing@saborlocal.pt
   - Receita: €8.000
   - 2 projetos

2. **Clínica Saúde Plus**
   - Email: comunicacao@saudeplus.pt
   - Receita: €15.000
   - 3 projetos

3. **GreenEnergy Startup**
   - Email: hello@greenenergy.pt
   - Receita: €12.000
   - 2 projetos

### Cliente Corporativo
- **BankCorp Portugal**
  - Email: marketing@bankcorp.pt
  - Receita Total: €50.000
  - Margem: €28.000
  - 4 projetos

## 📁 Categorias

1. **Vídeo Marketing** (#3B82F6 - Azul)
2. **Documentário** (#10B981 - Verde)
3. **Publicidade** (#F59E0B - Laranja)
4. **Corporativo** (#8B5CF6 - Roxo)
5. **Eventos** (#EC4899 - Rosa)
6. **Redes Sociais** (#14B8A6 - Turquesa)

## 🎬 Projetos Criados

### 1. Campanha Ano Novo 2026
- **Status**: Em Captação
- **Cliente**: Tech Innovations Lda
- **Categoria**: Vídeo Marketing
- **Valor**: €8.500
- **Prazo**: Próximos 15 dias
- **Captação**: João Silva
- **Edição**: Ana Ferreira
- **Inclui**: Roteiro, storyboard, 3 subtasks, comentários, checklist

### 2. Documentário História de Lisboa
- **Status**: Planejamento
- **Cliente**: BankCorp Portugal
- **Categoria**: Documentário
- **Valor**: €25.000
- **Prazo**: 60 dias
- **Captação**: Pedro Costa
- **Edição**: Carlos Mendes

### 3. Comercial TV Restaurante
- **Status**: Em Edição (ATRASADO)
- **Cliente**: Restaurante Sabor Local
- **Categoria**: Publicidade
- **Valor**: €4.500
- **Status**: Atrasado 5 dias
- **Captação**: Maria Santos (Concluída, Paga)
- **Edição**: Ana Ferreira (Em andamento)
- **Inclui**: 2 subtasks urgentes, comentários

### 4. Vídeo Corporativo Clínica
- **Status**: Concluído
- **Cliente**: Clínica Saúde Plus
- **Categoria**: Corporativo
- **Valor**: €5.500
- **Status**: Pago e entregue
- **Inclui**: Vídeo final no Vimeo

### 5. Série Redes Sociais GreenEnergy
- **Status**: Em Captação
- **Cliente**: GreenEnergy Startup
- **Categoria**: Redes Sociais
- **Valor**: €6.000
- **Prazo**: 21 dias
- **Pagamento**: Parcial
- **Inclui**: 3 subtasks, scripts aprovados

### 6. Conferência Tech Summit 2026
- **Status**: Planejamento
- **Cliente**: Tech Innovations Lda
- **Categoria**: Eventos
- **Valor**: €12.000
- **Prazo**: 35 dias
- **Tipo**: Cobertura de evento

### 7. Campanha Poupança BankCorp
- **Status**: Em Revisão
- **Cliente**: BankCorp Portugal
- **Categoria**: Publicidade
- **Valor**: €18.000
- **Prazo**: 10 dias
- **Pagamento**: Parcial
- **Inclui**: Links Frame.io e NAS, comentários

### 8. Behind the Scenes Tech Innovations
- **Status**: Em Captação
- **Cliente**: Tech Innovations Lda
- **Categoria**: Redes Sociais
- **Valor**: €3.500
- **Prazo**: 12 dias

## 🔔 Notificações

O sistema inclui notificações variadas:

1. **Prazo** - Projeto atrasado (alta prioridade)
2. **Projeto** - Nova captação agendada
3. **Comentário** - Feedback do cliente
4. **Pagamento** - Fatura vencendo em 5 dias (alta)
5. **Pagamento** - Pagamento atrasado (urgente)
6. **Projeto** - Projeto concluído (baixa)

## ✅ Funcionalidades Testáveis

### Modais e Formulários
- ✅ Criar novo projeto (todos os campos)
- ✅ Editar projeto existente
- ✅ Visualizar detalhes do projeto
- ✅ Adicionar comentários
- ✅ Gerenciar checklist
- ✅ Upload de arquivos
- ✅ Links de media (Frame.io, Vimeo, NAS)
- ✅ Criar e editar subtasks
- ✅ Notificações (ler/não lidas)

### Páginas e Navegação
- ✅ Dashboard (visão geral, métricas)
- ✅ Kanban (drag & drop entre fases)
- ✅ Lista de projetos (filtros, busca)
- ✅ Detalhes de projeto completo
- ✅ Gestão de clientes
- ✅ Gestão de categorias
- ✅ Finanças (receitas, custos, margens)
- ✅ Calendário de projetos
- ✅ Centro de notificações

### Cenários de Teste

#### Projetos em Diferentes Fases
- Planejamento → Teste de criação de novo projeto
- Em Captação → Teste de workflow de captação
- Em Edição → Teste de workflow de edição
- Concluído → Teste de visualização de histórico

#### Status de Pagamento
- Pendente → Teste de gestão de cobranças
- Parcial → Teste de pagamentos parcelados
- Pago → Teste de relatórios financeiros
- Atrasado → Teste de alertas e notificações

#### Prazos
- Projetos no prazo (próximos 15 dias)
- Projetos atrasados (para testar alertas)
- Projetos futuros (próximos 60 dias)

## 💾 Dados Adicionais

### Subtasks
- Total: ~15 subtasks
- Status variados: todo, in_progress, review, done
- Prioridades: low, medium, high, urgent
- Com e sem prazos
- Com estimativas de horas

### Comentários
- Em projetos: ~4-5 comentários
- Em subtasks: ~2 comentários
- Com timestamps realistas

### Checklists
- Itens completos e pendentes
- Com datas de conclusão
- Associados a usuários

### Arquivos
- PDFs (roteiros)
- Imagens (storyboards)
- Vídeos (entregas finais)
- Com metadados completos

### Media Links
- Frame.io (revisões)
- Vimeo (vídeos finais)
- NAS (material bruto)
- Com thumbnails e durações

### Orçamento
- Equipamento
- Equipe
- Transporte
- Alimentação
- Pós-produção
- Status de pagamento

### Comunicações
- Emails
- Reuniões
- Chamadas telefônicas
- Com notas e status

## 🔄 Atualizando os Dados

Para resetar o banco e repopular:

```bash
# 1. Resetar banco
npm run db:push

# 2. Popular com dados de teste
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed
```

## 📊 Estatísticas dos Dados

- **Usuários**: 7 (1 admin, 3 freelancers captação, 2 editores, 1 viewer)
- **Clientes**: 5 (1 premium, 3 regulares, 1 corporativo)
- **Categorias**: 6
- **Projetos**: 8 (2 planejamento, 3 captação, 2 edição, 1 concluído)
- **Subtasks**: ~15
- **Notificações**: 6
- **Comentários**: ~10
- **Arquivos**: 3
- **Links Media**: 3
- **Itens Orçamento**: ~5
- **Comunicações**: 3
- **Notas de Cliente**: 2

## ⚠️ Notas Importantes

1. **Persistência**: Os dados são permanentes até que o banco seja resetado
2. **Segurança**: Estes dados são apenas para teste - não use em produção
3. **Datas**: As datas são calculadas dinamicamente (atual + offset) para manter relevância
4. **Performance**: Com dados reais, o seed demora ~5-10 segundos
5. **Dependências**: Respeita todas as relações do schema Prisma

## 🎯 Próximos Passos

Para testar o sistema completo:

1. Popular o banco com `SEED_WITH_SAMPLE_DATA=true`
2. Fazer login como admin@in-sights.pt
3. Navegar pelas diferentes páginas
4. Testar criação/edição de projetos
5. Verificar notificações
6. Testar drag & drop no Kanban
7. Explorar detalhes de projetos
8. Verificar relatórios financeiros

## 🐛 Problemas Conhecidos

- Nenhum no momento. Reporte issues encontrados durante os testes.

## 📝 Changelog

### Versão 1.0 (2026-01-05)
- ✅ Dados iniciais completos para todos os modelos
- ✅ Cenários realistas com datas dinâmicas
- ✅ Cobertura completa de funcionalidades
- ✅ Documentação detalhada
