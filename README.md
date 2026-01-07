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
