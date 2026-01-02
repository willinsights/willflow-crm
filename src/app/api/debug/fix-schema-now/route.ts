import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corrigir Schema - WillFlow</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    h1 { margin: 0 0 20px 0; font-size: 32px; }
    .status {
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      font-size: 18px;
      text-align: center;
    }
    .loading { background: rgba(255, 193, 7, 0.2); border: 2px solid #ffc107; }
    .success { background: rgba(76, 175, 80, 0.2); border: 2px solid #4caf50; }
    .error { background: rgba(244, 67, 54, 0.2); border: 2px solid #f44336; }
    pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 14px;
      max-height: 400px;
      overflow-y: auto;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      margin: 10px 5px;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .actions { text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Corrigir Schema do Banco</h1>

    <div id="status" class="status loading">
      <div class="spinner"></div>
      <p>⏳ Executando correção do schema...</p>
      <p style="font-size: 14px; opacity: 0.8;">Aguarde ~5 segundos</p>
    </div>

    <div id="result" style="display: none;">
      <pre id="output"></pre>
    </div>

    <div class="actions">
      <button id="retry" style="display: none;" onclick="location.reload()">
        🔄 Tentar Novamente
      </button>
      <button id="goToDashboard" style="display: none;" onclick="window.location.href='https://will-flow.up.railway.app'">
        🎉 Ir para o Painel
      </button>
    </div>
  </div>

  <script>
    async function fixSchema() {
      try {
        const response = await fetch('/api/debug/fix-schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        const statusDiv = document.getElementById('status');
        const resultDiv = document.getElementById('result');
        const outputPre = document.getElementById('output');
        const retryBtn = document.getElementById('retry');
        const dashboardBtn = document.getElementById('goToDashboard');

        resultDiv.style.display = 'block';
        outputPre.textContent = JSON.stringify(data, null, 2);

        if (data.summary?.status === 'success') {
          statusDiv.className = 'status success';
          statusDiv.innerHTML = \`
            <h2 style="margin: 0;">✅ Sucesso!</h2>
            <p>\${data.summary.message}</p>
            <p style="font-size: 14px; margin-top: 10px;">
              Agora você pode acessar o painel e ver seus 10 projetos!
            </p>
          \`;
          dashboardBtn.style.display = 'inline-block';
        } else {
          statusDiv.className = 'status error';
          statusDiv.innerHTML = \`
            <h2 style="margin: 0;">❌ Erro</h2>
            <p>\${data.summary?.message || data.error?.message || 'Erro desconhecido'}</p>
          \`;
          retryBtn.style.display = 'inline-block';
        }
      } catch (error) {
        const statusDiv = document.getElementById('status');
        const resultDiv = document.getElementById('result');
        const outputPre = document.getElementById('output');
        const retryBtn = document.getElementById('retry');

        statusDiv.className = 'status error';
        statusDiv.innerHTML = \`
          <h2 style="margin: 0;">❌ Erro de Conexão</h2>
          <p>\${error.message}</p>
        \`;

        resultDiv.style.display = 'block';
        outputPre.textContent = error.stack || error.toString();
        retryBtn.style.display = 'inline-block';
      }
    }

    // Executar automaticamente ao carregar a página
    window.onload = fixSchema;
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
