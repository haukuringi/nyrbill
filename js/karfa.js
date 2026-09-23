// Samanburðar-"karfan": listi af völdum útfærslu-id-um, vistaður í
// localStorage svo hann fylgi þér milli síðna. Sjáanlegt box neðst á
// skjánum (sjá renderSamanburdarbox) er sameiginlegt fyrir allar síður.

const KARFA_LYKILL = "samanburdur_val";
const KARFA_HAMARK = 4;

function karfaLesa() {
  try {
    const gildi = JSON.parse(localStorage.getItem(KARFA_LYKILL) || "[]");
    return Array.isArray(gildi) ? gildi : [];
  } catch {
    return [];
  }
}

function karfaSkrifa(listi) {
  localStorage.setItem(KARFA_LYKILL, JSON.stringify(listi));
  document.dispatchEvent(new CustomEvent("karfa-breyttist"));
}

function karfaHefur(id) {
  return karfaLesa().includes(id);
}

function karfaBaeta(id) {
  const listi = karfaLesa();
  if (listi.includes(id) || listi.length >= KARFA_HAMARK) return false;
  listi.push(id);
  karfaSkrifa(listi);
  return true;
}

function karfaFjarlaegja(id) {
  karfaSkrifa(karfaLesa().filter((x) => x !== id));
}

function karfaTaema() {
  karfaSkrifa([]);
}

// Teiknar sjáanlega boxið neðst á skjánum. Kallað á öllum síðum eftir að
// gögnin hafa verið sótt (þarf gögn til að birta nöfn útfærslna).
function renderSamanburdarbox(gogn, staedaEl) {
  function teikna() {
    const val = karfaLesa().filter((id) => gogn.utfaerslaUppfletting.has(id));
    if (val.length !== karfaLesa().length) karfaSkrifa(val); // hreinsa ógild id

    if (val.length === 0) {
      staedaEl.innerHTML = "";
      staedaEl.hidden = true;
      return;
    }
    staedaEl.hidden = false;

    const flisar = val
      .map((id) => {
        const { gerd, utfaersla } = gogn.utfaerslaUppfletting.get(id);
        const nafn = `${gerd.merki} ${gerd.gerd} – ${utfaersla.heiti}`;
        return `<span class="flis">${nafn}<button type="button" data-fjarlaegja="${id}" aria-label="Fjarlægja">×</button></span>`;
      })
      .join("");

    staedaEl.innerHTML = `
      <div class="flisar">${flisar}</div>
      <button type="button" class="berasaman" ${val.length < 2 ? "disabled" : ""}>Bera saman (${val.length})</button>
    `;

    staedaEl.querySelectorAll("[data-fjarlaegja]").forEach((btn) => {
      btn.addEventListener("click", () => karfaFjarlaegja(btn.dataset.fjarlaegja));
    });
    const berasamanBtn = staedaEl.querySelector(".berasaman");
    if (berasamanBtn) {
      berasamanBtn.addEventListener("click", () => {
        window.location.href = `samanburdur.html?ids=${val.join(",")}`;
      });
    }
  }

  teikna();
  document.addEventListener("karfa-breyttist", teikna);
}
