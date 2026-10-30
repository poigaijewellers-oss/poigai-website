-- POIGAI schema update v2: one-day/limited-time offers, combo products, customer feedback.
-- Run this in the Supabase SQL editor (you already ran schema.sql before this).
-- Safe to re-run except the "create policy" lines, which error if they already exist — ignore those.

alter table products add column if not exists offer_ends_at timestamptz;
alter table products add column if not exists is_combo boolean not null default false;
alter table products add column if not exists combo_includes text;

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

-- Anyone (including anonymous shoppers) can submit feedback, but it always
-- starts unapproved — only a signed-in admin can approve it from /admin.
create policy "Anyone can submit feedback" on testimonials
  for insert with check (is_approved = false);

create policy "Admins update testimonials" on testimonials
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins delete testimonials" on testimonials
  for delete using (auth.role() = 'authenticated');
