import Link from 'next/link'
import { FiCalendar, FiArrowRight } from 'react-icons/fi'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Amazing Events Near You
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            From concerts to conferences, workshops to festivals - find and book your next experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/events" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition">
              Browse Events
              <FiArrowRight className="ml-2" />
            </Link>
            <Link href="/auth/register" className="border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition">
              <FiCalendar className="mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
