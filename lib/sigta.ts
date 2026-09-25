import type { Gerd } from "./types";

export type Rodun = "verd-haekkandi" | "verd-laekkandi" | "draegni" | "nafn";

export interface Sian {
  leit: string;
  merki: string;
  umbod: string;
  flokkur: string;
  orkugjafi: string;
  drif: string;
  saeti: string;
  verdFra: string;
  verdTil: string;
  draegniMin: string;
  eftirStyrk: boolean;
  rodun: Rodun;
}

export const SIAN_SJALFGEFID: Sian = {
  leit: "",
  merki: "",
  umbod: "",
  flokkur: "",
  orkugjafi: "",
  drif: "",
  saeti: "",
  verdFra: "",
  verdTil: "",
  draegniMin: "",
  eftirStyrk: false,
  rodun: "verd-haekkandi",
};

const RODUN_GILDI = new Set<Rodun>(["verd-haekkandi", "verd-laekkandi", "draegni", "nafn"]);

// Les síugildi úr Next.js searchParams (allt strengir/óskilgreint úr URL-inu).
export function sianUrSlod(sp: Record<string, string | string[] | undefined>): Sian {
  const g = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const rodun = g("rodun");
  return {
    leit: g("leit"),
    merki: g("merki"),
    umbod: g("umbod"),
    flokkur: g("flokkur"),
    orkugjafi: g("orkugjafi"),
    drif: g("drif"),
    saeti: g("saeti"),
    verdFra: g("verdFra"),
    verdTil: g("verdTil"),
    draegniMin: g("draegniMin"),
    eftirStyrk: g("eftirStyrk") === "1",
    rodun: RODUN_GILDI.has(rodun as Rodun) ? (rodun as Rodun) : "verd-haekkandi",
  };
}

function verdReitur(g: Gerd, eftirStyrk: boolean) {
  return eftirStyrk ? g.verd_med_styrk_fra : g.verd_fra;
}

export function sigtaOgRadaBila(bilar: Gerd[], sian: Sian): Gerd[] {
  const { leit, merki, umbod, flokkur, orkugjafi, drif, saeti, verdFra, verdTil, draegniMin, eftirStyrk, rodun } = sian;

  let listi = bilar.filter((g) => {
    if (leit && !`${g.merki} ${g.gerd}`.toLowerCase().includes(leit.toLowerCase())) return false;
    if (merki && g.merki !== merki) return false;
    if (umbod && g.umbod !== umbod) return false;
    if (flokkur && g.flokkur !== flokkur) return false;
    if (orkugjafi && !g.utfaerslur.some((u) => u.orkugjafi === orkugjafi)) return false;
    if (drif && !g.utfaerslur.some((u) => u.drif === drif)) return false;
    if (saeti && !g.utfaerslur.some((u) => String(u.saeti) === saeti)) return false;
    if (verdFra && verdReitur(g, eftirStyrk) < Number(verdFra)) return false;
    if (verdTil && verdReitur(g, eftirStyrk) > Number(verdTil)) return false;
    if (draegniMin) {
      const mestaDraegni = Math.max(...g.utfaerslur.map((u) => u.draegni_km ?? -1));
      if (mestaDraegni < Number(draegniMin)) return false;
    }
    return true;
  });

  listi = [...listi].sort((a, b) => {
    if (rodun === "verd-haekkandi") return verdReitur(a, eftirStyrk) - verdReitur(b, eftirStyrk);
    if (rodun === "verd-laekkandi") return verdReitur(b, eftirStyrk) - verdReitur(a, eftirStyrk);
    if (rodun === "draegni") {
      const da = Math.max(...a.utfaerslur.map((u) => u.draegni_km ?? -1));
      const db = Math.max(...b.utfaerslur.map((u) => u.draegni_km ?? -1));
      return db - da;
    }
    return `${a.merki} ${a.gerd}`.localeCompare(`${b.merki} ${b.gerd}`, "is");
  });

  return listi;
}
