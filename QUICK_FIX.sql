-- ⚠️ IMMEDIATE FIX NEEDED: Run this SQL in Supabase SQL Editor to fix current errors
-- 
-- This migration adds the missing 'sale_end_date' column that app is looking for
-- Paste this entire block into: https://app.supabase.com → SQL Editor → New Query

-- Add sale_start_date and sale_end_date columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP WITH TIME ZONE;

-- Add helpful comments
COMMENT ON COLUMN events.sale_start_date IS 'Date when ticket sales start for the event';
COMMENT ON COLUMN events.sale_end_date IS 'Date when ticket sales end for the event';

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

-- Verify the changes
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'events' ORDER BY ordinal_position;

-- If everything worked, you should see:
-- sale_start_date | timestamp with time zone
-- sale_end_date   | timestamp with time zone
