# Database Setup Guide

## Automated Setup (Recommended)

Para configurar o banco de dados automaticamente, execute:

```bash
npm run db:setup
```

Este script irá:
1. Verificar a configuração do `DATABASE_URL`
2. Aplicar todas as migrações necessárias
3. Opcionalmente, popular o banco com dados de exemplo

## Manual Setup

### 1. Configure o DATABASE_URL

Crie um arquivo `.env` na raiz do projeto com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/willflow_crm"
```

### 2. Aplique as Migrações

```bash
npm run db:push
```

ou para ambiente de desenvolvimento:

```bash
npm run db:migrate
```

### 3. Populate com Dados Iniciais

Para criar apenas o usuário administrador:

```bash
npm run db:seed
```

Para criar dados de exemplo (clientes, projetos, categorias):

```bash
SEED_WITH_SAMPLE_DATA=true npm run db:seed
```

## Dados de Exemplo

Quando você popula com dados de exemplo, o sistema cria:

- **1 Administrador**
  - Email: admin@in-sights.pt
  - Acesso total ao sistema

- **2 Clientes**
  - Cliente Exemplo 1 (Empresa A)
  - Cliente Exemplo 2 (Empresa B)

- **3 Categorias**
  - Vídeo Marketing (Azul)
  - Documentário (Verde)
  - Publicidade (Laranja)

- **3 Projetos**
  - Vídeo Corporativo (em progresso)
  - Documentário (planejamento)
  - Campanha Publicitária (em progresso)

## Resetar Banco de Dados

⚠️ **ATENÇÃO**: Isso irá apagar todos os dados!

```bash
npx prisma migrate reset --force
```

## Visualizar Banco de Dados

Para abrir uma interface visual do banco de dados:

```bash
npm run db:studio
```

Isso abrirá o Prisma Studio em `http://localhost:5555`

## Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

Certifique-se de que o arquivo `.env` existe e contém a variável `DATABASE_URL`.

### Erro: "Can't reach database server"

Verifique se:
1. O PostgreSQL está rodando
2. As credenciais estão corretas
3. A porta está acessível

### Erro durante migrações

Se houver problemas com migrações, você pode forçar o reset:

```bash
npx prisma migrate reset --force
```

## Scripts Úteis

- `npm run db:push` - Aplica schema sem criar migração
- `npm run db:migrate` - Cria e aplica migração
- `npm run db:seed` - Popula banco com dados iniciais
- `npm run db:setup` - Setup completo automatizado
- `npm run db:studio` - Abre interface visual do banco
