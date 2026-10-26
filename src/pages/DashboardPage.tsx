import React from 'react';
import { useAuthStore } from '../store';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { EmployeeDashboard } from './dashboard/EmployeeDashboard';
import { ManagerDashboard } from './dashboard/ManagerDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // If role is Manager, show the dedicated Manager Dashboard
  if (user?.role === 'Manager') {
    return <ManagerDashboard />;
  }

  // If role is strictly 'Employee', show the personal employee dashboard
  if (user?.role === 'Employee') {
    return <EmployeeDashboard />;
  }

  // Otherwise (HR Admin, admin), show the full HR Admin Dashboard
  return <AdminDashboard />;
};
