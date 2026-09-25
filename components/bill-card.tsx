import Link from "next/link";
import { kronur } from "@/lib/snid";
import { flokkurHeiti, orkugjafiHeiti } from "@/lib/heiti";
import type { Gerd } from "@/lib/types";

export function BillCard({ gerd }: { gerd: Gerd }) {
  const orkugjafar = [...new Set(gerd.utfaerslur.map((u) => u.orkugjafi))];
  const einhverStyrkhaef = gerd.utfaerslur.some((u) => u.styrkhaef);

  return (
    <Link
      href={`/bill/${gerd.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5 opacity-80 transition-opacity group-hover:opacity-100"
        style={{ background: "linear-gradient(180deg, var(--hero-via), var(--hero-glow-2))" }}
        aria-hidden
      />
      <h2 className="text-xl font-extrabold tracking-tight">
        {gerd.merki} {gerd.gerd}
      </h2>
      <div className="mb-3 text-sm font-medium text-muted-foreground">Árgerð {gerd.arsgerd}</div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
          {flokkurHeiti(gerd.flokkur)}
        </span>
        {orkugjafar.map((o) => (
          <span
            key={o}
            className="inline-flex items-center rounded-full bg-success-muted px-2.5 py-0.5 text-xs font-bold text-success"
          >
            {orkugjafiHeiti(o)}
          </span>
        ))}
      </div>
      <div className="text-2xl font-black tracking-tight">{kronur(gerd.verd_fra)}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verð frá</div>
      {einhverStyrkhaef && (
        <div className="mt-2 inline-flex items-center rounded-lg bg-success-muted px-2.5 py-1 text-sm font-bold text-success">
          Frá {kronur(gerd.verd_med_styrk_fra)} eftir styrk*
        </div>
      )}
    </Link>
  );
}
