import React, { useState } from 'react';
import { Plus, Check, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  sessions: number;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Review project proposal', completed: false, sessions: 2 },
    { id: '2', text: 'Write blog post draft', completed: true, sessions: 3 },
    { id: '3', text: 'Plan team meeting agenda', completed: false, sessions: 1 },
  ]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        sessions: 0,
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingId ? { ...task, text: editText.trim() } : task
        )
      );
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <Card className="glass p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Tasks</h3>
        <p className="text-sm text-muted-foreground">
          Stay focused on what matters most
        </p>
      </div>

      {/* Add new task */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          className="glass"
        />
        <Button
          variant="timer"
          size="icon"
          onClick={addTask}
          disabled={!newTask.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-3 transition-all ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="flex-shrink-0"
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
                />
              ) : (
                <>
                  <div
                    className={`text-sm text-foreground ${
                      task.completed ? 'line-through' : ''
                    }`}
                  >
                    {task.text}
                  </div>
                  {task.sessions > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {task.sessions} session{task.sessions !== 1 ? 's' : ''}
                    </div>
                  )}
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
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm">No tasks yet. Add one above to get started!</div>
          </div>
        )}
      </div>
    </Card>
  );
}