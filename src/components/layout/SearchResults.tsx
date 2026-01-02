'use client';

import { useRef, useEffect } from 'react';
import {
  Video,
  User,
  MapPin,
  Calendar,
  Euro,
  Tag,
  Building,
  Mail,
  Phone,
  ArrowRight,
  X,
  Search as SearchIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/useAppStore';
import { useLocale } from '@/lib/LocaleContext';
import { Project, Client } from '@/lib/types';

interface SearchResultsProps {
  open: boolean;
  query?: string;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onSelectClient: (client: Client) => void;
  onViewAllProjects: () => void;
  onViewAllClients: () => void;
  className?: string;
}

export default function SearchResults({
  open,
  query,
  onClose,
  onSelectProject,
  onSelectClient,
  onViewAllProjects,
  onViewAllClients,
  className = ''
}: SearchResultsProps) {
  const { searchQuery, filteredProjects, filteredClients, setSearchQuery } = useAppStore();
  const { formatCurrency } = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use query from props or from store
  const currentQuery = query || searchQuery;

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open || !currentQuery) return null;

  const hasResults = filteredProjects.length > 0 || filteredClients.length > 0;
  const maxProjectsToShow = 5;
  const maxClientsToShow = 3;

  const projectsToShow = filteredProjects.slice(0, maxProjectsToShow);
  const clientsToShow = filteredClients.slice(0, maxClientsToShow);

  const phaseColors: Record<string, string> = {
    captacao: 'bg-blue-500/20 text-blue-400',
    edicao: 'bg-purple-500/20 text-purple-400',
    finalizados: 'bg-green-500/20 text-green-400'
  };

  const phaseLabels: Record<string, string> = {
    captacao: 'Captação',
    edicao: 'Edição',
    finalizados: 'Finalizado'
  };

  return (
    <div
      ref={dropdownRef}
      className={`glass-strong border border-white/20 rounded-xl shadow-2xl max-h-[70vh] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-muted-foreground">
            Resultados para "<span className="text-purple-400 font-medium">{currentQuery}</span>"
          </span>
        </div>
        <button
          onClick={() => {
            setSearchQuery('');
            onClose();
          }}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {!hasResults ? (
          <div className="p-8 text-center">
            <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Tente pesquisar por título, cliente, localização...
            </p>
          </div>
        ) : (
          <>
            {/* Projects Section */}
            {projectsToShow.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-3 h-3" />
                    Projetos ({filteredProjects.length})
                  </h3>
                  {filteredProjects.length > maxProjectsToShow && (
                    <button
                      onClick={() => {
                        onViewAllProjects();
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {projectsToShow.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onSelectProject(project);
                      }}
                      className="w-full p-3 text-left rounded-lg hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm group-hover:text-purple-400 transition-colors truncate">
                              {project.title}
                            </span>
                            <Badge className={`text-[10px] ${phaseColors[project.phase] || ''}`}>
                              {phaseLabels[project.phase] || project.phase}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {project.client && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {project.client.name}
                              </span>
                            )}
                            {project.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.location}
                              </span>
                            )}
                            {project.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {project.category.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-green-400">
                            {formatCurrency(project.clientPrice)}
                          </div>
                          {project.clientDueDate && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(project.clientDueDate).toLocaleDateString('pt-PT')}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {projectsToShow.length > 0 && clientsToShow.length > 0 && (
              <div className="border-t border-white/10" />
            )}

            {/* Clients Section */}
            {clientsToShow.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Clientes ({filteredClients.length})
                  </h3>
                  {filteredClients.length > maxClientsToShow && (
                    <button
                      onClick={() => {
                        onViewAllClients();
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {clientsToShow.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        onSelectClient(client);
                      }}
                      className="w-full p-3 text-left rounded-lg hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm group-hover:text-purple-400 transition-colors">
                            {client.name}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {client.company && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {client.company}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-purple-400">
                            {client.projectCount || 0} projetos
                          </div>
                          {client.totalRevenue !== undefined && client.totalRevenue > 0 && (
                            <div className="text-[10px] text-green-400 mt-0.5">
                              {formatCurrency(client.totalRevenue)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {hasResults && (
        <div className="p-3 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Clique para abrir</span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> para fechar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
