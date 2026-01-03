import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendTemplatedEmail, EmailTemplates, testEmailConfiguration } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Destinatario (to) e obrigatorio' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'project_created':
        if (!data?.projectTitle || !data?.clientName) {
          return NextResponse.json(
            { success: false, error: 'projectTitle e clientName sao obrigatorios' },
            { status: 400 }
          );
        }
        result = await sendTemplatedEmail(
          to,
          EmailTemplates.projectCreated(data.projectTitle, data.clientName)
        );
        break;

      case 'payment_received':
        if (!data?.projectTitle || !data?.amount || !data?.clientName) {
          return NextResponse.json(
            { success: false, error: 'projectTitle, amount e clientName sao obrigatorios' },
            { status: 400 }
          );
        }
        result = await sendTemplatedEmail(
          to,
          EmailTemplates.paymentReceived(data.projectTitle, data.amount, data.clientName)
        );
        break;

      case 'deadline_reminder':
        if (!data?.projectTitle || data?.daysLeft === undefined || !data?.deadline) {
          return NextResponse.json(
            { success: false, error: 'projectTitle, daysLeft e deadline sao obrigatorios' },
            { status: 400 }
          );
        }
        result = await sendTemplatedEmail(
          to,
          EmailTemplates.deadlineReminder(data.projectTitle, data.daysLeft, data.deadline)
        );
        break;

      case 'status_changed':
        if (!data?.projectTitle || !data?.oldStatus || !data?.newStatus) {
          return NextResponse.json(
            { success: false, error: 'projectTitle, oldStatus e newStatus sao obrigatorios' },
            { status: 400 }
          );
        }
        result = await sendTemplatedEmail(
          to,
          EmailTemplates.statusChanged(data.projectTitle, data.oldStatus, data.newStatus)
        );
        break;

      case 'custom':
        if (!data?.subject || (!data?.html && !data?.text)) {
          return NextResponse.json(
            { success: false, error: 'subject e html/text sao obrigatorios para emails customizados' },
            { status: 400 }
          );
        }
        result = await sendEmail({
          to,
          subject: data.subject,
          html: data.html,
          text: data.text,
        });
        break;

      case 'generic':
        if (!data?.title || !data?.message) {
          return NextResponse.json(
            { success: false, error: 'title e message sao obrigatorios' },
            { status: 400 }
          );
        }
        result = await sendTemplatedEmail(
          to,
          EmailTemplates.generic(data.title, data.message)
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de email invalido. Use: project_created, payment_received, deadline_reminder, status_changed, generic, custom' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email enviado com sucesso',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}

// GET - Test email configuration
export async function GET() {
  try {
    const result = await testEmailConfiguration();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Configuracao de email OK',
        configured: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email nao configurado ou com erro',
        error: result.error,
        configured: false,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
