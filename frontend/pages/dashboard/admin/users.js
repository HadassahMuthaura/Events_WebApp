import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar'
import { useSidebar } from '../../../contexts/SidebarContext'
import { useAuthStore } from '../../../store/authStore'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FiUsers, FiUserCheck, FiShield, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function UsersManagementPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)

  const { isCollapsed } = useSidebar ? useSidebar() : { isCollapsed: false };
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (user?.role !== 'superadmin' && user?.role !== 'admin') {
        toast.error('Access denied: Admins only')
        router.push('/dashboard')
      } else {
        fetchUsers()
      }
    }
  }, [isAuthenticated, isInitialized, user, router])

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setUsers(response.data.users)
    } catch (error) {
      console.error('Fetch users error:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return
    
    setUpdating(true)
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      toast.success('User role updated successfully')
      setShowRoleModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Update role error:', error)
      toast.error(error.response?.data?.error || 'Failed to update role')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      organizer: 'bg-blue-100 text-blue-800',
      support: 'bg-green-100 text-green-800',
      client: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || colors.client
  }

  const roleStats = {
    total: users.length,
    clients: users.filter(u => u.role === 'client').length,
    organizers: users.filter(u => u.role === 'organizer').length,
    admins: users.filter(u => u.role === 'admin').length,
    support: users.filter(u => u.role === 'support').length,
  }

  if (loading || !isInitialized) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>User Management - Admin</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
          <div className="px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-gray-600">Manage all registered users and their roles</p>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="rounded-xl bg-blue-50 p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">{roleStats.total}</p>
                </div>
                <FiUsers className="text-blue-600" size={28} />
              </div>
              <div className="rounded-xl bg-blue-50 p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Clients</p>
                  <p className="text-2xl font-bold">{roleStats.clients}</p>
                </div>
                <FiUserCheck className="text-blue-400" size={28} />
              </div>
              <div className="rounded-xl bg-blue-50 p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Organizers</p>
                  <p className="text-2xl font-bold text-blue-600">{roleStats.organizers}</p>
                </div>
                <FiUserCheck className="text-blue-600" size={28} />
              </div>
              <div className="rounded-xl bg-purple-50 p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{roleStats.admins}</p>
                </div>
                <FiShield className="text-purple-600" size={28} />
              </div>
              <div className="rounded-xl bg-green-50 p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Support</p>
                  <p className="text-2xl font-bold text-green-600">{roleStats.support}</p>
                </div>
                <FiUserCheck className="text-green-600" size={28} />
              </div>
            </div>
            {/* Users Table */}
            <div className="rounded-xl bg-white shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-700 font-semibold">
                                {usr.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{usr.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{usr.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(usr.role)}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(usr.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {usr.role !== 'superadmin' && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenRoleModal(usr)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Change Role"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id, usr.email)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Role Change Modal */}
            {showRoleModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">Change User Role</h3>
                  <p className="text-gray-600 mb-4">
                    Update role for <strong>{selectedUser?.full_name}</strong>
                  </p>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select New Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="input"
                    >
                      <option value="client">Client</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateRole}
                      disabled={updating}
                      className="btn-primary flex-1"
                    >
                      {updating ? 'Updating...' : 'Update Role'}
                    </button>
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
