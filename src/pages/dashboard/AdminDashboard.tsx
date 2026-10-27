import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserX, Clock, Calendar, Check, X, 
  ShieldCheck, Briefcase, User, ArrowUpRight, ChevronRight, 
  FileText, CheckCircle2, Award, Sparkles, Building2, Eye, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { cn } from '../../utils/cn';
import { departmentData, upcomingHolidays } from '../../data/mockData';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';

// Count-up counter animation
const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = Math.max(1, end / (duration / 16));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}</span>;
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { employees, fetchEmployees, getEmployee } = useEmployeeStore();
  const { attendanceRecords } = useAttendanceStore();
  const { leaveRequests, leaveTypes, updateLeaveRequestStatus } = useLeaveStore();

  const [currentTime, setCurrentTime] = useState(new Date());

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

  const todayStr = currentTime.toISOString().split('T')[0];
  const today = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const timeFormatted = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const totalEmployees = employees.length;
  const managersCount = employees.filter(e => e.role === 'Manager' || e.designation?.toLowerCase().includes('manager')).length;
  const staffCount = totalEmployees - managersCount;
  
  // 7-day attendance trend
  const dynamicAttendanceData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const presentCount = attendanceRecords.filter(r => r.date === dateStr && (r.status === 'Present' || r.status === 'Late' || r.status === 'Half-day')).length;
      data.push({ name: dayName, present: presentCount });
    }
    return data;
  }, [attendanceRecords]);

  const presentToday = dynamicAttendanceData[6]?.present || 0;
  const onLeave = attendanceRecords.filter(e => e.date === todayStr && e.status === 'On Leave').length;
  const pendingRequestsCount = leaveRequests.filter(r => r.status === 'Pending').length;

  const statCards = [
    { 
      title: 'Total Workforce Directory', 
      value: totalEmployees, 
      icon: Users, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      glow: 'bg-indigo-500',
      badge: `${staffCount} Staff · ${managersCount} Mgr`,
      badgeStyle: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60'
    },
    { 
      title: 'Present & On-Duty Today', 
      value: presentToday, 
      icon: UserCheck, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      glow: 'bg-emerald-500',
      badge: totalEmployees > 0 ? `${Math.round((presentToday / totalEmployees) * 100)}% Verified` : 'Shift Active',
      badgeStyle: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60'
    },
    { 
      title: 'Scheduled On Leave', 
      value: onLeave, 
      icon: UserX, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      glow: 'bg-amber-500',
      badge: 'Authorized Off',
      badgeStyle: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60'
    },
    { 
      title: 'Pending Leave Approvals', 
      value: pendingRequestsCount, 
      icon: Clock, 
      color: 'text-rose-600 dark:text-rose-400', 
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      glow: 'bg-rose-500',
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Action Req.` : 'All Reviewed',
      badgeStyle: pendingRequestsCount > 0 ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 animate-pulse' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    },
  ];

  const recentHires = [...employees].sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()).slice(0, 5);

  const handleApproveLeave = (leaveId: string, empName: string) => {
    updateLeaveRequestStatus(leaveId, 'Approved', 'HR Admin');
    toast.success(`Leave approved for ${empName}!`, { icon: '✅' });
  };

  const handleRejectLeave = (leaveId: string, empName: string) => {
    updateLeaveRequestStatus(leaveId, 'Rejected', 'HR Admin');
    toast.error(`Leave request declined.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto">
      {/* 1. Executive HR Administration Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 border border-indigo-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 tracking-wide uppercase">
                <ShieldCheck size={14} className="text-indigo-400" />
                Central HR Administration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync: Employee & Manager Portals
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200">{user?.name || 'Sarah Jenkins'}</span> {greeting.icon}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              PeopleHub Enterprise HR Operations Hub. Oversee company workforce directory, audit biometric attendance compliance, review leave applications, and manage employee records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 text-right">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1.5">
                <Clock size={12} className="text-indigo-400" />
                Real-time System Clock
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-wide">{timeFormatted}</div>
              <div className="text-[11px] text-indigo-200/80">{today}</div>
            </div>
          </div>
        </div>

        {/* Quick HR Navigation Shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 relative z-10">
          <Button
            onClick={() => navigate('/employees')}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
          >
            <Plus size={14} />
            <span>Manage Employees</span>
          </Button>

          <Button
            onClick={() => navigate('/attendance')}
            variant="outline"
            size="sm"
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs rounded-xl flex items-center gap-1.5"
          >
            <UserCheck size={14} className="text-emerald-400" />
            <span>Audit Attendance</span>
          </Button>

          <Button
            onClick={() => navigate('/leaves')}
            variant="outline"
            size="sm"
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs rounded-xl flex items-center gap-1.5"
          >
            <Calendar size={14} className="text-amber-400" />
            <span>Leave Requests ({pendingRequestsCount})</span>
          </Button>

          <Button
            onClick={() => navigate('/policies')}
            variant="outline"
            size="sm"
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs rounded-xl flex items-center gap-1.5"
          >
            <FileText size={14} className="text-purple-400" />
            <span>Company Policy Letter</span>
          </Button>
        </div>
      </div>

      {/* 2. Core HR Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="h-full"
          >
            <div className="h-full relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between group">
              <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity", stat.glow)} />
              
              <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {stat.title}
                </span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-sm", stat.bg)}>
                  <stat.icon size={19} className={stat.color} />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/70 relative z-10">
                <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums leading-none">
                  <CountUp end={stat.value} />
                </h3>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border leading-tight", stat.badgeStyle)}>
                  {stat.badge}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Role Hierarchy & Relationship Matrix (HR Admin <-> Manager <-> Employee Connected) */}
      <Card className="rounded-2xl border-indigo-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                Workforce Hierarchy & Role Coordination
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How HR Admin, Department Managers, and Staff Employees operate synchronously in PeopleHub HRMS.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            3-Tier Architecture
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Pillar 1: HR Admin */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-600 text-white">
                  TOP TIER
                </span>
                <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">HR Administration</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Central System Authority (Sarah Jenkins).</strong> Manages employee master directory, reviews & approves company-wide leaves, audits biometric attendance, releases payslips, and publishes official corporate policies.
              </p>
              <div className="pt-2 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Scope: Entire Organization
              </div>
            </div>

            {/* Pillar 2: Manager */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-600 text-white">
                  MID TIER
                </span>
                <Briefcase size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Department Manager</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Operations Lead (Michael Chen).</strong> Supervises direct reports (Aman Verma, James Wilson), tracks real-time team punctuality & geo-fence presence (96% on-time), conducts 1-on-1 meetings, and manages department tasks.
              </p>
              <div className="pt-2 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                Scope: Operations & Direct Reports
              </div>
            </div>

            {/* Pillar 3: Employee */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white">
                  BASE TIER
                </span>
                <User size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Staff Employee</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Workforce Contributors (Aman Verma / Staff).</strong> Performs daily digital check-in / check-out, applies for paid leaves (reviewed by HR Admin), views personal attendance history, and downloads salary payslips.
              </p>
              <div className="pt-2 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Scope: Self Attendance & Leaves
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Company Attendance Compliance (Weekly Trend)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Automated biometric & mobile attendance synchronization</p>
            </div>
            <button 
              onClick={() => navigate('/attendance')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Full Logs →
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Employees by Department
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Headcount distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center text-xs">
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{dept.name} ({dept.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Bottom Operations Row: Recent Employees & Pending Leave Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees Master Table */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Workforce Master Directory (Recent)
              </CardTitle>
              <p className="text-xs text-slate-500">Live MongoDB employee records</p>
            </div>
            <button 
              onClick={() => navigate('/employees')} 
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              View Full Directory ({totalEmployees}) →
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-bold">Staff Member</th>
                    <th className="px-4 py-3 font-bold">Role & Level</th>
                    <th className="px-4 py-3 font-bold">Department</th>
                    <th className="px-4 py-3 font-bold">Manager</th>
                    <th className="px-4 py-3 rounded-r-lg font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentHires.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{emp.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold",
                          emp.role === 'HR Admin' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" :
                          emp.role === 'Manager' ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {emp.role || 'Employee'}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">{emp.designation}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 font-medium">{emp.department}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{emp.reportingManager || 'Executive Board'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold",
                          emp.status === 'Active' 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Center: Pending Leave Approvals */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Leave Approvals Desk
                </CardTitle>
                <p className="text-xs text-slate-500">Employee applications awaiting HR review</p>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {pendingRequestsCount} Pending
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveRequests.filter(r => r.status === 'Pending').slice(0, 4).map((leave) => {
                  const emp = getEmployee(leave.employeeId);
                  const empName = emp ? `${emp.firstName} ${emp.lastName}` : (leave as any).employee || 'Employee';
                  const lt = leaveTypes.find(t => t.id === leave.leaveTypeId);
                  const ltName = lt ? lt.name : (leave as any).type || 'Leave';
                  return (
                    <div key={leave.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{empName}</p>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{ltName} ({leave.totalDays ?? (leave as any).days} days)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{leave.fromDate ?? (leave as any).startDate} to {leave.toDate ?? (leave as any).endDate}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleApproveLeave(leave.id, empName)}
                            title="Approve Leave"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleRejectLeave(leave.id, empName)}
                            title="Reject Leave"
                            className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {leaveRequests.filter(r => r.status === 'Pending').length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">All leave requests cleared</p>
                    <p className="text-[11px]">No employee applications pending HR sign-off</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Holidays */}
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Company Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHolidays.map((holiday, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{holiday.name}</p>
                      <p className="text-[10px] text-slate-400">{holiday.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
