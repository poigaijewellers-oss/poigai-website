-- POIGAI storefront schema
-- Run this once in the Supabase SQL editor: Project -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run except for the "create policy" statements, which error if a policy
-- already exists — that's expected if you run this twice, just ignore those lines.

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  offer_price numeric(10,2) check (offer_price is null or offer_price >= 0),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  label text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  offer_ends_at timestamptz,
  is_combo boolean not null default false,
  combo_includes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  announcement_text text not null default 'A little everyday elegance ✦ Thoughtfully chosen, just for you',
  whatsapp_number text not null default '91XXXXXXXXXX',
  hero_heading text not null default 'Little details.
Lasting charm.',
  hero_subheading text not null default 'Jewellery that feels like you. Thoughtfully picked pieces for everyday moments, little celebrations and everything in between.',
  instagram_url text not null default 'https://instagram.com/',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- Keep updated_at current on edits
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at before update on site_settings
  for each row execute function set_updated_at();

-- Row Level Security: the public (anon) key can only read; only a signed-in
-- admin (any user you create in Authentication -> Users) can write.
alter table categories enable row level security;
alter table products enable row level security;
alter table site_settings enable row level security;

create policy "Public can read categories" on categories
  for select using (true);

create policy "Admins manage categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public can read active products" on products
  for select using (is_active = true or auth.role() = 'authenticated');

create policy "Admins manage products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public can read site settings" on site_settings
  for select using (true);

create policy "Admins manage site settings" on site_settings
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket for product images (public read, admin write)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admins update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Starter categories so the admin panel isn't empty on day one.
-- Delete or rename these from the admin panel once you have your real list.
insert into categories (name, slug, sort_order) values
  ('Necklaces', 'necklaces', 1),
  ('Earrings', 'earrings', 2),
  ('Rings', 'rings', 3)
on conflict (name) do nothing;

-- Customer feedback / testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  message text not null,
  rating int not null check (rating between 1 and 5),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "Public can read approved testimonials" on testimonials
  for select using (is_approved = true or auth.role() = 'authenticated');

create policy "Anyone can submit feedback" on testimonials
  for insert with check (is_approved = false);

create policy "Admins update testimonials" on testimonials
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins delete testimonials" on testimonials
  for delete using (auth.role() = 'authenticated');
