import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiDollarSign, FiUser, FiClock, FiTag, FiUsers, FiArrowLeft, FiShare2 } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function EventDetails({ eventId }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
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
      <div className="container mx-auto px-4 py-8">
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
          <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-2xl overflow-hidden mb-8 shadow-xl">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <FiCalendar size={80} className="opacity-50" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition"
              >
                <FiShare2 className="text-primary-600" size={20} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8">
              <div className="inline-block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <FiTag className="inline mr-1" />
                {event.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Info Cards */}
              <div className="grid md:grid-cols-2 gap-4">
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
                {event.available_tickets > 0 ? (
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Tickets
                        </label>
                        <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setTickets(Math.max(1, tickets - 1))}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={event.available_tickets}
                            value={tickets}
                            onChange={(e) => setTickets(Math.min(event.available_tickets, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="flex-1 text-center py-3 font-semibold outline-none"
                          />
                          <button
                            onClick={() => setTickets(Math.min(event.available_tickets, tickets + 1))}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {event.price > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total</span>
                            <span className="text-2xl font-bold text-gray-800">
                              ${(event.price * tickets).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleBooking}
                        disabled={booking}
                        className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {booking ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          'Book Now'
                        )}
                      </button>

                      {!isAuthenticated && (
                        <p className="text-xs text-center text-gray-500">
                          You'll be asked to login to complete your booking
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card p-6 border-2 border-red-200 bg-red-50">
                    <div className="text-center">
                      <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiClock className="text-red-600" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-red-900 mb-2">Sold Out</h3>
                      <p className="text-red-700">All tickets for this event have been sold.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
