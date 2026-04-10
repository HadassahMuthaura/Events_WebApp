import express from 'express';
import { handleAssistant } from '../controllers/assistant.controller.js';
import { authenticateOptional } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/assistant
 * Voice assistant endpoint that processes user queries
 * 
 * ✅ SECURITY: Uses optional authentication
 * - Validates JWT token if provided
 * - Allows guest access if no token
 * - Extracts verified user context from token (not from body)
 * 
 * Request Headers:
 *   Authorization: "Bearer <jwt_token>" (optional, recommended)
 * 
 * Request Body:
 *   - query or transcript (required): User voice input
 *   - page (optional): Current page for context
 *   - context (optional): Additional context
 * 
 * Response:
 *   - action: Action to perform (navigate, speak_only, book_event, etc.)
 *   - params: Action parameters
 *   - reply: Voice response text
 *   - isAuthenticated: Whether user is authenticated (from verified token)
 *   - userId: User ID if authenticated
 */
router.post('/', authenticateOptional, handleAssistant);

export default router;
