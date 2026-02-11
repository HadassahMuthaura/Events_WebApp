import Link from 'next/link'
import { FiCalendar, FiArrowRight } from 'react-icons/fi'

export default function Hero() {
  const scrollToEvents = (e) => {
    e.preventDefault()
    const eventsSection = document.getElementById('events-section')
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Discover Amazing Events Near You
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-primary-100">
            From concerts to conferences, workshops to festivals - find and book your next experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={scrollToEvents}
              className="bg-white text-primary-600 hover:bg-gray-100 px-6 sm:px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition text-sm sm:text-base"
            >
              Browse Events
              <FiArrowRight className="ml-2" />
            </button>
            <Link href="/auth/register" className="border-2 border-white hover:bg-white hover:text-primary-600 px-6 sm:px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition text-sm sm:text-base">
              <FiCalendar className="mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
