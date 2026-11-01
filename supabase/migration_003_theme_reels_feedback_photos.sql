-- POIGAI schema update v3: admin-editable theme colors, Instagram Reels, feedback photos.
-- Run this in the Supabase SQL editor (you already ran schema.sql and migration_002).
-- Safe to re-run except the "create policy" lines, which error if they already exist — ignore those.

alter table site_settings add column if not exists theme_primary text not null default '#7a2e2e';
alter table site_settings add column if not exists theme_accent text not null default '#c9b298';

alter table testimonials add column if not exists image_url text;

create table if not exists reels (
  id uuid primary key default gen_random_uuid(),
  instagram_url text not null,
  caption text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table reels enable row level security;

create policy "Public can read active reels" on reels
  for select using (is_active = true or auth.role() = 'authenticated');

create policy "Admins manage reels" on reels
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for customer feedback photos. Public read + public upload, since
-- shoppers leaving feedback aren't signed in — keep an eye on its size over time.
insert into storage.buckets (id, name, public)
values ('feedback-images', 'feedback-images', true)
on conflict (id) do nothing;

create policy "Public can view feedback images" on storage.objects
  for select using (bucket_id = 'feedback-images');

create policy "Anyone can upload feedback images" on storage.objects
  for insert with check (bucket_id = 'feedback-images');

create policy "Admins manage feedback images" on storage.objects
  for all using (bucket_id = 'feedback-images' and auth.role() = 'authenticated');
