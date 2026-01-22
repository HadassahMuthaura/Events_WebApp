import Head from 'next/head'
import LoginForm from '../../components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Events App</title>
      </Head>
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Logo and Header */}
            <div className="text-center">
              <Link href="/" className="inline-block">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">E</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Events App</span>
                </div>
              </Link>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your account and discover amazing events
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4">
              <p>© 2026 Events App. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Image/Info */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl font-bold mb-6">
              Discover & Book Amazing Events
            </h1>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Browse Events</h3>
                  <p className="text-primary-100">Explore thousands of events across multiple categories</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Quick Booking</h3>
                  <p className="text-primary-100">Secure your spot with easy online ticket booking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Get Reminders</h3>
                  <p className="text-primary-100">Never miss an event with timely notifications</p>
                </div>
              </div>
            </div>
            <div className="mt-10 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
              <p className="text-sm italic">"The best platform for discovering and attending events. The booking process is seamless and the reminders are a lifesaver!"</p>
              <p className="mt-2 font-semibold">— Sarah Johnson</p>
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
