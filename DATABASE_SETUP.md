# Database Setup Guide

This guide walks you through setting up the Events App database in Supabase.

## Prerequisites

- A Supabase account and project
- Your Supabase URL and keys configured in `.env`
- Access to Supabase SQL Editor

## Current Status

The app requires the following migrations to be applied:

### Migration 1: Initial Schema (`001_initial_schema.sql`)
**Status:** ⚠️ May need verification  
**Contains:** Users, Events, and Bookings tables with basic structure

### Migration 2: Add Ticket Sale Dates (`002_add_ticket_sale_dates.sql`)  
**Status:** ❌ **PENDING - This is causing current errors**  
**Contains:** Sale date columns and performance indexes

## Quick Setup Steps

### Step 1: Check Your Database

Go to https://app.supabase.com and:
1. Select your project
2. Click **SQL Editor** in the left sidebar
3. Create a new query

### Step 2: Verify Initial Schema

First, check if the base tables exist:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

If you don't see `users`, `events`, and `bookings` tables, run the **001_initial_schema.sql** migration.

### Step 3: Apply Migration 2 (Required to Fix Current Errors)

Copy the SQL from [backend/database/migrations/002_add_ticket_sale_dates.sql](./migrations/002_add_ticket_sale_dates.sql) and run it in the Supabase SQL Editor:

```sql
-- This adds the missing sale_end_date column that's causing current errors
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN events.sale_start_date IS 'Date when ticket sales start for the event';
COMMENT ON COLUMN events.sale_end_date IS 'Date when ticket sales end for the event';

CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
```

### Step 4: Mark Migrations as Applied

After running the migrations in Supabase, run this in your terminal:

```bash
npm run migrations:mark-applied
```

This updates the migration tracking file so the app knows the migrations are complete.

## Troubleshooting

### Error: "Could not find the 'sale_end_date' column"

**Solution:** This means Migration 2 hasn't been applied yet. Follow Step 3 above.

### Error: "Could not find a relationship between 'events' and 'users'"

**Cause:** This was a query syntax issue that has been fixed in the latest code.

**Solution:** 
1. Pull the latest changes from git
2. Restart the backend server
3. If errors persist, verify the foreign key exists:

```sql
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE referenced_table_name = 'users';
```

### Tables don't exist at all

**Solution:** Run the full 001_initial_schema.sql migration. You can find all SQL migrations in [backend/database/migrations/](./migrations/).

## Schema Documentation

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `password`, `password_hash`: Authentication fields
- `full_name`: User's full name
- `role`: One of 'client', 'organizer', 'admin', 'support', 'superadmin'
- `phone`: Optional phone number
- `avatar_url`: Optional profile image
- `created_at`, `updated_at`: Timestamps

### Events Table
- `id`: UUID primary key
- `title`, `description`: Event details
- `category`: Event category
- `date`: Event date/time
- `location`, `venue`: Location details
- `price`: Ticket price
- `total_tickets`, `available_tickets`: Inventory
- `image_url`: Event image
- `organizer_id`: Foreign key to users (organizer)
- `status`: 'active', 'cancelled', or 'completed'
- `sale_start_date`, `sale_end_date`: Ticket sale window
- `created_at`, `updated_at`: Timestamps

### Bookings Table
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `event_id`: Foreign key to events
- `number_of_tickets`: Quantity booked
- `total_amount`: Total payment
- `status`: 'confirmed', 'cancelled', or 'attended'
- `booking_reference`: Unique booking code
- `created_at`, `updated_at`: Timestamps

## FAQ

**Q: Do I need to run migrations every time I start the app?**  
A: No, migrations are one-time operations. Once applied and marked, they don't need to run again.

**Q: Can I skip any migrations?**  
A: No, you should apply them in order (001, then 002, etc.) to ensure database consistency.

**Q: What if I accidentally applied a migration twice?**  
A: That's okay! The migrations use `IF NOT EXISTS` clauses, so running them multiple times is safe.

**Q: How do I check which migrations have been applied?**  
A: Check the file [backend/database/.migrations.json](./database/.migrations.json)

## Need Help?

If you encounter any errors after applying the migrations:

1. Check the backend logs (terminal where `npm run dev` is running)
2. Verify in Supabase SQL Editor that the tables and columns exist
3. Ensure all columns in the schema match what the backend expects
4. Check the `.env` file has correct Supabase credentials

## Next Steps

Once your database is fully set up:

1. Run `npm run dev` to start the development servers
2. The frontend will be available at http://localhost:3000
3. The backend API will be at http://localhost:3002/api
4. Create a test event through the frontend to verify everything works
