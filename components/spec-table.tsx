"use client";

import { useKarfa, KARFA_HAMARK } from "@/lib/karfa";
import { kronur, kwh, km, litrar, hestofl, saeti, farangur, sekundur, dagsetning } from "@/lib/snid";
import { orkugjafiHeiti, drifHeiti } from "@/lib/heiti";
import { Button } from "@/components/ui/button";
import type { Gerd } from "@/lib/types";

export function SpecTable({ gerd }: { gerd: Gerd }) {
  const { idListi, baeta, fjarlaegja, hefur } = useKarfa();
  const einhverStyrkhaef = gerd.utfaerslur.some((u) => u.styrkhaef);
  const fullur = idListi.length >= KARFA_HAMARK;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-lg">
      <table className="w-full whitespace-nowrap text-sm">
        <thead>
          <tr>
            {[
              "Útfærsla",
              "Verð",
              einhverStyrkhaef ? "Eftir rafbílastyrk*" : null,
              "Orkugjafi",
              "Drif",
              "Hestöfl",
              "Rafhlaða",
              "Drægni",
              "Eyðsla",
              "Sæti",
              "Farangur",
              "Hröðun 0–100",
              "Heimild",
              "",
            ]
              .filter((x): x is string => x !== null)
              .map((h) => (
                <th
                  key={h}
                  className="border-b border-border bg-[#18181b] px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wide text-white"
                >
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {gerd.utfaerslur.map((u) => {
            const valid = hefur(u.id);
            return (
              <tr key={u.id} className="[&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0">
                <td className="px-3.5 py-2.5">{u.heiti}</td>
                <td className="px-3.5 py-2.5">{kronur(u.verd)}</td>
                {einhverStyrkhaef && (
                  <td className="px-3.5 py-2.5">{u.styrkhaef ? kronur(u.verd_med_styrk) : "–"}</td>
                )}
                <td className="px-3.5 py-2.5">{orkugjafiHeiti(u.orkugjafi)}</td>
                <td className="px-3.5 py-2.5">{drifHeiti(u.drif)}</td>
                <td className="px-3.5 py-2.5">{hestofl(u.hestofl)}</td>
                <td className="px-3.5 py-2.5">{kwh(u.rafhlada_kwh)}</td>
                <td className="px-3.5 py-2.5">{km(u.draegni_km)}</td>
                <td className="px-3.5 py-2.5">{litrar(u.eydsla_l_100km)}</td>
                <td className="px-3.5 py-2.5">{saeti(u.saeti)}</td>
                <td className="px-3.5 py-2.5">{farangur(u.farangursrymi_l)}</td>
                <td className="px-3.5 py-2.5">{sekundur(u.hrodun_0_100_s)}</td>
                <td className="px-3.5 py-2.5">
                  <a href={u.heimild} target="_blank" rel="noopener" className="text-primary hover:underline">
                    Verðlisti
                  </a>
                  <div className="text-xs text-muted-foreground">{dagsetning(u.uppfaert)}</div>
                </td>
                <td className="px-3.5 py-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={valid ? "default" : "outline"}
                    disabled={!valid && fullur}
                    onClick={() => (valid ? fjarlaegja(u.id) : baeta(u.id))}
                  >
                    {valid ? "Í samanburði ✓" : "Bæta í samanburð"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
