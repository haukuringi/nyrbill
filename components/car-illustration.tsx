// Almenn, ómerkt sýnishorn-teikning (EKKI mynd af neinum tilteknum bíl) –
// notuð til að prófa hvernig útlitið yrði með myndum á spjöldunum, án þess
// að nota höfundarréttarvarðar ljósmyndir framleiðanda/umboðs. Fjarlægðu
// þessa einingu (og notkun hennar í bill-card.tsx) þegar/ef alvöru,
// leyfðar myndir koma í staðinn.

type Snid = "sedan" | "jeppi" | "van" | "pallbill";

const SNID_EFTIR_FLOKKI: Record<string, Snid> = {
  folksbill: "sedan",
  skutbill: "sedan",
  smabill: "sedan",
  sportbill: "sedan",
  jepplingur: "jeppi",
  jeppi: "jeppi",
  fjolnotabill: "van",
  sendibill: "van",
  pallbill: "pallbill",
};

export function CarIllustration({ flokkur, className }: { flokkur: string; className?: string }) {
  const snid = SNID_EFTIR_FLOKKI[flokkur] ?? "sedan";

  return (
    <div className={`relative overflow-hidden bg-muted ${className ?? ""}`}>
      <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden>
        {snid === "sedan" && (
          <g fill="none">
            <rect x="20" y="65" width="200" height="30" rx="8" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="60,65 85,35 155,35 180,65" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="75,60 92,42 148,42 165,60" fill="var(--card)" opacity="0.6" />
            <circle cx="68" cy="95" r="17" fill="var(--foreground)" opacity="0.25" />
            <circle cx="172" cy="95" r="17" fill="var(--foreground)" opacity="0.25" />
          </g>
        )}
        {snid === "jeppi" && (
          <g fill="none">
            <rect x="15" y="55" width="210" height="40" rx="6" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="55,55 75,26 165,26 185,55" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="68,50 82,33 158,33 172,50" fill="var(--card)" opacity="0.6" />
            <circle cx="65" cy="96" r="18" fill="var(--foreground)" opacity="0.25" />
            <circle cx="175" cy="96" r="18" fill="var(--foreground)" opacity="0.25" />
          </g>
        )}
        {snid === "van" && (
          <g fill="none">
            <rect x="15" y="30" width="210" height="65" rx="10" fill="var(--muted-foreground)" opacity="0.35" />
            <rect x="30" y="42" width="180" height="25" rx="6" fill="var(--card)" opacity="0.6" />
            <circle cx="65" cy="96" r="18" fill="var(--foreground)" opacity="0.25" />
            <circle cx="175" cy="96" r="18" fill="var(--foreground)" opacity="0.25" />
          </g>
        )}
        {snid === "pallbill" && (
          <g fill="none">
            <rect x="20" y="55" width="90" height="40" rx="6" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="40,55 55,30 95,30 110,55" fill="var(--muted-foreground)" opacity="0.35" />
            <polygon points="48,50 58,36 92,36 102,50" fill="var(--card)" opacity="0.6" />
            <rect x="110" y="65" width="110" height="30" rx="4" fill="var(--muted-foreground)" opacity="0.35" />
            <circle cx="60" cy="96" r="17" fill="var(--foreground)" opacity="0.25" />
            <circle cx="185" cy="96" r="17" fill="var(--foreground)" opacity="0.25" />
          </g>
        )}
      </svg>
      <span className="absolute bottom-1.5 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[0.6rem] font-medium text-white">
        Sýnishorn – ekki alvöru mynd
      </span>
    </div>
  );
}
