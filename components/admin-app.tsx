"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseVafri } from "@/lib/supabase";
import { slug } from "@/lib/slug";
import { FLOKKAR, ORKUGJAFAR, DRIF } from "@/lib/heiti";
import { kronur } from "@/lib/snid";

interface UtfRada {
  id: string;
  gerd_id: string;
  heiti: string;
  verd: number;
  orkugjafi: string;
  drif: string;
  hestofl: number | null;
  rafhlada_kwh: number | null;
  draegni_km: number | null;
  eydsla_l_100km: number | null;
  saeti: number | null;
  farangursrymi_l: number | null;
  hrodun_0_100_s: number | null;
  heimild: string;
  uppfaert: string;
}
interface GerdRada {
  id: string;
  merki: string;
  gerd: string;
  umbod_id: string;
  flokkur: string;
  arsgerd: number;
  utfaerslur: UtfRada[];
}
interface UmbodRada {
  id: string;
  nafn: string;
  vefsida: string | null;
}

const reitur =
  "w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
const hnappur =
  "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
const hnappurLitill =
  "rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted";

const tala = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
const idag = () => new Date().toISOString().slice(0, 10);

export function AdminApp() {
  const sb = supabaseVafri();
  const [lota, setLota] = useState<Session | null>(null);
  const [hladid, setHladid] = useState(false);
  const [pruf, setPruf] = useState<{ id: string; admin: boolean; umbod: string | null } | null>(null);
  const stada = lota && pruf?.id === lota.user.id ? pruf : null;
  const erAdmin = stada ? stada.admin : null;

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setLota(data.session);
      setHladid(true);
    });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setLota(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  const notandaId = lota?.user.id;
  useEffect(() => {
    if (!notandaId) return;
    sb.from("stjornendur")
      .select("user_id, umbod_id")
      .eq("user_id", notandaId)
      .maybeSingle()
      .then(({ data }) => setPruf({ id: notandaId, admin: !!data, umbod: data?.umbod_id ?? null }));
  }, [notandaId, sb]);

  if (!hladid) return <p className="text-muted-foreground">Hleð…</p>;
  if (!lota) return <Innskraning />;
  if (erAdmin === null) return <p className="text-muted-foreground">Athuga réttindi…</p>;
  if (!erAdmin)
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
          Aðgangurinn {lota.user.email} er ekki skráður sem stjórnandi.
        </p>
        <button className={hnappurLitill} onClick={() => sb.auth.signOut()}>
          Útskrá
        </button>
      </div>
    );
  return <Stjornbord netfang={lota.user.email ?? ""} eigidUmbod={stada?.umbod ?? null} />;
}

function Innskraning() {
  const sb = supabaseVafri();
  const [netfang, setNetfang] = useState("");
  const [lykilord, setLykilord] = useState("");
  const [villa, setVilla] = useState("");
  const [bid, setBid] = useState(false);

  async function skra(e: React.FormEvent) {
    e.preventDefault();
    setBid(true);
    setVilla("");
    const { error } = await sb.auth.signInWithPassword({ email: netfang, password: lykilord });
    if (error) setVilla("Rangt netfang eða lykilorð.");
    setBid(false);
  }

  return (
    <form onSubmit={skra} className="mx-auto max-w-sm space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Innskráning stjórnanda</h2>
      <input className={reitur} type="email" placeholder="Netfang" value={netfang} onChange={(e) => setNetfang(e.target.value)} required />
      <input className={reitur} type="password" placeholder="Lykilorð" value={lykilord} onChange={(e) => setLykilord(e.target.value)} required />
      {villa && <p className="text-sm text-destructive">{villa}</p>}
      <button className={hnappur} disabled={bid}>
        {bid ? "Skrái inn…" : "Skrá inn"}
      </button>
    </form>
  );
}

// eigidUmbod = null -> yfirstjórnandi (sér og breytir öllu); annars bara eitt umboð.
function Stjornbord({ netfang, eigidUmbod }: { netfang: string; eigidUmbod: string | null }) {
  const sb = supabaseVafri();
  const [gerdir, setGerdir] = useState<GerdRada[]>([]);
  const [umbod, setUmbod] = useState<UmbodRada[]>([]);
  const [skilabod, setSkilabod] = useState("");
  const [opin, setOpin] = useState<string | null>(null);
  const [gerdBreyta, setGerdBreyta] = useState<GerdRada | "ny" | null>(null);

  const hlada = useCallback(async () => {
    const [g, u] = await Promise.all([
      sb.from("gerdir").select("*, utfaerslur(*)").order("merki").order("gerd"),
      sb.from("umbod").select("*").order("nafn"),
    ]);
    if (g.error || u.error) setSkilabod(`Villa við að sækja gögn: ${(g.error ?? u.error)!.message}`);
    const allar = (g.data as GerdRada[]) ?? [];
    setGerdir(eigidUmbod ? allar.filter((x) => x.umbod_id === eigidUmbod) : allar);
    const umbodAll = (u.data as UmbodRada[]) ?? [];
    setUmbod(eigidUmbod ? umbodAll.filter((x) => x.id === eigidUmbod) : umbodAll);
  }, [sb, eigidUmbod]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    hlada();
  }, [hlada]);

  async function keyra(p: PromiseLike<{ error: { message: string } | null }>, ok: string) {
    const { error } = await p;
    setSkilabod(error ? `Villa: ${error.message}` : ok);
    if (!error) await hlada();
    return !error;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Innskráð(ur): {netfang} ·{" "}
          {eigidUmbod ? `má bara breyta bílum umboðsins „${eigidUmbod}“` : "yfirstjórnandi (allt)"}
        </p>
        <button className={hnappurLitill} onClick={() => sb.auth.signOut()}>
          Útskrá
        </button>
      </div>

      {skilabod && (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm" role="status">
          {skilabod}
        </p>
      )}

      {!eigidUmbod && <UmbodForm umbod={umbod} keyra={keyra} />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Gerðir ({gerdir.length})</h2>
          <button className={hnappur} onClick={() => setGerdBreyta("ny")}>
            + Ný gerð
          </button>
        </div>

        {gerdBreyta && (
          <GerdForm
            umbod={umbod}
            upphaf={gerdBreyta === "ny" ? null : gerdBreyta}
            afboka={() => setGerdBreyta(null)}
            vista={async (r, nyr) => {
              const ok = await keyra(
                nyr ? sb.from("gerdir").insert(r) : sb.from("gerdir").update(r).eq("id", r.id),
                nyr ? "Gerð bætt við." : "Gerð uppfærð.",
              );
              if (ok) setGerdBreyta(null);
            }}
          />
        )}

        {gerdir.map((g) => (
          <div key={g.id} className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <button className="text-left font-semibold" onClick={() => setOpin(opin === g.id ? null : g.id)}>
                {opin === g.id ? "▾" : "▸"} {g.merki} {g.gerd}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {g.utfaerslur.length} útf. · {g.umbod_id} · {g.arsgerd}
                </span>
              </button>
              <div className="flex gap-1.5">
                <button className={hnappurLitill} onClick={() => setGerdBreyta(g)}>
                  Breyta gerð
                </button>
                <button
                  className={`${hnappurLitill} text-destructive`}
                  onClick={() =>
                    confirm(`Eyða ${g.merki} ${g.gerd} og öllum ${g.utfaerslur.length} útfærslum?`) &&
                    keyra(sb.from("gerdir").delete().eq("id", g.id), "Gerð eytt.")
                  }
                >
                  Eyða
                </button>
              </div>
            </div>
            {opin === g.id && <Utfaerslur gerd={g} keyra={keyra} />}
          </div>
        ))}
      </section>
    </div>
  );
}

type Keyra = (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => Promise<boolean>;

function UmbodForm({ umbod, keyra }: { umbod: UmbodRada[]; keyra: Keyra }) {
  const sb = supabaseVafri();
  const [nafn, setNafn] = useState("");
  const [vefsida, setVefsida] = useState("");
  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-lg font-bold">Umboð</h2>
      <p className="text-sm text-muted-foreground">Til: {umbod.map((u) => u.nafn).join(", ") || "–"}</p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await keyra(
            sb.from("umbod").insert({ id: slug(nafn), nafn: nafn.trim(), vefsida: vefsida.trim() || null }),
            "Umboði bætt við.",
          );
          if (ok) {
            setNafn("");
            setVefsida("");
          }
        }}
      >
        <input className={`${reitur} max-w-[180px]`} placeholder="Nafn umboðs (t.d. BL)" value={nafn} onChange={(e) => setNafn(e.target.value)} required />
        <input className={`${reitur} max-w-[280px]`} placeholder="Vefsíða (https://…)" value={vefsida} onChange={(e) => setVefsida(e.target.value)} />
        <button className={hnappur}>Bæta við umboði</button>
      </form>
    </section>
  );
}

function GerdForm({
  umbod,
  upphaf,
  afboka,
  vista,
}: {
  umbod: UmbodRada[];
  upphaf: GerdRada | null;
  afboka: () => void;
  vista: (r: { id: string; merki: string; gerd: string; umbod_id: string; flokkur: string; arsgerd: number }, nyr: boolean) => Promise<void>;
}) {
  const [merki, setMerki] = useState(upphaf?.merki ?? "");
  const [gerd, setGerd] = useState(upphaf?.gerd ?? "");
  const [umbodId, setUmbodId] = useState(upphaf?.umbod_id ?? umbod[0]?.id ?? "");
  const [flokkur, setFlokkur] = useState(upphaf?.flokkur ?? FLOKKAR[0][0]);
  const [arsgerd, setArsgerd] = useState(String(upphaf?.arsgerd ?? new Date().getFullYear()));

  return (
    <form
      className="grid gap-2 rounded-xl border border-primary/40 bg-secondary/40 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const ar = Number(arsgerd);
        vista(
          {
            id: upphaf?.id ?? slug(`${merki}-${gerd}-${ar}`),
            merki: merki.trim(),
            gerd: gerd.trim(),
            umbod_id: umbodId,
            flokkur,
            arsgerd: ar,
          },
          !upphaf,
        );
      }}
    >
      <h3 className="font-bold sm:col-span-2">{upphaf ? `Breyta ${upphaf.merki} ${upphaf.gerd}` : "Ný gerð"}</h3>
      <input className={reitur} placeholder="Merki (t.d. Kia)" value={merki} onChange={(e) => setMerki(e.target.value)} required />
      <input className={reitur} placeholder="Gerð (t.d. EV3)" value={gerd} onChange={(e) => setGerd(e.target.value)} required />
      <select className={reitur} value={umbodId} onChange={(e) => setUmbodId(e.target.value)} required>
        {umbod.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nafn}
          </option>
        ))}
      </select>
      <select className={reitur} value={flokkur} onChange={(e) => setFlokkur(e.target.value)}>
        {FLOKKAR.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
      <input className={reitur} type="number" placeholder="Árgerð" value={arsgerd} onChange={(e) => setArsgerd(e.target.value)} required />
      <div className="flex gap-2 sm:col-span-2">
        <button className={hnappur}>Vista</button>
        <button type="button" className={hnappurLitill} onClick={afboka}>
          Hætta við
        </button>
      </div>
    </form>
  );
}

function Utfaerslur({ gerd, keyra }: { gerd: GerdRada; keyra: Keyra }) {
  const sb = supabaseVafri();
  const [breyta, setBreyta] = useState<UtfRada | "ny" | null>(null);
  const listi = [...gerd.utfaerslur].sort((a, b) => a.verd - b.verd);

  return (
    <div className="space-y-3 border-t border-border px-4 py-3">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="py-1 pr-3">Útfærsla</th>
              <th className="pr-3">Verð</th>
              <th className="pr-3">Orkugjafi</th>
              <th className="pr-3">Uppfært</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {listi.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="py-1.5 pr-3">{u.heiti}</td>
                <td className="pr-3">{kronur(u.verd)}</td>
                <td className="pr-3">{u.orkugjafi}</td>
                <td className="pr-3">{u.uppfaert}</td>
                <td className="flex gap-1.5 py-1">
                  <button className={hnappurLitill} onClick={() => setBreyta(u)}>
                    Breyta
                  </button>
                  <button
                    className={`${hnappurLitill} text-destructive`}
                    onClick={() => confirm(`Eyða ${u.heiti}?`) && keyra(sb.from("utfaerslur").delete().eq("id", u.id), "Útfærslu eytt.")}
                  >
                    Eyða
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {breyta ? (
        <UtfForm
          gerd={gerd}
          upphaf={breyta === "ny" ? null : breyta}
          afboka={() => setBreyta(null)}
          vista={async (r, nyr) => {
            const ok = await keyra(
              nyr ? sb.from("utfaerslur").insert(r) : sb.from("utfaerslur").update(r).eq("id", r.id),
              nyr ? "Útfærslu bætt við." : "Útfærsla uppfærð.",
            );
            if (ok) setBreyta(null);
          }}
        />
      ) : (
        <button className={hnappur} onClick={() => setBreyta("ny")}>
          + Ný útfærsla
        </button>
      )}
    </div>
  );
}

function UtfForm({
  gerd,
  upphaf,
  afboka,
  vista,
}: {
  gerd: GerdRada;
  upphaf: UtfRada | null;
  afboka: () => void;
  vista: (r: UtfRada, nyr: boolean) => Promise<void>;
}) {
  const s = (v: number | null | undefined) => (v == null ? "" : String(v));
  const [f, setF] = useState({
    heiti: upphaf?.heiti ?? "",
    verd: s(upphaf?.verd),
    orkugjafi: upphaf?.orkugjafi ?? ORKUGJAFAR[0][0],
    drif: upphaf?.drif ?? DRIF[0][0],
    hestofl: s(upphaf?.hestofl),
    rafhlada_kwh: s(upphaf?.rafhlada_kwh),
    draegni_km: s(upphaf?.draegni_km),
    eydsla_l_100km: s(upphaf?.eydsla_l_100km),
    saeti: s(upphaf?.saeti),
    farangursrymi_l: s(upphaf?.farangursrymi_l),
    hrodun_0_100_s: s(upphaf?.hrodun_0_100_s),
    heimild: upphaf?.heimild ?? "",
    uppfaert: upphaf?.uppfaert ?? idag(),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const tal = (k: keyof typeof f, placeholder: string, step = "1") => (
    <label className="text-xs text-muted-foreground">
      {placeholder}
      <input className={reitur} type="number" step={step} value={f[k]} onChange={set(k)} />
    </label>
  );

  return (
    <form
      className="grid gap-2 rounded-xl border border-primary/40 bg-secondary/40 p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        vista(
          {
            id: upphaf?.id ?? slug(`${gerd.merki}-${gerd.gerd}-${f.heiti}`),
            gerd_id: gerd.id,
            heiti: f.heiti.trim(),
            verd: Number(f.verd),
            orkugjafi: f.orkugjafi,
            drif: f.drif,
            hestofl: tala(f.hestofl),
            rafhlada_kwh: tala(f.rafhlada_kwh),
            draegni_km: tala(f.draegni_km),
            eydsla_l_100km: tala(f.eydsla_l_100km),
            saeti: tala(f.saeti),
            farangursrymi_l: tala(f.farangursrymi_l),
            hrodun_0_100_s: tala(f.hrodun_0_100_s),
            heimild: f.heimild.trim(),
            uppfaert: f.uppfaert,
          },
          !upphaf,
        );
      }}
    >
      <h3 className="font-bold sm:col-span-3">
        {upphaf ? `Breyta ${upphaf.heiti}` : `Ný útfærsla – ${gerd.merki} ${gerd.gerd}`}
      </h3>
      <label className="text-xs text-muted-foreground sm:col-span-2">
        Heiti útfærslu
        <input className={reitur} value={f.heiti} onChange={set("heiti")} required />
      </label>
      <label className="text-xs text-muted-foreground">
        Verð (kr., listaverð)
        <input className={reitur} type="number" value={f.verd} onChange={set("verd")} required min={1} />
      </label>
      <label className="text-xs text-muted-foreground">
        Orkugjafi
        <select className={reitur} value={f.orkugjafi} onChange={set("orkugjafi")}>
          {ORKUGJAFAR.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">
        Drif
        <select className={reitur} value={f.drif} onChange={set("drif")}>
          {DRIF.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </label>
      {tal("hestofl", "Hestöfl")}
      {tal("rafhlada_kwh", "Rafhlaða (kWh)", "0.1")}
      {tal("draegni_km", "Drægni (km)")}
      {tal("eydsla_l_100km", "Eyðsla (l/100km)", "0.1")}
      {tal("saeti", "Sæti")}
      {tal("farangursrymi_l", "Farangursrými (l)")}
      {tal("hrodun_0_100_s", "Hröðun 0–100 (s)", "0.1")}
      <label className="text-xs text-muted-foreground sm:col-span-2">
        Heimild (slóð á verðlista umboðs)
        <input className={reitur} type="url" value={f.heimild} onChange={set("heimild")} required />
      </label>
      <label className="text-xs text-muted-foreground">
        Verð athugað
        <input className={reitur} type="date" value={f.uppfaert} onChange={set("uppfaert")} required />
      </label>
      <div className="flex gap-2 sm:col-span-3">
        <button className={hnappur}>Vista</button>
        <button type="button" className={hnappurLitill} onClick={afboka}>
          Hætta við
        </button>
      </div>
    </form>
  );
}
