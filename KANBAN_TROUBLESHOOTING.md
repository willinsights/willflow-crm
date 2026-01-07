# Guia de Solução: Erro 500 nas Colunas do Kanban

## Problema Diagnosticado

O sistema estava retornando **HTTP 500 (Internal Server Error)** ao acessar o endpoint `/api/kanban/columns` para carregar as colunas do Kanban.

### Causas Identificadas

1. **Falta de Inicialização do Banco de Dados**: As colunas do Kanban não foram criadas no banco de dados
2. **Tratamento de Erros Inadequado**: Mensagens de erro genéricas dificultavam o diagnóstico
3. **Falta de Validação**: Não havia validação adequada de parâmetros e conexão com banco de dados

## Soluções Implementadas

### 1. Backend - Melhorias na API

#### `/api/kanban/columns` (GET)
- ✅ Adicionado teste de conexão com banco de dados antes de consultas
- ✅ Validação de parâmetro `phase` (CAPTACAO, EDICAO, FINALIZADOS)
- ✅ Logs detalhados para diagnóstico
- ✅ Mensagens de erro mais informativas com detalhes técnicos
- ✅ Retorno de status HTTP apropriado (503 para problemas de BD, 400 para parâmetros inválidos)

#### `/api/kanban/columns/bootstrap` (POST)
- ✅ Verificação de conexão com banco de dados
- ✅ Tratamento individual de erros ao criar cada coluna
- ✅ Logs detalhados do processo de criação
- ✅ Continuação do processo mesmo se uma coluna falhar
- ✅ Retorno de informação sobre quantas colunas foram criadas

### 2. Frontend - Melhorias no KanbanBoard

#### Componente `KanbanBoard.tsx`
- ✅ Tratamento robusto de erros na função `loadColumns()`
- ✅ Detecção automática de erros 500/503 e tentativa de bootstrap
- ✅ Logs detalhados no console para debugging
- ✅ Mensagens de erro mais claras para o usuário
- ✅ Toast de sucesso quando colunas são inicializadas
- ✅ Fallback automático: tenta bootstrap se não encontrar colunas

### 3. Scripts de Utilidade

#### `scripts/init-kanban-columns.ts`
Script para inicializar manualmente as colunas do Kanban:
```bash
npm run db:init-kanban
```

Funcionalidades:
- Testa conexão com banco de dados
- Verifica colunas existentes
- Cria colunas padrão para CAPTACAO e EDICAO
- Valida a criação
- Logs detalhados de todo o processo

#### `scripts/generate-kanban-test-data.ts`
Script para gerar dados de teste no Kanban:
```bash
npm run db:generate-test-data
```

Funcionalidades:
- Cria cliente, categoria e usuário de teste
- Gera projetos distribuídos em diferentes colunas
- Cria projetos para ambas as fases (CAPTACAO e EDICAO)
- Útil para testes e demonstrações

## Como Usar

### Cenário 1: Instalação Nova (Sem Dados)

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Criar banco de dados**:
   ```bash
   npm run db:push
   ```

3. **Popular com dados iniciais** (inclui colunas do Kanban):
   ```bash
   npm run db:seed
   ```

4. **[Opcional] Gerar dados de teste**:
   ```bash
   npm run db:generate-test-data
   ```

### Cenário 2: Banco Existente (Sem Colunas Kanban)

1. **Inicializar apenas colunas do Kanban**:
   ```bash
   npm run db:init-kanban
   ```

### Cenário 3: Erro 500 Continua Aparecendo

1. **Verificar conexão com banco de dados**:
   - Confirme que a variável `DATABASE_URL` está configurada corretamente
   - Teste a conexão: `npm run db:studio`

2. **Verificar logs do servidor**:
   - Inicie o servidor: `npm run dev`
   - Acesse a aplicação e observe os logs no console
   - Procure por mensagens com prefixo `[Kanban Columns]` ou `[Kanban Bootstrap]`

3. **Forçar recriação das colunas**:
   ```bash
   # Resetar banco de dados completo (ATENÇÃO: apaga todos os dados!)
   npm run db:reset
   
   # Popular novamente
   npm run db:seed
   ```

## Estrutura das Colunas Padrão

### CAPTACAO
1. **A agendar** (position: 0)
2. **Agendado** (position: 1)
3. **Em execução** (position: 2)
4. **Entregue** (position: 3, locked, systemKey: 'DELIVERED')

### EDICAO
1. **A iniciar** (position: 0)
2. **Em edição** (position: 1)
3. **Em revisão** (position: 2)
4. **Entregue** (position: 3, locked, systemKey: 'DELIVERED')

### Características Especiais

- **Coluna "Entregue"**: 
  - Bloqueada (`isLocked: true`)
  - Chave do sistema: `DELIVERED`
  - Não pode ser movida, renomeada ou removida
  - Sempre fica na última posição

## Debugging

### Verificar Colunas no Banco

Usando Prisma Studio:
```bash
npm run db:studio
```

Navegue até a tabela `kanban_columns` e verifique:
- Se existem registros
- Se `organizationId` é 'default'
- Se `phase` está em maiúsculas (CAPTACAO, EDICAO)
- Se `isActive` é `true`

### Logs Úteis

O sistema agora gera logs detalhados:

**Frontend (Console do navegador)**:
```
[KanbanBoard] Loading columns for phase: CAPTACAO
[KanbanBoard] Loaded 4 columns
```

**Backend (Console do servidor)**:
```
[Kanban Columns] Fetching columns for phase: CAPTACAO, org: default
[Kanban Columns] Found 4 columns for phase CAPTACAO
[Kanban Bootstrap] Starting bootstrap for organization: default
[Kanban Bootstrap] Created column: A agendar (CAPTACAO)
```

### Erros Comuns

#### Erro: "Database connection failed"
- **Causa**: Não foi possível conectar ao PostgreSQL
- **Solução**: Verifique `DATABASE_URL` no arquivo `.env`

#### Erro: "Unique constraint failed"
- **Causa**: Tentativa de criar colunas duplicadas
- **Solução**: As colunas já existem, use `db:studio` para verificar

#### Erro: "Phase parameter is required"
- **Causa**: Requisição sem parâmetro `phase`
- **Solução**: Erro no frontend, verifique o componente que faz a chamada

## Testes

### Teste Manual

1. Acesse a aplicação
2. Navegue para a aba "Captação" ou "Edição"
3. Verifique se as colunas são carregadas corretamente
4. Tente arrastar um card entre colunas
5. Tente criar uma nova coluna personalizada

### Teste de API

Usando curl ou Postman:

```bash
# Obter colunas de CAPTACAO
curl http://localhost:3000/api/kanban/columns?phase=CAPTACAO&organizationId=default

# Bootstrap (criar colunas padrão)
curl -X POST http://localhost:3000/api/kanban/columns/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"default"}'
```

## Prevenção de Problemas Futuros

1. **Sempre rode o seed após resetar o banco**:
   ```bash
   npm run db:reset && npm run db:seed
   ```

2. **Em produção, garanta que o bootstrap seja executado**:
   - O sistema tenta automaticamente ao detectar ausência de colunas
   - Mas é melhor garantir via script de deployment

3. **Monitore os logs**:
   - Configure logs persistentes em produção
   - Acompanhe mensagens de erro relacionadas ao Kanban

## Suporte Adicional

Se o problema persistir:

1. Verifique os logs completos do servidor
2. Confirme a versão do Prisma: `npx prisma --version`
3. Teste a conexão direta com PostgreSQL
4. Verifique se há migrations pendentes: `npm run db:migrate`

## Referências

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
