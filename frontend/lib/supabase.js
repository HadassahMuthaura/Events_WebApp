import { createClient as createBrowserClient } from '../utils/supabase/client'

// Create singleton instance for client-side usage
export const supabase = createBrowserClient()

export default supabase
