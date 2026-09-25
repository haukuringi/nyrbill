// Varpar gagnagildum (án íslenskra stafa, t.d. "jepplingur") í fallegt
// birtingarheiti ("Jepplingur"). Öll leyfileg gildi koma úr "Listar"
// flipanum í bilagogn.xlsx.

const FLOKKUR_HEITI: Record<string, string> = {
  smabill: "Smábíll",
  folksbill: "Fólksbíll",
  skutbill: "Skutbíll",
  jepplingur: "Jepplingur",
  jeppi: "Jeppi",
  fjolnotabill: "Fjölnotabíll",
  sendibill: "Sendibíll",
  pallbill: "Pallbíll",
  sportbill: "Sportbíll",
};

const ORKUGJAFI_HEITI: Record<string, string> = {
  rafmagn: "Rafmagn",
  vetni: "Vetni",
  tengiltvinn: "Tengiltvinn",
  tvinn: "Tvinn",
  bensin: "Bensín",
  disil: "Dísil",
};

const DRIF_HEITI: Record<string, string> = {
  framhjoladrif: "Framhjóladrif",
  afturhjoladrif: "Afturhjóladrif",
  fjorhjoladrif: "Fjórhjóladrif",
};

export const flokkurHeiti = (gildi: string) => FLOKKUR_HEITI[gildi] ?? gildi;
export const orkugjafiHeiti = (gildi: string) => ORKUGJAFI_HEITI[gildi] ?? gildi;
export const drifHeiti = (gildi: string) => DRIF_HEITI[gildi] ?? gildi;

export const FLOKKAR = Object.entries(FLOKKUR_HEITI);
export const ORKUGJAFAR = Object.entries(ORKUGJAFI_HEITI);
export const DRIF = Object.entries(DRIF_HEITI);
