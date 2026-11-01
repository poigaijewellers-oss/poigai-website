-- POIGAI schema update v4: lets a signed-in admin add feedback directly from /admin
-- (not just approve what customers submit). Run this in the Supabase SQL editor.

create policy "Admins insert testimonials" on testimonials
  for insert with check (auth.role() = 'authenticated');
