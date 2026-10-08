-- Migration to add deletion request columns to the stores table
ALTER TABLE stores
ADD COLUMN deletion_requested_at TIMESTAMP,
ADD COLUMN deletion_request_email TEXT;
