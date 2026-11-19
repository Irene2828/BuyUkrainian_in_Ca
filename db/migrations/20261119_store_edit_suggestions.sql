-- Public "Suggest an edit" flow: visitor suggestions for an existing store card
-- are stored separately and only applied to the live card after admin approval.
create table if not exists public.store_edit_suggestions (
  id text primary key,
  store_id text not null,
  store_name text not null default '',
  changes jsonb not null,
  submitter_email text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_store_edit_suggestions_status
  on public.store_edit_suggestions (status, created_at desc);

-- Only the server (direct Postgres connection / service role) may access this
-- table; the public anon key gets no policies and therefore no access.
alter table public.store_edit_suggestions enable row level security;
