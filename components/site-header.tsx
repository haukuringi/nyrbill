import Link from "next/link";

export function SiteHeader({ baklink }: { baklink?: boolean }) {
  return (
    <header
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--hero-from) 0%, var(--hero-via) 55%, var(--hero-to) 100%)",
      }}
    >
      {/* Punktamynstur fyrir áferð */}
      <div
        className="absolute inset-0 opacity-[0.15] motion-safe:animate-[drift_14s_linear_infinite]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      {/* Fljótandi ljósblettir */}
      <div
        className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl motion-safe:animate-[float-a_9s_ease-in-out_infinite]"
        style={{ background: "var(--hero-glow-1)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full opacity-35 blur-3xl motion-safe:animate-[float-b_11s_ease-in-out_infinite]"
        style={{ background: "var(--hero-glow-2)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-1/4 top-1/2 h-40 w-40 rounded-full opacity-25 blur-2xl motion-safe:animate-[float-a_7s_ease-in-out_infinite]"
        style={{ background: "var(--hero-glow-1)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-9">
        {!baklink && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-100 ring-1 ring-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
              <path
                d="M3 13.5 5 8a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5.5M4 13.5h16v3a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-.5H8v.5A1.5 1.5 0 0 1 6.5 18h-1A1.5 1.5 0 0 1 4 16.5v-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.5" cy="13.5" r="1.1" fill="currentColor" />
              <circle cx="16.5" cy="13.5" r="1.1" fill="currentColor" />
            </svg>
            Bílamarkaðurinn á Íslandi
          </div>
        )}
        <h1
          className="text-4xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-6xl"
        >
          <Link href="/">Nýrbíll.is</Link>
        </h1>
        {baklink ? (
          <p className="mt-2 text-sm">
            <Link href="/" className="font-medium text-white/90 underline-offset-4 hover:underline">
              ← Til baka í bílalista
            </Link>
          </p>
        ) : (
          <p className="mt-2 max-w-md text-base font-medium text-rose-100">
            Verðlisti og samanburður á nýjum bílum í boði hjá íslenskum bílaumboðum.
          </p>
        )}
      </div>

      {/* Skásett rönd fyrir kraftmeiri brún */}
      <div
        className="absolute inset-x-0 bottom-0 h-2"
        style={{ background: "linear-gradient(90deg, var(--hero-glow-2), var(--hero-glow-1))" }}
        aria-hidden
      />
    </header>
  );
}
