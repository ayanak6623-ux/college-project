import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, Circle, Clock, Plus, 
  Calendar, AlertCircle, Filter, Trash2, Check,
  UserCheck, Shield, ChevronRight, Sparkles, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { useEmployeeStore } from '../../store/employeeStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: 'HR Management' | 'Operations' | 'Sprint' | 'Compliance';
  assignedTo: string; // e.g. "HR Admin (Sarah Jenkins)"
  assignedRole: 'HR Admin' | 'Manager' | 'Employee';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdAt: string;
}

const initialTasks: TaskItem[] = [
  {
    id: 'tsk-101',
    title: 'Verify & Regularize October Biometric Attendance Logs',
    description: 'Audit automated attendance logs from MongoDB Atlas and approve manual punch adjustments for hybrid staff.',
    category: 'HR Management',
    assignedTo: 'Sarah Jenkins (HR Admin)',
    assignedRole: 'HR Admin',
    priority: 'Urgent',
    status: 'In Progress',
    dueDate: '2026-10-28',
    createdAt: '2026-10-25',
  },
  {
    id: 'tsk-102',
    title: 'Issue Offer Letter & Onboarding Kit for Junior Developer',
    description: 'Process staffing requisition submitted by Michael Chen (Operations Manager) and release digital offer letter.',
    category: 'HR Management',
    assignedTo: 'HR Admin Team',
    assignedRole: 'HR Admin',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-10-29',
    createdAt: '2026-10-26',
  },
  {
    id: 'tsk-103',
    title: 'Complete Bi-annual Manager Performance Review Cycle',
    description: 'Collect department feedback and submit team appraisal recommendations to the executive board.',
    category: 'Operations',
    assignedTo: 'Michael Chen (Manager)',
    assignedRole: 'Manager',
    priority: 'Normal',
    status: 'Completed',
    dueDate: '2026-10-24',
    createdAt: '2026-10-20',
  },
  {
    id: 'tsk-104',
    title: 'Update Statutory PF & Indian Rupee (₹) Deduction Registers',
    description: 'Ensure accurate tax slabs and provident fund calculations are updated across all active payroll records.',
    category: 'Compliance',
    assignedTo: 'Sarah Jenkins (HR Admin)',
    assignedRole: 'HR Admin',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-10-31',
    createdAt: '2026-10-26',
  },
  {
    id: 'tsk-105',
    title: 'Q4 Team Sprint Retrospective & Resource Planning',
    description: 'Review delivery velocity and plan next quarter project staffing requirements with department heads.',
    category: 'Sprint',
    assignedTo: 'Operations Team',
    assignedRole: 'Manager',
    priority: 'Normal',
    status: 'In Progress',
    dueDate: '2026-11-03',
    createdAt: '2026-10-24',
  },
];

export const TasksPage = () => {
  const { user } = useAuthStore();
  const { employees } = useEmployeeStore();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskItem['category']>('HR Management');
  const [assignedTo, setAssignedTo] = useState('Sarah Jenkins (HR Admin)');
  const [priority, setPriority] = useState<TaskItem['priority']>('High');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask: TaskItem = {
      id: 'tsk-' + Date.now().toString().slice(-4),
      title: title.trim(),
      description: description.trim() || 'No specific description provided.',
      category,
      assignedTo,
      assignedRole: assignedTo.includes('HR') ? 'HR Admin' : 'Manager',
      priority,
      status: 'Pending',
      dueDate,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks([newTask, ...tasks]);
    toast.success(`Task created and assigned to ${assignedTo}!`, { icon: '📋' });
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        toast.success(`Task marked as ${nextStatus}!`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task removed');
  };

  const filteredTasks = tasks.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ClipboardList size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Workforce Tasks & Operations Agenda
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create, assign, and track operational tasks for HR Admin, managers, and cross-department workflows.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span>+ Assign Task to HR</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{inProgressCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Circle size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'Pending', 'In Progress', 'Completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                filterStatus === st 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              )}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <option value="all">All Categories</option>
            <option value="HR Management">HR Management</option>
            <option value="Operations">Operations</option>
            <option value="Sprint">Sprint</option>
            <option value="Compliance">Compliance</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group",
              task.status === 'Completed'
                ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60"
            )}
          >
            <div className="flex items-start gap-3.5 flex-1">
              <button
                onClick={() => handleToggleStatus(task.id)}
                className={cn(
                  "mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                  task.status === 'Completed'
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "border-slate-300 dark:border-slate-700 hover:border-indigo-500"
                )}
                title="Toggle Task Completion"
              >
                {task.status === 'Completed' && <Check size={14} className="stroke-[3]" />}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                    {task.category}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md",
                    task.priority === 'Urgent' ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" :
                    task.priority === 'High' ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {task.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {task.id}</span>
                </div>

                <h3 className={cn(
                  "font-bold text-sm sm:text-base text-slate-900 dark:text-white",
                  task.status === 'Completed' && "line-through text-slate-400 dark:text-slate-500"
                )}>
                  {task.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Shield size={13} /> Assigned to: <strong>{task.assignedTo}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> Due: {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold border",
                task.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300" :
                task.status === 'In Progress' ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300" :
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              )}>
                {task.status}
              </span>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create & Assign Task */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create & Assign Workforce Task</h3>
                    <p className="text-xs text-slate-400">Direct assignment to HR Admin or department leads</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Task Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Audit attendance regularization requests for Q4"
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assignee</label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="Sarah Jenkins (HR Admin)">Sarah Jenkins (HR Admin)</option>
                      <option value="Ayaan Khan (HR Admin)">Ayaan Khan (HR Admin)</option>
                      <option value="HR Admin Team">HR Admin Team</option>
                      <option value="Michael Chen (Manager)">Michael Chen (Manager)</option>
                      <option value="Operations Team">Operations Team</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="HR Management">HR Management</option>
                      <option value="Operations">Operations</option>
                      <option value="Sprint">Sprint</option>
                      <option value="Compliance">Compliance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description / Action Steps</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide details or reference documents..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-5">
                    Assign Task
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
