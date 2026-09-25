import { kronur } from "@/lib/snid";
import type { Stillingar } from "@/lib/types";

// Stutt skýring + tengill á island.is, notuð alls staðar sem "verð eftir
// rafbílastyrk" er birt.
export function StyrkurSkyring({ stillingar }: { stillingar: Stillingar }) {
  const { upphaed, verdthak, heimild } = stillingar.rafbilastyrkur;
  return (
    <p className="mb-4 rounded-xl border border-success-border bg-success-muted px-4 py-3 text-sm text-[#0c4a2c]">
      * Rafbílastyrkur ({kronur(upphaed)}) er ekki dreginn frá við kaup heldur
      greiddur eftir á, fyrir bíla sem kosta undir {kronur(verdthak)} —{" "}
      <a href={heimild} target="_blank" rel="noopener" className="text-primary underline">
        nánar á island.is
      </a>
      .
    </p>
  );
}
