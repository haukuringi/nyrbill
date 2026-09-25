"use client";

import Link from "next/link";
import { useKarfa } from "@/lib/karfa";

// Sjáanlegt samanburðarbox neðst á öllum síðum. `labels` er id -> birtingarheiti
// fyrir hverja útfærslu, sótt server-side í layout.tsx (þarf ekki eigin fetch).
export function CompareBar({ labels }: { labels: Record<string, string> }) {
  const { idListi, fjarlaegja } = useKarfa();
  const gild = idListi.filter((id) => labels[id]);

  if (gild.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 rounded-t-xl bg-[#101014] px-4 py-3 text-sm text-white shadow-[0_-6px_20px_rgba(0,0,0,0.18)]">
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
        {gild.map((id) => (
          <span
            key={id}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 py-1 pl-3 pr-1"
          >
            {labels[id]}
            <button
              type="button"
              aria-label="Fjarlægja"
              onClick={() => fjarlaegja(id)}
              className="rounded-full px-1.5 py-0.5 leading-none hover:bg-white/20"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Button gild={gild} />
    </div>
  );
}

function Button({ gild }: { gild: string[] }) {
  const disabled = gild.length < 2;
  const href = `/samanburdur?ids=${gild.join(",")}`;
  if (disabled) {
    return (
      <span className="shrink-0 cursor-not-allowed rounded-md bg-white/40 px-4 py-2 font-semibold text-[#101014] opacity-40">
        Bera saman ({gild.length})
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="shrink-0 rounded-md bg-white px-4 py-2 font-semibold text-[#101014] transition-transform hover:-translate-y-0.5"
    >
      Bera saman ({gild.length})
    </Link>
  );
}
