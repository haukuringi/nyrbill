"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useKarfa, KARFA_HAMARK } from "@/lib/karfa";
import { kronur, kwh, km, litrar, hestofl, saeti, farangur, sekundur, dagsetning } from "@/lib/snid";
import { orkugjafiHeiti, drifHeiti } from "@/lib/heiti";
import { StyrkurSkyring } from "@/components/styrkur-skyring";
import type { Gerd, Utfaersla, Stillingar } from "@/lib/types";

type Kort = { gerd: Gerd; utfaersla: Utfaersla };

interface Reitur {
  titill: string;
  stefna?: "min" | "max";
  gildi?: (u: Utfaersla) => number | null;
  birta: (u: Utfaersla) => string;
}

const REITIR: Reitur[] = [
  { titill: "Verð", stefna: "min", gildi: (u) => u.verd, birta: (u) => kronur(u.verd) },
  {
    titill: "Verð eftir rafbílastyrk*",
    stefna: "min",
    gildi: (u) => (u.styrkhaef ? u.verd_med_styrk : null),
    birta: (u) => (u.styrkhaef ? kronur(u.verd_med_styrk) : "–"),
  },
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

function bestuVisitolur(kort: Kort[], reitur: Reitur): Set<number> {
  if (!reitur.stefna || !reitur.gildi || kort.length < 2) return new Set();
  const gildi = kort.map((k) => reitur.gildi!(k.utfaersla));
  const tilHofst = gildi.filter((g): g is number => g != null);
  if (tilHofst.length === 0) return new Set();
  const best = reitur.stefna === "min" ? Math.min(...tilHofst) : Math.max(...tilHofst);
  const visitolur = new Set<number>();
  gildi.forEach((g, i) => {
    if (g === best) visitolur.add(i);
  });
  return visitolur;
}

export function SamanburdurClient({
  uppfletting,
  stillingar,
}: {
  uppfletting: Record<string, Kort>;
  stillingar: Stillingar;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { idListi: karfaIdListi, stilla, fjarlaegja: karfaFjarlaegja } = useKarfa();

  const idListiUrSlod = useMemo(() => {
    const hra = searchParams.get("ids") ?? "";
    return [...new Set(hra.split(",").map((s) => s.trim()).filter(Boolean))]
      .filter((id) => uppfletting[id])
      .slice(0, KARFA_HAMARK);
  }, [searchParams, uppfletting]);

  useEffect(() => {
    if (JSON.stringify(karfaIdListi) !== JSON.stringify(idListiUrSlod)) {
      stilla(idListiUrSlod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idListiUrSlod]);

  function fjarlaegja(id: string) {
    const nyListi = idListiUrSlod.filter((x) => x !== id);
    karfaFjarlaegja(id);
    router.replace(nyListi.length > 0 ? `/samanburdur?ids=${nyListi.join(",")}` : "/samanburdur", { scroll: false });
  }

  const kort = idListiUrSlod.map((id) => uppfletting[id]);

  if (kort.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
        Engar útfærslur valdar. Farðu á{" "}
        <Link href="/" className="text-primary hover:underline">
          bílalistann
        </Link>{" "}
        og smelltu á &ldquo;Bæta í samanburð&rdquo;.
      </p>
    );
  }

  const reitanBestun = REITIR.map((reitur) => bestuVisitolur(kort, reitur));
  const nyjast = kort.reduce<string | null>(
    (n, k) => (!n || k.utfaersla.uppfaert > n ? k.utfaersla.uppfaert : n),
    null,
  );

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {kort.length} af allt að {KARFA_HAMARK} útfærslum í samanburði
      </p>
      <div
        className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-[repeat(var(--fjoldi),minmax(0,1fr))]"
        style={{ "--fjoldi": kort.length } as React.CSSProperties}
      >
        {kort.map((k, i) => (
            <div key={k.utfaersla.id} className="rounded-2xl border border-border bg-card p-4 shadow-lg">
              <h3 className="text-lg font-extrabold tracking-tight">
                {k.gerd.merki} {k.gerd.gerd}
              </h3>
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                {k.utfaersla.heiti}
                <button
                  type="button"
                  onClick={() => fjarlaegja(k.utfaersla.id)}
                  className="rounded-md border border-primary bg-secondary px-2.5 py-1 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                >
                  Fjarlægja
                </button>
              </div>
              <dl className="text-sm">
                {REITIR.map((reitur, r) => {
                  const best = reitanBestun[r].has(i);
                  return (
                    <div key={reitur.titill}>
                      <dt className="mt-2.5 text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">
                        {reitur.titill}
                      </dt>
                      <dd
                        className={
                          best
                            ? "mt-0.5 inline-flex items-center gap-1 rounded-md bg-success px-2 py-0.5 font-bold text-success-foreground"
                            : ""
                        }
                      >
                        {best && "✓ "}
                        {reitur.birta(k.utfaersla)}
                      </dd>
                    </div>
                  );
                })}
                <div>
                  <dt className="mt-2.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Heimild
                  </dt>
                  <dd>
                    <a href={k.utfaersla.heimild} target="_blank" rel="noopener" className="text-primary hover:underline">
                      Verðlisti
                    </a>{" "}
                    · {dagsetning(k.utfaersla.uppfaert)}
                  </dd>
                </div>
              </dl>
            </div>
        ))}
      </div>
      <StyrkurSkyring stillingar={stillingar} />
      {nyjast && <p className="mt-3 text-sm text-muted-foreground">Gögn síðast uppfærð {dagsetning(nyjast)}.</p>}
    </>
  );
}
