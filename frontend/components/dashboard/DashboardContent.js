import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { FiTrendingUp, FiTrendingDown, FiSearch, FiCalendar, FiBell, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function DashboardContent() {
  const { user, token } = useAuthStore()
  const { isCollapsed } = useSidebar()
  const [stats, setStats] = useState({
    bookingsCount: 0,
    upcomingEventsCount: 0,
    loading: false
  })
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const eventsPerSlide = 4

  const totalSlides = Math.ceil(upcomingEvents.length / eventsPerSlide)
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const visibleEvents = upcomingEvents.slice(
    currentSlide * eventsPerSlide,
    (currentSlide + 1) * eventsPerSlide
  )

  useEffect(() => {
    if (token) {
      setStats(prev => ({ ...prev, loading: true }))
      fetchDashboardStats()
      fetchUpcomingEvents()
    }
  }, [token])

  const fetchDashboardStats = async () => {
    try {
      const bookingsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const eventsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/events?upcoming=true`
      )

      setStats({
        bookingsCount: bookingsResponse.data.bookings?.length || 0,
        upcomingEventsCount: eventsResponse.data.events?.length || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set loading to false even on error to prevent infinite loading
      setStats({
        bookingsCount: 0,
        upcomingEventsCount: 0,
        loading: false
      })
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/events?upcoming=true&limit=20`
      )
      setUpcomingEvents(response.data.events || [])
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  // Mock data for engagement chart
  const engagementData = [
    { date: 'Aug 01', value: 2000 },
    { date: 'Aug 05', value: 2800 },
    { date: 'Aug 09', value: 2200 },
    { date: 'Aug 13', value: 3400 },
    { date: 'Aug 17', value: 2600 },
    { date: 'Aug 21', value: 4200 },
  ]

  // Event category data for pie chart
  const categoryData = [
    { name: 'Entertainment', value: 35, color: '#6366f1' },
    { name: 'Arts & Culture', value: 30, color: '#a78bfa' },
    { name: 'Tech & Business', value: 35, color: '#c4b5fd' },
  ]

  return (
    <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen bg-gray-50 transition-all duration-300`}>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Event"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition">
            Search
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 ml-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6 max-w-[1800px] mx-auto">
        {stats.loading ? (
          /* Loading State */
          <div className="space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                </div>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Upcoming Events Skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Event Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 text-sm font-medium">Total Event</span>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FiCalendar className="text-indigo-600" size={24} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.upcomingEventsCount}</p>
                <div className="flex items-center text-sm">
                  <FiTrendingUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-500 font-medium">10% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Booking Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 text-sm font-medium">Event Booking</span>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <FiCalendar className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-800 mb-2">{stats.bookingsCount * 10}</p>
                <div className="flex items-center text-sm">
                  <FiTrendingDown className="text-red-500 mr-1" size={16} />
                  <span className="text-red-500 font-medium">-20% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 text-sm font-medium">Notifications</span>
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <FiBell className="text-pink-600" size={24} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-800 mb-2">5</p>
                <p className="text-sm text-gray-500">Unread messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Engagement Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Total Engagement</h2>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Event Category Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Event Categories</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Up Coming Events</h2>
            {!loadingEvents && upcomingEvents.length > eventsPerSlide && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Previous"
                >
                  <FiChevronLeft size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Next"
                >
                  <FiChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[200px]">
            {loadingEvents ? (
              // Placeholder cards while loading
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative rounded-2xl overflow-hidden shadow-md h-56 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
                >
                </div>
              ))
            ) : upcomingEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-56 cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/edit-event/${event.id}`}
                >
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{event.title}</h3>
                    <p className="text-white text-xs opacity-90">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              // No events message
              <div className="col-span-full text-center py-12 text-gray-500">
                <FiCalendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No upcoming events</p>
                <p className="text-sm text-gray-400 mt-2">Check back later for new events</p>
              </div>
            )}
          </div>
          {!loadingEvents && upcomingEvents.length > eventsPerSlide && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}
