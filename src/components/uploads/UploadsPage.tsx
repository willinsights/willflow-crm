'use client';

import { useState, useEffect } from 'react';
import {
  ExternalLink,
  Play,
  HardDrive,
  Film,
  Video,
  Youtube,
  Cloud,
  Link2,
  X,
  Loader2,
  Clock,
  Search,
  FolderOpen,
  RefreshCw,
  Grid3X3,
  List,
  Filter,
  Eye,
  Plus,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/useAppStore';

interface MediaItem {
  id: string;
  projectId: string;
  type: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  status: string;
  order: number;
  addedBy?: string;
  addedByName?: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
    customId?: string;
    client?: { name: string };
  };
}

interface MediaStats {
  total: number;
  byType: Record<string, number>;
}

const MEDIA_TYPES = [
  { value: 'all', label: 'Todos', icon: FolderOpen, color: 'bg-white/10 text-white border-white/20' },
  { value: 'nas', label: 'NAS', icon: HardDrive, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'frameio', label: 'Frame.io', icon: Film, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'vimeo', label: 'Vimeo', icon: Video, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'gdrive', label: 'Google Drive', icon: Cloud, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'other', label: 'Outro', icon: Link2, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

export default function UploadsPage() {
  const { projects } = useAppStore();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<MediaStats>({ total: 0, byType: {} });
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMedia();
  }, [filterType, filterProject]);

  const fetchMedia = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterProject !== 'all') params.set('projectId', filterProject);

      const res = await fetch(`/api/media?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMediaItems(data.data);
        if (data.meta?.stats) {
          setStats(data.meta.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const canPlayInline = (type: string, url: string) => {
    if (type === 'youtube') return true;
    if (type === 'vimeo') return true;
    if (type === 'frameio' && url.includes('frame.io')) return true;
    return false;
  };

  const getEmbedUrl = (type: string, url: string) => {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    if (type === 'frameio') {
      if (url.includes('/player/')) return url;
      return url.replace('/v/', '/embed/');
    }
    return url;
  };

  const getTypeConfig = (type: string) => {
    return MEDIA_TYPES.find(t => t.value === type) || MEDIA_TYPES[6];
  };

  // Filter by search
  const filteredMedia = mediaItems.filter(item => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(search) ||
      item.project?.title?.toLowerCase().includes(search) ||
      item.project?.client?.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  // Group by project for the "By Project" tab
  const mediaByProject = filteredMedia.reduce((acc, item) => {
    const projectId = item.projectId;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: item.project,
        items: []
      };
    }
    acc[projectId].items.push(item);
    return acc;
  }, {} as Record<string, { project: MediaItem['project']; items: MediaItem[] }>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-primary" />
            Media & Uploads
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Links de NAS, Frame.io, Vimeo e outros associados aos projetos
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchMedia(true)}
          disabled={refreshing}
          className="glass"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {MEDIA_TYPES.map(type => {
          const count = type.value === 'all' ? stats.total : (stats.byType[type.value] || 0);
          const Icon = type.icon;
          const isActive = filterType === type.value;

          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isActive ? 'ring-2 ring-primary' : ''
              } glass`}
              onClick={() => setFilterType(type.value)}
            >
              <CardContent className="p-3 text-center">
                <div className={`p-2 rounded-lg w-fit mx-auto mb-2 ${type.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{type.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Todos os Media
          </TabsTrigger>
          <TabsTrigger value="byProject" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Por Projeto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por titulo, projeto ou cliente..."
                className="pl-10 glass"
              />
            </div>

            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-full md:w-64 glass">
                <SelectValue placeholder="Filtrar por projeto" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {(p as any).customId && `[${(p as any).customId}] `}{p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="glass"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="glass"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum media encontrado</p>
              <p className="text-sm mt-1">
                {searchQuery ? 'Tente ajustar a pesquisa' : 'Adicione links de media nos projetos'}
              </p>
              <p className="text-xs mt-4">
                Abra um projeto e vá à aba "Media" para adicionar links
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map(item => {
                const typeConfig = getTypeConfig(item.type);
                const Icon = typeConfig.icon;
                const canPlay = canPlayInline(item.type, item.url);

                return (
                  <Card key={item.id} className="glass group hover:bg-white/5 transition-all overflow-hidden">
                    {/* Thumbnail / Preview */}
                    <div className="relative aspect-video bg-black/30 flex items-center justify-center">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`p-4 rounded-full ${typeConfig.color}`}>
                          <Icon className="w-10 h-10" />
                        </div>
                      )}

                      {/* Play overlay */}
                      {canPlay && (
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            setSelectedVideo(item);
                            setShowVideoPlayer(true);
                          }}
                        >
                          <div className="p-3 rounded-full bg-primary">
                            <Play className="w-8 h-8 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                      )}

                      {/* Type badge */}
                      <Badge variant="outline" className={`absolute top-2 left-2 ${typeConfig.color}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {typeConfig.label}
                      </Badge>

                      {/* Duration */}
                      {item.duration && (
                        <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/70">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{item.title}</h3>

                      {item.project && (
                        <p className="text-sm text-primary truncate mt-1">
                          {item.project.customId && `[${item.project.customId}] `}
                          {item.project.title}
                        </p>
                      )}

                      {item.project?.client && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.project.client.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>

                        <div className="flex gap-1">
                          {canPlay && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedVideo(item);
                                setShowVideoPlayer(true);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openExternalLink(item.url)}
                            className="h-7 text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Abrir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredMedia.map(item => {
                const typeConfig = getTypeConfig(item.type);
                const Icon = typeConfig.icon;
                const canPlay = canPlayInline(item.type, item.url);

                return (
                  <div
                    key={item.id}
                    className="glass rounded-lg p-4 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Type Icon */}
                      <div className={`p-3 rounded-lg ${typeConfig.color} flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{item.title}</h4>
                          <Badge variant="outline" className={`text-[10px] ${typeConfig.color}`}>
                            {typeConfig.label}
                          </Badge>
                          {item.duration && (
                            <Badge variant="secondary" className="text-[10px]">
                              {item.duration}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {item.project && (
                            <span className="text-primary truncate">
                              {item.project.customId && `[${item.project.customId}] `}
                              {item.project.title}
                            </span>
                          )}
                          {item.project?.client && (
                            <>
                              <span>•</span>
                              <span>{item.project.client.name}</span>
                            </>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {formatDate(item.createdAt)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canPlay && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/20"
                            onClick={() => {
                              setSelectedVideo(item);
                              setShowVideoPlayer(true);
                            }}
                            title="Reproduzir"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white/10"
                          onClick={() => openExternalLink(item.url)}
                          title="Abrir link externo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="byProject" className="mt-4">
          {/* By Project View */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(mediaByProject).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum media encontrado</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(mediaByProject).map(([projectId, data]) => (
                <Card key={projectId} className="glass">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {data.project?.customId && (
                            <span className="text-primary mr-2">[{data.project.customId}]</span>
                          )}
                          {data.project?.title || 'Projeto'}
                        </CardTitle>
                        {data.project?.client && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {data.project.client.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">{data.items.length} media</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.items.map(item => {
                        const typeConfig = getTypeConfig(item.type);
                        const Icon = typeConfig.icon;
                        const canPlay = canPlayInline(item.type, item.url);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                          >
                            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{item.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{typeConfig.label}</span>
                                {item.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{item.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canPlay && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedVideo(item);
                                    setShowVideoPlayer(true);
                                  }}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openExternalLink(item.url)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Player Dialog */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="glass-strong border-white/10 max-w-5xl p-0 overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
              onClick={() => setShowVideoPlayer(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {selectedVideo && (
              <div className="aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.type, selectedVideo.url)}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {selectedVideo && (
            <div className="p-4">
              <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
              {selectedVideo.project && (
                <p className="text-sm text-primary">
                  {selectedVideo.project.customId && `[${selectedVideo.project.customId}] `}
                  {selectedVideo.project.title}
                </p>
              )}
              {selectedVideo.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedVideo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <Badge variant="outline" className={getTypeConfig(selectedVideo.type).color}>
                  {getTypeConfig(selectedVideo.type).label}
                </Badge>
                {selectedVideo.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedVideo.duration}
                  </span>
                )}
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs h-auto p-0"
                  onClick={() => openExternalLink(selectedVideo.url)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Abrir no site original
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
