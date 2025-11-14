import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const [filter, setFilter] = useState<'all' | 'today' | 'priority' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask(formData);
    setFormData({ title: '', date: '', time: '', priority: 'medium' });
    setShowForm(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return task.date === today;
    }
    if (filter === 'priority') return task.priority === 'high';
    if (filter === 'completed') return task.completed;
    return true;
  });

  const priorityColors = {
    low: '#2ed573',
    medium: '#ffa502',
    high: '#ff4757',
  };

  return (
    <div className="min-h-full overflow-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[var(--text)] mb-1">Task Planner</h2>
            <p className="text-sm text-[var(--muted)]">
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-6 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)] placeholder-[var(--muted)]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 bg-[var(--elevated)] text-[var(--text)] border border-[var(--stroke)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--glow)] text-white rounded-xl transition-all"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-[var(--elevated)] hover:bg-[var(--stroke)] text-[var(--text)] rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {(['all', 'today', 'priority', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--elevated)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)]">
              No tasks found. Add a task to get started!
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group p-4 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl hover:border-[var(--accent)] transition-all ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-[var(--accent)] hover:scale-110 transition-transform"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-[var(--text)] mb-2 ${
                        task.completed ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                      {task.date && <span>📅 {task.date}</span>}
                      {task.time && <span>🕐 {task.time}</span>}
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-xs"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
