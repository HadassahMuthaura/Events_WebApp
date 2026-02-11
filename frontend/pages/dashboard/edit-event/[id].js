import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../../store/authStore'
import { useSidebar } from '../../../contexts/SidebarContext'
import { toast } from 'react-toastify'
import api from '../../../lib/api'
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiImage, FiFileText, FiTag, FiClock, FiSave } from 'react-icons/fi'

export default function EditEventPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [activeStep, setActiveStep] = useState(1)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'conference',
    date: '',
    time: '',
    location: '',
    venue: '',
    sale_start_date: '',
    sale_end_date: '',
    price: 0,
    total_tickets: 1,
    available_tickets: 1,
    image_url: '',
    status: 'active'
  })

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user?.role !== 'organizer' && user?.role !== 'admin' && user?.role !== 'superadmin') {
        toast.error('Only organizers, admins, and super admins can edit events')
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
  }, [isAuthenticated, isInitialized, user, router])

  useEffect(() => {
    if (id && !checking) {
      fetchEvent()
    }
  }, [id, checking])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`)
      const event = response.data.event
      
      // Check if user is authorized to edit this event
      if (user?.role === 'organizer' && event.organizer_id !== user.id) {
        toast.error('You can only edit your own events')
        router.push('/dashboard/event-details')
        return
      }

      const eventDate = new Date(event.date)
      const dateStr = eventDate.toISOString().split('T')[0]
      const timeStr = eventDate.toTimeString().slice(0, 5)

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'conference',
        date: dateStr,
        time: timeStr,
        location: event.location || '',
        venue: event.venue || '',
        sale_start_date: event.sale_start_date ? new Date(event.sale_start_date).toISOString().split('T')[0] : '',
        sale_end_date: event.sale_end_date ? new Date(event.sale_end_date).toISOString().split('T')[0] : '',
        price: event.price || 0,
        total_tickets: event.total_tickets || 1,
        available_tickets: event.available_tickets || 1,
        image_url: event.image_url || '',
        status: event.status || 'active'
      })
    } catch (error) {
      toast.error('Failed to load event')
      console.error('Error fetching event:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only allow submission on final step
    if (activeStep !== 3) {
      return
    }
    
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    // Ask for confirmation before updating
    const confirmed = confirm('Are you sure you want to update this event? All changes will be saved.')
    if (!confirmed) {
      return
    }

    try {
      setLoading(true)
      
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      
      const eventData = {
        ...formData,
        date: dateTime.toISOString(),
        price: parseFloat(formData.price),
        total_tickets: parseInt(formData.total_tickets),
        available_tickets: parseInt(formData.available_tickets)
      }
      
      delete eventData.time

      await api.put(`/events/${id}`, eventData)
      
      toast.success('Event updated successfully!')
      router.push('/dashboard/event-details')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update event')
      console.error('Update error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: FiFileText },
    { number: 2, title: 'Details', icon: FiCalendar },
    { number: 3, title: 'Tickets', icon: FiUsers },
  ]

  return (
    <>
      <Head>
        <title>Edit Event - Events App</title>
      </Head>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Event</h1>
                <p className="text-gray-600">Update your event information</p>
              </div>

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex-1">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition ${
                          activeStep >= step.number
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          <step.icon size={20} />
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 transition ${
                            activeStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                      <p className={`mt-2 text-sm font-medium ${
                        activeStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Info */}
                {activeStep === 1 && (
                  <div className="card p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Tech Conference 2026"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        className="input"
                        placeholder="Tell people what your event is about..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="music">Music</option>
                        <option value="sports">Sports</option>
                        <option value="theater">Theater</option>
                        <option value="festival">Festival</option>
                        <option value="comedy">Comedy</option>
                        <option value="food & drink">Food & Drink</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Image URL
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        className="input"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {activeStep === 2 && (
                  <div className="card p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Nairobi, Kenya"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Kenyatta International Convention Centre"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sale Start Date
                        </label>
                        <input
                          type="date"
                          name="sale_start_date"
                          value={formData.sale_start_date}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sale End Date
                        </label>
                        <input
                          type="date"
                          name="sale_end_date"
                          value={formData.sale_end_date}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Tickets */}
                {activeStep === 3 && (
                  <div className="card p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Price (USD) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="input"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Set to 0 for free events</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Tickets <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="total_tickets"
                        value={formData.total_tickets}
                        onChange={handleChange}
                        min="1"
                        className="input"
                        placeholder="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Tickets <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="available_tickets"
                        value={formData.available_tickets}
                        onChange={handleChange}
                        min="0"
                        max={formData.total_tickets}
                        className="input"
                        placeholder="100"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">Remaining tickets available for booking</p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  {activeStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(activeStep - 1)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-primary-600 hover:text-primary-600 transition"
                    >
                      Previous
                    </button>
                  )}
                  {activeStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="btn-primary ml-auto"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary ml-auto flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Update Event
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
