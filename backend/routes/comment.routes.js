import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  addComment, 
  getEventComments, 
  deleteComment, 
  updateComment 
} from '../controllers/comment.controller.js';

const router = express.Router();

// Add comment or announcement
router.post('/', authenticateToken, addComment);

// Get comments for an event
router.get('/event/:event_id', getEventComments);

// Update comment
router.put('/:id', authenticateToken, updateComment);

// Delete comment
router.delete('/:id', authenticateToken, deleteComment);

export default router;
