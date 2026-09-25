import { Car, CarFront, Van, Truck, type LucideProps } from "lucide-react";

// Almenn tákn eftir flokki bíls (ekki myndir af tilteknum bílum – þau væru
// höfundarréttarvarðar ljósmyndir framleiðanda/umboðs). lucide-react er opið
// (ISC-leyfi) tákna-safn, óháð einstökum vörumerkjum.
const FLOKKUR_TAKN: Record<string, React.ComponentType<LucideProps>> = {
  smabill: Car,
  folksbill: Car,
  skutbill: Car,
  sportbill: Car,
  jepplingur: CarFront,
  jeppi: CarFront,
  fjolnotabill: Van,
  sendibill: Van,
  pallbill: Truck,
};

export function FlokkurIcon({ flokkur, className }: { flokkur: string; className?: string }) {
  const Takn = FLOKKUR_TAKN[flokkur] ?? Car;
  return <Takn className={className} strokeWidth={1.75} />;
}
