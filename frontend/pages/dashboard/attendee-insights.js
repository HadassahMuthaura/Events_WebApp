import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { FiRefreshCw } from 'react-icons/fi'
import api from '../../lib/api'

export default function AttendeeInsightsPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [insights, setInsights] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isInitialized, router])

  // Fetch insights data
  const fetchInsights = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const response = await api.get('/insights/attendee-insights')
      setInsights(response.data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError(err.response?.data?.error || 'Failed to load insights')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchInsights()
    }
  }, [isAuthenticated])

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchInsights(true)
  }

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return ''
    const now = new Date()
    const diffSeconds = Math.floor((now - lastUpdated) / 1000)
    
    if (diffSeconds < 10) return 'Just now'
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    return lastUpdated.toLocaleTimeString()
  }

  // Color palette for charts
  const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff', '#f3e8ff']

  // Get heat intensity color based on ticket count
  const getHeatColor = (tickets, maxTickets) => {
    if (tickets === 0) return '#f3f4f6'
    const intensity = tickets / maxTickets
    if (intensity > 0.75) return '#4338ca' // Deep indigo
    if (intensity > 0.5) return '#6366f1'  // Indigo
    if (intensity > 0.25) return '#818cf8' // Light indigo
    return '#c7d2fe' // Very light indigo
  }

  // Custom tooltip for better data display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Attendee Insights - Events App</title>
        </Head>
        <div className="flex bg-gray-50 min-h-screen">
          <DashboardSidebar />
          <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-6 transition-all duration-300`}>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading insights...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Attendee Insights - Events App</title>
        </Head>
        <div className="flex bg-gray-50 min-h-screen">
          <DashboardSidebar />
          <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-6 transition-all duration-300`}>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Attendee Insights - Events App</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        
        <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-6 transition-all duration-300`}>
          {/* Main Content Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    📊 Attendee Insights Dashboard
                  </h1>
                  <p className="text-gray-600">Data-driven analysis of attendance patterns, trends, and engagement metrics</p>
                </div>
                
                {/* Real-time Refresh Controls */}
                <div className="flex items-center space-x-3">
                  {lastUpdated && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Last updated</div>
                      <div className="text-sm font-semibold text-gray-700">{formatLastUpdated()}</div>
                    </div>
                  )}
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh data"
                  >
                    <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={18} />
                    <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>
              
              {/* Background refresh indicator */}
              {refreshing && insights && (
                <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 flex items-center space-x-2 text-sm text-indigo-700">
                  <FiRefreshCw className="animate-spin" size={16} />
                  <span>Updating data...</span>
                </div>
              )}
            </div>

            {/* Overview Stats - Enhanced */}
            {insights?.overview && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8 transition-opacity duration-300" style={{ opacity: refreshing ? 0.6 : 1 }}>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-blue-100 mb-1">Total Bookings</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.totalBookings}</div>
                  <div className="text-xs text-blue-100 mt-1">📝 Confirmed</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-purple-100 mb-1">Tickets Sold</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.totalTicketsSold}</div>
                  <div className="text-xs text-purple-100 mt-1">🎫 Total</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-pink-100 mb-1">Unique Attendees</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.uniqueAttendees}</div>
                  <div className="text-xs text-pink-100 mt-1">👥 People</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-indigo-100 mb-1">Avg. Tickets/Booking</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.averageTicketsPerBooking}</div>
                  <div className="text-xs text-indigo-100 mt-1">📊 Average</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-cyan-100 mb-1">Total Events</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.totalEvents}</div>
                  <div className="text-xs text-cyan-100 mt-1">🎉 Events</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-teal-100 mb-1">Avg. Tickets/Event</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.averageTicketsPerEvent}</div>
                  <div className="text-xs text-teal-100 mt-1">📈 Per Event</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-xs font-medium text-green-100 mb-1">Engagement Rate</div>
                  <div className="text-2xl font-bold text-white">{insights.overview.engagementRate}%</div>
                  <div className="text-xs text-green-100 mt-1">🔥 Returning</div>
                </div>
              </div>
            )}

            {/* Attendance Heatmap - Day & Hour Pattern */}
            {insights?.heatmapData && insights.heatmapData.length > 0 && (
              <div className="mb-8 transition-opacity duration-300" style={{ opacity: refreshing ? 0.6 : 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">🔥 Attendance Heatmap</h2>
                    <p className="text-sm text-gray-600 mt-1">Peak booking times by day and hour</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>Low</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#c7d2fe' }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#818cf8' }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6366f1' }}></div>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4338ca' }}></div>
                    </div>
                    <span>High</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 overflow-x-auto">
                  {(() => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    const hours = Array.from({ length: 24 }, (_, i) => i)
                    const maxTickets = Math.max(...insights.heatmapData.map(d => d.tickets), 1)
                    
                    return (
                      <div className="min-w-max">
                        <div className="flex mb-2">
                          <div className="w-24"></div>
                          {hours.map(hour => (
                            <div key={hour} className="w-8 text-center text-xs font-medium text-gray-600">
                              {hour}
                            </div>
                          ))}
                        </div>
                        {days.map(day => (
                          <div key={day} className="flex mb-1">
                            <div className="w-24 flex items-center text-sm font-medium text-gray-700">{day}</div>
                            {hours.map(hour => {
                              const cell = insights.heatmapData.find(d => d.day === day && d.hour === hour)
                              const tickets = cell ? cell.tickets : 0
                              const events = cell ? cell.events : 0
                              return (
                                <div
                                  key={`${day}-${hour}`}
                                  className="w-8 h-8 mx-0.5 rounded transition-all hover:ring-2 hover:ring-indigo-400 cursor-pointer group relative"
                                  style={{ backgroundColor: getHeatColor(tickets, maxTickets) }}
                                  title={`${day} ${hour}:00 - ${tickets} tickets, ${events} events`}
                                >
                                  {tickets > 0 && (
                                    <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 shadow-lg">
                                      <div className="font-semibold">{day} {hour}:00</div>
                                      <div>{tickets} tickets • {events} events</div>
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Top Performing Events - Enhanced */}
            {insights?.topEvents && insights.topEvents.length > 0 && (
              <div className="mb-8 transition-opacity duration-300" style={{ opacity: refreshing ? 0.6 : 1 }}>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">🏆 Top Performing Events</h2>
                  <p className="text-sm text-gray-600 mt-1">Ranked by total tickets sold and capacity utilization</p>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="space-y-3">
                    {insights.topEvents.slice(0, 8).map((event, index) => (
                      <div key={event.eventId} className="group flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-all border border-gray-100 hover:border-indigo-200">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{event.category}</span>
                              <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl text-indigo-600">{event.bookedTickets}</div>
                          <div className="text-xs text-gray-500">tickets sold</div>
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                                  style={{ width: `${event.attendanceRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-indigo-600">{event.attendanceRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Trends - Enhanced */}
            {insights?.attendanceTrends && insights.attendanceTrends.length > 0 && (
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">📈 Attendance Trends</h2>
                  <p className="text-sm text-gray-600 mt-1">Monthly ticket sales and booking patterns over time</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={insights.attendanceTrends}>
                      <defs>
                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280" 
                        style={{ fontSize: '12px', fontWeight: '500' }} 
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        style={{ fontSize: '12px', fontWeight: '500' }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="tickets" 
                        name="Tickets Sold" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorTickets)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        name="Bookings" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorBookings)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category Popularity and Time Slot Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-opacity duration-300" style={{ opacity: refreshing ? 0.6 : 1 }}>
              {/* Category Popularity - Enhanced with Radar Chart */}
              {insights?.categoryPopularity && insights.categoryPopularity.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">📊 Popular Event Categories</h2>
                    <p className="text-sm text-gray-600 mt-1">Distribution of bookings across categories</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-xl p-6 shadow-md">
                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart data={insights.categoryPopularity.map(cat => ({
                        category: cat.category.split(' ')[0], // Shorter labels
                        value: parseFloat(cat.percentage)
                      }))}>
                        <PolarGrid stroke="#d1d5db" />
                        <PolarAngleAxis 
                          dataKey="category" 
                          tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]}
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                        />
                        <Radar 
                          name="Popularity" 
                          dataKey="value"  fill="#8b5cf6" 
                          fillOpacity={0.6} 
                          stroke="#8b5cf6"
                          strokeWidth={2}
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {insights.categoryPopularity.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-gray-700 font-medium">{item.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{item.percentage}%</span>
                            <span className="text-xs text-gray-500">({item.tickets})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Time Slot Analysis - Enhanced */}
              {insights?.timeSlotAnalysis && insights.timeSlotAnalysis.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">⏰ Best Time Slots</h2>
                    <p className="text-sm text-gray-600 mt-1">Peak attendance periods throughout the day</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-xl p-6 shadow-md">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={insights.timeSlotAnalysis}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="timeSlot" 
                          stroke="#6b7280" 
                          style={{ fontSize: '11px', fontWeight: '500' }} 
                          angle={-15}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          style={{ fontSize: '12px', fontWeight: '500' }} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="tickets" 
                          name="Tickets Sold"
                          fill="url(#barGradient)" 
                          radius={[10, 10, 0, 0]}
                          maxBarSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {insights.timeSlotAnalysis.map((slot, index) => {
                        const icon = slot.timeSlot.includes('Morning') ? '🌅' : 
                                    slot.timeSlot.includes('Afternoon') ? '☀️' : '🌙'
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{icon}</span>
                              <span className="text-sm font-medium text-gray-700">{slot.timeSlot}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-indigo-600">{slot.tickets} tickets</div>
                              <div className="text-xs text-gray-500">{slot.bookings} bookings</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recurring Attendees - Enhanced with Chart */}
            {insights?.recurringAttendees && (
              <div className="mb-8 transition-opacity duration-300" style={{ opacity: refreshing ? 0.6 : 1 }}>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">🔄 Attendee Loyalty & Engagement</h2>
                  <p className="text-sm text-gray-600 mt-1">Understanding repeat attendance and customer loyalty</p>
                </div>
                <div className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">🎫</div>
                        <div className="text-3xl font-bold text-white">
                          {insights.recurringAttendees.singleEvent}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-100">Single Event Visitors</div>
                      <div className="text-xs text-blue-200 mt-2">First-time or one-time attendees</div>
                      <div className="mt-4 pt-4 border-t border-blue-400">
                        <div className="text-xs text-blue-100">Conversion Opportunity</div>
                        <div className="text-lg font-bold text-white">
                          {((insights.recurringAttendees.singleEvent / insights.overview.uniqueAttendees) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">🎪</div>
                        <div className="text-3xl font-bold text-white">
                          {insights.recurringAttendees.multipleEvents}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-purple-100">Regular Attendees</div>
                      <div className="text-xs text-purple-200 mt-2">Attended 2-4 different events</div>
                      <div className="mt-4 pt-4 border-t border-purple-400">
                        <div className="text-xs text-purple-100">Engagement Level</div>
                        <div className="text-lg font-bold text-white">
                          {((insights.recurringAttendees.multipleEvents / insights.overview.uniqueAttendees) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">⭐</div>
                        <div className="text-3xl font-bold text-white">
                          {insights.recurringAttendees.frequentAttendees}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-pink-100">VIP Attendees</div>
                      <div className="text-xs text-pink-200 mt-2">Loyal fans with 5+ bookings</div>
                      <div className="mt-4 pt-4 border-t border-pink-400">
                        <div className="text-xs text-pink-100">Loyalty Rate</div>
                        <div className="text-lg font-bold text-white">
                          {((insights.recurringAttendees.frequentAttendees / insights.overview.uniqueAttendees) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pie Chart for Distribution */}
                  <div className="mt-6 bg-white rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Attendee Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Single Event', value: insights.recurringAttendees.singleEvent, color: '#3b82f6' },
                            { name: 'Regular', value: insights.recurringAttendees.multipleEvents, color: '#8b5cf6' },
                            { name: 'VIP', value: insights.recurringAttendees.frequentAttendees, color: '#ec4899' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Single Event', value: insights.recurringAttendees.singleEvent, color: '#3b82f6' },
                            { name: 'Regular', value: insights.recurringAttendees.multipleEvents, color: '#8b5cf6' },
                            { name: 'VIP', value: insights.recurringAttendees.frequentAttendees, color: '#ec4899' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights Summary - Enhanced */}
            {insights && (
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Strategic Insights & Recommendations
                      </h3>
                      <p className="text-sm text-gray-600">Data-driven findings to optimize your events</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.topEvents && insights.topEvents[0] && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Top Performer</div>
                            <div className="text-sm text-gray-700">
                              "{insights.topEvents[0].title}" leads with <strong>{insights.topEvents[0].bookedTickets} tickets</strong> sold at <strong>{insights.topEvents[0].attendanceRate}%</strong> capacity
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insights.categoryPopularity && insights.categoryPopularity[0] && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">📊</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Category Leader</div>
                            <div className="text-sm text-gray-700">
                              <strong>{insights.categoryPopularity[0].category}</strong> dominates with <strong>{insights.categoryPopularity[0].percentage}%</strong> of total bookings
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insights.timeSlotAnalysis && insights.timeSlotAnalysis[0] && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">⏰</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Peak Time Slot</div>
                            <div className="text-sm text-gray-700">
                              <strong>{insights.timeSlotAnalysis[0].timeSlot}</strong> generates highest attendance with <strong>{insights.timeSlotAnalysis[0].tickets} tickets</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insights.overview && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Engagement Score</div>
                            <div className="text-sm text-gray-700">
                              <strong>{insights.overview.engagementRate}%</strong> of attendees return for multiple events, showing strong loyalty
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insights.overview && (
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">👥</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">Group Booking Trend</div>
                            <div className="text-sm text-gray-700">
                              Average of <strong>{insights.overview.averageTicketsPerBooking} tickets</strong> per booking suggests group attendance patterns
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {insights.recurringAttendees && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-l-4 border-indigo-500">
                        <div className="flex items-start space-x-2">
                          <span className="text-2xl">⭐</span>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">VIP Community</div>
                            <div className="text-sm text-gray-700">
                              <strong>{insights.recurringAttendees.frequentAttendees} super fans</strong> with 5+ bookings form your core audience
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
