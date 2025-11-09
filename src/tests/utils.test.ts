import { describe, it, expect } from 'vitest';
import { formatCurrency, formatFileSize } from '@/lib/utils';

describe('formatCurrency', () => {
  it('deve formatar valores corretamente', () => {
    expect(formatCurrency(1000)).toBe('€1.000');
    expect(formatCurrency(1234)).toBe('€1.234');
    expect(formatCurrency(0)).toBe('€0');
  });

  it('deve formatar valores decimais', () => {
    expect(formatCurrency(1234.56)).toBe('€1.234.56');
    expect(formatCurrency(100.5)).toBe('€100.5');
  });

  it('deve lidar com valores negativos', () => {
    expect(formatCurrency(-500)).toBe('€-500');
  });

  it('deve lidar com valores grandes', () => {
    expect(formatCurrency(1000000)).toBe('€1.000.000');
  });
});

describe('formatFileSize', () => {
  it('deve formatar tamanhos de arquivo corretamente', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('deve arredondar para 2 casas decimais', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2097152)).toBe('2 MB');
  });
});
