-- Migration: 003_add_qr_code_to_bookings
-- Description: Add qr_code column to bookings table for ticket management

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

-- Create index for QR code lookups
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code ON bookings(qr_code);

-- Success
SELECT 'QR code column added to bookings table' as status;