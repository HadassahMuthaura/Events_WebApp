-- Schema updates for ticket scanner functionality
-- Run this in your Supabase SQL Editor

-- Add qr_code and check-in columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES users(id);

-- Create index for quick QR code lookups
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_checked_in ON bookings(checked_in);

-- Add comment to explain the new columns
COMMENT ON COLUMN bookings.qr_code IS 'QR code data URL for ticket scanning';
COMMENT ON COLUMN bookings.checked_in IS 'Whether the ticket has been scanned/checked in';
COMMENT ON COLUMN bookings.checked_in_at IS 'Timestamp of when the ticket was scanned';
COMMENT ON COLUMN bookings.checked_in_by IS 'User (organizer/admin) who scanned the ticket';
