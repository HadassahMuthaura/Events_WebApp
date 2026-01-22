import express from 'express';
import { body } from 'express-validator';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  searchEvents
} from '../controllers/event.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('date').isISO8601(),
  body('location').trim().notEmpty(),
  body('price').isNumeric(),
  body('category').trim().notEmpty(),
  body('sale_start_date').optional().isISO8601(),
  body('sale_end_date').optional().isISO8601()
];

// Public routes
router.get('/', getAllEvents);
router.get('/search', searchEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.post('/', authenticate, authorize('superadmin', 'admin', 'organizer'), eventValidation, createEvent);
router.put('/:id', authenticate, authorize('superadmin', 'admin', 'organizer'), eventValidation, updateEvent);
router.delete('/:id', authenticate, authorize('superadmin', 'admin', 'organizer'), deleteEvent);

export default router;
