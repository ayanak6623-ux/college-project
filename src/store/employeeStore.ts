import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Employee } from '../types/employee';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  isBackendConnected: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Employee>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployee: (id: string) => Employee | undefined;
}

const API_URL = 'http://localhost:5000/api/employees';

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,
      isBackendConnected: true,

      fetchEmployees: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch(API_URL);
          if (!response.ok) throw new Error(`Server returned status ${response.status}`);
          const data = await response.json();
          set({ employees: data, error: null, isBackendConnected: true });
        } catch (error: any) {
          console.warn('Backend fetch notice:', error.message || error);
          set({ 
            error: error.message || 'Cannot reach backend server at http://localhost:5000', 
            isBackendConnected: false 
          });
          // Note: We deliberately do NOT wipe `employees: []` on failure,
          // so existing cached employees stay visible in the UI without disruption.
        } finally {
          set({ isLoading: false });
        }
      },

      addEmployee: async (emp) => {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to save employee to database');
          }
          const newEmployee = await response.json();
          set((state) => ({ 
            employees: [newEmployee, ...state.employees.filter(e => e.empId !== newEmployee.empId && e.id !== newEmployee.id)],
            isBackendConnected: true,
            error: null
          }));
          return newEmployee;
        } catch (error: any) {
          console.error('Error adding employee to backend:', error);
          // Optimistic local fallback so employee data is never lost
          const fallbackEmp: Employee = {
            ...emp,
            id: 'local_' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Employee;
          set((state) => ({ 
            employees: [fallbackEmp, ...state.employees],
            isBackendConnected: false 
          }));
          throw error;
        }
      },

      updateEmployee: async (id, updatedFields) => {
        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields),
          });
          if (!response.ok) throw new Error('Failed to update employee on server');
          const updatedEmp = await response.json();
          set((state) => ({
            employees: state.employees.map((emp) => (emp.id === id || emp.empId === id ? updatedEmp : emp)),
            isBackendConnected: true,
            error: null
          }));
        } catch (error) {
          console.error('Update employee error:', error);
          // Local fallback
          set((state) => ({
            employees: state.employees.map((emp) => (emp.id === id || emp.empId === id ? { ...emp, ...updatedFields } : emp)),
          }));
        }
      },

      deleteEmployee: async (id) => {
        try {
          const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete employee on server');
          set((state) => ({
            employees: state.employees.filter((emp) => emp.id !== id && emp.empId !== id),
            isBackendConnected: true,
            error: null
          }));
        } catch (error) {
          console.error('Delete employee error:', error);
          set((state) => ({
            employees: state.employees.filter((emp) => emp.id !== id && emp.empId !== id),
          }));
        }
      },

      getEmployee: (id) => {
        return get().employees.find((emp) => emp.id === id || emp.empId === id);
      },
    }),
    {
      name: 'hrms_employees_cache',
      partialize: (state) => ({ employees: state.employees }),
    }
  )
);
