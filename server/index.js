import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';

import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory (root folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env file!');
  process.exit(1);
}

// Seed default employees if collection is empty
async function seedDefaultEmployees() {
  try {
    const count = await Employee.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial employees into MongoDB...');
      await Employee.insertMany([
        {
          empId: 'EMP-001',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          email: 'hr@company.com',
          loginEmail: 'hr@company.com',
          password: 'Admin@123',
          department: 'HR',
          designation: 'HR Director',
          employmentType: 'Full-time',
          reportingManager: 'Executive Board',
          salary: 120000,
          shiftId: 'shift-1',
          role: 'HR Admin',
          status: 'Active',
          phone: '+91 98765 12345',
          gender: 'Female',
          dob: '1992-03-20',
          address: 'Bhopal, MP',
          joiningDate: '2023-01-10',
        },
        {
          empId: 'EMP-002',
          firstName: 'Aman',
          lastName: 'Verma',
          email: 'presales@company.com',
          loginEmail: 'presales@company.com',
          password: 'Admin@123',
          department: 'Sales',
          designation: 'Pre Sales Executive',
          employmentType: 'Full-time',
          reportingManager: 'Sarah Jenkins',
          salary: 65000,
          shiftId: 'shift-1',
          role: 'Employee',
          status: 'Active',
          phone: '+91 98765 43210',
          gender: 'Male',
          dob: '1998-05-14',
          address: 'Indore, MP',
          joiningDate: '2024-01-15',
        },
        {
          empId: 'EMP-003',
          firstName: 'James',
          lastName: 'Wilson',
          email: 'sales@company.com',
          loginEmail: 'sales@company.com',
          password: 'Admin@123',
          department: 'Sales',
          designation: 'Field Sales Lead',
          employmentType: 'Full-time',
          reportingManager: 'Michael Chen',
          salary: 75000,
          shiftId: 'shift-1',
          role: 'Employee',
          status: 'Active',
          phone: '+91 98765 67890',
          gender: 'Male',
          dob: '1995-08-19',
          address: 'Indore, MP',
          joiningDate: '2024-02-01',
        },
        {
          empId: 'EMP-004',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'manager@company.com',
          loginEmail: 'manager@company.com',
          password: 'Admin@123',
          department: 'Operations',
          designation: 'Operations Manager',
          employmentType: 'Full-time',
          reportingManager: 'Sarah Jenkins',
          salary: 95000,
          shiftId: 'shift-1',
          role: 'Manager',
          status: 'Active',
          phone: '+91 98765 99999',
          gender: 'Male',
          dob: '1990-11-12',
          address: 'Indore, MP',
          joiningDate: '2023-06-15',
        }
      ]);
      console.log('✅ Default employees seeded successfully into MongoDB!');
    }
  } catch (err) {
    console.error('Error seeding default employees:', err.message);
  }
}

// Seed default attendance if attendance collection is empty
async function seedDefaultAttendance() {
  try {
    const count = await Attendance.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial attendance records into MongoDB collection "attendance"...');
      const employees = await Employee.find();
      const recordsToSeed = [];
      const today = new Date();

      // Seed for the last 7 days so trends are immediately visible
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

        employees.forEach((emp, index) => {
          if (isWeekend) return;
          const status = index % 5 === 0 ? 'Late' : index % 7 === 0 ? 'On Leave' : 'Present';
          recordsToSeed.push({
            employeeId: emp.empId || emp._id.toString(),
            date: dateStr,
            shiftId: emp.shiftId || 'shift-1',
            checkIn: status === 'Present' ? '09:00' : status === 'Late' ? '09:35' : undefined,
            checkOut: status === 'On Leave' ? undefined : '18:00',
            totalHours: status === 'Present' ? 9 : status === 'Late' ? 8.4 : 0,
            status,
            notes: `Recorded ${status} for ${emp.firstName}`
          });
        });
      }

      if (recordsToSeed.length > 0) {
        await Attendance.insertMany(recordsToSeed);
        console.log(`✅ Seeded ${recordsToSeed.length} attendance records into MongoDB "attendance" collection!`);
      }
    }
  } catch (err) {
    console.error('Error seeding attendance:', err.message);
  }
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB Database!');
    await seedDefaultEmployees();
    await seedDefaultAttendance();
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
  });

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running and connected!' });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
