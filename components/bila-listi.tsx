"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BillCard } from "@/components/bill-card";
import { StyrkurSkyring } from "@/components/styrkur-skyring";
import { flokkurHeiti, orkugjafiHeiti, drifHeiti } from "@/lib/heiti";
import { SIAN_SJALFGEFID, type Sian, type Rodun } from "@/lib/sigta";
import type { Gerd, Umbod, Stillingar } from "@/lib/types";

const RODUN_HEITI: Record<Rodun, string> = {
  "verd-haekkandi": "Verð – lægst fyrst",
  "verd-laekkandi": "Verð – hæst fyrst",
  draegni: "Drægni – mest fyrst",
  nafn: "Nafn (A–Ö)",
};

// Síurnar búa í slóðinni (?leit=&merki=&…) – sama hugsun og á samanburðarsíðunni –
// svo sigtaður/raðaður listi sé alltaf deilanlegur með tengli. Textareitir eru
// aðeins uppfærðir í slóðinni með smá seinkun (debounce) svo innsláttur verði
// ekki hikstandi, en val-reitir uppfæra samstundis.
export function BilaListi({
  allirBilar,
  sigtadirBilar,
  umbod,
  stillingar,
  sian,
}: {
  allirBilar: Gerd[];
  sigtadirBilar: Gerd[];
  umbod: Umbod[];
  stillingar: Stillingar;
  sian: Sian;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [staedi, setStaedi] = useState<Sian>(sian);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setStaedi(sian), [sian]);

  function uppfaeraSlod(ny: Sian) {
    const p = new URLSearchParams();
    if (ny.leit) p.set("leit", ny.leit);
    if (ny.merki) p.set("merki", ny.merki);
    if (ny.umbod) p.set("umbod", ny.umbod);
    if (ny.flokkur) p.set("flokkur", ny.flokkur);
    if (ny.orkugjafi) p.set("orkugjafi", ny.orkugjafi);
    if (ny.drif) p.set("drif", ny.drif);
    if (ny.saeti) p.set("saeti", ny.saeti);
    if (ny.verdFra) p.set("verdFra", ny.verdFra);
    if (ny.verdTil) p.set("verdTil", ny.verdTil);
    if (ny.draegniMin) p.set("draegniMin", ny.draegniMin);
    if (ny.eftirStyrk) p.set("eftirStyrk", "1");
    if (ny.rodun !== SIAN_SJALFGEFID.rodun) p.set("rodun", ny.rodun);
    const slod = p.size > 0 ? `${pathname}?${p}` : pathname;
    router.replace(slod, { scroll: false });
  }

  function samstundis(nyStaedi: Sian) {
    setStaedi(nyStaedi);
    uppfaeraSlod(nyStaedi);
  }

  function medSeinkun(nyStaedi: Sian) {
    setStaedi(nyStaedi);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => uppfaeraSlod(nyStaedi), 300);
  }

  const merkiListi = useMemo(() => [...new Set(allirBilar.map((g) => g.merki))].sort(), [allirBilar]);
  const flokkarListi = useMemo(() => [...new Set(allirBilar.map((g) => g.flokkur))].sort(), [allirBilar]);
  const orkugjafarListi = useMemo(
    () => [...new Set(allirBilar.flatMap((g) => g.utfaerslur.map((u) => u.orkugjafi)))].sort(),
    [allirBilar],
  );
  const drifListi = useMemo(
    () => [...new Set(allirBilar.flatMap((g) => g.utfaerslur.map((u) => u.drif)))].sort(),
    [allirBilar],
  );
  const saetiListi = useMemo(
    () =>
      [
        ...new Set(allirBilar.flatMap((g) => g.utfaerslur.map((u) => u.saeti)).filter((s): s is number => s != null)),
      ].sort((a, b) => a - b),
    [allirBilar],
  );

  const einhverStyrkhaef = allirBilar.some((g) => g.utfaerslur.some((u) => u.styrkhaef));

  return (
    <>
      <div className="mb-4 rounded-xl border border-border bg-muted/60 p-3.5">
        <div className="mb-2.5 flex flex-wrap gap-2.5">
          <Input
            value={staedi.leit}
            onChange={(e) => medSeinkun({ ...staedi, leit: e.target.value })}
            placeholder="Leita eftir merki eða gerð…"
            className="min-w-[220px] flex-1 bg-card"
          />
          <Select value={staedi.rodun} onValueChange={(v) => samstundis({ ...staedi, rodun: v as Rodun })}>
            <SelectTrigger className="w-[190px] bg-card"><SelectValue>{RODUN_HEITI[staedi.rodun]}</SelectValue></SelectTrigger>
            <SelectContent>
              {Object.entries(RODUN_HEITI).map(([v, texti]) => (
                <SelectItem key={v} value={v}>
                  {texti}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-2.5 flex flex-wrap gap-2">
          <Velja
            gildi={staedi.merki}
            setja={(v) => samstundis({ ...staedi, merki: v })}
            sjalfgefid="Öll merki"
            valkostir={merkiListi.map((v) => [v, v])}
          />
          <Velja
            gildi={staedi.umbod}
            setja={(v) => samstundis({ ...staedi, umbod: v })}
            sjalfgefid="Öll umboð"
            valkostir={umbod.map((u) => [u.id, u.nafn])}
          />
          <Velja
            gildi={staedi.flokkur}
            setja={(v) => samstundis({ ...staedi, flokkur: v })}
            sjalfgefid="Allir flokkar"
            valkostir={flokkarListi.map((v) => [v, flokkurHeiti(v)])}
          />
          <Velja
            gildi={staedi.orkugjafi}
            setja={(v) => samstundis({ ...staedi, orkugjafi: v })}
            sjalfgefid="Allir orkugjafar"
            valkostir={orkugjafarListi.map((v) => [v, orkugjafiHeiti(v)])}
          />
          <Velja
            gildi={staedi.drif}
            setja={(v) => samstundis({ ...staedi, drif: v })}
            sjalfgefid="Öll drif"
            valkostir={drifListi.map((v) => [v, drifHeiti(v)])}
          />
          <Velja
            gildi={staedi.saeti}
            setja={(v) => samstundis({ ...staedi, saeti: v })}
            sjalfgefid="Allur sætafjöldi"
            valkostir={saetiListi.map((v) => [String(v), `${v} sæti`])}
          />
          <Input
            value={staedi.verdFra}
            onChange={(e) => medSeinkun({ ...staedi, verdFra: e.target.value })}
            type="number"
            placeholder="Verð frá (kr.)"
            className="w-[140px] bg-card text-sm"
          />
          <Input
            value={staedi.verdTil}
            onChange={(e) => medSeinkun({ ...staedi, verdTil: e.target.value })}
            type="number"
            placeholder="Verð til (kr.)"
            className="w-[140px] bg-card text-sm"
          />
          <Input
            value={staedi.draegniMin}
            onChange={(e) => medSeinkun({ ...staedi, draegniMin: e.target.value })}
            type="number"
            placeholder="Lágm. drægni (km)"
            className="w-[168px] bg-card text-sm"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => samstundis(SIAN_SJALFGEFID)}>
            Núllstilla síur
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={staedi.eftirStyrk}
            onChange={(e) => samstundis({ ...staedi, eftirStyrk: e.target.checked })}
            className="h-3.5 w-3.5 accent-primary"
          />
          Sýna verð eftir rafbílastyrk (breytir röðun og verðbili)
        </label>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {sigtadirBilar.length} af {allirBilar.length} gerðum
      </p>

      {sigtadirBilar.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          Engir bílar fundust sem passa við valdar síur.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {sigtadirBilar.map((gerd) => (
            <BillCard key={gerd.id} gerd={gerd} />
          ))}
        </div>
      )}

      {einhverStyrkhaef && (
        <div className="mt-4">
          <StyrkurSkyring stillingar={stillingar} />
        </div>
      )}
    </>
  );
}

function Velja({
  gildi,
  setja,
  sjalfgefid,
  valkostir,
}: {
  gildi: string;
  setja: (v: string) => void;
  sjalfgefid: string;
  valkostir: [string, string][];
}) {
  const ALLT = "allt";
  const heiti = valkostir.find(([v]) => v === gildi)?.[1] ?? sjalfgefid;
  return (
    <Select value={gildi || ALLT} onValueChange={(v) => setja(!v || v === ALLT ? "" : v)}>
      <SelectTrigger className="w-auto bg-card text-sm"><SelectValue>{heiti}</SelectValue></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALLT}>{sjalfgefid}</SelectItem>
        {valkostir.map(([v, texti]) => (
          <SelectItem key={v} value={v}>
            {texti}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
