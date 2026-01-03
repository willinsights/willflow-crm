# 🚀 INSTRUÇÕES DE UPLOAD - Sistema Audiovisual CRM

## 📁 ARQUIVO PREPARADO: `audiovisual-crm-deploy.zip`

### ✅ O QUE ESTÁ INCLUÍDO:

```
📦 audiovisual-crm-deploy.zip
├── 📂 .next/                    # Build completo otimizado
├── 📄 package.json              # Dependências de produção
├── 📄 next.config.js            # Configuração Next.js
└── 📄 server.js                 # Servidor para cPanel
```

## 🎯 COMO FAZER O UPLOAD:

### OPÇÃO 1: File Manager (Recomendado)
1. **Baixe:** `audiovisual-crm-deploy.zip`
2. **Acesse:** Seu cPanel → File Manager
3. **Vá para:** `public_html/` (ou pasta do domínio)
4. **Upload:** Arraste o ZIP ou clique "Upload"
5. **Extrair:** Clique com botão direito → "Extract"

### OPÇÃO 2: FTP/SFTP
1. **Conecte via FTP:** seu domínio
2. **Navegue:** para pasta do site
3. **Upload:** Extraia o ZIP localmente e envie as pastas
4. **Estrutura final:**
   ```
   public_html/
   ├── .next/
   ├── package.json
   ├── next.config.js
   └── server.js
   ```

## ⚙️ CONFIGURAR NODE.JS NO CPANEL:

### 1. Encontrar Node.js
- Procure: "Node.js", "Node.js App", ou "Node.js Selector"
- Se não tiver, contate seu provedor

### 2. Criar Aplicação
```
✅ Node.js Version: 18.x ou superior
✅ Application Mode: Production
✅ Application Root: public_html (ou sua pasta)
✅ Application URL: seudominio.com
✅ Startup File: server.js
✅ Environment Variables: NODE_ENV=production
```

### 3. Instalar Dependências
```bash
npm install --production
```

### 4. Iniciar App
- Clique "Start Application"
- Aguarde alguns segundos
- Acesse: `https://seudominio.com`

## 📋 CHECKLIST FINAL:

- [ ] Download do `audiovisual-crm-deploy.zip`
- [ ] Upload via File Manager ou FTP
- [ ] Extração dos arquivos na pasta correta
- [ ] Configuração Node.js no cPanel
- [ ] Instalação das dependências
- [ ] Start da aplicação
- [ ] Teste de acesso no navegador

## ✅ SISTEMA COMPLETO INCLUÍDO:

### 🔐 **FUNCIONALIDADES:**
- **RBAC:** 3 tipos de usuários (Admin/Freelancer/Editor)
- **Kanban:** Drag-and-drop entre status
- **Notificações:** Alertas automáticos
- **Relatórios:** Gráficos financeiros
- **Upload:** Sistema de arquivos
- **Design:** UI liquid glass premium

### 👥 **USUÁRIOS DE TESTE:**
- **Admin:** João Silva (acesso total)
- **Freelancer:** Pedro Costa (apenas captação)
- **Editor:** Maria Santos (apenas edição)

### 📊 **DADOS DE EXEMPLO:**
- 5 projetos de exemplo
- 4 clientes configurados
- Relatórios com dados reais
- Notificações ativas

## 🆘 PROBLEMAS COMUNS:

### ❌ "Node.js não disponível"
- Contate seu provedor de hospedagem
- Verifique se o plano inclui Node.js

### ❌ "Erro de permissão"
- Ajuste permissões: 755 para pastas, 644 para arquivos
- Via File Manager → Permissions

### ❌ "Site não carrega"
- Verifique se a aplicação está "Started" no cPanel
- Confirme se todos os arquivos foram extraídos
- Olhe os logs de erro no painel Node.js

### ❌ "CSS/JS não carrega"
- Confirme se a pasta `.next/static/` existe
- Verifique se o domínio está configurado corretamente

## 📞 SUPORTE:

1. **Verifique logs** no painel Node.js do cPanel
2. **Teste manual** com `node server.js` se tiver SSH
3. **Confirme versão** Node.js 18+ disponível
4. **Contate provedor** se Node.js não estiver disponível

---

## 🎉 SEU SISTEMA ESTÁ PRONTO!

Todos os arquivos estão otimizados e testados. O build foi compilado com sucesso e está pronto para produção.

**Tamanho:** ~15MB compactado
**Tecnologia:** Next.js 15 + React 18
**Compatibilidade:** Node.js 18+
**Performance:** Otimizado para produção

**Boa sorte com seu deploy! 🚀**
