// Skref 3: samanburður á allt að 4 útfærslum, hlið við hlið.
// Valið býr í slóðinni (?ids=a,b,c) svo hægt sé að deila tenglinum, og er
// samstillt við samanburðarkörfuna (localStorage) svo boxið neðst stemmi.

const SAMANBURDUR_HAMARK = 4;

const REITIR = [
  { titill: "Verð", stefna: "min", gildi: (u) => u.verd, birta: (u) => kronur(u.verd) },
  { titill: "Verð eftir rafbílastyrk*", stefna: "min", gildi: (u) => (u.styrkhaef ? u.verd_med_styrk : null), birta: (u) => (u.styrkhaef ? kronur(u.verd_med_styrk) : "–") },
  { titill: "Orkugjafi", birta: (u) => orkugjafiHeiti(u.orkugjafi) },
  { titill: "Drif", birta: (u) => drifHeiti(u.drif) },
  { titill: "Hestöfl", stefna: "max", gildi: (u) => u.hestofl, birta: (u) => hestofl(u.hestofl) },
  { titill: "Rafhlaða", stefna: "max", gildi: (u) => u.rafhlada_kwh, birta: (u) => kwh(u.rafhlada_kwh) },
  { titill: "Drægni", stefna: "max", gildi: (u) => u.draegni_km, birta: (u) => km(u.draegni_km) },
  { titill: "Eyðsla", stefna: "min", gildi: (u) => u.eydsla_l_100km, birta: (u) => litrar(u.eydsla_l_100km) },
  { titill: "Sæti", stefna: "max", gildi: (u) => u.saeti, birta: (u) => saeti(u.saeti) },
  { titill: "Farangursrými", stefna: "max", gildi: (u) => u.farangursrymi_l, birta: (u) => farangur(u.farangursrymi_l) },
  { titill: "Hröðun 0–100", stefna: "min", gildi: (u) => u.hrodun_0_100_s, birta: (u) => sekundur(u.hrodun_0_100_s) },
];

saekjaGogn().then((gogn) => {
  render(gogn);
  renderSamanburdarbox(gogn, document.getElementById("samanburdarbox"));
  document.addEventListener("karfa-breyttist", () => render(gogn));
});

function lesaIdsUrSlod() {
  const hra = new URLSearchParams(window.location.search).get("ids") || "";
  return hra.split(",").map((s) => s.trim()).filter(Boolean);
}

function skrifaIdsISlod(idListi) {
  const url = new URL(window.location.href);
  if (idListi.length > 0) url.searchParams.set("ids", idListi.join(","));
  else url.searchParams.delete("ids");
  window.history.replaceState({}, "", url);
}

// Fjarlægir eina útfærslu úr samanburðinum: slóðin er höfð rétt fyrst svo
// render() (sem samstillir sig við slóðina) skrifi ekki breytingunni yfir.
function fjarlaegjaUrSamanburdi(gogn, id) {
  const nyListi = lesaIdsUrSlod().filter((x) => x !== id);
  skrifaIdsISlod(nyListi);
  render(gogn); // render() samstillir karfaLesa() við slóðina sjálft
}

function render(gogn) {
  const idListi = [...new Set(lesaIdsUrSlod())]
    .filter((id) => gogn.utfaerslaUppfletting.has(id))
    .slice(0, SAMANBURDUR_HAMARK);

  skrifaIdsISlod(idListi);
  if (JSON.stringify(karfaLesa()) !== JSON.stringify(idListi)) karfaSkrifa(idListi);

  const innihaldEl = document.getElementById("innihald");

  if (idListi.length === 0) {
    innihaldEl.innerHTML = `<p class="tomt-skilabod">Engar útfærslur valdar. Farðu á <a href="index.html">bílalistann</a> og smelltu á "Bæta í samanburð".</p>`;
    document.getElementById("sidast-uppfaert").textContent = "";
    return;
  }

  const kort = idListi.map((id) => gogn.utfaerslaUppfletting.get(id));
  const reitanBestun = REITIR.map((reitur) => bestuVisitolur(kort, reitur));

  // "Verð eftir rafbílastyrk" er alltaf einn af samanburðarreitunum, svo
  // skýringin fylgir alltaf með – óháð því hvort valdar útfærslur séu styrkhæfar.
  innihaldEl.innerHTML = `
    <p class="tal-fjolda">${kort.length} af allt að ${SAMANBURDUR_HAMARK} útfærslum í samanburði</p>
    <div class="samanburdargrind" style="--fjoldi:${kort.length}">
      ${kort.map((k, i) => kortHtml(k, i, reitanBestun)).join("")}
    </div>
    <p class="rafbilastyrkur-skyring">${styrkurSkyringHtml(gogn.stillingar)}</p>
  `;

  innihaldEl.querySelectorAll("[data-fjarlaegja]").forEach((btn) => {
    btn.addEventListener("click", () => fjarlaegjaUrSamanburdi(gogn, btn.dataset.fjarlaegja));
  });

  const nyjast = kort.reduce((n, k) => (!n || k.utfaersla.uppfaert > n ? k.utfaersla.uppfaert : n), null);
  document.getElementById("sidast-uppfaert").textContent = nyjast ? `Gögn síðast uppfærð ${dagsetning(nyjast)}.` : "";
}

function bestuVisitolur(kort, reitur) {
  if (!reitur.stefna || kort.length < 2) return new Set();
  const gildi = kort.map(({ utfaersla }) => reitur.gildi(utfaersla));
  const tilHofst = gildi.filter((g) => g != null);
  if (tilHofst.length === 0) return new Set();
  const best = reitur.stefna === "min" ? Math.min(...tilHofst) : Math.max(...tilHofst);
  return new Set(gildi.map((g, i) => (g === best ? i : -1)).filter((i) => i >= 0));
}

function kortHtml(k, i, reitanBestun) {
  const { gerd, utfaersla } = k;
  const dtdd = REITIR.map((reitur, r) => {
    const bestClass = reitanBestun[r].has(i) ? " best-gildi" : "";
    return `<dt>${reitur.titill}</dt><dd class="${bestClass}">${reitur.birta(utfaersla)}</dd>`;
  }).join("");

  return `
    <div class="samanburdarkort">
      <h3>${gerd.merki} ${gerd.gerd}</h3>
      <div class="undirtitill">
        ${utfaersla.heiti}
        <button type="button" class="smaknappur" data-fjarlaegja="${utfaersla.id}">Fjarlægja</button>
      </div>
      <dl>${dtdd}</dl>
      <dl>
        <dt>Heimild</dt>
        <dd><a href="${utfaersla.heimild}" target="_blank" rel="noopener">Verðlisti</a> · ${dagsetning(utfaersla.uppfaert)}</dd>
      </dl>
    </div>
  `;
}
