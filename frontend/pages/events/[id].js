import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../../components/Layout'
import EventDetails from '../../components/EventDetails'

export default function EventDetailPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Head>
        <title>Event Details - Events App</title>
      </Head>
      <Layout>
        {id && <EventDetails eventId={id} />}
      </Layout>
    </>
  )
}
