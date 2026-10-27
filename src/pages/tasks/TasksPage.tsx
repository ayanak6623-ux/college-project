import React, { useState, useMemo } from 'react';
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
  category: 'HR Management' | 'Operations' | 'Sprint' | 'Compliance' | 'Training' | 'General';
  assignedTo: string;
  assignedRole: 'HR Admin' | 'Manager' | 'Employee';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdAt: string;
}

// Admin / Manager tasks
const adminTasks: TaskItem[] = [
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
    title: 'Review & Verify Monthly Payroll Registers & Payslip Records',
    description: 'Audit employee attendance summaries, verify net salary calculations, and release electronic payslips history.',
    category: 'HR Management',
    assignedTo: 'Sarah Jenkins (HR Admin)',
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

// Employee individual work tasks
const employeeInitialTasks: TaskItem[] = [
  {
    id: 'emp-tsk-1',
    title: 'Submit Monthly Travel & Expense Claims for October',
    description: 'Upload valid receipts and conveyance bills before 30th October for monthly payroll reimbursement processing.',
    category: 'General',
    assignedTo: 'Self (Employee)',
    assignedRole: 'Employee',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-10-29',
    createdAt: '2026-10-26',
  },
  {
    id: 'emp-tsk-2',
    title: 'Complete Annual Workplace Security & Data Protection Module',
    description: 'Go through cybersecurity compliance refresher on PeopleHub LMS and complete the mandatory 10-question evaluation.',
    category: 'Training',
    assignedTo: 'Self (Employee)',
    assignedRole: 'Employee',
    priority: 'Urgent',
    status: 'In Progress',
    dueDate: '2026-10-28',
    createdAt: '2026-10-25',
  },
  {
    id: 'emp-tsk-3',
    title: 'Review Engineering Sprint Deliverables & PR Submissions',
    description: 'Complete pending code reviews on GitHub and push test suite coverage for the quarterly release.',
    category: 'Sprint',
    assignedTo: 'Self (Employee)',
    assignedRole: 'Employee',
    priority: 'Normal',
    status: 'Completed',
    dueDate: '2026-10-24',
    createdAt: '2026-10-22',
  },
  {
    id: 'emp-tsk-4',
    title: 'Acknowledge Updated Company Policy Circular',
    description: 'Review formal circular PH/HR/CIR-2026/01 and sign off digital acknowledgement in PeopleHub Policies tab.',
    category: 'Compliance',
    assignedTo: 'Self (Employee)',
    assignedRole: 'Employee',
    priority: 'Normal',
    status: 'Pending',
    dueDate: '2026-11-02',
    createdAt: '2026-10-26',
  },
];

export const TasksPage = () => {
  const { user } = useAuthStore();
  const isEmployee = user?.role === 'Employee';

  const [tasks, setTasks] = useState<TaskItem[]>(isEmployee ? employeeInitialTasks : adminTasks);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskItem['category']>(isEmployee ? 'General' : 'HR Management');
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
      assignedTo: isEmployee ? (user?.name || 'Self') : 'Sarah Jenkins (HR Admin)',
      assignedRole: isEmployee ? 'Employee' : 'HR Admin',
      priority,
      status: 'Pending',
      dueDate,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks([newTask, ...tasks]);
    toast.success(isEmployee ? 'Task added to your checklist!' : 'Task created successfully!', { icon: '📋' });
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
              {isEmployee ? 'My Tasks & Daily To-Dos' : 'Workforce Tasks & Operations Agenda'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEmployee 
              ? 'Track, prioritize, and complete your individual work tasks, sprint items, and training requirements.'
              : 'Create, assign, and track operational tasks for HR Admin, managers, and cross-department workflows.'}
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span>{isEmployee ? 'Add Personal Task' : 'Create Task'}</span>
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
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                filterStatus === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              )}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {isEmployee ? (
              <>
                <option value="General">General</option>
                <option value="Training">Training</option>
                <option value="Sprint">Sprint</option>
                <option value="Compliance">Compliance</option>
              </>
            ) : (
              <>
                <option value="HR Management">HR Management</option>
                <option value="Operations">Operations</option>
                <option value="Compliance">Compliance</option>
                <option value="Sprint">Sprint</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isDone = task.status === 'Completed';

          return (
            <div
              key={task.id}
              className={cn(
                "p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                isDone
                  ? "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs"
              )}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border",
                    isDone 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-800"
                  )}
                  title={isDone ? "Mark Incomplete" : "Mark Complete"}
                >
                  {isDone ? <Check size={14} /> : null}
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                      {task.category}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      task.priority === 'Urgent' ? "bg-rose-50 text-rose-700 border-rose-200" :
                      task.priority === 'High' ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    )}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {task.id}</span>
                  </div>

                  <h3 className={cn(
                    "text-sm sm:text-base font-bold",
                    isDone 
                      ? "line-through text-slate-400 dark:text-slate-500" 
                      : "text-slate-900 dark:text-white"
                  )}>
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Shield size={12} className="text-indigo-500" />
                      {task.assignedTo}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={12} />
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                <span className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full",
                  task.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200" :
                  task.status === 'In Progress' ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200" :
                  "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                )}>
                  {task.status}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No tasks found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isEmployee ? 'Add Personal Task' : 'Create Workforce Task'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isEmployee ? 'Add a new work deliverable or to-do item to your board.' : 'Assign operational tasks across HR, Managers, and departments.'}
                </p>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Task Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete quarterly security assessment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Task Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide actionable context or deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none"
                    >
                      {isEmployee ? (
                        <>
                          <option value="General">General</option>
                          <option value="Training">Training</option>
                          <option value="Sprint">Sprint</option>
                          <option value="Compliance">Compliance</option>
                        </>
                      ) : (
                        <>
                          <option value="HR Management">HR Management</option>
                          <option value="Operations">Operations</option>
                          <option value="Compliance">Compliance</option>
                          <option value="Sprint">Sprint</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                    Save Task
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
