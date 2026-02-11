import Head from 'next/head'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { FiSearch, FiCalendar, FiMapPin, FiUsers, FiFilter } from 'react-icons/fi'
import axios from 'axios'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useSidebar } from '../../contexts/SidebarContext'
import EventCard from '../../components/EventCard'
import EventCardSkeleton from '../../components/EventCardSkeleton'

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

export default function EventsPage() {
  const router = useRouter()
  const { isCollapsed } = useSidebar()
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // Debounce search by 300ms
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    dateFilter: 'all',
    location: '',
    sortBy: 'date'
  })
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const categories = useMemo(() => ['conference', 'workshop', 'networking', 'music', 'other'], [])
  const locations = useMemo(() => [...new Set(events.map(e => e.location).filter(Boolean))], [events])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, debouncedSearchQuery, selectedFilters])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events`)
      setEvents(response.data.events || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedFilters.category !== 'all') {
      filtered = filtered.filter(event => event.category === selectedFilters.category)
    }

    // Date filter
    const now = new Date()
    if (selectedFilters.dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === now.toDateString()
      })
    } else if (selectedFilters.dateFilter === 'week') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= weekFromNow
      })
    } else if (selectedFilters.dateFilter === 'month') {
      const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= monthFromNow
      })
    } else if (selectedFilters.dateFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= now)
    }

    // Location filter
    if (selectedFilters.location) {
      filtered = filtered.filter(event => event.location === selectedFilters.location)
    }

    // Sort
    if (selectedFilters.sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (selectedFilters.sortBy === 'popular') {
      filtered.sort((a, b) => (b.total_tickets || 0) - (a.total_tickets || 0))
    } else if (selectedFilters.sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    setFilteredEvents(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedFilters({
      category: 'all',
      dateFilter: 'all',
      location: '',
      sortBy: 'date'
    })
  }

  const handleSearch = () => {
    filterEvents()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'TBA'
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'TBA'
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <>
      <Head>
        <title>Browse Events - Events App</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        
        <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 transition-all duration-300`}>
          {/* Main Content */}
          <div className="bg-white min-h-screen rounded-3xl m-6 p-6 shadow-lg">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Browse Event</h1>
              <p className="text-sm text-gray-600">Available Events</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search events by name, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-6 py-2.5 bg-indigo-900 text-white text-sm rounded-lg font-medium hover:bg-indigo-800 transition"
                >
                  Search
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <button
                  onClick={() => setSelectedFilters({ ...selectedFilters, category: 'all' })}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium transition ${
                    selectedFilters.category === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Events
                </button>
                
                {/* Category Filter */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown)
                      setShowDateDropdown(false)
                      setShowLocationDropdown(false)
                      setShowSortDropdown(false)
                    }}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-full font-medium transition ${
                      selectedFilters.category !== 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    <FiFilter size={14} />
                    <span>{selectedFilters.category !== 'all' ? selectedFilters.category.charAt(0).toUpperCase() + selectedFilters.category.slice(1) : 'Category'}</span>
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedFilters({ ...selectedFilters, category: cat })
                            setShowCategoryDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowDateDropdown(!showDateDropdown)
                      setShowCategoryDropdown(false)
                      setShowLocationDropdown(false)
                      setShowSortDropdown(false)
                    }}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-full font-medium transition ${
                      selectedFilters.dateFilter !== 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    <FiCalendar size={14} />
                    <span>{selectedFilters.dateFilter !== 'all' ? selectedFilters.dateFilter.charAt(0).toUpperCase() + selectedFilters.dateFilter.slice(1) : 'Date'}</span>
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                      {['all', 'today', 'week', 'month', 'upcoming'].map(period => (
                        <button
                          key={period}
                          onClick={() => {
                            setSelectedFilters({ ...selectedFilters, dateFilter: period })
                            setShowDateDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                        >
                          {period === 'all' ? 'All Dates' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown)
                      setShowCategoryDropdown(false)
                      setShowDateDropdown(false)
                      setShowSortDropdown(false)
                    }}
                    className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-full font-medium transition ${
                      selectedFilters.location 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    <FiMapPin size={14} />
                    <span>{selectedFilters.location || 'Location'}</span>
                  </button>
                  {showLocationDropdown && locations.length > 0 && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px] max-h-[200px] overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedFilters({ ...selectedFilters, location: '' })
                          setShowLocationDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                      >
                        All Locations
                      </button>
                      {locations.map(loc => (
                        <button
                          key={loc}
                          onClick={() => {
                            setSelectedFilters({ ...selectedFilters, location: loc })
                            setShowLocationDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown)
                      setShowCategoryDropdown(false)
                      setShowDateDropdown(false)
                      setShowLocationDropdown(false)
                    }}
                    className="flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium transition"
                  >
                    <FiUsers size={14} />
                    <span>Sort: {selectedFilters.sortBy === 'date' ? 'Date' : selectedFilters.sortBy === 'popular' ? 'Popular' : 'Name'}</span>
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                      {[
                        { value: 'date', label: 'By Date' },
                        { value: 'popular', label: 'Most Popular' },
                        { value: 'title', label: 'By Name' }
                      ].map(sort => (
                        <button
                          key={sort.value}
                          onClick={() => {
                            setSelectedFilters({ ...selectedFilters, sortBy: sort.value })
                            setShowSortDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                        >
                          {sort.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedFilters.category !== 'all' || selectedFilters.dateFilter !== 'all' || selectedFilters.location) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-1.5 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Events Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Events</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <FiCalendar size={64} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
