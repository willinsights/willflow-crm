'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Plus,
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/useAppStore';
import { useLocale } from '@/lib/LocaleContext';
import { useView } from '@/lib/ViewContext';
import { Client } from '@/lib/types';
import CreateClientModal from './CreateClientModal';
import ClientDetailsModal from './ClientDetailsModal';

type SortField = 'name' | 'totalRevenue' | 'projectCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';

export default function ClientsPage() {
  const { filteredClients, projects, searchQuery } = useAppStore();
  const { formatCurrency } = useLocale();
  const { isCompact } = useView();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [detailsClient, setDetailsClient] = useState<Client | null>(null);

  // Filters and sorting state
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Filter and sort clients
  const sortedClients = useMemo(() => {
    let result = [...filteredClients];

    // Apply local search filter
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus === 'active') {
      result = result.filter(client => {
        const clientProjects = projects.filter(p => p.clientId === client.id);
        return clientProjects.some(p => p.phase !== 'finalizados');
      });
    } else if (filterStatus === 'inactive') {
      result = result.filter(client => {
        const clientProjects = projects.filter(p => p.clientId === client.id);
        return clientProjects.length === 0 || clientProjects.every(p => p.phase === 'finalizados');
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalRevenue':
          comparison = a.totalRevenue - b.totalRevenue;
          break;
        case 'projectCount':
          const aProjects = projects.filter(p => p.clientId === a.id).length;
          const bProjects = projects.filter(p => p.clientId === b.id).length;
          comparison = aProjects - bProjects;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [filteredClients, localSearch, sortField, sortDirection, filterStatus, projects]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const getProjectsByStatus = (clientId: string) => {
    const clientProjects = getClientProjects(clientId);
    return {
      active: clientProjects.filter(p => p.phase !== 'finalizados').length,
      completed: clientProjects.filter(p => p.phase === 'finalizados').length,
      total: clientProjects.length
    };
  };

  const totalClientsRevenue = filteredClients.reduce((sum, client) => sum + client.totalRevenue, 0);
  const avgProjectValue = projects.length > 0 ? totalClientsRevenue / projects.length : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-1 md:mb-2">Clientes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestao de clientes e analise de receitas
          </p>
        </div>
        <CreateClientModal />
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar cliente..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 glass border-white/20"
          />
        </div>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
          <SelectTrigger className="w-[140px] glass border-white/20">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/20">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortField} onValueChange={(v: SortField) => setSortField(v)}>
          <SelectTrigger className="w-[150px] glass border-white/20">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/20">
            <SelectItem value="totalRevenue">Receita</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="projectCount">Projetos</SelectItem>
            <SelectItem value="createdAt">Data Criacao</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortDirection}
          className="glass border-white/20"
        >
          {sortDirection === 'desc' ? (
            <SortDesc className="w-4 h-4" />
          ) : (
            <SortAsc className="w-4 h-4" />
          )}
        </Button>

        {/* Results count */}
        <Badge variant="outline" className="ml-auto">
          {sortedClients.length} cliente{sortedClients.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Total Clientes
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{filteredClients.length}</div>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `${filteredClients.length} encontrado(s)` : <><span className="text-green-400">+2</span> novos este mês</>}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <Euro className="h-4 w-4 text-green-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold truncate">{formatCurrency(totalClientsRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-400">+15%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Valor Médio/Projeto
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold truncate">{formatCurrency(avgProjectValue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-400">+8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Projetos Ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-400 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {projects.filter(p => p.phase !== 'finalizados').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em {filteredClients.filter(c => getProjectsByStatus(c.id).active > 0).length} clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {sortedClients.map((client) => {
              const projectStats = getProjectsByStatus(client.id);
              const marginPercentage = client.totalRevenue > 0
                ? (client.totalMargin / client.totalRevenue) * 100
                : 0;

              return (
                <div
                  key={client.id}
                  className="project-card p-4 md:p-6 cursor-pointer"
                  onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base md:text-lg font-semibold truncate">{client.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{client.company}</p>
                        </div>
                      </div>

                      {/* Compact view: Show only essential info */}
                      {isCompact ? (
                        <div className="flex items-center justify-between gap-3 md:gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Receita</p>
                            <p className="text-xs md:text-sm font-medium truncate">{formatCurrency(client.totalRevenue)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Projetos</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs md:text-sm font-medium">{projectStats.total}</span>
                              {projectStats.active > 0 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {projectStats.active}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                          <div className="space-y-0.5 md:space-y-1">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Receita Total</p>
                            <p className="text-xs md:text-sm font-medium truncate">{formatCurrency(client.totalRevenue)}</p>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Margem</p>
                            <p className="text-xs md:text-sm font-medium text-green-400 truncate">
                              {formatCurrency(client.totalMargin)} ({marginPercentage.toFixed(1)}%)
                            </p>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Projetos</p>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <span className="text-xs md:text-sm font-medium">{projectStats.total}</span>
                              <Badge variant="secondary" className="text-[10px] md:text-xs">
                                {projectStats.active} ativos
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-0.5 md:space-y-1">
                            <p className="text-[10px] md:text-xs text-muted-foreground">Contacto</p>
                            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {selectedClient === client.id && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Project Progress */}
                            <div>
                              <h4 className="text-sm font-medium mb-3">Progresso de Projetos</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Concluídos</span>
                                    <span>{projectStats.completed}/{projectStats.total}</span>
                                  </div>
                                  <Progress
                                    value={projectStats.total > 0 ? (projectStats.completed / projectStats.total) * 100 : 0}
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Recent Projects */}
                            <div>
                              <h4 className="text-sm font-medium mb-3">Projetos Recentes</h4>
                              <div className="space-y-2">
                                {getClientProjects(client.id).slice(0, 3).map((project) => (
                                  <div key={project.id} className="flex items-center justify-between text-xs">
                                    <span className="truncate">{project.title}</span>
                                    <Badge className={`status-badge status-${project.statusEdicao || project.statusCaptacao} text-xs`}>
                                      {(project.statusEdicao || project.statusCaptacao || '').replace('-', ' ')}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-strong border border-white/20">
                          <DropdownMenuItem
                            className="hover:bg-white/10"
                            onClick={() => setDetailsClient(client)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <CreateClientModal client={client} />
                          <DropdownMenuItem className="hover:bg-white/10">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Projeto
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/10 text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      {detailsClient && (
        <ClientDetailsModal
          client={detailsClient}
          projects={projects}
          isOpen={detailsClient !== null}
          onClose={() => setDetailsClient(null)}
        />
      )}
    </div>
  );
}
