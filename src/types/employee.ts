export type Department = 'Engineering' | 'Sales' | 'Marketing' | 'HR' | 'Operations';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Intern' | 'Contract';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';
export type Gender = 'Male' | 'Female' | 'Other';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  address: string;
  photoUrl?: string;

  empId: string;
  department: Department;
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  reportingManager: string;
  salary: number;

  shiftId: string;

  loginEmail?: string;
  role: 'Employee' | 'HR Admin' | 'Manager';
  status: EmployeeStatus;
  
  createdAt: string;
  updatedAt: string;
}
