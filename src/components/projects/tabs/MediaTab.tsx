'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  ExternalLink,
  Play,
  Trash2,
  Edit2,
  HardDrive,
  Film,
  Video,
  Youtube,
  Cloud,
  Link2,
  X,
  Check,
  Loader2,
  Clock,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
}

interface MediaTabProps {
  projectId: string;
}

const MEDIA_TYPES = [
  { value: 'nas', label: 'NAS', icon: HardDrive, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'frameio', label: 'Frame.io', icon: Film, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'vimeo', label: 'Vimeo', icon: Video, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'gdrive', label: 'Google Drive', icon: Cloud, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'other', label: 'Outro', icon: Link2, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

export default function MediaTab({ projectId }: MediaTabProps) {
  const { currentUser } = useAppStore();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'nas',
    title: '',
    url: '',
    description: '',
    duration: ''
  });

  // Load media items
  useEffect(() => {
    fetchMedia();
  }, [projectId]);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/media`);
      const data = await res.json();
      if (data.success) {
        setMediaItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    if (!formData.type || !formData.title || !formData.url) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          addedBy: currentUser?.id,
          addedByName: currentUser?.name
        })
      });

      const data = await res.json();
      if (data.success) {
        setMediaItems(prev => [...prev, data.data]);
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding media:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMedia = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: editingItem.id,
          ...formData
        })
      });

      const data = await res.json();
      if (data.success) {
        setMediaItems(prev => prev.map(m =>
          m.id === editingItem.id ? { ...m, ...formData } : m
        ));
        setEditingItem(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating media:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Tem certeza que deseja remover este link?')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/media?mediaId=${mediaId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMediaItems(prev => prev.filter(m => m.id !== mediaId));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'nas',
      title: '',
      url: '',
      description: '',
      duration: ''
    });
  };

  const startEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      url: item.url,
      description: item.description || '',
      duration: item.duration || ''
    });
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const canPlayInline = (type: string, url: string) => {
    // Check if URL can be played inline (Vimeo, YouTube, Frame.io embed)
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
      // Frame.io embed
      if (url.includes('/player/')) return url;
      // Convert view URL to embed
      return url.replace('/v/', '/embed/');
    }
    return url;
  };

  const getTypeConfig = (type: string) => {
    return MEDIA_TYPES.find(t => t.value === type) || MEDIA_TYPES[5];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Links de Media</h3>
          <Badge variant="secondary" className="text-xs">
            {mediaItems.length}
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap gap-2">
        {MEDIA_TYPES.slice(0, 4).map(type => {
          const count = mediaItems.filter(m => m.type === type.value).length;
          if (count === 0) return null;
          const Icon = type.icon;
          return (
            <Badge key={type.value} variant="outline" className={type.color}>
              <Icon className="w-3 h-3 mr-1" />
              {count} {type.label}
            </Badge>
          );
        })}
      </div>

      {/* Media List */}
      {mediaItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhum link adicionado</p>
          <p className="text-xs mt-1">Adicione links da NAS, Frame.io, Vimeo, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mediaItems.map(item => {
            const typeConfig = getTypeConfig(item.type);
            const Icon = typeConfig.icon;
            const canPlay = canPlayInline(item.type, item.url);

            return (
              <div
                key={item.id}
                className="glass rounded-lg p-3 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">{item.title}</h4>
                      <Badge variant="outline" className={`text-[10px] ${typeConfig.color}`}>
                        {typeConfig.label}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {item.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      )}
                      <span className="truncate max-w-[200px]">{item.url}</span>
                    </div>
                  </div>

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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10"
                      onClick={() => startEdit(item)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/20"
                      onClick={() => handleDeleteMedia(item.id)}
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="glass-strong border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Link' : 'Adicionar Link de Media'}
            </DialogTitle>
            <DialogDescription>
              Adicione links da NAS, Frame.io, Vimeo, YouTube ou Google Drive.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10">
                  {MEDIA_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Titulo</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Brutos Dia 1, Master Final, etc."
                className="glass"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">URL / Link</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="glass"
              />
            </div>

            {/* Duration (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duracção (opcional)</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Ex: 02:30"
                className="glass"
              />
            </div>

            {/* Description (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descricção (opcional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Notas sobre o video..."
                className="glass resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingItem ? handleUpdateMedia : handleAddMedia}
                disabled={saving || !formData.title || !formData.url}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingItem ? 'Guardar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="glass-strong border-white/10 max-w-4xl p-0 overflow-hidden">
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
              <h3 className="font-semibold">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedVideo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                  Abrir no site
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
