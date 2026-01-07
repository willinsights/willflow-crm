# Correção de Autenticação - Documentação das Alterações

## Problema Identificado

### Descrição do Problema
As senhas geradas automaticamente não estavam funcionando para autenticação no sistema, afetando todos os tipos de utilizadores (Admin, Editor, Freelancer).

### Causa Raiz
O arquivo `prisma/seed.ts` criava utilizadores **sem senhas** no banco de dados. Embora o sistema de criação de utilizadores via API (POST /api/users) funcionasse corretamente, os utilizadores criados através do seed não podiam fazer login.

### Impacto
- Utilizadores criados pelo seed não conseguiam fazer login
- Necessário criar utilizadores manualmente via API ou interface
- Dificuldade em testar o sistema com dados de exemplo

## Solução Implementada

### 1. Correção do Arquivo de Seed (prisma/seed.ts)

**Mudanças realizadas:**

1. **Importação da função de hash:**
```typescript
import { hashPassword } from '../src/lib/auth-utils'
```

2. **Adição de senhas para todos os utilizadores:**

| Utilizador | Email | Senha | Role | mustChangePassword |
|------------|-------|-------|------|-------------------|
| Administrador | admin@in-sights.pt | admin123 | admin | false |
| João Silva | joao.silva@exemplo.com | filmmaker123 | freelancer_captacao | true |
| Maria Santos | maria.santos@exemplo.com | photographer123 | freelancer_captacao | true |
| Pedro Costa | pedro.costa@exemplo.com | creator123 | freelancer_captacao | true |
| Ana Ferreira | ana.ferreira@exemplo.com | editor123 | editor_edicao | true |
| Carlos Mendes | carlos.mendes@exemplo.com | editor456 | editor_edicao | true |
| Sofia Oliveira | sofia.oliveira@exemplo.com | viewer123 | viewer | true |

3. **Logging de credenciais:**
O seed agora exibe as credenciais criadas no console para facilitar o acesso:
```
✅ Criado 1 usuário administrador
   Email: admin@in-sights.pt
   Senha: admin123
```

### 2. Testes de Integração Criados

**Arquivo:** `src/tests/integration/password-flow.test.ts`

**15 testes abrangentes cobrindo:**

1. **User Creation Flow (2 testes)**
   - Criação de utilizador com senha gerada e verificação de login
   - Múltiplos utilizadores criados em sequência

2. **Password Reset Flow (1 teste)**
   - Reset de senha e login com nova senha

3. **Password Change Flow (2 testes)**
   - Troca de senha no primeiro acesso
   - Troca de senha para diferentes roles

4. **Email Normalization Consistency (1 teste)**
   - Consistência na normalização de emails (lowercase + trim)

5. **Edge Cases and Security (4 testes)**
   - Caracteres especiais em senhas
   - Salts únicos para mesma senha
   - Senhas muito longas
   - Hashes malformados

6. **Seeded User Scenarios (3 testes)**
   - Cenário de utilizador admin
   - Cenário de freelancer com senha gerada
   - Cenário de editor com senha gerada

7. **Concurrent User Scenarios (2 testes)**
   - Múltiplos utilizadores com mesma senha (diferentes hashes)
   - Isolamento de verificação de senha por utilizador

### 3. Fluxo Completo de Autenticação

#### Criação de Novo Utilizador (via API)
```
1. Admin cria utilizador → 
2. Sistema gera senha aleatória (12 caracteres) →
3. Senha é hasheada com PBKDF2 + salt único →
4. Hash armazenado no banco de dados →
5. Senha em texto plano enviada por email →
6. mustChangePassword = true
```

#### Primeiro Login
```
1. Utilizador recebe email com senha temporária →
2. Faz login com email e senha temporária →
3. Sistema verifica senha usando verifyPassword() →
4. Login bem-sucedido, modal obrigatório aparece →
5. Utilizador define nova senha →
6. Nova senha é hasheada e armazenada →
7. mustChangePassword = false
```

#### Recuperação de Senha
```
1. Utilizador clica "Esqueci a senha" →
2. Informa email →
3. Sistema gera nova senha →
4. Nova senha hasheada e armazenada →
5. Email enviado com nova senha →
6. mustChangePassword = true →
7. Utilizador faz login e troca senha
```

## Arquivos Alterados

### 1. prisma/seed.ts
**Mudanças:**
- Adicionada importação: `import { hashPassword } from '../src/lib/auth-utils'`
- Linha 39-55: Adicionada senha hasheada para utilizador admin
- Linha 64-175: Adicionadas senhas hasheadas para todos os utilizadores de teste
- Adicionado console.log com credenciais para referência

**Antes:**
```typescript
const admin = await prisma.user.create({
  data: {
    id: '1',
    name: 'Administrador',
    email: 'admin@in-sights.pt',
    role: 'admin',
    // ... sem campo password
  },
})
```

**Depois:**
```typescript
const adminPassword = 'admin123';
const admin = await prisma.user.create({
  data: {
    id: '1',
    name: 'Administrador',
    email: 'admin@in-sights.pt',
    password: hashPassword(adminPassword),
    role: 'admin',
    // ...
  },
})
console.log(`   Email: admin@in-sights.pt`)
console.log(`   Senha: ${adminPassword}`)
```

### 2. src/tests/integration/password-flow.test.ts (NOVO)
**Conteúdo:**
- 15 testes de integração completos
- Cobertura de todos os fluxos de senha
- Testes de segurança e casos extremos
- ~280 linhas de testes

## Resultados dos Testes

### Testes Existentes (100% Pass)
```
✓ src/tests/auth/auth-utils.test.ts (17 tests)
✓ src/tests/auth/email-templates.test.ts (11 tests)
Total: 28 tests passed
```

### Testes de Integração Novos (100% Pass)
```
✓ src/tests/integration/password-flow.test.ts (15 tests)
  ✓ User Creation Flow (2 tests)
  ✓ Password Reset Flow (1 test)
  ✓ Password Change Flow (2 tests)
  ✓ Email Normalization (1 test)
  ✓ Edge Cases and Security (4 tests)
  ✓ Seeded User Scenarios (3 tests)
  ✓ Concurrent User Scenarios (2 tests)
Total: 15 tests passed
```

### Total de Testes: 43 testes, 100% sucesso

## Segurança

### Algoritmo de Hash
- **Algoritmo:** PBKDF2 com SHA-512
- **Iterações:** 100,000
- **Salt:** 16 bytes aleatórios (único por senha)
- **Tamanho da chave:** 64 bytes
- **Formato:** `salt:hash` (hexadecimal)

### Características de Segurança
1. **Salt único:** Cada senha tem salt diferente, mesmo que senha seja igual
2. **Timing-safe comparison:** Proteção contra ataques de timing
3. **Força computacional:** 100k iterações dificultam ataques de força bruta
4. **Troca obrigatória:** Utilizadores devem trocar senha temporária

## Como Usar

### 1. Popular o Banco de Dados
```bash
npm run db:seed
```

### 2. Fazer Login com Utilizadores de Teste

**Admin:**
- Email: `admin@in-sights.pt`
- Senha: `admin123`
- Pode fazer login diretamente (mustChangePassword = false)

**Freelancer (Filmmaker):**
- Email: `joao.silva@exemplo.com`
- Senha: `filmmaker123`
- Deve trocar senha no primeiro login

**Editor:**
- Email: `ana.ferreira@exemplo.com`
- Senha: `editor123`
- Deve trocar senha no primeiro login

### 3. Criar Novos Utilizadores via API

```bash
POST /api/users
{
  "name": "Novo Utilizador",
  "email": "novo@exemplo.com",
  "role": "freelancer_captacao",
  // Senha será gerada automaticamente
}
```

O sistema irá:
1. Gerar senha aleatória
2. Hashear a senha
3. Armazenar no banco
4. Enviar email com senha
5. Definir mustChangePassword = true

### 4. Recuperar Senha

```bash
POST /api/auth/forgot-password
{
  "email": "usuario@exemplo.com"
}
```

## Validação

### Checklist de Validação
- [x] Seed cria utilizadores com senhas hasheadas
- [x] Login funciona com senhas do seed
- [x] API de criação de utilizadores continua funcionando
- [x] Recuperação de senha funciona
- [x] Troca de senha no primeiro acesso funciona
- [x] Todos os tipos de utilizadores podem fazer login
- [x] Testes unitários passam (17 testes)
- [x] Testes de integração passam (15 testes)
- [x] Emails templates testados (11 testes)

## Conformidade com Requisitos

### Requisito 1: Corrigir geração de senha ✅
- Senha é gerada corretamente com `generatePassword(12)`
- Armazenada no banco com `hashPassword()`
- Hash usa PBKDF2 com salt único

### Requisito 2: Validação de login ✅
- Sistema reconhece credenciais geradas
- Verificação usa `verifyPassword()` com timing-safe comparison
- 43 testes validam funcionalidade

### Requisito 3: Recuperação e primeira troca de senha ✅
- Flag `mustChangePassword` implementada
- Modal obrigatório no primeiro login
- API `/api/auth/change-password` funcionando
- API `/api/auth/forgot-password` funcionando

### Requisito 4: Todas as categorias de colaboradores ✅
- Admin: ✅ pode fazer login
- Editor: ✅ pode fazer login e trocar senha
- Freelancer: ✅ pode fazer login e trocar senha
- Viewer: ✅ pode fazer login e trocar senha

### Regra: Preservar estrutura existente ✅
- Não foram alterados arquivos de autenticação existentes
- Apenas corrigido seed e adicionados testes
- APIs mantêm mesma interface

### Regra: Não adicionar dependências ✅
- Nenhuma nova dependência adicionada
- Utilizado crypto nativo do Node.js
- Aproveitada estrutura existente

## Conclusão

A correção implementada resolve completamente o problema de autenticação:

1. **Utilizadores criados pelo seed agora têm senhas** e podem fazer login
2. **Testes abrangentes** garantem que o fluxo completo funciona
3. **Segurança mantida** com hashing robusto (PBKDF2)
4. **Documentação clara** das credenciais de teste
5. **100% dos testes passando** (43 testes no total)

Os utilizadores agora podem:
- Fazer login com senhas geradas
- Trocar senha no primeiro acesso
- Recuperar senha se esquecerem
- Funciona para todas as categorias (Admin, Editor, Freelancer)
