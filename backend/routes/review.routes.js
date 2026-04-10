import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  createReview, 
  getEventReviews, 
  updateReview, 
  deleteReview,
  markReviewHelpful
} from '../controllers/review.controller.js';

const router = express.Router();

// Create review (authenticated users)
router.post('/', authenticateToken, createReview);

// Get reviews for an event (public)
router.get('/event/:event_id', getEventReviews);

// Update review
router.put('/:id', authenticateToken, updateReview);

// Delete review
router.delete('/:id', authenticateToken, deleteReview);

// Mark review as helpful
router.post('/:id/helpful', authenticateToken, markReviewHelpful);

export default router;
