-- tenants and profiles already exist with extended schema.
-- profiles.id = auth.users.id (standard Supabase pattern)
-- This migration adds multi-tenancy to content tables.

-- ── Helper: get current user's tenant ────────────────────────────────────────

create or replace function get_my_tenant_id()
returns uuid as $$
  select tenant_id from profiles where id = auth.uid() limit 1
$$ language sql security definer stable;

-- ── RLS on existing tables ────────────────────────────────────────────────────

alter table tenants enable row level security;
alter table profiles enable row level security;

drop policy if exists "own tenant read" on tenants;
create policy "own tenant read" on tenants
  for select using (
    id in (select tenant_id from profiles where id = auth.uid())
  );

drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles
  for select using (id = auth.uid());

-- ── Add tenant_id to content tables ──────────────────────────────────────────

alter table aktuality
  add column if not exists tenant_id uuid references tenants(id) on delete cascade;

alter table pages
  add column if not exists tenant_id uuid references tenants(id) on delete cascade;

alter table site_settings
  add column if not exists tenant_id uuid references tenants(id) on delete cascade;

-- ── Replace global unique constraints with per-tenant ones ────────────────────

alter table aktuality drop constraint if exists aktuality_slug_key;
alter table aktuality drop constraint if exists aktuality_slug_tenant_key;
alter table aktuality add constraint aktuality_slug_tenant_key unique(slug, tenant_id);

alter table pages drop constraint if exists pages_slug_key;
alter table pages drop constraint if exists pages_slug_tenant_key;
alter table pages add constraint pages_slug_tenant_key unique(slug, tenant_id);

alter table site_settings drop constraint if exists site_settings_key_key;
alter table site_settings drop constraint if exists site_settings_key_tenant_key;
alter table site_settings add constraint site_settings_key_tenant_key unique(key, tenant_id);

-- ── RLS: tenant-scoped content access ────────────────────────────────────────

drop policy if exists "tenant all aktuality" on aktuality;
create policy "tenant all aktuality" on aktuality
  for all
  using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

drop policy if exists "tenant all pages" on pages;
create policy "tenant all pages" on pages
  for all
  using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());

drop policy if exists "public read settings" on site_settings;
drop policy if exists "authenticated upsert settings" on site_settings;
drop policy if exists "tenant all settings" on site_settings;
create policy "tenant all settings" on site_settings
  for all
  using (tenant_id = get_my_tenant_id())
  with check (tenant_id = get_my_tenant_id());
