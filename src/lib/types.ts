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

export type UserRole = 'admin' | 'freelancer_captacao' | 'editor_edicao' | 'visualizer';

export type ProjectPhase = 'captacao' | 'edicao' | 'finalizados';

// Communication Management Types
export type CommunicationType = 'email' | 'phone' | 'meeting' | 'message' | 'other';
export type CommunicationStatus = 'pending' | 'sent' | 'received' | 'completed';

export interface Communication {
  id: string;
  clientId: string;
  type: CommunicationType;
  subject: string;
  content: string;
  status: CommunicationStatus;
  sentBy?: string;
  sentAt: Date;
  notes?: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

// Tipos de colaborador
export type CollaboratorType = 'photographer' | 'filmmaker' | 'both';
export type ContributorType = 'company' | 'receipts' | 'freelancer' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Apenas para criação, não retornado pela API
  role: UserRole;
  avatar?: string;
  canViewFinance: boolean;
  canEditProjects: boolean;
  canViewAllProjects: boolean;

  // Controle de acesso
  isActive?: boolean;
  lastLogin?: Date;
  mustChangePassword?: boolean;

  // Tipo de colaborador (para captação)
  collaboratorType?: CollaboratorType;

  // Dados bancários
  iban?: string;
  bankName?: string;

  // Dados fiscais
  nif?: string;
  contributorType?: ContributorType;
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

  // Enhanced fields
  address?: string;
  website?: string;
  notes?: ClientNote[];
  communications?: Communication[];
  lastContactDate?: Date;
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
  projectId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate?: Date;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Relações
  checklistItems?: ChecklistItem[];
  comments?: SubtaskComment[];
  attachments?: SubtaskAttachment[];
  activityLog?: SubtaskActivity[];
}

export interface ChecklistItem {
  id: string;
  subtaskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
  completedAt?: Date;
  completedBy?: string;
}

export interface SubtaskComment {
  id: string;
  subtaskId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  mentions?: string[];
}

export interface SubtaskAttachment {
  id: string;
  subtaskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface SubtaskActivity {
  id: string;
  subtaskId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  createdAt: Date;
}

// File Management Types
export type FileCategory = 'video' | 'image' | 'audio' | 'document' | 'other';

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  description?: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

// Budget Management Types
export type BudgetCategory = 'equipamento' | 'equipe' | 'locacao' | 'transporte' | 'alimentacao' | 'pos-producao' | 'outros';

export interface BudgetItem {
  id: string;
  projectId: string;
  category: BudgetCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  phase: 'captacao' | 'edicao';
  isPaid: boolean;
  createdAt: Date;
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
  customId?: string;
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

  // File Management
  files?: ProjectFile[];

  // Budget Management
  budgetItems?: BudgetItem[];
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
