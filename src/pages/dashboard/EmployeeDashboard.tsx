import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  Coffee, CalendarClock, Play, Square, Send,
  Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { useLeaveStore } from '../../store/leaveStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { cn } from '../../utils/cn';

export const EmployeeDashboard = () => {
  const { user } = useAuthStore();
  const { addLeaveRequest, leaveRequests, leaveTypes } = useLeaveStore();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isClockedIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todayStr = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const myLeaves = leaveRequests.filter(l => l.employeeId === (user as any)?.id || l.employeeId === user?.email || (l as any).employee === user?.name);
  const pendingLeavesCount = myLeaves.filter(l => l.status === 'Pending').length;
  const approvedLeavesCount = myLeaves.filter(l => l.status === 'Approved').length;

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      toast.success('Clocked out successfully!', { icon: '👋' });
    } else {
      setIsClockedIn(true);
      setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success('Clocked in successfully!', { icon: '🚀' });
    }
  };

  const [leaveForm, setLeaveForm] = useState({ type: 'Sick Leave', fromDate: '', toDate: '', reason: '' });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate) {
      toast.error('Please select dates');
      return;
    }
    
    // Auto calculate days roughly
    const d1 = new Date(leaveForm.fromDate);
    const d2 = new Date(leaveForm.toDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const lt = leaveTypes.find(t => t.name.toLowerCase() === leaveForm.type.toLowerCase()) || leaveTypes[0];
    addLeaveRequest({
      employeeId: (user as any)?.id || user?.email || 'emp-1',
      leaveTypeId: lt?.id || 'lt-1',
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      totalDays: diffDays,
      isHalfDay: false,
      reason: leaveForm.reason
    });

    toast.success('Leave request submitted successfully');
    setLeaveForm({ type: 'Sick Leave', fromDate: '', toDate: '', reason: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Premium Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden bg-slate-900 shadow-2xl">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary-600/40 via-secondary-500/20 to-transparent rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/30 to-transparent rounded-full blur-[80px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="z-10 text-white w-full md:w-1/2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Employee Portal
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight flex flex-wrap items-baseline gap-x-3 leading-tight">
              <span className="text-white drop-shadow-sm">Hello,</span>
              <span className="relative inline-block font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 drop-shadow-[0_2px_16px_rgba(165,180,252,0.65)]">
                {user?.name || 'Employee'}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-slate-200">
              <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 text-sm font-medium shadow-sm">
                <Calendar size={16} className="mr-2 text-indigo-300" />
                {todayStr}
              </span>
              <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 text-sm font-medium shadow-sm">
                <Clock size={16} className="mr-2 text-purple-300" />
                {timeStr}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Premium Clock-in Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.2, type: 'spring' }}
          className="z-10 w-full md:w-auto relative"
        >
          <div className="glass-panel p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-6 relative overflow-hidden">
            {/* Dynamic glow effect based on status */}
            <div className={cn(
              "absolute inset-0 opacity-20 transition-colors duration-1000",
              isClockedIn ? "bg-gradient-to-r from-rose-500/50 to-orange-500/50" : "bg-gradient-to-r from-emerald-500/50 to-teal-500/50"
            )} />
            
            <div className="relative">
              <button 
                onClick={handleClockToggle}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl hover:scale-105 active:scale-95 group relative overflow-hidden z-20 border-2",
                  isClockedIn 
                    ? "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 shadow-rose-500/30" 
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-emerald-500/30"
                )}
              >
                {!isClockedIn && (
                  <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-emerald-400 z-0"
                  />
                )}
                {isClockedIn ? (
                  <Square size={28} fill="currentColor" className="relative z-10" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1 relative z-10" />
                )}
              </button>
            </div>

            <div className="relative z-10 min-w-[140px]">
              <p className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-1">
                {isClockedIn ? 'Active Session' : 'Ready to work'}
              </p>
              <AnimatePresence mode="wait">
                {isClockedIn ? (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-3xl font-bold text-white tracking-tight font-mono tabular-nums drop-shadow-md">
                      {formatElapsed(elapsedTime)}
                    </p>
                    <p className="text-xs text-rose-300 mt-1 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1.5"></span>
                      Clocked in at {clockTime}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-xl font-semibold text-white">Not clocked in</p>
                    <p className="text-xs text-emerald-300 mt-1 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      Shift active
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balances */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 dark:bg-emerald-900/10 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-inner">
                      <CalendarClock size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Casual Leave</p>
                      <p className="text-xs font-medium text-slate-500">8 of 12 days left</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">8</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/10 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 shadow-inner">
                      <Coffee size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Sick Leave</p>
                      <p className="text-xs font-medium text-slate-500">4 of 6 days left</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">4</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{pendingLeavesCount}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Pending Requests</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedLeavesCount}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Approved Leaves</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Leave Request Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select 
                  label="Leave Type" 
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                  options={[
                    {label: 'Sick Leave', value: 'Sick Leave'},
                    {label: 'Casual Leave', value: 'Casual Leave'},
                    {label: 'Vacation Leave', value: 'Vacation Leave'},
                    {label: 'Unpaid Leave', value: 'Unpaid Leave'}
                  ]}
                />
                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <Input 
                    label="From Date" 
                    type="date" 
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({...leaveForm, fromDate: e.target.value})}
                    required
                  />
                  <Input 
                    label="To Date" 
                    type="date" 
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({...leaveForm, toDate: e.target.value})}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input 
                    label="Reason for leave" 
                    placeholder="Enter reason..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit">
                  Submit Request <Send size={16} className="ml-2" />
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold mb-4">My Recent Requests</h4>
              {myLeaves.length > 0 ? (
                <div className="space-y-3">
                  {myLeaves.slice(0, 3).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          leave.status === 'Approved' ? "bg-emerald-100 text-emerald-600" :
                          leave.status === 'Rejected' ? "bg-rose-100 text-rose-600" :
                          "bg-amber-100 text-amber-600"
                        )}>
                          {leave.status === 'Approved' ? <CheckCircle2 size={18} /> :
                           leave.status === 'Rejected' ? <XCircle size={18} /> :
                           <Clock size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{leaveTypes.find(t => t.id === leave.leaveTypeId)?.name || (leave as any).type || 'Leave'}</p>
                          <p className="text-xs text-slate-500">{leave.fromDate || (leave as any).startDate} to {leave.toDate || (leave as any).endDate} ({leave.totalDays ?? (leave as any).days} days)</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        leave.status === 'Approved' ? "text-emerald-700 bg-emerald-100" :
                        leave.status === 'Rejected' ? "text-rose-700 bg-rose-100" :
                        "text-amber-700 bg-amber-100"
                      )}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-border text-slate-500 text-sm">
                  No leave requests found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
