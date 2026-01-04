'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckSquare,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Clock,
  Flag,
  Tag,
  History,
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  MoreVertical
} from 'lucide-react';

interface SubtaskDetailed {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate?: Date | string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string;
  checklistItems?: ChecklistItem[];
  comments?: Comment[];
  attachments?: Attachment[];
  activityLog?: ActivityLog[];
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  completedAt?: Date | string;
  completedBy?: string;
}

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isEdited: boolean;
  mentions?: string[];
}

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

interface ActivityLog {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  createdAt: Date | string;
}

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  subtask: SubtaskDetailed | null;
  projectId?: string;
  onUpdate?: (subtask: SubtaskDetailed) => void;
  onDelete?: () => void;
}

export default function TaskDetailsModal({
  open,
  onClose,
  subtask: initialSubtask,
  projectId,
  onUpdate,
  onDelete,
}: TaskDetailsModalProps) {
  const [subtask, setSubtask] = useState<SubtaskDetailed | null>(initialSubtask);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setSubtask(initialSubtask);
  }, [initialSubtask]);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  const handleSave = async () => {
    // TODO: API call to save changes
    if (onUpdate && subtask) {
      onUpdate(subtask);
    }
    setIsEditing(false);
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim() || !subtask) return;

    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newChecklistItem,
      completed: false,
      order: (subtask.checklistItems?.length || 0) + 1,
    };

    setSubtask({
      ...subtask,
      checklistItems: [...(subtask.checklistItems || []), newItem],
    });
    setNewChecklistItem('');

    // TODO: API call to save checklist item
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!subtask) return;

    setSubtask({
      ...subtask,
      checklistItems: subtask.checklistItems?.map(item =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined,
            }
          : item
      ),
    });

    // TODO: API call to update checklist item
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!subtask) return;

    setSubtask({
      ...subtask,
      checklistItems: subtask.checklistItems?.filter(item => item.id !== itemId),
    });

    // TODO: API call to delete checklist item
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !subtask) return;

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newComment,
      createdBy: 'current-user', // TODO: Get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
    };

    setSubtask({
      ...subtask,
      comments: [comment, ...(subtask.comments || [])],
    });
    setNewComment('');

    // TODO: API call to save comment
  };

  // Don't render if no subtask
  if (!subtask) return null;

  const completionPercentage = subtask.checklistItems?.length
    ? Math.round(
        (subtask.checklistItems.filter(item => item.completed).length /
          subtask.checklistItems.length) *
          100
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={subtask.title}
                  onChange={(e) =>
                    setSubtask({ ...subtask, title: e.target.value })
                  }
                  className="text-2xl font-bold"
                />
              ) : (
                <DialogTitle className="text-2xl flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSubtask({ ...subtask, completed: !subtask.completed })
                    }
                    className="p-0 h-8 w-8"
                  >
                    <CheckSquare
                      className={`h-6 w-6 ${
                        subtask.completed
                          ? 'text-green-600 fill-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </Button>
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </DialogTitle>
              )}

              {/* Badges de Status, Prioridade, etc */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className={statusColors[subtask.status]}>
                  {subtask.status.replace('_', ' ')}
                </Badge>
                <Badge className={priorityColors[subtask.priority]}>
                  <Flag className="h-3 w-3 mr-1" />
                  {subtask.priority}
                </Badge>
                {subtask.dueDate && (
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(subtask.dueDate).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
                {subtask.assignedTo && (
                  <Badge variant="outline">
                    <User className="h-3 w-3 mr-1" />
                    {subtask.assignedTo}
                  </Badge>
                )}
                {subtask.tags?.map(tag => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={onDelete}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Edit2 className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckSquare className="h-4 w-4 mr-2" />
              Checklist ({subtask.checklistItems?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comentários ({subtask.comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* TAB: Detalhes */}
            <TabsContent value="details" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Descrição</label>
                {isEditing ? (
                  <Textarea
                    value={subtask.description || ''}
                    onChange={(e) =>
                      setSubtask({ ...subtask, description: e.target.value })
                    }
                    placeholder="Adicione uma descrição detalhada..."
                    rows={6}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                    {subtask.description || 'Sem descrição'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={subtask.status}
                    onChange={(e) =>
                      setSubtask({
                        ...subtask,
                        status: e.target.value as any,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="review">Em Revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select
                    value={subtask.priority}
                    onChange={(e) =>
                      setSubtask({
                        ...subtask,
                        priority: e.target.value as any,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full mt-2 px-3 py-2 border rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Horas Estimadas
                  </label>
                  <Input
                    type="number"
                    value={subtask.estimatedHours || ''}
                    onChange={(e) =>
                      setSubtask({
                        ...subtask,
                        estimatedHours: parseInt(e.target.value) || undefined,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Horas Reais
                  </label>
                  <Input
                    type="number"
                    value={subtask.actualHours || ''}
                    onChange={(e) =>
                      setSubtask({
                        ...subtask,
                        actualHours: parseInt(e.target.value) || undefined,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Anexos */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anexos ({subtask.attachments?.length || 0})
                </label>
                <div className="mt-2 space-y-2">
                  {subtask.attachments?.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{attachment.fileName}</span>
                        <span className="text-xs text-gray-500">
                          ({(attachment.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button size="sm" variant="ghost">
                        Download
                      </Button>
                    </div>
                  ))}
                  {isEditing && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Anexo
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB: Checklist */}
            <TabsContent value="checklist" className="space-y-4">
              {/* Progress Bar */}
              {subtask.checklistItems && subtask.checklistItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progresso</span>
                    <span className="text-gray-500">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add New Item */}
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Adicionar item à checklist..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddChecklistItem();
                    }
                  }}
                />
                <Button onClick={handleAddChecklistItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {subtask.checklistItems?.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 group"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : ''
                      }`}
                    >
                      {item.title}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {(!subtask.checklistItems || subtask.checklistItems.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum item na checklist. Adicione o primeiro!
                  </p>
                )}
              </div>
            </TabsContent>

            {/* TAB: Comentários */}
            <TabsContent value="comments" className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário... (use @ para mencionar)"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {subtask.comments?.map(comment => (
                  <div key={comment.id} className="border-l-2 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-sm">{comment.createdBy}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('pt-BR')}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-400">(editado)</span>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {(!subtask.comments || subtask.comments.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum comentário ainda. Seja o primeiro!
                  </p>
                )}
              </div>
            </TabsContent>

            {/* TAB: Histórico */}
            <TabsContent value="activity" className="space-y-3">
              {subtask.activityLog?.map(activity => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 border-l-2 border-gray-300 dark:border-gray-600"
                >
                  <History className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userId}</span>
                      {' '}
                      <span className="text-gray-600 dark:text-gray-400">
                        {activity.action}
                      </span>
                      {activity.field && (
                        <span className="text-gray-500">
                          {' '}{activity.field}
                        </span>
                      )}
                    </p>
                    {activity.oldValue && activity.newValue && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="line-through">{activity.oldValue}</span>
                        {' → '}
                        <span className="font-medium">{activity.newValue}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}

              {(!subtask.activityLog || subtask.activityLog.length === 0) && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade registrada
                </p>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
