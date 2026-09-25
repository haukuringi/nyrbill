import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SamanburdurClient } from "@/components/samanburdur-client";
import { saekjaBila, saekjaStillingar, utfaerslaUppfletting } from "@/lib/gogn";

export default function SamanburdurSida() {
  const bilar = saekjaBila();
  const stillingar = saekjaStillingar();
  const uppfletting = Object.fromEntries(utfaerslaUppfletting(bilar));

  return (
    <>
      <SiteHeader baklink />
      <main className="mx-auto max-w-5xl px-4 py-5">
        <Suspense>
          <SamanburdurClient uppfletting={uppfletting} stillingar={stillingar} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
