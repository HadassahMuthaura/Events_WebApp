import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiDollarSign, FiUser, FiClock, FiTag, FiUsers, FiArrowLeft, FiShare2, FiEdit, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function EventDetails({ eventId }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [tickets, setTickets] = useState(1)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`)
      setEvent(response.data.event)
    } catch (error) {
      toast.error('Failed to load event')
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to book tickets')
      router.push('/auth/login')
      return
    }

    try {
      setBooking(true)
      await api.post('/bookings', {
        event_id: eventId,
        number_of_tickets: tickets
      })
      toast.success('Booking successful!')
      router.push('/dashboard/event-details')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/edit-event/${eventId}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      await api.delete(`/events/${eventId}`)
      toast.success('Event deleted successfully!')
      router.push('/dashboard/event-details')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  const canManageEvent = () => {
    if (!user || !event) return false
    
    // Admins and superadmins can manage all events
    if (user.role === 'admin' || user.role === 'superadmin') return true
    
    // Organizers can only manage their own events
    if (user.role === 'organizer' && event.organizer_id === user.id) return true
    
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-300 rounded mb-6"></div>
              <div className="bg-gray-300 h-96 rounded-xl mb-8"></div>
              <div className="bg-white rounded-xl p-8">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button onClick={() => router.push('/events')} className="btn-primary">
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  const ticketPercentage = ((event.total_tickets - event.available_tickets) / event.total_tickets) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Back to Events
          </button>

          {/* Hero Image Section */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-xl">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <FiCalendar size={80} className="opacity-50" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
              {canManageEvent() && (
                <>
                  <button 
                    onClick={handleEdit}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition"
                    title="Edit Event"
                  >
                    <FiEdit className="text-blue-600" size={18} />
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition disabled:opacity-50"
                    title="Delete Event"
                  >
                    <FiTrash2 className="text-red-600" size={18} />
                  </button>
                </>
              )}
              <button 
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition"
                title="Share Event"
              >
                <FiShare2 className="text-primary-600" size={18} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 md:p-8">
              <div className="inline-block bg-primary-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                <FiTag className="inline mr-1" />
                {event.category}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Event Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-6 hover:shadow-xl transition">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-3 rounded-lg mr-4">
                      <FiCalendar className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                      <p className="font-bold text-gray-800">{format(new Date(event.date), 'PPP')}</p>
                      <p className="text-sm text-gray-600">{format(new Date(event.date), 'p')}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 hover:shadow-xl transition">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-3 rounded-lg mr-4">
                      <FiMapPin className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-bold text-gray-800">{event.location}</p>
                      {event.venue && <p className="text-sm text-gray-600">{event.venue}</p>}
                    </div>
                  </div>
                </div>

                <div className="card p-6 hover:shadow-xl transition">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-3 rounded-lg mr-4">
                      <FiUser className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Organized by</p>
                      <p className="font-bold text-gray-800">{event.users?.full_name || 'Event Organizer'}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 hover:shadow-xl transition">
                  <div className="flex items-start">
                    <div className="bg-primary-100 p-3 rounded-lg mr-4">
                      <FiUsers className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Capacity</p>
                      <p className="font-bold text-gray-800">{event.total_tickets} attendees</p>
                      <p className="text-sm text-gray-600">{event.available_tickets} spots left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Event</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
                </div>
              </div>

              {/* Ticket Availability Bar */}
              <div className="card p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Ticket Availability</span>
                  <span className="text-sm text-gray-600">
                    {event.total_tickets - event.available_tickets} / {event.total_tickets} sold
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${ticketPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="card p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline mb-2">
                      <FiDollarSign className="text-primary-600 mr-1" size={24} />
                      <span className="text-4xl font-bold text-primary-600">
                        {event.price === 0 ? 'Free' : event.price}
                      </span>
                      {event.price > 0 && <span className="text-gray-600 ml-1">/ ticket</span>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {event.available_tickets < 10 && event.available_tickets > 0 && (
                        <span className="text-orange-600 font-semibold">Only {event.available_tickets} tickets left!</span>
                      )}
                    </p>
                  </div>
                  
                  {event.available_tickets > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Tickets
                        </label>
                        <select
                          value={tickets}
                          onChange={(e) => setTickets(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        >
                          {[...Array(Math.min(10, event.available_tickets))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} {i + 1 === 1 ? 'Ticket' : 'Tickets'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">
                            {event.price === 0 ? 'Free' : `$${(event.price * tickets).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary-600">
                            {event.price === 0 ? 'Free' : `$${(event.price * tickets).toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleBooking}
                        disabled={booking}
                        className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {booking ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          'Book Now'
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        You won't be charged yet
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiClock className="text-red-600" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-red-900 mb-2">Sold Out</h3>
                      <p className="text-red-700">All tickets for this event have been sold.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
