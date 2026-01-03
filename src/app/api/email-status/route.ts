import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const status = {
    smtp_host: process.env.SMTP_HOST ? '✅ Configurado' : '❌ Não configurado',
    smtp_port: process.env.SMTP_PORT ? '✅ Configurado' : '❌ Não configurado',
    smtp_user: process.env.SMTP_USER ? '✅ Configurado (' + process.env.SMTP_USER.substring(0, 5) + '...)' : '❌ Não configurado',
    smtp_password: process.env.SMTP_PASSWORD ? '✅ Configurado (****)' : '❌ Não configurado',
    smtp_from: process.env.SMTP_FROM ? '✅ Configurado' : '❌ Não configurado',
    smtp_secure: process.env.SMTP_SECURE || 'false',
    all_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
  };

  return NextResponse.json({
    success: true,
    message: status.all_configured ? 'Email está configurado!' : 'Email NÃO está configurado',
    status,
  });
}
