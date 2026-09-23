// Skref 2: sýnir eina gerð með töflu yfir allar útfærslur hennar.

const GERD_ID = new URLSearchParams(window.location.search).get("id");

saekjaGogn().then((gogn) => {
  const innihaldEl = document.getElementById("innihald");
  const gerd = gogn.bilar.find((g) => g.id === GERD_ID);

  if (!gerd) {
    innihaldEl.innerHTML = `<p class="villubox">Þessi gerð fannst ekki. <a href="index.html">Til baka í bílalista</a>.</p>`;
    return;
  }

  document.title = `${gerd.merki} ${gerd.gerd} – útfærslur og verð · Nýrbíll.is`;
  const umbod = gogn.umbodUppfletting.get(gerd.umbod);
  const einhverStyrkhaef = gerd.utfaerslur.some((u) => u.styrkhaef);

  innihaldEl.innerHTML = `
    <h2>${gerd.merki} ${gerd.gerd}</h2>
    <p class="undirtitill">
      ${flokkurHeiti(gerd.flokkur)} · Árgerð ${gerd.arsgerd}
      ${umbod ? ` · Umboð: <a href="${umbod.vefsida}" target="_blank" rel="noopener">${umbod.nafn}</a>` : ""}
    </p>
    <div class="taflubox">
      <table class="utfaerslutafla">
        <thead>
          <tr>
            <th>Útfærsla</th>
            <th>Verð</th>
            ${einhverStyrkhaef ? "<th>Eftir rafbílastyrk*</th>" : ""}
            <th>Orkugjafi</th>
            <th>Drif</th>
            <th>Hestöfl</th>
            <th>Rafhlaða</th>
            <th>Drægni</th>
            <th>Eyðsla</th>
            <th>Sæti</th>
            <th>Farangur</th>
            <th>Hröðun 0–100</th>
            <th>Heimild</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${gerd.utfaerslur.map((u) => radHtml(u, einhverStyrkhaef)).join("")}
        </tbody>
      </table>
    </div>
    ${einhverStyrkhaef ? `<p class="rafbilastyrkur-skyring">${styrkurSkyringHtml(gogn.stillingar)}</p>` : ""}
  `;

  document.getElementById("sidast-uppfaert").textContent = `Gögn síðast uppfærð ${dagsetning(gerd.uppfaert)}.`;

  document.addEventListener("karfa-breyttist", () => uppfaeraSamanburdKnappar(innihaldEl));
  uppfaeraSamanburdKnappar(innihaldEl);

  renderSamanburdarbox(gogn, document.getElementById("samanburdarbox"));
});

function radHtml(u, einhverStyrkhaef) {
  return `
    <tr>
      <td>${u.heiti}</td>
      <td>${kronur(u.verd)}</td>
      ${einhverStyrkhaef ? `<td>${u.styrkhaef ? kronur(u.verd_med_styrk) : "–"}</td>` : ""}
      <td>${orkugjafiHeiti(u.orkugjafi)}</td>
      <td>${drifHeiti(u.drif)}</td>
      <td>${hestofl(u.hestofl)}</td>
      <td>${kwh(u.rafhlada_kwh)}</td>
      <td>${km(u.draegni_km)}</td>
      <td>${litrar(u.eydsla_l_100km)}</td>
      <td>${saeti(u.saeti)}</td>
      <td>${farangur(u.farangursrymi_l)}</td>
      <td>${sekundur(u.hrodun_0_100_s)}</td>
      <td>
        <a href="${u.heimild}" target="_blank" rel="noopener">Verðlisti</a>
        <div class="heimild-lina">${dagsetning(u.uppfaert)}</div>
      </td>
      <td><button type="button" class="smaknappur" data-samanburd-id="${u.id}"></button></td>
    </tr>
  `;
}

function uppfaeraSamanburdKnappar(rotEl) {
  rotEl.querySelectorAll("[data-samanburd-id]").forEach((btn) => {
    const id = btn.dataset.samanburdId;
    const valid = karfaHefur(id);
    const fullur = karfaLesa().length >= KARFA_HAMARK;
    btn.textContent = valid ? "Í samanburði ✓" : "Bæta í samanburð";
    btn.classList.toggle("valid", valid);
    btn.disabled = !valid && fullur;
    btn.onclick = () => (valid ? karfaFjarlaegja(id) : karfaBaeta(id));
  });
}
