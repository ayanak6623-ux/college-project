import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { LeaveType, LeaveRequest, LeaveStatus } from '../types/leave';
import { useAttendanceStore } from './attendanceStore';

const defaultLeaveTypes: LeaveType[] = [
  { id: 'lt-1', name: 'Vacation Leave', code: 'VL', color: '#3b82f6', yearlyQuota: 15, isPaid: true, carryForward: true, maxCarryForward: 5, requiresApproval: true, applicableGender: 'All', description: 'Paid vacation leave', isActive: true },
  { id: 'lt-2', name: 'Personal Leave', code: 'PL', color: '#8b5cf6', yearlyQuota: 5, isPaid: true, carryForward: false, maxCarryForward: 0, requiresApproval: true, applicableGender: 'All', description: 'Leave for personal reasons', isActive: true },
  { id: 'lt-3', name: 'Sick Leave', code: 'SL', color: '#10b981', yearlyQuota: 10, isPaid: true, carryForward: true, maxCarryForward: 10, requiresApproval: false, applicableGender: 'All', description: 'Leave for medical reasons', isActive: true },
  { id: 'lt-4', name: 'Casual Leave', code: 'CL', color: '#f59e0b', yearlyQuota: 7, isPaid: true, carryForward: false, maxCarryForward: 0, requiresApproval: true, applicableGender: 'All', description: 'Short duration casual leaves', isActive: true },
  { id: 'lt-5', name: 'Maternity Leave', code: 'ML', color: '#ec4899', yearlyQuota: 90, isPaid: true, carryForward: false, maxCarryForward: 0, requiresApproval: true, applicableGender: 'Female', description: 'Paid maternity leave', isActive: true },
  { id: 'lt-6', name: 'Paternity Leave', code: 'PTL', color: '#06b6d4', yearlyQuota: 14, isPaid: true, carryForward: false, maxCarryForward: 0, requiresApproval: true, applicableGender: 'Male', description: 'Paid paternity leave', isActive: true },
  { id: 'lt-7', name: 'Unpaid Leave', code: 'LWP', color: '#64748b', yearlyQuota: 0, isPaid: false, carryForward: false, maxCarryForward: 0, requiresApproval: true, applicableGender: 'All', description: 'Leave without pay', isActive: true },
];

// Helper to generate some mock leave requests
const generateMockLeaves = (): LeaveRequest[] => {
  const records: LeaveRequest[] = [];
  const today = new Date();
  
  // Create a pending request
  const d1 = new Date(today);
  d1.setDate(d1.getDate() + 5);
  records.push({
    id: 'lr-1', employeeId: '1', leaveTypeId: 'lt-1',
    fromDate: d1.toISOString().split('T')[0], toDate: d1.toISOString().split('T')[0],
    totalDays: 1, isHalfDay: false, reason: 'Family trip', status: 'Pending',
    appliedOn: today.toISOString().split('T')[0]
  });

  // Create an approved request in the past
  const d2 = new Date(today);
  d2.setDate(d2.getDate() - 10);
  records.push({
    id: 'lr-2', employeeId: '2', leaveTypeId: 'lt-3',
    fromDate: d2.toISOString().split('T')[0], toDate: d2.toISOString().split('T')[0],
    totalDays: 1, isHalfDay: false, reason: 'Fever', status: 'Approved',
    appliedOn: new Date(d2.getTime() - 86400000).toISOString().split('T')[0],
    actionBy: 'Admin', actionOn: d2.toISOString().split('T')[0], comments: 'Take care'
  });

  return records;
};

interface LeaveStore {
  leaveTypes: LeaveType[];
  leaveRequests: LeaveRequest[];
  
  // Leave Types Actions
  addLeaveType: (type: Omit<LeaveType, 'id'>) => void;
  updateLeaveType: (id: string, type: Partial<LeaveType>) => void;
  deleteLeaveType: (id: string) => void;
  
  // Leave Requests Actions
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  updateLeaveRequestStatus: (id: string, status: LeaveStatus, actionBy: string, comments?: string) => void;
}

export const useLeaveStore = create<LeaveStore>()(
  persist(
    (set, get) => ({
      leaveTypes: defaultLeaveTypes,
      leaveRequests: generateMockLeaves(),

      addLeaveType: (type) => set((state) => ({
        leaveTypes: [...state.leaveTypes, { ...type, id: uuidv4() }]
      })),

      updateLeaveType: (id, data) => set((state) => ({
        leaveTypes: state.leaveTypes.map(lt => lt.id === id ? { ...lt, ...data } : lt)
      })),

      deleteLeaveType: (id) => set((state) => ({
        leaveTypes: state.leaveTypes.filter(lt => lt.id !== id)
      })),

      addLeaveRequest: (req) => set((state) => {
        const newReq: LeaveRequest = {
          ...req,
          id: uuidv4(),
          status: 'Pending',
          appliedOn: new Date().toISOString().split('T')[0]
        };
        return { leaveRequests: [newReq, ...state.leaveRequests] };
      }),

      updateLeaveRequestStatus: (id, status, actionBy, comments) => {
        set((state) => {
          const req = state.leaveRequests.find(r => r.id === id);
          if (!req) return state;

          const updatedReq = { ...req, status, actionBy, comments, actionOn: new Date().toISOString().split('T')[0] };
          
          return {
            leaveRequests: state.leaveRequests.map(r => r.id === id ? updatedReq : r)
          };
        });
      }
    }),
    {
      name: 'hrms-leave-storage'
    }
  )
);
