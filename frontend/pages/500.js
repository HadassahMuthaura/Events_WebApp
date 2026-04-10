import Head from 'next/head'
import Link from 'next/link'
import { FiHome, FiRefreshCw } from 'react-icons/fi'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error - Events App</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-red-600 mb-4">500</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Server Error</h2>
            <p className="text-lg text-gray-600 mb-8">
              Something went wrong on our end. We're working to fix it!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="btn-primary flex items-center justify-center"
            >
              <FiHome className="mr-2" />
              Go Home
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
