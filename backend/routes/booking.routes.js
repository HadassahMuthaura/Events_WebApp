import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookingByReference,
  cancelBooking,
  cancelBookingByReference,
  getAllBookings,
  checkInAttendee,
  verifyAndCheckIn
} from '../controllers/booking.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('event_id').notEmpty(),
  body('number_of_tickets').isInt({ min: 1 })
];

// Protected routes
router.post('/', authenticate, bookingValidation, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/all', authenticate, authorize('admin', 'superadmin'), getAllBookings);
router.get('/reference/:reference', authenticate, authorize('support', 'admin', 'superadmin'), getBookingByReference);
router.delete('/reference/:reference', authenticate, authorize('admin', 'superadmin'), cancelBookingByReference);
router.get('/:id', authenticate, getBookingById);
router.delete('/:id', authenticate, cancelBooking);

// Check-in routes (organizers)
router.post('/:id/check-in', authenticate, checkInAttendee);
router.post('/verify-qr', authenticate, verifyAndCheckIn);

export default router;
