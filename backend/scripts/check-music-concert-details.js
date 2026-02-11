import { supabase } from '../config/supabase.js';

async function checkMusicConcertDetails() {
  try {
    // Get Music Concert event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'Music Concert')
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      return;
    }

    // Get bookings for this event
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_id', event.id)
      .eq('status', 'confirmed');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }

    const totalTicketsSold = bookings.reduce((sum, b) => sum + b.number_of_tickets, 0);
    const attendanceRate = ((totalTicketsSold / event.total_tickets) * 100).toFixed(1);

    console.log('\n🎵 MUSIC CONCERT EVENT DETAILS 🎵\n');
    console.log('═══════════════════════════════════════════\n');
    console.log(`📌 Event Title: ${event.title}`);
    console.log(`📅 Date: ${new Date(event.date).toLocaleString()}`);
    console.log(`📍 Location: ${event.location}`);
    console.log(`💰 Price: $${event.price}`);
    console.log(`🎫 Total Capacity: ${event.total_tickets} tickets`);
    console.log(`✅ Available Tickets: ${event.available_tickets} tickets`);
    console.log(`📊 Tickets Sold: ${totalTicketsSold} tickets`);
    console.log(`📈 Attendance Rate: ${attendanceRate}% (what dashboard shows)`);
    console.log(`📝 Number of Bookings: ${bookings.length}`);
    console.log('\n═══════════════════════════════════════════\n');

    console.log('💡 EXPLANATION:');
    console.log(`The ${attendanceRate}% you see on the dashboard is the attendance rate,`);
    console.log(`which represents: (Tickets Sold / Total Capacity) × 100`);
    console.log(`\nIn this case: ${totalTicketsSold} / ${event.total_tickets} × 100 = ${attendanceRate}%`);
    console.log(`\nThis means only ${attendanceRate}% of the event's capacity has been filled.`);
    console.log(`There are still ${event.available_tickets} tickets available for sale!\n`);

    if (bookings.length > 0) {
      console.log('📋 BOOKING DETAILS:\n');
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. Booking #${booking.booking_reference}`);
        console.log(`   🎫 Tickets: ${booking.number_of_tickets}`);
        console.log(`   💵 Amount: $${booking.total_amount}`);
        console.log(`   📅 Booked: ${new Date(booking.created_at).toLocaleString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkMusicConcertDetails();
