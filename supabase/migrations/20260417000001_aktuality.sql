-- Aktuality (News articles)
create table if not exists aktuality (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  perex       text,
  content     text,           -- HTML content
  cover_url   text,
  author      text,
  published_at timestamptz,
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists aktuality_updated_at on aktuality;
create trigger aktuality_updated_at
  before update on aktuality
  for each row execute function update_updated_at();

-- Enable RLS
alter table aktuality enable row level security;

-- Public can read published articles
drop policy if exists "public read published" on aktuality;
create policy "public read published" on aktuality
  for select using (is_published = true);

-- Service role (used by API) has full access — no RLS restriction needed
-- (service role bypasses RLS by default)

-- Index for public listing
create index if not exists aktuality_published_at_idx on aktuality (published_at desc) where is_published = true;
create index if not exists aktuality_slug_idx on aktuality (slug);
