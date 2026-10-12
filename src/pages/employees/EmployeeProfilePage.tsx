import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Edit, Mail, Phone, MapPin, Calendar, Clock, 
  Briefcase, Receipt, IndianRupee, Download, Printer, 
  CheckCircle2, AlertCircle, FileText, TrendingDown, ArrowDownRight, 
  Wallet, ShieldCheck, X, Building2, UserCheck, Sliders, Save, 
  RotateCcw, Sparkles, Check, HelpCircle, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useLeaveStore } from '../../store/leaveStore';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Tabs } from '../../components/Tabs';
import { Card, CardContent } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { cn } from '../../utils/cn';

export interface CustomPaySlip {
  monthlyGross?: number;
  basicSalary?: number;
  hra?: number;
  allowances?: number;
  bonus?: number;
  lopDays?: number;
  lopDeduction?: number;
  pfDeduction?: number;
  professionalTax?: number;
  otherDeductions?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Processing' | 'On Hold';
  paymentDate?: string;
  paymentMode?: string;
  transactionRef?: string;
  remarks?: string;
  isCustomized?: boolean;
}

const getStoredSlip = (empId: string, month: string): CustomPaySlip | null => {
  try {
    const raw = localStorage.getItem(`hrms_payslip_${empId}_${month}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee, updateEmployee } = useEmployeeStore();
  const { shifts } = useAttendanceStore();
  const { leaveTypes, leaveRequests } = useLeaveStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayMonth, setSelectedPayMonth] = useState('October 2026');
  const [showPaySlipModal, setShowPaySlipModal] = useState(false);
  const [showEditPaySlipModal, setShowEditPaySlipModal] = useState(false);
  const [payslipVersion, setPayslipVersion] = useState(0);
  const [editActiveTab, setEditActiveTab] = useState<'earnings' | 'deductions' | 'disbursement'>('earnings');

  const employee = id ? getEmployee(id) : undefined;

  useEffect(() => {
    // Simulate network delay for UX
    const timer = setTimeout(() => setIsLoading(false), 400);
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

  // Calculate Tenure & Days ("employe ko kithne days hue")
  const joinDate = employee?.joiningDate ? new Date(employee.joiningDate) : new Date(employee?.createdAt || '2024-01-15');
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - joinDate.getTime());
  const totalDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  const years = Math.floor(totalDays / 365);
  const remainingMonths = Math.floor((totalDays % 365) / 30);
  const remainingDays = Math.floor((totalDays % 365) % 30);
  const tenureFormatted = years > 0 
    ? `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''} ${remainingDays} d`
    : remainingMonths > 0 
      ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''} ${remainingDays} days`
      : `${totalDays} days`;

  // Default Base Salary Calculations
  const defaultAnnualSalary = employee?.salary || 650000;
  const defaultMonthlyGross = Math.round(defaultAnnualSalary / 12);
  const defaultDailyRate = Math.round(defaultMonthlyGross / 30);
  const completedMonths = Math.max(1, Math.round(totalDays / 30.4));

  // Leave Deductions Breakdown ("leaves ka kithna salary me minus hua")
  const empLeaves = leaveRequests.filter(
    r => (r.employeeId === id || r.employeeId === employee?.empId || r.employee === `${employee?.firstName} ${employee?.lastName}`) &&
         r.status === 'Approved'
  );
  const unpaidLeavesList = empLeaves.filter(r => {
    const lt = leaveTypes.find(t => t.id === r.leaveTypeId);
    return lt ? !lt.isPaid : false;
  });
  const recordedUnpaidDays = unpaidLeavesList.reduce((sum, r) => sum + (r.totalDays || 0), 0);
  const defaultTotalLopDays = recordedUnpaidDays > 0 ? recordedUnpaidDays : 2;
  const defaultCurrentMonthLopDays = Math.min(defaultTotalLopDays, 2);

  // Retrieve HR Customized Pay Slip Overrides (if any)
  // Re-evaluated whenever payslipVersion or selectedPayMonth changes
  const customSlip = id ? getStoredSlip(id, selectedPayMonth) : null;
  const isSlipCustomized = Boolean(customSlip?.isCustomized);

  // Effective Monthly Earnings & Deductions
  const monthlyGross = customSlip?.monthlyGross !== undefined ? customSlip.monthlyGross : defaultMonthlyGross;
  const annualSalary = monthlyGross * 12;
  const dailyRate = Math.round(monthlyGross / 30);

  const basicSalary = customSlip?.basicSalary !== undefined ? customSlip.basicSalary : Math.round(monthlyGross * 0.50);
  const hra = customSlip?.hra !== undefined ? customSlip.hra : Math.round(monthlyGross * 0.30);
  const allowances = customSlip?.allowances !== undefined ? customSlip.allowances : Math.max(0, monthlyGross - basicSalary - hra);
  const bonus = customSlip?.bonus !== undefined ? customSlip.bonus : 0;
  const totalGrossEarnings = basicSalary + hra + allowances + bonus;

  const currentMonthLopDays = customSlip?.lopDays !== undefined ? customSlip.lopDays : defaultCurrentMonthLopDays;
  const monthlyLeaveDeduction = customSlip?.lopDeduction !== undefined ? customSlip.lopDeduction : (currentMonthLopDays * dailyRate);
  const totalLopDays = customSlip?.lopDays !== undefined ? customSlip.lopDays : defaultTotalLopDays;
  const totalLeaveDeductionsTillDate = totalLopDays * dailyRate;

  const pfDeduction = customSlip?.pfDeduction !== undefined ? customSlip.pfDeduction : Math.round(basicSalary * 0.12);
  const professionalTax = customSlip?.professionalTax !== undefined ? customSlip.professionalTax : 200;
  const otherDeductions = customSlip?.otherDeductions !== undefined ? customSlip.otherDeductions : 0;
  const totalCurrentDeductions = monthlyLeaveDeduction + pfDeduction + professionalTax + otherDeductions;

  const netInHandPay = Math.max(0, totalGrossEarnings - totalCurrentDeductions);
  const paymentStatus = customSlip?.paymentStatus || 'Paid';
  const paymentDate = customSlip?.paymentDate || '01 Nov 2026';
  const paymentMode = customSlip?.paymentMode || 'Direct Bank Transfer (NEFT/IMPS)';
  const transactionRef = customSlip?.transactionRef || 'NEFT-88392019482';
  const remarks = customSlip?.remarks || 'Regular monthly salary disbursement with HR approved adjustments.';

  // Total Payment Disbursed Till Now ("kithna payment abtk gya")
  const totalGrossDisbursed = completedMonths * monthlyGross;
  const totalPaymentDisbursed = Math.max(0, totalGrossDisbursed - totalLeaveDeductionsTillDate);

  // Edit Form State (synced on open)
  const [editForm, setEditForm] = useState<CustomPaySlip>({
    monthlyGross,
    basicSalary,
    hra,
    allowances,
    bonus,
    lopDays: currentMonthLopDays,
    lopDeduction: monthlyLeaveDeduction,
    pfDeduction,
    professionalTax,
    otherDeductions,
    paymentStatus,
    paymentDate,
    paymentMode,
    transactionRef,
    remarks,
  });

  const openEditModal = () => {
    setEditForm({
      monthlyGross,
      basicSalary,
      hra,
      allowances,
      bonus,
      lopDays: currentMonthLopDays,
      lopDeduction: monthlyLeaveDeduction,
      pfDeduction,
      professionalTax,
      otherDeductions,
      paymentStatus,
      paymentDate,
      paymentMode,
      transactionRef,
      remarks,
    });
    setEditActiveTab('earnings');
    setShowEditPaySlipModal(true);
  };

  const handleAutoSplitGross = (newGross: number) => {
    const basic = Math.round(newGross * 0.50);
    const h = Math.round(newGross * 0.30);
    const allow = Math.max(0, newGross - basic - h);
    const newDaily = Math.round(newGross / 30);
    const lDays = editForm.lopDays ?? currentMonthLopDays;
    const newLopDeduction = lDays * newDaily;
    const newPf = Math.round(basic * 0.12);

    setEditForm(prev => ({
      ...prev,
      monthlyGross: newGross,
      basicSalary: basic,
      hra: h,
      allowances: allow,
      lopDeduction: newLopDeduction,
      pfDeduction: newPf,
    }));
  };

  const handleLopDaysChange = (days: number) => {
    const currentGrossVal = editForm.monthlyGross ?? monthlyGross;
    const currentDailyVal = Math.round(currentGrossVal / 30);
    setEditForm(prev => ({
      ...prev,
      lopDays: days,
      lopDeduction: days * currentDailyVal,
    }));
  };

  const handleSavePaySlip = async () => {
    if (!id) return;
    const slipToSave: CustomPaySlip = {
      ...editForm,
      isCustomized: true,
    };
    localStorage.setItem(`hrms_payslip_${id}_${selectedPayMonth}`, JSON.stringify(slipToSave));

    // If gross monthly was modified, update employee salary in backend store
    if (editForm.monthlyGross && editForm.monthlyGross !== defaultMonthlyGross) {
      try {
        await updateEmployee(id, { salary: editForm.monthlyGross * 12 });
      } catch (err) {
        console.warn('Backend salary sync warning:', err);
      }
    }

    setPayslipVersion(v => v + 1);
    setShowEditPaySlipModal(false);
    toast.success(`Pay slip for ${selectedPayMonth} updated successfully by HR!`, {
      icon: '✅',
      style: {
        borderRadius: '12px',
        background: '#1e1b4b',
        color: '#fff',
        fontSize: '13px',
      }
    });
  };

  const handleResetPaySlip = () => {
    if (!id) return;
    localStorage.removeItem(`hrms_payslip_${id}_${selectedPayMonth}`);
    setPayslipVersion(v => v + 1);
    setShowEditPaySlipModal(false);
    toast.success(`Pay slip for ${selectedPayMonth} reset to standard auto-calculations.`, {
      icon: '🔄',
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'payroll', label: 'Pay Slip & Salary' },
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
        <div className="flex items-center gap-3">
          <Button 
            onClick={openEditModal} 
            variant="outline" 
            size="sm" 
            className="border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-semibold"
          >
            <Sliders size={16} className="mr-2" />
            Edit Pay Slip
          </Button>
          <Button onClick={() => setShowPaySlipModal(true)} variant="outline" size="sm" className="border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400">
            <Receipt size={16} className="mr-2" />
            Generate Pay Slip
          </Button>
          <Button onClick={() => navigate(`/employees/${id}/edit`)} size="sm">
            <Edit size={16} className="mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Header Profile Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary-600 via-indigo-600 to-secondary-500 w-full" />
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
                  <span className="text-sm truncate">{employee?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><Phone size={16} /></div>
                  <span className="text-sm">{employee?.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><MapPin size={16} /></div>
                  <span className="text-sm truncate" title={employee?.address}>{employee?.address || 'India'}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Highlights: Tenure, Total Disbursed, Monthly Salary, Leave Minus */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tenure Days Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Total Tenure</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalDays} <span className="text-sm font-medium text-slate-500">Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {tenureFormatted} (Since {employee?.joiningDate || 'Jan 2024'})
          </p>
        </div>

        {/* Monthly Gross Salary Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Monthly Gross</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{monthlyGross.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 truncate font-medium">
            Annual: ₹{annualSalary.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Payment Disbursed Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Total Disbursed</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{totalPaymentDisbursed.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 truncate font-medium">
            Paid across {completedMonths} months tenure
          </p>
        </div>

        {/* Leaves Salary Minus Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Leave Salary Minus</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            -₹{totalLeaveDeductionsTillDate.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 truncate font-medium">
            {totalLopDays} unpaid leave days deducted
          </p>
        </div>
      </div>

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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Employee ID</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{employee?.empId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                      <p className="font-medium text-slate-900 dark:text-white">{employee?.dob}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Gender</p>
                      <p className="font-medium text-slate-900 dark:text-white">{employee?.gender}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Account Access</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">System Role</p>
                      <Badge variant="outline">{employee?.role}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Login Email</p>
                      <p className="font-medium text-slate-900 dark:text-white">{employee?.loginEmail || employee?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Added On</p>
                      <p className="font-medium text-slate-900 dark:text-white">{new Date(employee?.createdAt || '').toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Payroll Overview Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-50 via-indigo-50 to-purple-50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-800/40 border border-primary-200/60 dark:border-primary-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">Active Pay Slip & Remuneration</h4>
                      {isSlipCustomized && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200">
                          HR Customized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Net Monthly Pay: <span className="font-bold text-slate-900 dark:text-white">₹{netInHandPay.toLocaleString('en-IN')}</span> • Leave LOP Deductions: <span className="text-rose-500 font-bold">-₹{monthlyLeaveDeduction.toLocaleString('en-IN')}</span>
                      {bonus > 0 && <span className="text-emerald-600 font-bold ml-1.5">• Bonus: +₹{bonus.toLocaleString('en-IN')}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button onClick={openEditModal} variant="outline" size="sm" className="border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                    <Sliders size={15} className="mr-1.5" />
                    Edit Slip
                  </Button>
                  <Button onClick={() => setActiveTab('payroll')} size="sm">
                    View Full Payroll Tab →
                  </Button>
                </div>
              </div>
            </div>
          ) : activeTab === 'payroll' ? (
            /* Dedicated Pay Slip & Salary Section */
            <div className="space-y-6">
              {/* Header with Month Selector & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="text-primary-600 dark:text-primary-400" size={20} />
                      Salary Slip & Remuneration Details
                    </h3>
                    {isSlipCustomized && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300">
                        HR Modified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monthly itemized earnings, leave deductions, taxes, and cumulative payments
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select 
                    value={selectedPayMonth}
                    onChange={(e) => setSelectedPayMonth(e.target.value)}
                    className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="October 2026">October 2026</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>

                  <Button 
                    onClick={openEditModal} 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
                  >
                    <Sliders size={15} className="mr-1.5" />
                    Edit Pay Slip
                  </Button>

                  <Button onClick={() => setShowPaySlipModal(true)} variant="outline" size="sm">
                    <Printer size={15} className="mr-1.5" />
                    Print Pay Slip
                  </Button>
                </div>
              </div>

              {/* HR Customization Notice Banner (if customized) */}
              {isSlipCustomized && (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles size={16} className="text-purple-600 shrink-0" />
                    <span>
                      HR Customization Active for <strong className="font-bold">{selectedPayMonth}</strong>: 
                      {bonus > 0 ? ` Bonus: +₹${bonus.toLocaleString('en-IN')}` : ''}
                      {` LOP Days: ${currentMonthLopDays} days`}
                      {otherDeductions > 0 ? ` • Other Deductions: -₹${otherDeductions.toLocaleString('en-IN')}` : ''}
                      {` • Status: ${paymentStatus}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={openEditModal}
                      className="text-xs font-bold text-purple-700 dark:text-purple-300 underline hover:text-purple-900"
                    >
                      Modify
                    </button>
                    <span className="text-purple-300 dark:text-purple-700">|</span>
                    <button 
                      onClick={handleResetPaySlip}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}

              {/* Net Pay Highlight Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
                    <CheckCircle2 size={16} />
                    Disbursed Net Take-Home Salary ({selectedPayMonth})
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold mt-1">
                    ₹{netInHandPay.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1.5">
                    <span>{paymentMode}</span>
                    <span>•</span>
                    <span>Status:</span>
                    <span className={cn(
                      "font-black px-1.5 py-0.5 rounded text-[11px]",
                      paymentStatus === 'Paid' ? "bg-white/20 text-white" :
                      paymentStatus === 'Processing' ? "bg-amber-400 text-slate-900" :
                      paymentStatus === 'On Hold' ? "bg-rose-400 text-slate-900" :
                      "bg-blue-400 text-slate-900"
                    )}>
                      {paymentStatus.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs text-left w-full md:w-auto">
                  <div>
                    <span className="text-emerald-200 block">Gross Earnings:</span>
                    <span className="font-bold text-base text-white">₹{totalGrossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200 block">Total Deductions:</span>
                    <span className="font-bold text-base text-rose-200">-₹{totalCurrentDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Two Column Breakdown: Earnings vs Deductions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Column */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Earnings Breakdown
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">Amount (₹)</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Basic Salary</p>
                        <p className="text-[11px] text-slate-400">Core base remuneration</p>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{basicSalary.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">House Rent Allowance (HRA)</p>
                        <p className="text-[11px] text-slate-400">Housing allowance</p>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{hra.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Special & Conveyance Allowance</p>
                        <p className="text-[11px] text-slate-400">Fixed monthly allowances</p>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{allowances.toLocaleString('en-IN')}</span>
                    </div>

                    {bonus > 0 && (
                      <div className="flex items-center justify-between py-1 border-t border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-lg">
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-400">Performance Bonus / Incentive</p>
                          <p className="text-[11px] text-emerald-600/80">HR approved extra incentive</p>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+₹{bonus.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white">
                      <span>Total Gross Earnings</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{totalGrossEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column (Highlights Leave Minus) */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Deductions (Leaves & Taxes)
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">Minus (₹)</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    {/* LEAVE DEDUCTIONS HIGHLIGHT */}
                    <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <TrendingDown size={15} />
                          Leave Deduction (LOP / Unpaid)
                        </p>
                        <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                          {currentMonthLopDays} unapproved days @ ₹{dailyRate.toLocaleString('en-IN')}/day
                        </p>
                      </div>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        -₹{monthlyLeaveDeduction.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Provident Fund (PF)</p>
                        <p className="text-[11px] text-slate-400">Statutory employee retirement fund</p>
                      </div>
                      <span className="font-semibold text-rose-500">-₹{pfDeduction.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Professional Tax (PT)</p>
                        <p className="text-[11px] text-slate-400">State statutory tax</p>
                      </div>
                      <span className="font-semibold text-rose-500">-₹{professionalTax}</span>
                    </div>

                    {otherDeductions > 0 && (
                      <div className="flex items-center justify-between py-1 border-t border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-2 rounded-lg">
                        <div>
                          <p className="font-bold text-rose-700 dark:text-rose-400">Other Deductions / TDS</p>
                          <p className="text-[11px] text-rose-600/80">TDS tax or misc penalty</p>
                        </div>
                        <span className="font-bold text-rose-600">-₹{otherDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white">
                      <span>Total Deductions</span>
                      <span className="text-rose-600 dark:text-rose-400">-₹{totalCurrentDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Salary Disbursement Table */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Recent Payment History</h4>
                  <span className="text-xs text-slate-500">Click Edit to modify any month's slip</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-border">
                      <tr>
                        <th className="py-2.5 px-4">Pay Period</th>
                        <th className="py-2.5 px-4">Gross Salary</th>
                        <th className="py-2.5 px-4">Leave Deductions</th>
                        <th className="py-2.5 px-4">Net Disbursed</th>
                        <th className="py-2.5 px-4">Disbursement Date</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr className={selectedPayMonth === 'October 2026' ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-medium' : ''}>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          October 2026
                          {isSlipCustomized && <span className="w-2 h-2 rounded-full bg-purple-500" title="HR Edited" />}
                        </td>
                        <td className="py-3 px-4">₹{totalGrossEarnings.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-rose-600 font-semibold">-₹{monthlyLeaveDeduction.toLocaleString('en-IN')} ({currentMonthLopDays} d)</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">₹{netInHandPay.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-500">{paymentDate}</td>
                        <td className="py-3 px-4">
                          <Badge variant={paymentStatus === 'Paid' ? 'success' : paymentStatus === 'Processing' ? 'secondary' : 'warning'}>
                            {paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            onClick={() => {
                              setSelectedPayMonth('October 2026');
                              openEditModal();
                            }} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            <Sliders size={13} className="mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">September 2026</td>
                        <td className="py-3 px-4">₹{monthlyGross.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-500">₹0 (0 days)</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">₹{(monthlyGross - pfDeduction - professionalTax).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-500">01 Oct 2026</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Paid</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            onClick={() => {
                              setSelectedPayMonth('September 2026');
                              openEditModal();
                            }} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-600"
                          >
                            <Sliders size={13} className="mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">August 2026</td>
                        <td className="py-3 px-4">₹{monthlyGross.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-500">₹0 (0 days)</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">₹{(monthlyGross - pfDeduction - professionalTax).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-500">01 Sep 2026</td>
                        <td className="py-3 px-4">
                          <Badge variant="success">Paid</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            onClick={() => {
                              setSelectedPayMonth('August 2026');
                              openEditModal();
                            }} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-600"
                          >
                            <Sliders size={13} className="mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'job' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Employment Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Employment Type</p>
                      <p className="font-medium text-slate-900 dark:text-white">{employee?.employmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Joining Date</p>
                      <p className="font-medium text-slate-900 dark:text-white">{employee?.joiningDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-primary-500" />
                    <div>
                      <p className="text-sm text-slate-500">Assigned Shift</p>
                      <p className="font-medium text-slate-900 dark:text-white">{shifts.find(s => s.id === employee?.shiftId)?.name || employee?.shiftId || 'Standard 9 AM - 6 PM'} Shift</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Organizational Structure</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="font-medium text-slate-900 dark:text-white">{employee?.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Reporting Manager</p>
                    <p className="font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-xs flex items-center justify-center">
                        {employee?.reportingManager?.charAt(0) || 'M'}
                      </div>
                      {employee?.reportingManager || 'Management'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Annual Salary</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{annualSalary.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'leaves' ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Leave Balance Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {leaveTypes.filter(lt => lt.isActive).map(lt => {
                  const used = leaveRequests.filter(r => (r.employeeId === id || r.employeeId === employee?.empId) && r.leaveTypeId === lt.id && r.status === 'Approved').reduce((acc, r) => acc + r.totalDays, 0);
                  const remaining = lt.yearlyQuota - used;
                  return (
                    <div key={lt.id} className="p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50">
                      <p className="text-sm text-slate-500 mb-2">{lt.name}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{remaining}</p>
                        <p className="text-sm text-slate-500 mb-1">/ {lt.yearlyQuota} days</p>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min((used / lt.yearlyQuota) * 100, 100)}%`, backgroundColor: lt.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Leave Requests</h3>
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
                    {leaveRequests.filter(r => r.employeeId === id || r.employeeId === employee?.empId).map(req => {
                      const lt = leaveTypes.find(t => t.id === req.leaveTypeId);
                      return (
                        <tr key={req.id}>
                          <td className="py-3 px-4 font-medium text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lt?.color || '#3b82f6' }} />
                            {lt?.name || 'Leave'}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{req.fromDate} to {req.toDate}</td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{req.totalDays}</td>
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
               <FileText size={32} className="mb-2 opacity-50" />
               <p>No uploaded documents found for this employee.</p>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Official Print/Preview Pay Slip Modal */}
      {showPaySlipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <button 
              onClick={() => setShowPaySlipModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Printable Pay Slip Content */}
            <div id="printable-payslip" className="space-y-6">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b pb-5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    P
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">PeopleHub Technologies Ltd.</h2>
                    <p className="text-xs text-slate-500">IT Park, Ring Road, Indore (M.P.) • CIN: U72200MP2024PTC012345</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Official Pay Slip / वेतन पर्ची</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded border",
                    paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300" :
                    paymentStatus === 'Processing' ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300" :
                    paymentStatus === 'On Hold' ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300"
                  )}>
                    {paymentStatus.toUpperCase()}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{selectedPayMonth}</p>
                </div>
              </div>

              {/* Employee & Attendance Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Employee Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee?.firstName} {employee?.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Employee ID</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee?.empId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee?.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Designation</span>
                  <span className="font-bold text-slate-900 dark:text-white">{employee?.designation}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Total Days In Month</span>
                  <span className="font-bold text-slate-900 dark:text-white">30 Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Days Worked</span>
                  <span className="font-bold text-slate-900 dark:text-white">{30 - currentMonthLopDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Leave (LOP Days)</span>
                  <span className="font-bold text-rose-500">{currentMonthLopDays} Days Minus</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Tenure To Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{totalDays} Days</span>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-border">
                      <th className="py-2.5 px-4 text-left w-1/2 border-r border-border">Earnings</th>
                      <th className="py-2.5 px-4 text-left w-1/2">Deductions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2.5 px-4 border-r border-border">
                        <div className="flex justify-between">
                          <span>Basic Salary</span>
                          <span className="font-semibold">₹{basicSalary.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                          <span>Leave Deductions (Loss of Pay)</span>
                          <span className="font-bold">-₹{monthlyLeaveDeduction.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 border-r border-border">
                        <div className="flex justify-between">
                          <span>House Rent Allowance (HRA)</span>
                          <span className="font-semibold">₹{hra.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-between">
                          <span>Provident Fund (PF)</span>
                          <span className="font-semibold text-rose-500">-₹{pfDeduction.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 border-r border-border">
                        <div className="flex justify-between">
                          <span>Special Allowances</span>
                          <span className="font-semibold">₹{allowances.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-between">
                          <span>Professional Tax (PT)</span>
                          <span className="font-semibold text-rose-500">-₹{professionalTax}</span>
                        </div>
                      </td>
                    </tr>
                    {bonus > 0 && (
                      <tr>
                        <td className="py-2.5 px-4 border-r border-border bg-emerald-50/40 dark:bg-emerald-950/20">
                          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Performance Bonus / Incentive</span>
                            <span>+₹{bonus.toLocaleString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex justify-between text-slate-400">
                            <span>-</span>
                            <span>-</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {otherDeductions > 0 && (
                      <tr>
                        <td className="py-2.5 px-4 border-r border-border">
                          <div className="flex justify-between text-slate-400">
                            <span>-</span>
                            <span>-</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 bg-rose-50/40 dark:bg-rose-950/20">
                          <div className="flex justify-between text-rose-700 dark:text-rose-400 font-semibold">
                            <span>Other Deductions / TDS</span>
                            <span>-₹{otherDeductions.toLocaleString('en-IN')}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                      <td className="py-2.5 px-4 border-r border-border">
                        <div className="flex justify-between">
                          <span>Gross Earnings</span>
                          <span className="text-emerald-600">₹{totalGrossEarnings.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-between">
                          <span>Total Deductions</span>
                          <span className="text-rose-600">-₹{totalCurrentDeductions.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Pay Box */}
              <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 block">Total Net Payable In-Hand</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{netInHandPay.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mode: {paymentMode} • Ref/UTR: {transactionRef}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Cumulative Paid to Date:</div>
                  <div className="text-sm font-bold text-emerald-600">₹{totalPaymentDisbursed.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Disbursed on {paymentDate}</div>
                </div>
              </div>

              {remarks && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">HR Notes & Remarks: </span>
                  {remarks}
                </div>
              )}

              {/* Authorized Signatory Footnote */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck size={14} />
                  <span>Digitally Generated & Verified via PeopleHub HRMS</span>
                </div>
                <div className="text-right font-medium">
                  Authorized Signatory (HR Dept)
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
              <Button 
                onClick={() => {
                  setShowPaySlipModal(false);
                  openEditModal();
                }} 
                variant="outline" 
                size="sm"
                className="border-indigo-300 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
              >
                <Sliders size={14} className="mr-1.5" />
                Edit Pay Slip
              </Button>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowPaySlipModal(false)} variant="outline" size="sm">
                  Close
                </Button>
                <Button onClick={() => window.print()} size="sm" className="shadow-md">
                  <Printer size={15} className="mr-1.5" />
                  Print / Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR Edit Pay Slip Modal */}
      {showEditPaySlipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-auto animate-in zoom-in-95 duration-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Sliders size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Edit Employee Pay Slip
                    </h3>
                    <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200">
                      HR Admin Control
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Modifying {employee?.firstName} {employee?.lastName} ({employee?.empId}) • Pay Period: <strong className="text-slate-800 dark:text-slate-200">{selectedPayMonth}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditPaySlipModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs for Form Categories */}
            <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEditActiveTab('earnings')}
                className={cn(
                  "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
                  editActiveTab === 'earnings'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Receipt size={14} />
                1. Earnings & Bonuses (कमाई)
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('deductions')}
                className={cn(
                  "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
                  editActiveTab === 'deductions'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <TrendingDown size={14} />
                2. Deductions & Leaves (कटौतियां)
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('disbursement')}
                className={cn(
                  "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
                  editActiveTab === 'disbursement'
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <CreditCard size={14} />
                3. Payment & Remarks (भुगतान)
              </button>
            </div>

            {/* Form Body Based on Tab */}
            {editActiveTab === 'earnings' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Quick Auto-Split Generator:
                    </span>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      Enter target monthly gross and automatically balance 50% Basic, 30% HRA, 20% Special Allowances
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="number"
                      placeholder="e.g. 60000"
                      className="h-8 px-2.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-28 focus:outline-none"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val > 0) handleAutoSplitGross(val);
                      }}
                    />
                    <span className="text-xs font-medium text-slate-500">₹ Gross</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Monthly Gross Base (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input 
                        type="number"
                        value={editForm.monthlyGross ?? ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, monthlyGross: Number(e.target.value) }))}
                        className="h-10 w-full pl-7 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Updates annual package to ₹{((editForm.monthlyGross || 0) * 12).toLocaleString('en-IN')}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Basic Salary (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input 
                        type="number"
                        value={editForm.basicSalary ?? ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
                        className="h-10 w-full pl-7 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">PF deduction is computed as 12% of this amount</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      House Rent Allowance (HRA) (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input 
                        type="number"
                        value={editForm.hra ?? ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, hra: Number(e.target.value) }))}
                        className="h-10 w-full pl-7 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Special & Conveyance Allowance (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                      <input 
                        type="number"
                        value={editForm.allowances ?? ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, allowances: Number(e.target.value) }))}
                        className="h-10 w-full pl-7 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      Performance Bonus / Incentive (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-semibold">₹</span>
                      <input 
                        type="number"
                        value={editForm.bonus ?? 0}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                        placeholder="0"
                        className="h-10 w-full pl-7 pr-3 text-sm rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Extra bonus added directly to this month's earnings</p>
                  </div>
                </div>
              </div>
            )}

            {editActiveTab === 'deductions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LOP Leave Days & Deduction */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 block flex items-center justify-between">
                      <span>Unpaid / LOP Leave Days</span>
                      <span className="text-[10px] text-slate-500 font-normal">Daily: ₹{dailyRate}/day</span>
                    </label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={editForm.lopDays ?? 0}
                      onChange={(e) => handleLopDaysChange(Number(e.target.value))}
                      className="h-10 w-full px-3 text-sm rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold"
                    />
                    <p className="text-[10px] text-rose-600/80">Updating days automatically recalculates deduction amount</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 block flex items-center justify-between">
                      <span>Leave Deduction Amount (₹)</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const d = editForm.lopDays ?? currentMonthLopDays;
                          setEditForm(prev => ({ ...prev, lopDeduction: d * dailyRate }));
                        }}
                        className="text-[10px] underline font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Recalculate
                      </button>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-rose-500 font-semibold">-₹</span>
                      <input 
                        type="number"
                        value={editForm.lopDeduction ?? 0}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lopDeduction: Number(e.target.value) }))}
                        className="h-10 w-full pl-8 pr-3 text-sm rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold text-rose-600"
                      />
                    </div>
                    <p className="text-[10px] text-rose-600/80">Direct loss of pay salary deduction</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                      <span>Provident Fund (PF) (₹)</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const b = editForm.basicSalary ?? basicSalary;
                          setEditForm(prev => ({ ...prev, pfDeduction: Math.round(b * 0.12) }));
                        }}
                        className="text-[10px] text-indigo-600 underline font-medium"
                      >
                        Auto (12% of Basic)
                      </button>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">-₹</span>
                      <input 
                        type="number"
                        value={editForm.pfDeduction ?? ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pfDeduction: Number(e.target.value) }))}
                        className="h-10 w-full pl-8 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Professional Tax (PT) (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">-₹</span>
                      <input 
                        type="number"
                        value={editForm.professionalTax ?? 200}
                        onChange={(e) => setEditForm(prev => ({ ...prev, professionalTax: Number(e.target.value) }))}
                        className="h-10 w-full pl-8 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      TDS / Income Tax / Other Misc Deductions (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">-₹</span>
                      <input 
                        type="number"
                        value={editForm.otherDeductions ?? 0}
                        onChange={(e) => setEditForm(prev => ({ ...prev, otherDeductions: Number(e.target.value) }))}
                        placeholder="0"
                        className="h-10 w-full pl-8 pr-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Optional statutory tax withholding or notice period adjustments</p>
                  </div>
                </div>
              </div>
            )}

            {editActiveTab === 'disbursement' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Payment Status
                    </label>
                    <select
                      value={editForm.paymentStatus ?? 'Paid'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                      className="h-10 w-full px-3 text-sm font-semibold rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Paid">Paid (सफल / भुगतान हुआ)</option>
                      <option value="Processing">Processing (प्रक्रिया में)</option>
                      <option value="Pending">Pending (लंबित)</option>
                      <option value="On Hold">On Hold (रोका गया)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Disbursement Date
                    </label>
                    <input 
                      type="text"
                      value={editForm.paymentDate ?? '01 Nov 2026'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                      placeholder="e.g. 01 Nov 2026"
                      className="h-10 w-full px-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={editForm.paymentMode ?? 'Direct Bank Transfer (NEFT/IMPS)'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                      className="h-10 w-full px-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Direct Bank Transfer (NEFT/IMPS)">Direct Bank Transfer (NEFT/IMPS)</option>
                      <option value="UPI Direct Transfer">UPI Direct Transfer</option>
                      <option value="Corporate Cheque">Corporate Cheque</option>
                      <option value="Cash Disbursement">Cash Disbursement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Reference / UTR / Cheque Number
                    </label>
                    <input 
                      type="text"
                      value={editForm.transactionRef ?? 'NEFT-88392019482'}
                      onChange={(e) => setEditForm(prev => ({ ...prev, transactionRef: e.target.value }))}
                      placeholder="e.g. UTR-928401928"
                      className="h-10 w-full px-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      HR Remarks & Notes
                    </label>
                    <textarea 
                      rows={2}
                      value={editForm.remarks ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="e.g. Festival performance bonus approved; 2 days medical leave deducted as unapproved LOP."
                      className="w-full p-3 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Calculation Preview Banner */}
            {(() => {
              const formBasic = editForm.basicSalary ?? basicSalary;
              const formHra = editForm.hra ?? hra;
              const formAllow = editForm.allowances ?? allowances;
              const formBonus = editForm.bonus ?? 0;
              const formGross = formBasic + formHra + formAllow + formBonus;

              const formLop = editForm.lopDeduction ?? monthlyLeaveDeduction;
              const formPf = editForm.pfDeduction ?? pfDeduction;
              const formPt = editForm.professionalTax ?? professionalTax;
              const formOther = editForm.otherDeductions ?? 0;
              const formTotalDed = formLop + formPf + formPt + formOther;
              const formNet = Math.max(0, formGross - formTotalDed);

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-900/60 shadow-inner">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Total Earnings:</span>
                      <span className="text-emerald-400 font-bold text-sm">₹{formGross.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Deductions:</span>
                      <span className="text-rose-400 font-bold text-sm">-₹{formTotalDed.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-indigo-300 block font-semibold">Net In-Hand Payable</span>
                    <span className="text-2xl font-black text-emerald-300">₹{formNet.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
              <Button 
                type="button"
                onClick={handleResetPaySlip}
                variant="ghost" 
                size="sm"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <RotateCcw size={14} className="mr-1.5" />
                Reset to Auto Defaults
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <Button 
                  type="button"
                  onClick={() => setShowEditPaySlipModal(false)}
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSavePaySlip}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold px-4"
                >
                  <Save size={15} className="mr-1.5" />
                  Save Pay Slip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


