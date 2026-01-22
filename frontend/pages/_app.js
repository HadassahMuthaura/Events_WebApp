import '../styles/globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { SidebarProvider } from '../contexts/SidebarContext'

function MyApp({ Component, pageProps }) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    initialize()
  }, [initialize])

  return (
    <SidebarProvider>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </SidebarProvider>
  )
}

export default MyApp
