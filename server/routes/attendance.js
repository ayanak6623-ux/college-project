import express from 'express';
import Attendance from '../models/Attendance.js';
import { attendanceZodSchema, updateAttendanceZodSchema } from '../schemas/attendanceValidation.js';

const router = express.Router();

// Get all attendance records (with optional filtering by date or employeeId)
router.get('/', async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (employeeId) filter.employeeId = employeeId;

    const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });

    const formatted = records.map((rec) => {
      const obj = rec.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or Upsert Attendance Record (with Zod validation)
router.post('/', async (req, res) => {
  try {
    // 1. Zod Validation
    const validation = attendanceZodSchema.safeParse(req.body);
    if (!validation.success) {
      const formattedErrors = (validation.error.issues || validation.error.errors || []).map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation failed on attendance data', 
        errors: formattedErrors 
      });
    }

    const validData = validation.data;

    // 2. Check if a record already exists for this employee on this date (Upsert)
    const existing = await Attendance.findOne({
      employeeId: validData.employeeId,
      date: validData.date
    });

    let savedRecord;
    if (existing) {
      existing.set(validData);
      savedRecord = await existing.save();
    } else {
      const newAttendance = new Attendance(validData);
      savedRecord = await newAttendance.save();
    }

    const obj = savedRecord.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing attendance record by ID
router.put('/:id', async (req, res) => {
  try {
    // 1. Partial Zod Validation
    const validation = updateAttendanceZodSchema.safeParse(req.body);
    if (!validation.success) {
      const formattedErrors = (validation.error.issues || validation.error.errors || []).map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation failed on attendance update', 
        errors: formattedErrors 
      });
    }

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const obj = updated.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an attendance record by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
