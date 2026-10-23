import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: String, 
      required: true,
      index: true 
    },
    date: { 
      type: String, 
      required: true,
      index: true // Format: YYYY-MM-DD
    },
    shiftId: { 
      type: String, 
      default: 'shift-1' 
    },
    checkIn: { 
      type: String // Format: HH:mm
    },
    checkOut: { 
      type: String // Format: HH:mm
    },
    totalHours: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['Present', 'Absent', 'Late', 'Half-day', 'On Leave'], 
      default: 'Present' 
    },
    notes: { 
      type: String 
    }
  },
  { 
    timestamps: true,
    collection: 'attendance' // Explicitly maps to the 'attendance' collection created in MongoDB
  }
);

// Compound index to quickly find an employee's record on a specific date
attendanceSchema.index({ employeeId: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
