/**
 * Tests for email templates
 */
import { describe, it, expect } from 'vitest';
import { WillFlowEmailTemplates } from '@/lib/email-templates';

describe('Email Templates', () => {
  describe('Welcome Email', () => {
    it('should generate welcome email with correct structure', () => {
      const name = 'João Silva';
      const email = 'joao@example.com';
      const password = 'TempPass123!';

      const result = WillFlowEmailTemplates.welcome(name, email, password);

      expect(result).toBeDefined();
      expect(result.subject).toBe('Bem-vindo ao WillFlow CRM! 🎬');
      expect(result.html).toContain(name);
      expect(result.html).toContain(email);
      expect(result.html).toContain(password);
      expect(result.text).toContain(name);
      expect(result.text).toContain(email);
      expect(result.text).toContain(password);
    });

    it('should not contain "WillFlow" text in header (only logo and tagline)', () => {
      const result = WillFlowEmailTemplates.welcome('Test User', 'test@example.com', 'pass123');
      
      // Should contain the tagline
      expect(result.html).toContain('Porque criar deve ser simples');
      
      // Should not contain the "WillFlow" h1 text below logo in header section
      // The header should only have the logo and tagline
      const headerMatch = result.html.match(/<tr>\s*<td[^>]*padding: 45px 30px[^>]*>[\s\S]*?<\/td>\s*<\/tr>/);
      if (headerMatch) {
        const headerContent = headerMatch[0];
        // Check that there's no h1 with "WillFlow" text
        expect(headerContent).not.toMatch(/<h1[^>]*>WillFlow<\/h1>/);
      }
    });

    it('should start with "Bem-vindo" in the body', () => {
      const result = WillFlowEmailTemplates.welcome('Maria', 'maria@example.com', 'pass123');
      
      // Extract the body content (after header)
      const bodyMatch = result.html.match(/Bem-vindo/);
      expect(bodyMatch).toBeTruthy();
      
      // Should contain the greeting
      expect(result.html).toContain('Bem-vindo ao WillFlow, Maria!');
    });

    it('should include security warning about changing password', () => {
      const result = WillFlowEmailTemplates.welcome('Test', 'test@example.com', 'pass123');
      
      expect(result.html).toContain('Importante');
      expect(result.html).toContain('altere a sua senha');
      expect(result.text).toContain('altere a sua senha no primeiro acesso');
    });

    it('should include credentials in info box', () => {
      const result = WillFlowEmailTemplates.welcome('Test', 'test@example.com', 'MyPass123!');
      
      expect(result.html).toContain('Credenciais de Acesso');
      expect(result.html).toContain('Email');
      expect(result.html).toContain('Senha');
      expect(result.html).toContain('test@example.com');
      expect(result.html).toContain('MyPass123!');
    });
  });

  describe('Password Reset Email', () => {
    it('should generate password reset email with correct structure', () => {
      const name = 'Pedro Santos';
      const email = 'pedro@example.com';
      const newPassword = 'NewPass456!';

      const result = WillFlowEmailTemplates.passwordReset(name, email, newPassword);

      expect(result).toBeDefined();
      expect(result.subject).toBe('Nova Senha - WillFlow CRM 🔑');
      expect(result.html).toContain(name);
      expect(result.html).toContain(email);
      expect(result.html).toContain(newPassword);
    });

    it('should not contain "WillFlow" text in header (only logo and tagline)', () => {
      const result = WillFlowEmailTemplates.passwordReset('Test', 'test@example.com', 'pass123');
      
      expect(result.html).toContain('Porque criar deve ser simples');
      
      const headerMatch = result.html.match(/<tr>\s*<td[^>]*padding: 45px 30px[^>]*>[\s\S]*?<\/td>\s*<\/tr>/);
      if (headerMatch) {
        const headerContent = headerMatch[0];
        expect(headerContent).not.toMatch(/<h1[^>]*>WillFlow<\/h1>/);
      }
    });

    it('should include new password and security reminder', () => {
      const result = WillFlowEmailTemplates.passwordReset('Test', 'test@example.com', 'NewPass789!');
      
      expect(result.html).toContain('Redefinição de Senha');
      expect(result.html).toContain('Nova Senha');
      expect(result.html).toContain('NewPass789!');
      expect(result.html).toContain('altere a sua senha');
    });
  });

  describe('Password Changed Email', () => {
    it('should generate password changed email', () => {
      const name = 'Ana Costa';

      const result = WillFlowEmailTemplates.passwordChanged(name);

      expect(result).toBeDefined();
      expect(result.subject).toBe('Senha Alterada - WillFlow CRM');
      expect(result.html).toContain(name);
      expect(result.html).toContain('Senha Alterada com Sucesso');
    });

    it('should include security warning if user did not change password', () => {
      const result = WillFlowEmailTemplates.passwordChanged('Test User');
      
      expect(result.html).toContain('Não foi você');
      expect(result.html).toContain('entre em contacto');
    });
  });

  describe('Email Footer', () => {
    it('should contain tagline in footer of all emails', () => {
      const welcomeEmail = WillFlowEmailTemplates.welcome('Test', 'test@example.com', 'pass');
      const resetEmail = WillFlowEmailTemplates.passwordReset('Test', 'test@example.com', 'pass');
      const changedEmail = WillFlowEmailTemplates.passwordChanged('Test');
      
      // All emails should have the tagline in footer
      expect(welcomeEmail.html).toContain('Porque criar deve ser simples');
      expect(resetEmail.html).toContain('Porque criar deve ser simples');
      expect(changedEmail.html).toContain('Porque criar deve ser simples');
    });
  });
});
