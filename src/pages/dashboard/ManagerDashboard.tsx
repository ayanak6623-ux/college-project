import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, Clock, 
  Send, UserPlus, CheckCircle2, XCircle, AlertCircle,
  Calendar, MapPin, Briefcase, Sparkles, Building2,
  ChevronRight, Search, Filter, ShieldAlert, Award,
  Receipt, FileText, Megaphone, Check, Plus, Eye,
  ArrowUpRight, Phone, Mail, DollarSign, Laptop, RefreshCw, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';
import { useManagerRequestStore, type ManagerRequest } from '../../store/managerRequestStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

export const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { attendanceRecords } = useAttendanceStore();
  const { leaveRequests } = useLeaveStore();
  const { requests, addRequest, deleteRequest } = useManagerRequestStore();

  const [activeTab, setActiveTab] = useState<'home' | 'hr-requests' | 'attendance' | 'tasks' | 'me'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponses, setCopilotResponses] = useState<{ query: string; answer: string }[]>([
    {
      query: 'What is today’s team attendance rate?',
      answer: 'Today 92% of your team is present on time. 1 team member is currently on approved annual leave.'
    }
  ]);

  // Request form state
  const [requestType, setRequestType] = useState<ManagerRequest['type']>('add_employee');
  const [requestTitle, setRequestTitle] = useState('');
  const [priority, setPriority] = useState<ManagerRequest['priority']>('High');
  const [justification, setJustification] = useState('');
  
  // Specific employee details when requesting new hire
  const [candidateName, setCandidateName] = useState('');
  const [candidateDept, setCandidateDept] = useState('Operations');
  const [candidateRole, setCandidateRole] = useState('');
  const [candidateSalary, setCandidateSalary] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');

  // Filter state for requests list
  const [requestFilter, setRequestFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');

  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Review Q4 Operations sprint backlog', completed: false, priority: 'High', due: 'Today, 5:00 PM' },
    { id: 't2', title: 'Conduct 1-on-1 review with Aman Verma', completed: true, priority: 'Normal', due: 'Completed' },
    { id: 't3', title: 'Submit hiring proposal to HR Admin', completed: false, priority: 'Urgent', due: 'Tomorrow' },
    { id: 't4', title: 'Verify team geofence logs for field sales', completed: false, priority: 'Low', due: 'Wednesday' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hours = currentTime.getHours();
    if (hours >= 4 && hours < 12) return { text: 'Good morning', icon: '🌅' };
    if (hours >= 12 && hours < 17) return { text: 'Good afternoon', icon: '☀️' };
    if (hours >= 17 && hours < 22) return { text: 'Good evening', icon: '🌇' };
    return { text: 'Good night', icon: '🌙' };
  }, [currentTime]);

  const todayDateStr = currentTime.toISOString().split('T')[0];
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Team employees: find employees under manager's department or operations
  const teamMembers = useMemo(() => {
    return employees.filter(emp => 
      emp.reportingManager?.toLowerCase().includes('michael') ||
      emp.reportingManager?.toLowerCase().includes('chen') ||
      emp.department === 'Operations' ||
      emp.department === 'Sales' ||
      emp.role === 'Employee'
    );
  }, [employees]);

  // Today's team attendance stats
  const todayAttendance = useMemo(() => {
    const todayRecs = attendanceRecords.filter(r => r.date === todayDateStr);
    const presentCount = todayRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const leaveCount = todayRecs.filter(r => r.status === 'On Leave' || r.status === 'Absent').length;
    return {
      present: presentCount || Math.max(teamMembers.length - 1, 1),
      onLeave: leaveCount || 1,
      total: teamMembers.length || 8,
    };
  }, [attendanceRecords, todayDateStr, teamMembers]);

  // Weekly attendance chart data
  const weeklyAttendanceChart = useMemo(() => {
    return [
      { day: 'Mon', present: 7, absent: 1 },
      { day: 'Tue', present: 8, absent: 0 },
      { day: 'Wed', present: 7, absent: 1 },
      { day: 'Thu', present: 8, absent: 0 },
      { day: 'Fri', present: 6, absent: 2 },
    ];
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (requestFilter === 'all') return requests;
    return requests.filter(r => r.status === requestFilter);
  }, [requests, requestFilter]);

  const pendingRequestsCount = useMemo(() => {
    return requests.filter(r => r.status === 'Pending').length;
  }, [requests]);

  // Handle submit request for HR Admin
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestTitle.trim()) {
      toast.error('Please enter a request title');
      return;
    }

    if (requestType === 'add_employee' && !candidateName.trim()) {
      toast.error('Please enter candidate name for staff addition');
      return;
    }

    let categoryLabel = 'General Request';
    let employeeData = undefined;

    if (requestType === 'add_employee') {
      categoryLabel = 'New Staff Addition';
      employeeData = {
        candidateName: candidateName.trim(),
        department: candidateDept,
        designation: candidateRole.trim() || 'Software Engineer',
        expectedSalary: Number(candidateSalary) || 50000,
        employmentType: employmentType,
        email: candidateEmail.trim() || `${candidateName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        phone: candidatePhone.trim() || '+91 98765 00000',
        joiningDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      };
    } else if (requestType === 'leave_approval') {
      categoryLabel = 'Leave / Shift Override';
    } else if (requestType === 'promotion') {
      categoryLabel = 'Promotion & Appraisal';
    } else if (requestType === 'resource') {
      categoryLabel = 'Equipment / Resource';
    }

    addRequest({
      type: requestType,
      title: requestTitle.trim(),
      categoryLabel,
      managerName: user?.name || 'Michael Chen',
      managerEmail: user?.email || 'manager@company.com',
      targetRole: 'HR Admin',
      priority,
      notes: justification.trim() || 'No specific notes provided.',
      employeeDetails: employeeData,
    });

    toast.success('Requisition sent successfully to HR Admin Dashboard!', {
      icon: '🚀',
      duration: 4000,
    });

    // Reset form & close modal
    setRequestTitle('');
    setCandidateName('');
    setCandidateRole('');
    setCandidateSalary('');
    setCandidateEmail('');
    setCandidatePhone('');
    setJustification('');
    setIsModalOpen(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      {
        id: 't-' + Date.now(),
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'Normal',
        due: 'Tomorrow',
      },
      ...tasks,
    ]);
    setNewTaskTitle('');
    toast.success('Task added to your manager agenda');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAskCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    
    let answer = 'Analyzing team metrics: All operations are running within optimal SLA parameters.';
    const q = copilotQuery.toLowerCase();
    if (q.includes('attendance') || q.includes('present')) {
      answer = `Today, ${todayAttendance.present} out of ${todayAttendance.total} team members have checked in with verified biometric stamps.`;
    } else if (q.includes('leave') || q.includes('absent')) {
      answer = `Currently ${todayAttendance.onLeave} team member has an approved leave. Next upcoming holiday is in 12 days.`;
    } else if (q.includes('hire') || q.includes('staff') || q.includes('employee')) {
      answer = `You have ${pendingRequestsCount} active staffing requisition(s) awaiting approval from HR Admin Sarah Jenkins.`;
    }

    setCopilotResponses([{ query: copilotQuery, answer }, ...copilotResponses]);
    setCopilotQuery('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 border border-indigo-900/40 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 tracking-wide uppercase">
                <Briefcase size={13} className="text-indigo-400" />
                Workspace · Manager Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync with HR Admin
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">{user?.name || 'Michael Chen'}</span> {greeting.icon}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Team Operations & Staff Requisitions Hub. Submit new hiring requests directly to HR Admin, manage today's attendance, and supervise team performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 text-right">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1.5">
                <Clock size={12} className="text-indigo-400" />
                Real-time Clock
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-wide">{formattedTime}</div>
              <div className="text-[11px] text-indigo-200/80">{formattedDate}</div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-4 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <UserPlus size={18} />
              <span>+ Request Staff to HR</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Team Members */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Team Strength</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{todayAttendance.total}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ArrowUpRight size={13} /> Direct Reports Active
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/40">
              <Users size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Present Today */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Present Today</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{todayAttendance.present}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check size={13} /> Clocked in on schedule
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/40">
              <UserCheck size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Team On Leave */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">On Leave / Off</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{todayAttendance.onLeave}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Calendar size={13} /> Approved leave status
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40">
              <UserX size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: HR Requisitions (Pending) */}
        <Card 
          onClick={() => setActiveTab('hr-requests')}
          className="rounded-2xl border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 cursor-pointer hover:shadow-md transition-all group"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">HR Requisitions</p>
                {pendingRequestsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingRequestsCount} Pending</h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                View HR Admin status <ChevronRight size={12} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Send size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs matching Manager Workspace Reference */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative",
              activeTab === 'home'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <span>Home (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('hr-requests')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative",
              activeTab === 'hr-requests'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Send size={15} />
            <span>HR Requisitions & Add Staff</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative",
              activeTab === 'attendance'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <MapPin size={15} />
            <span>Attendance & Team Geo-fence</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative",
              activeTab === 'tasks'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <CheckCircle2 size={15} />
            <span>My Tasks & Meetings</span>
          </button>

          <button
            onClick={() => setActiveTab('me')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative",
              activeTab === 'me'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Award size={15} />
            <span>Me (Leaves & Payslips)</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Home (Overview) */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Roster Today */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Team Status & Live Roster Today
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time clock-in status for direct reports
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {teamMembers.length} Members
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {teamMembers.slice(0, 5).map((member, idx) => (
                      <div key={member.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {member.firstName?.[0] || 'E'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </h4>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {member.empId || `EMP-00${idx+1}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.designation || 'Specialist'}</p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div className="hidden sm:block">
                            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {idx % 2 === 0 ? '09:15 AM' : '09:30 AM'}
                            </span>
                            <p className="text-[10px] text-slate-400">Shift A (9 AM - 6 PM)</p>
                          </div>

                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold border",
                            idx === 3 
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60" 
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60"
                          )}>
                            {idx === 3 ? 'On Leave' : 'Present'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Team Attendance Trend */}
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                    Weekly Team Attendance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyAttendanceChart}>
                      <defs>
                        <linearGradient id="managerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#managerGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Quick HR Requisitions & AI Copilot */}
            <div className="space-y-6">
              {/* Quick Requisitions Panel */}
              <Card className="rounded-2xl border-indigo-200 dark:border-indigo-900/60 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send size={16} className="text-indigo-600 dark:text-indigo-400" />
                    Recent HR Requisitions
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('hr-requests')}
                    className="text-xs text-indigo-600 font-bold"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {req.categoryLabel}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300" :
                          req.status === 'Rejected' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300" :
                          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                        )}>
                          {req.status === 'Pending' ? 'Pending HR Review' : req.status}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{req.title}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{req.notes}</p>
                    </div>
                  ))}

                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 font-bold text-xs py-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40"
                  >
                    + Submit New Request to HR Admin
                  </Button>
                </CardContent>
              </Card>

              {/* AI Copilot Card matching reference */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-indigo-800/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                    <Sparkles size={11} className="text-indigo-400" />
                    AI COPILOT
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Ask about workforce</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Instant intelligence on team leaves, productivity, shift hours & staff requisitions.</p>
                </div>
                <Button
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Open Crownco AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: HR Requisitions & Add Staff (CORE USER FEATURE) */}
      {activeTab === 'hr-requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  HR Requisitions & Staff Addition Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Target: HR Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Every request submitted here appears directly on the **HR Admin Dashboard** with live sync. HR Admin can approve, reject, or directly onboard requested staff into MongoDB.
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 shadow-md shadow-indigo-600/20"
            >
              <Plus size={16} />
              <span>+ New Requisition</span>
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {(['all', 'Pending', 'Approved', 'Rejected'] as const).map(filterKey => (
                <button
                  key={filterKey}
                  onClick={() => setRequestFilter(filterKey)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    requestFilter === filterKey
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  )}
                >
                  {filterKey === 'all' ? 'All Requests' : filterKey}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredRequests.length} requisitions
            </span>
          </div>

          {/* Requests Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <Card key={req.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                          {req.categoryLabel}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md",
                          req.priority === 'Urgent' ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300" :
                          req.priority === 'High' ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {req.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{req.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">ID: {req.id} · Submitted {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>

                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black shrink-0 border",
                      req.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300" :
                      req.status === 'Rejected' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300" :
                      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                    )}>
                      {req.status === 'Pending' ? 'Pending HR Review' : req.status}
                    </span>
                  </div>

                  {/* Candidate details preview if staff addition */}
                  {req.employeeDetails && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <UserPlus size={14} className="text-indigo-600 dark:text-indigo-400" />
                          Proposed Staff Member:
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          ₹{Number(req.employeeDetails.expectedSalary).toLocaleString()} /mo
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px]">Candidate:</span>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{req.employeeDetails.candidateName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Role:</span>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{req.employeeDetails.designation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Department:</span>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{req.employeeDetails.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Type:</span>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{req.employeeDetails.employmentType}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Justification Notes */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Manager Justification:</span> {req.notes}
                  </p>

                  {/* HR Feedback / Remarks if reviewed */}
                  {req.hrRemarks && (
                    <div className="text-xs p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200">
                      <span className="font-bold">HR Admin Response:</span> {req.hrRemarks}
                      {req.reviewedBy && (
                        <span className="block text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 font-mono">
                          Reviewed by {req.reviewedBy} on {new Date(req.reviewedAt || '').toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                    <span>Target: HR Admin (Sarah Jenkins)</span>
                    <button
                      onClick={() => {
                        deleteRequest(req.id);
                        toast.success('Requisition retracted');
                      }}
                      className="text-rose-500 hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Attendance & Team Geo-fence */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                Team Geo-fence Live Radar & Check-in Verification
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervise geofenced premises (Head Office 200m zone & Field Sales tracking)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 w-full rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 overflow-hidden border border-indigo-900/60 flex items-center justify-center text-white">
                <div className="w-32 h-32 rounded-full border border-indigo-500/30 animate-ping absolute" />
                <div className="w-48 h-48 rounded-full border border-indigo-500/20 absolute" />
                <div className="relative z-10 text-center space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-lg">
                    <MapPin size={20} />
                  </div>
                  <h4 className="font-bold text-sm">Main Office Geo-fence (HQ-Bhopal)</h4>
                  <p className="text-xs text-indigo-300">Radius: 250m · GPS Precision Verified · 7 Devices Active</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((member, idx) => (
                  <div key={member.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {member.firstName?.[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">{member.firstName} {member.lastName}</h5>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {idx % 2 === 0 ? 'Office Premises (Inside Geofence)' : 'Field Client Visit (GPS Tagged)'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7. Tab 4: My Tasks & Meetings */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks Agenda */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                Manager Action Agenda & Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new manager to-do task..."
                  className="rounded-xl text-xs"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs px-4">
                  Add
                </Button>
              </form>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                      task.completed 
                        ? "bg-slate-50 dark:bg-slate-800/40 text-slate-400 line-through border-slate-200/60 dark:border-slate-800"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center border",
                        task.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                      )}>
                        {task.completed && <Check size={12} />}
                      </div>
                      <span className="text-xs font-medium">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{task.due}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Meetings */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                Scheduled Team Meetings & 1-on-1s
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Weekly Operations Sync', time: 'Today · 2:00 PM - 3:00 PM', attendees: 'Entire Operations Team', link: 'Google Meet' },
                { title: '1-on-1 Performance Sync with HR Admin', time: 'Tomorrow · 11:30 AM', attendees: 'Sarah Jenkins (HR Admin)', link: 'HR Conference Room A' },
                { title: 'New Staff Requisition Alignment', time: 'Thursday · 4:00 PM', attendees: 'Department Leads', link: 'Virtual Sync' },
              ].map((meet, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{meet.title}</h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {meet.link}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{meet.time}</p>
                  <p className="text-[11px] text-slate-400">{meet.attendees}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 8. Tab 5: Me Portal (Leaves & Payslips) */}
      {activeTab === 'me' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt size={18} className="text-indigo-600 dark:text-indigo-400" />
                Manager Salary & Recent Payslips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { month: 'September 2026', gross: '₹95,000', net: '₹84,200', status: 'Paid via Direct Deposit' },
                { month: 'August 2026', gross: '₹95,000', net: '₹84,200', status: 'Paid via Direct Deposit' },
                { month: 'July 2026', gross: '₹95,000', net: '₹84,200', status: 'Paid via Direct Deposit' },
              ].map((slip, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{slip.month}</h5>
                    <p className="text-[11px] text-slate-400">{slip.status}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">{slip.net}</span>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline">Download PDF</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                Company Policies & Standard Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Manager Workforce Hiring Guidelines 2026', code: 'POL-HR-04' },
                { name: 'Overtime & Field Geofence Compensation Policy', code: 'POL-OPS-12' },
                { name: 'Appraisal & Staff Promotion Procedures', code: 'POL-HR-08' },
                { name: 'Code of Conduct & Workplace Ethics', code: 'POL-GEN-01' },
              ].map((pol, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{pol.name}</h5>
                    <p className="text-[10px] text-slate-400">{pol.code}</p>
                  </div>
                  <Eye size={15} className="text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 9. Interactive Modal: Submit Requisition to HR Admin */}
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
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <UserPlus size={16} />
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      Submit Requisition to HR Admin
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live delivery to HR Administration portal
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6 overflow-y-auto space-y-4">
                {/* Fixed Target Indicator */}
                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target Recipient:</span>
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> HR Admin (Sarah Jenkins / Ayaan Khan)
                  </span>
                </div>

                {/* Requisition Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Requisition Category
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="add_employee">Add New Staff / Hiring Requisition</option>
                    <option value="promotion">Employee Promotion / Appraisal Request</option>
                    <option value="leave_approval">Leave / Shift Override Approval</option>
                    <option value="resource">Equipment / Asset Requisition</option>
                    <option value="general">General HR Management Request</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Request Title *
                  </label>
                  <Input
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="e.g. Request to onboard 1 Junior QA Engineer"
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                {/* Candidate fields if adding employee */}
                {requestType === 'add_employee' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      <UserPlus size={14} /> Candidate & Staff Details (To Add to HR)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Candidate Full Name *</label>
                        <Input
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="e.g. Rohan Mehra"
                          required
                          className="rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Proposed Designation *</label>
                        <Input
                          value={candidateRole}
                          onChange={(e) => setCandidateRole(e.target.value)}
                          placeholder="e.g. React Developer"
                          required
                          className="rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Department</label>
                        <select
                          value={candidateDept}
                          onChange={(e) => setCandidateDept(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                        >
                          <option value="Operations">Operations</option>
                          <option value="Sales">Sales</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Expected Monthly Salary (₹)</label>
                        <Input
                          type="number"
                          value={candidateSalary}
                          onChange={(e) => setCandidateSalary(e.target.value)}
                          placeholder="e.g. 55000"
                          className="rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                        <Input
                          type="email"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          placeholder="rohan@example.com"
                          className="rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                        <Input
                          value={candidatePhone}
                          onChange={(e) => setCandidatePhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Low', 'Normal', 'High', 'Urgent'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold border transition-all",
                          priority === p
                            ? p === 'Urgent' ? "bg-rose-600 text-white border-rose-600" :
                              p === 'High' ? "bg-amber-500 text-white border-amber-500" :
                              "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Justification Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Business Justification / Notes for HR Admin *
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    placeholder="Provide context on why this candidate or request is needed for operations..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs px-5 shadow-lg shadow-indigo-600/20"
                  >
                    🚀 Send Requisition to HR Admin
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. AI Copilot Drawer */}
      <AnimatePresence>
        {isCopilotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCopilotOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-950 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  <div>
                    <h3 className="font-extrabold text-sm">Crownco AI Workforce Copilot</h3>
                    <p className="text-[10px] text-indigo-300">Manager Decision Intelligence</p>
                  </div>
                </div>
                <button onClick={() => setIsCopilotOpen(false)} className="text-slate-300 hover:text-white">✕</button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {copilotResponses.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[85%] ml-auto">
                      {item.query}
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 text-xs text-indigo-950 dark:text-indigo-200 max-w-[90%]">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAskCopilot} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <Input
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  placeholder="Ask about team attendance, leaves..."
                  className="rounded-xl text-xs"
                />
                <Button type="submit" className="bg-indigo-600 text-white rounded-xl text-xs px-3">
                  Ask
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
