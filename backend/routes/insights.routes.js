import express from 'express';
import { getAttendeeInsights } from '../controllers/insights.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Attendee insights (organizers see their events, admins/superadmins see all)
router.get(
  '/attendee-insights',
  authenticate,
  authorize('organizer', 'admin', 'superadmin'),
  getAttendeeInsights
);

export default router;
