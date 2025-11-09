# 🚀 Guia de Deploy para cPanel

## 📋 Arquivos Necessários

### 1. Build já pronto em `.next/`
O build foi concluído com sucesso! Você precisa dos seguintes arquivos:

```
audiovisual-crm/
├── .next/               # Build otimizado (NECESSÁRIO)
├── public/              # Assets estáticos (NECESSÁRIO)
├── package.json         # Dependências (NECESSÁRIO)
├── next.config.js       # Configuração Next.js (NECESSÁRIO)
└── node_modules/        # Dependências instaladas (OPCIONAL - pode instalar no servidor)
```

### 2. Criar package.json simplificado para produção

```json
{
  "name": "audiovisual-crm",
  "version": "1.0.0",
  "scripts": {
    "start": "next start",
    "build": "next build"
  },
  "dependencies": {
    "next": "15.3.2",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "recharts": "^3.2.1",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

## 🎯 Opções de Deploy

### Opção 1: Upload Completo via File Manager

1. **Compactar arquivos localmente:**
   ```bash
   # Criar ZIP com arquivos essenciais
   zip -r audiovisual-crm.zip .next/ public/ package.json next.config.js
   ```

2. **Upload via cPanel File Manager:**
   - Acesse seu cPanel
   - Vá em "File Manager"
   - Navegue para `public_html/` ou pasta do seu domínio
   - Faça upload do `audiovisual-crm.zip`
   - Extraia o arquivo

3. **Instalar dependências no servidor:**
   ```bash
   # Via Terminal no cPanel (se disponível)
   cd public_html
   npm install --production
   ```

### Opção 2: Upload via FTP/SFTP

1. **Conectar via FTP:**
   ```
   Host: ftp.seudominio.com
   Usuário: seu_usuario_cpanel
   Senha: sua_senha_cpanel
   ```

2. **Fazer upload dos arquivos:**
   ```
   ├── public_html/
   │   ├── .next/           # Pasta build completa
   │   ├── public/          # Assets estáticos
   │   ├── package.json     # Dependências
   │   └── next.config.js   # Configuração
   ```

## ⚙️ Configuração Node.js no cPanel

### 1. Ativar Node.js no cPanel

1. **Encontrar "Node.js" no cPanel:**
   - Procure por "Node.js App" ou "Node.js Selector"
   - Clique para acessar

2. **Criar Nova Aplicação:**
   ```
   Node.js Version: 18.x (recomendado)
   Application Mode: Production
   Application Root: public_html (ou pasta específica)
   Application URL: seudominio.com
   Application Startup File: server.js (vamos criar)
   ```

### 2. Criar arquivo server.js

Crie um arquivo `server.js` na raiz da aplicação:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

### 3. Configurar package.json para cPanel

Atualize o package.json:

```json
{
  "name": "audiovisual-crm",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "build": "next build"
  },
  "dependencies": {
    "next": "15.3.2",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

## 🔧 Configurações Importantes

### 1. Variáveis de Ambiente (se necessário)

No cPanel Node.js, adicione:
```
NODE_ENV=production
PORT=3000
```

### 2. Arquivo .htaccess (se usar Apache)

Crie `.htaccess` na raiz:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### 3. Configuração de Domínio

Se usar subdomínio ou pasta específica, ajuste as rotas no next.config.js:

```javascript
const nextConfig = {
  basePath: '/audiovisual-crm', // Se estiver em subpasta
  assetPrefix: '/audiovisual-crm', // Se estiver em subpasta
  // ... resto da config
}
```

## 📱 Teste Final

1. **Verificar se está rodando:**
   ```bash
   # No terminal do cPanel
   pm2 list  # ou
   ps aux | grep node
   ```

2. **Acessar aplicação:**
   ```
   https://seudominio.com
   ```

3. **Debug logs:**
   ```bash
   # Verificar logs de erro
   tail -f logs/app.log
   ```

## 🆘 Resolução de Problemas

### Erro: "Module not found"
```bash
# Reinstalar dependências
npm install --production
```

### Erro: "Permission denied"
```bash
# Ajustar permissões (via File Manager ou SSH)
chmod 755 .next/
chmod 644 .next/**/*
```

### Erro: "Port already in use"
```bash
# Verificar porta configurada no cPanel Node.js
# Alterar PORT no server.js se necessário
```

### Site não carrega CSS/JS
```bash
# Verificar se pasta public/ foi enviada
# Verificar basePath no next.config.js
```

## ✅ Checklist Final

- [ ] Upload de `.next/`, `public/`, `package.json`, `next.config.js`
- [ ] Criar `server.js`
- [ ] Configurar Node.js no cPanel
- [ ] Instalar dependências: `npm install --production`
- [ ] Iniciar aplicação no cPanel Node.js
- [ ] Configurar domínio/subdomínio
- [ ] Testar acesso: `https://seudominio.com`
- [ ] Verificar todas as funcionalidades

## 📞 Suporte

Se precisar de ajuda:
1. Verifique logs do cPanel
2. Teste com `node server.js` manualmente
3. Confirme se Node.js 18+ está disponível no seu hosting
4. Verifique se todas as portas estão liberadas

---

🎉 **Seu sistema está pronto para produção com todas as funcionalidades:**
- ✅ RBAC completo (3 tipos de usuários)
- ✅ Kanban com drag-and-drop
- ✅ Sistema de notificações
- ✅ Relatórios financeiros
- ✅ Upload e integrações
- ✅ Design liquid glass otimizado
