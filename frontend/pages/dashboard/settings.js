import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../contexts/SidebarContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiX, FiBell } from 'react-icons/fi'

export default function Settings() {
  const router = useRouter()
  const { user, token, isInitialized, updateUser: updateAuthUser, logout } = useAuthStore()
  const { isCollapsed } = useSidebar()
  
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    smsAlerts: true
  })
  
  const [settings, setSettings] = useState({
    autoConfirmBookings: true,
    showActivityLog: true,
    loginAlerts: true
  })
  
  const toggleNotification = (key) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] }
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${newState[key] ? 'enabled' : 'disabled'}`)
      return newState
    })
  }
  
  const toggleSetting = (key) => {
    setSettings(prev => {
      const newState = { ...prev, [key]: !prev[key] }
      toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${newState[key] ? 'enabled' : 'disabled'}`)
      return newState
    })
  }

  useEffect(() => {
    // Wait for auth store to initialize before checking user
    if (!isInitialized) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Initialize form with user data
    setProfileData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || ''
    })
  }, [user, isInitialized, router])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateProfile = () => {
    const newErrors = {}
    
    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (profileData.phone && !/^\+?[\d\s-()]+$/.test(profileData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateProfile()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      // Update user in auth store
      updateAuthUser(response.data.user)
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setLoading(true)
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      toast.success('Password changed successfully! Please login again.')
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Logout after 2 seconds
      setTimeout(() => {
        logout()
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original user data
    setProfileData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || ''
    })
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
    toast.info('Changes cancelled')
  }

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Settings - Events App</title>
      </Head>
      <div className="flex min-h-screen relative overflow-hidden">
        {/* Vibrant Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-white via-purple-50 to-white -z-10">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-2xl opacity-30"></div>
        </div>

        <DashboardSidebar />
        
        <div className={`flex-1 p-4 sm:p-8 transition-all duration-300 ml-0 md:ml-20 lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">My Profile</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT SIDE - Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
                      {profileData.avatar_url ? (
                        <img 
                          src={profileData.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-gray-400" size={48} />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => toast.info('Avatar upload coming soon!')}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition"
                    >
                      <FiCamera size={18} />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">My profile</h2>
                  <p className="text-sm text-gray-600 capitalize font-medium mt-1">
                    {user?.role || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                      placeholder="Sam Rohman"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiPhone className="inline mr-2" />
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                      placeholder="+1-856-585-050-926"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiMail className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100"
                      placeholder="samrohman2005@gmail.com"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  {/* SMS Alerts Toggle */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-700">SMS alerts activation</span>
                        <div className={`ml-3 w-3 h-3 rounded-full ${notifications.smsAlerts ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={notifications.smsAlerts}
                          onChange={() => toggleNotification('smsAlerts')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              {/* RIGHT SIDE - Settings Cards */}
              <div className="space-y-6">
                
                {/* Notification Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiBell className="mr-2" />
                    Notification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">Email Notifications</span>
                      <button 
                        onClick={() => toggleNotification('emailNotifications')}
                        className={`px-4 py-1.5 text-white text-sm rounded-full font-medium hover:shadow-md transition ${
                          notifications.emailNotifications 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                      >
                        {notifications.emailNotifications ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                      <button 
                        onClick={() => toggleNotification('smsNotifications')}
                        className={`px-4 py-1.5 text-white text-sm rounded-full font-medium hover:shadow-md transition ${
                          notifications.smsNotifications 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                      >
                        {notifications.smsNotifications ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirmation Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">Auto-confirm bookings</span>
                      <button 
                        onClick={() => toggleSetting('autoConfirmBookings')}
                        className={`px-4 py-1.5 text-white text-sm rounded-full font-medium hover:shadow-md transition ${
                          settings.autoConfirmBookings 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                      >
                        {settings.autoConfirmBookings ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiLock className="mr-2" />
                    Password
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        placeholder="Current Password"
                      />
                      {errors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        placeholder="New Password"
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        placeholder="Confirm New Password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      <FiLock className="inline mr-2" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">Show activity log</span>
                      <button 
                        onClick={() => toggleSetting('showActivityLog')}
                        className={`px-4 py-1.5 text-white text-sm rounded-full font-medium hover:shadow-md transition ${
                          settings.showActivityLog 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                      >
                        {settings.showActivityLog ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm text-gray-700">Login alerts</span>
                      <button 
                        onClick={() => toggleSetting('loginAlerts')}
                        className={`px-4 py-1.5 text-white text-sm rounded-full font-medium hover:shadow-md transition ${
                          settings.loginAlerts 
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                      >
                        {settings.loginAlerts ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
