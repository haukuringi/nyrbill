-- Hvert umboð má bara breyta sínum eigin bílum. Keyrt einu sinni ofan á schema.sql.
-- stjornendur.umbod_id = null  -> yfirstjórnandi (allt, líka umboð og stillingar)
-- stjornendur.umbod_id = 'bl'  -> má bara breyta gerðum/útfærslum umboðsins 'bl'

alter table public.stjornendur add column if not exists umbod_id text references public.umbod(id);

create or replace function public.er_yfirstjornandi()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stjornendur where user_id = auth.uid() and umbod_id is null);
$$;

create or replace function public.ma_breyta_umbodi(u text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.er_yfirstjornandi()
      or exists (select 1 from public.stjornendur where user_id = auth.uid() and umbod_id = u);
$$;

drop policy if exists "skrifa umbod" on public.umbod;
drop policy if exists "skrifa gerdir" on public.gerdir;
drop policy if exists "skrifa utfaerslur" on public.utfaerslur;
drop policy if exists "skrifa stillingar" on public.stillingar;
drop function if exists public.er_stjornandi();

create policy "skrifa umbod" on public.umbod for all
  using (public.er_yfirstjornandi()) with check (public.er_yfirstjornandi());
create policy "skrifa stillingar" on public.stillingar for all
  using (public.er_yfirstjornandi()) with check (public.er_yfirstjornandi());
create policy "skrifa gerdir" on public.gerdir for all
  using (public.ma_breyta_umbodi(umbod_id)) with check (public.ma_breyta_umbodi(umbod_id));
create policy "skrifa utfaerslur" on public.utfaerslur for all
  using (exists (select 1 from public.gerdir g where g.id = gerd_id and public.ma_breyta_umbodi(g.umbod_id)))
  with check (exists (select 1 from public.gerdir g where g.id = gerd_id and public.ma_breyta_umbodi(g.umbod_id)));
