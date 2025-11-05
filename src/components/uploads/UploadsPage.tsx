'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  File,
  Folder,
  Link,
  Download,
  Eye,
  Trash2,
  ExternalLink,
  Server,
  Play,
  Image,
  FileVideo,
  FileAudio,
  FileText,
  HardDrive,
  Cloud,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/lib/useAppStore';
import { formatFileSize, cn } from '@/lib/utils';

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  projectId: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  uploadedAt: Date;
  createdBy: string;
}

interface NASFolder {
  id: string;
  name: string;
  projectId: string;
  path: string;
  size: number;
  files: number;
  lastModified: Date;
}

interface FrameIOProject {
  id: string;
  name: string;
  projectId: string;
  status: 'draft' | 'review' | 'approved';
  url: string;
  thumbnail?: string;
  duration?: string;
  createdAt: Date;
}

export default function UploadsPage() {
  const { projects, currentUser, userPermissions } = useAppStore();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for NAS folders
  const nasFolders: NASFolder[] = projects.map(project => ({
    id: `nas-${project.id}`,
    name: project.title,
    projectId: project.id,
    path: `/projetos/${project.title.toLowerCase().replace(/\s+/g, '-')}`,
    size: Math.random() * 5000000000, // Random size up to 5GB
    files: Math.floor(Math.random() * 50) + 5,
    lastModified: new Date(project.updatedAt)
  }));

  // Mock data for Frame.io projects
  const frameIoProjects: FrameIOProject[] = projects
    .filter(p => p.frameIoLink)
    .map(project => ({
      id: `frame-${project.id}`,
      name: project.title,
      projectId: project.id,
      status: project.phase === 'finalizados' ? 'approved' : project.phase === 'edicao' ? 'review' : 'draft',
      url: project.frameIoLink || '',
      thumbnail: `https://picsum.photos/300/169?random=${project.id}`,
      duration: `${Math.floor(Math.random() * 5) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      createdAt: new Date(project.createdAt)
    }));

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    if (!selectedProject) {
      alert('Selecione um projeto primeiro');
      return;
    }

    Array.from(files).forEach(file => {
      const fileUpload: FileUpload = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        projectId: selectedProject,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date(),
        createdBy: currentUser.id
      };

      setUploadedFiles(prev => [...prev, fileUpload]);

      // Simulate upload progress
      simulateUpload(fileUpload.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    setIsUploading(true);
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadedFiles(prev => prev.map(file =>
          file.id === fileId
            ? {
                ...file,
                status: Math.random() > 0.1 ? 'completed' : 'error',
                progress: 100,
                url: `https://nas.in-sights.pt/uploads/${file.name}`
              }
            : file
        ));

        setIsUploading(false);
      } else {
        setUploadedFiles(prev => prev.map(file =>
          file.id === fileId ? { ...file, progress } : file
        ));
      }
    }, 200);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-400" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-blue-400" />;
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-green-400" />;
    return <FileText className="h-5 w-5 text-yellow-400" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'uploading':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFrameIOStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'review': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'draft': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const visibleProjects = projects.filter(project => {
    // Apply RBAC filtering
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'freelancer_captacao') {
      return project.responsavelCaptacaoId === currentUser.id && project.phase === 'captacao';
    }
    if (currentUser.role === 'editor_edicao') {
      return project.phase === 'edicao' || project.responsavelEdicaoId === currentUser.id;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Upload & Integrações</h1>
          <p className="text-muted-foreground">
            Gestão de arquivos, NAS e Frame.io
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="glass border-white/20 w-64">
              <SelectValue placeholder="Selecionar projeto" />
            </SelectTrigger>
            <SelectContent className="glass-strong border border-white/20">
              {visibleProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedProject || isUploading}
            className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Arquivos
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              dragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-white/20 hover:border-purple-500/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-muted-foreground mb-4">
              Suporta vídeos, áudios, imagens e documentos até 2GB
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedProject}
              className="glass border-white/20 hover:bg-white/10"
            >
              Selecionar Arquivos
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Arquivos Enviados ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.status === 'uploading' && (
                      <div className="w-32">
                        <Progress value={file.progress} className="h-2" />
                        <p className="text-xs text-center mt-1">{file.progress.toFixed(0)}%</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {getStatusIcon(file.status)}
                      <span className="text-xs capitalize">{file.status}</span>
                    </div>

                    {file.status === 'completed' && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="h-7 w-7 p-0 hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NAS Integration */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-400" />
              Integração NAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nasFolders.slice(0, 5).map((folder) => (
                <div key={folder.id} className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.files} arquivos • {formatFileSize(folder.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Abrir
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full glass border-white/20 hover:bg-white/10">
                <Server className="h-4 w-4 mr-2" />
                Ver Todos no NAS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Frame.io Integration */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-400" />
              Frame.io Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {frameIoProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    {project.thumbnail && (
                      <div className="w-16 h-9 bg-black/20 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{project.name}</p>
                        <Badge className={`${getFrameIOStatusColor(project.status)} text-xs`}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {project.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.duration}
                          </span>
                        )}
                        <span>{new Date(project.createdAt).toLocaleDateString('pt-PT')}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Frame.io
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full glass border-white/20 hover:bg-white/10">
                <Cloud className="h-4 w-4 mr-2" />
                Ver Todos no Frame.io
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-green-400 mb-1">NAS Conectado</h3>
              <p className="text-xs text-muted-foreground">
                Últimos arquivos sincronizados há 5 min
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-green-400 mb-1">Frame.io Ativo</h3>
              <p className="text-xs text-muted-foreground">
                {frameIoProjects.length} projetos sincronizados
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-400 mb-1">Upload Ativo</h3>
              <p className="text-xs text-muted-foreground">
                {uploadedFiles.length} arquivos carregados hoje
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
