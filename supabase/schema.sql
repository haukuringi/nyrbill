-- Nýrbíll.is – gagnagrunnsskema fyrir Supabase.
-- Keyrt einu sinni í Supabase SQL Editor.

create table if not exists public.umbod (
  id text primary key,
  nafn text not null,
  vefsida text
);

create table if not exists public.gerdir (
  id text primary key,
  merki text not null,
  gerd text not null,
  umbod_id text not null references public.umbod(id),
  flokkur text not null,
  arsgerd integer not null
);

create table if not exists public.utfaerslur (
  id text primary key,
  gerd_id text not null references public.gerdir(id) on delete cascade,
  heiti text not null,
  verd integer not null check (verd > 0),
  orkugjafi text not null,
  drif text not null,
  hestofl integer,
  rafhlada_kwh numeric,
  draegni_km integer,
  eydsla_l_100km numeric,
  saeti integer,
  farangursrymi_l integer,
  hrodun_0_100_s numeric,
  heimild text not null,
  uppfaert date not null
);

create index if not exists utfaerslur_gerd_id_idx on public.utfaerslur(gerd_id);

-- Ein röð: upphæð rafbílastyrks og verðþak.
create table if not exists public.stillingar (
  id integer primary key default 1 check (id = 1),
  styrkur_upphaed integer not null,
  styrkur_verdthak integer not null,
  styrkur_heimild text not null,
  tilkynning_texti text,
  tilkynning_slod text,
  tilkynning_virk boolean not null default false
);

-- Hverjir mega breyta gögnum. umbod_id = null -> yfirstjórnandi (allt);
-- umbod_id = 'bl' -> má bara breyta gerðum/útfærslum umboðsins 'bl'. Bæta við með:
--   insert into public.stjornendur (user_id, umbod_id)
--   select id, 'bl' from auth.users where email = 'netfang@dæmi.is';
create table if not exists public.stjornendur (
  user_id uuid primary key references auth.users(id) on delete cascade,
  umbod_id text references public.umbod(id)
);

create or replace function public.er_yfirstjornandi()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stjornendur where user_id = auth.uid() and umbod_id is null);
$$;

create or replace function public.ma_breyta_umbodi(u text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.er_yfirstjornandi()
      or exists (select 1 from public.stjornendur where user_id = auth.uid() and umbod_id = u);
$$;

alter table public.umbod enable row level security;
alter table public.gerdir enable row level security;
alter table public.utfaerslur enable row level security;
alter table public.stillingar enable row level security;
alter table public.stjornendur enable row level security;

-- Allir mega lesa bílagögnin (opinber vefsíða).
create policy "les umbod" on public.umbod for select using (true);
create policy "les gerdir" on public.gerdir for select using (true);
create policy "les utfaerslur" on public.utfaerslur for select using (true);
create policy "les stillingar" on public.stillingar for select using (true);

-- Skrifa: umboð og stillingar bara yfirstjórnandi; gerðir/útfærslur bara eigið umboð.
create policy "skrifa umbod" on public.umbod for all
  using (public.er_yfirstjornandi()) with check (public.er_yfirstjornandi());
create policy "skrifa stillingar" on public.stillingar for all
  using (public.er_yfirstjornandi()) with check (public.er_yfirstjornandi());
create policy "skrifa gerdir" on public.gerdir for all
  using (public.ma_breyta_umbodi(umbod_id)) with check (public.ma_breyta_umbodi(umbod_id));
create policy "skrifa utfaerslur" on public.utfaerslur for all
  using (exists (select 1 from public.gerdir g where g.id = gerd_id and public.ma_breyta_umbodi(g.umbod_id)))
  with check (exists (select 1 from public.gerdir g where g.id = gerd_id and public.ma_breyta_umbodi(g.umbod_id)));

-- Notandi má sjá sína eigin stjórnandastöðu (til að vita hvort admin-síðan á að opnast).
create policy "les eigin stjornanda" on public.stjornendur for select
  using (user_id = auth.uid());
