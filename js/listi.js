// Skref 1+4: birtir bílalistann sem spjöld, með leit, síum og röðun.
//
// Rofinn "Sýna verð eftir rafbílastyrk" breytir því hvaða verð er notað til
// að raða og sía eftir verðbili (verd_fra eða verd_med_styrk_fra) – kortin
// sýna alltaf bæði verðin óháð rofanum, eins og krafist er.

saekjaGogn().then((gogn) => {
  fyllaValmyndir(gogn);
  tengjaStyringar(gogn);
  sigtaOgRada(gogn);
  renderSamanburdarbox(gogn, document.getElementById("samanburdarbox"));

  const nyjastaUppfaert = gogn.bilar.reduce((n, g) => (!n || g.uppfaert > n ? g.uppfaert : n), null);
  document.getElementById("sidast-uppfaert").textContent = nyjastaUppfaert
    ? `Gögn síðast uppfærð ${dagsetning(nyjastaUppfaert)}.`
    : "";

  const einhverStyrkhaef = gogn.bilar.some((g) => g.utfaerslur.some((u) => u.styrkhaef));
  if (einhverStyrkhaef) {
    const skyring = document.createElement("p");
    skyring.className = "rafbilastyrkur-skyring";
    skyring.innerHTML = styrkurSkyringHtml(gogn.stillingar);
    document.getElementById("bilagrind").insertAdjacentElement("afterend", skyring);
  }
});

function fyllaValmyndir(gogn) {
  const merki = [...new Set(gogn.bilar.map((g) => g.merki))].sort();
  const flokkar = [...new Set(gogn.bilar.map((g) => g.flokkur))].sort();
  const orkugjafar = [...new Set(gogn.bilar.flatMap((g) => g.utfaerslur.map((u) => u.orkugjafi)))].sort();
  const drif = [...new Set(gogn.bilar.flatMap((g) => g.utfaerslur.map((u) => u.drif)))].sort();
  const saeti = [...new Set(gogn.bilar.flatMap((g) => g.utfaerslur.map((u) => u.saeti)).filter((s) => s != null))].sort((a, b) => a - b);

  baetaValkostum("sia-merki", merki.map((v) => [v, v]));
  baetaValkostum("sia-umbod", gogn.umbod.map((u) => [u.id, u.nafn]));
  baetaValkostum("sia-flokkur", flokkar.map((v) => [v, flokkurHeiti(v)]));
  baetaValkostum("sia-orkugjafi", orkugjafar.map((v) => [v, orkugjafiHeiti(v)]));
  baetaValkostum("sia-drif", drif.map((v) => [v, drifHeiti(v)]));
  baetaValkostum("sia-saeti", saeti.map((v) => [v, `${v} sæti`]));
}

function baetaValkostum(selectId, parListi) {
  const el = document.getElementById(selectId);
  for (const [gildi, texti] of parListi) {
    const opt = document.createElement("option");
    opt.value = gildi;
    opt.textContent = texti;
    el.appendChild(opt);
  }
}

function tengjaStyringar(gogn) {
  const idListi = [
    "sia-leit", "sia-rodun", "sia-merki", "sia-umbod", "sia-flokkur",
    "sia-orkugjafi", "sia-drif", "sia-saeti", "sia-verd-fra", "sia-verd-til",
    "sia-draegni", "sia-styrkur-rofi",
  ];
  for (const id of idListi) {
    const el = document.getElementById(id);
    el.addEventListener("input", () => sigtaOgRada(gogn));
    el.addEventListener("change", () => sigtaOgRada(gogn));
  }
  document.getElementById("sia-nullstilla").addEventListener("click", () => {
    for (const id of idListi) {
      const el = document.getElementById(id);
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    }
    document.getElementById("sia-rodun").value = "verd-haekkandi";
    sigtaOgRada(gogn);
  });
}

function sigtaOgRada(gogn) {
  const leit = gildiFra("sia-leit").toLowerCase();
  const merki = gildiFra("sia-merki");
  const umbod = gildiFra("sia-umbod");
  const flokkur = gildiFra("sia-flokkur");
  const orkugjafi = gildiFra("sia-orkugjafi");
  const drif = gildiFra("sia-drif");
  const saeti = gildiFra("sia-saeti");
  const verdFra = gildiFra("sia-verd-fra");
  const verdTil = gildiFra("sia-verd-til");
  const draegniMin = gildiFra("sia-draegni");
  const eftirStyrk = document.getElementById("sia-styrkur-rofi").checked;
  const rodun = document.getElementById("sia-rodun").value;

  const verdReitur = (g) => (eftirStyrk ? g.verd_med_styrk_fra : g.verd_fra);

  let listi = gogn.bilar.filter((g) => {
    if (leit && !`${g.merki} ${g.gerd}`.toLowerCase().includes(leit)) return false;
    if (merki && g.merki !== merki) return false;
    if (umbod && g.umbod !== umbod) return false;
    if (flokkur && g.flokkur !== flokkur) return false;
    if (orkugjafi && !g.utfaerslur.some((u) => u.orkugjafi === orkugjafi)) return false;
    if (drif && !g.utfaerslur.some((u) => u.drif === drif)) return false;
    if (saeti && !g.utfaerslur.some((u) => String(u.saeti) === saeti)) return false;
    if (verdFra && verdReitur(g) < Number(verdFra)) return false;
    if (verdTil && verdReitur(g) > Number(verdTil)) return false;
    if (draegniMin) {
      const mestaDraegni = Math.max(...g.utfaerslur.map((u) => u.draegni_km ?? -1));
      if (mestaDraegni < Number(draegniMin)) return false;
    }
    return true;
  });

  listi = listi.sort((a, b) => {
    if (rodun === "verd-haekkandi") return verdReitur(a) - verdReitur(b);
    if (rodun === "verd-laekkandi") return verdReitur(b) - verdReitur(a);
    if (rodun === "draegni") {
      const da = Math.max(...a.utfaerslur.map((u) => u.draegni_km ?? -1));
      const db = Math.max(...b.utfaerslur.map((u) => u.draegni_km ?? -1));
      return db - da;
    }
    return `${a.merki} ${a.gerd}`.localeCompare(`${b.merki} ${b.gerd}`, "is");
  });

  const grindEl = document.getElementById("bilagrind");
  const tomtEl = document.getElementById("tomt-skilabod");
  const fjoldiEl = document.getElementById("fjoldi-skilabod");

  if (listi.length === 0) {
    grindEl.hidden = true;
    tomtEl.hidden = false;
    fjoldiEl.textContent = "";
  } else {
    grindEl.hidden = false;
    tomtEl.hidden = true;
    fjoldiEl.textContent = `${listi.length} af ${gogn.bilar.length} gerðum`;
    grindEl.innerHTML = listi.map((gerd) => spjaldHtml(gerd)).join("");
  }
}

function gildiFra(id) {
  return document.getElementById(id).value.trim();
}

function spjaldHtml(gerd) {
  const orkugjafar = [...new Set(gerd.utfaerslur.map((u) => u.orkugjafi))];
  const einhverStyrkhaef = gerd.utfaerslur.some((u) => u.styrkhaef);

  const merki = [
    `<span class="merki-badge">${flokkurHeiti(gerd.flokkur)}</span>`,
    ...orkugjafar.map((o) => `<span class="merki-badge orka">${orkugjafiHeiti(o)}</span>`),
  ].join("");

  return `
    <a class="spjald" href="gerd.html?id=${encodeURIComponent(gerd.id)}">
      <h2>${gerd.merki} ${gerd.gerd}</h2>
      <div class="undirtitill">Árgerð ${gerd.arsgerd}</div>
      <div class="merkjahopur">${merki}</div>
      <div class="verd">Verð frá ${kronur(gerd.verd_fra)}</div>
      ${einhverStyrkhaef ? `<div class="verd-styrkur">Frá ${kronur(gerd.verd_med_styrk_fra)} eftir rafbílastyrk*</div>` : ""}
    </a>
  `;
}
