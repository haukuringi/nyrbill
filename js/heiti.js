// Varpar gagnagildum (án íslenskra stafa, t.d. "jepplingur") í fallegt
// birtingarheiti ("Jepplingur"). Öll leyfileg gildi koma úr "Listar"
// flipanum í bilagogn.xlsx.

const FLOKKUR_HEITI = {
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

const ORKUGJAFI_HEITI = {
  rafmagn: "Rafmagn",
  vetni: "Vetni",
  tengiltvinn: "Tengiltvinn",
  tvinn: "Tvinn",
  bensin: "Bensín",
  disil: "Dísil",
};

const DRIF_HEITI = {
  framhjoladrif: "Framhjóladrif",
  afturhjoladrif: "Afturhjóladrif",
  fjorhjoladrif: "Fjórhjóladrif",
};

// Skilar íslenska heitinu, eða upprunalega gildinu ef það finnst ekki
// í töflunni (t.d. nýtt gildi sem hefur ekki verið bætt við hér).
function heiti(taflaHeiti, gildi) {
  if (gildi == null) return "–";
  const taflan = { flokkur: FLOKKUR_HEITI, orkugjafi: ORKUGJAFI_HEITI, drif: DRIF_HEITI }[taflaHeiti];
  return (taflan && taflan[gildi]) || gildi;
}

function flokkurHeiti(gildi) { return heiti("flokkur", gildi); }
function orkugjafiHeiti(gildi) { return heiti("orkugjafi", gildi); }
function drifHeiti(gildi) { return heiti("drif", gildi); }
