// Example: Server-side data fetching with Supabase
import { createClient } from '../utils/supabase/server'
import Layout from '../components/Layout'

export default function ExampleServerPage({ events }) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Server-Side Events Example</h1>
        <ul className="space-y-4">
          {events?.map((event) => (
            <li key={event.id} className="card p-4">
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-gray-600">{event.location}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

// Server-side data fetching
export async function getServerSideProps() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching events:', error)
    return {
      props: {
        events: []
      }
    }
  }

  return {
    props: {
      events: events || []
    }
  }
}
