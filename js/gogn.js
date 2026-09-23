// Sækir JSON-gögnin (búin til af scripts/xlsx_i_json.py) og býr til
// hjálparuppflettingu svo hægt sé að finna útfærslu eftir id-inu hennar
// hvar sem er á síðunni (t.d. í samanburðarboxinu).

let GOGN_LOFORD = null;

function saekjaGogn() {
  if (!GOGN_LOFORD) {
    GOGN_LOFORD = Promise.all([
      fetch("data/bilar.json").then((r) => r.json()),
      fetch("data/umbod.json").then((r) => r.json()),
      fetch("data/stillingar.json").then((r) => r.json()),
    ]).then(([bilar, umbod, stillingar]) => {
      const utfaerslaUppfletting = new Map();
      for (const gerd of bilar) {
        for (const utf of gerd.utfaerslur) {
          utfaerslaUppfletting.set(utf.id, { gerd, utfaersla: utf });
        }
      }
      const umbodUppfletting = new Map(umbod.map((u) => [u.id, u]));
      return { bilar, umbod, stillingar, utfaerslaUppfletting, umbodUppfletting };
    });
  }
  return GOGN_LOFORD;
}

// Stutt skýring + tengill á island.is, notuð alls staðar sem "verð eftir
// rafbílastyrk" er birt (sjá kröfu um að styrkurinn sé alltaf útskýrður).
function styrkurSkyringHtml(stillingar) {
  const { upphaed, verdthak, heimild } = stillingar.rafbilastyrkur;
  return `* Rafbílastyrkur (${kronur(upphaed)}) er ekki dreginn frá við kaup heldur greiddur eftir á, fyrir bíla sem kosta undir ${kronur(verdthak)} — <a href="${heimild}" target="_blank" rel="noopener">nánar á island.is</a>.`;
}
