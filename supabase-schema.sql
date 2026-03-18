-- B2 Auto Detailing – Supabase schema
-- Run in the SQL editor in your Supabase project.
-- Use with Next.js server actions (service role) or API routes; add RLS policies as needed.

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums (match app: booking status and contact status)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'contact_status') then
    create type contact_status as enum ('open', 'replied', 'closed');
  end if;
end$$;

-- Admin users (for assignments; auth can use Supabase Auth + public.profiles or this table)
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- Bookings (matches app: full_name, vehicle_*, service_type, preferred_date/time, status)
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null,

  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year integer not null,

  service_type text not null,
  city text not null,
  postcode text not null,

  preferred_date date not null,
  preferred_time time not null,

  addons text[] not null default '{}',
  message text,

  status booking_status not null default 'pending',

  internal_notes text,
  assigned_admin uuid references admin_users(id) on delete set null
);

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_preferred_date_idx on bookings (preferred_date);

-- Contact form submissions (matches app: name, email, subject, message, status)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,
  email text not null,
  subject text not null,
  message text not null,

  status contact_status not null default 'open',
  last_reply_at timestamptz,
  assigned_admin uuid references admin_users(id) on delete set null
);

create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on contact_messages (status);

-- Optional: sessions for admin login (if not using Supabase Auth)
-- create table if not exists admin_sessions (
--   id uuid primary key default gen_random_uuid(),
--   admin_user_id uuid not null references admin_users(id) on delete cascade,
--   token text not null unique,
--   expires_at timestamptz not null,
--   created_at timestamptz not null default now()
-- );
-- create index if not exists admin_sessions_token_idx on admin_sessions (token);
-- create index if not exists admin_sessions_expires_at_idx on admin_sessions (expires_at);

-- Invoices table
do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
  end if;
end$$;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  invoice_number text not null unique,
  status invoice_status not null default 'draft',

  -- Customer information
  customer_name text not null,
  customer_email text not null,
  customer_address text,
  customer_phone text,

  -- Invoice details
  issue_date date not null default current_date,
  due_date date not null,
  
  -- Line items stored as JSONB for flexibility
  line_items jsonb not null default '[]'::jsonb,
  
  -- Totals (calculated but stored for performance)
  subtotal numeric(10, 2) not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  
  -- Additional fields
  notes text,
  terms text,
  
  -- Relations
  booking_id uuid references bookings(id) on delete set null,
  created_by uuid references admin_users(id) on delete set null,
  
  -- Email tracking
  sent_at timestamptz,
  paid_at timestamptz
);

create index if not exists invoices_created_at_idx on invoices (created_at desc);
create index if not exists invoices_status_idx on invoices (status);
create index if not exists invoices_invoice_number_idx on invoices (invoice_number);
create index if not exists invoices_customer_email_idx on invoices (customer_email);
create index if not exists invoices_booking_id_idx on invoices (booking_id);
create index if not exists invoices_due_date_idx on invoices (due_date);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_invoices_updated_at
  before update on invoices
  for each row
  execute function update_updated_at_column();

-- Function to generate invoice number
create or replace function generate_invoice_number()
returns text as $$
declare
  new_number text;
  year_part text;
  seq_num integer;
begin
  year_part := to_char(current_date, 'YYYY');
  
  -- Get the next sequence number for this year
  select coalesce(max(cast(substring(invoice_number from '\d+$') as integer)), 0) + 1
  into seq_num
  from invoices
  where invoice_number like 'INV-' || year_part || '-%';
  
  new_number := 'INV-' || year_part || '-' || lpad(seq_num::text, 4, '0');
  return new_number;
end;
$$ language plpgsql;

-- RLS: enable and then add policies (e.g. service_role bypass, or admin-only via auth.uid())
alter table admin_users enable row level security;
alter table bookings enable row level security;
alter table contact_messages enable row level security;
alter table invoices enable row level security;

-- Service role policies (bypass RLS when using service role key)
-- These allow full access when using the service role key from Next.js
create policy "Service role all bookings" on bookings 
  for all using (true) with check (true);

create policy "Service role all contacts" on contact_messages 
  for all using (true) with check (true);

create policy "Service role all invoices" on invoices 
  for all using (true) with check (true);

create policy "Service role all admin_users" on admin_users 
  for all using (true) with check (true);

-- Note: For production, you may want to add more restrictive policies
-- based on auth.uid() or user roles. The service role policies above
-- are for server-side operations using the service role key.

-- ============================================
-- CREATE INITIAL ADMIN USER
-- ============================================
-- This creates the initial admin user with email and password authentication
-- Email: cikstark004@gmail.com
-- Username: DetailKing  
-- Password: Patt@1234

do $$
declare
  admin_user_id uuid;
  instance_id_val uuid;
  encrypted_pwd text;
begin
  -- Get the instance_id from auth.instances (Supabase stores this)
  -- If not found, try to get from auth.config or use a fallback
  select id into instance_id_val 
  from auth.instances 
  limit 1;
  
  -- Fallback: try to get from any existing user
  if instance_id_val is null then
    select instance_id into instance_id_val 
    from auth.users 
    limit 1;
  end if;
  
  -- Final fallback (should not happen in Supabase)
  if instance_id_val is null then
    instance_id_val := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  -- Generate a unique user ID
  admin_user_id := gen_random_uuid();
  
  -- Hash the password using bcrypt (Supabase standard)
  encrypted_pwd := crypt('Patt@1234', gen_salt('bf'));

  -- Check if user already exists
  if not exists (select 1 from auth.users where email = 'cikstark004@gmail.com') then
    -- Insert into auth.users table with only non-generated columns
    -- Note: confirmed_at is a generated column, so we don't insert it
    -- Note: Supabase uses raw_app_meta_data and raw_user_meta_data
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      instance_id_val,
      admin_user_id,
      'authenticated',
      'authenticated',
      'cikstark004@gmail.com',
      encrypted_pwd,
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "DetailKing", "username": "DetailKing"}'::jsonb,
      now(),
      now()
    );

    -- Also insert into admin_users table for reference
    insert into admin_users (id, email, name, created_at)
    values (admin_user_id, 'cikstark004@gmail.com', 'DetailKing', now())
    on conflict (email) do update 
    set name = 'DetailKing', 
        id = admin_user_id;

    raise notice 'Admin user created successfully: cikstark004@gmail.com (DetailKing)';
    raise notice 'User ID: %', admin_user_id;
  else
    -- Update existing user password if needed
    update auth.users 
    set encrypted_password = encrypted_pwd,
        raw_user_meta_data = '{"name": "DetailKing", "username": "DetailKing"}'::jsonb,
        updated_at = now()
    where email = 'cikstark004@gmail.com';
    
    -- Get the user ID for admin_users table
    select id into admin_user_id from auth.users where email = 'cikstark004@gmail.com';
    
    -- Update admin_users table
    insert into admin_users (id, email, name, created_at)
    values (admin_user_id, 'cikstark004@gmail.com', 'DetailKing', now())
    on conflict (email) do update 
    set name = 'DetailKing', 
        id = admin_user_id;
    
    raise notice 'Admin user already exists - password and metadata updated: cikstark004@gmail.com (DetailKing)';
  end if;
end $$;

-- ============================================
-- VERIFY ADMIN USER CREATION
-- ============================================
-- After running the script, verify the admin user was created:
-- 
-- SELECT 
--   id, 
--   email, 
--   email_confirmed_at, 
--   created_at,
--   raw_user_meta_data->>'name' as name,
--   raw_user_meta_data->>'username' as username
-- FROM auth.users 
-- WHERE email = 'cikstark004@gmail.com';
-- 
-- You should see:
-- - Email: cikstark004@gmail.com
-- - Name: DetailKing
-- - Username: DetailKing
-- - Email confirmed: current timestamp
-- 
-- To test login:
-- 1. Go to /admin/login
-- 2. Enter email: cikstark004@gmail.com
-- 3. Enter password: Patt@1234
-- 4. You should be redirected to /admin dashboard
-- 
-- ============================================
