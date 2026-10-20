"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

// Lokað er munað í vafranum, bundið við textann: nýr texti birtist aftur.
const lykill = (texti: string) => `nyrbill:tilkynning:${texti}`;

export function TilkynningBordi({ texti, slod }: { texti: string; slod: string | null }) {
  const [lokad, setLokad] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLokad(localStorage.getItem(lykill(texti)) === "1");
    } catch {}
  }, [texti]);

  if (lokad) return null;

  return (
    <div role="region" aria-label="Tilkynning" className="border-b border-amber-300 bg-amber-100 text-amber-950">
      <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-2.5 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="flex-1">
          {texti}{" "}
          {slod && (
            <a href={slod} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
              Nánar um breytinguna
            </a>
          )}
        </p>
        <button
          type="button"
          aria-label="Loka tilkynningu"
          className="rounded p-1 hover:bg-amber-200"
          onClick={() => {
            setLokad(true);
            try {
              localStorage.setItem(lykill(texti), "1");
            } catch {}
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
