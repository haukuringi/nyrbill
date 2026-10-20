import "server-only";
import { cache } from "react";
import { supabaseThjonn } from "./supabase";
import type { Gerd, Umbod, Stillingar, Utfaersla } from "./types";

// Orkugjafar sem eru styrkhæfir (sama regla og áður var í xlsx_i_json.py).
const LOSUNARFRITT = ["rafmagn", "vetni"];

interface UtfaerslaRada {
  id: string;
  gerd_id: string;
  heiti: string;
  verd: number;
  orkugjafi: string;
  drif: string;
  hestofl: number | null;
  rafhlada_kwh: number | null;
  draegni_km: number | null;
  eydsla_l_100km: number | null;
  saeti: number | null;
  farangursrymi_l: number | null;
  hrodun_0_100_s: number | null;
  heimild: string;
  uppfaert: string;
}

interface GerdRada {
  id: string;
  merki: string;
  gerd: string;
  umbod_id: string;
  flokkur: string;
  arsgerd: number;
  mynd_slod: string | null;
  utfaerslur: UtfaerslaRada[];
}

// Opin slóð á mynd í Supabase Storage (bucket 'bilamyndir' er opinn til lestrar).
export function myndaSlod(slod: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bilamyndir/${slod}`;
}

export const saekjaStillingar = cache(async (): Promise<Stillingar> => {
  const { data, error } = await supabaseThjonn().from("stillingar").select("*").eq("id", 1).single();
  if (error) throw new Error(`Gat ekki sótt stillingar: ${error.message}`);
  return {
    rafbilastyrkur: {
      upphaed: data.styrkur_upphaed,
      verdthak: data.styrkur_verdthak,
      heimild: data.styrkur_heimild,
    },
    buid_til: new Date().toISOString(),
  };
});

export const saekjaUmbod = cache(async (): Promise<Umbod[]> => {
  const { data, error } = await supabaseThjonn().from("umbod").select("*").order("nafn");
  if (error) throw new Error(`Gat ekki sótt umboð: ${error.message}`);
  return data as Umbod[];
});

export const saekjaBila = cache(async (): Promise<Gerd[]> => {
  const [{ data, error }, stillingar] = await Promise.all([
    supabaseThjonn().from("gerdir").select("*, utfaerslur(*)"),
    saekjaStillingar(),
  ]);
  if (error) throw new Error(`Gat ekki sótt bíla: ${error.message}`);

  const { upphaed, verdthak } = stillingar.rafbilastyrkur;

  const bilar = (data as GerdRada[])
    .filter((g) => g.utfaerslur.length > 0)
    .map((g): Gerd => {
      const utfaerslur: Utfaersla[] = g.utfaerslur
        .map((u) => {
          const styrkhaef = LOSUNARFRITT.includes(u.orkugjafi) && u.verd < verdthak;
          return {
            id: u.id,
            heiti: u.heiti,
            verd: u.verd,
            styrkhaef,
            verd_med_styrk: styrkhaef ? u.verd - upphaed : u.verd,
            orkugjafi: u.orkugjafi,
            drif: u.drif,
            hestofl: u.hestofl,
            rafhlada_kwh: u.rafhlada_kwh,
            draegni_km: u.draegni_km,
            eydsla_l_100km: u.eydsla_l_100km,
            saeti: u.saeti,
            farangursrymi_l: u.farangursrymi_l,
            hrodun_0_100_s: u.hrodun_0_100_s,
            heimild: u.heimild,
            uppfaert: u.uppfaert,
          };
        })
        .sort((a, b) => a.verd - b.verd);

      return {
        id: g.id,
        merki: g.merki,
        gerd: g.gerd,
        umbod: g.umbod_id,
        flokkur: g.flokkur,
        arsgerd: g.arsgerd,
        utfaerslur,
        verd_fra: utfaerslur[0].verd,
        verd_med_styrk_fra: Math.min(...utfaerslur.map((u) => u.verd_med_styrk)),
        uppfaert: utfaerslur.map((u) => u.uppfaert).sort().at(-1)!,
        mynd_url: g.mynd_slod ? myndaSlod(g.mynd_slod) : null,
      };
    });

  return bilar.sort((a, b) => `${a.merki} ${a.gerd}`.localeCompare(`${b.merki} ${b.gerd}`, "is"));
});

export async function finnaGerd(id: string): Promise<Gerd | undefined> {
  return (await saekjaBila()).find((g) => g.id === id);
}

export function utfaerslaUppfletting(bilar: Gerd[]): Map<string, { gerd: Gerd; utfaersla: Utfaersla }> {
  const map = new Map<string, { gerd: Gerd; utfaersla: Utfaersla }>();
  for (const gerd of bilar) {
    for (const utf of gerd.utfaerslur) {
      map.set(utf.id, { gerd, utfaersla: utf });
    }
  }
  return map;
}
