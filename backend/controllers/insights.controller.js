import { supabase } from '../config/supabase.js';

// Get comprehensive attendee insights
export const getAttendeeInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build event filter based on role
    let eventFilter = {};
    if (userRole === 'organizer') {
      // Organizers see only their events
      eventFilter.organizer_id = userId;
    }
    // Admins and superadmins see all events (no filter needed)

    // 1. Get attendance by event (top performing events)
    const { data: eventAttendance, error: eventError } = await supabase
      .from('bookings')
      .select(`
        event_id,
        number_of_tickets,
        events!inner(
          id,
          title,
          category,
          date,
          organizer_id,
          total_tickets
        )
      `)
      .in('status', ['confirmed', 'attended']);

    if (eventError) throw eventError;

    // Filter by organizer if needed
    let filteredEventAttendance = eventAttendance;
    if (userRole === 'organizer') {
      filteredEventAttendance = eventAttendance.filter(
        booking => booking.events.organizer_id === userId
      );
    }

    // Aggregate bookings by event
    const eventMap = new Map();
    filteredEventAttendance.forEach(booking => {
      const eventId = booking.events.id;
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId: eventId,
          title: booking.events.title,
          category: booking.events.category,
          date: booking.events.date,
          totalTickets: booking.events.total_tickets,
          bookedTickets: 0,
          bookingCount: 0
        });
      }
      const event = eventMap.get(eventId);
      event.bookedTickets += booking.number_of_tickets;
      event.bookingCount += 1;
    });

    // Convert to array and sort by attendance
    const topEvents = Array.from(eventMap.values())
      .sort((a, b) => b.bookedTickets - a.bookedTickets)
      .slice(0, 10)
      .map(event => ({
        ...event,
        attendanceRate: ((event.bookedTickets / event.totalTickets) * 100).toFixed(1)
      }));

    // 2. Get attendance trends over time (monthly)
    const { data: bookingTrends, error: trendsError } = await supabase
      .from('bookings')
      .select(`
        created_at,
        number_of_tickets,
        events!inner(organizer_id)
      `)
      .in('status', ['confirmed', 'attended'])
      .order('created_at', { ascending: true });

    if (trendsError) throw trendsError;

    // Filter by organizer if needed
    let filteredTrends = bookingTrends;
    if (userRole === 'organizer') {
      filteredTrends = bookingTrends.filter(
        booking => booking.events.organizer_id === userId
      );
    }

    // Group by month
    const monthlyData = {};
    filteredTrends.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          tickets: 0,
          bookings: 0
        };
      }
      monthlyData[monthKey].tickets += booking.number_of_tickets;
      monthlyData[monthKey].bookings += 1;
    });

    const attendanceTrends = Object.values(monthlyData).slice(-12); // Last 12 months

    // 3. Category popularity analysis
    const categoryMap = new Map();
    filteredEventAttendance.forEach(booking => {
      const category = booking.events.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          bookings: 0,
          tickets: 0
        });
      }
      const cat = categoryMap.get(category);
      cat.bookings += 1;
      cat.tickets += booking.number_of_tickets;
    });

    const categoryPopularity = Array.from(categoryMap.values())
      .sort((a, b) => b.tickets - a.tickets)
      .map(cat => ({
        ...cat,
        percentage: 0 // Will calculate after we have total
      }));

    const totalTickets = categoryPopularity.reduce((sum, cat) => sum + cat.tickets, 0);
    categoryPopularity.forEach(cat => {
      cat.percentage = totalTickets > 0 ? ((cat.tickets / totalTickets) * 100).toFixed(1) : 0;
    });

    // 4. Time slot analysis (hour of day)
    const timeSlotMap = new Map();
    filteredEventAttendance.forEach(booking => {
      const eventDate = new Date(booking.events.date);
      const hour = eventDate.getHours();
      const timeSlot = hour < 12 ? 'Morning (6AM-12PM)' 
                     : hour < 18 ? 'Afternoon (12PM-6PM)' 
                     : 'Evening (6PM-12AM)';
      
      if (!timeSlotMap.has(timeSlot)) {
        timeSlotMap.set(timeSlot, {
          timeSlot,
          bookings: 0,
          tickets: 0
        });
      }
      const slot = timeSlotMap.get(timeSlot);
      slot.bookings += 1;
      slot.tickets += booking.number_of_tickets;
    });

    const timeSlotAnalysis = Array.from(timeSlotMap.values())
      .sort((a, b) => b.tickets - a.tickets);

    // 4b. Day of week and hour heatmap data
    const heatmapData = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Initialize heatmap structure
    const heatmapMap = new Map();
    days.forEach(day => {
      hours.forEach(hour => {
        heatmapMap.set(`${day}-${hour}`, {
          day,
          hour,
          dayIndex: days.indexOf(day),
          tickets: 0,
          events: 0
        });
      });
    });

    // Populate heatmap with actual data
    filteredEventAttendance.forEach(booking => {
      const eventDate = new Date(booking.events.date);
      const day = days[eventDate.getDay()];
      const hour = eventDate.getHours();
      const key = `${day}-${hour}`;
      
      if (heatmapMap.has(key)) {
        const cell = heatmapMap.get(key);
        cell.tickets += booking.number_of_tickets;
        cell.events += 1;
      }
    });

    // Convert to array and filter only cells with data
    const heatmapArray = Array.from(heatmapMap.values())
      .filter(cell => cell.tickets > 0);

    // 5. Recurring attendance (users with multiple bookings)
    const { data: userBookings, error: userError } = await supabase
      .from('bookings')
      .select(`
        user_id,
        event_id,
        events!inner(organizer_id)
      `)
      .in('status', ['confirmed', 'attended']);

    if (userError) throw userError;

    // Filter by organizer if needed
    let filteredUserBookings = userBookings;
    if (userRole === 'organizer') {
      filteredUserBookings = userBookings.filter(
        booking => booking.events.organizer_id === userId
      );
    }

    const userBookingCount = new Map();
    filteredUserBookings.forEach(booking => {
      const count = userBookingCount.get(booking.user_id) || 0;
      userBookingCount.set(booking.user_id, count + 1);
    });

    const recurringAttendees = {
      singleEvent: 0,
      multipleEvents: 0,
      frequentAttendees: 0 // 5+ events
    };

    userBookingCount.forEach(count => {
      if (count === 1) recurringAttendees.singleEvent++;
      else if (count < 5) recurringAttendees.multipleEvents++;
      else recurringAttendees.frequentAttendees++;
    });

    // 6. Overall statistics
    const totalBookings = filteredEventAttendance.length;
    const totalTicketsSold = filteredEventAttendance.reduce(
      (sum, b) => sum + b.number_of_tickets, 0
    );
    const uniqueAttendees = userBookingCount.size;
    const averageTicketsPerBooking = totalBookings > 0 
      ? (totalTicketsSold / totalBookings).toFixed(1) 
      : 0;

    // 7. Calculate additional metrics
    const totalEvents = eventMap.size;
    const averageTicketsPerEvent = totalEvents > 0 
      ? (totalTicketsSold / totalEvents).toFixed(1) 
      : 0;
    const engagementRate = totalBookings > 0 
      ? ((recurringAttendees.multipleEvents + recurringAttendees.frequentAttendees) / 
         (recurringAttendees.singleEvent + recurringAttendees.multipleEvents + recurringAttendees.frequentAttendees) * 100).toFixed(1)
      : 0;

    res.json({
      overview: {
        totalBookings,
        totalTicketsSold,
        uniqueAttendees,
        averageTicketsPerBooking,
        totalEvents,
        averageTicketsPerEvent,
        engagementRate
      },
      topEvents,
      attendanceTrends,
      categoryPopularity,
      timeSlotAnalysis,
      recurringAttendees,
      heatmapData: heatmapArray
    });

  } catch (error) {
    console.error('Get attendee insights error:', error);
    res.status(500).json({ error: 'Failed to fetch attendee insights' });
  }
};

export default {
  getAttendeeInsights
};
