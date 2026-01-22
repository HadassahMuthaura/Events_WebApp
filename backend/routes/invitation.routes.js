import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  sendInvitations, 
  getEventInvitations, 
  respondToInvitation 
} from '../controllers/invitation.controller.js';

const router = express.Router();

// Send invitations (organizers only)
router.post('/', authenticateToken, sendInvitations);

// Get invitations for an event (organizers only)
router.get('/event/:event_id', authenticateToken, getEventInvitations);

// Respond to invitation (public with token)
router.post('/:id/respond', respondToInvitation);

export default router;
