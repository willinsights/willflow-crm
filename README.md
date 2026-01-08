# 🎬 WillFlow CRM

Sistema de gestão de produção audiovisual completo com Kanban, gestão financeira, notificações e PWA.

## 🚀 Repositório GitHub

**URL**: https://github.com/willinsights/willflow-crm

```bash
git clone https://github.com/willinsights/willflow-crm.git
cd willflow-crm
```

## ✨ Funcionalidades

- ✅ **Kanban Interativo** - Gestão visual de projetos com drag & drop
- ✅ **Duas Fases de Produção** - Captação e Edição separadas
- ✅ **Gestão Financeira** - Controle de custos, receitas e margens
- ✅ **Categorias Dinâmicas** - Sistema customizável de categorias
- ✅ **Notificações Inteligentes** - Alertas de prazos e pagamentos
- ✅ **100% Responsivo** - Mobile-first com PWA
- ✅ **PostgreSQL** - Dados persistentes no Railway
- ✅ **RBAC** - Controle de acesso por perfis
- ✅ **Automações** - Transições automáticas entre fases

## 🛠 Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Deploy**: Railway (auto-deploy configurado)
- **State**: Zustand
- **DnD**: @dnd-kit

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar database
cp .env.example .env
# Editar .env com sua DATABASE_URL

# Gerar Prisma Client
npx prisma generate

# Sincronizar schema
npx prisma db push

# Popular com dados de teste completos
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🧪 Dados de Teste

O sistema inclui **dados de teste abrangentes** para permitir testes eficazes:

- **8 projetos** com diferentes status (planejamento, captação, edição, concluído)
- **7 usuários** com perfis variados (admin, freelancers, editores, viewer)
- **5 clientes** (premium, regulares, corporativos)
- **Datas dinâmicas** para mês atual e próximos meses
- **Notificações**, comentários, subtasks, arquivos e muito mais

Para ativar os dados de teste:

```bash
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed
```

📖 **Ver documentação completa**: [SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md)

## 🌐 Deploy

### GitHub
✅ **Status**: Código sincronizado
📦 **Repositório**: https://github.com/willinsights/willflow-crm

### Railway
✅ **Status**: Auto-deploy configurado
🔗 Faz deploy automaticamente a cada push na branch `main`

⚠️ **Importante**: A configuração de deploy foi otimizada para usar `npm` e `node` de forma consistente.

#### Processo de Build no Railway:
1. `npm install --legacy-peer-deps` - Instala dependências
2. `npx prisma generate` - Gera Prisma Client
3. `npx prisma db push` - Aplica schema no banco
4. `npm run build` - Cria build de produção do Next.js
5. `npm run start` - Inicia servidor de produção

📖 **Ver documentação completa de deploy**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

### Reset do Banco de Dados

Para resetar completamente o banco de dados com dados fictícios:

```bash
# Local
npm run db:reset

# Railway (via CLI)
railway run npm run db:reset
```

## 🔧 Manutenção e Troubleshooting

### Seed Completo com 30+ Projetos

Para popular o banco com dados completos de teste (recomendado para desenvolvimento):

```bash
# Limpar e popular com dados completos
npm run seed:full

# Ou usando variáveis de ambiente
SEED_CLEAN_DATABASE=true SEED_WITH_SAMPLE_DATA=true npm run db:seed
```

Isso criará:
- ✅ 10 clientes com perfis variados
- ✅ 30 projetos distribuídos em todas as colunas do Kanban
- ✅ 7 usuários com diferentes perfis e permissões
- ✅ 6 categorias de projetos
- ✅ Colunas do Kanban para Captação e Edição
- ✅ Subtasks, comentários e checklists

### Migração de Colunas do Kanban

Se as colunas do Kanban não estão renderizando projetos corretamente, execute o script de migração:

```bash
# Popula statusKey em colunas existentes
npm run db:migrate-kanban
```

Este script:
- Verifica colunas sem `statusKey` definido
- Normaliza títulos para ASCII (remove acentos)
- Atualiza colunas automaticamente
- Exibe log detalhado das mudanças

### Troubleshooting Comum

#### Kanban não mostra projetos nas colunas

**Problema**: Projetos criados mas não aparecem nas colunas do Kanban.

**Solução**:
```bash
# 1. Execute a migração das colunas
npm run db:migrate-kanban

# 2. Verifique se as colunas têm statusKey
npx prisma studio
# Acesse kanban_columns e verifique campo statusKey

# 3. Se necessário, recarregue os dados
npm run seed:full
```

#### Erro "Database connection failed"

**Problema**: Aplicação não consegue conectar ao banco de dados.

**Solução**:
```bash
# 1. Verifique a variável DATABASE_URL
echo $DATABASE_URL

# 2. Teste a conexão
npm run db:check-railway

# 3. Regenere o Prisma Client
npx prisma generate

# 4. Sincronize o schema
npx prisma db push
```

#### Colunas do Kanban não inicializadas

**Problema**: Página do Kanban mostra "Kanban não inicializado".

**Solução**:
```bash
# 1. Execute o seed básico (cria colunas)
npm run db:seed

# 2. Ou inicialize apenas as colunas
npm run db:init-kanban

# 3. Recarregue a página
```

#### Build falha com erro de Prisma

**Problema**: `npm run build` falha com erro relacionado ao Prisma.

**Solução**:
```bash
# 1. Regenere o cliente Prisma
npx prisma generate

# 2. Limpe o cache do Next.js
rm -rf .next

# 3. Tente novamente
npm run build
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build e Deploy
npm run build            # Build de produção
npm start                # Inicia servidor de produção

# Database
npm run db:seed          # Seed básico (admin + colunas)
npm run seed:full        # Seed completo (30+ projetos)
npm run db:push          # Sincroniza schema com banco
npm run db:studio        # Abre Prisma Studio
npm run db:reset         # Reset completo do banco

# Kanban
npm run db:init-kanban   # Inicializa colunas do Kanban
npm run db:migrate-kanban # Migra statusKey das colunas

# Testes
npm test                 # Executa testes
npm run test:ui          # Interface de testes
```

## 📚 Documentação

- `DEPLOY_GUIDE.md` - 🆕 **Guia completo de deploy e troubleshooting**
- `SEED_DATA_GUIDE.md` - Guia completo de dados de teste
- `DATABASE_SETUP.md` - Configuração do PostgreSQL
- `RAILWAY_DEPLOY_GUIDE.md` - Deploy no Railway
- `GITHUB_SETUP.md` - Setup do repositório

## 🎯 Versão Atual: 32

### Últimas Correções
- ✅ Loop infinito corrigido no NotificationCenter
- ✅ Migração 100% completa para Prisma
- ✅ Todas as APIs usando PostgreSQL
- ✅ Validações e otimizações
- ✅ Sistema totalmente funcional

## 👥 Perfis de Usuário

- **Admin** - Acesso total ao sistema
- **Editor de Edição** - Gestão da fase de edição
- **Freelancer Captação** - Apenas projetos de captação atribuídos

## 📄 Licença

Propriedade de WillFlow - Todos os direitos reservados

---

**🤖 Desenvolvido com [Same](https://same.new)**
