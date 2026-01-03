# 🔍 TESTAR AUTOSAVE - Guia de Debug

## ⏰ AGUARDE 2 MINUTOS

O Railway está fazendo deploy da versão com logs detalhados.

---

## 🎯 COMO TESTAR (Depois de 2 min)

### **Passo 1: Abrir Console do Navegador**

**No Chrome/Edge**:
1. Pressione `F12` ou `Cmd+Option+I` (Mac)
2. Clique na aba **"Console"**
3. Deixe o console aberto

**No Safari**:
1. Cmd+Option+C
2. Aba "Console"

---

### **Passo 2: Abrir o Painel de Projeto**

1. Acesse: https://will-flow.up.railway.app
2. Login: admin@willflow.com / admin123
3. Vá em **"Projetos → Edição"**
4. **Clique num projeto** (qualquer um)
5. Painel modal abre

---

### **Passo 3: Editar Algo e Ver os Logs**

**No painel aberto**, tente editar:

1. **Título**: Mude o texto
2. **Descrição**: Digite algo
3. **Status**: Mude o dropdown
4. **Data de Entrega**: Mude a data

**Olhe o Console - Deve aparecer**:

```
🔵 Autosave chamado com: { title: "Novo título" }
📤 Enviando para API: { url: "/api/projects/abc123", method: "PUT", data: {...} }
📥 Resposta da API: { status: 200, ok: true }
📥 Dados da resposta: { success: true, data: {...} }
✅ Projeto salvo com sucesso!
```

---

## 🎯 O QUE VERIFICAR

### ✅ **SE APARECER TUDO VERDE**:
- Logs com ✅ = Está salvando corretamente!
- Problema pode ser no refresh da página
- Me mostre os logs que apareceram

### ❌ **SE APARECER ERRO VERMELHO**:
- Logs com ❌ = Erro ao salvar
- Me mostre o erro completo que aparece
- Pode ser problema na API ou banco

### 🔵 **SE NÃO APARECER NADA**:
- Nenhum log 🔵 = Autosave não está sendo chamado
- Problema no código do TaskDrawer
- Me avise que não apareceu nada

---

## 📋 CHECKLIST DE TESTE

Teste cada campo e marque se funciona:

- [ ] Editar **Título** → Ver logs no console
- [ ] Mudar **Status** → Ver logs no console
- [ ] Mudar **Prioridade** → Ver logs no console
- [ ] Editar **Descrição** → Ver logs no console
- [ ] Mudar **Data de Entrega** → Ver logs no console
- [ ] Mudar **Categoria** → Ver logs no console
- [ ] Editar **ID Personalizado** → Ver logs no console

---

## 📸 ME ENVIE

**Tire um print ou copie**:

1. **Os logs do console** (toda a saída que aparecer)
2. **Qual campo você editou**
3. **O que aconteceu** (salvou? erro? nada?)

**Exemplo do que me enviar**:
```
Editei: Título de "Projeto A" para "Projeto B"

Logs que apareceram:
🔵 Autosave chamado com: { title: "Projeto B" }
📤 Enviando para API: ...
❌ Erro ao salvar: Network error
```

---

## 🔧 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: "Erro ao salvar: 404"
**Solução**: ID do projeto inválido
- Feche e abra outro projeto

### Problema 2: "Erro ao salvar: 500"
**Solução**: Erro no servidor
- Me mostre o erro completo

### Problema 3: Nenhum log aparece
**Solução**: Autosave não está sendo chamado
- Verifique se está editando o campo correto
- Me avise

### Problema 4: "Erro ao salvar: Network error"
**Solução**: Problema de conexão
- Verifique internet
- Tente recarregar a página

---

## 💡 DICAS

1. **Limpe o console** antes de testar (botão 🚫 no console)
2. **Edite apenas 1 campo por vez** para ver os logs específicos
3. **Aguarde 1 segundo** após editar para ver o autosave disparar
4. **Veja o indicador** "A guardar..." → "Guardado" no topo do painel

---

## ⏰ TIMELINE

1. **Agora**: Aguardar 2 min (Railway deploy com logs)
2. **Depois**: Abrir console + painel
3. **Editar**: Qualquer campo
4. **Ver**: Logs no console
5. **Me enviar**: Print dos logs

---

**🎯 Execute agora e me envie o que aparece no console!**
