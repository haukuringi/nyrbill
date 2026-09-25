import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BilaListi } from "@/components/bila-listi";
import { saekjaBila, saekjaUmbod, saekjaStillingar } from "@/lib/gogn";
import { sianUrSlod, sigtaOgRadaBila } from "@/lib/sigta";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sian = sianUrSlod(sp);

  const bilar = saekjaBila();
  const umbod = saekjaUmbod();
  const stillingar = saekjaStillingar();
  const sigtad = sigtaOgRadaBila(bilar, sian);

  const nyjastaUppfaert = bilar.reduce<string | null>(
    (n, g) => (!n || g.uppfaert > n ? g.uppfaert : n),
    null,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <BilaListi allirBilar={bilar} sigtadirBilar={sigtad} umbod={umbod} stillingar={stillingar} sian={sian} />
      </main>
      <SiteFooter sidastUppfaert={nyjastaUppfaert} />
    </>
  );
}
