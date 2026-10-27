import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Calendar as CalendarIcon, UserCheck, UserX, 
  Clock, Clock4, Edit, Play, Square, CalendarClock, CheckCircle2,
  Calendar, ArrowRight, ShieldCheck, Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useEmployeeStore } from '../../store/employeeStore';
import type { AttendanceStatus } from '../../types/attendance';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const { user } = useAuthStore();
  const isEmployee = user?.role === 'Employee';

  const { 
    attendanceRecords, 
    updateAttendance, 
    shifts, 
    saveAttendanceRecord,
    clockInEmployee,
    clockOutEmployee,
    getActiveSession
  } = useAttendanceStore();
  const { employees } = useEmployeeStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const matchedEmp = employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase() || e.id === (user as any)?.id);
  const employeeId = matchedEmp?.id || (user as any)?.id || '1';

  // Persistent Employee Punch & Shift State
  const [session, setSession] = useState<any>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(r => r.employeeId === employeeId && r.date === todayDateStr);

  useEffect(() => {
    // Initial load check
    const active = getActiveSession(employeeId);
    setSession(active);
    if (active) {
      setElapsedSeconds(Math.floor((Date.now() - active.checkInTimestamp) / 1000));
    }
  }, [employeeId, getActiveSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      const active = getActiveSession(employeeId);
      if (active) {
        setSession(active);
        setElapsedSeconds(Math.floor((Date.now() - active.checkInTimestamp) / 1000));
      } else if (session) {
        setSession(null);
        toast('Shift completed! Auto clocked-out.', { icon: '🏁' });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [employeeId, getActiveSession, session]);

  const isClockedIn = !!session;
  const clockInTime = session?.checkInTimeStr || todayRecord?.checkIn || null;

  const handlePunchToggle = async () => {
    if (isClockedIn) {
      const { checkOutTimeStr, totalHours } = await clockOutEmployee(employeeId, false);
      setSession(null);
      toast.success(`Clocked out at ${checkOutTimeStr}! Logged ${totalHours} hours. Synced with HR panel.`, { icon: '👋' });
    } else {
      const { checkInTimeStr } = await clockInEmployee(employeeId, matchedEmp?.shiftId || 'shift-1');
      const newSession = getActiveSession(employeeId);
      setSession(newSession);
      toast.success(`Clocked in at ${checkInTimeStr}! Timer is running continuously across logout.`, { icon: '✅' });
    }
  };

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Personal employee attendance logs (Mock/Real history for October)
  const personalLogs = useMemo(() => {
    return [
      { 
        date: todayDateStr, 
        day: 'Monday (Today)', 
        in: clockInTime || todayRecord?.checkIn || '--:--', 
        out: isClockedIn ? '--:--' : (todayRecord?.checkOut || '--:--'), 
        shift: 'Shift A (09:00 - 18:00)', 
        hours: todayRecord?.totalHours ? `${todayRecord.totalHours} hrs` : (isClockedIn ? formatElapsed(elapsedSeconds) : '--'), 
        status: todayRecord?.status || (isClockedIn ? 'Present' : 'Not Clocked In') 
      },
      { date: '2026-10-25', day: 'Sunday', in: '--:--', out: '--:--', shift: 'Weekly Off', hours: '--', status: 'Weekly Off' },
      { date: '2026-10-24', day: 'Saturday', in: '--:--', out: '--:--', shift: 'Weekly Off', hours: '--', status: 'Weekly Off' },
      { date: '2026-10-23', day: 'Friday', in: '09:12 AM', out: '06:05 PM', shift: 'Shift A (09:00 - 18:00)', hours: '8h 53m', status: 'Present' },
      { date: '2026-10-22', day: 'Thursday', in: '09:28 AM', out: '06:15 PM', shift: 'Shift A (09:00 - 18:00)', hours: '8h 47m', status: 'Late' },
      { date: '2026-10-21', day: 'Wednesday', in: '09:05 AM', out: '06:00 PM', shift: 'Shift A (09:00 - 18:00)', hours: '8h 55m', status: 'Present' },
      { date: '2026-10-20', day: 'Tuesday', in: '09:10 AM', out: '06:12 PM', shift: 'Shift A (09:00 - 18:00)', hours: '9h 02m', status: 'Present' },
      { date: '2026-10-19', day: 'Monday', in: '--:--', out: '--:--', shift: 'Shift A (09:00 - 18:00)', hours: '--', status: 'On Leave' },
      { date: '2026-10-16', day: 'Friday', in: '09:14 AM', out: '06:00 PM', shift: 'Shift A (09:00 - 18:00)', hours: '8h 46m', status: 'Present' },
      { date: '2026-10-15', day: 'Thursday', in: '09:08 AM', out: '06:10 PM', shift: 'Shift A (09:00 - 18:00)', hours: '9h 02m', status: 'Present' },
    ];
  }, [clockInTime, isClockedIn, todayRecord, todayDateStr, elapsedSeconds]);

  // Admin/Manager view records
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);
  
  const enrichedRecords = useMemo(() => {
    let result = employees.map(emp => {
      const record = todayRecords.find(r => r.employeeId === emp.id || r.employeeId === emp.empId);
      const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];
      return {
        employee: emp,
        shift,
        record: record || {
          id: `new-${emp.empId || emp.id}`,
          employeeId: emp.empId || emp.id,
          date: selectedDate,
          shiftId: emp.shiftId || 'shift-1',
          totalHours: 0,
          status: 'Absent' as AttendanceStatus
        }
      };
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.employee.firstName.toLowerCase().includes(q) ||
        r.employee.lastName.toLowerCase().includes(q) ||
        r.employee.empId.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(r => r.record.status === statusFilter);
    }
    
    return result;
  }, [employees, todayRecords, shifts, searchQuery, statusFilter, selectedDate]);

  const summary = useMemo(() => {
    const present = enrichedRecords.filter(r => r.record.status === 'Present').length;
    const absent = enrichedRecords.filter(r => r.record.status === 'Absent').length;
    const late = enrichedRecords.filter(r => r.record.status === 'Late').length;
    const halfDay = enrichedRecords.filter(r => r.record.status === 'Half-day').length;
    const onLeave = enrichedRecords.filter(r => r.record.status === 'On Leave').length;
    return { present, absent, late, halfDay, onLeave };
  }, [enrichedRecords]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    let calculatedHours = editingRecord.totalHours || 0;
    if (editingRecord.checkIn && editingRecord.checkOut) {
      const [inH, inM] = editingRecord.checkIn.split(':').map(Number);
      const [outH, outM] = editingRecord.checkOut.split(':').map(Number);
      const diffMin = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMin > 0) {
        calculatedHours = Number((diffMin / 60).toFixed(1));
      }
    } else if (editingRecord.status === 'Present') {
      calculatedHours = 8.5;
    } else {
      calculatedHours = 0;
    }

    await saveAttendanceRecord({
      employeeId: editingRecord.employeeId,
      date: editingRecord.date || selectedDate,
      shiftId: editingRecord.shiftId || 'shift-1',
      checkIn: editingRecord.checkIn || undefined,
      checkOut: editingRecord.checkOut || undefined,
      status: editingRecord.status,
      totalHours: calculatedHours,
      notes: editingRecord.notes || ''
    });

    setEditingRecord(null);
    toast.success('Attendance record updated and saved to MongoDB!');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Absent': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Late': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Half-day': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'On Leave': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Weekly Off': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  // ==========================================
  // EMPLOYEE PERSONAL ATTENDANCE VIEW
  // ==========================================
  if (isEmployee) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50">
                Self-Service Attendance
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Attendance & Logs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Personal check-in timesheet, daily punches, and working hours history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Shift: 09:00 AM – 06:00 PM (Shift A)
            </span>
          </div>
        </div>

        {/* Live Punch Widget & Personal Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Clock-in Card */}
          <Card className="lg:col-span-1 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Punch Terminal</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isClockedIn ? 'Active Work Session' : (todayRecord?.checkOut ? 'Shift Completed' : 'Ready to Punch')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isClockedIn 
                  ? `Clocked in at ${clockInTime}. Time elapsed: ${formatElapsed(elapsedSeconds)}` 
                  : (todayRecord?.checkOut 
                      ? `Shift ended. Out at ${todayRecord.checkOut} (${todayRecord.totalHours || 8.5} hrs logged).` 
                      : 'Record your daily punch with single click.')}
              </p>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <button
                onClick={handlePunchToggle}
                className={cn(
                  "w-24 h-24 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-xl hover:scale-105 active:scale-95 group relative border-2",
                  isClockedIn 
                    ? "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 shadow-rose-500/30" 
                    : "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-emerald-500/30"
                )}
              >
                {isClockedIn ? (
                  <>
                    <Square size={26} fill="currentColor" />
                    <span className="text-[11px] font-bold mt-1">Clock Out</span>
                  </>
                ) : (
                  <>
                    <Play size={28} fill="currentColor" className="ml-1" />
                    <span className="text-[11px] font-bold mt-1">{todayRecord?.checkOut ? 'Re-Clock' : 'Clock In'}</span>
                  </>
                )}
              </button>
              <div className="mt-3 text-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {clockInTime ? (
                    <>Today's In: <strong className="text-slate-800 dark:text-slate-200">{clockInTime}</strong></>
                  ) : (
                    <span>Not clocked in yet</span>
                  )}
                  {todayRecord?.checkOut && (
                    <span className="ml-2 text-rose-500 font-medium">| Out: <strong>{todayRecord.checkOut}</strong></span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Standard: 8.5 Hours</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check size={12} /> Biometrics Synced
              </span>
            </div>
          </Card>

          {/* Personal Monthly Attendance Summary */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Present Days</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">21</h4>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold mt-3">October 2026</p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">On-Time Rate</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">96%</h4>
              </div>
              <p className="text-[11px] text-indigo-600 font-bold mt-3">High Punctuality</p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Late Arrivals</p>
                <h4 className="text-2xl font-black text-amber-600 mt-1">1</h4>
              </div>
              <p className="text-[11px] text-amber-600 font-bold mt-3">Within Grace Period</p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Leaves Taken</p>
                <h4 className="text-2xl font-black text-purple-600 mt-1">1</h4>
              </div>
              <p className="text-[11px] text-purple-600 font-bold mt-3">Authorized Leave</p>
            </Card>

            {/* Quick Info Banner */}
            <div className="col-span-2 sm:col-span-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Punches are automatically logged into PeopleHub secure attendance register.</span>
              </div>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Total Hours: 168.5 hrs</span>
            </div>
          </div>
        </div>

        {/* Personal Attendance Logs Table */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarClock size={18} className="text-indigo-600 dark:text-indigo-400" />
                My Daily Punch Log (October 2026)
              </CardTitle>
              <p className="text-xs text-slate-500">Your historical punch-in and punch-out timestamps</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              10 Days Shown
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date & Day</th>
                    <th className="px-6 py-3 font-semibold">Shift Timing</th>
                    <th className="px-6 py-3 font-semibold">Punch In</th>
                    <th className="px-6 py-3 font-semibold">Punch Out</th>
                    <th className="px-6 py-3 font-semibold">Working Hours</th>
                    <th className="px-6 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {personalLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{log.date}</span>
                        <span className="text-xs text-slate-400">{log.day}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        {log.shift}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.in}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {log.out}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {log.hours}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold inline-block", getStatusColor(log.status))}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // HR ADMIN / MANAGER ATTENDANCE MANAGEMENT VIEW
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor and manage employee attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            className="w-48 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck size={24} className="text-emerald-600 dark:text-emerald-400 mb-2" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.present}</h3>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Present</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserX size={24} className="text-rose-600 dark:text-rose-400 mb-2" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.absent}</h3>
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Absent</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock size={24} className="text-amber-600 dark:text-amber-400 mb-2" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.late}</h3>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Late</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock4 size={24} className="text-orange-600 dark:text-orange-400 mb-2" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.halfDay}</h3>
            <p className="text-xs font-medium text-orange-700 dark:text-orange-400">Half Day</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CalendarIcon size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary.onLeave}</h3>
            <p className="text-xs font-medium text-purple-700 dark:text-purple-400">On Leave</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none outline-none text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half-day">Half-day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Shift</th>
                  <th className="px-6 py-4 font-medium">Check In</th>
                  <th className="px-6 py-4 font-medium">Check Out</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedRecords.length > 0 ? (
                  enrichedRecords.map(({ employee, shift, record }) => (
                    <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{employee.firstName} {employee.lastName}</p>
                            <p className="text-xs text-slate-500">{employee.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{shift?.name}</span>
                        <div className="text-xs text-slate-400">{shift?.startTime} - {shift?.endTime}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {record.checkIn ? record.checkIn : <span className="text-slate-400 font-normal">--:--</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {record.checkOut ? record.checkOut : <span className="text-slate-400 font-normal">--:--</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border border-transparent", getStatusColor(record.status))}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setEditingRecord({ 
                            ...record, 
                            employeeId: employee.empId || employee.id,
                            date: selectedDate,
                            shiftId: employee.shiftId || record.shiftId || 'shift-1',
                            employeeName: `${employee.firstName} ${employee.lastName}` 
                          })}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors inline-flex items-center"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No attendance records found for this criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Attendance</h3>
                <p className="text-sm text-slate-500">{editingRecord.employeeName} • {selectedDate}</p>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Check In" 
                      type="time" 
                      value={editingRecord.checkIn || ''} 
                      onChange={e => setEditingRecord({...editingRecord, checkIn: e.target.value})}
                    />
                    <Input 
                      label="Check Out" 
                      type="time" 
                      value={editingRecord.checkOut || ''} 
                      onChange={e => setEditingRecord({...editingRecord, checkOut: e.target.value})}
                    />
                  </div>
                  <Select 
                    label="Status" 
                    value={editingRecord.status}
                    onChange={e => setEditingRecord({...editingRecord, status: e.target.value})}
                    options={['Present', 'Absent', 'Late', 'Half-day', 'On Leave'].map(s => ({label: s, value: s}))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                    <textarea 
                      value={editingRecord.notes || ''}
                      onChange={e => setEditingRecord({...editingRecord, notes: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                      rows={3}
                      placeholder="Add any notes or reason..."
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-border bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditingRecord(null)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
