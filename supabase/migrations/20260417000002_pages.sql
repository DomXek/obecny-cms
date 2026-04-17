-- Pages table
create table if not exists pages (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  layout       jsonb not null default '{}',
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-update updated_at
drop trigger if exists pages_updated_at on pages;
create trigger pages_updated_at
  before update on pages
  for each row execute function update_updated_at();

-- RLS
alter table pages enable row level security;

drop policy if exists "public read published pages" on pages;
create policy "public read published pages" on pages
  for select using (is_published = true);

-- Ensure unique constraint on slug exists
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'pages'::regclass and contype = 'u'
    and conname = 'pages_slug_key'
  ) then
    alter table pages add constraint pages_slug_key unique (slug);
  end if;
end $$;

-- Seed: domov page (only if missing)
insert into pages (slug, title, layout, is_published)
select
  'domov',
  'Domov',
  '{"nav":{"position":"center","items":[{"label":"Domov","slug":"domov"}]},"hero":{"title":"Vitajte v obci","subtitle":"Oficiálna webová stránka obce","height":420},"blocks":[]}'::jsonb,
  true
where not exists (select 1 from pages where slug = 'domov');
