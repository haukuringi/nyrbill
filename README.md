# Nýrbíll.is

**Lifandi síða:** <https://nyrbill.vercel.app> (Vercel – byggir og uppfærir
sjálfkrafa við hvert `git push` á `main`).

Vefsíða sem sýnir nýja bíla á söluskrá á Íslandi, með verðlistum og
samanburði. Byggð í Next.js + Tailwind CSS + shadcn/ui. Gögnin koma úr
`bilagogn.xlsx` og eru breytt í JSON-skrár sem síðan les.

> Fyrsta útgáfa af þessari síðu var hrein HTML/CSS/JavaScript (engin
> bygging). Hún var endurbyggð í Next.js til að nýta tilbúnar shadcn/21st.dev
> einingar og fá alvöru vefþjón (t.d. fyrir síur sem keyra á vefþjóninum).
> Gagnaleiðslan (`bilagogn.xlsx` → JSON) er nákvæmlega sú sama og áður.

## Uppbygging verkefnisins

```
bilagogn.xlsx           Töflureiknirinn þar sem þú skráir bílana
scripts/
  xlsx_i_json.py         Breytir bilagogn.xlsx í JSON
  uppfaera.sh             Ein skipun sem keyrir forritið fyrir þig
data/
  bilar.json, umbod.json, stillingar.json   (búið til – ekki breyta í hendi)
app/
  page.tsx                 Bílalisti (síður/röðun keyra á vefþjóninum)
  bill/[id]/page.tsx        Ein gerð: tafla með öllum útfærslum
  samanburdur/page.tsx      Samanburður á allt að 4 útfærslum
  layout.tsx, globals.css   Grunnsíða, letur, litaþema
components/               React-einingar (bílaspjöld, tafla, síur o.s.frv.)
lib/                       Gagnalestur, tölusnið, íslensk heiti, samanburðar-karfa
```

`lib/`-skrárnar:
- `gogn.ts` – les JSON-gögnin af diski (á vefþjóninum)
- `snid.ts` – íslenskt tölu- og dagsetningarsnið (handskrifað, ekki `Intl`)
- `heiti.ts` – varpar gagnagildum (t.d. `jepplingur`) í fallegt heiti (`Jepplingur`)
- `karfa.ts` – samanburðar­"karfan" (localStorage), notuð af `CompareBar`-einingunni
- `sigta.ts` – sömu síu/röðunar-reglur og bílalistinn og samanburðurinn nota

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
4. Sendu breytinguna upp svo lifandi síðan uppfærist (sjá „Að setja
   breytingar í loftið" hér að neðan).

## Að skoða síðuna hjá þér

Þarf Node.js (t.d. frá [nodejs.org](https://nodejs.org)). Í fyrsta skipti:

```bash
cd ~/bilavefur
npm install
```

Til að keyra síðuna:

```bash
npm run dev
```

Opnaðu síðan <http://localhost:3000> í vafranum. Breytingar á kóða birtast
sjálfkrafa (hot reload); breytingar á `bilagogn.xlsx` þarf að keyra
`./scripts/uppfaera.sh` fyrir og endurlesa síðuna.

## Að setja breytingar í loftið

Verkefnið er tengt við Vercel í gegnum GitHub – það er nóg að senda
breytingar upp á `main`:

```bash
git add -A
git commit -m "Uppfæri bílagögn"
git push
```

Vercel byggir og uppfærir <https://nyrbill.vercel.app> sjálfkrafa á
u.þ.b. 30–60 sekúndum. Framvindu má fylgjast með á
[vercel.com/dashboard](https://vercel.com/dashboard) (Deployments-flipinn).

### Ef þú þarft að tengja verkefnið við Vercel aftur (t.d. í nýjum aðgangi)

1. Farðu á [vercel.com/new](https://vercel.com/new), skráðu þig inn með GitHub.
2. Veldu „GitHub" undir „Import Git Repository" og leyfðu aðgang að
   `nyrbill`-safninu (GitHub gæti beðið um tölvupóst-staðfestingu í fyrsta
   sinn).
3. Smelltu á **Import** við `nyrbill`, síðan **Deploy** — Vercel finnur
   sjálfkrafa út að þetta er Next.js-verkefni, engar stillingar þarf.

## Að tengja lénið nyrbill.is

1. Í Vercel-verkefninu, farðu í **Settings → Domains**.
2. Skráðu `nyrbill.is` (og `www.nyrbill.is` ef þú vilt bæði) og smelltu **Add**.
3. Vercel sýnir þér DNS-færslur sem þarf að setja hjá lénaskránni þinni
   (þar sem þú keyptir `nyrbill.is`) – venjulega eina `A`-færslu fyrir
   rótarlénið og eina `CNAME`-færslu fyrir `www`. Farðu inn á stjórnborðið
   hjá lénaskránni og settu þær inn eins og Vercel sýnir.
4. Þetta getur tekið nokkrar mínútur til klukkustund að virka (DNS-dreifing).
   Vercel gefur síðunni sjálfkrafa HTTPS-vottorð þegar lénið er staðfest.

## Að breyta útlitinu

Litir, leturgerð og skuggar eru skilgreind sem CSS-breytur í
`app/globals.css` (t.d. `--primary`, `--hero-from`/`--hero-to` fyrir
hetju-borðann, `--success` fyrir rafbílastyrks-litinn). shadcn/ui-einingarnar
sjálfar liggja í `components/ui/` og eru annars ósnertar.

## Um rafbílastyrkinn

Upphæð styrksins og verðþakið koma úr `Stillingar`-flipanum í
`bilagogn.xlsx` (sjá `data/stillingar.json`) – þessar tölur eru **hvergi
harðkóðaðar** í kóðanum. Styrkurinn er alltaf birtur sem aukaupplýsing við
hlið listaverðsins, enda er hann ekki dreginn frá við kaup heldur greiddur
út eftir á. Rofinn „Sýna verð eftir rafbílastyrk" á bílalistanum breytir því
hvaða verð er notað til að **raða og sía** listann – kortin sjálf sýna
alltaf báðar upphæðirnar.
