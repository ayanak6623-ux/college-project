export type LeaveTypeGender = 'All' | 'Male' | 'Female';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  color: string;
  yearlyQuota: number;
  isPaid: boolean;
  carryForward: boolean;
  maxCarryForward: number;
  requiresApproval: boolean;
  applicableGender: LeaveTypeGender;
  description: string;
  isActive: boolean;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  isHalfDay: boolean;
  reason: string;
  attachment?: string;
  status: LeaveStatus;
  appliedOn: string;
  actionBy?: string; // ID of HR/Admin who approved/rejected
  actionOn?: string;
  comments?: string;
}

export interface LeaveBalance {
  leaveTypeId: string;
  total: number;
  used: number;
  remaining: number;
}
