import Head from 'next/head'
import Link from 'next/link'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found - Events App</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
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
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
