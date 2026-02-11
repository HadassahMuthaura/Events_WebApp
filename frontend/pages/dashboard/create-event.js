import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiImage, FiFileText, FiTag, FiClock, FiCheckCircle } from 'react-icons/fi'

export default function CreateEventPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, token } = useAuthStore()
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
    image_url: '',
  })

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user?.role !== 'organizer' && user?.role !== 'admin' && user?.role !== 'superadmin') {
        toast.error('Only organizers, admins, and super admins can create events')
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
  }, [isAuthenticated, isInitialized, user, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine date and time
      const dateTime = formData.time 
        ? `${formData.date}T${formData.time}:00` 
        : `${formData.date}T00:00:00`;

      const eventData = {
        ...formData,
        date: dateTime,
        price: parseFloat(formData.price),
        total_tickets: parseInt(formData.total_tickets),
        available_tickets: parseInt(formData.total_tickets),
      }

      // Remove the separate time field before sending
      delete eventData.time;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success('Event created successfully!')
      router.push('/dashboard/event-details')
    } catch (error) {
      console.error('Create event error:', error)
      toast.error(error.response?.data?.error || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  if (checking || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Create Event - Events App</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        
        <div className={`flex-1 transition-all duration-300 ml-0 md:ml-20 lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Simplified Top Navigation Bar with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 lg:px-8 py-3 sm:py-2.5 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-base sm:text-lg font-bold text-white">Create New Event</h1>
              <p className="text-purple-100 text-xs">Fill in the details below</p>
            </div>
          </div>

          {/* Form Content - Matching Wireframe Layout */}
          <div className="px-3 sm:px-4 lg:px-6 py-3">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
              <div className="p-3 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column - Single Container */}
                  <div className="rounded-lg p-4 sm:p-5 space-y-4 shadow-md bg-white">
                    {/* Event Name */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                        placeholder="e.g., Tech Innovation Summit 2026"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm appearance-none"
                      >
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="networking">Networking</option>
                        <option value="music">Music</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Date Time */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Date Time
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                        />
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="6"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm resize-none"
                        placeholder="Describe what makes your event special..."
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Top Container - Venue Details (2x2 Grid) */}
                    <div className="rounded-lg p-4 sm:p-5 shadow-md bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                          <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            City
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>

                        {/* Venue Name */}
                        <div>
                          <label htmlFor="venue" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Venue Name
                          </label>
                          <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                            placeholder="e.g., Convention Center Hall A"
                          />
                        </div>

                        {/* Ticket Sale Start Date */}
                        <div>
                          <label htmlFor="sale_start_date" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Ticket Sale Start Date
                          </label>
                          <input
                            type="date"
                            id="sale_start_date"
                            name="sale_start_date"
                            value={formData.sale_start_date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                          />
                        </div>

                        {/* Ticket Sale End Date */}
                        <div>
                          <label htmlFor="sale_end_date" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Ticket Sale End Date
                          </label>
                          <input
                            type="date"
                            id="sale_end_date"
                            name="sale_end_date"
                            value={formData.sale_end_date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Container - Pricing & Image (2x1 Grid) */}
                    <div className="rounded-lg p-4 sm:p-5 shadow-md bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left - Ticket Price & Total Capacity */}
                        <div className="space-y-4">
                          {/* Ticket Price */}
                          <div>
                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                              Ticket Price
                            </label>
                            <input
                              type="number"
                              id="price"
                              name="price"
                              value={formData.price}
                              onChange={handleChange}
                              required
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                              placeholder="0"
                            />
                          </div>

                          {/* Total Capacity */}
                          <div>
                            <label htmlFor="total_tickets" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                              Total Capacity
                            </label>
                            <input
                              type="number"
                              id="total_tickets"
                              name="total_tickets"
                              value={formData.total_tickets}
                              onChange={handleChange}
                              required
                              min="1"
                              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-sm"
                              placeholder="1"
                            />
                          </div>
                        </div>

                        {/* Right - Event Cover Image */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                            Event Cover Image
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50">
                            <div className="text-center w-full px-4">
                              <div className="text-4xl text-gray-300 mb-2">✕</div>
                              <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 focus:outline-none focus:bg-white focus:border-gray-300 transition text-xs"
                                placeholder="Image URL (optional)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Outside containers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none text-sm"
                      >
                        {loading ? 'Creating...' : 'Create Event'}
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
