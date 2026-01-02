import { Client, User, Project, Category } from './types';

// Usuário administrador inicial
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@in-sights.pt',
    role: 'admin',
    canViewFinance: true,
    canEditProjects: true,
    canViewAllProjects: true
  }
];

// Sistema inicia sem dados - todos vazios
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Hotel Sol & Mar',
    email: 'contato@hotelsolemar.pt',
    phone: '+351 210 123 456',
    company: 'Sol & Mar Hotéis, Lda',
    totalRevenue: 4300,
    totalCosts: 1700,
    totalMargin: 2600,
    projectCount: 2,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date()
  },
  {
    id: 'client-2',
    name: 'TechStart Solutions',
    email: 'hello@techstart.pt',
    phone: '+351 220 987 654',
    company: 'TechStart Solutions, S.A.',
    totalRevenue: 1200,
    totalCosts: 600,
    totalMargin: 600,
    projectCount: 1,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date()
  },
  {
    id: 'client-3',
    name: 'Restaurante Sabores',
    email: 'info@restaurantesabores.pt',
    phone: '+351 215 555 789',
    company: 'Sabores Gastronómicos, Lda',
    totalRevenue: 0,
    totalCosts: 0,
    totalMargin: 0,
    projectCount: 0,
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date()
  }
];
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Campanha de Verão 2025',
    clientId: 'client-1',
    videoType: 'outro',
    categoryId: 'cat-video-1',
    location: 'Lisboa, Portugal',
    description: 'Vídeo promocional para a campanha de verão',
    phase: 'edicao',
    statusCaptacao: 'concluido',
    statusEdicao: 'em-edicao',
    responsavelCaptacaoId: 'admin-1',
    responsavelEdicaoId: 'admin-1',
    clientPrice: 2500,
    captationCost: 800,
    editionCost: 600,
    margin: 1100,
    paymentStatus: 'a-faturar',
    freelancerPaymentStatus: 'a-pagar',
    clientDueDate: new Date('2025-12-15'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date(),
    subtasks: []
  },
  {
    id: 'proj-2',
    title: 'Sessão Fotográfica de Produto',
    clientId: 'client-2',
    videoType: 'outro',
    categoryId: 'cat-photo-1',
    location: 'Porto, Portugal',
    description: 'Fotos profissionais para catálogo de produtos',
    phase: 'captacao',
    statusCaptacao: 'agendado',
    responsavelCaptacaoId: 'admin-1',
    clientPrice: 1200,
    captationCost: 400,
    editionCost: 200,
    margin: 600,
    paymentStatus: 'a-faturar',
    freelancerPaymentStatus: 'a-pagar',
    clientDueDate: new Date('2025-12-20'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date(),
    subtasks: []
  },
  {
    id: 'proj-3',
    title: 'Criação de Logo e Identidade Visual',
    clientId: 'client-1',
    videoType: 'outro',
    categoryId: 'cat-design-1',
    description: 'Design completo de identidade visual',
    phase: 'edicao',
    statusCaptacao: 'concluido',
    statusEdicao: 'feedback',
    responsavelEdicaoId: 'admin-1',
    clientPrice: 1800,
    captationCost: 0,
    editionCost: 900,
    margin: 900,
    paymentStatus: 'a-faturar',
    freelancerPaymentStatus: 'a-pagar',
    clientDueDate: new Date('2025-12-10'),
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date(),
    subtasks: []
  }
];
export const mockCategories: Category[] = [
  {
    id: 'cat-video-1',
    name: 'Vídeo',
    description: 'Produção de vídeos corporativos, publicitários e eventos',
    color: '#8b5cf6',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'cat-photo-1',
    name: 'Fotografia',
    description: 'Sessões fotográficas para produtos, eventos e retratos',
    color: '#f59e0b',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'cat-design-1',
    name: 'Design Gráfico',
    description: 'Criação de materiais gráficos e identidade visual',
    color: '#ec4899',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'cat-animation-1',
    name: 'Animação',
    description: 'Motion graphics e animações 2D/3D',
    color: '#14b8a6',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'cat-live-1',
    name: 'Transmissão ao Vivo',
    description: 'Streaming de eventos e webinars',
    color: '#ef4444',
    createdAt: new Date('2024-01-01')
  }
];

// Labels para status
export const statusLabels: Record<string, string> = {
  // Captação
  'agendado': 'Agendado',
  'em-gravacao': 'Em Gravação',
  'upload-nas': 'Upload NAS',
  'concluido': 'Concluído',
  // Edição
  'receber-ficheiros': 'Receber Ficheiros',
  'decupagem': 'Decupagem',
  'em-edicao': 'Em Edição',
  'feedback': 'Feedback',
  'revisao-cliente': 'Revisão Cliente',
  'entregue': 'Entregue',
  'finalizado': 'Finalizado'
};

// Labels para tipos de vídeo
export const videoTypeLabels: Record<string, string> = {
  'hotel': 'Hotel',
  'experiencia': 'Experiência',
  'drone': 'Drone',
  'reels': 'Reels',
  'outro': 'Outro'
};

// Labels para roles de usuário
export const roleLabels: Record<string, string> = {
  'admin': 'Administrador',
  'editor': 'Editor',
  'freelancer': 'Freelancer'
};

// Transições permitidas de status
export const statusTransitions: Record<string, string[]> = {
  // Captação
  'agendado': ['em-gravacao'],
  'em-gravacao': ['agendado', 'upload-nas'],
  'upload-nas': ['em-gravacao', 'concluido'],
  'concluido': ['upload-nas'], // Pode voltar para correções

  // Edição
  'receber-ficheiros': ['decupagem'],
  'decupagem': ['receber-ficheiros', 'em-edicao'],
  'em-edicao': ['decupagem', 'feedback'],
  'feedback': ['em-edicao', 'revisao-cliente'],
  'revisao-cliente': ['feedback', 'entregue', 'em-edicao'], // Pode voltar para ajustes
  'entregue': ['revisao-cliente'] // Pode voltar se necessário
};
