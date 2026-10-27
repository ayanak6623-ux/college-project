import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, CalendarDays, CheckCircle, XCircle, Clock,
  Coffee, CalendarClock, ShieldCheck, Check
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { useLeaveStore } from '../../store/leaveStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Tabs } from '../../components/Tabs';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import toast from 'react-hot-toast';

// Helper to calc business days (excluding weekends)
const calculateDays = (start: string, end: string, isHalfDay: boolean) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (d1 > d2) return 0;
  
  let count = 0;
  const cur = new Date(d1);
  while (cur <= d2) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  
  return isHalfDay ? count * 0.5 : count;
};

export const LeavesPage = () => {
  const { user } = useAuthStore();
  const isEmployee = user?.role === 'Employee';

  const { leaveRequests, leaveTypes, addLeaveRequest, updateLeaveRequestStatus } = useLeaveStore();
  const { employees } = useEmployeeStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionReqId, setActionReqId] = useState('');
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [actionComment, setActionComment] = useState('');
  
  // Current logged in employee identity
  const currentEmpId = useMemo(() => {
    const matched = employees.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase() || e.id === (user as any)?.id);
    return matched?.id || (user as any)?.id || 'emp-current';
  }, [employees, user]);

  // Apply Form State
  const [applyForm, setApplyForm] = useState({
    employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', isHalfDay: false, reason: ''
  });

  const totalCalculatedDays = useMemo(() => {
    return calculateDays(applyForm.fromDate, applyForm.toDate, applyForm.isHalfDay);
  }, [applyForm.fromDate, applyForm.toDate, applyForm.isHalfDay]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const empIdToUse = isEmployee ? currentEmpId : applyForm.employeeId;

    if (!empIdToUse || !applyForm.leaveTypeId || !applyForm.fromDate || !applyForm.toDate) {
      return toast.error('Please fill all required fields');
    }
    if (totalCalculatedDays <= 0) {
      return toast.error('Invalid date range or 0 business days selected');
    }
    
    addLeaveRequest({
      employeeId: empIdToUse,
      leaveTypeId: applyForm.leaveTypeId,
      fromDate: applyForm.fromDate,
      toDate: applyForm.toDate,
      isHalfDay: applyForm.isHalfDay,
      reason: applyForm.reason,
      totalDays: totalCalculatedDays,
    });
    
    toast.success('Leave applied successfully');
    setIsApplyModalOpen(false);
    setApplyForm({ employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', isHalfDay: false, reason: '' });
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLeaveRequestStatus(actionReqId, actionType, 'HR Admin', actionComment);
    
    if (actionType === 'Approved') {
      const req = leaveRequests.find(r => r.id === actionReqId);
      if (req) {
        useAttendanceStore.getState().markLeave(req.employeeId, req.fromDate, req.toDate);
      }
    }
    
    toast.success(`Leave request ${actionType.toLowerCase()}`);
    setIsActionModalOpen(false);
    setActionComment('');
  };

  const filteredRequests = useMemo(() => {
    let result = leaveRequests;

    // If Employee, restrict strictly to their own requests
    if (isEmployee) {
      result = result.filter(r => 
        r.employeeId === currentEmpId || 
        r.employeeId === (user as any)?.id || 
        r.employeeId === user?.email ||
        (r as any).employee?.toLowerCase() === user?.name?.toLowerCase()
      );
    }
    
    if (activeTab === 'pending') result = result.filter(r => r.status === 'Pending');
    else if (activeTab === 'approved') result = result.filter(r => r.status === 'Approved');
    else if (activeTab === 'rejected') result = result.filter(r => r.status === 'Rejected');
    
    if (search && !isEmployee) {
      const s = search.toLowerCase();
      result = result.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        return emp && (`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(s) || emp.empId.toLowerCase().includes(s));
      });
    }
    
    return result;
  }, [leaveRequests, activeTab, search, employees, isEmployee, currentEmpId, user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50">
              {isEmployee ? 'Employee Time-Off Portal' : 'Workforce Leave Management'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isEmployee ? 'My Leaves & Applications' : 'Leave Requests & Approvals'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEmployee 
              ? 'Check your leave quota balances, submit leave applications, and view review status.'
              : 'Audit and approve employee leave applications, monitor absences, and quotas.'}
          </p>
        </div>
        <Button onClick={() => {
          setApplyForm(prev => ({ ...prev, employeeId: currentEmpId }));
          setIsApplyModalOpen(true);
        }}>
          <Plus size={18} className="mr-2" /> Apply Leave
        </Button>
      </div>

      {/* Employee Personal Leave Balance Cards */}
      {isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Casual Leave (CL)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">8 / 12</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1">4 Days Utilized</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CalendarClock size={22} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Sick Leave (SL)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">4 / 6</h3>
                <p className="text-xs text-amber-600 font-semibold mt-1">2 Days Utilized</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Coffee size={22} />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Privilege Leave (PL)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">10 / 15</h3>
                <p className="text-xs text-indigo-600 font-semibold mt-1">5 Days Utilized</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <CalendarDays size={22} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <Tabs
          tabs={[
            { id: 'all', label: isEmployee ? 'My All Requests' : 'All Requests' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            ...(!isEmployee ? [{ id: 'calendar', label: 'Leave Calendar' }] : []),
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {activeTab !== 'calendar' ? (
          <>
            {!isEmployee && (
              <div className="flex gap-4 mb-6 relative">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by employee name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                  />
                </div>
                <Button variant="outline" className="shrink-0"><Filter size={18} className="mr-2" /> Filters</Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {!isEmployee && <th className="pb-3 px-4 font-semibold">Employee</th>}
                    <th className="pb-3 px-4 font-semibold">Leave Type</th>
                    <th className="pb-3 px-4 font-semibold">Duration & Dates</th>
                    <th className="pb-3 px-4 font-semibold">Days</th>
                    <th className="pb-3 px-4 font-semibold">Reason</th>
                    <th className="pb-3 px-4 font-semibold">Status</th>
                    {!isEmployee && <th className="pb-3 px-4 font-semibold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRequests.map(req => {
                    const emp = employees.find(e => e.id === req.employeeId);
                    const lt = leaveTypes.find(t => t.id === req.leaveTypeId);
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : user?.name || 'Staff Employee';
                    const leaveTypeName = lt?.name || (req as any).type || 'Casual Leave';

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        {!isEmployee && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                                {empName[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-900 dark:text-white">{empName}</p>
                                <p className="text-xs text-slate-500">{emp?.empId || 'EMP'}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lt?.color || '#6366f1' }} />
                            <span className="text-sm font-semibold">{leaveTypeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{req.fromDate} to {req.toDate}</p>
                          {req.isHalfDay && <Badge variant="outline" className="text-[10px] mt-0.5">Half Day</Badge>}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">{req.totalDays} Days</td>
                        <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                          {req.reason || 'Personal necessity'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'destructive' : 'warning'}>
                            {req.status}
                          </Badge>
                        </td>
                        {!isEmployee && (
                          <td className="py-3 px-4 text-right">
                            {req.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => { setActionReqId(req.id); setActionType('Approved'); setIsActionModalOpen(true); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Approve">
                                  <CheckCircle size={18} />
                                </button>
                                <button onClick={() => { setActionReqId(req.id); setActionType('Rejected'); setIsActionModalOpen(true); }} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={isEmployee ? 5 : 7} className="py-8 text-center text-slate-500 text-sm">
                        No leave records found. Click "+ Apply Leave" to submit an application.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-500 flex-col gap-3">
            <CalendarDays size={48} className="text-slate-300" />
            <p>Leave Calendar View</p>
            <p className="text-sm max-w-sm text-center">Interactive calendar showing employees on leave will be displayed here.</p>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsApplyModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isEmployee ? 'Apply For Leave' : 'Apply Leave (Behalf of Employee)'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isEmployee 
                    ? `Applicant: ${user?.name || 'Self'} (${user?.email || 'Employee'})`
                    : 'Select employee and input leave duration'}
                </p>
              </div>
              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                {!isEmployee && (
                  <Select
                    label="Select Employee"
                    options={employees.map(e => ({ label: `${e.firstName} ${e.lastName} (${e.empId})`, value: e.id }))}
                    value={applyForm.employeeId} 
                    onChange={e => setApplyForm({...applyForm, employeeId: e.target.value})} 
                    required
                  />
                )}
                <Select
                  label="Leave Type"
                  options={leaveTypes.filter(lt => lt.isActive).map(lt => ({ label: lt.name, value: lt.id }))}
                  value={applyForm.leaveTypeId} 
                  onChange={e => setApplyForm({...applyForm, leaveTypeId: e.target.value})} 
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="From Date" type="date" value={applyForm.fromDate} onChange={e => setApplyForm({...applyForm, fromDate: e.target.value})} required />
                  <Input label="To Date" type="date" value={applyForm.toDate} onChange={e => setApplyForm({...applyForm, toDate: e.target.value})} required />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={applyForm.isHalfDay} onChange={e => setApplyForm({...applyForm, isHalfDay: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium">Half Day Request</span>
                  </label>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Total: {totalCalculatedDays} Days</div>
                </div>
                <Input label="Reason / Remarks" value={applyForm.reason} onChange={e => setApplyForm({...applyForm, reason: e.target.value})} required placeholder="Enter leave justification..." />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Modal (Admin / Manager only) */}
      {!isEmployee && (
        <AnimatePresence>
          {isActionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsActionModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-bold mb-4">{actionType === 'Approved' ? 'Approve' : 'Reject'} Leave Request</h2>
                <form onSubmit={handleActionSubmit} className="space-y-4">
                  <Input label="Add a comment (Optional)" value={actionComment} onChange={e => setActionComment(e.target.value)} />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant={actionType === 'Approved' ? 'default' : 'destructive'}>Confirm {actionType}</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
