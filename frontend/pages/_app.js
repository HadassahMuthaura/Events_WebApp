import '../styles/globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { SidebarProvider } from '../contexts/SidebarContext'
import VoiceAssistantNew from '../components/VoiceAssistantNew'
import { AriaAnnouncer, setupAllAccessibilityFeatures } from '../lib/accessibility'

function MyApp({ Component, pageProps }) {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    // Initialize auth state from localStorage on app load (only once)
    initialize()
    // Initialize accessibility features
    setupAllAccessibilityFeatures()
  }, [])

  return (
    <SidebarProvider>
      <AriaAnnouncer />
      <Component {...pageProps} />
      <VoiceAssistantNew />
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
