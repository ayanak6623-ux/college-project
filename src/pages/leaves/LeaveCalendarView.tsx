import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Search, Filter, Clock, CheckCircle, XCircle, User, 
  X, AlertCircle, Eye, CalendarDays, ShieldCheck
} from 'lucide-react';
import { useLeaveStore } from '../../store/leaveStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import type { LeaveRequest } from '../../types/leave';

// Helper to format Date to 'YYYY-MM-DD'
const formatDateStr = (year: number, month: number, day: number): string => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

export const LeaveCalendarView: React.FC = () => {
  const { user } = useAuthStore();
  const isEmployee = user?.role === 'Employee';

  const { leaveRequests, leaveTypes, updateLeaveRequestStatus } = useLeaveStore();
  const { employees } = useEmployeeStore();

  // Navigation State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Pending' | 'Rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Modal / Detail States
  const [inspectLeave, setInspectLeave] = useState<LeaveRequest | null>(null);
  const [dayDetails, setDayDetails] = useState<{ dateStr: string; displayDate: string; items: any[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Header display string e.g. "October 2026"
  const monthDisplay = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
  }, [currentDate]);

  // Today key for highlight
  const todayStr = useMemo(() => {
    const now = new Date();
    return formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Enriched and Filtered Leave Requests
  const activeLeavesMap = useMemo(() => {
    const map = new Map<string, Array<{ request: LeaveRequest; employee: any; leaveType: any }>>();

    leaveRequests.forEach((req) => {
      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) return;
      
      // Type filter
      if (typeFilter !== 'all' && req.leaveTypeId !== typeFilter) return;

      const emp = employees.find((e) => e.id === req.employeeId);
      const lt = leaveTypes.find((t) => t.id === req.leaveTypeId);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : (req as any).employeeName || 'Staff Member';

      // Employee search filter
      if (searchEmployee.trim()) {
        const query = searchEmployee.toLowerCase();
        const matchesName = empName.toLowerCase().includes(query);
        const matchesId = emp?.empId?.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return;
      }

      // If user is Employee role, restrict to their own leaves only
      if (isEmployee) {
        const isSelf = emp?.email?.toLowerCase() === user?.email?.toLowerCase() || req.employeeId === (user as any)?.id;
        if (!isSelf) return;
      }

      // Populate across all days covered by this leave
      if (!req.fromDate || !req.toDate) return;
      const start = new Date(req.fromDate);
      const end = new Date(req.toDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

      const cursor = new Date(start);
      // Safety limit of 60 days to prevent infinite loop on corrupted date ranges
      let guard = 0;
      while (cursor <= end && guard < 60) {
        const key = formatDateStr(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push({ request: req, employee: emp, leaveType: lt });
        cursor.setDate(cursor.getDate() + 1);
        guard++;
      }
    });

    return map;
  }, [leaveRequests, employees, leaveTypes, statusFilter, typeFilter, searchEmployee, isEmployee, user]);

  // Calendar Days Grid Construction
  const calendarCells = useMemo(() => {
    const cells: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateStr = formatDateStr(year, month - 1, dayNum);
      const dayOfWeek = new Date(year, month - 1, dayNum).getDay();
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = formatDateStr(year, month, d);
      const dayOfWeek = new Date(year, month, d).getDay();
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Next month padding to fill complete 7-day rows (up to 35 or 42 cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = formatDateStr(year, month + 1, d);
      const dayOfWeek = new Date(year, month + 1, d).getDay();
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    return cells;
  }, [year, month, todayStr]);

  // Month-level Metrics
  const monthStats = useMemo(() => {
    let totalEvents = 0;
    let approvedCount = 0;
    let pendingCount = 0;

    const seenRequestIds = new Set<string>();

    calendarCells.forEach(cell => {
      if (!cell.isCurrentMonth) return;
      const items = activeLeavesMap.get(cell.dateStr) || [];
      items.forEach(it => {
        totalEvents++;
        if (!seenRequestIds.has(it.request.id)) {
          seenRequestIds.add(it.request.id);
          if (it.request.status === 'Approved') approvedCount++;
          if (it.request.status === 'Pending') pendingCount++;
        }
      });
    });

    return { totalEvents, approvedCount, pendingCount, uniqueRequests: seenRequestIds.size };
  }, [calendarCells, activeLeavesMap]);

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar: Navigation + Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Month Title & Prev/Next Buttons */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shadow-sm">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {monthDisplay}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {monthStats.uniqueRequests} Leave application(s) active this month
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0 rounded-lg">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} className="h-8 px-2.5 text-xs font-semibold rounded-lg">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0 rounded-lg">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold">
            {(['all', 'Approved', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-primary-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Leave Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code})
              </option>
            ))}
          </select>

          {/* Employee Search Filter (HR only) */}
          {!isEmployee && (
            <div className="relative min-w-[180px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter employee..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Quick Metrics Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Active Leave Days</span>
          <span className="text-base font-black text-slate-900 dark:text-white">{monthStats.totalEvents}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Approved
          </span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{monthStats.approvedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending Review
          </span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400">{monthStats.pendingCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Types Active
          </span>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{leaveTypes.length} Types</span>
        </div>
      </div>

      {/* 3. Leave Types Color Legend */}
      <div className="flex flex-wrap items-center gap-3 px-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Leave Categories:</span>
        {leaveTypes.map((lt) => (
          <div key={lt.id} className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: lt.color }} />
            <span>{lt.name}</span>
          </div>
        ))}
      </div>

      {/* 4. Full Enterprise Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
            <div
              key={d}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
          {calendarCells.map((cell) => {
            const dayLeaves = activeLeavesMap.get(cell.dateStr) || [];
            const hasLeaves = dayLeaves.length > 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => {
                  if (hasLeaves) {
                    const formattedDisplay = new Intl.DateTimeFormat('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(cell.dateStr));
                    setDayDetails({ dateStr: cell.dateStr, displayDate: formattedDisplay, items: dayLeaves });
                  }
                }}
                className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-400/70 dark:text-slate-600'
                    : cell.isWeekend
                    ? 'bg-slate-50/20 dark:bg-slate-800/10'
                    : 'bg-white dark:bg-slate-900'
                } ${cell.isToday ? 'ring-2 ring-inset ring-primary-500/50 bg-primary-50/10' : ''} ${
                  hasLeaves ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
                }`}
              >
                {/* Top Row: Date Number & Count Badge */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      cell.isToday
                        ? 'w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm'
                        : cell.isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {hasLeaves && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {dayLeaves.length}
                    </span>
                  )}
                </div>

                {/* Leaves Badges in this Cell */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayLeaves.slice(0, 2).map((item, idx) => {
                    const empName = item.employee
                      ? `${item.employee.firstName} ${item.employee.lastName}`
                      : (item.request as any).employeeName || 'Employee';
                    const ltColor = item.leaveType?.color || '#3b82f6';
                    const isApproved = item.request.status === 'Approved';

                    return (
                      <div
                        key={`${item.request.id}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectLeave(item.request);
                        }}
                        style={{ borderLeftColor: ltColor }}
                        className="group flex items-center justify-between gap-1 text-[11px] p-1 rounded-md bg-slate-50 dark:bg-slate-800/70 border-l-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: isApproved ? '#10b981' : '#f59e0b' }}
                            title={item.request.status}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {empName.split(' ')[0]}
                          </span>
                        </div>
                        <span
                          className="text-[9px] font-bold px-1 rounded text-white shrink-0"
                          style={{ backgroundColor: ltColor }}
                        >
                          {item.leaveType?.code || 'LV'}
                        </span>
                      </div>
                    );
                  })}

                  {/* Overflow indicator if > 2 leaves */}
                  {dayLeaves.length > 2 && (
                    <div className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline pt-0.5 text-center">
                      +{dayLeaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modal: Single Leave Detail Inspection */}
      <AnimatePresence>
        {inspectLeave && (() => {
          const emp = employees.find((e) => e.id === inspectLeave.employeeId);
          const lt = leaveTypes.find((t) => t.id === inspectLeave.leaveTypeId);
          const empName = emp ? `${emp.firstName} ${emp.lastName}` : (inspectLeave as any).employeeName || 'Staff Member';

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setInspectLeave(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Header with Leave Type Color Accent */}
                <div
                  className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between"
                  style={{ borderTop: `4px solid ${lt?.color || '#3b82f6'}` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {empName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{empName}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp?.empId || 'EMP'} • {emp?.department || 'General'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectLeave(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Leave Type</span>
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: lt?.color || '#3b82f6' }}
                    >
                      {lt?.name || 'Casual Leave'} ({lt?.code || 'CL'})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Duration</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {inspectLeave.totalDays} Day{inspectLeave.totalDays > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Status</p>
                      <Badge
                        variant={
                          inspectLeave.status === 'Approved'
                            ? 'success'
                            : inspectLeave.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                        className="mt-0.5"
                      >
                        {inspectLeave.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Dates Range</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {inspectLeave.fromDate} <span className="text-slate-400">to</span> {inspectLeave.toDate}
                    </p>
                    {inspectLeave.isHalfDay && (
                      <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                        Half Day Request
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Reason / Justification</p>
                    <p className="text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl mt-1 text-xs">
                      "{inspectLeave.reason || 'No specific justification provided.'}"
                    </p>
                  </div>

                  {inspectLeave.comments && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">Review Note:</span>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{inspectLeave.comments}</span>
                    </div>
                  )}

                  {/* Actions for HR Admin if request is still Pending */}
                  {!isEmployee && inspectLeave.status === 'Pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          updateLeaveRequestStatus(inspectLeave.id, 'Rejected', 'HR Admin', 'Rejected via Calendar');
                          setInspectLeave(null);
                        }}
                      >
                        <XCircle size={15} className="mr-1" /> Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          updateLeaveRequestStatus(inspectLeave.id, 'Approved', 'HR Admin', 'Approved via Calendar');
                          setInspectLeave(null);
                        }}
                      >
                        <CheckCircle size={15} className="mr-1" /> Approve
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 6. Modal: Full Day Absences Inspection (When clicking on a date cell) */}
      <AnimatePresence>
        {dayDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDayDetails(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Workforce On Leave ({dayDetails.displayDate})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {dayDetails.items.length} employee(s) scheduled on leave
                  </p>
                </div>
                <button
                  onClick={() => setDayDetails(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {dayDetails.items.map((item, idx) => {
                  const emp = item.employee;
                  const lt = item.leaveType;
                  const empName = emp ? `${emp.firstName} ${emp.lastName}` : (item.request as any).employeeName || 'Staff Member';

                  return (
                    <div
                      key={`${item.request.id}-${idx}`}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {empName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">{empName}</p>
                          <p className="text-xs text-slate-500">{emp?.department || 'Employee'} • {emp?.empId || 'EMP'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: lt?.color || '#3b82f6' }}
                        >
                          {lt?.code || 'LV'}
                        </span>
                        <Badge
                          variant={
                            item.request.status === 'Approved'
                              ? 'success'
                              : item.request.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                          }
                          className="text-[10px]"
                        >
                          {item.request.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDayDetails(null);
                            setInspectLeave(item.request);
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye size={12} className="mr-1" /> View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

