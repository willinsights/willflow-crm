import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('API /api/clients', () => {
  const baseUrl = 'http://localhost:3000';

  describe('POST /api/clients/[id]/communications', () => {
    it('deve criar uma comunicação', async () => {
      const clientId = 'test-client-1';
      const communication = {
        type: 'email',
        subject: 'Proposta Comercial',
        content: 'Segue proposta em anexo',
        status: 'pending',
      };

      const response = await fetch(`${baseUrl}/api/clients/${clientId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communication),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.communication).toBeDefined();
      expect(data.communication.subject).toBe('Proposta Comercial');
    });

    it('deve retornar erro se faltar campos obrigatórios', async () => {
      const clientId = 'test-client-1';
      const communication = {
        content: 'Sem tipo e assunto',
      };

      const response = await fetch(`${baseUrl}/api/clients/${clientId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communication),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('obrigatórios');
    });
  });

  describe('POST /api/clients/[id]/notes', () => {
    it('deve criar uma nota', async () => {
      const clientId = 'test-client-1';
      const note = {
        content: 'Cliente interessado em pacote premium',
        createdBy: 'admin',
      };

      const response = await fetch(`${baseUrl}/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.note).toBeDefined();
      expect(data.note.content).toBe('Cliente interessado em pacote premium');
    });

    it('deve retornar erro se conteúdo estiver vazio', async () => {
      const clientId = 'test-client-1';
      const note = {
        content: '',
      };

      const response = await fetch(`${baseUrl}/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('obrigatório');
    });
  });
});

describe('API /api/projects/[id]/budget', () => {
  const baseUrl = 'http://localhost:3000';

  describe('POST /api/projects/[id]/budget', () => {
    it('deve criar um item de orçamento', async () => {
      const projectId = 'test-project-1';
      const budgetItem = {
        category: 'equipamento',
        description: 'Camera Sony A7S III',
        quantity: 1,
        unitPrice: 500,
        phase: 'captacao',
      };

      const response = await fetch(`${baseUrl}/api/projects/${projectId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetItem),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.budgetItem).toBeDefined();
      expect(data.budgetItem.total).toBe(500);
    });

    it('deve calcular total corretamente', async () => {
      const projectId = 'test-project-1';
      const budgetItem = {
        category: 'equipe',
        description: 'Freelancer Fotografia',
        quantity: 2,
        unitPrice: 300,
        phase: 'captacao',
      };

      const response = await fetch(`${baseUrl}/api/projects/${projectId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetItem),
      });

      const data = await response.json();

      expect(data.budgetItem.total).toBe(600);
    });
  });
});
