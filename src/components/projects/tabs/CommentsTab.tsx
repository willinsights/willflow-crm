'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/useAppStore';

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdByAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

interface CommentsTabProps {
  taskId: string | null;
  canEdit: boolean;
}

export default function CommentsTab({ taskId, canEdit }: CommentsTabProps) {
  const { currentUser } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments from API
  useEffect(() => {
    if (!taskId) return;

    const loadComments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${taskId}/comments`);
        const result = await response.json();

        if (result.success && result.data) {
          setComments(result.data.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            createdBy: comment.createdBy,
            createdByName: comment.createdByName || 'Usuário',
            createdByAvatar: comment.createdByAvatar,
            createdAt: new Date(comment.createdAt),
            updatedAt: new Date(comment.updatedAt),
            isEdited: comment.isEdited,
          })));
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [taskId]);

  const handleSend = async () => {
    if (!newComment.trim() || !canEdit || !taskId) return;

    setSending(true);

    try {
      const response = await fetch(`/api/projects/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          createdBy: currentUser?.id || 'unknown',
          createdByName: currentUser?.name || 'Usuário',
          createdByAvatar: currentUser?.avatar,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const comment: Comment = {
          id: result.data.id,
          content: result.data.content,
          createdBy: result.data.createdBy,
          createdByName: result.data.createdByName || currentUser?.name || 'Usuário',
          createdByAvatar: result.data.createdByAvatar || currentUser?.avatar,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          isEdited: false,
        };

        setComments([...comments, comment]);
        setNewComment('');
      } else {
        console.error('Erro ao criar comentário:', result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim() || !taskId) return;

    const previousComment = comments.find(c => c.id === id);
    if (!previousComment) return;

    // Optimistic update
    setComments(comments.map(c =>
      c.id === id
        ? { ...c, content: editContent, updatedAt: new Date(), isEdited: true }
        : c
    ));

    setEditingId(null);

    try {
      const response = await fetch(`/api/projects/${taskId}/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: id,
          content: editContent,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        // Revert on error
        setComments(comments.map(c =>
          c.id === id ? previousComment : c
        ));
        console.error('Erro ao editar comentário:', result.error);
      }
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      // Revert on error
      setComments(comments.map(c =>
        c.id === id ? previousComment : c
      ));
    }

    setEditContent('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar este comentário?') || !taskId) return;

    const previousComments = [...comments];
    setComments(comments.filter(c => c.id !== id));

    try {
      const response = await fetch(`/api/projects/${taskId}/comments?commentId=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        setComments(previousComments);
        console.error('Erro ao deletar comentário:', result.error);
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      setComments(previousComments);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
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
      {/* Comments list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum comentário ainda
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={comment.createdByAvatar} />
              <AvatarFallback>
                {comment.createdByName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.createdByName}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-muted-foreground">(editado)</span>
                  )}
                </div>

                {/* Actions (only for own comments) */}
                {canEdit && comment.createdBy === currentUser?.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(comment)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Comment content */}
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(comment.id)}>
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New comment input */}
      {canEdit && (
        <div className="space-y-2 pt-4 border-t">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escrever um comentário..."
            rows={3}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSend();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Ctrl+Enter para enviar
            </span>
            <Button
              onClick={handleSend}
              disabled={!newComment.trim() || sending}
              size="sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
