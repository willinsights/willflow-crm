export type ProjectStatus =
  | 'agendado'
  | 'em-gravacao'
  | 'upload-nas'
  | 'concluido'
  | 'receber-ficheiros'
  | 'decupagem'
  | 'em-edicao'
  | 'feedback'
  | 'revisao-cliente'
  | 'entregue'
  | 'finalizado';

// Novos status separados por fase
export type StatusCaptacao = 'agendado' | 'em-gravacao' | 'upload-nas' | 'concluido';
export type StatusEdicao = 'receber-ficheiros' | 'decupagem' | 'em-edicao' | 'feedback' | 'revisao-cliente' | 'entregue';

export type VideoType = 'hotel' | 'experiencia' | 'drone' | 'reels' | 'outro';

export type PaymentStatus = 'a-faturar' | 'a-receber' | 'recebido';

export type FreelancerPaymentStatus = 'a-pagar' | 'pago';

export type UserRole = 'admin' | 'freelancer_captacao' | 'editor_edicao';

export type ProjectPhase = 'captacao' | 'edicao' | 'finalizados';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  canViewFinance: boolean;
  canEditProjects: boolean;
  canViewAllProjects: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  totalRevenue: number;
  totalCosts: number;
  totalMargin: number;
  projectCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  client?: Client;

  // Fases e Status
  phase: ProjectPhase;
  statusCaptacao?: StatusCaptacao;
  statusEdicao?: StatusEdicao;

  // Detalhes do projeto
  videoType: VideoType;
  categoryId?: string;
  category?: Category;
  location?: string;
  description?: string;

  // Links
  nasLink?: string;
  frameIoLink?: string;

  // Responsáveis
  responsavelCaptacaoId?: string;
  responsavelCaptacao?: User;
  responsavelEdicaoId?: string;
  responsavelEdicao?: User;

  // Financeiro (apenas para admins)
  clientPrice: number;
  captationCost: number;
  editionCost: number;
  margin: number;

  // Status financeiro
  paymentStatus: PaymentStatus;
  freelancerPaymentStatus: FreelancerPaymentStatus;

  // Datas
  createdAt: Date;
  updatedAt: Date;
  clientDueDate?: Date;
  clientReceivedDate?: Date;
  freelancerDueDate?: Date;
  freelancerPaidDate?: Date;

  // Subtarefas
  subtasks: Subtask[];
}

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canViewFinance: boolean;
  canAssignToSelf: boolean;
  canChangeStatus: boolean;
  canManageChecklist: boolean;
}

export interface UserPermissions {
  canViewFinance: boolean;
  canEditAllProjects: boolean;
  canViewAllProjects: boolean;
  canManageUsers: boolean;
  canManageClients: boolean;
  canManageCategories: boolean;
  canViewReports: boolean;
  phases: ProjectPhase[];
}

export interface FinancialKPIs {
  totalToReceive: number;
  totalToPay: number;
  totalMargin: number;
  totalReceived: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  financialKPIs: FinancialKPIs;
}

export interface ProjectFilters {
  phase?: ProjectPhase;
  status?: ProjectStatus;
  clientId?: string;
  videoType?: VideoType;
  categoryId?: string;
  responsavelCaptacaoId?: string;
  responsavelEdicaoId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  assignedToMe?: boolean;
}

export interface CollaboratorReport {
  userId: string;
  user: User;
  totalSpent: number;
  pendingPayment: number;
  projectCount: number;
  completedProjects: number;
  averageProjectValue: number;
}

export interface ClientReport {
  clientId: string;
  client: Client;
  totalRevenue: number;
  captationCosts: number;
  editionCosts: number;
  totalCosts: number;
  margin: number;
  marginPercentage: number;
  projectCount: number;
  mostRequestedTypes: Array<{ type: VideoType; count: number }>;
}

export interface MonthlyProfitReport {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  projectCount: number;
}



// Transições permitidas de status
export const STATUS_TRANSITIONS = {
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
