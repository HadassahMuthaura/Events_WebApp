import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/', authenticate, authorize('superadmin', 'admin'), getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.patch('/:id/role', authenticate, authorize('superadmin'), updateUserRole);
router.delete('/:id', authenticate, authorize('superadmin'), deleteUser);

export default router;
