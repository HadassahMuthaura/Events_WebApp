import { supabase } from '../config/supabase.js';

// Create a review
export const createReview = async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;

    if (!event_id || !rating) {
      return res.status(400).json({ error: 'Event ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user attended the event
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('user_id', req.user.id)
      .eq('event_id', event_id)
      .in('status', ['attended', 'confirmed'])
      .single();

    const verified_attendee = booking && booking.status === 'attended';

    // Check if user already reviewed this event
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('event_id', event_id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this event' });
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        event_id,
        user_id: req.user.id,
        rating,
        comment,
        verified_attendee
      }])
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for an event
export const getEventReviews = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { verified_only } = req.query;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .eq('event_id', event_id);

    if (verified_only === 'true') {
      query = query.eq('verified_attendee', true);
    }

    const { data: reviews, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Count ratings by stars
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: parseFloat(avgRating.toFixed(1)),
        verified: reviews.filter(r => r.verified_attendee).length,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user owns the review
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!review || review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (rating) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the review
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!review || review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: review } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', id)
      .single();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { data: updated, error } = await supabase
      .from('reviews')
      .update({ helpful_count: (review.helpful_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Marked as helpful',
      review: updated
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark as helpful' });
  }
};

export default {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
};
