-- Run once in Supabase SQL Editor (safe for existing data / archives)

alter table public.bookclub_books
  add column if not exists least_favorite_character text not null default '',
  add column if not exists ending_opinion text not null default '';
