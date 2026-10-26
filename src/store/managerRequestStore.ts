import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';

export interface ManagerRequest {
  id: string;
  type: 'add_employee' | 'leave_approval' | 'promotion' | 'resource' | 'general';
  title: string;
  categoryLabel: string;
  managerName: string;
  managerEmail: string;
  targetRole: string; // 'HR Admin'
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  createdAt: string;
  notes: string;
  employeeDetails?: {
    candidateName: string;
    department: string;
    designation: string;
    expectedSalary: number;
    employmentType: string;
    email: string;
    phone: string;
    joiningDate?: string;
  };
  hrRemarks?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface ManagerRequestState {
  requests: ManagerRequest[];
  addRequest: (req: Omit<ManagerRequest, 'id' | 'createdAt' | 'status'>) => ManagerRequest;
  updateStatus: (id: string, status: 'Approved' | 'Rejected', remarks?: string, reviewerName?: string) => void;
  deleteRequest: (id: string) => void;
  getPendingCount: () => number;
}

const initialRequests: ManagerRequest[] = [
  {
    id: 'req-101',
    type: 'add_employee',
    title: 'Request to Hire Junior React Developer',
    categoryLabel: 'New Staff Addition',
    managerName: 'Michael Chen',
    managerEmail: 'manager@company.com',
    targetRole: 'HR Admin',
    status: 'Pending',
    priority: 'High',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Urgent requirement to onboard 1 Frontend React developer for Q4 project deliverables in Operations & Tech.',
    employeeDetails: {
      candidateName: 'Rohan Mehra',
      department: 'Operations',
      designation: 'Junior Frontend Developer',
      expectedSalary: 55000,
      employmentType: 'Full-time',
      email: 'rohan.mehra@company.com',
      phone: '+91 98234 56789',
      joiningDate: '2026-11-01',
    },
  },
  {
    id: 'req-102',
    type: 'promotion',
    title: 'Promotion & Appraisal Recommendation for Aman Verma',
    categoryLabel: 'Appraisal & Promotion',
    managerName: 'Michael Chen',
    managerEmail: 'manager@company.com',
    targetRole: 'HR Admin',
    status: 'Pending',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Aman has exceeded quarterly field sales targets by 140%. Recommending designation upgrade to Senior Executive.',
  },
  {
    id: 'req-103',
    type: 'resource',
    title: 'High-Performance Laptop Requisition for Design Team',
    categoryLabel: 'Equipment / Asset',
    managerName: 'Michael Chen',
    managerEmail: 'manager@company.com',
    targetRole: 'HR Admin',
    status: 'Approved',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'MacBook Pro workstation replacement for Figma UI design rendering.',
    hrRemarks: 'Approved by HR Admin Sarah Jenkins. Sent to procurement.',
    reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewedBy: 'Sarah Jenkins (HR Admin)',
  },
];

export const useManagerRequestStore = create<ManagerRequestState>()(
  persist(
    (set, get) => ({
      requests: initialRequests,

      addRequest: (newReqData) => {
        const id = 'req-' + Date.now().toString().slice(-6);
        const createdAt = new Date().toISOString();
        const fullRequest: ManagerRequest = {
          ...newReqData,
          id,
          createdAt,
          status: 'Pending',
        };

        set((state) => ({
          requests: [fullRequest, ...state.requests],
        }));

        // Automatically trigger live notification to HR Admin in Topbar
        try {
          useNotificationStore.getState().addNotification({
            title: `New Manager Requisition: ${fullRequest.title}`,
            message: `${fullRequest.managerName} submitted a ${fullRequest.priority} priority request for HR Admin review.`,
            type: 'employee',
            link: '/dashboard',
            priority: fullRequest.priority === 'Urgent' ? 'high' : 'medium',
          });
        } catch (e) {
          console.error('Notification dispatch error', e);
        }

        return fullRequest;
      },

      updateStatus: (id, status, remarks, reviewerName = 'HR Admin') => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  hrRemarks: remarks || `Request marked as ${status} by ${reviewerName}`,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: reviewerName,
                }
              : r
          ),
        }));

        // Send confirmation notification
        try {
          useNotificationStore.getState().addNotification({
            title: `Requisition ${status}: ${id}`,
            message: `HR Admin ${reviewerName} has marked this request as ${status}.`,
            type: 'system',
            link: '/dashboard',
            priority: status === 'Approved' ? 'low' : 'medium',
          });
        } catch (e) {
          console.error(e);
        }
      },

      deleteRequest: (id) =>
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id),
        })),

      getPendingCount: () => {
        return get().requests.filter((r) => r.status === 'Pending').length;
      },
    }),
    {
      name: 'peoplehub-manager-requests',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
