import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function AttendeeInsightsPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuthStore()
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isInitialized, router])

  // Mock engagement data
  const engagementData = [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 15000 },
    { month: 'Mar', value: 18000 },
    { month: 'Apr', value: 22000 },
    { month: 'May', value: 28000 },
    { month: 'Jun', value: 35000 },
    { month: 'Jul', value: 42000 },
    { month: 'Aug', value: 38000 },
    { month: 'Sep', value: 45000 },
    { month: 'Oct', value: 50000 },
    { month: 'Nov', value: 48000 },
    { month: 'Dec', value: 52000 },
  ]

  // Interest data
  const interestData = [
    { category: 'Music & Entertainment', value: 75, color: '#6366f1' },
    { category: 'Tech & Business', value: 65, color: '#8b5cf6' },
    { category: 'Arts & Culture', value: 70, color: '#a78bfa' },
    { category: 'Sports & Fitness', value: 45, color: '#c4b5fd' },
  ]

  // Age distribution data
  const ageData = [
    { range: '18-24', value: 180 },
    { range: '25-34', value: 320 },
    { range: '35-44', value: 420 },
    { range: '45-54', value: 280 },
    { range: '55-64', value: 150 },
    { range: '65+', value: 80 },
  ]

  // Location data
  const locationData = [
    { name: 'Colombia', value: 33, color: '#6366f1' },
    { name: 'Kenya', value: 23, color: '#8b5cf6' },
    { name: 'Qatar', value: 19, color: '#a78bfa' },
    { name: 'Japina', value: 15, color: '#c4b5fd' },
    { name: 'Negombo', value: 10, color: '#e9d5ff' },
  ]

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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Attendee Insights</h1>

            {/* Engagement Chart */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Engagement</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interest Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Interest</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="space-y-4">
                  {interestData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.value}%`,
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Age and Location Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Age</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Location Distribution */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {locationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
