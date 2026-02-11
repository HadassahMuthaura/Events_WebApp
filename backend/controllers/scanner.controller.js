import { supabase } from '../config/supabase.js';

// Scan/validate a ticket
export const scanTicket = async (req, res) => {
  try {
    const { reference_number } = req.body;

    if (!reference_number) {
      return res.status(400).json({ error: 'Reference number is required' });
    }

    // Get booking with event and user details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          id,
          title,
          date,
          location,
          venue,
          organizer_id
        ),
        users:users!bookings_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('booking_reference', reference_number)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to scan for this event
    const isOrganizer = booking.events.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ 
        error: `You don't have permission to scan tickets for "${booking.events.title}". ${
          req.user.role === 'organizer' 
            ? 'As an organizer, you can only scan tickets for events you created.' 
            : 'Only organizers, admins, and super admins can scan tickets.'
        }`,
        booking
      });
    }

    // Check if ticket is already scanned
    if (booking.checked_in) {
      return res.status(400).json({
        error: 'Ticket already scanned',
        already_scanned: true,
        scanned_at: booking.checked_in_at,
        booking
      });
    }

    // Check if ticket is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'This ticket has been cancelled',
        cancelled: true,
        booking
      });
    }

    // Mark ticket as checked in
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: req.user.id,
        status: 'attended'
      })
      .eq('id', booking.id)
      .select(`
        *,
        events (
          id,
          title,
          date,
          location,
          venue
        ),
        users:users!bookings_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Ticket scanned successfully',
      booking: updatedBooking,
      success: true
    });
  } catch (error) {
    console.error('Error scanning ticket:', error);
    res.status(500).json({ error: 'Failed to scan ticket' });
  }
};

// Get scan history for an event
export const getScanHistory = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Get event to check permissions
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', event_id)
      .single();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check permissions
    const isOrganizer = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ 
        error: 'You do not have permission to view scan history for this event' 
      });
    }

    // Get all bookings with check-in status
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey (
          full_name,
          email
        ),
        checked_in_by_user:users!bookings_checked_in_by_fkey (
          full_name
        )
      `)
      .eq('event_id', event_id)
      .order('checked_in_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Calculate statistics
    const total = bookings.length;
    const checkedIn = bookings.filter(b => b.checked_in).length;
    const notCheckedIn = total - checkedIn;
    const totalTickets = bookings.reduce((sum, b) => sum + b.number_of_tickets, 0);
    const scannedTickets = bookings
      .filter(b => b.checked_in)
      .reduce((sum, b) => sum + b.number_of_tickets, 0);
    const notScannedTickets = totalTickets - scannedTickets;

    res.json({
      bookings,
      statistics: {
        total_bookings: total,
        checked_in_bookings: checkedIn,
        not_checked_in_bookings: notCheckedIn,
        total_tickets: totalTickets,
        checked_in: scannedTickets,  // Number of tickets checked in
        not_checked_in: notScannedTickets,  // Number of tickets not checked in
        scanned_tickets: scannedTickets,
        attendance_rate: totalTickets > 0 ? ((scannedTickets / totalTickets) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
};

// Get list of events for scanner (only events user can scan)
export const getScannerEvents = async (req, res) => {
  try {
    // Get events from 7 days ago to future (to allow scanning for recent events)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let query = supabase
      .from('events')
      .select('*')
      .gte('date', sevenDaysAgo.toISOString())
      .order('date', { ascending: false });

    // If organizer, only show their events
    if (req.user.role === 'organizer') {
      query = query.eq('organizer_id', req.user.id);
    }
    // Admins and superadmins can see all events

    const { data: events, error } = await query;

    if (error) throw error;

    res.json({ events: events || [] });
  } catch (error) {
    console.error('Error fetching scanner events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};
