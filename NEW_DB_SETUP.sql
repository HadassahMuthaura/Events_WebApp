-- ===========================================
-- COMPLETE DATABASE SETUP FOR NEW SUPABASE DB
-- ===========================================
-- Run this entire script in your NEW Supabase SQL Editor
-- This will create all tables, constraints, and initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('client', 'organizer', 'admin', 'support', 'superadmin'));

-- ===========================================
-- EVENTS TABLE
-- ===========================================
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    venue TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    total_tickets INTEGER NOT NULL,
    available_tickets INTEGER NOT NULL,
    image_url TEXT,
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sale_start_date TIMESTAMP WITH TIME ZONE,
    sale_end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
        CHECK (status IN ('active','cancelled','completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- BOOKINGS TABLE
-- ===========================================
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    number_of_tickets INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed'
        CHECK (status IN ('confirmed','cancelled','attended')),
    booking_reference VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- COMMENTS TABLE
-- ===========================================
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- REVIEWS TABLE
-- ===========================================
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INVITATIONS TABLE
-- ===========================================
DROP TABLE IF EXISTS invitations CASCADE;
CREATE TABLE invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending','accepted','declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SCANNERS TABLE
-- ===========================================
DROP TABLE IF EXISTS scanners CASCADE;
CREATE TABLE scanners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- PASSWORD_RESET_TOKENS TABLE
-- ===========================================
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

CREATE INDEX IF NOT EXISTS idx_comments_event_id ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON invitations(invitee_email);

CREATE INDEX IF NOT EXISTS idx_scanners_event_id ON scanners(event_id);
CREATE INDEX IF NOT EXISTS idx_scanners_qr_code ON scanners(qr_code);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- ===========================================
-- INITIAL SUPER ADMIN USER
-- ===========================================
INSERT INTO users (email, password, password_hash, full_name, role)
VALUES (
    'hadassahmuthaura54@gmail.com',
    '$2a$10$TdW./Uaz5hyYLRAX8UaQJOtQGx/3.CmzmvPkKqMApeGXNCFYu2JFy',
    '$2a$10$TdW./Uaz5hyYLRAX8UaQJOtQGx/3.CmzmvPkKqMApeGXNCFYu2JFy',
    'Super Admin',
    'superadmin'
)
ON CONFLICT (email) DO UPDATE SET
    role = 'superadmin',
    password = EXCLUDED.password,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name;

-- ===========================================
-- SAMPLE DATA (Optional - remove if not needed)
-- ===========================================
-- You can uncomment and modify this section to add sample events

/*
INSERT INTO events (
    title, description, category, date, location, venue, price,
    total_tickets, available_tickets, organizer_id, status
) VALUES (
    'Sample Music Concert',
    'An amazing music concert featuring local artists',
    'Music',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'Nairobi, Kenya',
    'Sarit Centre',
    2500.00,
    500,
    500,
    (SELECT id FROM users WHERE email = 'hadassahmuthaura54@gmail.com'),
    'active'
);
*/

-- ===========================================
-- VERIFY SETUP
-- ===========================================
SELECT 'Users table' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Events table', COUNT(*) FROM events
UNION ALL
SELECT 'Bookings table', COUNT(*) FROM bookings
UNION ALL
SELECT 'Comments table', COUNT(*) FROM comments
UNION ALL
SELECT 'Reviews table', COUNT(*) FROM reviews
UNION ALL
SELECT 'Invitations table', COUNT(*) FROM invitations
UNION ALL
SELECT 'Scanners table', COUNT(*) FROM scanners
UNION ALL
SELECT 'Password reset tokens table', COUNT(*) FROM password_reset_tokens;

-- Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Success message
SELECT '✅ Database setup completed successfully!' as status;