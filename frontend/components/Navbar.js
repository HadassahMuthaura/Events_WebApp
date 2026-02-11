import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleEventsClick = (e) => {
    e.preventDefault()
    if (router.pathname === '/') {
      // Already on homepage, just scroll
      const eventsSection = document.getElementById('events-section')
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      // Navigate to homepage with hash
      router.push('/#events-section')
    }
    setIsOpen(false)
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            EventsApp
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#events-section" onClick={handleEventsClick} className="text-gray-700 hover:text-primary-600 transition cursor-pointer">
              Events
            </a>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                  Dashboard
                </Link>
                <Link href="/dashboard/event-details" className="text-gray-700 hover:text-primary-600 transition">
                  My Bookings
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    <FiUser className="inline mr-2" />
                    {user?.full_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition"
                  >
                    <FiLogOut className="inline mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 transition">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <a href="#events-section" onClick={handleEventsClick} className="text-gray-700 hover:text-primary-600 cursor-pointer">
                Events
              </a>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/event-details" className="text-gray-700 hover:text-primary-600">
                    My Bookings
                  </Link>
                  <span className="text-gray-700">{user?.full_name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link href="/auth/register" className="text-gray-700 hover:text-primary-600">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
