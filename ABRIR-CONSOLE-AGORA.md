# 🔍 ABRIR CONSOLE AGORA - Diagnóstico Autosave

## ⚡ Passos Rápidos

### 1️⃣ Abrir Console
**Já está no site!** Apenas pressione:
- **Mac**: `Cmd + Option + I`
- **Windows/Linux**: `F12`

Vai abrir o DevTools à direita ou embaixo.

### 2️⃣ Ir para Aba Console
Clique na aba **"Console"** (segunda ou terceira aba)

### 3️⃣ Limpar Console
Clique no ícone 🚫 ou pressione `Cmd+K` / `Ctrl+L` para limpar

### 4️⃣ Editar Campo
No painel do projeto aberto, edite qualquer campo:
- Título
- Localização
- CustomId
- Descrição

### 5️⃣ Aguardar 1 Segundo
Espere aparecer "Erro ao guardar" (vermelho no topo)

### 6️⃣ Copiar TODOS os Logs
No console, você vai ver logs assim:
```
🔵 [AUTOSAVE] TaskId: ...
🔵 [AUTOSAVE] Dados a salvar: ...
📥 [AUTOSAVE] Response status: ...
❌ [AUTOSAVE] ERRO CAPTURADO: ...
```

**Copie TUDO** (Cmd+A → Cmd+C)

---

## 📋 O Que Procurar

### Logs Esperados
```
🔵 [AUTOSAVE] TaskId: 0389602b-3dde-4053-8d49-80be2e150816
🔵 [AUTOSAVE] Dados a salvar: { title: "..." }
🔵 [AUTOSAVE] URL completa: /api/projects/0389602b-...
📥 [AUTOSAVE] Response status: 200
✅ [AUTOSAVE] Projeto salvo com sucesso!
```

### Logs de Erro (o que estamos procurando!)
```
❌ [AUTOSAVE] ERRO CAPTURADO: {
  message: "...",
  name: "...",
  stack: "..."
}
```

ou

```
📥 [AUTOSAVE] Response status: 500
❌ [AUTOSAVE] Erro da API: Invalid `prisma.project.update()` ...
```

---

## 🎯 Possíveis Causas

### 1. **Banco de Dados Vazio**
Se ver erro tipo `Record to update not found`:
- Solução: Popular banco via `/api/debug/setup`

### 2. **Campo Inválido no Schema**
Se ver erro tipo `Unknown field` ou `Invalid value`:
- Solução: Ajustar validação dos campos

### 3. **Erro de Conexão**
Se ver erro tipo `Can't reach database`:
- Solução: Verificar DATABASE_URL no Railway

### 4. **CORS ou Network**
Se ver erro tipo `Failed to fetch`:
- Solução: Problema de rede ou CORS

---

## 📤 Enviar Logs

**Cole aqui os logs completos** do console depois de editar um campo!

Exemplo do que enviar:
```
🔵 [AUTOSAVE] TaskId: 0389602b-3dde-4053-8d49-80be2e150816
🔵 [AUTOSAVE] Dados a salvar: {title: 'Teste'}
🔵 [AUTOSAVE] URL completa: /api/projects/0389602b-3dde-4053-8d49-80be2e150816
📥 [AUTOSAVE] Response status: 500
📥 [AUTOSAVE] Response ok: false
📥 [AUTOSAVE] Response JSON: {success: false, error: "..."}
❌ [AUTOSAVE] ERRO CAPTURADO: {...}
```

**Envie TODOS os logs, não só o erro!**

---

🚨 **AGUARDANDO LOGS DO CONSOLE**
