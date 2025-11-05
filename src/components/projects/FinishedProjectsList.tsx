'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Undo2,
  Trash2,
  Calendar,
  Euro,
  User,
  Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useAppStore } from '@/lib/useAppStore';
import { Project } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { videoTypeLabels } from '@/lib/data';
import { useToast } from '@/components/ui/toast';

const ITEMS_PER_PAGE = 20;

export default function FinishedProjectsList() {
  const { filteredProjects: globalFilteredProjects, clients, updateProject, deleteProject, userPermissions } = useAppStore();
  const { toast } = useToast();

  // Filters state (local filters on top of global search)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedVideoType, setSelectedVideoType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Get finished projects (from already filtered projects)
  const finishedProjects = globalFilteredProjects.filter(p => p.phase === 'finalizados');

  // Apply filters
  const filteredProjects = useMemo(() => {
    return finishedProjects.filter(project => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(search) ||
          project.client?.name.toLowerCase().includes(search) ||
          project.description?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Client filter
      if (selectedClient !== 'all' && project.clientId !== selectedClient) {
        return false;
      }

      // Video type filter
      if (selectedVideoType !== 'all' && project.videoType !== selectedVideoType) {
        return false;
      }

      // Date range filter
      if (dateFrom && project.clientReceivedDate) {
        if (new Date(project.clientReceivedDate) < new Date(dateFrom)) {
          return false;
        }
      }

      if (dateTo && project.clientReceivedDate) {
        if (new Date(project.clientReceivedDate) > new Date(dateTo)) {
          return false;
        }
      }

      return true;
    });
  }, [finishedProjects, searchQuery, selectedClient, selectedVideoType, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Actions
  const handleMoveToEdition = async (project: Project) => {
    try {
      await updateProject(project.id, {
        phase: 'edicao',
        statusEdicao: 'revisao-cliente'
      });
      toast({
        title: 'Projeto movido',
        description: `${project.title} foi movido para Edição`
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível mover o projeto',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      toast({
        title: 'Projeto deletado',
        description: `${projectToDelete.title} foi deletado com sucesso`
      });
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o projeto',
        variant: 'destructive'
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClient('all');
    setSelectedVideoType('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-1 md:mb-2">Projetos Finalizados</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Histórico completo de projetos concluídos
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou cliente..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 glass border-white/20"
                />
              </div>
            </div>

            {/* Client Filter */}
            <Select value={selectedClient} onValueChange={(value) => {
              setSelectedClient(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="glass border-white/20">
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent className="glass-strong border border-white/20">
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Video Type Filter */}
            <Select value={selectedVideoType} onValueChange={(value) => {
              setSelectedVideoType(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="glass border-white/20">
                <SelectValue placeholder="Tipo de vídeo" />
              </SelectTrigger>
              <SelectContent className="glass-strong border border-white/20">
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(videoTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetFilters}
              className="glass border-white/20 hover:bg-white/10"
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Data inicial
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass border-white/20"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Data final
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="glass border-white/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{paginatedProjects.length}</span> de{' '}
          <span className="font-medium text-foreground">{filteredProjects.length}</span> projetos
        </p>
        {filteredProjects.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
        )}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <Card className="glass-card hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Conclusão</TableHead>
                  {userPermissions.canViewFinance && <TableHead>Valor</TableHead>}
                  {userPermissions.canViewFinance && <TableHead>Margem</TableHead>}
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum projeto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProjects.map((project) => (
                    <TableRow key={project.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.title}</p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{project.client?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.category && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1.5 w-fit">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.category.color }}
                            />
                            {project.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {project.clientReceivedDate
                              ? new Date(project.clientReceivedDate).toLocaleDateString('pt-PT')
                              : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      {userPermissions.canViewFinance && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-green-400" />
                            <span className="font-medium text-green-400">
                              {formatCurrency(project.clientPrice)}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      {userPermissions.canViewFinance && (
                        <TableCell>
                          <span
                            className={`font-medium ${
                              project.margin > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {formatCurrency(project.margin)}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowDetailsModal(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {userPermissions.canEditAllProjects && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveToEdition(project)}
                                className="h-8 w-8 p-0"
                                title="Voltar para Edição"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setProjectToDelete(project);
                                  setShowDeleteModal(true);
                                }}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                title="Deletar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedProjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum projeto encontrado
            </CardContent>
          </Card>
        ) : (
          paginatedProjects.map((project) => (
            <Card key={project.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{project.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{project.client?.name || 'N/A'}</p>
                  </div>
                  {project.category && (
                    <Badge variant="outline" className="text-xs flex-shrink-0 flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.category.color }}
                      />
                      {project.category.name}
                    </Badge>
                  )}
                </div>

                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Data Conclusão</span>
                    <span className="font-medium">
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('pt-PT') : 'N/A'}
                    </span>
                  </div>
                  {userPermissions.canViewFinance && (
                    <div>
                      <span className="text-muted-foreground block">Valor</span>
                      <span className="font-medium">{formatCurrency(project.clientPrice)}</span>
                    </div>
                  )}
                </div>

                {userPermissions.canViewFinance && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Margem: </span>
                    <span className={`font-medium ${project.margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(project.margin)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 glass border-white/20 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  {userPermissions.canEditAllProjects && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveToEdition(project)}
                        className="flex-1 glass border-white/20 text-xs"
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Voltar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProjectToDelete(project);
                          setShowDeleteModal(true);
                        }}
                        className="glass border-white/20 text-xs text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="glass-strong border border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>Detalhes do projeto finalizado</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedProject.client?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Vídeo</p>
                  <p className="font-medium">{videoTypeLabels[selectedProject.videoType]}</p>
                </div>
                {userPermissions.canViewFinance && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Cliente</p>
                      <p className="font-medium text-green-400">
                        {formatCurrency(selectedProject.clientPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p
                        className={`font-medium ${
                          selectedProject.margin > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatCurrency(selectedProject.margin)}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Data Conclusão</p>
                  <p className="font-medium">
                    {selectedProject.clientReceivedDate
                      ? new Date(selectedProject.clientReceivedDate).toLocaleDateString('pt-PT')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável Edição</p>
                  <p className="font-medium">{selectedProject.responsavelEdicao?.name || 'N/A'}</p>
                </div>
              </div>
              {selectedProject.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="mt-1">{selectedProject.description}</p>
                </div>
              )}
              {(selectedProject.nasLink || selectedProject.frameIoLink) && (
                <div className="flex gap-3">
                  {selectedProject.nasLink && (
                    <Button variant="outline" size="sm" className="glass border-white/20" asChild>
                      <a href={selectedProject.nasLink} target="_blank" rel="noopener noreferrer">
                        Abrir NAS
                      </a>
                    </Button>
                  )}
                  {selectedProject.frameIoLink && (
                    <Button variant="outline" size="sm" className="glass border-white/20" asChild>
                      <a href={selectedProject.frameIoLink} target="_blank" rel="noopener noreferrer">
                        Abrir Frame.io
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="glass-strong border border-white/20">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o projeto "{projectToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setProjectToDelete(null);
              }}
              className="glass border-white/20"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
