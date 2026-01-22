import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for general operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
