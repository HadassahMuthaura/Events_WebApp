import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiDollarSign, FiX, FiDownload, FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import api from '../../lib/api'

export default function BookingsList() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings')
      setBookings(response.data.bookings)
    } catch (error) {
      toast.error('Failed to load bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.delete(`/bookings/${bookingId}`)
      toast.success('Booking cancelled successfully')
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking')
    }
  }

  const downloadQRCode = (qrCode, eventTitle) => {
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `${eventTitle.replace(/\s+/g, '-')}-ticket-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">You haven't made any bookings yet</p>
        <a href="/events" className="btn-primary">
          Browse Events
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <div key={booking.id} className="card p-6">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{booking.events.title}</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  {format(new Date(booking.events.date), 'PPP')}
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  {booking.events.location}
                </div>
                <div className="flex items-center">
                  <FiDollarSign className="mr-2" />
                  {booking.number_of_tickets} ticket(s)
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Ref: {booking.booking_reference}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <FiEye size={18} />
                  View Ticket
                </button>
              )}
              
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Cancel booking"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
