import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickActions from '@/components/layout/QuickActions';

// Mock the child components
vi.mock('@/components/projects/CreateProjectModal', () => ({
  default: ({ isOpen, onOpenChange, children }: any) => (
    <div data-testid="create-project-modal" data-open={isOpen}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/clients/CreateClientModal', () => ({
  default: ({ isOpen, onOpenChange, children }: any) => (
    <div data-testid="create-client-modal" data-open={isOpen}>
      {children}
    </div>
  ),
}));

describe('QuickActions', () => {
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  it('deve renderizar o botão de ações rápidas', () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    expect(button).toBeInTheDocument();
  });

  it('deve abrir o painel ao clicar no botão', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Atalhos para agilizar seu trabalho')).toBeInTheDocument();
    });
  });

  it('deve fechar o painel ao clicar no botão X', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    // Abrir
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    });
    
    // Fechar
    const closeButton = screen.getByLabelText('Fechar');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      const panel = screen.queryByText('Atalhos para agilizar seu trabalho');
      expect(panel).not.toBeVisible();
    });
  });

  it('deve exibir todas as ações rápidas', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
      expect(screen.getByText('Calendário')).toBeInTheDocument();
      expect(screen.getByText('Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Categorias')).toBeInTheDocument();
    });
  });

  it('deve chamar onViewChange ao clicar em Calendário', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Calendário')).toBeInTheDocument();
    });
    
    const calendarButton = screen.getByText('Calendário').closest('button');
    if (calendarButton) {
      fireEvent.click(calendarButton);
      expect(mockOnViewChange).toHaveBeenCalledWith('calendario');
    }
  });

  it('deve chamar onViewChange ao clicar em Relatórios', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Relatórios')).toBeInTheDocument();
    });
    
    const reportsButton = screen.getByText('Relatórios').closest('button');
    if (reportsButton) {
      fireEvent.click(reportsButton);
      expect(mockOnViewChange).toHaveBeenCalledWith('relatorios');
    }
  });

  it('deve chamar onViewChange ao clicar em Categorias', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Categorias')).toBeInTheDocument();
    });
    
    const categoriesButton = screen.getByText('Categorias').closest('button');
    if (categoriesButton) {
      fireEvent.click(categoriesButton);
      expect(mockOnViewChange).toHaveBeenCalledWith('categorias');
    }
  });

  it('deve abrir modal de novo projeto ao clicar na ação', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
    });
    
    const projectButton = screen.getByText('Novo Projeto').closest('button');
    if (projectButton) {
      fireEvent.click(projectButton);
      
      await waitFor(() => {
        const modal = screen.getByTestId('create-project-modal');
        expect(modal).toHaveAttribute('data-open', 'true');
      });
    }
  });

  it('deve abrir modal de novo cliente ao clicar na ação', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    });
    
    const clientButton = screen.getByText('Novo Cliente').closest('button');
    if (clientButton) {
      fireEvent.click(clientButton);
      
      await waitFor(() => {
        const modal = screen.getByTestId('create-client-modal');
        expect(modal).toHaveAttribute('data-open', 'true');
      });
    }
  });

  it('deve fechar ao pressionar ESC', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    const button = screen.getByLabelText('Ações Rápidas');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    await waitFor(() => {
      const panel = screen.queryByText('Atalhos para agilizar seu trabalho');
      expect(panel).not.toBeVisible();
    });
  });

  it('deve alternar aberto/fechado com Ctrl+K', async () => {
    render(<QuickActions onViewChange={mockOnViewChange} />);
    
    // Abrir com Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    await waitFor(() => {
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
    });
    
    // Fechar com Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    await waitFor(() => {
      const panel = screen.queryByText('Atalhos para agilizar seu trabalho');
      expect(panel).not.toBeVisible();
    });
  });
});
