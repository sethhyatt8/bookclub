-- Bellefonte Cafe Book Club — run once in Supabase SQL Editor
-- (same project as Shows / Emily is fine)

create table if not exists public.bookclub_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_url text,
  open_library_key text,
  first_publish_year int,
  chooser text not null
    check (chooser in ('Emily', 'Val', 'Julia', 'Melissa')),
  status text not null default 'active'
    check (status in ('active', 'archived')),
  favorite_character text not null default '',
  least_favorite_character text not null default '',
  meaningful_quote text not null default '',
  surprising_plot_point text not null default '',
  ending_opinion text not null default '',
  discussion_questions text[] not null default '{}',
  started_at timestamptz not null default now(),
  archived_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Only one active book at a time
create unique index if not exists bookclub_books_one_active
  on public.bookclub_books ((true))
  where status = 'active';

create table if not exists public.bookclub_ratings (
  book_id uuid not null
    references public.bookclub_books (id) on delete cascade,
  member text not null
    check (member in ('Emily', 'Val', 'Julia', 'Melissa')),
  rating smallint
    check (rating is null or (rating >= 0 and rating <= 10)),
  updated_at timestamptz not null default now(),
  primary key (book_id, member)
);

alter table public.bookclub_books enable row level security;
alter table public.bookclub_ratings enable row level security;

drop policy if exists "anon read bookclub_books" on public.bookclub_books;
drop policy if exists "anon insert bookclub_books" on public.bookclub_books;
drop policy if exists "anon update bookclub_books" on public.bookclub_books;
drop policy if exists "anon delete bookclub_books" on public.bookclub_books;

create policy "anon read bookclub_books"
  on public.bookclub_books for select to anon, authenticated using (true);
create policy "anon insert bookclub_books"
  on public.bookclub_books for insert to anon, authenticated with check (true);
create policy "anon update bookclub_books"
  on public.bookclub_books for update to anon, authenticated using (true) with check (true);
create policy "anon delete bookclub_books"
  on public.bookclub_books for delete to anon, authenticated using (true);

drop policy if exists "anon read bookclub_ratings" on public.bookclub_ratings;
drop policy if exists "anon insert bookclub_ratings" on public.bookclub_ratings;
drop policy if exists "anon update bookclub_ratings" on public.bookclub_ratings;
drop policy if exists "anon delete bookclub_ratings" on public.bookclub_ratings;

create policy "anon read bookclub_ratings"
  on public.bookclub_ratings for select to anon, authenticated using (true);
create policy "anon insert bookclub_ratings"
  on public.bookclub_ratings for insert to anon, authenticated with check (true);
create policy "anon update bookclub_ratings"
  on public.bookclub_ratings for update to anon, authenticated using (true) with check (true);
create policy "anon delete bookclub_ratings"
  on public.bookclub_ratings for delete to anon, authenticated using (true);

-- Seed current book (skip if an active book already exists)
insert into public.bookclub_books (
  title,
  author,
  cover_url,
  open_library_key,
  first_publish_year,
  chooser,
  status
)
select
  'The Correspondent',
  'Virginia Evans',
  'https://covers.openlibrary.org/b/id/15232808-L.jpg',
  '/works/OL42414694W',
  2025,
  'Emily',
  'active'
where not exists (
  select 1 from public.bookclub_books where status = 'active'
);
