-- Schema updates to add ticket sale dates to events table
-- Run this in your Supabase SQL Editor after running the main schema.sql

-- Add sale_start_date and sale_end_date columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the new columns
COMMENT ON COLUMN events.sale_start_date IS 'Date when ticket sales start for the event';
COMMENT ON COLUMN events.sale_end_date IS 'Date when ticket sales end for the event';

-- Create index for ticket sale dates (useful for querying events with active ticket sales)
CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);
