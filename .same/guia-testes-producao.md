# 🧪 GUIA DE TESTES EM PRODUÇÃO - WillFlow CRM

**URL**: https://will-flow.up.railway.app
**Data**: 06/11/2025
**Versão**: V64
**Status**: Deploy em andamento (aguarde 2-3 minutos)

---

## ⏱️ AGUARDAR DEPLOY

**Tempo estimado**: 2-3 minutos a partir do push

**Como verificar se deploy completou:**
1. Acesse: https://will-flow.up.railway.app
2. Se ver tela de login → Deploy completo ✅
3. Se ver erro 502/503 → Ainda deployando ⏳ (aguarde mais 1 minuto)

---

## 🧪 TESTE 1: Verificar Aba Financeiro no Menu

### ✅ Checklist:

1. **Login como Admin**
   - Clique no botão "Admin"
   - Deve entrar automaticamente

2. **Verificar Menu Lateral**
   - [ ] Item "Financeiro" está visível
   - [ ] Ícone € (Euro) aparece ao lado
   - [ ] Está posicionado entre "Finalizados" e "Clientes"

3. **Clicar em Financeiro**
   - [ ] Página carrega sem erros
   - [ ] 5 KPIs aparecem no topo:
     - Total a Receber
     - Total Recebido
     - Total a Pagar
     - Total Pago
     - Lucro Líquido
   - [ ] Tabela "A Receber de Clientes" aparece
   - [ ] Tabela "A Pagar a Colaboradores" aparece
   - [ ] 3 filtros (Status, Cliente, Colaborador)
   - [ ] Botões CSV e PDF no topo

### 📸 Screenshot Esperado:
```
┌─────────────────────────────────────┐
│ 💼 Financeiro                      │
├─────────────────────────────────────┤
│ [€ 15.420] [€ 22.800] [€ 4.200] ...│
│  A Receber   Recebido   A Pagar    │
├─────────────────────────────────────┤
│ Filtros: [Status▼] [Cliente▼]     │
├─────────────────────────────────────┤
│ Tabela A Receber...                │
└─────────────────────────────────────┘
```

---

## 🧪 TESTE 2: Drag & Drop em Captação

### ✅ Checklist:

1. **Ir para Captação**
   - Clique em "Captação" no menu
   - Deve ver 4 colunas:
     - Agendado
     - Em Gravação
     - Upload NAS
     - Concluído

2. **Testar Drag Horizontal**
   - [ ] Pegar um card da coluna "Agendado"
   - [ ] Arrastar sobre "Upload NAS"
   - [ ] Ver anel roxo + zoom na coluna (feedback visual)
   - [ ] Soltar o card
   - [ ] Card aparece em "Upload NAS" ✅

3. **Abrir Console (F12)**
   - [ ] Ver logs:
     ```
     🎯 Drag End: { active: "proj-123", over: "upload-nas" }
     ✅ Movendo projeto: { de: "agendado", para: "upload-nas" }
     ✅ Status atualizado com sucesso!
     ```

4. **Testar Transições Diversas**
   - [ ] "Agendado" → "Concluído" (direto) ✅
   - [ ] "Em Gravação" → "Agendado" (voltar) ✅
   - [ ] "Upload NAS" → "Em Gravação" (voltar) ✅
   - [ ] Qualquer → Qualquer coluna ✅

### 🎥 Feedback Visual Esperado:
- **Ao pegar card**: Opacidade 50%
- **Ao arrastar sobre coluna**: Anel roxo + escala 105%
- **Ao soltar**: Animação suave, card aparece na nova coluna

---

## 🧪 TESTE 3: Drag & Drop em Edição

### ✅ Checklist:

1. **Ir para Edição**
   - Clique em "Edição" no menu
   - Deve ver 6 colunas:
     - Receber Ficheiros
     - Decupagem
     - Em Edição
     - Feedback
     - Revisão Cliente
     - Entregue

2. **Testar Transições Flexíveis**
   - [ ] "Receber Ficheiros" → "Entregue" (pular tudo) ✅
   - [ ] "Entregue" → "Revisão Cliente" (voltar para ajustes) ✅
   - [ ] "Feedback" → "Decupagem" (voltar muito) ✅
   - [ ] Qualquer → Qualquer coluna ✅

3. **Verificar Console**
   - [ ] Logs aparecem corretamente
   - [ ] Sem erros no console
   - [ ] Atualização instantânea (sem reload manual)

---

## 🧪 TESTE 4: Criar Projetos de Teste

### ✅ Criar 3 Projetos Completos:

#### Projeto 1: Casamento (Captação)
```
Título: Casamento João & Maria
Cliente: (criar novo) João Silva
Responsável Captação: Admin
Tipo de Vídeo: Casamento
Categoria: Casamentos
Preço Cliente: €3.500
Custo Captação: €800
Custo Edição: €400
Status Inicial: Agendado
```

**Checklist:**
- [ ] Cliente aparece no dropdown
- [ ] Responsável Captação aparece no dropdown
- [ ] Todos os campos salvam corretamente
- [ ] Projeto aparece na coluna "Agendado"
- [ ] Margem calculada automaticamente (€2.300)

#### Projeto 2: Corporativo (Edição)
```
Título: Vídeo Institucional Empresa X
Cliente: (criar novo) Empresa Tech Ltd
Responsável Edição: Admin
Tipo de Vídeo: Corporativo
Categoria: Corporativo
Preço Cliente: €5.000
Custo Captação: €1.200
Custo Edição: €800
Status Inicial: Receber Ficheiros
```

**Checklist:**
- [ ] Projeto vai direto para Edição
- [ ] Aparece em "Receber Ficheiros"
- [ ] Responsável Edição selecionado
- [ ] Margem: €3.000

#### Projeto 3: Drone (Finalizados)
```
Título: Captação Aérea Propriedade
Cliente: Imobiliária Santos
Responsável Captação: Admin
Responsável Edição: Admin
Tipo de Vídeo: Drone
Preço Cliente: €2.000
Custo Captação: €600
Custo Edição: €300
Status Pagamento Cliente: Recebido
Status Freelancer: Pago
```

**Checklist:**
- [ ] Projeto aparece em "Finalizados"
- [ ] Badges verdes (Recebido/Pago)
- [ ] Margem: €1.100
- [ ] Aparece na tabela Financeiro

---

## 🧪 TESTE 5: Exportação CSV

### Dashboard
1. **Ir para Dashboard**
2. **Clicar "Exportar CSV"**
3. **Verificar arquivo baixado**
   - [ ] Nome: `WillFlow_Dashboard_YYYY-MM-DD.csv`
   - [ ] Contém seção "KPIs Gerais"
   - [ ] Contém seção "Projetos por Fase"
   - [ ] Contém seção "Top 10 Clientes"
   - [ ] Abre corretamente no Excel/Google Sheets

### Financeiro
1. **Ir para Financeiro**
2. **Clicar "CSV"**
3. **Verificar arquivo**
   - [ ] Nome: `WillFlow_Financeiro_YYYY-MM-DD.csv`
   - [ ] 13 colunas (Projeto, Cliente, Fase, etc.)
   - [ ] Dados dos 3 projetos de teste
   - [ ] Cálculos corretos (margem, % margem)

### Finalizados
1. **Ir para Finalizados**
2. **Clicar "CSV"**
3. **Verificar arquivo**
   - [ ] Nome: `WillFlow_Projetos_YYYY-MM-DD.csv`
   - [ ] 14 colunas completas
   - [ ] Status de pagamento incluídos

---

## 🧪 TESTE 6: Filtros Financeiro

### Filtro por Status
1. **Selecionar "Pendente"**
   - [ ] Tabela mostra apenas não pagos
2. **Selecionar "Pago"**
   - [ ] Tabela mostra apenas pagos
3. **Selecionar "Todos"**
   - [ ] Volta a mostrar tudo

### Filtro por Cliente
1. **Selecionar "João Silva"**
   - [ ] Mostra apenas projetos desse cliente
2. **Selecionar "Todos"**
   - [ ] Mostra todos novamente

### Filtro por Colaborador
1. **Selecionar "Admin"**
   - [ ] Mostra pagamentos ao Admin
2. **Testar combinação**
   - [ ] Status=Pendente + Cliente=João Silva
   - [ ] Filtros funcionam juntos

---

## 🧪 TESTE 7: Tema Light/Dark

### Trocar Tema
1. **Clicar ícone Sol/Lua** no header
2. **Verificar Tema Light:**
   - [ ] Background branco/claro
   - [ ] Texto escuro legível
   - [ ] Badges com cores apropriadas
   - [ ] Contraste adequado
3. **Voltar para Dark:**
   - [ ] Background escuro
   - [ ] Texto claro
   - [ ] Glass effects funcionando

---

## 🧪 TESTE 8: Responsividade Mobile

### Abrir em Mobile (ou DevTools mobile view)
1. **Menu Hamburguer**
   - [ ] Ícone aparece em mobile
   - [ ] Menu lateral abre com animação
   - [ ] Fecha ao clicar fora

2. **Dashboard Mobile**
   - [ ] KPIs empilhados (1 coluna)
   - [ ] Gráficos responsivos
   - [ ] Cards adaptados

3. **Kanban Mobile**
   - [ ] Colunas empilhadas verticalmente
   - [ ] Drag & drop funciona em touch
   - [ ] Cards legíveis

---

## 🧪 TESTE 9: Top 5 Colaboradores

### Verificar Dashboard
1. **Ir para Dashboard**
2. **Scroll até "Top 5 Colaboradores"**
3. **Verificar:**
   - [ ] Seção existe (substituiu "Projetos Recentes")
   - [ ] Mostra colaboradores por lucro
   - [ ] Ranking numérico (1º, 2º, 3º...)
   - [ ] Lucro total formatado
   - [ ] Número de projetos
   - [ ] Badges dourado/prata/bronze para top 3

---

## 🧪 TESTE 10: Atualizações em Tempo Real

### Testar Refresh Automático
1. **Criar novo projeto**
   - [ ] Aparece imediatamente no Kanban (sem Cmd+Shift+R)
2. **Mover projeto no Kanban**
   - [ ] Atualiza instantaneamente
3. **Marcar pagamento**
   - [ ] KPIs atualizam sem refresh manual
4. **Criar cliente**
   - [ ] Aparece no dropdown imediatamente

---

## 📊 RESULTADOS ESPERADOS

### ✅ Todos os Testes Passam?

| Teste | Status | Observações |
|-------|--------|-------------|
| 1. Aba Financeiro | [ ] | |
| 2. Drag & Drop Captação | [ ] | |
| 3. Drag & Drop Edição | [ ] | |
| 4. Criar Projetos | [ ] | |
| 5. Exportar CSV | [ ] | |
| 6. Filtros Financeiro | [ ] | |
| 7. Tema Light/Dark | [ ] | |
| 8. Mobile | [ ] | |
| 9. Top 5 Colaboradores | [ ] | |
| 10. Tempo Real | [ ] | |

---

## 🐛 REPORTAR PROBLEMAS

Se encontrar bugs:

1. **Abrir Console (F12)**
2. **Copiar erros**
3. **Screenshot da tela**
4. **Descrever passos para reproduzir**

---

## ✅ CHECKLIST FINAL

### Sistema Completo:
- [ ] Todos os 20 itens do briefing funcionam
- [ ] Aba Financeiro integrada e funcional
- [ ] Drag & Drop 100% operacional
- [ ] Exportação CSV funcionando
- [ ] Filtros funcionando
- [ ] Tema Light/Dark OK
- [ ] Mobile responsivo
- [ ] Sem erros no console
- [ ] Dados salvam corretamente
- [ ] Atualiza em tempo real

---

**Se TODOS os testes passarem:**
🎉 **SISTEMA 100% VALIDADO EM PRODUÇÃO!**

**Desenvolvido com**: Same (https://same.new)
**Data**: 06/11/2025
**Versão**: V64
**Status**: 🟢 EM PRODUÇÃO
