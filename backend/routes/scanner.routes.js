import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { scanTicket, getScanHistory, getScannerEvents } from '../controllers/scanner.controller.js';

const router = express.Router();

// All routes require authentication and organizer/admin/superadmin role
router.use(authenticate);
router.use(authorize('organizer', 'admin', 'superadmin'));

// POST /api/scanner/scan - Scan a ticket
router.post('/scan', scanTicket);

// GET /api/scanner/events - Get events user can scan
router.get('/events', getScannerEvents);

// GET /api/scanner/history/:event_id - Get scan history for an event
router.get('/history/:event_id', getScanHistory);

export default router;
