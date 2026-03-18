-- Migration: Add contact_replies table for conversation tracking
-- Run this in Supabase SQL editor after the main schema (supabase-schema.sql)
-- This enables full conversation thread tracking with multiple replies per contact

-- Create contact_replies table to store all replies in a conversation
create table if not exists contact_replies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  
  contact_id uuid not null references contact_messages(id) on delete cascade,
  message text not null,
  sent_by text not null default 'admin', -- 'admin' or 'customer' (for future customer replies)
  
  -- Track which admin sent this reply
  sent_by_admin uuid references admin_users(id) on delete set null
);

create index if not exists contact_replies_contact_id_idx on contact_replies (contact_id);
create index if not exists contact_replies_created_at_idx on contact_replies (created_at desc);

-- Enable RLS
alter table contact_replies enable row level security;

-- Service role policy (bypasses RLS when using service role key)
-- This allows server-side operations to read/write all replies
create policy "Service role all contact_replies" on contact_replies 
  for all using (true) with check (true);

-- Note: After running this migration, existing replies won't be in the database.
-- Only new replies sent after this migration will be tracked in the conversation thread.
