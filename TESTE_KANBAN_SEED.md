# Guia de Teste: Kanban Corrigido e Seed de Dados Demo

Este guia detalha como testar as correções do Kanban e o novo sistema de dados de demonstração.

## ✅ Alterações Implementadas

### 1. **API de Seed Demo** (`/api/debug/seed-demo`)
- Endpoint POST para popular o banco de dados com dados completos
- **Restrição de segurança**: Apenas ambientes dev/staging
- **Idempotente**: Limpa dados existentes antes de criar novos
- Cria estrutura completa:
  - 8 colunas Kanban (4 CAPTACAO + 4 EDICAO)
  - 7 usuários com diferentes perfis
  - 6 clientes
  - 6 categorias
  - 10 projetos (5 CAPTACAO + 5 EDICAO)
  - Subtasks, comentários, checklists, atividades e notificações

### 2. **Seed.ts Atualizado**
- Alinhamento de status de projetos com colunas do Kanban
- 10 projetos distribuídos entre CAPTACAO e EDICAO
- Status corretos: `a-agendar`, `agendado`, `em-execucao`, `entregue`, `a-iniciar`, `em-edicao`, `em-revisao`
- 6º cliente adicionado

### 3. **Empty State no KanbanBoard**
- UI melhorada quando não existem projetos
- Botão CTA para criar o primeiro projeto
- Mensagem amigável com ícones visuais

## 🧪 Passos de Teste

### Passo 1: Configurar Ambiente
```bash
# Clone ou navegue até o repositório
cd /path/to/willflow-crm

# Instale dependências se necessário
npm install

# Configure variável de ambiente para NODE_ENV
export NODE_ENV=development  # ou staging
```

### Passo 2: Popular Banco com Dados Demo via API

```bash
# Método 1: Via curl
curl -X POST http://localhost:3000/api/debug/seed-demo \
  -H "Content-Type: application/json"

# Método 2: Via script
npm run db:seed
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Demo data seeded successfully",
  "environment": "development",
  "data": {
    "users": 7,
    "clients": 6,
    "categories": 6,
    "projects": {
      "total": 10,
      "captacao": 5,
      "edicao": 5
    },
    "kanbanColumns": {
      "captacao": 4,
      "edicao": 4
    }
  },
  "credentials": {
    "admin": {
      "email": "admin@in-sights.pt",
      "password": "admin123"
    }
  }
}
```

### Passo 3: Verificar Colunas do Kanban

1. **Via API**:
```bash
# Testar endpoint de colunas - CAPTACAO
curl http://localhost:3000/api/kanban/columns?phase=CAPTACAO&organizationId=default

# Testar endpoint de colunas - EDICAO
curl http://localhost:3000/api/kanban/columns?phase=EDICAO&organizationId=default
```

**Resposta esperada para CAPTACAO:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "A agendar",
      "position": 0,
      "isLocked": false,
      "systemKey": null
    },
    {
      "id": "...",
      "title": "Agendado",
      "position": 1,
      "isLocked": false,
      "systemKey": null
    },
    {
      "id": "...",
      "title": "Em execução",
      "position": 2,
      "isLocked": false,
      "systemKey": null
    },
    {
      "id": "...",
      "title": "Entregue",
      "position": 3,
      "isLocked": true,
      "systemKey": "DELIVERED"
    }
  ]
}
```

2. **Via UI**:
   - Inicie o servidor: `npm run dev`
   - Faça login com `admin@in-sights.pt` / `admin123`
   - Navegue para a aba "Captação" ou "Edição"
   - Verifique se as colunas aparecem corretamente

### Passo 4: Verificar Projetos no Kanban

**Projetos em CAPTACAO** (esperados 5):
1. **"Campanha Ano Novo 2026"** → Coluna "A agendar"
2. **"Documentário História de Lisboa"** → Coluna "Agendado"
3. **"Comercial TV Restaurante"** → Coluna "Em execução"
4. **"Vídeo Corporativo Clínica"** → Coluna "Entregue"
5. **"Série Redes Sociais GreenEnergy"** → Coluna "Entregue"

**Projetos em EDICAO** (esperados 5):
1. **"Conferência Tech Summit 2026"** → Coluna "A iniciar"
2. **"Campanha Poupança BankCorp"** → Coluna "Em edição"
3. **"Behind the Scenes Tech Innovations"** → Coluna "Em revisão"
4. **"Tutorial Produto Startup"** → Coluna "Entregue"
5. **"Campanha Redes Sociais Clínica"** → Coluna "A iniciar"

### Passo 5: Testar Drag & Drop

1. **Arrastar projeto entre colunas**:
   - Clique e segure um card de projeto
   - Arraste para outra coluna
   - Solte o card
   - Verifique se o projeto mudou de coluna e status

2. **Reordenar colunas** (exceto "Entregue"):
   - Clique e segure o handle de uma coluna (ícone de grip)
   - Arraste para nova posição
   - Solte
   - Verifique se a ordem foi mantida após refresh

3. **Coluna bloqueada**:
   - Tente arrastar a coluna "Entregue"
   - Deve aparecer mensagem de erro
   - Coluna não deve se mover

### Passo 6: Testar Empty State

1. **Limpar todos os projetos**:
```bash
# Via API
curl -X POST http://localhost:3000/api/debug/seed-demo
# Depois remova projetos manualmente via UI
```

2. **Verificar Empty State**:
   - Navegue para aba Captação ou Edição
   - Deve aparecer:
     - Ícone de pasta vazia
     - Mensagem "Ainda não há projetos aqui"
     - Botão "Criar Primeiro Projeto"
     - Informação sobre colunas inicializadas

3. **Testar CTA**:
   - Clique em "Criar Primeiro Projeto"
   - Modal de criação deve abrir
   - Crie um projeto
   - Empty state deve desaparecer

### Passo 7: Verificar Restrições de Segurança

1. **Tentar seed em produção** (deve falhar):
```bash
# Configurar para produção
export NODE_ENV=production

# Tentar seed
curl -X POST http://localhost:3000/api/debug/seed-demo
```

**Resposta esperada:**
```json
{
  "success": false,
  "error": "Seed endpoint is only available in development/staging environments",
  "environment": "production"
}
```

### Passo 8: Validar Dados Criados

1. **Clientes** (6):
   - Tech Innovations Lda
   - Restaurante Sabor Local
   - Clínica Saúde Plus
   - GreenEnergy Startup
   - BankCorp Portugal
   - Moda Lisboa Boutique

2. **Usuários** (7):
   - Administrador (admin)
   - João Silva (filmmaker)
   - Maria Santos (photographer)
   - Pedro Costa (both)
   - Ana Ferreira (editor)
   - Carlos Mendes (editor)
   - Sofia Oliveira (viewer) - apenas no seed.ts completo

3. **Categorias** (6):
   - Vídeo Marketing (#3B82F6)
   - Documentário (#10B981)
   - Publicidade (#F59E0B)
   - Corporativo (#8B5CF6)
   - Eventos (#EC4899)
   - Redes Sociais (#14B8A6)

## 📋 Checklist de Validação

- [ ] Endpoint `/api/debug/seed-demo` retorna 403 em produção
- [ ] Endpoint `/api/debug/seed-demo` funciona em dev/staging
- [ ] Colunas CAPTACAO aparecem corretamente (4 colunas)
- [ ] Colunas EDICAO aparecem corretamente (4 colunas)
- [ ] 5 projetos em CAPTACAO distribuídos nas colunas corretas
- [ ] 5 projetos em EDICAO distribuídos nas colunas corretas
- [ ] Drag & drop de cards funciona
- [ ] Drag & drop de colunas funciona (exceto "Entregue")
- [ ] Coluna "Entregue" está bloqueada (não move, não renomeia, não deleta)
- [ ] Empty state aparece quando não há projetos
- [ ] Botão "Criar Primeiro Projeto" funciona
- [ ] Dashboard mostra estatísticas corretas
- [ ] Página de clientes lista 6 clientes
- [ ] Notificações foram criadas
- [ ] Comentários e checklists estão associados aos projetos

## 🐛 Problemas Conhecidos e Soluções

### Problema: API retorna erro 500
**Solução**: Verifique se o banco de dados está acessível e se as variáveis de ambiente estão configuradas corretamente.

### Problema: Projetos não aparecem nas colunas
**Solução**: Verifique se os status dos projetos correspondem aos nomes das colunas (em minúsculas, com hifens).

### Problema: Empty state não aparece
**Solução**: Certifique-se de que todos os projetos foram removidos e que as colunas foram inicializadas.

## 📸 Screenshots Esperados

1. **Kanban com dados** (CAPTACAO):
   - 4 colunas visíveis
   - Cards distribuídos nas colunas
   - UI responsiva

2. **Kanban com dados** (EDICAO):
   - 4 colunas visíveis
   - Cards de projetos em edição
   - Coluna "Entregue" com badge verde

3. **Empty State**:
   - Ícone de pasta vazia centralizado
   - Mensagem clara
   - Botão CTA destacado

4. **Drag & Drop em ação**:
   - Card sendo arrastado (opacidade reduzida)
   - Coluna de destino destacada

## 🚀 Próximos Passos

Após validar todos os testes:
1. Fazer merge da branch para main
2. Deploy em staging para testes adicionais
3. Validar em produção (sem usar seed!)
4. Documentar para o time

## 📞 Suporte

Em caso de problemas, verifique:
- Console do navegador para erros de JS
- Logs do servidor para erros de API
- Banco de dados para verificar dados criados
- Variáveis de ambiente estão corretas
