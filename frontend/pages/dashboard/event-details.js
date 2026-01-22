import Head from 'next/head'
import { useState, useEffect } from 'react'
import { FiSearch, FiCalendar, FiMapPin, FiClock, FiUsers, FiCreditCard, FiFilter, FiEdit2, FiTrash2, FiTrendingUp } from 'react-icons/fi'
import axios from 'axios'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { toast } from 'react-toastify'

export default function EventDetailsPage() {
  const router = useRouter()
  const { user, token, isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isInitialized, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'client') {
        fetchUserBookings()
      } else {
        fetchEvents()
      }
    }
  }, [isAuthenticated, user])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setEvents(response.data.events || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      setLoading(false)
    }
  }

  const fetchUserBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setBookings(response.data.bookings || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.response?.data?.error || 'Failed to delete event')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const start = date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
    const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000) // Add 3 hours
    const end = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
    return `${start} - ${end}`
  }

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Event Details - Events App</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        
        <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-6 transition-all duration-300`}>
          {/* Main Content Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl min-h-screen">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.role === 'client' ? 'My Tickets' : 'Event Details'}
              </h1>
              <p className="text-gray-600 mb-6">
                {user?.role === 'client' 
                  ? 'View all your booked event tickets' 
                  : user?.role === 'organizer'
                  ? 'Manage your events and track ticket sales'
                  : 'Manage all events on the platform'}
              </p>
              
              {/* Search Bar */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={user?.role === 'client' ? 'Search Your Tickets' : 'Search Event'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button className="px-8 py-3 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition">
                  Search
                </button>
              </div>

              {/* Filter Pills - Only for non-clients */}
              {user?.role !== 'client' && (
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition">
                    <FiFilter size={16} />
                    <span className="font-medium">Filters</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">
                    <FiCalendar size={16} />
                    <span className="font-medium">Date</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">
                    <FiUsers size={16} />
                    <span className="font-medium">Popularity</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content based on role */}
            {user?.role === 'client' ? (
              // CLIENT VIEW - Show Bookings/Tickets
              <div className="space-y-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
                  ))
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => {
                    // Supabase returns nested event as 'events', not 'event'
                    const event = booking.events || {}
                    
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center space-x-6 p-5 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white"
                      >
                        {/* Event Image */}
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                          <img
                            src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'}
                            alt={event.title || 'Event'}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Booking Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {event.title || 'Event'}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiMapPin className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                              <span className="truncate">{event.location || 'TBA'}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                              <span className="truncate">{event.date ? formatDate(event.date) : 'TBA'}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCreditCard className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                              <span className="truncate">Ref: {booking.booking_reference}</span>
                            </div>
                            <div className="flex items-center">
                              <FiUsers className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                              <span className="truncate">{booking.number_of_tickets} ticket(s)</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Status */}
                        <div className="flex flex-col items-end space-y-3 flex-shrink-0">
                          <div className={`px-4 py-2 rounded-lg ${
                            booking.status === 'confirmed' ? 'bg-green-100' :
                            booking.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            <p className={`text-sm font-bold capitalize ${
                              booking.status === 'confirmed' ? 'text-green-700' :
                              booking.status === 'cancelled' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {booking.status}
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/bookings/${booking.id}`)}
                            className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition text-sm"
                          >
                            View Ticket
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <FiCreditCard size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-500 mb-4">You haven't booked any events yet</p>
                    <button
                      onClick={() => router.push('/events')}
                      className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition"
                    >
                      Browse Events
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ADMIN/ORGANIZER VIEW - Show Events List
              <div className="space-y-6">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
                  ))
                ) : events.length > 0 ? (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-6 p-5 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 bg-white"
                    >
                      {/* Event Image */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                          {event.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FiMapPin className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                            <span className="truncate">{event.location || 'TBA'}</span>
                          </div>
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                            <span className="truncate">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                            <span className="truncate">{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-2 text-indigo-600 flex-shrink-0" size={14} />
                            <span className="truncate">{event.total_tickets || 0} total tickets</span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Info & Sales Stats */}
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        {user?.role === 'organizer' && (
                          <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-700 mb-1">
                              <FiTrendingUp className="mr-1" size={18} />
                              <span className="font-semibold text-lg">
                                {Math.floor(Math.random() * 80) + 20}%
                              </span>
                            </div>
                            <p className="text-xs text-green-600">Sold</p>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="flex items-center text-gray-700 mb-1">
                            <FiCreditCard className="mr-1 text-indigo-600" size={18} />
                            <span className="font-semibold text-lg">{event.total_tickets || 0}</span>
                          </div>
                          <p className="text-xs text-gray-500">Tickets</p>
                        </div>
                        <div className="px-4 py-2 bg-purple-100 rounded-lg">
                          <p className="text-sm font-bold text-purple-700">
                            Rs. {event.price || 3500}/P
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/events/${event.id}`)}
                          className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition text-sm"
                        >
                          View Details
                        </button>
                        {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'organizer') && (
                          <>
                            <button
                              onClick={() => router.push(`/dashboard/edit-event/${event.id}`)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                              title="Edit Event"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              title="Delete Event"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <FiCalendar size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
                    <p className="text-gray-500 mb-4">
                      {user?.role === 'organizer' 
                        ? "You haven't created any events yet"
                        : "No events available on the platform"}
                    </p>
                    {user?.role === 'organizer' && (
                      <button
                        onClick={() => router.push('/dashboard/create-event')}
                        className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition"
                      >
                        Create Event
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
