import { supabase } from '../config/supabase.js';

// Add comment or announcement to event
export const addComment = async (req, res) => {
  try {
    const { event_id, comment_text, is_announcement } = req.body;

    if (!event_id || !comment_text) {
      return res.status(400).json({ error: 'Event ID and comment text are required' });
    }

    // If it's an announcement, verify user is the organizer
    if (is_announcement) {
      const { data: event } = await supabase
        .from('events')
        .select('organizer_id')
        .eq('id', event_id)
        .single();

      if (!event || event.organizer_id !== req.user.id) {
        return res.status(403).json({ error: 'Only event organizers can post announcements' });
      }
    }

    const { data: comment, error } = await supabase
      .from('event_comments')
      .insert([{
        event_id,
        user_id: req.user.id,
        comment_text,
        is_announcement: is_announcement || false
      }])
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: is_announcement ? 'Announcement posted' : 'Comment added',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments and announcements for an event
export const getEventComments = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { type } = req.query; // 'all', 'announcements', 'comments'

    let query = supabase
      .from('event_comments')
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .eq('event_id', event_id);

    if (type === 'announcements') {
      query = query.eq('is_announcement', true);
    } else if (type === 'comments') {
      query = query.eq('is_announcement', false);
    }

    const { data: comments, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the comment or is the event organizer
    const { data: comment } = await supabase
      .from('event_comments')
      .select('*, events(organizer_id)')
      .eq('id', id)
      .single();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id && comment.events.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('event_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;

    if (!comment_text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if user owns the comment
    const { data: comment } = await supabase
      .from('event_comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!comment || comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: updatedComment, error } = await supabase
      .from('event_comments')
      .update({ comment_text })
      .eq('id', id)
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.json({
      message: 'Comment updated',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export default {
  addComment,
  getEventComments,
  deleteComment,
  updateComment
};
