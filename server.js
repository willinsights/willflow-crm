const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Bind to all interfaces for Railway
const port = parseInt(process.env.PORT || '3000', 10)

// Inicializar Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('🚀 Iniciando servidor audiovisual CRM...')

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse da URL
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Servir arquivos estáticos
      if (pathname.startsWith('/_next/static/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('❌ Erro no servidor:', req.url, err)
      res.statusCode = 500
      res.end('Erro interno do servidor')
    }
  })
    .once('error', (err) => {
      console.error('❌ Erro fatal do servidor:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`✅ Servidor rodando em http://${hostname}:${port}`)
      console.log(`📅 Iniciado em: ${new Date().toLocaleString('pt-PT')}`)
      console.log(`🎯 Modo: ${dev ? 'desenvolvimento' : 'produção'}`)
    })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🔄 Recebido SIGINT, encerrando servidor...')
  process.exit(0)
})
