import { create } from 'zustand';
import type { Employee } from '../types/employee';

interface EmployeeState {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployee: (id: string) => Employee | undefined;
}

const API_URL = 'http://localhost:5000/api/employees';

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      set({ employees: data, error: null });
    } catch (error: any) {
      set({ error: error.message });
      console.error(error);
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
      if (!response.ok) throw new Error('Failed to add employee');
      const newEmployee = await response.json();
      set((state) => ({ employees: [newEmployee, ...state.employees] }));
    } catch (error) {
      console.error(error);
    }
  },

  updateEmployee: async (id, updatedFields) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error('Failed to update employee');
      const updatedEmp = await response.json();
      set((state) => ({
        employees: state.employees.map((emp) => (emp.id === id ? updatedEmp : emp)),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete employee');
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  getEmployee: (id) => {
    return get().employees.find((emp) => emp.id === id);
  },
}));
