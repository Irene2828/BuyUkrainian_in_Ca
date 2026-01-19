-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create Locations Table (mapped from Stores schema)
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  products text[] not null default '{}',
  address text not null,
  city text not null default '',
  province text not null default '',
  lat decimal(10,7) not null,
  lng decimal(10,7) not null,
  category text not null,
  website text,
  image text,
  images text[] not null default '{}', -- Array of image URLs
  email text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  is_open boolean default true,
  created_at timestamp with time zone default now(),
  approved_at timestamp with time zone
);

-- Create Admin Users Table (for CMS access)
create table if not exists admin_users (
  id serial primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- RLS Security Configuration
alter table locations enable row level security;
alter table admin_users enable row level security;

-- Policies for Locations
-- Drop existing policy to prevent errors on re-run
drop policy if exists "Allow public read access" on locations;

-- 1. Allow public read access (SELECT) for everyone
create policy "Allow public read access"
  on locations for select
  using (true);

-- Indexes for performance
create index if not exists locations_status_idx on locations (status);
create index if not exists locations_lat_lng_idx on locations (lat, lng);
