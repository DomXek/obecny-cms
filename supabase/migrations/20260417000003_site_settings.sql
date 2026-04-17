create table if not exists site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

alter table site_settings enable row level security;

drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings
  for select using (true);

-- Seed default style
insert into site_settings (key, value) values (
  'style',
  '{"colorPrimary":"#2563eb","colorSecondary":"#1e3a5f","colorAccent":"#f59e0b","colorBg":"#f8fafc","colorText":"#0f172a","colorNavBg":"#ffffff","fontHeading":"Inter","fontBody":"Inter","radius":"md","shadow":"subtle","navEffect":"glass"}'::jsonb
) on conflict (key) do nothing;
