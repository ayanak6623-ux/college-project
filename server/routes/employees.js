import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    // Transform _id to id for the frontend
    const formatted = employees.map(emp => {
      const obj = emp.toObject();
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

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    const obj = savedEmployee.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
    
    const obj = updatedEmployee.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
