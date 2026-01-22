import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Get all users (Super Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, avatar_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Users can view their own profile, super admin can view all
    if (req.user.id !== id && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, avatar_url, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user role (Super Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['client', 'organizer', 'admin', 'support'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent modifying super admin
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (targetUser?.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot modify super admin role' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, email, full_name, role, phone, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    res.json({ 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, phone, avatar_url } = req.body;

    // Users can only update their own profile unless they're admin/superadmin
    if (req.user.id !== id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, phone, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting super admin
    const { data: targetUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (targetUser?.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
