import { dagsetning } from "@/lib/snid";

export function SiteFooter({ sidastUppfaert }: { sidastUppfaert?: string | null }) {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <footer className="mt-8 border-t border-border pt-4 pb-28 text-sm text-muted-foreground">
        <p>Verð eru birt án ábyrgðar og geta hafa breyst. Staðfestið alltaf verð hjá umboði.</p>
        {sidastUppfaert && <p>Gögn síðast uppfærð {dagsetning(sidastUppfaert)}.</p>}
      </footer>
    </div>
  );
}
