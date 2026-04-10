import { supabase } from '../config/supabase.js';
import crypto from 'crypto';
import { sendEventInvitation } from '../services/email.service.js';

// Send event invitations
export const sendInvitations = async (req, res) => {
  try {
    const { event_id, emails } = req.body;

    if (!event_id || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Event ID and email list are required' });
    }

    // Check if user is the organizer of the event
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('organizer_id', req.user.id)
      .single();

    if (!event) {
      return res.status(403).json({ error: 'You can only send invitations for your own events' });
    }

    const invitations = [];
    const errors = [];

    // Create invitations
    for (const email of emails) {
      const token = crypto.randomBytes(32).toString('hex');
      
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert([{
          event_id,
          inviter_id: req.user.id,
          email: email.trim().toLowerCase(),
          token,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        errors.push({ email, error: error.message });
      } else {
        invitations.push(invitation);
        
        // Send invitation email (async)
        sendEventInvitation(invitation, req.user, event)
          .catch(err => console.error(`Failed to send email to ${email}:`, err));
      }
    }

    res.status(201).json({
      message: `${invitations.length} invitation(s) sent successfully`,
      invitations,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Send invitations error:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
};

// Get invitations for an event
export const getEventInvitations = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Check if user is the organizer
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', event_id)
      .single();

    if (!event || event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by status
    const stats = {
      total: invitations.length,
      pending: invitations.filter(i => i.status === 'pending').length,
      accepted: invitations.filter(i => i.status === 'accepted').length,
      declined: invitations.filter(i => i.status === 'declined').length
    };

    res.json({ invitations, stats });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

// Respond to invitation (accept/decline)
export const respondToInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, action } = req.body;

    if (!token || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Find invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*, events(*)')
      .eq('id', id)
      .eq('token', token)
      .single();

    if (invError || !invitation) {
      return res.status(404).json({ error: 'Invitation not found or invalid token' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already responded to' });
    }

    // Update invitation status
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ 
        status: newStatus,
        responded_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // If accepted, create booking automatically (if user is registered)
    let booking = null;
    if (action === 'accept') {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', invitation.email)
        .single();

      if (user && invitation.events.available_tickets > 0) {
        const { data: newBooking } = await supabase
          .from('bookings')
          .insert([{
            user_id: user.id,
            event_id: invitation.event_id,
            number_of_tickets: 1,
            total_amount: invitation.events.price || 0,
            status: 'confirmed',
            reference_number: 'INV' + Date.now()
          }])
          .select()
          .single();

        booking = newBooking;

        // Update available tickets
        await supabase
          .from('events')
          .update({ 
            available_tickets: invitation.events.available_tickets - 1 
          })
          .eq('id', invitation.event_id);
      }
    }

    res.json({
      message: `Invitation ${newStatus}`,
      status: newStatus,
      booking
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
};

export default {
  sendInvitations,
  getEventInvitations,
  respondToInvitation
};
