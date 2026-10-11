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
  const { employees } = useEmployeeStore();
  const { attendanceRecords } = useAttendanceStore();
  const { leaveRequests, updateLeaveRequestStatus } = useLeaveStore();
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const today = todayDate.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
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
    { title: 'Total Employees', value: totalEmployees, icon: Users, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { title: 'Present Today', value: presentToday, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'On Leave', value: onLeave, icon: UserX, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Pending Requests', value: pendingRequestsCount, icon: Clock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const recentHires = [...employees].sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()).slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-secondary-500/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">
            Good morning, <span className="text-gradient">{user?.name || 'HR Admin'}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 flex items-center">
            <Calendar size={16} className="mr-2" />
            {today}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    <CountUp end={stat.value} />
                  </h3>
                </div>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </CardContent>
            </Card>
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
                {leaveRequests.filter(r => r.status === 'Pending').slice(0, 5).map((leave) => (
                  <div key={leave.id} className="flex items-start justify-between p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{leave.employee}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{leave.type} ({leave.days} days)</p>
                      <p className="text-xs text-slate-500 mt-1">{leave.startDate} to {leave.endDate}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => updateLeaveRequestStatus(leave.id, 'Approved')}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => updateLeaveRequestStatus(leave.id, 'Rejected')}
                        className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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
