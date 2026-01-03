import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { WillFlowEmailTemplates } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const { to, name, password, type } = await request.json();

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Email destinatário é obrigatório' },
        { status: 400 }
      );
    }

    const testName = name || 'Utilizador Teste';
    const testPassword = password || 'SenhaTemporaria123!';
    const emailType = type || 'welcome';

    let template;

    switch (emailType) {
      case 'welcome':
        template = WillFlowEmailTemplates.welcome(testName, to, testPassword);
        break;
      case 'password-changed':
        template = WillFlowEmailTemplates.passwordChanged(testName);
        break;
      case 'password-reset':
        template = WillFlowEmailTemplates.passwordReset(testName, to, testPassword);
        break;
      case 'project-created':
        template = WillFlowEmailTemplates.projectCreated('Vídeo Corporativo', 'Empresa XYZ', testName);
        break;
      case 'project-completed':
        template = WillFlowEmailTemplates.projectCompleted('Vídeo Institucional', 'Cliente ABC', testName, '02/01/2026');
        break;
      case 'status-changed':
        template = WillFlowEmailTemplates.statusChanged('Vídeo Promocional', 'Em Captação', 'Em Edição', testName);
        break;
      case 'deadline':
        template = WillFlowEmailTemplates.deadlineReminder('Vídeo Promocional', 2, '04/01/2026');
        break;
      case 'deadline-urgent':
        template = WillFlowEmailTemplates.deadlineReminder('Vídeo Urgente', 0, '02/01/2026');
        break;
      case 'payment':
        template = WillFlowEmailTemplates.paymentReceived('Vídeo Institucional', 'Cliente ABC', '€ 2.500,00');
        break;
      case 'freelancer-payment':
        template = WillFlowEmailTemplates.freelancerPaymentDue(testName, 'Vídeo Corporativo', '€ 500,00', '10/01/2026');
        break;
      default:
        template = WillFlowEmailTemplates.welcome(testName, to, testPassword);
    }

    const result = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      message: result.success ? 'Email enviado com sucesso!' : 'Falha ao enviar email',
      type: emailType,
    });

  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}

// GET para teste rápido via browser
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');
  const type = searchParams.get('type') || 'welcome';

  if (!to) {
    return NextResponse.json({
      success: false,
      error: 'Adicione ?to=email@exemplo.com para testar',
      usage: '/api/test-email?to=seu@email.com&type=welcome',
      types: ['welcome', 'password-changed', 'password-reset', 'project-created', 'project-completed', 'status-changed', 'deadline', 'deadline-urgent', 'payment', 'freelancer-payment'],
    });
  }

  // Criar request para POST
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ to, name: 'William', password: 'SenhaTemporaria123!', type }),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST(postRequest);
}
