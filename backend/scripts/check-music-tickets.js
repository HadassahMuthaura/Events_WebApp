import { supabase } from '../config/supabase.js';

async function checkMusicTickets() {
  try {
    // Get all confirmed bookings for music category events
    const { data: musicBookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        number_of_tickets,
        total_amount,
        created_at,
        events!inner(
          id,
          title,
          category,
          date,
          price
        )
      `)
      .eq('status', 'confirmed')
      .eq('events.category', 'music');

    if (error) {
      console.error('Error fetching music bookings:', error);
      return;
    }

    // Calculate statistics
    const totalBookings = musicBookings.length;
    const totalTickets = musicBookings.reduce((sum, booking) => sum + booking.number_of_tickets, 0);
    const totalRevenue = musicBookings.reduce((sum, booking) => sum + booking.total_amount, 0);

    // Get unique events
    const uniqueEvents = new Set(musicBookings.map(b => b.events.id));

    console.log('\n🎵 MUSIC CATEGORY TICKET SALES REPORT 🎵\n');
    console.log('═══════════════════════════════════════════\n');
    console.log(`📊 Total Music Events: ${uniqueEvents.size}`);
    console.log(`🎫 Total Tickets Sold: ${totalTickets}`);
    console.log(`📝 Total Bookings: ${totalBookings}`);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`📈 Average Tickets per Booking: ${(totalTickets / totalBookings).toFixed(2)}`);
    console.log('\n═══════════════════════════════════════════\n');

    if (musicBookings.length > 0) {
      console.log('📋 TOP MUSIC EVENTS:\n');
      
      // Group by event
      const eventMap = new Map();
      musicBookings.forEach(booking => {
        const eventId = booking.events.id;
        if (!eventMap.has(eventId)) {
          eventMap.set(eventId, {
            title: booking.events.title,
            date: booking.events.date,
            tickets: 0,
            bookings: 0,
            revenue: 0
          });
        }
        const event = eventMap.get(eventId);
        event.tickets += booking.number_of_tickets;
        event.bookings += 1;
        event.revenue += booking.total_amount;
      });

      // Sort by tickets sold
      const topEvents = Array.from(eventMap.values())
        .sort((a, b) => b.tickets - a.tickets);

      topEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   📅 Date: ${new Date(event.date).toLocaleDateString()}`);
        console.log(`   🎫 Tickets: ${event.tickets} | 📝 Bookings: ${event.bookings} | 💰 Revenue: $${event.revenue.toFixed(2)}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No music tickets have been sold yet.\n');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkMusicTickets();
