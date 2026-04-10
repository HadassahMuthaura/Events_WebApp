-- Migration: 002_add_indexes_and_constraints
-- Description: Add performance indexes, constraints, and additional features

-- Add sale date columns if they don't exist (for backward compatibility)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP WITH TIME ZONE;

-- Add is_announcement column to comments if it doesn't exist
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT FALSE;

-- Add verified_attendee column to reviews if it doesn't exist
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS verified_attendee BOOLEAN DEFAULT FALSE;

-- Add token column to invitations if it doesn't exist
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS token VARCHAR(255) UNIQUE;

-- Add qr_code column to scanners if it doesn't exist
ALTER TABLE scanners
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

-- Add is_active column to scanners if it doesn't exist
ALTER TABLE scanners
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add used column to password_reset_tokens if it doesn't exist
ALTER TABLE password_reset_tokens
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;

-- ===========================================
-- CONSTRAINTS AND VALIDATIONS
-- ===========================================

-- Events constraints
ALTER TABLE events DROP CONSTRAINT IF EXISTS valid_sale_dates;
ALTER TABLE events ADD CONSTRAINT valid_sale_dates CHECK (
    (sale_start_date IS NULL AND sale_end_date IS NULL) OR
    (sale_start_date IS NOT NULL AND sale_end_date IS NOT NULL AND sale_start_date < sale_end_date)
);

ALTER TABLE events DROP CONSTRAINT IF EXISTS valid_ticket_counts;
ALTER TABLE events ADD CONSTRAINT valid_ticket_counts CHECK (available_tickets <= total_tickets);

-- Reviews constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5);

-- Unique constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_event_unique;
ALTER TABLE bookings ADD CONSTRAINT bookings_user_event_unique UNIQUE(user_id, event_id);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_event_unique;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_event_unique UNIQUE(user_id, event_id);

ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_event_email_unique;
ALTER TABLE invitations ADD CONSTRAINT invitations_event_email_unique UNIQUE(event_id, invitee_email);

ALTER TABLE scanners DROP CONSTRAINT IF EXISTS scanners_user_event_unique;
ALTER TABLE scanners ADD CONSTRAINT scanners_user_event_unique UNIQUE(user_id, event_id);

ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_used_unique;
ALTER TABLE password_reset_tokens ADD CONSTRAINT password_reset_tokens_user_used_unique UNIQUE(user_id, used);

-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events USING gin(to_tsvector('english', location));

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_event_id ON comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_is_announcement ON comments(is_announcement);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified_attendee);

-- Invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Scanners indexes
CREATE INDEX IF NOT EXISTS idx_scanners_event_id ON scanners(event_id);
CREATE INDEX IF NOT EXISTS idx_scanners_user_id ON scanners(user_id);
CREATE INDEX IF NOT EXISTS idx_scanners_qr_code ON scanners(qr_code);
CREATE INDEX IF NOT EXISTS idx_scanners_active ON scanners(is_active);

-- Password reset indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Assistant conversations indexes
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_session ON assistant_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_user ON assistant_conversations(user_id, created_at);

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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invitations_updated_at ON invitations;
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scanners_updated_at ON scanners;
CREATE TRIGGER update_scanners_updated_at BEFORE UPDATE ON scanners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
