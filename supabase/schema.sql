-- Posta hut: the online Hall of Masters.
-- Run this once in the Supabase dashboard (SQL Editor -> New query -> paste -> Run).
-- Also turn on Authentication -> Sign In / Providers -> "Allow anonymous sign-ins".
--
-- Each install signs in anonymously and gets its own user id; a player can only write their own row.
-- Everyone (signed in or not) can read the Hall.

-- ---------- the Hall ----------
create table if not exists public.hall (
  id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 12),
  xp         integer not null default 0 check (xp between 0 and 100000000),
  streak     integer not null default 0 check (streak between 0 and 10000),
  kit        jsonb not null default '{}'::jsonb check (pg_column_size(kit) < 4096),
  xp_at      timestamptz not null default now(),  -- when xp last went up (anti-cheat rate limit)
  updated_at timestamptz not null default now()
);
-- names needn't be unique: five players can all be called Cass (each row is its own player id)
drop index if exists public.hall_name_unique;
create index if not exists hall_xp_idx on public.hall (xp desc);
create index if not exists hall_streak_idx on public.hall (streak desc);

alter table public.hall enable row level security;
drop policy if exists "hall is public" on public.hall;
create policy "hall is public" on public.hall for select using (true);
drop policy if exists "add your own row" on public.hall;
create policy "add your own row" on public.hall for insert to authenticated with check (id = auth.uid());
drop policy if exists "change your own row" on public.hall;
create policy "change your own row" on public.hall for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "delete your own row" on public.hall;
create policy "delete your own row" on public.hall for delete to authenticated using (id = auth.uid());

-- ---------- names: the same filter as the game (js/game.js nameProblem), checked again here ----------
create or replace function public.name_ok(n text) returns boolean language plpgsql immutable as $$
declare
  s text := lower(translate(n, '0@41!|35$7', 'oaaiiiesst'));
  squashed text := regexp_replace(s, '[^a-z]', '', 'g');
  w text;
  block_any text[] := array['fuck','shit','cunt','nigg','bitch','whore','slut','nazi','hitler','kike','wank',
                            'twat','pussy','retard','tranny','faggot','jizz','dildo','rapist'];
  block_word text[] := array['fag','cum','dick','cock','rape','spic','chink','porn','penis','vagina','sex','ass',
                             'tit','tits','hoe','kkk','fuk','fck','wtf','xxx','anal','anus','nig','coon','gook'];
begin
  if n ~ '[[:cntrl:]<>&"\\/]' or btrim(n) = '' then return false; end if;  -- (the game itself allows only letters, numbers, spaces and . ' - _)
  foreach w in array block_any loop if position(w in squashed) > 0 then return false; end if; end loop;
  if squashed = any(block_word) then return false; end if;
  foreach w in array regexp_split_to_array(s, '[^a-z]+') loop if w = any(block_word) then return false; end if; end loop;
  return true;
end $$;

-- ---------- checks on every write: name filter, and XP that can't jump or climb too fast ----------
create or replace function public.hall_guard() returns trigger language plpgsql as $$
begin
  if not public.name_ok(new.name) then raise exception 'name not allowed' using errcode = '22023'; end if;
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.xp_at := now();
    if new.xp > 1000000 then raise exception 'xp too high' using errcode = '22023'; end if;  -- progress brought from before going online
  else
    if new.xp < old.xp then new.xp := old.xp; end if;                                       -- XP never goes down
    if new.streak < old.streak then new.streak := old.streak; end if;
    if new.xp > old.xp then
      if new.xp - old.xp > 100000 then raise exception 'xp jump too big' using errcode = '22023'; end if; -- more than any one run
      if now() - old.xp_at < interval '15 seconds' then raise exception 'too fast' using errcode = '22023'; end if;
      new.xp_at := now();
    else
      new.xp_at := old.xp_at;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists hall_guard on public.hall;
create trigger hall_guard before insert or update on public.hall for each row execute function public.hall_guard();

-- ---------- reports: any player can report a name; only you (in the dashboard) can read them ----------
create table if not exists public.reports (
  id         bigint generated always as identity primary key,
  reporter   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target     uuid not null references public.hall (id) on delete cascade,
  name       text not null,              -- the name as it was when reported
  created_at timestamptz not null default now(),
  unique (reporter, target)
);
alter table public.reports enable row level security;
drop policy if exists "file a report" on public.reports;
create policy "file a report" on public.reports for insert to authenticated with check (reporter = auth.uid());

-- ---------- delete my record: removes the player's sign-in and (by cascade) their Hall row and reports ----------
create or replace function public.delete_me() returns void language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;

-- ---------- API access, spelled out (so this works whether or not the project grants new tables to the API) ----------
-- (the row-level security policies above still decide which rows each player may touch)
grant usage on schema public to anon, authenticated;
grant select on public.hall to anon, authenticated;
grant insert, update, delete on public.hall to authenticated;
grant insert on public.reports to authenticated;
revoke all on public.reports from anon;
-- the project's defaults also hand these to the API roles; none are needed, and TRUNCATE would ignore row security
revoke truncate, references, trigger on public.hall, public.reports from anon, authenticated;
