import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, UserX, Clock, 
  MoreHorizontal, Check, X, Calendar 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import { useAuthStore } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { cn } from '../../utils/cn';
import { 
  mockStats, attendanceData, departmentData, leaveOverviewData, 
  recentEmployees, pendingLeaves, upcomingHolidays 
} from '../../data/mockData';

import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';

// Simple count up component
const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = end / (duration / 16);
    
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
  
  // Calculate attendance trend for the last 7 days
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
      title: 'Total Employees', 
      value: totalEmployees, 
      icon: Users, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      glow: 'bg-indigo-500',
      badge: 'Workforce',
      badgeStyle: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60'
    },
    { 
      title: 'Present Today', 
      value: presentToday, 
      icon: UserCheck, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      glow: 'bg-emerald-500',
      badge: presentToday > 0 ? `${presentToday} Active` : 'Shift Active',
      badgeStyle: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60'
    },
    { 
      title: 'On Leave', 
      value: onLeave, 
      icon: UserX, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      glow: 'bg-amber-500',
      badge: 'Scheduled',
      badgeStyle: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60'
    },
    { 
      title: 'Pending Requests', 
      value: pendingRequestsCount, 
      icon: Clock, 
      color: 'text-rose-600 dark:text-rose-400', 
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      glow: 'bg-rose-500',
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : 'All Clear',
      badgeStyle: pendingRequestsCount > 0 ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 animate-pulse' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    },
  ];

  const recentHires = [...employees].sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()).slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-secondary-500/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight flex flex-wrap items-baseline gap-x-2">
            <span>{greeting.text},</span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-600 to-indigo-700 dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 drop-shadow-sm">
              {user?.name || 'HR Admin'}
            </span>
            <span className="text-xl inline-block select-none">{greeting.icon}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400 mt-1">
            <p className="flex items-center text-sm font-medium">
              <Calendar size={15} className="mr-1.5 text-primary-500" />
              {today}
            </p>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <p className="flex items-center text-sm font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-border/50">
              <Clock size={14} className="mr-1.5 text-secondary-500" />
              {timeFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Perfectly Aligned & Symmetrical */}
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
              {/* Subtle ambient colored corner glow */}
              <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity", stat.glow)} />
              
              {/* Top Row: Title + Themed Icon */}
              <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {stat.title}
                </span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-sm", stat.bg)}>
                  <stat.icon size={19} className={stat.color} />
                </div>
              </div>

              {/* Bottom Row: Large Number + Pill Badge (Exact same baseline across all cards) */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trend (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
                  <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{dept.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Employees</CardTitle>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 rounded-r-lg font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHires.map((emp) => (
                    <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium",
                          emp.status === 'Active' 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : emp.status === 'On Leave'
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
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

        {/* Action Center */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.filter(r => r.status === 'Pending').slice(0, 5).map((leave) => {
                  const emp = getEmployee(leave.employeeId);
                  const empName = emp ? `${emp.firstName} ${emp.lastName}` : (leave as any).employee || 'Employee';
                  const lt = leaveTypes.find(t => t.id === leave.leaveTypeId);
                  const ltName = lt ? lt.name : (leave as any).type || 'Leave';
                  return (
                    <div key={leave.id} className="flex items-start justify-between p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{empName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ltName} ({leave.totalDays ?? (leave as any).days} days)</p>
                        <p className="text-xs text-slate-500 mt-1">{leave.fromDate ?? (leave as any).startDate} to {leave.toDate ?? (leave as any).endDate}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => updateLeaveRequestStatus(leave.id, 'Approved', 'HR Admin')}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => updateLeaveRequestStatus(leave.id, 'Rejected', 'HR Admin')}
                          className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {leaveRequests.filter(r => r.status === 'Pending').length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No pending requests</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHolidays.map((holiday, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{holiday.name}</p>
                      <p className="text-xs text-slate-500">{holiday.date}</p>
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
