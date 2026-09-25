// Sniðun talna og dagsetninga á íslenskan hátt – skrifað handvirkt (ekki
// Intl/is-IS) svo sniðið sé alltaf réttlátt óháð vafra/stýrikerfi.

const MANUDIR = [
  "janúar", "febrúar", "mars", "apríl", "maí", "júní",
  "júlí", "ágúst", "september", "október", "nóvember", "desember",
];

export function tala(gildi: number | null | undefined, aukastafir = 0): string {
  if (gildi == null || Number.isNaN(gildi)) return "–";
  const neikvaett = gildi < 0;
  const fastur = Math.abs(gildi).toFixed(aukastafir);
  const [heiltala, brotahluti] = fastur.split(".");
  const hopud = heiltala.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neikvaett ? "-" : "") + (brotahluti ? `${hopud},${brotahluti}` : hopud);
}

export function kronur(gildi: number | null | undefined): string {
  if (gildi == null) return "–";
  return `${tala(gildi, 0)} kr.`;
}

export const kwh = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 1)} kWh`);
export const km = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 0)} km`);
export const sekundur = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 1)} s`);
export const litrar = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 1)} l/100km`);
export const hestofl = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 0)} hö`);
export const saeti = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 0)}`);
export const farangur = (g: number | null | undefined) => (g == null ? "–" : `${tala(g, 0)} l`);

export function dagsetning(iso: string | null | undefined): string {
  if (!iso) return "–";
  const [ar, man, dagur] = iso.split("-").map(Number);
  return `${dagur}. ${MANUDIR[man - 1]} ${ar}`;
}
