import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import EventsList from '../components/EventsList'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import { FiTrendingUp, FiCalendar, FiUsers, FiStar } from 'react-icons/fi'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    // Handle scroll to events section when coming from another page with hash
    if (window.location.hash === '#events-section') {
      setTimeout(() => {
        const eventsSection = document.getElementById('events-section')
        if (eventsSection) {
          eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [])

  const stats = [
    { icon: FiCalendar, label: 'Events Hosted', value: '1,000+', color: 'from-blue-500 to-blue-600' },
    { icon: FiUsers, label: 'Happy Attendees', value: '50,000+', color: 'from-purple-500 to-purple-600' },
    { icon: FiStar, label: 'Average Rating', value: '4.8/5', color: 'from-yellow-500 to-yellow-600' },
    { icon: FiTrendingUp, label: 'Active Organizers', value: '500+', color: 'from-green-500 to-green-600' }
  ]

  return (
    <>
      <Head>
        <title>Events App - Discover Amazing Events Near You</title>
        <meta name="description" content="Find and book amazing events near you - from concerts to conferences, workshops to festivals." />
      </Head>
      <Layout>
        <Hero />
        
        {/* Stats Section */}
        <section className="bg-white py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="text-white" size={28} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-3">Find Your Perfect Event</h2>
              <p className="text-gray-600 text-center mb-8">Search by keyword or browse by category</p>
              
              <div className="mb-8">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              
              <div className="flex justify-center">
                <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
              </div>
            </div>
          </div>
        </section>

        {/* Events List */}
        <div id="events-section">
          <EventsList searchQuery={searchQuery} category={selectedCategory} />
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Own Event?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of organizers who trust EventsApp to manage their events and connect with attendees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/register" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition inline-block">
                Get Started Free
              </a>
              <button 
                onClick={() => {
                  const eventsSection = document.getElementById('events-section')
                  if (eventsSection) {
                    eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-bold transition inline-block"
              >
                Explore Events
              </button>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}
