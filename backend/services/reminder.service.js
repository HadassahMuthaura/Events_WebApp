import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { sendEventReminder } from './email.service.js';

console.log('📅 Reminder service initialized');

// Run every hour to check for upcoming events
cron.schedule('0 * * * *', async () => {
  console.log('🔔 Checking for upcoming events to send reminders...');
  
  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Get events happening in 24 hours
    const { data: upcomingIn24h, error: error24 } = await supabase
      .from('events')
      .select('*')
      .gte('date', twentyFourHoursFromNow.toISOString())
      .lte('date', new Date(twentyFourHoursFromNow.getTime() + 60 * 60 * 1000).toISOString())
      .eq('status', 'active');

    if (upcomingIn24h && upcomingIn24h.length > 0) {
      console.log(`Found ${upcomingIn24h.length} events in 24 hours`);
      await sendRemindersForEvents(upcomingIn24h, 24);
    }

    // Get events happening in 1 hour
    const { data: upcomingIn1h, error: error1 } = await supabase
      .from('events')
      .select('*')
      .gte('date', oneHourFromNow.toISOString())
      .lte('date', twoHoursFromNow.toISOString())
      .eq('status', 'active');

    if (upcomingIn1h && upcomingIn1h.length > 0) {
      console.log(`Found ${upcomingIn1h.length} events in 1 hour`);
      await sendRemindersForEvents(upcomingIn1h, 1);
    }

  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

// Helper function to send reminders for events
async function sendRemindersForEvents(events, hoursUntil) {
  for (const event of events) {
    try {
      // Get all confirmed bookings for this event
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users(*)
        `)
        .eq('event_id', event.id)
        .eq('status', 'confirmed');

      if (error) {
        console.error(`Error fetching bookings for event ${event.id}:`, error);
        continue;
      }

      if (!bookings || bookings.length === 0) {
        continue;
      }

      console.log(`Sending ${hoursUntil}h reminders to ${bookings.length} users for event: ${event.title}`);

      // Send reminder to each user
      for (const booking of bookings) {
        if (booking.users && booking.users.email) {
          await sendEventReminder(booking, booking.users, event, hoursUntil);
          // Small delay to avoid overwhelming email server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (error) {
      console.error(`Error sending reminders for event ${event.id}:`, error);
    }
  }
}

// Check-in functionality
export const checkInAttendee = async (bookingId, organizerId) => {
  try {
    // Verify organizer owns the event
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, events(organizer_id)')
      .eq('id', bookingId)
      .single();

    if (!booking || booking.events.organizer_id !== organizerId) {
      throw new Error('Access denied');
    }

    // Mark as checked in
    const { data: updated, error } = await supabase
      .from('bookings')
      .update({ 
        checked_in_at: new Date().toISOString(),
        status: 'attended'
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    return updated;
  } catch (error) {
    console.error('Check-in error:', error);
    throw error;
  }
};

export default {
  checkInAttendee
};
