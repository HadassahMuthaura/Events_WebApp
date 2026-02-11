import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { FiCalendar, FiMapPin, FiClock, FiCreditCard, FiX, FiDownload } from 'react-icons/fi'
import QRCode from 'qrcode'

export default function MyTicketsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else {
        fetchBookings()
      }
    }
  }, [isAuthenticated, isInitialized, router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/my-bookings')
      setBookings(response.data.bookings || [])
    } catch (error) {
      toast.error('Failed to load tickets')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (booking) => {
    try {
      const qrData = JSON.stringify({
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        eventTitle: booking.events?.title,
        userName: user?.full_name,
        numberOfTickets: booking.number_of_tickets,
        eventDate: booking.events?.date
      })
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(qrCodeDataUrl)
      setSelectedBooking(booking)
    } catch (error) {
      toast.error('Failed to generate QR code')
      console.error('QR code error:', error)
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.download = `ticket-${selectedBooking?.booking_reference}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const closeModal = () => {
    setSelectedBooking(null)
    setQrCodeUrl('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'attended':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>My Tickets - Events App</title>
      </Head>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        
        <main className={`flex-1 transition-all duration-300 ml-0 md:ml-20 lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Event Tickets</h1>
              <p className="text-gray-600">View all your booked event tickets and QR codes</p>
            </div>

            {/* Tickets Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-md">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCreditCard className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tickets Yet</h3>
                <p className="text-gray-500 mb-6">You haven't booked any events yet</p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-primary-600"
                    onClick={() => generateQRCode(booking)}
                  >
                    {/* Event Image */}
                    <div className="h-40 bg-gradient-to-r from-primary-400 to-primary-600 relative">
                      {booking.events?.image_url ? (
                        <img
                          src={booking.events.image_url}
                          alt={booking.events?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <FiCalendar size={60} className="opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                        {booking.events?.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-start">
                          <FiCalendar className="mr-2 mt-0.5 flex-shrink-0 text-primary-600" />
                          <span>{formatDate(booking.events?.date)}</span>
                        </div>
                        <div className="flex items-start">
                          <FiClock className="mr-2 mt-0.5 flex-shrink-0 text-primary-600" />
                          <span>{formatTime(booking.events?.date)}</span>
                        </div>
                        <div className="flex items-start">
                          <FiMapPin className="mr-2 mt-0.5 flex-shrink-0 text-primary-600" />
                          <span>{booking.events?.location}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Tickets</p>
                          <p className="text-lg font-bold text-gray-800">{booking.number_of_tickets}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Reference</p>
                          <p className="text-sm font-mono font-semibold text-primary-600">
                            {booking.booking_reference}
                          </p>
                        </div>
                      </div>

                      <button className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition">
                        <FiCreditCard className="mr-2" />
                        View QR Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiX size={24} />
            </button>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="text-primary-600" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedBooking.events?.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                Booking Reference: <span className="font-mono font-semibold text-primary-600">
                  {selectedBooking.booking_reference}
                </span>
              </p>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-xl border-4 border-primary-600 mb-6 inline-block">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                )}
              </div>

              {/* Ticket Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Tickets</p>
                    <p className="font-semibold">{selectedBooking.number_of_tickets}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-semibold">${selectedBooking.total_amount}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Date</p>
                    <p className="font-semibold">{formatDate(selectedBooking.events?.date)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Location</p>
                    <p className="font-semibold">{selectedBooking.events?.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition"
                >
                  <FiDownload className="mr-2" />
                  Download QR
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Present this QR code at the event entrance
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
