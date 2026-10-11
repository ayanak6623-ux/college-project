import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  department: { type: String },
  designation: { type: String },
  joiningDate: { type: String },
  employmentType: { type: String },
  reportingManager: { type: String },
  salary: { type: Number },
  shiftId: { type: String },
  role: { type: String, default: 'Employee' },
  status: { type: String, default: 'Active' },
  photoUrl: { type: String },
  loginEmail: { type: String },
  password: { type: String },
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
