import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnhancedButton } from '@/components/ui/enhanced-button';

describe('EnhancedButton', () => {
  it('deve renderizar o botão com texto', () => {
    render(<EnhancedButton>Clique aqui</EnhancedButton>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve mostrar loading spinner quando loading=true', () => {
    render(<EnhancedButton loading={true}>Salvar</EnhancedButton>);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve mostrar texto customizado de loading', () => {
    render(
      <EnhancedButton loading={true} loadingText="Salvando dados...">
        Salvar
      </EnhancedButton>
    );
    expect(screen.getByText('Salvando dados...')).toBeInTheDocument();
  });

  it('deve estar desabilitado quando loading=true', () => {
    render(<EnhancedButton loading={true}>Salvar</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deve estar desabilitado quando disabled=true', () => {
    render(<EnhancedButton disabled={true}>Salvar</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('deve aplicar className customizado', () => {
    render(<EnhancedButton className="custom-class">Botão</EnhancedButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
