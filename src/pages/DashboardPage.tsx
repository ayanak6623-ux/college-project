import React from 'react';
import { useAuthStore } from '../store';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { EmployeeDashboard } from './dashboard/EmployeeDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // If role is strictly 'Employee' (or not an admin/manager), show the personal employee dashboard
  if (user?.role === 'Employee') {
    return <EmployeeDashboard />;
  }

  // Otherwise (HR Admin, Manager, etc.), show the full Admin Dashboard
  return <AdminDashboard />;
};
