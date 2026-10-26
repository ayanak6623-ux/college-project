import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { EmployeeListPage } from './pages/employees/EmployeeListPage';
import { EmployeeFormPage } from './pages/employees/EmployeeFormPage';
import { EmployeeProfilePage } from './pages/employees/EmployeeProfilePage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { AttendanceConfigPage } from './pages/attendance/AttendanceConfigPage';
import { LeavesPage } from './pages/leaves/LeavesPage';
import { LeaveTypesPage } from './pages/leaves/LeaveTypesPage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { PoliciesPage } from './pages/policies/PoliciesPage';
import { RewardsPage } from './pages/rewards/RewardsPage';
import { PayslipsPage } from './pages/payslips/PayslipsPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { AppLayout } from './layouts/AppLayout';
import { CanvasCursor } from './components/CanvasCursor';

function App() {
  return (
    <>
      <CanvasCursor />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/add" element={<EmployeeFormPage />} />
            <Route path="/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance-config" element={<AttendanceConfigPage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/leave-types" element={<LeaveTypesPage />} />
            
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/payslips" element={<PayslipsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />

            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white',
          style: {
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
    </>
  );
}

export default App;
