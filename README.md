# Nýrbíll.is

**Lifandi frumgerð:** <https://haukuringi.github.io/nyrbill/> (GitHub Pages –
uppfærist sjálfkrafa við hvert `git push`).

Vefsíða sem sýnir nýja bíla á söluskrá á Íslandi, með verðlistum og samanburði.
Hrein HTML/CSS/JavaScript – engin bygging, engin gagnagrunnur, engin bakendi.
Gögnin koma úr `bilagogn.xlsx` og eru breytt í JSON-skrár sem síðan sækir.

## Uppbygging verkefnisins

```
bilagogn.xlsx           Töflureiknirinn þar sem þú skráir bílana
scripts/
  xlsx_i_json.py         Breytir bilagogn.xlsx í JSON
  uppfaera.sh             Ein skipun sem keyrir forritið fyrir þig
data/
  bilar.json, umbod.json, stillingar.json   (búið til – ekki breyta í hendi)
index.html                Bílalisti með leit, síum og röðun
gerd.html                  Ein gerð: tafla með öllum útfærslum
samanburdur.html            Samanburður á allt að 4 útfærslum
css/stil.css                Allt útlit
js/                          Virkni síðunnar (sjá lýsingu neðar)
```

`js/`-skrárnar:
- `gogn.js` – sækir JSON-gögnin
- `snid.js` – íslenskt tölu- og dagsetningarsnið
- `heiti.js` – varpar gagnagildum (t.d. `jepplingur`) í fallegt heiti (`Jepplingur`)
- `karfa.js` – samanburðar­"karfan" (localStorage) og sjáanlega boxið neðst
- `listi.js`, `gerd.js`, `samanburdur.js` – virkni hverrar síðu

## Að uppfæra gögnin

1. Opnaðu `bilagogn.xlsx` (Excel, Numbers eða Google Sheets) og bættu við/breyttu
   línum í `Útfærslur`-flipanum. Ein lína = ein útfærsla af einni gerð.
   Vistaðu skrána með sama nafni og á sama stað (rótin á verkefninu).
2. Keyrðu í flugstöðinni (terminal), í `bilavefur`-möppunni:

   ```bash
   ./scripts/uppfaera.sh
   ```

   Þetta les `bilagogn.xlsx` og skrifar nýjar `data/*.json` skrár. Finnist
   villur (t.d. vöntandi reit eða ógilt gildi) eru **engar skrár skrifaðar** –
   leiðréttu skrána og keyrðu aftur.
3. Skoðaðu síðuna (næsti hluti) til að athuga að nýju bílarnir birtist rétt.

## Að skoða síðuna hjá þér

Vafrar leyfa ekki `fetch()` á skrár beint af diski, svo þú þarft örlítinn
vefþjón – Python fylgir með á Mac, engin uppsetning þarf:

```bash
cd ~/bilavefur
python3 -m http.server 8000
```

Opnaðu síðan <http://localhost:8000> í vafranum.

**Ábending:** Vafrar geta skyndiminnst (cachað) gamla útgáfu af síðunni.
Sjáist ekki nýjustu breytingarnar, endurlestu síðuna með „hard refresh"
(Cmd+Shift+R á Mac) eða opnaðu í nýjum flipa.

## Að setja síðuna í loftið á Vercel (frítt)

Síðan þarf ekkert Node.js eða byggingarskref – Vercel þarf bara að vista og
bjóða upp á skrárnar eins og þær eru. Einfaldasta leiðin er í gegnum GitHub:

1. **Búa til GitHub-safn (repository):**
   - Farðu á [github.com/new](https://github.com/new) og búðu til nýtt,
     tómt safn (t.d. `bilavefur`). Ekki hafa hak við „Add a README" – það er
     þegar til hjá þér.
2. **Senda verkefnið þangað** (keyrt einu sinni, í `bilavefur`-möppunni):

   ```bash
   git add -A
   git commit -m "Fyrsta útgáfa af bílavefnum"
   git remote add origin <slóðin sem GitHub gaf þér>
   git branch -M main
   git push -u origin main
   ```
3. **Tengja við Vercel:**
   - Farðu á [vercel.com](https://vercel.com), skráðu þig inn með GitHub.
   - Smelltu á „Add New… → Project" og veldu `bilavefur`-safnið.
   - Undir „Framework Preset" veldu **Other** (engin bygging þarf).
   - Skildu „Build Command" og „Output Directory" eftir auð/sjálfgefin.
   - Smelltu á **Deploy**.
4. Í hvert sinn sem þú vilt uppfæra vefinn (t.d. eftir að hafa keyrt
   `./scripts/uppfaera.sh` með nýjum bílum):

   ```bash
   git add -A
   git commit -m "Uppfæri bílagögn"
   git push
   ```

   Vercel byggir og uppfærir síðuna sjálfkrafa á nokkrum sekúndum.

## Að tengja lénið nyrbill.is

Þegar verkefnið er komið í loftið á Vercel (skref hér að ofan):

1. Í Vercel-verkefninu, farðu í **Settings → Domains**.
2. Skráðu `nyrbill.is` (og `www.nyrbill.is` ef þú vilt bæði) og smelltu **Add**.
3. Vercel sýnir þér DNS-færslur sem þarf að setja hjá lénaskránni þinni
   (þar sem þú keyptir `nyrbill.is`) – venjulega eina `A`-færslu fyrir
   rótarlénið og eina `CNAME`-færslu fyrir `www`. Farðu inn á stjórnborðið
   hjá lénaskránni og settu þær inn eins og Vercel sýnir.
4. Þetta getur tekið nokkrar mínútur til klukkustund að virka (DNS-dreifing).
   Vercel gefur síðunni sjálfkrafa HTTPS-vottorð þegar lénið er staðfest.

## Um rafbílastyrkinn

Upphæð styrksins og verðþakið koma úr `Stillingar`-flipanum í
`bilagogn.xlsx` (sjá `data/stillingar.json`) – þessar tölur eru **hvergi
harðkóðaðar** í kóðanum. Styrkurinn er alltaf birtur sem aukaupplýsing við
hlið listaverðsins, enda er hann ekki dreginn frá við kaup heldur greiddur
út eftir á. Rofinn „Sýna verð eftir rafbílastyrk" á bílalistanum breytir því
hvaða verð er notað til að **raða og sía** listann – kortin sjálf sýna
alltaf báðar upphæðirnar.
