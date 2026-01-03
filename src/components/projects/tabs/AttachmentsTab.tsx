'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, File, FileText, Image as ImageIcon, Video, Music, Trash2, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
}

interface AttachmentsTabProps {
  taskId: string | null;
  canEdit: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
  if (fileType.startsWith('video/')) return <Video className="h-8 w-8" />;
  if (fileType.startsWith('audio/')) return <Music className="h-8 w-8" />;
  if (fileType.includes('pdf')) return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
}

export default function AttachmentsTab({ taskId, canEdit }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments
  useEffect(() => {
    if (!taskId) return;

    setLoading(true);
    // TODO: Replace with actual API call
    // fetch(`/api/subtasks/${taskId}/attachments`)

    // Mock data
    setTimeout(() => {
      setAttachments([
        {
          id: '1',
          fileName: 'Briefing_Cliente.pdf',
          fileSize: 245000,
          fileType: 'application/pdf',
          fileUrl: '#',
          uploadedBy: 'admin',
          uploadedByName: 'Admin',
          uploadedAt: new Date('2025-12-19T10:00:00'),
        },
        {
          id: '2',
          fileName: 'Referências_Edição.mp4',
          fileSize: 15400000,
          fileType: 'video/mp4',
          fileUrl: '#',
          uploadedBy: 'user1',
          uploadedByName: 'João Editor',
          uploadedAt: new Date('2025-12-20T14:00:00'),
        },
        {
          id: '3',
          fileName: 'Logo_Cliente.png',
          fileSize: 87000,
          fileType: 'image/png',
          fileUrl: '#',
          uploadedBy: 'admin',
          uploadedByName: 'Admin',
          uploadedAt: new Date('2025-12-20T15:30:00'),
        },
      ]);
      setLoading(false);
    }, 300);
  }, [taskId]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (const file of Array.from(files)) {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // TODO: POST /api/subtasks/${taskId}/attachments with FormData
      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAttachment: Attachment = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file),
        uploadedBy: 'current-user',
        uploadedByName: 'Você',
        uploadedAt: new Date(),
      };

      setAttachments(prev => [...prev, newAttachment]);
      clearInterval(interval);
    }

    setUploading(false);
    setUploadProgress(0);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este anexo?')) return;

    // TODO: DELETE /api/subtasks/${taskId}/attachments/${id}
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleDownload = (attachment: Attachment) => {
    // TODO: Trigger download
    console.log('Downloading:', attachment.fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {canEdit && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">A fazer upload...</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arraste ficheiros aqui ou clique para selecionar
              </p>
              <Button onClick={handleFileSelect} variant="outline" size="sm">
                Selecionar Ficheiros
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Attachments list */}
      <div className="space-y-2">
        {attachments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum anexo
          </div>
        )}

        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 group"
          >
            {/* File icon */}
            <div className="text-muted-foreground shrink-0">
              {getFileIcon(attachment.fileType)}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.fileSize)} •
                Enviado por {attachment.uploadedByName} •
                {attachment.uploadedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(attachment.fileUrl, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
