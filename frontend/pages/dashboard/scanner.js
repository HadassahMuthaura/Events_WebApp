import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FiCamera, FiCheckCircle, FiXCircle, FiClock, FiUsers, FiSearch, FiBarChart2 } from 'react-icons/fi'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import dynamic from 'next/dynamic'

// Dynamically import QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false })

export default function TicketScanner() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [scanning, setScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastScan, setLastScan] = useState(null)

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user?.role !== 'organizer' && user?.role !== 'admin' && user?.role !== 'superadmin') {
        toast.error('Only organizers and admins can access the scanner')
        router.push('/dashboard')
      } else {
        fetchEvents()
      }
    }
  }, [isAuthenticated, isInitialized, user, router])

  useEffect(() => {
    if (selectedEvent) {
      fetchScanHistory(selectedEvent)
    }
  }, [selectedEvent])

  const fetchEvents = async () => {
    try {
      const response = await api.get('/scanner/events')
      const eventsList = response.data.events || []
      setEvents(eventsList)
      if (eventsList.length > 0) {
        setSelectedEvent(eventsList[0].id)
      } else {
        toast.info('No events available for scanning. Create an event first.')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      const errorMsg = error.response?.data?.error || 'Failed to load events'
      toast.error(errorMsg)
      console.error('Full error:', error.response || error)
    }
  }

  const fetchScanHistory = async (eventId) => {
    try {
      setLoading(true)
      const response = await api.get(`/scanner/history/${eventId}`)
      setScanHistory(response.data.bookings)
      setStatistics(response.data.statistics)
    } catch (error) {
      console.error('Error fetching scan history:', error)
      toast.error('Failed to load scan history')
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async (data) => {
    if (data && !loading) {
      try {
        // Parse QR code data
        const qrData = JSON.parse(data)
        
        // If QR has booking info, find the reference number
        if (qrData.event && qrData.user) {
          // We need to get the specific booking
          const bookings = scanHistory.filter(
            b => b.event_id === qrData.event && b.user_id === qrData.user
          )
          if (bookings.length > 0) {
            await processTicket(bookings[0].booking_reference)
          }
        }
      } catch (error) {
        // If not JSON, treat as reference number
        await processTicket(data)
      }
    }
  }

  const handleManualScan = async (e) => {
    e.preventDefault()
    if (referenceNumber.trim()) {
      await processTicket(referenceNumber.trim())
      setReferenceNumber('')
    }
  }

  const processTicket = async (reference) => {
    if (!selectedEvent) {
      toast.error('Please select an event first')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/scanner/scan', {
        reference_number: reference
      })

      setLastScan({
        success: true,
        booking: response.data.booking,
        message: response.data.message
      })

      toast.success('Ticket scanned successfully! ✓')
      
      // Refresh scan history
      if (selectedEvent) {
        await fetchScanHistory(selectedEvent)
      }

      // Clear last scan after 5 seconds
      setTimeout(() => setLastScan(null), 5000)
    } catch (error) {
      const errorData = error.response?.data
      setLastScan({
        success: false,
        error: errorData?.error || 'Failed to scan ticket',
        already_scanned: errorData?.already_scanned,
        cancelled: errorData?.cancelled,
        scanned_at: errorData?.scanned_at,
        booking: errorData?.booking
      })

      toast.error(errorData?.error || 'Failed to scan ticket')
      
      // Clear last scan after 8 seconds for errors
      setTimeout(() => setLastScan(null), 8000)
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error) => {
    console.error('QR Scanner error:', error)
  }

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Ticket Scanner - Events App</title>
      </Head>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className={`flex-1 transition-all duration-300 ml-0 md:ml-20 lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Ticket Scanner</h1>
              <p className="text-gray-600">Scan tickets to check in attendees</p>
            </div>

            {/* Event Selector */}
            <div className="card p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event to Scan
              </label>
              {events.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ℹ️ No events available for scanning. 
                    {user?.role === 'organizer' && ' Create an event to start scanning tickets.'}
                    {(user?.role === 'admin' || user?.role === 'superadmin') && ' No events found in the system.'}
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={selectedEvent || ''}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="input"
                  >
                    <option value="">Choose an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  {selectedEvent && (
                    <p className="text-sm text-gray-600 mt-2">
                      ℹ️ You can only scan tickets for this selected event
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Statistics */}
            {statistics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-800">{statistics.total_bookings}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUsers className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Checked In</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.checked_in}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Not Checked In</p>
                      <p className="text-2xl font-bold text-orange-600">{statistics.not_checked_in}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <FiClock className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                      <p className="text-2xl font-bold text-indigo-600">{statistics.attendance_rate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiBarChart2 className="text-indigo-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scanner Section */}
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Scan Ticket</h2>
                
                {/* Toggle between camera and manual */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => { setScanning(!scanning); setManualEntry(false); }}
                    disabled={!selectedEvent}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      scanning
                        ? 'bg-indigo-900 text-white'
                        : selectedEvent
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiCamera className="inline mr-2" />
                    Camera Scan
                  </button>
                  <button
                    onClick={() => { setManualEntry(!manualEntry); setScanning(false); }}
                    disabled={!selectedEvent}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
                      manualEntry
                        ? 'bg-indigo-900 text-white'
                        : selectedEvent
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiSearch className="inline mr-2" />
                    Manual Entry
                  </button>
                </div>

                {!selectedEvent && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please select an event above before scanning tickets
                    </p>
                  </div>
                )}

                {/* QR Scanner */}
                {scanning && (
                  <div className="mb-6">
                    <div className="border-4 border-indigo-600 rounded-lg overflow-hidden">
                      <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Position the QR code within the frame
                    </p>
                  </div>
                )}

                {/* Manual Entry */}
                {manualEntry && (
                  <form onSubmit={handleManualScan} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Reference Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="input flex-1"
                        placeholder="e.g., BK1234567890ABC"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !referenceNumber.trim()}
                        className="btn-primary"
                      >
                        {loading ? 'Scanning...' : 'Scan'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Last Scan Result */}
                {lastScan && (
                  <div className={`p-4 rounded-lg ${
                    lastScan.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
                  }`}>
                    <div className="flex items-start">
                      {lastScan.success ? (
                        <FiCheckCircle className="text-green-600 mt-1 mr-3" size={24} />
                      ) : (
                        <FiXCircle className="text-red-600 mt-1 mr-3" size={24} />
                      )}
                      <div className="flex-1">
                        <p className={`font-bold mb-1 ${lastScan.success ? 'text-green-800' : 'text-red-800'}`}>
                          {lastScan.success ? 'Valid Ticket!' : 'Invalid Ticket'}
                        </p>
                        {lastScan.booking && (
                          <div className="text-sm">
                            <p><strong>Event:</strong> {lastScan.booking.events?.title}</p>
                            <p><strong>Attendee:</strong> {lastScan.booking.users?.full_name}</p>
                            <p><strong>Tickets:</strong> {lastScan.booking.number_of_tickets}</p>
                            <p><strong>Reference:</strong> {lastScan.booking.booking_reference}</p>
                            {lastScan.already_scanned && (
                              <p className="text-red-600 mt-2 font-semibold">
                                ⚠️ Already scanned at {new Date(lastScan.scanned_at).toLocaleString()}
                              </p>
                            )}
                            {lastScan.cancelled && (
                              <p className="text-red-600 mt-2 font-semibold">
                                ⚠️ This booking has been cancelled
                              </p>
                            )}
                          </div>
                        )}
                        {!lastScan.success && !lastScan.booking && (
                          <p className="text-sm text-red-700">{lastScan.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Scans */}
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Check-ins</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.filter(b => b.checked_in).slice(0, 10).map((booking) => (
                    <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{booking.users?.full_name}</p>
                          <p className="text-sm text-gray-600">{booking.users?.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.number_of_tickets} ticket{booking.number_of_tickets > 1 ? 's' : ''} • 
                            {new Date(booking.checked_in_at).toLocaleString()}
                          </p>
                        </div>
                        <FiCheckCircle className="text-green-600" size={20} />
                      </div>
                    </div>
                  ))}
                  {scanHistory.filter(b => b.checked_in).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No check-ins yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
