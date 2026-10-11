import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Mail, Phone, MapPin, Calendar, Clock, Briefcase } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Tabs } from '../../components/Tabs';
import { Card, CardContent } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';

export const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee } = useEmployeeStore();
  const { shifts } = useAttendanceStore();
  const { leaveTypes, leaveRequests } = useLeaveStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const employee = id ? getEmployee(id) : undefined;

  useEffect(() => {
    // Simulate network delay for UX
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (!isLoading && !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
        <Button onClick={() => navigate('/employees')}>Back to Employees</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'job', label: 'Job Details' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/employees')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={18} className="mr-1" />
          Back to List
        </button>
        <Button onClick={() => navigate(`/employees/${id}/edit`)} variant="outline" size="sm">
          <Edit size={16} className="mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Header Profile Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-500 w-full" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-4">
            {isLoading ? (
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary-600 text-4xl font-bold border-4 border-white dark:border-slate-900 shadow-sm shrink-0">
                {employee?.firstName.charAt(0)}{employee?.lastName.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 text-center sm:text-left">
              {isLoading ? (
                <div className="space-y-2 mb-2">
                  <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {employee?.firstName} {employee?.lastName}
                    </h2>
                    <Badge variant={employee?.status === 'Active' ? 'success' : employee?.status === 'On Leave' ? 'warning' : 'destructive'} className="w-fit mx-auto sm:mx-0">
                      {employee?.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {employee?.designation} • {employee?.department}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Mail size={16} /></div>
                  <span className="text-sm">{employee?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Phone size={16} /></div>
                  <span className="text-sm">{employee?.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><MapPin size={16} /></div>
                  <span className="text-sm truncate" title={employee?.address}>{employee?.address}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Employee ID</p>
                    <p className="font-medium">{employee?.empId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                    <p className="font-medium">{employee?.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Gender</p>
                    <p className="font-medium">{employee?.gender}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Access</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">System Role</p>
                    <Badge variant="outline">{employee?.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Login Email</p>
                    <p className="font-medium">{employee?.loginEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Added On</p>
                    <p className="font-medium">{new Date(employee?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'job' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Employment Type</p>
                      <p className="font-medium">{employee?.employmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Joining Date</p>
                      <p className="font-medium">{employee?.joiningDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Assigned Shift</p>
                      <p className="font-medium">{shifts.find(s => s.id === employee?.shiftId)?.name || employee?.shiftId} Shift</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Organizational Structure</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="font-medium">{employee?.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Reporting Manager</p>
                    <p className="font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-xs flex items-center justify-center">
                        {employee?.reportingManager.charAt(0)}
                      </div>
                      {employee?.reportingManager}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Annual Salary</p>
                    <p className="font-medium">${employee?.salary.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'leaves' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Leave Balance Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {leaveTypes.filter(lt => lt.isActive).map(lt => {
                  const used = leaveRequests.filter(r => r.employeeId === id && r.leaveTypeId === lt.id && r.status === 'Approved').reduce((acc, r) => acc + r.totalDays, 0);
                  const remaining = lt.yearlyQuota - used;
                  return (
                    <div key={lt.id} className="p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="text-sm text-slate-500 mb-2">{lt.name}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{remaining}</p>
                        <p className="text-sm text-slate-500 mb-1">/ {lt.yearlyQuota} days</p>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((used / lt.yearlyQuota) * 100, 100)}%`, backgroundColor: lt.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold mb-4">Recent Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-slate-500">
                      <th className="pb-3 px-4">Leave Type</th>
                      <th className="pb-3 px-4">Date Range</th>
                      <th className="pb-3 px-4">Days</th>
                      <th className="pb-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaveRequests.filter(r => r.employeeId === id).map(req => {
                      const lt = leaveTypes.find(t => t.id === req.leaveTypeId);
                      return (
                        <tr key={req.id}>
                          <td className="py-3 px-4 font-medium text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt?.color }} />
                            {lt?.name}
                          </td>
                          <td className="py-3 px-4 text-sm">{req.fromDate} to {req.toDate}</td>
                          <td className="py-3 px-4 text-sm">{req.totalDays}</td>
                          <td className="py-3 px-4">
                            <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'destructive' : 'warning'}>
                              {req.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500">
               <p>This module is coming in a future update.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
