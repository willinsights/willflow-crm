# 🚀 Quick Start - Testando com Dados Fictícios

Guia rápido para desenvolvedores começarem a testar o sistema com dados realistas.

## ⚡ Setup Rápido (5 minutos)

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/willinsights/willflow-crm.git
cd willflow-crm

# 2. Instale as dependências
npm install
# ou
bun install

# 3. Configure o banco de dados
cp .env.example .env
# Edite .env e adicione sua DATABASE_URL do Railway/PostgreSQL

# 4. Sincronize o schema
npm run db:push

# 5. Popule com dados de teste
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed

# 6. Inicie o servidor
npm run dev
```

Acesse: http://localhost:3000

## 🔑 Credenciais de Teste

### Administrador (Acesso Total)
```
Email: admin@in-sights.pt
Senha: (configurar no primeiro acesso)
```

### Freelancer de Captação
```
Email: joao.silva@exemplo.com
Senha: (configurar no primeiro acesso)
```

### Editor de Edição
```
Email: ana.ferreira@exemplo.com
Senha: (configurar no primeiro acesso)
```

### Visualizador
```
Email: sofia.oliveira@exemplo.com
Senha: (configurar no primeiro acesso)
```

## 🎯 O Que Você Vai Encontrar

### 8 Projetos Realistas
- 2 em planejamento
- 3 em captação
- 2 em edição
- 1 concluído

### Cenários para Testar
1. **Projeto no Prazo**: "Campanha Ano Novo 2026"
2. **Projeto Atrasado**: "Comercial TV Restaurante" (-5 dias)
3. **Projeto Concluído**: "Vídeo Corporativo Clínica"
4. **Projeto Grande**: "Documentário História de Lisboa" (€25k)

### Dados Completos
- ✅ 7 usuários com diferentes perfis
- ✅ 5 clientes (premium, regular, corporativo)
- ✅ 6 categorias coloridas
- ✅ ~15 subtasks com status variados
- ✅ 6 notificações (4 não lidas)
- ✅ Comentários, checklists, arquivos
- ✅ Links Frame.io, Vimeo, NAS
- ✅ Orçamentos detalhados
- ✅ Comunicações com clientes

## 🧪 Testes Rápidos (15 minutos)

### 1. Dashboard (2 min)
```
→ Login como admin
→ Ver métricas: €95k+ receita, €45k+ margem
→ Verificar 4 notificações não lidas
```

### 2. Kanban (3 min)
```
→ Ir para Kanban
→ Ver 8 projetos distribuídos
→ Testar drag & drop entre colunas
→ Verificar cores de categoria
```

### 3. Detalhes de Projeto (5 min)
```
→ Clicar em "Campanha Ano Novo 2026"
→ Ver todas as abas:
  - Geral: Info do projeto
  - Comentários: 2 comentários
  - Checklist: 4 itens (3 completos)
  - Arquivos: roteiro.pdf, storyboard.png
  - Media: Link Frame.io
  - Subtasks: 3 tasks
  - Orçamento: €3.600 detalhado
  - Atividades: Log de mudanças
```

### 4. Notificações (2 min)
```
→ Clicar no sino
→ Ver 6 notificações
→ 1 urgente: Pagamento atrasado
→ 1 alta: Projeto atrasado
→ Marcar como lida
```

### 5. Clientes (3 min)
```
→ Ir para Clientes
→ Abrir "Tech Innovations Lda"
→ Ver 5 projetos, €45k receita
→ Ver notas e comunicações
```

## 🎨 Teste de UI/UX

### Verificar Cores
- 🔵 Azul - Vídeo Marketing
- 🟢 Verde - Documentário
- 🟠 Laranja - Publicidade
- 🟣 Roxo - Corporativo
- 🩷 Rosa - Eventos
- 🩵 Turquesa - Redes Sociais

### Verificar Status
- ⏳ Todo - Cinza
- 🔄 In Progress - Azul
- 👀 Review - Laranja
- ✅ Done - Verde

### Verificar Prioridades
- 🔴 Urgent - Vermelho
- 🟠 High - Laranja
- 🟡 Medium - Amarelo
- 🟢 Low - Verde

## 📱 Teste Responsivo

```bash
# Desktop: Ctrl+Shift+M (Chrome DevTools)
# Testar em:
→ Desktop: 1920x1080
→ Tablet: 768x1024
→ Mobile: 375x667
```

## 🔄 Reset dos Dados

Se precisar resetar:

```bash
# Limpar e repopular
npm run db:push
export SEED_WITH_SAMPLE_DATA=true
npm run db:seed
```

## 🐛 Encontrou um Bug?

1. Verifique se é esperado (veja TEST_CHECKLIST.md)
2. Anote:
   - O que você fez
   - O que esperava
   - O que aconteceu
   - Console errors (F12)
3. Crie uma issue no GitHub

## 📊 Verificação Rápida

Execute o validador:
```bash
node scripts/validate-seed.js
```

Deve exibir:
```
✅ Validation passed!
Total lines: 1171
Delete statements: 19
Create statements: 70
Errors: 0
```

## 💡 Dicas

### Para Desenvolvedores

**Adicionar mais dados:**
```typescript
// Edite prisma/seed.ts
await prisma.project.create({
  data: {
    title: 'Meu Novo Projeto',
    // ... seus dados
  }
})
```

**Ver banco no Prisma Studio:**
```bash
npm run db:studio
# Acesse: http://localhost:5555
```

**Executar queries diretas:**
```bash
# Contar projetos
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM projects;"

# Ver clientes
npx prisma db execute --stdin <<< "SELECT * FROM clients;"
```

### Para Designers

- Todos os componentes UI estão em `/src/components/ui/`
- Cores definidas em `tailwind.config.ts`
- Ícones usando `lucide-react`

### Para QA/Testers

- Use TEST_CHECKLIST.md para testes sistemáticos
- Documente bugs com screenshots
- Teste em diferentes navegadores
- Verifique acessibilidade (tab navigation)

## 📖 Documentação Relacionada

- [SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md) - Guia completo de dados
- [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) - Checklist de testes
- [README.md](./README.md) - Documentação geral
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Setup do banco

## ❓ FAQ

**Q: Os dados são permanentes?**
A: Sim, até você executar `db:seed` novamente.

**Q: Posso adicionar meus próprios dados?**
A: Sim! Os dados de seed são apenas iniciais. Você pode criar novos projetos, clientes, etc.

**Q: Como voltar ao zero?**
A: Execute `npm run db:push` (sem seed).

**Q: Os dados funcionam em produção?**
A: Não recomendado. São apenas para desenvolvimento/teste.

**Q: Quantos dados são criados?**
A: ~70 registros no total (users, clients, projects, subtasks, etc).

## 🎉 Pronto!

Agora você tem um sistema completo para testar todas as funcionalidades!

Happy testing! 🚀
