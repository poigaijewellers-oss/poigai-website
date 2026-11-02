-- POIGAI schema update v5: admin-chosen hero photo.
-- Run this in the Supabase SQL editor (you already ran schema.sql and migrations 002–004).
-- Safe to re-run. Empty means the storefront keeps its default hero photo.

alter table site_settings add column if not exists hero_image_url text;
