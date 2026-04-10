-- Add password reset columns to users table
-- Run this in Supabase SQL Editor

-- Add reset_token column to store password reset tokens
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;

-- Add reset_token_expiry column to store token expiration timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Create index on reset_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Display confirmation
SELECT 'Password reset columns added successfully!' as status;
