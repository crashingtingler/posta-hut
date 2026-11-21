# Moderating the online Hall of Masters

Run these in the Supabase dashboard: **SQL Editor → New query**, paste, **Run**.
Tip: save each one as a snippet (the ⋯ menu → Save) so it's a click away next time.

## 1. Find the player

```sql
select id, name, xp, streak, updated_at
from public.hall
where name ilike '%cass%'          -- part of the name, any capitals
order by xp desc;
```

Or the top of the Hall:

```sql
select id, name, xp, streak, updated_at from public.hall order by xp desc limit 50;
```

Copy the **id** (the long code like `3f2a…-…`) of the player you want.

## 2. Act on them

| To… | Run |
|---|---|
| **Ban** (remove now, and refuse anything their app sends later) | `select ban_player('PASTE-ID', 'cheated XP');` |
| **Unban** | `select unban_player('PASTE-ID');` |
| **Rename** (the name sticks; their app can't change it back) | `select rename_player('PASTE-ID', 'Sir Robin');` |
| **Set score** (XP, and optionally best streak) | `select set_score('PASTE-ID', 1200, 8);` |

Keep the quotes around the id and the name.

**Cheaters: ban, don't edit.** A cheater's app keeps sending its own numbers, so after `set_score` (or deleting
their row in the Table Editor) they can climb straight back. A ban stops their app for good.

A banned player who reinstalls the game gets a new player ID and could reappear under a new entry. Ban that one
too; it's quick.

## 3. Reports from players

```sql
select r.created_at, r.name as reported_name, h.xp, r.target as id, count(*) over (partition by r.target) as times_reported
from public.reports r left join public.hall h on h.id = r.target
order by r.created_at desc;
```

## 4. Who's banned

```sql
select id, name, reason, created_at from public.bans order by created_at desc;
```

## Notes

- Your edits here skip the game's anti-cheat checks, so you can lower XP, use any name, and so on.
- Editing a row directly in the **Table Editor** also works for a one-off fix. But a player's app will put their
  own name and higher XP back on its next save, so use the commands above for anything that must stick.
