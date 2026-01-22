import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiDownload, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useSidebar } from '../../contexts/SidebarContext'

export default function BookingDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isInitialized, router])

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchBooking()
    }
  }, [id, isAuthenticated])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/bookings/${id}`)
      setBooking(response.data.booking)
    } catch (error) {
      toast.error('Failed to load booking details')
      console.error('Error fetching booking:', error)
      router.push('/dashboard/event-details')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!booking?.qr_code) return
    const link = document.createElement('a')
    link.href = booking.qr_code
    link.download = `${booking.events.title.replace(/\s+/g, '-')}-ticket-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 transition-all duration-300`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ticket...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  const event = booking.events || {}

  return (
    <>
      <Head>
        <title>Ticket Details - {event.title}</title>
      </Head>

      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        
        <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 transition-all duration-300`}>
          <div className="bg-white min-h-screen rounded-3xl m-6 p-8 shadow-lg">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard/event-details')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Back to My Tickets</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
                {booking.status === 'confirmed' && (
                  <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <FiCheck size={18} />
                    CONFIRMED
                  </span>
                )}
              </div>
              <p className="text-gray-600">Booking Reference: <span className="font-semibold text-gray-800">{booking.booking_reference}</span></p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Left & Middle Columns - Event Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FiCalendar className="text-indigo-600" size={20} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Date & Time</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-11">{formatDate(event.date)}</p>
                    <p className="text-gray-700 ml-11">{formatTime(event.date)}</p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <FiMapPin className="text-purple-600" size={20} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-11">{event.location}</p>
                    {event.venue && <p className="text-gray-700 ml-11">{event.venue}</p>}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <FiUsers className="text-pink-600" size={20} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Tickets</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-11">{booking.number_of_tickets} Ticket(s)</p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FiDollarSign className="text-green-600" size={20} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                    </div>
                    <p className="text-gray-900 font-semibold text-xl ml-11">${booking.total_amount}</p>
                  </div>
                </div>

                {/* Event Image */}
                {event.image_url && (
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Important Notes */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-xl">
                  <h3 className="font-bold text-gray-800 mb-3">Important Information</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Please arrive at least 15 minutes before the event starts</li>
                    <li>• Have your QR code ready for scanning at the entrance</li>
                    <li>• This ticket is valid for {booking.number_of_tickets} person(s)</li>
                    <li>• Keep your booking reference number safe: <strong>{booking.booking_reference}</strong></li>
                  </ul>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="md:col-span-1">
                <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm sticky top-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Your Ticket QR Code</h2>
                    <p className="text-sm text-gray-600">Show this at the event entrance</p>
                  </div>

                  {booking.qr_code ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-xl mb-4 flex items-center justify-center">
                        <img 
                          src={booking.qr_code} 
                          alt="Ticket QR Code" 
                          className="w-full max-w-[280px]"
                        />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                      >
                        <FiDownload size={18} />
                        Download QR Code
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>QR code not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
