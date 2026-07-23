# Bellefonte Cafe Book Club

Shared record for the club's current book, member ratings, and chooser notes.

## Stack

- React + Vite + TypeScript
- Supabase (shared project with Shows / Emily)
- Open Library search for covers + metadata
- GitHub Pages deploy

## Setup

1. `npm install`
2. In Supabase SQL Editor, run [`supabase/bookclub.sql`](supabase/bookclub.sql)
   - Creates tables + RLS
   - Seeds **The Correspondent** by Virginia Evans (chosen by Emily)
3. `npm run dev`

## Edit mode

Same pattern as Shows: click **Edit**, enter password (`allfours`), stays unlocked on that device until **Stop editing**.
