import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FiGrid, FiCalendar, FiFileText, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiPlus } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'

export default function DashboardSidebar() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Show Create Event only for organizers, admins, and superadmins
  const canCreateEvent = user?.role === 'organizer' || user?.role === 'admin' || user?.role === 'superadmin'

  const menuItems = [
    { icon: FiGrid, label: 'Overview', href: '/dashboard' },
    ...(canCreateEvent ? [{ icon: FiPlus, label: 'Create Event', href: '/dashboard/create-event' }] : []),
    { icon: FiCalendar, label: 'Browse Event', href: '/events' },
    { icon: FiFileText, label: 'Event Details', href: '/dashboard/event-details' },
    { icon: FiUsers, label: 'Attendee Insights', href: '/dashboard/attendee-insights' },
  ]
  
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl transition-all duration-300 z-50`}>
      {/* Logo Section with Toggle */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
            </div>
            <span className="text-xl font-bold">EventsApp</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-indigo-800 transition-colors flex items-center justify-center"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 mt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = router.pathname === item.href || 
                          (item.href === '/dashboard' && router.pathname === '/dashboard') ||
                          (item.href === '/events' && router.pathname.startsWith('/events')) ||
                          (item.href === '/dashboard/event-details' && router.pathname === '/dashboard/event-details') ||
                          (item.href === '/dashboard/attendee-insights' && router.pathname === '/dashboard/attendee-insights')
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg mb-2 transition-all duration-200 relative group ${
                isActive
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-gray-300 hover:bg-indigo-800 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Settings at Bottom */}
      <div className="px-4 pb-6">
        <Link
          href="/dashboard/settings"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-gray-300 hover:bg-indigo-800 hover:text-white transition-all duration-200 mb-2 relative group`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <FiSettings size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Settings
            </span>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 w-full relative group`}
          title={isCollapsed ? 'Log Out' : ''}
        >
          <FiLogOut size={20} />
          {!isCollapsed && <span className="font-medium">Log Out</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Log Out
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
