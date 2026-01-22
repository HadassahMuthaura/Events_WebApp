import Link from 'next/link'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">EventsApp</h3>
            <p className="text-gray-400">
              Discover and book amazing events happening near you. From concerts to conferences, 
              we've got it all.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <FiMail className="mr-2" />
                info@eventsapp.com
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center">
                <FiMapPin className="mr-2" />
                123 Event Street, City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EventsApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
