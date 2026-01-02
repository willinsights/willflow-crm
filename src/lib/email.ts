/**
 * Email Utility for WillFlow CRM
 * Uses Gmail SMTP for sending emails
 */

import nodemailer from 'nodemailer';

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '', // App Password for Gmail
  },
  from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
};

// Create transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.auth.user,
      pass: EMAIL_CONFIG.auth.pass,
    },
  });
}

// Email types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

// Send email function
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if email is configured
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    console.warn('Email not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

// Email templates
export const EmailTemplates = {
  // Project created notification
  projectCreated: (projectTitle: string, clientName: string) => ({
    subject: 'Novo Projeto Criado - WillFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9139e4, #7e37cc); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">WillFlow</h1>
        </div>
        <div style="background: #1a1a1a; color: #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #9139e4;">Novo Projeto Criado</h2>
          <p>Um novo projeto foi criado no sistema:</p>
          <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Projeto:</strong> ${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Este email foi enviado automaticamente pelo WillFlow CRM.
          </p>
        </div>
      </div>
    `,
    text: `Novo Projeto Criado - WillFlow\n\nProjeto: ${projectTitle}\nCliente: ${clientName}`,
  }),

  // Payment received notification
  paymentReceived: (projectTitle: string, amount: string, clientName: string) => ({
    subject: 'Pagamento Recebido - WillFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">WillFlow</h1>
        </div>
        <div style="background: #1a1a1a; color: #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #10b981;">Pagamento Recebido</h2>
          <p>Um pagamento foi registrado no sistema:</p>
          <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Projeto:</strong> ${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
            <p style="margin: 5px 0; font-size: 24px; color: #10b981;"><strong>${amount}</strong></p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Este email foi enviado automaticamente pelo WillFlow CRM.
          </p>
        </div>
      </div>
    `,
    text: `Pagamento Recebido - WillFlow\n\nProjeto: ${projectTitle}\nCliente: ${clientName}\nValor: ${amount}`,
  }),

  // Deadline reminder
  deadlineReminder: (projectTitle: string, daysLeft: number, deadline: string) => ({
    subject: `Prazo Proximo: ${projectTitle} - WillFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">WillFlow</h1>
        </div>
        <div style="background: #1a1a1a; color: #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #f59e0b;">Prazo Proximo</h2>
          <p>Um projeto tem prazo se aproximando:</p>
          <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Projeto:</strong> ${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>Prazo:</strong> ${deadline}</p>
            <p style="margin: 5px 0; font-size: 18px; color: #f59e0b;">
              <strong>${daysLeft === 0 ? 'Vence HOJE!' : daysLeft === 1 ? 'Vence amanha!' : 'Vence em ' + daysLeft + ' dias'}</strong>
            </p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Este email foi enviado automaticamente pelo WillFlow CRM.
          </p>
        </div>
      </div>
    `,
    text: `Prazo Proximo - WillFlow\n\nProjeto: ${projectTitle}\nPrazo: ${deadline}\n${daysLeft === 0 ? 'Vence HOJE!' : 'Vence em ' + daysLeft + ' dias'}`,
  }),

  // Status change notification
  statusChanged: (projectTitle: string, oldStatus: string, newStatus: string) => ({
    subject: `Status Atualizado: ${projectTitle} - WillFlow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9139e4, #7e37cc); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">WillFlow</h1>
        </div>
        <div style="background: #1a1a1a; color: #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #9139e4;">Status Atualizado</h2>
          <p>O status de um projeto foi alterado:</p>
          <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Projeto:</strong> ${projectTitle}</p>
            <p style="margin: 5px 0;"><strong>De:</strong> ${oldStatus}</p>
            <p style="margin: 5px 0;"><strong>Para:</strong> <span style="color: #9139e4;">${newStatus}</span></p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Este email foi enviado automaticamente pelo WillFlow CRM.
          </p>
        </div>
      </div>
    `,
    text: `Status Atualizado - WillFlow\n\nProjeto: ${projectTitle}\nDe: ${oldStatus}\nPara: ${newStatus}`,
  }),

  // Generic notification
  generic: (title: string, message: string) => ({
    subject: title + ' - WillFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #9139e4, #7e37cc); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">WillFlow</h1>
        </div>
        <div style="background: #1a1a1a; color: #e0e0e0; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #9139e4;">${title}</h2>
          <p>${message}</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Este email foi enviado automaticamente pelo WillFlow CRM.
          </p>
        </div>
      </div>
    `,
    text: title + '\n\n' + message,
  }),
};

// Helper function to send templated emails
export async function sendTemplatedEmail(
  to: string | string[],
  template: { subject: string; html: string; text: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// Test email configuration
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default {
  send: sendEmail,
  sendTemplated: sendTemplatedEmail,
  templates: EmailTemplates,
  testConfig: testEmailConfiguration,
};
