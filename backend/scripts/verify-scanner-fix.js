import { supabase } from '../config/supabase.js';

async function verifyMusicConcertBookings() {
  try {
    // Get Music Concert event
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('title', 'Music Concert')
      .single();

    // Get all bookings for this event
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        users:users!bookings_user_id_fkey(full_name, email)
      `)
      .eq('event_id', event.id);

    console.log('\n🎵 MUSIC CONCERT BOOKINGS VERIFICATION 🎵\n');
    console.log('═══════════════════════════════════════════\n');

    // Calculate statistics
    const totalBookings = bookings.length;
    const checkedInBookings = bookings.filter(b => b.checked_in).length;
    const notCheckedInBookings = totalBookings - checkedInBookings;
    
    const totalTickets = bookings.reduce((sum, b) => sum + b.number_of_tickets, 0);
    const scannedTickets = bookings.filter(b => b.checked_in).reduce((sum, b) => sum + b.number_of_tickets, 0);
    const notScannedTickets = totalTickets - scannedTickets;
    
    const attendanceRate = totalTickets > 0 ? ((scannedTickets / totalTickets) * 100).toFixed(1) : 0;

    console.log('📊 STATISTICS (AFTER FIX):\n');
    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Checked In Bookings: ${checkedInBookings}`);
    console.log(`Not Checked In Bookings: ${notCheckedInBookings}\n`);
    
    console.log(`Total Tickets: ${totalTickets}`);
    console.log(`✅ Checked In Tickets: ${scannedTickets}`);
    console.log(`⏳ Not Checked In Tickets: ${notScannedTickets}`);
    console.log(`📈 Attendance Rate: ${attendanceRate}%\n`);
    
    console.log('═══════════════════════════════════════════\n');
    console.log('📋 BOOKING DETAILS:\n');

    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.users.full_name} (${booking.users.email})`);
      console.log(`   Booking Reference: ${booking.booking_reference}`);
      console.log(`   Tickets: ${booking.number_of_tickets}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Check-in Status: ${booking.checked_in ? '✅ CHECKED IN' : '⏳ NOT CHECKED IN'}`);
      if (booking.checked_in) {
        console.log(`   Checked in at: ${new Date(booking.checked_in_at).toLocaleString()}`);
      }
      console.log('');
    });

    console.log('\n💡 WHAT THE SCANNER PAGE WILL NOW SHOW:\n');
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Checked In: ${scannedTickets} (number of TICKETS, not bookings)`);
    console.log(`   Not Checked In: ${notScannedTickets} (number of TICKETS, not bookings)`);
    console.log(`   Attendance Rate: ${attendanceRate}% (based on tickets)\n`);

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyMusicConcertBookings();
