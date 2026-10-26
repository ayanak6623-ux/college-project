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
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { cn } from '../../utils/cn';

export const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { attendanceRecords } = useAttendanceStore();
  const { leaveRequests } = useLeaveStore();

  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'tasks' | 'me'>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponses, setCopilotResponses] = useState<{ query: string; answer: string }[]>([
    {
      query: 'What is today’s team attendance rate?',
      answer: 'Today 92% of your team is present on time. 1 team member is currently on approved annual leave.'
    }
  ]);

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
    
    let answer = 'Analyzing team metrics: All operations are running within optimal parameters.';
    const q = copilotQuery.toLowerCase();
    if (q.includes('attendance') || q.includes('present')) {
      answer = `Today, ${todayAttendance.present} out of ${todayAttendance.total} team members have checked in with verified biometric stamps.`;
    } else if (q.includes('leave') || q.includes('absent')) {
      answer = `Currently ${todayAttendance.onLeave} team member has an approved leave. Next upcoming holiday is in 12 days.`;
    } else if (q.includes('staff') || q.includes('employee') || q.includes('team')) {
      answer = `You have ${teamMembers.length} active team members reporting directly to your department.`;
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
                Live Manager Supervision
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">{user?.name || 'Michael Chen'}</span> {greeting.icon}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Team Operations & Daily Supervision Hub. Manage team attendance, monitor daily check-ins, leaves, tasks, and supervise team performance.
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

        {/* Card 4: Team Punctuality */}
        <Card 
          onClick={() => setActiveTab('attendance')}
          className="rounded-2xl border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 cursor-pointer hover:shadow-md transition-all group"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Team Punctuality</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">96% On-Time</h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                View Attendance logs <ChevronRight size={12} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
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
              {/* Quick Team Attendance & Leaves Snapshot */}
              <Card className="rounded-2xl border-indigo-200/80 dark:border-indigo-900/60 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                    Today's Attendance Status
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs text-indigo-600 font-bold"
                  >
                    View Radar
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">On-Duty Present:</span>
                      <span className="font-bold text-emerald-600">{todayAttendance.present} / {todayAttendance.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${todayAttendance.total > 0 ? (todayAttendance.present / todayAttendance.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-500 font-medium">Approved Leave:</span>
                      <span className="font-bold text-amber-600">{todayAttendance.onLeave} Members</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button 
                      onClick={() => setActiveTab('attendance')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold text-xs py-2 rounded-xl border border-indigo-200/60"
                    >
                      Team Radar
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('tasks')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      Team Agenda
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Copilot Card */}
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
                  <p className="text-xs text-slate-300 mt-0.5">Instant intelligence on team leaves, productivity, shift hours & attendance.</p>
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

      {/* AI Copilot Drawer */}
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
