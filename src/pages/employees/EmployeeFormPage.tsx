import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, UploadCloud, User, Briefcase, Clock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmployeeStore } from '../../store/employeeStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import type { Department, EmploymentType, Gender } from '../../types/employee';
import { cn } from '../../utils/cn';
import { useAttendanceStore } from '../../store/attendanceStore';

const personalSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(5, 'Address is required'),
});

const jobSchema = z.object({
  department: z.enum(['Engineering', 'Sales', 'Marketing', 'HR', 'Operations']),
  designation: z.string().min(2, 'Designation is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Intern', 'Contract']),
  reportingManager: z.string().min(2, 'Reporting manager is required'),
  salary: z.coerce.number().min(1, 'Salary must be greater than 0'),
});

const shiftSchema = z.object({
  shiftId: z.string().min(1, 'Shift is required'),
});

const accountSchema = z.object({
  loginEmail: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Employee', 'HR Admin', 'Manager']),
});

// We create a combined schema for final submission if needed, but we'll validate step by step.
const formSchemas = [personalSchema, jobSchema, shiftSchema, accountSchema];

const steps = [
  { id: 0, title: 'Personal', icon: User },
  { id: 1, title: 'Job', icon: Briefcase },
  { id: 2, title: 'Shift', icon: Clock },
  { id: 3, title: 'Account', icon: KeyRound },
  { id: 4, title: 'Review', icon: Check },
];

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addEmployee, updateEmployee, getEmployee, employees } = useEmployeeStore();
  const { shifts } = useAttendanceStore();
  const [currentStep, setCurrentStep] = useState(0);

  const existingEmployee = id ? getEmployee(id) : null;

  const defaultValues = existingEmployee ? {
    firstName: existingEmployee.firstName,
    lastName: existingEmployee.lastName,
    email: existingEmployee.email,
    phone: existingEmployee.phone,
    dob: existingEmployee.dob,
    gender: existingEmployee.gender,
    address: existingEmployee.address,
    department: existingEmployee.department,
    designation: existingEmployee.designation,
    joiningDate: existingEmployee.joiningDate,
    employmentType: existingEmployee.employmentType,
    reportingManager: existingEmployee.reportingManager,
    salary: existingEmployee.salary,
    shiftId: existingEmployee.shiftId,
    loginEmail: existingEmployee.loginEmail || existingEmployee.email,
    role: existingEmployee.role,
    password: '********',
  } : {
    gender: 'Male' as Gender,
    department: 'Engineering' as Department,
    employmentType: 'Full-time' as EmploymentType,
    shiftId: shifts[0]?.id || '',
    role: 'Employee' as const,
    password: '',
  };

  const currentSchema = formSchemas[currentStep] || z.any(); // Review step uses z.any
  
  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<any>({
    resolver: (zodResolver as any)(currentSchema),
    defaultValues,
    mode: 'onChange'
  });

  const nextStep = async () => {
    if (currentStep === 4) return;
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = () => {
    const data = getValues();
    if (isEdit && id) {
      updateEmployee(id, data as any);
      toast.success('Employee updated successfully!');
    } else {
      const empId = `EMP-00${employees.length + 1}`.padStart(8, '0');
      addEmployee({
        ...(data as any),
        empId,
        status: 'Active'
      });
      toast.success('Employee added successfully!');
    }
    navigate('/employees');
  };

  // Form rendering sections
  const renderPersonal = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input label="First Name" {...register('firstName')} error={errors.firstName?.message as string} />
      <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message as string} />
      <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message as string} />
      <Input label="Phone Number" {...register('phone')} error={errors.phone?.message as string} />
      <Input label="Date of Birth" type="date" {...register('dob')} error={errors.dob?.message as string} />
      <Select label="Gender" options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'},{label:'Other',value:'Other'}]} {...register('gender')} error={errors.gender?.message as string} />
      <div className="md:col-span-2">
        <Input label="Address" {...register('address')} error={errors.address?.message as string} />
      </div>
    </div>
  );

  const renderJob = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Select label="Department" options={['Engineering','Sales','Marketing','HR','Operations'].map(d=>({label:d,value:d}))} {...register('department')} error={errors.department?.message as string} />
      <Input label="Designation" {...register('designation')} error={errors.designation?.message as string} />
      <Input label="Joining Date" type="date" {...register('joiningDate')} error={errors.joiningDate?.message as string} />
      <Select label="Employment Type" options={['Full-time','Part-time','Intern','Contract'].map(d=>({label:d,value:d}))} {...register('employmentType')} error={errors.employmentType?.message as string} />
      <Input label="Reporting Manager" {...register('reportingManager')} error={errors.reportingManager?.message as string} />
      <Input label="Annual Salary ($)" type="number" {...register('salary')} error={errors.salary?.message as string} />
    </div>
  );

  const renderShift = () => (
    <div className="max-w-md">
      <Select 
        label="Assigned Shift" 
        options={shifts.map(s => ({ label: `${s.name} (${s.startTime} - ${s.endTime})`, value: s.id }))} 
        {...register('shiftId')} 
        error={errors.shiftId?.message as string} 
      />
      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border">
        <h4 className="font-medium text-sm mb-2">Shift Details</h4>
        <ul className="text-sm text-slate-500 space-y-1">
          {shifts.map(s => (
            <li key={s.id}>• {s.name}: {s.startTime} - {s.endTime}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="max-w-md space-y-6">
      <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 mb-6">
        <h4 className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-1">Account Credentials</h4>
        <p className="text-xs text-primary-600 dark:text-primary-400">
          Create the login credentials for this employee. They will use this email and password to access the portal.
        </p>
      </div>
      <Input label="Portal Login Email" type="email" {...register('loginEmail')} error={errors.loginEmail?.message as string} />
      <Input label="Initial Password" type="text" {...register('password')} error={errors.password?.message as string} placeholder="Create a secure password" />
      <Select label="System Role" options={['Employee','HR Admin','Manager'].map(d=>({label:d,value:d}))} {...register('role')} error={errors.role?.message as string} />
    </div>
  );

  const renderReview = () => {
    const data = getValues();
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-border">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 border-b border-border pb-2">Personal Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500 w-32 inline-block">Full Name:</span> {data.firstName} {data.lastName}</p>
              <p><span className="text-slate-500 w-32 inline-block">Email:</span> {data.email}</p>
              <p><span className="text-slate-500 w-32 inline-block">Phone:</span> {data.phone}</p>
              <p><span className="text-slate-500 w-32 inline-block">Gender & DOB:</span> {data.gender}, {data.dob}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 border-b border-border pb-2">Job Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500 w-32 inline-block">Department:</span> {data.department}</p>
              <p><span className="text-slate-500 w-32 inline-block">Designation:</span> {data.designation}</p>
              <p><span className="text-slate-500 w-32 inline-block">Employment:</span> {data.employmentType}</p>
              <p><span className="text-slate-500 w-32 inline-block">Shift:</span> {shifts.find(s => s.id === data.shiftId)?.name || data.shiftId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employees')} className="p-2 bg-white dark:bg-slate-900 border border-border rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="text-slate-500 dark:text-slate-400">Complete the steps below to {isEdit ? 'update the' : 'create a new'} employee record.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -z-10 -translate-y-1/2">
              <motion.div 
                className="h-full bg-primary-600 dark:bg-primary-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                    isActive ? "border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500" :
                    isCompleted ? "border-primary-600 bg-primary-600 text-white" :
                    "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  )}>
                    {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    isActive ? "text-primary-600 dark:text-primary-400" :
                    isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 4) onSubmit(); else nextStep(); }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="min-h-[300px]"
              >
                {currentStep === 0 && renderPersonal()}
                {currentStep === 1 && renderJob()}
                {currentStep === 2 && renderShift()}
                {currentStep === 3 && renderAccount()}
                {currentStep === 4 && renderReview()}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                Back
              </Button>
              {currentStep === 4 ? (
                <Button type="submit">
                  {isEdit ? 'Update Employee' : 'Add Employee'}
                </Button>
              ) : (
                <Button type="submit">
                  Next Step <ChevronRight size={18} className="ml-1" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
