-- Tilkynningarborði efst á síðunni (stjórnað úr /admin af yfirstjórnanda).
alter table public.stillingar
  add column if not exists tilkynning_texti text,
  add column if not exists tilkynning_slod text,
  add column if not exists tilkynning_virk boolean not null default false;

update public.stillingar set
  tilkynning_texti = 'Frá 1. nóvember 2026 lækkar rafbílastyrkur til nýrra fólksbíla úr 500.000 kr. í 400.000 kr. og hámarksverð styrkhæfra fólksbíla úr 10 milljónum króna í 8 milljónir króna. Styrkur til sendibíla er óbreyttur.',
  tilkynning_slod = 'https://uos.is/frettir/breytingar-a-styrkjum-til-kaupa-a-hreinorkubilum',
  tilkynning_virk = true
where id = 1;
