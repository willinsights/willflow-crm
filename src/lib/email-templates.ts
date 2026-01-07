/**
 * Email Templates for WillFlow CRM
 * Design seguindo o estilo visual do sistema com efeito Liquid Glass
 */

// URL base do sistema em produção
const BASE_URL = 'https://will-flow.up.railway.app';
const LOGO_URL = `${BASE_URL}/logo-willflow-sistema.png`;

// Cores do sistema WillFlow
const COLORS = {
  // Backgrounds
  bgDark: '#0d0d0f',
  bgCard: '#141416',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  bgGlassStrong: 'rgba(255, 255, 255, 0.06)',

  // Primary
  purple: '#9139e4',
  purpleDark: '#7e37cc',
  purpleLight: '#a855f7',
  purpleGlow: 'rgba(145, 57, 228, 0.4)',

  // Text
  textPrimary: '#f0f0f0',
  textSecondary: '#a0a0a0',
  textMuted: '#606060',

  // Accents
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',

  // Borders - Liquid Glass effect
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  borderGlassLight: 'rgba(255, 255, 255, 0.12)',
  borderGlassHighlight: 'rgba(255, 255, 255, 0.18)',
};

// Liquid Glass Styles
const LIQUID_GLASS = {
  card: `
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid ${COLORS.borderGlass};
    border-radius: 24px;
    box-shadow:
      0 4px 24px rgba(0,0,0,0.4),
      0 1px 0 rgba(255,255,255,0.05) inset,
      0 -1px 0 rgba(0,0,0,0.2) inset;
  `,
  header: `
    background: linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleDark} 50%, rgba(100, 40, 180, 0.9) 100%);
    border-radius: 24px 24px 0 0;
    box-shadow:
      0 4px 30px ${COLORS.purpleGlow},
      0 1px 0 rgba(255,255,255,0.15) inset;
  `,
  infoBox: `
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid ${COLORS.borderGlass};
    border-radius: 16px;
    box-shadow:
      0 2px 12px rgba(0,0,0,0.2),
      0 1px 0 rgba(255,255,255,0.03) inset;
  `,
  button: `
    background: linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleDark} 100%);
    border-radius: 14px;
    box-shadow:
      0 4px 20px ${COLORS.purpleGlow},
      0 1px 0 rgba(255,255,255,0.2) inset,
      0 -2px 0 rgba(0,0,0,0.2) inset;
  `,
  iconCircle: `
    border-radius: 50%;
    box-shadow:
      0 4px 20px rgba(0,0,0,0.3),
      0 1px 0 rgba(255,255,255,0.1) inset;
  `,
};

// Base template wrapper
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WillFlow</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bgDark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, ${COLORS.bgDark} 0%, #0a0a0c 100%); min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Header component with real logo (altura fixa, largura proporcional)
function emailHeader(subtitle?: string): string {
  return `
<tr>
  <td style="${LIQUID_GLASS.header} padding: 45px 30px; text-align: center;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <img src="${LOGO_URL}" alt="WillFlow" height="70" style="display: block; margin: 0 auto 20px; height: 70px; width: auto;" />
          <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 14px; letter-spacing: 0.5px; font-style: italic;">Porque criar deve ser simples</p>
          ${subtitle ? `<p style="color: rgba(255,255,255,0.75); margin: 10px 0 0; font-size: 14px; letter-spacing: 0.5px;">${subtitle}</p>` : ''}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Footer component
function emailFooter(): string {
  return `
<tr>
  <td style="padding: 35px; text-align: center; border-top: 1px solid ${COLORS.borderGlass};">
    <img src="${LOGO_URL}" alt="WillFlow" height="35" style="display: block; margin: 0 auto 15px; height: 35px; width: auto; opacity: 0.5;" />
    <p style="color: ${COLORS.textMuted}; font-size: 12px; margin: 0 0 8px;">
      Este email foi enviado automaticamente pelo WillFlow CRM.
    </p>
    <p style="color: ${COLORS.textMuted}; font-size: 13px; margin: 0; font-style: italic;">
      Porque criar deve ser simples.
    </p>
    <p style="color: ${COLORS.textMuted}; font-size: 11px; margin: 20px 0 0;">
      <a href="${BASE_URL}" style="color: ${COLORS.purpleLight}; text-decoration: none;">will-flow.up.railway.app</a>
    </p>
  </td>
</tr>`;
}

// Button component with Liquid Glass
function emailButton(text: string, url: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
  <tr>
    <td style="${LIQUID_GLASS.button}">
      <a href="${url}" style="display: inline-block; padding: 16px 36px; color: white; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// Info box component with Liquid Glass
function infoBox(content: string, accentColor: string = COLORS.purple): string {
  return `
<div style="${LIQUID_GLASS.infoBox} border-left: 3px solid ${accentColor}; padding: 24px; margin: 28px 0;">
  ${content}
</div>`;
}

// Alert box component with Liquid Glass
function alertBox(content: string, type: 'warning' | 'error' | 'success' = 'warning'): string {
  const colors = {
    warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', text: COLORS.yellow, icon: '⚠️' },
    error: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)', text: COLORS.red, icon: '🔒' },
    success: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', text: COLORS.green, icon: '✓' },
  };
  const c = colors[type];

  return `
<div style="background: linear-gradient(135deg, ${c.bg} 0%, transparent 100%); border: 1px solid ${c.border}; border-radius: 14px; padding: 18px; margin: 24px 0; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <p style="color: ${c.text}; margin: 0; font-size: 14px; line-height: 1.5;">
    ${c.icon} ${content}
  </p>
</div>`;
}

// Credential row
function credentialRow(label: string, value: string, isPassword: boolean = false): string {
  return `
<tr>
  <td style="padding: 10px 0;">
    <span style="color: ${COLORS.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${label}</span>
    <div style="color: ${COLORS.textPrimary}; font-size: 16px; margin-top: 6px; ${isPassword ? `background: linear-gradient(135deg, rgba(145,57,228,0.1) 0%, rgba(145,57,228,0.05) 100%); padding: 10px 14px; border-radius: 10px; font-family: 'SF Mono', Monaco, monospace; display: inline-block; border: 1px solid rgba(145,57,228,0.2);` : ''}">${value}</div>
  </td>
</tr>`;
}

// Status badge with Liquid Glass
function statusBadge(status: string, color: string): string {
  return `<span style="display: inline-block; background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 10px ${color}40;">${status}</span>`;
}

// Icon circle with Liquid Glass
function iconCircle(emoji: string, bgColor: string, size: number = 64): string {
  return `
<div style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}88 100%); ${LIQUID_GLASS.iconCircle} margin: 0 auto; display: flex; align-items: center; justify-content: center;">
  <span style="font-size: ${size * 0.45}px; line-height: ${size}px; display: block; text-align: center; width: 100%;">${emoji}</span>
</div>`;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export const WillFlowEmailTemplates = {
  /**
   * Email de boas-vindas com credenciais
   */
  welcome: (name: string, email: string, password: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <h2 style="color: ${COLORS.purple}; margin: 0 0 16px; font-size: 26px; font-weight: 700;">
            Bem-vindo ao WillFlow, ${name}! 👋
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
            A sua conta foi criada com sucesso. Agora pode gerir os seus projetos audiovisuais de forma simples e eficiente.
          </p>

          ${infoBox(`
            <p style="color: ${COLORS.textSecondary}; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px; font-weight: 600;">Credenciais de Acesso</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Email', email)}
              ${credentialRow('Senha', password, true)}
            </table>
          `)}

          ${alertBox('<strong>Importante:</strong> Por segurança, altere a sua senha no primeiro acesso.')}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Aceder ao WillFlow', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: 'Bem-vindo ao WillFlow CRM! 🎬',
      html,
      text: `Bem-vindo ao WillFlow, ${name}!\n\nA sua conta foi criada com sucesso.\n\nCredenciais:\nEmail: ${email}\nSenha: ${password}\n\nPor segurança, altere a sua senha no primeiro acesso.\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de confirmação de alteração de senha
   */
  passwordChanged: (name: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('✓', 'rgba(16, 185, 129, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.green}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Senha Alterada com Sucesso
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            Olá ${name}, a sua senha foi alterada com sucesso no WillFlow CRM.
          </p>

          ${alertBox('<strong>Não foi você?</strong> Se não fez esta alteração, entre em contacto imediatamente com o administrador.', 'error')}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Aceder ao WillFlow', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: 'Senha Alterada - WillFlow CRM',
      html,
      text: `Olá ${name},\n\nA sua senha foi alterada com sucesso no WillFlow CRM.\n\nSe não fez esta alteração, entre em contacto imediatamente com o administrador.`,
    };
  },

  /**
   * Email de redefinição de senha
   */
  passwordReset: (name: string, email: string, newPassword: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('🔑', 'rgba(145, 57, 228, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.purple}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Redefinição de Senha
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            Olá ${name}, a sua senha foi redefinida conforme solicitado.
          </p>

          ${infoBox(`
            <p style="color: ${COLORS.textSecondary}; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px; font-weight: 600;">Nova Senha de Acesso</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Email', email)}
              ${credentialRow('Nova Senha', newPassword, true)}
            </table>
          `)}

          ${alertBox('<strong>Importante:</strong> Por segurança, altere a sua senha no próximo acesso.')}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Aceder ao WillFlow', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: 'Nova Senha - WillFlow CRM 🔑',
      html,
      text: `Olá ${name},\n\nA sua senha foi redefinida conforme solicitado.\n\nNova senha: ${newPassword}\n\nPor segurança, altere a sua senha no próximo acesso.\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de novo projeto criado
   */
  projectCreated: (projectTitle: string, clientName: string, assignedTo: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('🎬', 'rgba(59, 130, 246, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.blue}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Novo Projeto Criado
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            Um novo projeto foi atribuído a você no WillFlow CRM.
          </p>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Projeto', projectTitle)}
              ${credentialRow('Cliente', clientName)}
              ${credentialRow('Atribuído a', assignedTo)}
            </table>
          `, COLORS.blue)}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Projeto', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `Novo Projeto: ${projectTitle} - WillFlow 🎬`,
      html,
      text: `Novo Projeto Criado\n\nProjeto: ${projectTitle}\nCliente: ${clientName}\nAtribuído a: ${assignedTo}\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de projeto finalizado
   */
  projectCompleted: (projectTitle: string, clientName: string, completedBy: string, completedDate: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('🎉', 'rgba(16, 185, 129, 0.2)', 80)}
          </div>

          <h2 style="color: ${COLORS.green}; margin: 0 0 16px; font-size: 30px; font-weight: 800; text-align: center;">
            Projeto Finalizado!
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            Parabéns! O projeto foi concluído com sucesso.
          </p>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Projeto', projectTitle)}
              ${credentialRow('Cliente', clientName)}
              ${credentialRow('Finalizado por', completedBy)}
              ${credentialRow('Data de Conclusão', completedDate)}
            </table>
          `, COLORS.green)}

          ${alertBox('O projeto foi movido para a lista de finalizados.', 'success')}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Projeto', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `🎉 Projeto Finalizado: ${projectTitle} - WillFlow`,
      html,
      text: `Projeto Finalizado!\n\nProjeto: ${projectTitle}\nCliente: ${clientName}\nFinalizado por: ${completedBy}\nData: ${completedDate}\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de alteração de status do projeto
   */
  statusChanged: (projectTitle: string, oldStatus: string, newStatus: string, changedBy: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('📋', 'rgba(145, 57, 228, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.purple}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Status Atualizado
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            O status do projeto <strong style="color: ${COLORS.purpleLight};">${projectTitle}</strong> foi alterado.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
              <tr>
                <td style="padding: 0 12px;">
                  ${statusBadge(oldStatus, COLORS.textMuted)}
                </td>
                <td style="padding: 0 12px; color: ${COLORS.textSecondary}; font-size: 20px;">
                  →
                </td>
                <td style="padding: 0 12px;">
                  ${statusBadge(newStatus, COLORS.purple)}
                </td>
              </tr>
            </table>
          </div>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Alterado por', changedBy)}
            </table>
          `)}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Projeto', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `Status Atualizado: ${projectTitle} - WillFlow`,
      html,
      text: `Status Atualizado\n\nProjeto: ${projectTitle}\nDe: ${oldStatus}\nPara: ${newStatus}\nAlterado por: ${changedBy}\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de lembrete de prazo
   */
  deadlineReminder: (projectTitle: string, daysLeft: number, deadline: string) => {
    const isUrgent = daysLeft <= 1;
    const iconBg = isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
    const titleColor = isUrgent ? COLORS.red : COLORS.yellow;

    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle(isUrgent ? '🚨' : '⏰', iconBg)}
          </div>

          <h2 style="color: ${titleColor}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            ${daysLeft === 0 ? 'Prazo Vence HOJE!' : daysLeft === 1 ? 'Prazo Vence Amanhã!' : `Prazo em ${daysLeft} dias`}
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            O projeto abaixo tem prazo de entrega próximo.
          </p>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Projeto', projectTitle)}
              ${credentialRow('Data de Entrega', deadline)}
            </table>
          `, titleColor)}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Projeto', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `${isUrgent ? '🚨 URGENTE: ' : '⏰ '}Prazo: ${projectTitle} - WillFlow`,
      html,
      text: `Lembrete de Prazo\n\nProjeto: ${projectTitle}\nData de Entrega: ${deadline}\n${daysLeft === 0 ? 'VENCE HOJE!' : `Vence em ${daysLeft} dias`}\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de pagamento recebido
   */
  paymentReceived: (projectTitle: string, clientName: string, amount: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('💰', 'rgba(16, 185, 129, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.green}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Pagamento Recebido!
          </h2>

          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 42px; font-weight: 800; color: ${COLORS.green}; text-shadow: 0 2px 20px rgba(16,185,129,0.3);">${amount}</span>
          </div>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Projeto', projectTitle)}
              ${credentialRow('Cliente', clientName)}
            </table>
          `, COLORS.green)}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Detalhes', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `💰 Pagamento Recebido: ${amount} - WillFlow`,
      html,
      text: `Pagamento Recebido!\n\nValor: ${amount}\nProjeto: ${projectTitle}\nCliente: ${clientName}\n\nAceda em: ${BASE_URL}`,
    };
  },

  /**
   * Email de pagamento pendente a freelancer
   */
  freelancerPaymentDue: (freelancerName: string, projectTitle: string, amount: string, dueDate: string) => {
    const html = emailWrapper(`
      ${emailHeader()}
      <tr>
        <td style="${LIQUID_GLASS.card} background: ${COLORS.bgCard}; padding: 45px 35px; border-radius: 0 0 24px 24px;">
          <div style="text-align: center; margin-bottom: 28px;">
            ${iconCircle('💵', 'rgba(59, 130, 246, 0.2)')}
          </div>

          <h2 style="color: ${COLORS.blue}; margin: 0 0 16px; font-size: 26px; font-weight: 700; text-align: center;">
            Pagamento a Processar
          </h2>
          <p style="color: ${COLORS.textPrimary}; font-size: 15px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
            Olá ${freelancerName}, existe um pagamento pendente para si.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 38px; font-weight: 800; color: ${COLORS.blue}; text-shadow: 0 2px 20px rgba(59,130,246,0.3);">${amount}</span>
          </div>

          ${infoBox(`
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              ${credentialRow('Projeto', projectTitle)}
              ${credentialRow('Data Prevista', dueDate)}
            </table>
          `, COLORS.blue)}

          <div style="text-align: center; margin-top: 36px;">
            ${emailButton('Ver Detalhes', BASE_URL)}
          </div>

          ${emailFooter()}
        </td>
      </tr>
    `);

    return {
      subject: `💵 Pagamento Pendente: ${amount} - WillFlow`,
      html,
      text: `Pagamento Pendente\n\nOlá ${freelancerName},\n\nValor: ${amount}\nProjeto: ${projectTitle}\nData Prevista: ${dueDate}\n\nAceda em: ${BASE_URL}`,
    };
  },
};

export default WillFlowEmailTemplates;
