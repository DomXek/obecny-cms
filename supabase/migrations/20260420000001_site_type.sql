-- site_type and enabled_plugins are stored in the existing site_settings table
-- as key-value rows:
--   key = 'site_type'        → value = { "type": "obec" | "skola" | "firma" | "neziskovka" }
--   key = 'enabled_plugins'  → value = { "ids": ["aktuality", "uradna-tabula", ...] }
--
-- No schema changes needed — site_settings already supports arbitrary JSON values.
-- This migration grants service role write access for the onboarding API.

-- Allow authenticated users to read/write site_settings (onboarding + plugin management)
drop policy if exists "authenticated upsert settings" on site_settings;
create policy "authenticated upsert settings" on site_settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
