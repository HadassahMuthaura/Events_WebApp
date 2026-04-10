import Head from 'next/head'
import Link from 'next/link'

function Error({ statusCode }) {
  return (
    <>
      <Head>
        <title>{statusCode ? `${statusCode} - Error` : 'Error'} - Events App</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary-600 mb-4">
            {statusCode || 'Error'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : 'An error occurred on client'}
          </p>
          <Link href="/" className="btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
