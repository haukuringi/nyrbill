"""Býr til supabase/seed.sql úr data/*.json (einu sinni, til að flytja núverandi gögn)."""
import json
from pathlib import Path

d = Path("data")
umbod = json.loads((d / "umbod.json").read_text())
bilar = json.loads((d / "bilar.json").read_text())
st = json.loads((d / "stillingar.json").read_text())["rafbilastyrkur"]


def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


L = []
L.append("insert into public.stillingar (id, styrkur_upphaed, styrkur_verdthak, styrkur_heimild) values "
         f"(1, {st['upphaed']}, {st['verdthak']}, {q(st['heimild'])}) on conflict (id) do update set "
         "styrkur_upphaed = excluded.styrkur_upphaed, styrkur_verdthak = excluded.styrkur_verdthak, styrkur_heimild = excluded.styrkur_heimild;")
for u in umbod:
    L.append(f"insert into public.umbod (id, nafn, vefsida) values ({q(u['id'])}, {q(u['nafn'])}, {q(u['vefsida'])}) on conflict (id) do nothing;")
for g in bilar:
    L.append(f"insert into public.gerdir (id, merki, gerd, umbod_id, flokkur, arsgerd) values ({q(g['id'])}, {q(g['merki'])}, {q(g['gerd'])}, {q(g['umbod'])}, {q(g['flokkur'])}, {g['arsgerd']}) on conflict (id) do nothing;")
    for u in g["utfaerslur"]:
        cols = ["id", "gerd_id", "heiti", "verd", "orkugjafi", "drif", "hestofl", "rafhlada_kwh", "draegni_km",
                "eydsla_l_100km", "saeti", "farangursrymi_l", "hrodun_0_100_s", "heimild", "uppfaert"]
        vals = [u["id"], g["id"], u["heiti"], u["verd"], u["orkugjafi"], u["drif"], u["hestofl"], u["rafhlada_kwh"],
                u["draegni_km"], u["eydsla_l_100km"], u["saeti"], u["farangursrymi_l"], u["hrodun_0_100_s"],
                u["heimild"], u["uppfaert"]]
        L.append(f"insert into public.utfaerslur ({', '.join(cols)}) values ({', '.join(q(v) for v in vals)}) on conflict (id) do nothing;")

Path("supabase/seed.sql").write_text("\n".join(L) + "\n")
print(len(L), "setningar,", len(bilar), "gerðir")
