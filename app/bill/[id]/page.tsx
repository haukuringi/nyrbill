import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SpecTable } from "@/components/spec-table";
import { StyrkurSkyring } from "@/components/styrkur-skyring";
import { saekjaBila, saekjaUmbod, saekjaStillingar } from "@/lib/gogn";
import { flokkurHeiti } from "@/lib/heiti";

export async function generateStaticParams() {
  return saekjaBila().map((g) => ({ id: g.id }));
}

export default async function BillSida({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gerd = saekjaBila().find((g) => g.id === id);

  if (!gerd) {
    return (
      <>
        <SiteHeader baklink />
        <main className="mx-auto max-w-5xl px-4 py-5">
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            Þessi gerð fannst ekki.{" "}
            <Link href="/" className="underline">
              Til baka í bílalista
            </Link>
            .
          </p>
        </main>
      </>
    );
  }

  const umbodListi = saekjaUmbod();
  const stillingar = saekjaStillingar();
  const umbod = umbodListi.find((u) => u.id === gerd.umbod);
  const einhverStyrkhaef = gerd.utfaerslur.some((u) => u.styrkhaef);

  return (
    <>
      <SiteHeader baklink />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {gerd.merki} {gerd.gerd}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {flokkurHeiti(gerd.flokkur)} · Árgerð {gerd.arsgerd}
          {umbod && (
            <>
              {" "}· Umboð:{" "}
              <a href={umbod.vefsida} target="_blank" rel="noopener" className="text-primary hover:underline">
                {umbod.nafn}
              </a>
            </>
          )}
        </p>

        <div className="mb-4">
          <SpecTable gerd={gerd} />
        </div>

        {einhverStyrkhaef && <StyrkurSkyring stillingar={stillingar} />}
      </main>
      <SiteFooter sidastUppfaert={gerd.uppfaert} />
    </>
  );
}
