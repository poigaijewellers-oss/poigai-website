-- POIGAI schema update v6: turn homepage sections on or off from the admin panel.
-- Run this in the Supabase SQL editor (you already ran schema.sql and migrations 002–005).
-- Safe to re-run. Lists the sections that are switched OFF; empty means everything shows.

alter table site_settings add column if not exists hidden_sections text[] not null default '{}';
