-- Supabase Migration: Create admin_login_attempts table for login lockout
-- Run this in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL, -- IPv6 max length
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL
);

-- Index for fast lockout queries (IP and Username)
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip ON public.admin_login_attempts (ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_username ON public.admin_login_attempts (username, attempted_at);

-- Enable Row Level Security
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- NO policies for anon or authenticated roles are created.
-- This ensures ONLY the service_role key (used by the backend) can read/write this table.

-- To manually clear a lockout for a specific IP or username, run:
-- DELETE FROM public.admin_login_attempts WHERE ip_address = 'YOUR_IP_HERE';
-- OR
-- DELETE FROM public.admin_login_attempts WHERE username = 'admin';
