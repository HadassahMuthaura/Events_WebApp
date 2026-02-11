import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi'

export default function EventCard({ event }) {
  return (
    <div className="card hover:shadow-xl transition-shadow">
        {/* Image */}
        <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl">
              <FiCalendar />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
            {event.category}
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
}
