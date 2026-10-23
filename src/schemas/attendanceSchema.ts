import { z } from 'zod';

export const attendanceZodSchema = z.object({
  employeeId: z
    .string({ required_error: 'Employee ID is required' })
    .min(1, 'Employee ID cannot be empty'),
  date: z
    .string({ required_error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format (e.g. 2026-10-23)'),
  shiftId: z
    .string()
    .optional()
    .default('shift-1'),
  checkIn: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-in must be in HH:mm format (e.g. 09:30)')
    .optional()
    .or(z.literal('')),
  checkOut: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-out must be in HH:mm format (e.g. 18:00)')
    .optional()
    .or(z.literal('')),
  totalHours: z
    .number()
    .min(0, 'Total hours cannot be negative')
    .max(24, 'Total hours cannot exceed 24')
    .optional()
    .default(0),
  status: z.enum(['Present', 'Absent', 'Late', 'Half-day', 'On Leave'], {
    errorMap: () => ({ message: "Status must be 'Present', 'Absent', 'Late', 'Half-day', or 'On Leave'" })
  }),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
});

export type AttendanceFormValues = z.infer<typeof attendanceZodSchema>;
