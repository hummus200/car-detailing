-- Migration: Add payments/transactions table
-- Run this in Supabase SQL editor after the main schema (supabase-schema.sql)

-- Create payment_status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('Completed', 'Pending', 'Refunded');
  end if;
end$$;

-- Create payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Transaction identifier (e.g., INV-2026-001)
  transaction_id text not null,
  
  -- Payment date
  payment_date date not null,
  
  -- Client information
  client_name text not null,
  client_email text,
  
  -- Service information
  service_offered text not null,
  
  -- Payment details
  amount numeric(10, 2) not null, -- Can be negative for refunds
  status payment_status not null default 'Completed',
  payment_method text, -- e.g., 'Card', 'Bank transfer', 'Cash', 'Invoice'
  
  -- Optional: Link to invoice if applicable
  invoice_id uuid references invoices(id) on delete set null,
  
  -- Optional: Link to booking if applicable
  booking_id uuid references bookings(id) on delete set null,
  
  -- Admin who recorded this payment
  recorded_by uuid references admin_users(id) on delete set null,
  
  -- Notes
  notes text
);

-- Create indexes for common queries
create index if not exists payments_payment_date_idx on payments (payment_date desc);
create index if not exists payments_status_idx on payments (status);
create index if not exists payments_transaction_id_idx on payments (transaction_id);
create index if not exists payments_client_name_idx on payments (client_name);
create index if not exists payments_invoice_id_idx on payments (invoice_id) where invoice_id is not null;
create index if not exists payments_booking_id_idx on payments (booking_id) where booking_id is not null;

-- Enable RLS
alter table payments enable row level security;

-- Service role policy (bypasses RLS when using service role key)
-- This allows server-side operations to read/write all payments
create policy "Service role all payments" on payments 
  for all using (true) with check (true);

-- Function to update updated_at timestamp
create or replace function update_payments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_payments_updated_at
  before update on payments
  for each row
  execute function update_payments_updated_at();

-- Note: After running this migration, existing mock transactions won't be in the database.
-- Only new transactions added after this migration will be stored in Supabase.
