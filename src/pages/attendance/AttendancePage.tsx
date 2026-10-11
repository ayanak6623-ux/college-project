import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar as CalendarIcon, UserCheck, UserX, Clock, Clock4, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useEmployeeStore } from '../../store/employeeStore';
import type { AttendanceStatus } from '../../types/attendance';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const { attendanceRecords, updateAttendance, shifts } = useAttendanceStore();
  const { employees } = useEmployeeStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);
  
  const enrichedRecords = useMemo(() => {
    let result = employees.map(emp => {
      const record = todayRecords.find(r => r.employeeId === emp.id);
      const shift = shifts.find(s => s.id === emp.shiftId) || shifts[0];
      return {
        employee: emp,
        shift,
        record: record || {
          id: `new-${emp.id}`,
          employeeId: emp.id,
          date: selectedDate,
          shiftId: emp.shiftId,
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttendance(editingRecord.id, {
      checkIn: editingRecord.checkIn,
      checkOut: editingRecord.checkOut,
      status: editingRecord.status,
      notes: editingRecord.notes
    });
    setEditingRecord(null);
    toast.success('Attendance record updated');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Absent': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Late': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Half-day': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'On Leave': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

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
                          onClick={() => setEditingRecord({ ...record, employeeName: `${employee.firstName} ${employee.lastName}` })}
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
