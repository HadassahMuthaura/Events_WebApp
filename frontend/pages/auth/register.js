import Head from 'next/head'
import RegisterForm from '../../components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Create Account - Events App</title>
      </Head>
      <div className="min-h-screen flex">
        {/* Left Side - Registration Form */}
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
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Join thousands of event enthusiasts and start your journey today
              </p>
            </div>

            {/* Registration Form */}
            <RegisterForm />

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4">
              <p>© 2026 Events App. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-600 via-primary-600 to-primary-800 items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl font-bold mb-6">
              Join Our Community Today
            </h1>
            <p className="text-lg text-purple-100 mb-8">
              Get access to exclusive events, early bird tickets, and personalized recommendations
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Easy Registration</h3>
                  <p className="text-purple-100">Create your account in less than a minute and start exploring</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Exclusive Perks</h3>
                  <p className="text-purple-100">Get early access to tickets and special member-only discounts</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Connect & Network</h3>
                  <p className="text-purple-100">Meet like-minded people and expand your professional network</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Smart Recommendations</h3>
                  <p className="text-purple-100">Get personalized event suggestions based on your interests</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white flex items-center justify-center text-sm font-bold">
                    +5K
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-lg">Join 5,000+ members</p>
                  <p className="text-sm text-purple-100">Already exploring amazing events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
