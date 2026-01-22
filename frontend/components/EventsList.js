import { useState, useEffect } from 'react'
import EventCard from './EventCard'
import api from '../lib/api'
import { toast } from 'react-toastify'

export default function EventsList({ searchQuery = '', category = null }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 12 })

  useEffect(() => {
    fetchEvents()
  }, [pagination.page, searchQuery, category])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/events', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          upcoming: true,
          search: searchQuery || undefined,
          category: category || undefined
        }
      })
      setEvents(response.data.events)
      setPagination(prev => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      toast.error('Failed to load events')
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg shadow-md">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {category ? `${category} Events` : 'Upcoming Events'}
            </h2>
            {searchQuery && (
              <p className="text-gray-600 mt-1">Search results for "{searchQuery}"</p>
            )}
          </div>
          {events.length > 0 && (
            <p className="text-gray-600">
              Showing {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
          )}
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-semibold mb-2">No events found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-primary-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                      className={`w-12 h-12 rounded-lg font-semibold transition ${
                        pagination.page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border-2 border-gray-300 hover:border-primary-600 hover:text-primary-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-primary-600 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
