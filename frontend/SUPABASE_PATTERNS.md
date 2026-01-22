# Supabase Integration Patterns

## Client-Side Usage (Browser)

```javascript
import { createClient } from '../utils/supabase/client'

// In a React component
const supabase = createClient()

const fetchData = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
}
```

Or use the singleton instance:

```javascript
import { supabase } from '../lib/supabase'

// Direct usage
const { data } = await supabase.from('events').select('*')
```

## Server-Side Usage (getServerSideProps)

```javascript
import { createClient } from '../utils/supabase/server'

export async function getServerSideProps() {
  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
  
  return {
    props: { events }
  }
}
```

## API Routes

```javascript
import { createClient } from '../../utils/supabase/server'

export default async function handler(req, res) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  res.status(200).json(data)
}
```

## Real-time Subscriptions (Client-Side)

```javascript
import { createClient } from '../utils/supabase/client'
import { useEffect } from 'react'

function MyComponent() {
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, (payload) => {
        console.log('Change received!', payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return <div>...</div>
}
```

## Middleware (Route Protection)

Middleware is automatically configured in `middleware.js` and handles:
- Session refresh
- Protected route access control
- Auth page redirects

No additional setup needed!
