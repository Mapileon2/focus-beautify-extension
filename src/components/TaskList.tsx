import React, { useState } from 'react';
import { Plus, Check, X, Edit3, Filter, Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskState } from '@/hooks/useTaskState';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function TaskList() {
  const { user } = useAuth();
  const {
    tasks,
    activeTasks,
    completedTasks,
    localTaskCount,
    filter,
    sortBy,
    isLoading,
    isSyncing,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter,
    setSortBy,
    syncLocalTasks
  } = useTaskState();

  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      await createTask({
        title: newTask.trim(),
        completed: false,
        priority: 'medium'
      });
      setNewTask('');
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditText(task.title);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId) return;

    try {
      await updateTask(editingId, { title: editText.trim() });
      setEditingId(null);
      setEditText('');
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSyncLocal = async () => {
    try {
      await syncLocalTasks();
      toast.success('Local tasks synced to database');
    } catch (error) {
      toast.error('Failed to sync local tasks');
    }
  };

  return (
    <Card className="glass p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
          <div className="flex items-center gap-2">
            {/* Sync Status Indicator */}
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : user ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            
            {/* Local Tasks Badge */}
            {localTaskCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {localTaskCount} local
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {user ? 'Synced across devices' : 'Sign in to sync tasks'}
          </p>
          
          {localTaskCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncLocal}
              disabled={!user || isSyncing}
              className="text-xs"
            >
              Sync Local
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="mb-4 flex gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Recent</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add new task */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder={user ? "Add a new task..." : "Sign in to save tasks"}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          className="glass"
          disabled={isSyncing}
        />
        <Button
          variant="timer"
          size="icon"
          onClick={addTask}
          disabled={!newTask.trim() || isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Task Statistics */}
      <div className="mb-4 grid grid-cols-2 gap-4 text-center">
        <div className="rounded-lg bg-card/50 p-3">
          <div className="text-lg font-semibold text-foreground">{activeTasks.length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="rounded-lg bg-card/50 p-3">
          <div className="text-lg font-semibold text-green-600">{completedTasks.length}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm">
              {filter === 'all' 
                ? 'No tasks yet. Add one above to get started!' 
                : `No ${filter} tasks found.`}
            </div>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-3 transition-all ${
                task.completed ? 'opacity-60' : ''
              } ${task.isLocal ? 'border-yellow-500/50 bg-yellow-500/10' : ''}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id)}
                className="flex-shrink-0"
                disabled={isSyncing}
              />

              <div className="flex-1 min-w-0">
                {editingId === task.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onBlur={saveEdit}
                    autoFocus
                    className="h-auto border-none bg-transparent p-0 text-sm focus-visible:ring-0"
                    disabled={isSyncing}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-sm text-foreground ${
                          task.completed ? 'line-through' : ''
                        }`}
                      >
                        {task.title}
                      </div>
                      
                      {/* Priority Badge */}
                      {task.priority !== 'medium' && (
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      )}
                      
                      {/* Local Task Indicator */}
                      {task.isLocal && (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Local
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-1">
                {editingId === task.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveEdit}
                      className="h-8 w-8 p-0"
                      disabled={isSyncing}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(task)}
                      className="h-8 w-8 p-0"
                      disabled={isSyncing}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={isSyncing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}