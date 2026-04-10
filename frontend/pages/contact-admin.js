import Head from 'next/head'
import Link from 'next/link'
import { FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi'

export default function ContactAdminPage() {
  return (
    <>
      <Head>
        <title>Contact Admin - Events App</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 lg:gap-0">
            <div className="p-10 md:p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Need to create an event?</h1>
              <p className="text-base md:text-lg text-primary-100 leading-relaxed">
                Event creation is managed by administrators only. Please contact the admin team to request a new event.
              </p>
              <div className="mt-8 space-y-4 text-sm text-primary-100">
                <p>Send an email or call the team directly and they will help you create the event.</p>
                <div className="rounded-2xl bg-white bg-opacity-10 border border-white border-opacity-20 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FiMail className="text-white" size={20} />
                    <span>admin@eventsapp.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-white" size={20} />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-10 md:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact the Admin</h2>
                <p className="text-gray-600">If you are an admin, sign in to manage event creation through the dashboard.</p>
              </div>
              <div className="space-y-4">
                <Link href="/auth/login" className="block w-full text-center py-4 border border-gray-200 rounded-2xl text-gray-900 font-semibold hover:bg-gray-100 transition">
                  Admin Sign In
                </Link>
                <Link href="/" className="block w-full text-center py-4 text-primary-600 rounded-2xl font-semibold hover:bg-primary-50 transition">
                  Back to Home <FiArrowLeft className="inline ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
