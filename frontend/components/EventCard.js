import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { memo } from 'react'
import Image from 'next/image'
import { FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi'

const EventCard = memo(function EventCard({ event }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/events/${event.id}`)
  }

  return (
    <div 
      onClick={handleClick}
      className="card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
        {/* Image */}
        <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl">
              <FiCalendar />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
            {event.category}
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold transform scale-90 group-hover:scale-100 transition-transform duration-300">
              View Details & Book
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <FiCalendar className="mr-2" />
              {format(new Date(event.date), 'PPP')}
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-2" />
              {event.location}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-primary-600 font-semibold">
                <FiDollarSign className="mr-1" />
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </div>
              <div className="text-gray-500">
                {event.available_tickets} tickets left
              </div>
            </div>
          </div>
        </div>
      </div>
  )
})

export default EventCard
