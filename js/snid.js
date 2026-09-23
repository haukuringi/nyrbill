// Sniðun talna og dagsetninga á íslenskan hátt – skrifað handvirkt
// (ekki með Intl/is-IS) svo sniðið sé alltaf réttlátt óháð því hvaða
// vafri/stýrikerfi er notað.
// null/undefined er alls staðar birt sem "–" (t.d. eyðsla á rafbíl).

const MANUDIR = [
  "janúar", "febrúar", "mars", "apríl", "maí", "júní",
  "júlí", "ágúst", "september", "október", "nóvember", "desember",
];

// Almenn tala með n aukastöfum: punktur skiptir þúsundum, komma er aukastafamerki.
function tala(gildi, aukastafir = 0) {
  if (gildi == null || Number.isNaN(gildi)) return "–";
  const neikvaett = gildi < 0;
  const fastur = Math.abs(gildi).toFixed(aukastafir);
  const [heiltala, brotahluti] = fastur.split(".");
  const hopud = heiltala.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neikvaett ? "-" : "") + (brotahluti ? `${hopud},${brotahluti}` : hopud);
}

function kronur(gildi) {
  if (gildi == null) return "–";
  return `${tala(gildi, 0)} kr.`;
}

function kwh(gildi) { return gildi == null ? "–" : `${tala(gildi, 1)} kWh`; }
function km(gildi) { return gildi == null ? "–" : `${tala(gildi, 0)} km`; }
function sekundur(gildi) { return gildi == null ? "–" : `${tala(gildi, 1)} s`; }
function litrar(gildi) { return gildi == null ? "–" : `${tala(gildi, 1)} l/100km`; }
function hestofl(gildi) { return gildi == null ? "–" : `${tala(gildi, 0)} hö`; }
function saeti(gildi) { return gildi == null ? "–" : `${tala(gildi, 0)}`; }
function farangur(gildi) { return gildi == null ? "–" : `${tala(gildi, 0)} l`; }

// "2026-09-22" -> "22. september 2026"
function dagsetning(iso) {
  if (!iso) return "–";
  const [ar, man, dagur] = iso.split("-").map(Number);
  return `${dagur}. ${MANUDIR[man - 1]} ${ar}`;
}
