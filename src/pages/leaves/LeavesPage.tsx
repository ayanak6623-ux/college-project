import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLeaveStore } from '../../store/leaveStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Tabs } from '../../components/Tabs';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Card, CardContent } from '../../components/Card';
import toast from 'react-hot-toast';

// Helper to calc business days (excluding weekends, and eventually holidays)
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
  
  // Apply Form State
  const [applyForm, setApplyForm] = useState({
    employeeId: '', leaveTypeId: '', fromDate: '', toDate: '', isHalfDay: false, reason: ''
  });

  const totalCalculatedDays = useMemo(() => {
    return calculateDays(applyForm.fromDate, applyForm.toDate, applyForm.isHalfDay);
  }, [applyForm.fromDate, applyForm.toDate, applyForm.isHalfDay]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.employeeId || !applyForm.leaveTypeId || !applyForm.fromDate || !applyForm.toDate) {
      return toast.error('Please fill all required fields');
    }
    if (totalCalculatedDays <= 0) {
      return toast.error('Invalid date range or 0 business days selected');
    }
    
    addLeaveRequest({
      employeeId: applyForm.employeeId,
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
    
    if (activeTab === 'pending') result = result.filter(r => r.status === 'Pending');
    else if (activeTab === 'approved') result = result.filter(r => r.status === 'Approved');
    else if (activeTab === 'rejected') result = result.filter(r => r.status === 'Rejected');
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        return emp && (`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(s) || emp.empId.toLowerCase().includes(s));
      });
    }
    
    return result;
  }, [leaveRequests, activeTab, search, employees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Requests</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage employee leave applications and balances.</p>
        </div>
        <Button onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Apply Leave
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-border">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'calendar', label: 'Leave Calendar' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {activeTab !== 'calendar' ? (
          <>
            <div className="flex gap-4 mb-6 relative">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by employee name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>
              <Button variant="outline" className="shrink-0"><Filter size={18} className="mr-2" /> Filters</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="pb-3 px-4 font-medium">Employee</th>
                    <th className="pb-3 px-4 font-medium">Leave Type</th>
                    <th className="pb-3 px-4 font-medium">Duration</th>
                    <th className="pb-3 px-4 font-medium">Days</th>
                    <th className="pb-3 px-4 font-medium">Status</th>
                    <th className="pb-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRequests.map(req => {
                    const emp = employees.find(e => e.id === req.employeeId);
                    const lt = leaveTypes.find(t => t.id === req.leaveTypeId);
                    if (!emp || !lt) return null;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold text-xs">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-slate-500">{emp.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt.color }} />
                            <span className="text-sm font-medium">{lt.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{req.fromDate} to {req.toDate}</p>
                          {req.isHalfDay && <Badge variant="outline" className="text-[10px] mt-1">Half Day</Badge>}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{req.totalDays}</td>
                        <td className="py-3 px-4">
                          <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'destructive' : 'warning'}>
                            {req.status}
                          </Badge>
                        </td>
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
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No leave requests found.
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
            <p className="text-sm max-w-sm text-center">Interactive calendar showing employees on leave will be implemented here.</p>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsApplyModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold">Apply Leave (Behalf of Employee)</h2>
              </div>
              <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
                <Select
                  label="Select Employee"
                  options={employees.map(e => ({ label: `${e.firstName} ${e.lastName} (${e.empId})`, value: e.id }))}
                  value={applyForm.employeeId} onChange={e => setApplyForm({...applyForm, employeeId: e.target.value})} required
                />
                <Select
                  label="Leave Type"
                  options={leaveTypes.filter(lt => lt.isActive).map(lt => ({ label: lt.name, value: lt.id }))}
                  value={applyForm.leaveTypeId} onChange={e => setApplyForm({...applyForm, leaveTypeId: e.target.value})} required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="From Date" type="date" value={applyForm.fromDate} onChange={e => setApplyForm({...applyForm, fromDate: e.target.value})} required />
                  <Input label="To Date" type="date" value={applyForm.toDate} onChange={e => setApplyForm({...applyForm, toDate: e.target.value})} required />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={applyForm.isHalfDay} onChange={e => setApplyForm({...applyForm, isHalfDay: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium">Half Day Request</span>
                  </label>
                  <div className="text-sm font-semibold">Total: {totalCalculatedDays} Days</div>
                </div>
                <Input label="Reason / Remarks" value={applyForm.reason} onChange={e => setApplyForm({...applyForm, reason: e.target.value})} required />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {isActionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsActionModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-border p-6">
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
    </div>
  );
};
