'use client';

import { useState } from 'react';
import { Upload, File, Image, Video, FileText, Music, Download, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProjectFile, FileCategory } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface ProjectFilesProps {
  projectId: string;
  files: ProjectFile[];
  onUpload?: (file: File, description: string) => void;
  onDelete?: (fileId: string) => void;
}

export default function ProjectFiles({ projectId, files = [], onUpload, onDelete }: ProjectFilesProps) {
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');

  const getFileIcon = (category: FileCategory) => {
    switch (category) {
      case 'video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-blue-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-orange-400" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryFromType = (mimeType: string): FileCategory => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    setUploading(true);
    try {
      await onUpload(file, description);
      setDescription('');
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {} as Record<FileCategory, ProjectFile[]>);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-description">Descrição (opcional)</Label>
            <Input
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Vídeo final editado, Foto BTS, Contrato..."
              className="glass border-white/20"
            />
          </div>

          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Clique para fazer upload'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vídeos, imagens, documentos, áudio
                </p>
              </div>
            </label>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• Tamanho máximo: 100MB por arquivo</p>
            <p>• Formatos suportados: MP4, MOV, JPG, PNG, PDF, DOCX, MP3, WAV</p>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Faça upload de vídeos, fotos ou documentos deste projeto
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
            <Card key={category} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {getFileIcon(category as FileCategory)}
                  {category === 'video' && 'Vídeos'}
                  {category === 'image' && 'Imagens'}
                  {category === 'audio' && 'Áudio'}
                  {category === 'document' && 'Documentos'}
                  {category === 'other' && 'Outros'}
                  <Badge variant="outline" className="ml-auto">
                    {categoryFiles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg glass border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      {getFileIcon(file.category)}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString('pt-PT')}</span>
                          {file.description && (
                            <>
                              <span>•</span>
                              <span className="truncate">{file.description}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {file.category === 'image' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <a href={file.url} download={file.name}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            onClick={() => onDelete(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
