-- 🔧 FIX FOREIGN KEY CONSTRAINTS
-- Run this in Supabase SQL Editor to ensure all foreign key relationships exist

-- Check current foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('events', 'bookings');

-- Add missing foreign key constraints (these should already exist, but let's ensure they do)
ALTER TABLE events
ADD CONSTRAINT IF NOT EXISTS events_organizer_id_fkey
FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bookings
ADD CONSTRAINT IF NOT EXISTS bookings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bookings
ADD CONSTRAINT IF NOT EXISTS bookings_event_id_fkey
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Verify the constraints were added
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name IN ('events', 'bookings')
  AND tc.constraint_type = 'FOREIGN KEY';

-- Test the relationship by checking if we can query events with organizer info
SELECT e.id, e.title, u.full_name, u.email
FROM events e
LEFT JOIN users u ON e.organizer_id = u.id
LIMIT 5;