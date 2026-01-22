import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardContent from '../../components/dashboard/DashboardContent'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import { useAuthStore } from '../../store/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else {
        setChecking(false)
      }
    }
  }, [isAuthenticated, isInitialized, router])

  if (checking || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard - Events App</title>
      </Head>
      <div className="flex bg-gray-50 min-h-screen">
        <DashboardSidebar />
        <DashboardContent />
      </div>
    </>
  )
}
