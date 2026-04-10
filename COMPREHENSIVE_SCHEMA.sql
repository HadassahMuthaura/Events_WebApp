-- ===========================================
-- COMPREHENSIVE EVENTS WEBAPP DATABASE SCHEMA
-- ===========================================
-- Based on thorough analysis of the codebase
-- This schema supports all features found in the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. USERS TABLE
-- ===========================================
-- Stores all user accounts with role-based access control
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'organizer', 'admin', 'support', 'superadmin')),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 2. EVENTS TABLE
-- ===========================================
-- Core events with organizer relationship and ticket management
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
    total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
    available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
    image_url TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sale_start_date TIMESTAMP WITH TIME ZONE,
    sale_end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure sale dates are logical
    CONSTRAINT valid_sale_dates CHECK (
        (sale_start_date IS NULL AND sale_end_date IS NULL) OR
        (sale_start_date IS NOT NULL AND sale_end_date IS NOT NULL AND sale_start_date < sale_end_date)
    ),

    -- Ensure available tickets don't exceed total
    CONSTRAINT valid_ticket_counts CHECK (available_tickets <= total_tickets)
);

-- ===========================================
-- 3. BOOKINGS TABLE
-- ===========================================
-- Ticket bookings with payment and status tracking
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    number_of_tickets INTEGER NOT NULL CHECK (number_of_tickets > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    booking_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique booking per user per event
    UNIQUE(user_id, event_id)
);

-- ===========================================
-- 4. COMMENTS TABLE
-- ===========================================
-- Event discussions and organizer announcements
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_announcement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 5. REVIEWS TABLE
-- ===========================================
-- Event reviews with ratings and verification
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    verified_attendee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- One review per user per event
    UNIQUE(user_id, event_id)
);

-- ===========================================
-- 6. INVITATIONS TABLE
-- ===========================================
-- Event invitations with token-based acceptance
DROP TABLE IF EXISTS invitations CASCADE;
CREATE TABLE invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate invitations
    UNIQUE(event_id, invitee_email)
);

-- ===========================================
-- 7. SCANNERS TABLE
-- ===========================================
-- QR code based ticket scanning system
DROP TABLE IF EXISTS scanners CASCADE;
CREATE TABLE scanners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- One scanner per user per event
    UNIQUE(user_id, event_id)
);

-- ===========================================
-- 8. PASSWORD RESET TOKENS TABLE
-- ===========================================
-- Secure password reset functionality
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- One active token per user
    UNIQUE(user_id, used)
);

-- ===========================================
-- 9. ASSISTANT CONVERSATIONS TABLE (for AI chat)
-- ===========================================
DROP TABLE IF EXISTS assistant_conversations CASCADE;
CREATE TABLE assistant_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_user_message BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Events indexes
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_sale_dates ON events(sale_start_date, sale_end_date);
CREATE INDEX idx_events_location ON events(location);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Comments indexes
CREATE INDEX idx_comments_event_id ON comments(event_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_announcement ON comments(is_announcement);

-- Reviews indexes
CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_verified ON reviews(verified_attendee);

-- Invitations indexes
CREATE INDEX idx_invitations_event_id ON invitations(event_id);
CREATE INDEX idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX idx_invitations_email ON invitations(invitee_email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Scanners indexes
CREATE INDEX idx_scanners_event_id ON scanners(event_id);
CREATE INDEX idx_scanners_user_id ON scanners(user_id);
CREATE INDEX idx_scanners_qr_code ON scanners(qr_code);
CREATE INDEX idx_scanners_active ON scanners(is_active);

-- Password reset indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Assistant conversations indexes
CREATE INDEX idx_assistant_conversations_session ON assistant_conversations(session_id);
CREATE INDEX idx_assistant_conversations_user ON assistant_conversations(user_id, created_at);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scanners_updated_at BEFORE UPDATE ON scanners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- SAMPLE DATA FOR TESTING
-- ===========================================

-- Sample organizer
INSERT INTO users (email, password, password_hash, full_name, role)
VALUES (
    'organizer@example.com',
    '$2a$10$sample.hash.here',
    '$2a$10$sample.hash.here',
    'John Organizer',
    'organizer'
)
ON CONFLICT (email) DO NOTHING;

-- Sample client
INSERT INTO users (email, password, password_hash, full_name, role)
VALUES (
    'client@example.com',
    '$2a$10$sample.hash.here',
    '$2a$10$sample.hash.here',
    'Jane Client',
    'client'
)
ON CONFLICT (email) DO NOTHING;

-- Sample event
INSERT INTO events (
    title, description, category, date, location, venue,
    price, total_tickets, available_tickets, organizer_id, status
) VALUES (
    'Tech Conference 2024',
    'A comprehensive technology conference featuring industry leaders and innovative workshops.',
    'Technology',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'Nairobi, Kenya',
    'KICC - Kenyatta International Conference Centre',
    5000.00,
    200,
    180,
    (SELECT id FROM users WHERE email = 'organizer@example.com'),
    'active'
)
ON CONFLICT DO NOTHING;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check all tables exist and have data
SELECT
    'Users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'Scanners', COUNT(*) FROM scanners
UNION ALL
SELECT 'Password Reset Tokens', COUNT(*) FROM password_reset_tokens
UNION ALL
SELECT 'Assistant Conversations', COUNT(*) FROM assistant_conversations
ORDER BY table_name;

-- Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    COUNT(*) as constraints_count
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

-- Success message
SELECT '✅ Comprehensive Events WebApp database schema created successfully!' as status;
SELECT '🎉 Ready for full application functionality!' as message;