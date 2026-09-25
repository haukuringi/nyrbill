"use client";

import { useCallback, useEffect, useState } from "react";

// Samanburðar-"karfan": listi af völdum útfærslu-id-um, vistaður í
// localStorage svo hann fylgi milli síðna (hver síða er sjálfstæð route í
// Next.js og endurhleður React-tréð, ólíkt fyrri einnar-síðu-JS-útgáfunni).

const LYKILL = "samanburdur_val";
export const KARFA_HAMARK = 4;
const BREYTING = "karfa-breyttist";

function lesa(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const gildi = JSON.parse(window.localStorage.getItem(LYKILL) ?? "[]");
    return Array.isArray(gildi) ? gildi : [];
  } catch {
    return [];
  }
}

function skrifa(listi: string[]) {
  window.localStorage.setItem(LYKILL, JSON.stringify(listi));
  window.dispatchEvent(new Event(BREYTING));
}

export function useKarfa() {
  const [idListi, setIdListi] = useState<string[]>([]);

  useEffect(() => {
    setIdListi(lesa());
    const uppfaera = () => setIdListi(lesa());
    window.addEventListener(BREYTING, uppfaera);
    window.addEventListener("storage", uppfaera);
    return () => {
      window.removeEventListener(BREYTING, uppfaera);
      window.removeEventListener("storage", uppfaera);
    };
  }, []);

  const baeta = useCallback((id: string) => {
    const listi = lesa();
    if (listi.includes(id) || listi.length >= KARFA_HAMARK) return false;
    skrifa([...listi, id]);
    return true;
  }, []);

  const fjarlaegja = useCallback((id: string) => {
    skrifa(lesa().filter((x) => x !== id));
  }, []);

  const stilla = useCallback((listi: string[]) => {
    skrifa(listi);
  }, []);

  const hefur = useCallback((id: string) => idListi.includes(id), [idListi]);

  return { idListi, baeta, fjarlaegja, stilla, hefur };
}
